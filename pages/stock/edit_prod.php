<!-- Modal Édition Produit Premium avec Onglets -->
<div class="modal fade" id="modalEditProduit" tabindex="-1" aria-labelledby="modalEditProduitLabel" aria-hidden="true">
  <div class="modal-dialog modal-xl">
    <div class="modal-content shadow-xl border-0">
      
      <!-- HEADER -->
      <div class="modal-header bg-gradient-info text-white">
        <h5 class="modal-title">
          <i class="fas fa-edit me-2"></i>
          Éditer Produit: <span id="editProduitName">Chargement...</span>
        </h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>

      <!-- CHANGEMENTS WARNING -->
      <div id="editChangesWarning" class="alert alert-warning mb-0 d-none" style="display:none!important;">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Changements non sauvegardés</strong> - Cliquez sur "Sauvegarder" pour confirmer
      </div>

      <!-- NAV TABS -->
      <div class="modal-header border-bottom pt-3 pb-0">
        <ul class="nav nav-tabs w-100" id="editProduitTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="tab-produit-btn" data-bs-toggle="tab" data-bs-target="#tab-produit" type="button" role="tab">
              <i class="fas fa-info-circle me-2"></i>Produit
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="tab-stocks-btn" data-bs-toggle="tab" data-bs-target="#tab-stocks" type="button" role="tab">
              <i class="fas fa-warehouse me-2"></i>Stocks
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="tab-receptions-btn" data-bs-toggle="tab" data-bs-target="#tab-receptions" type="button" role="tab">
              <i class="fas fa-dolly me-2"></i>Réceptions
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="tab-historique-btn" data-bs-toggle="tab" data-bs-target="#tab-historique" type="button" role="tab">
              <i class="fas fa-history me-2"></i>Historique
            </button>
          </li>
        </ul>
      </div>

      <!-- BODY AVEC ONGLETS -->
      <div class="modal-body p-4">
        <form id="formEditProduit" novalidate>
          <div class="tab-content" id="editProduitTabsContent">

            <!-- ===== TAB 1: PRODUIT ===== -->
            <div class="tab-pane fade show active" id="tab-produit" role="tabpanel">
              <div class="row g-3">

                <!-- Ligne 1: Designation & Reference -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">Désignation <span class="text-danger">*</span></label>
                  <input type="text" id="editDesignation" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Référence <span class="text-danger">*</span></label>
                  <input type="text" id="editReference" class="form-control" required />
                </div>

                <!-- Ligne 2: Type & Rayon -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">Type Produit</label>
                  <select id="editTypeProduit" class="form-select">
                    <option value="">-- Sélectionner --</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Rayon</label>
                  <select id="editRayon" class="form-select">
                    <option value="">-- Aucun rayon --</option>
                  </select>
                </div>

                <!-- Ligne 3: Prix & Seuil -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">Prix Unitaire (€) <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <input type="number" id="editPrixUnitaire" class="form-control" step="0.01" min="0" required />
                    <span class="input-group-text">€</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Seuil Alerte (kg) <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <input type="number" id="editSeuilAlerte" class="form-control" step="0.1" min="0" required />
                    <span class="input-group-text">kg</span>
                  </div>
                </div>

                <!-- Ligne 4: Etat & Notes -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">État</label>
                  <select id="editEtat" class="form-select">
                    <option value="Neuf">Neuf</option>
                    <option value="Bon">Bon</option>
                    <option value="Acceptable">Acceptable</option>
                    <option value="Usé">Usé</option>
                    <option value="Défectueux">Défectueux</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Photo</label>
                  <input type="file" id="editPhotoInput" class="form-control" accept="image/*" />
                  <small class="text-muted">JPG, PNG (max 5MB)</small>
                </div>

                <!-- Ligne 5: Notes -->
                <div class="col-12">
                  <label class="form-label fw-bold">Notes</label>
                  <textarea id="editNotes" class="form-control" rows="3" placeholder="Remarques additionnelles..."></textarea>
                </div>

                <!-- PRÉVISUALISATION PHOTO EN TEMPS RÉEL -->
                <div class="col-12">
                  <div id="editPhotoPreviewContainer" class="text-center">
                    <div class="bg-light p-4 rounded-3 border-2 border-dashed">
                      <i class="fas fa-image fa-3x text-muted mb-2 d-block"></i>
                      <p class="text-muted small">La photo apparaîtra ici</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- ===== TAB 2: STOCKS ===== -->
            <div class="tab-pane fade" id="tab-stocks" role="tabpanel">
              <div id="stocksLoading" class="text-center p-5">
                <div class="spinner-border text-info" role="status">
                  <span class="visually-hidden">Chargement...</span>
                </div>
                <p class="mt-2">Chargement des stocks...</p>
              </div>

              <div id="noStocks" class="alert alert-info" style="display:none;">
                <i class="fas fa-info-circle me-2"></i>
                Aucun stock enregistré pour ce produit
              </div>

              <table id="tableStocks" class="table table-sm table-hover" style="display:none;">
                <thead class="table-light">
                  <tr>
                    <th>Rayon</th>
                    <th>Quantité Disponible</th>
                    <th>Nb Réceptions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="stocksBody"></tbody>
              </table>
            </div>

            <!-- ===== TAB 3: RÉCEPTIONS ===== -->
            <div class="tab-pane fade" id="tab-receptions" role="tabpanel">
              <div id="receptionsLoading" class="text-center p-5">
                <div class="spinner-border text-info" role="status">
                  <span class="visually-hidden">Chargement...</span>
                </div>
                <p class="mt-2">Chargement des réceptions...</p>
              </div>

              <div id="noReceptions" class="alert alert-info" style="display:none;">
                <i class="fas fa-info-circle me-2"></i>
                Aucune réception enregistrée pour ce produit
              </div>

              <div id="tableReceptionsWrapper" style="display:none; overflow-x: auto;">
                <table class="table table-sm table-hover" id="tableReceptions">
                  <thead class="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Quantité</th>
                      <th>Rayon</th>
                      <th>Fournisseur</th>
                      <th>Prix/Unité</th>
                      <th>Total</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="receptionsBody"></tbody>
                </table>
              </div>
            </div>

            <!-- ===== TAB 4: HISTORIQUE ===== -->
            <div class="tab-pane fade" id="tab-historique" role="tabpanel">
              <div id="historiqueLoading" class="text-center p-5">
                <div class="spinner-border text-info" role="status">
                  <span class="visually-hidden">Chargement...</span>
                </div>
                <p class="mt-2">Chargement de l'historique...</p>
              </div>

              <div id="noHistorique" class="alert alert-info" style="display:none;">
                <i class="fas fa-info-circle me-2"></i>
                Aucun historique disponible
              </div>

              <div id="historiqueList" style="display:none;">
                <div id="timelineEvents" class="timeline">
                  <!-- Les événements seront ajoutés ici -->
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>

      <!-- FOOTER -->
      <div class="modal-footer bg-light">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
          <i class="fas fa-times me-2"></i>Fermer
        </button>
        <button type="button" id="btnSaveEditProduit" class="btn btn-primary">
          <i class="fas fa-save me-2"></i>Sauvegarder
        </button>
      </div>

    </div>
  </div>
</div>

<!-- ===== CSS POUR TIMELINE ===== -->
<style>
  .timeline {
    position: relative;
    padding-left: 30px;
  }

  .timeline::before {
    content: "";
    position: absolute;
    left: 5px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #ddd;
  }

  .timeline-event {
    position: relative;
    margin-bottom: 20px;
    padding-left: 20px;
  }

  .timeline-event::before {
    content: "";
    position: absolute;
    left: -30px;
    top: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: white;
    border: 3px solid #ddd;
  }

  .timeline-event.success::before {
    border-color: #28a745;
    background: #28a745;
  }

  .timeline-event.danger::before {
    border-color: #dc3545;
    background: #dc3545;
  }

  .timeline-event.warning::before {
    border-color: #ffc107;
    background: #ffc107;
  }

  .timeline-event.info::before {
    border-color: #17a2b8;
    background: #17a2b8;
  }

  .timeline-date {
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 4px;
  }

  .timeline-action {
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
  }

  .timeline-details {
    font-size: 0.9rem;
    color: #555;
    line-height: 1.4;
  }

  .timeline-details em {
    color: #dc3545;
    font-style: italic;
  }
</style>
