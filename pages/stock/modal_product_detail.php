<!-- Modal Détail et Modification Produit -->
<div class="modal fade" id="modalProductDetail" tabindex="-1" aria-labelledby="modalProductDetailLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content shadow-xl border-0">
      <div class="modal-header bg-gradient-primary text-white">
        <h5 class="modal-title">
          <i class="fas fa-box-open me-2"></i>
          <span id="detailProductTitle">Détails du produit</span>
        </h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>

      <div class="modal-body">
        <input type="hidden" id="detailProduitId" />

        <!-- Tabs Navigation -->
        <ul class="nav nav-tabs mb-4" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="tabInfos-tab" data-bs-toggle="tab" data-bs-target="#tabInfos" type="button" role="tab" aria-controls="tabInfos" aria-selected="true">
              <i class="fas fa-info-circle me-2"></i>Informations
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="tabMouvements-tab" data-bs-toggle="tab" data-bs-target="#tabMouvements" type="button" role="tab" aria-controls="tabMouvements" aria-selected="false">
              <i class="fas fa-arrows-alt-v me-2"></i>Mouvements de stock
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="tabHistorique-tab" data-bs-toggle="tab" data-bs-target="#tabHistorique" type="button" role="tab" aria-controls="tabHistorique" aria-selected="false">
              <i class="fas fa-history me-2"></i>Historiques
            </button>
          </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content">

          <!-- TAB 1: INFORMATIONS -->
          <div class="tab-pane fade show active" id="tabInfos" role="tabpanel" aria-labelledby="tabInfos-tab">
            <form id="formEditProduit" novalidate>
              
              <!-- Photo du produit avec édition -->
              <div class="mb-4">
                <label class="form-label fw-bold d-flex align-items-center">
                  <i class="fas fa-image me-2 text-primary"></i>
                  Photo du produit
                </label>
                
                <!-- Photo Preview Container -->
                <div 
                  id="detailPhotoContainer" 
                  style="min-height: 200px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px; border: 2px dashed #dee2e6; position: relative; cursor: pointer; transition: all 0.3s ease;"
                  onclick="document.getElementById('detailPhotoProduit').click();"
                >
                  <img id="detailProductPhoto" src="" alt="Photo" style="max-width: 100%; max-height: 200px; object-fit: cover; display: none; border-radius: 6px;" />
                  <span id="detailPhotoFallback" class="badge bg-secondary text-center" style="padding: 20px;">
                    <i class="fas fa-cloud-upload-alt me-2 d-block mb-2" style="font-size: 24px;"></i>
                    Cliquez pour modifier la photo
                  </span>
                </div>

                <!-- Hidden File Input -->
                <input 
                  type="file" 
                  id="detailPhotoProduit" 
                  class="form-control" 
                  accept="image/*" 
                  style="display: none;"
                  onchange="previewDetailPhoto(event)"
                />

                <!-- Upload Progress (Hidden by default) -->
                <div id="detailPhotoProgress" class="mt-3" style="display: none;">
                  <small class="text-muted">Upload en cours...</small>
                  <div class="progress">
                    <div id="detailPhotoProgressBar" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%"></div>
                  </div>
                </div>

                <!-- Info text -->
                <small class="text-muted d-block mt-2">
                  <i class="fas fa-info-circle me-1"></i>
                  JPG, PNG acceptés. Max 5MB
                </small>
              </div>

              <!-- Infos principales -->
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Référence <span class="text-danger">*</span></label>
                  <input type="text" id="detailReference" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Désignation <span class="text-danger">*</span></label>
                  <input type="text" id="detailDesignation" class="form-control" required />
                </div>
              </div>

              <!-- Type et Prix -->
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Prix unitaire</label>
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input type="number" id="detailPrixUnitaire" class="form-control" step="0.01" />
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Rayon</label>
                  <input type="text" id="detailRayon" class="form-control" readonly />
                </div>
              </div>

              <!-- Stock et Seuil -->
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Quantité actuelle</label>
                  <input type="number" id="detailQuantiteActuelle" class="form-control" readonly />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Seuil d'alerte</label>
                  <input type="number" id="detailSeuilAlerte" class="form-control" />
                </div>
              </div>

              <!-- État et Date -->
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label fw-bold">État</label>
                  <select id="detailEtat" class="form-select">
                    <option value="Neuf">Neuf</option>
                    <option value="Bon état">Bon état</option>
                    <option value="Usagé">Usagé</option>
                    <option value="Endommagé">Endommagé</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Date d'entrée</label>
                  <input type="text" id="detailDateEntree" class="form-control" readonly />
                </div>
              </div>

              <!-- Boutons d'action -->
              <div class="d-flex gap-2 mt-4">
                <button type="button" class="btn btn-success flex-grow-1" onclick="saveProductChanges()">
                  <i class="fas fa-save me-2"></i>Enregistrer modifications
                </button>
                <button type="button" class="btn btn-danger" onclick="confirmDeleteProduct()">
                  <i class="fas fa-trash me-2"></i>Supprimer
                </button>
              </div>
            </form>
          </div>

          <!-- TAB 2: MOUVEMENTS -->
          <div class="tab-pane fade" id="tabMouvements" role="tabpanel" aria-labelledby="tabMouvements-tab">
            <div class="mb-4">
              <h6 class="mb-3">Enregistrer un mouvement</h6>
              
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Type de mouvement <span class="text-danger">*</span></label>
                  <select id="movementType" class="form-select">
                    <option value="">-- Sélectionner --</option>
                    <option value="RECEPTION">📥 Réception</option>
                    <option value="SORTIE">📤 Sortie</option>
                    <option value="TRANSFERT">📦 Transfert</option>
                    <option value="INVENTAIRE">📊 Inventaire</option>
                    <option value="AJUSTEMENT">⚙️ Ajustement</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Quantité <span class="text-danger">*</span></label>
                  <input type="number" id="movementQuantite" class="form-control" min="1" />
                </div>
              </div>

              <div class="mb-3 mt-3">
                <label class="form-label fw-bold">Observations (optionnel)</label>
                <textarea id="movementObservations" class="form-control" rows="3" placeholder="Notes sur ce mouvement..."></textarea>
              </div>

              <button type="button" class="btn btn-primary w-100" onclick="registerStockMovement()">
                <i class="fas fa-plus-circle me-2"></i>Enregistrer le mouvement
              </button>
            </div>

            <hr />

            <!-- Historique des mouvements récents -->
            <h6 class="mb-3">Derniers mouvements</h6>
            <div id="recentMovementsContainer" style="max-height: 300px; overflow-y: auto;">
              <div class="alert alert-info text-center mb-0">
                <small>Chargement des mouvements...</small>
              </div>
            </div>
          </div>

          <!-- TAB 3: HISTORIQUE -->
          <div class="tab-pane fade" id="tabHistorique" role="tabpanel" aria-labelledby="tabHistorique-tab">
            <div id="historyContainer" style="max-height: 400px; overflow-y: auto;">
              <div class="text-center py-4">
                <small class="text-muted">Chargement de l'historique...</small>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer bg-light">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
      </div>
    </div>
  </div>
