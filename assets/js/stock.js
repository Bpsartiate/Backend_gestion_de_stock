/**
 * 📦 STOCK MANAGEMENT SYSTEM - FRONTEND JS
 * Version: 2.0 Complète
 * Utilise les APIs: Produits, StockMovements, Lots, Alertes, Inventaires
 */

// ================================
// ⚙️ CONFIGURATION GLOBALE
// ================================

// Vérifier si API_CONFIG existe déjà (depuis api-config.js)
// Si non, la créer avec les endpoints locaux
if (typeof API_CONFIG === 'undefined') {
  window.API_CONFIG = {
    BASE_URL: 'https://backend-gestion-de-stock.onrender.com',
    
    ENDPOINTS: {
      // MAGASINS
      MAGASINS: '/api/protected/magasins',
      MAGASIN: '/api/protected/magasins/:magasinId',
      STOCK_CONFIG: '/api/protected/magasins/:magasinId/stock-config',
      
      // PRODUITS
      PRODUITS: '/api/protected/magasins/:magasinId/produits',
      PRODUIT: '/api/protected/produits/:produitId',
      PRODUIT_MOUVEMENTS: '/api/protected/produits/:produitId/mouvements',
      
      // MOUVEMENTS
      STOCK_MOVEMENTS: '/api/protected/magasins/:magasinId/stock-movements',
      
      // LOTS (FIFO)
      LOTS: '/api/protected/magasins/:magasinId/lots',
      
      // ALERTES
      ALERTES: '/api/protected/magasins/:magasinId/alertes',
      ALERTE: '/api/protected/alertes/:alerteId',
      
      // RAPPORTS INVENTAIRE
      INVENTAIRES: '/api/protected/magasins/:magasinId/inventaires',
      INVENTAIRE: '/api/protected/inventaires/:rapportId',
      INVENTAIRE_LIGNES: '/api/protected/inventaires/:rapportId/lignes',
      INVENTAIRE_VALIDER: '/api/protected/inventaires/:rapportId/valider'
    }
  };
}

// ================================
// 🔐 AUTHENTIFICATION
// ================================

function getAuthHeaders() {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// ================================
// 🌐 UTILITAIRES API
// ================================

async function apiCall(method, endpoint, data = null, params = {}) {
  try {
    // Remplacer les paramètres dans l'endpoint
    let url = endpoint;
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });

    const fullUrl = `${API_CONFIG.BASE_URL || API_CONFIG.BASE}${url}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    };

    if (data && ['POST', 'PUT'].includes(method)) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(fullUrl, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Erreur ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error(`❌ API Error [${method} ${endpoint}]:`, err);
    throw err;
  }
}

// Raccourcis API - Vérifier si API existe déjà (pour éviter les duplicatas)
if (typeof API === 'undefined') {
  var API = {
    get: (endpoint, params) => apiCall('GET', endpoint, null, params),
    post: (endpoint, data, params) => apiCall('POST', endpoint, data, params),
    put: (endpoint, data, params) => apiCall('PUT', endpoint, data, params),
    delete: (endpoint, params) => apiCall('DELETE', endpoint, null, params)
  };
}

// ================================
// 🏪 GESTION DES MAGASINS
// ================================

let MAGASIN_ID = null;
let MAGASIN_NOM = null;
let CURRENT_STOCK_CONFIG = null;
let CURRENT_USER = null;

// ⚡ CACHE MAGASINS
let CACHE_MAGASINS = null;
let CACHE_MAGASINS_TIMESTAMP = 0;
const CACHE_MAGASINS_DURATION = 120000; // 2 minutes

function getMagasinsCached() {
  const now = Date.now();
  if (CACHE_MAGASINS && (now - CACHE_MAGASINS_TIMESTAMP) < CACHE_MAGASINS_DURATION) {
    console.log('🏪 Cache magasins utilisé');
    return CACHE_MAGASINS;
  }
  return null;
}

function setMagasinsCached(magasins) {
  CACHE_MAGASINS = magasins;
  CACHE_MAGASINS_TIMESTAMP = Date.now();
}

async function loadMagasinsModal(forceRefresh = false) {
  const spinner = document.getElementById('magasinsSpinner');
  const list = document.getElementById('magasinsList');
  const error = document.getElementById('magasinsError');

  try {
    spinner.style.display = 'block';
    list.style.display = 'none';
    error.style.display = 'none';

    // ⚡ Utiliser le cache si disponible et pas de force refresh
    let magasins = forceRefresh ? null : getMagasinsCached();
    
    if (!magasins) {
      // ⚡ Charger avec timeout de 10 secondes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      try {
        magasins = await API.get(API_CONFIG.ENDPOINTS.MAGASINS);
        clearTimeout(timeoutId);
        setMagasinsCached(magasins);
        console.log('📥 Magasins chargés depuis l\'API');
      } catch (timeoutErr) {
        clearTimeout(timeoutId);
        throw timeoutErr;
      }
    }

    list.innerHTML = '';
    
    // ⚡ Gérer le cas où il n'y a pas de magasins
    if (!magasins || magasins.length === 0) {
      list.innerHTML = `
        <div class="alert alert-warning mb-0" role="alert">
          <i class="fas fa-inbox me-2"></i>
          <strong>Aucun magasin disponible</strong><br>
          <small>Veuillez créer un magasin dans la configuration.</small>
        </div>
      `;
      spinner.style.display = 'none';
      list.style.display = 'block';
      return;
    }

    // ⚡ Utiliser documentFragment pour performance
    const fragment = document.createDocumentFragment();
    
    magasins.forEach(magasin => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'w-100 list-group-item list-group-item-action p-3 mb-2 rounded-2 text-start transition';
      
      const isActive = MAGASIN_ID === magasin._id;
      if (isActive) {
        button.classList.add('active', 'bg-primary', 'text-white');
      }
      
      button.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
          <div class="flex-grow-1">
            <h6 class="mb-1 fw-bold">
              <i class="fas fa-warehouse me-2"></i>${magasin.nom_magasin}
            </h6>
            ${magasin.adresse ? `<small class="d-block ${isActive ? 'text-white-50' : 'text-muted'}"><i class="fas fa-map-marker-alt me-1"></i>${magasin.adresse}</small>` : ''}
            ${magasin.telephone_magasin ? `<small class="d-block ${isActive ? 'text-white-50' : 'text-muted'}"><i class="fas fa-phone me-1"></i>${magasin.telephone_magasin}</small>` : ''}
          </div>
          ${isActive ? `<span class="badge bg-success ms-2"><i class="fas fa-check me-1"></i>Actif</span>` : '<span class="badge bg-light text-dark ms-2">Cliquez</span>'}
        </div>
      `;

      button.addEventListener('click', () => selectMagasin(magasin._id, magasin.nom_magasin));
      fragment.appendChild(button);
    });

    list.appendChild(fragment);
    spinner.style.display = 'none';
    list.style.display = 'block';

  } catch (err) {
    spinner.style.display = 'none';
    error.style.display = 'block';
    
    // ⚡ Messages d'erreur plus informatifs
    let errorMessage = '❌ Erreur: ';
    
    if (err.name === 'AbortError') {
      errorMessage = '⏱️ <strong>Timeout</strong>: Le serveur met trop de temps à répondre';
    } else if (err.message.includes('Failed to fetch')) {
      errorMessage = '🌐 <strong>Erreur réseau</strong>: Vérifiez votre connexion internet';
    } else {
      errorMessage += err.message;
    }
    
    error.innerHTML = `
      <div class="alert alert-danger mb-0" role="alert">
        <div>${errorMessage}</div>
        <small class="d-block mt-2">
          <button type="button" class="btn btn-sm btn-outline-danger mt-2" onclick="loadMagasinsModal(true)">
            <i class="fas fa-redo me-1"></i>Réessayer
          </button>
        </small>
      </div>
    `;
  }
}

