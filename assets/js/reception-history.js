// ============================================================================
// HISTORIQUE DES RÉCEPTIONS
// Affiche la liste de toutes les réceptions du magasin avec filtres
// ============================================================================

let RECEPTIONS_LIST = null;
let RECEPTIONS_DATA = [];
let CURRENT_PAGE = 1;
let ITEMS_PER_PAGE = 20;

// ================================
// 📊 CHARGER L'HISTORIQUE
// ================================

async function chargerHistoriqueReceptions(filters = {}) {
  try {
    // Afficher le spinner
    const spinner = document.getElementById('spinnerHistoriqueReceptions');
    if (spinner) spinner.style.display = 'flex';

    const tableContainer = document.getElementById('historiqueReceptionsTable');
    if (!tableContainer) return;

    // Construire les paramètres de recherche
    const params = new URLSearchParams({
      magasinId: MAGASIN_ID,
      limit: ITEMS_PER_PAGE,
      page: CURRENT_PAGE,
      ...filters
    });

    const token = localStorage.getItem('token') || localStorage.getItem('authToken');

    // Récupérer les réceptions
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/protected/receptions?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des réceptions');
    }

    const data = await response.json();
    RECEPTIONS_DATA = data.receptions || [];

    console.log(`✅ ${RECEPTIONS_DATA.length} réceptions chargées`);

    // Masquer le spinner
    if (spinner) spinner.style.display = 'none';

    // Afficher les réceptions
    afficherHistoriqueReceptions();

    // Mettre à jour la pagination
    mettreAJourPaginationReceptions(data.total, data.pages);

    // Afficher les stats
    afficherStatsReceptions(data.stats);

  } catch (error) {
    console.error('❌ Erreur chargement historique:', error);
    showToast('❌ Erreur: ' + error.message, 'danger');

    const spinner = document.getElementById('spinnerHistoriqueReceptions');
    if (spinner) spinner.style.display = 'none';
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

  RECEPTIONS_DATA.forEach(reception => {
    const produit = reception.produitId || {};
    const dateFormatted = new Date(reception.dateReception).toLocaleDateString('fr-FR');
    const statutBadge = getStatutBadge(reception.statut);
    const prixTotal = (reception.prixTotal || 0).toFixed(2);

    html += `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            ${produit.image ? `<img src="${produit.image}" alt="" style="width: 35px; height: 35px; border-radius: 4px; object-fit: cover;">` : '<div style="width: 35px; height: 35px; background: #e9ecef; border-radius: 4px;"></div>'}
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
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/protected/receptions/${receptionId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du détail');
    }

    const data = await response.json();
    const reception = data.reception;

    // Créer et afficher un modal avec les détails
    afficherModalDetailReception(reception);

  } catch (error) {
    console.error('❌ Erreur:', error);
    showToast('❌ Erreur: ' + error.message, 'danger');
  }
}

// ================================
// 🪟 MODAL DÉTAIL RÉCEPTION
// ================================

function afficherModalDetailReception(reception) {
  const produit = reception.produitId || {};
  const utilisateur = reception.utilisateurId || {};
  const dateFormatted = new Date(reception.dateReception).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const datePeremption = reception.datePeremption ? new Date(reception.datePeremption).toLocaleDateString('fr-FR') : 'N/A';
  const datePeremptionClass = reception.datePeremption && new Date(reception.datePeremption) < new Date() ? 'text-danger' : '';

  const html = `
    <div class="modal fade" id="modalDetailReception" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-light">
            <h5 class="modal-title">
              <i class="fas fa-info-circle"></i> Détail Réception
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <h6 class="text-muted mb-2">PRODUIT</h6>
                <div class="card border-0 bg-light p-3">
                  <div class="d-flex align-items-start gap-3">
                    ${produit.image ? `<img src="${produit.image}" alt="" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover;">` : '<div style="width: 80px; height: 80px; background: #e9ecef; border-radius: 8px;"></div>'}
                    <div>
                      <strong>${produit.designation || 'N/A'}</strong>
                      <p class="text-muted small mb-1">Référence: ${produit.reference || 'N/A'}</p>
                      <p class="text-muted small">Stock actuel: ${produit.quantiteActuelle || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <h6 class="text-muted mb-2">STATUT</h6>
                <div class="mb-2">
                  ${getStatutBadge(reception.statut)}
                </div>
                <h6 class="text-muted mb-2 mt-3">PRIORITÉ</h6>
                <p><strong>${reception.priorite === 'urgente' ? '🔴 Urgente' : '🟢 Normale'}</strong></p>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <h6 class="text-muted">Quantité</h6>
                <h4><strong>${reception.quantite}</strong></h4>
              </div>
              <div class="col-md-6">
                <h6 class="text-muted">Prix Total</h6>
                <h4><strong>${(reception.prixTotal || 0).toFixed(2)}€</strong></h4>
              </div>
            </div>

            <hr>

            <div class="row mb-3">
              <div class="col-md-6">
                <h6 class="text-muted">Fournisseur</h6>
                <p><strong>${reception.fournisseur || 'Non spécifié'}</strong></p>
              </div>
              <div class="col-md-6">
                <h6 class="text-muted">N° Lot</h6>
                <p><strong>${reception.lotNumber || 'N/A'}</strong></p>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <h6 class="text-muted">Date Réception</h6>
                <p><strong>${dateFormatted}</strong></p>
              </div>
              <div class="col-md-6">
                <h6 class="text-muted">Date Péremption</h6>
                <p><strong class="${datePeremptionClass}">${datePeremption}</strong></p>
              </div>
            </div>

            ${reception.dateFabrication ? `
              <div class="row mb-3">
                <div class="col-md-6">
                  <h6 class="text-muted">Date Fabrication</h6>
                  <p><strong>${new Date(reception.dateFabrication).toLocaleDateString('fr-FR')}</strong></p>
                </div>
              </div>
            ` : ''}

            <hr>

            <div class="row">
              <div class="col-md-6">
                <h6 class="text-muted">Enregistré par</h6>
                <p><strong>${utilisateur.prenom || ''} ${utilisateur.nom || 'N/A'}</strong></p>
              </div>
              <div class="col-md-6">
                <h6 class="text-muted">Date d'enregistrement</h6>
                <p><strong>${new Date(reception.createdAt).toLocaleString('fr-FR')}</strong></p>
              </div>
            </div>

            ${reception.photoUrl ? `
              <hr>
              <div>
                <h6 class="text-muted">Photo</h6>
                <img src="${reception.photoUrl}" alt="Photo réception" class="img-fluid" style="max-width: 100%; border-radius: 8px;">
              </div>
            ` : ''}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Injecter et afficher le modal
  const modalContainer = document.getElementById('detailReceptionContainer') || document.body;
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

// ================================
// 📊 AFFICHER STATS
// ================================

function afficherStatsReceptions(stats) {
  const statsContainer = document.getElementById('statsReceptions');
  if (!statsContainer) return;

  const controle = stats['controle'] || { count: 0, totalQuantite: 0, totalPrix: 0 };
  const stocke = stats['stocke'] || { count: 0, totalQuantite: 0, totalPrix: 0 };
  const rejete = stats['rejete'] || { count: 0, totalQuantite: 0, totalPrix: 0 };

  const html = `
    <div class="row">
      <div class="col-md-4">
        <div class="card border-warning">
          <div class="card-body text-center">
            <h6 class="text-muted mb-2"><i class="fas fa-hourglass-half text-warning"></i> En contrôle</h6>
            <h3 class="text-warning">${controle.count}</h3>
            <small class="text-muted d-block">${controle.totalQuantite} articles</small>
            <small class="text-muted">${(controle.totalPrix || 0).toFixed(2)}€</small>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-success">
          <div class="card-body text-center">
            <h6 class="text-muted mb-2"><i class="fas fa-check-circle text-success"></i> Stocké</h6>
            <h3 class="text-success">${stocke.count}</h3>
            <small class="text-muted d-block">${stocke.totalQuantite} articles</small>
            <small class="text-muted">${(stocke.totalPrix || 0).toFixed(2)}€</small>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-danger">
          <div class="card-body text-center">
            <h6 class="text-muted mb-2"><i class="fas fa-times-circle text-danger"></i> Rejeté</h6>
            <h3 class="text-danger">${rejete.count}</h3>
            <small class="text-muted d-block">${rejete.totalQuantite} articles</small>
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
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modalReception');
  if (modal) {
    modal.addEventListener('shown.bs.modal', () => {
      const tabHistorique = document.querySelector('a[href="#historiqueReceptions"]');
      if (tabHistorique && tabHistorique.classList.contains('active')) {
        chargerHistoriqueReceptions();
      }
    });
  }
});

console.log('✅ Module historique des réceptions chargé');
