

<!-- ====================================================== -->
<!-- MODAL CRÉER MAGASIN (Glassmorphism + Animations) -->
<!-- ====================================================== -->
<div class="modal fade" id="modalCreateMagasin" tabindex="-1" data-bs-backdrop="static">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-xl overflow-hidden" style="backdrop-filter: blur(20px); background: rgba(255,255,255,0.95);">
            <div class="modal-header border-0 bg-gradient-primary text-white position-relative">
                <div class="position-absolute start-0 top-50 translate-middle-y ms-4">
                    <div class="avatar avatar-xl">
                        <div class="avatar-initial rounded-circle bg-white bg-opacity-20 fs-2">
                            <i class="fas fa-store"></i>
                        </div>
                    </div>
                </div>
                <h4 class="modal-title fw-bold mb-0 ms-5">
                    <i class="fas fa-plus-circle me-2"></i>Nouveau Magasin
                </h4>
                <button type="button" class="btn-close btn-close-black" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="container-fluid">
                     <form id="formCreateMagasin">
                <div class="modal-body p-4">
                    <!-- ETAPE 1: Infos Principales -->
                    <div id="magasinStep1">
                        <div class="row g-3 mb-4">
                            <div class="col-12">
                                <label class="form-label fw-semibold">Nom du magasin <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light">
                                        <i class="fas fa-store text-primary"></i>
                                    </span>
                                    <input type="text" class="form-control fw-semibold fs-1" name="nom_magasin" required 
                                           placeholder="Ex: Magasin Central Goma">
                                    <span class="invalid-feedback"></span>
                                </div>
                            </div>
                            <input type="hidden" name="businessId" id="magasinBusinessId">
                            <div class="col-12">
                                <label class="form-label">Gestionnaire (obligatoire)</label>
                                <select name="managerId" id="magasinManagerId" class="form-select" required>
                                    <option value="">Chargement des gestionnaires…</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Adresse complète</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-map-marker-alt"></i></span>
                                    <input type="text" class="form-control" name="adresse" placeholder="Av. des Volcans, Goma">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Téléphone</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-phone"></i></span>
                                    <input type="tel" class="form-control" name="telephone" placeholder="+243 99X XXX XXX">
                                </div>
                            </div>
                        </div>

                        <!-- Coordonnées GPS (Optionnel) -->
                        <div class="row g-3 mb-4">
                            <div class="col-md-6">
                                <label class="form-label">Latitude</label>
                                <input type="number" step="any" class="form-control" name="latitude" placeholder="0.000000">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Longitude</label>
                                <input type="number" step="any" class="form-control" name="longitude" placeholder="0.000000">
                            </div>
                        </div>

                        <!-- Photo Magasin (drag & drop + preview) -->
                        <div class="mb-4">
                            <label class="form-label">Photo du magasin (optionnel)</label>
                            <div id="magasinPhotoDropArea" class="border rounded-3 p-3 text-center bg-light" style="position:relative; cursor: pointer;">
                                <input type="file" class="form-control d-none" id="magasinPhotoInput" name="photo" accept="image/*">
                                
                                <!-- Zone d'upload (texte + bouton) -->
                                <div id="magasinPhotoUploadZone" class="d-flex flex-column align-items-center justify-content-center py-3" style="min-height:120px; display:flex;">
                                    <i class="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
                                    <div class="small text-muted">Glisser-déposer l'image ici ou</div>
                                    <label for="magasinPhotoInput" class="btn btn-outline-primary rounded-pill px-4 mt-2">
                                        <i class="fas fa-camera me-2"></i>Choisir une photo
                                    </label>
                                    <div class="small text-500 mt-2 text-muted">PNG, JPG — max 5MB</div>
                                </div>
                                
                                <!-- Preview image -->
                                <div id="magasinPhotoPreview" style="display:none;">
                                    <div class="position-relative">
                                        <img src="" alt="Preview" 
                                             class="rounded-4 shadow-sm" style="max-height: 220px; width: 100%; object-fit: cover;">
                                        <button type="button" id="magasinPhotoRemove" class="btn btn-sm btn-danger position-absolute" 
                                                style="top:8px; right:8px; z-index: 10;">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer border-0 bg-light px-4 py-3">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times me-2"></i>Annuler
                    </button>
                    <button type="submit" class="btn btn-primary px-4">
                        <i class="fas fa-save me-2"></i>Créer Magasin
                        <span class="spinner-border spinner-border-sm ms-2 d-none" id="submitSpinner1"></span>
                    </button>
                </div>
            </form>
                </div>
            </div>

           
        </div>
    </div>
</div>