async function selectMagasin(magasinId, magasinNom) {
  MAGASIN_ID = magasinId;
  MAGASIN_NOM = magasinNom;
  
  sessionStorage.setItem('currentMagasinId', magasinId);
  sessionStorage.setItem('currentMagasinNom', magasinNom);
  
  document.getElementById('magasinActuelText').textContent = magasinNom;
  
  const modal = bootstrap.Modal.getInstance(document.getElementById('modalSelectMagasin'));
  modal.hide();

  // ⚡ Réinitialiser les spinners KPI
  initKPISpinners();
  
  // ⚡ Charger la config du nouveau magasin
  await loadStockConfig();
  
  // ⚡ Charger les produits et alertes EN PARALLÈLE
  const [produits, alertes] = await Promise.all([
    (async () => {
      const p = await API.get(
        API_CONFIG.ENDPOINTS.PRODUITS,
        { magasinId: MAGASIN_ID }
      );
      setProduitsCached(p);
      afficherTableProduits(p);
      return p;
    })(),
    API.get(
      API_CONFIG.ENDPOINTS.ALERTES,
      { magasinId: MAGASIN_ID }
    )
  ]);

  // ⚡ Mettre à jour les alertes
  const alerteCount = alertes.filter(a => a.statut === 'ACTIVE').length;
  const elemAlertes = document.getElementById('alertesStock');
  if (elemAlertes) {
    elemAlertes.classList.remove('loading');
    elemAlertes.innerHTML = alerteCount;
  }
  
  // ⚡ Mettre à jour les KPIs avec les produits déjà chargés
  await updateDashboardKPIs(produits);

  showToast(` Magasin "${magasinNom}" chargé!`, 'success');
  console.log(' Magasin sélectionné et données rechargées:', magasinNom);
}

// ================================
// 📦 CONFIGURATION RAYONS & TYPES
// ================================

async function loadStockConfig() {
  try {
    if (!MAGASIN_ID) {
      console.warn('⚠️ Aucun magasin sélectionné');
      return;
    }

    console.log('📦 Chargement config stock...');
    
    CURRENT_STOCK_CONFIG = await API.get(
      API_CONFIG.ENDPOINTS.STOCK_CONFIG,
      { magasinId: MAGASIN_ID }
    );

    populateRayons();
    populateTypesProduits();
    loadCategories();  // ← Charger les catégories

    console.log(' Configuration chargée:', CURRENT_STOCK_CONFIG);
  } catch (err) {
    console.error('❌ Erreur config stock:', err);
    showToast('Erreur: ' + err.message, 'danger');
  }
}

function populateRayons() {
  const rayonSelect = document.getElementById('rayonId');
  if (!rayonSelect || !CURRENT_STOCK_CONFIG?.rayons) return;

  rayonSelect.innerHTML = '<option value="">Sélectionner un rayon...</option>';

  CURRENT_STOCK_CONFIG.rayons.forEach(rayon => {
    if (rayon.status === 1 || rayon.status === true) {
      const option = document.createElement('option');
      option.value = rayon._id;
      option.textContent = `${rayon.nomRayon} (${rayon.codeRayon})`;
      option.dataset.typeRayon = rayon.typeRayon;
      option.dataset.typesAutorises = JSON.stringify(rayon.typesProduitsAutorises || []);
      rayonSelect.appendChild(option);
    }
  });
}

function populateTypesProduits() {
  const typeProduitSelect = document.getElementById('typeProduit');
  if (!typeProduitSelect || !CURRENT_STOCK_CONFIG?.typesProduits) return;

  typeProduitSelect.innerHTML = '<option value="">Sélectionner un type...</option>';

  CURRENT_STOCK_CONFIG.typesProduits.forEach(type => {
    if (type.status === 1 || type.status === true) {
      const option = document.createElement('option');
      option.value = type._id;
      option.textContent = type.nomType;
      option.dataset.unite = type.unitePrincipale;
      option.dataset.champs = JSON.stringify(type.champsSupplementaires || []);
      option.dataset.photoRequise = type.photoRequise ? 'true' : 'false';
      typeProduitSelect.appendChild(option);
    }
  });
}

// ================================
// 🏷️ GESTION DES CATÉGORIES
// ================================

let CATEGORIES_LIST = [];
let SELECTED_CATEGORIE = null;

async function loadCategories() {
  try {
    if (!MAGASIN_ID) return;

    // Récupérer les catégories depuis le backend
    // (À adapter si vous avez un endpoint spécifique)
    const categories = CURRENT_STOCK_CONFIG?.categories || [];
    CATEGORIES_LIST = categories;

    renderCategoriesDropdown();
    attachCategorieHandlers();

  } catch (err) {
    console.error('❌ Erreur chargement catégories:', err);
  }
}

