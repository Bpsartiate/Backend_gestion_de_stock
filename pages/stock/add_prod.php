<!-- Modal Ajout/Modification Produit -->
<div class="modal fade" id="modalProduit" tabindex="-1" aria-labelledby="modalProduitLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content shadow-xl border-0">
      <div class="modal-header bg-gradient-primary text-white">
        <h5 class="modal-title">
          <i class="fas fa-box me-2"></i>
          <span id="modalProduitTitle">Ajouter un produit</span>
        </h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form id="formAddProduit" novalidate>
        <div class="modal-body">
          <input type="hidden" id="produitId" />
          
          <!-- 1. INFOS PRINCIPALES -->
          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <label class="form-label fw-bold">Référence <span class="text-danger">*</span></label>
              <input type="text" name="reference" id="reference" class="form-control" required />
              <div class="invalid-feedback">Référence obligatoire</div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold">Désignation <span class="text-danger">*</span></label>
              <input type="text" name="designation" id="designation" class="form-control" required />
              <div class="invalid-feedback">Désignation obligatoire</div>
            </div>
          </div>

          <!-- 2. CATÉGORIE (NOUVELLE SECTION) -->
          <div class="row g-3 mb-4">
            <div class="col-md-12">
              <label class="form-label fw-bold d-flex align-items-center">
                <i class="fas fa-tags me-2 text-primary"></i>
                Catégorie <span class="text-danger">*</span>
              </label>
              
              <!-- Sélecteur avec recherche fluide -->
              <div class="position-relative">
                <div class="input-group">
                  <input 
                    type="text" 
                    id="categorieSearch" 
                    class="form-control" 
                    placeholder="🔍 Rechercher ou créer catégorie..."
                    autocomplete="off"
                  />
                  <button 
                    type="button" 
                    class="btn btn-outline-primary" 
                    id="btnNewCategorie"
                    title="Créer nouvelle catégorie"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
                
                <!-- Dropdown des catégories avec animation -->
                <div 
                  id="categorieDropdown" 
                  class="position-absolute w-100 bg-white border rounded-bottom shadow-sm mt-0" 
                  style="display:none; top: 100%; left: 0; z-index: 1000; max-height: 300px; overflow-y: auto;"
                >
                  <div id="categorieList" class="list-group list-group-flush">
                    <!-- Catégories dynamiques -->
                  </div>
                </div>
              </div>

              <!-- Catégories sélectionnées (badges fluides) -->
              <div id="selectedCategoriesList" class="mt-3 d-flex flex-wrap gap-2">
                <!-- Badges des catégories sélectionnées -->
              </div>

              <!-- Hidden input pour stocker la sélection -->
              <input type="hidden" name="categorieId" id="categorieId" required />
              <div class="invalid-feedback">Catégorie obligatoire</div>
            </div>
          </div>

          <!-- 3. QUANTITÉ & UNITÉ -->
          <div class="row g-3 mb-4">
            <div class="col-md-12">
              <label class="form-label fw-bold" id="labelQuantite">Stock Initial <span class="text-danger">*</span></label>
              <div class="input-group">
                <input type="number" name="quantite" id="quantite" class="form-control" min="0" step="0.01" required />
                <span class="input-group-text" id="uniteLabel">unités</span>
              </div>
              <div class="invalid-feedback">Quantité obligatoire</div>
            </div>
          </div>

          <!-- 4. RAYON & PRIX -->
          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <label class="form-label fw-bold">Rayon <span class="text-danger">*</span></label>
              <select name="rayonId" id="rayonId" class="form-select" required>
                <option value="">Choisir rayon...</option>
              </select>
              <div class="invalid-feedback">Rayon obligatoire</div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold">Prix Unitaire</label>
              <div class="input-group">
                <span class="input-group-text">CDF</span>
                <input type="number" name="prixUnitaire" id="prixUnitaire" class="form-control" step="0.01" />
              </div>
            </div>
          </div>

          <!-- 4.5. GESTION FIFO/LIFO -->
          <div class="card bg-light border-info mb-4">
            <div class="card-header bg-info bg-opacity-10 border-info py-2">
              <h6 class="mb-0 fw-bold"><i class="fas fa-exchange-alt me-2 text-info"></i>Gestion Lot & Rotation Stock</h6>
            </div>
            <div class="card-body p-3">
              <div class="row g-3">
                <!-- Numéro de Lot -->
                <div class="col-md-4">
                  <label class="form-label fw-bold">Numéro de Lot</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-barcode text-warning"></i></span>
                    <input 
                      type="text" 
                      name="numeroBatch" 
                      id="numeroBatch" 
                      class="form-control" 
                      placeholder="LOT2024001"
                      autocomplete="off"
                    >
                  </div>
                  <small class="text-muted d-block mt-1">Ex: LOT2024001, BATCH-2024-01</small>
                </div>

                <!-- Date d'Entrée -->
                <div class="col-md-4">
                  <label class="form-label fw-bold">Date d'Entrée <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-calendar text-primary"></i></span>
                    <input 
                      type="date" 
                      name="dateEntreeLot" 
                      id="dateEntreeLot" 
                      class="form-control"
                      required
                    >
                  </div>
                  <small class="text-muted d-block mt-1">Pour FIFO/LIFO</small>
                </div>

                <!-- Date d'Expiration -->
                <div class="col-md-4">
                  <label class="form-label fw-bold">Date Expiration</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-calendar-times text-danger"></i></span>
                    <input 
                      type="date" 
                      name="dateExpiration" 
                      id="dateExpiration" 
                      class="form-control"
                    >
                  </div>
                  <small class="text-muted d-block mt-1">Si applicable</small>
                </div>
              </div>

              <!-- Info Mode FIFO/LIFO -->
              <div id="infoModeGestion" class="alert alert-info mt-3 mb-0 py-2">
                <small>
                  <i class="fas fa-info-circle me-2"></i>
                  <span id="modeGestionText">Le mode de rotation sera appliqué selon la catégorie choisie.</span>
                </small>
              </div>
            </div>
          </div>

          <!-- 5. INFOS COMPLÉMENTAIRES -->
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-bold">Seuil Minimum</label>
              <input type="number" name="seuilAlerte" id="seuilAlerte" class="form-control" min="0" />
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold">État</label>
              <select name="etat" id="etat" class="form-select">
                <option value="nouveau">Neuf</option>
                <option value="bon">Bon état</option>
                <option value="usage">Usagé</option>
              </select>
            </div>
          </div>

          <!-- PRÉVIEW PHOTO -->
          <div class="mt-4">
            <label class="form-label fw-bold">Photo Produit</label>
            <div class="border rounded-3 p-4 text-center bg-light" style="min-height: 150px;">
              <input type="file" id="photoProduit" class="form-control" accept="image/*">
              <div id="photoPreview" class="mt-2">
                <i class="fas fa-image fa-3x text-muted"></i>
                <p class="text-muted mt-2 mb-0">Photo optionnelle</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer bg-light">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
          <button type="submit" class="btn btn-primary px-4">
            <i class="fas fa-save me-2"></i>Enregistrer Produit
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- ===== STYLES FIFO/LIFO ===== -->
<style>
  /* Animation slideDown pour dropdown */
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Animation slideIn pour badges */
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-15px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* Card FIFO/LIFO styling */
  .card.bg-light.border-info {
    animation: slideDown 0.3s ease-out;
    border: 2px solid #0084ff;
  }

  .card.bg-light.border-info .card-header {
    background: linear-gradient(135deg, rgba(0, 132, 255, 0.1) 0%, rgba(0, 132, 255, 0.05) 100%) !important;
  }

  /* Alert info styling */
  #infoModeGestion {
    background: linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%);
    border-left: 4px solid #0084ff;
    transition: all 0.2s ease;
  }

  #infoModeGestion:hover {
    box-shadow: 0 2px 8px rgba(0, 132, 255, 0.1);
  }

  /* Input groupe avec icônes */
  .input-group-text {
    background-color: #f3f4f6;
    border-color: #d1d5db;
    transition: all 0.2s ease;
  }

  .input-group:focus-within .input-group-text {
    background-color: #e0f2fe;
    border-color: #0084ff;
    color: #0084ff;
  }

  /* Barcode icon animate */
  .fa-barcode {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  /* Badge animations */
  .badge {
    animation: slideIn 0.3s ease-out;
  }

  /* Forms focus animation */
  .form-control:focus, .form-select:focus {
    border-color: #0084ff;
    box-shadow: 0 0 0 3px rgba(0, 132, 255, 0.1);
  }

  /* Petit texte explications */
  small {
    transition: all 0.2s ease;
  }

  /* Section FIFO/LIFO */
  #infoModeGestion small strong {
    color: #0084ff;
  }

  #infoModeGestion .fa-calendar-times {
    animation: pulse 2s infinite;
  }