</div>

<!-- Script for Modal Functionality -->
<script>
// 🔑 VARIABLES GLOBALES - DOIVENT ÊTRE AVANT TOUTES LES FONCTIONS
let detailUploadedPhotoUrl = null;  // 📸 Stocker l'URL Cloudinary uploadée

// Définir API_BASE_PROTECTED pour les uploads (ajoute /api/protected si nécessaire)
let API_BASE_PROTECTED = null;
if (typeof window.API_BASE !== 'undefined' && window.API_BASE) {
  // Si window.API_BASE n'a pas /api/protected, l'ajouter
  if (window.API_BASE.includes('/api/protected')) {
    API_BASE_PROTECTED = window.API_BASE;
  } else {
    API_BASE_PROTECTED = window.API_BASE + '/api/protected';
  }
} else {
  API_BASE_PROTECTED = 'https://backend-gestion-de-stock.onrender.com/api/protected';
}

// Charger les détails du produit dans le modal
async function openProductDetailModal(produitId) {
  try {
    // ⚡ Chercher le produit dans le cache instead d'appeler l'API
    let produit = null;
    
    // Essayer d'abord depuis le cache
    if (CACHE_PRODUITS && Array.isArray(CACHE_PRODUITS)) {
      produit = CACHE_PRODUITS.find(p => p._id === produitId);
    }
    
    // Si pas trouvé dans le cache, appeler l'API
    if (!produit) {
      try {
        produit = await API.get(
          API_CONFIG.ENDPOINTS.PRODUIT,
          { produitId }
        );
      } catch (apiErr) {
        console.warn('⚠️ Erreur API détail produit, utilisation du cache:', apiErr);
        showToast('⚠️ Chargement depuis le cache', 'info');
      }
    }

    if (!produit) {
      showToast('❌ Produit non trouvé', 'danger');
      return;
    }

    // Stocker l'ID
    document.getElementById('detailProduitId').value = produitId;
    document.getElementById('detailProductTitle').textContent = `${produit.designation}`;

    // Remplir les champs
    document.getElementById('detailReference').value = produit.reference || '';
    document.getElementById('detailDesignation').value = produit.designation || '';
    document.getElementById('detailPrixUnitaire').value = produit.prixUnitaire || 0;
    document.getElementById('detailRayon').value = produit.rayonId?.nomRayon || 'N/A';
    document.getElementById('detailQuantiteActuelle').value = produit.quantiteActuelle || 0;
    document.getElementById('detailSeuilAlerte').value = produit.seuilAlerte || 10;
    document.getElementById('detailEtat').value = produit.etat || 'Neuf';  // ✅ Corrigé!
    document.getElementById('detailDateEntree').value = new Date(produit.dateEntree).toLocaleDateString();

    // Gérer la photo
    const photoImg = document.getElementById('detailProductPhoto');
    const photoFallback = document.getElementById('detailPhotoFallback');
    
    if (produit.photoUrl) {
      photoImg.src = produit.photoUrl;
      photoImg.style.display = 'block';
      photoFallback.style.display = 'none';
    } else {
      photoImg.style.display = 'none';
      photoFallback.style.display = 'block';
    }

    // Charger les mouvements récents
    loadRecentMovements(produitId);

    // Charger l'historique
    loadProductHistory(produitId);

    // Ouvrir le modal
    const modal = new bootstrap.Modal(document.getElementById('modalProductDetail'));
    modal.show();

  } catch (err) {
    showToast('❌ Erreur: ' + err.message, 'danger');
  }
}

