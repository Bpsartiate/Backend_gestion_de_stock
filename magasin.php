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
                <div class="row g-4" id="dashboardMagasins">
                    <!-- PANEL 1: Liste Magasins (35%) -->
                    <div class="col-lg-4 pane-lg-4">
                        <div class="card h-100 shadow-lg border-0 metric-card">
                            <div class="card-header bg-light d-flex justify-content-between align-items-center p-3">
                                <h6 class="mb-0 fw-semibold">
                                    <i class="fas fa-list text-primary me-2"></i>Magasins
                                </h6>
                                <div class="input-group input-group-sm" style="width: 180px;">
                                    <span class="input-group-text border-0">
                                        <i class="fas fa-search text-muted"></i>
                                    </span>
                                    <input id="searchMagasins" class="form-control border-start-0 ps-0" placeholder="Rechercher...">
                                </div>
                            </div>
                            <div class="card-body p-0">
                                <div id="magasinsList" class="list-group list-group-flush sortable-list" style="max-height: 70vh; overflow: auto;">
                                    <div class="d-flex align-items-center justify-content-center" style="height: 400px;">
                                        <div class="text-center">
                                            <div class="spinner-border spinner-border-lg text-primary mb-3" role="status">
                                                <span class="visually-hidden">Chargement...</span>
                                            </div>
                                            <p class="text-muted">Chargement des magasins...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- PANEL 2: Détails Magasin + KPI (40%) -->
                    <div class="col-lg-5 pane-lg-5">
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
                    <!-- PANEL 3: Guichets (25%) -->
                    <div class="col-lg-3 pane-lg-3">
                        <div class="card h-100 shadow-lg border-0 metric-card">
                            <div class="card-header bg-gradient-primary text-white d-flex justify-content-between align-items-center p-3">
                                <h6 class="mb-0 d-flex align-items-center">
                                    <i class="fas fa-cash-register me-2"></i>Guichets
                                    <span class="badge bg-light bg-opacity-20" id="guichetsBadge">0</span>
                                    <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#modalCreateGuichet">+ <i class="fas fa-cash-register me-1"></i></button>                                </h6>
                                    <i class="fas fa-plus-circle fa-lg quick-add-icon" id="quickAddGuichet" style="opacity: 0.7;"></i>
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
    <!-- jQuery UI COMPLET (avec sortable) -->
    <script src="https://code.jquery.com/ui/1.13.3/jquery-ui.min.js"></script>
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.13.3/themes/ui-lightness/jquery-ui.css">

    
    <!-- Settings Panel (votre code existant) -->
    <!-- <?php include_once 'settings-panel.php'; ?> -->

 <script>
// =================================================================
// DASHBOARD MAGASINS COMPLET - SPINNER + SEARCH + UX PRO 2025
// =================================================================

let CURRENT_MAGASIN_ID = null;
let MAGASINS_CACHE = {};
let ventesChart = null;
let API_BASE = window.API_BASE || '/api';

// SPINNER GLOBAL (utilisé partout)
function showSpinner(selector = null) {
    const spinnerHtml = `
        <div class="d-flex align-items-center justify-content-center" style="height: 300px;">
            <div class="text-center">
                <div class="spinner-border spinner-border-lg text-primary mb-3" role="status"></div>
                <p class="text-muted">Chargement...</p>
            </div>
        </div>
    `;
    
    if (selector === '#magasinDetailsContent') {
        // ✅ SPINNER UNIQUEMENT pour détails
        $(selector).html(spinnerHtml);
    } else if (selector) {
        $(selector).html(spinnerHtml);
    } else {
        $('#magasinsList, #guichetsList').html(spinnerHtml);
    }
}


