/**
 * ================================
 * SYSTÈME D'ÉDITION DE PRODUIT
 * ================================
 */

let PRODUIT_EN_EDITION = null;
let TYPES_CACHE_EDIT = [];
let RAYONS_CACHE_EDIT = [];
let CHANGEMENTS_PRODUIT = {};

/**
 * Ouvrir la modal d'édition de produit
 */
async function openProductEditModal(produitId) {
  try {
    console.log(`🔧 Ouverture édition produit: ${produitId}`);

    // ⏳ Attendre 5 secondes avant d'afficher le modal
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('⏳ Délai de 5 secondes écoulé - Affichage du modal');

    // 🚀 Afficher le modal après le délai
    const modal = new bootstrap.Modal(document.getElementById('modalEditProduit'));
    modal.show();

    // Afficher un spinner de chargement dans le formulaire
    const formContainer = document.getElementById('editProduitForm');
    if (formContainer) {
      formContainer.style.opacity = '0.5';
      formContainer.style.pointerEvents = 'none';
    }

    // ⏳ Charger les données EN PARALLÈLE EN ARRIÈRE-PLAN
    // Appeler l'endpoint enrichi avec include pour récupérer réceptions, mouvements, audit
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const enrichedUrl = `${API_CONFIG.BASE_URL}/api/protected/produits/${produitId}?include=mouvements,receptions,alertes,enregistrement`;
    
    let produit = null;
    
    try {
      // Essayer l'endpoint enrichi d'abord
      const enrichedResponse = await fetch(enrichedUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (enrichedResponse.ok) {
        const enrichedData = await enrichedResponse.json();
        produit = enrichedData.data || enrichedData;
        console.log('✅ Endpoint enrichi utilisé pour édition');
      }
    } catch (enrichedErr) {
      console.warn('⚠️ Endpoint enrichi non disponible, fallback...');
    }
    
    // Fallback: utiliser l'API standard
    if (!produit) {
      produit = await API.get(
        API_CONFIG.ENDPOINTS.PRODUIT,
        { produitId }
      );
    }

    if (!produit) {
      showToast('❌ Produit non trouvé', 'danger');
      return;
    }

    console.log('✅ Produit enrichi chargé pour édition:', produit);
    console.log('📊 Réceptions:', produit.receptions);
    console.log('📋 Mouvements:', produit.mouvements);
    console.log('🗓️ Audit logs:', produit.audit?.logs?.length || 0);

    PRODUIT_EN_EDITION = produit;
    CHANGEMENTS_PRODUIT = {};

    // Mettre à jour le titre
    document.getElementById('editProduitName').textContent = produit.designation;

    // Charger les types, rayons et onglets EN PARALLÈLE
    await Promise.all([
      chargerDonneesEditProduit(),
      chargerOngletStocks(produitId),
      chargerOngletReceptions(produitId),
      chargerOngletHistorique(produitId)
    ]);

    // Remplir les champs
    remplirFormulaireProduit(produit);

    // Retirer le loader
    if (formContainer) {
      formContainer.style.opacity = '1';
      formContainer.style.pointerEvents = 'auto';
    }

    console.log('✅ Modal édition chargée');
  } catch (err) {
    console.error('❌ Erreur ouverture édition:', err);
    showToast('❌ Erreur: ' + err.message, 'danger');
    
    // Retirer le loader en cas d'erreur
    const formContainer = document.getElementById('editProduitForm');
    if (formContainer) {
      formContainer.style.opacity = '1';
      formContainer.style.pointerEvents = 'auto';
    }
  }
}

/**
 * Charger les données nécessaires pour l'édition
 */
async function chargerDonneesEditProduit() {
  try {
    // Charger types de produits
    const types = await API.get(
      '/api/protected/magasins/:magasinId/types-produits',
      { magasinId: MAGASIN_ID }
    );
    TYPES_CACHE_EDIT = types.categories || types;

    // Charger rayons
    const rayons = await API.get(
      '/api/protected/magasins/:magasinId/rayons',
      { magasinId: MAGASIN_ID }
    );
    RAYONS_CACHE_EDIT = rayons;

    // Remplir les dropdowns
    remplirDropdownTypes();
    remplirDropdownRayons();

  } catch (err) {
    console.error('❌ Erreur chargement données:', err);
  }
}

/**
 * Remplir les dropdowns de types de produits
 */
function remplirDropdownTypes() {
  const select = document.getElementById('editTypeProduit');
  select.innerHTML = '<option value="">-- Sélectionner un type --</option>';

  TYPES_CACHE_EDIT.forEach(type => {
    const option = document.createElement('option');
    option.value = type._id;
    option.textContent = type.nomType || type.name;
    select.appendChild(option);
  });
}

/**
 * Remplir les dropdowns de rayons
 */
function remplirDropdownRayons() {
  const select = document.getElementById('editRayon');
  select.innerHTML = '<option value="">-- Aucun rayon par défaut --</option>';

  RAYONS_CACHE_EDIT.forEach(rayon => {
    const option = document.createElement('option');
    option.value = rayon._id;
    option.textContent = rayon.nomRayon || rayon.nom;
    select.appendChild(option);
  });
}

/**
 * Remplir le formulaire avec les données du produit
 */
function remplirFormulaireProduit(produit) {
  document.getElementById('editDesignation').value = produit.designation || '';
  document.getElementById('editReference').value = produit.reference || '';
  document.getElementById('editTypeProduit').value = produit.typeProduitId?._id || produit.typeProduitId || '';
  document.getElementById('editRayon').value = produit.rayonId?._id || produit.rayonId || '';
  document.getElementById('editPrixUnitaire').value = produit.prixUnitaire || 0;
  document.getElementById('editSeuilAlerte').value = produit.seuilAlerte || 10;
  document.getElementById('editEtat').value = produit.etat || 'Neuf';
  document.getElementById('editNotes').value = produit.notes || '';

  // Photo
  if (produit.photoUrl) {
    document.getElementById('editPhotoPreview').src = produit.photoUrl;
    document.getElementById('editPhotoPreview').style.display = 'block';
  } else {
    document.getElementById('editPhotoPreview').style.display = 'none';
  }

  // Écouter les changements
  const form = document.getElementById('formEditProduit');
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('change', detecterChangements);
    field.addEventListener('input', detecterChangements);
  });
}