// Enregistrer les modifications du produit
async function saveProductChanges() {
  try {
    const produitId = document.getElementById('detailProduitId').value;
    
    console.log('💾 Début sauvegarde produit:', produitId);
    
    // 🔑 D'ABORD: vérifier s'il y a une photo en cours d'upload
    const photoFileInput = document.getElementById('detailPhotoProduit');
    if (photoFileInput && photoFileInput.files.length > 0 && !detailUploadedPhotoUrl) {
      console.log('📸 Une photo a été sélectionnée mais pas encore uploadée, attendre...');
      showToast('⏳ Upload de la photo en cours...', 'info');
      
      // Attendre que l'upload soit terminé (max 30s)
      let attempts = 0;
      while (!detailUploadedPhotoUrl && attempts < 30) {
        await new Promise(r => setTimeout(r, 1000));
        attempts++;
      }
      
      if (!detailUploadedPhotoUrl) {
        showToast('⚠️ Timeout upload photo', 'warning');
      } else {
        console.log('✅ Photo uploadée:', detailUploadedPhotoUrl);
      }
    }
    
    const updatedData = {
      reference: document.getElementById('detailReference').value,
      designation: document.getElementById('detailDesignation').value,
      prixUnitaire: parseFloat(document.getElementById('detailPrixUnitaire').value) || 0,
      seuilAlerte: parseInt(document.getElementById('detailSeuilAlerte').value) || 10,
      etat: document.getElementById('detailEtat').value
    };
    
    // 📸 Ajouter la photo si elle a été uploadée
    if (detailUploadedPhotoUrl) {
      updatedData.photoUrl = detailUploadedPhotoUrl;
      console.log('📸 Sauvegarde avec photo:', detailUploadedPhotoUrl);
    }

    console.log('📤 Envoi données au backend:', updatedData);

    await API.put(
      API_CONFIG.ENDPOINTS.PRODUIT,
      updatedData,
      { produitId }
    );

    console.log('✅ Produit sauvegardé avec succès');
    showToast('✅ Produit modifié avec succès!', 'success');
    
    // 🔧 Fix aria-hidden: enlever le focus du bouton avant de fermer le modal
    if (document.activeElement) {
      document.activeElement.blur();
    }
    
    // Fermer le modal
    const modalEl = document.getElementById('modalProductDetail');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) {
        console.log('🚪 Fermeture du modal');
        modalInstance.hide();
      }
    }
    
    // Réinitialiser la variable de photo
    detailUploadedPhotoUrl = null;
    
    // 🔄 Recharger la liste produits - C'EST IMPORTANT!
    console.log('🔄 Invalidation du cache et rechargement du tableau...');
    CACHE_PRODUITS = null;
    CACHE_TIMESTAMP = null;
    
    if (typeof loadProduits === 'function') {
      console.log('📋 Appel de loadProduits()');
      await loadProduits(true);
      console.log('✅ Tableau rechargé avec succès');
    } else {
      console.error('❌ loadProduits n\'existe pas!');
    }

  } catch (err) {
    console.error('❌ Erreur sauvegarde:', err);
    showToast('❌ Erreur: ' + err.message, 'danger');
  }
}

