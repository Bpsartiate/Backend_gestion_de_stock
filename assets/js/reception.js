// ================================
// 📦 SYSTÈME DE RÉCEPTION
// ================================

let PRODUITS_RECEPTION = [];
let RAYONS_RECEPTION = [];

// Initialiser la modal réception au chargement
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initialisation système réception');
  
  // Charger les produits et rayons
  await chargerProduitsReception();
  await chargerRayonsReception();
  
  // Event listeners
  setupReceptionListeners();
});

// ================================
// 📥 CHARGER PRODUITS
// ================================

async function chargerProduitsReception() {
  try {
    if (!MAGASIN_ID) {
      console.warn('⚠️ Pas de magasin sélectionné');
      return;
    }

    const produits = await API.get(
      API_CONFIG.ENDPOINTS.PRODUITS,
      { magasinId: MAGASIN_ID }
    );

    // Normaliser si nécessaire
    if (!Array.isArray(produits)) {
      PRODUITS_RECEPTION = produits?.produits || produits?.data || [];
    } else {
      PRODUITS_RECEPTION = produits;
    }

    // Remplir le select des produits
    const select = document.getElementById('produitReception');
    if (select && PRODUITS_RECEPTION.length > 0) {
      select.innerHTML = '<option value="">Choisir produit...</option>';
      
      PRODUITS_RECEPTION.forEach(p => {
        const option = document.createElement('option');
        option.value = p._id;
        option.textContent = `${p.designation} (${p.reference})`;
        option.dataset.prix = p.prixUnitaire || 0;
        option.dataset.unite = p.typeUnite || 'unités';
        select.appendChild(option);
      });

      console.log('✅ Produits chargés pour réception:', PRODUITS_RECEPTION.length);
    }
  } catch (err) {
    console.error('❌ Erreur chargement produits réception:', err);
  }
}

// ================================
// 🏪 CHARGER RAYONS
// ================================

async function chargerRayonsReception() {
  try {
    if (!MAGASIN_ID) {
      console.warn('⚠️ Magasin non sélectionné');
      return;
    }

    // Charger directement depuis l'API au lieu de dépendre de CURRENT_STOCK_CONFIG
    const config = await API.get(
      API_CONFIG.ENDPOINTS.STOCK_CONFIG,
      { magasinId: MAGASIN_ID }
    );

    RAYONS_RECEPTION = config?.rayons || [];

    const select = document.getElementById('rayonReception');
    if (select && RAYONS_RECEPTION.length > 0) {
      select.innerHTML = '<option value="">Choisir rayon...</option>';
      
      RAYONS_RECEPTION.forEach(r => {
        const option = document.createElement('option');
        option.value = r._id;
        option.textContent = r.nomRayon;
        select.appendChild(option);
      });

      console.log('✅ Rayons chargés pour réception:', RAYONS_RECEPTION.length);
    } else {
      console.warn('⚠️ Aucun rayon trouvé');
    }
  } catch (err) {
    console.error('❌ Erreur chargement rayons:', err);
  }
}

// ================================
// 🎯 EVENT LISTENERS
// ================================

function setupReceptionListeners() {
  const form = document.getElementById('formReception');
  const produitSelect = document.getElementById('produitReception');
  const quantiteInput = document.getElementById('quantiteReception');
  const prixInput = document.getElementById('prixAchat');
  const dateReception = document.getElementById('dateReception');

  // Définir date d'aujourd'hui par défaut
  if (dateReception) {
    dateReception.valueAsDate = new Date();
  }

  // Quand on sélectionne un produit
  if (produitSelect) {
    produitSelect.addEventListener('change', onProduitSelected);
  }

  // Recalculer le total quand quantité ou prix change
  if (quantiteInput) {
    quantiteInput.addEventListener('input', updateRecapitulatif);
  }

  if (prixInput) {
    prixInput.addEventListener('input', updateRecapitulatif);
  }

  // Soumettre le formulaire
  if (form) {
    form.addEventListener('submit', submitReception);
  }
}

