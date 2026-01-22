<!-- Modal Nouvelle Réception & Historique -->
<div class="modal fade" id="modalReception" tabindex="-1" aria-labelledby="modalReceptionLabel" aria-hidden="true">
  <div class="modal-dialog modal-xl">
    <div class="modal-content shadow-xl border-0">
      <div class="modal-header bg-gradient-success text-white">
        <h5 class="modal-title">
          <i class="fas fa-truck-loading me-2"></i>Gestion des Réceptions
        </h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>

      <!-- TABS NAVIGATION -->
      <ul class="nav nav-tabs" role="tablist" style="border-bottom: 2px solid #e9ecef;">
        <li class="nav-item" role="presentation">
          <a class="nav-link active fw-bold text-success" id="tabNouvelleReception" href="#nouvelleReception" role="tab" data-bs-toggle="tab">
            <i class="fas fa-plus-circle me-2"></i>Nouvelle Réception
          </a>
        </li>
        <li class="nav-item" role="presentation">
          <a class="nav-link fw-bold" id="tabHistoriqueReceptions" href="#historiqueReceptions" role="tab" data-bs-toggle="tab">
            <i class="fas fa-history me-2"></i>Historique des Réceptions
          </a>
        </li>
      </ul>

      <!-- TAB CONTENT -->
      <div class="tab-content">
        <!-- TAB 1: NOUVELLE RÉCEPTION -->
        <div class="tab-pane fade show active" id="nouvelleReception" role="tabpanel">
          <form id="formReception" novalidate>
            <div class="modal-body">
              <div class="row g-3 mb-4">
                <!-- 1. PRODUIT SELECTION -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">Produit <span class="text-danger">*</span></label>
                  <select id="produitReception" class="form-select" required>
                    <option value="">Choisir produit...</option>
                  </select>
                  <div class="invalid-feedback">Produit obligatoire</div>
                </div>
                <!-- 2. FOURNISSEUR -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">Fournisseur</label>
                  <input type="text" id="fournisseurReception" class="form-control" />
                </div>
              </div>

              <!-- 2.5 MARQUE DU PRODUIT (NOUVEAU!) -->
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Marque <span class="text-danger">*</span></label>
                  <input type="text" id="marqueReception" class="form-control" placeholder="Ex: Premium Beef, Quality Cloth" required />
                  <div class="invalid-feedback">Marque obligatoire</div>
                </div>
              </div>

              <!-- 3. QUANTITÉ + UNITÉ (Dynamique selon produit) -->
              <div class="row g-3 mb-4">
                <div class="col-md-4" id="simpleQuantityContainer">
                  <label class="form-label fw-bold">Quantité Reçue <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <input type="number" id="quantiteReception" class="form-control" min="0.01" step="0.01" />
                    <span class="input-group-text fw-bold" id="uniteReceptionLabel">unités</span>
                  </div>
                  <div class="invalid-feedback">Quantité obligatoire</div>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold">Rayon Destination <span class="text-danger">*</span></label>
                  <select id="rayonReception" class="form-select" required>
                    <option value="">Choisir rayon...</option>
                  </select>
                  <div class="invalid-feedback">Rayon obligatoire</div>
                  <!-- Alerte rayon plein -->
                  <div id="alerteRayonPleinReception" class="alert alert-warning mt-2 py-2 px-3 mb-0" style="display: none;">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <small><strong>Attention:</strong> <span id="messageRayonPleinReception"></span></small>
                  </div>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Prix Achat Unitaire</label>
                  <div class="input-group">
                    <span class="input-group-text">CDF</span>
                    <input type="number" id="prixAchat" class="form-control" step="0.01" />
                  </div>
                </div>
              </div>

              <!-- ⚡ ALERTE CAPACITÉ TYPE EN TEMPS RÉEL -->
              <div id="alerteCapaciteTypeReception" class="alert alert-danger mb-4 py-3 px-4" style="display: none;">
                <div class="d-flex align-items-start gap-2">
                  <i class="fas fa-exclamation-circle fa-lg" style="margin-top: 2px; flex-shrink: 0;"></i>
                  <div>
                    <strong>⚠️ Alerte Capacité Type:</strong><br>
                    <span id="messageCapaciteTypeReception"></span>
                  </div>
                </div>
              </div>

              <!-- 4. CHAMPS DYNAMIQUES (selon type produit sélectionné) -->
              <div id="champsDynamiquesReception" class="mb-4 p-3 border rounded-3 bg-light">
                <div class="text-center text-muted py-4">
                  <i class="fas fa-info-circle fa-2x mb-2"></i>
                  <p>Sélectionnez un produit pour voir les champs spécifiques</p>
                </div>
              </div>

              <!-- 🎁 CHAMPS POUR PRODUITS LOT (caché par défaut) -->
              <div id="lotContainer" style="display: none;" class="mb-4">
                <!-- INFO HEADER avec détails produit LOT -->
                <div class="alert alert-info border-info bg-light mb-3" id="lotInfoHeader" style="border-left: 4px solid #0dcaf0;">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="mb-1">
                        <i class="fas fa-cube me-2 text-info"></i>
                        <span id="lotProductName">Produit LOT</span>
                      </h6>
                      <small class="text-muted d-block">
                        <strong>Unité stockage:</strong> <span id="lotUnitePrincipale">--</span>
                      </small>
                    </div>
                    <div class="text-end">
                      <div id="lotPreviewInfo" class="small">
                        <span class="text-muted">Détails à remplir...</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="card border-warning shadow-sm">
                  <div class="card-header bg-warning bg-opacity-10 border-warning">
                    <i class="fas fa-boxes me-2 text-warning"></i>
                    <strong>Détails du Lot (Pièces individuelles)</strong>
                  </div>
                  <div class="card-body">
                    <!-- Ligne 1: Pièces et Quantité -->
                    <div class="row g-3 mb-4">
                      <div class="col-md-4">
                        <label class="form-label fw-bold">
                          <i class="fas fa-cube me-2"></i>Nombre de Pièces <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <input type="number" id="nombrePieces" class="form-control form-control-lg" min="1" step="1" placeholder="Ex: 5" />
                          <span class="input-group-text">pièces</span>
                        </div>
                        <small class="text-muted d-block mt-2">Rouleaux, cartons, reams...</small>
                      </div>
                      <div class="col-md-4">
                        <label class="form-label fw-bold">
                          <i class="fas fa-weight me-2"></i>Quantité par Pièce <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <input type="number" id="quantiteParPiece" class="form-control form-control-lg" min="0.01" step="0.01" placeholder="100" />
                          <span class="input-group-text" id="quantiteParPieceUnit">unité</span>
                        </div>
                        <small class="text-muted d-block mt-2">Mètres, kg, litres...</small>
                      </div>
                      <div class="col-md-4">
                        <label class="form-label fw-bold">
                          <i class="fas fa-ruler me-2"></i>Unité <span class="text-danger">*</span>
                        </label>
                        <select id="uniteDetail" class="form-select form-select-lg">
                          <option value="">-- Choisir unité --</option>
                        </select>
                        <small class="text-muted d-block mt-2">Mètre, kg, litre, etc.</small>
                      </div>
                    </div>

                    <!-- Ligne 2: Prix et Totaux -->
                    <div class="row g-3 pt-3 border-top">
                      <div class="col-md-6">
                        <label class="form-label fw-bold">
                          <i class="fas fa-tag me-2 text-success"></i>Prix par Unité <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text fw-bold">CDF</span>
                          <input type="number" id="prixParUniteDetail" class="form-control form-control-lg" step="0.01" placeholder="10.50" />
                          <span class="input-group-text" id="prixUnitLabel">par unité</span>
                        </div>
                        <small class="text-muted d-block mt-2">Prix du mètre, kg, litre...</small>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label fw-bold text-success">
                          <i class="fas fa-calculator me-2"></i>💰 Prix Total Estimé
                        </label>
                        <div class="input-group">
                          <span class="input-group-text fw-bold">CDF</span>
                          <input type="text" id="prixTotalEstime" class="form-control form-control-lg fw-bold text-success" readonly value="0" />
                        </div>
                        <small class="text-muted d-block mt-2">
                          Pièces × Qté/pièce × Prix/unité
                        </small>
                      </div>
                    </div>

                    <!-- Preview et Formule -->
                    <div class="row g-3 mt-4 pt-3 border-top">
                      <div class="col-12">
                        <div class="card bg-success bg-opacity-10 border-success">
                          <div class="card-body">
                            <h6 class="text-success mb-3">
                              <i class="fas fa-eye me-2"></i>Récapitulatif
                            </h6>
                            <div id="lotRecapitulatif" class="small">
                              <p class="text-muted mb-2">Remplissez les champs pour voir le détail...</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

          <!-- 5. PHOTO OBLIGATOIRE (NOUVEAU !) -->
          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <label class="form-label fw-bold text-danger">
                <i class="fas fa-camera me-1"></i>Photo Réception <span class="text-danger">*</span>
              </label>
              <input type="file" id="photoReception" class="form-control" accept="image/*" required />
              <div class="invalid-feedback">Photo obligatoire pour traçabilité</div>
              <small class="text-muted d-block mt-1">📸 Prévisualisation en temps réel ci-dessous</small>
            </div>
            <div class="col-md-6">
              <label class="form-label">Numéro Lot</label>
              <input type="text" id="lotReception" class="form-control" />
            </div>
          </div>

          <!-- PRÉVISUALISATION PHOTO EN TEMPS RÉEL -->
          <div class="mb-4">
            <div id="photoPreviewReception" class="text-center">
              <div class="bg-light p-4 rounded-3 border-2 border-dashed">
                <i class="fas fa-image fa-3x text-muted mb-2 d-block"></i>
                <p class="text-muted small">La photo apparaîtra ici</p>
              </div>
            </div>
          </div>

          <!-- 6. DATES & STATUT -->
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Date Réception</label>
              <input type="date" id="dateReception" class="form-control" />
            </div>
            <div class="col-md-3">
              <label class="form-label">Date Péremption</label>
              <input type="date" id="datePeremption" class="form-control" />
            </div>
            <div class="col-md-3">
              <label class="form-label">Date Fabrication</label>
              <input type="date" id="dateFabrication" class="form-control" />
            </div>
            <div class="col-md-3">
              <label class="form-label">Statut</label>
              <select id="statutReception" class="form-select">
                <option value="controle">À contrôler</option>
                <option value="stocke">Stocké</option>
                <option value="rejete">Rejeté</option>
              </select>
            </div>
          </div>

          <div class="row g-3 mt-2">
            <div class="col-md-12">
              <label class="form-label">Priorité</label>
              <select id="prioriteReception" class="form-select">
                <option value="normale">Normale</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

              <!-- RÉCAPITULATIF (temps réel) -->
              <div class="mt-4 p-3 bg-light rounded-3">
                <h6><i class="fas fa-receipt me-2"></i>Récapitulatif</h6>
                <div class="row text-center">
                  <div class="col-md-3">
                    <strong id="recapProduit">-</strong><br><small>Produit</small>
                  </div>
                  <div class="col-md-3">
                    <strong id="recapQuantite">-</strong><br><small>Quantité</small>
                  </div>
                  <div class="col-md-3">
                    <strong id="recapRayon">-</strong><br><small>Rayon</small>
                  </div>
                  <div class="col-md-3">
                    <strong id="recapTotal">0 CDF</strong><br><small>Valeur totale</small>
                  </div>
                </div>
                <div class="row text-center mt-3 pt-3 border-top">
                  <div class="col-md-6">
                    <strong id="recapFournisseur">-</strong><br><small>Fournisseur</small>
                  </div>
                  <div class="col-md-6">
                    <strong id="recapMarque">-</strong><br><small>Marque</small>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
              <button type="submit" id="btnSubmitReception" class="btn btn-success px-4">
                <span id="iconSubmit"><i class="fas fa-check me-2"></i></span>
                <span id="textSubmit">Enregistrer Réception</span>
              </button>
            </div>
          </form>
        </div>

        <!-- TAB 2: HISTORIQUE DES RÉCEPTIONS -->
        <div class="tab-pane fade" id="historiqueReceptions" role="tabpanel">
          <div class="modal-body">
            <!-- STATS RÉCEPTIONS -->
            <div class="mb-4" id="statsReceptions">
              <div class="d-flex justify-content-center">
                <div class="spinner-border text-success" role="status">
                  <span class="visually-hidden">Chargement...</span>
                </div>
              </div>
            </div>

            <!-- FILTRES -->
            <div class="card border-light mb-3">
              <div class="card-body">
                <h6 class="card-title">🔍 Filtres</h6>
                <div class="row g-2">
                  <div class="col-md-3">
                    <select id="filterStatutReception" class="form-select form-select-sm">
                      <option value="">Tous les statuts</option>
                      <option value="controle">En contrôle</option>
                      <option value="stocke">Stocké</option>
                      <option value="rejete">Rejeté</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <input type="text" id="filterFournisseur" class="form-control form-control-sm" placeholder="Fournisseur...">
                  </div>
                  <div class="col-md-2">
                    <input type="date" id="filterDateDebut" class="form-control form-control-sm">
                  </div>
                  <div class="col-md-2">
                    <input type="date" id="filterDateFin" class="form-control form-control-sm">
                  </div>
                  <div class="col-md-2">
                    <button class="btn btn-sm btn-success w-100" onclick="filtrerReceptions()"><i class="fas fa-search"></i> Filtrer</button>
                  </div>
                </div>
                <div class="row g-2 mt-2">
                  <div class="col-12">
                    <button class="btn btn-sm btn-outline-secondary" onclick="reinitialiserFiltres()"><i class="fas fa-redo"></i> Réinitialiser</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- SPINNER CHARGEMENT -->
            <div id="spinnerHistoriqueReceptions" class="d-flex justify-content-center align-items-center" style="min-height: 300px; display: none;">
              <div class="spinner-border text-success" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
            </div>

            <!-- TABLEAU RÉCEPTIONS -->
            <div id="historiqueReceptionsTable" class="table-responsive">
              <div class="alert alert-info text-center">
                <i class="fas fa-inbox"></i> Cliquez sur "Filtrer" pour afficher l'historique
              </div>
            </div>

            <!-- PAGINATION -->
            <div class="mt-3 d-flex gap-2 justify-content-between align-items-center flex-wrap" id="paginationReceptions">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div id="detailReceptionContainer"></div>
