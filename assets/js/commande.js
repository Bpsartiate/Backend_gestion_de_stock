/**
 * Gestionnaire des Commandes (Receptive Ordering System)
 * Phase: Commandes & Réceptions
 * Date: 04/02/2026
 */

class CommandeManager {
  constructor(magasinId) {
    this.magasinId = magasinId;
    this.commandes = [];
    this.currentCommande = null;
    this.TOKEN = localStorage.getItem('token');
    this.API_BASE = '/api/protected';
  }

  /**
   * 📋 Récupérer toutes les commandes d'un magasin
   */
  async loadCommandes(statut = null) {
    try {
      let url = `${this.API_BASE}/commandes?magasinId=${this.magasinId}`;
      if (statut) url += `&statut=${statut}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Erreur chargement commandes');

      const data = await response.json();
      this.commandes = data.commandes || [];
      return this.commandes;
    } catch (error) {
      console.error('❌ Error loading commandes:', error);
      throw error;
    }
  }

  /**
   * 📌 Créer une commande pour un produit
   */
  async createCommande({
    produitId,
    quantiteCommandee,
    prixUnitaire,
    fournisseur,
    dateEcheance,
    notes
  }) {
    try {
      const response = await fetch(`${this.API_BASE}/commandes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          produitId,
          magasinId: this.magasinId,
          quantiteCommandee: parseInt(quantiteCommandee),
          prixUnitaire: parseFloat(prixUnitaire),
          fournisseur,
          dateEcheance,
          notes
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur création commande');
      }

      const data = await response.json();
      this.currentCommande = data.commande;
      this.commandes.push(data.commande);
      
      return data;
    } catch (error) {
      console.error('❌ Error creating commande:', error);
      throw error;
    }
  }

  /**
   * 📦 Enregistrer la réception d'une commande
   */
  async receptionCommande({
    commandeId,
    quantiteRecue,
    rayons = [] // [{rayonId, quantite}, ...]
  }) {
    try {
      const response = await fetch(`${this.API_BASE}/commandes/${commandeId}/recevoir`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantiteRecue: parseInt(quantiteRecue),
          rayons
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur réception');
      }

      const data = await response.json();
      
      // Mettre à jour la commande dans le cache
      const index = this.commandes.findIndex(c => c._id === commandeId);
      if (index !== -1) {
        this.commandes[index] = data.commande;
      }

      return data;
    } catch (error) {
      console.error('❌ Error receiving commande:', error);
      throw error;
    }
  }

  /**
   * ✏️ Mettre à jour le statut d'une commande
   */
  async updateStatut(commandeId, statut) {
    try {
      const response = await fetch(`${this.API_BASE}/commandes/${commandeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statut })
      });

      if (!response.ok) throw new Error('Erreur mise à jour');

      const data = await response.json();
      
      const index = this.commandes.findIndex(c => c._id === commandeId);
      if (index !== -1) {
        this.commandes[index] = data.commande;
      }

      return data.commande;
    } catch (error) {
      console.error('❌ Error updating statut:', error);
      throw error;
    }
  }

  /**
   * 🚚 Marquer comme expédiée
   */
  async marquerExpediee(commandeId) {
    try {
      const response = await fetch(`${this.API_BASE}/commandes/${commandeId}/marquer-expediee`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Erreur');

      const data = await response.json();
      const index = this.commandes.findIndex(c => c._id === commandeId);
      if (index !== -1) {
        this.commandes[index] = data.commande;
      }

      return data.commande;
    } catch (error) {
      console.error('❌ Error marking as shipped:', error);
      throw error;
    }
  }

  /**
   * ❌ Annuler une commande
   */
  async annulerCommande(commandeId) {
    try {
      const response = await fetch(`${this.API_BASE}/commandes/${commandeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Erreur annulation');

      const data = await response.json();
      this.commandes = this.commandes.filter(c => c._id !== commandeId);
      return data;
    } catch (error) {
      console.error('❌ Error cancelling commande:', error);
      throw error;
    }
  }

  /**
   * 🎨 Afficher liste des commandes
   */
  displayCommandes(containerId, filter = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let filtered = this.commandes;

    // Filtrer par statut si spécifié
    if (filter.statut) {
      filtered = filtered.filter(c => c.statut === filter.statut);
    }

    const html = `
      <div class="table-responsive">
        <table class="table table-sm table-hover">
          <thead class="table-dark">
            <tr>
              <th>Produit</th>
              <th>Fournisseur</th>
              <th>Qté Cmd.</th>
              <th>Qté Reçue</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(commande => this.renderCommandeRow(commande)).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
    this.attachCommandeEventListeners();
  }

  /**
   * Render une ligne de commande
   */
  renderCommandeRow(commande) {
    const statusBadge = this.getStatusBadge(commande.statut);
    const dateCmd = new Date(commande.dateCommande).toLocaleDateString();
    const pourcentage = Math.round((commande.quantiteRecue / commande.quantiteCommandee) * 100);

    return `
      <tr data-commande-id="${commande._id}">
        <td>
          <strong>${commande.produitId?.designation || 'N/A'}</strong>
          <br>
          <small class="text-muted">${commande.numeroCommande}</small>
        </td>
        <td>${commande.fournisseur || '-'}</td>
        <td>${commande.quantiteCommandee}</td>
        <td>
          <div class="progress" style="height: 20px;">
            <div class="progress-bar bg-success" style="width: ${pourcentage}%">
              ${commande.quantiteRecue}
            </div>
          </div>
        </td>
        <td>${statusBadge}</td>
        <td>${dateCmd}</td>
        <td>
          <div class="btn-group btn-group-sm">
            ${this.renderActionButtons(commande)}
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * Boutons d'action selon le statut
   */
  renderActionButtons(commande) {
    let buttons = `
      <button class="btn btn-info btn-sm view-commande" title="Détails">
        <i class="fas fa-eye"></i>
      </button>
    `;

    if (commande.statut === 'EN_ATTENTE') {
      buttons += `
        <button class="btn btn-warning btn-sm mark-expedie" title="Marquer expédiée">
          <i class="fas fa-truck"></i>
        </button>
      `;
    }

    if (commande.statut === 'EXPEDIÉE') {
      buttons += `
        <button class="btn btn-success btn-sm receive-commande" title="Enregistrer réception">
          <i class="fas fa-box"></i>
        </button>
      `;
    }

    if (['EN_ATTENTE', 'EXPEDIÉE'].includes(commande.statut)) {
      buttons += `
        <button class="btn btn-danger btn-sm cancel-commande" title="Annuler">
          <i class="fas fa-trash"></i>
        </button>
      `;
    }

    return buttons;
  }

  /**
   * Badge pour le statut
   */
  getStatusBadge(statut) {
    const statusMap = {
      'EN_ATTENTE': '<span class="badge bg-secondary">En attente</span>',
      'EXPEDIÉE': '<span class="badge bg-info">Expédiée</span>',
      'REÇUE_PARTIELLEMENT': '<span class="badge bg-warning">Partiellement reçue</span>',
      'REÇUE_COMPLÈTEMENT': '<span class="badge bg-success">Reçue complètement</span>',
      'ANNULÉE': '<span class="badge bg-danger">Annulée</span>',
      'RETOURNÉE': '<span class="badge bg-dark">Retournée</span>'
    };
    return statusMap[statut] || statut;
  }

  /**
   * Attach event listeners
   */
  attachCommandeEventListeners() {
    document.querySelectorAll('.view-commande').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const commandeId = e.closest('tr').dataset.commandeId;
        this.showCommandeDetail(commandeId);
      });
    });

    document.querySelectorAll('.mark-expedie').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const commandeId = e.closest('tr').dataset.commandeId;
        if (confirm('Marquer comme expédiée?')) {
          await this.marquerExpediee(commandeId);
          this.displayCommandes('commandes-container');
        }
      });
    });

    document.querySelectorAll('.receive-commande').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const commandeId = e.closest('tr').dataset.commandeId;
        this.showReceptionModal(commandeId);
      });
    });

    document.querySelectorAll('.cancel-commande').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const commandeId = e.closest('tr').dataset.commandeId;
        if (confirm('Annuler cette commande?')) {
          await this.annulerCommande(commandeId);
          this.displayCommandes('commandes-container');
        }
      });
    });
  }

  /**
   * Afficher détails d'une commande
   */
  showCommandeDetail(commandeId) {
    const commande = this.commandes.find(c => c._id === commandeId);
    if (!commande) return;

    const modal = `
      <div class="modal fade" id="commandeDetailModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Détails Commande</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <p><strong>Numéro:</strong> ${commande.numeroCommande}</p>
                  <p><strong>Produit:</strong> ${commande.produitId?.designation}</p>
                  <p><strong>Fournisseur:</strong> ${commande.fournisseur}</p>
                </div>
                <div class="col-md-6">
                  <p><strong>Statut:</strong> ${this.getStatusBadge(commande.statut)}</p>
                  <p><strong>Date Commande:</strong> ${new Date(commande.dateCommande).toLocaleDateString()}</p>
                  <p><strong>Quantité:</strong> ${commande.quantiteCommandee}</p>
                </div>
              </div>

              <hr>

              <h6>Réception</h6>
              <div class="alert alert-info">
                <strong>Reçu:</strong> ${commande.quantiteRecue} / ${commande.quantiteCommandee}
                <div class="progress mt-2">
                  <div class="progress-bar" style="width: ${(commande.quantiteRecue/commande.quantiteCommandee)*100}%">
                    ${Math.round((commande.quantiteRecue/commande.quantiteCommandee)*100)}%
                  </div>
                </div>
              </div>

              ${commande.receptionsIds?.length > 0 ? `
                <h6>Réceptions liées</h6>
                <ul>
                  ${commande.receptionsIds.map(r => `<li>${r.dateReception}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    // Append and show modal
    const modalContainer = document.getElementById('modals-container') || document.body;
    const oldModal = document.getElementById('commandeDetailModal');
    if (oldModal) oldModal.remove();
    
    modalContainer.insertAdjacentHTML('beforeend', modal);
    new bootstrap.Modal(document.getElementById('commandeDetailModal')).show();
  }

  /**
   * Afficher modal réception
   */
  showReceptionModal(commandeId) {
    const commande = this.commandes.find(c => c._id === commandeId);
    if (!commande) return;

    const modal = `
      <div class="modal fade" id="receptionModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Enregistrer Réception</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p class="text-muted">Commande: <strong>${commande.numeroCommande}</strong></p>
              <p class="text-muted">Produit: <strong>${commande.produitId?.designation}</strong></p>
              
              <div class="mb-3">
                <label class="form-label">Quantité reçue:</label>
                <input type="number" class="form-control" id="qteRecue" 
                       min="1" max="${commande.quantiteCommandee - commande.quantiteRecue}"
                       value="${commande.quantiteCommandee - commande.quantiteRecue}">
              </div>

              <div class="alert alert-info">
                <small>Max à recevoir: ${commande.quantiteCommandee - commande.quantiteRecue}</small>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
              <button type="button" class="btn btn-success" id="confirmReception">Confirmer réception</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const modalContainer = document.getElementById('modals-container') || document.body;
    const oldModal = document.getElementById('receptionModal');
    if (oldModal) oldModal.remove();
    
    modalContainer.insertAdjacentHTML('beforeend', modal);
    const modalElement = new bootstrap.Modal(document.getElementById('receptionModal'));
    modalElement.show();

    document.getElementById('confirmReception').addEventListener('click', async () => {
      const qteRecue = parseInt(document.getElementById('qteRecue').value);
      if (qteRecue > 0) {
        await this.receptionCommande({
          commandeId,
          quantiteRecue: qteRecue
        });
        modalElement.hide();
        this.displayCommandes('commandes-container');
        // Reload produits aussi
        if (window.stockManager) {
          await window.stockManager.loadProduits(this.magasinId);
        }
      }
    });
  }
}

// Export pour usage global
window.CommandeManager = CommandeManager;
