<!-- ========================================================================
     MODAL DÉTAIL PRODUIT - VERSION PREMIUM
     Design moderne avec toutes les informations du produit
     ======================================================================== -->
<div class="modal fade" id="modalProductDetail" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-scrollable" style="max-width: 95vw;">
    <div class="modal-content shadow-xl border-0">
      
      <!-- ========== HEADER PREMIUM ========== -->
      <div class="modal-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; padding: 0;">
        <div class="w-100 p-4 text-white">
          <div class="row align-items-center">
            <!-- Photo du produit -->
            <div class="col-md-3 text-center">
              <div style="width: 120px; height: 120px; background: rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; margin: 0 auto; border: 3px solid rgba(255,255,255,0.3);">
                <img id="detailProductPhotoHeader" src="" alt="Photo" style="width: 100%; height: 100%; object-fit: cover; display: none;" />
                <div id="detailPhotoFallbackHeader" class="w-100 h-100 d-flex align-items-center justify-content-center" style="background: rgba(255,255,255,0.1);">
                  <i class="fas fa-box-open" style="font-size: 40px; color: white;"></i>
                </div>
              </div>
            </div>

            <!-- Infos principales -->
            <div class="col-md-6">
              <h4 class="mb-1">
                <i class="fas fa-box me-2"></i>
                <span id="detailProductTitle">Chargement...</span>
              </h4>
              <p class="mb-2 opacity-9">
                <i class="fas fa-barcode me-2"></i>
                <span id="detailProductRef">REF: --</span>
              </p>
              <div class="mt-3">
                <span id="detailProductStatutBadge" class="badge bg-success me-2">Actif</span>
                <span id="detailProductEtatBadge" class="badge bg-info">État: --</span>
              </div>
            </div>

            <!-- KPIs visuels -->
            <div class="col-md-3">
              <div class="bg-white bg-opacity-10 rounded p-3 text-center mb-2">
                <div class="h3 mb-1" id="detailProductQte">0</div>
                <small class="opacity-75">En stock</small>
              </div>
              <div class="bg-white bg-opacity-10 rounded p-2 text-center">
                <div class="h5 mb-0" id="detailProductPrix">0€</div>
                <small class="opacity-75">Valeur totale</small>
              </div>
            </div>
          </div>
        </div>

        <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-3" data-bs-dismiss="modal"></button>
      </div>

      <!-- ========== BODY ========== -->
      <div class="modal-body p-0">
        <input type="hidden" id="detailProduitId" />

        <!-- Tabs modernes -->
        <div class="nav nav-tabs border-bottom sticky-top bg-white" style="z-index: 10;" role="tablist">
          <button class="nav-link active px-4 py-3" id="tabInfos-tab" data-bs-toggle="tab" data-bs-target="#tabInfos" type="button" role="tab">
            <i class="fas fa-info-circle me-2 text-primary"></i>
            <strong>Informations</strong>
          </button>
          <button class="nav-link px-4 py-3" id="tabStock-tab" data-bs-toggle="tab" data-bs-target="#tabStock" type="button" role="tab">
            <i class="fas fa-cubes me-2 text-info"></i>
            <strong>Stock & Rayon</strong>
          </button>
          <button class="nav-link px-4 py-3" id="tabLots-tab" data-bs-toggle="tab" data-bs-target="#tabLots" type="button" role="tab" style="display: none;">
            <i class="fas fa-boxes me-2 text-warning"></i>
            <strong>Lots</strong>
          </button>
          <button class="nav-link px-4 py-3" id="tabReceptions-tab" data-bs-toggle="tab" data-bs-target="#tabReceptions" type="button" role="tab">
            <i class="fas fa-arrow-down me-2 text-success"></i>
            <strong>Réceptions</strong>
          </button>
          <button class="nav-link px-4 py-3" id="tabHistorique-tab" data-bs-toggle="tab" data-bs-target="#tabHistorique" type="button" role="tab">
            <i class="fas fa-history me-2 text-warning"></i>
            <strong>Historique</strong>
          </button>
          <button class="nav-link px-4 py-3" id="tabModifier-tab" data-bs-toggle="tab" data-bs-target="#tabModifier" type="button" role="tab">
            <i class="fas fa-edit me-2 text-secondary"></i>
            <strong>Modifier</strong>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content p-4">

          <!-- ========== TAB 1: INFORMATIONS GÉNÉRALES ========== -->
          <div class="tab-pane fade show active" id="tabInfos" role="tabpanel">
            <div class="row">
              <!-- Colonne 1: Infos principales -->
              <div class="col-lg-6">
                <h6 class="text-uppercase text-muted fw-bold mb-3">
                  <i class="fas fa-folder-open me-2"></i>Informations principales
                </h6>

                <div class="card border-0 bg-light mb-3">
                  <div class="card-body">
                    <div class="mb-3">
                      <label class="text-muted small">Référence</label>
                      <h5 id="detailRef">--</h5>
                    </div>
                    <div class="mb-3">
                      <label class="text-muted small">Désignation</label>
                      <h5 id="detailDesignation">--</h5>
                    </div>
                    <div class="mb-3">
                      <label class="text-muted small">Catégorie</label>
                      <p id="detailCategorie" class="mb-0">--</p>
                    </div>
                    <div class="mb-0">
                      <label class="text-muted small">Unité principale</label>
                      <p id="detailUnite" class="mb-0">--</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Colonne 2: Pricing & État -->
              <div class="col-lg-6">
                <h6 class="text-uppercase text-muted fw-bold mb-3">
                  <i class="fas fa-tag me-2"></i>Pricing & État
                </h6>

                <div class="card border-0 bg-light mb-3">
                  <div class="card-body">
                    <div class="row mb-3">
                      <div class="col-6">
                        <label class="text-muted small">Prix unitaire</label>
                        <h5 id="detailPrixUnit">0€</h5>
                      </div>
                      <div class="col-6">
                        <label class="text-muted small">Valeur totale stock</label>
                        <h5 id="detailValeurTotal">0€</h5>
                      </div>
                    </div>
                    <div class="row mb-3">
                      <div class="col-6">
                        <label class="text-muted small">État</label>
                        <p id="detailEtat" class="mb-0 fw-bold">--</p>
                      </div>
                      <div class="col-6">
                        <label class="text-muted small">Statut</label>
                        <p id="detailStatut" class="mb-0"><span class="badge bg-success">Actif</span></p>
                      </div>
                    </div>
                    <div>
                      <label class="text-muted small">Date d'ajout</label>
                      <p id="detailDateAjout" class="mb-0">--</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Stats rapides -->
            <h6 class="text-uppercase text-muted fw-bold mb-3 mt-4">
              <i class="fas fa-chart-pie me-2"></i>Vue d'ensemble
            </h6>
            <div class="row g-3 mb-4">
              <div class="col-md-3">
                <div class="card text-center border-0 shadow-sm">
                  <div class="card-body p-3">
                    <i class="fas fa-boxes" style="font-size: 24px; color: #0dcaf0;" class="mb-2"></i>
                    <h5 id="statTotalQte">0</h5>
                    <small class="text-muted">Quantité totale</small>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card text-center border-0 shadow-sm">
                  <div class="card-body p-3">
                    <i class="fas fa-arrow-down" style="font-size: 24px; color: #28a745;" class="mb-2"></i>
                    <h5 id="statReceptions">0</h5>
                    <small class="text-muted">Réceptions</small>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card text-center border-0 shadow-sm">
                  <div class="card-body p-3">
                    <i class="fas fa-arrow-up" style="font-size: 24px; color: #dc3545;" class="mb-2"></i>
                    <h5 id="statVentes">0</h5>
                    <small class="text-muted">Ventes/Sorties</small>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card text-center border-0 shadow-sm">
                  <div class="card-body p-3">
                    <i class="fas fa-warehouse" style="font-size: 24px; color: #ffc107;" class="mb-2"></i>
                    <h5 id="statRayons">0</h5>
                    <small class="text-muted">Rayons utilisés</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ========== TAB 2: LOT (si produit LOT) ========== -->
          <div class="tab-pane fade" id="tabLots" role="tabpanel" style="display: none;">
            <h6 class="text-uppercase text-muted fw-bold mb-3">
              <i class="fas fa-boxes me-2 text-warning"></i>Lots reçus
            </h6>

            <!-- Tableau des LOTs -->
            <div id="detailLotsContainer" style="max-height: 600px; overflow-y: auto;">
              <div class="alert alert-info text-center">
                <i class="fas fa-spinner fa-spin me-2"></i>Chargement des lots...
              </div>
            </div>
          </div>

          <!-- ========== TAB 3: STOCK & RAYON ========== -->
          <div class="tab-pane fade" id="tabStock" role="tabpanel">
            <h6 class="text-uppercase text-muted fw-bold mb-3">
              <i class="fas fa-cubes me-2"></i>État du stock
            </h6>

            <!-- Jauge de stock -->
            <div class="card border-0 bg-light mb-4">
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-md-8">
                    <label class="text-muted small mb-2 d-block">Stock actuel</label>
                    <div class="progress" style="height: 30px;">
                      <div id="detailStockBar" class="progress-bar" role="progressbar" style="width: 0%;">
                        <span id="detailStockText" class="fw-bold">0</span>
                      </div>
                    </div>
                    <div class="small text-muted mt-2">
                      <span id="detailStockMin">Min: --</span> | 
                      <span id="detailStockMax">Max: --</span>
                    </div>
                  </div>
                  <div class="col-md-4 text-center">
                    <div style="font-size: 32px; font-weight: bold; color: #667eea;" id="detailStockLarge">0</div>
                    <small class="text-muted">unités en stock</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Alertes stock -->
            <div id="detailStockAlertes" class="mb-4"></div>

            <!-- Rayons -->
            <h6 class="text-uppercase text-muted fw-bold mb-3">
              <i class="fas fa-map-location-dot me-2"></i>Rayons
            </h6>

            <div id="detailRayonsContainer" class="row g-3">
              <div class="col-12">
                <div class="alert alert-info text-center">
                  <i class="fas fa-spinner fa-spin me-2"></i>Chargement des rayons...
                </div>
              </div>
            </div>
          </div>

          <!-- ========== TAB 3: RÉCEPTIONS ========== -->
          <div class="tab-pane fade" id="tabReceptions" role="tabpanel">
            <h6 class="text-uppercase text-muted fw-bold mb-3">
              <i class="fas fa-arrow-down me-2"></i>Historique des réceptions
            </h6>

            <div id="detailReceptionsContainer" style="max-height: 500px; overflow-y: auto;">
              <div class="alert alert-info text-center">
                <i class="fas fa-spinner fa-spin me-2"></i>Chargement...
              </div>
            </div>
          </div>

          <!-- ========== TAB 4: HISTORIQUE COMPLET ========== -->
          <div class="tab-pane fade" id="tabHistorique" role="tabpanel">
            <h6 class="text-uppercase text-muted fw-bold mb-3">
              <i class="fas fa-timeline me-2"></i>Timeline complète
            </h6>

            <div id="detailTimelineContainer" style="max-height: 500px; overflow-y: auto;">
              <div class="alert alert-info text-center">
                <i class="fas fa-spinner fa-spin me-2"></i>Chargement...
              </div>
            </div>
          </div>

          <!-- ========== TAB 5: MODIFIER ========== -->
          <div class="tab-pane fade" id="tabModifier" role="tabpanel">
            <h6 class="text-uppercase text-muted fw-bold mb-4">
              <i class="fas fa-edit me-2"></i>Modifier les informations du produit
            </h6>

            <form id="formEditProduit" novalidate>
              <!-- Photo -->
              <div class="mb-4">
                <label class="form-label fw-bold">
                  <i class="fas fa-image me-2"></i>Photo du produit
                </label>
                <div 
                  id="detailPhotoContainer"
                  style="min-height: 200px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px; border: 2px dashed #dee2e6; cursor: pointer; transition: all 0.3s ease;"
                  onclick="document.getElementById('detailPhotoProduit').click();"
                >
                  <img id="detailProductPhoto" src="" alt="Photo" style="max-width: 100%; max-height: 200px; object-fit: cover; display: none; border-radius: 6px;" />
                  <span id="detailPhotoFallback" class="badge bg-secondary text-center" style="padding: 20px;">
                    <i class="fas fa-cloud-upload-alt me-2 d-block mb-2" style="font-size: 24px;"></i>
                    Cliquez pour modifier
                  </span>
                </div>
                <input type="file" id="detailPhotoProduit" class="form-control" accept="image/*" style="display: none;" onchange="previewDetailPhoto(event)" />
              </div>

              <!-- Infos principales -->
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Référence</label>
                  <input type="text" id="detailReferenceEdit" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Désignation</label>
                  <input type="text" id="detailDesignationEdit" class="form-control" required />
                </div>
              </div>

              <!-- Pricing -->
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Prix unitaire (€)</label>
                  <input type="number" id="detailPrixUnitaireEdit" class="form-control" step="0.01" min="0" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">État</label>
                  <select id="detailEtatEdit" class="form-select">
                    <option value="Neuf">🆕 Neuf</option>
                    <option value="Bon état">✅ Bon état</option>
                    <option value="Usagé">⚙️ Usagé</option>
                    <option value="Endommagé">❌ Endommagé</option>
                  </select>
                </div>
              </div>

              <!-- Stock -->
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Seuil d'alerte</label>
                  <input type="number" id="detailSeuilAlerteEdit" class="form-control" min="0" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Quantité actuelle (lecture seule)</label>
                  <input type="number" id="detailQuantiteActuelleEdit" class="form-control" readonly />
                </div>
              </div>

              <!-- Boutons d'action -->
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-success flex-grow-1" onclick="saveProductChanges()">
                  <i class="fas fa-save me-2"></i>Enregistrer les modifications
                </button>
                <button type="button" class="btn btn-danger" onclick="confirmDeleteProduct()">
                  <i class="fas fa-trash me-2"></i>Supprimer
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      <!-- ========== FOOTER ========== -->
      <div class="modal-footer bg-light border-top">
        <small class="text-muted me-auto">
          <i class="fas fa-clock me-1"></i>
          Mis à jour: <span id="detailLastUpdate">--</span>
        </small>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
      </div>

    </div>
  </div>
