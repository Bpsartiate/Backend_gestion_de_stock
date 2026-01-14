<?php include_once 'includes/auth-init.php'; ?>
<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Gestion des Affectations - Dashboard Pro</title>

    <!-- Favicons & PWA -->
    <link rel="apple-touch-icon" sizes="180x180" href="assets/img/favicons/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/img/favicons/favicon-32x32.png">
    <link rel="manifest" href="assets/img/favicons/manifest.json">
    <meta name="theme-color" content="#6366f1">

    <!-- Vos styles Falcon existants -->
    <script src="assets/js/config.js"></script>
    <script src="vendors/is/is.min.js"></script>
    <script src="vendors/simplebar/simplebar.min.js"></script>
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,600,700%7cPoppins:300,400,500,600,700,800,900&display=swap" rel="stylesheet">
    <link href="vendors/simplebar/simplebar.min.css" rel="stylesheet">
    <link href="assets/css/theme-rtl.min.css" rel="stylesheet" id="style-rtl">
    <link href="assets/css/theme.min.css" rel="stylesheet" id="style-default">
    <link href="assets/css/user-rtl.min.css" rel="stylesheet" id="user-style-rtl">
    <link href="assets/css/user.min.css" rel="stylesheet" id="user-style-default">

    <!-- Prevent AnchorJS error -->
    <script>
        window.AnchorJS = function() { this.add = function() {} };
    </script>

    <script>
        // RTL/Theme existant
        var isRTL = JSON.parse(localStorage.getItem('isRTL'));
        if (isRTL) {
            document.querySelector('html').setAttribute('dir', 'rtl');
            document.getElementById('style-default').disabled = true;
            document.getElementById('user-style-default').disabled = true;
        } else {
            document.getElementById('style-rtl').disabled = true;
            document.getElementById('user-style-rtl').disabled = true;
        }
    </script>
    <script>
        if(typeof window.API_BASE === 'undefined' || !window.API_BASE){
            window.API_BASE = 'https://backend-gestion-de-stock.onrender.com';
        }
    </script>
</head>