/**
 * Détecter les changements du formulaire
 */
function detecterChangements() {
  const changesWarning = document.getElementById('editChangesWarning');
  changesWarning.style.display = 'block';

  // Collecter les changements
  CHANGEMENTS_PRODUIT = {
    designation: document.getElementById('editDesignation').value,
    reference: document.getElementById('editReference').value,
    typeProduitId: document.getElementById('editTypeProduit').value,
    rayonId: document.getElementById('editRayon').value,
    prixUnitaire: parseFloat(document.getElementById('editPrixUnitaire').value),
    seuilAlerte: parseInt(document.getElementById('editSeuilAlerte').value),
    etat: document.getElementById('editEtat').value,
    notes: document.getElementById('editNotes').value
  };

  console.log('🔄 Changements détectés:', CHANGEMENTS_PRODUIT);
}

/**
 * Charger l'onglet Stocks
 */
async function chargerOngletStocks(produitId) {
  try {
    const stocksLoading = document.getElementById('stocksLoading');
    const tableStocks = document.getElementById('tableStocks');
    const noStocks = document.getElementById('noStocks');
    const stocksBody = document.getElementById('stocksBody');

    // Afficher le loader
    stocksLoading.style.display = 'block';
    tableStocks.style.display = 'none';
    noStocks.style.display = 'none';

    // Charger les StockRayons
    const stocks = await API.get(
      `/api/protected/produits/:produitId/stocks`,
      { produitId }
    );

    stocksLoading.style.display = 'none';

    if (!stocks || stocks.length === 0) {
      noStocks.style.display = 'block';
      return;
    }

    // Remplir le tableau
    stocksBody.innerHTML = '';
    stocks.forEach(stock => {
      const row = document.createElement('tr');
      const nomRayon = stock.rayonId?.nomRayon || 'N/A';
      const quantite = stock.quantiteDisponible?.toFixed(2) || 0;
      const nbReceptions = stock.réceptions?.length || 0;
      
      row.innerHTML = `
        <td><strong>${nomRayon}</strong></td>
        <td>${quantite} kg</td>
        <td>${nbReceptions}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick="afficherDetailsStock('${stock._id}')">
            <i class="fas fa-eye"></i> Détails
          </button>
        </td>
      `;
      stocksBody.appendChild(row);
    });

    tableStocks.style.display = 'table';
  } catch (err) {
    console.error('❌ Erreur chargement stocks:', err);
    document.getElementById('noStocks').style.display = 'block';
  }
}

/**
 * Charger l'onglet Réceptions
 */
