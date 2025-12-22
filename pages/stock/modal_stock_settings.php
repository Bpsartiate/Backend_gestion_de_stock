<!-- MODAL STOCK SETTINGS -->
<div class="modal fade" id="modalStockSettings" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content shadow-xl border-0">

      <!-- HEADER + TABS -->
      <div class="modal-header bg-gradient-primary text-white border-0 position-relative">
        <div class="position-absolute start-0 top-50 translate-middle-y ms-4">
          <i class="fas fa-cubes fa-2x opacity-75"></i>
        </div>
        <ul class="nav nav-tabs nav-tabs-custom flex-fill mx-5" id="stockTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active fw-bold" id="rayons-tab"
                    data-bs-toggle="tab" data-bs-target="#rayons" type="button" role="tab">
              <i class="fas fa-layer-group me-2"></i>Rayons
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link fw-bold" id="produits-tab"
                    data-bs-toggle="tab" data-bs-target="#produits" type="button" role="tab">
              <i class="fas fa-palette me-2"></i>Types Produits
            </button>
          </li>
        </ul>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <!-- BODY -->
      <div class="modal-body py-2">
        <div class="tab-content" id="stockTabsContent">

          <!-- ONGLET RAYONS -->
          <div class="tab-pane fade show active" id="rayons" role="tabpanel" aria-labelledby="rayons-tab">
            <div class="row gy-3 gx-3">

              <!-- PANEL LISTE RAYONS -->
              <div class="col-lg-5">
                <div class="card h-100 shadow-lg border-0">
                  <div class="card-header bg-gradient-info text-white p-3 d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                      <i class="fas fa-layer-group me-2"></i>
                      <h5 class="mb-0 panel-title">Mes Rayons</h5>
                    </div>
                    <div class="d-flex align-items-center">
                      <span class="badge bg-white text-info total-badge me-2" id="totalRayons">0</span>
                      <button class="btn btn-sm btn-light text-info"
                              data-bs-toggle="modal" data-bs-target="#modalCreateRayon" title="Nouveau rayon">
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div class="card-body p-2">
                    <div class="mb-2">
                      <div class="input-group input-group-sm">
                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                        <input type="search" id="searchRayons" class="form-control form-control-sm"
                               placeholder="Rechercher un rayon...">
                      </div>
                    </div>
                    <div class="list-group list-group-flush" id="rayonsList"
                         style="max-height: 50vh; overflow: auto; padding: .25rem;">
                      <!-- Dynamique -->
                    </div>
                  </div>
                  <div class="card-footer bg-light border-0 py-2">
                    <button class="btn btn-outline-primary btn-sm w-100" id="btnCreateRayonFooter">
                      <i class="fas fa-plus me-2"></i>Créer un rayon
                    </button>
                  </div>
                </div>
              </div>

              <!-- PANEL CONFIG RAYON -->
              <div class="col-lg-7">
                <div class="card h-100 shadow-xl border-0">
                  <div class="card-header bg-gradient-warning text-white p-4">
                    <h5 class="mb-0" id="rayonNom">Sélectionnez un rayon</h5>
                    <span class="badge bg-light bg-opacity-20 fs-6" id="rayonStatus"></span>
                  </div>
                  <div class="card-body p-4">
                    <form id="formConfigRayon">
                      <input type="hidden" name="rayonId" id="editRayonId">

                      <!-- 1. INFOS PRINCIPALES -->
                      <div class="row g-3 mb-3">
                        <div class="col-md-6">
                          <label class="form-label fw-bold">Code Rayon <span class="text-danger">*</span></label>
                          <div class="input-group">
                            <span class="input-group-text bg-primary text-white">R</span>
                            <input type="text" class="form-control fw-semibold fs-5 text-uppercase"
                                   name="codeRayon" maxlength="6" placeholder="A001" required>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label fw-bold">Nom Complet</label>
                          <input type="text" class="form-control fw-semibold" name="nomRayon"
                                 placeholder="Rayon Tissus Couleurs Vives">
                        </div>
                      </div>

                      <!-- 2. CAPACITÉS & TYPES -->
                      <div class="row g-3 mb-3">
                        <div class="col-md-4">
                          <label class="form-label">Capacité Max</label>
                          <div class="input-group">
                            <input type="number" class="form-control" name="capaciteMax" value="1000">
                            <span class="input-group-text">unités</span>
                          </div>
                        </div>
                        <div class="col-md-4">
                          <label class="form-label">Type Rayon</label>
                          <select class="form-select" name="typeRayon">
                            <option value="RAYON">📦 Rayon</option>
                            <option value="ETAGERE">📚 Étagère</option>
                            <option value="SOL">📋 Sol</option>
                            <option value="FROID">❄️ Froid</option>
                            <option value="VITRINE">🛍️ Vitrine</option>
                          </select>
                        </div>
                        <div class="col-md-4">
                          <label class="form-label">Statut</label>
                          <select class="form-select" name="status">
                            <option value="1">🟢 Actif</option>
                            <option value="0">🔴 Inactif</option>
                          </select>
                        </div>
                      </div>

                      <!-- 3. COULEURS & THÈMES -->
                      <div class="row g-3 mb-3">
                        <div class="col-md-6">
                          <label class="form-label fw-bold">Couleur Rayon</label>
                          <input type="color" class="form-control form-control-color fw-0"
                                 name="couleurRayon" value="#10b981" title="Choisir couleur">
                          <small class="text-muted">Pour identification visuelle</small>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label fw-bold">Icône</label>
                          <select class="form-select" name="iconeRayon">
                            <option>📦</option>
                            <option>👕</option>
                            <option>💊</option>
                            <option>🍞</option>
                            <option>🔧</option>
                          </select>
                        </div>
                      </div>

                      <!-- 4. TYPES PRODUITS AUTORISÉS -->
                      <div class="mb-3">
                        <label class="form-label fw-bold">Types produits autorisés</label>
                        <div class="row g-2" id="typesProduitsContainer">
                          <!-- Dynamique -->
                        </div>
                      </div>

                      <!-- 5. DESCRIPTION -->
                      <div class="mb-3">
                        <label class="form-label">Description</label>
                        <textarea class="form-control" name="description" rows="2"
                                  placeholder="Localisation physique, consignes spéciales..."></textarea>
                      </div>
                    </form>

                    <!-- KPI RAYON -->
                    <div class="row g-3 mb-2 p-3 bg-light rounded-3">
                      <div class="col-3 text-center">
                        <h4 class="text-success mb-1" id="rayonOccupation">0%</h4>
                        <small>Occupation</small>
                      </div>
                      <div class="col-3 text-center">
                        <h4 class="text-primary mb-1" id="rayonArticles">0</h4>
                        <small>Articles</small>
                      </div>
                      <div class="col-3 text-center">
                        <h4 class="text-warning mb-1" id="rayonAlertes">0</h4>
                        <small>Alertes</small>
                      </div>
                      <div class="col-3 text-center">
                        <h4 class="text-info mb-1" id="rayonCapacite">0/1000</h4>
                        <small>Capacité</small>
                      </div>
                    </div>
                  </div>

                  <div class="card-footer border-0 bg-transparent">
                    <div class="d-flex gap-2">
                      <button class="btn btn-outline-secondary" id="btnAnnulerRayon">Annuler</button>
                      <button class="btn btn-primary" id="btnSauvegarderRayon">Sauvegarder</button>
                      <button class="btn btn-success" id="btnDupliquerRayon">Dupliquer</button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- ONGLET TYPES PRODUITS -->
          <div class="tab-pane fade" id="produits" role="tabpanel" aria-labelledby="produits-tab">
            <div class="row gy-3 gx-3">

              <!-- LISTE TYPES PRODUITS GAUCHE -->
              <div class="col-lg-5">
                <div class="card h-100 shadow-lg border-0">
                  <div class="card-header bg-gradient-info text-white p-3 d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                      <i class="fas fa-layer-group me-2"></i>
                      <h5 class="mb-0 panel-title">Catégories Produits</h5>
                    </div>
                    <span class="badge bg-white text-info total-badge" id="totalCategories">0</span>
                  </div>

                  <div class="card-body p-2">
                    <div class="input-group input-group-sm mb-2">
                      <span class="input-group-text"><i class="fas fa-search"></i></span>
                      <input type="search" id="searchCategories" class="form-control form-control-sm"
                             placeholder="Rechercher une catégorie...">
                    </div>
                    <div class="list-group list-group-flush" id="categoriesList"
                         style="max-height: 55vh; overflow: auto; padding: .25rem;">
                      <!-- Dynamique: Catégories chargées depuis localStorage -->
                    </div>
                  </div>

                  <div class="card-footer bg-light border-0 py-2">
                    <button class="btn btn-outline-primary btn-sm w-100" id="btnAddNewCategory">
                      <i class="fas fa-plus me-2"></i>Ajouter Catégorie
                    </button>
                  </div>
                </div>
              </div>

              <!-- PANEL CONFIG CATÉGORIE DROITE -->
              <div class="col-lg-7">
                <div class="card shadow-lg border-0">
                  <div class="card-header bg-gradient-primary text-white p-4">
                    <h5 class="mb-1" id="editCategoryTitle">Créer une nouvelle catégorie</h5>
                    <small id="editCategorySubtitle">Remplissez les informations ci-dessous</small>
                  </div>

                  <div class="card-body p-4">
                    <form id="formEditCategory">
                      <input type="hidden" id="categoryEditId" value="">

                      <!-- INFOS PRINCIPALES -->
                      <div class="row g-3 mb-4">
                        <div class="col-md-6">
                          <label class="form-label fw-bold">Nom Catégorie <span class="text-danger">*</span></label>
                          <div class="input-group">
                            <span class="input-group-text bg-primary text-white">📦</span>
                            <input type="text" class="form-control fw-semibold" id="catEditNom" 
                                   placeholder="TISSUS, OUTILS, etc." required>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label fw-bold">Code <span class="text-danger">*</span></label>
                          <div class="input-group">
                            <span class="input-group-text bg-info text-white">#</span>
                            <input type="text" class="form-control text-uppercase fw-semibold" id="catEditCode" 
                                   placeholder="TISS" maxlength="4" required>
                          </div>
                        </div>
                      </div>

                      <!-- UNITÉ & ICÔNE & COULEUR -->
                      <div class="row g-3 mb-4">
                        <div class="col-md-4">
                          <label class="form-label fw-bold">Unité <span class="text-danger">*</span></label>
                          <select class="form-select fw-semibold" id="catEditUnite" required>
                            <option value="">Choisir...</option>
                            <option value="mètres">Mètres (m)</option>
                            <option value="kg">Kilogrammes (kg)</option>
                            <option value="boîtes">Boîtes</option>
                            <option value="pièces">Pièces</option>
                            <option value="litres">Litres (L)</option>
                            <option value="grammes">Grammes (g)</option>
                            <option value="ml">Millilitres (ml)</option>
                          </select>
                        </div>
                        <div class="col-md-4">
                          <label class="form-label fw-bold">Icône <span class="text-danger">*</span></label>
                          <select class="form-select fs-3" id="catEditIcone" required>
                            <option value="">Choisir...</option>
                            <option value="📦">📦 Paquet</option>
                            <option value="👕">👕 Vêtement</option>
                            <option value="🔧">🔧 Outil</option>
                            <option value="💊">💊 Santé</option>
                            <option value="🍞">🍞 Aliment</option>
                            <option value="🔌">🔌 Électrique</option>
                            <option value="📚">📚 Document</option>
                            <option value="🛠️">🛠️ Construction</option>
                          </select>
                        </div>
                        <div class="col-md-4">
                          <label class="form-label fw-bold">Couleur</label>
                          <input type="color" class="form-control form-control-color" id="catEditCouleur" 
                                 value="#3b82f6" title="Sélectionner couleur">
                        </div>
                      </div>

                      <!-- SEUILS & CAPACITÉ -->
                      <div class="row g-3 mb-4 p-3 bg-light border-start border-4 border-warning rounded">
                        <div class="col-md-6">
                          <label class="form-label fw-bold text-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>Seuil Alerte (min)
                          </label>
                          <input type="number" class="form-control" id="catEditSeuil" value="5" min="0">
                          <small class="text-muted">Alerte si stock ≤ cette valeur</small>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label fw-bold text-info">
                            <i class="fas fa-box me-2"></i>Capacité Max
                          </label>
                          <input type="number" class="form-control" id="catEditCapacite" value="1000" min="1">
                          <small class="text-muted">Stock maximum permis</small>
                        </div>
                      </div>

                      <!-- CHAMPS PERSONNALISÉS -->
                      <div class="mb-4">
                        <label class="form-label fw-bold d-flex justify-content-between">
                          <span><i class="fas fa-sliders-h me-2"></i>Champs Supplémentaires</span>
                          <button type="button" class="btn btn-sm btn-outline-primary" id="btnAddCustomField">
                            <i class="fas fa-plus me-1"></i>Ajouter
                          </button>
                        </label>

                        <!-- TIPS GUIDING SECTION -->
                        <div class="alert alert-info alert-dismissible fade show mb-3" role="alert">
                          <div class="d-flex align-items-start">
                            <i class="fas fa-lightbulb dark me-3 mt-1" style="font-size: 1.3em; color: #0c63e4;"></i>
                            <div class="flex-grow-1">
                              <strong>Exemples de champs personnalisés:</strong>
                              <div class="mt-2 small">
                                <p class="mb-2"><strong>Pour TISSUS:</strong> Composition (Texte) • Motif (Choix: Uni, Rayé, Carreaux) • Largeur cm (Nombre)</p>
                                <p class="mb-2"><strong>Pour OUTILS:</strong> Marque (Texte) • Type d'énergie (Choix: Électrique, Batterie, Manuel) • Garantie ans (Nombre)</p>
                                <p class="mb-0"><strong>Pour ALIMENTS:</strong> Allergènes (Texte) • DLC (Date) • Température (Choix: Ambiant, Froid, Congélé)</p>
                              </div>
                            </div>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fermer"></button>
                          </div>
                        </div>

                        <div id="customFieldsContainer" class="space-y-2">
                          <!-- Champs supplémentaires ajoutés dynamiquement -->
                        </div>
                      </div>

                      <!-- CONFIGURATIONS -->
                      <div class="form-check mb-4 p-3 bg-warning bg-opacity-10 rounded border border-warning">
                        <input class="form-check-input" type="checkbox" id="catEditPhotoRequired" checked>
                        <label class="form-check-label fw-semibold" for="catEditPhotoRequired">
                          <i class="fas fa-camera me-2 text-warning"></i>Photo OBLIGATOIRE à chaque entrée stock
                        </label>
                        <small class="text-muted d-block mt-1 ms-4">Chaque ajout de stock pour cette catégorie devra avoir une photo</small>
                      </div>

                      <!-- BOUTONS ACTION -->
                      <div class="d-flex gap-2">
                        <button type="button" class="btn btn-outline-secondary" id="btnCancelEditCategory">
                          <i class="fas fa-times me-2"></i>Annuler
                        </button>
                        <button type="submit" class="btn btn-primary flex-grow-1">
                          <i class="fas fa-save me-2"></i>Sauvegarder Catégorie
                        </button>
                        <button type="button" class="btn btn-outline-danger" id="btnDeleteCategory" style="display:none;">
                          <i class="fas fa-trash me-2"></i>Supprimer
                        </button>
                      </div>
                    </form>

                    <!-- KPI CATÉGORIE -->
                    <div id="categoryKPI" class="row g-3 mt-4 p-3 bg-light rounded-3" style="display:none;">
                      <div class="col-3 text-center border-end">
                        <h5 class="text-success mb-1" id="kpiStock">0</h5>
                        <small class="text-muted">En Stock</small>
                      </div>
                      <div class="col-3 text-center border-end">
                        <h5 class="text-warning mb-1" id="kpiAlertes">0</h5>
                        <small class="text-muted">Alertes</small>
                      </div>
                      <div class="col-3 text-center border-end">
                        <h5 class="text-info mb-1" id="kpiArticles">0</h5>
                        <small class="text-muted">Articles</small>
                      </div>
                      <div class="col-3 text-center">
                        <h5 class="text-primary mb-1" id="kpiValeur">0€</h5>
                        <small class="text-muted">Valeur</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <!-- FOOTER -->
      <div class="modal-footer bg-light">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
      </div>

    </div>
  </div>
