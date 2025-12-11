<!-- MODAL STOCK SETTINGS -->
<div class="modal fade" id="modalStockSettings" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content shadow-xl border-0">

      <!-- HEADER + TABS -->
      <div class="modal-header bg-gradient-primary text-white border-0 position-relative">
        <div class="position-absolute start-0 top-50 translate-middle-y ms-4">
          <i class="fas fa-cubes fa-2x opacity-75"></i>
        </div>
        <ul class="nav nav-tabs nav-tabs-custom flex-fill mx-5" id="stockTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active fw-bold" id="rayons-tab"
                    data-bs-toggle="tab" data-bs-target="#rayons" type="button" role="tab">
              <i class="fas fa-layer-group me-2"></i>Rayons
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link fw-bold" id="produits-tab"
                    data-bs-toggle="tab" data-bs-target="#produits" type="button" role="tab">
              <i class="fas fa-palette me-2"></i>Types Produits
            </button>
          </li>
        </ul>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <!-- BODY -->
      <div class="modal-body py-2">
        <div class="tab-content" id="stockTabsContent">

          <!-- ONGLET RAYONS -->
          <div class="tab-pane fade show active" id="rayons" role="tabpanel" aria-labelledby="rayons-tab">
            <div class="row gy-3 gx-3">

              <!-- PANEL LISTE RAYONS -->
              <div class="col-lg-5">
                <div class="card h-100 shadow-lg border-0">
                  <div class="card-header bg-gradient-info text-white p-3 d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                      <i class="fas fa-layer-group me-2"></i>
                      <h5 class="mb-0 panel-title">Mes Rayons</h5>
                    </div>
                    <div class="d-flex align-items-center">
                      <span class="badge bg-white text-info total-badge me-2" id="totalRayons">0</span>
                      <button class="btn btn-sm btn-light text-info"
                              data-bs-toggle="modal" data-bs-target="#modalCreateRayon" title="Nouveau rayon">
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div class="card-body p-2">
                    <div class="mb-2">
                      <div class="input-group input-group-sm">
                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                        <input type="search" id="searchRayons" class="form-control form-control-sm"
                               placeholder="Rechercher un rayon...">
                      </div>
                    </div>
                    <div class="list-group list-group-flush" id="rayonsList"
                         style="max-height: 50vh; overflow: auto; padding: .25rem;">
                      <!-- Dynamique -->
                    </div>
                  </div>
                  <div class="card-footer bg-light border-0 py-2">
                    <button class="btn btn-outline-primary btn-sm w-100" id="btnCreateRayonFooter">
                      <i class="fas fa-plus me-2"></i>Créer un rayon
                    </button>
                  </div>
                </div>
              </div>

              <!-- PANEL CONFIG RAYON -->
              <div class="col-lg-7">
                <div class="card h-100 shadow-xl border-0">
                  <div class="card-header bg-gradient-warning text-white p-4">
                    <h5 class="mb-0" id="rayonNom">Sélectionnez un rayon</h5>
                    <span class="badge bg-light bg-opacity-20 fs-6" id="rayonStatus"></span>
                  </div>
                  <div class="card-body p-4">
                    <form id="formConfigRayon">
                      <input type="hidden" name="rayonId" id="editRayonId">

                      <!-- 1. INFOS PRINCIPALES -->
                      <div class="row g-3 mb-3">
                        <div class="col-md-6">
                          <label class="form-label fw-bold">Code Rayon <span class="text-danger">*</span></label>
                          <div class="input-group">
                            <span class="input-group-text bg-primary text-white">R</span>
                            <input type="text" class="form-control fw-semibold fs-5 text-uppercase"
                                   name="codeRayon" maxlength="6" placeholder="A001" required>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label fw-bold">Nom Complet</label>
                          <input type="text" class="form-control fw-semibold" name="nomRayon"
                                 placeholder="Rayon Tissus Couleurs Vives">
                        </div>
                      </div>

                      <!-- 2. CAPACITÉS & TYPES -->
                      <div class="row g-3 mb-3">
                        <div class="col-md-4">
                          <label class="form-label">Capacité Max</label>
                          <div class="input-group">
                            <input type="number" class="form-control" name="capaciteMax" value="1000">
                            <span class="input-group-text">unités</span>
                          </div>
                        </div>
                        <div class="col-md-4">
                          <label class="form-label">Type Rayon</label>
                          <select class="form-select" name="typeRayon">
                            <option value="RAYON">📦 Rayon</option>
                            <option value="ETAGERE">📚 Étagère</option>
                            <option value="SOL">📋 Sol</option>
                            <option value="FROID">❄️ Froid</option>
                            <option value="VITRINE">🛍️ Vitrine</option>
                          </select>
                        </div>
                        <div class="col-md-4">
                          <label class="form-label">Statut</label>
                          <select class="form-select" name="status">
                            <option value="1">🟢 Actif</option>
                            <option value="0">🔴 Inactif</option>
                          </select>
                        </div>
                      </div>

                      <!-- 3. COULEURS & THÈMES -->
                      <div class="row g-3 mb-3">
                        <div class="col-md-6">
                          <label class="form-label fw-bold">Couleur Rayon</label>
                          <input type="color" class="form-control form-control-color fw-0"
                                 name="couleurRayon" value="#10b981" title="Choisir couleur">
                          <small class="text-muted">Pour identification visuelle</small>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label fw-bold">Icône</label>
                          <select class="form-select" name="iconeRayon">
                            <option>📦</option>
                            <option>👕</option>
                            <option>💊</option>
                            <option>🍞</option>
                            <option>🔧</option>
                          </select>
                        </div>
                      </div>

                      <!-- 4. TYPES PRODUITS AUTORISÉS -->
                      <div class="mb-3">
                        <label class="form-label fw-bold">Types produits autorisés</label>
                        <div class="row g-2" id="typesProduitsContainer">
                          <!-- Dynamique -->
                        </div>
                      </div>

                      <!-- 5. DESCRIPTION -->
                      <div class="mb-3">
                        <label class="form-label">Description</label>
                        <textarea class="form-control" name="description" rows="2"
                                  placeholder="Localisation physique, consignes spéciales..."></textarea>
                      </div>
                    </form>

                    <!-- KPI RAYON -->
                    <div class="row g-3 mb-2 p-3 bg-light rounded-3">
                      <div class="col-3 text-center">
                        <h4 class="text-success mb-1" id="rayonOccupation">0%</h4>
                        <small>Occupation</small>
                      </div>
                      <div class="col-3 text-center">
                        <h4 class="text-primary mb-1" id="rayonArticles">0</h4>
                        <small>Articles</small>
                      </div>
                      <div class="col-3 text-center">
                        <h4 class="text-warning mb-1" id="rayonAlertes">0</h4>
                        <small>Alertes</small>
                      </div>
                      <div class="col-3 text-center">
                        <h4 class="text-info mb-1" id="rayonCapacite">0/1000</h4>
                        <small>Capacité</small>
                      </div>
                    </div>
                  </div>

                  <div class="card-footer border-0 bg-transparent">
                    <div class="d-flex gap-2">
                      <button class="btn btn-outline-secondary" id="btnAnnulerRayon">Annuler</button>
                      <button class="btn btn-primary" id="btnSauvegarderRayon">Sauvegarder</button>
                      <button class="btn btn-success" id="btnDupliquerRayon">Dupliquer</button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- ONGLET TYPES PRODUITS -->
          <div class="tab-pane fade" id="produits" role="tabpanel" aria-labelledby="produits-tab">
            <div class="row gy-3 gx-3">

              <!-- LISTE TYPES PRODUITS -->
              <div class="col-lg-5">
                <div class="card h-100 shadow-lg border-0">
                  <div class="card-header bg-gradient-info text-white p-3 d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                      <i class="fas fa-layer-group me-2"></i>
                      <h5 class="mb-0 panel-title">Types de Produits</h5>
                    </div>
                    <div class="d-flex align-items-center">
                      <span class="badge bg-white text-info total-badge me-2" id="totalTypes">0</span>
                      <button class="btn btn-sm btn-light text-info" data-bs-toggle="modal"
                              data-bs-target="#modalCreateType" title="Nouveau type">
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div class="card-body p-2">
                    <div class="list-group list-group-flush" id="typesList"
                         style="max-height: 50vh; overflow: auto; padding: .25rem;">
                      <!-- Dynamique -->
                    </div>
                  </div>
                  <div class="card-footer bg-light border-0 py-2">
                    <button class="btn btn-outline-primary btn-sm w-100" id="btnCreateTypeFooter">
                      <i class="fas fa-plus me-2"></i>Nouveau Type Produit
                    </button>
                  </div>
                </div>
              </div>

              <!-- CONFIG TYPE PRODUIT -->
              <div class="col-lg-7">
                <div class="card shadow-lg border-0">
                  <div class="card-header bg-gradient-primary text-white p-4">
                    <h4><i class="fas fa-cogs me-2"></i>Configuration Type Produit</h4>
                    <small>Adaptez le système à votre activité (Tissus, Pharmacie, etc.).</small>
                  </div>
                  <div class="card-body p-4">
                    <form id="configTypeForm">
                      <div class="row mb-4">
                        <div class="col-md-6">
                          <label class="form-label fw-bold">Nom du type</label>
                          <input type="text" class="form-control" name="nomType"
                                 placeholder="Ex: TISSUS, PHARMACIE, AUTO" required>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label fw-bold">Unité principale</label>
                          <select class="form-select" name="unitePrincipale" required>
                            <option value="metres">Mètres (m)</option>
                            <option value="kg">Kilogrammes (kg)</option>
                            <option value="boites">Boîtes</option>
                            <option value="pieces">Pièces</option>
                            <option value="litres">Litres (L)</option>
                            <option value="litres">Litres (L)</option>

                          </select>
                        </div>
                      </div>

                      <div class="mb-4">
                        <label class="form-label fw-bold">Champs supplémentaires</label>
                        <div id="champsContainer">
                          <div class="champ-row row g-2 mb-3 p-3 border rounded-3 bg-light">
                            <div class="col-md-3">
                              <input class="form-control champ-nom" placeholder="couleur">
                            </div>
                            <div class="col-md-3">
                              <select class="form-select champ-type">
                                <option value="text">Texte</option>
                                <option value="select">Choix</option>
                                <option value="number">Nombre</option>
                                <option value="date">Date</option>
                              </select>
                            </div>
                            <div class="col-md-4">
                              <input class="form-control champ-options" placeholder="Rouge,Bleu,Vert">
                            </div>
                            <div class="col-md-2">
                              <button type="button" class="btn btn-outline-danger btn-sm remove-champ">
                                <i class="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                        <button type="button" class="btn btn-outline-primary btn-sm mt-2" id="addChamp">
                          <i class="fas fa-plus me-1"></i>Champ
                        </button>
                      </div>

                      <div class="form-check mb-4">
                        <input class="form-check-input" type="checkbox" id="imageRequired" name="imageRequired" checked>
                        <label class="form-check-label fw-semibold" for="imageRequired">
                          <i class="fas fa-camera me-1 text-warning"></i>Photo OBLIGATOIRE à chaque entrée stock
                        </label>
                      </div>

                      <div class="row mb-4">
                        <div class="col-md-6">
                          <label>Seuil alerte (min)</label>
                          <input type="number" class="form-control" name="seuilMin" value="5">
                        </div>
                        <div class="col-md-6">
                          <label>Capacité max emplacement</label>
                          <input type="number" class="form-control" name="capaciteMax" value="1000">
                        </div>
                      </div>

                      <button type="submit" class="btn btn-primary btn-lg px-5">
                        <i class="fas fa-save me-2"></i>Sauvegarder Configuration
                      </button>
                    </form>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <!-- FOOTER -->
      <div class="modal-footer bg-light">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
      </div>

    </div>
  </div>