async function chargerOngletReceptions(produitId) {
  try {
    const receptionsLoading = document.getElementById('receptionsLoading');
    const tableReceptionsWrapper = document.getElementById('tableReceptionsWrapper');
    const noReceptions = document.getElementById('noReceptions');
    const receptionsBody = document.getElementById('receptionsBody');

    receptionsLoading.style.display = 'block';
    tableReceptionsWrapper.style.display = 'none';
    noReceptions.style.display = 'none';

    // Utiliser les réceptions du produit enrichi (déjà chargées)
    let receptions = PRODUIT_EN_EDITION?.receptions || [];

    receptionsLoading.style.display = 'none';

    if (!receptions || !Array.isArray(receptions) || receptions.length === 0) {
      noReceptions.style.display = 'block';
      return;
    }

    // Remplir le tableau
    receptionsBody.innerHTML = '';
    receptions.forEach(reception => {
      const date = new Date(reception.dateReception).toLocaleDateString('fr-FR');
      const prixTotal = (reception.quantite * reception.prixAchat).toFixed(2);
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${date}</td>
        <td>${reception.quantite} kg</td>
        <td>${reception.rayonId?.nomRayon || 'N/A'}</td>
        <td>${reception.fournisseur || 'N/A'}</td>
        <td>${reception.prixAchat?.toFixed(2) || 0} €</td>
        <td>${prixTotal} €</td>
        <td>
          <span class="badge ${reception.statut === 'stocke' ? 'bg-success' : 'bg-warning'}">
            ${reception.statut}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-info" onclick="afficherDetailsReception('${reception._id}')">
            <i class="fas fa-eye"></i> Détails
          </button>
        </td>
      `;
      receptionsBody.appendChild(row);
    });

    tableReceptionsWrapper.style.display = 'block';
  } catch (err) {
    console.error('❌ Erreur chargement réceptions:', err);
    document.getElementById('noReceptions').style.display = 'block';
  }
}

/**
 * Charger l'onglet Historique
 */
async function chargerOngletHistorique(produitId) {
  try {
    const historiqueLoading = document.getElementById('historiqueLoading');
    const historiqueList = document.getElementById('historiqueList');
    const noHistorique = document.getElementById('noHistorique');
    const timelineEvents = document.getElementById('timelineEvents');

    historiqueLoading.style.display = 'block';
    historiqueList.style.display = 'none';
    noHistorique.style.display = 'none';

    // Utiliser les audit logs du produit enrichi
    const logs = PRODUIT_EN_EDITION?.audit?.logs || [];

    historiqueLoading.style.display = 'none';

    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      noHistorique.style.display = 'block';
      return;
    }

    // Afficher la timeline
    timelineEvents.innerHTML = '';
    logs.forEach(log => {
      const date = new Date(log.createdAt).toLocaleString('fr-FR');
      let colorClass = 'info';
      
      if (log.action.includes('DELETE')) colorClass = 'danger';
      if (log.action.includes('CREATE')) colorClass = 'success';
      if (log.action.includes('UPDATE')) colorClass = 'warning';

      const event = document.createElement('div');
      event.className = `timeline-event ${colorClass}`;
      const userName = log.utilisateur?.prenom && log.utilisateur?.nom 
        ? `${log.utilisateur.prenom} ${log.utilisateur.nom}` 
        : 'Système';
      const userEmail = log.utilisateur?.email || 'N/A';
      
      event.innerHTML = `
        <div class="timeline-date">${date}</div>
        <div class="timeline-action">${log.action}</div>
        <div class="timeline-details">
          <strong>${userName}</strong> 
          (${userEmail})<br>
          ${log.description || ''}<br>
          ${log.raison ? `<em>Raison: ${log.raison}</em>` : ''}
        </div>
      `;
      timelineEvents.appendChild(event);
    });

    historiqueList.style.display = 'block';
  } catch (err) {
    console.error('❌ Erreur chargement historique:', err);
    document.getElementById('noHistorique').style.display = 'block';
  }
}

/**
 * Sauvegarder les modifications du produit
 */
async function sauvegarderEditProduit() {
  try {
    if (!PRODUIT_EN_EDITION) return;

    console.log('💾 Sauvegarde du produit...');

    // Préparer les données
    const dataSauvegarde = {
      designation: document.getElementById('editDesignation').value,
      reference: document.getElementById('editReference').value,
      typeProduitId: document.getElementById('editTypeProduit').value,
      rayonId: document.getElementById('editRayon').value || null,
      prixUnitaire: parseFloat(document.getElementById('editPrixUnitaire').value),
      seuilAlerte: parseInt(document.getElementById('editSeuilAlerte').value),
      etat: document.getElementById('editEtat').value,
      notes: document.getElementById('editNotes').value
    };

    // Valider
    if (!dataSauvegarde.designation || !dataSauvegarde.reference) {
      showToast('❌ Designation et Référence sont obligatoires', 'danger');
      return;
    }

    // Uploader la photo si changée
    const photoInput = document.getElementById('editPhotoInput');
    if (photoInput.files.length > 0) {
      const formData = new FormData();
      formData.append('file', photoInput.files[0]);

      const uploadResponse = await fetch(
        `${API_CONFIG.BASE_URL}/api/protected/upload-produit-photo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
          },
          body: formData
        }
      );

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        dataSauvegarde.photoUrl = uploadData.photoUrl;
      }
    }

    // Appeler l'API PUT
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/protected/produits/${PRODUIT_EN_EDITION._id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(dataSauvegarde)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur sauvegarde');
    }

    const result = await response.json();
    console.log('✅ Produit sauvegardé:', result);

    showToast('✅ Produit modifié avec succès', 'success');

    // Fermer la modal
    bootstrap.Modal.getInstance(document.getElementById('modalEditProduit')).hide();

    // Recharger la table
    await loadProduits(true);

    // Reset
    PRODUIT_EN_EDITION = null;
    CHANGEMENTS_PRODUIT = {};
  } catch (err) {
    console.error('❌ Erreur sauvegarde:', err);
    showToast('❌ Erreur: ' + err.message, 'danger');
  }
}

// Event Listener pour le bouton Sauvegarder
document.addEventListener('DOMContentLoaded', () => {
  const btnSave = document.getElementById('btnSaveEditProduit');
  if (btnSave) {
    btnSave.addEventListener('click', sauvegarderEditProduit);
  }
});

// Exporter pour utilisation
window.openProductDetailPremium = openProductDetailPremium;
window.sauvegarderEditProduit = sauvegarderEditProduit;
