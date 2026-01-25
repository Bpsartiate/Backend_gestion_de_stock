<!-- MODAL STOCK SETTINGS -->
<div class="modal fade" id="modalStockSettings" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content shadow-xl border-0">

      <!-- HEADER + TABS -->
      <div class="modal-header  text-white border-0 position-relative">
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
                <div class="card h-100 shadow-lg border-0 overflow-hidden">
                  <div class="card-header overflow-hidden p-3 d-flex justify-content-between align-items-center position-relative">
                    <div class="bg-holder bg-card" style="background-image:url(../assets/img/icons/spot-illustrations/corner-1.png);"></div>
                    <div class="d-flex align-items-center position-relative" style="z-index: 1;">
                      <i class="fas fa-layer-group me-2 text-info"></i>
                      <h5 class="mb-0 panel-title text-dark fw-bold">Mes Rayons</h5>
                    </div>
                    <div class="d-flex align-items-center gap-2 position-relative" style="z-index: 1;">
                      <span class="badge bg-info text-white total-badge" id="totalRayons">0</span>
                      <button type="button" class="btn btn-sm btn-success text-white"
                              onclick="newRayon()" title="Ajouter un nouveau rayon">
                        <i class="fas fa-plus-circle me-1"></i>Nouveau
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
                  <div class="card-footer border-0 bg-transparent">
                    <!-- Les boutons sont dans le header et le formulaire -->
                  </div>
                </div>
              </div>

              <!-- PANEL CONFIG RAYON -->
              <div class="col-lg-7">
                <div class="card h-100 shadow-xl border-0 overflow-hidden">
                  <div class="card-header overflow-hidden p-4 position-relative">
                    <div class="bg-holder bg-card" style="background-image:url(../assets/img/icons/spot-illustrations/corner-4.png);"></div>
                    <div class="position-relative d-flex flex-wrap flex-between-center align-items-center" style="z-index: 1;">
                      <h5 class="mb-2 text-dark fw-bold" id="rayonNom">Sélectionnez un rayon</h5>
                      <span class="badge bg-warning text-dark fs-6 fw-semi-bold" id="rayonStatus"></span>
                    </div>
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
                        <label class="form-label fw-bold d-flex justify-content-between">
                          <span>Types produits autorisés</span>
                          <small class="text-muted fw-normal">(Sélectionner les catégories permises)</small>
                        </label>

                        <!-- Mode SÉLECTION (Création) -->
                        <div id="selectionMode" class="p-3 bg-light rounded" style="columns: 2; column-gap: 1rem;">
                          <!-- Rempli dynamiquement par populateTypesProduitsContainer() -->
                        </div>

                        <!-- Mode LISTE (Édition) -->
                        <div id="listMode" class="p-3 bg-light rounded" style="display:none;">
                          <div id="selectedTypesList" class="d-flex flex-wrap gap-2">
                            <!-- Rempli dynamiquement par editRayon() -->
                          </div>
                          <button type="button" id="btnModifyTypes" class="btn btn-sm btn-outline-primary mt-3">
                            <i class="fas fa-edit me-2"></i>Modifier les catégories
                          </button>
                        </div>

                        <small class="text-muted d-block mt-2">Aucune sélection = tous les types autorisés</small>
                      </div>

                      <!-- 5. DESCRIPTION -->
                      <div class="mb-3">
                        <label class="form-label">Description / Localisation</label>
                        <textarea class="form-control" name="description" rows="2"
                                  placeholder="Ex: Coin sud-est du magasin, près des escaliers..."></textarea>
                      </div>

                      <!-- BOUTONS ACTION (DANS LE FORMULAIRE) -->
                      <div class="d-flex gap-2 mt-4">
                        <button type="button" class="btn btn-outline-secondary" id="btnAnnulerRayon">Annuler</button>
                        <button type="submit" class="btn btn-primary">Sauvegarder</button>
                        <button type="button" class="btn btn-outline-danger" id="btnDeleteRayon" style="display:none;">
                          <i class="fas fa-trash me-2"></i>Supprimer
                        </button>
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

                    <!-- DÉTAIL DES STOCKS (Type SIMPLE et LOT) -->
                    <div class="mt-4">
                      <h6 class="fw-bold mb-3 text-dark">
                        <i class="fas fa-box me-2 text-primary"></i>Détail des Produits en Stock
                      </h6>
                      
                      <!-- Conteneur pour les stocks SIMPLE -->
                      <div id="detailStocksSimple" class="mb-4">
                        <!-- Rempli dynamiquement -->
                      </div>

                      <!-- Conteneur pour les stocks LOT -->
                      <div id="detailStocksLot" class="mb-4">
                        <!-- Rempli dynamiquement -->
                      </div>

                      <!-- Message vide -->
                      <div id="detailStocksEmpty" class="alert alert-info alert-sm py-2 px-3">
                        <i class="fas fa-info-circle me-2"></i>Sélectionnez un rayon pour voir les détails des stocks
                      </div>
                    </div>
                  </div>

                  <div class="card-footer border-0 bg-transparent">
                    <!-- Les boutons sont maintenant dans le formulaire -->
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
                <div class="card h-100 shadow-lg border-0 overflow-hidden">
                  <div class="card-header overflow-hidden p-3 d-flex justify-content-between align-items-center position-relative">
                    <div class="bg-holder bg-card" style="background-image:url(../assets/img/icons/spot-illustrations/corner-2.png);"></div>
                    <div class="d-flex align-items-center position-relative" style="z-index: 1;">
                      <i class="fas fa-layer-group me-2 text-info"></i>
                      <h5 class="mb-0 panel-title text-dark fw-bold">Catégories Produits</h5>
                    </div>
                    <div class="d-flex align-items-center gap-2 position-relative" style="z-index: 1;">
                      <span class="badge bg-info text-white total-badge" id="totalCategories">0</span>
                      <button type="button" class="btn btn-sm btn-success text-white" id="btnAddNewCategory" title="Ajouter une nouvelle catégorie">
                        <i class="fas fa-plus-circle me-1"></i>Nouveau
                      </button>
                    </div>
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
                </div>
              </div>

              <!-- PANEL CONFIG CATÉGORIE DROITE -->
              <div class="col-lg-7">
                <div class="card shadow-lg border-0 overflow-hidden">
                  <div class="card-header overflow-hidden p-4 position-relative">
                    <div class="bg-holder bg-card" style="background-image:url(../assets/img/icons/spot-illustrations/corner-3.png);"></div>
                    <div class="position-relative" style="z-index: 1;">
                      <h5 class="mb-1 text-dark fw-bold" id="editCategoryTitle">Créer une nouvelle catégorie</h5>
                      <small class="text-muted" id="editCategorySubtitle">Remplissez les informations ci-dessous</small>
                    </div>
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

                      <!-- ICÔNE & COULEUR -->
                      <div class="row g-3 mb-4">
                        <div class="col-md-6">
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
                        <div class="col-md-6">
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

                      <!-- ✨ NOUVEAU: TYPE DE STOCKAGE ET UNITÉS DE VENTE -->
                      <div class="mb-4 p-3 bg-info bg-opacity-10 border border-info rounded">
                        <label class="form-label fw-bold d-flex justify-content-between align-items-center">
                          <span>
                            <i class="fas fa-layer-group me-2 text-info"></i>Type de Stockage
                            <a href="javascript:void(0)" class="btn btn-link p-0 ms-2" data-bs-toggle="tooltip" title="SIMPLE: Viande, Riz (1 unité). LOT: Rouleaux, Cartons (track individuel chaque pièce)">
                              <i class="fas fa-question-circle text-info"></i>
                            </a>
                          </span>
                        </label>

                        <!-- Type Stockage -->
                        <div class="mb-3">
                          <label class="form-label fw-semibold">Type de Stockage</label>
                          <select id="catEditTypeStockage" class="form-select" required>
                            <option value="simple">SIMPLE (Viande, Riz, Sucre, etc)</option>
                            <option value="lot">LOT (Rouleaux, Cartons, Boîtes, etc)</option>
                          </select>
                          <small class="text-muted">
                            <strong>SIMPLE:</strong> Produits simples avec une unité (kg, litres)<br>
                            <strong>LOT:</strong> Produits complexes, track chaque pièce individuellement
                          </small>
                        </div>

                        <!-- Unité Principale de Stockage -->
                        <div class="mb-3">
                          <label class="form-label fw-semibold">Unité Principale de Stockage <span class="text-danger">*</span></label>
                          <input type="text" class="form-control" id="catEditUnitePrincipale" 
                                 placeholder="Ex: KILOGRAMME, PIÈCE, ROULEAU, LITRE" required>
                          <small class="text-muted">L'unité dans laquelle vous stockez physiquement</small>
                        </div>

                        <!-- Unités de Vente (seulement pour LOT) -->
                        <div id="unitesVenteContainer" style="display: none;">
                          <label class="form-label fw-semibold">Unités de Vente 
                            <span class="text-muted">(pour type LOT)</span>
                          </label>
                          <div id="unitesVenteList" class="mb-2 p-2 border rounded bg-white">
                            <!-- Rempli dynamiquement -->
                          </div>
                          <button type="button" class="btn btn-sm btn-outline-info" id="btnAddUniteVente">
                            <i class="fas fa-plus me-1"></i>Ajouter Unité de Vente
                          </button>
                          <small class="text-muted d-block mt-2">
                            Ex: Pour rouleaux → PIÈCE et MÈTRE
                          </small>
                        </div>
                      </div>

                      <!-- CHAMPS PERSONNALISÉS -->
                      <div class="mb-4">
                        <label class="form-label fw-bold d-flex justify-content-between align-items-center">
                          <span>
                            <i class="fas fa-sliders-h me-2"></i>Champs Supplémentaires
                            <a href="javascript:void(0)" class="btn btn-link p-0 ms-2" data-bs-toggle="popover" data-bs-trigger="hover" title="💡 Conseil" data-bs-content="Les champs supplémentaires vous permettent d'ajouter des informations spécifiques à chaque catégorie. Exemples: composition, marque, allergènes, etc." style="font-size: 1.2em;">
                              <i class="fas fa-info-circle" style="animation: bounce 1s infinite; color: #0c63e4;"></i>
                            </a>
                          </span>
                          <button type="button" class="btn btn-sm btn-outline-primary" id="btnAddCustomField">
                            <i class="fas fa-plus me-1"></i>Ajouter
                          </button>
                        </label>

                       

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

                    <!-- KPI CATÉGORIE - DESIGN PROFESSIONNEL -->
                    <div id="categoryKPI" class="row g-2 mt-4" style="display:none;">
                      <!-- KPI En Stock -->
                      <div class="col-6 col-md-3">
                        <div class="kpi-card bg-gradient-success">
                          <div class="kpi-header">
                            <i class="fas fa-box-open"></i>
                          </div>
                          <div class="kpi-body">
                            <h3 id="kpiStock" class="kpi-value">0</h3>
                            <div class="kpi-change">
                              <span class="badge bg-success bg-opacity-20 text-success" id="kpiStockChange">
                                <i class="fas fa-arrow-up"></i> +0
                              </span>
                            </div>
                            <small class="kpi-label">En Stock</small>
                          </div>
                        </div>
                      </div>

                      <!-- KPI Alertes -->
                      <div class="col-6 col-md-3">
                        <div class="kpi-card bg-gradient-warning">
                          <div class="kpi-header">
                            <i class="fas fa-exclamation-circle"></i>
                          </div>
                          <div class="kpi-body">
                            <h3 id="kpiAlertes" class="kpi-value">0</h3>
                            <div class="kpi-change">
                              <span class="badge bg-warning bg-opacity-20 text-warning" id="kpiAlertesChange">
                                <i class="fas fa-arrow-down"></i> 0
                              </span>
                            </div>
                            <small class="kpi-label">Alertes</small>
                          </div>
                        </div>
                      </div>

                      <!-- KPI Articles -->
                      <div class="col-6 col-md-3">
                        <div class="kpi-card bg-gradient-info">
                          <div class="kpi-header">
                            <i class="fas fa-list"></i>
                          </div>
                          <div class="kpi-body">
                            <h3 id="kpiArticles" class="kpi-value">0</h3>
                            <div class="kpi-change">
                              <span class="badge bg-info bg-opacity-20 text-info" id="kpiArticlesChange">
                                <i class="fas fa-arrow-up"></i> +0
                              </span>
                            </div>
                            <small class="kpi-label">Articles</small>
                          </div>
                        </div>
                      </div>

                      <!-- KPI Valeur -->
                      <div class="col-6 col-md-3">
                        <div class="kpi-card bg-gradient-primary">
                          <div class="kpi-header">
                            <i class="fas fa-euro-sign"></i>
                          </div>
                          <div class="kpi-body">
                            <h3 id="kpiValeur" class="kpi-value">0€</h3>
                            <div class="kpi-change">
                              <span class="badge bg-primary bg-opacity-20 text-primary" id="kpiValeurChange">
                                <i class="fas fa-arrow-up"></i> +0€
                              </span>
                            </div>
                            <small class="kpi-label">Valeur</small>
                          </div>
                        </div>
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
    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
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
      border-left: 4px solid #1b3d5d1d;
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

    /* ===== KPI CARDS DESIGN ===== */
    .kpi-card {
      border-radius: 0.75rem;
      padding: 1.25rem 1rem;
      color: white;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border: none;
    }

    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      transform: translate(30%, -30%);
    }

    .kpi-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .kpi-header {
      font-size: 2rem;
      opacity: 0.8;
      margin-bottom: 0.5rem;
      position: relative;
      z-index: 1;
    }

    .kpi-body {
      position: relative;
      z-index: 1;
    }

    .kpi-value {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0.5rem 0;
      line-height: 1;
    }

    .kpi-change {
      margin: 0.5rem 0;
      font-size: 0.85rem;
    }

    .kpi-change .badge {
      padding: 0.35rem 0.65rem;
      font-weight: 600;
      border-radius: 0.5rem;
    }

    .kpi-change i {
      margin-right: 0.3rem;
    }

    .kpi-label {
      display: block;
      opacity: 0.9;
      font-size: 0.8rem;
      margin-top: 0.75rem;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    /* Gradients pour KPI */
    .bg-gradient-success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
    }

    .bg-gradient-warning {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
    }

    .bg-gradient-info {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
    }

    .bg-gradient-primary {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
    }

    /* Responsive KPI */
    @media (max-width: 768px) {
      .kpi-value {
        font-size: 1.5rem;
      }
      
      .kpi-header {
        font-size: 1.5rem;
      }
      
      .kpi-card {
        padding: 1rem 0.75rem;
      }
    }
  </style>

  <script>
    // Module IIFE pour éviter les conflits de variables globales
    (function() {
      console.log('🎬 Script modal_stock_settings.php chargé et exécuté');
      
      // ===== GESTION CATÉGORIES VIA API =====
      let allCategories = [];
      let currentEditingCategoryId = null;
      let currentMagasinId = null; // À récupérer de la session
      let categoriesLoaded = false; // Flag pour tracker si les catégories ont été chargées
      
      // ===== GESTION RAYONS VIA API =====
      let allRayons = [];
    let currentEditingRayonId = null;
    let rayonsLoaded = false; // Flag pour tracker si les rayons ont été chargés
    
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
        populateTypesProduitsContainer(); // 🔄 Mettre à jour les checkboxes des types produits
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
        
        // Générer un code si absent (ex: "asd" → "ASD")
        const code = cat.code || (cat.nomType || cat.nom || '').toUpperCase().slice(0, 3);
        const unite = cat.unitePrincipale || cat.unite || 'unités';
        const seuil = cat.seuilAlerte || cat.seuil || 0;
        
        // ✅ Utiliser les noms du modèle TypeProduit: nomType, unitePrincipale, seuilAlerte, icone
        item.innerHTML = `
          <div class="text-start">
            <div class="fw-bold"><span style="font-size:1.2em;">${cat.icone || '📦'}</span> ${cat.nomType || cat.nom}</div>
            <small class="text-muted">${code} • ${unite}</small>
          </div>
          <div>
            <span class="badge bg-info">${seuil}</span>
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
      document.getElementById('customFieldsContainer').innerHTML = '';  // ✨ Vider les champs supplémentaires
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
      document.getElementById('catEditUnitePrincipale').value = cat.unitePrincipaleStockage || cat.unitePrincipale || cat.unite || '';
      document.getElementById('catEditIcone').value = cat.icone || '';
      document.getElementById('catEditCouleur').value = cat.couleur || '#3b82f6';
      document.getElementById('catEditSeuil').value = cat.seuilAlerte || cat.seuil || 5;
      document.getElementById('catEditCapacite').value = cat.capaciteMax || cat.capacite || 1000;
      document.getElementById('catEditPhotoRequired').checked = cat.photoRequise !== false;
      
      // ✨ CHARGER TYPE DE STOCKAGE ET UNITÉS
      document.getElementById('catEditTypeStockage').value = cat.typeStockage || 'simple';
      loadUniteVente(cat.unitesVente || []);
      updateUniteVenteVisibility();
      
      // ✨ AFFICHER LES CHAMPS SUPPLÉMENTAIRES EXISTANTS
      const customContainer = document.getElementById('customFieldsContainer');
      customContainer.innerHTML = '';
      if (cat.champsSupplementaires && Array.isArray(cat.champsSupplementaires)) {
        console.log('📋 Champs supplémentaires à afficher:', cat.champsSupplementaires);
        cat.champsSupplementaires.forEach(champ => {
          console.log('  - Champ:', champ.nomChamp, '|', champ.typeChamp, '|', champ.optionsChamp);
          customContainer.appendChild(
            createCustomFieldElement(champ.nomChamp, champ.typeChamp, champ.optionsChamp)
          );
        });
      } else {
        console.log('📋 Pas de champs supplémentaires pour cette catégorie');
      }
      
      document.getElementById('editCategoryTitle').textContent = `Éditer: ${cat.nomType || cat.nom}`;
      document.getElementById('editCategorySubtitle').textContent = `Code ${cat.code} • ${cat.unitePrincipale || cat.unite}`;
      document.getElementById('btnDeleteCategory').style.display = 'inline-block';
      document.getElementById('categoryKPI').style.display = 'flex';

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
      const icone = document.getElementById('catEditIcone').value;
      const couleur = document.getElementById('catEditCouleur').value;
      const seuil = parseInt(document.getElementById('catEditSeuil').value) || 5;
      const capacite = parseInt(document.getElementById('catEditCapacite').value) || 1000;
      const photoRequired = document.getElementById('catEditPhotoRequired').checked;
      const unitePrincipaleStockage = document.getElementById('catEditUnitePrincipale').value.trim();
      const typeStockage = document.getElementById('catEditTypeStockage').value;

      // Validation
      if (!nom || !code || !icone || !unitePrincipaleStockage) {
        showNotification('⚠️ Veuillez remplir tous les champs obligatoires', 'warning');
        return;
      }

      // ✨ COLLECTER LES UNITÉS DE VENTE (pour LOT)
      const unitesVente = [];
      if (typeStockage === 'lot') {
        document.querySelectorAll('#unitesVenteList .unite-item input').forEach(input => {
          const unite = input.value?.trim();
          if (unite) {
            unitesVente.push(unite);
          }
        });
        
        if (unitesVente.length === 0) {
          showNotification('⚠️ Ajoutez au moins une unité de vente pour un type LOT', 'warning');
          return;
        }
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
        nomType: nom,
        code: code,
        typeStockage: typeStockage,                // ✨ SIMPLE ou LOT
        unitePrincipaleStockage: unitePrincipaleStockage,
        unitesVente: unitesVente,                  // ✨ Pour LOT
        icone: icone,
        couleur: couleur,
        seuilAlerte: seuil,
        capaciteMax: capacite,
        photoRequise: photoRequired,
        champsSupplementaires: champsSupplementaires
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

    // ✨ Créer un élément de champ personnalisé réutilisable
    function createCustomFieldElement(name = '', type = 'text', options = []) {
      const field = document.createElement('div');
      field.className = 'row g-2 mb-2 p-2 border rounded bg-white';
      const optionsStr = Array.isArray(options) ? options.join(', ') : (typeof options === 'string' ? options : '');
      field.innerHTML = `
        <div class="col-md-3">
          <input type="text" class="form-control form-control-sm" placeholder="Nom du champ" value="${name}">
        </div>
        <div class="col-md-3">
          <select class="form-select form-select-sm">
            <option value="text" ${type === 'text' ? 'selected' : ''}>Texte</option>
            <option value="number" ${type === 'number' ? 'selected' : ''}>Nombre</option>
            <option value="date" ${type === 'date' ? 'selected' : ''}>Date</option>
            <option value="select" ${type === 'select' ? 'selected' : ''}>Choix</option>
          </select>
        </div>
        <div class="col-md-5">
          <input type="text" class="form-control form-control-sm" placeholder="Options (virgule séparées)" value="${optionsStr}">
        </div>
        <div class="col-md-1">
          <button type="button" class="btn btn-sm btn-outline-danger">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      field.querySelector('button').addEventListener('click', () => field.remove());
      return field;
    }

    // ==================== RAYONS CRUD FUNCTIONS ====================

    // Charger les rayons depuis l'API
    async function loadRayonsModal() {
      console.log('🟢🟢🟢 DÉBUT loadRayonsModal() | currentMagasinId:', currentMagasinId);
      
      if (!currentMagasinId) {
        console.warn('⚠️ magasinId non défini');
        const listContainer = document.getElementById('rayonsList');
        listContainer.innerHTML = `
          <div class="alert alert-warning p-3 m-2 mb-0" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>Magasin non sélectionné</strong>
            <p class="mb-0 small mt-1">Veuillez d'abord sélectionner un magasin</p>
          </div>
        `;
        return;
      }

      try {
        showLoading(true);
        const authToken = getAuthToken();
        console.log('🔐 Token obtenu | Token:', authToken ? '✅ Présent' : '❌ Absent');
        const response = await fetch(`${API_BASE}/magasins/${currentMagasinId}/rayons`, {
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
        allRayons = data || [];
        console.log('✅ allRayons mis à jour | Longueur:', allRayons.length);
        renderRayonsList();
        updateRayonsCount();
        showLoading(false);
      } catch (error) {
        console.error('❌ Erreur chargement rayons:', error);
        showLoading(false);
        
        const listContainer = document.getElementById('rayonsList');
        listContainer.innerHTML = `
          <div class="alert alert-danger p-3 m-2 mb-0" role="alert">
            <i class="fas fa-circle-exclamation me-2"></i>
            <strong>Erreur de chargement</strong>
            <p class="mb-0 small mt-1">${error.message}</p>
            <button class="btn btn-sm btn-outline-danger mt-2" onclick="loadRayonsModal()">
              <i class="fas fa-redo me-1"></i>Réessayer
            </button>
          </div>
        `;
        
        showNotification('❌ Impossible de charger les rayons', 'danger');
      }
    }

    // Afficher la liste des rayons
    function renderRayonsList() {
      const list = document.getElementById('rayonsList');
      list.innerHTML = '';

      console.log('📋 renderRayonsList - allRayons:', allRayons);

      if (allRayons.length === 0) {
        list.innerHTML = '<div class="text-muted text-center py-4"><i class="fas fa-inbox me-2"></i>Aucun rayon</div>';
        return;
      }

      allRayons.forEach((rayon, idx) => {
        console.log(`📦 Rayon ${idx}:`, rayon);
        const item = document.createElement('button');
        item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        item.type = 'button';
        item.innerHTML = `
          <div class="text-start">
            <div class="fw-bold"><span style="font-size:1.2em;">${rayon.iconeRayon || '📦'}</span> ${rayon.nomRayon || 'Sans nom'}</div>
            <small class="text-muted">${rayon.codeRayon} • ${rayon.typeRayon || 'RAYON'}</small>
          </div>
          <div>
            <span class="badge" style="background-color: ${rayon.couleurRayon || '#10b981'}">${rayon.capaciteMax || 1000}</span>
          </div>
        `;
        item.addEventListener('click', () => editRayon(idx));
        list.appendChild(item);
      });
    }

    // Créer un nouveau rayon
    function newRayon() {
      currentEditingRayonId = null;
      document.getElementById('editRayonId').value = '';
      document.getElementById('formConfigRayon').reset();
      document.getElementById('formConfigRayon').querySelector('input[name="couleurRayon"]').value = '#10b981';
      document.getElementById('formConfigRayon').querySelector('input[name="capaciteMax"]').value = '1000';
      document.getElementById('formConfigRayon').querySelector('select[name="typeRayon"]').value = 'RAYON';
      document.getElementById('formConfigRayon').querySelector('select[name="status"]').value = '1';
      document.getElementById('formConfigRayon').querySelector('textarea[name="description"]').value = '';
      document.getElementById('rayonNom').textContent = 'Créer un nouveau rayon';
      document.getElementById('rayonStatus').textContent = '✨ Nouveau';
      document.getElementById('rayonStatus').className = 'badge text-dark fs-1 fw-semi-bold';
      document.getElementById('btnDeleteRayon').style.display = 'none';
      
      // ✅ RÉINITIALISER LES KPI
      document.getElementById('rayonOccupation').textContent = '0%';
      document.getElementById('rayonOccupation').className = 'text-success mb-1';
      document.getElementById('rayonArticles').textContent = '0';
      document.getElementById('rayonAlertes').textContent = '0/1000';
      document.getElementById('rayonCapacite').textContent = '0/1000';
      
      // Afficher le MODE SÉLECTION (checkboxes)
      document.getElementById('selectionMode').style.display = '';
      document.getElementById('listMode').style.display = 'none';
      
      // Remplir les checkboxes
      populateTypesProduitsContainer();
      
      // Déselectionner tous les types produits
      document.querySelectorAll('#selectionMode input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
      });
      
      // Déselectionner les items de la liste
      document.querySelectorAll('#rayonsList .list-group-item').forEach(item => {
        item.classList.remove('active');
      });
    }

    // Éditer un rayon
    function editRayon(idx) {
      const rayon = allRayons[idx];
      console.log('📝 Édition rayon idx:', idx);
      console.log('📝 Rayon complet:', rayon);
      currentEditingRayonId = idx;
      
      document.getElementById('editRayonId').value = rayon._id;
      
      // Remplir le formulaire
      const form = document.getElementById('formConfigRayon');
      form.querySelector('input[name="codeRayon"]').value = rayon.codeRayon || '';
      form.querySelector('input[name="nomRayon"]').value = rayon.nomRayon || '';
      form.querySelector('input[name="capaciteMax"]').value = rayon.capaciteMax || 1000;
      form.querySelector('select[name="typeRayon"]').value = rayon.typeRayon || 'RAYON';
      form.querySelector('select[name="status"]').value = rayon.status ? '1' : '0';
      form.querySelector('input[name="couleurRayon"]').value = rayon.couleurRayon || '#10b981';
      form.querySelector('select[name="iconeRayon"]').value = rayon.iconeRayon || '📦';
      form.querySelector('textarea[name="description"]').value = rayon.description || '';
      
      // ✅ REMPLIR LES KPI AVEC LES VRAIES DONNÉES
      const capaciteMax = rayon.capaciteMax || 1000;
      const capaciteOccupee = rayon.capaciteOccupee || 0;
      const occupationPourcent = Math.round((capaciteOccupee / capaciteMax) * 100);
      const articles = rayon.articles || 0;
      const alertes = rayon.alertes || 0;
      
      document.getElementById('rayonOccupation').textContent = occupationPourcent + '%';
      document.getElementById('rayonArticles').textContent = articles;
      document.getElementById('rayonAlertes').textContent = alertes + '/1000';
      document.getElementById('rayonCapacite').textContent = capaciteOccupee + '/' + capaciteMax;
      
      // Changer la couleur de l'occupation en fonction du pourcentage
      const occupationElement = document.getElementById('rayonOccupation');
      if (occupationPourcent > 90) {
        occupationElement.className = 'text-danger mb-1';
      } else if (occupationPourcent > 75) {
        occupationElement.className = 'text-warning mb-1';
      } else {
        occupationElement.className = 'text-success mb-1';
      }
      
      // ✅ AFFICHER LE MODE LISTE avec les catégories sélectionnées
      const typesProduitsIds = (rayon.typesProduitsAutorises || []).map(typeOrId => {
        // Si c'est un objet (retourné par .populate()), extraire ._id
        // Si c'est déjà un string (ID), le retourner tel quel
        if (typeof typeOrId === 'object' && typeOrId._id) {
          return String(typeOrId._id);
        }
        return String(typeOrId);
      });
      console.log('📋 Types produits autorisés (convertis):', typesProduitsIds);
      
      // Masquer le mode sélection, afficher le mode liste
      document.getElementById('selectionMode').style.display = 'none';
      document.getElementById('listMode').style.display = 'block';
      
      // Afficher la liste des catégories sélectionnées
      displaySelectedTypesList(typesProduitsIds);
      
      // Mettre à jour le header
      document.getElementById('rayonNom').textContent = rayon.nomRayon || 'Sans nom';
      const statusBadge = document.getElementById('rayonStatus');
      if (rayon.status) {
        statusBadge.textContent = '🟢 Actif';
        statusBadge.className = 'badge bg-success text-white fs-1 fw-semi-bold';
      } else {
        statusBadge.textContent = '🔴 Inactif';
        statusBadge.className = 'badge bg-danger text-white fs-1 fw-semi-bold';
      }
      
      document.getElementById('btnDeleteRayon').style.display = 'inline-block';
      
      // Marquer l'item comme actif
      document.querySelectorAll('#rayonsList .list-group-item').forEach(item => {
        item.classList.remove('active');
      });
      document.querySelectorAll('#rayonsList .list-group-item')[idx]?.classList.add('active');
      
      // 🆕 Afficher les détails des stocks (SIMPLE et LOT)
      displayDetailStocks(rayon._id);
    }

    // Sauvegarder ou créer un rayon via API
    async function saveRayon(e) {
      e.preventDefault();

      const codeRayon = document.getElementById('formConfigRayon').querySelector('input[name="codeRayon"]').value.trim().toUpperCase();
      const nomRayon = document.getElementById('formConfigRayon').querySelector('input[name="nomRayon"]').value.trim();
      const capaciteMaxInput = document.getElementById('formConfigRayon').querySelector('input[name="capaciteMax"]').value;
      const capaciteMax = parseInt(capaciteMaxInput) || 1000;
      const typeRayon = document.getElementById('formConfigRayon').querySelector('select[name="typeRayon"]').value;
      const status = parseInt(document.getElementById('formConfigRayon').querySelector('select[name="status"]').value) || 1;
      const couleurRayon = document.getElementById('formConfigRayon').querySelector('input[name="couleurRayon"]').value;
      const iconeRayon = document.getElementById('formConfigRayon').querySelector('select[name="iconeRayon"]').value;
      const description = document.getElementById('formConfigRayon').querySelector('textarea[name="description"]').value.trim();
      
      // DEBUG: Log les valeurs
      console.log('🔍 DEBUG saveRayon:');
      console.log(`   capaciteMaxInput (brut): "${capaciteMaxInput}" (type: ${typeof capaciteMaxInput})`);
      console.log(`   capaciteMax (parsé): ${capaciteMax}`);
      console.log(`   codeRayon: ${codeRayon}`);
      console.log(`   nomRayon: ${nomRayon}`);

      // Validation
      if (!codeRayon || !nomRayon) {
        showNotification('⚠️ Code et nom du rayon sont obligatoires', 'warning');
        return;
      }

      // Collecter les types produits sélectionnés (depuis le mode sélection OU la liste)
      const typesProduitsAutorises = [];
      
      // Si en mode sélection, récupérer les checkboxes cochées
      if (document.getElementById('selectionMode').style.display !== 'none') {
        document.querySelectorAll('#selectionMode input[type="checkbox"]:checked').forEach(cb => {
          typesProduitsAutorises.push(cb.value);
        });
      } else {
        // Si en mode liste, récupérer depuis les badges avec l'attribut data-category-id
        document.querySelectorAll('#selectedTypesList .badge').forEach(badge => {
          const btn = badge.querySelector('button[data-category-id]');
          if (btn) {
            const catId = btn.getAttribute('data-category-id');
            typesProduitsAutorises.push(catId);
          }
        });
      }
      
      console.log('📋 Types produits sélectionnés:', typesProduitsAutorises);
      console.log('📋 Nombre de types:', typesProduitsAutorises.length);
      typesProduitsAutorises.forEach((id, idx) => {
        console.log(`  [${idx}] ID: ${id}, Type: ${typeof id}`);
      });

      const rayonData = {
        codeRayon,
        nomRayon,
        capaciteMax,
        typeRayon,
        status: status === 1,
        couleurRayon,
        iconeRayon,
        description,
        typesProduitsAutorises
      };

      console.log('📤 rayonData à envoyer:');
      console.log('   ', JSON.stringify(rayonData, null, 2));

      try {
        const isNew = currentEditingRayonId === null;
        const method = isNew ? 'POST' : 'PUT';
        const rayonId = isNew ? '' : allRayons[currentEditingRayonId]._id;
        const url = isNew 
          ? `${API_BASE}/magasins/${currentMagasinId}/rayons`
          : `${API_BASE}/rayons/${rayonId}`;

        const authToken = getAuthToken();
        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(rayonData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 401) {
            throw new Error('⚠️ Authentification expirée. Veuillez vous reconnecter.');
          }
          console.error('❌ Réponse erreur du serveur:', errorData);
          throw new Error(errorData.message || errorData.error || `Erreur API: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Rayon sauvegardé:', result);
        
        showNotification(isNew ? `✅ Rayon "${nomRayon}" créé avec succès` : `✅ Rayon "${nomRayon}" mis à jour`, 'success');
        loadRayonsModal();
        newRayon();
      } catch (error) {
        console.error('❌ Erreur sauvegarde rayon:', error);
        showNotification(`❌ Erreur: ${error.message}`, 'danger');
      }
    }

    // Supprimer un rayon
    async function deleteRayon() {
      if (currentEditingRayonId === null) {
        showNotification('⚠️ Aucun rayon sélectionné', 'warning');
        return;
      }

      const rayon = allRayons[currentEditingRayonId];
      if (!confirm(`❓ Êtes-vous sûr de vouloir supprimer le rayon "${rayon.nomRayon}" ?\n\nCette action est irréversible.`)) {
        return;
      }

      try {
        const authToken = getAuthToken();
        const response = await fetch(`${API_BASE}/rayons/${rayon._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }

        showNotification('✅ Rayon supprimé avec succès', 'success');
        loadRayonsModal();
        newRayon();
      } catch (error) {
        console.error('❌ Erreur suppression rayon:', error);
        showNotification(`❌ Erreur: ${error.message}`, 'danger');
      }
    }

    // Mettre à jour le compteur de rayons
    function updateRayonsCount() {
      document.getElementById('totalRayons').textContent = allRayons.length;
    }

    // Remplir le conteneur des types produits avec les catégories disponibles (MODE SÉLECTION)
    function populateTypesProduitsContainer() {
      const container = document.getElementById('selectionMode');
      container.innerHTML = '';

      if (!allCategories || allCategories.length === 0) {
        container.innerHTML = '<p class="text-muted col-12"><small>Aucune categorie disponible. Creez dabord une categorie!</small></p>';
        return;
      }

      allCategories.forEach(cat => {
        const catId = cat._id;
        const catName = cat.nomType || cat.nom;
        const catIcon = cat.icone || '📦';
        
        const div = document.createElement('div');
        div.className = 'form-check p-2 mb-2';
        div.style.cssText = 'border: 1px solid #dee2e6; border-radius: 0.375rem; background: white;';
        
        div.innerHTML = `
          <input class="form-check-input" type="checkbox" id="typeProduit_${catId}" value="${catId}">
          <label class="form-check-label ms-2" for="typeProduit_${catId}">
            <span style="font-size: 1.2em; margin-right: 0.5rem;">${catIcon}</span>
            <strong>${catName}</strong>
            <small class="text-muted d-block mt-1">Code: ${cat.code}</small>
          </label>
        `;
        container.appendChild(div);
      });
      
      console.log('✅ populateTypesProduitsContainer() | ' + allCategories.length + ' catégories affichées');
    }

    // Afficher les types produits sélectionnés en MODE LISTE (édition)
    async function displaySelectedTypesList(selectedIds) {
      const listContainer = document.getElementById('selectedTypesList');
      listContainer.innerHTML = '';

      if (!selectedIds || selectedIds.length === 0) {
        listContainer.innerHTML = '<p class="text-muted"><small>Aucune catégorie sélectionnée</small></p>';
        document.getElementById('btnModifyTypes').style.display = 'none';
        return;
      }

      // ⚠️ Si allCategories n'est pas chargée, la charger d'abord
      if (!allCategories || allCategories.length === 0) {
        console.log('⚠️ allCategories vide, chargement nécessaire...');
        await loadCategoriesModal(); // Charger les catégories
      }

      let badgesCreated = 0;
      selectedIds.forEach(typeId => {
        const cat = allCategories.find(c => String(c._id) === String(typeId));
        if (cat) {
          badgesCreated++;
          const badge = document.createElement('span');
          badge.className = 'badge bg-success text-white p-2 d-flex align-items-center gap-2';
          badge.style.fontSize = '0.95rem';
          badge.innerHTML = `
            <span style="font-size: 1.2em;">${cat.icone || '📦'}</span>
            <span>${cat.nomType || cat.nom}</span>
            <button type="button" class="btn-close btn-close-white" data-category-id="${typeId}" style="font-size: 0.7rem;"></button>
          `;
          
          // Ajouter l'événement pour retirer une catégorie
          badge.querySelector('button').addEventListener('click', (e) => {
            e.preventDefault();
            const categoryId = e.currentTarget.getAttribute('data-category-id');
            const updatedIds = selectedIds.filter(id => String(id) !== String(categoryId));
            displaySelectedTypesList(updatedIds);
            
            // Mettre à jour les checkboxes en mode sélection
            const checkbox = document.getElementById(`typeProduit_${categoryId}`);
            if (checkbox) checkbox.checked = false;
          });
          
          listContainer.appendChild(badge);
        } else {
          // La catégorie n'a pas été trouvée - afficher juste l'ID
          console.warn('⚠️ Catégorie non trouvée pour ID:', typeId);
          const badge = document.createElement('span');
          badge.className = 'badge bg-warning text-dark p-2 d-flex align-items-center gap-2';
          badge.style.fontSize = '0.95rem';
          badge.innerHTML = `
            <span>❓ ID: ${typeId.substring(0, 8)}...</span>
            <button type="button" class="btn-close" data-category-id="${typeId}" style="font-size: 0.7rem;"></button>
          `;
          
          badge.querySelector('button').addEventListener('click', (e) => {
            e.preventDefault();
            const categoryId = e.currentTarget.getAttribute('data-category-id');
            const updatedIds = selectedIds.filter(id => String(id) !== String(categoryId));
            displaySelectedTypesList(updatedIds);
          });
          
          listContainer.appendChild(badge);
        }
      });

      console.log(`✅ displaySelectedTypesList - ${badgesCreated} badges créés sur ${selectedIds.length} types`);
      document.getElementById('btnModifyTypes').style.display = 'inline-block';
    }

    // ✨ FONCTIONS GESTION TYPE DE STOCKAGE ET UNITÉS DE VENTE
    
    function updateUniteVenteVisibility() {
      const typeStockage = document.getElementById('catEditTypeStockage').value;
      const container = document.getElementById('unitesVenteContainer');
      if (typeStockage === 'lot') {
        container.style.display = 'block';
      } else {
        container.style.display = 'none';
      }
    }
    
    function addUniteVente(e) {
      if (e) {
        e.preventDefault();
      }
      
      const container = document.getElementById('unitesVenteList');
      const div = document.createElement('div');
      div.className = 'unite-item d-flex gap-2 mb-2';
      div.innerHTML = `
        <input type="text" class="form-control form-control-sm" placeholder="Ex: PIÈCE, MÈTRE, KG" required>
        <button type="button" class="btn btn-sm btn-outline-danger btn-delete-unite">
          <i class="fas fa-trash"></i>
        </button>
      `;
      
      div.querySelector('.btn-delete-unite').addEventListener('click', function() {
        div.remove();
      });
      
      container.appendChild(div);
    }
    
    function loadUniteVente(unitesVente) {
      const container = document.getElementById('unitesVenteList');
      container.innerHTML = '';
      
      (unitesVente || []).forEach(unite => {
        const div = document.createElement('div');
        div.className = 'unite-item d-flex gap-2 mb-2';
        div.innerHTML = `
          <input type="text" class="form-control form-control-sm" value="${unite}" required>
          <button type="button" class="btn btn-sm btn-outline-danger btn-delete-unite">
            <i class="fas fa-trash"></i>
          </button>
        `;
        
        div.querySelector('.btn-delete-unite').addEventListener('click', function() {
          div.remove();
        });
        
        container.appendChild(div);
      });
    }

    // Initialiser au chargement
    document.addEventListener('DOMContentLoaded', function() {
      console.log('🚀 DOMContentLoaded déclenché dans modal_stock_settings.php');
      
      // ✨ EVENT LISTENERS POUR TYPE DE STOCKAGE
      const typeStockageSelect = document.getElementById('catEditTypeStockage');
      if (typeStockageSelect) {
        typeStockageSelect.addEventListener('change', updateUniteVenteVisibility);
      }
      
      const btnAddUniteVente = document.getElementById('btnAddUniteVente');
      if (btnAddUniteVente) {
        btnAddUniteVente.addEventListener('click', addUniteVente);
      }
      
      // ✅ Initialiser les popovers Bootstrap
      const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
      popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
      });
      console.log('✅ Popovers initialisés | Nombre:', popoverTriggerList.length);
      
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
        console.log('✅ currentMagasinId existe, appel de loadCategoriesModal() et loadRayonsModal()');
        loadCategoriesModal();
        loadRayonsModal();
      } else {
        console.warn('⚠️ currentMagasinId est vide/null - données ne seront pas chargées');
      }

      // ==================== ÉVÉNEMENTS CATÉGORIES ====================
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
        container.appendChild(createCustomFieldElement());
      });

      // ==================== ÉVÉNEMENTS RAYONS ====================
      const formRayon = document.getElementById('formConfigRayon');
      if (formRayon) {
        formRayon.addEventListener('submit', saveRayon);
      }

      // Bouton "Modifier les catégories"
      const btnModifyTypes = document.getElementById('btnModifyTypes');
      if (btnModifyTypes) {
        btnModifyTypes.addEventListener('click', function(e) {
          e.preventDefault();
          // Afficher le mode sélection et remplir les checkboxes
          document.getElementById('selectionMode').style.display = '';
          document.getElementById('listMode').style.display = 'none';
          
          // Populate le mode sélection
          populateTypesProduitsContainer();
          
          // Cocher les catégories déjà sélectionnées
          const selectedList = document.getElementById('selectedTypesList');
          selectedList.querySelectorAll('.badge').forEach(badge => {
            const catId = badge.querySelector('button').getAttribute('data-category-id');
            const checkbox = document.getElementById(`typeProduit_${catId}`);
            if (checkbox) checkbox.checked = true;
          });
          
          console.log('✅ Mode modification activé - checkboxes affichés');
        });
      }

      const btnDeleteRayon = document.getElementById('btnDeleteRayon');
      if (btnDeleteRayon) {
        btnDeleteRayon.addEventListener('click', deleteRayon);
      }

      const btnAnnulerRayon = document.getElementById('btnAnnulerRayon');
      if (btnAnnulerRayon) {
        btnAnnulerRayon.addEventListener('click', newRayon);
      }

      const btnCreateRayonFooter = document.getElementById('btnCreateRayonFooter');
      if (btnCreateRayonFooter) {
        btnCreateRayonFooter.addEventListener('click', newRayon);
      }

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
            console.log('✅ Changement de magasin détecté, appel de loadCategoriesModal() et loadRayonsModal()');
            currentMagasinId = newMagasinId;
            categoriesLoaded = false;
            rayonsLoaded = false;
            loadCategoriesModal();
            loadRayonsModal();
          } else if (!newMagasinId) {
            console.warn('⚠️ newMagasinId vide - magasin non trouvé');
          } else {
            console.log('ℹ️ Même magasin, mais on recharge les catégories pour assurer à jour');
            // ✅ TOUJOURS charger les catégories pour s'assurer que les checkboxes sont disponibles
            loadCategoriesModal();
          }
        });
      }

      // ✨ IMPORTANT: Charger les rayons quand on clique sur l'onglet "Rayons"
      const rayonsTab = document.getElementById('rayons-tab');
      if (rayonsTab) {
        rayonsTab.addEventListener('click', function() {
          console.log('📌 Onglet "Rayons" cliqué | rayonsLoaded:', rayonsLoaded, '| currentMagasinId:', currentMagasinId);
          if (!rayonsLoaded && currentMagasinId) {
            console.log('🔄 Premier accès à l\'onglet, appel de loadRayonsModal()');
            loadRayonsModal();
            rayonsLoaded = true;
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

    // ✅ EXPOSER LES FONCTIONS GLOBALEMENT
    window.newRayon = newRayon;
    window.editRayon = editRayon;
    window.newCategory = newCategory;
    window.editCategory = editCategory;
    window.saveRayon = saveRayon;
    window.saveCategory = saveCategory;

    // 🆕 AFFICHER LES DÉTAILS DES STOCKS (SIMPLE et LOT)
    async function displayDetailStocks(rayonId) {
      try {
        const magasinId = currentMagasinId || sessionStorage.getItem('currentMagasinId');
        
        // Récupérer les stocks du rayon depuis le backend
        const resStocks = await fetch(`/api/protected/rayons/${rayonId}/stocks`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        const containerSimple = document.getElementById('detailStocksSimple');
        const containerLot = document.getElementById('detailStocksLot');
        const containerEmpty = document.getElementById('detailStocksEmpty');

        if (!resStocks.ok) {
          console.error('❌ Erreur chargement stocks rayon:', resStocks.status);
          // Si l'endpoint n'existe pas, afficher un message
          containerEmpty.innerHTML = `
            <div class="alert alert-warning py-2 px-3">
              <i class="fas fa-exclamation-triangle me-2"></i>
              <strong>Détail des stocks indisponible</strong><br>
              <small>Veuillez redémarrer le serveur pour activer cette fonctionnalité</small>
            </div>
          `;
          containerEmpty.style.display = 'block';
          containerSimple.innerHTML = '';
          containerLot.innerHTML = '';
          return;
        }

        const { stocksSimple, stocksLot } = await resStocks.json();

        let htmlSimple = '';
        if (stocksSimple && stocksSimple.length > 0) {
          htmlSimple = `
            <div class="alert alert-primary py-2 px-3 mb-3">
              <i class="fas fa-cube me-2"></i><strong>Type SIMPLE (${stocksSimple.length} emplacements)</strong>
            </div>
            <div class="row g-2">
          `;
          
          stocksSimple.forEach((stock, idx) => {
            const satutColor = stock.statut === 'EN_STOCK' ? 'success' : 
                              stock.statut === 'PARTIELLEMENT_VENDU' ? 'warning' : 'danger';
            
            htmlSimple += `
              <div class="col-md-6">
                <div class="card border-${satutColor} border-1 h-100">
                  <div class="card-body p-2">
                    <h6 class="card-title mb-1"><strong>Emplacement ${idx + 1}</strong></h6>
                    <hr class="my-1">
                    <div class="d-flex justify-content-between mb-1">
                      <small>Quantité:</small>
                      <small class="fw-bold">${stock.quantiteDisponible} pièces</small>
                    </div>
                    <div class="d-flex justify-content-between mb-1">
                      <small>Statut:</small>
                      <span class="badge bg-${satutColor}">${stock.statut}</span>
                    </div>
                    <small class="text-muted d-block"><i class="fas fa-cube me-1"></i>Type: SIMPLE</small>
                  </div>
                </div>
              </div>
            `;
          });

          htmlSimple += `</div>`;
        }

        // Afficher les stocks LOT
        let htmlLot = '';
        if (stocksLot && stocksLot.length > 0) {
          htmlLot = `
            <div class="alert alert-warning py-2 px-3 mb-3">
              <i class="fas fa-list-ol me-2"></i><strong>Type LOT (${stocksLot.length} pièces)</strong>
            </div>
            <div class="row g-2">
          `;
          
          stocksLot.forEach((lot, idx) => {
            const satutColor = lot.status === 'complet' ? 'success' : 
                              lot.status === 'partiel_vendu' ? 'warning' : 'danger';
            
            htmlLot += `
              <div class="col-md-6">
                <div class="card border-${satutColor} border-1 h-100">
                  <div class="card-body p-2">
                    <h6 class="card-title mb-1"><strong>LOT ${idx + 1}</strong></h6>
                    <hr class="my-1">
                    <div class="d-flex justify-content-between mb-1">
                      <small>Numéro:</small>
                      <small class="fw-bold text-monospace" style="font-size: 0.8rem;">${lot.numeroLot || 'N/A'}</small>
                    </div>
                    <div class="d-flex justify-content-between mb-1">
                      <small>Quantité:</small>
                      <small class="fw-bold">${lot.quantiteInitiale || 0} pièces</small>
                    </div>
                    <div class="d-flex justify-content-between mb-1">
                      <small>Statut:</small>
                      <span class="badge bg-${satutColor}">${lot.status}</span>
                    </div>
                    <small class="text-muted d-block"><i class="fas fa-list-ol me-1"></i>Type: LOT</small>
                  </div>
                </div>
              </div>
            `;
          });

          htmlLot += `</div>`;
        }

        // Mettre à jour le DOM
        containerSimple.innerHTML = htmlSimple;
        containerLot.innerHTML = htmlLot;
        containerEmpty.style.display = (stocksSimple?.length === 0 && stocksLot?.length === 0) ? 'block' : 'none';

      } catch (error) {
        console.error('❌ Erreur displayDetailStocks:', error);
        const containerEmpty = document.getElementById('detailStocksEmpty');
        containerEmpty.innerHTML = `
          <div class="alert alert-danger py-2 px-3">
            <i class="fas fa-exclamation-circle me-2"></i>
            <strong>Erreur:</strong> ${error.message}
          </div>
        `;
        containerEmpty.style.display = 'block';
      }
    }

    window.displayDetailStocks = displayDetailStocks;
    
    })(); // Fin du module IIFE
  </script>
