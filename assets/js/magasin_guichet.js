// =================================================================
// DASHBOARD MAGASINS COMPLET - SPINNER + SEARCH + UX PRO 2025
// =================================================================

let CURRENT_MAGASIN_ID = null;
let MAGASINS_CACHE = {};
let ventesChart = null;
let API_BASE = 'https://backend-gestion-de-stock.onrender.com'; // ✅ API hébergée

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
    initPanelToggle();
    
    // Initialize panel state - ALWAYS start expanded
    // (Clear old localStorage if needed)
    localStorage.removeItem('panelState');
    localStorage.setItem('panelState', 'expanded');
    
    const panelMagasins = $('#panelMagasins');
    const toggleIcon = $('#toggleIcon');
    
    console.log('🔄 Initializing panel to EXPANDED state');
    
    // Always start expanded
    panelMagasins.removeClass('collapsed');
    toggleIcon.removeClass('fa-chevron-right').addClass('fa-chevron-left');
    console.log('✅ Panel initialized as EXPANDED');
    
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
        renderMagasinAvatars(magasins); // Render avatars for collapsed view
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
        sessionStorage.setItem('currentMagasinId', id); // ✅ Sauvegarder ID pour les autres pages (comme stock)
        sessionStorage.setItem('currentMagasinNom', m.nom_magasin); // ✅ Sauvegarder le nom aussi
        updateAddGuichetButtonState(); // 🟢 Active les boutons "Ajouter Guichet"
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
// ========== PANEL TOGGLE SYSTEM ==========
function initPanelToggle() {
    console.log('📱 Panel Toggle System Initialized');
    
    // Toggle button click - using vanilla JS for better compatibility
    const toggleBtn = document.getElementById('togglePanelMagasins');
    if (toggleBtn) {
        // Handle clicks on button and its children (SVG, icons, etc.)
        const handleToggleClick = function(e) {
            if (e.type === 'click') {
                e.preventDefault();
            }
            e.stopPropagation();
            console.log('✅ Toggle button clicked - calling togglePanel1()');
            togglePanel1();
        };
        
        toggleBtn.addEventListener('click', handleToggleClick);
        toggleBtn.addEventListener('mousedown', function(e) {
            e.preventDefault();
        });
        
        console.log('✅ Toggle button listener attached');
    } else {
        console.warn('⚠️ Toggle button #togglePanelMagasins not found');
    }
}

function togglePanel1() {
    const panelMagasins = document.getElementById('panelMagasins');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (!panelMagasins) {
        console.error('❌ Panel #panelMagasins not found');
        return;
    }
    
    // Simply toggle the class - don't check state
    panelMagasins.classList.toggle('collapsed');
    
    const isNowCollapsed = panelMagasins.classList.contains('collapsed');
    console.log('🔄 Panel toggled - Now:', isNowCollapsed ? 'COLLAPSED' : 'EXPANDED');
    console.log('Classes on panel:', panelMagasins.className);
    
    // Update chevron icon
    if (toggleIcon) {
        if (isNowCollapsed) {
            // Show chevron-right when collapsed
            toggleIcon.classList.remove('fa-chevron-left');
            toggleIcon.classList.add('fa-chevron-right');
            console.log('Chevron: → (collapsed)');
        } else {
            // Show chevron-left when expanded
            toggleIcon.classList.remove('fa-chevron-right');
            toggleIcon.classList.add('fa-chevron-left');
            console.log('Chevron: ← (expanded)');
        }
    }
    
    // Save state
    localStorage.setItem('panelState', isNowCollapsed ? 'collapsed' : 'expanded');
    console.log('Saved to localStorage:', isNowCollapsed ? 'collapsed' : 'expanded');
    
    // If collapsing, reset magasin details UI mais GARDER la sélection
    if (isNowCollapsed) {
        const detailsData = document.getElementById('magasinDetailsData');
        const placeholder = document.getElementById('magasinDetailsPlaceholder');
        if (detailsData) detailsData.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
        
        document.querySelectorAll('#magasinsListDetails .list-group-item').forEach(item => {
            item.classList.remove('active', 'bg-primary-soft');
        });
        
        // ⚠️ NE PAS remettre CURRENT_MAGASIN_ID à null ! 
        // Les boutons "Ajouter Guichet" doivent rester actifs même si les détails sont masqués
        // CURRENT_MAGASIN_ID reste défini pour que les boutons restent actifs
        console.log('✅ Details masqués (collapse) - CURRENT_MAGASIN_ID conservé:', CURRENT_MAGASIN_ID);
    }
}