<!-- ====================================================== -->
<!-- MODAL CRÉER GUICHET (Compact + Stats intégrées) -->
<!-- ====================================================== -->
<div class="modal fade" id="modalCreateGuichet" tabindex="-1" data-bs-backdrop="static">
    <div class="modal-dialog modal-md modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
            <div class="modal-header border-0 bg-gradient-success text-white rounded-top-3">
                <h5 class="modal-title mb-0">
                    <i class="fas fa-cash-register me-2"></i>Nouveau Guichet
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>

            <form id="formCreateGuichet">
                <div class="modal-body p-4">
                    <input type="hidden" name="magasinId" id="guichetMagasinId">
                    
                    <div class="mb-4">
                        <label class="form-label fw-semibold">Nom du guichet <span class="text-danger">*</span></label>
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="fas fa-hashtag text-success"></i>
                            </span>
                            <input type="text" class="form-control fw-semibold" name="nomGuichet" required 
                                   placeholder="Ex: Guichet 001">
                        </div>
                    </div>

                    <div class="row g-3 mb-4">
                        <div class="col-6">
                            <label class="form-label">Code court</label>
                            <input type="text" class="form-control text-center fw-bold fs-5 text-primary" 
                                   name="codeGuichet" maxlength="6" placeholder="G001">
                        </div>
                        <div class="col-6">
                            <label class="form-label">Statut</label>
                            <select class="form-select" name="status">
                                <option value="1">🟢 Actif</option>
                                <option value="0">🔴 Inactif</option>
                            </select>
                        </div>
                    </div>

                    <!-- Vendeurs pré-assignés -->
                    <div class="mb-4">
                        <label class="form-label">Vendeur principal (optionnel)</label>
                        <select class="form-select" name="vendeurPrincipal">
                            <option value="">Sélectionner...</option>
                            <!-- Dynamique via JS -->
                        </select>
                    </div>

                    <!-- Objectifs CA -->
                    <div class="row g-3">
                        <div class="col-6">
                            <label class="form-label">Objectif journalier</label>
                            <div class="input-group">
                                <span class="input-group-text">CDF</span>
                                <input type="number" class="form-control" name="objectifJournalier" value="50000">
                            </div>
                        </div>
                        <div class="col-6">
                            <label class="form-label">Limite stock max</label>
                            <input type="number" class="form-control" name="stockMax" value="1000">
                        </div>
                    </div>
                </div>

                <div class="modal-footer border-0 bg-light px-4 py-3 rounded-bottom-3">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button type="submit" class="btn btn-success px-4">
                        <i class="fas fa-check me-2"></i>Créer Guichet
                        <span class="spinner-border spinner-border-sm ms-2 d-none" id="submitSpinner2"></span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- ====================================================== -->
<!-- MODAL ÉDITER GUICHET (FORMULAIRE COMPLET) -->
<!-- ====================================================== -->
<div class="modal fade" id="modalEditGuichet" tabindex="-1" data-bs-backdrop="static">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
            <div class="modal-header border-0 bg-gradient-warning text-white rounded-top-3">
                <h5 class="modal-title mb-0">
                    <i class="fas fa-edit me-2"></i>Modifier Guichet
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>

            <form id="formEditGuichet">
                <div class="modal-body p-4">
                    <input type="hidden" id="editGuichetId">
                    <input type="hidden" id="editGuichetMagasinId">
                    <input type="hidden" id="editGuichetEntrepriseId">
                    
                    <div class="row g-3">
                        <!-- Nom du guichet -->
                        <div class="col-12">
                            <label class="form-label fw-semibold">Nom du guichet <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i class="fas fa-cash-register text-warning"></i>
                                </span>
                                <input type="text" class="form-control fw-semibold" id="editGuichetNom" required>
                            </div>
                        </div>

                        <!-- Code + Status -->
                        <div class="col-md-6">
                            <label class="form-label">Code court</label>
                            <input type="text" class="form-control text-center fw-bold fs-5 text-primary" 
                                   id="editGuichetCode" maxlength="6">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Statut</label>
                            <select class="form-select" id="editGuichetStatus">
                                <option value="1">🟢 Actif</option>
                                <option value="0">🔴 Inactif</option>
                            </select>
                        </div>

                        <!-- Vendeur -->
                        <div class="col-12">
                            <label class="form-label">Vendeur principal</label>
                            <select class="form-select" id="editGuichetVendeur">
                                <option value="">Sélectionner un vendeur...</option>
                            </select>
                        </div>

                        <!-- Objectifs -->
                        <div class="col-md-6">
                            <label class="form-label">Objectif journalier</label>
                            <div class="input-group">
                                <span class="input-group-text">CDF</span>
                                <input type="number" class="form-control" id="editGuichetObjectif" value="50000">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Limite stock max</label>
                            <input type="number" class="form-control" id="editGuichetStockMax" value="1000">
                        </div>
                    </div>
                </div>

                <div class="modal-footer border-0 bg-light px-4 py-3 rounded-bottom-3">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button type="submit" class="btn btn-warning px-4">
                        <i class="fas fa-save me-2"></i>Enregistrer
                        <span class="spinner-border spinner-border-sm ms-2 d-none"></span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

 <!-- MODAL GUICHET ULTRA-DETAIL (APPROCHE HYBRIDE) -->