// TOAST NOTIFICATIONS PRO
function showToast(message, type = 'info', duration = 4000) {
    const toastId = 'toast-' + Date.now();
    const bgClass = {
        'success': 'bg-success', 'danger': 'bg-danger', 
        'warning': 'bg-warning', 'info': 'bg-info'
    }[type] || 'bg-info';
    
    const html = `
        <div id="${toastId}" class="toast position-fixed ${bgClass} text-white" 
             style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;" role="alert">
            <div class="toast-body d-flex justify-content-between align-items-center">
                <div>
                    <i class="fas fa-${
                        type === 'success' ? 'check-circle' : 
                        type === 'danger' ? 'exclamation-circle' : 
                        type === 'warning' ? 'exclamation-triangle' : 'info-circle'
                    } me-2"></i>${message}
                </div>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
    const toastEl = document.getElementById(toastId);
    const bsToast = new bootstrap.Toast(toastEl, { autohide: true, delay: duration });
    bsToast.show();
    setTimeout(() => toastEl?.remove(), duration + 500);
}

// AUTH HEADERS
function authHeaders() {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// THEME SYSTEM
function initTheme() {
    try {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
    } catch (e) { console.warn('initTheme error:', e); }
}

// 🔍 SEARCH MAGASINS (FILTRE LOCAL)
function filterMagasins(query = '') {
    const q = query.toLowerCase().trim();
    
    if (q.length === 0) {
        $('#magasinsList .list-group-item').fadeIn(200);
        $('.no-results').remove();
        return;
    }
    
    let visibleCount = 0;
    $('#magasinsList .list-group-item').each(function() {
        const name = $(this).find('h6').text().toLowerCase();
        const adresse = $(this).find('small.text-muted').text().toLowerCase();
        const entreprise = $(this).find('.badge.bg-light').last().text().toLowerCase();
        
        if (name.includes(q) || adresse.includes(q) || entreprise.includes(q)) {
            $(this).fadeIn(200);
            visibleCount++;
        } else {
            $(this).fadeOut(200);
        }
    });
    
    // Message si 0 résultat
    $('.no-results').remove();
    if (visibleCount === 0) {
        $('#magasinsList').append(`
            <div class="no-results p-5 text-center text-muted">
                <i class="fas fa-search fa-3x mb-3 opacity-50"></i>
                <h5>Aucun magasin trouvé</h5>
                <p class="mb-0">Essayez "pharma", "centre ville", etc...</p>
            </div>
        `);
    }
}

// INITIALISATION COMPLÈTE
$(document).ready(function() {
    // Les spinners sont déjà dans le HTML, pas besoin de les afficher ici
    initTheme();
    
    loadDashboardData()
        .then(() => {
            initCharts();
            initSortable();
            bindEvents();
            setInterval(autoRefresh, 150000);
            console.log('🚀 Dashboard COMPLET prêt !');
        })
        .catch(err => {
            console.error('💥 Init failed:', err);
            showToast('❌ Erreur initiale: ' + err.message, 'danger');
        });
});

// CHARGEMENT PRINCIPAL
async function loadDashboardData() {
    console.clear();
    showSpinner();
    
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
        showToast('❌ Reconnectez-vous !', 'danger');
        return;
    }

    try {
        const magasinsRes = await fetch(`${API_BASE}/api/protected/magasins`, {
            headers: { ...authHeaders(), 'Accept': 'application/json' }
        });
        if (!magasinsRes.ok) throw new Error(`Magasins: ${magasinsRes.status}`);
        const magasins = await magasinsRes.json();
        
        const statsRes = await fetch(`${API_BASE}/api/protected/stats/magasins-guichets`, {
            headers: { ...authHeaders(), 'Accept': 'application/json' }
        });
        if (!statsRes.ok) throw new Error(`Stats: ${statsRes.status}`);
        const stats = await statsRes.json();
        
        // Widgets immédiats
        $('#widgetTotalMagasins').text(magasins.length);
        $('#widgetTotalGuichets').text(stats.totalGuichets || 0);
        $('#widgetVendeurs').text(stats.totalVendeurs || 0);
        $('#totalMagasins').text(magasins.length);
        $('#totalGuichets').text(stats.totalGuichets || 0);
        
        renderMagasins(magasins);
        updateGlobalStats(stats);
        showToast(`✅ ${magasins.length} magasins chargés`, 'success');
        
    } catch (err) {
        console.error('💥', err);
        $('#magasinsList').html(`
            <div class="p-5 text-center text-danger">
                <i class="fas fa-exclamation-triangle fa-3x mb-3 opacity-75"></i>
                <h5>Erreur de chargement</h5>
                <p class="text-muted">${err.message}</p>
                <button class="btn btn-primary mt-3" onclick="loadDashboardData()">
                    <i class="fas fa-redo me-2"></i>Réessayer
                </button>
            </div>
        `);
        showToast('❌ ' + err.message, 'danger');
    }
}

// RENDER MAGASINS
function renderMagasins(magasins) {
    $('#magasinsList').html(`
        <div class="d-flex align-items-center justify-content-center" style="height: 400px;">
            <div class="text-center">
                <div class="spinner-border spinner-border-lg text-primary mb-3" role="status"></div>
                <p class="text-muted">Rendu des magasins...</p>
            </div>
        </div>
    `);
    
    setTimeout(() => {
        MAGASINS_CACHE = {};
        const html = magasins.slice(0, 12).map(m => {
            MAGASINS_CACHE[m._id] = m;
            const photo = m.photoUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNERERERkQiLz4KPHRleHQgeD0iMjQiIHk9IjI5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSI+R28gU3RvcmU8L3RleHQ+Cjwvc3ZnPgo=';
            const entreprise = m.businessId?.nomEntreprise || 'N/A';
            const guichetsCount = m.guichets?.length || 0;
            
            return `
                <div class="list-group-item list-group-item-action px-3 py-3 border-start-0 hover-card" 
                     data-magasin-id="${m._id}" style="cursor:pointer;">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-grip-vertical drag-handle text-muted me-2 fs--1 opacity-50" style="cursor:grab;" title="Drag bientôt"></i>
                        <div class="me-3 flex-shrink-0" style="width:48px;height:48px;border-radius:12px;overflow:hidden;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);">
                            <img src="${photo}" alt="${m.nom_magasin}" style="width:100%;height:100%;object-fit:cover;" 
                                 onerror="this.style.display='none';this.parentNode.innerHTML='<i class=\'fas fa-store text-white fs-5\'></i>'" />
                        </div>
                        <div class="flex-grow-1 pe-3">
                            <div class="d-flex justify-content-between align-items-start mb-1">
                                <h6 class="mb-1 fw-bold text-truncate" style="max-width:200px;">${m.nom_magasin}</h6>
                                <span class="badge bg-success fs--2">${guichetsCount} G</span>
                            </div>
                            <small class="text-muted d-block mb-1">
                                <i class="fas fa-map-marked-alt text-primary me-1"></i>${m.adresse || '...'}
                            </small>
                            <div class="d-flex align-items-center gap-1">
                                <i class="fas fa-building text-primary fs--2"></i>
                                <small class="badge bg-light text-dark fs--3">${entreprise}</small>
                            </div>
                        </div>
                        <div class="text-end">
                            <i class="fas fa-chevron-right text-muted fs-5"></i>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        $('#magasinsList').html(html);
        $('#searchMagasins').val('').trigger('keyup');
        console.log('✅', magasins.length, 'magasins rendus');
    }, 300);
}

// DÉTAILS MAGASIN
let ventesChartDetails = null;