</div>


  <style>
    /* ===== ANIMATIONS FLUIDES ===== */
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes slideInTab { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideInItem { from { opacity: 0; transform: translateX(-15px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* ===== GÉNÉRAL ===== */
    #btnSettingsStock { transition: all 0.3s ease; }
    #btnSettingsStock:hover { transform: scale(1.1); box-shadow: 0 6px 16px rgba(0,0,0,0.2); }

    /* ===== PANELS & CARDS ===== */
    .panel-title { font-weight: 700; font-size: 1rem; margin: 0; }
    .total-badge { 
      font-weight: 700; 
      padding: .35rem .55rem; 
      border-radius: .6rem; 
      animation: pulse 2s infinite;
    }
    .card { animation: slideDown 0.3s ease-out; }

    /* ===== LIST ITEMS AVEC ANIMATIONS ===== */
    #rayonsList .list-group-item, 
    #typesList .list-group-item {
      padding: .45rem .6rem; 
      border: 0; 
      border-bottom: 1px solid rgba(0,0,0,0.04);
      transition: all 0.2s ease;
      cursor: pointer;
      animation: slideInItem 0.3s ease-out;
    }
    
    #rayonsList .list-group-item:hover, 
    #typesList .list-group-item:hover {
      background-color: rgba(0,0,0,0.05);
      transform: translateX(4px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    #rayonsList .list-group-item.active, 
    #typesList .list-group-item.active {
      background-color: #e8f5ff;
      border-left: 4px solid #0084ff;
      padding-left: calc(.6rem - 4px);
      font-weight: 600;
    }

    /* ===== SEARCH INPUTS ===== */
    #searchRayons { 
      height: 34px; 
      transition: all 0.2s ease;
    }
    #searchRayons:focus { 
      box-shadow: 0 0 0 3px rgba(0,84,255,0.1);
    }

    /* ===== TABS ANIMATION FLUIDE ===== */
    .nav-tabs-custom .nav-link {
      position: relative;
      transition: all 0.3s ease;
      border: none;
      color: #6b7280;
    }
    
    .nav-tabs-custom .nav-link::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #3b82f6, #10b981);
      transform: scaleX(0);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 3px;
      transform-origin: center;
    }
    
    .nav-tabs-custom .nav-link:hover {
      color: #1f2937;
    }
    
    .nav-tabs-custom .nav-link.active {
      color: #1f2937;
      background-color: transparent;
    }
    
    .nav-tabs-custom .nav-link.active::after {
      transform: scaleX(1);
    }

    /* ===== TAB PANE ANIMATION ===== */
    .tab-pane {
      animation: fadeIn 0.4s ease-out;
    }

    /* ===== FORM INPUTS ANIMATION ===== */
    .form-control, .form-select {
      transition: all 0.2s ease;
    }

    .form-control:focus, .form-select:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    /* ===== COLOR PICKER ===== */
    .form-control-color {
      cursor: pointer;
      border: 2px solid #e5e7eb;
      border-radius: 0.375rem;
      transition: all 0.2s ease;
    }

    .form-control-color:hover {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    /* ===== BUTTONS ANIMATION ===== */
    .btn {
      transition: all 0.2s ease;
    }

    .btn:active {
      transform: scale(0.98);
    }

    /* ===== MODAL SPACING ===== */
    .modal-body { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
    .modal-body .tab-pane { padding-top: 0 !important; padding-bottom: 0 !important; }
    .modal-header { padding-bottom: .5rem; }
    .nav-tabs-custom { margin-bottom: .5rem; }
    .card-footer { margin-top: 0 !important; padding-top: .65rem; padding-bottom: .65rem; }

    /* ===== TABLEAU CATÉGORIES ===== */
    #categoriesTableBody tr {
      animation: slideInItem 0.3s ease-out;
      transition: all 0.2s ease;
    }

    #categoriesTableBody tr:hover {
      background-color: rgba(59, 130, 246, 0.05);
      transform: scale(1.01);
    }

    #categoriesTableBody input[type="text"],
    #categoriesTableBody input[type="number"],
    #categoriesTableBody input[type="color"],
    #categoriesTableBody select {
      height: 32px;
      font-size: 0.85rem;
      padding: 0.25rem 0.5rem;
    }

    #categoriesTableBody input[type="color"] {
      cursor: pointer;
      border: 1px solid #d1d5db;
    }

    #categoriesTableBody .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
    }

    .table-responsive {
      border-radius: 0.375rem;
      border: 1px solid #e5e7eb;
    }

    .table th {
      background-color: #f9fafb;
      color: #374151;
      font-weight: 600;
      border-color: #d1d5db;
    }

    .table td {
      padding: 0.5rem;
      border-color: #e5e7eb;
      vertical-align: middle;
    }
  </style>

  <script>
    console.log('🎬 Script modal_stock_settings.php chargé et exécuté');
    
    // ===== GESTION CATÉGORIES VIA API =====
    let allCategories = [];
    let currentEditingCategoryId = null;
    let currentMagasinId = null; // À récupérer de la session
    let categoriesLoaded = false; // Flag pour tracker si les catégories ont été chargées
    
    // Utiliser window.API_BASE s'il est défini, sinon utiliser l'URL de production
    const API_BASE = typeof window.API_BASE !== 'undefined' && window.API_BASE 
      ? window.API_BASE + '/api/protected'
      : 'https://backend-gestion-de-stock.onrender.com/api/protected';

    // ✅ Helper pour obtenir le token d'authentification
    function getAuthToken() {
      // Chercher le token dans localStorage - PRIORITÉ À 'token' (clé utilisée par login.php)
      let token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      // Fallback: chercher dans sessionStorage
      if (!token) {
        token = sessionStorage.getItem('token') || sessionStorage.getItem('authToken');
      }
      
      // Fallback: chercher dans les cookies
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

      if (!token) {
        console.warn('⚠️ Aucun token d\'authentification trouvé');
        console.log('localStorage keys:', Object.keys(localStorage));
      }
      return token || '';
    }

    // Afficher une notification de chargement
    function showLoading(show = true) {
      const listContainer = document.getElementById('categoriesList');
      let loader = document.getElementById('categoriesLoader');
      
      if (show) {
        // Vider la liste et afficher le spinner
        listContainer.innerHTML = '';
        loader = document.createElement('div');
        loader.id = 'categoriesLoader';
        loader.className = 'text-center py-5';
        loader.innerHTML = `
          <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Chargement...</span>
          </div>
          <p class="text-muted mt-2">
            <i class="fas fa-sync-alt fa-spin me-2"></i>Chargement des catégories...
          </p>
        `;
        listContainer.appendChild(loader);
      } else if (!show && loader) {
        loader.remove();
      }
    }

    // Afficher les notifications Toast
    function showNotification(message, type = 'info') {
      const alertDiv = document.createElement('div');
      alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
      alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
      alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.body.appendChild(alertDiv);
      setTimeout(() => alertDiv.remove(), 4000);
    }

    // Charger les catégories depuis l'API
    async function loadCategoriesModal() {
      console.log('🔵🔵🔵 DÉBUT loadCategoriesModal() | currentMagasinId:', currentMagasinId);
      
      if (!currentMagasinId) {
        console.warn('⚠️ magasinId non défini');
        const listContainer = document.getElementById('categoriesList');
        listContainer.innerHTML = `
          <div class="alert alert-warning p-3 m-2 mb-0" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>Magasin non sélectionné</strong>
            <p class="mb-0 small mt-1">Veuillez d'abord sélectionner un magasin depuis le menu déroulant</p>
          </div>
        `;
        return;
      }

      try {
        showLoading(true);
        const authToken = getAuthToken();
        console.log('🔐 Token obtenu | Token:', authToken ? '✅ Présent' : '❌ Absent');
        const response = await fetch(`${API_BASE}/magasins/${currentMagasinId}/categories`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        });

        console.log('📡 Réponse API | Status:', response.status, '| OK:', response.ok);
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📥 Données reçues:', data);
        allCategories = data.categories || [];
        console.log('✅ allCategories mis à jour | Longueur:', allCategories.length);
        renderCategoriesList();
        updateCategoriesCount();
        showLoading(false);
      } catch (error) {
        console.error('❌ Erreur chargement catégories:', error);
        showLoading(false);
        
        // Afficher l'erreur dans la liste
        const listContainer = document.getElementById('categoriesList');
        listContainer.innerHTML = `
          <div class="alert alert-danger p-3 m-2 mb-0" role="alert">
            <i class="fas fa-circle-exclamation me-2"></i>
            <strong>Erreur de chargement</strong>
            <p class="mb-0 small mt-1">${error.message}</p>
            <button class="btn btn-sm btn-outline-danger mt-2" onclick="loadCategoriesModal()">
              <i class="fas fa-redo me-1"></i>Réessayer
            </button>
          </div>
        `;
        
        // Toast pour alerter l'utilisateur
        showNotification('❌ Impossible de charger les catégories', 'danger');
      }
    }

    // Afficher la liste des catégories
    function renderCategoriesList() {
      const list = document.getElementById('categoriesList');
      list.innerHTML = '';

      console.log('📋 renderCategoriesList - allCategories:', allCategories);

      if (allCategories.length === 0) {
        list.innerHTML = '<div class="text-muted text-center py-4"><i class="fas fa-inbox me-2"></i>Aucune catégorie</div>';
        return;
      }

      allCategories.forEach((cat, idx) => {
        console.log(`📦 Catégorie ${idx}:`, cat);
        const item = document.createElement('button');
        item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        item.type = 'button';
        // ✅ Utiliser les noms du modèle TypeProduit: nomType, unitePrincipale, seuilAlerte, icone
        item.innerHTML = `
          <div class="text-start">
            <div class="fw-bold"><span style="font-size:1.2em;">${cat.icone || '📦'}</span> ${cat.nomType || cat.nom}</div>
            <small class="text-muted">${cat.code} • ${cat.unitePrincipale || cat.unite}</small>
          </div>
          <div>
            <span class="badge bg-info">${cat.seuilAlerte || cat.seuil}</span>
          </div>
        `;
        item.addEventListener('click', () => editCategory(idx));
        list.appendChild(item);
      });
    }

    // Créer une nouvelle catégorie
    function newCategory() {
      currentEditingCategoryId = null;
      document.getElementById('categoryEditId').value = '';
      document.getElementById('formEditCategory').reset();
      document.getElementById('catEditCouleur').value = '#3b82f6';
      document.getElementById('catEditSeuil').value = '5';
      document.getElementById('catEditCapacite').value = '1000';
      document.getElementById('catEditPhotoRequired').checked = true;
      document.getElementById('customFieldsContainer').innerHTML = '';
      document.getElementById('categoryKPI').style.display = 'none';
      document.getElementById('btnDeleteCategory').style.display = 'none';
      document.getElementById('editCategoryTitle').textContent = 'Créer une nouvelle catégorie';
      document.getElementById('editCategorySubtitle').textContent = 'Remplissez les informations ci-dessous';
      
      // Déselectionner les items
      document.querySelectorAll('#categoriesList .list-group-item').forEach(item => {
        item.classList.remove('active');
      });

      document.getElementById('catEditNom').focus();
    }

    // Éditer une catégorie existante
    function editCategory(idx) {
      const cat = allCategories[idx];
      console.log('📝 Édition catégorie idx:', idx);
      console.log('📝 Catégorie complète:', cat);
      currentEditingCategoryId = idx;
      
      document.getElementById('categoryEditId').value = cat._id;
      console.log('📝 Remplissage formulaire...');
      console.log('  - _id:', cat._id);
      console.log('  - nomType/nom:', cat.nomType, cat.nom);
      console.log('  - code:', cat.code);
      console.log('  - unitePrincipale/unite:', cat.unitePrincipale, cat.unite);
      console.log('  - icone:', cat.icone);
      console.log('  - couleur:', cat.couleur);
      console.log('  - seuilAlerte/seuil:', cat.seuilAlerte, cat.seuil);
      console.log('  - capaciteMax/capacite:', cat.capaciteMax, cat.capacite);
      console.log('  - photoRequise:', cat.photoRequise);
      
      // ✅ Utiliser les noms du modèle TypeProduit
      document.getElementById('catEditNom').value = cat.nomType || cat.nom || '';
      document.getElementById('catEditCode').value = cat.code || '';
      document.getElementById('catEditUnite').value = cat.unitePrincipale || cat.unite || '';
      document.getElementById('catEditIcone').value = cat.icone || '';
      document.getElementById('catEditCouleur').value = cat.couleur || '#3b82f6';
      document.getElementById('catEditSeuil').value = cat.seuilAlerte || cat.seuil || 5;
      document.getElementById('catEditCapacite').value = cat.capaciteMax || cat.capacite || 1000;
      document.getElementById('catEditPhotoRequired').checked = cat.photoRequise !== false;
      
      document.getElementById('editCategoryTitle').textContent = `Éditer: ${cat.nomType || cat.nom}`;
      document.getElementById('editCategorySubtitle').textContent = `Code ${cat.code} • ${cat.unitePrincipale || cat.unite}`;
      document.getElementById('btnDeleteCategory').style.display = 'inline-block';
      document.getElementById('categoryKPI').style.display = 'grid';

      // Afficher les KPI (données depuis la base)
      document.getElementById('kpiStock').textContent = (cat.stock || 0);
      document.getElementById('kpiAlertes').textContent = (cat.alertes || 0);
      document.getElementById('kpiArticles').textContent = (cat.articles || 0);
      document.getElementById('kpiValeur').textContent = (cat.valeur || 0) + '€';

      // Marquer l'item comme actif
      document.querySelectorAll('#categoriesList .list-group-item').forEach(item => {
        item.classList.remove('active');
      });
      document.querySelectorAll('#categoriesList .list-group-item')[idx]?.classList.add('active');
    }

    // Sauvegarder ou créer une catégorie via API
    async function saveCategory(e) {
      e.preventDefault();

      const nom = document.getElementById('catEditNom').value.trim();
      const code = document.getElementById('catEditCode').value.trim().toUpperCase();
      const unite = document.getElementById('catEditUnite').value;
      const icone = document.getElementById('catEditIcone').value;
      const couleur = document.getElementById('catEditCouleur').value;
      const seuil = parseInt(document.getElementById('catEditSeuil').value) || 5;
      const capacite = parseInt(document.getElementById('catEditCapacite').value) || 1000;
      const photoRequired = document.getElementById('catEditPhotoRequired').checked;

      // Validation
      if (!nom || !code || !unite || !icone) {
        showNotification('⚠️ Veuillez remplir tous les champs obligatoires', 'warning');
        return;
      }

      // Collecter les champs personnalisés
      const champsSupplementaires = [];
      document.querySelectorAll('#customFieldsContainer .row').forEach(row => {
        const fieldName = row.querySelector('input[placeholder*="Nom"]')?.value;
        const fieldType = row.querySelector('select')?.value;
        const fieldOptions = row.querySelector('input[placeholder*="Options"]')?.value;
        if (fieldName) {
          champsSupplementaires.push({
            nomChamp: fieldName,
            typeChamp: fieldType,
            optionsChamp: fieldOptions ? fieldOptions.split(',').map(o => o.trim()) : []
          });
        }
      });

      // ✅ MAPPER LES NOMS DE CHAMPS POUR CORRESPONDRE AU MODÈLE TypeProduit
      const categoryData = {
        nomType: nom,                              // nom → nomType
        code: code,
        unitePrincipale: unite,                    // unite → unitePrincipale
        icone: icone,
        couleur: couleur,
        seuilAlerte: seuil,                        // seuil → seuilAlerte
        capaciteMax: capacite,                     // capacite → capaciteMax
        photoRequise: photoRequired,               // photoRequired → photoRequise
        champsSupplementaires: champsSupplementaires // customFields → champsSupplementaires
      };

      try {
        const isNew = currentEditingCategoryId === null;
        const method = isNew ? 'POST' : 'PUT';
        const categoryId = isNew ? '' : allCategories[currentEditingCategoryId]._id;
        const url = isNew 
          ? `${API_BASE}/magasins/${currentMagasinId}/categories`
          : `${API_BASE}/categories/${categoryId}`;

        const authToken = getAuthToken();
        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(categoryData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 401) {
            throw new Error('⚠️ Authentification expirée. Veuillez vous reconnecter.');
          }
          throw new Error(errorData.error || `Erreur API: ${response.status}`);
        }

        const result = await response.json();
        showNotification(`✅ Catégorie "${nom}" ${isNew ? 'créée' : 'modifiée'} avec succès!`, 'success');
        
        // Recharger la liste
        await loadCategoriesModal();
        newCategory();
      } catch (error) {
        console.error('❌ Erreur sauvegarde:', error);
        showNotification(`❌ Erreur: ${error.message}`, 'danger');
      }
    }

    // Supprimer une catégorie via API
    async function deleteCategory() {
      if (currentEditingCategoryId === null) return;

      const cat = allCategories[currentEditingCategoryId];
      const nom = cat.nomType || cat.nom;  // ✅ Utiliser nomType
      
      if (confirm(`⚠️ Êtes-vous sûr de vouloir supprimer "${nom}" ?`)) {
        try {
          const authToken = getAuthToken();
          const response = await fetch(`${API_BASE}/categories/${cat._id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });

          if (!response.ok) {
            if (response.status === 401) {
              throw new Error('⚠️ Authentification expirée. Veuillez vous reconnecter.');
            }
            throw new Error(`Erreur API: ${response.status}`);
          }

          showNotification(`✅ Catégorie "${nom}" supprimée!`, 'success');
          await loadCategoriesModal();
          newCategory();
        } catch (error) {
          console.error('❌ Erreur suppression:', error);
          showNotification(`❌ Erreur: ${error.message}`, 'danger');
        }
      }
    }

    // Filtrer la liste
    function filterCategories(query) {
      const list = document.getElementById('categoriesList');
      const items = list.querySelectorAll('.list-group-item:not(#categoriesLoader)');
      const q = query.toLowerCase();

      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? '' : 'none';
      });
    }

    // Mettre à jour le compteur
    function updateCategoriesCount() {
      document.getElementById('totalCategories').textContent = allCategories.length;
    }

    // Initialiser au chargement
    document.addEventListener('DOMContentLoaded', function() {
      console.log('🚀 DOMContentLoaded déclenché dans modal_stock_settings.php');
      
      // Essayer plusieurs façons de récupérer le magasinId
      // 1. D'abord chercher dans sessionStorage
      currentMagasinId = sessionStorage.getItem('currentMagasinId');
      console.log('📦 sessionStorage.getItem("currentMagasinId"):', currentMagasinId);
      
      // 2. Si vide, chercher dans la configuration globale stockConfig
      if (!currentMagasinId && typeof window.stockConfig !== 'undefined') {
        currentMagasinId = window.stockConfig.magasinId;
        console.log('📦 window.stockConfig.magasinId:', currentMagasinId);
      }
      
      // 3. Si toujours vide, chercher dans localStorage
      if (!currentMagasinId) {
        currentMagasinId = localStorage.getItem('currentMagasinId');
        console.log('📦 localStorage.getItem("currentMagasinId"):', currentMagasinId);
      }
      
      console.log('📦 currentMagasinId final:', currentMagasinId);
      
      if (currentMagasinId) {
        console.log('✅ currentMagasinId existe, appel de loadCategoriesModal()');
        loadCategoriesModal();
      } else {
        console.warn('⚠️ currentMagasinId est vide/null - categories ne seront pas chargées');
      }

      // Événements
      document.getElementById('btnAddNewCategory').addEventListener('click', newCategory);
      document.getElementById('formEditCategory').addEventListener('submit', saveCategory);
      document.getElementById('btnDeleteCategory').addEventListener('click', deleteCategory);
      document.getElementById('btnCancelEditCategory').addEventListener('click', newCategory);
      document.getElementById('searchCategories').addEventListener('input', (e) => {
        filterCategories(e.target.value);
      });

      // Gestion champs personnalisés
      document.getElementById('btnAddCustomField').addEventListener('click', function() {
        const container = document.getElementById('customFieldsContainer');
        const field = document.createElement('div');
        field.className = 'row g-2 mb-2 p-2 border rounded bg-white';
        field.innerHTML = `
          <div class="col-md-3">
            <input type="text" class="form-control form-control-sm" placeholder="Nom du champ">
          </div>
          <div class="col-md-3">
            <select class="form-select form-select-sm">
              <option value="text">Texte</option>
              <option value="number">Nombre</option>
              <option value="date">Date</option>
              <option value="select">Choix</option>
            </select>
          </div>
          <div class="col-md-5">
            <input type="text" class="form-control form-control-sm" placeholder="Options (virgule séparées)">
          </div>
          <div class="col-md-1">
            <button type="button" class="btn btn-sm btn-outline-danger">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `;
        field.querySelector('button').addEventListener('click', () => field.remove());
        container.appendChild(field);
      });

      // Recherche rayons (existant)
      const searchInput = document.getElementById('searchRayons');
      if(searchInput) {
        searchInput.addEventListener('input', function(e) {
          const q = (e.target.value || '').trim().toLowerCase();
          const list = document.getElementById('rayonsList');
          if(!list) return;
          const items = list.querySelectorAll('.list-group-item');
          items.forEach(li => {
            const text = li.textContent.trim().toLowerCase();
            li.style.display = q === '' || text.indexOf(q) !== -1 ? '' : 'none';
          });
        });
      }

      // Listener pour mettre à jour magasinId quand le modal est ouvert
      const modalElement = document.getElementById('modalStockSettings');
      if (modalElement) {
        modalElement.addEventListener('show.bs.modal', function() {
          console.log('🎬 Modal show.bs.modal déclenché');
          
          // Essayer plusieurs sources pour le magasinId
          let newMagasinId = sessionStorage.getItem('currentMagasinId');
          if (!newMagasinId && typeof window.stockConfig !== 'undefined') {
            newMagasinId = window.stockConfig.magasinId;
          }
          if (!newMagasinId) {
            newMagasinId = localStorage.getItem('currentMagasinId');
          }
          
          console.log('📦 newMagasinId du modal:', newMagasinId, '| currentMagasinId:', currentMagasinId);
          if (newMagasinId && newMagasinId !== currentMagasinId) {
            console.log('✅ Changement de magasin détecté, appel de loadCategoriesModal()');
            currentMagasinId = newMagasinId;
            categoriesLoaded = false; // Reset flag quand on change de magasin
            loadCategoriesModal();
          } else if (!newMagasinId) {
            console.warn('⚠️ newMagasinId vide - magasin non trouvé');
          } else {
            console.log('ℹ️ Même magasin, pas de rechargement');
          }
        });
      }

      // ✨ IMPORTANT: Charger les catégories quand on clique sur l'onglet "Types Produits"
      const produitsTab = document.getElementById('produits-tab');
      if (produitsTab) {
        produitsTab.addEventListener('click', function() {
          console.log('📌 Onglet "Types Produits" cliqué | categoriesLoaded:', categoriesLoaded, '| currentMagasinId:', currentMagasinId);
          if (!categoriesLoaded && currentMagasinId) {
            console.log('🔄 Premier accès à l\'onglet, appel de loadCategoriesModal()');
            console.log('🔍 Type de loadCategoriesModal:', typeof loadCategoriesModal);
            console.log('🔍 Fonction loadCategoriesModal:', loadCategoriesModal);
            try {
              const result = loadCategoriesModal();
              console.log('🔍 Résultat de loadCategoriesModal():', result);
            } catch (e) {
              console.error('❌ ERREUR lors de l\'appel de loadCategoriesModal():', e);
            }
            categoriesLoaded = true;
          }
        });
      }
    });
  </script>
