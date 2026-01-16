<?php include_once 'includes/auth-init.php'; ?>
<!DOCTYPE html>
<html lang="en-US" dir="ltr">

  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">


    <!-- ===============================================-->
    <!--    Document Title-->
    <!-- ===============================================-->
    <title>Falcon | Dashboard &amp; Web App Template</title>


    <!-- ===============================================-->
    <!--    Favicons-->
    <!-- ===============================================-->
    <link rel="apple-touch-icon" sizes="180x180" href="assets/img/favicons/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/img/favicons/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="assets/img/favicons/favicon-16x16.png">
    <link rel="shortcut icon" type="image/x-icon" href="assets/img/favicons/favicon.ico">
    <link rel="manifest" href="assets/img/favicons/manifest.json">
    <meta name="msapplication-TileImage" content="assets/img/favicons/mstile-150x150.png">
    <meta name="theme-color" content="#ffffff">
    <script src="assets/js/config.js"></script>
    <script src="vendors/simplebar/simplebar.min.js"></script>


    <!-- ===============================================-->
    <!--    Stylesheets-->
    <!-- ===============================================-->
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,600,700%7cPoppins:300,400,500,600,700,800,900&amp;display=swap" rel="stylesheet">
    <link href="vendors/simplebar/simplebar.min.css" rel="stylesheet">
    <link href="assets/css/theme-rtl.min.css" rel="stylesheet" id="style-rtl">
    <link href="assets/css/theme.min.css" rel="stylesheet" id="style-default">
    <link href="assets/css/user-rtl.min.css" rel="stylesheet" id="user-style-rtl">
    <link href="assets/css/user.min.css" rel="stylesheet" id="user-style-default">
    <script>
      var isRTL = JSON.parse(localStorage.getItem('isRTL'));
      if (isRTL) {
        var linkDefault = document.getElementById('style-default');
        var userLinkDefault = document.getElementById('user-style-default');
        linkDefault.setAttribute('disabled', true);
        userLinkDefault.setAttribute('disabled', true);
        document.querySelector('html').setAttribute('dir', 'rtl');
      } else {
        var linkRTL = document.getElementById('style-rtl');
        var userLinkRTL = document.getElementById('user-style-rtl');
        linkRTL.setAttribute('disabled', true);
        userLinkRTL.setAttribute('disabled', true);
      }
    </script>
  </head>


  <body>

    <!-- ===============================================-->
    <!--    Main Container-->
    <!-- ===============================================-->
    <main class="main" id="top">
      <div class="container" data-layout="container">
        <script>
          var isFluid = JSON.parse(localStorage.getItem('isFluid'));
          if (isFluid) {
            var container = document.querySelector('[data-layout]');
            container.classList.remove('container');
            container.classList.add('container-fluid');
          }
        </script>
        <!-- sidebare -->
        <?php include_once 'sidebar.php'; ?>

        <div class="content">
          <?php include_once 'topbar.php'; ?>
          <div class="card mb-3">
            <div class="card-body d-flex flex-wrap flex-between-center align-items-center">
              <div>
                <h6 class="text-primary">Gestion des Entreprises <span id="companiesCount" class="badge rounded-pill bg-info ms-2">0</span></h6>
                <p class="mb-0 text-600">Vue d'ensemble et actions rapides</p>
              </div>
              <div>
                <button id="btnToggleCompanies" class="btn btn-falcon-default btn-md me-2" type="button"><span class="fas fa-users me-md-1"></span><span class="d-none d-md-inline">Entreprises</span></button>
                <button id="btnAddCompany" class="btn btn-primary btn-md" type="button" aria-label="Créer une nouvelle entreprise" data-bs-toggle="modal" data-bs-target="#modalCreateBusiness"><span class="fas fa-plus me-md-1"></span><span class="d-none d-md-inline">Ajouter Entreprise</span></button>
              </div>
            </div>
          </div>

          <!-- Main 3-pane layout: left = companies list (toggle), center = company details, right = magasins/guichets -->
          <div class="row g-3 mb-3" id="businessManager">
            <div class="col-lg-4" id="leftPane" style="display:none;">
               <div class="card h-100 shadow-sm">
                <div class="card-header bg-light d-flex justify-content-between align-items-center">
                  <h6 class="mb-0"><i class="fas fa-list me-2"></i>Entreprises</h6>
                  <button class="btn btn-sm btn-outline-primary" id="refreshCompanies"><i class="fas fa-sync"></i></button>
                </div>
                <div class="card-body p-0">
                  <!-- Search & Filters -->
                  <div class="p-3 border-bottom">
                    <div class="input-group input-group-sm">
                      <span class="input-group-text"><i class="fas fa-search"></i></span>
                      <input type="text" id="searchCompanies" class="form-control" placeholder="Rechercher...">
                    </div>
                    <select id="filterStatus" class="form-select form-select-sm mt-2">
                      <option value="">Tous statuts</option>
                      <option value="actif">Actif</option>
                      <option value="inactif">Inactif</option>
                    </select>
                  </div>
                  <!-- Liste scrollable -->
                  <div id="companiesList" class="list-group list-group-flush" style="max-height: 60vh; overflow: auto;">
                    <div class="p-4 text-center">
                      <div class="spinner-border spinner-border-sm text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-7" id="centerPane">
              <div class="card h-100" id="companyOverview">
                <div class="card-body pb-0">
                  <div class="d-flex align-items-center">
                    <div class="me-3">
                      <div class="avatar avatar-xxl rounded-circle bg-soft-secondary">
                        <img id="companyLogo" class="rounded-circle" src="assets/img/elearning/avatar/student.png" alt="logo" width="96" height="96" />
                      </div>
                    </div>
                    <div class="flex-fill">
                      <div class="d-flex align-items-start justify-content-between">
                        <div>
                          <h5 id="companyName" class="mb-1">Aucune entreprise sélectionnée</h5>
                          <p id="companyInfo" class="text-600 mb-1">Sélectionnez une entreprise dans la liste pour voir son état.</p>
                          <div id="companyStatus" class="d-flex flex-wrap gap-2 align-items-center mt-1">
                            <a href="#" id="statusLink" class="text-600 text-decoration-none me-2">Statut inconnu</a>
                            <span id="statusBadge" class="badge rounded-pill badge-soft-secondary d-none d-md-inline-block">—</span>
                            <!-- <span id="budgetLight" class="badge rounded-pill bg-secondary">Budget: —</span> -->
                            <span id="guichetsLight" class="badge rounded-pill bg-secondary">Guichets: 0</span>
                            <span id="vendeursLight" class="badge rounded-pill bg-secondary">Vendeurs: 0</span>
                          </div>
                        </div>
                        <div class="text-end">
                          <div class="btn-group" role="group">
                            <button id="btnEditCompany" class="btn btn-outline-secondary btn-sm" type="button" aria-label="Modifier l'entreprise"><span class="fas fa-edit me-1"></span></button>
                            <button id="btnViewAffectations" class="btn btn-outline-primary btn-sm" disabled type="button"><span class="fas fa-eye me-1"></span>Affectations</button>
                          </div>
                          <div class="mt-2">
                            <button id="btnBackToList" class="btn btn-outline-secondary btn-sm d-none" type="button"><span class="fas fa-list me-1"></span>Retour à la liste</button>
                          </div>
                          <div class="mt-2"><small class="text-500">Dernière mise à jour: <span id="companyUpdatedAt">—</span></small></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="row mt-3 g-3">
                    <div class="col-sm-4">
                      <div class="card h-100">
                        <div class="card-body text-center">
                          <h6 class="mb-1">Budget</h6>
                          <div class="fs-2 text-700" id="companyBudget">-</div>
                          <div class="text-500 small mt-1" id="companyDevise">-</div>
                        </div>
                      </div>
                    </div>
                    <div class="col-sm-4">
                      <div class="card h-100">
                        <div class="card-body text-center">
                          <h6 class="mb-1">Chiffre d'affaires</h6>
                          <div class="fs-5 text-700" id="companyCA">-</div>
                          <div class="text-500 small mt-1">Période: <span id="caPeriod">mois</span></div>
                        </div>
                      </div>
                    </div>
                    <div class="col-sm-4">
                      <div class="card h-100 position-relative overflow-hidden" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        <div class="position-absolute" style="top: -40px; right: -40px; width: 120px; height: 120px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                        <div class="position-absolute" style="bottom: -20px; left: -30px; width: 100px; height: 100px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
                        <div class="card-body text-center position-relative" style="z-index: 1;">
                          <div class="d-flex align-items-center justify-content-center mb-2">
                            <span class="fas fa-store" style="font-size: 1.5rem; color: rgba(255,255,255,0.9);"></span>
                          </div>
                          <h6 class="mb-2 text-white fw-bold">Réseau</h6>
                          <div class="row g-2 align-items-center">
                            <div class="col-6">
                              <div style="background: rgba(255,255,255,0.2); border-radius: 8px; padding: 12px; backdrop-filter: blur(10px);">
                                <div class="fs-4 fw-bold text-white" id="companyStoresCount">0</div>
                                <div class="small text-white" style="font-size: 0.5rem; letter-spacing: 0.5px; opacity: 0.9;">MAGASINS</div>
                              </div>
                            </div>
                            <div class="col-6">
                              <div style="background: rgba(255,255,255,0.15); border-radius: 8px; padding: 12px; backdrop-filter: blur(10px);">
                                <div class="fs-4 fw-bold text-white" id="companyCountersGuichets">0</div>
                                <div class="small text-white" style="font-size: 0.5rem; letter-spacing: 0.5px; opacity: 0.9;">GUICHETS</div>
                              </div>
                            </div>
                          </div>
                          <div class="mt-3 pt-2" style="border-top: 1px solid rgba(255,255,255,0.2);">
                            <span class="badge badge-soft-light text-dark small" style="background: rgba(255,255,255,0.95); font-size: 0.7rem;">
                              <span class="fas fa-arrow-up me-1" style="color: #667eea;"></span><span id="storesTrend">+0</span> ce mois
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                
              </div>
            </div>

            <div class="col-lg-5" id="rightPane">
              <div class="card h-100">
                <div class="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">Magasins & Guichets</h6><span id="magasinsCountBadge" class="badge rounded-pill bg-success">0</span><button id="btnAddMagasin" class="btn btn-outline-primary btn-sm" aria-label="Ajouter un magasin" data-bs-toggle="modal" data-bs-target="#modalCreateMagasin" disabled><span class="fas fa-plus me-md-1"></span>Ajouter Magasin</button>
                </div>
                <div class="card-body p-0">
                  <div id="magasinsList" style="max-height:60vh; overflow:auto;">
                    <div class="p-3 text-center">
                      <div class="spinner-border spinner-border-sm text-primary mb-2" role="status">
                        <span class="visually-hidden">Chargement des magasins...</span>
                      </div>
                      <p class="text-muted small mt-2">Veuillez sélectionner une entreprise...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal: Create Business -->
          <div class="modal fade" id="modalCreateBusiness" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-md">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Créer une entreprise</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <form id="formCreateBusiness">
                    <div class="mb-2">
                      <label class="form-label">Nom</label>
                      <input name="nomEntreprise" class="form-control" required />
                    </div>
                    <div class="mb-2">
                      <label class="form-label">Adresse</label>
                      <input name="adresse" class="form-control" />
                    </div>
                    <div class="md-2">
                      <label class="form-label">Telephone</label>
                      <input name="telephone" class="form-control" />
                    </div>
                    <div class="mb-2 row">
                      <div class="col-6"><label class="form-label">RCCM</label><input name="rccm" class="form-control" /></div>
                      <div class="col-6"><label class="form-label">ID Nat</label><input name="idNat" class="form-control" /></div>
                    </div>
                    <div class="mb-2">
                      <label class="form-label">Site Web</label>
                      <input name="siteWeb" class="form-control" />
                    </div>
                    <div class="mb-2 row">
                      <div class="col-6"><label class="form-label">Forme Juridique</label><input name="formeJuridique" class="form-control" /></div>
                      <div class="col-6"><label class="form-label">Capital Social</label><input name="capitalSocial" type="number" class="form-control" value="0" /></div>
                    </div>
                    <div class="mb-2">
                      <label class="form-label">Siège Social</label>
                      <input name="siegeSocial" class="form-control" />
                    </div>
                    <div class="mb-2 row">
                      <div class="col-6"><label class="form-label">Budget</label><input name="budget" type="number" class="form-control" value="0" /></div>
                      <div class="col-6"><label class="form-label">Devise</label><input name="devise" class="form-control" value="USD" /></div>
                    </div>
                    <div class="mb-2">
                      <label class="form-label">Email</label>
                      <input name="email" type="email" class="form-control" />
                    </div>
                    <div class="mb-2">
                      <label class="form-label">Logo</label>
                      <div class="d-flex align-items-center gap-3">
                        <input name="logo" id="createLogoInput" type="file" accept="image/*" class="form-control" />
                        <img id="createLogoPreview" src="assets/img/elearning/avatar/student.png" alt="preview" width="64" height="64" style="display:none;object-fit:cover;border-radius:8px;"/>
                      </div>
                    </div>
                  </form>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                  <button id="submitCreateBusiness" type="button" class="btn btn-primary">Créer</button>
                </div>
              </div>
            </div>
          </div>

          
          <!-- Modal: Edit Business -->
          <div class="modal fade" id="modalEditBusiness" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-md">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Modifier l'entreprise</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <form id="formEditBusiness">
                    <div class="mb-2 text-center">
                      <img id="editLogoPreview" src="assets/img/elearning/avatar/student.png" alt="logo" width="96" height="96" class="rounded-circle mb-2" />
                    </div>
                    <div class="mb-2">
                      <label class="form-label">Nom</label>
                      <input name="nomEntreprise" id="edit_nomEntreprise" class="form-control" required />
                    </div>
                    <div class="mb-2">
                      <label class="form-label">Adresse</label>
                      <input name="adresse" id="edit_adresse" class="form-control" />
                    </div>
                    <div class="mb-2 row">
                      <div class="col-6"><label class="form-label">Budget</label><input name="budget" id="edit_budget" type="number" class="form-control" value="0" /></div>
                      <div class="col-6"><label class="form-label">Devise</label><input name="devise" id="edit_devise" class="form-control" value="USD" /></div>
                    </div>
                    <div class="mb-2">
                      <label class="form-label">Email</label>
                      <input name="email" id="edit_email" type="email" class="form-control" />
                    </div>
                    <div class="mb-2">
                      <label class="form-label">Logo</label>
                      <div class="d-flex align-items-center gap-3">
                        <input name="logo" id="editLogoInput" type="file" accept="image/*" class="form-control" />
                        <small class="text-500">Choisir un fichier pour remplacer le logo</small>
                      </div>
                    </div>
                    <div class="mb-2">
                      <label class="form-label">Téléphone</label>
                      <input name="telephone" id="edit_telephone" class="form-control" />
                    </div>
                    <div class="mb-2 row">
                      <div class="col-6"><label class="form-label">RCCM</label><input name="rccm" id="edit_rccm" class="form-control" /></div>
                      <div class="col-6"><label class="form-label">ID Nat</label><input name="idNat" id="edit_idNat" class="form-control" /></div>
                    </div>
                    <div class="mb-2">
                      <label class="form-label">Site Web</label>
                      <input name="siteWeb" id="edit_siteWeb" class="form-control" />
                    </div>
                    <div class="mb-2 row">
                      <div class="col-6"><label class="form-label">Forme Juridique</label><input name="formeJuridique" id="edit_formeJuridique" class="form-control" /></div>
                      <div class="col-6"><label class="form-label">Capital Social</label><input name="capitalSocial" id="edit_capitalSocial" type="number" class="form-control" value="0" /></div>
                    </div>
                    <div class="mb-2">
                      <label class="form-label">Siège Social</label>
                      <input name="siegeSocial" id="edit_siegeSocial" class="form-control" />
                    </div>
                  </form>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                  <button id="submitUpdateBusiness" data-business-id="" type="button" class="btn btn-primary">Enregistrer</button>
                </div>
              </div>
            </div>
          </div>
