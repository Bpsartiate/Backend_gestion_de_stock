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
    <style>
    /* Overlay alert above the auth card (same style as register) */
    #overlay-alert-container{position:absolute;left:50%;top:8px;transform:translateX(-50%);z-index:1055;pointer-events:auto;width:92%;max-width:680px}
    #overlay-alert-container .alert{box-shadow:0 6px 18px rgba(23,24,26,.12);border-radius:.75rem}
    #overlay-alert-container .icon-item{width:46px;height:46px;border-radius:.6rem;display:flex;align-items:center;justify-content:center}
    .password-toggle-btn{border-top-left-radius:0;border-bottom-left-radius:0}
    .input-with-btn .form-control{border-top-right-radius:0;border-bottom-right-radius:0}
    </style>
  </head>
  <body>

    <!-- ===============================================-->
    <!--    Main Content-->
    <!-- ===============================================-->
    <main class="main" id="top">
      <div class="container-fluid">
        <div class="row min-vh-100 flex-center g-0">
          <div class="col-lg-8 col-xxl-5 py-3 position-relative"><img class="bg-auth-circle-shape" src="assets/img/icons/spot-illustrations/bg-shape.png" alt="" width="250"><img class="bg-auth-circle-shape-2" src="assets/img/icons/spot-illustrations/shape-1.png" alt="" width="150">
            <div class="card overflow-hidden z-index-1 position-relative">
              <div id="overlay-alert-container" class="d-none"></div>
              <div class="card-body p-0">
                <div class="row g-0 h-100">
                  <div class="col-md-5 text-center bg-card-gradient">
                    <div class="position-relative p-4 pt-md-5 pb-md-7 light">
                      <div class="bg-holder bg-auth-card-shape" style="background-image:url(assets/img/icons/spot-illustrations/half-circle.png);">
                      </div>
                      <!--/.bg-holder-->

                      <div class="z-index-1 position-relative"><a class="link-light mb-4 font-sans-serif fs-4 d-inline-block fw-bolder" href="index.html">falcon</a>
                        <p class="opacity-75 text-white">With the power of Falcon, you can now focus only on functionaries for your digital products, while leaving the UI design on us!</p>
                      </div>
                    </div>
                    <div class="mt-3 mb-4 mt-md-4 mb-md-5 light">
                      <p class="text-white">Don't have an account?<br><a class="text-decoration-underline link-light" href="register.php">Get started!</a></p>
                      <p class="mb-0 mt-4 mt-md-5 fs--1 fw-semi-bold text-white opacity-75">Read our <a class="text-decoration-underline text-white" href="#!">terms</a> and <a class="text-decoration-underline text-white" href="#!">conditions </a></p>
                    </div>
                  </div>
                  <div class="col-md-7 d-flex flex-center">
                    <div class="p-4 p-md-5 flex-grow-1">
                      <div class="row flex-between-center">
                        <div class="col-auto">
                          <h3>Account Login</h3>
                        </div>
                      </div>
                  <form id="login-form">
                    <div class="mb-3">
                      <label class="form-label" for="login-email">Email address</label>
                      <input class="form-control" id="login-email" type="email" required />
                    </div>
                    <div class="mb-3 position-relative">
                      <div class="d-flex justify-content-between">
                        <label class="form-label" for="login-password">Password</label>
                      </div>
                      <div class="input-group input-with-btn">
                        <input class="form-control" id="login-password" type="password" required />
                        <button class="btn btn-outline-secondary password-toggle-btn" type="button" id="toggle-login-password" title="Afficher / masquer le mot de passe">
                          <span class="fas fa-eye" id="toggle-login-password-icon"></span>
                        </button>
                      </div>
                    </div>
                    <div class="row flex-between-center">
                      <div class="col-auto">
                        <div class="form-check mb-0">
                          <input class="form-check-input" type="checkbox" id="login-checkbox" checked="checked" />
                          <label class="form-check-label mb-0" for="login-checkbox">Remember me</label>
                        </div>
                      </div>
                      <div class="col-auto">
                        <a class="fs--1" href="forgot-password.html">Forgot Password?</a>
                      </div>
                    </div>
                    <div class="mb-3">
                      <!-- Using hosted API only (no local toggle) -->
                      <button class="btn btn-primary w-100 mt-3" type="submit" id="login-btn">Log in</button>
                    </div>
                  </form>
                                  <!-- <div class="position-relative mt-4">
                        <hr />
                        <div class="divider-content-center">or log in with</div>
                      </div>
                      <div class="row g-2 mt-2">
                        <div class="col-sm-6"><a class="btn btn-outline-google-plus btn-sm d-block w-100" href="#"><span class="fab fa-google-plus-g me-2" data-fa-transform="grow-8"></span> google</a></div>
                        <div class="col-sm-6"><a class="btn btn-outline-facebook btn-sm d-block w-100" href="#"><span class="fab fa-facebook-square me-2" data-fa-transform="grow-8"></span> facebook</a></div>
                      </div> -->
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <!-- ===============================================-->
    <!--    End of Main Content-->
    <!-- ===============================================-->
    <!-- ===============================================-->
    <!--    JavaScripts-->
    <!-- ===============================================-->
    <script src="vendors/popper/popper.min.js"></script>
    <script src="vendors/bootstrap/bootstrap.min.js"></script>
    <script src="vendors/anchorjs/anchor.min.js"></script>
    <script src="vendors/is/is.min.js"></script>
    <script src="vendors/fontawesome/all.min.js"></script>
    <script src="vendors/lodash/lodash.min.js"></script>
    <script src="https://polyfill.io/v3/polyfill.min.js?features=window.scroll"></script>
    <script src="vendors/list.js/list.min.js"></script>
    <script src="assets/js/theme.js"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="assets/js/auth.js"></script>


  
    
    <script>
      $(document).ready(function() {
        // Toggle password visibility (œil)
        $('#toggle-login-password').on('click', function() {
          let input = $('#login-password');
          let icon = $('#toggle-login-password-icon');
          if (input.attr('type') === 'password') {
            input.attr('type', 'text');
            icon.removeClass('fa-eye').addClass('fa-eye-slash');
          } else {
            input.attr('type', 'password');
            icon.removeClass('fa-eye-slash').addClass('fa-eye');
          }
        });

        // Overlay alert helper (reused from register)
        function showOverlayAlert(type, content, autoHide = true, timeout = 4000) {
          const tpl = `
            <div class="alert alert-${type} border-2 d-flex align-items-center" role="alert">
              <div class="me-3 icon-item bg-${type}"><span class="fas ${type === 'success' ? 'fa-check-circle' : (type === 'warning' ? 'fa-exclamation-triangle' : 'fa-times-circle')} text-white fs-3"></span></div>
              <div class="flex-1">${content}</div>
              <button class="btn-close" type="button" aria-label="Close"></button>
            </div>`;
          const $container = $('#overlay-alert-container');
          $container.html(tpl).removeClass('d-none').hide().fadeIn(200);
          $container.find('.btn-close').on('click', function() {
            $container.fadeOut(200, function() { $container.addClass('d-none').empty(); });
          });
          if (autoHide) {
            setTimeout(function() {
              $container.fadeOut(200, function() { $container.addClass('d-none').empty(); });
            }, timeout);
          }
        }

        $('#login-form').submit(function(e) {
          e.preventDefault();

          // Remplacer le texte par le spinner et désactiver le bouton
          $('#login-btn').html(
            '<div class="spinner-grow text-light" role="status"><span class="visually-hidden">Loading...</span></div>'
          );
          $('#login-btn').prop('disabled', true);

          $.ajax({
            url: 'https://backend-gestion-de-stock.onrender.com/api/auth/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              identifier: $('#login-email').val(),
              password: $('#login-password').val()
            }),
            success: function(response) {
              // Enregistrer token et infos utilisateur via le helper Auth
              try {
                // Prefer response.user (backend now returns user object)
                var userObj = (response && response.user) ? response.user : { nom: response && response.nom, role: response && response.role };
                if (window.Auth) {
                  if (response && response.token) Auth.setToken(response.token);
                  if (userObj) Auth.setUser(userObj);
                } else {
                  // fallback si Auth non disponible
                  if (response && response.token) localStorage.setItem('token', response.token);
                  if (userObj && userObj.nom) localStorage.setItem('nom', userObj.nom);
                  if (userObj && userObj.role) localStorage.setItem('role', userObj.role);
                  if (userObj) localStorage.setItem('user', JSON.stringify(userObj));
                }
              } catch (e) {
                console.warn('Could not save auth data', e);
              }

              showOverlayAlert('success', 'Connexion réussie !');
              $('#login-btn').html("Log in").prop('disabled', false);

              // Rediriger vers page protégée
              setTimeout(function() {
                window.location.href = 'setting.php';
              }, 1500);
            },
            error: function(xhr) {
              let msg = (xhr.responseJSON && xhr.responseJSON.message) ? xhr.responseJSON.message : 'Erreur de connexion.';
              showOverlayAlert('danger', msg);
              $('#login-btn').html("Log in").prop('disabled', false);
            }
          });
        });
      });

    </script>
  </body>

</html>