// Enregistrer un mouvement de stock
async function registerStockMovement() {
  try {
    const produitId = document.getElementById('detailProduitId').value;
    const type = document.getElementById('movementType').value;
    const quantite = parseInt(document.getElementById('movementQuantite').value);
    const observations = document.getElementById('movementObservations').value;

    if (!type) {
      showToast('Veuillez sélectionner un type de mouvement', 'warning');
      return;
    }

    if (!quantite || quantite <= 0) {
      showToast('Quantité invalide', 'warning');
      return;
    }

    await API.post(
      API_CONFIG.ENDPOINTS.STOCK_MOVEMENTS,
      {
        produitId,
        type,
        quantite,
        observations: observations || `Mouvement ${type}`
      },
      { magasinId: MAGASIN_ID }
    );

    showToast(`✅ Mouvement ${type} enregistré!`, 'success');
    
    // Réinitialiser le formulaire
    document.getElementById('movementType').value = '';
    document.getElementById('movementQuantite').value = '';
    document.getElementById('movementObservations').value = '';

    // Recharger les mouvements
    await loadRecentMovements(produitId);
    
    // Recharger l'historique
    await loadProductHistory(produitId);
    
    // Recharger la liste produits avec cache refresh (IMPORTANT!)
    console.log('🔄 Rechargement table après mouvement...');
    try {
      if (typeof loadProduits === 'function') {
        // Passer true pour forcer invalidation du cache
        await loadProduits(true);
      }
    } catch (reloadErr) {
      console.warn('⚠️ Erreur rechargement table:', reloadErr);
    }

  } catch (err) {
    showToast('❌ Erreur: ' + err.message, 'danger');
  }
}

