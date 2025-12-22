/**
 * 🔧 CONFIGURATION API - Catégories
 * À ajouter dans assets/js/stock.js
 */

// ================================
// ⚙️ AJOUTER AUX ENDPOINTS
// ================================

// Dans la section API_CONFIG:

var API_CONFIG = {
  BASE: 'https://backend-gestion-de-stock.onrender.com',
  
  ENDPOINTS: {
    // ... endpoints existants ...
    
    // 🏷️ CATÉGORIES (NOUVEAU)
    CATEGORIES: '/api/protected/magasins/:magasinId/categories',
    CATEGORIE: '/api/protected/categories/:categorieId',
    CATEGORIE_PRODUITS: '/api/protected/categories/:categorieId/produits'
  }
};

// ================================
// 🔄 INTÉGRATION AVEC addProduct()
// ================================

/**
 * Modifier la fonction addProduct() existante:
 */

async function addProduct() {
  try {
    if (!MAGASIN_ID) {
      showToast('Veuillez sélectionner un magasin', 'warning');
      return;
    }

    const form = document.getElementById('formAddProduit');
    if (!form) {
      showToast('Formulaire non trouvé', 'danger');
      return;
    }

    // ✅ VALIDATION: Vérifier que la catégorie est sélectionnée
    const categorieId = document.getElementById('categorieId').value;
    if (!categorieId) {
      showToast('Veuillez sélectionner une catégorie', 'warning');
      form.classList.add('was-validated');
      return;
    }

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      showToast('Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }

    const formData = new FormData(form);
    const produitData = {
      reference: formData.get('reference'),
      designation: formData.get('designation'),
      categorieId: categorieId,              // ← NOUVEAU CHAMP
      typeProduitId: formData.get('typeProduit'),
      rayonId: formData.get('rayonId'),
      prixUnitaire: parseFloat(formData.get('prixUnitaire')) || 0,
      quantiteEntree: parseInt(formData.get('quantite')) || 0,
      quantiteActuelle: parseInt(formData.get('quantite')) || 0,
      seuilAlerte: parseInt(formData.get('seuilAlerte')) || 10,
      etat: formData.get('etat') || 'nouveau',
      champsDynamiques: {}
    };

    // Récupérer les champs dynamiques
    const dinamicoInputs = document.querySelectorAll('#champsDynamiques input, #champsDynamiques select');
    dinamicoInputs.forEach(input => {
      produitData.champsDynamiques[input.name] = input.value;
    });

    // Créer le produit
    const product = await API.post(
      API_CONFIG.ENDPOINTS.PRODUITS,
      produitData,
      { magasinId: MAGASIN_ID }
    );

    // Créer un lot FIFO si quantité > 0
    if (produitData.quantiteEntree > 0) {
      const lotData = {
        produitId: product._id,
        numeroBatch: `LOT-${new Date().getFullYear()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
        quantiteEntree: produitData.quantiteEntree,
        quantiteDisponible: produitData.quantiteEntree,
        prixUnitaireAchat: produitData.prixUnitaire,
        dateEntree: new Date().toISOString(),
        dateExpiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        numeroDocument: formData.get('numeroDocument') || '',
        fournisseur: formData.get('fournisseur') || ''
      };

      const lot = await API.post(
        API_CONFIG.ENDPOINTS.LOTS,
        lotData,
        { magasinId: MAGASIN_ID }
      );

      // Créer le mouvement RECEPTION
      const movementData = {
        produitId: product._id,
        type: 'RECEPTION',
        quantite: produitData.quantiteEntree,
        numeroDocument: lotData.numeroDocument,
        fournisseur: lotData.fournisseur,
        observations: `Création produit: ${produitData.designation}`
      };

      await API.post(
        API_CONFIG.ENDPOINTS.STOCK_MOVEMENTS,
        movementData,
        { magasinId: MAGASIN_ID }
      );
    }

    showToast('✅ Produit créé avec succès!', 'success');
    form.reset();
    
    // Réinitialiser les sélections
    SELECTED_CATEGORIE = null;
    updateSelectedCategoriesBadges();
    document.getElementById('categorieId').value = '';
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalProduit'));
    modal.hide();

    await loadProduits();

  } catch (err) {
    showToast('❌ Erreur: ' + err.message, 'danger');
  }
}

// ================================
// 📊 AFFICHER LES CATÉGORIES DANS LA TABLE
// ================================

/**
 * Optionnel: Ajouter la catégorie dans l'affichage de la table
 */

function afficherTableProduits(produits) {
  const tbody = document.querySelector('#tableReceptions tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  produits.forEach(produit => {
    const row = document.createElement('tr');
    
    let etatBadge = '<span class="badge bg-success">Disponible</span>';
    if (produit.quantiteActuelle === 0) {
      etatBadge = '<span class="badge bg-danger">En rupture</span>';
    } else if (produit.quantiteActuelle < (produit.seuilAlerte || 10)) {
      etatBadge = '<span class="badge bg-warning">Stock faible</span>';
    }

    // Afficher la catégorie du produit
    const categorie = CATEGORIES_LIST.find(c => c._id === produit.categorieId);
    const categorieName = categorie?.nom || 'N/A';
    const categorieBadge = categorie ? 
      `<span class="badge" style="background-color: ${categorie.couleur}80; color: #212529;">🏷️ ${categorieName}</span>` 
      : '<span class="text-muted">Pas de catégorie</span>';

    row.innerHTML = `
      <td style="display:none;" class="id">${produit._id}</td>
      <td class="reference"><code>${produit.reference}</code></td>
      <td class="designation">${produit.designation}</td>
      <td class="categorie">${categorieBadge}</td>
      <td class="quantite">
        <strong>${produit.quantiteActuelle}</strong> 
        <small class="text-muted">(seuil: ${produit.seuilAlerte || 10})</small>
      </td>
      <td class="emplacement">${produit.rayonId?.nomRayon || 'N/A'}</td>
      <td class="etat">${etatBadge}</td>
      <td class="dateEntree">${new Date(produit.dateEntree).toLocaleDateString()}</td>
      <td class="actions">
        <div class="btn-group btn-group-sm" role="group">
          <button class="btn btn-info" onclick="editProduct('${produit._id}')" title="Modifier">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-warning" onclick="registerMovement('${produit._id}', '${produit.designation}')" title="Mouvement">
            <i class="fas fa-arrow-right-arrow-left"></i>
          </button>
          <button class="btn btn-danger" onclick="deleteProduct('${produit._id}')" title="Supprimer">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    
    tbody.appendChild(row);
  });

  // Réinitialiser List.js si disponible ET qu'il y a des produits
  if (typeof List !== 'undefined' && produits.length > 0) {
    try {
      const options = {
        valueNames: ["id", "reference", "designation", "categorie", "quantite", "emplacement", "etat", "dateEntree", "actions"],
        page: 5,
        pagination: true
      };
      new List('tableReceptions', options);
    } catch (err) {
      console.warn('⚠️ List.js error:', err.message);
    }
  }
}

// ================================
// 🔍 FILTRER PAR CATÉGORIE
// ================================

/**
 * Optionnel: Ajouter filtre par catégorie dans le dashboard
 */

async function filterProduitsByCategorie(categorieId) {
  if (!MAGASIN_ID) return;

  try {
    const produits = await API.get(
      API_CONFIG.ENDPOINTS.PRODUITS,
      { magasinId: MAGASIN_ID }
    );

    // Filtrer par catégorie
    const filtered = categorieId 
      ? produits.filter(p => p.categorieId === categorieId)
      : produits;

    afficherTableProduits(filtered);
  } catch (err) {
    showToast('❌ Erreur filtrage: ' + err.message, 'danger');
  }
}

// ================================
// 📈 STATISTIQUES PAR CATÉGORIE
// ================================

/**
 * Optionnel: Afficher statistiques par catégorie
 */

async function afficherStatCategories(produits) {
  const stats = {};

  produits.forEach(p => {
    const catId = p.categorieId || 'sans_categorie';
    if (!stats[catId]) {
      stats[catId] = {
        count: 0,
        stock: 0,
        valeur: 0
      };
    }
    stats[catId].count++;
    stats[catId].stock += p.quantiteActuelle || 0;
    stats[catId].valeur += (p.quantiteActuelle * p.prixUnitaire) || 0;
  });

  console.log('📊 Statistiques par catégorie:');
  Object.entries(stats).forEach(([catId, stat]) => {
    const cat = CATEGORIES_LIST.find(c => c._id === catId);
    const catName = cat?.nom || 'Sans catégorie';
    console.log(`  ${catName}: ${stat.count} produits, Stock: ${stat.stock}, Valeur: ${stat.valeur.toFixed(2)} CDF`);
  });
}

// ================================
// 🎨 AJOUTER COLONNE DANS TABLE
// ================================

/**
 * Modifier le HTML du tableau pour inclure catégorie:
 * 
 * <thead>
 *   <tr>
 *     <th style="display:none;">ID</th>
 *     <th class="sort" data-sort="reference">Référence</th>
 *     <th class="sort" data-sort="designation">Désignation</th>
 *     <th class="sort" data-sort="categorie">Catégorie</th>   ← NOUVEAU
 *     <th class="sort" data-sort="quantite">Quantité</th>
 *     <th class="sort" data-sort="emplacement">Emplacement</th>
 *     <th class="sort" data-sort="etat">État</th>
 *     <th class="sort" data-sort="dateEntree">Date entrée</th>
 *     <th>Actions</th>
 *   </tr>
 * </thead>
 */

// ================================
// 📤 EXPORT FONCTIONS
// ================================

// Ajouter à window.StockManager:
window.StockManager = {
  // ... fonctions existantes ...
  loadCategories,
  selectCategorie,
  filterProduitsByCategorie,
  afficherStatCategories
};
