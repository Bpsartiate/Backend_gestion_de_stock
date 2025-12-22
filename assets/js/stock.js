/**
 * 📦 STOCK MANAGEMENT SYSTEM - FRONTEND JS
 * Version: 2.0 Complète
 * Utilise les APIs: Produits, StockMovements, Lots, Alertes, Inventaires
 */

// ================================
// ⚙️ CONFIGURATION GLOBALE
// ================================

// Vérifier si API_CONFIG existe déjà (pour éviter les duplicatas)
if (typeof API_CONFIG === 'undefined') {
  var API_CONFIG = {
    BASE: 'https://backend-gestion-de-stock.onrender.com',
    
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

    const fullUrl = `${API_CONFIG.BASE}${url}`;
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

async function loadMagasinsModal() {
  const spinner = document.getElementById('magasinsSpinner');
  const list = document.getElementById('magasinsList');
  const error = document.getElementById('magasinsError');

  try {
    spinner.style.display = 'block';
    list.style.display = 'none';
    error.style.display = 'none';

    const magasins = await API.get(API_CONFIG.ENDPOINTS.MAGASINS);

    list.innerHTML = '';
    magasins.forEach(magasin => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'w-100 list-group-item list-group-item-action p-3 mb-2 rounded-2';
      
      const isActive = MAGASIN_ID === magasin._id;
      if (isActive) button.classList.add('active', 'bg-primary');
      
      button.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
          <div class="text-start">
            <h6 class="mb-1 fw-bold">${magasin.nom_magasin}</h6>
            <small class="text-muted d-block">${magasin.adresse_magasin || 'N/A'}</small>
            ${magasin.telephone_magasin ? `<small class="text-muted d-block"><i class="fas fa-phone me-1"></i>${magasin.telephone_magasin}</small>` : ''}
          </div>
          ${isActive ? `<span class="badge bg-success"><i class="fas fa-check me-1"></i>Actif</span>` : ''}
        </div>
      `;

      button.addEventListener('click', () => selectMagasin(magasin._id, magasin.nom_magasin));
      list.appendChild(button);
    });

    spinner.style.display = 'none';
    list.style.display = 'block';

  } catch (err) {
    spinner.style.display = 'none';
    error.style.display = 'block';
    error.textContent = `❌ Erreur: ${err.message}`;
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

  await loadStockConfig();
  console.log('✅ Magasin sélectionné:', magasinNom);
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

    console.log('✅ Configuration chargée:', CURRENT_STOCK_CONFIG);
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
  
  console.log('✅ Catégorie sélectionnée:', categorieName);
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
  console.log(`✅ Mode ${mode} activé pour catégorie:`, categorie.nom);
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
        
        showToast(`✅ Catégorie "${searchVal}" créée!`, 'success');
      } catch (err) {
        showToast('❌ Erreur: ' + err.message, 'danger');
      }
    });
  }
}

// ================================
// 🎨 ANIMATIONS CSS
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

      // Créer le mouvement RECEPTION
      const movementData = {
        produitId: product._id,
        type: 'RECEPTION',
        quantite: produitData.quantiteEntree,
        numeroDocument: lotData.numeroDocument,
        fournisseur: lotData.fournisseur,
        observations: `Création produit: ${produitData.designation}`
      };

      await API.post(
        API_CONFIG.ENDPOINTS.STOCK_MOVEMENTS,
        movementData,
        { magasinId: MAGASIN_ID }
      );
    }

    showToast('✅ Produit créé avec succès!', 'success');
    form.reset();
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalProduit'));
    modal.hide();

    // Recharger la liste
    await loadProduits();

  } catch (err) {
    showToast('❌ Erreur: ' + err.message, 'danger');
  }
}

// ================================
// 📦 LISTER PRODUITS
// ================================

async function loadProduits() {
  try {
    if (!MAGASIN_ID) return;

    const produits = await API.get(
      API_CONFIG.ENDPOINTS.PRODUITS,
      { magasinId: MAGASIN_ID }
    );

    console.log('📦 Produits chargés:', produits);
    afficherTableProduits(produits);

  } catch (err) {
    console.error('❌ Erreur chargement produits:', err);
  }
}

function afficherTableProduits(produits) {
  const tbody = document.querySelector('#tableReceptions tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  produits.forEach(produit => {
    const row = document.createElement('tr');
    
    // Détermine l'état du stock
    let etatBadge = '<span class="badge bg-success">Disponible</span>';
    if (produit.quantiteActuelle === 0) {
      etatBadge = '<span class="badge bg-danger">En rupture</span>';
    } else if (produit.quantiteActuelle < (produit.seuilAlerte || 10)) {
      etatBadge = '<span class="badge bg-warning">Stock faible</span>';
    }

    row.innerHTML = `
      <td style="display:none;" class="id">${produit._id}</td>
      <td class="reference"><code>${produit.reference}</code></td>
      <td class="designation">${produit.designation}</td>
      <td class="quantite">
        <strong>${produit.quantiteActuelle}</strong> 
        <small class="text-muted">(seuil: ${produit.seuilAlerte || 10})</small>
      </td>
      <td class="emplacement">${produit.rayonId?.nomRayon || 'N/A'}</td>
      <td class="etat">${etatBadge}</td>
      <td class="dateEntree">${new Date(produit.dateEntree).toLocaleDateString()}</td>
      <td class="actions">
        <div class="btn-group btn-group-sm" role="group">
          <button class="btn btn-info" onclick="editProduct('${produit._id}')" title="Modifier">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-warning" onclick="registerMovement('${produit._id}', '${produit.designation}')" title="Mouvement">
            <i class="fas fa-arrow-right-arrow-left"></i>
          </button>
          <button class="btn btn-danger" onclick="deleteProduct('${produit._id}')" title="Supprimer">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    
    tbody.appendChild(row);
  });

  // Réinitialiser List.js si disponible ET qu'il y a des produits
  if (typeof List !== 'undefined' && produits.length > 0) {
    try {
      // Recréer la liste
      const options = {
        valueNames: ["id", "reference", "designation", "quantite", "emplacement", "etat", "dateEntree", "actions"],
        page: 5,
        pagination: true
      };
      new List('tableReceptions', options);
    } catch (err) {
      console.warn('⚠️ List.js error:', err.message);
    }
  } else if (produits.length === 0) {
    console.log('ℹ️ Aucun produit à afficher');
  }
}

// ================================
// 📤 MOUVEMENTS DE STOCK
// ================================

async function registerMovement(produitId, designation) {
  const quantite = prompt(`Quantité pour "${designation}":`, '');
  if (!quantite || isNaN(quantite) || quantite <= 0) return;

  const type = confirm('SORTIE? (Annuler = RECEPTION)') ? 'SORTIE' : 'RECEPTION';

  try {
    const movement = await API.post(
      API_CONFIG.ENDPOINTS.STOCK_MOVEMENTS,
      {
        produitId,
        type,
        quantite: parseInt(quantite),
        numeroDocument: '',
        observations: `Mouvement manuel: ${type}`
      },
      { magasinId: MAGASIN_ID }
    );

    showToast(`✅ Mouvement ${type} enregistré!`, 'success');
    await loadProduits();

  } catch (err) {
    showToast('❌ Erreur: ' + err.message, 'danger');
  }
}

// ================================
// 🗑️ SUPPRIMER PRODUIT
// ================================

async function deleteProduct(produitId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) return;

  try {
    await API.delete(
      API_CONFIG.ENDPOINTS.PRODUIT,
      { produitId }
    );

    showToast('✅ Produit supprimé!', 'success');
    await loadProduits();

  } catch (err) {
    showToast('❌ Erreur: ' + err.message, 'danger');
  }
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

async function updateDashboardKPIs() {
  try {
    if (!MAGASIN_ID) return;

    // 1. Stock total
    const produits = await API.get(
      API_CONFIG.ENDPOINTS.PRODUITS,
      { magasinId: MAGASIN_ID }
    );
    
    const totalStock = produits.reduce((sum, p) => sum + (p.quantiteActuelle || 0), 0);
    const elem = document.getElementById('totalStock');
    if (elem) elem.textContent = totalStock.toLocaleString();

    // 2. Rayons actifs
    if (CURRENT_STOCK_CONFIG?.rayons) {
      const rayonsActifs = CURRENT_STOCK_CONFIG.rayons.filter(r => r.status === 1).length;
      const elemRayons = document.getElementById('rayonsActifs');
      if (elemRayons) elemRayons.textContent = rayonsActifs;
    }

    // 3. Alertes stock (active count)
    const alertes = await API.get(
      API_CONFIG.ENDPOINTS.ALERTES,
      { magasinId: MAGASIN_ID }
    );
    const alertesActive = alertes.filter(a => a.statut === 'ACTIVE').length;
    const elemAlertes = document.getElementById('alertesStock');
    if (elemAlertes) elemAlertes.textContent = alertesActive;

    // 4. Rayons pleins (quantité > 80% capacité max)
    const rayonsPleins = produits.filter(p => {
      return p.quantiteActuelle > 0 && (p.quantiteActuelle >= (p.capaciteMax || 1000));
    }).length;
    const elemPleins = document.getElementById('rayonsPleins');
    if (elemPleins) elemPleins.textContent = rayonsPleins;

    console.log('✅ KPIs mis à jour:', { totalStock, rayonsActifs: CURRENT_STOCK_CONFIG?.rayons?.length, alertesActive });

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

    showToast(`✅ Inventaire créé: ${rapport.numeroInventaire}`, 'success');
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

    console.log('✅ Ligne inventaire ajoutée:', ligne);
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

    showToast('✅ Inventaire validé!', 'success');
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

  if (MAGASIN_ID) {
    document.getElementById('magasinActuelText').textContent = MAGASIN_NOM;
    await loadStockConfig();
    await loadProduits();
    await loadAlertes();
    await updateDashboardKPIs();  // ← Charger les VRAIES données
  } else {
    // Afficher 0 si pas de magasin sélectionné
    ['totalStock', 'rayonsActifs', 'alertesStock', 'rayonsPleins'].forEach(id => {
      const elem = document.getElementById(id);
      if (elem) elem.textContent = '0';
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

  // Rafraîchir les KPIs toutes les 30 secondes
  setInterval(updateDashboardKPIs, 30000);

  console.log('✅ Stock Management System initialized');
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