async function loadMagasinDetails(id) {
    if (!id) return console.warn('ID manquant');
    
    console.log('🔄 Chargement magasin:', id);
    
    // ✅ 1. AFFICHER SPINNER + CACHER PLACEHOLDER ET DONNÉES
    $('#magasinDetailsSpinner').show();
    $('#magasinDetailsPlaceholder').addClass('hidden-element');
    $('#magasinDetailsData').removeClass('shown-element').hide();
    
    let m;
    try {
        m = MAGASINS_CACHE[id];
        if (!m) {
            const res = await fetch(`${API_BASE}/api/protected/magasins/${id}`, { 
                headers: authHeaders() 
            });
            if (!res.ok) throw new Error(`Erreur ${res.status}`);
            m = await res.json();
            MAGASINS_CACHE[id] = m;
        }
        
        // ✅ 2. HEADER PHOTO (SANS ERREUR)
        const photo = m.photoUrl || m.photo;
        const $header = $('#magasinHeader');
        if (photo) {
            $header.css({
                'background': `linear-gradient(180deg, rgba(14,165,164,0.9), rgba(5,150,105,0.9)), url(${photo})`,
                'background-size': 'cover',
                'background-position': 'center',
                'background-blend-mode': 'multiply'
            });
            $('#magasinAvatar').html(
                `<img src="${photo}" style="width:100%;height:100%;border-radius:12px;object-fit:cover;border:2px solid rgba(255,255,255,0.4)" onerror="this.parentNode.innerHTML='<i class=\'fas fa-store fa-2x text-white\'></i>'">`
            );
        } else {
            $header.attr('style', 'background: linear-gradient(180deg,#0ea5a4 0%, #059669 100%)');
            $('#magasinAvatar').html('<i class="fas fa-store fa-2x text-white"></i>');
        }
        
        // ✅ 3. TITRE + MANAGER
        $('#magasinName').text(m.nom_magasin || 'Magasin sans nom');
        $('#magasinSubtitle').text(
            m.managerId ? `${m.managerId.prenom || ''} ${m.managerId.nom || ''}`.trim() || 'Gestionnaire' : 
            '📊 Informations rapides'
        );
        
        // ✅ 4. KPI
        $('#guichetsCount').text(m.guichets?.length || 0);
        $('#vendeursCount').text(m.vendeursCount || 0);
        $('#magasinCA').text((m.caMensuel || 0).toLocaleString() + ' CDF');
        $('#stockAlertes').text(m.stockAlertes || 0);
        
        // ✅ 5. INFOS
        $('#magasinAdresse').text(m.adresse || 'Non renseigné');
        $('#magasinTelephone').text(m.telephone || 'Non renseigné');
        $('#magasinCreated').text(m.createdAt ? new Date(m.createdAt).toLocaleDateString('fr-FR') : 'Non daté');
        $('#magasinStatus').text(m.status === 1 ? 'Actif' : 'Inactif')
            .removeClass('bg-secondary bg-success')
            .addClass(m.status === 1 ? 'bg-success' : 'bg-secondary');
        
        // ✅ 6. TAGS
        $('#magasinStatusBadges').html(
            (m.tags || []).slice(0, 4).map(t => 
                `<span class="badge bg-light text-dark fs--2 px-2 py-1">${t}</span>`
            ).join('')
        );
        
        // ✅ 7. CHART SÉCURISÉ (FIX ERREUR AXIS)
        setTimeout(() => {
            try {
                const canvas = document.getElementById('ventesChartDetails');
                if (!canvas || !canvas.getContext) {
                    console.warn('Canvas non disponible');
                    return;
                }
                
                const ctx = canvas.getContext('2d');
                if (ventesChartDetails) {
                    ventesChartDetails.destroy();
                    ventesChartDetails = null;
                }
                
                // ✅ CONFIG CHART.JS V4+ SANS ERREUR AXIS
                ventesChartDetails = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                        datasets: [{
                            label: 'Ventes',
                            data: [300, 500, 800, 1200, 900, 1100, 1500],
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            borderWidth: 3,
                            fill: true,
                            pointBackgroundColor: '#fff',
                            pointBorderColor: '#10b981',
                            pointBorderWidth: 3,
                            pointRadius: 6,
                            pointHoverRadius: 8
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: {
                                display: false,
                                grid: { display: false }
                            },
                            y: {
                                display: false,
                                grid: { display: false }
                            }
                        },
                        elements: {
                            point: { hoverBorderWidth: 2 }
                        },
                        interaction: {
                            intersect: false
                        }
                    }
                });
                
                console.log('✅ Chart créé');
                
            } catch (chartErr) {
                console.error('❌ Chart erreur:', chartErr);
                // Canvas fallback sans chart
                $('#ventesChartDetails').parent().html(`
                    <div class="text-center py-3">
                        <i class="fas fa-chart-line fa-2x text-success mb-2"></i>
                        <div class="text-success fw-bold">+12%</div>
                        <small class="text-muted">Ventes 7 jours</small>
                    </div>
                `);
            }
        }, 100);
        
        // ✅ 8. CHARGER ET AFFICHER LES GUICHETS (PANEL 3)
        try {
            const guichets = await loadGuichetsForMagasin(id);
            renderGuichets(guichets || []);
        } catch(guErr) {
            console.warn('Erreur chargement guichets:', guErr);
            renderGuichets([]);
        }
        
        // ✅ 9. ANIMATION FINALE
        setTimeout(() => {
            $('#magasinDetailsSpinner').hide();
            $('#magasinDetailsPlaceholder').addClass('hidden-element');  // ✅ Ajouter classe pour forcer display: none
            $('#magasinDetailsData').addClass('shown-element').show();  // ✅ Ajouter classe pour forcer display: block
        }, 600);
        
        CURRENT_MAGASIN_ID = id;
        showToast(`${m.nom_magasin} chargé`, 'success', 2000);
        
    } catch (err) {
        console.error('❌', err);
        $('#magasinDetailsSpinner').hide();
        $('#magasinDetailsPlaceholder').html(`
            <div class="text-center p-5">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h5 class="text-danger">Magasin introuvable</h5>
                <p class="text-muted small">${err.message}</p>
                <button class="btn btn-outline-primary btn-sm mt-3" onclick="loadMagasinDetails('${id}')">
                    <i class="fas fa-redo me-1"></i>Réessayer
                </button>
            </div>
        `).show();
        showToast('❌ ' + err.message, 'danger');
    }
}





// ÉVÉNEMENTS COMPLETS (avec SEARCH)
function bindEvents() {
    // 🔍 SEARCH MAGASINS
    $('#searchMagasins').on('keyup', function() {
        filterMagasins($(this).val());
    });
    
    // CLIC MAGASIN (inchangé)
    $(document).on('click', '[data-magasin-id]', function() {
        const id = $(this).data('magasin-id');
        $(this).addClass('active bg-primary-soft').siblings().removeClass('active bg-primary-soft');
        loadMagasinDetails(id);
    });
    
    // ✅ BOUTON EDIT MAGASIN (inchangé)
    $(document).on('click', '#btnEditMagasin', function() {
        if (CURRENT_MAGASIN_ID) {
            openEditModal(CURRENT_MAGASIN_ID);
        }
    });
    
    // ✅ SOUMETTRE MODIFICATION (inchangé)
    $(document).on('click', '#btnUpdateMagasin', function() {
        submitUpdateMagasin();
    });
    
    // ✅ REAL-TIME PHOTO PREVIEW (inchangé)
    $(document).on('click', '#editMagasinPhotoInput', function(e) {
        // ... votre code photo ...
    });
    
    // ✅ GUICHET CORRIGÉ 👇 (REMPLACEZ lignes 28-34)
    $(document).on('click', '[data-guichet-id]', function() {
        const id = $(this).data('guichet-id');
        console.log('💰 GUICHET CLIC:', id);
        $(this).addClass('active bg-success-soft').siblings().removeClass('active bg-success-soft');
        
        // OUVRIR MODAL AU LIEU DE PANEL 2
        $('#modalGuichetDetails').modal('show');
        loadGuichetDetails(id);  // ✅ SPINNER GUICHET dans MODAL
    });
    
    // REFRESH (inchangé)
    $('#refreshAllData').on('click', function() {
        $(this).find('i').addClass('fa-spin');
        showSpinner();
        loadDashboardData().finally(() => {
            $(this).find('i').removeClass('fa-spin');
            $('#searchMagasins').val('').trigger('keyup');
        });
    });
}