<div class="modal fade" id="modalGuichetDetails" tabindex="-1" data-bs-backdrop="static">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-xl overflow-hidden">
            <!-- HEADER GRADIENT DYNAMIQUE -->
            <div class="modal-header border-0" id="guichetModalHeader" style="background: linear-gradient(135deg, #1269f5ff 0%, #164ff9ff 100%); position: sticky; top: 0; z-index: 10;">
                <div class="d-flex align-items-center gap-3 w-100">
                    <div id="guichetAvatar" style="width:60px;height:60px;border-radius:12px;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <i class="fas fa-cash-register fa-2x text-white"></i>
                    </div>
                    <div class="flex-grow-1">
                        <h4 class="mb-1 text-white fw-bold" id="guichetNom">Guichet rgba(255, 255, 255, 1)</h4>
                        <div class="d-flex gap-2 align-items-center">
                            <span class="badge bg-white text-primary" id="guichetStatus">En attente</span>
                            <small class="text-white" id="guichetSubtitle">Vendeur: -</small>
                        </div>
                    </div>
                </div>
                <div class="btn-group">
                    <button class="btn btn-sm btn-light" id="editGuichetModal" title="Modifier"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-light" id="btnCloturerCaissier" title="Clôturer caissier"><i class="fas fa-lock"></i></button>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
            </div>

            <div class="modal-body p-0">
                <!-- SPINNER + PLACEHOLDER -->
                <div id="guichetSpinner" class="d-flex align-items-center justify-content-center" style="min-height:600px;display:none;">
                    <div class="text-center">
                        <div class="spinner-border text-primary mb-3" role="status"></div>
                        <p class="text-muted">Chargement des détails...</p>
                    </div>
                </div>

                <div id="guichetPlaceholder" class="d-flex align-items-center justify-content-center text-center p-5" style="min-height:600px;">
                    <div>
                        <i class="fas fa-cash-register fa-4x text-muted mb-4" style="opacity:0.3;"></i>
                        <h5 class="text-muted">Sélectionnez un guichet</h5>
                    </div>
                </div>

                <!-- CONTENU PRINCIPAL (Rempli par JS) -->
                <div id="guichetContent" style="display:none;">
                    <!-- ROW 1: STATS PRINCIPALES -->
                    <div class="p-4 border-bottom">
                        <div class="row g-3">
                            <div class="col-md-3">
                                <div class="card border-0 bg-light rounded-3 text-center p-3">
                                    <i class="fas fa-money-bill-wave text-success fa-2x mb-2"></i>
                                    <p class="text-muted small mb-1">CA Aujourd'hui</p>
                                    <h5 class="text-success fw-bold" id="guichetCaJour">0 CDF</h5>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card border-0 bg-light rounded-3 text-center p-3">
                                    <i class="fas fa-box-open text-info fa-2x mb-2"></i>
                                    <p class="text-muted small mb-1">Produits Vendus</p>
                                    <h5 class="text-info fw-bold" id="guichetNbProduits">0</h5>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card border-0 bg-light rounded-3 text-center p-3">
                                    <i class="fas fa-receipt text-primary fa-2x mb-2"></i>
                                    <p class="text-muted small mb-1">Nb Transactions</p>
                                    <h5 class="text-primary fw-bold" id="guichetNbTransactions">0</h5>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card border-0 bg-light rounded-3 text-center p-3">
                                    <i class="fas fa-percent text-warning fa-2x mb-2"></i>
                                    <p class="text-muted small mb-1">Marge Moyenne</p>
                                    <h5 class="text-warning fw-bold" id="guichetMargeMoyenne">0%</h5>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ROW 2: GRAPHIQUE VENTES -->
                    <div class="p-4 border-bottom">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <h6 class="fw-bold mb-0">
                                <i class="fas fa-chart-line text-primary me-2"></i>Ventes par Heure
                            </h6>
                            <small class="text-muted">Aujourd'hui</small>
                        </div>
                        <div style="position: relative; height: 250px;">
                            <canvas id="guichetChart"></canvas>
                        </div>
                    </div>

                    <!-- ROW 3: TABLE PRODUITS VENDUS -->
                    <div class="p-4 border-bottom">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <h6 class="fw-bold mb-0">
                                <i class="fas fa-shopping-bag text-success me-2"></i>Produits Vendus Aujourd'hui
                            </h6>
                            <span class="badge bg-success" id="guichetNbProduitsUnique">0</span>
                        </div>

                        <!-- Table Responsive -->
                        <div class="table-responsive">
                            <table class="table table-hover table-sm mb-0" id="guichetProduitsTable">
                                <thead class="table-light fw-bold">
                                    <tr>
                                        <th style="width:35%;"><i class="fas fa-boxes text-primary me-1"></i>Produit</th>
                                        <th style="width:18%;" class="text-center"><i class="fas fa-tag text-info me-1"></i>Catégorie</th>
                                        <th style="width:12%;" class="text-end"><i class="fas fa-cubes text-success me-1"></i>Qté</th>
                                        <th style="width:18%;" class="text-end"><i class="fas fa-coins text-warning me-1"></i>P.U.</th>
                                        <th style="width:20%;" class="text-end"><i class="fas fa-chart-bar text-danger me-1"></i>Total</th>
                                        <th style="width:10%;" class="text-center"><i class="fas fa-percent text-secondary me-1"></i>Marge</th>
                                    </tr>
                                </thead>
                                <tbody id="guichetProduitsVendusTable">
                                    <tr><td colspan="6" class="text-center text-muted py-4"><i class="fas fa-inbox me-2"></i>Aucun produit vendu</td></tr>
                                </tbody>
                                <tfoot class="table-light fw-bold border-top-2">
                                    <tr>
                                        <td colspan="3" class="text-end">
                                            <strong>TOTAL</strong>
                                        </td>
                                        <td class="text-end">-</td>
                                        <td class="text-end text-success" id="guichetTotalVentes">0 CDF</td>
                                        <td class="text-center"><span class="badge bg-secondary" id="guichetMoyenneMarge">0%</span></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <!-- ROW 4: ACTIONS RAPIDES -->
                    <div class="p-4 bg-light border-top">
                        <p class="text-muted small mb-3"><i class="fas fa-bolt text-warning me-2"></i>Actions Rapides</p>
                        <div class="d-grid gap-2 d-md-flex">
                            <button class="btn btn-sm btn-outline-primary" id="btnExportGuichet" title="Exporter les données">
                                <i class="fas fa-download me-1"></i>Exporter
                            </button>
                            <button class="btn btn-sm btn-outline-success" id="btnImprimerGuichet" title="Imprimer le détail">
                                <i class="fas fa-print me-1"></i>Imprimer
                            </button>
                            <button class="btn btn-sm btn-outline-info" id="btnTransfertGuichet" title="Transfert produits">
                                <i class="fas fa-exchange-alt me-1"></i>Transfert
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- ====================================================== -->
<!-- MODAL ÉDITER MAGASIN (Avancé avec historique) -->
<!-- ====================================================== -->
<div class="modal fade" id="modalEditMagasin" tabindex="-1">
    <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content border-0 shadow-2xl">
            <div class="modal-header bg-gradient-warning text-white">
                <h5 class="modal-title">
                    <i class="fas fa-edit me-2"></i>Modifier <span id="editMagasinName"></span>
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form id="formEditMagasin">
                <div class="modal-body p-4">
                    <input type="hidden" name="magasinId" id="editMagasinId">
                    
                    <!-- TABS: Infos | Stats | Historique -->
                    <ul class="nav nav-tabs border-bottom-0 mb-4" id="editMagasinTabs">
                        <li class="nav-item">
                            <a class="nav-link active" data-bs-toggle="tab" href="#editInfos">
                                <i class="fas fa-info-circle me-1"></i>Infos
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-bs-toggle="tab" href="#editStats">
                                <i class="fas fa-chart-bar me-1"></i>Stats
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-bs-toggle="tab" href="#editHistory">
                                <i class="fas fa-history me-1"></i>Historique
                            </a>
                        </li>
                    </ul>

                    <div class="tab-content">
                        <!-- TAB 1: Infos (champs éditables) -->
                        <div class="tab-pane fade show active" id="editInfos">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Nom</label>
                                    <div class="input-group">
                                        <span class="input-group-text">
                                            <i class="fas fa-store text-primary"></i>
                                        </span>
                                        <input type="text" class="form-control" id="editMagasinNom" name="nomMagasin" required placeholder="Nom du magasin">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Gestionnaire</label>
                                    <select class="form-select" id="editMagasinManagerId" name="managerId">
                                        <option value="">Chargement des gestionnaires…</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Adresse</label>
                                    <div class="input-group">
                                        <span class="input-group-text">
                                            <i class="fas fa-map-marker-alt"></i>
                                        </span>
                                        <input type="text" class="form-control" id="editMagasinAdresse" name="adresse" placeholder="Adresse complète">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Téléphone</label>
                                    <div class="input-group">
                                        <span class="input-group-text">
                                            <i class="fas fa-phone"></i>
                                        </span>
                                        <input type="tel" class="form-control" id="editMagasinTelephone" name="telephone" placeholder="+243 99X XXX XXX">
                                    </div>
                                </div>
                                <div class="col-12">
                                    <label class="form-label">Description</label>
                                    <textarea class="form-control" id="editMagasinDescription" name="description" rows="3" placeholder="Description du magasin..."></textarea>
                                </div>
                                <div class="col-12">
                                    <label class="form-label">Photo</label>
                                    <input type="file" class="form-control d-none" id="editMagasinPhotoInput" name="photo" accept="image/*">
                                    <div class="d-flex align-items-center gap-3">
                                        <label for="editMagasinPhotoInput" class="btn btn-outline-secondary btn-sm">
                                            <i class="fas fa-camera me-2"></i>Remplacer photo
                                        </label>
                                        <div id="editMagasinPhotoPreview" style="width:100px;height:100px;overflow:hidden;border-radius:8px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;">
                                            <img src="assets/img/placeholders/photo-placeholder.jpg" alt="preview" style="width:100%;height:100%;object-fit:cover;" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- TAB 2: Stats -->
                        <div class="tab-pane fade" id="editStats">
                            <div class="row g-4 mb-4">
                                <div class="col-md-3 text-center p-3 bg-light rounded-3">
                                    <h4 class="text-primary mb-1" id="editCaTotal">0</h4>
                                    <small class="text-muted">CA Total</small>
                                </div>
                                <!-- Autres métriques -->
                            </div>
                        </div>

                        <!-- TAB 3: Historique -->
                        <div class="tab-pane fade" id="editHistory">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Date</th>
                                            <th>Action</th>
                                            <th>Utilisateur</th>
                                            <th>Détails</th>
                                        </tr>
                                    </thead>
                                    <tbody id="magasinHistory">
                                        <!-- Dynamique -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <div class="modal-footer border-top">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Fermer</button>
                <button type="button" class="btn btn-warning" id="btnArchiveMagasin">
                    <i class="fas fa-archive me-2"></i>Archiver
                </button>
                <button type="button" class="btn btn-primary" id="btnUpdateMagasin">
                    <i class="fas fa-save me-2"></i>Enregistrer
                </button>
            </div>
        </div>
    </div>
