// ================================
// 📦 SYSTÈME DE RÉCEPTION
// ================================

let PRODUITS_RECEPTION = [];
let RAYONS_RECEPTION = [];

// ================================
// 🖼️ COMPRESSION IMAGE
// ================================

async function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        // Créer un canvas et redimensionner
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensionner agressivement (max 800px de côté)
        const maxDim = 800;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dessiner et compresser fortement
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir en blob avec compression maximale (60% de qualité)
        canvas.toBlob((blob) => {
          console.log(`📦 Image compressée: ${(file.size / 1024).toFixed(2)}KB → ${(blob.size / 1024).toFixed(2)}KB`);
          resolve(blob);
        }, 'image/jpeg', 0.6); // 60% de qualité pour réduire drastiquement
      };
    };
  });
}

// Fonction pour attendre que MAGASIN_ID soit défini
async function waitForMagasinId(maxWait = 10000) {
  const startTime = Date.now();
  while (typeof MAGASIN_ID === 'undefined') {
    if (Date.now() - startTime > maxWait) {
      console.warn('⚠️ MAGASIN_ID non défini après 10 secondes');
      return false;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return true;
}

// Initialiser la modal réception au chargement
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initialisation système réception');
  
  // Attendre que MAGASIN_ID soit défini
  const ready = await waitForMagasinId();
  if (!ready) {
    console.error('❌ MAGASIN_ID non disponible');
    return;
  }
  
  console.log(`✅ MAGASIN_ID disponible: ${MAGASIN_ID}`);
  
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
  const rayonSelect = document.getElementById('rayonReception');
  const dateReception = document.getElementById('dateReception');
  const photoInput = document.getElementById('photoReception');

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

  // Recalculer le récapitulatif quand rayon change
  if (rayonSelect) {
    rayonSelect.addEventListener('change', function() {
      updateRecapitulatif();
      verificarRayonPleinReception(this.value);
    });
  }

  // 📸 PRÉVISUALISATION PHOTO EN TEMPS RÉEL
  if (photoInput) {
    photoInput.addEventListener('change', onPhotoSelected);
  }

  // Soumettre le formulaire
  if (form) {
    form.addEventListener('submit', submitReception);
  }
}

// ================================
// � QUAND UNE PHOTO EST SÉLECTIONNÉE
// ================================

function onPhotoSelected(e) {
  const file = e.target.files[0];
  const preview = document.getElementById('photoPreviewReception');
  
  if (!file) {
    preview.innerHTML = `
      <div class="bg-light p-4 rounded-3 border-2 border-dashed">
        <i class="fas fa-image fa-3x text-muted mb-2 d-block"></i>
        <p class="text-muted small">La photo apparaîtra ici</p>
      </div>
    `;
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const imgSrc = event.target.result;
    preview.innerHTML = `
      <div class="position-relative">
        <img src="${imgSrc}" alt="Prévisualisation" class="img-fluid rounded-3" style="max-height: 250px; object-fit: contain;">
        <div class="mt-2">
          <small class="text-muted d-block">📁 ${file.name}</small>
          <small class="text-muted d-block">📊 ${(file.size / 1024).toFixed(1)}KB</small>
        </div>
        <button type="button" class="btn btn-sm btn-danger mt-2" onclick="document.getElementById('photoReception').value=''; onPhotoSelected({target: {files: []}})">
          <i class="fas fa-trash"></i> Retirer photo
        </button>
      </div>
    `;
    console.log('📸 Photo sélectionnée:', file.name);
  };
  reader.readAsDataURL(file);
}

// ================================
// �🔄 QUAND UN PRODUIT EST SÉLECTIONNÉ
// ================================

function onProduitSelected() {
  const select = document.getElementById('produitReception');
  const produitId = select.value;
  
  if (!produitId) return;

  // Trouver le produit
  const produit = PRODUITS_RECEPTION.find(p => p._id === produitId);
  if (!produit) return;

  console.log('📦 Produit sélectionné:', produit.designation);
  console.log('📍 Rayon du produit:', produit.rayonId);

  // Mettre à jour l'unité
  const uniteLabel = document.getElementById('uniteReceptionLabel');
  if (uniteLabel) {
    uniteLabel.textContent = produit.typeUnite || 'unités';
  }

  // ✅ PRÉREMPLIR LE RAYON AUTOMATIQUEMENT depuis le produit
  if (produit.rayonId) {
    const rayonSelect = document.getElementById('rayonReception');
    if (rayonSelect) {
      // Le rayonId peut être un objet (populé) ou une string
      const rayonId = typeof produit.rayonId === 'object' ? produit.rayonId._id : produit.rayonId;
      const rayonIdStr = rayonId.toString();
      rayonSelect.value = rayonIdStr;
      console.log(`✅ Rayon prérempli: ${rayonIdStr}`);
      
      // Vérifier si la sélection a fonctionné
      if (rayonSelect.value !== rayonIdStr) {
        console.warn('⚠️ Rayon non trouvé dans la liste - Options disponibles:', Array.from(rayonSelect.options).map(o => o.value));
      }
    }
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
// ✅ VÉRIFIER SI RAYON EST PLEIN
// ================================

function verificarRayonPleinReception(rayonId) {
  const alerte = document.getElementById('alerteRayonPleinReception');
  const messageSpan = document.getElementById('messageRayonPleinReception');
  
  if (!rayonId) {
    alerte.style.display = 'none';
    return;
  }

  // Trouver le rayon
  const rayon = RAYONS_RECEPTION.find(r => r._id === rayonId);
  if (!rayon) {
    alerte.style.display = 'none';
    return;
  }

  // Vérifier la capacité
  const capaciteMax = rayon.capaciteMax || 100; // Par défaut 100 si non défini
  const quantiteActuelle = rayon.quantiteActuelle || 0;
  const pourcentageUtilisation = (quantiteActuelle / capaciteMax) * 100;

  // Afficher une alerte si le rayon est à 80% ou plus
  if (pourcentageUtilisation >= 80) {
    alerte.style.display = 'block';
    
    if (pourcentageUtilisation >= 100) {
      // Rayon complètement plein
      messageSpan.innerHTML = `Ce rayon est <strong>PLEIN</strong> (${quantiteActuelle}/${capaciteMax} unités) ⛔`;
      alerte.classList.remove('alert-warning');
      alerte.classList.add('alert-danger');
    } else {
      // Rayon presque plein
      const pourcentage = Math.round(pourcentageUtilisation);
      messageSpan.innerHTML = `Ce rayon est presque plein (${quantiteActuelle}/${capaciteMax} unités - ${pourcentage}%) ⚠️`;
      alerte.classList.remove('alert-danger');
      alerte.classList.add('alert-warning');
    }
  } else {
    alerte.style.display = 'none';
  }
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
    const dateFabrication = document.getElementById('dateFabrication')?.value;
    const statut = document.getElementById('statutReception').value;
    const priorite = document.getElementById('prioriteReception').value;
    const photoFile = document.getElementById('photoReception').files[0];
    const lotNumber = document.getElementById('lotReception').value;

    // ⚡ VALIDATION: S'assurer que les champs requis sont présents
    if (!produitId || !quantite || !rayonId || prixAchat === null || prixAchat === undefined) {
      console.error('❌ Champs requis manquants!', {
        produitId: produitId || 'MISSING',
        quantite: quantite || 'MISSING',
        rayonId: rayonId || 'MISSING',
        prixAchat: prixAchat,
        MAGASIN_ID: MAGASIN_ID
      });
      showToast('❌ Veuillez remplir tous les champs requis (quantité, rayon, prix)', 'danger');
      return;
    }

    // Collecter les champs dynamiques
    const numeroBatch = document.getElementById('numeroBatch')?.value;
    const certificat = document.getElementById('certificat')?.value;
    const numeroSerie = document.getElementById('numeroSerie')?.value;
    const codeBarres = document.getElementById('codeBarres')?.value;
    const etatColis = document.getElementById('etatColis')?.value;
    const garantie = parseFloat(document.getElementById('garantie')?.value) || null;

    console.log('💾 Enregistrement réception:', {
      produitId,
      quantite,
      rayonId,
      prixAchat,
      MAGASIN_ID,
      fournisseur,
      dateReception,
      datePeremption,
      dateFabrication,
      statut,
      priorite
    });

    // 📸 ÉTAPE 1: Uploader la photo
    console.log('📸 Début upload photo:', photoFile?.name || 'Pas de photo');
    let photoUrl = null;

    if (photoFile) {
      // Compresser l'image
      const compressedFile = await compressImage(photoFile);
      
      // Créer FormData avec le champ 'image' (pas 'file')
      const formData = new FormData();
      formData.append('image', compressedFile);

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
      dateFabrication,
      statut,
      priorite,
      photoUrl: photoUrl || null,
      lotNumber: lotNumber || null,
      // Champs dynamiques
      numeroBatch,
      certificat,
      numeroSerie,
      codeBarres,
      etatColis,
      garantie
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