// SORTABLE VISUEL (sans jQuery UI)
function initSortable() {
    console.log('📱 Drag & Drop visuel activé');
}

// CHARTS
function initCharts() {
    const ctx = document.getElementById('ventesChart')?.getContext('2d');
    if (!ctx) return;
    ventesChart = new Chart(ctx, {
        type: 'line', data: {
            labels: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
            datasets: [{ data: [300, 500, 800, 1200, 900, 1100, 1500],
                borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4, borderWidth: 3, fill: true,
                pointBackgroundColor: '#fff', pointBorderColor: '#10b981', pointBorderWidth: 3 }]
        }, options: {
            responsive: true, plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false }, grid: { display: false } }
        }
    });
}

// STATS ANIMATIONS
function updateGlobalStats(stats) {
    try {
        animateCount('#widgetTotalMagasins', stats.totalMagasins || 0);
        animateCount('#widgetTotalGuichets', stats.totalGuichets || 0);
        animateCount('#widgetVendeurs', stats.totalVendeurs || 0);
        animateCount('#widgetStockAlertes', stats.stockAlerts || 0, true);
        
        $('#totalMagasins').text(stats.totalMagasins || 0);
        $('#guichetStats').html(`<i class="fas fa-check-circle me-1"></i>${Math.max(0, stats.operationalPercent||100)}% opérationnels`);
    } catch (e) { console.warn('updateGlobalStats:', e); }
}

function animateCount(selector, value, pulse = false) {
    const el = document.querySelector(selector);
    if (!el) return;
    const start = parseInt(el.textContent.replace(/[^0-9-]+/g, '')) || 0;
    const end = Number(value) || 0;
    const duration = 700;
    const startTime = performance.now();
    
    function step(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(start + (end - start) * eased);
        if (t < 1) requestAnimationFrame(step);
        else if (pulse) {
            el.classList.add('pulse');
            setTimeout(() => el.classList.remove('pulse'), 1600);
        }
    }
    requestAnimationFrame(step);
}

// =================================================================
// SYSTÈME GUICHETS COMPLET - MODAL + LISTE + ACTIONS 2025
// =================================================================

let CURRENT_GUICHET_ID = null;
let GUICHETS_CACHE = {};
let guichetChart = null;

// ✅ 1. RENDER GUICHETS (VOTRE CODE AMÉLIORÉ)
function renderGuichets(guichets) {
    const guichetsList = document.getElementById('guichetsList');
    if(!guichetsList) return;
    
    // Update badge
    const badge = document.getElementById('guichetsBadge');
    if(badge) badge.textContent = guichets.length;
    
    if(!guichets || guichets.length === 0) {
        guichetsList.innerHTML = `
            <div class="d-flex align-items-center justify-content-center" style="height: 300px;">
                <div class="text-center">
                    <i class="fas fa-inbox fa-3x text-muted mb-3" style="opacity: 0.5;"></i>
                    <p class="text-muted">Aucun guichet</p>
                    <p class="small text-muted">Créez un nouveau guichet</p>
                </div>
            </div>
        `;
        return;
    }
    
    guichetsList.innerHTML = guichets.map(g => `
        <div class="list-group-item px-3 py-2 border-bottom d-flex justify-content-between align-items-center hover-highlight" 
             style="cursor: pointer; transition: all 0.2s;" 
             data-guichet-id="${g._id}"
             onclick="openGuichetModal('${g._id}')"
             title="Cliquez pour détails">
           <div class="d-flex align-items-center flex-grow-1">
               <div class="avatar avatar-sm me-3">
                   <div class="avatar-initial rounded-circle bg-success bg-opacity-10 text-success fw-bold fs-2">
                       ${(g.codeGuichet || 'G').substring(0, 2)}
                   </div>
               </div>
               <div>
                   <div class="fw-semibold text-dark">${g.nomGuichet || 'Guichet'}</div>
                   <div class="small text-muted">
                       <i class="fas fa-user-tie me-1"></i>
                       ${g.vendeurPrincipal ? (g.vendeurPrincipal.prenom || '') + ' ' + (g.vendeurPrincipal.nom || '') : 'Non assigné'}
                   </div>
               </div>
           </div>
           <div class="text-end">
               <span class="badge ${g.status === 1 ? 'bg-success' : 'bg-secondary'} me-2 fs--2">
                   ${g.status === 1 ? '🟢 Actif' : '🔴 Inactif'}
               </span>
               <button class="btn btn-sm btn-outline-danger p-1 ms-1" 
                       onclick="event.stopPropagation(); deleteGuichet('${g._id}')"
                       title="Supprimer">
                   <i class="fas fa-trash fs--1"></i>
               </button>
           </div>
        </div>
    `).join('');
    
    console.log('✅', guichets.length, 'guichets rendus');
}

// ✅ 2. OUVRIR MODAL + CHARGER
function openGuichetModal(id) {
    console.log('🚀 OUVERTURE MODAL GUICHET:', id);
    CURRENT_GUICHET_ID = id;
    $('#modalGuichetDetails').modal('show');
    loadGuichetDetails(id);
}

