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
          
          <!-- 🔍 RECHERCHE PRODUIT EXISTANT (visibleEn Commande uniquement) -->
          <div id="searchProductSection" class="row g-3 mb-4" style="display: none;">
            <div class="col-md-12">
              <label class="form-label fw-bold d-flex align-items-center">
                <i class="fas fa-search me-2 text-info"></i>
                Rechercher un produit existant (optionnel)
              </label>
              <div class="position-relative">
                <input 
                  type="text" 
                  id="searchExistingProduct" 
                  class="form-control" 
                  placeholder="🔍 Taper référence ou désignation... (ex: Po1214)"
                  autocomplete="off"
                />
                <!-- Dropdown résultats -->
                <div 
                  id="searchResultsDropdown" 
                  class="position-absolute w-100 bg-white border rounded-bottom shadow-lg mt-0" 
                  style="display:none; top: 100%; left: 0; z-index: 1100; max-height: 300px; overflow-y: auto;"
                >
                  <div id="searchResultsList" class="list-group list-group-flush">
                    <!-- Résultats dynamiques -->
                  </div>
                </div>
              </div>
              <small class="text-muted d-block mt-2">
                ℹ️ Laissez vide pour créer un <strong>nouveau produit</strong>
              </small>
            </div>
          </div>
          
          <!-- 1.5. MODE: Stock Initial OU En Commande -->
          <div class="row g-3 mb-4">
            <div class="col-md-12">
              <label class="form-label fw-bold d-flex align-items-center">
                <i class="fas fa-route me-2 text-primary"></i>
                Mode d'Entrée <span class="text-danger">*</span>
              </label>
              <div class="btn-group w-100" role="group">
                <input type="radio" class="btn-check" name="modeEntree" id="modeStockInitial" value="stock" checked>
                <label class="btn btn-outline-success" for="modeStockInitial">
                  <i class="fas fa-warehouse me-2"></i>Stock Initial (Ajouter au rayon)
                </label>
                
                <input type="radio" class="btn-check" name="modeEntree" id="modeEnCommande" value="commande">
                <label class="btn btn-outline-warning" for="modeEnCommande">
                  <i class="fas fa-truck me-2"></i>En Commande (Créer + Commander)
                </label>
              </div>
              <small class="text-muted d-block mt-2">
                <strong>Stock Initial:</strong> Ajouter directement le produit en rayon<br>
                <strong>En Commande:</strong> Créer produit + Créer commande fournisseur en même temps
              </small>
            </div>
          </div>

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
          <div class="row g-3 mb-4" id="stockInitialContainer">
            <div class="col-md-12">
              <label class="form-label fw-bold" id="labelQuantite">Stock Initial <span class="text-danger">*</span></label>
              <div class="input-group">
                <input type="number" name="quantite" id="quantite" class="form-control" min="0" step="0.01" placeholder="0 accepté pour commandes" required />
                <span class="input-group-text" id="uniteLabel">unités</span>
              </div>
              <div class="invalid-feedback">Quantité obligatoire</div>
              <!-- Alertes de validation quantité -->
              <div id="alerteQuantiteRayon" class="alert alert-warning mt-2 py-2 px-3 mb-0" style="display: none;">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <small><span id="messageQuantiteRayon"></span></small>
              </div>
              <div id="alerteQuantiteType" class="alert alert-warning mt-2 py-2 px-3 mb-0" style="display: none;">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <small><span id="messageQuantiteType"></span></small>
              </div>
              <div id="alerteQuantiteInfo" class="alert alert-info mt-2 py-2 px-3 mb-0" style="display: none;">
                <i class="fas fa-info-circle me-2"></i>
                <small><span id="messageQuantiteInfo"></span></small>
              </div>
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
              <!-- Alerte rayon plein -->
              <div id="alerteRayonPlein" class="alert alert-warning mt-2 py-2 px-3 mb-0" style="display: none;">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <small><strong>Attention:</strong> <span id="messageRayonPlein"></span></small>
              </div>
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

                <!-- Date de Fabrication -->
                <div class="col-md-4">
                  <label class="form-label fw-bold">Date de Fabrication</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-calendar text-info"></i></span>
                    <input 
                      type="date" 
                      name="dateFabrication" 
                      id="dateFabrication" 
                      class="form-control"
                    >
                  </div>
                  <small class="text-muted d-block mt-1">Date de création du produit</small>
                </div>

                <!-- Date de Réception -->
                <div class="col-md-4">
                  <label class="form-label fw-bold">Date de Réception <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-calendar text-primary"></i></span>
                    <input 
                      type="date" 
                      name="dateReception" 
                      id="dateReception" 
                      class="form-control"
                      required
                    >
                  </div>
                  <small class="text-muted d-block mt-1">Pour FIFO/LIFO</small>
                </div>

                <!-- Date Péremption -->
                <div class="col-md-4">
                  <label class="form-label fw-bold">Date Péremption</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-calendar-times text-danger"></i></span>
                    <input 
                      type="date" 
                      name="datePeremption" 
                      id="datePeremption" 
                      class="form-control"
                    >
                  </div>
                  <small class="text-muted d-block mt-1">Si applicable</small>
                </div>

                <!-- Statut -->
                <div class="col-md-4">
                  <label class="form-label fw-bold">Statut</label>
                  <select id="statutProduit" name="statut" class="form-select">
                    <option value="controle">À contrôler</option>
                    <option value="stocke" selected>Stocké</option>
                    <option value="rejete">Rejeté</option>
                  </select>
                </div>

                <!-- Priorité -->
                <div class="col-md-4">
                  <label class="form-label fw-bold">Priorité</label>
                  <select id="prioriteProduit" name="priorite" class="form-select">
                    <option value="normale" selected>Normale</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. GESTION LOT & ROTATION STOCK -->
          <div class="card bg-light border-info mb-4">
            <div class="card-header bg-info bg-opacity-10 border-info py-2">
              <h6 class="mb-0 fw-bold"><i class="fas fa-info-circle me-2 text-info"></i>Mode de Rotation</h6>
            </div>
            <div class="card-body p-3">
              <!-- Info Mode FIFO/LIFO -->
              <div id="infoModeGestion" class="alert alert-info mt-0 mb-0 py-2">
                <small>
                  <i class="fas fa-info-circle me-2"></i>
                  <span id="modeGestionText">Le mode de rotation sera appliqué selon la catégorie choisie.</span>
                </small>
              </div>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-bold">Seuil Minimum</label>
              <input type="number" name="seuilAlerte" id="seuilAlerte" class="form-control" min="0" />
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold">État</label>
              <select name="etat" id="etat" class="form-select">
                <option value="Neuf">Neuf</option>
                <option value="Bon état">Bon état</option>
                <option value="Usagé">Usagé</option>
                <option value="Endommagé">Endommagé</option>
              </select>
            </div>
          </div>

          <!-- ===== SECTION COMMANDE (Visible seulement si mode "En Commande") ===== -->
          <div id="sectionCommande" style="display: none;" class="mt-4">
            <div class="card border-warning mb-4">
              <div class="card-header bg-warning bg-opacity-10 border-warning py-2">
                <h6 class="mb-0 fw-bold"><i class="fas fa-shopping-cart me-2 text-warning"></i>Informations Commande Fournisseur</h6>
              </div>
              <div class="card-body">
                <div class="alert alert-info py-2 px-3 mb-3">
                  <small>
                    <i class="fas fa-info-circle me-2"></i>
                    Le stock ne sera ajouté au rayon que lors de la réception. Remplissez les détails de la commande.
                  </small>
                </div>
                <div class="row g-3">
                  <!-- Fournisseur -->
                  <div class="col-md-6">
                    <label class="form-label fw-bold">
                      <i class="fas fa-user-tie me-2 text-warning"></i>Fournisseur <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <select id="produitFournisseur" class="form-select">
                        <option value="">-- Choisir Fournisseur --</option>
                      </select>
                      <button class="btn btn-outline-warning" type="button" id="btnProduitNewFournisseur" title="Créer un nouveau fournisseur">
                        <i class="fas fa-plus me-1"></i> Nouveau
                      </button>
                    </div>
                  </div>

                  <!-- Marque -->
                  <div class="col-md-6">
                    <label class="form-label fw-bold">
                      <i class="fas fa-tag me-2 text-warning"></i>Marque <span class="text-danger">*</span>
                    </label>
                    <input type="text" id="produitMarque" class="form-control" placeholder="Ex: Samsung, LG, etc." />
                    <div class="invalid-feedback">Marque obligatoire</div>
                  </div>

                  <!-- Quantité Prévue - SIMPLE (défaut) -->
                  <div class="col-md-6" id="quantitePrevisionsSimple">
                    <label class="form-label fw-bold">
                      <i class="fas fa-boxes me-2 text-warning"></i>Quantité Prévue <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <input type="number" id="produitQuantiteCommande" class="form-control" min="1" step="0.01" placeholder="100">
                      <span class="input-group-text" id="produitCommandeQuantiteUnit">unité</span>
                    </div>
                  </div>

                  <!-- Quantité Prévue - LOT (caché au départ) -->
                  <div id="quantitePrevisionsLot" style="display: none;" class="col-md-12">
                    <div class="card bg-info bg-opacity-10 border-info mb-3">
                      <div class="card-header bg-info bg-opacity-10 border-info py-2">
                        <h6 class="mb-0 fw-bold">
                          <i class="fas fa-cube me-2"></i>Détails Quantité Prévue (LOT)
                        </h6>
                      </div>
                      <div class="card-body">
                        <div class="row g-3">
                          <!-- Nombre de Pièces -->
                          <div class="col-md-4">
                            <label class="form-label fw-bold">
                              <i class="fas fa-cube me-2"></i>Nombre de Pièces <span class="text-danger">*</span>
                            </label>
                            <div class="input-group">
                              <input type="number" id="produitNombrePieces" class="form-control form-control-lg" min="1" step="1" placeholder="Ex: 5">
                              <span class="input-group-text">pièces</span>
                            </div>
                            <small class="text-muted d-block mt-2">Rouleaux, cartons, reams...</small>
                          </div>
                          
                          <!-- Quantité par Pièce -->
                          <div class="col-md-4">
                            <label class="form-label fw-bold">
                              <i class="fas fa-weight me-2"></i>Quantité par Pièce <span class="text-danger">*</span>
                            </label>
                            <div class="input-group">
                              <input type="number" id="produitQuantiteParPiece" class="form-control form-control-lg" min="0.01" step="0.01" placeholder="100">
                              <span class="input-group-text" id="produitQuantiteParPieceUnit">unité</span>
                            </div>
                            <small class="text-muted d-block mt-2">Mètres, kg, litres...</small>
                          </div>
                          
                          <!-- Unité -->
                          <div class="col-md-4">
                            <label class="form-label fw-bold">
                              <i class="fas fa-ruler me-2"></i>Unité <span class="text-danger">*</span>
                            </label>
                            <select id="produitUniteDetail" class="form-select form-select-lg">
                              <option value="">-- Choisir unité --</option>
                            </select>
                            <small class="text-muted d-block mt-2">Mètre, kg, litre, etc.</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Date Réception Prévue -->
                  <div class="col-md-6">
                    <label class="form-label fw-bold">
                      <i class="fas fa-calendar-check me-2 text-warning"></i>Date Réception Prévue <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="fas fa-calendar"></i></span>
                      <input type="date" id="produitDateReception" class="form-control">
                    </div>
                    <small class="text-muted d-block mt-1">Délai calculé: <strong id="produitDelaiCalc">-</strong> jours</small>
                  </div>

                  <!-- État Attendu -->
                  <div class="col-md-6">
                    <label class="form-label fw-bold">
                      <i class="fas fa-check-circle me-2 text-warning"></i>État Attendu <span class="text-danger">*</span>
                    </label>
                    <select id="produitEtatCommande" class="form-select">
                      <option value="">-- Choisir État --</option>
                      <option value="Neuf">Neuf</option>
                      <option value="Bon état">Bon état</option>
                      <option value="Usagé">Usagé</option>
                      <option value="Endommagé">Endommagé</option>
                    </select>
                  </div>

                  <!-- Remarques -->
                  <div class="col-12">
                    <label class="form-label fw-bold">
                      <i class="fas fa-comment me-2 text-warning"></i>Remarques & Spécifications
                    </label>
                    <textarea id="produitRemarquesCommande" class="form-control" rows="2" placeholder="Spécifications, conditionnement, etc."></textarea>
                  </div>
                </div>
              </div>
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
          <button type="submit" id="btnEnregistrerProduit" class="btn btn-primary px-4">
            <i class="fas fa-save me-2"></i>Enregistrer Produit
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- ===== MODAL CREATION COMMANDE LIÉE ===== -->
<div class="modal fade" id="modalCreerCommande" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header bg-info bg-opacity-10 border-info">
        <h5 class="modal-title fw-bold">
          <i class="fas fa-shopping-cart me-2 text-info"></i>Créer Commande Liée
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <form id="formCreerCommande">
        <div class="modal-body">
          <!-- Produit créé (info) -->
          <div class="card bg-success bg-opacity-10 border-success mb-4">
            <div class="card-body">
              <h6 class="card-title text-success mb-3">
                <i class="fas fa-box me-2"></i>Produit Créé
              </h6>
              <div class="row g-3">
                <div class="col-md-6">
                  <small class="text-muted">Référence</small><br>
                  <strong id="commande_reference">-</strong>
                </div>
                <div class="col-md-6">
                  <small class="text-muted">Désignation</small><br>
                  <strong id="commande_designation">-</strong>
                </div>
              </div>
              <div class="alert alert-info mt-3 mb-0 py-2 px-3">
                <small>
                  <i class="fas fa-info-circle me-2"></i>
                  <strong>Note:</strong> Le stock ne sera ajouté au rayon que lors de la réception. Créez la commande maintenant pour tracer l'arrivée prévue.
                </small>
              </div>
            </div>
          </div>

          <!-- Informations Commande -->
          <div class="card border-info mb-4">
            <div class="card-header bg-info bg-opacity-10 border-info py-2">
              <h6 class="mb-0 fw-bold"><i class="fas fa-truck me-2 text-info"></i>Informations Commande</h6>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <!-- Fournisseur -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">
                    <i class="fas fa-user-tie me-2 text-info"></i>Fournisseur <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <select id="commandeFournisseur" class="form-select" required>
                      <option value="">-- Choisir Fournisseur --</option>
                    </select>
                    <button class="btn btn-outline-info" type="button" id="btnNewFournisseur" title="Créer un nouveau fournisseur">
                      <i class="fas fa-plus me-1"></i> Nouveau
                    </button>
                  </div>
                </div>

                <!-- Quantité Prévue -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">
                    <i class="fas fa-boxes me-2 text-info"></i>Quantité Prévue <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <input type="number" id="commandeQuantite" class="form-control" min="1" step="1" required placeholder="100">
                    <span class="input-group-text" id="commandeQuantiteUnit">unité</span>
                  </div>
                </div>

                <!-- Date Réception Prévue -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">
                    <i class="fas fa-calendar-check me-2 text-info"></i>Date Réception Prévue <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-calendar"></i></span>
                    <input type="date" id="commandeDateReception" class="form-control" required>
                  </div>
                  <small class="text-muted d-block mt-1">Délai calculé: <strong id="delimCalc">-</strong> jours</small>
                </div>

                <!-- État Attendu -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">
                    <i class="fas fa-check-circle me-2 text-info"></i>État Attendu <span class="text-danger">*</span>
                  </label>
                  <select id="commandeEtat" class="form-select" required>
                    <option value="">-- Choisir État --</option>
                    <option value="Neuf">Neuf</option>
                    <option value="Bon état">Bon état</option>
                    <option value="Usagé">Usagé</option>
                    <option value="Endommagé">Endommagé</option>
                  </select>
                </div>

                <!-- Remarques -->
                <div class="col-12">
                  <label class="form-label fw-bold">
                    <i class="fas fa-comment me-2 text-info"></i>Remarques & Spécifications
                  </label>
                  <textarea id="commandeRemarques" class="form-control" rows="3" placeholder="Spécifications, conditionnement, etc."></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Récapitulatif -->
          <div class="card bg-light border-secondary">
            <div class="card-body">
              <h6 class="card-title mb-3">
                <i class="fas fa-eye me-2 text-secondary"></i>Récapitulatif Commande
              </h6>
              <div class="row g-3">
                <div class="col-md-4 text-center">
                  <small class="text-muted">Fournisseur</small><br>
                  <strong id="recap_fournisseur" class="text-primary">-</strong>
                </div>
                <div class="col-md-4 text-center">
                  <small class="text-muted">Quantité</small><br>
                  <strong id="recap_quantite" class="text-success">-</strong>
                </div>
                <div class="col-md-4 text-center">
                  <small class="text-muted">Délai</small><br>
                  <strong id="recap_delai" class="text-warning">-</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer bg-light">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
          <button type="submit" id="btnCreerCommande" class="btn btn-success px-4">
            <i class="fas fa-cart-plus me-2"></i>Créer Commande
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- ===== MODAL CRÉER FOURNISSEUR ===== -->
<div class="modal fade" id="modalCreerFournisseur" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header bg-warning bg-opacity-10 border-warning">
        <h5 class="modal-title fw-bold">
          <i class="fas fa-user-plus me-2 text-warning"></i>Créer Nouveau Fournisseur
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <form id="formCreerFournisseur">
        <div class="modal-body">
          <div class="row g-3">
            <!-- Nom Fournisseur -->
            <div class="col-md-12">
              <label class="form-label fw-bold">
                <i class="fas fa-building me-2 text-warning"></i>Nom Fournisseur <span class="text-danger">*</span>
              </label>
              <input type="text" id="fournisseurNom" class="form-control" required placeholder="Ex: Entreprise ABC">
              <small class="text-muted d-block mt-1">Nom complet de la société</small>
            </div>

            <!-- Téléphone -->
            <div class="col-md-6">
              <label class="form-label fw-bold">
                <i class="fas fa-phone me-2 text-warning"></i>Numéro Téléphone <span class="text-danger">*</span>
              </label>
              <input type="tel" id="fournisseurTel" class="form-control" required placeholder="Ex: +243 123456789">
              <small class="text-muted d-block mt-1">Numéro de contact principal</small>
            </div>

            <!-- Email -->
            <div class="col-md-6">
              <label class="form-label fw-bold">
                <i class="fas fa-envelope me-2 text-warning"></i>Email
              </label>
              <input type="email" id="fournisseurEmail" class="form-control" placeholder="Ex: contact@fournisseur.com">
              <small class="text-muted d-block mt-1">Adresse email (optionnel)</small>
            </div>

            <!-- Adresse -->
            <div class="col-md-12">
              <label class="form-label fw-bold">
                <i class="fas fa-map-marker-alt me-2 text-warning"></i>Adresse <span class="text-danger">*</span>
              </label>
              <input type="text" id="fournisseurAdresse" class="form-control" required placeholder="Ex: Avenue de la Paix, 123">
              <small class="text-muted d-block mt-1">Adresse complète du fournisseur</small>
            </div>

            <!-- Ville -->
            <div class="col-md-6">
              <label class="form-label fw-bold">
                <i class="fas fa-city me-2 text-warning"></i>Ville
              </label>
              <input type="text" id="fournisseurVille" class="form-control" placeholder="Ex: Kinshasa">
              <small class="text-muted d-block mt-1">Ville (optionnel)</small>
            </div>

            <!-- Code Postal -->
            <div class="col-md-6">
              <label class="form-label fw-bold">
                <i class="fas fa-mailbox me-2 text-warning"></i>Code Postal
              </label>
              <input type="text" id="fournisseurCP" class="form-control" placeholder="Ex: 1234">
              <small class="text-muted d-block mt-1">Code postal (optionnel)</small>
            </div>
          </div>
        </div>

        <div class="modal-footer bg-light">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
          <button type="submit" id="btnSaveNewFournisseur" class="btn btn-warning px-4">
            <i class="fas fa-save me-2"></i>Créer Fournisseur
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
    let allRayons = [];
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
      
      // Charger aussi les rayons
      loadRayons();
    } catch (error) {
      console.error('❌ Erreur chargement catégories:', error);
    }
  }

  // ✅ Charger les rayons depuis l'API
  async function loadRayons() {
    try {
      const authToken = getAuthToken();
      console.log('🔵 Chargement des rayons pour magasin:', currentMagasinId);
      
      const response = await fetch(`${API_BASE}/magasins/${currentMagasinId}/rayons`, {
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
      allRayons = data || [];
      console.log('✅ Rayons chargés:', allRayons);
      
      // Afficher tous les rayons
      renderRayonsList(allRayons);
    } catch (error) {
      console.error('❌ Erreur chargement rayons:', error);
    }
  }

  // ✅ Afficher les rayons dans le select
  function renderRayonsList(rayons) {
    const select = document.getElementById('rayonId');
    // Garder l'option par défaut
    select.innerHTML = '<option value="">Choisir rayon...</option>';

    if (rayons.length === 0) {
      const option = document.createElement('option');
      option.textContent = 'Aucun rayon disponible';
      option.disabled = true;
      select.appendChild(option);
      return;
    }

    rayons.forEach(rayon => {
      const option = document.createElement('option');
      option.value = rayon._id;
      option.textContent = `${rayon.codeRayon} - ${rayon.nomRayon}`;
      select.appendChild(option);
    });
  }

  // ✅ Filtrer les rayons selon la catégorie sélectionnée
  function filterRayonsByCategorie(categorie) {
    if (!categorie || !allRayons.length) {
      renderRayonsList(allRayons);
      return;
    }

    // Filtrer les rayons qui acceptent ce type de produit
    const rayonsFilters = allRayons.filter(rayon => {
      // Si le rayon n'a pas de restrictions, il accepte tous les types
      if (!rayon.typesProduitsAutorises || rayon.typesProduitsAutorises.length === 0) {
        return true;
      }
      // Sinon, vérifier si notre catégorie est dans la liste
      // Note: typesProduitsAutorises peut être des objets (de .populate()) ou des IDs
      return rayon.typesProduitsAutorises.some(typeOrId => {
        const typeIdStr = (typeof typeOrId === 'object' && typeOrId._id) 
          ? typeOrId._id.toString() 
          : typeOrId.toString();
        return typeIdStr === categorie._id;
      });
    });

    console.log(`🔍 Rayons filtrés pour "${categorie.nomType}":`, rayonsFilters.length, 'sur', allRayons.length);

    // Afficher un avertissement s'il n'y a pas de rayons
    const rayonSelect = document.getElementById('rayonId');
    const warningMsg = document.createElement('div');
    warningMsg.id = 'rayonWarning';
    
    // Supprimer l'ancien message s'il existe
    const oldWarning = document.getElementById('rayonWarning');
    if (oldWarning) oldWarning.remove();

    if (rayonsFilters.length === 0) {
      warningMsg.className = 'alert alert-warning mt-2 mb-0 py-2';
      warningMsg.innerHTML = `
        <i class="fas fa-exclamation-triangle me-2"></i>
        <small>⚠️ Aucun rayon n'accepte le type "<strong>${categorie.nomType}</strong>"</small>
      `;
      rayonSelect.parentElement.insertAdjacentElement('afterend', warningMsg);
      renderRayonsList([]);
    } else {
      renderRayonsList(rayonsFilters);
    }
  }

  // ✅ Vérifier la capacité en temps réel (rayon + type de produit)
  // ✅ Vérifier la capacité en temps réel (rayon + type de produit)
  function verifierCapacites() {
    const quantite = parseFloat(document.getElementById('quantite').value) || 0;
    const rayonId = document.getElementById('rayonId').value;
    const categorieId = document.getElementById('categorieId').value;

    const alerteRayon = document.getElementById('alerteQuantiteRayon');
    const messageRayon = document.getElementById('messageQuantiteRayon');
    const alerteType = document.getElementById('alerteQuantiteType');
    const messageType = document.getElementById('messageQuantiteType');
    const alerteInfo = document.getElementById('alerteQuantiteInfo');
    const messageInfo = document.getElementById('messageQuantiteInfo');
    const submitBtn = document.getElementById('btnEnregistrerProduit');

    // Reset les alertes
    alerteRayon.style.display = 'none';
    alerteType.style.display = 'none';
    alerteInfo.style.display = 'none';
    
    // Par défaut, le bouton est activé
    if (submitBtn) submitBtn.disabled = false;

    if (quantite <= 0 || !rayonId || !categorieId) {
      return; // Pas assez d'infos
    }

    // Trouver le rayon
    const rayon = allRayons.find(r => r._id === rayonId);
    if (!rayon) return;

    // Trouver la catégorie
    const categorie = allCategories.find(c => c._id === categorieId);
    if (!categorie) return;

    // Flag pour tracker les erreurs
    let hasError = false;

    // ========== VÉRIFICATION CAPACITÉ RAYON ==========
    // La capacité du rayon est en UNITÉS (nombre d'articles/produits), pas en kg
    // Donc on compte 1 article = 1 unité, peu importe la quantité en kg
    const capaciteMaxRayon = rayon.capaciteMax || 100;
    
    // Obtenir le nombre EXACT de produits depuis les données du rayon (retourné par l'API)
    // Maintenant le backend retourne rayon.articles et rayon.stocks.articles
    let nombreProduitsEnRayon = 0;
    
    // Essayer d'abord rayon.articles (données root), puis rayon.stocks.articles (données imbriquées)
    if (rayon.articles !== undefined && rayon.articles !== null) {
      nombreProduitsEnRayon = parseInt(rayon.articles) || 0;
    } else if (rayon.stocks && rayon.stocks.articles) {
      const articlesStr = rayon.stocks.articles; // Format: "1/1"
      const match = articlesStr.match(/(\d+)\//);
      nombreProduitsEnRayon = match ? parseInt(match[1]) : 0;
    }
    
    const nombreProduitsApreAjout = nombreProduitsEnRayon + 1;  // On ajoute 1 produit
    
    // Afficher aussi la quantité en kg pour info
    const quantiteActuelleRayonKg = rayon.quantiteActuelle || 0;

    if (nombreProduitsApreAjout > capaciteMaxRayon) {
      alerteRayon.style.display = 'block';
      alerteRayon.classList.remove('alert-warning');
      alerteRayon.classList.add('alert-danger');
      const excedent = nombreProduitsApreAjout - capaciteMaxRayon;
      messageRayon.innerHTML = `<strong>❌ Capacité rayon dépassée!</strong> Le rayon peut contenir ${capaciteMaxRayon} articles. Actuellement: ${nombreProduitsEnRayon} article(s). Vous dépasseriez de ${excedent} article(s).<br><small>Stock actuel: ${quantiteActuelleRayonKg.toFixed(2)} ${categorie.unitePrincipale || 'unités'} | Vous ajouteriez: ${quantite.toFixed(2)} ${categorie.unitePrincipale || 'unités'}</small>`;
      hasError = true;
    } else if (nombreProduitsApreAjout > capaciteMaxRayon * 0.8) {
      alerteRayon.style.display = 'block';
      alerteRayon.classList.remove('alert-danger');
      alerteRayon.classList.add('alert-warning');
      const disponible = capaciteMaxRayon - nombreProduitsEnRayon;
      messageRayon.innerHTML = `<strong>⚠️ Rayon presque plein:</strong> Peut contenir ${capaciteMaxRayon} articles. Actuellement: ${nombreProduitsEnRayon} article(s). Disponible: ${disponible} article(s) (${Math.round((nombreProduitsApreAjout / capaciteMaxRayon) * 100)}% rempli).`;
    } else {
      const disponible = capaciteMaxRayon - nombreProduitsEnRayon;
      alerteInfo.style.display = 'block';
      messageInfo.innerHTML = `✅ Rayon: ${disponible} article(s) disponible(s) sur ${capaciteMaxRayon}.<br><small>Stock actuel: ${quantiteActuelleRayonKg.toFixed(2)} ${categorie.unitePrincipale || 'unités'} | Vous ajouteriez: ${quantite.toFixed(2)} ${categorie.unitePrincipale || 'unités'}</small>`;
    }

    // ========== VÉRIFICATION CAPACITÉ TYPE DE PRODUIT ==========
    if (categorie.capaciteMax) {
      const capaciteMaxType = categorie.capaciteMax;
      
      // ⚠️ IMPORTANT: La capacité type doit tenir compte du stock EXISTANT
      // Si capacité max = 10kg et qu'on a déjà 5kg, on peut ajouter max 5kg
      // categorie.stats.enStock contient le stock existant
      const stockExistantType = parseFloat(categorie.stats?.enStock || 0);
      const disponibleType = capaciteMaxType - stockExistantType;
      const quantiteApreAjout = stockExistantType + quantite;
      
      if (quantiteApreAjout > capaciteMaxType) {
        // L'utilisateur essaie d'ajouter plus que ce qui reste disponible
        alerteType.style.display = 'block';
        alerteType.classList.remove('alert-warning');
        alerteType.classList.add('alert-danger');
        const excedent = (quantiteApreAjout - capaciteMaxType).toFixed(2);
        messageType.innerHTML = `<strong>❌ Capacité type de produit dépassée!</strong> Type "${categorie.nomType}": Capacité max = ${capaciteMaxType} ${categorie.unitePrincipale || 'unités'}, Stock existant = ${stockExistantType.toFixed(2)}, Disponible = ${disponibleType.toFixed(2)}. Vous essayez d'ajouter ${quantite.toFixed(2)}, ce qui dépasse de ${excedent} ${categorie.unitePrincipale || 'unités'}.`;
        hasError = true;
      } else if (quantite > disponibleType * 0.8) {
        // L'utilisateur utilise 80% de ce qui reste
        alerteType.style.display = 'block';
        alerteType.classList.remove('alert-danger');
        alerteType.classList.add('alert-warning');
        const restantApreAjout = (disponibleType - quantite).toFixed(2);
        messageType.innerHTML = `<strong>⚠️ Quantité importante:</strong> Type "${categorie.nomType}": Capacité max = ${capaciteMaxType} ${categorie.unitePrincipale || 'unités'}, Stock existant = ${stockExistantType.toFixed(2)}, Disponible = ${disponibleType.toFixed(2)}. Vous ajouteriez ${quantite.toFixed(2)}, il resterait ${restantApreAjout} ${categorie.unitePrincipale || 'unités'}.`;
      } else {
        // C'est OK
        const restantApreAjout = (disponibleType - quantite).toFixed(2);
        alerteInfo.style.display = 'block';
        const sep = messageInfo.innerHTML ? '<br>' : '';
        messageInfo.innerHTML += `${sep}📦 Type "${categorie.nomType}": Stock existant = ${stockExistantType.toFixed(2)} ${categorie.unitePrincipale || 'unités'}, Disponible = ${disponibleType.toFixed(2)}, Après ajout = ${restantApreAjout} ${categorie.unitePrincipale || 'unités'}.`;
      }
    }

    // ========== DÉSACTIVER/ACTIVER LE BOUTON SUBMIT ==========
    if (submitBtn) {
      if (hasError) {
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled');
        submitBtn.title = '⛔ Corrigez les erreurs avant de continuer';
      } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled');
        submitBtn.title = '';
      }
    }
  }

  // ✅ Vérifier la capacité en temps réel (rayon + type de produit)
  function verificarRayonPlein(rayonId) {
    const alerte = document.getElementById('alerteRayonPlein');
    const messageSpan = document.getElementById('messageRayonPlein');
    
    if (!rayonId) {
      alerte.style.display = 'none';
      return;
    }

    // Trouver le rayon
    const rayon = allRayons.find(r => r._id === rayonId);
    if (!rayon) {
      alerte.style.display = 'none';
      return;
    }

    // Vérifier la capacité - NOMBRE D'ARTICLES (pas quantité de pièces!)
    const capaciteMax = rayon.capaciteMax || 100; // Par défaut 100 si non défini
    const nombreArticlesActuel = rayon.articles || 0;  // ✅ Nombre d'articles DIFFÉRENTS
    const pourcentageUtilisation = (nombreArticlesActuel / capaciteMax) * 100;

    console.log(`🔍 verificarRayonPlein: rayon=${rayon.nomRayon}, articles=${nombreArticlesActuel}/${capaciteMax}, %=${Math.round(pourcentageUtilisation)}`);

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
    
    // 🎯 FILTRER LES RAYONS selon cette catégorie
    filterRayonsByCategorie(categorie);

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
      
      // ✨ Afficher le "Stock Initial" par défaut
      const stockContainer = document.getElementById('stockInitialContainer');
      if (stockContainer) {
        stockContainer.style.display = 'block';
      }
      return;
    }

    console.log('✅ Catégorie sélectionnée:', categorie);
    console.log('   typeStockage:', categorie.typeStockage);

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

    // ✨ 3️⃣ GÉRER L'AFFICHAGE DU "STOCK INITIAL" SELON LE TYPE (SIMPLE vs LOT)
    const stockContainer = document.getElementById('stockInitialContainer');
    if (stockContainer) {
      if (categorie.typeStockage === 'lot') {
        // LOT: Cacher le "Stock Initial" (créé via réception)
        console.log('🎁 Type LOT - Cacher Stock Initial');
        stockContainer.style.display = 'none';
        document.getElementById('quantite').removeAttribute('required');
      } else {
        // SIMPLE: Afficher le "Stock Initial"
        console.log('📋 Type SIMPLE - Afficher Stock Initial');
        stockContainer.style.display = 'block';
        document.getElementById('quantite').setAttribute('required', '');
      }
    } else {
      console.warn('⚠️ stockInitialContainer non trouvé');
    }

    // 4️⃣ Afficher les champs supplémentaires si présents
    if (categorie.champsSupplementaires && categorie.champsSupplementaires.length > 0) {
      console.log('📋 Champs supplémentaires:', categorie.champsSupplementaires);
      displaySupplementaryFields(categorie.champsSupplementaires);
    } else {
      clearSupplementaryFields();
    }

    // 5️⃣ ✅ NOUVEAU: Adapter les champs de quantité prévue si en mode commande
    adaptQuantitePrevisionsToType();
  }

  // Afficher les champs supplémentaires
  function displaySupplementaryFields(champs) {
    console.log('🎯 Afficher champs supplémentaires:', champs);
  }

  // Effacer les champs supplémentaires
  function clearSupplementaryFields() {
    console.log('🧹 Champs supplémentaires effacés');
  }

  // ✅ NOUVEAU: Adapter les champs de quantité selon le type de produit (LOT vs SIMPLE)
  function adaptQuantitePrevisionsToType() {
    const categorieId = document.getElementById('categorieId').value;
    if (!categorieId) {
      console.log('❌ Aucune catégorie sélectionnée');
      return;
    }

    // Trouver la catégorie sélectionnée
    const categorie = allCategories.find(c => c._id === categorieId);
    if (!categorie) {
      console.log('❌ Catégorie non trouvée');
      return;
    }

    const isLot = categorie.typeStockage === 'lot';
    console.log(`📊 Adaptation quantité prévisions: ${isLot ? 'LOT' : 'SIMPLE'}`);

    const simpleDiv = document.getElementById('quantitePrevisionsSimple');
    const lotDiv = document.getElementById('quantitePrevisionsLot');

    if (isLot) {
      // Afficher les champs LOT, masquer le simple
      simpleDiv.style.display = 'none';
      lotDiv.style.display = 'block';

      // Remplir les unités de vente disponibles
      const unitSelect = document.getElementById('produitUniteDetail');
      unitSelect.innerHTML = '<option value="">-- Choisir unité --</option>';
      
      if (categorie.unitesVente && categorie.unitesVente.length > 0) {
        categorie.unitesVente.forEach(unite => {
          const option = document.createElement('option');
          option.value = unite;
          option.textContent = unite;
          unitSelect.appendChild(option);
        });
        console.log(`✅ ${categorie.unitesVente.length} unités disponibles`);
      } else {
        console.log('⚠️ Pas d\'unités configurées pour ce LOT');
      }
    } else {
      // Afficher le simple, masquer LOT
      simpleDiv.style.display = 'block';
      lotDiv.style.display = 'none';
    }

    // Mettre à jour les labels des unités
    const unitLabel = document.getElementById('produitCommandeQuantiteUnit');
    if (unitLabel) {
      unitLabel.textContent = categorie.unitePrincipaleStockage || 'unité';
    }
  }

  // ===== ÉVÉNEMENTS =====
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOMContentLoaded - add_prod.php');

    // Charger les catégories
    loadCategories();

    // ===== GESTION MODE ENTRÉE (Stock Initial vs En Commande) =====
    const modeStockRadio = document.getElementById('modeStockInitial');
    const modeCommandeRadio = document.getElementById('modeEnCommande');

    function toggleSectionCommande() {
      const sectionCommande = document.getElementById('sectionCommande');
      const stockContainer = document.getElementById('stockInitialContainer');
      const searchSection = document.getElementById('searchProductSection');
      const isCommande = document.querySelector('input[name="modeEntree"]:checked')?.value === 'commande';
      
      console.log(`🔄 Toggle Mode Entrée: isCommande=${isCommande}`);
      
      // Afficher/Masquer la section COMMANDE
      if (sectionCommande) {
        sectionCommande.style.display = isCommande ? 'block' : 'none';
        console.log(`   sectionCommande: ${isCommande ? '✅ affichée' : '❌ masquée'}`);
      } else {
        console.warn('⚠️ sectionCommande non trouvée');
      }

      // Afficher/Masquer la section RECHERCHE PRODUIT EXISTANT
      if (searchSection) {
        searchSection.style.display = isCommande ? 'block' : 'none';
        console.log(`   searchProductSection: ${isCommande ? '✅ affichée' : '❌ masquée'}`);
      }
      
      // Afficher/Masquer le STOCK INITIAL et mettre à jour l'attribut required
      if (stockContainer) {
        stockContainer.style.display = isCommande ? 'none' : 'block';
        const quantiteInput = document.getElementById('quantite');
        if (quantiteInput) {
          if (isCommande) {
            quantiteInput.removeAttribute('required');
            quantiteInput.value = '';
          } else {
            quantiteInput.setAttribute('required', 'required');
          }
        }
        console.log(`   stockInitialContainer: ${isCommande ? '❌ masqué' : '✅ affichée'}`);
      } else {
        console.warn('⚠️ stockInitialContainer non trouvée');
      }
      
      if (isCommande) {
        console.log('📦 Mode EN COMMANDE activé');
        // Charger les fournisseurs pour le mode commande
        loadFournisseursProduit();
        // Adapter les champs de quantité au type de produit
        adaptQuantitePrevisionsToType();
      } else {
        console.log('📦 Mode STOCK INITIAL activé');
      }
    }

    if (modeStockRadio) modeStockRadio.addEventListener('change', toggleSectionCommande);
    if (modeCommandeRadio) modeCommandeRadio.addEventListener('change', toggleSectionCommande);
    
    // ✅ Appeler une fois au chargement pour initialiser l'état
    toggleSectionCommande();

    // Charger les fournisseurs pour le mode commande dans produit
    async function loadFournisseursProduit() {
      try {
        console.log('🔵 Chargement des fournisseurs...');
        const response = await fetch(`${API_BASE}/fournisseurs`, {
          headers: { 'Authorization': `Bearer ${getAuthToken()}` }
        });

        if (response.ok) {
          const fournisseurs = await response.json();
          const select = document.getElementById('produitFournisseur');
          select.innerHTML = '<option value="">-- Choisir Fournisseur --</option>';
          
          fournisseurs.forEach(f => {
            const option = document.createElement('option');
            option.value = f._id;
            option.textContent = f.nom || f.name;
            select.appendChild(option);
          });
          console.log(`✅ ${fournisseurs.length} fournisseurs chargés`);
        } else {
          console.error('❌ Erreur chargement fournisseurs:', response.status);
          const select = document.getElementById('produitFournisseur');
          select.innerHTML = '<option value="">Erreur chargement fournisseurs</option>';
        }
      } catch (error) {
        console.error('❌ Erreur chargement fournisseurs:', error);
        const select = document.getElementById('produitFournisseur');
        select.innerHTML = '<option value="">Erreur réseau</option>';
      }
    }

    // Calculer délai automatiquement
    document.getElementById('produitDateReception').addEventListener('change', function() {
      const dateInput = this.value;
      if (!dateInput) {
        document.getElementById('produitDelaiCalc').textContent = '-';
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(dateInput + 'T00:00:00');
      const diffTime = selectedDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        document.getElementById('produitDelaiCalc').innerHTML = `<span class="text-danger">${-diffDays} jours (PASSÉ)</span>`;
      } else {
        document.getElementById('produitDelaiCalc').textContent = diffDays + ' jours';
      }
    });

    // Bouton créer nouveau fournisseur dans la section commande produit
    document.getElementById('btnProduitNewFournisseur').addEventListener('click', function(e) {
      e.preventDefault();
      // Réutiliser la même logique que modalCreerFournisseur
      document.getElementById('formCreerFournisseur').reset();
      const modal = new bootstrap.Modal(document.getElementById('modalCreerFournisseur'));
      modal.show();
    });

    // ✅ Listener pour vérifier rayon plein
    const rayonSelect = document.getElementById('rayonId');
    if (rayonSelect) {
      rayonSelect.addEventListener('change', function() {
        verificarRayonPlein(this.value);
        verifierCapacites(); // Vérifier aussi les capacités
      });
    }

    // ✅ Listener pour vérifier les capacités en temps réel (quantité)
    const quantiteInput = document.getElementById('quantite');
    if (quantiteInput) {
      quantiteInput.addEventListener('input', verifierCapacites);
    }

    // ✅ Listener pour vérifier les capacités quand catégorie change
    if (categorieSearch) {
      categorieSearch.addEventListener('input', function(e) {
        document.getElementById('categorieDropdown').style.display = 'block';
        filterCategories(e.target.value);
        setTimeout(verifierCapacites, 100);
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
      const dateReception = document.getElementById('dateReception').value;
      const dateFabrication = document.getElementById('dateFabrication').value;
      const datePeremption = document.getElementById('datePeremption').value;
      const statut = document.getElementById('statutProduit').value;
      const priorite = document.getElementById('prioriteProduit').value;
      isEnCommande = document.querySelector('input[name="modeEntree"]:checked')?.value === 'commande';

      if (!reference || !designation || !rayonId || !dateReception) {
        showNotification('⚠️ Veuillez remplir tous les champs obligatoires', 'warning');
        return;
      }

      // ✨ VALIDATION QUANTITÉ: Seulement en mode STOCK INITIAL
      // En mode EN COMMANDE: la quantité est définie lors de la réception
      if (!isEnCommande && selectedCategorie && selectedCategorie.typeStockage === 'simple' && quantite <= 0) {
        showNotification('⚠️ Veuillez entrer une quantité initiale valide', 'warning');
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
      const modeEntree = document.querySelector('input[name="modeEntree"]:checked').value;
      isEnCommande = modeEntree === 'commande';
      
      // 🎁 Déterminer si c'est un LOT OR SIMPLE
      const lotDiv = document.getElementById('quantitePrevisionsLot');
      const isLot = lotDiv && lotDiv.style.display !== 'none';
      
      const produitData = {
        reference,
        designation,
        typeProduitId: categorieId,
        // 🎁 IMPORTANT: Pour LOT, on envoie quand même le rayon, mais avec un flag pour ne pas créer de StockRayon
        rayonId: rayonId,
        isParentLot: isLot,  // ← Flag pour le backend: ne pas créer StockRayon pour ce produit
        // 🎯 Mode Stock Initial: utiliser la quantité saisie
        // Mode En Commande: quantité = 0 (sera ajoutée à la réception)
        quantiteEntree: isEnCommande ? 0 : quantite,
        prixUnitaire: parseFloat(document.getElementById('prixUnitaire').value) || 0,
        etat: isEnCommande ? 'EN_COMMANDE' : document.getElementById('etat').value,
        dateReception,
        dateFabrication,
        datePeremption,
        statut,
        priorite,
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

        // 📦 AVANT de réinitialiser, sauvegarder les infos de commande si nécessaire
        let commandeData = null;
        if (isEnCommande) {
          console.log('📦 Mode EN COMMANDE - Sauvegarder les données avant réinitialisation');
          
          // Vérifier si c'est un LOT ou SIMPLE
          const lotDiv = document.getElementById('quantitePrevisionsLot');
          const isLot = lotDiv && lotDiv.style.display !== 'none';

          if (isLot) {
            // Capturer les données LOT
            commandeData = {
              fournisseurId: document.getElementById('produitFournisseur').value,
              marque: document.getElementById('produitMarque').value,
              nombrePieces: parseInt(document.getElementById('produitNombrePieces').value) || 1,
              quantiteParPiece: parseFloat(document.getElementById('produitQuantiteParPiece').value) || 0,
              uniteDetail: document.getElementById('produitUniteDetail').value,
              // Calculer la quantité totale: nombrePieces × quantiteParPiece
              quantiteCommande: (parseInt(document.getElementById('produitNombrePieces').value) || 1) * (parseFloat(document.getElementById('produitQuantiteParPiece').value) || 0),
              dateReceptionCommande: document.getElementById('produitDateReception').value,
              etatCommande: document.getElementById('produitEtatCommande').value,
              remarquesCommande: document.getElementById('produitRemarquesCommande').value
            };
            console.log('💾 Données commande LOT sauvegardées:', commandeData);
          } else {
            // Capturer les données SIMPLE
            commandeData = {
              fournisseurId: document.getElementById('produitFournisseur').value,
              marque: document.getElementById('produitMarque').value,
              quantiteCommande: parseFloat(document.getElementById('produitQuantiteCommande').value),
              dateReceptionCommande: document.getElementById('produitDateReception').value,
              etatCommande: document.getElementById('produitEtatCommande').value,
              remarquesCommande: document.getElementById('produitRemarquesCommande').value
            };
            console.log('💾 Données commande SIMPLE sauvegardées:', commandeData);
          }
        }

        // Réinitialiser le formulaire
        document.getElementById('formAddProduit').reset();
        document.getElementById('selectedCategoriesList').innerHTML = '';
        document.getElementById('categorieId').value = '';
        document.getElementById('photoPreview').innerHTML = '<i class="fas fa-image fa-3x text-muted"></i><p class="text-muted mt-2 mb-0">Photo optionnelle</p>';
        uploadedPhotoUrl = null;
        selectedCategorie = null;

        // 🔄 Recharger le tableau des produits (appel window.loadProduits si disponible)
        if (typeof window.loadProduits === 'function') {
          console.log('🔄 Rechargement du tableau des produits...');
          window.loadProduits();
        }

        // 📦 Créer la commande si mode "En Commande"
        if (isEnCommande && commandeData) {
          console.log('📦 Mode EN COMMANDE - Créer la commande automatiquement');
          
          const fournisseurId = commandeData.fournisseurId;
          const quantiteCommande = commandeData.quantiteCommande;
          const dateReceptionCommande = commandeData.dateReceptionCommande;
          const etatCommande = commandeData.etatCommande;
          const remarquesCommande = commandeData.remarquesCommande;

          if (!fournisseurId || !quantiteCommande || !dateReceptionCommande || !etatCommande) {
            showNotification('⚠️ Veuillez remplir tous les champs de commande obligatoires', 'warning');
            return;
          }

          // Calculer délai
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const selectedDate = new Date(dateReceptionCommande + 'T00:00:00');
          const diffTime = selectedDate - today;
          const delaiLivraisonPrevu = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          try {
            showNotification('📤 Création de la commande...', 'info');

            // Récupérer magasinId
            const magasinId = sessionStorage.getItem('currentMagasinId') || 
                             (typeof window.stockConfig !== 'undefined' ? window.stockConfig.magasinId : null) ||
                             localStorage.getItem('currentMagasinId');

            if (!magasinId) {
              showNotification('⚠️ Erreur: magasinId non trouvé', 'warning');
              return;
            }

            console.log('📦 Création commande avec:', { produitId: produit._id, magasinId, fournisseurId, quantiteCommande, dateReceptionCommande });

            const marque = commandeData.marque || '';
            
            const commandeResponse = await fetch(`${API_BASE}/commandes`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
              },
              body: JSON.stringify({
                produitId: produit._id || produit.id,
                magasinId: magasinId,
                fournisseurId: fournisseurId,
                marque: marque,
                quantiteCommandee: quantiteCommande,
                delaiLivraisonPrevu: delaiLivraisonPrevu,
                dateEcheance: dateReceptionCommande,
                etatPrevu: etatCommande,
                remarques: remarquesCommande,
                // 🆕 Ajouter les données LOT si présentes
                nombrePieces: commandeData.nombrePieces || null,
                quantiteParPiece: commandeData.quantiteParPiece || null,
                uniteDetail: commandeData.uniteDetail || null,
                prixUnitaire: 0  // À remplir ultérieurement
              })
            });

            if (commandeResponse.ok) {
              const commande = await commandeResponse.json();
              showNotification('✅ Commande créée avec succès!', 'success');
              console.log('✅ Commande créée:', commande);
            } else {
              const error = await commandeResponse.json();
              const errorMsg = error.message || error.error || error.details || 'Erreur inconnue';
              console.error('❌ Erreur backend:', error);
              showNotification(`⚠️ Commande non créée: ${errorMsg}`, 'warning');
            }
          } catch (error) {
            console.error('❌ Erreur création commande:', error);
            showNotification(`⚠️ Erreur création commande: ${error.message}`, 'warning');
          }

          // Fermer et réinitialiser
          const modalProduit = bootstrap.Modal.getInstance(document.getElementById('modalProduit'));
          if (modalProduit) modalProduit.hide();
        } else {
          // Mode Stock Initial: ancieno workflow (pas de commande)
          setTimeout(() => {
            const modalProduit = bootstrap.Modal.getInstance(document.getElementById('modalProduit'));
            if (modalProduit) modalProduit.hide();
          }, 500);
        }

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
      toastContainer.style.zIndex = '2000'; // Au-dessus du modal Bootstrap (z-index: 1060)
      toastContainer.innerHTML = toastHtml;
      document.body.appendChild(toastContainer);

      const toast = new bootstrap.Toast(toastContainer.querySelector('.toast'));
      toast.show();

      // Supprimer après disparition
      setTimeout(() => toastContainer.remove(), 5000);
    }

    // ===== GESTION MODAL COMMANDE =====
    let lastCreatedProduct = null;

    document.getElementById('formAddProduit').addEventListener('submit', async function(e) {
      // Après succès de création, sauvegarder les infos pour la commande
      if (window.lastProductSubmitSuccess) {
        window.lastProductSubmitSuccess = false;
      }
    });

    // Quand le produit est créé avec succès, ouvrir la modal commande
    window.openCommandeModal = function(productData) {
      lastCreatedProduct = productData;
      document.getElementById('commande_reference').textContent = productData.reference || '-';
      document.getElementById('commande_designation').textContent = productData.designation || '-';
      
      // Charger les fournisseurs
      loadFournisseursForCommande();
      
      // Ouvrir le modal
      const modal = new bootstrap.Modal(document.getElementById('modalCreerCommande'));
      modal.show();
    };

    // Charger les fournisseurs disponibles
    async function loadFournisseursForCommande() {
      try {
        console.log('🔵 Chargement des fournisseurs...');
        const response = await fetch(`${API_BASE}/fournisseurs`, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        });

        if (response.ok) {
          const fournisseurs = await response.json();
          const select = document.getElementById('commandeFournisseur');
          select.innerHTML = '<option value="">-- Choisir Fournisseur --</option>';
          
          fournisseurs.forEach(f => {
            const option = document.createElement('option');
            option.value = f._id;
            option.textContent = f.nom || f.name;
            select.appendChild(option);
          });
          console.log(`✅ ${fournisseurs.length} fournisseurs chargés`);
        } else {
          console.error('❌ Erreur chargement fournisseurs:', response.status);
        }
      } catch (error) {
        console.error('❌ Erreur chargement fournisseurs:', error);
      }
    }

    // Mise à jour du récapitulatif commande
    document.getElementById('commandeFournisseur').addEventListener('change', updateCommandeRecap);
    document.getElementById('commandeQuantite').addEventListener('change', updateCommandeRecap);
    document.getElementById('commandeDateReception').addEventListener('change', updateCommandeRecap);

    // ===== CALCUL AUTOMATIQUE DÉLAI =====
    document.getElementById('commandeDateReception').addEventListener('change', function() {
      const dateInput = this.value;
      if (!dateInput) {
        document.getElementById('delimCalc').textContent = '-';
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const selectedDate = new Date(dateInput + 'T00:00:00');
      const diffTime = selectedDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        document.getElementById('delimCalc').innerHTML = `<span class="text-danger">${-diffDays} jours (PASSÉ)</span>`;
      } else {
        document.getElementById('delimCalc').textContent = diffDays + ' jours';
      }

      updateCommandeRecap();
    });

    // ===== BOUTON CRÉER NOUVEAU FOURNISSEUR =====
    document.getElementById('btnNewFournisseur').addEventListener('click', async function(e) {
      e.preventDefault();
      
      // Réinitialiser le formulaire
      document.getElementById('formCreerFournisseur').reset();
      
      // Ouvrir la modal
      const modal = new bootstrap.Modal(document.getElementById('modalCreerFournisseur'));
      modal.show();
    });

    // ===== SOUMETTRE LA CRÉATION DU FOURNISSEUR =====
    document.getElementById('formCreerFournisseur').addEventListener('submit', async function(e) {
      e.preventDefault();

      const nom = document.getElementById('fournisseurNom').value.trim();
      const telephone = document.getElementById('fournisseurTel').value.trim();
      const email = document.getElementById('fournisseurEmail').value.trim();
      const adresse = document.getElementById('fournisseurAdresse').value.trim();
      const ville = document.getElementById('fournisseurVille').value.trim();
      const codePostal = document.getElementById('fournisseurCP').value.trim();

      if (!nom || !telephone || !adresse) {
        showNotification('⚠️ Veuillez remplir tous les champs obligatoires (Nom, Téléphone, Adresse)', 'warning');
        return;
      }

      try {
        const submitBtn = document.getElementById('btnSaveNewFournisseur');
        submitBtn.disabled = true;
        showNotification('📤 Création du fournisseur...', 'info');
        
        const response = await fetch(`${API_BASE}/fournisseurs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({
            nom: nom,
            telephone: telephone,
            email: email,
            adresse: adresse,
            ville: ville,
            codePostal: codePostal,
            paysId: null
          })
        });

        if (response.ok) {
          const newFournisseur = await response.json();
          showNotification(`✅ Fournisseur "${nom}" créé avec succès!`, 'success');
          
          // Fermer la modal
          bootstrap.Modal.getInstance(document.getElementById('modalCreerFournisseur')).hide();
          
          // Recharger les fournisseurs
          loadFournisseursForCommande();
          
          // Sélectionner le nouveau fournisseur
          setTimeout(() => {
            const select = document.getElementById('commandeFournisseur');
            select.value = newFournisseur._id || newFournisseur.id;
            updateCommandeRecap();
          }, 500);
        } else {
          const error = await response.json();
          showNotification(`❌ Erreur: ${error.message || 'Erreur création fournisseur'}`, 'danger');
        }

        submitBtn.disabled = false;
      } catch (error) {
        console.error('❌ Erreur:', error);
        showNotification(`❌ Erreur réseau: ${error.message}`, 'danger');
        document.getElementById('btnSaveNewFournisseur').disabled = false;
      }
    });

    function updateCommandeRecap() {
      const fournisseur = document.querySelector('#commandeFournisseur option:checked').textContent;
      const quantite = document.getElementById('commandeQuantite').value || '-';
      const delai = document.getElementById('delimCalc').textContent || '-';
      
      document.getElementById('recap_fournisseur').textContent = fournisseur;
      document.getElementById('recap_quantite').textContent = quantite + ' unités';
      document.getElementById('recap_delai').textContent = delai;
    }

    // Soumettre la commande
    document.getElementById('formCreerCommande').addEventListener('submit', async function(e) {
      e.preventDefault();

      if (!lastCreatedProduct) {
        showNotification('❌ Erreur: produit non trouvé', 'danger');
        return;
      }

      const fournisseurId = document.getElementById('commandeFournisseur').value;
      const quantite = parseFloat(document.getElementById('commandeQuantite').value);
      const dateReception = document.getElementById('commandeDateReception').value;
      const etat = document.getElementById('commandeEtat').value;
      const remarques = document.getElementById('commandeRemarques').value;

      if (!fournisseurId || !quantite || !dateReception || !etat) {
        showNotification('⚠️ Veuillez remplir tous les champs obligatoires', 'warning');
        return;
      }

      // Calculer le délai en jours
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(dateReception + 'T00:00:00');
      const diffTime = selectedDate - today;
      const delaiLivraisonPrevu = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      try {
        const submitBtn = document.getElementById('btnCreerCommande');
        submitBtn.disabled = true;
        showNotification('📤 Création de la commande...', 'info');

        const response = await fetch(`${API_BASE}/commandes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({
            produitId: lastCreatedProduct._id || lastCreatedProduct.id,
            fournisseurId: fournisseurId,
            quantiteCommandee: quantite,
            delaiLivraisonPrevu: delaiLivraisonPrevu,
            dateReceptionPrevue: dateReception,
            etatPrevu: etat,
            remarques: remarques
          })
        });

        if (response.ok) {
          const commande = await response.json();
          showNotification('✅ Commande créée avec succès!', 'success');
          
          // Fermer les modals
          bootstrap.Modal.getInstance(document.getElementById('modalCreerCommande')).hide();
          bootstrap.Modal.getInstance(document.getElementById('modalProduit')).hide();
          
          // Réinitialiser le formulaire
          document.getElementById('formCreerCommande').reset();
          lastCreatedProduct = null;
          updateCommandeRecap();
        } else {
          const error = await response.json();
          showNotification(`❌ Erreur: ${error.message || 'Erreur lors de la création'}`, 'danger');
        }

        submitBtn.disabled = false;
      } catch (error) {
        console.error('❌ Erreur:', error);
        showNotification(`❌ Erreur réseau: ${error.message}`, 'danger');
        document.getElementById('btnCreerCommande').disabled = false;
      }
    });

    // ===== RECHERCHE DE PRODUITS EXISTANTS =====
    const searchInput = document.getElementById('searchExistingProduct');
    const searchDropdown = document.getElementById('searchResultsDropdown');
    const searchList = document.getElementById('searchResultsList');
    let searchTimeout;

    async function searchExistingProducts(term) {
      if (!term || term.trim().length < 2) {
        searchDropdown.style.display = 'none';
        return;
      }

      try {
        const authToken = getAuthToken();
        console.log(`🔍 Recherche produits: "${term}"`);

        const response = await fetch(
          `${API_BASE}/magasins/${currentMagasinId}/produits?search=${encodeURIComponent(term)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          }
        );

        if (!response.ok) {
          console.error('❌ Erreur recherche:', response.status);
          return;
        }

        const produits = await response.json();
        searchList.innerHTML = '';

        if (produits.length === 0) {
          searchList.innerHTML = `
            <div class="list-group-item text-muted text-center py-3">
              <i class="fas fa-search me-2"></i>Aucun produit trouvé
            </div>
          `;
        } else {
          produits.slice(0, 10).forEach(produit => {
            const badge = produit.quantiteActuelle > 0 
              ? `<span class="badge bg-success ms-2">${produit.quantiteActuelle} stock</span>`
              : `<span class="badge bg-warning text-dark ms-2">${produit.etat}</span>`;
            
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <strong>${produit.reference}</strong> - ${produit.designation}
                  ${badge}
                </div>
                <small class="text-muted">${produit.typeProduitName || 'N/A'}</small>
              </div>
            `;

            item.addEventListener('click', (e) => {
              e.preventDefault();
              selectExistingProduct(produit);
            });

            searchList.appendChild(item);
          });
        }

        searchDropdown.style.display = 'block';
      } catch (error) {
        console.error('❌ Erreur recherche:', error);
        searchList.innerHTML = `
          <div class="list-group-item text-danger text-center py-3">
            <i class="fas fa-exclamation-triangle me-2"></i>Erreur lors de la recherche
          </div>
        `;
        searchDropdown.style.display = 'block';
      }
    }

    function selectExistingProduct(produit) {
      console.log('✅ Produit sélectionné:', produit);
      
      // Pré-remplir les champs
      document.getElementById('reference').value = produit.reference || '';
      document.getElementById('designation').value = produit.designation || '';
      document.getElementById('produitId').value = produit._id || produit.id || '';
      
      // Si c'est un produit existant, on cache le champ d'ajout
      // On passe en mode "modification" / "réception"
      
      // Cacher le dropdown
      searchDropdown.style.display = 'none';
      searchInput.value = `${produit.reference} - ${produit.designation}`;
      
      // Marquer comme produit existant (optionnel)
      searchInput.dataset.selected = produit._id || produit.id;
      
      showNotification(`✅ Produit "${produit.reference}" sélectionné`, 'success');
    }

    // Event listener sur l'input de recherche
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const term = e.target.value.trim();
        
        searchTimeout = setTimeout(() => {
          if (term.length < 2) {
            searchDropdown.style.display = 'none';
          } else {
            searchExistingProducts(term);
          }
        }, 300); // Débounce 300ms
      });

      // Cacher le dropdown quand on clique ailleurs
      document.addEventListener('click', function(e) {
        if (!e.target.closest('#searchExistingProduct') && !e.target.closest('#searchResultsDropdown')) {
          searchDropdown.style.display = 'none';
        }
      });
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
        // Réinitialiser la recherche
        searchInput.value = '';
        searchInput.dataset.selected = '';
        searchDropdown.style.display = 'none';
      });
    }
  })(); // Fin du module
</script>