// ================================
// 🔄 QUAND UN PRODUIT EST SÉLECTIONNÉ
// ================================

function onProduitSelected() {
  const select = document.getElementById('produitReception');
  const produitId = select.value;
  
  if (!produitId) return;

  // Trouver le produit
  const produit = PRODUITS_RECEPTION.find(p => p._id === produitId);
  if (!produit) return;

  console.log('📦 Produit sélectionné:', produit.designation);

  // Mettre à jour l'unité
  const uniteLabel = document.getElementById('uniteReceptionLabel');
  if (uniteLabel) {
    uniteLabel.textContent = produit.typeUnite || 'unités';
  }

  // Pré-remplir le prix d'achat
  const prixInput = document.getElementById('prixAchat');
  if (prixInput && produit.prixUnitaire) {
    prixInput.value = produit.prixUnitaire;
  }

  // Générer les champs dynamiques selon le type de produit
  generateChampsDynamiques(produit);

  // Mettre à jour récapitulatif
  updateRecapitulatif();
}

// ================================
// 🎨 GÉNÉRER CHAMPS DYNAMIQUES
// ================================

function generateChampsDynamiques(produit) {
  const container = document.getElementById('champsDynamiquesReception');
  if (!container) return;

  let html = '';

  // Selon le type de produit
  if (produit.typeUnite === 'kg' || produit.typeUnite === 'litre') {
    html = `
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Numéro de lot/Batch</label>
          <input type="text" id="numeroBatch" class="form-control" placeholder="Ex: BATCH-2025-001" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Date de fabrication</label>
          <input type="date" id="dateFabrication" class="form-control" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Date d'expiration</label>
          <input type="date" id="dateExpiration" class="form-control" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Certificat/Agrément</label>
          <input type="text" id="certificat" class="form-control" placeholder="Ex: Certificat ISO..." />
        </div>
      </div>
    `;
  } else if (produit.typeUnite === 'pièces') {
    html = `
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Numéro de série (si applicable)</label>
          <input type="text" id="numeroSerie" class="form-control" placeholder="Ex: SN-12345" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Code barres</label>
          <input type="text" id="codeBarres" class="form-control" placeholder="Ex: 123456789" />
        </div>
        <div class="col-md-6">
          <label class="form-label">État du colis</label>
          <select id="etatColis" class="form-select">
            <option value="bon">Bon état</option>
            <option value="dechiré">Déchiré</option>
            <option value="abime">Abîmé</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Garantie (mois)</label>
          <input type="number" id="garantie" class="form-control" min="0" placeholder="0" />
        </div>
      </div>
    `;
  } else {
    html = `
      <div class="alert alert-info mb-0">
        <i class="fas fa-info-circle me-2"></i>
        Champs additionnels non nécessaires pour ce type de produit
      </div>
    `;
  }

  container.innerHTML = html;
  console.log('✅ Champs dynamiques générés');
}

// ================================
// 📊 METTRE À JOUR RÉCAPITULATIF
// ================================

function updateRecapitulatif() {
  const select = document.getElementById('produitReception');
  const quantiteInput = document.getElementById('quantiteReception');
  const prixInput = document.getElementById('prixAchat');
  const rayonSelect = document.getElementById('rayonReception');

  const produitId = select?.value;
  const quantite = parseFloat(quantiteInput?.value) || 0;
  const prix = parseFloat(prixInput?.value) || 0;
  const rayonId = rayonSelect?.value;

  // Trouver produit et rayon
  const produit = PRODUITS_RECEPTION.find(p => p._id === produitId);
  const rayon = RAYONS_RECEPTION.find(r => r._id === rayonId);

  // Mettre à jour affichage
  const recapProduit = document.getElementById('recapProduit');
  const recapQuantite = document.getElementById('recapQuantite');
  const recapRayon = document.getElementById('recapRayon');
  const recapTotal = document.getElementById('recapTotal');

  if (recapProduit) recapProduit.textContent = produit?.designation || '-';
  if (recapQuantite) recapQuantite.textContent = quantite > 0 ? `${quantite} ${produit?.typeUnite || 'unités'}` : '-';
  if (recapRayon) recapRayon.textContent = rayon?.nomRayon || '-';
  
  const total = quantite * prix;
  if (recapTotal) recapTotal.textContent = total > 0 ? `${total.toLocaleString()} CDF` : '0 CDF';
}