// Render mini avatars when collapsed
function renderMagasinAvatars(magasins) {
    const grid = $('#magasinsPhotosGrid');
    grid.empty();
    
    magasins.slice(0, 20).forEach(m => {
        const photo = m.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nom_magasin)}&background=667eea&color=fff&size=70`;
        const html = `
            <div class="avatar-mini" data-magasin-id="${m._id}" title="${m.nom_magasin}" style="width: 70px; height: 70px;">
                <img src="${photo}" alt="${m.nom_magasin}" style="  width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\"fas fa-store\"></i>
            </div>
        `;
        grid.append(html);
    });
    
    // Bind click events to avatars
    grid.find('.avatar-mini').on('click', function(e) {
        e.stopPropagation();
        const magasinId = $(this).data('magasin-id');
        console.log('Avatar cliqué:', magasinId);
        selectMagasinAvatar(magasinId);
    });
    
    console.log('✅ Avatars rendus:', magasins.length);
}

// Select magasin from avatar and auto-collapse
function selectMagasinAvatar(magasinId) {
    console.log('Sélection avatar magasin:', magasinId);
    
    // Highlight selected avatar
    $('.avatar-mini').removeClass('selected');
    $(`.avatar-mini[data-magasin-id="${magasinId}"]`).addClass('selected');
    
    // Highlight selected in list
    $('[data-magasin-id]').removeClass('active bg-primary-soft');
    $(`[data-magasin-id="${magasinId}"]`).addClass('active bg-primary-soft');
    
    // Load details
    loadMagasinDetails(magasinId).then(() => {
        // ✅ Auto-expand SEULEMENT sur desktop/tablet (>767px)
        const isMobile = window.innerWidth <= 767;
        if (!isMobile) {
            const dashboard = $('#dashboardMagasins');
            if (dashboard.hasClass('panels-collapsed')) {
                togglePanel1(); // Expand to show details
            }
        }
    }).catch(err => {
        console.error('Erreur selectMagasinAvatar:', err);
    });
}

/**
 * ✅ Contrôle l'état des boutons "Ajouter Guichet"
 * Les guichets appartiennent à un magasin, donc le bouton
 * ne doit être actif que si un magasin est sélectionné
 */
function updateAddGuichetButtonState() {
    const buttons = [
        document.getElementById('btnAddGuichet'),        // Panel details
        document.getElementById('btnAddGuichetKPI'),     // KPI card (NOUVEAU)
        document.getElementById('btnAddGuichetHeader'),  // Header panel guichets
        document.getElementById('quickAddGuichet'),      // Icon
        document.getElementById('btnAddGuichetFooter')   // Footer
    ];
    
    console.log('🔄 updateAddGuichetButtonState() appelée - CURRENT_MAGASIN_ID:', CURRENT_MAGASIN_ID);
    
    buttons.forEach((btn, idx) => {
        if (!btn) {
            console.warn(`⚠️ Bouton ${idx} non trouvé`);
            return;
        }
        
        if (CURRENT_MAGASIN_ID) {
            // 🟢 MAGASIN SÉLECTIONNÉ = BOUTON ACTIF
            btn.disabled = false;
            btn.removeAttribute('disabled');
            btn.classList.remove('disabled');
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.style.pointerEvents = 'auto';
            console.log(`✅ Bouton ${idx} activé - CURRENT_MAGASIN_ID: ${CURRENT_MAGASIN_ID}`);
        } else {
            // 🔴 PAS DE MAGASIN = BOUTON DÉSACTIVÉ
            btn.disabled = true;
            btn.setAttribute('disabled', 'disabled');
            btn.classList.add('disabled');
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.style.pointerEvents = 'none';
            console.log(`❌ Bouton ${idx} désactivé`);
        }
    });
}

function bindEvents() {
    // 🔍 SEARCH MAGASINS
    $('#searchMagasins').on('keyup', function() {
        filterMagasins($(this).val());
    });
    
    // CLIC MAGASIN (inchangé)
    $(document).on('click', '[data-magasin-id]', function() {
        const id = $(this).data('magasin-id');
        $(this).addClass('active bg-primary-soft').siblings().removeClass('active bg-primary-soft');
        
        // Update button state for add guichet
        updateAddGuichetButtonState();
        
        // Charger les détails et collapse SAUF sur mobile
        loadMagasinDetails(id).then(() => {
            // ✅ Auto-collapse SEULEMENT sur desktop/tablet (>767px)
            setTimeout(() => {
                const isMobile = window.innerWidth <= 767;
                if (!isMobile) {
                    const dashboard = $('#dashboardMagasins');
                    if (!dashboard.hasClass('panels-collapsed')) {
                        togglePanel1();
                    }
                }
            }, 700);
        }).catch(err => {
            console.error('Erreur chargement magasin:', err);
        });
    });
    
    // ❌ LISTENER SUPPRIMÉ - Désormais géré dans modals/magasins-guichets-modals.php
    // Les listeners pour le modal de création de guichet sont maintenant consolidés dans le PHP
    // pour éviter les doublons et les appels de fetch multiples
    
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

// ✅ 1. RENDER GUICHETS (DESIGN PREMIUM)
function renderGuichets(guichets) {
    const guichetsList = document.getElementById('guichetsList');
    if(!guichetsList) return;
    
    // ✅ SAVE guichets data for later use (edit modal, etc)
    window.lastLoadedGuichets = guichets;
    
    // ✅ Add to global allGuichets cache for fallback searches
    if (!window.allGuichets) window.allGuichets = [];
    guichets.forEach(g => {
        if (!window.allGuichets.find(gu => gu._id === g._id)) {
            window.allGuichets.push(g);
        }
    });
    
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
    
    guichetsList.innerHTML = guichets.map((g, idx) => {
        // ✅ NORMALISER LES DONNÉES (gérer les deux formats)
        const nomGuichet = g.nomGuichet || g.nom_guichet || 'Guichet';
        const codeGuichet = g.codeGuichet || g.code || '';
        
        const statusColor = g.status === 1 ? '#10b981' : '#6b7280';
        const statusText = g.status === 1 ? '🟢 Actif' : '🔴 Inactif';
        const vendeurName = g.vendeurPrincipal 
            ? `${g.vendeurPrincipal.prenom || ''} ${g.vendeurPrincipal.nom || ''}`.trim()
            : 'Non assigné';
        const initiales = codeGuichet 
            ? codeGuichet.substring(0, 4).toUpperCase()
            : `G${idx + 1}`;
        
        return `
            <div class="list-group-item px-3 py-3 border-bottom" style="
                cursor: pointer; 
                transition: all 0.25s ease;
                background: linear-gradient(135deg, #fff 0%, #f9fafb 100%);
                border-left: 4px solid ${statusColor};
                position: relative;
                overflow: hidden;
            " 
             data-guichet-id="${g._id}"
             onmouseover="this.style.background='linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'; this.style.transform='translateX(4px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'"
             onmouseout="this.style.background='linear-gradient(135deg, #fff 0%, #f9fafb 100%)'; this.style.transform='translateX(0)'; this.style.boxShadow='none'"
             onclick="openGuichetModal('${g._id}')"
             title="Cliquez pour détails">
                
                <!-- Avatar + Info Principale -->
                <div class="d-flex align-items-center gap-3">
                    <div style="
                        width: 48px;
                        height: 48px;
                        border-radius: 12px;
                        background: linear-gradient(135deg, ${statusColor}15 0%, ${statusColor}25 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        color: ${statusColor};
                        font-size: 16px;
                        flex-shrink: 0;
                    ">
                        ${initiales}
                    </div>
                    
                    <div class="flex-grow-1 min-w-0">
                        <!-- Nom guichet + Code -->
                        <div class="fw-semibold text-dark" style="font-size: 14px;">
                            ${nomGuichet}
                        
                        </div>
                        
                        <!-- Vendeur + Status en ligne -->
                        <div class="small text-muted" style="font-size: 12px; margin-top: 4px;">
                            <i class="fas fa-user-tie me-1" style="color: #3b82f6;"></i>
                            <span style="font-weight: 500;">${vendeurName}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Actions + Status sur la droite -->
                <div class="d-flex align-items-center gap-2" style="position: absolute; top: 25px; right: 10px;">
                    <!-- Status Badge -->
                    <span class="badge" style="
                        background: ${g.status === 1 ? 'linear-gradient(135deg, #10b98122 0%, #06b6d422 100%)' : 'linear-gradient(135deg, #d1d5db22 0%, #9ca3af22 100%)'};
                        color: ${g.status === 1 ? '#059669' : '#6b7280'};
                        border: 1px solid ${g.status === 1 ? '#10b98144' : '#d1d5db44'};
                        font-size: 11px;
                        font-weight: 600;
                        padding: 4px 10px;
                        border-radius: 20px;
                    ">
                        ${statusText}
                    </span>
                    
                  
                    
                  
                    
                    <!-- Delete Button -->
                    <button class="btn btn-sm btn-outline-danger" 
                            onclick="event.stopPropagation(); deleteGuichet('${g._id}')"
                            title="Supprimer"
                            style="padding: 4px 8px; font-size: 12px; transition: all 0.2s;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    console.log('✅', guichets.length, 'guichets rendus avec design premium');
}

// ✅ 2. OUVRIR MODAL + CHARGER
function openGuichetModal(id) {
    console.log('🚀 OUVERTURE MODAL GUICHET:', id);
    CURRENT_GUICHET_ID = id;
    
    // ✅ INITIALISER L'ÉTAT DU MODAL
    document.getElementById('guichetSpinner').style.setProperty('display', 'flex', 'important');
    document.getElementById('guichetPlaceholder').style.setProperty('display', 'none', 'important');
    document.getElementById('guichetContent').style.setProperty('display', 'none', 'important');
    
    $('#modalGuichetDetails').modal('show');
    loadGuichetDetails(id);
}

// ✅ 3. CHARGEMENT COMPLET GUICHET (AVEC API)
async function loadGuichetDetails(id) {
    console.log('🔄 Guichet details:', id);
    
    if (!id) {
        showToast('❌ ID guichet manquant', 'danger');
        return;
    }
    
    // SPINNER
    $('#guichetSpinner').show();
    $('#guichetPlaceholder').css('display', 'none'); // Force hide
    $('#guichetContent').css('display', 'none'); // Force hide
    
    try {
        let g = GUICHETS_CACHE[id];
        
        // Si pas en cache, faire l'appel API avec fallbacks sophistiqués
        if (!g) {
            let apiError = null;
            try {
                const token = localStorage.getItem('token') || localStorage.getItem('authToken');
                const response = await fetch(`${API_BASE}/api/protected/guichets/${id}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                
                if (response.ok) {
                    g = await response.json();
                    console.log('✅ Guichet chargé via API directe');
                } else {
                    apiError = new Error(`API ${response.status}`);
                    throw apiError;
                }
            } catch (err) {
                apiError = err;
                console.warn('⚠️ API endpoint échoué:', err.message);
                console.warn('🔍 FALLBACK DIAGNOSTICS - Cherchant guichet ID:', id);
                
                // ✅ FALLBACK 1: Chercher dans les derniers guichets chargés
                console.log('📋 Fallback 1: lastLoadedGuichets exists?', !!window.lastLoadedGuichets, 'Count:', window.lastLoadedGuichets?.length || 0);
                if (window.lastLoadedGuichets && Array.isArray(window.lastLoadedGuichets)) {
                    g = window.lastLoadedGuichets.find(gu => gu._id === id);
                    if (g) {
                        console.log('✅ Guichet trouvé dans lastLoadedGuichets (Fallback 1)');
                    } else {
                        console.log('❌ Guichet NOT found in lastLoadedGuichets. Available IDs:', window.lastLoadedGuichets.map(x => x._id));
                    }
                }
                
                // ✅ FALLBACK 2: Chercher dans TOUS les magasins (si données accessibles)
                console.log('📋 Fallback 2: allGuichets exists?', !!window.allGuichets, 'Count:', window.allGuichets?.length || 0);
                if (!g && window.allGuichets && Array.isArray(window.allGuichets)) {
                    g = window.allGuichets.find(gu => gu._id === id);
                    if (g) {
                        console.log('✅ Guichet trouvé dans allGuichets (Fallback 2)');
                    } else {
                        console.log('❌ Guichet NOT found in allGuichets. Available IDs:', window.allGuichets.map(x => x._id));
                    }
                }
                
                // ✅ FALLBACK 3: Charger la liste des guichets du magasin courant
                console.log('📋 Fallback 3: CURRENT_MAGASIN_ID?', CURRENT_MAGASIN_ID);
                if (!g && typeof CURRENT_MAGASIN_ID !== 'undefined' && CURRENT_MAGASIN_ID) {
                    try {
                        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
                        console.log('🔄 Fetching guichets for magasin:', CURRENT_MAGASIN_ID);
                        const listRes = await fetch(`${API_BASE}/api/protected/guichets/${CURRENT_MAGASIN_ID}`, {
                            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                        });
                        
                        if (listRes.ok) {
                            const guichets = await listRes.json();
                            console.log('📦 Got', guichets.length, 'guichets from magasin list');
                            g = guichets.find(gu => gu._id === id);
                            if (g) {
                                console.log('✅ Guichet trouvé dans liste magasin (Fallback 3)');
                                // Sauvegarder pour réutilisation future
                                if (!window.allGuichets) window.allGuichets = [];
                                if (!window.allGuichets.find(gu => gu._id === id)) {
                                    window.allGuichets.push(g);
                                }
                            } else {
                                console.log('❌ Guichet NOT found in magasin list. Available IDs:', guichets.map(x => x._id));
                            }
                        } else {
                            console.warn('Fallback 3: API returned', listRes.status);
                        }
                    } catch (e) {
                        console.warn('Fallback 3 échoué:', e.message);
                    }
                } else {
                    console.log('❌ Fallback 3 skipped: CURRENT_MAGASIN_ID not set');
                }
                
                // ✅ FALLBACK 4: Essayer de récupérer depuis la page magasin (si on y est)
                console.log('📋 Fallback 4: Chercher magasinId depuis le DOM ou contexte page');
                if (!g) {
                    try {
                        let magId = CURRENT_MAGASIN_ID;
                        
                        // Chercher dans les attributs data du DOM
                        if (!magId) {
                            const pageData = document.querySelector('[data-magasin-id]');
                            magId = pageData?.getAttribute('data-magasin-id');
                        }
                        
                        // Chercher dans les inputs du formulaire
                        if (!magId) {
                            const magInput = document.querySelector('input[name="magasinId"], input[value*="-"]');
                            magId = magInput?.value;
                        }
                        
                        if (magId) {
                            console.log('🔄 Found magasin ID in DOM/context:', magId);
                            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
                            const listRes = await fetch(`${API_BASE}/api/protected/guichets/${magId}`, {
                                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                            });
                            
                            if (listRes.ok) {
                                const guichets = await listRes.json();
                                console.log('📦 Got', guichets.length, 'guichets from magasin list');
                                g = guichets.find(gu => gu._id === id);
                                if (g) {
                                    console.log('✅ Guichet trouvé dans liste magasin (Fallback 4)');
                                    if (!window.allGuichets) window.allGuichets = [];
                                    if (!window.allGuichets.find(gu => gu._id === id)) {
                                        window.allGuichets.push(g);
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        console.warn('Fallback 4 échoué:', e.message);
                    }
                }
                
                // ❌ Si aucun fallback n'a marché
                if (!g) {
                    throw new Error(`Guichet ${id} introuvable partout. Erreur API: ${apiError.message}`);
                }
            }
            
            // Normaliser les noms de champs (API peut retourner nom_guichet ou nomGuichet)
            console.log('🔧 Normalizing guichet data:', g._id, 'nomGuichet:', g.nomGuichet, 'nom_guichet:', g.nom_guichet);
            if (!g.nomGuichet && g.nom_guichet) g.nomGuichet = g.nom_guichet;
            if (!g.codeGuichet && g.code) g.codeGuichet = g.code;
            
            // S'assurer que les données attendues sont présentes
            if (!g.produitVendus) g.produitVendus = [];
            if (!g.transactions) g.transactions = [];
            
            GUICHETS_CACHE[id] = g;
            console.log('💾 Guichet stocké en cache. Prêt à afficher:', g.nomGuichet);
        }
        
        console.log('📊 Avant updateGuichetHeader() - guichet:', g.nomGuichet);
        try {
            updateGuichetHeader(g);
            console.log('✅ updateGuichetHeader() complété');
        } catch (e) {
            console.error('❌ ERREUR updateGuichetHeader():', e.message, e);
            throw e;
        }
        
        console.log('📊 Avant updateGuichetStats()');
        try {
            updateGuichetStats(g);
            console.log('✅ updateGuichetStats() complété');
        } catch (e) {
            console.error('❌ ERREUR updateGuichetStats():', e.message, e);
            throw e;
        }
        
        console.log('📊 Avant updateProduitsVendus()');
        try {
            updateProduitsVendus(g);
            console.log('✅ updateProduitsVendus() complété');
        } catch (e) {
            console.error('❌ ERREUR updateProduitsVendus():', e.message, e);
            throw e;
        }
        
        console.log('📊 Avant updateTransactionsRecentes()');
        try {
            updateTransactionsRecentes(g);
            console.log('✅ updateTransactionsRecentes() complété');
        } catch (e) {
            console.error('❌ ERREUR updateTransactionsRecentes():', e.message, e);
            throw e;
        }
        
        console.log('📊 Avant initGuichetChart()');
        try {
            initGuichetChart();
            console.log('✅ initGuichetChart() complété');
        } catch (e) {
            console.error('❌ ERREUR initGuichetChart():', e.message, e);
            throw e;
        }
        
        console.log('🎨 Masquage placeholder, affichage contenu');
        // Afficher le contenu et masquer le placeholder
        setTimeout(() => {
            document.getElementById('guichetSpinner').style.setProperty('display', 'none', 'important');
            document.getElementById('guichetPlaceholder').style.setProperty('display', 'none', 'important');
            document.getElementById('guichetContent').style.setProperty('display', 'block', 'important');
            // Fade in animation via jQuery
            $('#guichetContent').fadeIn(400);
            console.log('✅ DOM updated - placeholder hidden, content shown');
        }, 400);
        
        showToast(`✅ ${g.nomGuichet || g.nom} chargé`, 'success', 2000);
        
    } catch (err) {
        console.error('❌', err);
        document.getElementById('guichetSpinner').style.setProperty('display', 'none', 'important');
        document.getElementById('guichetContent').style.setProperty('display', 'none', 'important');
        document.getElementById('guichetPlaceholder').style.setProperty('display', 'flex', 'important');
        $('#guichetPlaceholder').html(`
            <div class="text-center p-5">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h5 class="text-danger">Erreur chargement</h5>
                <p class="text-muted">${err.message}</p>
            </div>
        `);
        showToast('❌ ' + err.message, 'danger');
    }
}

// ✅ UPDATE FONCTIONS (Remplissage du template existant)

function updateGuichetHeader(g) {
    // Gérer les différents formats de noms (avec ou sans underscore)
    const nomGuichet = g.nomGuichet || g.nom_guichet || g.nom || 'Guichet';
    const codeGuichet = g.codeGuichet || g.code || '';
    
    $('#guichetNom').text(nomGuichet);
    if (codeGuichet) {
        $('#guichetCode').text(`#${codeGuichet}`).show();
    }
    
    // Status badge
    const statusColor = g.status === 1 ? 'bg-success' : 'bg-danger';
    const statusText = g.status === 1 ? 'Actif' : 'Inactif';
    $('#guichetStatus').removeClass('bg-success bg-danger').addClass(statusColor).text(statusText);
    
    // Vendeur info
    const vendeur = g.vendeurPrincipal || g.caissierActuel;
    const vendeurName = vendeur?.prenom && vendeur?.nom ? `${vendeur.prenom} ${vendeur.nom}` : vendeur?.email || '-';
    $('#guichetSubtitle').html(`Vendeur: <strong>${vendeurName}</strong>`);
}

function updateGuichetStats(g) {
    // Stats principales
    $('#guichetCaJour').text((g.caJour || 0).toLocaleString() + ' CDF');
    $('#guichetNbProduits').text(g.produitVendus?.length || 0);
    $('#guichetNbTransactions').text(g.nbVentesJour || 0);
    
    // Marge moyenne
    const produits = g.produitVendus || [];
    let margeMoyenne = 0;
    if(produits.length > 0) {
        const totalMarge = produits.reduce((acc, p) => acc + (p.marge || 0), 0);
        margeMoyenne = Math.round(totalMarge / produits.length);
    }
    $('#guichetMargeMoyenne').text(margeMoyenne + '%');
}

// ✨ Afficher les produits vendus avec table design amélioré
function updateProduitsVendus(g) {
    const produits = g.produitVendus || [];
    
    if (produits.length === 0) {
        $('#guichetProduitsVendusTable').html(`
            <tr><td colspan="6" class="text-center text-muted py-5">
                <i class="fas fa-inbox fa-2x mb-2 d-block" style="opacity:0.3;"></i>
                Aucun produit vendu
            </td></tr>
        `);
        $('#guichetNbProduitsUnique').text('0');
        $('#guichetTotalVentes').text('0 CDF');
        $('#guichetMoyenneMarge').text('0%');
        return;
    }
    
    let totalVentes = 0;
    let totalMarge = 0;
    
    const html = produits.map(p => {
        totalVentes += (p.totalVente || 0);
        totalMarge += (p.marge || 0);
        
        const margeCouleur = (p.marge || 0) >= 20 ? 'text-success' : 
                           (p.marge || 0) >= 15 ? 'text-info' : 'text-warning';
        const margeIcon = (p.marge || 0) >= 20 ? '✓' : 
                         (p.marge || 0) >= 15 ? '–' : '!';
        
        return `
            <tr class="align-middle" style="transition: all 0.2s ease;">
                <td>
                    <div class="fw-semibold" style="color:#2c3e50;">${p.nom || '–'}</div>
                </td>
                <td class="text-center">
                    <span class="badge bg-primary-subtle text-primary" style="border-radius: 20px; padding: 5px 10px;">
                        ${p.categorie || 'N/A'}
                    </span>
                </td>
                <td class="text-end">
                    <span class="badge bg-success" style="padding: 6px 10px; font-size: 0.95rem;">
                        <i class="fas fa-box me-1"></i>${p.quantiteVendue || 0}
                    </span>
                </td>
                <td class="text-end text-muted">
                    <span style="font-weight: 500;">${(p.prixUnitaire || 0).toLocaleString()}</span> CDF
                </td>
                <td class="text-end fw-bold text-success">
                    <span style="font-size: 1.05rem;">
                        ${(p.totalVente || 0).toLocaleString()}
                    </span> CDF
                </td>
                <td class="text-center">
                    <span class="badge ${margeCouleur}" style="padding: 6px 8px; font-size: 0.9rem;">
                        ${margeIcon} ${p.marge || 0}%
                    </span>
                </td>
            </tr>
        `;
    }).join('');
    
    $('#guichetProduitsVendusTable').html(html);
    $('#guichetNbProduitsUnique').text(produits.length);
    $('#guichetTotalVentes').text(totalVentes.toLocaleString() + ' CDF');
    
    const margeMoyenne = Math.round(totalMarge / produits.length);
    $('#guichetMoyenneMarge').text(margeMoyenne + '%');
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
        let guichets = await response.json();
        
        // ✅ NORMALISER tous les guichets (convertir underscore → camelCase)
        guichets = guichets.map(g => ({
            ...g,
            nomGuichet: g.nomGuichet || g.nom_guichet || g.nom || 'Guichet',
            codeGuichet: g.codeGuichet || g.code || ''
        }));
        
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
        const response = await fetch(`${API_BASE}/api/protected/guichets`, {
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
        const response = await fetch(`${API_BASE}/api/protected/guichets/${guichetId}`, {
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
        const response = await fetch(`${API_BASE}/api/protected/guichets/${guichetId}`, {
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
        const response = await fetch(`${API_BASE}/api/protected/guichets/${guichetId}/affecter-vendeur`, {
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
        const response = await fetch(`${API_BASE}/api/protected/affectations/list?${query}`, {
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
        const response = await fetch(`${API_BASE}/api/protected/activites?${query}`, {
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
            const response = await fetch(`${API_BASE}/api/protected/members`, {
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
        const response = await fetch(`${API_BASE}/api/protected/utilisateurs`, {
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

// ✅ ACTIONS RAPIDES MODAL GUICHET
$(document).on('click', '#btnExportGuichet', function() {
    const nomGuichet = $('#guichetNom').text();
    const caJour = $('#guichetCaJour').text();
    const nbProduits = $('#guichetNbProduits').text();
    
    const csv = `Guichet,CA Jour,Produits Vendus\n${nomGuichet},${caJour},${nbProduits}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nomGuichet}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('✅ Données exportées', 'success');
});

$(document).on('click', '#btnImprimerGuichet', function() {
    window.print();
    showToast('📄 Impression lancée', 'info');
});

$(document).on('click', '#btnTransfertGuichet', function() {
    showToast('⏳ Transfert inter-guichets - À implémenter', 'info');
    // TODO: Ouvrir modal transfert produits
});


$(document).on('click', '#btnCloturerCaissier', function() {
    const nomGuichet = $('#guichetNom').text();
    if(confirm(`Clôturer le caissier "${nomGuichet}" ?`)) {
        showToast('🔒 Clôture en cours...', 'warning');
        // TODO: API call pour clôture
    }
});

// ✅ Fonction pour ouvrir modal édition depuis liste de guichets
function openGuichetEditModal(guichetId) {
    console.log('🖊️ Ouverture modal d\'édition pour:', guichetId);
    if (typeof window.editGuichetModal === 'function') {
        window.editGuichetModal(guichetId);
    } else {
        console.error('❌ editGuichetModal function not found');
        showToast('❌ Fonction d\'édition non disponible', 'danger');
    }
}

// ✅ BOUTON MODIFIER GUICHET - Dans le modal de détails
$(document).on('click', '#editGuichetModal', function() {
    if (CURRENT_GUICHET_ID) {
        console.log('🖊️ Ouverture modal d\'édition pour:', CURRENT_GUICHET_ID);
        editGuichetModal(CURRENT_GUICHET_ID);
    } else {
        showToast('❌ Erreur: ID guichet manquant', 'danger');
    }
});

/**
 * ========================================
 * PANEL 1 TOGGLE - SIMPLE COLLAPSE
 * ========================================
 * Toggle Panel 1 between full list and photo avatars only
 * Panels 2 & 3 stay at their col size
 */

// Populate photo grid when magasins are loaded - now using renderMagasinAvatars
function populatePhotoGrid() {
    // Simply use the cached magasins
    if (Object.keys(MAGASINS_CACHE).length > 0) {
        const magasins = Object.values(MAGASINS_CACHE);
        renderMagasinAvatars(magasins);
        console.log('✅ Photo grid populated with', magasins.length, 'avatars');
    } else {
        console.log('⚠️  No magasins in cache for photo grid');
    }
}

// Select magasin from photo
function selectMagasinFromPhoto(magasinId) {
    selectMagasin(magasinId);
    
    // Show back button
    document.getElementById('backButtonContainer')?.classList.add('show');
    
    // Update photo grid active state
    document.querySelectorAll('#magasinsPhotosGrid .magasin-photo-item').forEach(photo => {
        photo.classList.remove('active');
        if (photo.getAttribute('data-magasin-id') === String(magasinId)) {
            photo.classList.add('active');
        }
    });
}

// Override selectMagasin to show back button and update photo state
const originalSelectMagasin = window.selectMagasin;
window.selectMagasin = function(magasinId) {
    originalSelectMagasin(magasinId);
    
    // Show back button
    document.getElementById('backButtonContainer')?.classList.add('show');
    
    // Update photo active state
    document.querySelectorAll('#magasinsPhotosGrid .magasin-photo-item').forEach(photo => {
        photo.classList.remove('active');
        if (photo.getAttribute('data-magasin-id') === String(magasinId)) {
            photo.classList.add('active');
        }
    });
};

// Populate photo grid when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize button state
    updateAddGuichetButtonState(); // 🔴 Initialise: boutons désactivés au démarrage
    
    setTimeout(() => {
        populatePhotoGrid();
    }, 500);
});

// Re-populate when magasins render
const originalRenderMagasins = window.renderMagasins;
if (originalRenderMagasins) {
    window.renderMagasins = function(...args) {
        originalRenderMagasins.apply(window, args);
        // Populate photo grid after rendering - wait for DOM to update
        setTimeout(populatePhotoGrid, 500);
    };
}