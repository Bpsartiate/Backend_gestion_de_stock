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
  
  console.log(` MAGASIN_ID disponible: ${MAGASIN_ID}`);
  
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

      console.log(' Produits chargés pour réception:', PRODUITS_RECEPTION.length);
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

      console.log(' Rayons chargés pour réception:', RAYONS_RECEPTION.length);
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
    // ⚡ NOUVELLE: Vérifier capacité type en temps réel
    quantiteInput.addEventListener('input', verifierCapaciteTypeReception);
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

// ================================// ✨ CHARGER TYPE PRODUIT (SIMPLE vs LOT)
// ================================

let currentTypeProduit = null;

async function loadTypeProduitForReception(produit) {
  try {
    if (!produit.typeProduitId) return;
    
    const typeProduitId = typeof produit.typeProduitId === 'object' 
      ? produit.typeProduitId._id 
      : produit.typeProduitId;
    
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/protected/types-produits/${typeProduitId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!response.ok) throw new Error('Erreur chargement type produit');
    
    currentTypeProduit = await response.json();
    console.log('📦 Type produit chargé:', currentTypeProduit);
    console.log('   typeStockage:', currentTypeProduit.typeStockage);
    console.log('   unitesVente:', currentTypeProduit.unitesVente);
    
    // Afficher l'interface appropriée
    if (currentTypeProduit.typeStockage === 'lot') {
      console.log('✅ Détecté: LOT - Affichage interface LOT');
      showLotInterface();
    } else {
      console.log('✅ Détecté: SIMPLE - Affichage interface SIMPLE');
      showSimpleInterface();
    }
    
  } catch (err) {
    console.error('❌ Erreur loadTypeProduitForReception:', err);
    currentTypeProduit = null;
  }
}

// Afficher interface SIMPLE
function showSimpleInterface() {
  console.log('📋 Interface SIMPLE');
  
  // Update label for SIMPLE unit
  const quantDiv = document.getElementById('quantiteReception')?.parentElement?.parentElement;
  if (quantDiv) {
    const label = quantDiv.querySelector('.input-group-text');
    if (label) {
      label.textContent = currentTypeProduit?.unitePrincipaleStockage || 'unités';
    }
  }
  
  // Show SIMPLE quantity container
  const simpleQuantityContainer = document.getElementById('simpleQuantityContainer');
  if (simpleQuantityContainer) {
    simpleQuantityContainer.style.display = 'block';
  }
  
  // Hide LOT container
  const lotContainer = document.getElementById('lotContainer');
  if (lotContainer) {
    lotContainer.style.display = 'none';
  }
}