<!-- orders -->
        <div id="orders" class="row g-3 mb-3">
            <div class="col-md-12">
              <div class="card py-3 mb-3">
            <div class="card-body py-3">
              <div class="row g-0">
                <div class="col-6 col-md-4 border-200 border-bottom border-end pb-4">
                  <h6 class="pb-1 text-700">Orders </h6>
                  <p id="kpiOrders" class="font-sans-serif lh-1 mb-1 fs-2">— </p>
                  <div class="d-flex align-items-center">
                    <h6 class="fs--1 text-500 mb-0">— </h6>
                    <h6 class="fs--2 ps-3 mb-0 text-primary"><span class="me-1 fas fa-caret-up"></span>—%</h6>
                  </div>
                </div>
                <div class="col-6 col-md-4 border-200 border-md-200 border-bottom border-md-end pb-4 ps-3">
                  <h6 class="pb-1 text-700">Items sold </h6>
                  <p id="kpiItemsSold" class="font-sans-serif lh-1 mb-1 fs-2">— </p>
                  <div class="d-flex align-items-center">
                    <h6 class="fs--1 text-500 mb-0">— </h6>
                    <h6 class="fs--2 ps-3 mb-0 text-warning"><span class="me-1 fas fa-caret-up"></span>—%</h6>
                  </div>
                </div>
                <div class="col-6 col-md-4 border-200 border-bottom border-end border-md-end-0 pb-4 pt-4 pt-md-0 ps-md-3">
                  <h6 class="pb-1 text-700">Refunds </h6>
                  <p id="kpiRefunds" class="font-sans-serif lh-1 mb-1 fs-2">— </p>
                  <div class="d-flex align-items-center">
                    <h6 class="fs--1 text-500 mb-0">— </h6>
                    <h6 class="fs--2 ps-3 mb-0 text-success"><span class="me-1 fas fa-caret-up"></span>—%</h6>
                  </div>
                </div>
                <div class="col-6 col-md-4 border-200 border-md-200 border-bottom border-md-bottom-0 border-md-end pt-4 pb-md-0 ps-3 ps-md-0">
                  <h6 class="pb-1 text-700">Gross sale </h6>
                  <p id="kpiGrossSale" class="font-sans-serif lh-1 mb-1 fs-2">— </p>
                  <div class="d-flex align-items-center">
                    <h6 class="fs--1 text-500 mb-0">— </h6>
                    <h6 class="fs--2 ps-3 mb-0 text-danger"><span class="me-1 fas fa-caret-up"></span>—%</h6>
                  </div>
                </div>
                <div class="col-6 col-md-4 border-200 border-md-bottom-0 border-end pt-4 pb-md-0 ps-md-3">
                  <h6 class="pb-1 text-700">Shipping </h6>
                  <p id="kpiShipping" class="font-sans-serif lh-1 mb-1 fs-2">— </p>
                  <div class="d-flex align-items-center">
                    <h6 class="fs--1 text-500 mb-0">— </h6>
                    <h6 class="fs--2 ps-3 mb-0 text-success"><span class="me-1 fas fa-caret-up"></span>—%</h6>
                  </div>
                </div>
                <div class="col-6 col-md-4 pb-0 pt-4 ps-3">
                  <h6 class="pb-1 text-700">Processing </h6>
                  <p id="kpiProcessing" class="font-sans-serif lh-1 mb-1 fs-2">— </p>
                  <div class="d-flex align-items-center">
                    <h6 class="fs--1 text-500 mb-0">— </h6>
                    <h6 class="fs--2 ps-3 mb-0 text-info"><span class="me-1 fas fa-caret-up"></span>—%</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
            </div>
        </div>

          <!-- revenues globales -->
          <div class="row g-3 mb-3">
            <div class="col-lg-5 col-xxl-3">
              <div class="card h-100">
                <div class="card-header">
                  <div class="row justify-content-between gx-0">
                    <div class="col-auto">
                      <h1 class="fs-0 text-900">Revenue Global</h1>
                      <div class="d-flex">
                        <h4 id="grossRevenueValue" class="text-primary mb-0">—</h4>
                        <div class="ms-3"><span class="badge rounded-pill badge-soft-primary"><span class="fas fa-caret-up"></span> 5%</span></div>
                      </div>
                    </div>
                    <div class="col-auto">
                      <select class="form-select form-select-sm pe-4" id="select-gross-revenue-month">
                        <option value="0">Jan</option>
                        <option value="1">Feb</option>
                        <option value="2">Mar</option>
                        <option value="3">Apr</option>
                        <option value="4">May</option>
                        <option value="5">Jun</option>
                        <option value="6">Jul</option>
                        <option value="7">Aug</option>
                        <option value="8">Sep</option>
                        <option value="9">Oct</option>
                        <option value="10">Nov</option>
                        <option value="11">Dec</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="card-body pt-0 pb-3 h-100">
                  <div class="mx-ncard d-flex align-items-center justify-content-center" style="min-height: 250px;">
                    <p class="text-muted text-center">Sélectionnez une entreprise pour voir le graphique</p>
                  </div>
                </div>
                <div class="card-footer border-top py-2 d-flex flex-between-center">
                  <div>
                    <button id="saveGrossRevenueBtn" class="btn btn-sm btn-primary me-2">Enregistrer</button>
                  </div>
                  <div class="d-flex" id="gross-revenue-footer">
                    <div class="btn btn-sm btn-text d-flex align-items-center p-0 shadow-none" id="currentMonth" data-month="current"><span class="fas fa-circle text-primary fs--2 me-1"></span><span class="text">Jan</span></div>
                    <div class="btn btn-sm btn-text d-flex align-items-center p-0 shadow-none ms-2" id="prevMonth" data-month="prev"><span class="fas fa-circle text-300 fs--2 me-1"></span><span class="text">Dec</span></div>
                  </div><a class="btn btn-link btn-sm px-0" href="#!">View report<span class="fas fa-chevron-right ms-1 fs--2"></span></a>
                </div>
              </div>
            </div>
            <div class="col-xxl-8 col-xxl-9 order-xxl-1 order-lg-2 order-1">
              <div class="card h-100" id="paymentHistoryTable" data-list='{"valueNames":["course","invoice","date","amount","status"],"page":5}'>
                <div class="card-header d-flex flex-between-center">
                  <h5 class="mb-0 text-nowrap py-2 py-xl-0">Historique des transactions</h5>
                  <div>
                    <button class="btn btn-falcon-default btn-sm me-2" type="button"><span class="fas fa-filter fs--2"></span><span class="d-none d-sm-inline-block ms-1 align-middle">Filter</span></button>
                    <button class="btn btn-falcon-default btn-sm" type="button"><span class="fas fa-external-link-alt fs--2"></span><span class="d-none d-sm-inline-block ms-1 align-middle">Export</span></button>
                  </div>
                </div>
                <div class="card-body p-0">
                  <div class="p-3 border-bottom">
                    <div class="input-group input-group-sm">
                      <input type="text" id="productNameInput" class="form-control" placeholder="Produit" />
                      <input type="number" id="productQtyInput" class="form-control" placeholder="Quantité" min="1" style="max-width:120px" />
                      <input type="number" id="productPriceInput" class="form-control" placeholder="Prix" step="0.01" style="max-width:140px" />
                      <button id="addProductBtn" class="btn btn-primary">Ajouter</button>
                      <button id="saveProductsBtn" class="btn btn-outline-success ms-2">Enregistrer</button>
                    </div>
                  </div>
              <div class="table-responsive scrollbar">
                    <table class="table mb-0 fs--1 border-200 overflow-hidden">
                      <thead class="bg-light text-900 font-sans-serif">
                        <tr>
                          <th class="sort align-middle fw-medium" data-sort="course">Course</th>
                          <th class="sort align-middle fw-medium" data-sort="invoice">Invoice no.</th>
                          <th class="sort align-middle fw-medium" data-sort="date">Date</th>
                          <th class="sort align-middle fw-medium text-end" data-sort="amount">Amount</th>
                          <th class="sort align-middle fw-medium text-end" data-sort="status">Payment Status</th>
                        </tr>
                      </thead>
                      <tbody class="list">
                        <tr class="fw-semi-bold text-center">
                          <td colspan="5" class="align-middle py-4 text-muted">Sélectionnez une entreprise pour voir les transactions</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div class="card-footer text-end bg-light">
                  <p class="mb-0 fs--1"><span class="d-none d-sm-inline-block me-2" data-list-info="data-list-info"> </span><span class="d-none d-sm-inline-block me-2">&mdash;  </span><a class="fw-semi-bold" href="#!" data-list-view="*">View all<span class="fas fa-angle-right ms-1" data-fa-transform="down-1"></span></a><a class="fw-semi-bold d-none" href="#!" data-list-view="less">View less<span class="fas fa-angle-right ms-1" data-fa-transform="down-1"></span></a>
                  </p>
                </div>
              </div>
            </div>
          
            <div class="col-md-6 col-lg-7 col-xxl-4 order-xxl-3 order-lg-1 order-3">
              <div class="card h-100 font-sans-serif">
                <div class="card-header bg-light d-flex flex-between-center py-2">
                  <h6 class="mb-0">Recent Activities</h6>
                  <div class="dropdown font-sans-serif position-static d-inline-block btn-reveal-trigger">
                    <button class="btn btn-link text-600 btn-sm dropdown-toggle btn-reveal dropdown-caret-none" type="button" id="dropdown-recent-activities" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs--1"></span></button>
                    <div class="dropdown-menu dropdown-menu-end border py-2" aria-labelledby="dropdown-recent-activities"><a class="dropdown-item" href="#!">View</a><a class="dropdown-item" href="#!">Edit</a>
                      <div class="dropdown-divider"></div><a class="dropdown-item text-danger" href="#!">Delete</a>
                    </div>
                  </div>
                </div>
                <div class="card-body py-0 scrollbar-overlay recent-activity-body-height">
                  <div id="recentActivitiesList" class="timeline-simple">
                    <div class="timeline-item position-relative">
                      <div class="row g-0 align-items-center">
                        <div class="col-auto d-flex align-items-center">
                          <h6 class="timeline-item-date fs--2 text-500 text-truncate mb-0 me-1"> 3h ago</h6>
                          <div class="position-relative">
                            <div class="icon-item icon-item-md rounded-7 shadow-none bg-200"><span class="text-primary fas fa-sign-out-alt"></span></div>
                          </div>
                        </div>
                        <div class="col ps-3 fs--1 text-500">
                          <div class="py-x1">
                            <h5 class="fs--1">Logged out</h5>
                            <p class="mb-0">Logged out from cart screen</p>
                          </div>
                          <hr class="text-200 my-0" />
                        </div>
                      </div>
                    </div>
                    <div class="timeline-item position-relative">
                      <div class="row g-0 align-items-center">
                        <div class="col-auto d-flex align-items-center">
                          <h6 class="timeline-item-date fs--2 text-500 text-truncate mb-0 me-1"> 3h ago</h6>
                          <div class="position-relative">
                            <div class="icon-item icon-item-md rounded-7 shadow-none bg-200"><span class="text-primary fas fa-shopping-cart"></span></div>
                          </div>
                        </div>
                        <div class="col ps-3 fs--1 text-500">
                          <div class="py-x1">
                            <h5 class="fs--1">Added course#123456 to cart</h5>
                            <p class="mb-0">Added course to cart, Did not pay, Left cart</p>
                          </div>
                          <hr class="text-200 my-0" />
                        </div>
                      </div>
                    </div>
                    <div class="timeline-item position-relative">
                      <div class="row g-0 align-items-center">
                        <div class="col-auto d-flex align-items-center">
                          <h6 class="timeline-item-date fs--2 text-500 text-truncate mb-0 me-1"> 3h ago</h6>
                          <div class="position-relative">
                            <div class="icon-item icon-item-md rounded-7 shadow-none bg-200"><span class="text-primary fas fa-download"></span></div>
                          </div>
                        </div>
                        <div class="col ps-3 fs--1 text-500">
                          <div class="py-x1">
                            <h5 class="fs--1">Downloaded Materials of #121212</h5>
                            <p class="mb-0">3 pdf files were downloaded, learner completed 75% </p>
                          </div>
                          <hr class="text-200 my-0" />
                        </div>
                      </div>
                    </div>
                    <div class="timeline-item position-relative">
                      <div class="row g-0 align-items-center">
                        <div class="col-auto d-flex align-items-center">
                          <h6 class="timeline-item-date fs--2 text-500 text-truncate mb-0 me-1"> 5h ago</h6>
                          <div class="position-relative">
                            <div class="icon-item icon-item-md rounded-7 shadow-none bg-200"><span class="text-primary fas fa-envelope"></span></div>
                          </div>
                        </div>
                        <div class="col ps-3 fs--1 text-500">
                          <div class="py-x1">
                            <h5 class="fs--1">Sent a direct mail to Tra_bil37a8</h5>
                            <p class="mb-0">Tra_bil37a8 is trainer of course#121212 </p>
                          </div>
                          <hr class="text-200 my-0" />
                        </div>
                      </div>
                    </div>
                    <div class="timeline-item position-relative">
                      <div class="row g-0 align-items-center">
                        <div class="col-auto d-flex align-items-center">
                          <h6 class="timeline-item-date fs--2 text-500 text-truncate mb-0 me-1"> 5h ago</h6>
                          <div class="position-relative">
                            <div class="icon-item icon-item-md rounded-7 shadow-none bg-200"><span class="text-primary fas fa-file-upload"></span></div>
                          </div>
                        </div>
                        <div class="col ps-3 fs--1 text-500">
                          <div class="py-x1">
                            <h5 class="fs--1">Submitted assignment no.3</h5>
                            <p class="mb-0">Assignment of course#121212 was due yesterday.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-footer bg-light py-2">
                  <div class="row justify-content-between">
                    <div class="col-auto">
                      <select class="form-select form-select-sm">
                        <option value="today" selected="selected">Today</option>
                        <option value="week">last week</option>
                        <option value="month">last month</option>
                      </select>
                    </div>
                    <div class="col-auto"><a class="btn btn-sm btn-falcon-default" href="#!">View All</a></div>
                  </div>
                </div>
              </div>
            </div>
          
          </div>
             <!-- total sales -->
            <div class="card h-100 mb-3">
                <div class="card-header ">
                  <div class="row flex-between-center">
                    <div class="col-auto">
                      <h6 class="mb-0">Total Sales</h6>
                    </div>
                    <div class="col-auto d-flex">
                      <select class="form-select form-select-sm select-month me-2">
                        <option value="0">January</option>
                        <option value="1">February</option>
                        <option value="2">March</option>
                        <option value="3">April</option>
                        <option value="4">May</option>
                        <option value="5">Jun</option>
                        <option value="6">July</option>
                        <option value="7">August</option>
                        <option value="8">September</option>
                        <option value="9">October</option>
                        <option value="10">November</option>
                        <option value="11">December</option>
                      </select>
                      <div class="dropdown font-sans-serif btn-reveal-trigger">
                        <button class="btn btn-link text-600 btn-sm dropdown-toggle dropdown-caret-none btn-reveal" type="button" id="dropdown-total-sales" data-bs-toggle="dropdown" data-boundary="viewport" aria-haspopup="true" aria-expanded="false"><span class="fas fa-ellipsis-h fs--2"></span></button>
                        <div class="dropdown-menu dropdown-menu-end border py-2" aria-labelledby="dropdown-total-sales"><a class="dropdown-item" href="#!">View</a><a class="dropdown-item" href="#!">Export</a>
                          <div class="dropdown-divider"></div><a class="dropdown-item text-danger" href="#!">Remove</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-body h-100 pe-0 d-flex align-items-center justify-content-center" style="min-height: 300px;">
                  <p class="text-muted text-center">Sélectionnez une entreprise pour voir le graphique</p>
                </div>
                <div class="card-footer text-end">
                  <button id="saveTotalSalesBtn" class="btn btn-sm btn-primary">Enregistrer</button>
                </div>
              </div>
          <div class="card" id="enrolledCoursesTable" data-list='{"valueNames":["title","trainer","date","time","progress","price"]}'>
            <div class="card-header d-flex flex-between-center">
              <h6 class="mb-0">Produits vendues</h6>
              <div>
                <button class="btn btn-falcon-default btn-sm me-2" type="button"><span class="fas fa-filter fs--2"></span><span class="d-none d-sm-inline-block ms-1 align-middle">Filter</span></button>
                <button class="btn btn-falcon-default btn-sm" type="button"><span class="fas fa-expand-arrows-alt fs--2"></span><span class="d-none d-sm-inline-block ms-1 align-middle">Expand</span></button>
              </div>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive scrollbar">
                <table class="table mb-0 fs--1 border-200 overflow-hidden table-enrolled-courses">
                  <thead class="bg-light font-sans-serif">
                    <tr class="text-800">
                      <th class="fw-medium sort" data-sort="title">Designation</th>
                      <th class="fw-medium sort" data-sort="trainer">Vendeur</th>
                      <th class="fw-medium sort" data-sort="date">Date</th>
                      <th class="fw-medium sort" data-sort="time">Quantite</th>
                      <th class="fw-medium sort" data-sort="progress">Etat du Stock</th>
                      <th class="fw-medium sort text-end" data-sort="price">Prix</th>
                      <th class="fw-medium no-sort pe-1 align-middle data-table-row-action"></th>
                    </tr>
                  </thead>
                  <tbody class="list">
                    <tr class="btn-reveal-trigger fw-semi-bold text-center">
                      <td colspan="7" class="align-middle py-4 text-muted">Sélectionnez une entreprise pour voir les produits</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="card-footer bg-light py-2 text-center"><a class="btn btn-link btn-sm px-0 fw-medium" href="#!">Show all enrollments<span class="fas fa-chevron-right ms-1 fs--2"></span></a></div>
          </div>
          <footer class="footer">
            <div class="row g-0 justify-content-between fs--1 mt-4 mb-3">
              <div class="col-12 col-sm-auto text-center">
                <p class="mb-0 text-600">Thank you for creating with Falcon <span class="d-none d-sm-inline-block">| </span><br class="d-sm-none" /> 2022 &copy; <a href="https://themewagon.com">Themewagon</a></p>
              </div>
              <div class="col-12 col-sm-auto text-center">
                <p class="mb-0 text-600">v3.14.0</p>
              </div>
            </div>
          </footer>
        </div>
        <!-- modal -->
        <script>
          // Global API base used by inline modal scripts
          const API_BASE = 'https://backend-gestion-de-stock.onrender.com';
        </script>
        <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
         <?php include_once 'modals/magasins-guichets-modals.php'; ?>
       
      </div>
    </main>
    <!-- ===============================================-->
    <!--    End of Main Content-->
    <!-- ===============================================-->


    <div class="offcanvas offcanvas-end settings-panel border-0" id="settings-offcanvas" tabindex="-1" aria-labelledby="settings-offcanvas">
      <div class="offcanvas-header settings-panel-header bg-shape">
        <div class="z-index-1 py-1 light">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <h5 class="text-white mb-0 me-2"><span class="fas fa-palette me-2 fs-0"></span>Settings</h5>
            <button class="btn btn-primary btn-sm rounded-pill mt-0 mb-0" data-theme-control="reset" style="font-size:12px"> <span class="fas fa-redo-alt me-1" data-fa-transform="shrink-3"></span>Reset</button>
          </div>
          <p class="mb-0 fs--1 text-white opacity-75"> Set your own customized style</p>
        </div>
        <button class="btn-close btn-close-white z-index-1 mt-0" type="button" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body scrollbar-overlay px-x1 h-100" id="themeController">
        <h5 class="fs-0">Color Scheme</h5>
        <p class="fs--1">Choose the perfect color mode for your app.</p>
        <div class="btn-group d-block w-100 btn-group-navbar-style">
          <div class="row gx-2">
            <div class="col-6">
              <input class="btn-check" id="themeSwitcherLight" name="theme-color" type="radio" value="light" data-theme-control="theme" />
              <label class="btn d-inline-block btn-navbar-style fs--1" for="themeSwitcherLight"> <span class="hover-overlay mb-2 rounded d-block"><img class="img-fluid img-prototype mb-0" src="assets/img/generic/falcon-mode-default.jpg" alt=""/></span><span class="label-text">Light</span></label>
            </div>
            <div class="col-6">
              <input class="btn-check" id="themeSwitcherDark" name="theme-color" type="radio" value="dark" data-theme-control="theme" />
              <label class="btn d-inline-block btn-navbar-style fs--1" for="themeSwitcherDark"> <span class="hover-overlay mb-2 rounded d-block"><img class="img-fluid img-prototype mb-0" src="assets/img/generic/falcon-mode-dark.jpg" alt=""/></span><span class="label-text"> Dark</span></label>
            </div>
          </div>
        </div>
        <hr />
        <div class="d-flex justify-content-between">
          <div class="d-flex align-items-start"><img class="me-2" src="assets/img/icons/left-arrow-from-left.svg" width="20" alt="" />
            <div class="flex-1">
              <h5 class="fs-0">RTL Mode</h5>
              <p class="fs--1 mb-0">Switch your language direction </p><a class="fs--1" href="documentation/customization/configuration.html">RTL Documentation</a>
            </div>
          </div>
          <div class="form-check form-switch">
            <input class="form-check-input ms-0" id="mode-rtl" type="checkbox" data-theme-control="isRTL" />
          </div>
        </div>
        <hr />
        <div class="d-flex justify-content-between">
          <div class="d-flex align-items-start"><img class="me-2" src="assets/img/icons/arrows-h.svg" width="20" alt="" />
            <div class="flex-1">
              <h5 class="fs-0">Fluid Layout</h5>
              <p class="fs--1 mb-0">Toggle container layout system </p><a class="fs--1" href="documentation/customization/configuration.html">Fluid Documentation</a>
            </div>
          </div>
          <div class="form-check form-switch">
            <input class="form-check-input ms-0" id="mode-fluid" type="checkbox" data-theme-control="isFluid" />
          </div>
        </div>
        <hr />
        <div class="d-flex align-items-start"><img class="me-2" src="assets/img/icons/paragraph.svg" width="20" alt="" />
          <div class="flex-1">
            <h5 class="fs-0 d-flex align-items-center">Navigation Position</h5>
            <p class="fs--1 mb-2">Select a suitable navigation system for your web application </p>
            <div>
              <select class="form-select form-select-sm" aria-label="Navbar position" data-theme-control="navbarPosition">
                <option value="vertical" data-page-url="modules/components/navs-and-tabs/vertical-navbar.html">Vertical</option>
                <option value="top" data-page-url="modules/components/navs-and-tabs/top-navbar.html">Top</option>
                <option value="combo" data-page-url="modules/components/navs-and-tabs/combo-navbar.html">Combo</option>
                <option value="double-top" data-page-url="modules/components/navs-and-tabs/double-top-navbar.html">Double Top</option>
              </select>
            </div>
          </div>
        </div>
        <hr />
        <h5 class="fs-0 d-flex align-items-center">Vertical Navbar Style</h5>
        <p class="fs--1 mb-0">Switch between styles for your vertical navbar </p>
        <p> <a class="fs--1" href="modules/components/navs-and-tabs/vertical-navbar.html#navbar-styles">See Documentation</a></p>
        <div class="btn-group d-block w-100 btn-group-navbar-style">
          <div class="row gx-2">
            <div class="col-6">
              <input class="btn-check" id="navbar-style-transparent" type="radio" name="navbarStyle" value="transparent" data-theme-control="navbarStyle" />
              <label class="btn d-block w-100 btn-navbar-style fs--1" for="navbar-style-transparent"> <img class="img-fluid img-prototype" src="assets/img/generic/default.png" alt="" /><span class="label-text"> Transparent</span></label>
            </div>
            <div class="col-6">
              <input class="btn-check" id="navbar-style-inverted" type="radio" name="navbarStyle" value="inverted" data-theme-control="navbarStyle" />
              <label class="btn d-block w-100 btn-navbar-style fs--1" for="navbar-style-inverted"> <img class="img-fluid img-prototype" src="assets/img/generic/inverted.png" alt="" /><span class="label-text"> Inverted</span></label>
            </div>
            <div class="col-6">
              <input class="btn-check" id="navbar-style-card" type="radio" name="navbarStyle" value="card" data-theme-control="navbarStyle" />
              <label class="btn d-block w-100 btn-navbar-style fs--1" for="navbar-style-card"> <img class="img-fluid img-prototype" src="assets/img/generic/card.png" alt="" /><span class="label-text"> Card</span></label>
            </div>
            <div class="col-6">
              <input class="btn-check" id="navbar-style-vibrant" type="radio" name="navbarStyle" value="vibrant" data-theme-control="navbarStyle" />
              <label class="btn d-block w-100 btn-navbar-style fs--1" for="navbar-style-vibrant"> <img class="img-fluid img-prototype" src="assets/img/generic/vibrant.png" alt="" /><span class="label-text"> Vibrant</span></label>
            </div>
          </div>
        </div>
        <div class="text-center mt-5"><img class="mb-4" src="assets/img/icons/spot-illustrations/47.png" alt="" width="120" />
          <h5>Like What You See?</h5>
          <p class="fs--1">Get Falcon now and create beautiful dashboards with hundreds of widgets.</p><a class="mb-3 btn btn-primary" href="https://themes.getbootstrap.com/product/falcon-admin-dashboard-webapp-template/" target="_blank">Purchase</a>
        </div>
      </div>
    </div>
    <a class="card setting-toggle" href="#settings-offcanvas" data-bs-toggle="offcanvas">
      <div class="card-body d-flex align-items-center py-md-2 px-2 py-1">
        <div class="bg-soft-primary position-relative rounded-start" style="height:34px;width:28px">
          <div class="settings-popover"><span class="ripple"><span class="fa-spin position-absolute all-0 d-flex flex-center"><span class="icon-spin position-absolute all-0 d-flex flex-center">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.7369 12.3941L19.1989 12.1065C18.4459 11.7041 18.0843 10.8487 18.0843 9.99495C18.0843 9.14118 18.4459 8.28582 19.1989 7.88336L19.7369 7.59581C19.9474 7.47484 20.0316 7.23291 19.9474 7.03131C19.4842 5.57973 18.6843 4.28943 17.6738 3.20075C17.5053 3.03946 17.2527 2.99914 17.0422 3.12011L16.393 3.46714C15.6883 3.84379 14.8377 3.74529 14.1476 3.3427C14.0988 3.31422 14.0496 3.28621 14.0002 3.25868C13.2568 2.84453 12.7055 2.10629 12.7055 1.25525V0.70081C12.7055 0.499202 12.5371 0.297594 12.2845 0.257272C10.7266 -0.105622 9.16879 -0.0653007 7.69516 0.257272C7.44254 0.297594 7.31623 0.499202 7.31623 0.70081V1.23474C7.31623 2.09575 6.74999 2.8362 5.99824 3.25599C5.95774 3.27861 5.91747 3.30159 5.87744 3.32493C5.15643 3.74527 4.26453 3.85902 3.53534 3.45302L2.93743 3.12011C2.72691 2.99914 2.47429 3.03946 2.30587 3.20075C1.29538 4.28943 0.495411 5.57973 0.0322686 7.03131C-0.051939 7.23291 0.0322686 7.47484 0.242788 7.59581L0.784376 7.8853C1.54166 8.29007 1.92694 9.13627 1.92694 9.99495C1.92694 10.8536 1.54166 11.6998 0.784375 12.1046L0.242788 12.3941C0.0322686 12.515 -0.051939 12.757 0.0322686 12.9586C0.495411 14.4102 1.29538 15.7005 2.30587 16.7891C2.47429 16.9504 2.72691 16.9907 2.93743 16.8698L3.58669 16.5227C4.29133 16.1461 5.14131 16.2457 5.8331 16.6455C5.88713 16.6767 5.94159 16.7074 5.99648 16.7375C6.75162 17.1511 7.31623 17.8941 7.31623 18.7552V19.2891C7.31623 19.4425 7.41373 19.5959 7.55309 19.696C7.64066 19.7589 7.74815 19.7843 7.85406 19.8046C9.35884 20.0925 10.8609 20.0456 12.2845 19.7729C12.5371 19.6923 12.7055 19.4907 12.7055 19.2891V18.7346C12.7055 17.8836 13.2568 17.1454 14.0002 16.7312C14.0496 16.7037 14.0988 16.6757 14.1476 16.6472C14.8377 16.2446 15.6883 16.1461 16.393 16.5227L17.0422 16.8698C17.2527 16.9907 17.5053 16.9504 17.6738 16.7891C18.7264 15.7005 19.4842 14.4102 19.9895 12.9586C20.0316 12.757 19.9474 12.515 19.7369 12.3941ZM10.0109 13.2005C8.1162 13.2005 6.64257 11.7893 6.64257 9.97478C6.64257 8.20063 8.1162 6.74905 10.0109 6.74905C11.8634 6.74905 13.3792 8.20063 13.3792 9.97478C13.3792 11.7893 11.8634 13.2005 10.0109 13.2005Z" fill="#2A7BE4"></path>
                  </svg></span></span></span></div>
        </div><small class="text-uppercase text-primary fw-bold bg-soft-primary py-2 pe-2 ps-1 rounded-end">customize</small>
      </div>
    </a>


    <!-- ===============================================-->
    <!--    JavaScripts-->
    <!-- ===============================================-->
    <script src="vendors/popper/popper.min.js"></script>
    <script src="vendors/bootstrap/bootstrap.min.js"></script>
    <script src="vendors/anchorjs/anchor.min.js"></script>
    <script src="vendors/is/is.min.js"></script>
    <script src="vendors/echarts/echarts.min.js"></script>
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyARdVcREeBK44lIWnv5-iPijKqvlSAVwbw&callback=initMap" async></script>
    <script src="vendors/dayjs/dayjs.min.js"></script>
    <script src="vendors/fontawesome/all.min.js"></script>
    <script src="vendors/lodash/lodash.min.js"></script>
    <!-- <script src="https://polyfill.io/v3/polyfill.min.js?features=window.scroll"></script> -->
    <script src="vendors/list.js/list.min.js"></script>
    <script src="assets/js/theme.js"></script>
    <script src="assets/js/auth-protection.js"></script>
    <script src="assets/js/entreprise.js"></script>


    <script>
      (function(){
        function getBizKey(){
          return 'company_' + (localStorage.getItem('businessId') || 'global');
        }

        function parseCurrency(text){
          if(!text) return 0;
          const n = text.toString().replace(/[^0-9.-]+/g,'');
          return parseFloat(n) || 0;
        }

        // Activities
        function loadActivities(){
          const key = getBizKey() + '_activities';
          try{ return JSON.parse(localStorage.getItem(key)) || []; }catch(e){ return []; }
        }
        function saveActivities(arr){
          const key = getBizKey() + '_activities';
          localStorage.setItem(key, JSON.stringify(arr));
        }

        function getToken(){
          return localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt') || localStorage.getItem('accessToken') || localStorage.getItem('userToken') || null;
        }

        async function postActivityToServer(businessId, payload){
          try{
            const token = getToken();
            if(!token) throw new Error('No token');
            const res = await fetch('/api/business/' + businessId + '/activities', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
              body: JSON.stringify(payload)
            });
            if(!res.ok) throw new Error('Server responded ' + res.status);
            const data = await res.json();
            return data.activity || data;
          }catch(err){
            console.warn('postActivityToServer failed', err && err.message);
            return null;
          }
        }

        async function fetchActivitiesFromServer(businessId){
          try{
            const token = getToken();
            if(!token) return null;
            const res = await fetch('/api/business/' + businessId + '/activities?limit=100', { headers: { 'Authorization': 'Bearer ' + token } });
            if(!res.ok) return null;
            const json = await res.json();
            return Array.isArray(json.activities) ? json.activities : null;
          }catch(e){
            console.warn('fetchActivitiesFromServer failed', e && e.message);
            return null;
          }
        }

        async function recordActivity(title, description, icon){
          const businessId = localStorage.getItem('businessId') || null;
          const item = { ts: Date.now(), title, description, icon: icon || 'fas fa-info-circle' };

          // Try to post to server first
          if(businessId){
            const posted = await postActivityToServer(businessId, item);
            if(posted){
              // preprend to local copy for immediate UI
              const activities = loadActivities();
              activities.unshift({ ts: posted.ts || Date.now(), title: posted.title || title, description: posted.description || description, icon: posted.icon || icon });
              saveActivities(activities);
              renderActivities();
              return;
            }
          }

          // fallback: save locally
          const activities = loadActivities();
          activities.unshift(item);
          saveActivities(activities);
          renderActivities();
        }
        // expose helper to global scope so external scripts can call it
        try{ window.recordActivity = recordActivity; }catch(e){ /* noop if not available */ }
        function renderActivities(){
          const container = document.getElementById('recentActivitiesList');
          if(!container) return;
          const activities = loadActivities();
          // Clear existing timeline items (keep header structure)
          container.innerHTML = '';
          activities.slice(0,50).forEach(a => {
            const d = new Date(a.ts);
            const timeAgo = Math.round((Date.now()-a.ts)/3600000) + 'h ago';
            const html = `
              <div class="timeline-item position-relative">
                <div class="row g-0 align-items-center">
                  <div class="col-auto d-flex align-items-center">
                    <h6 class="timeline-item-date fs--2 text-500 text-truncate mb-0 me-1"> ${timeAgo}</h6>
                    <div class="position-relative">
                      <div class="icon-item icon-item-md rounded-7 shadow-none bg-200"><span class="text-primary ${a.icon}"></span></div>
                    </div>
                  </div>
                  <div class="col ps-3 fs--1 text-500">
                    <div class="py-x1">
                      <h5 class="fs--1">${a.title}</h5>
                      <p class="mb-0">${a.description}</p>
                    </div>
                    <hr class="text-200 my-0" />
                  </div>
                </div>
              </div>`;
            container.insertAdjacentHTML('beforeend', html);
          });
        }

        // Gross revenue
        document.getElementById('saveGrossRevenueBtn')?.addEventListener('click', function(){
          const value = document.getElementById('grossRevenueValue')?.textContent || '';
          const monthSel = document.getElementById('select-gross-revenue-month');
          const month = monthSel ? monthSel.value : '0';
          const data = { amount: parseCurrency(value), month: month, savedAt: Date.now() };
          localStorage.setItem(getBizKey() + '_grossRevenue', JSON.stringify(data));
          recordActivity('Revenue sauvegardé', `Montant: ${value} (mois ${month})`, 'fas fa-dollar-sign');

          // Try to persist to server
          (async function(){
            const businessId = localStorage.getItem('businessId');
            const token = getToken();
            if(businessId && token){
              try{
                await updateBusinessOnServer(businessId, { chiffre_affaires: data.amount });
              }catch(e){ console.warn('Failed to persist gross revenue', e && e.message); }
            }
          })();

          alert('Revenue global enregistré');
        });

        // Total sales
        document.getElementById('saveTotalSalesBtn')?.addEventListener('click', function(){
          // sum amounts from paymentHistoryTable
          let sum = 0;
          document.querySelectorAll('#paymentHistoryTable .amount').forEach(td=>{ sum += parseCurrency(td.textContent); });
          const sel = document.querySelector('.select-month');
          const month = sel ? sel.value : '0';
          const data = { total: sum, month: month, savedAt: Date.now() };
          localStorage.setItem(getBizKey() + '_totalSales_' + month, JSON.stringify(data));
          recordActivity('Total Sales sauvegardé', `Total: ${sum} (mois ${month})`, 'fas fa-chart-line');
          // Try to persist to server
          (async function(){
            const businessId = localStorage.getItem('businessId');
            const token = getToken();
            if(businessId && token){
              try{
                await updateBusinessOnServer(businessId, { totalSales: sum });
              }catch(e){ console.warn('Failed to persist total sales', e && e.message); }
            }
          })();

          alert('Total des ventes enregistré');
        });

        // Products sold
        function loadProducts(){
          try{ return JSON.parse(localStorage.getItem(getBizKey() + '_products')) || []; }catch(e){ return []; }
        }
        function saveProducts(arr){ localStorage.setItem(getBizKey() + '_products', JSON.stringify(arr)); }
        function renderProducts(){
          const tbody = document.querySelector('.table-enrolled-courses tbody.list');
          if(!tbody) return;
          const products = loadProducts();
          // clear existing rows
          tbody.innerHTML = '';
          products.forEach((p,i)=>{
            const html = `
              <tr class="btn-reveal-trigger fw-semi-bold">
                <td class="align-middle white-space-nowrap title" style="max-width: 23rem;">
                  <div class="d-flex gap-3 align-items-center position-relative"><img class="rounded-1 border border-200" src="assets/img/elearning/courses/course3.png" width="60" alt="" /><a class="stretched-link text-truncate" href="#">${p.name}</a></div>
                </td>
                <td class="align-middle text-nowrap trainer">-</td>
                <td class="align-middle date">${new Date(p.date).toLocaleDateString()}</td>
                <td class="align-middle time">${p.qty}</td>
                <td class="align-middle"><div class="progress rounded-3 worked" style="height: 5px; width:5rem"><div class="progress-bar bg-progress-gradient rounded-pill" role="progressbar" style="width: 100%"></div></div></td>
                <td class="align-middle text-end price">${p.price ? '$'+p.price.toFixed(2) : '-'}</td>
                <td class="align-middle text-end"></td>
              </tr>`;
            tbody.insertAdjacentHTML('beforeend', html);
          });
        }

        document.getElementById('addProductBtn')?.addEventListener('click', function(e){
          e.preventDefault();
          const name = document.getElementById('productNameInput')?.value?.trim();
          const qty = parseInt(document.getElementById('productQtyInput')?.value) || 1;
          const price = parseFloat(document.getElementById('productPriceInput')?.value) || 0;
          if(!name){ alert('Veuillez saisir le nom du produit'); return; }
          const products = loadProducts();
          const item = { name, qty, price, date: Date.now() };
          products.unshift(item);
          saveProducts(products);
          renderProducts();
          recordActivity('Produit vendu ajouté', `${name} x${qty} à ${price}`, 'fas fa-box-open');
          // clear inputs
          document.getElementById('productNameInput').value='';
          document.getElementById('productQtyInput').value=1;
          document.getElementById('productPriceInput').value='';
        });

        document.getElementById('saveProductsBtn')?.addEventListener('click', function(){
          const products = loadProducts();
          saveProducts(products);
          recordActivity('Produits sauvegardés', `Total produits: ${products.length}`, 'fas fa-save');
          // Try to persist products count to server
          (async function(){
            const businessId = localStorage.getItem('businessId');
            const token = getToken();
            if(businessId && token){
              try{
                await updateBusinessOnServer(businessId, { productsSoldCount: products.length });
              }catch(e){ console.warn('Failed to persist products count', e && e.message); }
            }
          })();

          alert('Produits enregistrés');
        });

        // Helper: update business fields on server via JSON PUT
        async function updateBusinessOnServer(businessId, payload){
          const token = getToken();
          if(!token) throw new Error('No auth token');
          const res = await fetch('/api/business/' + businessId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(payload)
          });
          if(!res.ok){
            const txt = await res.text();
            throw new Error('Update failed: ' + res.status + ' ' + txt);
          }
          return await res.json();
        }

        // Populate initial data on load
        document.addEventListener('DOMContentLoaded', async function(){
          console.log('✅ DOMContentLoaded event fired - attaching company.selected listener');
          
          // Écouter les changements d'entreprise sélectionnée depuis entreprise.js
          window.addEventListener('company.selected', async (ev) => {
            const businessId = ev?.detail?.businessId;
            if(!businessId) {
              console.warn('⚠️ company.selected event received but no businessId provided');
              return;
            }
            
            console.log('💼 Entreprise sélectionnée changée:', businessId);
            
            // UN SEUL appel API qui retourne TOUTES les données enrichies
            try{
              const token = getToken();
              if(!token) throw new Error('No token');
              
              const res = await fetch('https://backend-gestion-de-stock.onrender.com/api/business/' + businessId, { 
                headers: { 'Authorization': 'Bearer ' + token } 
              });
              
              if(!res.ok) throw new Error('Failed to fetch business data: ' + res.status);
              
              const biz = await res.json();
              console.log('📊 Données COMPLÈTES entreprise chargées:', biz);
              
              // ===== 1. REMPLIR LES INFORMATIONS GÉNÉRALES =====
              if(biz.nomEntreprise) { const el = document.getElementById('companyName'); if(el) el.textContent = biz.nomEntreprise; }
              if(biz.description) { const el = document.getElementById('companyInfo'); if(el) el.textContent = biz.description; }
              if(biz.budget !== undefined) { const el = document.getElementById('companyBudget'); if(el) el.textContent = '$' + biz.budget.toLocaleString(); }
              if(biz.devise) { const el = document.getElementById('companyDevise'); if(el) el.textContent = biz.devise; }
              if(biz.email) { const el = document.getElementById('companyEmail'); if(el) el.textContent = biz.email; }
              if(biz.telephone) { const el = document.getElementById('companyTelephone'); if(el) el.textContent = biz.telephone; }
              if(biz.adresse) { const el = document.getElementById('companyAddress'); if(el) el.textContent = biz.adresse; }
              if(biz.rccm) { const el = document.getElementById('companyRCCM'); if(el) el.textContent = biz.rccm; }
              if(biz.idNat) { const el = document.getElementById('companyIDNat'); if(el) el.textContent = biz.idNat; }
              if(biz.siteWeb) { const el = document.getElementById('companySiteWeb'); if(el) el.textContent = biz.siteWeb; }
              if(biz.formeJuridique) { const el = document.getElementById('companyFormeJuridique'); if(el) el.textContent = biz.formeJuridique; }
              if(biz.capitalSocial !== undefined) { const el = document.getElementById('companyCapitalSocial'); if(el) el.textContent = '$' + biz.capitalSocial.toLocaleString(); }
              if(biz.siegeSocial) { const el = document.getElementById('companySiegeSocial'); if(el) el.textContent = biz.siegeSocial; }
              if(biz.createdAt) { const el = document.getElementById('companyCreatedAt'); if(el) el.textContent = new Date(biz.createdAt).toLocaleString(); }
              if(biz.updatedAt) { const el = document.getElementById('companyUpdatedAt'); if(el) el.textContent = new Date(biz.updatedAt).toLocaleString(); }
              if(biz.updatedAt) { const el = document.getElementById('companyUpdatedAtDetail'); if(el) el.textContent = new Date(biz.updatedAt).toLocaleString(); }
              if(biz.logoUrl) { const el = document.getElementById('companyLogo'); if(el) el.src = biz.logoUrl; }
              
              // ===== 2. METTRE À JOUR LES KPIs (depuis biz.kpis) =====
              if(biz.kpis){
                console.log('📈 KPIs chargés:', biz.kpis);
                const { kpiOrders, kpiItemsSold, kpiRefunds, kpiGrossSale, kpiShipping, kpiProcessing } = {
                  kpiOrders: document.getElementById('kpiOrders'),
                  kpiItemsSold: document.getElementById('kpiItemsSold'),
                  kpiRefunds: document.getElementById('kpiRefunds'),
                  kpiGrossSale: document.getElementById('kpiGrossSale'),
                  kpiShipping: document.getElementById('kpiShipping'),
                  kpiProcessing: document.getElementById('kpiProcessing')
                };
                
                if(kpiOrders) kpiOrders.textContent = (biz.kpis.totalOrders || 0).toLocaleString();
                if(kpiItemsSold) kpiItemsSold.textContent = (biz.kpis.itemsSold || 0).toLocaleString();
                if(kpiRefunds) kpiRefunds.textContent = '$' + (biz.kpis.refunds || 0).toFixed(2);
                if(kpiGrossSale) kpiGrossSale.textContent = '$' + (biz.kpis.grossSale || 0).toFixed(2);
                if(kpiShipping) kpiShipping.textContent = '$' + (biz.kpis.shipping || 0).toFixed(2);
                if(kpiProcessing) kpiProcessing.textContent = (biz.kpis.processing || 0).toLocaleString();
              }
              
              // ===== 3. CALCULER TOTAL SALES AUTOMATIQUEMENT =====
              if(biz.productsSold && Array.isArray(biz.productsSold)){
                const totalSalesAmount = biz.productsSold.reduce((sum, prod) => sum + (prod.montantVente || 0), 0);
                const totalQuantity = biz.productsSold.reduce((sum, prod) => sum + (prod.quantite || 0), 0);
                
                console.log('💰 Total Sales calculé:', totalSalesAmount, '| Total Quantité:', totalQuantity);
                
                // Auto-remplir le KPI Gross Sale
                const kpiGrossSaleEl = document.getElementById('kpiGrossSale');
                if(kpiGrossSaleEl && totalSalesAmount > 0){
                  kpiGrossSaleEl.textContent = '$' + totalSalesAmount.toFixed(2);
                }
                
                // Auto-remplir le graphique Total Sales s'il existe
                const totalSalesValue = document.querySelector('#totalSalesValue, [id*="totalSales"]');
                if(totalSalesValue){
                  totalSalesValue.textContent = '$' + totalSalesAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                }
                
                // Sauvegarder en localStorage pour persistance
                localStorage.setItem(getBizKey() + '_totalSales_current', JSON.stringify({
                  total: totalSalesAmount,
                  quantity: totalQuantity,
                  savedAt: Date.now(),
                  productsCount: biz.productsSold.length
                }));
              }
              
              // ===== 4. METTRE À JOUR GROSS REVENUE =====
              if(document.getElementById('grossRevenueValue')){
                const revenue = biz.financialStatus?.totalRevenue || biz.chiffre_affaires || 0;
                document.getElementById('grossRevenueValue').textContent = '$' + revenue.toLocaleString('en-US', {minimumFractionDigits: 2});
              }
              
              // ===== 4. CHARGER LES TRANSACTIONS (depuis biz.transactions) =====
              if(biz.transactions && Array.isArray(biz.transactions)){
                console.log('💰 Transactions chargées:', biz.transactions.length);
                const tbody = document.querySelector('#paymentHistoryTable tbody.list');
                if(tbody){
                  tbody.innerHTML = '';
                  if(biz.transactions.length === 0){
                    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">Aucune transaction</td></tr>';
                  } else {
                    biz.transactions.slice(0, 10).forEach((t, idx) => {
                      const statusBadge = t.statut === 'VALIDÉE' ? 'badge-success' : 'badge-warning';
                      const statusText = t.statut === 'VALIDÉE' ? 'Validée' : t.statut || 'En cours';
                      const html = `
                        <tr class="fw-semi-bold">
                          <td class="align-middle pe-5 py-3 course">
                            <a href="#">${t.productName || 'Produit'}</a>
                            <small class="text-muted d-block">${t.magasin || 'N/A'}</small>
                          </td>
                          <td class="align-middle white-space-nowrap pe-6 py-3 invoice">#${t._id.substring(0, 8).toUpperCase()}</td>
                          <td class="align-middle white-space-nowrap pe-6 py-3 date">${new Date(t.date).toLocaleDateString('fr-FR')}</td>
                          <td class="align-middle white-space-nowrap py-3 text-end amount">$${(t.amount || 0).toFixed(2)}</td>
                          <td class="align-middle text-end fw-medium font-sans-serif py-3 status">
                            <span class="badge ${statusBadge}">${statusText}</span>
                            <small class="text-muted d-block">${t.vendeur || 'N/A'}</small>
                          </td>
                        </tr>`;
                      tbody.insertAdjacentHTML('beforeend', html);
                    });
                  }
                }
              }
              
              // ===== 5. CHARGER LES PRODUITS VENDUS (depuis biz.productsSold) =====
              if(biz.productsSold && Array.isArray(biz.productsSold)){
                console.log('📦 Produits vendus chargés:', biz.productsSold.length);
                const tbody = document.querySelector('.table-enrolled-courses tbody.list');
                if(tbody){
                  tbody.innerHTML = '';
                  biz.productsSold.slice(0, 6).forEach((prod, idx) => {
                    const placeholderSvg = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22%3E%3Crect fill=%22%23e9ecef%22 width=%2260%22 height=%2260%22/%3E%3Ctext x=%2230%22 y=%2230%22 font-size=%2212%22 fill=%22%23999%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E';
                    const imgSrc = prod.photoUrl && prod.photoUrl.startsWith('http') ? prod.photoUrl : placeholderSvg;
                    const html = `
                      <tr class="btn-reveal-trigger fw-semi-bold">
                        <td class="align-middle white-space-nowrap title" style="max-width: 23rem;">
                          <div class="d-flex gap-3 align-items-center position-relative">
                            <img class="rounded-1 border border-200" src="${imgSrc}" width="60" height="60" alt="${prod.nom}" onerror="this.src='${placeholderSvg}'" />
                            <a class="stretched-link text-truncate" href="#">${prod.designation || prod.nom}</a>
                          </div>
                        </td>
                        <td class="align-middle text-nowrap trainer"><a class="text-800" href="#">${prod.vendeur}</a></td>
                        <td class="align-middle date">${new Date(prod.date).toLocaleDateString('fr-FR')}</td>
                        <td class="align-middle time">${prod.quantite}</td>
                        <td class="align-middle">
                          <div class="progress rounded-3 worked" style="height: 5px; width:5rem">
                            <div class="progress-bar bg-progress-gradient rounded-pill" role="progressbar" style="width: ${Math.min(100, (prod.quantiteActuelle / 100) * 100)}%"></div>
                          </div>
                          <small class="text-muted">${prod.etatStock} (${prod.quantiteActuelle} en stock)</small>
                        </td>
                        <td class="align-middle text-end price">$${(prod.montant || 0).toFixed(2)}</td>
                        <td class="align-middle text-end"></td>
                      </tr>`;
                    tbody.insertAdjacentHTML('beforeend', html);
                  });
                }
              }
              
              // ===== 6. CHARGER LES ACTIVITÉS RÉCENTES (depuis biz.activities) =====
              if(biz.activities && Array.isArray(biz.activities)){
                console.log('🔔 Activités chargées:', biz.activities.length);
                const allActivities = biz.activities.map(act => ({
                  ts: new Date(act.date).getTime(),
                  title: act.title,
                  description: act.description,
                  icon: act.icon || 'fas fa-info-circle'
                }));
                saveActivities(allActivities.slice(0, 50));
                renderActivities();
              }
              
              // ===== 7. AFFICHER LA SITUATION DE L'ENTREPRISE (businessStatus) =====
              if(biz.businessStatus){
                console.log('💼 Situation entreprise:', biz.businessStatus);
                
                // Afficher la santé budgétaire
                if(biz.financialStatus){
                  const budgetPercent = biz.financialStatus.budgetUsagePercent || 0;
                  const profitMargin = biz.financialStatus.profitMargin || 0;
                  console.log(`📊 Budget: ${budgetPercent}% utilisé | Profit Margin: ${profitMargin}%`);
                  
                  // On peut ajouter des badges visuels ici
                  const healthBadge = biz.businessStatus.budgetHealth === 'healthy' ? '✅ Sain' : '⚠️ Critique';
                  console.log(`💰 Santé financière: ${healthBadge}`);
                }
                
                // Afficher la structure organisationnelle
                if(biz.structure){
                  console.log(`🏢 Magasins: ${biz.structure.magasins.total} | Utilisateurs: ${biz.structure.utilisateurs.total}`);
                  console.log(`👨 Vendeurs: ${biz.structure.utilisateurs.vendeurs} | Gestionnaires: ${biz.structure.utilisateurs.gestionnaires}`);
                }
              }
              
              console.log('✅ Toutes les données chargées avec succès!');
              localStorage.setItem('businessId', businessId);
              
            } catch(e){ 
              console.error('❌ Erreur chargement données entreprise:', e.message); 
              alert('Erreur: ' + e.message);
            }
                
            // Charger les affectations, ventes, et mouvements de stock pour les activités récentes
            try{
              const allActivities = [];
              const magasinCache = {};
              
              // Helper function to fetch magasin name by ID
              async function getMagasinName(magasinId){
                try{
                  // Activities déjà formatées depuis le backend enrichi
                  if(biz.activities && Array.isArray(biz.activities)){
                    const formattedActivities = biz.activities.map(a => ({
                      ts: new Date(a.date).getTime(),
                      title: a.title || 'Activité',
                      description: a.description || '',
                      icon: a.icon || 'fas fa-circle',
                      magasin: a.magasin,
                      user: a.user,
                      type: a.type
                    }));
                    
                    saveActivities(formattedActivities.slice(0, 50));
                    renderActivities();
                    console.log('✅ Activités chargées depuis API enrichie:', formattedActivities.length);
                  }
                }catch(e){ console.warn('Erreur chargement activités:', e); }
              }
            
              // Sauvegarder l'ID de l'entreprise pour la persistance
              localStorage.setItem('businessId', businessId);
            }catch(e){ console.warn('Erreur chargement activités serveur:', e && e.message); }
          });

          renderActivities();
          renderProducts();

          // populate gross revenue if saved
          try{
            const businessId = localStorage.getItem('businessId');
            if(businessId){
              const gr = JSON.parse(localStorage.getItem(getBizKey() + '_grossRevenue'));
              if(gr && document.getElementById('grossRevenueValue')) document.getElementById('grossRevenueValue').textContent = '$' + (gr.amount||0).toFixed(2);
            }
          }catch(e){}
        });

      })();
    </script>

  </body>

</html> 