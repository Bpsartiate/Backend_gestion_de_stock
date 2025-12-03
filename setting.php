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
    <link href="vendors/flatpickr/flatpickr.min.css" rel="stylesheet">
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
    <!--    Main Content-->
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
             <?php include_once 'sidebar.php'; ?>
        <div class="content">
          <!-- User info bar (name, role, logout) -->
          <!-- <div id="userInfoBar" class="d-flex justify-content-end align-items-center mb-2">
            <div class="me-3 text-end">
              <div id="currentUserName" class="fw-bold"></div>
              <div id="currentUserRole" class="text-muted small"></div>
            </div>
            <button id="logoutBtn" class="btn btn-outline-secondary btn-sm">Logout</button>
          </div> -->
          <?php include_once 'topbar.php'; ?>
              <!-- nav -->
            <!-- <?php include_once "includes/content_nav.php" ?> -->
            <div class="row">
              <div class="col-12">
                <div class="card mb-3 btn-reveal-trigger">
                  <div class="card-header position-relative min-vh-25 mb-8">
                    <div class="cover-image">
                      <div class="bg-holder rounded-3 rounded-bottom-0" style="background-image:url(assets/img/generic/4.jpg);">
                      </div>
                      <!--/.bg-holder-->

                      <input class="d-none" id="upload-cover-image" type="file" />
                      <label class="cover-image-file-input" for="upload-cover-image"><span class="fas fa-camera me-2"></span><span>Change cover photo</span></label>
                    </div>
                    <div class="avatar avatar-5xl avatar-profile shadow-sm img-thumbnail rounded-circle">
                      <div class="h-100 w-100 rounded-circle overflow-hidden position-relative"> <img id="topProfileImage" src="assets/img/team/user_prof.svg" width="200" alt="" data-dz-thumbnail="data-dz-thumbnail" />
                        <input class="d-none" id="profile-image" type="file" accept="image/*" />
                        <label class="mb-0 overlay-icon d-flex flex-center" for="profile-image"><span class="bg-holder overlay overlay-0"></span><span class="z-index-1 text-white dark__text-white text-center fs--1"><span class="fas fa-camera"></span><span class="d-block">Update</span></span></label>
                      </div>
                      <div class="text-center mt-2">
                        <button type="button" id="profileImageSaveBtn" class="btn btn-primary btn-sm" disabled>Mettre à jour la photo</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          <div class="row">
            <div class="col-md-8">
              <!-- Profil utilisateur -->
                <div class="card mb-4 shadow-sm">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Paramètres du profil</h5>
                    <button class="btn btn-secondary btn-sm" data-bs-toggle="collapse" data-bs-target="#profileCollapse">
                      <i class="fas fa-chevron-down"></i>
                    </button>
                  </div>
                  <div class="collapse show" id="profileCollapse">
                    <div class="card-body px-3 py-2">
                      <form id="profileForm" class="row g-3">
                        <div class="col-md-6">
                          <label class="form-label">Prénom</label>
                          <input type="text" class="form-control" id="prenom" placeholder="Prénom"/>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label">Nom</label>
                          <input type="text" class="form-control" id="nom" placeholder="Nom"/>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label">Email</label>
                          <input type="email" class="form-control" id="email" placeholder="exemple@mail.com"/>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label">Téléphone</label>
                          <input type="tel" class="form-control" id="telephone" placeholder="+243 123 456 789"/>
                        </div>
                        <div class="col-12 d-flex justify-content-end">
                          <button type="button" id="profileSaveBtn" class="btn btn-primary">Mettre à jour</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                <!-- Paramètres du compte -->
                <div class="card mb-4 shadow-sm">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Paramètres du compte</h5>
                    <button class="btn btn-secondary btn-sm" data-bs-toggle="collapse" data-bs-target="#accountSettings">
                      <i class="fas fa-chevron-down"></i>
                    </button>
                  </div>
                  <div class="collapse show" id="accountSettings">
                      <div class="card-body bg-light">
                      <div class="form-check form-switch mb-2">
                        <input class="form-check-input" type="checkbox" id="permPassword"/>
                        <label class="form-check-label" for="permPassword">Peut modifier mot de passe</label>
                      </div>
                      <div class="form-check form-switch mb-2">
                        <input class="form-check-input" type="checkbox" id="permPhoto"/>
                        <label class="form-check-label" for="permPhoto">Peut modifier photo</label>
                      </div>
                      <!-- autres permissions -->
                      <div class="form-check form-switch mb-2">
                        <input class="form-check-input" type="checkbox" id="permCanAssignVendors" />
                        <label class="form-check-label" for="permCanAssignVendors">Peut assigner des vendeurs</label>
                      </div>
                      <div class="form-check form-switch mb-2">
                        <input class="form-check-input" type="checkbox" id="permCanAssignManagers" />
                        <label class="form-check-label" for="permCanAssignManagers">Peut assigner des gestionnaires</label>
                      </div>
                      <div class="form-check form-switch mb-2">
                        <input class="form-check-input" type="checkbox" id="permCanCreateGuichet" />
                        <label class="form-check-label" for="permCanCreateGuichet">Peut créer des guichets</label>
                      </div>
                      <div class="form-check form-switch mb-2">
                        <input class="form-check-input" type="checkbox" id="permCanDeleteMembers" />
                        <label class="form-check-label" for="permCanDeleteMembers">Peut supprimer des membres</label>
                      </div>
                      <div class="form-check form-switch mb-2">
                        <input class="form-check-input" type="checkbox" id="permCanEditProfileFields" />
                        <label class="form-check-label" for="permCanEditProfileFields">Peut modifier tous les champs du profil</label>
                      </div>
                         <div class="col-12 d-flex justify-content-end">
                          <button type="button" id="accountSettingsSave" class="btn btn-primary">Mettre à jour</button>
                        </div>
                    </div>
                  </div>
                </div>

                <!-- Liste membres -->
                <div class="card mb-4 shadow-sm">
                  <div class="card-header d-flex justify-content-between align-items-center bg-light">
                    <h5 class="mb-0">Membres <span id="memberCount" class="badge bg-primary">0</span></h5>
                    <button id="addMemberBtn" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addMemberModal">
                      <i class="fas fa-plus"></i> Ajouter un membre
                    </button>
                  </div>
                    <div class="card-body bg-light px-1 py-0">
                      <!-- member list will be loaded dynamically -->
                      <div id="memberList" class="p-2">Chargement...</div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
              <div id="changePasswordCard" class="card mb-3">
                    <div class="card-header">
                      <h5 class="mb-0">Change Password</h5>
                    </div>
                    <div class="card-body bg-light">
                      <form id="changePasswordForm">
                        <div class="mb-3">
                          <label class="form-label" for="old-password">Old Password</label>
                          <div class="input-group">
                            <input class="form-control" id="old-password" type="password" />
                            <button class="btn btn-outline-secondary toggle-password" type="button" data-target="old-password"><i class="fas fa-eye"></i></button>
                          </div>
                        </div>
                        <div class="mb-3">
                          <label class="form-label" for="new-password">New Password</label>
                          <div class="input-group">
                            <input class="form-control" id="new-password" type="password" />
                            <button class="btn btn-outline-secondary toggle-password" type="button" data-target="new-password"><i class="fas fa-eye"></i></button>
                          </div>
                        </div>
                        <div class="mb-3">
                          <label class="form-label" for="confirm-password">Confirm Password</label>
                          <div class="input-group">
                            <input class="form-control" id="confirm-password" type="password" />
                            <button class="btn btn-outline-secondary toggle-password" type="button" data-target="confirm-password"><i class="fas fa-eye"></i></button>
                          </div>
                        </div>
                        <button class="btn btn-primary d-block w-100" type="button" id="changePasswordSaveBtn">Update Password </button>
                      </form>
                    </div>
                </div>
                  <div id="dangerZoneCard" class="card">
                    <div class="card-header">
                      <h5 class="mb-0">Danger Zone</h5>
                    </div>
                    <div class="card-body bg-light">
                      <!-- <h5 class="fs-0">Transfer Ownership</h5>
                      <p class="fs--1">Transfer this account to another user or to an organization where you have the ability to create repositories.</p><a class="btn btn-falcon-warning d-block" href="#!">Transfer</a>
                      <div class="border-bottom border-dashed my-4"></div> -->
                      <h5 class="fs-0">Delete this account</h5>
                      <p class="fs--1">Once you delete a account, there is no going back. Please be certain.</p>
                      <button type="button" id="deactivateAccountBtn" class="btn btn-falcon-danger d-block">Désactiver le compte</button>
                    </div>
                  </div>
            </div>
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

        <!-- Modal ajout membre -->
        <div class="modal fade" id="addMemberModal" tabindex="-1" aria-labelledby="addMemberLabel" aria-hidden="true">
          <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header text-white">
                <h5 class="modal-title" id="addMemberLabel"><i class="fas fa-user-plus"></i> Ajouter un membre</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
              </div>
              <div class="modal-body">
                <form id="addMemberForm" class="row g-3" enctype="multipart/form-data">
                
                  <div class="col-md-12">
                    <div class="row">
                      <div class="col md-4">
                        <!-- photo -->
                        <div class="col-md-12 text-center">
                          <label class="form-label d-block">Photo (optionnelle)</label>
                          <div id="addMemberPhotoBlock">
                            <div style="position:relative;display:inline-block;">
                              <img id="memberPhotoPreview" src="assets/img/team/user_prof.svg" class="rounded-circle mb-2" style="width:120px;height:120px;object-fit:cover;border:1px solid rgba(0,0,0,0.08);" alt="Photo Membre" />
                              <button type="button" id="member-photo-overlay" class="btn btn-sm btn-secondary" style="position:absolute;right:0;bottom:0;border-radius:50%;padding:6px 8px;"><i class="fas fa-camera"></i></button>
                            </div>
                            <input id="memberPhoto" name="photo" type="file" accept="image/*" style="display:none" />
                          </div>
                        </div>
                      </div>
                      <div class="col-md-8">
                          <!-- prenom -->
                        <div class="col-md-12">
                          <label class="form-label">Prénom</label>
                          <input type="text" class="form-control" id="memberPrenom" required/>
                        </div>
                        <!-- nom -->
                        <div class="col-md-12">
                          <label class="form-label">Nom</label>
                          <input type="text" class="form-control" id="memberNom" required/>
                        </div>
                         <!-- Email -->
                        <div class="col-md-12">
                          <label class="form-label">Email</label>
                          <input type="email" class="form-control" id="memberEmail" required/>
                        </div>

                      </div>
                    </div>
                  </div>
                  <!-- role -->
                  <div class="col-md-6">
                    <label class="form-label">Rôle</label>
                    <select class="form-select" id="memberRole" required>
                      <option value="">Sélectionnez rôle</option>
                      <option value="admin">Admin</option>
                      <option value="superviseur">Superviseur</option>
                      <option value="vendeur">Vendeur</option>
                    </select>
                  </div>
                  <!-- tel -->
                  <div class="col-md-6">
                    <label class="form-label">Téléphone</label>
                    <input type="tel" class="form-control" id="memberTelephone" placeholder="+243 123 456 789" />
                  </div>
                  
                  <!-- mot de passe -->
                  <div class="col-md-6">
                    <label class="form-label">Mot de passe</label>
                    <div class="input-group">
                      <input type="password" class="form-control" id="memberPassword" required />
                      <button class="btn btn-outline-secondary toggle-password" type="button" data-target="memberPassword"><i class="fas fa-eye"></i></button>
                    </div>
                  </div>
                  <!-- confirm -->
                  <div class="col-md-6">
                    <label class="form-label">Confirmer mot de passe</label>
                    <div class="input-group">
                      <input type="password" class="form-control" id="memberPasswordConfirm" required />
                      <button class="btn btn-outline-secondary toggle-password" type="button" data-target="memberPasswordConfirm"><i class="fas fa-eye"></i></button>
                    </div>
                  </div>
                  
                  <div class="col-12 d-flex justify-content-end">
                    <button class="btn btn-primary" type="submit"><i class="fas fa-plus"></i> Ajouter</button>
                    <button class="btn btn-secondary ms-2" data-bs-dismiss="modal"><i class="fas fa-times"></i> Annuler</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      
                
        </div>
        
                  
      </div>
    </main>
   

    <!-- ===============================================-->
    <!--    JavaScripts-->
    <!-- ===============================================-->
    <script src="vendors/popper/popper.min.js"></script>
    <script src="vendors/bootstrap/bootstrap.min.js"></script>
    <script src="vendors/anchorjs/anchor.min.js"></script>
    <script src="vendors/is/is.min.js"></script>
    <script src="assets/js/flatpickr.js"></script>
    <script src="vendors/fontawesome/all.min.js"></script>
    <script src="vendors/lodash/lodash.min.js"></script>
    <!-- <script src="https://polyfill.io/v3/polyfill.min.js?features=window.scroll"></script> -->
    <script src="vendors/list.js/list.min.js"></script>
    <script src="assets/js/theme.js"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <div id="toastContainer" class="position-fixed top-0 end-0 m-3" style="z-index:1055"></div>

    <!-- Member modal (view/edit) -->
    <div class="modal fade" id="memberModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Profil membre</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
          </div>
          <div class="modal-body p-0" id="memberModalBody">
            <!-- Le contenu dynamique du profil sera injecté ici par JS -->
            <!-- Structure attendue :
              <div class='text-center pt-4 pb-2'>
                <div class='avatar ...'></div>
              </div>
              <form id='editMemberForm'>
                ...champs infos, mot de passe, permissions, assignations...
                <div class='d-flex justify-content-end mt-4'>
                  <button class='btn btn-primary' type='submit'>Enregistrer</button>
                  <button class='btn btn-secondary ms-2' type='button' data-bs-dismiss='modal'>Fermer</button>
                </div>
              </form>
            -->
          </div>
        </div>
      </div>
    </div>

    <script src="assets/js/auth-protection.js"></script>
    <script src="assets/js/settings.js"></script>

  </body>

</html>