</style>

<!-- ===== SCRIPT GESTION CATÉGORIES ===== -->
<script>
  // Module IIFE pour éviter les conflits de variables globales
  (function() {
    // Variables globales au module
    let selectedCategorie = null;
    let allCategories = [];
    let currentMagasinId = null;

  // API Base URL
  const API_BASE = typeof window.API_BASE !== 'undefined' && window.API_BASE 
    ? window.API_BASE + '/api/protected'
    : 'https://backend-gestion-de-stock.onrender.com/api/protected';

  // ✅ Helper pour obtenir le token d'authentification
  function getAuthToken() {
    let token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
      token = sessionStorage.getItem('token') || sessionStorage.getItem('authToken');
    }
    if (!token) {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'token' || name === 'authToken') {
          token = decodeURIComponent(value);
          break;
        }
      }
    }
    return token || '';
  }

  // ✅ Charger les catégories depuis l'API
  async function loadCategories() {
    // Récupérer le magasinId
    currentMagasinId = sessionStorage.getItem('currentMagasinId');
    if (!currentMagasinId && typeof window.stockConfig !== 'undefined') {
      currentMagasinId = window.stockConfig.magasinId;
    }
    if (!currentMagasinId) {
      currentMagasinId = localStorage.getItem('currentMagasinId');
    }

    if (!currentMagasinId) {
      console.warn('⚠️ Aucun magasinId trouvé');
      return;
    }

    try {
      const authToken = getAuthToken();
      console.log('🔵 Chargement des catégories pour magasin:', currentMagasinId);
      
      const response = await fetch(`${API_BASE}/magasins/${currentMagasinId}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      allCategories = data.categories || [];
      console.log('✅ Catégories chargées:', allCategories);
      
      // Remplir le dropdown
      renderCategoriesList();
    } catch (error) {
      console.error('❌ Erreur chargement catégories:', error);
    }
  }

  // ✅ Afficher les catégories dans le dropdown
  function renderCategoriesList() {
    const list = document.getElementById('categorieList');
    list.innerHTML = '';

    if (allCategories.length === 0) {
      list.innerHTML = '<div class="text-muted p-3"><small>Aucune catégorie</small></div>';
      return;
    }

    allCategories.forEach(cat => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'list-group-item list-group-item-action';
      
      // Générer un code si absent (ex: "asd" → "ASD")
      const code = cat.code || (cat.nomType || cat.nom || '').toUpperCase().slice(0, 3);
      const unite = cat.unitePrincipale || cat.unite || 'unités';
      
      item.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <span style="font-size:1.2em;">${cat.icone || '📦'}</span>
            <strong>${cat.nomType || cat.nom}</strong>
            <small class="text-muted d-block">${code} • ${unite}</small>
          </div>
          <span class="badge bg-info">${unite}</span>
        </div>
      `;
      item.addEventListener('click', (e) => {
        e.preventDefault();
        selectCategorie(cat);
      });
      list.appendChild(item);
    });
  }

  // ✅ Sélectionner une catégorie
  function selectCategorie(categorie) {
    selectedCategorie = categorie;
    console.log('✅ Catégorie sélectionnée:', categorie);

    // Remplir l'ID caché
    document.getElementById('categorieId').value = categorie._id;

    // Afficher en badge
    displaySelectedCategoriesList([categorie]);

    // Appliquer les paramètres de la catégorie
    onCategorieSelected(categorie);

    // Fermer le dropdown
    document.getElementById('categorieDropdown').style.display = 'none';
    document.getElementById('categorieSearch').value = '';
  }

  // ✅ Afficher les catégories sélectionnées en badges
  function displaySelectedCategoriesList(categories) {
    const container = document.getElementById('selectedCategoriesList');
    container.innerHTML = '';

    if (categories.length === 0) {
      container.innerHTML = '<small class="text-muted">Aucune catégorie sélectionnée</small>';
      return;
    }

    categories.forEach(cat => {
      const badge = document.createElement('span');
      badge.className = 'badge bg-primary text-white p-2 d-flex align-items-center gap-2';
      badge.style.fontSize = '0.95rem';
      badge.innerHTML = `
        <span>${cat.icone || '📦'}</span>
        <span>${cat.nomType || cat.nom}</span>
        <button type="button" class="btn-close btn-close-white" style="font-size: 0.7rem;"></button>
      `;

      badge.querySelector('button').addEventListener('click', () => {
        selectedCategorie = null;
        document.getElementById('categorieId').value = '';
        displaySelectedCategoriesList([]);
        onCategorieSelected(null);
      });

      container.appendChild(badge);
    });
  }

  // ✅ Rechercher les catégories
  function filterCategories(query) {
    const list = document.getElementById('categorieList');
    const items = list.querySelectorAll('.list-group-item');
    const q = query.toLowerCase();

    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(q) ? '' : 'none';
    });
  }

  // ✅ Fonction appelée quand une catégorie est sélectionnée
  function onCategorieSelected(categorie) {
    if (!categorie) {
      console.log('🧹 Catégorie désélectionnée');
      document.getElementById('uniteLabel').textContent = 'unités';
      document.getElementById('modeGestionText').innerHTML = 'Le mode de rotation sera appliqué selon la catégorie choisie.';
      return;
    }

    console.log('✅ Catégorie sélectionnée:', categorie);

    // 1️⃣ Mettre à jour l'unité
    const unite = categorie.unitePrincipale || categorie.unite || 'unités';
    document.getElementById('uniteLabel').textContent = unite;
    console.log('📦 Unité mise à jour:', unite);

    // 2️⃣ Mettre à jour le mode FIFO/LIFO
    const modeGestion = categorie.modeGestion || 'FIFO';
    const modeText = modeGestion === 'FIFO' 
      ? `📋 Mode <strong>FIFO</strong> (Premier Entré - Premier Sorti) appliqué pour "${categorie.nomType || categorie.nom}"`
      : `📋 Mode <strong>LIFO</strong> (Dernier Entré - Premier Sorti) appliqué pour "${categorie.nomType || categorie.nom}"`;
    document.getElementById('modeGestionText').innerHTML = modeText;
    console.log('🔄 Mode FIFO/LIFO:', modeGestion);

    // 3️⃣ Afficher les champs supplémentaires si présents
    if (categorie.champsSupplementaires && categorie.champsSupplementaires.length > 0) {
      console.log('📋 Champs supplémentaires:', categorie.champsSupplementaires);
      displaySupplementaryFields(categorie.champsSupplementaires);
    } else {
      clearSupplementaryFields();
    }
  }

  // Afficher les champs supplémentaires
  function displaySupplementaryFields(champs) {
    console.log('🎯 Afficher champs supplémentaires:', champs);
  }

  // Effacer les champs supplémentaires
  function clearSupplementaryFields() {
    console.log('🧹 Champs supplémentaires effacés');
  }

  // ===== ÉVÉNEMENTS =====
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOMContentLoaded - add_prod.php');

    // Charger les catégories
    loadCategories();

    // Dropdown search input
    const categorieSearch = document.getElementById('categorieSearch');
    if (categorieSearch) {
      categorieSearch.addEventListener('input', (e) => {
        document.getElementById('categorieDropdown').style.display = 'block';
        filterCategories(e.target.value);
      });

      categorieSearch.addEventListener('focus', () => {
        document.getElementById('categorieDropdown').style.display = 'block';
      });
    }

    // Fermer le dropdown quand on clique ailleurs
    document.addEventListener('click', function(e) {
      if (!e.target.closest('[id^="categorie"]') && !e.target.closest('#categorieSearch')) {
        document.getElementById('categorieDropdown').style.display = 'none';
      }
    });

    // Bouton créer catégorie
    const btnNewCategorie = document.getElementById('btnNewCategorie');
    if (btnNewCategorie) {
      btnNewCategorie.addEventListener('click', () => {
        console.log('➕ Créer nouvelle catégorie - à implémenter');
        // TODO: Ouvrir modal de création de catégorie
      });
    }
  });

    // ===== COMPRESSION D'IMAGE =====
    // Compresser l'image de façon agressive avant upload (réduire la taille drastiquement)
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

    // ===== GESTION PHOTO & UPLOAD CLOUDINARY =====
    let uploadedPhotoUrl = null;
    let isUploadingPhoto = false;

    // Prévisualisation d'image
    document.getElementById('photoProduit').addEventListener('change', async function(e) {
      const file = e.target.files[0];
      if (!file) return;

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        showNotification('⚠️ Veuillez sélectionner une image', 'warning');
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('⚠️ L\'image doit faire moins de 5MB', 'warning');
        return;
      }

      // Afficher prévisualisation
      const reader = new FileReader();
      reader.onload = function(event) {
        const preview = `
          <div class="d-flex flex-column align-items-center gap-2">
            <img src="${event.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px; object-fit: cover;">
            <div class="spinner-border spinner-border-sm text-primary" role="status" style="display:none;" id="uploadSpinner">
              <span class="visually-hidden">Upload...</span>
            </div>
            <small id="uploadStatus" class="text-muted">Clic sur Enregistrer pour télécharger</small>
          </div>
        `;
        document.getElementById('photoPreview').innerHTML = preview;
      };
      reader.readAsDataURL(file);
    });

    // ===== SOUMISSION FORMULAIRE PRODUIT =====
    document.getElementById('formAddProduit').addEventListener('submit', async function(e) {
      e.preventDefault();

      // Validation des champs obligatoires
      if (!selectedCategorie) {
        showNotification('⚠️ Veuillez sélectionner une catégorie', 'warning');
        return;
      }

      const reference = document.getElementById('reference').value.trim();
      const designation = document.getElementById('designation').value.trim();
      const quantite = parseFloat(document.getElementById('quantite').value) || 0;
      const rayonId = document.getElementById('rayonId').value;
      const categorieId = document.getElementById('categorieId').value;
      const dateEntree = document.getElementById('dateEntreeLot').value;

      if (!reference || !designation || !rayonId || !dateEntree) {
        showNotification('⚠️ Veuillez remplir tous les champs obligatoires', 'warning');
        return;
      }

      // Upload l'image si sélectionnée
      const fileInput = document.getElementById('photoProduit');
      if (fileInput.files.length > 0 && !uploadedPhotoUrl) {
        const file = fileInput.files[0];
        showNotification('📤 Upload de l\'image en cours...', 'info');

        // Afficher le spinner
        const spinner = document.getElementById('uploadSpinner');
        if (spinner) spinner.style.display = 'inline-block';

        try {
          // Compresser l'image avant upload
          const compressedFile = await compressImage(file);

          // Créer FormData avec l'image (comme pour les magasins)
          const formData = new FormData();
          formData.append('image', compressedFile, 'produit.jpg');

          // Upload vers Cloudinary via API
          const uploadResponse = await fetch(`${API_BASE}/upload/produit-image`, {
            method: 'POST',
            // Note: Ne pas définir Content-Type, le navigateur le fera automatiquement avec multipart/form-data
            headers: {
              'Authorization': `Bearer ${getAuthToken()}`
            },
            body: formData
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Erreur upload (${uploadResponse.status}): ${errorText.substring(0, 100)}`);
          }

          const uploadResult = await uploadResponse.json();
          uploadedPhotoUrl = uploadResult.photoUrl;
          console.log('✅ Image uploadée:', uploadedPhotoUrl);
          
          if (spinner) spinner.style.display = 'none';
          const status = document.getElementById('uploadStatus');
          if (status) status.textContent = '✅ Image uploadée';
        } catch (error) {
          console.error('❌ Erreur upload:', error);
          showNotification('❌ Erreur lors de l\'upload de l\'image: ' + error.message, 'danger');
          const spinner = document.getElementById('uploadSpinner');
          if (spinner) spinner.style.display = 'none';
          return;
        }
      }

      // Préparer les données du produit
      const produitData = {
        reference,
        designation,
        typeProduitId: categorieId,
        rayonId,
        quantiteEntree: quantite,
        prixUnitaire: parseFloat(document.getElementById('prixUnitaire').value) || 0,
        etat: document.getElementById('etat').value,
        dateEntree,
        seuilAlerte: parseFloat(document.getElementById('seuilAlerte').value) || 0,
        photoUrl: uploadedPhotoUrl,
        notes: `Lot: ${document.getElementById('numeroBatch').value || 'N/A'}`
      };

      try {
        currentMagasinId = sessionStorage.getItem('currentMagasinId') || 
                          window.stockConfig?.magasinId || 
                          localStorage.getItem('currentMagasinId');

        if (!currentMagasinId) {
          showNotification('⚠️ Magasin non identifié', 'warning');
          return;
        }

        showNotification('💾 Enregistrement du produit...', 'info');

        const response = await fetch(`${API_BASE}/magasins/${currentMagasinId}/produits`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify(produitData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Erreur API: ${response.status}`);
        }

        const produit = await response.json();
        console.log('✅ Produit créé:', produit);

        showNotification(`✅ Produit "${designation}" enregistré avec succès!`, 'success');

        // Réinitialiser le formulaire
        document.getElementById('formAddProduit').reset();
        document.getElementById('selectedCategoriesList').innerHTML = '';
        document.getElementById('categorieId').value = '';
        document.getElementById('photoPreview').innerHTML = '<i class="fas fa-image fa-3x text-muted"></i><p class="text-muted mt-2 mb-0">Photo optionnelle</p>';
        uploadedPhotoUrl = null;
        selectedCategorie = null;

        // Fermer le modal après 1.5s
        setTimeout(() => {
          const modal = bootstrap.Modal.getInstance(document.getElementById('modalProduit'));
          if (modal) modal.hide();
        }, 1500);

      } catch (error) {
        console.error('❌ Erreur création produit:', error);
        showNotification(`❌ Erreur: ${error.message}`, 'danger');
      }
    });

    // ===== NOTIFICATION HELPER =====
    function showNotification(message, type = 'info') {
      // Utiliser un simple alert ou toast si disponible
      console.log(`[${type.toUpperCase()}]`, message);
      
      // Créer un toast Bootstrap si possible
      const toastHtml = `
        <div class="toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'info'} border-0" role="alert">
          <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
          </div>
        </div>
      `;
      
      const toastContainer = document.createElement('div');
      toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
      toastContainer.style.zIndex = '11';
      toastContainer.innerHTML = toastHtml;
      document.body.appendChild(toastContainer);

      const toast = new bootstrap.Toast(toastContainer.querySelector('.toast'));
      toast.show();

      // Supprimer après disparition
      setTimeout(() => toastContainer.remove(), 5000);
    }

    // Recharger les catégories quand le modal s'ouvre
    const modalElement = document.getElementById('modalProduit');
    if (modalElement) {
      modalElement.addEventListener('show.bs.modal', function() {
        console.log('🎬 Modal ouvert - rechargement des catégories');
        loadCategories();
        // Réinitialiser les champs
        uploadedPhotoUrl = null;
        document.getElementById('formAddProduit').reset();
      });
    }
  })(); // Fin du module
</script>