// ✅ 3. CHARGEMENT COMPLET GUICHET
function loadGuichetDetails(id) {
    console.log('🔄 Guichet details:', id);
    
    if (!id) {
        showToast('❌ ID guichet manquant', 'danger');
        return;
    }
    
    // SPINNER
    $('#guichetSpinner').show();
    $('#guichetPlaceholder, #guichetDetailsData').hide();
    
    let g;
    try {
        g = GUICHETS_CACHE[id];
        if (!g) {
            g = simulateGuichetData(id); // REMPLACEZ PAR VOTRE API
            GUICHETS_CACHE[id] = g;
        }
        
        injectGuichetContent();
        updateGuichetHeader(g);
        updateGuichetKPI(g);
        updateCaissierInfo(g);
        updateStocksActifs(g);
        updateTransactionsRecentes(g);
        initGuichetChart();
        
        setTimeout(() => {
            $('#guichetSpinner').hide();
            $('#guichetDetailsData').fadeIn(400);
        }, 600);
        
        showToast(`✅ ${g.nomGuichet || g.nom} chargé`, 'success', 2000);
        
    } catch (err) {
        console.error('❌', err);
        $('#guichetSpinner').hide();
        $('#guichetPlaceholder').html(`
            <div class="text-center p-5">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h5 class="text-danger">Guichet introuvable</h5>
                <p class="text-muted">${err.message}</p>
            </div>
        `).show();
        showToast('❌ ' + err.message, 'danger');
    }
}

// ✅ 4. DONNÉES SIMULÉES (REMPLACEZ PAR API)
function simulateGuichetData(id) {
    return {
        _id: id,
        nomGuichet: `Guichet ${id.slice(-4)}`,
        codeGuichet: `G${id.slice(-4)}`,
        status: 1,
        caJour: 2450000,
        nbVentesJour: 47,
        nbClientsJour: 52,
        vendeurPrincipal: {
            prenom: "Marie",
            nom: "Kabila"
        },
        caissierActuel: {
            nomComplet: "Marie Kabila",
            lastLogin: new Date().toISOString(),
            ventesToday: 47
        },
        stocksActifs: [
            { produit: "Paracétamol 500mg", stock: 23, seuil: 10, ca: 156000 },
            { produit: "Amoxicilline 500mg", stock: 8, seuil: 15, ca: 89000 },
            { produit: "Ibuprofène 400mg", stock: 45, seuil: 20, ca: 123000 }
        ],
        transactions: [
            { id: "TX001", client: "Jean Dupont", montant: 8500, heure: "09:47", type: "Vente" },
            { id: "TX002", client: "Marie Ngozi", montant: 12500, heure: "09:42", type: "Vente" },
            { id: "TX003", client: "Paul Mvemba", montant: 6700, heure: "09:38", type: "Vente" }
        ]
    };
}

// ✅ 5. INJECTER CONTENT MODAL
function injectGuichetContent() {
    $('#guichetContent').append(`
        <div id="guichetDetailsData" style="display:none;">
            <!-- CAISSIER -->
            <div class="p-4 border-bottom bg-light">
                <h6 class="fw-bold mb-3"><i class="fas fa-user-tie me-2 text-primary"></i>Caissier Actuel</h6>
                <div class="row g-3">
                    <div class="col-md-8">
                        <div class="d-flex align-items-center p-3 bg-white rounded-3 shadow-sm">
                            <div class="bg-primary text-white rounded-circle p-2 me-3"><i class="fas fa-user fs-5"></i></div>
                            <div>
                                <div class="fw-bold fs-5" id="caissierNom">-</div>
                                <small class="text-muted" id="caissierConnexion">-</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="text-center p-4 bg-gradient-success rounded-3 h-100">
                            <div class="h3 fw-bold text-success mb-1" id="caissierVentes">0</div>
                            <small class="text-muted">Ventes aujourd'hui</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- KPI 2x2 -->
            <div class="p-4">
                <div class="row g-3 mb-4">
                    <div class="col-6">
                        <div class="p-4 text-center bg-gradient-primary rounded-3 h-100 shadow-sm hover-lift">
                            <i class="fas fa-coins fa-2x text-primary mb-3 d-block"></i>
                            <h3 class="fw-bold text-primary mb-1" id="guichetCAJour">0 CDF</h3>
                            <small class="text-muted">CA Jour</small>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-4 text-center bg-gradient-success rounded-3 h-100 shadow-sm hover-lift">
                            <i class="fas fa-shopping-cart fa-2x text-success mb-3 d-block"></i>
                            <h3 class="fw-bold text-success mb-1" id="guichetVentesNb">0</h3>
                            <small class="text-muted">Ventes</small>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-4 text-center bg-gradient-info rounded-3 h-100 shadow-sm hover-lift">
                            <i class="fas fa-users fa-2x text-info mb-3 d-block"></i>
                            <h3 class="fw-bold text-info mb-1" id="guichetClients">0</h3>
                            <small class="text-muted">Clients</small>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-4 text-center bg-gradient-warning rounded-3 h-100 shadow-sm hover-lift">
                            <i class="fas fa-calculator fa-2x text-warning mb-3 d-block"></i>
                            <h3 class="fw-bold text-warning mb-1" id="guichetMoyenneTicket">0 CDF</h3>
                            <small class="text-muted">Ticket moyen</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CHART -->
            <div class="p-4 bg-light border-bottom">
                <div class="d-flex justify-content-between mb-4">
                    <h6 class="mb-0 fw-bold"><i class="fas fa-chart-line me-2 text-info"></i>Ventes heure par heure</h6>
                    <span class="badge bg-success fs-2">+18%</span>
                </div>
                <div style="height: 100px;">
                    <canvas id="guichetVentesChart"></canvas>
                </div>
            </div>

            <!-- STOCKS -->
            <div class="p-4">
                <h6 class="fw-bold mb-3"><i class="fas fa-boxes me-2 text-warning"></i>Stocks Actifs</h6>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-dark">
                            <tr><th>Produit</th><th>Stock</th><th>Seuil</th><th>CA</th></tr>
                        </thead>
                        <tbody id="guichetStocksTable">
                            <tr><td colspan="4" class="text-center text-muted py-4">Chargement...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- TRANSACTIONS -->
            <div class="p-4 border-top">
                <h6 class="fw-bold mb-3"><i class="fas fa-receipt me-2 text-success"></i>Dernières Transactions</h6>
                <div class="list-group list-group-flush" id="guichetTransactions" style="max-height: 200px; overflow: auto;">
                    <div class="list-group-item text-center py-3 text-muted">Chargement...</div>
                </div>
            </div>
        </div>
    `);
}

