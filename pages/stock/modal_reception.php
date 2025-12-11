<!-- Modal Nouvelle Réception -->
<div class="modal fade" id="modalReception" tabindex="-1" aria-labelledby="modalReceptionLabel" aria-hidden="true">
  <div class="modal-dialog modal-xl">
    <div class="modal-content shadow-xl border-0">
      <div class="modal-header bg-gradient-success text-white">
        <h5 class="modal-title">
          <i class="fas fa-truck-loading me-2"></i>Nouvelle Réception
        </h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
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

          <!-- 3. QUANTITÉ + UNITÉ (Dynamique selon produit) -->
          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <label class="form-label fw-bold">Quantité Reçue <span class="text-danger">*</span></label>
              <div class="input-group">
                <input type="number" id="quantiteReception" class="form-control" min="0.01" step="0.01" required />
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
            </div>
            <div class="col-md-4">
              <label class="form-label">Prix Achat Unitaire</label>
              <div class="input-group">
                <span class="input-group-text">CDF</span>
                <input type="number" id="prixAchat" class="form-control" step="0.01" />
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

          <!-- 5. PHOTO OBLIGATOIRE (NOUVEAU !) -->
          <div class="row g-3 mb-4">
            <div class="col-md-8">
              <label class="form-label fw-bold text-danger">
                <i class="fas fa-camera me-1"></i>Photo Réception <span class="text-danger">*</span>
              </label>
              <input type="file" id="photoReception" class="form-control" accept="image/*" required />
              <div class="invalid-feedback">Photo obligatoire pour traçabilité</div>
            </div>
            <div class="col-md-4">
              <label class="form-label">Numéro Lot</label>
              <input type="text" id="lotReception" class="form-control" />
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
              <label class="form-label">Statut</label>
              <select id="statutReception" class="form-select">
                <option value="controle">À contrôler</option>
                <option value="stocke">Stocké</option>
                <option value="rejete">Rejeté</option>
              </select>
            </div>
            <div class="col-md-3">
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
          </div>
        </div>
        <div class="modal-footer bg-light">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
          <button type="submit" class="btn btn-success px-4">
            <i class="fas fa-check me-2"></i>Enregistrer Réception
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