// Charger les mouvements récents
async function loadRecentMovements(produitId) {
  try {
    const mouvements = await API.get(
      API_CONFIG.ENDPOINTS.PRODUIT_MOUVEMENTS,
      { produitId }
    );

    const container = document.getElementById('recentMovementsContainer');
    
    if (!mouvements || mouvements.length === 0) {
      container.innerHTML = '<div class="alert alert-info text-center mb-0"><small>Aucun mouvement</small></div>';
      return;
    }

    let html = '<div class="list-group list-group-sm">';
    
    mouvements.slice(0, 10).forEach(m => {
      const icon = m.type === 'RECEPTION' ? '📥' : m.type === 'SORTIE' ? '📤' : '📦';
      const color = m.type === 'RECEPTION' ? 'success' : m.type === 'SORTIE' ? 'danger' : 'info';
      
      html += `
        <div class="list-group-item">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="mb-1">${icon} <strong>${m.type}</strong></h6>
              <small class="text-muted d-block">${new Date(m.createdAt || m.dateCreation).toLocaleString()}</small>
            </div>
            <span class="badge bg-${color}">${m.quantite} unités</span>
          </div>
          ${m.observations ? `<small class="d-block mt-2 text-muted">${m.observations}</small>` : ''}
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;

  } catch (err) {
    console.error('Erreur chargement mouvements:', err);
  }
}

// Charger l'historique du produit
async function loadProductHistory(produitId) {
  try {
    const container = document.getElementById('historyContainer');
    
    // Pour l'instant, afficher les mouvements comme historique
    const mouvements = await API.get(
      API_CONFIG.ENDPOINTS.PRODUIT_MOUVEMENTS,
      { produitId }
    );

    if (!mouvements || mouvements.length === 0) {
      container.innerHTML = '<div class="alert alert-info text-center"><small>Aucun historique</small></div>';
      return;
    }

    let html = '<div class="timeline">';
    
    mouvements.forEach((m, index) => {
      const color = m.type === 'RECEPTION' ? 'success' : m.type === 'SORTIE' ? 'danger' : 'info';
      const icon = m.type === 'RECEPTION' ? 'arrow-down' : m.type === 'SORTIE' ? 'arrow-up' : 'box';
      
      html += `
        <div class="mb-3">
          <div class="d-flex gap-2">
            <div class="text-center" style="min-width: 40px;">
              <div class="badge bg-${color}" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-${icon}"></i>
              </div>
              ${index < mouvements.length - 1 ? '<div style="width: 2px; height: 20px; background: #dee2e6; margin: 2px auto;"></div>' : ''}
            </div>
            <div class="flex-grow-1">
              <h6 class="mb-1">${m.type}</h6>
              <small class="text-muted d-block">${new Date(m.createdAt || m.dateCreation).toLocaleString()}</small>
              <small class="text-muted d-block">Quantité: <strong>${m.quantite}</strong></small>
              ${m.observations ? `<small class="d-block text-muted mt-1">${m.observations}</small>` : ''}
            </div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;

  } catch (err) {
    console.error('Erreur historique:', err);
  }
}

// Compresser l'image de façon agressive avant upload
async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 800;
        const maxHeight = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => resolve(new File([blob], 'produit.jpg', { type: 'image/jpeg' })),
          'image/jpeg',
          0.7
        );
      };
    };
    reader.onerror = reject;
  });
}

// Preview de la photo avant upload
function previewDetailPhoto(event) {
  const file = event.target.files[0];
  
  if (!file) return;

  // Validation de la taille (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    showToast('❌ Le fichier dépasse 5MB', 'danger');
    event.target.value = '';
    return;
  }

  // Validation du type
  if (!file.type.startsWith('image/')) {
    showToast('❌ Veuillez sélectionner une image', 'danger');
    event.target.value = '';
    return;
  }

  // Preview local
  const reader = new FileReader();
  reader.onload = function(e) {
    const photoImg = document.getElementById('detailProductPhoto');
    const photoFallback = document.getElementById('detailPhotoFallback');
    
    photoImg.src = e.target.result;  // Preview temporaire
    photoImg.style.display = 'block';
    photoFallback.style.display = 'none';

    // Upload automatique
    uploadDetailProductPhoto(file);
  };
  
  reader.readAsDataURL(file);
}