// ✅ 6. UPDATE FONCTIONS
function updateGuichetHeader(g) {
    $('#guichetNom').text(g.nomGuichet || g.nom || 'Guichet');
    $('#guichetSubtitle').html(`<i class="fas fa-circle ${g.status === 1 ? 'text-success' : 'text-muted'} me-1"></i> ${g.status === 1 ? '🟢 En ligne' : '🔴 Hors ligne'}`);
}

function updateGuichetKPI(g) {
    $('#guichetCAJour').text((g.caJour || 0).toLocaleString() + ' CDF');
    $('#guichetVentesNb').text(g.nbVentesJour || 0);
    $('#guichetClients').text(g.nbClientsJour || 0);
    $('#guichetMoyenneTicket').text(Math.round((g.caJour || 0) / (g.nbVentesJour || 1)).toLocaleString() + ' CDF');
}

function updateCaissierInfo(g) {
    const c = g.caissierActuel || g.vendeurPrincipal;
    $('#caissierNom').text(c?.nomComplet || c?.prenom + ' ' + (c?.nom || '') || 'Aucun');
    $('#caissierConnexion').text(c?.lastLogin ? new Date(c.lastLogin).toLocaleString('fr-FR') : 'Non connecté');
    $('#caissierVentes').text(c?.ventesToday || g.nbVentesJour || 0);
}

function updateStocksActifs(g) {
    const html = (g.stocksActifs || []).map(s => `
        <tr class="${s.stock <= s.seuil ? 'table-warning' : ''}">
            <td class="fw-semibold">${s.produit}</td>
            <td><span class="badge ${s.stock <= s.seuil ? 'bg-warning' : 'bg-success'}">${s.stock}</span></td>
            <td><span class="badge bg-secondary">${s.seuil}</span></td>
            <td class="text-success fw-bold">${(s.ca || 0).toLocaleString()} CDF</td>
        </tr>
    `).join('');
    $('#guichetStocksTable').html(html || '<tr><td colspan="4" class="text-center text-muted py-4">Aucun stock actif</td></tr>');
}

function updateTransactionsRecentes(g) {
    const html = (g.transactions || []).slice(0, 5).map(t => `
        <div class="list-group-item d-flex justify-content-between align-items-center px-0">
            <div>
                <div class="fw-semibold">${t.client}</div>
                <small class="text-muted">${t.heure}</small>
            </div>
            <div class="text-end">
                <div class="fw-bold text-success">${(t.montant || 0).toLocaleString()} CDF</div>
                <small class="badge bg-success">${t.type || 'Vente'}</small>
            </div>
        </div>
    `).join('');
    $('#guichetTransactions').html(html || '<div class="list-group-item text-center py-3 text-muted">Aucune transaction</div>');
}

function initGuichetChart() {
    const canvas = document.getElementById('guichetVentesChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (guichetChart) guichetChart.destroy();
    
    guichetChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['08h', '09h', '10h', '11h', '12h', '13h', '14h'],
            datasets: [{
                data: [1200, 3400, 2800, 4500, 3200, 4100, 2900],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16,185,129,0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 2,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } }
        }
    });
}

// ✅ 7. ACTIONS
function deleteGuichet(id) {
    if (confirm('Supprimer ce guichet définitivement ?')) {
        // VOTRE API DELETE
        showToast('🗑️ Guichet supprimé', 'success');
        // Rafraîchir liste
        loadDashboardData();
    }
}

// ✅ 8. ÉVÉNEMENTS GLOBAUX (AJOUTEZ DANS bindEvents())
function bindGuichetEvents() {
    $(document).on('click', '[data-guichet-id]', function(e) {
        e.preventDefault();
        const id = $(this).data('guichet-id');
        openGuichetModal(id);
    });
    
    $(document).on('click', '[data-action="delete"]', function(e) {
        e.stopPropagation();
        const id = $(this).dataset.guichetId;
        deleteGuichet(id);
    });
}

// ==================== GUICHETS FUNCTIONS ====================

// Charge les guichets d'un magasin
async function loadGuichetsForMagasin(magasinId) {
    try {
        const token = (typeof getTokenLocal === 'function') ? getTokenLocal() : 
                     (localStorage.getItem('token') || localStorage.getItem('authToken'));
        const endpoint = (typeof API_BASE !== 'undefined' ? API_BASE : '') + `/api/protected/guichets/${magasinId}`;
        const response = await fetch(endpoint, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!response.ok) throw new Error('Erreur API');
        const guichets = await response.json();
        return guichets;
    } catch (error) {
        console.error('Erreur chargement guichets:', error);
        return [];
    }
}

// Créer un guichet
async function createGuichet(magasinId, data) {
    try {
        const token = getTokenLocal();
        const response = await fetch(`https://backend-gestion-de-stock.onrender.com/api/protected/guichets`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                magasinId,
                nomGuichet: data.nom,
                codeGuichet: data.code,
                status: data.status || 1,
                vendeurPrincipal: data.vendeurId || null,
                objectifJournalier: data.objectif || 0,
                stockMax: data.stock || 0
            })
        });
        if (!response.ok) throw new Error('Erreur création');
        const result = await response.json();
        showToast('✅ Guichet créé', 'success');
        return result.guichet;
    } catch (error) {
        console.error('Erreur:', error);
        showToast(`❌ ${error.message}`, 'error');
        return null;
    }
}

// Modifier un guichet
async function updateGuichet(guichetId, data) {
    try {
        const token = getTokenLocal();
        const response = await fetch(`https://backend-gestion-de-stock.onrender.com/api/protected/guichets/${guichetId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Erreur modification');
        const result = await response.json();
        showToast('✅ Guichet modifié', 'success');
        return result.guichet;
    } catch (error) {
        console.error('Erreur:', error);
        showToast(`❌ ${error.message}`, 'error');
        return null;
    }
}

// Supprimer un guichet
async function deleteGuichet(guichetId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce guichet?')) return;
    
    try {
        const token = getTokenLocal();
        const response = await fetch(`https://backend-gestion-de-stock.onrender.com/api/protected/guichets/${guichetId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erreur suppression');
        showToast('✅ Guichet supprimé', 'success');
        return true;
    } catch (error) {
        console.error('Erreur:', error);
        showToast(`❌ ${error.message}`, 'error');
        return false;
    }
}

// Affecter un vendeur à un guichet
async function affectVendeurToGuichet(guichetId, vendeurId) {
    try {
        const token = getTokenLocal();
        const response = await fetch(`https://backend-gestion-de-stock.onrender.com/api/protected/guichets/${guichetId}/affecter-vendeur`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ vendeurId })
        });
        if (!response.ok) throw new Error('Erreur affectation');
        const result = await response.json();
        showToast('✅ Vendeur affecté', 'success');
        return result.affectation;
    } catch (error) {
        console.error('Erreur:', error);
        showToast(`❌ ${error.message}`, 'error');
        return null;
    }
}

