<!-- ================================================================
     MODAL DÉTAIL PRODUIT - VERSION PREMIUM COMPLÈTE
     Design moderne ERP avec tous les détails du produit
     ================================================================ -->
<div class="modal fade" id="modalProductDetailPremium" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-scrollable" style="max-width: 95vw;">
    <div class="modal-content border-0 shadow-lg">
      
      <!-- ============= HEADER AVEC ACTIONS ============= -->
      <div class="modal-header bg-light border-bottom-0 p-3">
        <div class="d-flex align-items-start w-100 gap-2">
          <div class="flex-grow-1">
            <h5 class="modal-title fw-bold mb-1">
              <i class="fas fa-box me-2 text-info"></i>Détail du Produit
            </h5>
            <small class="text-muted">Informations complètes du produit</small>
          </div>
          <!-- BADGES ACTIONS EN HAUT À DROITE -->
          <div class="d-flex gap-2 flex-shrink-0">
            <button type="button" class="btn btn-sm btn-primary rounded-pill" id="btnEditProduct" title="Modifier le produit">
              <i class="fas fa-edit me-1"></i><span class="d-none d-sm-inline">Modifier</span>
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger rounded-pill" title="Supprimer le produit">
              <i class="fas fa-trash me-1"></i><span class="d-none d-sm-inline">Supprimer</span>
            </button>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
        </div>
      </div>

      <!-- ============= BODY ============= -->
      <div class="modal-body p-4">
        <input type="hidden" id="premiumProductId" />

        <!-- ========== SECTION 1: VUE D'ENSEMBLE ========== -->
        <div class="row g-4 mb-4">
          
          <!-- Colonne 1: Image & Actions -->
          <div class="col-lg-3">
            <div class="card border-0 shadow-sm overflow-hidden" style="cursor: pointer; position: relative;" onclick="ouvrirImageLightbox()">
              <!-- Image -->
              <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); height: 300px; display: flex; align-items: center; justify-content: center; position: relative;">
                <img id="premiumProductImage" src="" alt="Produit" style="max-width: 100%; max-height: 100%; object-fit: contain; display: none;" />
                <div id="premiumImagePlaceholder" class="text-center text-muted">
                  <i class="fas fa-image" style="font-size: 48px; opacity: 0.3;"></i>
                  <p class="mt-2 small">Pas d'image</p>
                </div>
                <!-- Overlay loupe -->
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none;">
                  <i class="fas fa-search" style="font-size: 48px; color: rgba(255, 255, 255, 0.8); text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Colonne 2: Infos principales -->
          <div class="col-lg-9">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <h3 id="premiumProductName" class="mb-2">--</h3>
                
                <div class="row g-3 mb-4">
                  <div class="col-md-6">
                    <small class="text-muted d-block">Référence (SKU)</small>
                    <strong id="premiumProductRef">--</strong>
                  </div>
                  <div class="col-md-6">
                    <small class="text-muted d-block">Catégorie</small>
                    <strong id="premiumProductCategory">--</strong>
                  </div>
                  <div class="col-md-6">
                    <small class="text-muted d-block">Fournisseur</small>
                    <strong id="premiumProductSupplier">--</strong>
                  </div>
                  <div class="col-md-6">
                    <small class="text-muted d-block">Marque</small>
                    <strong id="premiumProductBrand">--</strong>
                  </div>
                </div>

                <div class="row g-3">
                  <div class="col-md-4">
                    <div class="p-3 bg-light rounded">
                      <small class="text-muted d-block">Prix d'achat</small>
                      <h5 id="premiumPricePurchase" class="mb-0">0€</h5>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="p-3 bg-light rounded">
                      <small class="text-muted d-block">Prix de vente</small>
                      <h5 id="premiumPriceSale" class="mb-0">0€</h5>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="p-3 bg-light rounded">
                      <small class="text-muted d-block">Localisation</small>
                      <h5 id="premiumLocation" class="mb-0">--</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ========== SECTION 2: KPI CARDS ========== -->
        <h6 class="text-uppercase text-muted fw-bold mb-3">
          <i class="fas fa-chart-pie me-2"></i>Indicateurs clés
        </h6>

        <div class="row g-3 mb-4">
          <!-- Stock actuel -->
          <div class="col-md-3">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center p-4">
                <i class="fas fa-boxes" style="font-size: 28px; color: #0dcaf0;"></i>
                <h4 id="premiumStockCurrent" class="my-3">0</h4>
                <small class="text-muted d-block">Stock actuel</small>
                <span id="premiumStockBadge" class="badge bg-success mt-2">En stock</span>
              </div>
            </div>
          </div>

          <!-- Stock minimum -->
          <div class="col-md-3">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center p-4">
                <i class="fas fa-exclamation-triangle" style="font-size: 28px; color: #ffc107;"></i>
                <h4 id="premiumStockMin" class="my-3">0</h4>
                <small class="text-muted d-block">Stock minimum</small>
              </div>
            </div>
          </div>

          <!-- Valeur du stock -->
          <div class="col-md-3">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center p-4">
                <i class="fas fa-euro-sign" style="font-size: 28px; color: #28a745;"></i>
                <h4 id="premiumStockValue" class="my-3">0€</h4>
                <small class="text-muted d-block">Valeur totale</small>
              </div>
            </div>
          </div>

          <!-- Alertes -->
          <div class="col-md-3">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center p-4">
                <i class="fas fa-bell" style="font-size: 28px; color: #dc3545;"></i>
                <h4 id="premiumAlertsCount" class="my-3">0</h4>
                <small class="text-muted d-block">Alertes actives</small>
              </div>
            </div>
          </div>
        </div>

        <!-- ========== SECTION 3: CARACTÉRISTIQUES ========== -->
        <h6 class="text-uppercase text-muted fw-bold mb-3">
          <i class="fas fa-tag me-2"></i>Caractéristiques
        </h6>

        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="card border-0 bg-light">
              <div class="card-body p-3">
                <div class="mb-3">
                  <small class="text-muted d-block">Taille</small>
                  <strong id="premiumSize">--</strong>
                </div>
                <div class="mb-3">
                  <small class="text-muted d-block">Couleur</small>
                  <strong id="premiumColor">--</strong>
                </div>
                <div>
                  <small class="text-muted d-block">Qualité</small>
                  <strong id="premiumQuality">--</strong>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="card border-0 bg-light">
              <div class="card-body p-3">
                <div class="mb-3">
                  <small class="text-muted d-block">Unité</small>
                  <strong id="premiumUnit">--</strong>
                </div>
                <div class="mb-3">
                  <small class="text-muted d-block">État</small>
                  <strong id="premiumCondition">--</strong>
                </div>
                <div>
                  <small class="text-muted d-block">Date d'ajout</small>
                  <strong id="premiumDateAdded">--</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ========== SECTION 4: STATISTIQUES DE VENTE ========== -->
        <h6 class="text-uppercase text-muted fw-bold mb-3">
          <i class="fas fa-chart-bar me-2"></i>Statistiques de vente
        </h6>

        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <i class="fas fa-calendar" style="font-size: 24px; color: #667eea;"></i>
                <h5 id="premiumMonthlySales" class="my-3">0</h5>
                <small class="text-muted">Ventes mensuelles</small>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <i class="fas fa-hourglass-half" style="font-size: 24px; color: #ffc107;"></i>
                <h5 id="premiumOngoingOrders" class="my-3">0</h5>
                <small class="text-muted">Commandes en cours</small>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <i class="fas fa-sync" style="font-size: 24px; color: #28a745;"></i>
                <h5 id="premiumRotationRate" class="my-3">0</h5>
                <small class="text-muted">Rotation (par mois)</small>
              </div>
            </div>
          </div>
        </div>

        <!-- ========== SECTION 5: LOTS (si produit LOT) ========== -->
        <div id="sectionLots" style="display: none;" class="mb-4">
          <h6 class="text-uppercase text-muted fw-bold mb-3">
            <i class="fas fa-boxes me-2 text-warning"></i>Lots reçus (Pièces individuelles)
          </h6>

          <div class="card border-0 shadow-sm">
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 12%;"><i class="fas fa-cube me-2 text-warning"></i>Pièces</th>
                      <th style="width: 15%;"><i class="fas fa-weight me-2"></i>Qté/Pièce</th>
                      <th style="width: 12%;"><i class="fas fa-ruler me-2"></i>Unité</th>
                      <th style="width: 15%;"><i class="fas fa-tag me-2 text-success"></i>Prix/Unité</th>
                      <th style="width: 20%;"><i class="fas fa-calculator me-2 text-info"></i>Total</th>
                      <th style="width: 15%;"><i class="fas fa-calendar me-2 text-muted"></i>Réception</th>
                      <th style="width: 11%;"><i class="fas fa-info-circle me-2"></i>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="premiumLotsTable">
                    <tr>
                      <td colspan="7" class="text-center text-muted py-4">
                        <i class="fas fa-spinner fa-spin me-2"></i>Chargement des lots...
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Récapitulatif LOTs -->
          <div class="row g-3 mt-3">
            <div class="col-md-4">
              <div class="card border-0 shadow-sm bg-info bg-opacity-10">
                <div class="card-body text-center p-3">
                  <i class="fas fa-boxes" style="font-size: 24px; color: #0dcaf0;"></i>
                  <h5 id="premiumLotsTotalPieces" class="my-3">0</h5>
                  <small class="text-muted">Total pièces reçues</small>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card border-0 shadow-sm bg-success bg-opacity-10">
                <div class="card-body text-center p-3">
                  <i class="fas fa-cube" style="font-size: 24px; color: #28a745;"></i>
                  <h5 id="premiumLotsQtyTotal" class="my-3">0</h5>
                  <small class="text-muted" id="premiumLotsQtyUnit">unités</small>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card border-0 shadow-sm bg-success bg-opacity-10">
                <div class="card-body text-center p-3">
                  <i class="fas fa-euro-sign" style="font-size: 24px; color: #28a745;"></i>
                  <h5 id="premiumLotsValueTotal" class="my-3">0 CDF</h5>
                  <small class="text-muted">Valeur totale LOTs</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ========== SECTION 5B: ALERTES DÉTAILLÉES ========== -->
        <h6 class="text-uppercase text-muted fw-bold mb-3">
          <i class="fas fa-exclamation-circle me-2"></i>Alertes & État
        </h6>

        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body p-3 text-center">
                <i class="fas fa-cube" style="font-size: 24px; color: #0dcaf0;"></i>
                <p class="mt-2 mb-1 small text-muted">Stock actuel</p>
                <h5 id="premiumAlertStockActuel" class="mb-0">0</h5>
                <small class="text-muted" id="premiumAlertStockStatus">--</small>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body p-3 text-center">
                <i class="fas fa-arrow-down" style="font-size: 24px; color: #ffc107;"></i>
                <p class="mt-2 mb-1 small text-muted">Seuil alerte</p>
                <h5 id="premiumAlertSeuilAlerte" class="mb-0">0</h5>
                <small class="text-muted">Minimum</small>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body p-3 text-center">
                <i class="fas fa-warning" style="font-size: 24px;" id="premiumAlertIcon"></i>
                <p class="mt-2 mb-1 small text-muted">Alerte stock</p>
                <h5 id="premiumAlertLabel" class="mb-0">OK</h5>
                <small class="text-muted" id="premiumAlertDescription">--</small>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body p-3 text-center">
                <i class="fas fa-hourglass" style="font-size: 24px; color: #dc3545;"></i>
                <p class="mt-2 mb-1 small text-muted">Péremption</p>
                <h5 id="premiumAlertPeremption" class="mb-0">--</h5>
                <small class="text-muted" id="premiumAlertPeremptionStatus">N/A</small>
              </div>
            </div>
          </div>
        </div>

        <!-- ========== SECTION 6: RÉCEPTIONS RÉCENTES ========== -->
        <h6 class="text-uppercase text-muted fw-bold mb-3">
          <i class="fas fa-inbox me-2"></i>Réceptions récentes
        </h6>

        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body">
            <div id="premiumReceptionsContainer" class="accordion" role="tablist">
              <!-- Les réceptions s'ajouteront ici dynamiquement -->
              <div class="text-center text-muted py-4">
                <i class="fas fa-spinner fa-spin me-2"></i>Chargement réceptions...
              </div>
            </div>
          </div>
        </div>

        <!-- ========== SECTION 7: TABLE MOUVEMENTS ========== -->
        <h6 class="text-uppercase text-muted fw-bold mb-3">
          <i class="fas fa-arrows-alt-v me-2"></i>Mouvements de stock
        </h6>

        <div class="card border-0 shadow-sm mb-4">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th><i class="fas fa-calendar"></i> Date</th>
                  <th><i class="fas fa-exchange-alt"></i> Type</th>
                  <th><i class="fas fa-cube"></i> Quantité</th>
                  <th><i class="fas fa-info-circle"></i> Détails</th>
                  <th><i class="fas fa-user"></i> Utilisateur</th>
                </tr>
              </thead>
              <tbody id="premiumMovementsTable">
                <tr>
                  <td colspan="5" class="text-center text-muted py-4">
                    <i class="fas fa-spinner fa-spin me-2"></i>Chargement...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ========== SECTION 8: ENREGISTREMENT & AUDIT ========== -->
        <h6 class="text-uppercase text-muted fw-bold mb-3">
          <i class="fas fa-file-alt me-2"></i>Enregistrement & Audit
        </h6>

        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="card border-0 bg-light">
              <div class="card-body p-3">
                <small class="text-muted d-block mb-2">✏️ Créé par</small>
                <strong id="premiumAuditCreatedBy" class="d-block mb-3">--</strong>
                <small class="text-muted d-block mb-2">📅 Date création</small>
                <strong id="premiumAuditCreatedAt" class="d-block">--</strong>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card border-0 bg-light">
              <div class="card-body p-3">
                <small class="text-muted d-block mb-2">🔄 Modifié par</small>
                <strong id="premiumAuditUpdatedBy" class="d-block mb-3">--</strong>
                <small class="text-muted d-block mb-2">📅 Dernière modification</small>
                <strong id="premiumAuditUpdatedAt" class="d-block">--</strong>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ============= FOOTER SIMPLE ============= -->
      <div class="modal-footer bg-light border-top">
        <small class="text-muted me-auto"><i class="fas fa-info-circle me-1"></i>Actions disponibles en haut de la modal</small>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
          <i class="fas fa-times me-2"></i>Fermer
        </button>
      </div>

    </div>
  </div>