</div>


  <style>
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    #btnSettingsStock:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
    }

    #btnSettingsStock {
      transition: all 0.3s ease;
    }
        /* Styles spécifiques panneau Rayons */
        .panel-title { font-weight: 700; font-size: 1rem; margin: 0; }
        .total-badge { font-weight: 700; padding: .35rem .55rem; border-radius: .6rem; }
        #rayonsList .list-group-item, #typesList .list-group-item { padding: .45rem .6rem; border: 0; border-bottom: 1px solid rgba(0,0,0,0.04); }
        #searchRayons { height: 34px; }
        /* Réduction des espaces verticaux entre les panneaux du modal */
        .modal-body { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
        .modal-body .tab-pane { padding-top: 0 !important; padding-bottom: 0 !important; }
        .modal-header { padding-bottom: .5rem; }
        .nav-tabs-custom { margin-bottom: .5rem; }
        .card-footer { margin-top: 0 !important; padding-top: .65rem; padding-bottom: .65rem; }
  </style>

  <script>
    // Sauvegarder les paramètres
    document.getElementById('btnSaveSettings').addEventListener('click', function() {
      const settings = {
        seuilAlerte: document.getElementById('seuilAlerte').value,
        uniteDefaut: document.getElementById('uniteDefaut').value,
        afficherPrix: document.getElementById('afficherPrix').checked,
        afficherEmplacement: document.getElementById('afficherEmplacement').checked,
        afficherDates: document.getElementById('afficherDates').checked,
        delaiRetention: document.getElementById('delaiRetention').value,
        lignesParPage: document.getElementById('lignesParPage').value
      };
      localStorage.setItem('stockSettings', JSON.stringify(settings));
      alert('Paramètres enregistrés avec succès !');
      bootstrap.Modal.getInstance(document.getElementById('modalStockSettings')).hide();
    });

    // Charger les paramètres au chargement de la page
    window.addEventListener('DOMContentLoaded', function() {
      const savedSettings = localStorage.getItem('stockSettings');
      if(savedSettings) {
        const settings = JSON.parse(savedSettings);
        document.getElementById('seuilAlerte').value = settings.seuilAlerte || 10;
        document.getElementById('uniteDefaut').value = settings.uniteDefaut || 'pcs';
        document.getElementById('afficherPrix').checked = settings.afficherPrix !== false;
        document.getElementById('afficherEmplacement').checked = settings.afficherEmplacement !== false;
        document.getElementById('afficherDates').checked = settings.afficherDates !== false;
        document.getElementById('delaiRetention').value = settings.delaiRetention || 365;
        document.getElementById('lignesParPage').value = settings.lignesParPage || 10;
      }
            // Filtrage client pour la recherche de rayons
            const searchInput = document.getElementById('searchRayons');
            if(searchInput) {
                searchInput.addEventListener('input', function(e) {
                    const q = (e.target.value || '').trim().toLowerCase();
                    const list = document.getElementById('rayonsList');
                    if(!list) return;
                    const items = list.querySelectorAll('.list-group-item');
                    items.forEach(li => {
                        const text = li.textContent.trim().toLowerCase();
                        li.style.display = q === '' || text.indexOf(q) !== -1 ? '' : 'none';
                    });
                });
            }
    });
  </script>
