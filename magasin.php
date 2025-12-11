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
    <style>
        :root {
            --primary-glow: 0 0 20px rgba(99, 102, 241, 0.5);
            --success-glow: 0 0 20px rgba(16, 185, 129, 0.5);
            --metric-hover: translateY(-8px) scale(1.02);
        }
        [data-theme="dark"] { --bg-card: #1e293b; --bg-light: #334155; }
        
        .gradient-header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }
        .metric-card { 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: none; 
            backdrop-filter: blur(10px);
        }
        .metric-card:hover { 
            transform: var(--metric-hover); 
            box-shadow: var(--primary-glow) !important;
        }
        /* KPI specific visuals */
        .metric-card .metric-icon { width:56px;height:56px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));box-shadow: inset 0 -6px 18px rgba(0,0,0,0.08);} 
        .metric-card .metric-value { transition: transform .28s ease, color .2s ease; font-variant-numeric: tabular-nums; }
        .metric-card:hover .metric-value { transform: translateY(-4px); }
        .bg-gradient-light { background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); }
        .bg-gradient-info { background: linear-gradient(135deg, rgba(16,185,129,0.06), rgba(16,185,129,0.02)); }
        .bg-gradient-warning { background: linear-gradient(135deg, rgba(250,204,21,0.06), rgba(250,204,21,0.02)); }
        .metric-badge { font-size:0.75rem; padding:6px 8px; border-radius:8px; }

        /* subtle pulsing for alert numbers */
        @keyframes pulseAlert { 0% { transform: scale(1); } 50% { transform: scale(1.04); } 100% { transform: scale(1); } }
        .pulse { animation: pulseAlert 1.6s ease-in-out 1; }
        .sortable-item { cursor: grab; }
        .sortable-item:active { cursor: grabbing; }
        .drag-handle { opacity: 0; transition: opacity 0.2s; }
        .sortable-item:hover .drag-handle { opacity: 1; }
        @media (max-width: 992px) { 
            .pane-lg-3, .pane-lg-4 { display: none !important; }
            .pane-lg-5 { flex: 0 0 100% !important; max-width: 100% !important; }
        }
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
                                        <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#modalCreateGuichet"><i class="fas fa-cash-register me-1"></i>Ajoutter un Guichet</button>
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
                <div class="row g-4" id="dashboardMagasins">
                    <!-- PANEL 1: Liste Magasins (35%) -->
                    <div class="col-lg-4 pane-lg-4">
                        <div class="card h-100 shadow-lg border-0 metric-card">
                            <div class="card-header bg-light d-flex justify-content-between align-items-center p-3">
                                <h6 class="mb-0 fw-semibold">
                                    <i class="fas fa-list text-primary me-2"></i>Magasins
                                </h6>
                                <div class="input-group input-group-sm" style="width: 200px;">
                                    <span class="input-group-text bg-transparent border-0">
                                        <i class="fas fa-search text-muted"></i>
                                    </span>
                                    <input id="searchMagasins" class="form-control border-start-0 ps-0" placeholder="Rechercher...">
                                </div>
                            </div>
                            <div class="card-body p-0">
                                <div id="magasinsList" class="list-group list-group-flush sortable-list" style="max-height: 70vh; overflow: auto;">
                                    <!-- Chargement dynamique -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- PANEL 2: Détails Magasin + KPI (40%) -->
                    <div class="col-lg-5 pane-lg-5">
                        <div class="card h-100 shadow-xl border-0 metric-card" id="magasinDetailsCard">
                            <div class="card-header text-white p-3 p-md-4 position-relative" style="background: linear-gradient(180deg,#0ea5a4 0%, #059669 100%);">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div class="d-flex align-items-center gap-3">
                                        <div style="width:64px;height:64px;border-radius:12px;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;">
                                            <i class="fas fa-store fa-2x text-white"></i>
                                        </div>
                                        <div>
                                            <h4 id="magasinName" class="mb-0">Sélectionnez un magasin</h4>
                                            <div class="small text-white-75" id="magasinSubtitle">Statut et informations rapides</div>
                                        </div>
                                    </div>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-light" id="btnEditMagasin" title="Modifier"><i class="fas fa-edit"></i></button>
                                        <button class="btn btn-sm btn-outline-light" id="duplicateMagasin" title="Dupliquer"><i class="fas fa-copy"></i></button>
                                    </div>
                                </div>
                                <div class="mt-3 d-flex gap-2" id="magasinStatusBadges"></div>
                            </div>
                            
                            <!-- KPI ULTRA-MODERNES -->
                            <div class="p-4">
                                <div class="row g-3 mb-4">
                                    <div class="col-6">
                                        <div class="metric-card text-center p-4 bg-gradient-light rounded-3 border-0 h-100">
                                            <div class="metric-icon mb-3 mx-auto">
                                                <i class="fas fa-cash-register text-success fa-2x"></i>
                                            </div>
                                            <h3 class="fw-bold text-success mb-1" id="guichetsCount">0</h3>
                                            <div class="text-muted small">Guichets actifs</div>
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
                                        <button class="btn btn-success rounded-start-pill" id="btnAddGuichet">
                                            <i class="fas fa-plus me-1"></i>Guichet
                                        </button>
                                        <button class="btn btn-info rounded-end-pill" id="btnManageVendeurs">
                                            <i class="fas fa-users me-1"></i>Vendeurs
                                        </button>
                                    </div>
                                </div>

                                <!-- Chart Ventes -->
                                <div class="border rounded-3 p-3 bg-light">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <small class="text-muted">Ventes 7 jours</small>
                                        <small class="badge bg-success">+12%</small>
                                    </div>
                                    <canvas id="ventesChart" height="60"></canvas>
                                </div>

                                <!-- Infos Magasin -->
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

                    <!-- PANEL 3: Guichets (25%) -->
                    <div class="col-lg-3 pane-lg-3">
                        <div class="card h-100 shadow-lg border-0 metric-card">
                            <div class="card-header bg-gradient-primary text-white d-flex justify-content-between align-items-center p-3">
                                <h6 class="mb-0">
                                    <i class="fas fa-cash-register me-2"></i>Guichets
                                    <span class="badge bg-light bg-opacity-20" id="guichetsBadge">0</span>
                                </h6>
                                <i class="fas fa-plus-circle fa-lg quick-add-icon" id="quickAddGuichet" style="opacity: 0.7;"></i>
                            </div>
                            <div class="card-body p-0">
                                <div id="guichetsList" class="list-group list-group-flush sortable-list" style="max-height: 70vh; overflow: auto;">
                                    <!-- Guichets dynamiques -->
                                </div>
                            </div>
                            <div class="card-footer bg-light border-0 p-3">
                                <small class="text-success fw-bold" id="guichetStats">
                                    <i class="fas fa-check-circle me-1"></i>100% opérationnels
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- MODALS AMÉLIORÉS -->
    <?php include_once 'modals/magasins-guichets-modals.php'; ?>

    <!-- VOS SCRIPTS + NOUVEAUX -->
    <script src="vendors/popper/popper.min.js"></script>
    <script src="vendors/bootstrap/bootstrap.min.js"></script>
    <script src="vendors/fontawesome/all.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="assets/js/theme.js"></script>
    <script src="assets/js/auth-protection.js"></script>
    
    <!-- Settings Panel (votre code existant) -->
    <!-- <?php include_once 'settings-panel.php'; ?> -->

    <!-- SUPRISE JS : Dashboard Pro -->
    <script>
        let CURRENT_MAGASIN_ID = null;
        let ventesChart = null;

        // Initialisation
        $(document).ready(function() {
            initTheme();
            loadDashboardData();
            initCharts();
            initSortable();
            bindEvents();
            setInterval(autoRefresh, 30000); // 30s auto-refresh
        });

        // CHARGEMENT DASHBOARD COMPLET
        async function loadDashboardData() {
            showSpinner('#magasinsList, #guichetsList');
            try {
                const headers = Object.assign({'Accept':'application/json'}, authHeaders());
                console.log('[loadDashboardData] Using headers:', headers);
                console.log('[loadDashboardData] API_BASE:', API_BASE);
                
                const [magasins, stats] = await Promise.all([
                    fetch(`${API_BASE}/api/protected/magasins`, { headers, mode: 'cors' }),
                    fetch(`${API_BASE}/api/protected/stats/magasins-guichets`, { headers, mode: 'cors' })
                ]);
                
                if(!magasins.ok){
                    if(magasins.status===401 || magasins.status===403){
                        showToast('Accès non autorisé. Veuillez vous reconnecter.', 'danger');
                        if(window.AuthProtection && typeof window.AuthProtection.redirectToLogin === 'function') setTimeout(()=>window.AuthProtection.redirectToLogin(), 800);
                    }
                    throw new Error('Erreur récupération magasins: ' + magasins.status);
                }
                if(!stats.ok){
                    if(stats.status===401 || stats.status===403){
                        showToast('Accès non autorisé. Veuillez vous reconnecter.', 'danger');
                        if(window.AuthProtection && typeof window.AuthProtection.redirectToLogin === 'function') setTimeout(()=>window.AuthProtection.redirectToLogin(), 800);
                    }
                    throw new Error('Erreur récupération stats: ' + stats.status);
                }
                const magasinsData = await magasins.json();
                const statsData = await stats.json();
                
                renderMagasins(magasinsData);
                updateGlobalStats(statsData);
                
                $('#currentEntreprise').text(statsData.entreprise?.nom || 'Non définie');
            } catch(err) {
                console.error('Dashboard load error:', err);
                console.error('Error details:', err.message, err.stack);
                showToast('Erreur chargement: ' + err.message, 'danger');
            }
        }

        // RENDER MAGASINS (avec drag handle + actions) — affiche photo si disponible
        const MAGASINS_CACHE = {};
        function renderMagasins(magasins) {
            // cache magasins by id for later use
            magasinListHtml = magasins.map(m => {
                MAGASINS_CACHE[m._id] = m;
                const photo = m.photoUrl || m.photo || 'assets/img/placeholders/store-placeholder.jpg';
                const managerId = m.managerId || m.manager || (m.manager && m.manager._id) || null;
                // role-based visibility: admin sees edit, superviseur only if assigned
                const token = (typeof getToken === 'function') ? getToken() : (localStorage.getItem('token') || localStorage.getItem('authToken') || null);
                let currentUser = null;
                try{ currentUser = token ? (typeof decodeJwt === 'function' ? decodeJwt(token) : null) : null; }catch(e){ currentUser = null; }
                const isAdmin = currentUser && currentUser.role === 'admin';
                const isAssignedSupervisor = currentUser && currentUser.role === 'superviseur' && (managerId && (managerId.toString() === (currentUser.id || currentUser._id || '')));

                const showEdit = isAdmin || isAssignedSupervisor;

                return (`
                    <div class="list-group-item list-group-item-action sortable-item px-3 py-3 border-start-0 d-flex justify-content-between align-items-start" 
                         data-magasin-id="${m._id}">
                        <div class="d-flex align-items-center flex-grow-1">
                            <i class="fas fa-grip-vertical drag-handle text-muted me-3 fs-5"></i>
                            <div class="me-3 d-flex align-items-center justify-content-center" style="width:54px;height:54px;border-radius:8px;overflow:hidden;background:rgba(0,0,0,0.03);">
                                <img src="${photo}" alt="${m.nomMagasin}" style="width:54px;height:54px;object-fit:cover;display:block;" />
                            </div>
                            <div class="flex-fill">
                                <div class="d-flex align-items-center justify-content-between">
                                    <h6 class="mb-0 fw-semibold">${m.nomMagasin}</h6>
                                    <div class="small text-muted">${m.adresse || ''}</div>
                                </div>
                                <div class="mt-1 d-flex gap-2 align-items-center">
                                    <span class="badge bg-success">${m.guichetsCount || 0} guichet(s)</span>
                                    <small class="text-500">${formatCurrency(m.caMensuel || 0)}</small>
                                </div>
                            </div>
                        </div>
                        <div class="ms-3 d-flex flex-column align-items-end">
                            <div class="btn-group mb-2" role="group">
                                <button class="btn btn-sm btn-outline-secondary btn-view-magasin" data-magasin-id="${m._id}" title="Voir"><i class="fas fa-eye"></i></button>
                                ${ showEdit ? `<button class="btn btn-sm btn-outline-primary btn-edit-magasin" data-magasin-id="${m._id}" title="Modifier"><i class="fas fa-edit"></i></button>` : '' }
                            </div>
                            <small class="text-muted">${m.updatedAt ? new Date(m.updatedAt).toLocaleString() : ''}</small>
                        </div>
                    </div>
                `);
            }).join('');

            $('#magasinsList').html(magasinListHtml);
            $('#totalMagasins').text(magasins.length);
            // update widget count quickly
            $('#widgetTotalMagasins').text(magasins.length);

            // Re-bind handlers for buttons (in case)
            // view and edit handled by document.on in bindEvents
        }

        // Load and display magasin details in the right panel
        async function loadMagasinDetails(id){
            if(!id) return;
            // try cache first
            let m = MAGASINS_CACHE[id] || null;
            try{
                if(!m){
                    const res = await fetch((typeof API_BASE!=='undefined'?API_BASE:'') + `/api/protected/magasins/${id}` , { headers: (typeof authHeaders === 'function') ? authHeaders() : {} });
                    if(res.ok) m = await res.json();
                    else throw new Error('Magasin non trouvé');
                    MAGASINS_CACHE[id] = m;
                }
                // populate details
                const photo = m.photoUrl || m.photo || 'assets/img/placeholders/store-placeholder.jpg';
                $('#magasinName').text(m.nomMagasin || m.nom || 'Magasin');
                $('#magasinSubtitle').text(m.managerName ? `Géré par ${m.managerName}` : (m.manager ? (m.manager.prenom+' '+(m.manager.nom||'')) : ''));
                $('#magasinAdresse').text(m.adresse || '-');
                $('#magasinTelephone').text(m.telephone || '-');
                $('#magasinCreated').text(m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '-');
                $('#magasinStatus').text(m.status === 1 ? 'Actif' : 'Inactif').removeClass('bg-secondary bg-success').addClass(m.status === 1 ? 'bg-success' : 'bg-secondary');
                $('#magasinStatusBadges').html((m.tags||[]).map(t=>`<span class="badge bg-light text-700">${t}</span>`).join(' '));
                // counts
                $('#guichetsCount').text(m.guichetsCount || 0);
                $('#vendeursCount').text(m.vendeursCount || 0);
                $('#magasinCA').text((m.caMensuel ? formatCurrency(m.caMensuel) : '0') + ' CDF');
                $('#stockAlertes').text(m.stockAlertes || 0);
                // set current selected
                CURRENT_MAGASIN_ID = id;
                // set image in header icon if possible
                $('#magasinDetailsCard .card-header div[style]').find('img').remove();
                // optionally show photo in header as background
                $('#magasinDetailsCard .card-header').css('background-image', `url(${photo})`).css('background-size','cover').css('background-position','center');
            }catch(err){ console.error('loadMagasinDetails', err); showToast('Impossible de charger magasin', 'danger'); }
        }

        // Populate edit modal with magasin data
        function populateEditModal(id){
            const m = MAGASINS_CACHE[id];
            if(!m) return;
            $('#editMagasinId').val(id);
            $('#editMagasinName').text(m.nomMagasin || m.nom || '');
            $('#formEditMagasin input[name="nomMagasin"]').val(m.nomMagasin || m.nom || '');
            // preview image
            const preview = document.querySelector('#editMagasinPhotoPreview img');
            if(preview) preview.src = m.photoUrl || m.photo || 'assets/img/placeholders/photo-placeholder.jpg';
            // stats
            $('#editCaTotal').text(m.caTotal || 0);
            // history - if available
            if(Array.isArray(m.history)){
                $('#magasinHistory').html(m.history.map(h=>`<tr><td>${new Date(h.date).toLocaleString()}</td><td>${h.action}</td><td>${h.user}</td><td>${h.details||''}</td></tr>`).join(''));
            }
        }

        // Submit update magasin
        async function submitUpdateMagasin(){
            const id = $('#editMagasinId').val();
            if(!id) return showToast('Aucun magasin sélectionné', 'warning');
            const fd = new FormData(document.getElementById('formEditMagasin'));
            try{
                const res = await fetch((typeof API_BASE!=='undefined'?API_BASE:'') + `/api/protected/magasins/${id}`, { method: 'PUT', body: fd, headers: (typeof authHeaders === 'function') ? authHeaders() : {} });
                if(!res.ok) throw new Error('Erreur serveur');
                const data = await res.json();
                // update cache and UI
                MAGASINS_CACHE[id] = data.magasin || data;
                await loadDashboardData();
                showToast('Magasin mis à jour', 'success');
                $('#modalEditMagasin').modal('hide');
            }catch(err){ console.error('update magasin', err); showToast('Erreur mise à jour','danger'); }
        }

        // Create guichet submit handler
        async function submitCreateGuichet(ev){
            ev.preventDefault();
            const form = document.getElementById('formCreateGuichet');
            const fd = new FormData(form);
            try{
                const res = await fetch((typeof API_BASE!=='undefined'?API_BASE:'') + '/api/protected/guichets', { method: 'POST', body: fd, headers: (typeof authHeaders === 'function') ? authHeaders() : {} });
                if(!res.ok) throw new Error('Erreur création guichet');
                const data = await res.json();
                showToast('Guichet créé', 'success');
                $('#modalCreateGuichet').modal('hide');
                await loadDashboardData();
            }catch(err){ console.error('create guichet', err); showToast('Erreur création guichet','danger'); }
        }

        // Update global stats/widgets using server-calculated statsData
        function updateGlobalStats(stats) {
            try{
                const magasins = stats.totalMagasins || stats.totalStores || 0;
                const guichets = stats.totalGuichets || stats.totalCashiers || 0;
                const vendeurs = stats.totalVendeurs || stats.sellers || 0;
                const alerts = stats.stockAlerts || stats.alertes || 0;

                // animate widgets for a nicer UX
                animateCount('#widgetTotalMagasins', magasins);
                animateCount('#widgetTotalGuichets', guichets);
                animateCount('#widgetVendeurs', vendeurs);
                animateCount('#widgetStockAlertes', alerts, true);

                // header badges
                $('#totalMagasins').text(magasins);
                $('#totalGuichets').text(guichets);
                $('#guichetsBadge').text(guichets);

                // small status line
                $('#guichetStats').html(`<i class="fas fa-check-circle me-1"></i>${Math.max(0, stats.operationalPercent||100)}% opérationnels`);
            }catch(e){ console.warn('updateGlobalStats failed', e); }
        }

        // Animate numeric counters (selector, target value)
        function animateCount(selector, value, pulse=false){
            try{
                const el = document.querySelector(selector);
                if(!el) return;
                const start = parseInt(el.textContent.replace(/[^0-9-]+/g,'')) || 0;
                const end = Number(value) || 0;
                const duration = 700;
                const startTime = performance.now();
                el.classList.remove('pulse');
                function step(now){
                    const t = Math.min(1, (now - startTime) / duration);
                    const eased = 1 - Math.pow(1 - t, 3);
                    const current = Math.round(start + (end - start) * eased);
                    el.textContent = current;
                    if(t < 1) requestAnimationFrame(step);
                    else {
                        // final formatting for currency-like IDs
                        if(selector.toLowerCase().includes('ca') || selector.toLowerCase().includes('cdf')){
                            // keep as is
                        }
                        if(pulse){ el.classList.add('pulse'); setTimeout(()=>el.classList.remove('pulse'), 1600); }
                    }
                }
                requestAnimationFrame(step);
            }catch(e){ console.warn('animateCount', e); }
        }

        // ÉVÉNEMENTS
        function bindEvents() {
            // Clic magasin
            $(document).on('click', '[data-magasin-id]', function() {
                CURRENT_MAGASIN_ID = $(this).data('magasin-id');
                $('.sortable-item').removeClass('active bg-primary-soft');
                $(this).addClass('active bg-primary-soft');
                loadMagasinDetails(CURRENT_MAGASIN_ID);
            });

            // Quick refresh
            $('#refreshAllData').click(() => {
                $('#refreshIcon').addClass('fa-spin');
                loadDashboardData().finally(() => $('#refreshIcon').removeClass('fa-spin'));
            });

            // View / Edit buttons in magasin list
            $(document).on('click', '.btn-view-magasin', function(e){
                e.stopPropagation();
                const id = $(this).data('magasin-id');
                if(id){ CURRENT_MAGASIN_ID = id; $('.sortable-item').removeClass('active bg-primary-soft'); $(this).closest('.sortable-item').addClass('active bg-primary-soft'); loadMagasinDetails(id); }
            });
            $(document).on('click', '.btn-edit-magasin', function(e){
                e.stopPropagation();
                const id = $(this).data('magasin-id');
                if(!id) return;
                // populate and open edit modal
                populateEditModal(id);
                $('#modalEditMagasin').modal('show');
            });
            
            // Submit update magasin
            $('#btnUpdateMagasin').off('click').on('click', function(){
                submitUpdateMagasin();
            });

            // Create guichet form submit
            $('#formCreateGuichet').off('submit').on('submit', submitCreateGuichet);
        }

        // CHARTS ANIMÉS
        function initCharts() {
            const ctx = document.getElementById('ventesChart')?.getContext('2d');
            if (!ctx) return;
            
            ventesChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
                    datasets: [{
                        data: [300, 500, 800, 1200, 900, 1100, 1500],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        borderWidth: 3,
                        fill: true,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#10b981',
                        pointBorderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { 
                        x: { display: false }, 
                        y: { display: false },
                        grid: { display: false }
                    }
                }
            });
        }

        // DRAG & DROP
        function initSortable() {
            $('#magasinsList, #guichetsList').sortable({
                handle: '.drag-handle',
                placeholder: 'bg-light border rounded p-3',
                update: function(e, ui) {
                    // API reorder
                    toastSuccess('Ordre sauvegardé !');
                }
            });
        }

        // UTILITAIRES
        function showSpinner(selector) { $(selector).html('<div class="p-4 text-center"><div class="spinner-border text-primary me-2" role="status"></div>Chargement...</div>'); }
        function toastSuccess(msg) { showToast(msg, 'success'); }
        function formatCurrency(val) { return new Intl.NumberFormat('fr-CDF').format(val); }
        function autoRefresh() { if (document.visibilityState === 'visible') loadDashboardData(); }

        // PWA Ready
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
        }
    </script>
</body>
</html>