// Charger les affectations
async function loadAffectations(filters = {}) {
    try {
        const token = getTokenLocal();
        const query = new URLSearchParams(filters).toString();
        const response = await fetch(`https://backend-gestion-de-stock.onrender.com/api/protected/affectations/list?${query}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erreur API');
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Erreur:', error);
        return [];
    }
}

// Charger l'historique d'activités
async function loadActivities(filters = {}) {
    try {
        const token = getTokenLocal();
        const query = new URLSearchParams(filters).toString();
        const response = await fetch(`https://backend-gestion-de-stock.onrender.com/api/protected/activites?${query}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erreur API');
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Erreur:', error);
        return [];
    }
}

function autoRefresh() {
    if (document.visibilityState === 'visible') loadDashboardData();
}

function toastSuccess(msg) { showToast('✅ ' + msg, 'success', 3000); }

// ==================== EDIT MAGASIN FUNCTIONS ====================

// Charge les gestionnaires depuis l'API
async function loadManagers() {
    try {
        const token = getTokenLocal();
        if (!token) throw new Error('Non authentifié');
        
        // ✅ Essayer d'abord /members (utilisé dans le modal create)
        try {
            const response = await fetch('https://backend-gestion-de-stock.onrender.com/api/protected/members', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                console.log('📋 Members reçus:', data.length, data);
                
                // Filtrer les superviseurs (utilisé dans le modal create magasin)
                const managers = (data || []).filter(m => m.role === 'superviseur');
                console.log('👥 Superviseurs filtrés:', managers.length, managers);
                
                if (managers.length > 0) return managers;
            }
        } catch (e) {
            console.log('⚠️ /members endpoint échoué, trying /utilisateurs...');
        }
        
        // ✅ Sinon essayer /utilisateurs
        const response = await fetch('https://backend-gestion-de-stock.onrender.com/api/protected/utilisateurs', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`Erreur ${response.status}`);
        const data = await response.json();
        
        const utilisateurs = Array.isArray(data) ? data : (data.data || data.utilisateurs || []);
        console.log('📋 Utilisateurs reçus:', utilisateurs.length, utilisateurs);
        
        // Filtrer les gestionnaires/managers/superviseurs
        const managers = utilisateurs.filter(u => 
            u.role === 'gestionnaire' || u.role === 'manager' || u.role === 'Gestionnaire' || u.role === 'superviseur'
        );
        
        console.log('👥 Gestionnaires filtrés:', managers.length, managers);
        
        if (managers.length === 0) {
            console.warn('⚠️ Aucun gestionnaire trouvé - rôles disponibles:', 
                utilisateurs.map(u => u.role).filter((v, i, a) => a.indexOf(v) === i).join(', ')
            );
        }
        
        return managers;
    } catch (error) {
        console.error('❌ Erreur chargement gestionnaires:', error);
        showToast('⚠️ Impossible de charger les gestionnaires: ' + error.message, 'warning');
        return [];
    }
}

// Événement de fermeture du modal d'édition
const editModalEl = document.getElementById('modalEditMagasin');
if (editModalEl) {
    editModalEl.addEventListener('hidden.bs.modal', function() {
        // Réinitialiser le formulaire
        const form = document.getElementById('formEditMagasin');
        if (form) {
            form.reset();
        }
        
        // Réinitialiser la preview photo
        $('#editMagasinPhotoPreview').html('<img src="assets/img/placeholders/photo-placeholder.jpg" alt="preview" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" />');
        
        // Vider le fichier sélectionné
        $('#editMagasinPhotoInput').val('');
    });
}

// Ouvre le modal d'édition et remplit les données
async function openEditModal(magasinId) {
    const magasin = MAGASINS_CACHE[magasinId];
    if (!magasin) {
        showToast('❌ Magasin non trouvé', 'error');
        return;
    }
    
    // Définir l'ID du magasin en édition
    $('#editMagasinId').val(magasinId);
    
    // Mettre à jour le titre du modal
    $('#editMagasinName').text(magasin.nom_magasin || magasin.nom || 'Magasin');
    
    // Remplir les champs de base
    $('#editMagasinNom').val(magasin.nom_magasin || magasin.nom || '');
    $('#editMagasinAdresse').val(magasin.adresse || '');
    $('#editMagasinTelephone').val(magasin.telephone || '');
    $('#editMagasinDescription').val(magasin.description || '');
    
    // Charger la photo actuelle (photoUrl est le nom du champ dans MongoDB)
    const photo = magasin.photoUrl || magasin.photo;
    if (photo) {
        $('#editMagasinPhotoPreview').html(
            `<img src="${photo}" alt="${magasin.nom_magasin}" style="width:100%; height:100%; border-radius: 8px; object-fit: cover;" onerror="this.parentNode.innerHTML='<p class=\'text-muted\'>Photo non disponible</p>'">`
        );
    } else {
        $('#editMagasinPhotoPreview').html('<p class="text-muted">Pas de photo</p>');
    }
    
    // Charger et remplir les gestionnaires
    console.log('⏳ Chargement des gestionnaires...');
    const $select = $('#editMagasinManagerId');
    $select.html('<option value="">Chargement des gestionnaires...</option>');
    
    const managers = await loadManagers();
    
    console.log('✅ Gestionnaires chargés:', managers.length, managers);
    
    // Remplir le select
    $select.html('<option value="">Sélectionner un gestionnaire...</option>');
    
    if (managers.length === 0) {
        $select.append(`<option disabled>Aucun gestionnaire disponible</option>`);
        showToast('⚠️ Aucun gestionnaire trouvé', 'warning', 3000);
    } else {
        managers.forEach(m => {
            // ✅ Gérer le cas où managerId est un objet ou une string
            const currentManagerId = magasin.managerId?._id || magasin.managerId;
            const isSelected = currentManagerId && (currentManagerId === m._id || currentManagerId.toString() === m._id.toString());
            const selected = isSelected ? 'selected' : '';
            const label = `${m.prenom || ''} ${m.nom || ''}`.trim() || m.email || 'Sans nom';
            console.log('  → Option:', label, '(ID:', m._id, ') Selected:', isSelected);
            $select.append(`<option value="${m._id}" ${selected}>${label}</option>`);
        });
    }
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('modalEditMagasin'), { keyboard: false });
    modal.show();
}