function renderCategoriesDropdown() {
  const list = document.getElementById('categorieList');
  if (!list) return;

  list.innerHTML = '';

  if (CATEGORIES_LIST.length === 0) {
    list.innerHTML = `
      <div class="text-muted text-center py-3">
        <i class="fas fa-inbox fa-2x mb-2 d-block"></i>
        <small>Aucune catégorie</small>
      </div>
    `;
    return;
  }

  CATEGORIES_LIST.forEach(cat => {
    const item = document.createElement('a');
    item.href = '#';
    item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center categorie-item';
    item.dataset.categorieId = cat._id;
    item.dataset.categorieName = cat.nom;
    item.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="fas fa-tag text-primary me-2"></i>
        <span>${cat.nom}</span>
      </div>
      <small class="text-muted">${cat.description ? cat.description.substring(0, 30) + '...' : ''}</small>
    `;
    
    item.addEventListener('click', (e) => {
      e.preventDefault();
      selectCategorie(cat._id, cat.nom);
    });

    list.appendChild(item);
  });
}

function selectCategorie(categorieId, categorieName) {
  SELECTED_CATEGORIE = { id: categorieId, nom: categorieName };
  
  // Mettre à jour l'input caché
  document.getElementById('categorieId').value = categorieId;
  
  // Fermer le dropdown
  document.getElementById('categorieDropdown').style.display = 'none';
  document.getElementById('categorieSearch').value = '';

  // Afficher le badge de la catégorie sélectionnée
  updateSelectedCategoriesBadges();
  
  // ===== AFFICHER LE MODE FIFO/LIFO DE LA CATÉGORIE =====
  updateFIFOLIFOInfo(categorieId);
  
  console.log(' Catégorie sélectionnée:', categorieName);
}

// ===== AFFICHER LE MODE FIFO/LIFO DE LA CATÉGORIE =====
function updateFIFOLIFOInfo(categorieId) {
  const infoBox = document.getElementById('infoModeGestion');
  const modeText = document.getElementById('modeGestionText');
  
  if (!infoBox || !modeText) return;

  // Trouver la catégorie dans la liste
  const categorie = CATEGORIES_LIST.find(c => c._id === categorieId);
  
  if (!categorie) {
    modeText.textContent = 'Catégorie non trouvée';
    return;
  }

  // Récupérer le mode FIFO/LIFO de la catégorie
  const mode = categorie.typeModeGestion || 'STANDARD';
  const dureeVie = categorie.dureeVieMax || 0;
  
  // Explications détaillées
  const modeExplanations = {
    'FIFO': {
      icon: '📥',
      text: 'FIFO (Premier Entré = Premier Sorti)',
      detail: 'Les articles les plus anciens seront prélevés en priorité. Idéal pour les produits périssables.'
    },
    'LIFO': {
      icon: '📤',
      text: 'LIFO (Dernier Entré = Premier Sorti)',
      detail: 'Les articles les plus récents seront prélevés en priorité. Utile pour les produits empilés.'
    },
    'STANDARD': {
      icon: '⚖️',
      text: 'Standard (Pas de règle)',
      detail: 'Gestion libre sans contrainte de rotation des stocks.'
    }
  };

  const explanation = modeExplanations[mode] || modeExplanations['STANDARD'];
  
  let html = `
    <small>
      <i class="fas fa-exchange-alt me-2"></i>
      <strong>${explanation.icon} ${explanation.text}</strong><br>
      ${explanation.detail}
  `;

  if (dureeVie && dureeVie > 0) {
    html += `<br><i class="fas fa-calendar-times me-1 text-danger"></i><strong>Durée de vie max:</strong> ${dureeVie} jours`;
  }

  html += '</small>';

  modeText.innerHTML = html;
  console.log(` Mode ${mode} activé pour catégorie:`, categorie.nom);
}

function updateSelectedCategoriesBadges() {
  const badgesContainer = document.getElementById('selectedCategoriesList');
  if (!badgesContainer) return;

  badgesContainer.innerHTML = '';

  if (SELECTED_CATEGORIE) {
    const badge = document.createElement('span');
    badge.className = 'badge bg-primary bg-gradient d-flex align-items-center gap-2 px-3 py-2';
    badge.style.animation = 'slideIn 0.3s ease-out';
    badge.innerHTML = `
      <i class="fas fa-tag"></i>
      ${SELECTED_CATEGORIE.nom}
      <button type="button" class="btn-close btn-close-white btn-sm ms-1" style="height: 1rem; width: 1rem;" aria-label="Remove"></button>
    `;

    badge.querySelector('.btn-close').addEventListener('click', () => {
      SELECTED_CATEGORIE = null;
      document.getElementById('categorieId').value = '';
      updateSelectedCategoriesBadges();
    });

    badgesContainer.appendChild(badge);
  }
}

function attachCategorieHandlers() {
  const searchInput = document.getElementById('categorieSearch');
  const dropdown = document.getElementById('categorieDropdown');
  const btnNew = document.getElementById('btnNewCategorie');

  if (!searchInput || !dropdown) return;

  // Afficher/masquer le dropdown avec animation
  searchInput.addEventListener('focus', () => {
    dropdown.style.display = 'block';
    dropdown.style.animation = 'slideDown 0.2s ease-out';
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.position-relative')) {
      dropdown.style.display = 'none';
    }
  });

  // Recherche fluide
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.categorie-item');

    items.forEach(item => {
      const name = item.dataset.categorieName.toLowerCase();
      item.style.display = name.includes(query) ? '' : 'none';
    });

    dropdown.style.display = 'block';
  });

  // Créer nouvelle catégorie
  if (btnNew) {
    btnNew.addEventListener('click', async () => {
      const searchVal = searchInput.value.trim();
      if (!searchVal) {
        showToast('Entrez le nom de la catégorie', 'warning');
        return;
      }

      try {
        // Appel API pour créer la catégorie (à adapter)
        const newCategorie = {
          nom: searchVal,
          description: '',
          status: true
        };

        // Simulé pour l'instant (ajouter endpoint réel)
        // const result = await API.post(API_CONFIG.ENDPOINTS.CATEGORIES, newCategorie, { magasinId: MAGASIN_ID });
        
        CATEGORIES_LIST.push({ _id: Date.now(), ...newCategorie });
        renderCategoriesDropdown();
        searchInput.value = '';
        
        showToast(` Catégorie "${searchVal}" créée!`, 'success');
      } catch (err) {
        showToast('❌ Erreur: ' + err.message, 'danger');
      }
    });
  }
}

// ================================
// 🎨 ANIMATIONS CSS & SPINNERS
// ================================

const style = document.createElement('style');
style.innerHTML = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .categorie-item {
    transition: all 0.2s ease;
    padding: 0.75rem 1rem !important;
  }

  .categorie-item:hover {
    background-color: #f0f6ff !important;
    transform: translateX(4px);
  }

  #categorieDropdown {
    transition: opacity 0.2s ease;
  }

  .badge.bg-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    font-weight: 500;
  }

  /* KPI Spinner */
  .kpi-spinner {
    display: inline-block;
    width: 24px;
    height: 24px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .kpi-value {
    transition: opacity 0.3s ease;
  }

  .kpi-value.loading {
    opacity: 0.5;
    pointer-events: none;
  }

  /* Table Loading */
  .table-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    border-radius: 8px;
    margin: 20px 0;
  }

  .table-spinner {
    display: inline-block;
    width: 50px;
    height: 50px;
    border: 4px solid rgba(102, 126, 234, 0.2);
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
  }

  .table-loading-text {
    color: #667eea;
    font-weight: 500;
    font-size: 16px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .table-loading-sub {
    color: #999;
    font-size: 13px;
    margin-top: 8px;
  }
`;
document.head.appendChild(style);

// Mettre à jour champs dynamiques au changement du type
document.addEventListener('change', function(e) {
  if (e.target.id === 'typeProduit') {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const unite = selectedOption.dataset.unite;
    const champsData = selectedOption.dataset.champs ? JSON.parse(selectedOption.dataset.champs) : [];

    // Mettre à jour l'unité
    const unitLabel = document.querySelector('label[for="quantite"]');
    if (unitLabel) {
      unitLabel.textContent = `Quantité (${unite || 'unités'})`;
    }

    // Remplir les champs dynamiques
    const container = document.getElementById('champsDynamiques');
    if (container) {
      container.innerHTML = '';
      champsData.forEach(champ => {
        const group = document.createElement('div');
        group.className = 'mb-3';

        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = champ.nomChamp + (champ.obligatoire ? '*' : '');

        let input;
        if (champ.typeChamp === 'text') {
          input = document.createElement('input');
          input.type = 'text';
          input.className = 'form-control';
          input.name = champ.nomChamp;
        } else if (champ.typeChamp === 'select') {
          input = document.createElement('select');
          input.className = 'form-select';
          input.name = champ.nomChamp;
          
          const placeholder = document.createElement('option');
          placeholder.value = '';
          input.appendChild(placeholder);
          
          (champ.optionsChamp || []).forEach(opt => {
            const optEl = document.createElement('option');
            optEl.value = opt;
            optEl.textContent = opt;
            input.appendChild(optEl);
          });
        } else if (champ.typeChamp === 'number') {
          input = document.createElement('input');
          input.type = 'number';
          input.className = 'form-control';
          input.name = champ.nomChamp;
          input.step = '0.01';
        } else if (champ.typeChamp === 'date') {
          input = document.createElement('input');
          input.type = 'date';
          input.className = 'form-control';
          input.name = champ.nomChamp;
        }

        if (champ.obligatoire) input.required = true;

        group.appendChild(label);
        group.appendChild(input);
        container.appendChild(group);
      });
    }
  }
});

// ================================
// 💾 CACHE DONNÉES
// ================================

let CACHE_PRODUITS = null;
let CACHE_TIMESTAMP = 0;
const CACHE_DURATION = 30000; // 30 secondes

function getProduitsCached() {
  const now = Date.now();
  if (CACHE_PRODUITS && (now - CACHE_TIMESTAMP) < CACHE_DURATION) {
    console.log('📦 Cache produits utilisé');
    return CACHE_PRODUITS;  //  Retourner la data directement, pas une Promise!
  }
  return null;
}

function setProduitsCached(produits) {
  CACHE_PRODUITS = produits;
  CACHE_TIMESTAMP = Date.now();
}

// ================================
// 📊 INITIALISER LES SPINNERS KPI
// ================================

function initKPISpinners() {
  const kpiElements = ['totalStock', 'rayonsActifs', 'alertesStock', 'rayonsPleins'];
  
  kpiElements.forEach(id => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.classList.add('loading');
      elem.innerHTML = '<div class="kpi-spinner"></div>';
    }
  });
}

// ================================
// ➕ AJOUTER PRODUIT
// ================================
async function addProduct() {
  try {
    if (!MAGASIN_ID) {
      showToast('Veuillez sélectionner un magasin', 'warning');
      return;
    }

    const form = document.getElementById('formAddProduit');
    if (!form) {
      showToast('Formulaire non trouvé', 'danger');
      return;
    }

    // Vérifier la validité
    if (!form.checkValidity()) {
      // Marquer le formulaire comme "was-validated" pour afficher les erreurs
      form.classList.add('was-validated');
      showToast('Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }

    // Récupérer les données du formulaire
    const formData = new FormData(form);
    const produitData = {
      reference: formData.get('reference'),
      designation: formData.get('designation'),
      typeProduitId: formData.get('typeProduit'),
      rayonId: formData.get('rayonId'),
      prixUnitaire: parseFloat(formData.get('prixUnitaire')) || 0,
      quantiteEntree: parseInt(formData.get('quantite')) || 0,
      quantiteActuelle: parseInt(formData.get('quantite')) || 0,
      seuilAlerte: parseInt(formData.get('seuilAlerte')) || 10,
      etat: formData.get('etat') || 'nouveau',
      champsDynamiques: {}
    };

    // Récupérer les champs dynamiques
    const dinamicoInputs = document.querySelectorAll('#champsDynamiques input, #champsDynamiques select');
    dinamicoInputs.forEach(input => {
      produitData.champsDynamiques[input.name] = input.value;
    });

    // Créer le produit
    const product = await API.post(
      API_CONFIG.ENDPOINTS.PRODUITS,
      produitData,
      { magasinId: MAGASIN_ID }
    );

    // Si c'est une réception (quantité > 0), créer automatiquement:
    // 1. Un lot FIFO
    // 2. Un mouvement RECEPTION

    if (produitData.quantiteEntree > 0) {
      // Créer un lot
      const lotData = {
        produitId: product._id,
        numeroBatch: `LOT-${new Date().getFullYear()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
        quantiteEntree: produitData.quantiteEntree,
        quantiteDisponible: produitData.quantiteEntree,
        prixUnitaireAchat: produitData.prixUnitaire,
        dateEntree: new Date().toISOString(),
        dateExpiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        numeroDocument: formData.get('numeroDocument') || '',
        fournisseur: formData.get('fournisseur') || ''
      };

      const lot = await API.post(
        API_CONFIG.ENDPOINTS.LOTS,
        lotData,
        { magasinId: MAGASIN_ID }
      );

      // ⚠️ NOTE: Le mouvement RECEPTION est créé automatiquement par le backend
      // lors de la création du produit, donc on n'a pas besoin de le créer ici
    }

    showToast(' Produit créé avec succès!', 'success');
    form.reset();
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalProduit'));
    modal.hide();

    // Recharger la liste des produits
    await loadProduits();
    
    // ⚡ IMPORTANT: Recharger aussi les rayons si le modal est ouvert
    // Cela met à jour l'occupation et le nombre d'articles du rayon
    if (typeof loadRayonsModal === 'function') {
      loadRayonsModal();
    }

  } catch (err) {
    showToast('❌ Erreur: ' + err.message, 'danger');
  }
}

// ================================
// 📦 LISTER PRODUITS
// ================================

async function loadProduits(showLoader = true) {
  try {
    if (!MAGASIN_ID) return;

    // Montrer le loader
    if (showLoader) {
      const tbody = document.querySelector('#tableReceptions tbody');
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7">
              <div class="table-loading">
                <div class="table-spinner"></div>
                <div class="table-loading-text">Chargement des produits...</div>
                <div class="table-loading-sub">Veuillez patienter</div>
              </div>
            </td>
          </tr>
        `;
      }
    }

    const produits = await API.get(
      API_CONFIG.ENDPOINTS.PRODUITS,
      { magasinId: MAGASIN_ID }
    );

    console.log('📦 Produits chargés:', produits);
    setProduitsCached(produits);
    afficherTableProduits(produits);
    
    // 🔄 IMPORTANT: Mettre à jour aussi les KPIs!
    await updateDashboardKPIs(produits);

  } catch (err) {
    console.error('❌ Erreur chargement produits:', err);
    showToast('❌ Erreur chargement produits: ' + err.message, 'danger');
  }
}

// Instance List.js globale pour éviter de la recréer
let LIST_INSTANCE = null;

function afficherTableProduits(produits) {
  // ⚠️ CORRECTION: Cibler le VRAI tbody de la page principale (id="produitsList")
  const tbody = document.getElementById('produitsList');
  if (!tbody) {
    console.error('❌ tbody non trouvé');
    console.log('🔍 Éléments trouvés:');
    console.log('  - #tableReceptions:', document.getElementById('tableReceptions'));
    console.log('  - #tableReceptions tbody:', document.querySelector('#tableReceptions tbody'));
    console.log('  - #produitsList:', document.getElementById('produitsList'));
    return;
  }

  console.log(' tbody trouvé:', tbody);

  // 🔧 SÉCURITÉ: Si ce n'est pas un array, extraire le array
  if (!Array.isArray(produits)) {
    if (produits?.produits && Array.isArray(produits.produits)) {
      produits = produits.produits;
    } else if (produits?.data && Array.isArray(produits.data)) {
      produits = produits.data;
    } else {
      console.error('❌ Données produits invalides:', produits);
      return;
    }
  }

  console.log('📋 afficherTableProduits appelé avec', produits.length, 'produits');
  console.log('📦 Produits à afficher:', produits);
  
  // 🧹 NETTOYER COMPLÈTEMENT le tbody - supprimer TOUS les enfants, y compris les templates
  console.log('🧹 tbody children avant nettoyage:', tbody.children.length);
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }
  console.log('🧹 tbody enfants après nettoyage:', tbody.children.length);
  
  // 🚫 Masquer le spinner et afficher le tableau
  const spinner = document.getElementById('filterSpinner');
  const tableContainer = document.getElementById('tableReceptions');
  const noResults = document.getElementById('noResultsMessage');
  
  if (spinner) spinner.style.display = 'none';
  if (tableContainer) tableContainer.style.display = 'block';
  if (noResults) noResults.style.display = 'none';

  // ⚡ Utiliser documentFragment pour performance
  const fragment = document.createDocumentFragment();

  produits.forEach((produit, index) => {
    const row = document.createElement('tr');
    
    // ✅ DÉTERMINER L'ÉTAT ET LA QUANTITÉ À AFFICHER
    let etatBadge = '<span class="badge bg-success">Disponible</span>';
    let quantiteAffichee = produit.quantiteActuelle;
    let seuilAffiche = produit.seuilAlerte || 10;
    
    // 📦 SI LE PRODUIT EST EN COMMANDE
    if (produit.etat === 'EN_COMMANDE') {
      etatBadge = '<span class="badge bg-info">🛒 En commande</span>';
      
      console.log(`🔍 DEBUG Rouleau Rose: etat=${produit.etat}, commandesIds présent? ${!!produit.commandesIds}, length=${produit.commandesIds?.length || 0}`);
      console.log(`   commandesIds:`, produit.commandesIds);
      
      // Afficher la quantité commandée si disponible
      if (produit.commandesIds && produit.commandesIds.length > 0) {
        // La première commande (la plus récente, déjà triée DESC)
        const commande = Array.isArray(produit.commandesIds) ? 
          produit.commandesIds[0] :  // ✅ Première = plus récente
          produit.commandesIds;
        
        console.log(`   Première commande:`, commande);
        
        // Si c'est un objet avec quantiteCommandee
        if (commande && typeof commande === 'object') {
          // 🎁 Pour LOT: Calculer depuis nombrePieces × quantiteParPiece
          if (commande.nombrePieces && commande.quantiteParPiece) {
            quantiteAffichee = (commande.nombrePieces * commande.quantiteParPiece);
            seuilAffiche = quantiteAffichee;
            console.log(`🛒 Produit EN_COMMANDE (LOT): ${produit.designation} avec quantité: ${quantiteAffichee} (${commande.nombrePieces} × ${commande.quantiteParPiece})`);
          } 
          // Pour SIMPLE: Utiliser quantiteCommandee directement
          else if (commande.quantiteCommandee) {
            quantiteAffichee = commande.quantiteCommandee;
            seuilAffiche = commande.quantiteCommandee;
            console.log(`🛒 Produit EN_COMMANDE (SIMPLE): ${produit.designation} avec quantité: ${commande.quantiteCommandee}`);
          }
          else {
            console.warn(`⚠️ Commande sans données pour ${produit.designation}:`, commande);
            // Fallback: utiliser quantiteActuelle si aucune donnée commandée
            quantiteAffichee = produit.quantiteActuelle;
          }
        } else {
          console.warn(`⚠️ Commande n'est pas un objet pour ${produit.designation}:`, commande);
          quantiteAffichee = produit.quantiteActuelle;
        }
      } else {
        console.warn(`⚠️ Aucune commande trouvée pour ${produit.designation} (commandesIds vide ou null)`);
        // Fallback: utiliser quantiteActuelle si pas de commande
        quantiteAffichee = produit.quantiteActuelle;
      }
    } 
    // SINON: Déterminer l'état normal du stock
    else if (produit.quantiteActuelle === 0) {
      etatBadge = '<span class="badge bg-danger">En rupture</span>';
    } else if (produit.quantiteActuelle < (produit.seuilAlerte || 10)) {
      etatBadge = '<span class="badge bg-warning">Stock faible</span>';
    }

    // ⚡ Gérer l'image avec fallback
    const photoHTML = produit.photoUrl 
      ? `<img src="${produit.photoUrl}" alt="${produit.designation}" class="img-thumbnail" style="max-width: 80px; max-height: 80px; object-fit: cover; border-radius: 4px;">`
      : '<span class="badge bg-secondary"><i class="fas fa-image me-1"></i>Pas d\'image</span>';

    row.innerHTML = `
      <td style="display:none;" class="id">${produit._id}</td>
      <td class="reference" style="display:none;">${produit.reference}</td>
      <td class="designation" style="display: flex; align-items: center; gap: 12px;">
        <div style="flex-shrink: 0;">
          ${photoHTML}
        </div>
        <div>
          <strong>${produit.designation}</strong><br>
          <small class="text-muted">${produit.reference}</small>
        </div>
      </td>
      <td class="categorie" style="display:none;">${produit.typeProduitId?.nomType || 'N/A'}</td>
      <td class="quantite">
        <strong>${quantiteAffichee}</strong> 
        <small class="text-muted">(seuil: ${seuilAffiche})</small>
      </td>
      <td class="emplacement">${produit.rayonId?.nomRayon || 'N/A'}</td>
      <td class="etat">${etatBadge}</td>
      <td class="dateEntree">${new Date(produit.dateEntree).toLocaleDateString()}</td>
      <td class="actions">
        ${(produit.quantiteActuelle === 0 || produit.quantiteActuelle < (produit.seuilAlerte || 10)) ? `
          <!-- Dropdown pour produits EN_RUPTURE ou STOCK FAIBLE -->
          <div class="btn-group btn-group-sm" role="group">
            <button type="button" class="btn ${produit.quantiteActuelle === 0 ? 'btn-danger' : 'btn-warning'} dropdown-toggle btn-action-rgb" data-bs-toggle="dropdown" aria-expanded="false" title="Actions disponibles">
              <i class="fas fa-bolt me-1"></i>ACTIONS <span class="caret"></span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a class="dropdown-item" href="#" onclick="openReceptionForProduct('${produit._id}'); return false;">
                  <i class="fas fa-inbox text-success me-2"></i>📥 Réceptionner
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" onclick="openAddProductCommande('${produit._id}'); return false;">
                  <i class="fas fa-shopping-cart text-warning me-2"></i>🛒 Commander
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item" href="#" onclick="editProduct('${produit._id}'); return false;">
                  <i class="fas fa-edit text-info me-2"></i>✏️ Modifier
                </a>
              </li>
            </ul>
          </div>
        ` : `
          <!-- Boutons normaux -->
          <div class="btn-group btn-group-sm" role="group">
            <button class="btn btn-info" onclick="editProduct('${produit._id}')" title="Modifier">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-warning" onclick="registerMovement('${produit._id}', '${produit.designation}')" title="Mouvement">
              <i class="fas fa-exchange-alt"></i>
            </button>
            <button class="btn btn-danger" onclick="deleteProduct('${produit._id}')" title="Supprimer">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `}
      </td>
    `;
    
    console.log(`  📝 Row ${index + 1} créée pour:`, produit.designation);
    fragment.appendChild(row);
  });

  console.log(`📊 Fragment contient ${produits.length} rows`);
  
  console.log(`📤 Ajout du fragment (${produits.length} rows) au tbody`);
  tbody.appendChild(fragment);

  console.log(' Table mise à jour avec fragment');
  console.log('📋 Contenu tbody après update:', tbody.innerHTML);
  console.log('📋 Nombre de tr dans tbody:', tbody.querySelectorAll('tr').length);
}

// ================================
// ✏️ ÉDITER PRODUIT
// ================================

function editProduct(produitId) {
  openProductDetailPremium(produitId);
}

// ================================
// 📥 OUVRIR MODAL RÉCEPTION
// ================================

function openReceptionForProduct(produitId) {
  console.log(`🔵 Ouverture réception pour produit: ${produitId}`);
  
  // Mettre le produitId dans le select
  const select = document.getElementById('produitReception');
  if (select) {
    select.value = produitId;
    
    // Déclencher le changement pour charger les prévisions
    const event = new Event('change', { bubbles: true });
    select.dispatchEvent(event);
  }
  
  // Ouvrir le modal
  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalReception'));
  modal.show();
}

// ================================
// 🛒 OUVRIR MODAL AJOUT EN COMMANDE
// ================================

function openAddProductCommande(produitId) {
  console.log(`🔵 Ouverture modal commande pour produit: ${produitId}`);
  
  // Chercher le produit
  const produit = CACHE_PRODUITS?.find(p => p._id === produitId);
  if (!produit) {
    console.error('❌ Produit non trouvé:', produitId);
    return;
  }
  
  // Pré-remplir les champs
  document.getElementById('reference').value = produit.reference || '';
  document.getElementById('designation').value = produit.designation || '';
  document.getElementById('produitId').value = produitId;
  
  // Marquer comme produit existant dans la recherche
  const searchInput = document.getElementById('searchExistingProduct');
  if (searchInput) {
    searchInput.value = `${produit.reference} - ${produit.designation}`;
    searchInput.dataset.selected = produitId;
  }
  
  // Passer en mode "En Commande"
  const modeCommande = document.getElementById('modeEnCommande');
  if (modeCommande) {
    modeCommande.checked = true;
    const event = new Event('change', { bubbles: true });
    modeCommande.dispatchEvent(event);
  }
  
  // Ouvrir le modal
  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalProduit'));
  modal.show();
  
  showNotification(`✅ Mode Commande pour "${produit.reference}"`, 'success');
}

// ================================
// 📤 MOUVEMENTS DE STOCK
// ================================

function registerMovement(produitId, designation) {
  openProductDetailPremium(produitId);
}

// ================================
// 🗑️ SUPPRIMER PRODUIT
// ================================

async function deleteProduct(produitId) {
  // Chercher le produit dans la liste
  const produit = CACHE_PRODUITS?.find(p => p._id === produitId);
  const designation = produit?.designation || 'ce produit';

  // Créer un overlay avec un vrai style - pas de modal-backdrop Bootstrap
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;

  // Créer le contenu du modal
  const confirmBox = document.createElement('div');
  confirmBox.style.cssText = `
    background: white;
    border: 2px solid #dc3545;
    border-radius: 8px;
    max-width: 400px;
    padding: 0;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  `;
  confirmBox.innerHTML = `
    <div style="padding: 20px;">
      <h5 style="color: #dc3545; margin-bottom: 15px;">
        <i class="fas fa-exclamation-triangle me-2"></i>Confirmation de suppression
      </h5>
      <p style="margin-bottom: 10px;">
        Êtes-vous sûr de vouloir supprimer <strong>"${designation}"</strong>?
      </p>
      <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
        <i class="fas fa-info-circle me-1"></i>Cette action:
        <ul style="margin-top: 8px; padding-left: 20px;">
          <li>Supprimera tous les stocks du produit</li>
          <li>Supprimera toutes les réceptions associées</li>
          <li>Ne peut pas être annulée</li>
        </ul>
      </p>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Raison *</label>
        <input type="text" id="deleteReason" placeholder="Raison obligatoire" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" required />
        <small style="color: #dc3545; display: none; margin-top: 5px;" id="reasonError">
          <i class="fas fa-exclamation-circle me-1"></i>La raison est obligatoire
        </small>
      </div>
      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button class="btn btn-secondary btn-sm" id="cancelBtn">Annuler</button>
        <button class="btn btn-danger btn-sm" id="confirmDeleteBtn" disabled style="opacity: 0.5; cursor: not-allowed;">
          <i class="fas fa-trash me-1"></i>Supprimer
        </button>
      </div>
    </div>
  `;

  overlay.appendChild(confirmBox);
  document.body.appendChild(overlay);

  // Gérer le champ raison - valider en temps réel
  const reasonInput = document.getElementById('deleteReason');
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const reasonError = document.getElementById('reasonError');

  reasonInput.addEventListener('input', () => {
    if (reasonInput.value.trim().length > 0) {
      confirmBtn.disabled = false;
      confirmBtn.style.opacity = '1';
      confirmBtn.style.cursor = 'pointer';
      reasonError.style.display = 'none';
    } else {
      confirmBtn.disabled = true;
      confirmBtn.style.opacity = '0.5';
      confirmBtn.style.cursor = 'not-allowed';
      reasonError.style.display = 'block';
    }
  });

  // Bouton annuler
  cancelBtn.addEventListener('click', () => {
    overlay.remove();
  });

  // Gérer le clic sur "Supprimer"
  confirmBtn.addEventListener('click', async () => {
    const raison = reasonInput.value.trim();

    // Double vérification
    if (!raison) {
      reasonError.style.display = 'block';
      reasonInput.focus();
      return;
    }

    overlay.remove();

    try {
      // ⚡ Créer un overlay de chargement amélioré avec étapes
      const loadingOverlay = document.createElement('div');
      loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
      `;

      const loadingBox = document.createElement('div');
      loadingBox.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 40px 30px;
        text-align: center;
        max-width: 350px;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
      `;
      loadingBox.innerHTML = `
        <div style="margin-bottom: 20px;">
          <div style="
            width: 60px;
            height: 60px;
            border: 4px solid #f0f0f0;
            border-top: 4px solid #dc3545;
            border-radius: 50%;
            margin: 0 auto;
            animation: spin 1s linear infinite;
          "></div>
        </div>
        <h5 style="margin-bottom: 10px; color: #333;">
          <i class="fas fa-trash-alt me-2" style="color: #dc3545;"></i>Suppression en cours...
        </h5>
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
          "${designation}" est en cours de suppression
        </p>
        <div style="
          display: flex;
          justify-content: space-around;
          gap: 10px;
          font-size: 12px;
          color: #999;
        ">
          <div>
            <i class="fas fa-spinner fa-spin me-1"></i>
            <span>Produit</span>
          </div>
          <div>
            <i class="fas fa-spinner fa-spin me-1"></i>
            <span>Données</span>
          </div>
          <div>
            <i class="fas fa-spinner fa-spin me-1"></i>
            <span>Table</span>
          </div>
        </div>
      `;

      loadingOverlay.appendChild(loadingBox);
      document.body.appendChild(loadingOverlay);

      console.log(`🗑️ Suppression du produit: ${produitId}`);
      console.log(`   Raison: ${raison}`);

      // Ajouter un délai minimum pour que l'user voit le spinner
      await new Promise(resolve => setTimeout(resolve, 500));

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/protected/produits/${produitId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ raison })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression');
      }

      const result = await response.json();
      console.log(' Produit supprimé:', result);

      // Mettre à jour le message à "Actualisation de la table..."
      // Chercher le conteneur des étapes (dernier div enfant du loadingBox)
      const allDivs = loadingBox.querySelectorAll('div');
      const stepsContainer = allDivs[allDivs.length - 1]; // Dernier div = le conteneur des étapes
      let steps = [];
      if (stepsContainer && stepsContainer.children.length >= 3) {
        steps = Array.from(stepsContainer.children);
        if (steps.length >= 3) {
          steps[0].innerHTML = '<i class="fas fa-check me-1" style="color: #28a745;"></i><span>Produit</span>';
          steps[1].innerHTML = '<i class="fas fa-check me-1" style="color: #28a745;"></i><span>Données</span>';
        }
      }

      // Recharger la table
      await loadProduits(false);

      // Marquer la dernière étape
      if (steps.length >= 3) {
        steps[2].innerHTML = '<i class="fas fa-check me-1" style="color: #28a745;"></i><span>Table</span>';
      }

      // Attendre un peu avant de fermer l'overlay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Fermer l'overlay avec une animation de succès
      loadingBox.innerHTML = `
        <div style="margin-bottom: 20px; animation: scaleIn 0.5s ease-out;">
          <div style="
            width: 60px;
            height: 60px;
            background-color: #28a745;
            border-radius: 50%;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 30px;
          ">
            <i class="fas fa-check"></i>
          </div>
        </div>
        <h5 style="margin-bottom: 10px; color: #28a745;">Supprimé avec succès!</h5>
        <p style="color: #666; font-size: 14px; margin: 0;">
          "${designation}" a été supprimé
        </p>
      `;

      await new Promise(resolve => setTimeout(resolve, 1200));
      loadingOverlay.remove();

      // Afficher le toast de succès
      showToast(` ${designation} supprimé avec succès`, 'success');

      // Fermer les modales si ouvertes
      const modals = document.querySelectorAll('[role="dialog"]');
      modals.forEach(modal => {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) bsModal.hide();
      });

    } catch (err) {
      console.error('❌ Erreur suppression produit:', err);
      // Supprimer le spinner d'erreur
      const spinner = document.querySelector('.spinner-border');
      if (spinner) spinner.remove();
      // Afficher le toast d'erreur
      showToast(`❌ Erreur: ${err.message}`, 'danger');
    }
  });

  // Fermer si on clique en dehors du modal (sur l'overlay)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  // Focus auto sur le champ raison
  setTimeout(() => reasonInput.focus(), 100);
}