</div>

<!-- ============================================================================
     SCRIPT POUR LE MODAL AMÉLIORÉ
     ============================================================================ -->
<script>
let detailUploadedPhotoUrl = null;

let API_BASE_PROTECTED = null;
if (typeof window.API_BASE !== 'undefined' && window.API_BASE) {
  if (window.API_BASE.includes('/api/protected')) {
    API_BASE_PROTECTED = window.API_BASE;
  } else {
    API_BASE_PROTECTED = window.API_BASE + '/api/protected';
  }
} else {
  API_BASE_PROTECTED = 'https://backend-gestion-de-stock.onrender.com/api/protected';
}

// Ouvrir le modal avec détails complets
async function openProductDetailModal(produitId) {
  try {
    let produit = null;
    
    if (CACHE_PRODUITS && Array.isArray(CACHE_PRODUITS)) {
      produit = CACHE_PRODUITS.find(p => p._id === produitId);
    }
    
    if (!produit) {
      try {
        produit = await API.get(API_CONFIG.ENDPOINTS.PRODUIT, { produitId });
      } catch (apiErr) {
        console.warn('⚠️ Erreur API, utilisation du cache:', apiErr);
      }
    }

    if (!produit) {
      showToast('❌ Produit non trouvé', 'danger');
      return;
    }

    // Remplir tous les champs
    document.getElementById('detailProduitId').value = produitId;
    document.getElementById('detailProductTitle').textContent = produit.designation;
    document.getElementById('detailProductRef').textContent = `REF: ${produit.reference}`;
    document.getElementById('detailRef').textContent = produit.reference;
    document.getElementById('detailDesignation').textContent = produit.designation;
    document.getElementById('detailCategorie').textContent = produit.typeProduitsId?.nomType || '--';
    document.getElementById('detailUnite').textContent = produit.unitePrincipale || '--';
    document.getElementById('detailPrixUnit').textContent = `${produit.prixUnitaire || 0}€`;
    document.getElementById('detailValeurTotal').textContent = `${((produit.quantiteActuelle || 0) * (produit.prixUnitaire || 0)).toFixed(2)}€`;
    document.getElementById('detailEtat').textContent = produit.etat || '--';
    document.getElementById('detailDateAjout').textContent = new Date(produit.dateEntree).toLocaleDateString('fr-FR');
    document.getElementById('detailLastUpdate').textContent = new Date(produit.updatedAt).toLocaleDateString('fr-FR');

    // Header KPIs
    document.getElementById('detailProductQte').textContent = produit.quantiteActuelle || 0;
    document.getElementById('detailProductPrix').textContent = `${((produit.quantiteActuelle || 0) * (produit.prixUnitaire || 0)).toFixed(2)}€`;
    document.getElementById('detailEtatBadge').textContent = `État: ${produit.etat || '--'}`;

    // Champs édition
    document.getElementById('detailReferenceEdit').value = produit.reference || '';
    document.getElementById('detailDesignationEdit').value = produit.designation || '';
    document.getElementById('detailPrixUnitaireEdit').value = produit.prixUnitaire || 0;
    document.getElementById('detailEtatEdit').value = produit.etat || 'Neuf';
    document.getElementById('detailSeuilAlerteEdit').value = produit.seuilAlerte || 10;
    document.getElementById('detailQuantiteActuelleEdit').value = produit.quantiteActuelle || 0;

    // Photo
    const photoImg = document.getElementById('detailProductPhoto');
    const photoFallback = document.getElementById('detailPhotoFallback');
    const photoImgHeader = document.getElementById('detailProductPhotoHeader');
    const photoFallbackHeader = document.getElementById('detailPhotoFallbackHeader');
    
    if (produit.photoUrl) {
      photoImg.src = produit.photoUrl;
      photoImg.style.display = 'block';
      photoFallback.style.display = 'none';
      photoImgHeader.src = produit.photoUrl;
      photoImgHeader.style.display = 'block';
      photoFallbackHeader.style.display = 'none';
    } else {
      photoImg.style.display = 'none';
      photoFallback.style.display = 'block';
      photoImgHeader.style.display = 'none';
      photoFallbackHeader.style.display = 'flex';
    }

    // Stats rapides
    loadProductStats(produitId);
    loadProductStock(produitId);
    loadProductReceptions(produitId);
    loadProductTimeline(produitId);

    // ✅ Si produit LOT, afficher l'onglet Lots
    if (produit.typeProduitsId?.typeStockage === 'lot') {
      document.getElementById('tabLots-tab').style.display = 'block';
      loadProductLots(produitId);
    } else {
      document.getElementById('tabLots-tab').style.display = 'none';
    }

    const modal = new bootstrap.Modal(document.getElementById('modalProductDetail'));
    modal.show();

  } catch (err) {
    showToast('❌ Erreur: ' + err.message, 'danger');
  }
}

