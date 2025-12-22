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

          <!-- 3. TYPE PRODUIT + UNITÉ -->
          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <label class="form-label fw-bold">Type Produit <span class="text-danger">*</span></label>
              <select name="typeProduit" id="typeProduit" class="form-select" required>
                <option value="">Choisir type...</option>
              </select>
              <div class="invalid-feedback">Type obligatoire</div>
            </div>
            <div class="col-md-6">
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

          <!-- 4.5. GESTION FIFO/LIFO (Mode de rotation stock) -->
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