</div>

<!-- ====================================================== -->
<!-- MODAL CONFIRMATION SUPPRESSION (Animation slide-up) -->
<!-- ====================================================== -->
<div class="modal fade" id="modalDeleteConfirm" tabindex="-1">
    <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content border-0 text-center p-5">
            <div class="avatar avatar-4xl mb-4 mx-auto">
                <div class="avatar-initial bg-danger rounded-circle">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                </div>
            </div>
            <h5 class="mb-3 fw-bold" id="deleteTitle">Confirmer suppression</h5>
            <p class="text-muted mb-4" id="deleteMessage">
                Êtes-vous sûr de vouloir supprimer ce magasin ? Cette action est irréversible.
            </p>
            <input type="hidden" id="deleteItemId">
            <input type="hidden" id="deleteItemType">
            
            <div class="d-flex gap-2 justify-content-center">
                <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">
                    <i class="fas fa-times me-2"></i>Annuler
                </button>
                <button type="button" class="btn btn-danger px-4" id="confirmDelete">
                    <i class="fas fa-trash me-2"></i>Supprimer
                    <span class="spinner-border spinner-border-sm ms-2 d-none"></span>
                </button>
            </div>
        </div>
    </div>
</div>

<!-- ====================================================== -->
<!-- TOAST NOTIFICATIONS (Intégrées) -->
<!-- ====================================================== -->
<div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1099;">
    <div id="liveToast" class="toast align-items-center text-white bg-success border-0" role="alert">
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-check-circle me-2"></i>
                <span id="toastMessage"></span>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    </div>
</div>

<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>


