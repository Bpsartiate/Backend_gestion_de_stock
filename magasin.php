<?php include_once 'includes/auth-init.php'; ?>
<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Magasins & Guichets - Dashboard Pro</title>

    <!-- Favicons & PWA -->
    <link rel="apple-touch-icon" sizes="180x180" href="assets/img/favicons/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/img/favicons/favicon-32x32.png">
    <link rel="manifest" href="assets/img/favicons/manifest.json">
    <meta name="theme-color" content="#6366f1">

    <!-- Vos styles Falcon existants -->
    <script src="assets/js/config.js"></script>
    <script src="vendors/simplebar/simplebar.min.js"></script>
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,600,700%7cPoppins:300,400,500,600,700,800,900&display=swap" rel="stylesheet">
    <link href="vendors/simplebar/simplebar.min.css" rel="stylesheet">
    <link href="assets/css/theme-rtl.min.css" rel="stylesheet" id="style-rtl">
    <link href="assets/css/theme.min.css" rel="stylesheet" id="style-default">
    <link href="assets/css/user-rtl.min.css" rel="stylesheet" id="user-style-rtl">
    <link href="assets/css/user.min.css" rel="stylesheet" id="user-style-default">

    <!-- Styles custom modernes -->
     <link href="assets/css/magasin.css" rel="stylesheet">
    <style>

      
    </style>

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
        // Ensure API_BASE is set to the Render deployment if not already defined
        if(typeof window.API_BASE === 'undefined' || !window.API_BASE){
            window.API_BASE = 'https://backend-gestion-de-stock.onrender.com';
        }
    </script>
    <script>
        // Small auth helpers for this page (use AuthProtection if available)
        function getTokenLocal(){
            try{
                if(window.AuthProtection && typeof window.AuthProtection.getToken === 'function') return window.AuthProtection.getToken();
            }catch(e){}
            const keys = ['token','authToken','jwt','accessToken','userToken'];
            for(const k of keys){ const v = localStorage.getItem(k); if(v) return v; }
            return null;
        }
        function authHeaders(){
            const t = getTokenLocal();
            return t ? { 'Authorization': 'Bearer ' + t } : {};
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
                <div class="card mb-4 shadow-lg border-0 overflow-hidden">
                    <div class="gradient-header text-white p-3 p-md-4 position-relative" style="background: linear-gradient(90deg,#5b6be6 0%, #8a5bd6 100%);">
                        <div class="row align-items-center gx-3">
                            <div class="col-auto d-none d-md-block">
                                <div class="avatar bg-white-10 rounded-circle d-flex align-items-center justify-content-center" style="width:72px;height:72px;">
                                    <i class="fas fa-store fa-2x text-white"></i>
                                </div>
                            </div>
                            <div class="col">
                                <!-- <nav aria-label="breadcrumb" class="mb-1">
                                    <ol class="breadcrumb breadcrumb-light mb-0">
                                        <li class="breadcrumb-item"><a href="index.php" class="text-white opacity-85">Dashboard</a></li>
                                        <li class="breadcrumb-item active text-white" aria-current="page">Magasins</li>
                                    </ol>
                                </nav> -->
                                <div class="d-flex align-items-center">
                                    <h2 class="mb-0 fw-bold me-3">Magasins & Guichets</h2>
                                    <div class="small text-white-75">Gestion des points de vente et guichets</div>
                                </div>
                                <div class="mt-2 d-flex flex-wrap gap-2 align-items-center">
                                    <span class="badge bg-red bg-opacity-15 text-red"><i class="fas fa-building me-1"></i><span id="currentEntreprise">-</span></span>
                                    <span class="badge bg-red bg-opacity-15 text-red"><i class="fas fa-store me-1"></i> <span id="totalMagasins">0</span></span>
                                    <span class="badge bg-red bg-opacity-15 text-red"><i class="fas fa-cash-register me-1"></i> <span id="totalGuichets">0</span> guichets</span>
                                </div>
                            </div>
                            <div class="col-auto text-end">
                                <div class="d-flex align-items-center gap-2">
                                    <div class="input-group input-group-sm d-none d-md-flex" style="width:220px;">
                                        <span class="input-group-text bg-transparent border-0 text-white-50"><i class="fas fa-search"></i></span>
                                        <input id="searchHeader" class="form-control form-control-sm bg-white-10 border-0 text-black" placeholder="Rechercher magasin...">
                                    </div>
                                    <div class="btn-group" role="group">
                                        <button class="btn btn-outline-light btn-sm" id="refreshAllData" title="Actualiser"><i class="fas fa-sync-alt" id="refreshIcon"></i></button>
                                        <!-- <button class="btn btn-light btn-sm" data-bs-toggle="modal" data-bs-target="#modalCreateMagasin"><i class="fas fa-store me-1"></i>Magasin</button> -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- WIDGETS: Quick overview (inspired by widgets.html) -->
                <div class="row g-3 mb-3" id="magasinsWidgets">
                    <div class="col-md-3">
                        <div class="card h-100 metric-card p-3 text-center">
                            <div class="d-flex align-items-center justify-content-center mb-2">
                                <i class="fas fa-store fa-2x text-primary"></i>
                            </div>
                            <div class="fs-3 fw-bold" id="widgetTotalMagasins">0</div>
                            <div class="small text-muted">Magasins</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card h-100 metric-card p-3 text-center">
                            <div class="d-flex align-items-center justify-content-center mb-2">
                                <i class="fas fa-cash-register fa-2x text-success"></i>
                            </div>
                            <div class="fs-3 fw-bold" id="widgetTotalGuichets">0</div>
                            <div class="small text-muted">Guichets</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card h-100 metric-card p-3 text-center">
                            <div class="d-flex align-items-center justify-content-center mb-2">
                                <i class="fas fa-users fa-2x text-info"></i>
                            </div>
                            <div class="fs-3 fw-bold" id="widgetVendeurs">0</div>
                            <div class="small text-muted">Vendeurs</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card h-100 metric-card p-3 text-center">
                            <div class="d-flex align-items-center justify-content-center mb-2">
                                <i class="fas fa-exclamation-triangle fa-2x text-warning"></i>
                            </div>
                            <div class="fs-3 fw-bold text-warning" id="widgetStockAlertes">0</div>
                            <div class="small text-muted">Alertes stock</div>
                        </div>
                    </div>
                </div>

                <!-- DASHBOARD 3-PANES PRO -->
                <div class="row g-3" id="dashboardMagasins" style="display: flex; gap: 1rem;">
                    <!-- PANEL 1: Liste Magasins (Collapsible) -->
                    <div id="panelMagasins">
                        <div class="card h-100 shadow-lg border-0">
                            <!-- HEADER avec Toggle -->
                            <div class="card-header bg-light d-flex justify-content-between align-items-center p-3">
                                <h6 class="mb-0 fw-semibold text-label">
                                    <i class="fas fa-list text-primary me-2"></i>Magasins
                                </h6>
                                <button class="btn btn-sm btn-outline-primary toggle-panel-btn" id="togglePanelMagasins" title="Minimiser">
                                    <i class="fas fa-chevron-right" id="toggleIcon"></i>
                                </button>
                            </div>

                            <!-- EXPANDED: Search + List -->
                            <div class="panel-expanded">
                                <div class="card-header border-bottom p-2 bg-light">
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text border-0 bg-transparent">
                                            <i class="fas fa-search text-muted"></i>
                                        </span>
                                        <input id="searchMagasins" class="form-control border-start-0 ps-0 bg-transparent" placeholder="Rechercher..." style="border: none;">
                                    </div>
                                </div>
                                <div class="card-body p-0">
                                    <div id="magasinsList" class="list-group list-group-flush sortable-list" style="max-height: 70vh; overflow: auto;">
                                        <div class="d-flex align-items-center justify-content-center" style="height: 400px;">
                                            <div class="text-center">
                                                <div class="spinner-border spinner-border-sm text-primary mb-2" role="status">
                                                    <span class="visually-hidden">Chargement...</span>
                                                </div>
                                                <p class="text-muted small">Chargement...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- COLLAPSED: Photos Grid en Mini-Avatars -->
                            <div class="panel-collapsed p-2">
                                <div id="magasinsPhotosGrid" class="d-flex flex-column gap-2" style="max-height: 70vh; overflow: auto;">
                                    <!-- Photos mini-avatars générées dynamiquement -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- PANEL 2: Détails Magasin + KPI -->
                    <div class="pane-lg-5 panel-details" id="panelMagasinDetails">
                        <div class="card h-100 shadow-xl border-0 metric-card" id="magasinDetailsCard">
                            <!-- HEADER PHOTO GRADIENT -->
                            <div class="card-header text-white p-3 p-md-4 position-relative" id="magasinHeader" style="background: linear-gradient(180deg,#0ea5a4 0%, #059669 100%);">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div class="d-flex align-items-center gap-3">
                                        <!-- AVATAR -->
                                        <div id="magasinAvatar" style="width:64px;height:64px;border-radius:12px;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;">
                                            <i class="fas fa-store fa-2x text-white"></i>
                                        </div>
                                        <!-- TITRE -->
                                        <div>
                                            <h4 id="magasinName" class="mb-0 text-white">Sélectionnez un magasin</h4>
                                            <div class="info d-flex align-items-center gap-2">
                                                <i class="fas fa-user-tie" ></i><div class="small text-white-75" id="magasinSubtitle">Statut et informations rapides</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-light" id="btnEditMagasin" title="Modifier"><i class="fas fa-edit"></i></button>
                                        <button class="btn btn-sm btn-outline-light" id="duplicateMagasin" title="Dupliquer"><i class="fas fa-copy"></i></button>
                                    </div>
                                </div>
                                <div class="mt-3 d-flex gap-2" id="magasinStatusBadges"></div>
                            </div>
                            
                            <!-- CONTENT PRINCIPAL -->
                            <div class="p-4" id="magasinDetailsContent" style="min-height: 650px;">
                                <!-- 1. SPINNER (MASQUÉ) -->
                                <div id="magasinDetailsSpinner" class="d-flex align-items-center justify-content-center h-100" style="display: none;">
                                    <div class="text-center">
                                        <div class="spinner-border spinner-border-lg text-primary mb-3" role="status"></div>
                                        <p class="text-muted">Chargement des détails...</p>
                                    </div>
                                </div>
                                
                                <!-- 2. PLACEHOLDER (VISIBLE) -->
                                <div id="magasinDetailsPlaceholder" class="d-flex justify-content-center h-100 text-center">
                                    <div  >
                                        <i class="fas fa-store fa-3x text-muted mb-3"></i>
                                        <h5 class="text-muted mb-1">Sélectionnez un magasin</h5>
                                        <p class="text-muted small mb-0">Cliquez sur un magasin à gauche</p>
                                    </div>
                                </div>
                                
                                <!-- 3. DONNÉES (MASQUÉ) -->
                                <div id="magasinDetailsData" style="display: none;">
                                    <!-- KPI 4 COLONNES -->
                                    <div class="row g-3 mb-4">
                                        <div class="col-6">
                                            <div class="metric-card text-center p-4 bg-gradient-light rounded-3 border-0 h-100 position-relative">
                                                <div class="metric-icon mb-3 mx-auto">
                                                    <i class="fas fa-cash-register text-success fa-2x"></i>
                                                </div>
                                                <h3 class="fw-bold text-success mb-1" id="guichetsCount">0</h3>
                                                <div class="text-muted small">Guichets actifs</div>
                                                <button class="btn btn-success btn-sm position-absolute" id="btnAddGuichetKPI" style="top: 8px; right: 8px;" data-bs-toggle="modal" data-bs-target="#modalCreateGuichet" title="Ajouter guichet">
                                                    <i class="fas fa-plus"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="metric-card text-center p-4 bg-gradient-light rounded-3 border-0 h-100">
                                                <div class="metric-icon mb-3 mx-auto">
                                                    <i class="fas fa-users text-primary fa-2x"></i>
                                                </div>
                                                <h3 class="fw-bold text-primary mb-1" id="vendeursCount">0</h3>
                                                <div class="text-muted small">Vendeurs</div>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="metric-card text-center p-4 bg-gradient-info rounded-3 border-0 h-100">
                                                <div class="metric-icon mb-3 mx-auto">
                                                    <i class="fas fa-chart-line text-info fa-2x"></i>
                                                </div>
                                                <h3 class="fw-bold text-info mb-1" id="magasinCA">0 CDF</h3>
                                                <div class="text-muted small">CA 30 jours</div>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="metric-card text-center p-4 bg-gradient-warning rounded-3 border-0 h-100">
                                                <div class="metric-icon mb-3 mx-auto">
                                                    <i class="fas fa-exclamation-triangle text-warning fa-2x"></i>
                                                </div>
                                                <h3 class="fw-bold text-warning mb-1" id="stockAlertes">0</h3>
                                                <div class="text-muted small">Alertes stock</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- QUICK ACTIONS -->
                                    <div class="d-grid gap-2 mb-4">
                                        <button class="btn btn-outline-primary rounded-pill" id="btnViewRapports">
                                            <i class="fas fa-chart-bar me-2"></i>Rapports avancés
                                        </button>
                                        <div class="btn-group w-100" role="group">
                                            <button class="btn btn-success rounded-start-pill" id="btnAddGuichet" data-bs-toggle="modal" data-bs-target="#modalCreateGuichet">
                                                <i class="fas fa-plus me-1"></i>Guichet
                                            </button>
                                            <button class="btn btn-info rounded-end-pill" id="btnManageVendeurs">
                                                <i class="fas fa-users me-1"></i>Vendeurs
                                            </button>
                                        </div>
                                    </div>

                                    <!-- CHART VENTES -->
                                    <div class="border rounded-3 p-3 bg-light mb-4">
                                        <div class="d-flex justify-content-between align-items-center mb-3">
                                            <small class="text-muted">Ventes 7 jours</small>
                                            <small class="badge bg-success">+12%</small>
                                        </div>
                                        <canvas id="ventesChartDetails" height="60"></canvas>
                                    </div>

                                    <!-- INFOS MAGASIN -->
                                    <hr class="my-4">
                                    <div class="row g-3 small">
                                        <div class="col-6">
                                            <strong>Adresse:</strong><br>
                                            <span id="magasinAdresse" class="text-muted">-</span>
                                        </div>
                                        <div class="col-6">
                                            <strong>Téléphone:</strong><br>
                                            <span id="magasinTelephone" class="text-muted">-</span>
                                        </div>
                                        <div class="col-6">
                                            <strong>Créé le:</strong><br>
                                            <span id="magasinCreated" class="text-muted">-</span>
                                        </div>
                                        <div class="col-6">
                                            <strong>Statut:</strong><br>
                                            <span id="magasinStatus" class="badge bg-secondary">-</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- PANEL 3: Guichets -->
                    <div class="pane-lg-3 panel-guichets" id="panelGuichets">
                        <div class="card h-100 shadow-lg border-0 metric-card">
                            <div class="card-header bg-gradient-primary text-white d-flex justify-content-between align-items-center p-3">
                                <h6 class="mb-0 d-flex align-items-center">
                                    <i class="fas fa-cash-register me-2"></i>Guichets
                                    <span class="badge bg-light bg-opacity-20" id="guichetsBadge">0</span>
                                    <button class="btn btn-success btn-sm" id="btnAddGuichetHeader" data-bs-toggle="modal" data-bs-target="#modalCreateGuichet">+ <i class="fas fa-cash-register me-1"></i></button>     
                                </h6>
                                <i class="fas fa-plus-circle fa-lg quick-add-icon" id="quickAddGuichet" style="opacity: 0.7; cursor: pointer;" data-bs-toggle="modal" data-bs-target="#modalCreateGuichet"></i>
                            </div>
                            <div class="card-body p-0">
                                <div id="guichetsList" class="list-group list-group-flush sortable-list" style="max-height: 70vh; overflow: auto;">
                                    <div class="d-flex align-items-center justify-content-center" style="height: 300px;">
                                        <div class="text-center">
                                            <div class="spinner-border spinner-border-lg text-primary mb-3" role="status">
                                                <span class="visually-hidden">Chargement...</span>
                                            </div>
                                            <p class="text-muted">Sélectionnez un magasin</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer bg-light border-0 p-3">
                                <div class="d-flex justify-content-between align-items-center">
                                    <small class="text-success fw-bold" id="guichetStats">
                                        <i class="fas fa-check-circle me-1"></i>100% opérationnels
                                    </small>
                                    <button class="btn btn-sm btn-success" id="btnAddGuichetFooter" data-bs-toggle="modal" data-bs-target="#modalCreateGuichet">
                                        <i class="fas fa-plus me-1"></i>Ajouter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- MODALS AMÉLIORÉS -->
    <?php include_once 'modals/magasins-guichets-modals.php'; ?>
  <!-- ===============================================-->
    <!--    JavaScripts-->
    <!-- ===============================================-->
    <script src="vendors/popper/popper.min.js"></script>
    <script src="vendors/bootstrap/bootstrap.min.js"></script>
    <script src="vendors/anchorjs/anchor.min.js"></script>
    <script src="vendors/is/is.min.js"></script>
    <script src="vendors/echarts/echarts.min.js"></script>
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyARdVcREeBK44lIWnv5-iPijKqvlSAVwbw&callback=initMap" async></script>
    <script src="vendors/dayjs/dayjs.min.js"></script>
    <script src="vendors/fontawesome/all.min.js"></script>
    <script src="vendors/lodash/lodash.min.js"></script>
    <script src="vendors/list.js/list.min.js"></script>
    <script src="assets/js/theme.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="assets/js/auth-protection.js"></script>
    <!-- jQuery UI COMPLET (avec sortable) -->
    <script src="https://code.jquery.com/ui/1.13.3/jquery-ui.min.js"></script>
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.13.3/themes/ui-lightness/jquery-ui.css">
    <script src="assets/js/magasin_guichet.js"></script>

    
    <!-- Settings Panel (votre code existant) -->
    <!-- <?php include_once 'settings-panel.php'; ?> -->


</body>
</html>