<body>
    <main class="main" id="top">
        <div class="container-fluid" data-layout="container">
            <?php include_once 'sidebar.php'; ?>
            
            <div class="content">
                <?php include_once 'topbar.php'; ?>

                <!-- HEADER ULTRA-MODERNE -->
                <div class="card mb-3 border-0 overflow-hidden">
                    <div class="gradient-header text-white p-3 p-md-4 position-relative" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        <div class="row align-items-center gx-3">
                            <div class="col-auto d-none d-md-block">
                                <div class="avatar bg-white-10 rounded-circle d-flex align-items-center justify-content-center" style="width:72px;height:72px;">
                                    <i class="fas fa-link fa-2x text-white"></i>
                                </div>
                            </div>
                            <div class="col">
                                <div class="d-flex align-items-center">
                                    <h2 class="mb-0 fw-bold me-3">Gestion des Affectations</h2>
                                    <div class="small text-white-75">Assignez les vendeurs aux guichets</div>
                                </div>
                                <div class="mt-2 d-flex flex-wrap gap-2 align-items-center">
                                    <span class="badge bg-white bg-opacity-20 text-white"><i class="fas fa-users me-1"></i><span id="totalVendeurs">0</span> Vendeurs</span>
                                    <span class="badge bg-white bg-opacity-20 text-white"><i class="fas fa-cash-register me-1"></i><span id="totalGuichets">0</span> Guichets</span>
                                    <span class="badge bg-white bg-opacity-20 text-white"><i class="fas fa-link me-1"></i><span id="totalAffectations">0</span> Actives</span>
                                </div>
                            </div>
                            <div class="col-auto text-end">
                                <button class="btn btn-light btn-sm me-2" id="refreshAllData" title="Actualiser">
                                    <i class="fas fa-sync-alt"></i>
                                </button>
                                <button class="btn btn-success" id="btnCreateAffectation" data-bs-toggle="modal" data-bs-target="#modalCreateAffectation">
                                    <i class="fas fa-plus me-2"></i>Nouvelle Affectation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- WIDGETS KPI -->
                <div class="row g-3 mb-3">
                    <div class="col-md-3">
                        <div class="card h-100 p-3 text-center">
                            <i class="fas fa-check-circle fa-2x text-success mb-2"></i>
                            <div class="fs-3 fw-bold" id="kpiActives">0</div>
                            <div class="small text-muted">Affectations Actives</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card h-100 p-3 text-center">
                            <i class="fas fa-clock fa-2x text-warning mb-2"></i>
                            <div class="fs-3 fw-bold" id="kpiInactives">0</div>
                            <div class="small text-muted">Affectations Terminées</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card h-100 p-3 text-center">
                            <i class="fas fa-users-slash fa-2x text-danger mb-2"></i>
                            <div class="fs-3 fw-bold" id="kpiSansAffectation">0</div>
                            <div class="small text-muted">Vendeurs Non Affectés</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card h-100 p-3 text-center">
                            <i class="fas fa-calendar-alt fa-2x text-info mb-2"></i>
                            <div class="fs-3 fw-bold" id="kpiDureeAverage">0j</div>
                            <div class="small text-muted">Durée Moyenne</div>
                        </div>
                    </div>
                </div>

                <!-- SECTION PRINCIPALE -->
                <div class="row g-3">
                    <!-- FILTRES -->
                    <div class="col-lg-3">
                        <div class="card h-100 border-0 shadow-sm">
                            <div class="card-header bg-light p-3">
                                <h6 class="mb-0 fw-bold"><i class="fas fa-filter me-2 text-primary"></i>Filtres</h6>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Entreprise</label>
                                    <select id="filterEntreprise" class="form-select form-select-sm">
                                        <option value="">Toutes les entreprises</option>
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Magasin</label>
                                    <select id="filterMagasin" class="form-select form-select-sm">
                                        <option value="">Tous les magasins</option>
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Guichet</label>
                                    <select id="filterGuichet" class="form-select form-select-sm">
                                        <option value="">Tous les guichets</option>
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Vendeur</label>
                                    <select id="filterVendeur" class="form-select form-select-sm">
                                        <option value="">Tous les vendeurs</option>
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Statut</label>
                                    <select id="filterStatut" class="form-select form-select-sm">
                                        <option value="">Tous les statuts</option>
                                        <option value="1">Actifs</option>
                                        <option value="0">Terminés</option>
                                    </select>
                                </div>

                                <div class="input-group input-group-sm">
                                    <input type="text" id="searchAffectation" class="form-control" placeholder="Rechercher...">
                                    <button class="btn btn-outline-secondary" id="btnSearch" type="button">
                                        <i class="fas fa-search"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- TABLE AFFECTATIONS -->
                    <div class="col-lg-9">
                        <div class="card h-100 border-0 shadow-sm">
                            <div class="card-header bg-light p-3 d-flex justify-content-between align-items-center">
                                <h6 class="mb-0 fw-bold"><i class="fas fa-list me-2 text-primary"></i>Affectations</h6>
                                <span class="badge bg-primary" id="countAffectations">0</span>
                            </div>
                            <div class="card-body p-0">
                                <!-- Table -->
                                <div class="table-responsive">
                                    <table class="table table-hover mb-0" id="affectationsTable">
                                        <thead class="table-light">
                                            <tr>
                                                <th style="width: 15%;"><i class="fas fa-user me-2"></i>Vendeur</th>
                                                <th style="width: 12%;"><i class="fas fa-cash-register me-2"></i>Guichet</th>
                                                <th style="width: 12%;"><i class="fas fa-store me-2"></i>Magasin</th>
                                                <th style="width: 12%;"><i class="fas fa-building me-2"></i>Entreprise</th>
                                                <th style="width: 12%;"><i class="fas fa-calendar me-2"></i>Depuis</th>
                                                <th style="width: 10%;"><i class="fas fa-info-circle me-2"></i>Statut</th>
                                                <th style="width: 17%;" class="text-end"><i class="fas fa-cogs me-2"></i>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="affectationsTableBody">
                                            <!-- Loading Spinner in tbody -->
                                            <tr id="affectationSpinner" style="display: none;">
                                                <td colspan="7" class="text-center py-4">
                                                    <div class="spinner-border spinner-border-sm text-primary mb-2" role="status">
                                                        <span class="visually-hidden">Chargement...</span>
                                                    </div>
                                                    <p class="text-muted small">Chargement des affectations...</p>
                                                </td>
                                            </tr>
                                            <tr id="affectationEmpty" style="display: none;">
                                                <td colspan="7" class="text-center py-4 text-muted"><i class="fas fa-inbox me-2"></i>Aucune affectation</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="card-footer bg-light p-3">
                                <div class="d-flex justify-content-between align-items-center">
                                    <small class="text-muted" id="affectationInfo">Affichage 0 sur 0</small>
                                    <nav aria-label="pagination">
                                        <ul class="pagination pagination-sm mb-0" id="paginationAffectations">
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- MODALS -->
    <!-- Modal Créer/Modifier Affectation -->
    <div class="modal fade" id="modalCreateAffectation" tabindex="-1" data-bs-backdrop="static">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content border-0 shadow-xl">
                <div class="modal-header bg-gradient-primary text-white border-0">
                    <h5 class="modal-title fw-bold"><i class="fas fa-plus-circle me-2"></i>Nouvelle Affectation</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <form id="formCreateAffectation">
                        <div class="row g-3">
                            <div class="col-12">
                                <label class="form-label fw-semibold">Entreprise <span class="text-danger">*</span></label>
                                <select id="affectEntreprise" class="form-select" required>
                                    <option value="">Sélectionner une entreprise</option>
                                </select>
                            </div>

                            <div class="col-12">
                                <label class="form-label fw-semibold">Magasin <span class="text-danger">*</span></label>
                                <select id="affectMagasin" class="form-select" required>
                                    <option value="">Sélectionner un magasin</option>
                                </select>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Guichet <span class="text-danger">*</span></label>
                                <select id="affectGuichet" class="form-select" required>
                                    <option value="">Sélectionner un guichet</option>
                                </select>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Vendeur <span class="text-danger">*</span></label>
                                <select id="affectVendeur" class="form-select" required>
                                    <option value="">Sélectionner un vendeur</option>
                                </select>
                            </div>

                            <div class="col-12">
                                <label class="form-label fw-semibold">Date d'affectation</label>
                                <input type="date" id="affectDate" class="form-control">
                            </div>

                            <div class="col-12">
                                <label class="form-label fw-semibold">Observations</label>
                                <textarea id="affectObservations" class="form-control" rows="3" placeholder="Notes ou commentaires..."></textarea>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer border-0">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button type="button" class="btn btn-primary" id="btnSaveAffectation">
                        <i class="fas fa-save me-2"></i>Créer Affectation
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Terminer Affectation -->
    <div class="modal fade" id="modalTerminerAffectation" tabindex="-1" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0">
                <div class="modal-header bg-warning text-white border-0">
                    <h5 class="modal-title fw-bold"><i class="fas fa-stop-circle me-2"></i>Terminer l'affectation</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <p class="mb-3">Êtes-vous sûr de vouloir terminer cette affectation ?</p>
                    <div class="alert alert-info">
                        <small><i class="fas fa-info-circle me-2"></i>Le vendeur ne pourra plus accéder à ce guichet après confirmation.</small>
                    </div>
                    <label class="form-label fw-semibold">Raison (optionnel)</label>
                    <textarea id="terminerRaison" class="form-control" rows="3" placeholder="Raison de la fin d'affectation..."></textarea>
                </div>
                <div class="modal-footer border-0">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button type="button" class="btn btn-danger" id="btnConfirmTerminer">
                        <i class="fas fa-check me-2"></i>Confirmer
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- ===============================================-->
    <!--    JavaScripts-->
    <!-- ===============================================-->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="vendors/is/is.min.js"></script>
    <script src="vendors/popper/popper.min.js"></script>
    <script src="vendors/bootstrap/bootstrap.min.js"></script>
    <script src="vendors/fontawesome/all.min.js"></script>
    <script src="vendors/lodash/lodash.min.js"></script>
    
    <!-- Wrapper pour éviter les erreurs de theme.js -->
    <script>
        // Charger theme.js de manière sécurisée
        if (document.readyState !== 'loading') {
            // Document déjà chargé
            var script = document.createElement('script');
            script.src = 'assets/js/theme.js';
            script.addEventListener('error', function() {
                console.warn('Erreur theme.js, continuant sans');
            });
            document.head.appendChild(script);
        } else {
            // Attendre le chargement du document
            document.addEventListener('DOMContentLoaded', function() {
                var script = document.createElement('script');
                script.src = 'assets/js/theme.js';
                script.addEventListener('error', function() {
                    console.warn('Erreur theme.js, continuant sans');
                });
                document.head.appendChild(script);
            });
        }
    </script>
    
    <script src="assets/js/auth-protection.js"></script>

    <!-- Configuration API -->
    <script src="assets/js/api-config.js"></script>
    <script src="assets/js/affectation.js"></script>
</body>
</html>
