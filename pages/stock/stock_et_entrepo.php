<div class="content">
  <!-- content nav -->
  <?php 
    if (!defined('BASE_URL')) {
      define('BASE_URL', '/backend_Stock/');
    }
    include_once ".././topbar.php" 
  ?>
    <!-- Modal pour ajouter produit -->
    <?php include_once "add_prod.php"; ?>
    <!-- Modal pour la réception -->
    <?php include_once "modal_reception.php"; ?>
<style>
   .card.shadow-sm {
  border-radius: 1rem;
}

.fs--2 {
  font-size: 0.75rem;
}

.text-600 { color: #6c757d; }
.text-500 { color: #9da1a7; }
.text-1100 { color: #212529; }

/* Si non inclus par ton thème */
.bg-soft-primary { background-color: rgba(59, 130, 246, 0.08); }
.bg-soft-success { background-color: rgba(16, 185, 129, 0.08); }
.bg-soft-warning { background-color: rgba(245, 158, 11, 0.08); }
.bg-soft-danger  { background-color: rgba(239, 68, 68, 0.08); }

</style>
  <!-- tittre -->
  <div class="row">
    <div class="col-md-12">
      <div class="card mb-3">
        <div class="bg-holder d-none d-lg-block bg-card" 
             style="background-image:url(<?php echo BASE_URL; ?>assets/img/icons/spot-illustrations/corner-4.png);"></div>
        <div class="card-body position-relative">
          <div class="row">
            <div class="d-flex justify-content-between mt-2 align-items-center mb-4">
              <div>
                <h3 class="mb-2">
                  <i class="fas fa-truck-loading me-2"></i>Stock & Entreposage
                </h3>
                <!-- Bouton de sélection magasin -->
                <button class="btn btn-outline-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#modalSelectMagasin">
                  <i class="fas fa-store me-1"></i>
                  <span id="magasinActuelText">Sélectionner magasin</span>
                </button>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#modalReception">
                  <i class="fas fa-truck-loading me-1"></i> Nouvelle réception
                </button>
                <button id="btnAddProduit" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalProduit">
                  <i class="fas fa-plus me-1"></i> Ajouter produit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
<!-- 🚀 DASHBOARD KPI FALCON ADMIN STYLE -->
<div class="row g-3 mb-4">

  <!-- Stock Total -->
  <div class="col-md-3 col-sm-6">
    <div class="card h-100 border-0 shadow-sm">
      <div class="card-body d-flex align-items-center justify-content-between">
        <div>
          <p class="text-uppercase text-600 fs--2 mb-1">Stock total</p>
          <h3 class="mb-1 fs-2 text-1100" id="totalStock">0</h3>
          <p class="mb-0 fs--2 text-500">
            Mis à jour aujourd’hui
          </p>
        </div>
        <div class="ms-3">
          <div class="avatar avatar-l bg-soft-primary text-primary rounded-circle d-flex align-items-center justify-content-center">
            <span class="fas fs-4 fa-boxes"></span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Rayons Actifs -->
  <div class="col-md-3 col-sm-6">
    <div class="card h-100 border-0 shadow-sm">
      <div class="card-body d-flex align-items-center justify-content-between">
        <div>
          <p class="text-uppercase text-600 fs--2 mb-1">Rayons actifs</p>
          <h3 class="mb-1 fs-2 text-1100" id="rayonsActifs">0</h3>
          <p class="mb-0 fs--2 text-500">
            Rayons opérationnels
          </p>
        </div>
        <div class="ms-3">
          <div class="avatar avatar-l bg-soft-success text-success rounded-circle d-flex align-items-center justify-content-center">
            <span class="fas fs-4 fa-layer-group"></span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Alertes Stock -->
  <div class="col-md-3 col-sm-6">
    <div class="card h-100 border-0 shadow-sm">
      <div class="card-body d-flex align-items-center justify-content-between">
        <div>
          <p class="text-uppercase text-600 fs--2 mb-1">Alertes stock</p>
          <h3 class="mb-1 fs-2 text-1100" id="alertesStock">0</h3>
          <p class="mb-0 fs--2 text-500">
            Articles sous seuil
          </p>
        </div>
        <div class="ms-3">
          <div class="avatar avatar-l bg-soft-warning text-warning rounded-circle d-flex align-items-center justify-content-center">
            <span class="fas fs-4 fa-exclamation-triangle"></span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Rayons Pleins -->
  <div class="col-md-3 col-sm-6">
    <div class="card h-100 border-0 shadow-sm">
      <div class="card-body d-flex align-items-center justify-content-between">
        <div>
          <p class="text-uppercase text-600 fs--2 mb-1">Rayons pleins</p>
          <h3 class="mb-1 fs-2 text-1100" id="rayonsPleins">0</h3>
          <p class="mb-0 fs--2 text-500">
            Au maximum de capacité
          </p>
        </div>
        <div class="ms-3">
          <div class="avatar avatar-l bg-soft-danger text-danger rounded-circle d-flex align-items-center justify-content-center">
            <span class="fas fa-fire fs-4"></span>
          </div>
        </div>
      </div>
    </div>
  </div>

</div>


  <div class="row">
    <div class="col-md-12">
        <div class="card">
        <div class="card-body">
            <div class="row g-3 align-items-center">
                <div class="col-md-3">
                    <label for="filtreProduit" class="form-label">Produit</label>
                    <input type="text" class="form-control" id="filtreProduit" placeholder="Recherche par produit">
                </div>
                <div class="col-md-3">
                    <label for="filtreCategorie" class="form-label">Catégorie</label>
                    <input type="text" class="form-control" id="filtreCategorie" placeholder="Recherche par catégorie">
                </div>
                <div class="col-md-3">
                    <label for="filtreEtatStock" class="form-label">État du stock</label>
                    <select class="form-select" id="filtreEtatStock">
                        <option value="">Tous</option>
                        <option value="Disponible">Disponible</option>
                        <option value="En rupture">En rupture</option>
                        <option value="En commande">En commande</option>
                    </select>
                </div>
                <div class="col-md-3 d-flex gap-2 mt-5">
                    <button title="search" id="btnFiltrerStock" class="btn btn-outline-secondary flex-grow">
                        <i class="fas fa-search"></i>
                    </button>
                    <button title="actualiser" id="btnReinitialiserStock" class="btn btn-outline-danger flex-grow">
                        <i class="fas fa-undo"></i>
                    </button>
                </div>
            </div>
        <div class="row">
            <div class="col-md-12">
                <div class="row mt-2">
                    <div class="col-md-5">
                        <input class="search form-control mb-3" placeholder="Recherche globale..." />
                    </div>
                </div>
                <!-- tableau -->
               <div id="tableReceptions">
                <div data-list='{"valueNames":["id", "reference", "designation", "categorie", "quantite", "emplacement", "etat", "dateEntree", "actions"],"page":5,"pagination":true}'>
                    <table class="table table-bordered table-striped">
                    <thead>
                        <tr>
                        <th style="display:none;">ID</th>
                        <th class="sort" data-sort="reference">Référence et Désignation</th>
                        <th class="sort" data-sort="quantite">Quantité</th>
                        <th class="sort" data-sort="emplacement">Emplacement</th>
                        <th class="sort" data-sort="etat">État</th>
                        <th class="sort" data-sort="dateEntree">Date entrée</th>
                        <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody class="list">
                        <tr>
                        <td style="display:none;" class="id"></td>
                        <td class="reference"></td>
                        <td class="designation"></td>
                        <td class="quantite"></td>
                        <td class="emplacement"></td>
                        <td class="etat"></td>
                        <td class="dateEntree"></td>
                        <td class="actions"></td>
                        </tr>
                    </tbody>
                    </table>
                    <div class="d-flex justify-content-center mt-3">
                    <button class="btn btn-sm btn-secondary me-1" type="button" data-list-pagination="prev"><i class="fas fa-chevron-left"></i></button>
                    <ul class="pagination mb-0"></ul>
                    <button class="btn btn-sm btn-secondary ms-1" type="button" data-list-pagination="next"><i class="fas fa-chevron-right"></i></button>
                    </div>
                </div>
            </div>
        </div>
        </div>
    </div>
    </div>
    
  </div>

  <!-- 📦 MODAL DÉTAIL PRODUIT -->
  <?php include_once "modal_product_detail.php"; ?>

  <!-- 🏪 MODAL SÉLECTION MAGASIN -->
  <div class="modal fade" id="modalSelectMagasin" tabindex="-1" aria-labelledby="modalSelectMagasinLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content shadow-xl border-0">
        <div class="modal-header bg-gradient-primary text-white">
          <h5 class="modal-title">
            <i class="fas fa-store me-2"></i>Sélectionner un magasin
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <!-- Spinner de chargement -->
          <div id="magasinsSpinner" class="text-center py-5">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
            <p class="text-muted">Chargement des magasins...</p>
          </div>

          <!-- Liste des magasins -->
          <div id="magasinsList" style="display: none;">
            <!-- Sera rempli par JavaScript -->
          </div>

          <!-- Message d'erreur -->
          <div id="magasinsError" style="display: none;" class="alert alert-danger mb-0"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bouton flottant paramètres en bas à droite -->
  <button id="btnSettingsStock" class="btn btn-lg btn-primary" style="position: fixed; bottom: 30px; right: 30px; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 99;" data-bs-toggle="modal" data-bs-target="#modalStockSettings" title="Paramètres">
    <i class="fas fa-cog" style="font-size: 1.5rem; animation: spin 2s linear infinite;"></i>
  </button>

  <!-- Modal Paramètres Stock -->
   <?php include_once "modal_stock_settings.php"; ?>

<!-- 📦 Stock Management System Script -->
<script src="<?php echo BASE_URL; ?>assets/js/stock.js"></script>