<script>
// JAVASCRIPT INTÉGRÉ POUR MODALS (même méthode que entreprise.php)
$(document).ready(function() {
    // Photo upload - même pattern que entreprise.php
    const magasinPhotoInput = document.getElementById('magasinPhotoInput');
    if(magasinPhotoInput) {
        magasinPhotoInput.addEventListener('change', (ev) => {
            const file = ev.target.files && ev.target.files[0];
            const uploadZone = document.getElementById('magasinPhotoUploadZone');
            const photoPreview = document.getElementById('magasinPhotoPreview');
            
            if(file && photoPreview && uploadZone) {
                const img = photoPreview.querySelector('img');
                if(img) {
                    img.src = URL.createObjectURL(file);
                    uploadZone.style.display = 'none';
                    photoPreview.style.display = 'block';
                }
            }
        });
    }

    // Remove button
    const photoRemoveBtn = document.getElementById('magasinPhotoRemove');
    if(photoRemoveBtn) {
        photoRemoveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const photoInput = document.getElementById('magasinPhotoInput');
            const uploadZone = document.getElementById('magasinPhotoUploadZone');
            const photoPreview = document.getElementById('magasinPhotoPreview');
            
            if(photoInput) photoInput.value = '';
            if(photoPreview) {
                photoPreview.style.display = 'none';
                const img = photoPreview.querySelector('img');
                if(img) img.src = '';
            }
            if(uploadZone) uploadZone.style.display = 'flex';
        });
    }

    // Drag & drop
    const dropArea = document.getElementById('magasinPhotoDropArea');
    if(dropArea) {
        ['dragover', 'dragenter'].forEach(eventName => {
            dropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropArea.classList.add('border-primary');
            });
        });

        ['dragleave', 'dragend'].forEach(eventName => {
            dropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropArea.classList.remove('border-primary');
            });
        });

        dropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove('border-primary');
            
            const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            if(file && file.type && file.type.startsWith('image/')) {
                const photoInput = document.getElementById('magasinPhotoInput');
                const uploadZone = document.getElementById('magasinPhotoUploadZone');
                const photoPreview = document.getElementById('magasinPhotoPreview');
                
                // Display preview
                if(photoPreview) {
                    const img = photoPreview.querySelector('img');
                    if(img) {
                        img.src = URL.createObjectURL(file);
                        if(uploadZone) uploadZone.style.display = 'none';
                        photoPreview.style.display = 'block';
                    }
                }
                
                // Add file to input
                if(photoInput) {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    photoInput.files = dt.files;
                }
            } else {
                showToast('Fichier non supporté', 'danger');
            }
        });
    }

    // Populate manager select when modal opens
    $('#modalCreateMagasin').on('show.bs.modal', async function(e){
        const managerSelect = document.getElementById('magasinManagerId');
        const mb = document.getElementById('magasinBusinessId');
        // Prefill businessId from current context if available
        if(mb && (!mb.value || mb.value.trim()==='')){
            if(window.CURRENT_BUSINESS && (window.CURRENT_BUSINESS._id || window.CURRENT_BUSINESS.id)){
                mb.value = window.CURRENT_BUSINESS._id || window.CURRENT_BUSINESS.id;
            }
        }

        if(!managerSelect) return;
        managerSelect.innerHTML = '<option value="">Chargement des gestionnaires…</option>';
        try{
                // Resolve token from any known localStorage keys or helper
                const token = (typeof getToken === 'function') ? getToken() : (localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt') || localStorage.getItem('accessToken') || null);
                const base = (typeof API_BASE !== 'undefined') ? API_BASE : ((typeof apiBase !== 'undefined') ? apiBase : '');
                // Use AbortController to avoid hanging fetches
                const controller = new AbortController();
                const timeoutMs = 8000; // 8s
                const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
                let members = [];
                try{
                    const res = await fetch(base + '/api/protected/members', { headers: token ? { 'Authorization': 'Bearer ' + token } : {}, signal: controller.signal });
                    clearTimeout(timeoutId);
                    if(!res.ok) throw new Error('Erreur chargement gestionnaires: ' + res.status);
                    members = await res.json();
                }catch(fetchErr){
                    clearTimeout(timeoutId);
                    console.error('load managers fetch error', fetchErr);
                    managerSelect.innerHTML = '<option value="">Erreur chargement</option>';
                    return;
                }
            const managers = (members||[]).filter(m=>m.role === 'superviseur');
            if(managers.length===0){ managerSelect.innerHTML = '<option value="">Aucun gestionnaire trouvé</option>'; return; }
            managerSelect.innerHTML = '<option value="">Sélectionner un gestionnaire</option>' + managers.map(m=>`<option value="${m._id}">${(m.prenom||'').trim()} ${(m.nom||'').trim()} ${m.email? '('+m.email+')':''}</option>`).join('');
        }catch(err){ console.error('load managers', err); managerSelect.innerHTML = '<option value="">Erreur chargement</option>'; }
    });

    // Soumission forms avec validation
    $('#formCreateMagasin').on('submit', async function(e) {
        e.preventDefault();
        const $btn = $(this).find('button[type="submit"]');
        const spinner = document.getElementById('submitSpinner1');
        try{
            if($btn && $btn.length) $btn.prop('disabled', true);
            if(spinner) spinner.classList.remove('d-none');
            // Build FormData
            const formEl = document.getElementById('formCreateMagasin');
            const fd = new FormData(formEl);
            // Send to API
            const token = localStorage.getItem('token') || localStorage.getItem('authToken') || null;
            const res = await fetch((typeof API_BASE!=='undefined'?API_BASE:'') + '/api/protected/magasins', {
                method: 'POST',
                body: fd,
                headers: token ? { 'Authorization': 'Bearer ' + token } : {}
            });
            if(!res.ok) {
                const txt = await res.text(); throw new Error(txt || 'Erreur serveur');
            }
            const data = await res.json();
            // Record activity client-side so the Recent Activities UI updates immediately
            try{
                const desc = `Magasin '${data.magasin.nom_magasin || data.magasin.nom}' créé. Gestionnaire assigné.`;
                if(typeof window !== 'undefined' && typeof window.recordActivity === 'function'){
                    window.recordActivity('Magasin créé', desc, 'fas fa-store');
                }
            }catch(e){ console.warn('recordActivity failed', e); }

            showToast('Magasin créé avec succès ! ✅', 'success');
            // hide modal (use bootstrap API or jQuery fallback)
            try{
                const modalEl = document.getElementById('modalCreateMagasin');
                if(window.bootstrap && modalEl){
                    bootstrap.Modal.getOrCreateInstance(modalEl).hide();
                } else if(typeof $ === 'function'){
                    $('#modalCreateMagasin').modal('hide');
                }
            }catch(e){ console.warn('hide modal failed', e); }

            // Notify the page that a magasin was created so listeners can refresh UI
            try{
                const bizInput = document.getElementById('magasinBusinessId');
                const businessId = (bizInput && bizInput.value) ? bizInput.value : (window.CURRENT_BUSINESS && (window.CURRENT_BUSINESS._id || window.CURRENT_BUSINESS.id));
                const eventDetail = { businessId: businessId || null, magasin: data.magasin || null };
                // Dispatch a custom event for any listeners on the window
                window.dispatchEvent(new CustomEvent('magasin.created', { detail: eventDetail }));

                // Backward-compatible: attempt direct call if functions are global
                if(eventDetail.businessId){
                    if(typeof window.loadMagasins === 'function'){
                        await window.loadMagasins(eventDetail.businessId);
                    } else if(typeof window.selectCompany === 'function'){
                        await window.selectCompany(eventDetail.businessId);
                    }
                }
            }catch(refreshErr){ console.warn('refresh magasins after create failed', refreshErr); }
        }catch(err){ console.error('create magasin', err); showToast('Erreur création magasin: '+(err.message||err), 'danger'); }
        finally{ if($btn && $btn.length) $btn.prop('disabled', false); if(spinner) spinner.classList.add('d-none'); }
    });

    // Auto-remplissage guichet avec chargement des vendeurs disponibles
    $('#modalCreateGuichet').off('show.bs.modal').on('show.bs.modal', async function(e) {
        const magasinId = CURRENT_MAGASIN_ID;
        
        // ❌ PREVENT opening modal without magasin selected
        if (!magasinId) {
            e.preventDefault();
            showToast('Veuillez sélectionner un magasin d\'abord', 'warning');
            return;
        }
        
        $('#guichetMagasinId').val(magasinId);
        
        // ✅ Charger les vendeurs sans affectation active
        const vendeurSelect = document.querySelector('#modalCreateGuichet select[name="vendeurPrincipal"]');
        if(!vendeurSelect) return;
        
        vendeurSelect.innerHTML = '<option value="">Chargement des vendeurs…</option>';
        try {
            const token = (typeof getTokenLocal === 'function') ? getTokenLocal() : 
                         (localStorage.getItem('token') || localStorage.getItem('authToken'));
            
            // ✅ Fetch les vendeurs DISPONIBLES (sans affectation active)
            const res = await fetch((typeof API_BASE !== 'undefined' ? API_BASE : '') + '/api/protected/vendeurs-available', {
                headers: token ? { 'Authorization': 'Bearer ' + token } : {}
            });
            
            if(!res.ok) throw new Error('Erreur chargement vendeurs');
            const vendeurs = await res.json();
            
            if(!vendeurs || vendeurs.length === 0) {
                vendeurSelect.innerHTML = '<option value="">Aucun vendeur disponible</option>';
                return;
            }
            
            // ✅ Populate select
            vendeurSelect.innerHTML = '<option value="">Sélectionner un vendeur (optionnel)</option>' + 
                vendeurs.map(v => 
                    `<option value="${v._id}">${(v.prenom || '').trim()} ${(v.nom || '').trim()}</option>`
                ).join('');
                
        } catch(err) {
            console.error('load vendeurs:', err);
            vendeurSelect.innerHTML = '<option value="">Erreur chargement</option>';
        }
    });
    
    // ✅ Soumission du formulaire guichet
    $('#formCreateGuichet').off('submit').on('submit', async function(e) {
        e.preventDefault();
        
        // ✅ PREVENT DOUBLE SUBMIT
        const $btn = $(this).find('button[type="submit"]');
        if($btn.prop('disabled')) return;
        
        const $form = $(this);
        const spinner = $btn.find('.spinner-border');
        
        try {
            if($btn.length) $btn.prop('disabled', true);
            if(spinner.length) spinner.removeClass('d-none');
            
            const magasinId = $('#guichetMagasinId').val();
            const nomGuichet = $(this).find('input[name="nomGuichet"]').val();
            const codeGuichet = $(this).find('input[name="codeGuichet"]').val();
            const status = $(this).find('select[name="status"]').val() || 1;
            const vendeurId = $(this).find('select[name="vendeurPrincipal"]').val();
            const objectifJournalier = $(this).find('input[name="objectifJournalier"]').val() || 0;
            const stockMax = $(this).find('input[name="stockMax"]').val() || 0;
            
            if(!magasinId || !nomGuichet) {
                showToast('Veuillez remplir les champs obligatoires', 'danger');
                return;
            }
            
            const token = (typeof getTokenLocal === 'function') ? getTokenLocal() : 
                         (localStorage.getItem('token') || localStorage.getItem('authToken'));
            
            const payload = {
                magasinId,
                nomGuichet,
                codeGuichet: codeGuichet || '',
                status: parseInt(status),
                vendeurPrincipal: vendeurId || null,
                objectifJournalier: parseInt(objectifJournalier),
                stockMax: parseInt(stockMax)
            };
            
            console.log('📤 Payload envoyé:', payload);
            
            const res = await fetch((typeof API_BASE !== 'undefined' ? API_BASE : '') + '/api/protected/guichets', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if(!res.ok) {
                const err = await res.text();
                throw new Error(err || 'Erreur serveur');
            }
            
            const data = await res.json();
            
            // ✅ ENREGISTRER L'ACTIVITÉ côté frontend (pour refresh immédiat)
            try {
                const vendeurName = vendeurId ? 
                    $(this).find('select[name="vendeurPrincipal"] option:selected').text() : 'Aucun';
                
                if(typeof window !== 'undefined' && typeof window.recordActivity === 'function'){
                    const desc = `Guichet '${nomGuichet}' créé. Vendeur assigné: ${vendeurName}`;
                    window.recordActivity('Guichet créé', desc, 'fas fa-cash-register');
                }
            }catch(e){ console.warn('recordActivity failed', e); }
            
            showToast('✅ Guichet créé avec succès !', 'success');
            
            // Reset form FIRST
            this.reset();
            
            // Hide modal - Use ONLY Bootstrap API
            const modalEl = document.getElementById('modalCreateGuichet');
            if(modalEl) {
                try {
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if(modal) {
                        modal.hide();
                    }
                } catch(e) {
                    console.warn('Modal close error:', e);
                }
            }
            
            // ✅ Rafraîchir le panel 3 (guichets) - AFTER modal closes
            setTimeout(async () => {
                if(typeof window.loadGuichetsForMagasin === 'function') {
                    const freshGuichets = await window.loadGuichetsForMagasin(magasinId);
                    if(freshGuichets && typeof window.renderGuichets === 'function') {
                        window.renderGuichets(freshGuichets);
                    }
                }
            }, 300);
            
        } catch(err) {
            console.error('create guichet:', err);
            showToast('❌ Erreur: ' + (err.message || err), 'danger');
        } finally {
            if($btn.length) $btn.prop('disabled', false);
            if(spinner.length) spinner.addClass('d-none');
        }
    });
});