// Afficher interface LOT
function showLotInterface() {
  console.log('🎁 Interface LOT - rouleaux/cartons');
  
  const lotContainer = document.getElementById('lotContainer');
  if (!lotContainer) {
    console.error('❌ lotContainer not found in modal');
    return;
  }
  
  // 🎁 AFFICHER LES DÉTAILS LOT DU PRODUIT EN HAUT
  const produitSelect = document.getElementById('produitReception');
  const produitId = produitSelect?.value;
  
  if (produitId) {
    const produit = PRODUITS_RECEPTION.find(p => p._id === produitId);
    if (produit) {
      // Mettre à jour le header avec infos LOT
      const lotProductName = document.getElementById('lotProductName');
      const lotUnitePrincipale = document.getElementById('lotUnitePrincipale');
      
      if (lotProductName) {
        lotProductName.textContent = produit.designation;
      }
      if (lotUnitePrincipale) {
        lotUnitePrincipale.textContent = currentTypeProduit?.unitePrincipaleStockage || 'unités';
      }
    }
  }
  
  // Populate uniteDetail select with values from typeProduit
  const uniteDetailSelect = document.getElementById('uniteDetail');
  if (uniteDetailSelect) {
    uniteDetailSelect.innerHTML = '<option value="">-- Choisir unité --</option>';
    (currentTypeProduit?.unitesVente || []).forEach(u => {
      const option = document.createElement('option');
      option.value = u;
      option.textContent = u;
      uniteDetailSelect.appendChild(option);
    });
  }
  
  // Show LOT container
  lotContainer.style.display = 'block';
  
  // Hide SIMPLE quantity container
  const simpleQuantityContainer = document.getElementById('simpleQuantityContainer');
  if (simpleQuantityContainer) {
    simpleQuantityContainer.style.display = 'none';
  }
  
  // ⚡ Ajouter listeners pour mise à jour en temps réel
  const nombrePieces = document.getElementById('nombrePieces');
  const quantiteParPiece = document.getElementById('quantiteParPiece');
  const prixParUniteDetail = document.getElementById('prixParUniteDetail');
  const uniteDetail = document.getElementById('uniteDetail');
  
  const updateLotPreview = () => {
    const nb = parseInt(nombrePieces?.value) || 0;
    const qty = parseFloat(quantiteParPiece?.value) || 0;
    const prix = parseFloat(prixParUniteDetail?.value) || 0;
    const unite = uniteDetail?.value || 'unité';
    
    const total = nb * qty;
    const totalPrix = total * prix;
    
    // Update main preview in header
    const preview = document.getElementById('lotPreviewInfo');
    if (preview) {
      preview.innerHTML = nb > 0 && qty > 0 
        ? `
          <div>
            <div class="text-success"><strong>${nb} pièces</strong></div>
            <div class="text-info small">${total.toLocaleString('fr-FR', {minimumFractionDigits: 2})} ${unite}</div>
            <div class="text-success"><strong>💰 ${totalPrix.toLocaleString('fr-FR', {minimumFractionDigits: 2})} CDF</strong></div>
          </div>
        `
        : '<div class="text-muted small">Remplissez les champs...</div>';
    }

    // Update detailed recap
    const recap = document.getElementById('lotRecapitulatif');
    if (recap) {
      if (nb > 0 && qty > 0) {
        recap.innerHTML = `
          <div class="fw-bold text-success">
            <i class="fas fa-check-circle me-2"></i>
            <span>${nb}</span> 
            <span class="text-muted">pièces ×</span>
            <span>${qty.toLocaleString('fr-FR', {minimumFractionDigits: 2})}</span>
            <span class="text-muted">${unite} ×</span>
            <span>${prix.toLocaleString('fr-FR', {minimumFractionDigits: 2})}</span>
            <span class="text-muted">CDF/unité =</span>
            <span class="text-success">${totalPrix.toLocaleString('fr-FR', {minimumFractionDigits: 2})} CDF</span>
          </div>
          <hr class="my-2">
          <div class="row g-2 small">
            <div class="col-6">
              <strong>Quantité totale:</strong> ${total.toLocaleString('fr-FR', {minimumFractionDigits: 2})} ${unite}
            </div>
            <div class="col-6">
              <strong>Prix total:</strong> <span class="text-success">${totalPrix.toLocaleString('fr-FR', {minimumFractionDigits: 2})} CDF</span>
            </div>
          </div>
        `;
      } else {
        recap.innerHTML = '<p class="text-muted mb-0">Remplissez tous les champs pour voir le récapitulatif...</p>';
      }
    }
  };
  
  nombrePieces?.addEventListener('input', updateLotPreview);
  quantiteParPiece?.addEventListener('input', updateLotPreview);
  prixParUniteDetail?.addEventListener('input', updateLotPreview);
  uniteDetail?.addEventListener('change', updateLotPreview);
  
  // Update unité labels dynamiquement
  uniteDetail?.addEventListener('change', () => {
    const selectedUnite = uniteDetail.value;
    const quantiteParPieceUnit = document.getElementById('quantiteParPieceUnit');
    const prixUnitLabel = document.getElementById('prixUnitLabel');
    
    if (quantiteParPieceUnit) {
      quantiteParPieceUnit.textContent = selectedUnite || 'unité';
    }
    if (prixUnitLabel) {
      prixUnitLabel.textContent = `par ${selectedUnite || 'unité'}`;
    }
  });
  
  // Update reception label
  const quantDiv = document.getElementById('quantiteReception')?.parentElement?.parentElement;
  if (quantDiv) {
    const label = quantDiv.querySelector('.input-group-text');
    if (label) {
      label.textContent = currentTypeProduit?.unitePrincipaleStockage || 'unités';
    }
  }
  
  // ✅ Récupérer les éléments pour calcul de prix (SANS REDÉCLARATION)
  const prixTotalEstime = document.getElementById('prixTotalEstime');
  
  // Function to calculate total price
  const calculateTotalPrice = () => {
    const nPieces = parseInt(nombrePieces?.value) || 0;
    const qtyPerPiece = parseFloat(quantiteParPiece?.value) || 0;
    const pricePerUnit = parseFloat(prixParUniteDetail?.value) || 0;
    const total = nPieces * qtyPerPiece * pricePerUnit;
    
    if (prixTotalEstime) {
      prixTotalEstime.value = total > 0 ? total.toFixed(2) : '0.00';
    }
  };
  
  // Update unit label when uniteDetail changes
  if (uniteDetail) {
    uniteDetail.addEventListener('change', (e) => {
      const selected = e.target.value;
      if (uniteDetailLabel) {
        uniteDetailLabel.textContent = selected ? `par ${selected}` : 'par UNITÉ';
      }
      calculateTotalPrice();
    });
  }
  
  // Add listeners for automatic price calculation
  if (nombrePieces) nombrePieces.addEventListener('change', calculateTotalPrice);
  if (nombrePieces) nombrePieces.addEventListener('input', calculateTotalPrice);
  if (quantiteParPiece) quantiteParPiece.addEventListener('input', calculateTotalPrice);
  if (prixParUniteDetail) prixParUniteDetail.addEventListener('input', calculateTotalPrice);
  
  // Also update recap when LOT fields change
  if (nombrePieces) nombrePieces.addEventListener('change', updateRecapitulatif);
  if (nombrePieces) nombrePieces.addEventListener('input', updateRecapitulatif);
  if (quantiteParPiece) quantiteParPiece.addEventListener('input', updateRecapitulatif);
  if (prixParUniteDetail) prixParUniteDetail.addEventListener('input', updateRecapitulatif);
  if (uniteDetail) uniteDetail.addEventListener('change', updateRecapitulatif);
}