// Soumet la modification du magasin
async function submitUpdateMagasin() {
    const magasinId = $('#editMagasinId').val();
    const nom = $('#editMagasinNom').val().trim();
    const managerId = $('#editMagasinManagerId').val();
    
    if (!nom) {
        showToast('❌ Le nom du magasin est obligatoire', 'error');
        return;
    }
    
    // Récupérer le magasin depuis le cache pour avoir l'entrepriseId
    const magasin = MAGASINS_CACHE[magasinId];
    if (!magasin) {
        showToast('❌ Magasin non trouvé en cache', 'error');
        return;
    }
    
    // ✅ Extraction robuste de l'entrepriseId
    let entrepriseId = null;
    if (magasin.businessId) {
        // Si businessId est un objet avec _id
        if (typeof magasin.businessId === 'object' && magasin.businessId._id) {
            entrepriseId = magasin.businessId._id;
        }
        // Si businessId est directement l'ID (string)
        else if (typeof magasin.businessId === 'string') {
            entrepriseId = magasin.businessId;
        }
    }
    // Fallback vers entrepriseId directement s'il existe
    if (!entrepriseId && magasin.entrepriseId) {
        entrepriseId = magasin.entrepriseId;
    }
    
    // ✅ Validation stricte
    if (!entrepriseId || entrepriseId === 'undefined' || entrepriseId === 'null' || entrepriseId === '') {
        console.error('❌ ERREUR CRITIQUE: Impossible d\'extraire entrepriseId:', {
            businessId: magasin.businessId,
            businessIdType: typeof magasin.businessId,
            businessIdIsObject: magasin.businessId && typeof magasin.businessId === 'object',
            entrepriseId: magasin.entrepriseId,
            extracted: entrepriseId,
            magasin: magasin
        });
        showToast('❌ Erreur: ID entreprise manquant ou invalide. Contactez le support.', 'error');
        return;
    }
    
    console.log('📝 Mise à jour magasin:', { magasinId, nom, managerId, entrepriseId });
    console.log('🔍 Magasin du cache:', magasin);
    console.log('🔍 enterpriseId AVANT FormData - type:', typeof entrepriseId, 'valeur:', entrepriseId);
    
    // Créer un FormData pour supporter les fichiers
    const formData = new FormData();
    formData.append('nom_magasin', nom);
    formData.append('adresse', $('#editMagasinAdresse').val());
    formData.append('telephone', $('#editMagasinTelephone').val());
    formData.append('description', $('#editMagasinDescription').val());
    
    // ✅ Append entrepriseId (déjà validé ci-dessus)
    console.log('🔍 Avant append - entrepriseId:', entrepriseId, 'String:', String(entrepriseId));
    formData.append('entrepriseId', String(entrepriseId));
    // ✅ ALSO append as businessId for compatibility
    formData.append('businessId', String(entrepriseId));
    console.log('✅ entrepriseId et businessId ajoutés à FormData:', String(entrepriseId));
    
    if (managerId) {
        formData.append('managerId', managerId);
    }
    
    // Si une nouvelle photo est sélectionnée
    const photoFile = $('#editMagasinPhotoInput')[0].files[0];
    if (photoFile) {
        formData.append('photo', photoFile);
    }
    
    try {
        $('#btnUpdateMagasin').prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-2"></i>Enregistrement...');
        
        const token = getTokenLocal();
        if (!token) throw new Error('Non authentifié');
        
        // ✅ LOG FormData avant envoi
        console.log('📤 FormData à envoyer:');
        const formDataEntries = [];
        for (let [key, value] of formData.entries()) {
            formDataEntries.push({ key, value: value instanceof File ? `[File: ${value.name}]` : value });
            console.log(`  ${key}:`, value instanceof File ? `[File: ${value.name}]` : value);
        }
        console.log('📋 Résumé FormData:', formDataEntries);
        
        const response = await fetch(
            `https://backend-gestion-de-stock.onrender.com/api/protected/magasins/${magasinId}`,
            {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            }
        );
        
        console.log('📥 Réponse serveur:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Erreur serveur détaillée:', errorData);
            console.error('📋 FormData envoyé était:', formDataEntries);
            throw new Error(errorData.message || `Erreur ${response.status}: ${errorData.error || 'mise à jour échouée'}`);
        }
        
        const updatedMagasin = await response.json();
        
        // Mettre à jour le cache avec le magasin mis à jour
        MAGASINS_CACHE[magasinId] = updatedMagasin;
        
        // Fermer le modal
        const modalEl = document.getElementById('modalEditMagasin');
        if (modalEl) {
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) {
                modalInstance.hide();
            }
        }
        
        // ✅ Recharger COMPLÈTEMENT le magasin depuis l'API avec tous les détails populés
        setTimeout(async () => {
            try {
                const freshRes = await fetch(`${API_BASE}/api/protected/magasins/${magasinId}`, { 
                    headers: authHeaders() 
                });
                if (freshRes.ok) {
                    const freshMagasin = await freshRes.json();
                    MAGASINS_CACHE[magasinId] = freshMagasin;
                    loadMagasinDetails(magasinId);
                    toastSuccess('Magasin modifié avec succès');
                }
            } catch (e) {
                console.error('Erreur rechargement magasin:', e);
                loadMagasinDetails(magasinId);
                toastSuccess('Magasin modifié avec succès');
            }
        }, 500);
        
    } catch (error) {
        console.error('Erreur:', error);
        showToast(`❌ ${error.message}`, 'error');
    } finally {
        $('#btnUpdateMagasin').prop('disabled', false).html('<i class="fas fa-save me-2"></i>Enregistrer');
    }
}
</script>


</body>
</html>
