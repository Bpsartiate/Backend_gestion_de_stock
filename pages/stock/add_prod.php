<!-- Modal Ajout/Modification Produit -->
<div class="modal fade" id="modalProduit" tabindex="-1" aria-labelledby="modalProduitLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content shadow-xl border-0">
      <div class="modal-header bg-gradient-primary text-white">
        <h5 class="modal-title">
          <i class="fas fa-box me-2"></i>
          <span id="modalProduitTitle">Ajouter un produit</span>
        </h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form id="formProduit" novalidate>
        <div class="modal-body">
          <input type="hidden" id="produitId" />
          
          <!-- 1. INFOS PRINCIPALES -->
          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <label class="form-label fw-bold">Référence <span class="text-danger">*</span></label>
              <input type="text" id="reference" class="form-control" required />
              <div class="invalid-feedback">Référence obligatoire</div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold">Désignation <span class="text-danger">*</span></label>
              <input type="text" id="designation" class="form-control" required />
              <div class="invalid-feedback">Désignation obligatoire</div>
            </div>
          </div>

          <!-- 2. TYPE PRODUIT + UNITÉ (NOUVEAU !) -->
          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <label class="form-label fw-bold">Type Produit <span class="text-danger">*</span></label>
              <select id="typeProduit" class="form-select" required>
                <option value="">Choisir type...</option>
              </select>
              <div class="invalid-feedback">Type obligatoire</div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold" id="labelQuantite">Stock Initial <span class="text-danger">*</span></label>
              <div class="input-group">
                <input type="number" id="quantite" class="form-control" min="0" step="0.01" required />
                <span class="input-group-text" id="uniteLabel">unités</span>
              </div>
              <div class="invalid-feedback">Quantité obligatoire</div>
            </div>
          </div>

          <!-- 3. RAYON (NOUVEAU !) -->
          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <label class="form-label fw-bold">Rayon <span class="text-danger">*</span></label>
              <select id="rayonId" class="form-select" required>
                <option value="">Choisir rayon...</option>
              </select>
              <div class="invalid-feedback">Rayon obligatoire</div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold">Prix Unitaire</label>
              <div class="input-group">
                <span class="input-group-text">CDF</span>
                <input type="number" id="prixUnitaire" class="form-control" step="0.01" />
              </div>
            </div>
          </div>

          <!-- 4. CHAMPS DYNAMIQUES (NOUVEAU !) -->
          <div id="champsDynamiques" class="mb-4">
            <!-- Champs selon type produit : couleur, dosage, etc. -->
          </div>

          <!-- 5. INFOS COMPLÉMENTAIRES -->
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Seuil Minimum</label>
              <input type="number" id="seuilMin" class="form-control" min="0" />
            </div>
            <div class="col-md-4">
              <label class="form-label">État</label>
              <select id="etat" class="form-select">
                <option>Neuf</option>
                <option>Bon état</option>
                <option>Usagé</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Date Entrée</label>
              <input type="date" id="dateEntree" class="form-control" />
            </div>
          </div>

          <!-- PRÉVIEW PHOTO (NOUVEAU !) -->
          <div class="mt-4">
            <label class="form-label fw-bold">Photo Produit</label>
            <div class="border rounded-3 p-4 text-center bg-light" style="min-height: 150px;">
              <input type="file" id="photoProduit" class="form-control" accept="image/*">
              <div id="photoPreview" class="mt-2">
                <i class="fas fa-image fa-3x text-muted"></i>
                <p class="text-muted mt-2 mb-0">Photo optionnelle</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer bg-light">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
          <button type="submit" class="btn btn-primary px-4">
            <i class="fas fa-save me-2"></i>Enregistrer Produit
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