function showToast(message, type = 'success') {
    const toast = new bootstrap.Toast(document.getElementById('liveToast'));
    $('#toastMessage').html(message);
    $('#liveToast').removeClass('bg-success bg-danger bg-warning')
                  .addClass(`bg-${type}`);
    toast.show();
}

// ✅ MODAL EDIT GUICHET
async function editGuichetModal(guichetId) {
    try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const API_BASE = window.API_BASE || '';
        
        let guichet = null;
        
        // ✅ TRY 1: Fetch guichet details from API (using correct endpoint)
        try {
            const response = await fetch(`${API_BASE}/api/protected/guichets/detail/${guichetId}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            
            if (response.ok) {
                guichet = await response.json();
                console.log('✅ Guichet chargé via API directe');
            } else {
                throw new Error(`API returned ${response.status}`);
            }
        } catch (apiErr) {
            console.warn('⚠️ API endpoint échoué, essai fallbacks:', apiErr.message);
            
            // ✅ FALLBACK 1: Chercher dans lastLoadedGuichets
            if (window.lastLoadedGuichets && Array.isArray(window.lastLoadedGuichets)) {
                guichet = window.lastLoadedGuichets.find(g => g._id === guichetId);
                if (guichet) {
                    console.log('✅ Guichet trouvé dans lastLoadedGuichets (Fallback 1)');
                }
            }
            
            // ✅ FALLBACK 2: Chercher dans allGuichets
            if (!guichet && window.allGuichets && Array.isArray(window.allGuichets)) {
                guichet = window.allGuichets.find(g => g._id === guichetId);
                if (guichet) {
                    console.log('✅ Guichet trouvé dans allGuichets (Fallback 2)');
                }
            }
            
            // ✅ FALLBACK 3: Get from current magasin's guichets list
            if (!guichet && typeof window.CURRENT_MAGASIN_ID !== 'undefined' && window.CURRENT_MAGASIN_ID) {
                try {
                    const listRes = await fetch(`${API_BASE}/api/protected/guichets/${window.CURRENT_MAGASIN_ID}`, {
                        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                    });
                    
                    if (listRes.ok) {
                        const guichets = await listRes.json();
                        guichet = guichets.find(g => g._id === guichetId);
                        if (guichet) {
                            console.log('✅ Guichet trouvé dans liste magasin (Fallback 3)');
                            // Sauvegarder pour réutilisation
                            if (!window.allGuichets) window.allGuichets = [];
                            if (!window.allGuichets.find(g => g._id === guichetId)) {
                                window.allGuichets.push(guichet);
                            }
                        }
                    }
                } catch (e) {
                    console.warn('Fallback 3 échoué:', e.message);
                }
            }
            
            // ✅ FALLBACK 4: Search in all business magasins
            if (!guichet && typeof window.CURRENT_BUSINESS !== 'undefined' && window.CURRENT_BUSINESS) {
                try {
                    const biz_id = window.CURRENT_BUSINESS._id || window.CURRENT_BUSINESS.id;
                    const bizRes = await fetch(`${API_BASE}/api/protected/businesses/${biz_id}`, {
                        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                    });
                    
                    if (bizRes.ok) {
                        const bizData = await bizRes.json();
                        const allMags = bizData.magasins || [];
                        for (const mag of allMags) {
                            const magRes = await fetch(`${API_BASE}/api/protected/guichets/${mag._id}`, {
                                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                            });
                            if (magRes.ok) {
                                const magGuichets = await magRes.json();
                                guichet = magGuichets.find(g => g._id === guichetId);
                                if (guichet) {
                                    console.log('✅ Guichet trouvé dans entreprise (Fallback 4)');
                                    break;
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.warn('Fallback 4 échoué:', e.message);
                }
            }
            
            // ❌ Si aucun fallback n'a marché
            if (!guichet) {
                console.error('❌ Guichet introuvable partout. ID:', guichetId, 'Erreur API:', apiErr.message);
                showToast('❌ Guichet introuvable - ' + apiErr.message, 'danger');
                throw apiErr;
            }
        }
        
        // ✅ Normalize fields from API response
        if (!guichet.nomGuichet && guichet.nom_guichet) {
            guichet.nomGuichet = guichet.nom_guichet;
        }
        if (!guichet.codeGuichet && guichet.code) {
            guichet.codeGuichet = guichet.code;
        }
        
        // Populate modal with guichet data
        $('#editGuichetId').val(guichet._id);
        $('#editGuichetMagasinId').val(guichet.magasinId && typeof guichet.magasinId === 'object' ? guichet.magasinId._id : (guichet.magasinId || window.CURRENT_MAGASIN_ID || ''));
        
        // Get entrepriseId from guichet's magasin data or current business
        let entrepriseId = '';
        if (guichet.magasinId && typeof guichet.magasinId === 'object' && guichet.magasinId.businessId) {
            entrepriseId = guichet.magasinId.businessId._id || guichet.magasinId.businessId;
        } else if (guichet.businessId) {
            entrepriseId = guichet.businessId._id || guichet.businessId;
        } else if (window.CURRENT_BUSINESS) {
            entrepriseId = window.CURRENT_BUSINESS._id || window.CURRENT_BUSINESS.id;
        }
        $('#editGuichetEntrepriseId').val(entrepriseId || '');
        
        $('#editGuichetNom').val(guichet.nomGuichet || guichet.nom_guichet || '');
        $('#editGuichetCode').val(guichet.codeGuichet || guichet.code || '');
        
        // ⚠️ Status must be a number, handle all possible formats
        let statusValue = guichet.status;
        if (typeof statusValue === 'string') statusValue = parseInt(statusValue);
        if (!statusValue && statusValue !== 0) statusValue = 1;
        $('#editGuichetStatus').val(statusValue);
        console.log('📊 Status récupéré:', statusValue, 'Type:', typeof statusValue);
        
        $('#editGuichetObjectif').val(guichet.objectifJournalier || 0);
        $('#editGuichetStockMax').val(guichet.stockMax || 0);
        
        if (guichet.vendeurPrincipal && guichet.vendeurPrincipal._id) {
            $('#editGuichetVendeur').val(guichet.vendeurPrincipal._id);
        }
        
        // Load vendeurs DISPONIBLES in select
        const vendeurSelect = $('#editGuichetVendeur');
        vendeurSelect.html('<option value="">Chargement des vendeurs…</option>');
        
        try {
            const vendRes = await fetch(`${API_BASE}/api/protected/vendeurs-available`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            
            if (vendRes.ok) {
                const vendeurs = await vendRes.json();
                vendeurSelect.html('<option value="">Sélectionner un vendeur</option>');
                
                // Ajouter le vendeur actuellement assigné en premier (s'il existe)
                if (guichet.vendeurPrincipal && guichet.vendeurPrincipal._id) {
                    vendeurSelect.append(`<option value="${guichet.vendeurPrincipal._id}" selected>${guichet.vendeurPrincipal.prenom} ${guichet.vendeurPrincipal.nom}</option>`);
                }
                
                // Ajouter les vendeurs disponibles (sauf celui déjà assigné)
                vendeurs.forEach(v => {
                    if (!guichet.vendeurPrincipal || guichet.vendeurPrincipal._id !== v._id) {
                        vendeurSelect.append(`<option value="${v._id}">${v.prenom} ${v.nom}</option>`);
                    }
                });
            }
        } catch (e) {
            console.warn('Erreur chargement vendeurs:', e);
        }
        
        // Show modal
        if (window.bootstrap) {
            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditGuichet'));
            modal.show();
        } else {
            $('#modalEditGuichet').modal('show');
        }
    } catch (err) {
        console.error('editGuichetModal:', err);
        showToast('❌ ' + (err.message || 'Erreur chargement'), 'danger');
    }
}

// ✅ SAVE EDIT GUICHET
$(document).ready(function() {
    $('#formEditGuichet').on('submit', async function(e) {
        e.preventDefault();
        
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const API_BASE = window.API_BASE || '';
        const $btn = $(this).find('button[type="submit"]');
        const $spinner = $btn.find('.spinner-border');
        
        try {
            $btn.prop('disabled', true);
            $spinner?.removeClass('d-none');
            
            const guichetId = $('#editGuichetId').val();
            const magasinId = $('#editGuichetMagasinId').val();
            const entrepriseId = $('#editGuichetEntrepriseId').val();
            const payload = {
                entrepriseId: entrepriseId,
                magasinId: magasinId,
                nom_guichet: $('#editGuichetNom').val(),
                code: $('#editGuichetCode').val(),
                status: parseInt($('#editGuichetStatus').val()),
                vendeurPrincipal: $('#editGuichetVendeur').val() || null,
                objectifJournalier: parseInt($('#editGuichetObjectif').val()) || 0,
                stockMax: parseInt($('#editGuichetStockMax').val()) || 0
            };
            
            const response = await fetch(`${API_BASE}/api/protected/guichets/${guichetId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errData = await response.text();
                throw new Error(`Erreur serveur ${response.status}: ${errData}`);
            }
            
            const data = await response.json();
            showToast('✅ Guichet modifié avec succès', 'success');
            
            // Close BOTH modals (detail et edit) - Utiliser Backdrop click
            try {
                const backdrop = document.querySelector('.modal-backdrop');
                const modals = document.querySelectorAll('.modal.show');
                modals.forEach(modal => {
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    if (modalInstance) modalInstance.hide();
                });
            } catch(e) { console.warn('Error closing modals:', e); }
            
            // Small delay to ensure modals are closed before refresh
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Refresh guichets list
            try {
                // Récupérer magasinId du formulaire au lieu de la variable globale
                const magasinId = $('#editGuichetMagasinId').val();
                console.log('🔄 Rafraîchissement des guichets pour magasin:', magasinId);
                if (magasinId && typeof window.loadGuichetsForMagasin === 'function') {
                    const freshGuichets = await window.loadGuichetsForMagasin(magasinId);
                    console.log('✅ Guichets rafraîchis:', freshGuichets?.length || 0);
                    if (freshGuichets && typeof window.renderGuichets === 'function') {
                        window.renderGuichets(freshGuichets);
                        console.log('✅ Liste affichée');
                    }
                } else {
                    console.warn('⚠️ Impossible de rafraîchir: magasinId=', magasinId, 'loadGuichetsForMagasin exists?', typeof window.loadGuichetsForMagasin);
                }
            } catch(refreshErr) {
                console.error('Erreur rafraîchissement:', refreshErr);
            }
            
        } catch (err) {
            console.error('edit guichet:', err);
            showToast('❌ ' + (err.message || 'Erreur'), 'danger');
        } finally {
            $btn.prop('disabled', false);
            $spinner?.addClass('d-none');
        }
    });
});
</script>