// Stats rapides
async function loadProductStats(produitId) {
  try {
    document.getElementById('statTotalQte').textContent = '...';
    document.getElementById('statReceptions').textContent = '...';
    document.getElementById('statVentes').textContent = '...';
    document.getElementById('statRayons').textContent = '...';

    // Récupérer les stats
    const stats = await API.get(`${API_CONFIG.BASE_URL}/api/protected/produits/${produitId}/stats`);
    
    document.getElementById('statTotalQte').textContent = stats.quantiteTotal || 0;
    document.getElementById('statReceptions').textContent = stats.receptions || 0;
    document.getElementById('statVentes').textContent = stats.ventes || 0;
    document.getElementById('statRayons').textContent = stats.rayons || 0;
  } catch (err) {
    console.warn('Stats non disponibles:', err);
  }
}

// Stock & Rayons
async function loadProductStock(produitId) {
  try {
    const container = document.getElementById('detailRayonsContainer');
    const rayons = await API.get(`${API_CONFIG.BASE_URL}/api/protected/produits/${produitId}/rayons`);

    if (!rayons || rayons.length === 0) {
      container.innerHTML = '<div class="col-12"><div class="alert alert-info">Pas de rayon assigné</div></div>';
      return;
    }

    let html = '';
    rayons.forEach(r => {
      const capacite = ((r.quantite || 0) / (r.capacite || 1)) * 100;
      const couleur = capacite > 80 ? 'danger' : capacite > 60 ? 'warning' : 'success';
      
      html += `
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h6 class="card-title">
                <i class="fas fa-map-location-dot me-2"></i>${r.nomRayon}
              </h6>
              <div class="progress mb-2" style="height: 8px;">
                <div class="progress-bar bg-${couleur}" style="width: ${Math.min(capacite, 100)}%"></div>
              </div>
              <div class="small text-muted">
                ${r.quantite} / ${r.capacite} unités (${capacite.toFixed(0)}%)
              </div>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (err) {
    console.warn('Rayons non disponibles:', err);
  }
}

// Réceptions
async function loadProductReceptions(produitId) {
  try {
    const container = document.getElementById('detailReceptionsContainer');
    const receptions = await API.get(`${API_CONFIG.BASE_URL}/api/protected/receptions`, { produitId });

    if (!receptions || receptions.length === 0) {
      container.innerHTML = '<div class="alert alert-info">Aucune réception</div>';
      return;
    }

    let html = '<div class="list-group">';
    receptions.forEach(r => {
      const couleur = r.statut === 'stocke' ? 'success' : r.statut === 'controle' ? 'warning' : 'danger';
      html += `
        <div class="list-group-item">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="mb-1"><strong>${r.fournisseur}</strong></h6>
              <small class="text-muted">${new Date(r.dateReception).toLocaleDateString('fr-FR')}</small>
            </div>
            <div class="text-end">
              <span class="badge bg-${couleur}">${r.quantite} unités</span>
              <div class="small text-muted mt-1">${r.prixTotal}€</div>
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  } catch (err) {
    console.warn('Réceptions non disponibles:', err);
    document.getElementById('detailReceptionsContainer').innerHTML = '<div class="alert alert-info">Aucune réception</div>';
  }
}

// Timeline
async function loadProductTimeline(produitId) {
  try {
    const container = document.getElementById('detailTimelineContainer');
    const mouvements = await API.get(`${API_CONFIG.BASE_URL}/api/protected/mouvements`, { produitId });

    if (!mouvements || mouvements.length === 0) {
      container.innerHTML = '<div class="alert alert-info">Aucun mouvement</div>';
      return;
    }

    let html = '<div class="timeline">';
    mouvements.forEach((m, idx) => {
      const couleur = m.type === 'RECEPTION' ? 'success' : m.type === 'SORTIE' ? 'danger' : 'info';
      const icon = m.type === 'RECEPTION' ? 'arrow-down' : m.type === 'SORTIE' ? 'arrow-up' : 'box';
      
      html += `
        <div class="mb-3">
          <div class="d-flex gap-3">
            <div class="text-center" style="min-width: 50px;">
              <div class="badge bg-${couleur}" style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; font-size: 18px;">
                <i class="fas fa-${icon}"></i>
              </div>
              ${idx < mouvements.length - 1 ? '<div style="width: 2px; height: 30px; background: #dee2e6; margin: 0 auto;"></div>' : ''}
            </div>
            <div class="flex-grow-1">
              <h6 class="mb-1 fw-bold">${m.type}</h6>
              <small class="text-muted d-block">${new Date(m.createdAt).toLocaleString('fr-FR')}</small>
              <small class="text-muted d-block">Qté: <strong>${m.quantite}</strong></small>
              ${m.observations ? `<small class="d-block mt-1">${m.observations}</small>` : ''}
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  } catch (err) {
    console.warn('Timeline non disponible:', err);
    document.getElementById('detailTimelineContainer').innerHTML = '<div class="alert alert-info">Aucun historique</div>';
  }
}

// 🎁 Charger et afficher les LOTS
async function loadProductLots(produitId) {
  try {
    const container = document.getElementById('detailLotsContainer');
    
    // Récupérer les LOTs via l'endpoint (suppose qu'il existe)
    let lots = [];
    try {
      const response = await fetch(`${API_BASE_PROTECTED}/produits/${produitId}/lots`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
        }
      });
      if (response.ok) {
        lots = await response.json();
      }
    } catch (e) {
      console.warn('⚠️ Endpoint /lots non disponible, tentative alternative...');
    }

    if (!lots || lots.length === 0) {
      container.innerHTML = `
        <div class="alert alert-info text-center">
          <i class="fas fa-info-circle me-2"></i>Aucun lot reçu pour ce produit
        </div>
      `;
      return;
    }

    // Créer tableau des LOTS
    let html = `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th><i class="fas fa-boxes me-2 text-warning"></i>Pièces</th>
              <th><i class="fas fa-weight me-2"></i>Quantité/Pièce</th>
              <th><i class="fas fa-ruler me-2"></i>Unité</th>
              <th><i class="fas fa-tag me-2 text-success"></i>Prix/Unité</th>
              <th><i class="fas fa-calculator me-2 text-info"></i>Total</th>
              <th><i class="fas fa-calendar me-2 text-muted"></i>Date Réception</th>
            </tr>
          </thead>
          <tbody>
    `;

    lots.forEach(lot => {
      const totalQty = (lot.nombrePieces || 0) * (lot.quantiteParPiece || 0);
      const totalPrice = totalQty * (lot.prixParUnite || 0);
      const dateReception = new Date(lot.dateReception || lot.createdAt).toLocaleDateString('fr-FR');
      
      html += `
        <tr class="align-middle">
          <td>
            <span class="badge bg-warning text-dark">
              <i class="fas fa-cube me-1"></i>${lot.nombrePieces || 0}
            </span>
          </td>
          <td>
            <strong>${(lot.quantiteParPiece || 0).toLocaleString('fr-FR', {minimumFractionDigits: 2})}</strong>
          </td>
          <td>
            <span class="badge bg-info">${lot.uniteDetail || 'unité'}</span>
          </td>
          <td>
            <span class="text-success fw-bold">${(lot.prixParUnite || 0).toLocaleString('fr-FR', {minimumFractionDigits: 2})} CDF</span>
          </td>
          <td>
            <div>
              <small class="text-muted d-block">${totalQty.toLocaleString('fr-FR', {minimumFractionDigits: 2})} ${lot.uniteDetail || 'unité'}</small>
              <strong class="text-success">${totalPrice.toLocaleString('fr-FR', {minimumFractionDigits: 2})} CDF</strong>
            </div>
          </td>
          <td>
            <small class="text-muted">${dateReception}</small>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;

  } catch (err) {
    console.warn('❌ Erreur loadProductLots:', err);
    document.getElementById('detailLotsContainer').innerHTML = `
      <div class="alert alert-warning text-center">
        <i class="fas fa-exclamation-triangle me-2"></i>Impossible de charger les lots
      </div>
    `;
  }
}

// Sauvegarder les modifications
async function saveProductChanges() {
  try {
    const produitId = document.getElementById('detailProduitId').value;
    
    if (document.getElementById('detailPhotoProduit').files.length > 0 && !detailUploadedPhotoUrl) {
      showToast('⏳ Upload de la photo en cours...', 'info');
      let attempts = 0;
      while (!detailUploadedPhotoUrl && attempts < 30) {
        await new Promise(r => setTimeout(r, 1000));
        attempts++;
      }
    }
    
    const updatedData = {
      reference: document.getElementById('detailReferenceEdit').value,
      designation: document.getElementById('detailDesignationEdit').value,
      prixUnitaire: parseFloat(document.getElementById('detailPrixUnitaireEdit').value) || 0,
      seuilAlerte: parseInt(document.getElementById('detailSeuilAlerteEdit').value) || 10,
      etat: document.getElementById('detailEtatEdit').value
    };
    
    if (detailUploadedPhotoUrl) {
      updatedData.photoUrl = detailUploadedPhotoUrl;
    }

    await API.put(API_CONFIG.ENDPOINTS.PRODUIT, updatedData, { produitId });

    showToast('✅ Produit modifié!', 'success');
    detailUploadedPhotoUrl = null;
    
    const modalEl = document.getElementById('modalProductDetail');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();
    }
    
    CACHE_PRODUITS = null;
    if (typeof loadProduits === 'function') {
      await loadProduits(true);
    }

  } catch (err) {
    showToast('❌ Erreur: ' + err.message, 'danger');
  }
}

// Supprimer
function confirmDeleteProduct() {
  if (confirm('⚠️ Êtes-vous sûr? Cette action est irréversible.')) {
    deleteProductPermanent(document.getElementById('detailProduitId').value);
  }
}

async function deleteProductPermanent(produitId) {
  try {
    await API.delete(API_CONFIG.ENDPOINTS.PRODUIT, { produitId });
    showToast('✅ Produit supprimé!', 'success');
    bootstrap.Modal.getInstance(document.getElementById('modalProductDetail')).hide();
    await loadProduits(false);
  } catch (err) {
    showToast('❌ Erreur: ' + err.message, 'danger');
  }
}

// Preview photo
function previewDetailPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    showToast('❌ Fichier trop volumineux', 'danger');
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('detailProductPhoto').src = e.target.result;
    document.getElementById('detailProductPhoto').style.display = 'block';
    document.getElementById('detailPhotoFallback').style.display = 'none';
    uploadDetailProductPhoto(file);
  };
  reader.readAsDataURL(file);
}

// Upload photo
async function uploadDetailProductPhoto(file) {
  try {
    const compressedFile = await compressImage(file);
    const formData = new FormData();
    formData.append('image', compressedFile, 'produit.jpg');

    let token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) token = sessionStorage.getItem('token') || sessionStorage.getItem('authToken');

    const uploadResponse = await fetch(`${API_BASE_PROTECTED}/upload/produit-image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!uploadResponse.ok) throw new Error('Upload failed');

    const uploadResult = await uploadResponse.json();
    detailUploadedPhotoUrl = uploadResult.photoUrl;
    document.getElementById('detailProductPhoto').src = uploadResult.photoUrl;
    showToast('✅ Photo mise à jour!', 'success');

  } catch (err) {
    showToast('❌ Erreur upload: ' + err.message, 'danger');
  }
}

// Compression image
async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 800, maxHeight = 800;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(new File([blob], 'produit.jpg', { type: 'image/jpeg' })), 'image/jpeg', 0.7);
      };
    };
    reader.onerror = reject;
  });
}
</script>

<style>
/* Animations et styles personnalisés */
.modal-header {
  border-bottom: none;
}

.nav-tabs .nav-link {
  color: #6c757d;
  border: none;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.nav-tabs .nav-link:hover {
  color: #667eea;
  border-bottom-color: #667eea;
}

.nav-tabs .nav-link.active {
  color: #667eea;
  background: transparent;
  border-bottom-color: #667eea;
}

.timeline > div {
  animation: slideInLeft 0.3s ease;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
}

.badge {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>
