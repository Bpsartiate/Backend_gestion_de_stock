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
    <script src="vendors/list.js/list.min.js"></script>
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
                                    <span class="badge bg-white bg-opacity-20 text-black"><i class="fas fa-users me-1"></i><span id="totalVendeurs">0</span> Vendeurs</span>
                                    <span class="badge bg-white bg-opacity-20 text-black"><i class="fas fa-cash-register me-1"></i><span id="totalGuichets">0</span> Guichets</span>
                                    <span class="badge bg-white bg-opacity-20 text-black"><i class="fas fa-link me-1"></i><span id="totalAffectations">0</span> Actives</span>
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
                <div class="row justify-content-between g-2 mb-3">
                    <div class="col-lg-2 col-md-4 col-sm-6 p">
                        <div class="card h-100 p-2 text-center border-0 shadow-sm">
                            <i class="fas fa-check-circle fa-lg text-success mb-1"></i>
                            <div class="fs-5 fw-bold text-success" id="kpiActives">0</div>
                            <div class="tiny text-muted">Actifs</div>
                        </div>
                    </div>
                    <div class="col-lg-2 col-md-4 col-sm-6">
                        <div class="card h-100 p-2 text-center border-0 shadow-sm">
                            <i class="fas fa-stop-circle fa-lg text-warning mb-1"></i>
                            <div class="fs-5 fw-bold text-warning" id="kpiInactives">0</div>
                            <div class="tiny text-muted">Terminés</div>
                        </div>
                    </div>
                    <div class="col-lg-2 col-md-4 col-sm-6">
                        <div class="card h-100 p-2 text-center border-0 shadow-sm">
                            <i class="fas fa-user-slash fa-lg text-danger mb-1"></i>
                            <div class="fs-5 fw-bold text-danger" id="kpiSansAffectation">0</div>
                            <div class="tiny text-muted">Non Affectés</div>
                        </div>
                    </div>
                    <div class="col-lg-2 col-md-4 col-sm-6">
                        <div class="card h-100 p-2 text-center border-0 shadow-sm">
                            <i class="fas fa-hourglass-half fa-lg text-info mb-1"></i>
                            <div class="fs-5 fw-bold text-info" id="kpiDureeAverage">0j</div>
                            <div class="tiny text-muted">Durée Moy</div>
                        </div>
                    </div>
                    <div class="col-lg-2 col-md-4 col-sm-6">
                        <div class="card h-100 p-2 text-center border-0 shadow-sm">
                            <i class="fas fa-list fa-lg text-primary mb-1"></i>
                            <div class="fs-5 fw-bold text-primary" id="kpiTotal">0</div>
                            <div class="tiny text-muted">Total</div>
                        </div>
                    </div>
                </div>

                <!-- SECTION PRINCIPALE -->
                <div class="card h-100 border-0 shadow-sm">
                    <!-- HEADER -->
                    <div class="card-header bg-light p-3 d-flex justify-content-between align-items-center">
                        <h6 class="mb-0 fw-bold"><i class="fas fa-list me-2 text-primary"></i>Affectations</h6>
                        <span class="badge bg-primary" id="countAffectations">0</span>
                    </div>

                  
                    <div class="card-body p-3">
                        <div id="affectationsTable">
                            <!-- FILTRES & SEARCH -->
                            <div class="row justify-content-between g-3 mb-3">
                                <div class="col-lg-8">
                                    <div class="row g-2">
                                        <div class="col-lg-2">
                                            <label class="form-label small fw-semibold mb-2">Entreprise</label>
                                            <select id="filterEntreprise" class="form-select form-select-sm">
                                                <option value="">Toutes</option>
                                            </select>
                                        </div>

                                        <div class="col-lg-2">
                                            <label class="form-label small fw-semibold mb-2">Magasin</label>
                                            <select id="filterMagasin" class="form-select form-select-sm">
                                                <option value="">Tous</option>
                                            </select>
                                        </div>

                                        <div class="col-lg-2">
                                            <label class="form-label small fw-semibold mb-2">Guichet</label>
                                            <select id="filterGuichet" class="form-select form-select-sm">
                                                <option value="">Tous</option>
                                            </select>
                                        </div>

                                        <div class="col-lg-2">
                                            <label class="form-label small fw-semibold mb-2">Vendeur</label>
                                            <select id="filterVendeur" class="form-select form-select-sm">
                                                <option value="">Tous</option>
                                            </select>
                                        </div>

                                        <div class="col-lg-2">
                                            <label class="form-label small fw-semibold mb-2">Recherche</label>
                                            <input type="text" class="form-control form-control-sm search" id="searchAffectation" placeholder="Rechercher...">
                                        </div>
                                    </div>
                                </div>

                                <div class="col-lg-4">
                                    <div class="row g-2">
                                        <div class="col-lg-6">
                                            <label class="form-label small fw-semibold mb-2">Filtre Statut</label>
                                            <select id="filterStatut" class="form-select form-select-sm">
                                                <option value="">Tous les statuts</option>
                                                <option value="1">Actifs</option>
                                                <option value="0">Terminés</option>
                                            </select>
                                        </div>
                                        <div class="col-lg-6 d-flex align-items-end gap-2">
                                            <button id="btnCreateAffectation" class="btn btn-sm btn-primary flex-grow-1">
                                                <i class="fas fa-plus me-2"></i>Ajouter
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- ACTIONS EN MASSE (cachées par défaut) -->
                            <div id="bulkActionsBar" class="alert alert-info mb-3" style="display: none;">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong id="bulkSelectedCount">0</strong> sélectionné(s)
                                    </div>
                                    <div class="btn-group btn-group-sm" role="group">
                                        <button type="button" id="btnBulkTerminer" class="btn btn-warning" title="Terminer les affectations sélectionnées">
                                            <i class="fas fa-stop-circle me-1"></i>Terminer
                                        </button>
                                        <button type="button" id="btnBulkDelete" class="btn btn-danger" title="Supprimer les affectations sélectionnées">
                                            <i class="fas fa-trash me-1"></i>Supprimer
                                        </button>
                                        <button type="button" id="btnBulkExport" class="btn btn-success" title="Exporter les affectations sélectionnées">
                                            <i class="fas fa-download me-1"></i>Exporter
                                        </button>
                                        <button type="button" id="btnBulkCancel" class="btn btn-secondary" title="Annuler">
                                            <i class="fas fa-times me-1"></i>Annuler
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- TABLE AFFECTATIONS -->
                            <div class="table-responsive scrollbar">
                                <table class="table table-sm table-striped table-hover fs--1 mb-0 overflow-hidden">
                                    <thead class="bg-200 text-900 sticky-top">
                                        <tr>
                                            <th class="align-middle text-nowrap" style="width: 40px;">
                                                <input type="checkbox" id="checkAllAffectations" class="form-check-input" title="Sélectionner tous">
                                            </th>
                                            <th class="sort pe-3 align-middle text-nowrap" data-sort="vendeur-name" style="min-width: 150px;">
                                                <i class="fas fa-user me-2"></i>Vendeur
                                            </th>
                                            <th class="sort pe-3 align-middle text-nowrap" data-sort="guichet-name" style="min-width: 120px;">
                                                <i class="fas fa-cash-register me-2"></i>Guichet
                                            </th>
                                            <th class="sort pe-3 align-middle text-nowrap" data-sort="magasin-name" style="min-width: 120px;">
                                                <i class="fas fa-store me-2"></i>Magasin
                                            </th>
                                            <th class="sort pe-3 align-middle text-nowrap" data-sort="entreprise-name" style="min-width: 120px;">
                                                <i class="fas fa-building me-2"></i>Entreprise
                                            </th>
                                            <th class="sort pe-3 align-middle text-nowrap" data-sort="date-affectation" style="min-width: 110px;">
                                                <i class="fas fa-calendar me-2"></i>Depuis
                                            </th>
                                            <th class="sort pe-3 align-middle text-nowrap" data-sort="statut" style="min-width: 90px;">
                                                <i class="fas fa-info-circle me-2"></i>Statut
                                            </th>
                                            <th class="align-middle text-nowrap text-end pe-3" style="min-width: 100px;"><i class="fas fa-cogs me-2"></i>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="affectationsTableBody" class="list">
                                        <!-- Loading Spinner -->
                                        <tr id="affectationSpinner" style="display: none;">
                                            <td colspan="8" class="text-center py-4">
                                                <div class="spinner-border spinner-border-sm text-primary mb-2" role="status">
                                                    <span class="visually-hidden">Chargement...</span>
                                                </div>
                                                <p class="text-muted small">Chargement des affectations...</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <!-- PAGINATION -->
                            <div class="d-flex flex-column align-items-center gap-3 mt-4">
                                <small class="text-muted" id="affectationInfo">Affichage 0 affectations</small>
                                <nav aria-label="pagination">
                                    <ul class="pagination pagination-sm mb-0" id="paginationAffectations">
                                        <!-- Pagination générée par list.js -->
                                    </ul>
                                </nav>
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
                    <!-- MESSAGES DE VALIDATION -->
                    <div id="validationMessages" class="mb-3"></div>

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

    <!-- Modal Reprendre Affectation -->
    <div class="modal fade" id="modalReprendreAffectation" tabindex="-1" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0">
                <div class="modal-header bg-success text-white border-0">
                    <h5 class="modal-title fw-bold"><i class="fas fa-play-circle me-2"></i>Lever la suspension</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <p class="mb-3">Êtes-vous sûr de vouloir lever la suspension de cette affectation ?</p>
                    <div class="alert alert-success">
                        <small><i class="fas fa-info-circle me-2"></i>Le vendeur pourra à nouveau accéder à ce guichet après confirmation.</small>
                    </div>
                    <label class="form-label fw-semibold">Raison (optionnel)</label>
                    <textarea id="reprendreRaison" class="form-control" rows="3" placeholder="Raison de la reprise..."></textarea>
                </div>
                <div class="modal-footer border-0">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button type="button" class="btn btn-success" id="btnConfirmReprendre">
                        <i class="fas fa-check me-2"></i>Confirmer
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Historique Affectation -->
    <div class="modal fade" id="modalHistoriqueAffectation" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-info text-white border-0">
                    <h5 class="modal-title fw-bold"><i class="fas fa-history me-2"></i>Historique des Modifications</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-0">
                    <div id="historiqueAffectationContent">
                        <!-- Historique généré par JS -->
                    </div>
                </div>
                <div class="modal-footer border-0">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Confirmation (générique) -->
    <div class="modal fade" id="modalConfirmation" tabindex="-1" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg">
                <div class="modal-header border-0 pb-0" id="confirmHeaderContainer">
                    <h5 class="modal-title fw-bold" id="confirmTitle">Confirmation</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="d-flex align-items-start">
                        <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-triangle fa-2x text-warning me-3"></i>
                        </div>
                        <div class="flex-grow-1">
                            <p id="confirmMessage" class="mb-0"></p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-0">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button type="button" class="btn btn-danger" id="btnConfirmAction">
                        <i class="fas fa-trash me-2"></i>Confirmer
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