// ================================
// 📤 SOUMETTRE LA RÉCEPTION
// ================================

async function submitReception(e) {
  e.preventDefault();

  try {
    // Valider le formulaire
    const form = document.getElementById('formReception');
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    // Collecter les données
    const produitId = document.getElementById('produitReception').value;
    const quantite = parseFloat(document.getElementById('quantiteReception').value);
    const rayonId = document.getElementById('rayonReception').value;
    const prixAchat = parseFloat(document.getElementById('prixAchat').value) || 0;
    const fournisseur = document.getElementById('fournisseurReception').value;
    const dateReception = document.getElementById('dateReception').value;
    const datePeremption = document.getElementById('datePeremption').value;
    const statut = document.getElementById('statutReception').value;
    const priorite = document.getElementById('prioriteReception').value;
    const photoFile = document.getElementById('photoReception').files[0];
    const lotNumber = document.getElementById('lotReception').value;

    console.log('💾 Enregistrement réception:', {
      produitId,
      quantite,
      rayonId,
      prixAchat,
      fournisseur,
      dateReception,
      statut,
      priorite
    });

    // 📸 ÉTAPE 1: Uploader la photo
    console.log('📸 Début upload photo:', photoFile.name);
    let photoUrl = null;

    if (photoFile) {
      // Compresser l'image
      const compressedFile = await compressImage(photoFile);
      
      // Créer FormData
      const formData = new FormData();
      formData.append('file', compressedFile);

      // Récupérer le token
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');

      // Upload
      const uploadResponse = await fetch(
        `${API_CONFIG.BASE_URL}/api/protected/upload/produit-image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        photoUrl = uploadData.photoUrl;
        console.log('✅ Photo uploadée:', photoUrl);
      } else {
        console.warn('⚠️ Erreur upload photo - continuant sans photo');
      }
    }

    // 📤 ÉTAPE 2: Enregistrer la réception en base de données
    const receptionData = {
      produitId,
      magasinId: MAGASIN_ID,
      quantite,
      rayonId,
      prixAchat,
      fournisseur,
      dateReception,
      datePeremption,
      statut,
      priorite,
      photoUrl: photoUrl || null,
      lotNumber: lotNumber || null,
      typeMouvement: 'RÉCEPTION' // Important pour le mouvement de stock
    };

    console.log('📡 Envoi données réception:', receptionData);

    // Appeler le backend pour enregistrer
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/protected/receptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(receptionData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur enregistrement réception');
    }

    const result = await response.json();
    console.log('✅ Réception enregistrée:', result);

    showToast('✅ Réception enregistrée avec succès!', 'success');

    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalReception'));
    if (modal) modal.hide();

    // Réinitialiser le formulaire
    form.reset();
    form.classList.remove('was-validated');
    document.getElementById('dateReception').valueAsDate = new Date();

    // Recharger les produits et la table
    CACHE_PRODUITS = null;
    CACHE_TIMESTAMP = null;
    await loadProduits(true);

    // Recharger aussi les produits de réception
    await chargerProduitsReception();

  } catch (err) {
    console.error('❌ Erreur enregistrement réception:', err);
    showToast('❌ Erreur: ' + err.message, 'danger');
  }
}

// ================================
// 🔄 RAFRAÎCHIR RÉCEPTION AU CHANGEMENT DE MAGASIN
// ================================

// S'abonner aux changements de magasin
window.addEventListener('magasinChanged', () => {
  console.log('🔄 Magasin changé - Rafraîchissement réception');
  chargerProduitsReception();
  chargerRayonsReception();
});

console.log('✅ Module réception chargé');