// ================================
// 📊 ALERTES STOCK
// ================================

async function loadAlertes() {
  try {
    if (!MAGASIN_ID) return;

    const alertes = await API.get(
      API_CONFIG.ENDPOINTS.ALERTES,
      { magasinId: MAGASIN_ID }
    );

    console.log('🚨 Alertes:', alertes);
    
    // Afficher les alertes dans le dashboard
    const alerteCount = alertes.filter(a => a.statut === 'ACTIVE').length;
    const elem = document.getElementById('alertesStock');
    if (elem) elem.textContent = alerteCount;

  } catch (err) {
    console.error('❌ Erreur alertes:', err);
  }
}

// ================================
// 📊 CHARGER KPIs (VRAIES DONNÉES)
// ================================

async function updateDashboardKPIs(produits = null) {
  try {
    if (!MAGASIN_ID) return;

    // ⚡ Réutiliser les produits si fournis, sinon utiliser le cache
    let donneesProduits = produits || getProduitsCached();
    
    if (!donneesProduits) {
      donneesProduits = await API.get(
        API_CONFIG.ENDPOINTS.PRODUITS,
        { magasinId: MAGASIN_ID }
      );
      setProduitsCached(donneesProduits);
    }
    
    // 🔧 SÉCURITÉ: Si ce n'est pas un array, extraire le array
    if (!Array.isArray(donneesProduits)) {
      if (donneesProduits?.produits && Array.isArray(donneesProduits.produits)) {
        donneesProduits = donneesProduits.produits;
      } else if (donneesProduits?.data && Array.isArray(donneesProduits.data)) {
        donneesProduits = donneesProduits.data;
      } else {
        console.error('❌ Données produits invalides:', donneesProduits);
        return;
      }
    }
    
    // 1. Stock total
    const totalStock = donneesProduits.reduce((sum, p) => sum + (p.quantiteActuelle || 0), 0);
    const elem = document.getElementById('totalStock');
    if (elem) {
      elem.classList.remove('loading');
      elem.innerHTML = totalStock.toLocaleString();
    }

    // 2. Rayons actifs
    if (CURRENT_STOCK_CONFIG?.rayons) {
      const rayonsActifs = CURRENT_STOCK_CONFIG.rayons.filter(r => r.status === 1).length;
      const elemRayons = document.getElementById('rayonsActifs');
      if (elemRayons) {
        elemRayons.classList.remove('loading');
        elemRayons.innerHTML = rayonsActifs;
      }
    }

    // 3. Alertes stock - Compter les produits avec quantité <= seuil
    try {
      // ⚡ Calculer les alertes EN TEMPS RÉEL basées sur quantité vs seuil
      // Au lieu de récupérer un endpoint d'alertes séparé
      let nombreAlertes = 0;
      
      if (Array.isArray(donneesProduits)) {
        nombreAlertes = donneesProduits.filter(p => {
          const seuil = p.seuilAlerte || 10;
          const quantite = p.quantiteActuelle || 0;
          return quantite <= seuil;
        }).length;
      }
      
      const elemAlertes = document.getElementById('alertesStock');
      const iconAlertes = document.getElementById('iconAlertes');
      
      if (elemAlertes) {
        elemAlertes.classList.remove('loading');
        elemAlertes.innerHTML = nombreAlertes;
      }
      
      // 💃 Ajouter animation si alertes > 0
      if (iconAlertes) {
        iconAlertes.classList.remove('alert', 'swing', 'bounce');
        if (nombreAlertes > 0) {
          iconAlertes.classList.add('bounce'); // Animation bounce pour les alertes
        }
      }
      
      console.log(`🚨 Alertes calculées: ${nombreAlertes} produits sous seuil`);
    } catch (err) {
      console.error('⚠️ Erreur calcul alertes:', err);
      const elemAlertes = document.getElementById('alertesStock');
      if (elemAlertes) {
        elemAlertes.classList.remove('loading');
        elemAlertes.innerHTML = '0';
      }
    }

    // 4. Rayons pleins (occupation >= 80%)
    // ⚡ Charger les rayons avec leurs stats d'occupation
    let rayonsPleins = 0;
    try {
      const rayons = await API.get(
        API_CONFIG.ENDPOINTS.RAYONS,
        { magasinId: MAGASIN_ID }
      );
      
      // Compter les rayons avec occupation >= 80%
      rayonsPleins = (rayons || []).filter(rayon => {
        const occupation = rayon.occupation || 0;
        return occupation >= 80;
      }).length;
      
      console.log(`📦 Rayons pleins (occupation >= 80%): ${rayonsPleins} sur ${rayons.length}`);
    } catch (err) {
      console.error('⚠️ Erreur chargement rayons:', err);
      rayonsPleins = 0;
    }
    
    const elemPleins = document.getElementById('rayonsPleins');
    const iconRayonsPleins = document.getElementById('iconRayonsPleins');
    if (elemPleins) {
      elemPleins.classList.remove('loading');
      elemPleins.innerHTML = rayonsPleins;
    }
    // 💃 Ajouter animation si rayons pleins > 0
    if (iconRayonsPleins) {
      iconRayonsPleins.classList.remove('alert', 'swing', 'bounce');
      if (rayonsPleins > 0) {
        iconRayonsPleins.classList.add('swing'); // Animation swing pour les rayons pleins
      }
    }

    console.log(' KPIs mis à jour:', { totalStock, rayonsPleins });

  } catch (err) {
    console.error('❌ Erreur KPIs:', err);
  }
}