// ================================// �🔄 QUAND UN PRODUIT EST SÉLECTIONNÉ
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

  // ✨ CHARGER LE TYPE PRODUIT POUR VÉRIFIER SIMPLE vs LOT
  loadTypeProduitForReception(produit);

  // Mettre à jour l'unité
  const uniteLabel = document.getElementById('uniteReceptionLabel');
  if (uniteLabel) {
    uniteLabel.textContent = produit.typeUnite || 'unités';
  }

  //  PRÉREMPLIR LE RAYON AUTOMATIQUEMENT depuis le produit
  if (produit.rayonId) {
    const rayonSelect = document.getElementById('rayonReception');
    if (rayonSelect) {
      // Le rayonId peut être un objet (populé) ou une string
      const rayonId = typeof produit.rayonId === 'object' ? produit.rayonId._id : produit.rayonId;
      const rayonIdStr = rayonId.toString();
      rayonSelect.value = rayonIdStr;
      console.log(` Rayon prérempli: ${rayonIdStr}`);
      
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
  
  // ⚡ NOUVELLE: Vérifier capacité type immédiatement
  verifierCapaciteTypeReception();
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
  console.log(' Champs dynamiques générés');
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
  if (recapRayon) recapRayon.textContent = rayon?.nomRayon || '-';

  // ✨ RÉCAPITULATIF PERSONNALISÉ SELON TYPE (SIMPLE vs LOT)
  if (currentTypeProduit && currentTypeProduit.typeStockage === 'lot') {
    // LOT: Afficher configuration détaillée
    const nombrePieces = parseInt(document.getElementById('nombrePieces')?.value) || 0;
    const quantiteParPiece = parseFloat(document.getElementById('quantiteParPiece')?.value) || 0;
    const uniteDetail = document.getElementById('uniteDetail')?.value || 'unité';
    const prixParUnite = parseFloat(document.getElementById('prixParUniteDetail')?.value) || 0;
    
    const total = nombrePieces * quantiteParPiece * prixParUnite;
    
    if (recapQuantite) {
      recapQuantite.textContent = nombrePieces > 0 && quantiteParPiece > 0
        ? `${nombrePieces} pièces × ${quantiteParPiece} ${uniteDetail} @ ${prixParUnite} CDF/${uniteDetail}`
        : '-';
    }
    
    if (recapTotal) recapTotal.textContent = total > 0 ? `${total.toLocaleString('fr-FR')} CDF` : '0 CDF';
  } else {
    // SIMPLE: Affichage normal
    const quantite = parseFloat(quantiteInput?.value) || 0;
    const prix = parseFloat(prixInput?.value) || 0;
    
    if (recapQuantite) recapQuantite.textContent = quantite > 0 ? `${quantite} ${produit?.typeUnite || 'unités'}` : '-';
    
    const total = quantite * prix;
    if (recapTotal) recapTotal.textContent = total > 0 ? `${total.toLocaleString('fr-FR')} CDF` : '0 CDF';
  }
}

// ================================
//  VÉRIFIER SI RAYON EST PLEIN
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

  // Vérifier la capacité - NOMBRE D'ARTICLES (pas quantité de pièces!)
  const capaciteMax = rayon.capaciteMax || 100; // Par défaut 100 si non défini
  const nombreArticlesActuel = rayon.articles || 0;  // ✅ Nombre d'articles DIFFÉRENTS
  const pourcentageUtilisation = (nombreArticlesActuel / capaciteMax) * 100;

  console.log(`🔍 verificarRayonPleinReception: rayon=${rayon.nomRayon}, articles=${nombreArticlesActuel}/${capaciteMax}, %=${Math.round(pourcentageUtilisation)}`);

  // Afficher une alerte si le rayon est à 80% ou plus
  if (pourcentageUtilisation >= 80) {
    alerte.style.display = 'block';
    
    if (pourcentageUtilisation >= 100) {
      // Rayon complètement plein
      messageSpan.innerHTML = `Ce rayon est <strong>PLEIN</strong> (${nombreArticlesActuel}/${capaciteMax} articles) ⛔`;
      alerte.classList.remove('alert-warning');
      alerte.classList.add('alert-danger');
    } else {
      // Rayon presque plein
      const pourcentage = Math.round(pourcentageUtilisation);
      messageSpan.innerHTML = `Ce rayon est presque plein (${nombreArticlesActuel}/${capaciteMax} articles - ${pourcentage}%) ⚠️`;
      alerte.classList.remove('alert-danger');
      alerte.classList.add('alert-warning');
    }
  } else {
    alerte.style.display = 'none';
  }
}

