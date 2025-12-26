<!-- ================================================================
     MODAL DÉTAIL PRODUIT - VERSION PREMIUM COMPLÈTE
     Design moderne ERP avec tous les détails du produit
     ================================================================ -->
<div class="modal fade" id="modalProductDetailPremium" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-scrollable" style="max-width: 95vw;">
    <div class="modal-content border-0 shadow-lg">
      
      <!-- ============= HEADER ============= -->
      <div class="modal-header bg-gradient p-0 border-0">
        <div class="w-100 p-4" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="fas fa-box me-2"></i>Détail du Produit
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
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
            <div class="card border-0 shadow-sm overflow-hidden">
              <!-- Image -->
              <div style="background: #f8f9fa; height: 250px; display: flex; align-items: center; justify-content: center; position: relative;">
                <img id="premiumProductImage" src="" alt="Produit" style="max-width: 100%; max-height: 100%; object-fit: cover; display: none;" />
                <div id="premiumImagePlaceholder" class="text-center text-muted">
                  <i class="fas fa-image" style="font-size: 48px; opacity: 0.3;"></i>
                  <p class="mt-2 small">Pas d'image</p>
                </div>
              </div>

              <!-- Bouton voir image -->
              <div class="card-body p-3 text-center">
                <button type="button" class="btn btn-sm btn-outline-primary w-100" onclick="ouvrirImageLightbox()">
                  <i class="fas fa-expand me-2"></i>Voir l'image
                </button>
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

        <!-- ========== SECTION 5: TABLE MOUVEMENTS ========== -->
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
                </tr>
              </thead>
              <tbody id="premiumMovementsTable">
                <tr>
                  <td colspan="4" class="text-center text-muted py-4">
                    <i class="fas fa-spinner fa-spin me-2"></i>Chargement...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- ============= FOOTER ============= -->
      <div class="modal-footer bg-light border-top">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
          <i class="fas fa-times me-2"></i>Fermer
        </button>
        <button type="button" class="btn btn-primary" onclick="editerProduitPremium()">
          <i class="fas fa-edit me-2"></i>Modifier
        </button>
      </div>

    </div>
  </div>
</div>

<!-- ============= LIGHTBOX IMAGE ============= -->
<div class="modal fade" id="imageLightbox" tabindex="-1" aria-hidden="true">
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
    
    // Chercher dans le cache
    if (CACHE_PRODUITS && Array.isArray(CACHE_PRODUITS)) {
      produit = CACHE_PRODUITS.find(p => p._id === produitId);
    }
    
    // Si pas trouvé, appeler l'API
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

    // Remplir les champs
    document.getElementById('premiumProductId').value = produitId;
    document.getElementById('premiumProductName').textContent = produit.designation || '--';
    document.getElementById('premiumProductRef').textContent = produit.reference || '--';
    document.getElementById('premiumProductCategory').textContent = produit.typeProduitsId?.nomType || '--';
    document.getElementById('premiumProductSupplier').textContent = produit.fournisseur || '--';
    document.getElementById('premiumProductBrand').textContent = produit.marque || '--';
    document.getElementById('premiumPricePurchase').textContent = `${produit.prixAchat || 0}€`;
    document.getElementById('premiumPriceSale').textContent = `${produit.prixUnitaire || 0}€`;
    document.getElementById('premiumLocation').textContent = produit.rayonId?.nomRayon || '--';

    // KPIs
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
    document.getElementById('premiumSize').textContent = produit.taille || '--';
    document.getElementById('premiumColor').textContent = produit.couleur || '--';
    document.getElementById('premiumQuality').textContent = produit.qualite || '--';
    document.getElementById('premiumUnit').textContent = produit.unitePrincipale || '--';
    document.getElementById('premiumCondition').textContent = produit.etat || '--';
    document.getElementById('premiumDateAdded').textContent = new Date(produit.dateEntree).toLocaleDateString('fr-FR');

    // Stats ventes (mock pour l'instant)
    document.getElementById('premiumMonthlySales').textContent = Math.floor(Math.random() * 100);
    document.getElementById('premiumOngoingOrders').textContent = Math.floor(Math.random() * 10);
    document.getElementById('premiumRotationRate').textContent = (Math.random() * 5).toFixed(1);

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

    // Charger les mouvements
    await loadPremiumMovements(produitId);

    // Ouvrir le modal
    const modal = new bootstrap.Modal(document.getElementById('modalProductDetailPremium'));
    modal.show();

  } catch (err) {
    console.error('❌ Erreur:', err);
    showToast('❌ Erreur: ' + err.message, 'danger');
  }
}

// Charger les mouvements de stock
async function loadPremiumMovements(produitId) {
  try {
    const tbody = document.getElementById('premiumMovementsTable');
    
    // Mock data - Remplacer avec l'appel API réel
    const mouvements = [
      { date: new Date().toLocaleDateString(), type: 'Entrée', quantite: 50, details: 'Réception fournisseur ABC' },
      { date: new Date(Date.now() - 86400000).toLocaleDateString(), type: 'Sortie', quantite: 10, details: 'Vente client XYZ' },
      { date: new Date(Date.now() - 172800000).toLocaleDateString(), type: 'Entrée', quantite: 100, details: 'Réception fournisseur DEF' }
    ];

    if (mouvements.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">Aucun mouvement</td></tr>';
      return;
    }

    let html = '';
    mouvements.forEach(m => {
      const couleur = m.type === 'Entrée' ? 'success' : 'danger';
      const icon = m.type === 'Entrée' ? 'arrow-down' : 'arrow-up';
      
      html += `
        <tr>
          <td><small class="text-muted">${m.date}</small></td>
          <td><span class="badge bg-${couleur}"><i class="fas fa-${icon} me-1"></i>${m.type}</span></td>
          <td><strong>${m.quantite}</strong></td>
          <td><small>${m.details}</small></td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

  } catch (err) {
    console.warn('Erreur chargement mouvements:', err);
    document.getElementById('premiumMovementsTable').innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">Erreur chargement</td></tr>';
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

// Éditer le produit
function editerProduitPremium() {
  const produitId = document.getElementById('premiumProductId').value;
  console.log('✏️ Édition produit:', produitId);
  
  // Fermer le modal détail
  bootstrap.Modal.getInstance(document.getElementById('modalProductDetailPremium')).hide();
  
  // Ouvrir le modal d'édition (à implémenter)
  showToast('⏳ Fonctionnalité d\'édition en développement', 'info');
}

// Ajouter des alertes
function updatePremiumAlerts() {
  const alertes = 0; // À calculer depuis les données
  document.getElementById('premiumAlertsCount').textContent = alertes;
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