// ================================
// 📦 GESTION LOTS (FIFO)
// ================================

async function loadLots(produitId = null) {
  try {
    if (!MAGASIN_ID) return;

    let url = API_CONFIG.ENDPOINTS.LOTS;
    const params = { magasinId: MAGASIN_ID };

    const lots = await API.get(url, params);

    if (produitId) {
      return lots.filter(lot => lot.produitId === produitId && lot.status === 'ACTIF');
    }

    console.log('📦 Lots (FIFO):', lots);
    return lots;

  } catch (err) {
    console.error('❌ Erreur lots:', err);
    return [];
  }
}

// ================================
// 📊 RAPPORTS INVENTAIRE
// ================================

async function startInventaire() {
  try {
    if (!MAGASIN_ID) {
      showToast('Veuillez sélectionner un magasin', 'warning');
      return;
    }

    const rapport = await API.post(
      API_CONFIG.ENDPOINTS.INVENTAIRES,
      { observations: 'Inventaire complet' },
      { magasinId: MAGASIN_ID }
    );

    showToast(` Inventaire créé: ${rapport.numeroInventaire}`, 'success');
    return rapport;

  } catch (err) {
    showToast('❌ Erreur: ' + err.message, 'danger');
  }
}

async function addLigneInventaire(rapportId, produitId, quantitePhysique) {
  try {
    const ligne = await API.put(
      API_CONFIG.ENDPOINTS.INVENTAIRE_LIGNES,
      {
        produitId,
        quantitePhysique,
        notes: 'Comptage manuel'
      },
      { rapportId }
    );

    console.log(' Ligne inventaire ajoutée:', ligne);
    return ligne;

  } catch (err) {
    showToast('❌ Erreur: ' + err.message, 'danger');
  }
}

