<div class="content">
  <!-- content nav -->
  <?php include_once ".././topbar.php" ?>
    <!-- Modal pour ajouter produit -->
    <?php include_once "add_prod.php"; ?>
    <!-- Modal pour la réception -->
    <?php include_once "modal_reception.php"; ?>
<style>
   .card.shadow-sm {
  border-radius: 1rem;
}

.fs--2 {
  font-size: 0.75rem;
}

.text-600 { color: #6c757d; }
.text-500 { color: #9da1a7; }
.text-1100 { color: #212529; }

/* Si non inclus par ton thème */
.bg-soft-primary { background-color: rgba(59, 130, 246, 0.08); }
.bg-soft-success { background-color: rgba(16, 185, 129, 0.08); }
.bg-soft-warning { background-color: rgba(245, 158, 11, 0.08); }
.bg-soft-danger  { background-color: rgba(239, 68, 68, 0.08); }

</style>
  <!-- tittre -->
  <div class="row">
    <div class="col-md-12">
      <div class="card mb-3">
        <div class="bg-holder d-none d-lg-block bg-card" 
             style="background-image:url(assets/img/icons/spot-illustrations/corner-4.png);"></div>
        <div class="card-body position-relative">
          <div class="row">
            <div class="d-flex justify-content-between mt-2 align-items-center mb-4">
              <div>
                <h3 class="mb-2">
                  <i class="fas fa-truck-loading me-2"></i>Stock & Entreposage
                </h3>
                <!-- Bouton de sélection magasin -->
                <button class="btn btn-outline-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#modalSelectMagasin">
                  <i class="fas fa-store me-1"></i>
                  <span id="magasinActuelText">Sélectionner magasin</span>
                </button>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#modalReception">
                  <i class="fas fa-truck-loading me-1"></i> Nouvelle réception
                </button>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalProduit">
                  <i class="fas fa-plus me-1"></i> Ajouter produit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
<!-- 🚀 DASHBOARD KPI FALCON ADMIN STYLE -->
<div class="row g-3 mb-4">

  <!-- Stock Total -->
  <div class="col-md-3 col-sm-6">
    <div class="card h-100 border-0 shadow-sm">
      <div class="card-body d-flex align-items-center justify-content-between">
        <div>
          <p class="text-uppercase text-600 fs--2 mb-1">Stock total</p>
          <h3 class="mb-1 fs-2 text-1100" id="totalStock">0</h3>
          <p class="mb-0 fs--2 text-500">
            Mis à jour aujourd’hui
          </p>
        </div>
        <div class="ms-3">
          <div class="avatar avatar-l bg-soft-primary text-primary rounded-circle d-flex align-items-center justify-content-center">
            <span class="fas fs-4 fa-boxes"></span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Rayons Actifs -->
  <div class="col-md-3 col-sm-6">
    <div class="card h-100 border-0 shadow-sm">
      <div class="card-body d-flex align-items-center justify-content-between">
        <div>
          <p class="text-uppercase text-600 fs--2 mb-1">Rayons actifs</p>
          <h3 class="mb-1 fs-2 text-1100" id="rayonsActifs">0</h3>
          <p class="mb-0 fs--2 text-500">
            Rayons opérationnels
          </p>
        </div>
        <div class="ms-3">
          <div class="avatar avatar-l bg-soft-success text-success rounded-circle d-flex align-items-center justify-content-center">
            <span class="fas fs-4 fa-layer-group"></span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Alertes Stock -->
  <div class="col-md-3 col-sm-6">
    <div class="card h-100 border-0 shadow-sm">
      <div class="card-body d-flex align-items-center justify-content-between">
        <div>
          <p class="text-uppercase text-600 fs--2 mb-1">Alertes stock</p>
          <h3 class="mb-1 fs-2 text-1100" id="alertesStock">0</h3>
          <p class="mb-0 fs--2 text-500">
            Articles sous seuil
          </p>
        </div>
        <div class="ms-3">
          <div class="avatar avatar-l bg-soft-warning text-warning rounded-circle d-flex align-items-center justify-content-center">
            <span class="fas fs-4 fa-exclamation-triangle"></span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Rayons Pleins -->
  <div class="col-md-3 col-sm-6">
    <div class="card h-100 border-0 shadow-sm">
      <div class="card-body d-flex align-items-center justify-content-between">
        <div>
          <p class="text-uppercase text-600 fs--2 mb-1">Rayons pleins</p>
          <h3 class="mb-1 fs-2 text-1100" id="rayonsPleins">0</h3>
          <p class="mb-0 fs--2 text-500">
            Au maximum de capacité
          </p>
        </div>
        <div class="ms-3">
          <div class="avatar avatar-l bg-soft-danger text-danger rounded-circle d-flex align-items-center justify-content-center">
            <span class="fas fa-fire fs-4"></span>
          </div>
        </div>
      </div>
    </div>
  </div>

</div>


  <div class="row">
    <div class="col-md-12">
        <div class="card">
        <div class="card-body">
            <div class="row g-3 align-items-center">
                <div class="col-md-3">
                    <label for="filtreProduit" class="form-label">Produit</label>
                    <input type="text" class="form-control" id="filtreProduit" placeholder="Recherche par produit">
                </div>
                <div class="col-md-3">
                    <label for="filtreCategorie" class="form-label">Catégorie</label>
                    <input type="text" class="form-control" id="filtreCategorie" placeholder="Recherche par catégorie">
                </div>
                <div class="col-md-3">
                    <label for="filtreEtatStock" class="form-label">État du stock</label>
                    <select class="form-select" id="filtreEtatStock">
                        <option value="">Tous</option>
                        <option value="Disponible">Disponible</option>
                        <option value="En rupture">En rupture</option>
                        <option value="En commande">En commande</option>
                    </select>
                </div>
                <div class="col-md-3 d-flex gap-2 mt-5">
                    <button title="search" id="btnFiltrerStock" class="btn btn-outline-secondary flex-grow">
                        <i class="fas fa-search"></i>
                    </button>
                    <button title="actualiser" id="btnReinitialiserStock" class="btn btn-outline-danger flex-grow">
                        <i class="fas fa-undo"></i>
                    </button>
                </div>
            </div>
        <div class="row">
            <div class="col-md-12">
                <div class="row mt-2">
                    <div class="col-md-5">
                        <input class="search form-control mb-3" placeholder="Recherche globale..." />
                    </div>
                </div>
                <!-- tableau -->
               <div id="tableReceptions">
                <div data-list='{"valueNames":["id", "reference", "designation", "categorie", "quantite", "emplacement", "etat", "dateEntree", "actions"],"page":5,"pagination":true}'>
                    <table class="table table-bordered table-striped">
                    <thead>
                        <tr>
                        <th style="display:none;">ID</th>
                        <th class="sort" data-sort="reference">Référence</th>
                        <th class="sort" data-sort="designation">Désignation</th>
                        <th class="sort" data-sort="quantite">Quantité</th>
                        <th class="sort" data-sort="emplacement">Emplacement</th>
                        <th class="sort" data-sort="etat">État</th>
                        <th class="sort" data-sort="dateEntree">Date entrée</th>
                        <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody class="list">
                        <tr>
                        <td style="display:none;" class="id"></td>
                        <td class="reference"></td>
                        <td class="designation"></td>
                        <td class="quantite"></td>
                        <td class="emplacement"></td>
                        <td class="etat"></td>
                        <td class="dateEntree"></td>
                        <td class="actions"></td>
                        </tr>
                    </tbody>
                    </table>
                    <div class="d-flex justify-content-center mt-3">
                    <button class="btn btn-sm btn-secondary me-1" type="button" data-list-pagination="prev"><i class="fas fa-chevron-left"></i></button>
                    <ul class="pagination mb-0"></ul>
                    <button class="btn btn-sm btn-secondary ms-1" type="button" data-list-pagination="next"><i class="fas fa-chevron-right"></i></button>
                    </div>
                </div>
            </div>
        </div>
        </div>
    </div>
    </div>
    
  </div>

  <!-- 🏪 MODAL SÉLECTION MAGASIN -->
  <div class="modal fade" id="modalSelectMagasin" tabindex="-1" aria-labelledby="modalSelectMagasinLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content shadow-xl border-0">
        <div class="modal-header bg-gradient-primary text-white">
          <h5 class="modal-title">
            <i class="fas fa-store me-2"></i>Sélectionner un magasin
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <!-- Spinner de chargement -->
          <div id="magasinsSpinner" class="text-center py-5">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
            <p class="text-muted">Chargement des magasins...</p>
          </div>

          <!-- Liste des magasins -->
          <div id="magasinsList" style="display: none;">
            <!-- Sera rempli par JavaScript -->
          </div>

          <!-- Message d'erreur -->
          <div id="magasinsError" style="display: none;" class="alert alert-danger mb-0"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bouton flottant paramètres en bas à droite -->
  <button id="btnSettingsStock" class="btn btn-lg btn-primary" style="position: fixed; bottom: 30px; right: 30px; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 99;" data-bs-toggle="modal" data-bs-target="#modalStockSettings" title="Paramètres">
    <i class="fas fa-cog" style="font-size: 1.5rem; animation: spin 2s linear infinite;"></i>
  </button>

  <!-- Modal Paramètres Stock -->
   <?php include_once "modal_stock_settings.php"; ?>
 <script>
// ================================
// ⚙️ CONFIGURATION API
// ================================
const API_BASE = 'https://backend-gestion-de-stock.onrender.com';

// Variables globales pour le stock
let MAGASIN_ID = null;
let CURRENT_STOCK_CONFIG = null;
let CURRENT_USER = null;

// ================================
// 🔐 AUTHENTIFICATION
// ================================
function getAuthHeaders() {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// ================================
// 🏪 GESTION DES MAGASINS
// ================================

// Charger et afficher les magasins disponibles dans le modal
async function loadMagasinsModal() {
  const spinner = document.getElementById('magasinsSpinner');
  const list = document.getElementById('magasinsList');
  const error = document.getElementById('magasinsError');

  spinner.style.display = 'block';
  list.style.display = 'none';
  error.style.display = 'none';

  try {
    const response = await fetch(`${API_BASE}/api/protected/magasins`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des magasins');
    }

    const magasins = await response.json();

    // Construire la liste des magasins
    list.innerHTML = '';
    magasins.forEach(magasin => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'w-100 list-group-item list-group-item-action p-3 mb-2 rounded-2';
      if (MAGASIN_ID === magasin._id) {
        button.classList.add('active', 'bg-primary');
      }
      
      button.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
          <div class="text-start">
            <h6 class="mb-1 fw-bold">${magasin.nom_magasin}</h6>
            <small class="text-muted d-block">${magasin.adresse_magasin || 'Adresse non disponible'}</small>
            ${magasin.telephone_magasin ? `<small class="text-muted d-block"><i class="fas fa-phone me-1"></i>${magasin.telephone_magasin}</small>` : ''}
          </div>
          ${MAGASIN_ID === magasin._id ? `<span class="badge bg-success"><i class="fas fa-check me-1"></i>Actif</span>` : ''}
        </div>
      `;

      button.addEventListener('click', () => selectMagasin(magasin._id, magasin.nom_magasin));
      list.appendChild(button);
    });

    spinner.style.display = 'none';
    list.style.display = 'block';

  } catch (err) {
    console.error('❌ Erreur:', err);
    spinner.style.display = 'none';
    error.style.display = 'block';
    error.textContent = '❌ Erreur: ' + err.message;
  }
}

// Sélectionner un magasin
async function selectMagasin(magasinId, magasinNom) {
  MAGASIN_ID = magasinId;
  sessionStorage.setItem('currentMagasinId', magasinId);
  
  // Mettre à jour le label du bouton
  document.getElementById('magasinActuelText').textContent = magasinNom;
  
  // Fermer le modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('modalSelectMagasin'));
  modal.hide();

  // Charger la config de stock
  await loadStockConfig();

  console.log('✅ Magasin sélectionné:', magasinNom);
}

// ================================
// 📦 CONFIGURATION STOCK
// ================================

// Charger la configuration de stock au démarrage
async function loadStockConfig() {
  try {
    if (!MAGASIN_ID) {
      console.warn('⚠️ Aucun magasin sélectionné');
      return;
    }

    console.log('📦 Chargement config stock pour magasin:', MAGASIN_ID);

    // Fetch de la config de stock complète
    const response = await fetch(
      `${API_BASE}/api/protected/magasins/${MAGASIN_ID}/stock-config`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) {
      console.error('❌ Erreur:', response.status, response.statusText);
      return;
    }

    CURRENT_STOCK_CONFIG = await response.json();

    // Populer les rayons et types de produits
    populateRayons();
    populateTypesProduits();

    console.log('✅ Configuration stock chargée:', CURRENT_STOCK_CONFIG);
  } catch (err) {
    console.error('❌ Erreur chargement config stock:', err);
  }
}

// Remplir le select des rayons dans add_prod.php
function populateRayons() {
  const rayonSelect = document.getElementById('rayonId');
  if (!rayonSelect || !CURRENT_STOCK_CONFIG?.rayons) return;

  // Vider les options existantes (sauf le placeholder)
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

// Remplir le select des types de produits dans add_prod.php
function populateTypesProduits() {
  const typeProduitSelect = document.getElementById('typeProduit');
  if (!typeProduitSelect || !CURRENT_STOCK_CONFIG?.typesProduits) return;

  typeProduitSelect.innerHTML = '<option value="">Sélectionner un type...</option>';

  CURRENT_STOCK_CONFIG.typesProduits.forEach(type => {
    if (type.status === 1 || type.status === true) {
      const option = document.createElement('option');
      option.value = type._id;
      option.textContent = `${type.nomType}`;
      option.dataset.unite = type.unitePrincipale;
      option.dataset.champs = JSON.stringify(type.champsSupplementaires || []);
      option.dataset.photoRequise = type.photoRequise ? 'true' : 'false';
      typeProduitSelect.appendChild(option);
    }
  });
}

// Au changement du type de produit, mettre à jour l'unité de mesure et les champs dynamiques
document.addEventListener('change', function(e) {
  if (e.target.id === 'typeProduit') {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const unite = selectedOption.dataset.unite;
    const champsData = selectedOption.dataset.champs ? JSON.parse(selectedOption.dataset.champs) : [];

    // Mettre à jour le label d'unité
    const unitLabel = document.querySelector('label[for="quantite"]');
    if (unitLabel) {
      unitLabel.textContent = `Quantité (${unite || 'unités'})`;
    }

    // Remplir les champs dynamiques
    const champsDynamiquesContainer = document.getElementById('champsDynamiques');
    if (champsDynamiquesContainer) {
      champsDynamiquesContainer.innerHTML = '';

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
          input.className = 'form-control';
          input.name = champ.nomChamp;
          
          input.appendChild(document.createElement('option')); // placeholder vide
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
        champsDynamiquesContainer.appendChild(group);
      });
    }
  }
});

// ================================
// 🚀 INITIALISATION AU DÉMARRAGE
// ================================
document.addEventListener('DOMContentLoaded', function() {
  // Récupérer le magasinId depuis sessionStorage (défini par magasin.php)
  MAGASIN_ID = sessionStorage.getItem('currentMagasinId');
  
  // Écouter l'ouverture du modal des magasins
  document.getElementById('modalSelectMagasin').addEventListener('show.bs.modal', function() {
    loadMagasinsModal();
  });

  // Si un magasin est sélectionné, charger la config
  if (MAGASIN_ID) {
    // Récupérer le nom du magasin depuis sessionStorage aussi (optionnel)
    const magasinNom = sessionStorage.getItem('currentMagasinNom') || 'Magasin sélectionné';
    document.getElementById('magasinActuelText').textContent = magasinNom;
    loadStockConfig();
  }

  // Animation countup automatique
  const kpis = {
    totalStock: 2450,
    rayonsActifs: 12,
    alertesStock: 3,
    rayonsPleins: 2
  };
  
  Object.keys(kpis).forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = kpis[id];
      // Animation countup si CountUp.js est chargé
      if (typeof CountUp !== 'undefined') {
        new CountUp(element, kpis[id], { duration: 2 }).start();
      }
    }
  });
});
</script>
