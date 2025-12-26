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
  console.log('📦 Produit:', produit);
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
          
          <!-- HEADER SIMPLE -->
          <div class="modal-header bg-light border-bottom-0">
            <h5 class="modal-title fw-bold">
              <i class="fas fa-inbox me-2 text-success"></i>Détail de la Réception
            </h5>            ${alertePeremption}

            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <!-- BODY -->
          <div class="modal-body p-4">

            <!-- ROW 1: PHOTO (LEFT) + INFOS PRODUIT (RIGHT) -->
            <div class="row g-4 mb-4">
              <!-- COL LEFT: PHOTO -->
              <div class="col-lg-4">
                <h6 class="text-uppercase text-muted fw-bold mb-3">
                  <i class="fas fa-image me-2"></i>Photo du produit
                </h6>
                <div class="card border-0 bg-light mb-4" style="cursor: pointer;" onclick="showImageLightbox('${reception.photoUrl}', '${produit.designation}')">
                  <div style="width: 100%; height: 200px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px; overflow: hidden;">
                    ${reception.photoUrl ? `<img src="${reception.photoUrl}" style="width: 100%; height: 100%; object-fit: contain;" />` : '<i class="fas fa-box" style="font-size: 80px; color: #ccc;"></i>'}
                  </div>
                  <div class="card-body text-center">
                    <small class="text-muted"><i class="fas fa-search me-1"></i>Cliquez pour agrandir</small>
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
                <div class="card border-0 bg-light">
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
                <div class="card border-0 bg-light">
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

            <!-- ROW 4: MOUVEMENTS DE STOCK -->
            <div class="row g-4 mb-4">
              <div class="col-12">
                <h6 class="text-uppercase text-muted fw-bold mb-3">
                  <i class="fas fa-arrows-alt-v me-2"></i>Mouvements de stock
                </h6>
                <div class="card border-0 bg-light">
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

            <!-- ROW 5: INFORMATIONS D'ENREGISTREMENT -->
            <div class="row g-4">
              <div class="col-md-6">
                <h6 class="text-uppercase text-muted fw-bold mb-3">
                  <i class="fas fa-user me-2"></i>Enregistrement
                </h6>
                <div class="card border-0 bg-light">
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

              <div class="col-md-6">
                <h6 class="text-uppercase text-muted fw-bold mb-3">
                  <i class="fas fa-map-location-dot me-2"></i>Localisation (Rayon)
                </h6>
                <div class="card border-0 bg-light">
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
                    <div>
                      <label class="text-muted small d-block">Description</label>
                      <p class="mb-0 small">${rayon.description || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="modal-footer bg-light border-top">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-2"></i>Fermer
            </button>
            <button type="button" class="btn btn-primary" onclick="editerReception('${reception._id}')">
              <i class="fas fa-edit me-2"></i>Modifier
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
function editerReception(receptionId) {
  showToast('⏳ Édition en développement', 'info');
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
});

console.log('✅ Module historique des réceptions chargé');
