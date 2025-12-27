// ============================================================================
// HISTORIQUE DES RÉCEPTIONS
// Affiche la liste de toutes les réceptions du magasin avec filtres
// ============================================================================

let RECEPTIONS_LIST = null;
let RECEPTIONS_DATA = [];
let CURRENT_PAGE = 1;
let ITEMS_PER_PAGE = 20;

// ✅ Attendre que MAGASIN_ID soit défini
async function waitForMagasinIdHistory(maxWait = 10000) {
  const startTime = Date.now();
  const checkInterval = 100; // vérifier toutes les 100ms
  
  while (Date.now() - startTime < maxWait) {
    if (typeof MAGASIN_ID !== 'undefined' && MAGASIN_ID) {
      console.log(`✅ MAGASIN_ID détecté: ${MAGASIN_ID}`);
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }
  
  console.warn('⏱️ Timeout: MAGASIN_ID non trouvé après 10s');
  return false;
}

// ================================
// 📊 CHARGER L'HISTORIQUE
// ================================

async function chargerHistoriqueReceptions(filters = {}) {
  try {
    // Vérifier que MAGASIN_ID est défini
    if (!MAGASIN_ID) {
      console.warn('⚠️ MAGASIN_ID non défini, attente...');
      const ready = await waitForMagasinIdHistory();
      if (!ready) {
        showToast('❌ Erreur: Magasin non sélectionné', 'danger');
        return;
      }
    }

    // Afficher le spinner ET masquer le tableau
    const spinner = document.getElementById('spinnerHistoriqueReceptions');
    const tableContainer = document.getElementById('historiqueReceptionsTable');
    if (spinner) {
      spinner.style.display = 'flex';
      spinner.style.minHeight = '300px';
      spinner.style.justifyContent = 'center';
      spinner.style.alignItems = 'center';
      console.log('📊 Spinner affiché');
    }
    if (tableContainer) {
      tableContainer.style.display = 'none';
      console.log('📊 Tableau masqué');
    }

    if (!tableContainer) {
      console.error('❌ Container historiqueReceptionsTable non trouvé');
      return;
    }

    // Construire les paramètres de recherche
    const params = new URLSearchParams({
      magasinId: MAGASIN_ID,
      limit: ITEMS_PER_PAGE,
      page: CURRENT_PAGE,
      ...filters
    });

    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const url = `${API_CONFIG.BASE_URL}/api/protected/receptions?${params}`;
    
    console.log(`📡 Fetch: ${url}`);
    console.log(`🔑 Token: ${token ? 'OK' : 'MANQUANT'}`);
    console.log(`📦 MAGASIN_ID: ${MAGASIN_ID}`);

    // Récupérer les réceptions
    const response = await fetch(url, {
      headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ API Error ${response.status}:`, errorData);
      throw new Error(`API ${response.status}: ${errorData.substring(0, 200)}`);
    }

    const data = await response.json();
    RECEPTIONS_DATA = data.receptions || data || [];

    console.log(`✅ ${RECEPTIONS_DATA.length} réceptions chargées`);
    console.log('📊 Données reçues:', data);
    console.log('📊 Stats reçues:', data.stats);

    // Masquer le spinner ET afficher le tableau
    if (spinner) {
      spinner.style.cssText = 'display: none !important; min-height: 0 !important;';
      console.log('📊 Spinner masqué avec !important');
    }
    if (tableContainer) {
      tableContainer.style.display = 'block';
      console.log('📊 Tableau affiché');
    }

    // Afficher les réceptions
    afficherHistoriqueReceptions();

    // Mettre à jour la pagination
    mettreAJourPaginationReceptions(data.total, data.pages);

    // Calculer et afficher les stats (côté frontend si nécessaire)
    let stats = data.stats;
    // Vérifier si stats est vide (objet vide {} retourne typeof === 'object')
    const statsEmpty = !stats || typeof stats !== 'object' || Object.keys(stats).length === 0;
    if (statsEmpty) {
      console.warn('⚠️ Stats vides ou non trouvées, calcul côté frontend...');
      stats = calculerStatsReceptions();
    }
    afficherStatsReceptions(stats);

    // Mettre à jour les KPIs si la fonction existe
    if (typeof updateDashboardKPIs === 'function') {
      console.log('📊 Mise à jour des KPIs...');
      await updateDashboardKPIs();
    }

  } catch (error) {
    console.error('❌ Erreur chargement historique:', error);
    
    const spinner = document.getElementById('spinnerHistoriqueReceptions');
    if (spinner) {
      spinner.style.cssText = 'display: none !important;';
      console.log('📊 Spinner masqué en cas d\'erreur');
    }
    
    const tableContainer = document.getElementById('historiqueReceptionsTable');
    if (tableContainer) {
      tableContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
          <h5><i class="fas fa-exclamation-circle"></i> Erreur de chargement</h5>
          <p>${error.message}</p>
          <small>Vérifiez les logs du navigateur (F12)</small>
        </div>
      `;
    }
    
    showToast('❌ Erreur: ' + error.message, 'danger');
  }
}

// ================================
// 🎨 AFFICHER LES RÉCEPTIONS
// ================================

function afficherHistoriqueReceptions() {
  const tableContainer = document.getElementById('historiqueReceptionsTable');
  if (!tableContainer) return;

  // Si aucune réception, afficher message
  if (RECEPTIONS_DATA.length === 0) {
    tableContainer.innerHTML = `
      <div class="alert alert-info text-center mt-4">
        <i class="fas fa-inbox"></i> Aucune réception trouvée
      </div>
    `;
    return;
  }

  // Créer le tableau HTML
  let html = `
    <div class="table-responsive">
      <table class="table table-hover table-sm">
        <thead class="table-light">
          <tr>
            <th><i class="fas fa-image"></i> Produit</th>
            <th><i class="fas fa-barcode"></i> Référence</th>
            <th><i class="fas fa-boxes"></i> Quantité</th>
            <th><i class="fas fa-euro-sign"></i> Prix Total</th>
            <th><i class="fas fa-user"></i> Fournisseur</th>
            <th><i class="fas fa-calendar"></i> Date</th>
            <th><i class="fas fa-tag"></i> Statut</th>
            <th><i class="fas fa-actions"></i> Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  RECEPTIONS_DATA.forEach((reception, index) => {
    // Essayer de récupérer le produit de plusieurs endroits
    const produit = reception.produitId || reception.produit || {};
    const dateFormatted = new Date(reception.dateReception).toLocaleDateString('fr-FR');
    const statutBadge = getStatutBadge(reception.statut);
    const prixTotal = (reception.prixTotal || 0).toFixed(2);
    
    // Utiliser photoUrl de la réception (pas de image dans produitId)
    const photoUrl = reception.photoUrl;

    html += `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            ${photoUrl ? `<img src="${photoUrl}" alt="" style="width: 35px; height: 35px; border-radius: 4px; object-fit: cover;">` : '<div style="width: 35px; height: 35px; background: #e9ecef; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-image" style="font-size: 14px; color: #999;"></i></div>'}
            <strong>${produit.designation || 'N/A'}</strong>
          </div>
        </td>
        <td><small>${produit.reference || 'N/A'}</small></td>
        <td>
          <strong>${reception.quantite}</strong>
          <small class="text-muted d-block">${produit.quantiteActuelle || 0} en stock</small>
        </td>
        <td><strong>${prixTotal}€</strong></td>
        <td>${reception.fournisseur || 'Non spécifié'}</td>
        <td><small>${dateFormatted}</small></td>
        <td>${statutBadge}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="afficherDetailReception('${reception._id}')" title="Voir détails">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  tableContainer.innerHTML = html;
}

// ================================
// 🏷️ BADGE STATUT
// ================================

function getStatutBadge(statut) {
  const badges = {
    'controle': '<span class="badge bg-warning"><i class="fas fa-hourglass-half"></i> En contrôle</span>',
    'stocke': '<span class="badge bg-success"><i class="fas fa-check-circle"></i> Stocké</span>',
    'rejete': '<span class="badge bg-danger"><i class="fas fa-times-circle"></i> Rejeté</span>'
  };
  return badges[statut] || '<span class="badge bg-secondary">Inconnu</span>';
}

// ================================
// 📄 AFFICHER DÉTAIL RÉCEPTION
// ================================

async function afficherDetailReception(receptionId) {
  try {
    console.log('📋 Ouverture détail réception:', receptionId);
    
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    // ✅ IMPORTANT: Ajouter magasinId en query param pour passer le middleware
    const url = `${API_CONFIG.BASE_URL}/api/protected/receptions/${receptionId}?magasinId=${MAGASIN_ID}`;
    
    console.log('📡 URL:', url);
    console.log('🔑 Token:', token ? '✅ Présent' : '❌ Absent');
    console.log('🏢 MAGASIN_ID:', MAGASIN_ID);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ API Error ${response.status}:`, errorData);
      throw new Error(`API ${response.status}: ${errorData.substring(0, 200)}`);
    }

    const data = await response.json();
    console.log('📊 Données reçues:', data);
    
    const reception = data.reception || data;

    // Créer et afficher un modal avec les détails
    afficherModalDetailReception(reception);

  } catch (error) {
    console.error('❌ Erreur détail:', error);
    showToast('❌ Erreur: ' + error.message, 'danger');
  }
}

// ================================
// 🪟 MODAL DÉTAIL RÉCEPTION - VERSION PREMIUM ULTRA
// ================================

function afficherModalDetailReception(reception) {
  const produit = reception.produitId || {};
  const utilisateur = reception.utilisateurId || {};
  const rayon = reception.rayonId || {};
  
  console.log('📊 Données réception reçues:', reception);
  console.log('� PhotoURL dans l\'objet:', reception.photoUrl);
  console.log('�📦 Produit:', produit);
  console.log('📁 Type Produit ID:', produit.typeProduitsId);
  
  const dateFormatted = new Date(reception.dateReception).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const datePeremption = reception.datePeremption ? new Date(reception.datePeremption).toLocaleDateString('fr-FR') : 'N/A';
  const datePeremptionClass = reception.datePeremption && new Date(reception.datePeremption) < new Date() ? 'text-danger' : '';
  const dateFabrication = reception.dateFabrication ? new Date(reception.dateFabrication).toLocaleDateString('fr-FR') : 'N/A';

  // Récupérer la catégorie - maintenant disponible directement depuis l'API
  const categorie = produit.typeProduitId?.nomType || '--';

  // Alerte péremption
  let alertePeremption = '';
  if (reception.datePeremption) {
    const jours = Math.floor((new Date(reception.datePeremption) - new Date()) / (1000 * 60 * 60 * 24));
    if (jours < 0) {
      alertePeremption = '<div class="alert alert-danger mb-4"><i class="fas fa-exclamation-triangle me-2"></i><strong>⚠️ PRODUIT PÉRIMÉ</strong></div>';
    } else if (jours < 30) {
      alertePeremption = `<div class="text-warning"><i class="fas fa-clock me-2"></i>Expire dans ${jours} jours</div>`;
    }
  }

  // Statut du stock
  const stockStatus = produit.quantiteActuelle <= 0 ? 'Rupture' : produit.quantiteActuelle <= (produit.seuilAlerte || 10) ? 'Stock faible' : 'En stock';
  const stockColor = produit.quantiteActuelle <= 0 ? 'danger' : produit.quantiteActuelle <= (produit.seuilAlerte || 10) ? 'warning' : 'success';

  const html = `
    <div class="modal fade" id="modalDetailReception" tabindex="-1">
      <div class="modal-dialog modal-xl modal-dialog-scrollable" style="max-width: 90vw;">
        <div class="modal-content shadow-xl border-0">
          
          <!-- HEADER AVEC ACTIONS EN HAUT -->
          <div class="modal-header bg-light border-bottom-0 p-3">
            <div class="d-flex align-items-start w-100 gap-2">
              <div class="flex-grow-1">
                <h5 class="modal-title fw-bold mb-1">
                  <i class="fas fa-inbox me-2 text-success"></i>Détail de la Réception
                </h5>
                ${alertePeremption}
              </div>
              <!-- BADGES ACTIONS EN HAUT À DROITE -->
              <div class="d-flex gap-2 flex-shrink-0">
                <button type="button" class="btn btn-sm btn-primary rounded-pill" onclick="editerReception('${reception._id}')" title="Modifier la réception">
                  <i class="fas fa-edit me-1"></i><span class="d-none d-sm-inline">Modifier</span>
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger rounded-pill" title="Supprimer la réception">
                  <i class="fas fa-trash me-1"></i><span class="d-none d-sm-inline">Supprimer</span>
                </button>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
            </div>
          </div>

          <!-- BODY -->
          <div class="modal-body p-4">

            <!-- ROW 1: PHOTO (LEFT) + INFOS PRODUIT (RIGHT) -->
            <div class="row g-4 mb-4">
              <!-- COL LEFT: PHOTO -->
              <div class="col-lg-4">
              
                <div class="card border-0 bg-light mb-4" style="cursor: pointer; position: relative;" onclick="showImageLightbox('${reception.photoUrl}', '${produit.designation}')">
                  <div style="width: 100%; height: 400px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px; overflow: hidden;">
                    ${reception.photoUrl ? `<img src="${reception.photoUrl}" style="width: 100%; height: 100%; object-fit: contain;" onerror="console.log('❌ Erreur chargement image:', this.src)" onload="console.log('✅ Image chargée:', this.src)" />` : '<i class="fas fa-box" style="font-size: 80px; color: #ccc;"></i>'}
                  </div>
                  <div style="position: absolute; top: 80%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none;">
                    <i class="fas fa-search" style="font-size: 48px; color: rgba(255, 255, 255, 0.8); text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);"></i>
                  </div>
                </div>
              </div>

              <!-- COL RIGHT: INFOS PRODUIT -->
              <div class="col-lg-8">
                <h6 class="text-uppercase text-muted fw-bold mb-3">
                  <i class="fas fa-box me-2"></i>Informations du produit
                </h6>
                <div class="">
                  <div class="card-body">
                    <div class="row mb-3">
                      <div class="col-12 mb-3">
                        <label class="text-muted small d-block">Produit</label>
                        <h5 class="mb-0">${produit.designation || '--'}</h5>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label class="text-muted small d-block">Référence</label>
                        <p class="mb-0 fw-bold">${produit.reference || '--'}</p>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label class="text-muted small d-block">Catégorie</label>
                        <p class="mb-0">${categorie}</p>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label class="text-muted small d-block">Fournisseur</label>
                        <p class="mb-0">${reception.fournisseur || 'Non spécifié'}</p>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label class="text-muted small d-block">État</label>
                        <p class="mb-0"><span class="badge bg-info">${produit.etat || 'Neuf'}</span></p>
                      </div>
                    </div>
                    <hr>
                    <div class="row">
                      <div class="col-md-6 mb-2">
                        <label class="text-muted small d-block">Prix achat</label>
                        <h5 class="text-primary">${(reception.prixAchat || 0).toFixed(2)}€</h5>
                      </div>
                      <div class="col-md-6 mb-2">
                        <label class="text-muted small d-block">Prix de vente (unité)</label>
                        <h5 class="text-success">${(produit.prixUnitaire || 0).toFixed(2)}€</h5>
                      </div>
                      <div class="col-md-12">
                        <label class="text-muted small d-block">Emplacement (Rayon)</label>
                        <p class="mb-0"><strong>${rayon.nomRayon || '--'}</strong> <small class="text-muted">(${rayon.codeRayon || '--'})</small></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ROW 2: KPIs STOCK -->
            <div class="row g-3 mb-4">
              <div class="col-lg-3 col-md-6">
                <div class="card border-0 shadow-sm bg-light h-100">
                  <div class="card-body text-center">
                    <i class="fas fa-boxes" style="font-size: 28px; color: #0dcaf0;" class="mb-3"></i>
                    <h5 class="card-title mb-1">${produit.quantiteActuelle || 0}</h5>
                    <p class="text-muted small mb-2">Stock actuel</p>
                    <span class="badge bg-${stockColor} p-2">${stockStatus}</span>
                  </div>
                </div>
              </div>
              <div class="col-lg-3 col-md-6">
                <div class="card border-0 shadow-sm bg-light h-100">
                  <div class="card-body text-center">
                    <i class="fas fa-arrow-down" style="font-size: 28px; color: #ffc107;" class="mb-3"></i>
                    <h5 class="card-title mb-1">${produit.seuilAlerte || 10}</h5>
                    <p class="text-muted small mb-2">Stock minimum</p>
                    ${produit.quantiteActuelle <= (produit.seuilAlerte || 10) ? '<small class="badge bg-danger"><i class="fas fa-warning me-1"></i>Alerte</small>' : '<small class="badge bg-success">OK</small>'}
                  </div>
                </div>
              </div>
              <div class="col-lg-3 col-md-6">
                <div class="card border-0 shadow-sm bg-light h-100">
                  <div class="card-body text-center">
                    <i class="fas fa-euro-sign" style="font-size: 28px; color: #28a745;" class="mb-3"></i>
                    <h5 class="card-title mb-1">${((produit.quantiteActuelle || 0) * (produit.prixUnitaire || 0)).toFixed(0)}€</h5>
                    <p class="text-muted small mb-0">Valeur en stock</p>
                  </div>
                </div>
              </div>
              <div class="col-lg-3 col-md-6">
                <div class="card border-0 shadow-sm bg-light h-100">
                  <div class="card-body text-center">
                    <i class="fas fa-exclamation-circle" style="font-size: 28px; color: ${produit.quantiteActuelle <= 0 ? '#dc3545' : '#6c757d'};" class="mb-3"></i>
                    <h5 class="card-title mb-1">${produit.quantiteActuelle <= 0 ? 'OUI' : 'NON'}</h5>
                    <p class="text-muted small mb-0">Rupture de stock</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- ROW 3: CARACTÉRISTIQUES & STATS DE VENTE -->
            <div class="row g-4 mb-4">
              <div class="col-lg-6">
                <h6 class="text-uppercase text-muted fw-bold mb-3">
                  <i class="fas fa-cogs me-2"></i>Caractéristiques
                </h6>
                <div class="">
                  <div class="card-body">
                    <div class="mb-3">
                      <label class="text-muted small d-block">Unité principale</label>
                      <p class="mb-0 fw-bold">${produit.typeProduitId?.unitePrincipale || '--'}</p>
                    </div>
                    <div class="mb-3">
                      <label class="text-muted small d-block">Type de produit</label>
                      <p class="mb-0">${produit.typeProduitId?.nomType || '--'}</p>
                    </div>
                    <div class="mb-3">
                      <label class="text-muted small d-block">Date de péremption</label>
                      <p class="mb-0"><strong class="${datePeremptionClass}">${datePeremption}</strong></p>
                    </div>
                    <div>
                      <label class="text-muted small d-block">Lot/Série</label>
                      <p class="mb-0">${reception.lotNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-6">
                <h6 class="text-uppercase text-muted fw-bold mb-3">
                  <i class="fas fa-chart-line me-2"></i>Réception & Statut
                </h6>
                <div class=" bg-light">
                  <div class="card-body">
                    <div class="mb-3">
                      <label class="text-muted small d-block">Quantité reçue</label>
                      <h5 class="mb-0">${reception.quantite}</h5>
                    </div>
                    <div class="mb-3">
                      <label class="text-muted small d-block">Date réception</label>
                      <p class="mb-0">${dateFormatted}</p>
                    </div>
                    <div class="mb-3">
                      <label class="text-muted small d-block">Valeur totale réception</label>
                      <h5 class="text-success mb-0">${(reception.prixTotal || 0).toFixed(2)}€</h5>
                    </div>
                    <div>
                      <label class="text-muted small d-block">Statut contrôle</label>
                      ${getStatutBadge(reception.statut)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ROW 4: STATISTIQUES DE VENTE -->
            <div class="row g-4 mb-4">
              <div class="col-12">
                <h6 class="text-uppercase text-muted fw-bold mb-3">
                  <i class="fas fa-chart-bar me-2"></i>Statistiques de vente
                </h6>
                <div class="alert alert-info" id="alerteStatsVente">
                  <i class="fas fa-info-circle me-2"></i>
                  Les données de vente seront disponibles une fois le système de vente implémenté.
                </div>
                <div class="row g-3" id="statsVenteContainer">
                  <!-- Les stats de vente s'afficheront ici -->
                  <div class="col-lg-3 col-md-6">
                    <div class="card border-0 shadow-sm bg-light h-100">
                      <div class="card-body text-center">
                        <i class="fas fa-shopping-cart" style="font-size: 28px; color: #0dcaf0;" class="mb-3"></i>
                        <h5 class="card-title mb-1">--</h5>
                        <p class="text-muted small mb-0">Nombre de ventes</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-6">
                    <div class="card border-0 shadow-sm bg-light h-100">
                      <div class="card-body text-center">
                        <i class="fas fa-boxes" style="font-size: 28px; color: #28a745;" class="mb-3"></i>
                        <h5 class="card-title mb-1">--</h5>
                        <p class="text-muted small mb-0">Quantité vendue</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-6">
                    <div class="card border-0 shadow-sm bg-light h-100">
                      <div class="card-body text-center">
                        <i class="fas fa-euro-sign" style="font-size: 28px; color: #ffc107;" class="mb-3"></i>
                        <h5 class="card-title mb-1">--€</h5>
                        <p class="text-muted small mb-0">Revenu généré</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-6">
                    <div class="card border-0 shadow-sm bg-light h-100">
                      <div class="card-body text-center">
                        <i class="fas fa-tachometer-alt" style="font-size: 28px; color: #6f42c1;" class="mb-3"></i>
                        <h5 class="card-title mb-1">--</h5>
                        <p class="text-muted small mb-0">Taux rotation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ROW 5: MOUVEMENTS DE STOCK (COLLAPSIBLE) -->
            <div class="row g-4 mb-4">
              <div class="col-12">
                <div class="card border-0 bg-light">
                  <div class="card-header bg-white border-bottom cursor-pointer" data-bs-toggle="collapse" data-bs-target="#collapseMovements" style="cursor: pointer;">
                    <h6 class="mb-0 text-uppercase text-muted fw-bold">
                      <i class="fas fa-chevron-right me-2"></i>
                      <i class="fas fa-arrows-alt-v me-2"></i>Mouvements de stock
                    </h6>
                  </div>
                  <div id="collapseMovements" class="collapse show">
                    <div class="card-body">
                      <div class="table-responsive">
                        <table class="table table-sm table-hover mb-0">
                          <thead class="table-light">
                            <tr>
                              <th><i class="fas fa-calendar"></i> Date</th>
                              <th><i class="fas fa-exchange-alt"></i> Type</th>
                              <th><i class="fas fa-boxes"></i> Quantité</th>
                              <th><i class="fas fa-info-circle"></i> Détails</th>
                            </tr>
                          </thead>
                          <tbody id="mouvementsTableBody">
                            <tr>
                              <td>${dateFormatted}</td>
                              <td><span class="badge bg-success"><i class="fas fa-arrow-down me-1"></i>Entrée</span></td>
                              <td><strong>${reception.quantite}</strong></td>
                              <td><small class="text-muted">Réception fournisseur</small></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div class="mt-2">
                        <small class="text-muted"><i class="fas fa-info-circle me-1"></i>Affichage du dernier mouvement. Voir l'historique complet dans l'onglet Mouvements.</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ROW 6: INFORMATIONS D'ENREGISTREMENT & LOCALISATION RAYON -->
            <div class="row g-4">
              <!-- ENREGISTREMENT (COLLAPSIBLE) -->
              <div class="col-md-6">
                <div class="bg-light h-100">
                  <div class="card-header bg-white border-bottom cursor-pointer" data-bs-toggle="collapse" data-bs-target="#collapseEnregistrement" style="cursor: pointer;">
                    <h6 class="mb-0 text-uppercase text-muted fw-bold">
                      <i class="fas fa-chevron-right me-2"></i>
                      <i class="fas fa-user me-2"></i>Enregistrement
                    </h6>
                  </div>
                  <div id="collapseEnregistrement" class="collapse">
                    <div class="card-body">
                      <div class="mb-2">
                        <small class="text-muted d-block">Enregistré par</small>
                        <strong>${utilisateur.prenom || ''} ${utilisateur.nom || ''}</strong>
                      </div>
                      <div class="mb-2">
                        <small class="text-muted d-block">Créé le</small>
                        <small>${new Date(reception.createdAt).toLocaleString('fr-FR')}</small>
                      </div>
                      <div>
                        <small class="text-muted d-block">Mis à jour</small>
                        <small>${new Date(reception.updatedAt).toLocaleString('fr-FR')}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- LOCALISATION RAYON (EXPANDABLE POUR DESCRIPTION) -->
              <div class="col-md-6">
                <h6 class="text-uppercase text-muted fw-bold mb-3">
                  <i class="fas fa-map-location-dot me-2"></i>Localisation (Rayon)
                </h6>
                <div class="bg-light">
                  <div class="card-body">
                    <div class="mb-3">
                      <label class="text-muted small d-block">Rayon</label>
                      <h5 class="mb-0">${rayon.iconeRayon || '📦'} ${rayon.nomRayon || '--'}</h5>
                    </div>
                    <div class="mb-3">
                      <label class="text-muted small d-block">Code & Type</label>
                      <p class="mb-0"><strong>${rayon.codeRayon || '--'}</strong> • <span class="badge bg-secondary">${rayon.typeRayon || '--'}</span></p>
                    </div>
                    <div class="mb-3">
                      <label class="text-muted small d-block">Capacité du rayon</label>
                      <div class="progress" style="height: 24px;">
                        <div class="progress-bar bg-info fw-bold" style="width: ${Math.min(((rayon.quantiteActuelle || 0) / (rayon.capaciteMax || 100)) * 100, 100)}%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">
                          ${rayon.quantiteActuelle || 0}/${rayon.capaciteMax || '--'}
                        </div>
                      </div>
                    </div>
                    ${rayon.description ? `
                    <div>
                      <div class="btn-group w-100" role="group">
                        <input type="radio" class="btn-check" name="rayonInfo" id="rayonBasic" checked>
                        <label class="btn btn-sm btn-outline-secondary" for="rayonBasic">Basique</label>
                        <input type="radio" class="btn-check" name="rayonInfo" id="rayonDetails">
                        <label class="btn btn-sm btn-outline-secondary" for="rayonDetails">Détails</label>
                      </div>
                      <div id="rayonDetailsContent" class="mt-2" style="display: none;">
                        <small class="text-muted d-block mb-2"><strong>Description:</strong></small>
                        <p class="mb-0 small">${rayon.description}</p>
                      </div>
                    </div>
                    <script>
                      document.getElementById('rayonBasic')?.addEventListener('change', function() {
                        document.getElementById('rayonDetailsContent').style.display = 'none';
                      });
                      document.getElementById('rayonDetails')?.addEventListener('change', function() {
                        document.getElementById('rayonDetailsContent').style.display = 'block';
                      });
                    </script>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- FOOTER SIMPLE -->
          <div class="modal-footer bg-light border-top">
            <small class="text-muted me-auto"><i class="fas fa-info-circle me-1"></i>Actions disponibles en haut de la modal</small>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-2"></i>Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Injecter et afficher le modal
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const modal = tempDiv.querySelector('.modal');
  document.body.appendChild(modal);

  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();

  // 📊 Essayer de charger les stats de vente si l'API est disponible
  if (typeof chargerStatsVente === 'function') {
    console.log('📊 Tentative de chargement des stats de vente pour:', produit._id);
    chargerStatsVente(produit._id).catch(err => {
      console.log('ℹ️ Pas de stats de vente disponibles encore (API en développement)');
    });
  }

  // Nettoyer après fermeture
  modal.addEventListener('hidden.bs.modal', () => {
    modal.remove();
  });
}

// Lightbox
function showImageLightbox(url, title) {
  if (!url) {
    showToast('Pas d\'image disponible', 'info');
    return;
  }
  const img = document.getElementById('lightboxImage');
  if (img) {
    img.src = url;
    new bootstrap.Modal(document.getElementById('imageLightbox')).show();
  }
}

// Éditer réception
async function editerReception(receptionId) {
  try {
    // Récupérer les données actuelles de la réception
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const url = `${API_CONFIG.BASE_URL}/api/protected/receptions/${receptionId}?magasinId=${MAGASIN_ID}`;
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Erreur chargement réception');
    
    const data = await response.json();
    const reception = data.reception || data;
    
    afficherModalEditReception(reception);
  } catch (error) {
    console.error('❌ Erreur:', error);
    showToast('❌ Erreur: ' + error.message, 'danger');
  }
}

// Modal d'édition réception
function afficherModalEditReception(reception) {
  const dateFormatted = reception.dateReception ? new Date(reception.dateReception).toISOString().split('T')[0] : '';
  const datePeremption = reception.datePeremption ? new Date(reception.datePeremption).toISOString().split('T')[0] : '';
  const dateFabrication = reception.dateFabrication ? new Date(reception.dateFabrication).toISOString().split('T')[0] : '';

  const html = `
    <div class="modal fade" id="modalEditReception" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable" style="max-width: 600px;">
        <div class="modal-content shadow-xl border-0">
          
          <!-- HEADER AVEC ACTIONS -->
          <div class="modal-header bg-light border-bottom-0 p-3">
            <div class="d-flex align-items-start w-100 gap-2">
              <div class="flex-grow-1">
                <h5 class="modal-title fw-bold mb-1">
                  <i class="fas fa-edit me-2 text-primary"></i>Modifier la réception
                </h5>
                <small class="text-muted">Mettez à jour les informations de cette réception</small>
              </div>
              <div class="d-flex gap-2 flex-shrink-0">
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
            </div>
          </div>

          <!-- BODY -->
          <div class="modal-body p-4">
            <form id="formEditReception">
              
              <!-- ROW 1: QUANTITÉ & FOURNISSEUR -->
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Quantité reçue</label>
                  <input type="number" class="form-control" id="editQuantite" value="${reception.quantite}" min="1" required>
                  <small class="text-muted">Nombre d'unités reçues</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Fournisseur</label>
                  <input type="text" class="form-control" id="editFournisseur" value="${reception.fournisseur || ''}">
                  <small class="text-muted">Nom du fournisseur</small>
                </div>
              </div>

              <!-- ROW 2: PRIX ACHAT & PRIX TOTAL -->
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Prix achat (unitaire)</label>
                  <input type="number" class="form-control" id="editPrixAchat" value="${reception.prixAchat || 0}" step="0.01" min="0" required>
                  <small class="text-muted">Prix par unité</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Prix total réception</label>
                  <div class="input-group">
                    <input type="number" class="form-control" id="editPrixTotal" value="${reception.prixTotal || 0}" step="0.01" min="0" required>
                    <span class="input-group-text">€</span>
                  </div>
                  <small class="text-muted">Calcul automatique: Quantité × Prix</small>
                </div>
              </div>

              <!-- ROW 3: DATES -->
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Date réception</label>
                  <input type="date" class="form-control" id="editDateReception" value="${dateFormatted}" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Date péremption</label>
                  <input type="date" class="form-control" id="editDatePeremption" value="${datePeremption}">
                  <small class="text-muted">Optionnel</small>
                </div>
              </div>

              <!-- ROW 4: LOT & FABRICATION -->
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Lot/Série</label>
                  <input type="text" class="form-control" id="editLotNumber" value="${reception.lotNumber || ''}">
                  <small class="text-muted">Numéro de lot</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Date fabrication</label>
                  <input type="date" class="form-control" id="editDateFabrication" value="${dateFabrication}">
                  <small class="text-muted">Optionnel</small>
                </div>
              </div>

              <!-- ROW 5: PHOTO DE LA RÉCEPTION -->
              <div class="mb-4">
                <label class="form-label fw-bold d-block">Photo de la réception</label>
                <div class="text-center">
                  <div style="position: relative; display: inline-block;">
                    <img id="photoPreviewEdit" src="${reception.photoUrl || 'assets/img/team/user_prof.svg'}" class="mb-2" style="width: 150px; height: 150px; object-fit: cover; border: 1px solid rgba(0,0,0,0.08);" alt="Photo" />
                    <button type="button" id="photoUploadBtn" class="btn btn-sm btn-secondary" style="position: absolute; right: 0; bottom: 0; border-radius: 50%; padding: 8px 10px;">
                      <i class="fas fa-camera"></i>
                    </button>
                  </div>
                  <input id="editPhotoFile" type="file" accept="image/*" style="display: none;" />
                  <small class="text-muted d-block mt-2"><i class="fas fa-info-circle"></i> JPG, PNG, WebP (max 5MB)</small>
                </div>
              </div>

              <!-- ROW 6: STATUT -->
              <div class="mb-4">
                <label class="form-label fw-bold">Statut contrôle</label>
                <select class="form-select" id="editStatut" required>
                  <option value="controle" ${reception.statut?.toLowerCase() === 'controle' ? 'selected' : ''}>En attente de contrôle</option>
                  <option value="stocke" ${reception.statut?.toLowerCase() === 'stocke' ? 'selected' : ''}>Contrôlé & Stocké</option>
                  <option value="rejete" ${reception.statut?.toLowerCase() === 'rejete' ? 'selected' : ''}>Rejeté</option>
                </select>
              </div>

            </form>
          </div>

          <!-- FOOTER -->
          <div class="modal-footer bg-light border-top">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-2"></i>Annuler
            </button>
            <button type="button" class="btn btn-primary" onclick="sauvegarderReception('${reception._id}')">
              <i class="fas fa-save me-2"></i>Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Injecter et afficher le modal
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const modal = tempDiv.querySelector('.modal');
  document.body.appendChild(modal);

  // Calculer automatiquement le prix total
  const quantiteInput = modal.querySelector('#editQuantite');
  const prixAchatInput = modal.querySelector('#editPrixAchat');
  const prixTotalInput = modal.querySelector('#editPrixTotal');

  const calculerPrixTotal = () => {
    const q = parseFloat(quantiteInput.value) || 0;
    const p = parseFloat(prixAchatInput.value) || 0;
    prixTotalInput.value = (q * p).toFixed(2);
  };

  quantiteInput.addEventListener('change', calculerPrixTotal);
  prixAchatInput.addEventListener('change', calculerPrixTotal);

  // Ajouter la logique de preview photo
  const photoFileInput = modal.querySelector('#editPhotoFile');
  const photoPreviewImg = modal.querySelector('#photoPreviewEdit');
  const photoUploadBtn = modal.querySelector('#photoUploadBtn');
  let photoFileSelected = null;

  // Au clic sur le bouton caméra
  if (photoUploadBtn) {
    photoUploadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      photoFileInput?.click();
    });
  }

  if (photoFileInput) {
    photoFileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        // Valider la taille
        if (file.size > 5 * 1024 * 1024) {
          showToast('❌ La photo ne doit pas dépasser 5MB', 'danger');
          this.value = '';
          return;
        }

        // Afficher la preview
        const reader = new FileReader();
        reader.onload = function(event) {
          photoPreviewImg.src = event.target.result;
          photoFileSelected = file;
          console.log('📸 Photo sélectionnée:', file.name);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();

  modal.addEventListener('hidden.bs.modal', () => {
    modal.remove();
  });
}

// Sauvegarder les modifications de réception
async function sauvegarderReception(receptionId) {
  try {
    console.log('💾 Début sauvegarde réception...');
    console.log('📦 MAGASIN_ID:', MAGASIN_ID);

    const quantite = document.getElementById('editQuantite').value;
    const prixAchat = document.getElementById('editPrixAchat').value;
    const prixTotal = document.getElementById('editPrixTotal').value;
    const dateReception = document.getElementById('editDateReception').value;
    const datePeremption = document.getElementById('editDatePeremption').value;
    const lotNumber = document.getElementById('editLotNumber').value;
    const dateFabrication = document.getElementById('editDateFabrication').value;
    const statut = document.getElementById('editStatut').value;
    const fournisseur = document.getElementById('editFournisseur').value;
    const photoFileInput = document.getElementById('editPhotoFile');

    console.log('🔍 Vérification élément file input:');
    console.log('   photoFileInput existe?', !!photoFileInput);
    console.log('   photoFileInput.files?', !!photoFileInput?.files);
    console.log('   photoFileInput.files.length?', photoFileInput?.files?.length);
    if (photoFileInput?.files?.length > 0) {
      console.log('   Fichier trouvé:', photoFileInput.files[0].name, photoFileInput.files[0].size, 'bytes');
    }

    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    // ⚠️ Ajouter magasinId en query parameter pour le middleware
    const url = `${API_CONFIG.BASE_URL}/api/protected/receptions/${receptionId}?magasinId=${MAGASIN_ID}`;

    // Créer FormData pour pouvoir envoyer la photo
    const formData = new FormData();
    
    // Ajouter tous les champs (même vides) pour que FormData les récupère
    formData.append('quantite', quantite || '');
    formData.append('prixAchat', prixAchat || '');
    formData.append('prixTotal', prixTotal || '');
    formData.append('dateReception', dateReception || '');
    if (datePeremption) formData.append('datePeremption', datePeremption);
    formData.append('lotNumber', lotNumber || '');
    if (dateFabrication) formData.append('dateFabrication', dateFabrication);
    formData.append('statut', statut || 'controle');
    formData.append('fournisseur', fournisseur || '');
    
    // ⚠️ AUSSI ajouter magasinId en FormData pour le handler
    console.log('📝 Ajout magasinId:', MAGASIN_ID);
    formData.append('magasinId', MAGASIN_ID);

    // Si une photo a été sélectionnée, l'ajouter au FormData
    if (photoFileInput && photoFileInput.files.length > 0) {
      console.log('📸 Photo sélectionnée:', photoFileInput.files[0].name);
      formData.append('photo', photoFileInput.files[0]);
    }

    console.log('📤 Envoi FormData vers:', url);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
        // ⚠️ NE PAS ajouter 'Content-Type': 'application/json'
        // Le navigateur définira 'multipart/form-data' automatiquement
      },
      body: formData
    });

    console.log('📥 Réponse status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erreur réponse (status ' + response.status + '):', error);
      throw new Error(error);
    }

    const responseData = await response.json();
    console.log('📊 Données réponse:', responseData);
    
    const updatedReception = responseData.reception;
    console.log('✅ Réception mise à jour reçue:', updatedReception?._id);

    showToast('✅ Réception modifiée avec succès', 'success');
    
    // Fermer le modal d'édition
    const modalEdit = bootstrap.Modal.getInstance(document.getElementById('modalEditReception'));
    if (modalEdit) modalEdit.hide();

    // Fermer aussi le modal détail (s'il est ouvert)
    const modalDetail = bootstrap.Modal.getInstance(document.getElementById('modalDetailReception'));
    if (modalDetail) modalDetail.hide();

    // Recharger l'historique
    console.log('🔄 Rechargement historique...');
    await chargerHistoriqueReceptions();

    // Rouvrir le modal détail avec les données mises à jour
    setTimeout(() => {
      if (updatedReception) {
        afficherModalDetailReception(updatedReception);
      }
    }, 500);

  } catch (error) {
    console.error('❌ Erreur sauvegarde:', error);
    showToast('❌ Erreur: ' + error.message, 'danger');
  }
}

// ================================
// 📊 AFFICHER STATS DE VENTE
// ================================

function afficherStatsVente(produitId, statsVente) {
  const container = document.getElementById('statsVenteContainer');
  const alerte = document.getElementById('alerteStatsVente');
  
  if (!statsVente || Object.keys(statsVente).length === 0) {
    // Pas de données - laisser le message par défaut
    return;
  }

  // Masquer l'alerte d'info
  if (alerte) {
    alerte.style.display = 'none';
  }

  const {
    nombreVentes = 0,
    quantiteVendue = 0,
    revenuGenere = 0,
    tauxRotation = 0,
    articleLesPlus = '--'
  } = statsVente;

  const html = `
    <div class="col-lg-3 col-md-6">
      <div class="card border-0 shadow-sm bg-light h-100">
        <div class="card-body text-center">
          <i class="fas fa-shopping-cart" style="font-size: 28px; color: #0dcaf0;" class="mb-3"></i>
          <h5 class="card-title mb-1">${nombreVentes}</h5>
          <p class="text-muted small mb-0">Nombre de ventes</p>
        </div>
      </div>
    </div>
    <div class="col-lg-3 col-md-6">
      <div class="card border-0 shadow-sm bg-light h-100">
        <div class="card-body text-center">
          <i class="fas fa-boxes" style="font-size: 28px; color: #28a745;" class="mb-3"></i>
          <h5 class="card-title mb-1">${quantiteVendue}</h5>
          <p class="text-muted small mb-0">Quantité vendue</p>
        </div>
      </div>
    </div>
    <div class="col-lg-3 col-md-6">
      <div class="card border-0 shadow-sm bg-light h-100">
        <div class="card-body text-center">
          <i class="fas fa-euro-sign" style="font-size: 28px; color: #ffc107;" class="mb-3"></i>
          <h5 class="card-title mb-1">${revenuGenere.toFixed(2)}€</h5>
          <p class="text-muted small mb-0">Revenu généré</p>
        </div>
      </div>
    </div>
    <div class="col-lg-3 col-md-6">
      <div class="card border-0 shadow-sm bg-light h-100">
        <div class="card-body text-center">
          <i class="fas fa-tachometer-alt" style="font-size: 28px; color: #6f42c1;" class="mb-3"></i>
          <h5 class="card-title mb-1">${tauxRotation.toFixed(2)}</h5>
          <p class="text-muted small mb-0">Taux rotation</p>
        </div>
      </div>
    </div>
  `;

  if (container) {
    container.innerHTML = html;
  }

  console.log('📊 Stats de vente affichées pour produit:', produitId, statsVente);
}

// ================================
// 📊 CALCULER STATS (Frontend)
// ================================

function normalizeStatut(statut) {
  if (!statut) return 'controle';
  const lower = statut.toLowerCase().trim();
  
  // Mapping pour normaliser différentes variations
  if (lower.includes('stocke') || lower.includes('stocké')) return 'stocke';
  if (lower.includes('controle') || lower.includes('contrôle')) return 'controle';
  if (lower.includes('rejete') || lower.includes('rejeté')) return 'rejete';
  
  return 'controle';
}

function calculerStatsReceptions() {
  const stats = {
    controle: { count: 0, totalQuantite: 0, totalPrix: 0 },
    stocke: { count: 0, totalQuantite: 0, totalPrix: 0 },
    rejete: { count: 0, totalQuantite: 0, totalPrix: 0 }
  };

  console.log('📊 Calcul stats - RECEPTIONS_DATA:', RECEPTIONS_DATA);
  console.log('📊 Nombre de réceptions:', RECEPTIONS_DATA.length);

  RECEPTIONS_DATA.forEach((reception, index) => {
    const statut = normalizeStatut(reception.statut);
    const quantite = reception.quantite || 0;
    const prix = reception.prixTotal || 0;

    console.log(`📊 Réception ${index}:`, { statut: reception.statut, normalized: statut, quantite, prix });

    if (!stats[statut]) {
      stats[statut] = { count: 0, totalQuantite: 0, totalPrix: 0 };
    }

    stats[statut].count++;
    stats[statut].totalQuantite += quantite;
    stats[statut].totalPrix += prix;
  });

  console.log('📊 Stats calculées côté frontend:', stats);
  return stats;
}

// ================================
// 📊 AFFICHER STATS
// ================================

function afficherStatsReceptions(stats) {
  const statsContainer = document.getElementById('statsReceptions');
  if (!statsContainer) return;

  // Sécurité: vérifier que stats existe
  if (!stats || typeof stats !== 'object') {
    console.warn('⚠️ Stats vide, affichage de 0');
    stats = {
      controle: { count: 0, totalQuantite: 0, totalPrix: 0 },
      stocke: { count: 0, totalQuantite: 0, totalPrix: 0 },
      rejete: { count: 0, totalQuantite: 0, totalPrix: 0 }
    };
  }

  const controle = stats.controle || { count: 0, totalQuantite: 0, totalPrix: 0 };
  const stocke = stats.stocke || { count: 0, totalQuantite: 0, totalPrix: 0 };
  const rejete = stats.rejete || { count: 0, totalQuantite: 0, totalPrix: 0 };

  console.log('📊 Affichage stats:', { controle, stocke, rejete });

  const html = `
    <div class="row">
      <div class="col-md-4">
        <div class="card border-warning">
          <div class="card-body text-center">
            <h6 class="text-muted mb-2"><i class="fas fa-hourglass-half text-warning"></i> En contrôle</h6>
            <h3 class="text-warning">${controle.count || 0}</h3>
            <small class="text-muted d-block">${controle.totalQuantite || 0} articles</small>
            <small class="text-muted">${(controle.totalPrix || 0).toFixed(2)}€</small>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-success">
          <div class="card-body text-center">
            <h6 class="text-muted mb-2"><i class="fas fa-check-circle text-success"></i> Stocké</h6>
            <h3 class="text-success">${stocke.count || 0}</h3>
            <small class="text-muted d-block">${stocke.totalQuantite || 0} articles</small>
            <small class="text-muted">${(stocke.totalPrix || 0).toFixed(2)}€</small>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-danger">
          <div class="card-body text-center">
            <h6 class="text-muted mb-2"><i class="fas fa-times-circle text-danger"></i> Rejeté</h6>
            <h3 class="text-danger">${rejete.count || 0}</h3>
            <small class="text-muted d-block">${rejete.totalQuantite || 0} articles</small>
            <small class="text-muted">${(rejete.totalPrix || 0).toFixed(2)}€</small>
          </div>
        </div>
      </div>
    </div>
  `;

  statsContainer.innerHTML = html;
}

// ================================
// 🔍 FILTRER LES RÉCEPTIONS
// ================================

function filtrerReceptions() {
  const statut = document.getElementById('filterStatutReception')?.value || '';
  const fournisseur = document.getElementById('filterFournisseur')?.value || '';
  const dateDebut = document.getElementById('filterDateDebut')?.value || '';
  const dateFin = document.getElementById('filterDateFin')?.value || '';

  CURRENT_PAGE = 1;

  const filters = {};
  if (statut) filters.statut = statut;
  if (fournisseur) filters.fournisseur = fournisseur;
  if (dateDebut) filters.dateDebut = dateDebut;
  if (dateFin) filters.dateFin = dateFin;

  chargerHistoriqueReceptions(filters);
}

// ================================
// ⬅️ RÉINITIALISER FILTRES
// ================================

function reinitialiserFiltres() {
  document.getElementById('filterStatutReception').value = '';
  document.getElementById('filterFournisseur').value = '';
  document.getElementById('filterDateDebut').value = '';
  document.getElementById('filterDateFin').value = '';

  CURRENT_PAGE = 1;
  chargerHistoriqueReceptions();
}

// ================================
// 📖 PAGINATION
// ================================

function mettreAJourPaginationReceptions(total, pages) {
  const paginationContainer = document.getElementById('paginationReceptions');
  if (!paginationContainer) return;

  let html = '';

  // Bouton précédent
  if (CURRENT_PAGE > 1) {
    html += `<button class="btn btn-sm btn-outline-secondary" onclick="changerPageReception(${CURRENT_PAGE - 1})"><i class="fas fa-chevron-left"></i> Précédent</button>`;
  }

  // Pages
  for (let i = 1; i <= Math.min(pages, 5); i++) {
    const active = i === CURRENT_PAGE ? 'active' : '';
    html += `<button class="btn btn-sm btn-outline-secondary ${active}" onclick="changerPageReception(${i})">${i}</button>`;
  }

  // Bouton suivant
  if (CURRENT_PAGE < pages) {
    html += `<button class="btn btn-sm btn-outline-secondary" onclick="changerPageReception(${CURRENT_PAGE + 1})">Suivant <i class="fas fa-chevron-right"></i></button>`;
  }

  html += `<span class="ms-2 text-muted small">Page ${CURRENT_PAGE}/${pages} (${total} réceptions)</span>`;

  paginationContainer.innerHTML = html;
}

function changerPageReception(page) {
  CURRENT_PAGE = page;
  chargerHistoriqueReceptions();
}

// ================================
// 🔄 RAFRAÎCHISSEMENT AUTO
// ================================

window.addEventListener('magasinChanged', () => {
  console.log('🔄 Magasin changé - Rafraîchissement historique');
  CURRENT_PAGE = 1;
  chargerHistoriqueReceptions();
});

// Rafraîchir quand le modal des réceptions est montré
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initialisation historique des réceptions');
  
  // Attendre que le magasin soit sélectionné
  const ready = await waitForMagasinIdHistory();
  if (!ready) {
    console.error('❌ Impossible de charger l\'historique: MAGASIN_ID non défini');
    return;
  }

  console.log('✅ MAGASIN_ID prêt, ajout listeners...');

  // Écouter les clics sur l'onglet historique
  const tabHistorique = document.getElementById('tabHistoriqueReceptions');
  if (tabHistorique) {
    console.log('✅ Tab historique trouvé');
    tabHistorique.addEventListener('shown.bs.tab', function(e) {
      console.log('📑 Tab historique affiché');
      chargerHistoriqueReceptions();
    });
  } else {
    console.warn('⚠️ Tab historique non trouvé');
  }

  // Écouter quand la modal s'ouvre
  const modal = document.getElementById('modalReception');
  if (modal) {
    modal.addEventListener('shown.bs.modal', () => {
      console.log('📦 Modal réception ouverte');
      // Vérifier si l'onglet historique est actif
      const tabHistorique = document.getElementById('tabHistoriqueReceptions');
      if (tabHistorique && tabHistorique.classList.contains('active')) {
        console.log('📊 Historique est actif, chargement...');
        chargerHistoriqueReceptions();
      }
    });
  }

  // Ajouter les event listeners aux filtres
  const filterStatut = document.getElementById('filterStatutReception');
  const filterFournisseur = document.getElementById('filterFournisseur');
  const filterDateDebut = document.getElementById('filterDateDebut');
  const filterDateFin = document.getElementById('filterDateFin');

  if (filterStatut) {
    filterStatut.addEventListener('change', filtrerReceptions);
    console.log('✅ Event listener ajouté à filterStatut');
  }
  if (filterFournisseur) {
    filterFournisseur.addEventListener('input', filtrerReceptions);
    console.log('✅ Event listener ajouté à filterFournisseur');
  }
  if (filterDateDebut) {
    filterDateDebut.addEventListener('change', filtrerReceptions);
    console.log('✅ Event listener ajouté à filterDateDebut');
  }
  if (filterDateFin) {
    filterDateFin.addEventListener('change', filtrerReceptions);
    console.log('✅ Event listener ajouté à filterDateFin');
  }
});

console.log('✅ Module historique des réceptions chargé');
