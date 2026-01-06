<!-- ================================
     MODAL ÉDITION PRODUIT - TABBED
     ================================ -->
<div class="modal fade" id="modalEditProduit" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-xl" role="document">
    <div class="modal-content">
      <!-- HEADER -->
      <div class="modal-header bg-primary text-white">
        <h5 class="modal-title">
          <i class="fas fa-edit me-2"></i>Éditer Produit: <span id="editProduitName"></span>
        </h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>

      <!-- BODY -->
      <div class="modal-body">
        <!-- NAVIGATION TABS -->
        <ul class="nav nav-tabs mb-3" id="editProduitTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="tab-produit" data-bs-toggle="tab" data-bs-target="#content-produit" type="button" role="tab">
              <i class="fas fa-info-circle me-2"></i>Produit
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="tab-stocks" data-bs-toggle="tab" data-bs-target="#content-stocks" type="button" role="tab">
              <i class="fas fa-boxes me-2"></i>Stocks
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="tab-receptions" data-bs-toggle="tab" data-bs-target="#content-receptions" type="button" role="tab">
              <i class="fas fa-inbox me-2"></i>Réceptions
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="tab-historique" data-bs-toggle="tab" data-bs-target="#content-historique" type="button" role="tab">
              <i class="fas fa-history me-2"></i>Historique
            </button>
          </li>
        </ul>

        <!-- TAB CONTENT -->
        <div class="tab-content">
          
          <!-- ===== ONGLET 1: PRODUIT ===== -->
          <div class="tab-pane fade show active" id="content-produit" role="tabpanel">
            <form id="formEditProduit">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Designation *</label>
                    <input type="text" class="form-control" id="editDesignation" required />
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Référence *</label>
                    <input type="text" class="form-control" id="editReference" required />
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Type de Produit *</label>
                    <select class="form-select" id="editTypeProduit" required></select>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Rayon par défaut</label>
                    <select class="form-select" id="editRayon"></select>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Prix Unitaire *</label>
                    <input type="number" step="0.01" class="form-control" id="editPrixUnitaire" required />
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Seuil d'Alerte</label>
                    <input type="number" class="form-control" id="editSeuilAlerte" />
                  </div>

                  <div class="mb-3">
                    <label class="form-label">État</label>
                    <select class="form-select" id="editEtat">
                      <option value="Neuf">Neuf</option>
                      <option value="Bon état">Bon état</option>
                      <option value="Usagé">Usagé</option>
                      <option value="Endommagé">Endommagé</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Notes</label>
                <textarea class="form-control" id="editNotes" rows="3"></textarea>
              </div>

              <!-- PHOTO -->
              <div class="mb-3">
                <label class="form-label">Photo du Produit</label>
                <div class="row align-items-center">
                  <div class="col-md-3">
                    <img id="editPhotoPreview" src="" alt="Photo" class="img-thumbnail" style="max-width: 100%; display:none;" />
                  </div>
                  <div class="col-md-9">
                    <input type="file" class="form-control" id="editPhotoInput" accept="image/*" />
                    <small class="text-muted">Max 5MB, formats: JPG, PNG</small>
                  </div>
                </div>
              </div>

              <div class="alert alert-info" id="editChangesWarning" style="display:none;">
                <i class="fas fa-exclamation-circle me-2"></i>
                Vous avez des changements non sauvegardés
              </div>
            </form>
          </div>

          <!-- ===== ONGLET 2: STOCKS ===== -->
          <div class="tab-pane fade" id="content-stocks" role="tabpanel">
            <div id="stocksLoading" class="text-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
            </div>
            <table class="table table-hover" id="tableStocks" style="display:none;">
              <thead class="table-light">
                <tr>
                  <th>Rayon</th>
                  <th>Quantité</th>
                  <th>Réceptions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="stocksBody">
              </tbody>
            </table>
            <div id="noStocks" class="alert alert-warning" style="display:none;">
              <i class="fas fa-info-circle me-2"></i>Aucun stock pour ce produit
            </div>
          </div>

          <!-- ===== ONGLET 3: RÉCEPTIONS ===== -->
          <div class="tab-pane fade" id="content-receptions" role="tabpanel">
            <div id="receptionsLoading" class="text-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
            </div>
            <table class="table table-hover table-sm" id="tableReceptions" style="display:none;">
              <thead class="table-light">
                <tr>
                  <th>Date</th>
                  <th>Quantité</th>
                  <th>Rayon</th>
                  <th>Fournisseur</th>
                  <th>Prix/unité</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="receptionsBody">
              </tbody>
            </table>
            <div id="noReceptions" class="alert alert-warning" style="display:none;">
              <i class="fas fa-info-circle me-2"></i>Aucune réception pour ce produit
            </div>
          </div>

          <!-- ===== ONGLET 4: HISTORIQUE ===== -->
          <div class="tab-pane fade" id="content-historique" role="tabpanel">
            <div id="historiqueLoading" class="text-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
            </div>
            <div id="historiqueList" style="display:none;">
              <div class="timeline">
                <div id="timelineEvents"></div>
              </div>
            </div>
            <div id="noHistorique" class="alert alert-warning" style="display:none;">
              <i class="fas fa-info-circle me-2"></i>Aucun historique
            </div>
          </div>

        </div>
      </div>

      <!-- FOOTER -->
      <div class="modal-footer bg-light">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
        <button type="button" class="btn btn-primary" id="btnSaveEditProduit">
          <i class="fas fa-save me-2"></i>Sauvegarder
        </button>
      </div>
    </div>
  </div>
</div>

<!-- CSS pour la timeline -->
<style>
.timeline {
  position: relative;
  padding: 20px 0;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #dee2e6;
}

.timeline-event {
  margin-left: 50px;
  margin-bottom: 20px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  position: relative;
}

.timeline-event::before {
  content: '';
  position: absolute;
  left: -35px;
  top: 15px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #0d6efd;
  border: 3px solid white;
}

.timeline-event.warning::before {
  background: #ffc107;
}

.timeline-event.danger::before {
  background: #dc3545;
}

.timeline-event.success::before {
  background: #28a745;
}

.timeline-date {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 5px;
}

.timeline-action {
  font-weight: 500;
  margin-bottom: 5px;
}

.timeline-details {
  font-size: 0.9rem;
  color: #495057;
  margin-top: 5px;
}
</style>