async function validerInventaire(rapportId) {
  try {
    const rapport = await API.put(
      API_CONFIG.ENDPOINTS.INVENTAIRE_VALIDER,
      {},
      { rapportId }
    );

    showToast(' Inventaire validé!', 'success');
    console.log('📊 Résumé:', rapport.resume);
    return rapport;

  } catch (err) {
    showToast('❌ Erreur: ' + err.message, 'danger');
  }
}

// ================================
// 🎨 UTILITAIRES UI
// ================================

function showToast(message, type = 'info') {
  const toastId = 'toast-' + Date.now();
  const bgClass = {
    'success': 'bg-success',
    'danger': 'bg-danger',
    'warning': 'bg-warning',
    'info': 'bg-info'
  }[type] || 'bg-info';

  const toastHTML = `
    <div id="${toastId}" class="toast ${bgClass} text-white" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-body">
        ${message}
      </div>
    </div>
  `;

  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999;';
    document.body.appendChild(container);
  }

  container.insertAdjacentHTML('beforeend', toastHTML);
  
  if (typeof bootstrap !== 'undefined') {
    const toast = new bootstrap.Toast(document.getElementById(toastId));
    toast.show();
  }

  setTimeout(() => {
    const elem = document.getElementById(toastId);
    if (elem) elem.remove();
  }, 3000);
}