</div>

<!-- ============= LIGHTBOX IMAGE ============= -->
<div class="modal fade" id="imageLightbox" tabindex="-1" aria-hidden="true" style="z-index: 9999;">
  <div class="modal-dialog modal-fullscreen">
    <div class="modal-content bg-dark">
      <div class="modal-header bg-dark border-0">
        <h5 class="modal-title text-white">Image du produit</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body d-flex align-items-center justify-content-center">
        <img id="lightboxImage" src="" alt="Produit" style="max-width: 90%; max-height: 90%; object-fit: contain;" />
      </div>
    </div>
  </div>
</div>

<!-- ============= JAVASCRIPT ============= -->
<script>
// Ouvrir le modal avec détails complets
async function openProductDetailPremium(produitId) {
  try {
    let produit = null;
    
    // 🎯 APPELER LE NOUVEL ENDPOINT ENRICHI avec tous les includes
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/protected/produits/${produitId}?include=mouvements,receptions,alertes,enregistrement`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        produit = data.data || data;
        console.log('✅ Endpoint enrichi utilisé:', data);
        console.log('📊 Mouvements:', produit.mouvements);
        console.log('📬 Réceptions:', produit.receptions);
        console.log('📋 Audit:', produit.audit);
      }
    } catch (apiErr) {
      console.warn('⚠️ Endpoint enrichi non disponible, fallback au cache');
    }

    // Fallback: chercher dans le cache
    if (!produit && CACHE_PRODUITS && Array.isArray(CACHE_PRODUITS)) {
      produit = CACHE_PRODUITS.find(p => p._id === produitId);
    }

    // Fallback: API classique
    if (!produit) {
      try {
        produit = await API.get(API_CONFIG.ENDPOINTS.PRODUIT, { produitId });
      } catch (apiErr) {
        console.warn('⚠️ Erreur API:', apiErr);
      }
    }

    if (!produit) {
      showToast('❌ Produit non trouvé', 'danger');
      return;
    }

    // ============ REMPLIR LES CHAMPS ============
    
    // Infos basiques
    document.getElementById('premiumProductId').value = produitId;
    document.getElementById('premiumProductName').textContent = produit.designation || '--';
    document.getElementById('premiumProductRef').textContent = produit.reference || '--';
    document.getElementById('premiumProductCategory').textContent = produit.typeProduitId?.nomType || '--';
    
    // Fournisseur: vient de la dernière réception ou '--'
    const supplier = (produit.receptions && produit.receptions.length > 0) 
      ? produit.receptions[0].fournisseur 
      : '--';
    document.getElementById('premiumProductSupplier').textContent = supplier;
    
    document.getElementById('premiumProductBrand').textContent = produit.champsDynamiques?.marque || '--';
    
    // Prix d'achat: depuis réception ou depuis produit
    const pricePurchase = (produit.receptions && produit.receptions.length > 0) 
      ? produit.receptions[0].prixAchat || 0
      : 0;
    document.getElementById('premiumPricePurchase').textContent = `${pricePurchase}€`;
    
    document.getElementById('premiumPriceSale').textContent = `${produit.prixUnitaire || 0}€`;
    document.getElementById('premiumLocation').textContent = produit.rayonId?.nomRayon || '--';

    // KPIs de stock
    document.getElementById('premiumStockCurrent').textContent = produit.quantiteActuelle || 0;
    document.getElementById('premiumStockMin').textContent = produit.seuilAlerte || 0;
    document.getElementById('premiumStockValue').textContent = `${((produit.quantiteActuelle || 0) * (produit.prixUnitaire || 0)).toFixed(2)}€`;
    
    // Badge stock
    const stockBadge = document.getElementById('premiumStockBadge');
    if ((produit.quantiteActuelle || 0) > (produit.seuilAlerte || 0)) {
      stockBadge.className = 'badge bg-success mt-2';
      stockBadge.textContent = '✅ En stock';
    } else if ((produit.quantiteActuelle || 0) > 0) {
      stockBadge.className = 'badge bg-warning mt-2';
      stockBadge.textContent = '⚠️ Stock faible';
    } else {
      stockBadge.className = 'badge bg-danger mt-2';
      stockBadge.textContent = '❌ Rupture';
    }

    // Caractéristiques
    document.getElementById('premiumSize').textContent = produit.champsDynamiques?.taille || '--';
    document.getElementById('premiumColor').textContent = produit.champsDynamiques?.couleur || '--';
    document.getElementById('premiumQuality').textContent = produit.champsDynamiques?.qualite || '--';
    document.getElementById('premiumUnit').textContent = produit.typeProduitId?.unitePrincipale || '--';
    document.getElementById('premiumCondition').textContent = produit.etat || 'Neuf';
    document.getElementById('premiumDateAdded').textContent = produit.dateEntree 
      ? new Date(produit.dateEntree).toLocaleDateString('fr-FR') 
      : '--';

    // Stats ventes (mock pour l'instant)
    document.getElementById('premiumMonthlySales').textContent = Math.floor(Math.random() * 100);
    document.getElementById('premiumOngoingOrders').textContent = Math.floor(Math.random() * 10);
    document.getElementById('premiumRotationRate').textContent = (Math.random() * 5).toFixed(1);

    // ============ ALERTES DÉTAILLÉES ============
    if (produit.alertes) {
      document.getElementById('premiumAlertStockActuel').textContent = produit.quantiteActuelle || 0;
      document.getElementById('premiumAlertSeuilAlerte').textContent = produit.seuilAlerte || 10;
      document.getElementById('premiumAlertsCount').textContent = 
        (produit.alertes.stockBas ? 1 : 0) + 
        (produit.alertes.rupture ? 1 : 0) + 
        (produit.alertes.peremption ? 1 : 0);

      // Mise à jour icône et label alerte
      const alertIcon = document.getElementById('premiumAlertIcon');
      const alertLabel = document.getElementById('premiumAlertLabel');
      const alertDesc = document.getElementById('premiumAlertDescription');

      if (produit.alertes.rupture) {
        alertIcon.className = 'fas fa-times-circle';
        alertIcon.style.color = '#dc3545';
        alertLabel.className = 'mb-0 text-danger';
        alertLabel.textContent = '🔴 Rupture';
        alertDesc.textContent = 'Stock épuisé!';
      } else if (produit.alertes.stockBas) {
        alertIcon.className = 'fas fa-exclamation-triangle';
        alertIcon.style.color = '#ffc107';
        alertLabel.className = 'mb-0 text-warning';
        alertLabel.textContent = '⚠️ Stock bas';
        alertDesc.textContent = 'Seuil d\'alerte atteint';
      } else {
        alertIcon.className = 'fas fa-check-circle';
        alertIcon.style.color = '#28a745';
        alertLabel.className = 'mb-0 text-success';
        alertLabel.textContent = '✅ OK';
        alertDesc.textContent = 'Stock normal';
      }
    }

    // Photo
    const photoImg = document.getElementById('premiumProductImage');
    const placeholder = document.getElementById('premiumImagePlaceholder');
    
    if (produit.photoUrl) {
      photoImg.src = produit.photoUrl;
      photoImg.style.display = 'block';
      placeholder.style.display = 'none';
    } else {
      photoImg.style.display = 'none';
      placeholder.style.display = 'block';
    }

    // ============ CHARGER MOUVEMENTS, RÉCEPTIONS, AUDIT, LOTS ============
    console.log('✅ Produit complet reçu:', produit);
    console.log('📊 Mouvements:', produit.mouvements);
    console.log('📬 Réceptions:', produit.receptions);
    console.log('📋 Audit:', produit.audit);
    console.log('🎁 Type produit:', produit.typeProduitId?.typeStockage);
    
    await loadPremiumMovements(produit.mouvements || []);
    await loadPremiumReceptions(produit.receptions || []);
    await loadPremiumAudit(produit.audit || {});
    
    // ✅ Si produit LOT, charger la section LOTS
    if (produit.typeProduitId?.typeStockage === 'lot') {
      console.log('🎁 Produit LOT détecté');
      document.getElementById('sectionLots').style.display = 'block';
      await loadPremiumLots(produit, produit.receptions || []);
    } else {
      console.log('📋 Produit SIMPLE (ou typeStockage non défini)');
      document.getElementById('sectionLots').style.display = 'none';
    }

    // Ouvrir le modal
    const modal = new bootstrap.Modal(document.getElementById('modalProductDetailPremium'));
    modal.show();

    // Ajouter l'event listener au bouton éditer
    const btnEdit = document.getElementById('btnEditProduct');
    if (btnEdit) {
      btnEdit.onclick = () => editerProduitPremium(produitId);
    }

  } catch (err) {
    console.error('❌ Erreur:', err);
    showToast('❌ Erreur: ' + err.message, 'danger');
  }
}

// ============ CHARGER RÉCEPTIONS ============
async function loadPremiumReceptions(receptions) {
  const container = document.getElementById('premiumReceptionsContainer');
  
  console.log('📥 Réceptions reçues:', receptions);
  console.log('📊 Nombre de réceptions:', Array.isArray(receptions) ? receptions.length : 'N/A');
  
  if (!receptions || !Array.isArray(receptions) || receptions.length === 0) {
    console.warn('⚠️ Pas de réceptions disponibles');
    container.innerHTML = '<div class="text-center text-muted py-4"><i class="fas fa-inbox"></i> Aucune réception</div>';
    return;
  }

  let html = '';
  receptions.forEach((reception, idx) => {
    console.log(`Réception ${idx}:`, reception);
    
    const dateReception = new Date(reception.dateReception).toLocaleDateString('fr-FR');
    const datePeremption = reception.datePeremption ? new Date(reception.datePeremption).toLocaleDateString('fr-FR') : 'N/A';
    const statutColor = reception.statut === 'stocke' ? 'success' : reception.statut === 'controle' ? 'warning' : 'danger';
    const jours = reception.datePeremption 
      ? Math.floor((new Date(reception.datePeremption) - new Date()) / (1000 * 60 * 60 * 24))
      : null;
    
    // 🎁 Détails LOT si présents
    const hasLotDetails = reception.nombrePieces || reception.quantiteParPiece;
    const lotDetailsHTML = hasLotDetails ? `
      <div class="alert alert-warning bg-warning bg-opacity-10 border-warning mb-3">
        <h6 class="mb-3 text-warning"><i class="fas fa-boxes me-2"></i>Détails Lot</h6>
        <div class="row g-3 small">
          <div class="col-md-3">
            <small class="text-muted d-block">Nombre de Pièces</small>
            <strong class="h5 text-warning">${reception.nombrePieces || '--'}</strong>
          </div>
          <div class="col-md-3">
            <small class="text-muted d-block">Quantité par Pièce</small>
            <strong class="h5">${(reception.quantiteParPiece || 0).toLocaleString('fr-FR', {minimumFractionDigits: 2})}</strong>
          </div>
          <div class="col-md-3">
            <small class="text-muted d-block">Unité</small>
            <span class="badge bg-info h5 py-2">${reception.uniteDetail || '--'}</span>
          </div>
          <div class="col-md-3">
            <small class="text-muted d-block">Prix par Unité</small>
            <strong class="h5 text-success">${(reception.prixParUnite || 0).toLocaleString('fr-FR', {minimumFractionDigits: 2})} CDF</strong>
          </div>
        </div>
        <hr class="my-3">
        <div class="row g-2">
          <div class="col-md-6">
            <small class="text-muted d-block">Quantité Totale</small>
            <strong>${((reception.nombrePieces || 0) * (reception.quantiteParPiece || 0)).toLocaleString('fr-FR', {minimumFractionDigits: 2})} ${reception.uniteDetail || 'unité'}</strong>
          </div>
          <div class="col-md-6">
            <small class="text-muted d-block">Valeur Totale</small>
            <strong class="text-success">${(((reception.nombrePieces || 0) * (reception.quantiteParPiece || 0)) * (reception.prixParUnite || 0)).toLocaleString('fr-FR', {minimumFractionDigits: 2})} CDF</strong>
          </div>
        </div>
      </div>
    ` : '';
    
    html += `
      <div class="accordion-item border-0 border-bottom mb-2">
        <h2 class="accordion-header">
          <button class="accordion-button collapsed p-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${idx}">
            <div class="w-100">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <strong>📦 ${reception.quantite} unités</strong>
                  ${hasLotDetails ? `<span class="badge bg-warning ms-2"><i class="fas fa-cube me-1"></i>LOT</span>` : ''}
                  <small class="text-muted ms-2">• ${dateReception}</small>
                </div>
                <span class="badge bg-${statutColor}">${reception.statut}</span>
              </div>
              <small class="text-muted d-block mt-1">🏢 ${reception.fournisseur || 'Fournisseur non spécifié'}</small>
            </div>
          </button>
        </h2>
        <div id="collapse${idx}" class="accordion-collapse collapse" data-bs-parent="#premiumReceptionsContainer">
          <div class="accordion-body p-4 bg-light">
            ${lotDetailsHTML}
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <small class="text-muted d-block">Prix achat unitaire</small>
                  <strong>${(reception.prixAchat || 0).toFixed(2)}€</strong>
                </div>
                <div class="mb-3">
                  <small class="text-muted d-block">Prix total</small>
                  <strong class="text-success">${(reception.prixTotal || 0).toFixed(2)}€</strong>
                </div>
                <div class="mb-3">
                  <small class="text-muted d-block">Lot/Série</small>
                  <strong>${reception.lotNumber || 'N/A'}</strong>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <small class="text-muted d-block">Date fabrication</small>
                  <strong>${reception.dateFabrication ? new Date(reception.dateFabrication).toLocaleDateString('fr-FR') : 'N/A'}</strong>
                </div>
                <div class="mb-3">
                  <small class="text-muted d-block">Date péremption</small>
                  <strong class="${jours !== null && jours < 0 ? 'text-danger' : jours !== null && jours < 30 ? 'text-warning' : ''}">${datePeremption}</strong>
                  ${jours !== null && jours < 0 ? '<span class="badge bg-danger ms-2">PÉRIMÉ</span>' : ''}
                  ${jours !== null && jours >= 0 && jours < 30 ? `<span class="badge bg-warning ms-2">${jours} jours</span>` : ''}
                </div>
                <div>
                  <small class="text-muted d-block">Enregistré par</small>
                  <strong>${reception.utilisateurId?.prenom || '--'} ${reception.utilisateurId?.nom || '--'}</strong>
                </div>
              </div>
            </div>
            ${reception.photoUrl ? `
              <div class="mt-3">
                <small class="text-muted d-block mb-2">📷 Photo réception</small>
                <img src="${reception.photoUrl}" alt="Photo" style="max-width: 200px; max-height: 200px; border-radius: 4px; cursor: pointer;" onclick="showImageLightboxFromUrl('${reception.photoUrl}')">
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ============ CHARGER MOUVEMENTS ============
async function loadPremiumMovements(mouvements) {
  try {
    const tbody = document.getElementById('premiumMovementsTable');
    
    if (!mouvements || mouvements.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4"><i class="fas fa-inbox"></i> Aucun mouvement</td></tr>';
      return;
    }

    let html = '';
    mouvements.slice(0, 20).forEach(m => {
      // 📅 Format date lisible: "6 janvier 2026"
      const dateObj = new Date(m.dateDocument);
      const date = dateObj.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
      
      // 📋 Traduire le type
      const typeMap = {
        'ENTREE_INITIALE': 'Entrée initiale',
        'RECEPTION': 'Réception',
        'entree': 'Entrée',
        'SORTIE': 'Sortie',
        'sortie': 'Sortie',
        'AJUSTEMENT': 'Ajustement',
        'ajustement': 'Ajustement',
        'TRANSFERT': 'Transfert',
        'transfert': 'Transfert'
      };
      const typeAffiche = typeMap[m.type] || m.type || 'Inconnu';
      const couleur = (m.type === 'ENTREE_INITIALE' || m.type === 'RECEPTION' || m.type === 'entree') ? 'success' : 'danger';
      const icon = (m.type === 'ENTREE_INITIALE' || m.type === 'RECEPTION' || m.type === 'entree') ? 'arrow-down' : 'arrow-up';
      
      // 📝 Récupérer les détails dans l'ordre de priorité
      let details = '';
      if (m.observations) {
        details = m.observations;
      } else if (m.fournisseur && m.fournisseur !== 'Non spécifié') {
        details = `Réception ${m.fournisseur}`;
      } else if (m.numeroDocument) {
        details = m.numeroDocument;
      } else {
        details = 'N/A';
      }
      
      // 👤 Récupère le nom de l'utilisateur
      const utilisateur = m.utilisateurId?.prenom && m.utilisateurId?.nom 
        ? `${m.utilisateurId.prenom} ${m.utilisateurId.nom}`
        : m.utilisateurId?.prenom || '--';
      
      html += `
        <tr>
          <td><small>${date}</small></td>
          <td><span class="badge bg-${couleur}"><i class="fas fa-${icon} me-1"></i>${typeAffiche}</span></td>
          <td><strong>${m.quantite || 0}</strong></td>
          <td><small>${details}</small></td>
          <td><small class="text-muted">${utilisateur}</small></td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

  } catch (err) {
    console.warn('❌ Erreur chargement mouvements:', err);
    document.getElementById('premiumMovementsTable').innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">Erreur chargement</td></tr>';
  }
}

// ============ CHARGER AUDIT ============
async function loadPremiumAudit(audit) {
  try {
    console.log('DEBUG - Audit reçu:', audit);
    
    if (!audit) {
      document.getElementById('premiumAuditCreatedBy').textContent = '(Inconnu)';
      document.getElementById('premiumAuditUpdatedBy').textContent = '(Inconnu)';
      return;
    }
    
    // Créé par
    const createdBy = audit.createdBy || {};
    let createdByName = '(Inconnu)';
    
    // Construire le nom à partir des parties disponibles
    if (createdBy) {
      const prenom = (createdBy.prenom || '').trim();
      const nom = (createdBy.nom || '').trim();
      
      if (prenom || nom) {
        createdByName = `${prenom} ${nom}`.trim();
      }
    }
    
    const createdAt = audit.createdAt 
      ? new Date(audit.createdAt).toLocaleDateString('fr-FR') 
      : '--';
    
    console.log('✅ Créé par:', createdByName, '@ ', createdAt);
    document.getElementById('premiumAuditCreatedBy').textContent = createdByName;
    document.getElementById('premiumAuditCreatedAt').textContent = createdAt;
    
    // Modifié par
    const updatedBy = audit.updatedBy || {};
    let updatedByName = '(Inconnu)';
    let updatedAtText = '--';
    
    // Construire le nom à partir des parties disponibles
    if (updatedBy) {
      const prenom = (updatedBy.prenom || '').trim();
      const nom = (updatedBy.nom || '').trim();
      
      if (prenom || nom) {
        updatedByName = `${prenom} ${nom}`.trim();
      }
    }
    
    updatedAtText = audit.updatedAt 
      ? new Date(audit.updatedAt).toLocaleDateString('fr-FR') 
      : '--';
    
    console.log('✅ Modifié par:', updatedByName, '@ ', updatedAtText);
    document.getElementById('premiumAuditUpdatedBy').textContent = updatedByName;
    document.getElementById('premiumAuditUpdatedAt').textContent = updatedAtText;
    
    // Afficher les logs d'activité si disponibles
    if (audit.logs && audit.logs.length > 0) {
      console.log('✅ Activity logs disponibles:', audit.logs.length, 'entries');
      audit.logs.forEach((log, idx) => {
        console.log(`  Log ${idx + 1}:`, log.action, '- Utilisateur:', log.utilisateur?.prenom, log.utilisateur?.nom);
      });
    }

  } catch (err) {
    console.warn('⚠️ Erreur chargement audit:', err);
    document.getElementById('premiumAuditCreatedBy').textContent = '(Erreur)';
    document.getElementById('premiumAuditUpdatedBy').textContent = '(Erreur)';
  }
}

// ============ CHARGER LOTS (pour produits LOT) ============
async function loadPremiumLots(produit, receptions) {
  try {
    const tbody = document.getElementById('premiumLotsTable');
    
    // Extraire les LOTs des réceptions
    let lots = [];
    if (Array.isArray(receptions)) {
      receptions.forEach(reception => {
        if (reception.nombrePieces) {
          lots.push({
            nombrePieces: reception.nombrePieces,
            quantiteParPiece: reception.quantiteParPiece,
            uniteDetail: reception.uniteDetail,
            prixParUnite: reception.prixParUnite,
            dateReception: reception.dateReception,
            fournisseur: reception.fournisseur,
            reception: reception
          });
        }
      });
    }

    console.log('🎁 LOTs trouvés:', lots);

    if (!lots || lots.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4"><i class="fas fa-inbox"></i> Aucun lot</td></tr>';
      document.getElementById('premiumLotsTotalPieces').textContent = '0';
      document.getElementById('premiumLotsQtyTotal').textContent = '0';
      document.getElementById('premiumLotsValueTotal').textContent = '0 CDF';
      return;
    }

    // Calculer les totaux
    let totalPieces = 0;
    let totalQty = 0;
    let totalValue = 0;

    let html = '';
    lots.forEach((lot, idx) => {
      const nombrePieces = lot.nombrePieces || 0;
      const qtyParPiece = lot.quantiteParPiece || 0;
      const unite = lot.uniteDetail || 'unité';
      const prixParUnite = lot.prixParUnite || 0;
      
      const totalQtyLot = nombrePieces * qtyParPiece;
      const totalPrixLot = totalQtyLot * prixParUnite;

      totalPieces += nombrePieces;
      totalQty += totalQtyLot;
      totalValue += totalPrixLot;

      const dateReception = lot.dateReception 
        ? new Date(lot.dateReception).toLocaleDateString('fr-FR')
        : 'N/A';

      html += `
        <tr class="align-middle">
          <td>
            <span class="badge bg-warning text-dark">
              <i class="fas fa-cube me-1"></i>
              <strong>${nombrePieces}</strong>
            </span>
          </td>
          <td>
            <strong>${(qtyParPiece).toLocaleString('fr-FR', {minimumFractionDigits: 2})}</strong>
          </td>
          <td>
            <span class="badge bg-info">${unite}</span>
          </td>
          <td>
            <span class="text-success fw-bold">
              ${(prixParUnite).toLocaleString('fr-FR', {minimumFractionDigits: 2})} CDF
            </span>
          </td>
          <td>
            <div>
              <small class="text-muted d-block">
                <strong>${(totalQtyLot).toLocaleString('fr-FR', {minimumFractionDigits: 2})}</strong> ${unite}
              </small>
              <strong class="text-success d-block">
                ${(totalPrixLot).toLocaleString('fr-FR', {minimumFractionDigits: 2})} CDF
              </strong>
            </div>
          </td>
          <td>
            <small class="text-muted">${dateReception}</small>
          </td>
          <td>
            <button class="btn btn-sm btn-info" title="Voir réception" onclick="showReceptionDetail('${lot.reception._id || ''}')">
              <i class="fas fa-eye"></i>
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

    // Mettre à jour les totaux
    document.getElementById('premiumLotsTotalPieces').textContent = totalPieces;
    document.getElementById('premiumLotsQtyTotal').textContent = (totalQty).toLocaleString('fr-FR', {minimumFractionDigits: 2});
    document.getElementById('premiumLotsQtyUnit').textContent = lots.length > 0 ? (lots[0].uniteDetail || 'unité') : 'unité';
    document.getElementById('premiumLotsValueTotal').textContent = (totalValue).toLocaleString('fr-FR', {minimumFractionDigits: 2}) + ' CDF';

    console.log('✅ LOTs affichés. Total:', { totalPieces, totalQty, totalValue });

  } catch (err) {
    console.warn('❌ Erreur chargement LOTs:', err);
    document.getElementById('premiumLotsTable').innerHTML = '<tr><td colspan="7" class="text-center text-danger py-4">Erreur chargement</td></tr>';
  }
}

// Ouvrir lightbox image
function ouvrirImageLightbox() {
  const src = document.getElementById('premiumProductImage').src;
  if (!src) {
    showToast('Aucune image disponible', 'info');
    return;
  }
  document.getElementById('lightboxImage').src = src;
  new bootstrap.Modal(document.getElementById('imageLightbox')).show();
}

// Ouvrir lightbox pour image URL (réceptions)
function showImageLightboxFromUrl(url) {
  if (!url) {
    showToast('Aucune image disponible', 'info');
    return;
  }
  document.getElementById('lightboxImage').src = url;
  new bootstrap.Modal(document.getElementById('imageLightbox')).show();
}

// Éditer le produit
function editerProduitPremium(produitId) {
  // Récupérer l'ID depuis le paramètre ou depuis le DOM
  const pId = produitId || document.getElementById('premiumProductId').value;
  
  if (!pId) {
    showToast('❌ Produit non trouvé', 'danger');
    return;
  }

  console.log('✏️ Édition produit:', pId);
  
  // Afficher un spinner de chargement
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'editLoadingOverlay';
  loadingOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  loadingOverlay.innerHTML = `
    <div class="text-center">
      <div class="spinner-border text-white mb-3" role="status" style="width: 60px; height: 60px;">
        <span class="visually-hidden">Chargement...</span>
      </div>
      <p class="text-white fw-bold">Préparation du formulaire d'édition...</p>
    </div>
  `;
  
  document.body.appendChild(loadingOverlay);
  
  // Fermer le modal détail
  const detailModal = bootstrap.Modal.getInstance(document.getElementById('modalProductDetailPremium'));
  if (detailModal) {
    detailModal.hide();
  }
  
  // Ouvrir le modal d'édition (depuis product-edit.js)
  openProductEditModal(pId);
  
  // ⏳ Retirer le spinner une fois que le modal edit est complètement affiché
  const editModal = document.getElementById('modalEditProduit');
  if (editModal) {
    editModal.addEventListener('shown.bs.modal', function removeOverlay() {
      const overlay = document.getElementById('editLoadingOverlay');
      if (overlay) {
        overlay.style.transition = 'opacity 0.3s ease-out';
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
      }
      // Retirer l'event listener après l'avoir utilisé
      editModal.removeEventListener('shown.bs.modal', removeOverlay);
    }, { once: true });
  }
}

// Ajouter des alertes
function updatePremiumAlerts() {
  const alertes = 0; // À calculer depuis les données
  document.getElementById('premiumAlertsCount').textContent = alertes;
}

// Afficher le détail d'une réception
function showReceptionDetail(receptionId) {
  if (!receptionId) {
    showToast('⚠️ Réception non trouvée', 'warning');
    return;
  }
  showToast('ℹ️ Réception: ' + receptionId, 'info');
  // À améliorer: naviguer vers le détail de la réception
}
</script>

<style>
#modalProductDetailPremium .card {
  transition: transform 0.2s, box-shadow 0.2s;
}

#modalProductDetailPremium .card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
}

.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.table-hover tbody tr:hover {
  background-color: rgba(102, 126, 234, 0.05);
}
</style>