// ================================
// ⚡ VÉRIFIER CAPACITÉ TYPE EN TEMPS RÉEL
// ================================

function verifierCapaciteTypeReception() {
  const produitSelect = document.getElementById('produitReception');
  const quantiteInput = document.getElementById('quantiteReception');
  const alerte = document.getElementById('alerteCapaciteTypeReception');
  const messageSpan = document.getElementById('messageCapaciteTypeReception');
  
  if (!alerte || !messageSpan) {
    console.warn('⚠️ Éléments alerte capacité type non trouvés');
    return;
  }
  
  const produitId = produitSelect?.value;
  const quantite = parseFloat(quantiteInput?.value) || 0;
  
  // Si pas de produit sélectionné ou quantité 0, cacher l'alerte
  if (!produitId || quantite <= 0) {
    alerte.style.display = 'none';
    return;
  }
  
  // Trouver le produit sélectionné
  const produit = PRODUITS_RECEPTION.find(p => p._id === produitId);
  if (!produit) {
    alerte.style.display = 'none';
    return;
  }
  
  // 🔍 DEBUG: Afficher TOUS les champs du produit
  console.log('🔍 PRODUIT COMPLET:', produit);
  console.log('🔍 Champs disponibles:', Object.keys(produit));
  
  // 🔍 DEBUG: Afficher les valeurs spécifiques
  console.log('🔍 VALUES:', {
    capaciteMax: produit.capaciteMax,
    capacite: produit.capacite,
    capaciteType: produit.capaciteType,
    quantiteActuelle: produit.quantiteActuelle,
    quantite: produit.quantite,
    quantiteDisponible: produit.quantiteDisponible,
    uniteMesure: produit.uniteMesure,
    typeUnite: produit.typeUnite,
    designation: produit.designation,
    typeProduitId: produit.typeProduitId,
    '_id': produit._id
  });
  
  // ⚡ Récupérer la capacité du TYPE (populé depuis le backend)
  let capaciteTypeMax = 0;
  
  // Si typeProduitId est un objet (bien populé par le backend)
  if (typeof produit.typeProduitId === 'object' && produit.typeProduitId?.capaciteMax) {
    capaciteTypeMax = produit.typeProduitId.capaciteMax;
    console.log(` CapaciteMax obtenue du TypeProduit: ${capaciteTypeMax} ${produit.typeProduitId.unitePrincipale}`);
  } else if (produit.capaciteMax) {
    // Fallback si c'est directement dans le produit
    capaciteTypeMax = produit.capaciteMax;
    console.log(` CapaciteMax obtenue du produit directement: ${capaciteTypeMax}`);
  } else {
    console.warn(`⚠️ AUCUNE capaciteMax trouvée pour ${produit.designation}`);
  }
  
  const quantiteActuelleProduit = produit.quantiteActuelle || 0;
  const quantiteApreAjout = quantiteActuelleProduit + quantite;
  
  console.log(`🔍 Vérification capacité type ${produit.designation}:`, {
    capaciteTypeMax,
    quantiteActuelle: quantiteActuelleProduit,
    quantiteAjout: quantite,
    quantiteApreAjout,
    unitePrincipale: produit.typeProduitId?.unitePrincipale
  });
  
  // Vérifier si on dépasse la capacité
  if (quantiteApreAjout > capaciteTypeMax) {
    alerte.style.display = 'block';
    alerte.classList.remove('alert-warning');
    alerte.classList.add('alert-danger');
    
    const depassement = (quantiteApreAjout - capaciteTypeMax).toFixed(2);
    messageSpan.innerHTML = `
      <strong>❌ DÉPASSEMENT!</strong> 
      Capacité max: <strong>${capaciteTypeMax}</strong> ${produit.uniteMesure || 'unités'},
      Actuel: <strong>${quantiteActuelleProduit}</strong>,
      À ajouter: <strong>${quantite}</strong>,
      Total: <strong>${quantiteApreAjout}</strong>
      → Dépassement de <strong>${depassement}</strong> ${produit.uniteMesure || 'unités'} ⛔
    `;
    console.warn(`❌ CAPACITÉ DÉPASSÉE - Type: ${produit.designation}`);
    
    // ⚡ DÉSACTIVER LE BOUTON SUBMIT
    const btnSubmit = document.getElementById('btnSubmitReception');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.style.opacity = '0.5';
      btnSubmit.style.cursor = 'not-allowed';
      btnSubmit.title = '❌ Capacité dépassée - impossible d\'enregistrer';
    }
  } else if (quantiteApreAjout > capaciteTypeMax * 0.8) {
    // Alerte jaune si au-delà de 80%
    alerte.style.display = 'block';
    alerte.classList.remove('alert-danger');
    alerte.classList.add('alert-warning');
    
    const pourcentage = Math.round((quantiteApreAjout / capaciteTypeMax) * 100);
    messageSpan.innerHTML = `
      <strong>⚠️ ATTENTION:</strong> 
      Vous atteindrez <strong>${pourcentage}%</strong> de la capacité max 
      (${quantiteApreAjout}/${capaciteTypeMax} ${produit.uniteMesure || 'unités'})
    `;
    
    //  RÉACTIVER LE BOUTON
    const btnSubmit = document.getElementById('btnSubmitReception');
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.style.opacity = '1';
      btnSubmit.style.cursor = 'pointer';
      btnSubmit.title = '';
    }
  } else {
    alerte.style.display = 'none';
    
    //  RÉACTIVER LE BOUTON
    const btnSubmit = document.getElementById('btnSubmitReception');
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.style.opacity = '1';
      btnSubmit.style.cursor = 'pointer';
      btnSubmit.title = '';
    }
  }
}