// ================================
// 🚀 INITIALISATION
// ================================

document.addEventListener('DOMContentLoaded', async function() {
  // Récupérer le magasin depuis sessionStorage
  MAGASIN_ID = sessionStorage.getItem('currentMagasinId');
  MAGASIN_NOM = sessionStorage.getItem('currentMagasinNom');

  // 🚫 Masquer le spinner du filtre au démarrage
  const filterSpinner = document.getElementById('filterSpinner');
  if (filterSpinner) filterSpinner.style.display = 'none';

  if (MAGASIN_ID) {
    document.getElementById('magasinActuelText').textContent = MAGASIN_NOM;
    
    // ⚡ Initialiser les spinners KPI
    initKPISpinners();
    
    // ⚡ Charger config ET produits EN PARALLÈLE
    await loadStockConfig();
    
    const [produits, alertes] = await Promise.all([
      (async () => {
        const p = await API.get(
          API_CONFIG.ENDPOINTS.PRODUITS,
          { magasinId: MAGASIN_ID }
        );
        setProduitsCached(p);
        afficherTableProduits(p);
        return p;
      })(),
      API.get(
        API_CONFIG.ENDPOINTS.ALERTES,
        { magasinId: MAGASIN_ID }
      ).catch(() => [])  // Si erreur, retourner array vide
    ]);

    // Mettre à jour les alertes
    const alerteCount = alertes && Array.isArray(alertes) ? alertes.filter(a => a.statut === 'ACTIVE').length : 0;
    const elemAlertes = document.getElementById('alertesStock');
    if (elemAlertes) {
      elemAlertes.classList.remove('loading');
      elemAlertes.innerHTML = alerteCount;
    }
    
    // Mettre à jour les KPIs avec les produits déjà chargés
    await updateDashboardKPIs(produits);
    
  } else {
    // Afficher 0 si pas de magasin sélectionné
    ['totalStock', 'rayonsActifs', 'alertesStock', 'rayonsPleins'].forEach(id => {
      const elem = document.getElementById(id);
      if (elem) {
        elem.classList.remove('loading');
        elem.textContent = '0';
      }
    });
  }

  // Écouter l'ouverture du modal magasins
  const modalMagasins = document.getElementById('modalSelectMagasin');
  if (modalMagasins) {
    modalMagasins.addEventListener('show.bs.modal', loadMagasinsModal);
  }

  // Attacher les événements des boutons
  const btnAdd = document.getElementById('btnAddProduit');
  if (btnAdd) {
    btnAdd.addEventListener('click', addProduct);
  }

  // ================================
  // 🔍 RECHERCHE AVANCÉE & FILTRES
  // ================================

  // État du filtre
  let filtresActifs = {
    produit: '',
    categorie: '',
    etatStock: ''
  };

  // Fonction de filtre personnalisée
  function appliquerFiltres() {
    if (!LIST_INSTANCE) return;

    // Montrer le spinner seulement dans la zone du filtre
    const spinner = document.getElementById('filterSpinner');
    const noResults = document.getElementById('noResultsMessage');
    const table = document.querySelector('#tableReceptions > div');
    
    // Afficher le spinner
    if (spinner) {
      spinner.style.display = 'flex';
    }
    if (noResults) noResults.style.display = 'none';
    if (table) table.style.display = 'none';

    // Simuler un petit délai pour montrer le spinner
    setTimeout(() => {
      const filtreProduit = document.getElementById('filtreProduit')?.value?.toLowerCase() || '';
      const filtreCategorie = document.getElementById('filtreCategorie')?.value?.toLowerCase() || '';
      const filtreEtatStock = document.getElementById('filtreEtatStock')?.value || '';

      filtresActifs = { filtreProduit, filtreCategorie, filtreEtatStock };

      // Récupérer tous les éléments du tableau
      const rows = document.querySelectorAll('#tableReceptions tbody tr');
      let resultatsTrouves = 0;
      
      rows.forEach(row => {
        let afficher = true;

        // Filtre Produit (cherche dans designation + reference)
        if (filtreProduit) {
          const designation = row.querySelector('.designation')?.textContent?.toLowerCase() || '';
          const reference = row.querySelector('td:first-child')?.textContent?.toLowerCase() || '';
          if (!designation.includes(filtreProduit) && !reference.includes(filtreProduit)) {
            afficher = false;
          }
        }

        // Filtre Catégorie (cherche dans emplacement/rayon)
        if (afficher && filtreCategorie) {
          const rayon = row.querySelector('.emplacement')?.textContent?.toLowerCase() || '';
          if (!rayon.includes(filtreCategorie)) {
            afficher = false;
          }
        }

        // Filtre État du stock
        if (afficher && filtreEtatStock) {
          const etatBadge = row.querySelector('.etat')?.textContent?.trim() || '';
          if (etatBadge !== filtreEtatStock) {
            afficher = false;
          }
        }

        // Appliquer la visibilité
        row.style.display = afficher ? '' : 'none';
        
        if (afficher) resultatsTrouves++;
      });

      // Masquer le spinner
      if (spinner) spinner.style.display = 'none';

      // Afficher le tableau ou le message "Aucun résultat"
      if (resultatsTrouves === 0) {
        if (noResults) noResults.style.display = 'block';
        if (table) table.style.display = 'none';
        console.log('📭 Aucun résultat avec les filtres:', filtresActifs);
      } else {
        if (noResults) noResults.style.display = 'none';
        if (table) table.style.display = 'block';
        console.log('🔍 Filtres appliqués - ' + resultatsTrouves + ' résultat(s):', filtresActifs);
      }
    }, 300); // Délai minimal pour montrer le spinner
  }

  // Écouter les changements dans les filtres
  const filtreProduit = document.getElementById('filtreProduit');
  const filtreCategorie = document.getElementById('filtreCategorie');
  const filtreEtatStock = document.getElementById('filtreEtatStock');
  const btnFiltrer = document.getElementById('btnFiltrerStock');
  const btnReinitialiser = document.getElementById('btnReinitialiserStock');

  if (filtreProduit) {
    filtreProduit.addEventListener('input', appliquerFiltres);
  }

  if (filtreCategorie) {
    filtreCategorie.addEventListener('input', appliquerFiltres);
  }

  if (filtreEtatStock) {
    filtreEtatStock.addEventListener('change', appliquerFiltres);
  }

  if (btnFiltrer) {
    btnFiltrer.addEventListener('click', appliquerFiltres);
  }

  if (btnReinitialiser) {
    btnReinitialiser.addEventListener('click', async () => {
      console.log('🔄 Début réinitialisation des filtres...');
      
      // Montrer le spinner
      const spinner = document.getElementById('filterSpinner');
      const noResults = document.getElementById('noResultsMessage');
      const table = document.querySelector('#tableReceptions > div');
      
      if (spinner) spinner.style.display = 'flex';
      if (noResults) noResults.style.display = 'none';
      if (table) table.style.display = 'none';
      
      // Réinitialiser tous les champs
      if (filtreProduit) filtreProduit.value = '';
      if (filtreCategorie) filtreCategorie.value = '';
      if (filtreEtatStock) filtreEtatStock.value = '';

      filtresActifs = { produit: '', categorie: '', etatStock: '' };
      
      // Recharger complètement les produits
      try {
        await loadProduits(false);
        
        // Afficher le tableau
        if (spinner) spinner.style.display = 'none';
        if (table) table.style.display = 'block';
        
        showToast(' Filtres réinitialisés', 'success');
        console.log('🔄 Filtres réinitialisés et tableau rechargé');
      } catch (err) {
        console.error('❌ Erreur réinitialisation:', err);
        if (spinner) spinner.style.display = 'none';
        showToast('❌ Erreur lors de la réinitialisation', 'danger');
      }
    });
  }

  // ⚡ Rafraîchir les KPIs toutes les 60 secondes (au lieu de 30) avec cache
  setInterval(() => {
    const cached = getProduitsCached();
    updateDashboardKPIs(cached);
  }, 60000);

  console.log(' Stock Management System initialized');
});

// ================================
// 📤 EXPORT FONCTIONS PUBLIQUES
// ================================

window.StockManager = {
  addProduct,
  loadProduits,
  registerMovement,
  deleteProduct,
  loadAlertes,
  loadLots,
  startInventaire,
  addLigneInventaire,
  validerInventaire,
  selectMagasin,
  loadMagasinsModal,
  showToast
};