// Upload de la photo du produit (COPIÉ DEPUIS add_prod.php - VERSION QUI MARCHE)
async function uploadDetailProductPhoto(file) {
  try {
    const produitId = document.getElementById('detailProduitId').value;
    
    if (!produitId) {
      console.error('❌ Produit non chargé');
      showToast('❌ Erreur: Produit non chargé', 'danger');
      return;
    }

    console.log('📸 Début upload photo:', file.name);
    showToast('📤 Upload de l\'image en cours...', 'info');

    // Afficher la progress bar
    const progressDiv = document.getElementById('detailPhotoProgress');
    if (progressDiv) progressDiv.style.display = 'block';

    try {
      // Compresser l'image avant upload
      const compressedFile = await compressImage(file);
      console.log('✅ Image compressée');

      // Créer FormData avec l'image (EXACTEMENT comme add_prod.php)
      const formData = new FormData();
      formData.append('image', compressedFile, 'produit.jpg');

      // Obtenir le token
      let token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        token = sessionStorage.getItem('token') || sessionStorage.getItem('authToken');
      }

      console.log('🔐 Token obtenu:', token ? '✅' : '❌');

      // Upload vers Cloudinary via API (EXACTEMENT comme add_prod.php)
      const uploadResponse = await fetch(`${API_BASE_PROTECTED}/upload/produit-image`, {
        method: 'POST',
        // Note: Ne pas définir Content-Type, le navigateur le fera automatiquement avec multipart/form-data
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('📡 Réponse serveur:', uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Erreur upload (${uploadResponse.status}): ${errorText.substring(0, 100)}`);
      }

      const uploadResult = await uploadResponse.json();
      const photoUrl = uploadResult.photoUrl;
      console.log('✅ Image uploadée Cloudinary:', photoUrl);
      
      // 🔑 IMPORTANT: Stocker la vraie URL Cloudinary pour la sauvegarde!
      detailUploadedPhotoUrl = photoUrl;
      console.log('💾 detailUploadedPhotoUrl mise à jour:', detailUploadedPhotoUrl);
      
      // Mettre à jour l'image affichée
      const photoImg = document.getElementById('detailProductPhoto');
      photoImg.src = photoUrl;  // Maintenant c'est l'URL Cloudinary
      photoImg.style.display = 'block';
      document.getElementById('detailPhotoFallback').style.display = 'none';

      showToast('✅ Photo mise à jour!', 'success');
      
      if (progressDiv) progressDiv.style.display = 'none';

    } catch (error) {
      console.error('❌ Erreur upload:', error);
      showToast('❌ Erreur lors de l\'upload de l\'image: ' + error.message, 'danger');
      if (progressDiv) progressDiv.style.display = 'none';
    }

  } catch (err) {
    console.error('❌ Erreur général:', err);
    showToast('❌ Erreur: ' + err.message, 'danger');
  }
}

// Confirmer la suppression
function confirmDeleteProduct() {
  const produitId = document.getElementById('detailProduitId').value;
  const designation = document.getElementById('detailDesignation').value;
  
  if (confirm(`⚠️ Êtes-vous sûr de vouloir supprimer "${designation}" ?\n\nCette action est irréversible.`)) {
    deleteProductPermanent(produitId);
  }
}

// Supprimer le produit de manière permanente
async function deleteProductPermanent(produitId) {
  try {
    await API.delete(
      API_CONFIG.ENDPOINTS.PRODUIT,
      { produitId }
    );

    showToast('✅ Produit supprimé!', 'success');
    bootstrap.Modal.getInstance(document.getElementById('modalProductDetail')).hide();
    await loadProduits(false);

  } catch (err) {
    showToast('❌ Erreur: ' + err.message, 'danger');
  }
}
</script>