// ================================
// 🎁 CRÉER LES LOTS INDIVIDUELS
// ================================

async function createLotsForReception(reception, produitId) {
  try {
    const nombrePieces = parseInt(document.getElementById('nombrePieces').value);
    const quantiteParPiece = parseFloat(document.getElementById('quantiteParPiece').value);
    const uniteDetail = document.getElementById('uniteDetail').value;
    const prixAchat = parseFloat(document.getElementById('prixAchat').value) || 0;
    const rayonId = document.getElementById('rayonReception').value;
    const dateReception = document.getElementById('dateReception').value;
    
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const lotsPromises = [];
    
    console.log(`🎁 Création de ${nombrePieces} LOTs...`);
    
    for (let i = 1; i <= nombrePieces; i++) {
      const lotData = {
        magasinId: MAGASIN_ID,
        produitId: produitId,
        typeProduitId: currentTypeProduit._id,
        receptionId: reception._id,
        unitePrincipale: currentTypeProduit.unitePrincipaleStockage,
        quantiteInitiale: quantiteParPiece,
        quantiteRestante: quantiteParPiece,
        uniteDetail: uniteDetail,
        prixParUnite: prixAchat,
        prixTotal: quantiteParPiece * prixAchat,
        rayonId: rayonId,
        dateReception: dateReception,
        status: 'complet'
      };
      
      lotsPromises.push(
        fetch(
          `${API_CONFIG.BASE_URL}/api/protected/lots`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(lotData)
          }
        )
      );
    }
    
    const lotResults = await Promise.all(lotsPromises);
    let lotCreated = 0;
    
    for (const res of lotResults) {
      if (res.ok) {
        lotCreated++;
      } else {
        console.error('❌ Erreur création LOT:', await res.json());
      }
    }
    
    console.log(`✅ ${lotCreated}/${nombrePieces} LOTs créés`);
    
  } catch (err) {
    console.error('❌ Erreur createLotsForReception:', err);
    showToast('⚠️ Réception créée mais erreur lors de création des LOTs', 'warning');
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
    
    // ⚡ VALIDATION SUPPLÉMENTAIRE: Vérifier les champs selon le type
    if (currentTypeProduit && currentTypeProduit.typeStockage === 'lot') {
      // Validation LOT
      const nombrePieces = document.getElementById('nombrePieces')?.value;
      const quantiteParPiece = document.getElementById('quantiteParPiece')?.value;
      const uniteDetail = document.getElementById('uniteDetail')?.value;
      
      if (!nombrePieces || nombrePieces <= 0 || !quantiteParPiece || quantiteParPiece <= 0 || !uniteDetail) {
        showToast('❌ Veuillez remplir tous les champs LOT (nombre, quantité par pièce, unité)', 'danger');
        return;
      }
    } else {
      // Validation SIMPLE
      const quantiteReception = document.getElementById('quantiteReception')?.value;
      if (!quantiteReception || quantiteReception <= 0) {
        showToast('❌ Veuillez entrer une quantité valide', 'danger');
        return;
      }
    }

    // 📱 AFFICHER LE LOADING
    const btnSubmit = document.getElementById('btnSubmitReception');
    const iconSubmit = document.getElementById('iconSubmit');
    const textSubmit = document.getElementById('textSubmit');
    
    btnSubmit.disabled = true;
    iconSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>';
    textSubmit.textContent = 'Enregistrement...';

    // Collecter les données
    const produitId = document.getElementById('produitReception').value;
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

    // Récupérer le produit pour déterminer le type
    const produit = PRODUITS_RECEPTION.find(p => p._id === produitId);
    const isLot = currentTypeProduit?.typeStockage === 'lot';

    // ⚡ VALIDATION: Adapter les champs requis selon le type
    let quantite;
    if (isLot) {
      // Pour LOT: vérifier les champs LOT
      const nombrePieces = parseFloat(document.getElementById('nombrePieces')?.value);
      const quantiteParPiece = parseFloat(document.getElementById('quantiteParPiece')?.value);
      const uniteDetail = document.getElementById('uniteDetail')?.value;
      const prixParUnite = parseFloat(document.getElementById('prixParUniteDetail')?.value);

      if (!produitId || !nombrePieces || !quantiteParPiece || !uniteDetail || !rayonId || prixAchat === null) {
        console.error('❌ Champs LOT requis manquants!', {
          produitId: produitId || 'MISSING',
          nombrePieces: nombrePieces || 'MISSING',
          quantiteParPiece: quantiteParPiece || 'MISSING',
          uniteDetail: uniteDetail || 'MISSING',
          prixParUnite: prixParUnite || 'MISSING',
          rayonId: rayonId || 'MISSING'
        });
        showToast('❌ Veuillez remplir tous les champs LOT requis', 'danger');
        btnSubmit.disabled = false;
        iconSubmit.innerHTML = '<i class="fas fa-check me-2"></i>';
        textSubmit.textContent = 'Enregistrer Réception';
        return;
      }
      // Pour LOT, la quantité est juste le nombre de pièces (pas la quantité totale)
      quantite = nombrePieces;
    } else {
      // Pour SIMPLE: vérifier le champ quantite standard
      quantite = parseFloat(document.getElementById('quantiteReception').value);

      if (!produitId || !quantite || !rayonId || prixAchat === null || prixAchat === undefined) {
        console.error('❌ Champs requis manquants!', {
          produitId: produitId || 'MISSING',
          quantite: quantite || 'MISSING',
          rayonId: rayonId || 'MISSING',
          prixAchat: prixAchat,
          MAGASIN_ID: MAGASIN_ID
        });
        showToast('❌ Veuillez remplir tous les champs requis (quantité, rayon, prix)', 'danger');
        btnSubmit.disabled = false;
        iconSubmit.innerHTML = '<i class="fas fa-check me-2"></i>';
        textSubmit.textContent = 'Enregistrer Réception';
        return;
      }
    }

    // ⚡ VALIDATION: Vérifier capacité type avant soumission
    if (produit) {
      // Récupérer capacité du type
      let capaciteTypeMax = 0;
      if (typeof produit.typeProduitId === 'object' && produit.typeProduitId?.capaciteMax) {
        capaciteTypeMax = produit.typeProduitId.capaciteMax;
      } else if (produit.capaciteMax) {
        capaciteTypeMax = produit.capaciteMax;
      }
      
      // Si capacité max est définie, vérifier qu'on ne dépasse pas
      if (capaciteTypeMax > 0) {
        // Pour LOT: comparer le nombre de pièces à la capacité
        // Pour SIMPLE: comparer la quantité à la capacité
        let quantiteAVerifier = quantite;
        if (isLot) {
          const nombrePieces = parseFloat(document.getElementById('nombrePieces')?.value);
          quantiteAVerifier = nombrePieces;  // Capacity is in number of pieces
        }
        
        const quantiteActuelleProduit = produit.quantiteActuelle || 0;
        const quantiteApreAjout = quantiteActuelleProduit + quantiteAVerifier;
        
        if (quantiteApreAjout > capaciteTypeMax) {
          const depassement = (quantiteApreAjout - capaciteTypeMax).toFixed(2);
          const uniteMesure = isLot ? 'pièces' : (currentTypeProduit?.unitePrincipaleStockage || produit.typeProduitId?.unitePrincipale || produit.typeUnite || 'unités');
          console.error(`❌ CAPACITÉ TYPE DÉPASSÉE - ${produit.designation}`, {
            capaciteMax: capaciteTypeMax,
            quantiteActuelle: quantiteActuelleProduit,
            quantiteAjout: quantiteAVerifier,
            quantiteApreAjout,
            depassement,
            isLot
          });
          showToast(`❌ IMPOSSIBLE! Capacité max du type "${produit.designation}" (${capaciteTypeMax} ${uniteMesure}) serait dépassée de ${depassement} ${uniteMesure}`, 'danger');
          
          // 📱 RESTAURER LE BOUTON
          const btnSubmit = document.getElementById('btnSubmitReception');
          const iconSubmit = document.getElementById('iconSubmit');
          const textSubmit = document.getElementById('textSubmit');
          btnSubmit.disabled = false;
          iconSubmit.innerHTML = '<i class="fas fa-check me-2"></i>';
          textSubmit.textContent = 'Enregistrer Réception';
          return;
        }
      }
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
        console.log(' Photo uploadée:', photoUrl);
      } else {
        console.warn('⚠️ Erreur upload photo - continuant sans photo');
      }
    }

    // 📤 ÉTAPE 2: Enregistrer la réception en base de données
    
    // ✨ ADAPTER POUR SIMPLE vs LOT
    let receptionQuantite = quantite;
    let receptionData = {
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
    
    // Si LOT: ajouter les infos LOT
    if (currentTypeProduit && currentTypeProduit.typeStockage === 'lot') {
      const nombrePieces = parseInt(document.getElementById('nombrePieces').value);
      const quantiteParPiece = parseFloat(document.getElementById('quantiteParPiece').value);
      const uniteDetail = document.getElementById('uniteDetail').value;
      const prixParUnite = parseFloat(document.getElementById('prixParUniteDetail').value) || 0;
      
      receptionQuantite = nombrePieces;
      receptionData.quantite = nombrePieces;
      receptionData.type = 'lot';
      receptionData.nombrePieces = nombrePieces;
      receptionData.quantiteParPiece = quantiteParPiece;
      receptionData.uniteDetail = uniteDetail;
      receptionData.prixParUnite = prixParUnite;
      receptionData.prixTotalEstime = nombrePieces * quantiteParPiece * prixParUnite;
      
      console.log('🎁 Préparation LOT:', { nombrePieces, quantiteParPiece, uniteDetail, prixParUnite });
    } else {
      receptionData.type = 'simple';
    }

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
      console.error('❌ ERREUR BACKEND 400:', errorData);
      throw new Error(errorData.error || errorData.message || JSON.stringify(errorData) || 'Erreur enregistrement réception');
    }

    const result = await response.json();
    console.log(' Réception enregistrée:', result);
    
    // ✨ SI LOT: créer les LOTs individuels
    if (currentTypeProduit && currentTypeProduit.typeStockage === 'lot') {
      await createLotsForReception(result.reception, produitId);
    }

    showToast(' Réception enregistrée avec succès!', 'success');

    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalReception'));
    if (modal) modal.hide();

    // Réinitialiser le formulaire
    form.reset();
    form.classList.remove('was-validated');
    document.getElementById('dateReception').valueAsDate = new Date();
    
    // 📱 RESTAURER LE BOUTON
    const btnSubmit2 = document.getElementById('btnSubmitReception');
    const iconSubmit2 = document.getElementById('iconSubmit');
    const textSubmit2 = document.getElementById('textSubmit');
    btnSubmit2.disabled = false;
    iconSubmit2.innerHTML = '<i class="fas fa-check me-2"></i>';
    textSubmit2.textContent = 'Enregistrer Réception';

    // Recharger les produits et la table
    CACHE_PRODUITS = null;
    CACHE_TIMESTAMP = null;
    await loadProduits(true);

    // Recharger aussi les produits de réception
    await chargerProduitsReception();

  } catch (err) {
    console.error('❌ Erreur enregistrement réception:', err);
    showToast('❌ Erreur: ' + err.message, 'danger');
    
    // 📱 RESTAURER LE BOUTON EN CAS D'ERREUR
    const btnSubmit3 = document.getElementById('btnSubmitReception');
    const iconSubmit3 = document.getElementById('iconSubmit');
    const textSubmit3 = document.getElementById('textSubmit');
    btnSubmit3.disabled = false;
    iconSubmit3.innerHTML = '<i class="fas fa-check me-2"></i>';
    textSubmit3.textContent = 'Enregistrer Réception';
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

console.log(' Module réception chargé');
