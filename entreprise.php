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
        <!-- sidebare -->
        <?php include_once 'sidebar.php'; ?>

        <div class="content">
          <nav class="navbar navbar-light navbar-glass navbar-top navbar-expand">

            <button class="btn navbar-toggler-humburger-icon navbar-toggler me-1 me-sm-3" type="button" data-bs-toggle="collapse" data-bs-target="#navbarVerticalCollapse" aria-controls="navbarVerticalCollapse" aria-expanded="false" aria-label="Toggle Navigation"><span class="navbar-toggle-icon"><span class="toggle-line"></span></span></button>
            <a class="navbar-brand me-1 me-sm-3" href="index.html">
              <div class="d-flex align-items-center"><img class="me-2" src="assets/img/icons/spot-illustrations/falcon.png" alt="" width="40" /><span class="font-sans-serif">falcon</span>
              </div>
            </a>
            <ul class="navbar-nav align-items-center d-none d-lg-block">
              <li class="nav-item">
                <div class="search-box" data-list='{"valueNames":["title"]}'>
                  <form class="position-relative" data-bs-toggle="search" data-bs-display="static">
                    <input class="form-control search-input fuzzy-search" type="search" placeholder="Search..." aria-label="Search" />
                    <span class="fas fa-search search-box-icon"></span>

                  </form>
                  <div class="btn-close-falcon-container position-absolute end-0 top-50 translate-middle shadow-none" data-bs-dismiss="search">
                    <button class="btn btn-link btn-close-falcon p-0" aria-label="Close"></button>
                  </div>
                  <div class="dropdown-menu border font-base start-0 mt-2 py-0 overflow-hidden w-100">
                    <div class="scrollbar list py-3" style="max-height: 24rem;">
                      <h6 class="dropdown-header fw-medium text-uppercase px-x1 fs--2 pt-0 pb-2">Recently Browsed</h6><a class="dropdown-item fs--1 px-x1 py-1 hover-primary" href="app/events/event-detail.html">
                        <div class="d-flex align-items-center">
                          <span class="fas fa-circle me-2 text-300 fs--2"></span>

                          <div class="fw-normal title">Pages <span class="fas fa-chevron-right mx-1 text-500 fs--2" data-fa-transform="shrink-2"></span> Events</div>
                        </div>
                      </a>
                      <a class="dropdown-item fs--1 px-x1 py-1 hover-primary" href="app/e-commerce/customers.html">
                        <div class="d-flex align-items-center">
                          <span class="fas fa-circle me-2 text-300 fs--2"></span>

                          <div class="fw-normal title">E-commerce <span class="fas fa-chevron-right mx-1 text-500 fs--2" data-fa-transform="shrink-2"></span> Customers</div>
                        </div>
                      </a>

                      <hr class="text-200 dark__text-900" />
                      <h6 class="dropdown-header fw-medium text-uppercase px-x1 fs--2 pt-0 pb-2">Suggested Filter</h6><a class="dropdown-item px-x1 py-1 fs-0" href="app/e-commerce/customers.html">
                        <div class="d-flex align-items-center"><span class="badge fw-medium text-decoration-none me-2 badge-soft-warning">customers:</span>
                          <div class="flex-1 fs--1 title">All customers list</div>
                        </div>
                      </a>
                      <a class="dropdown-item px-x1 py-1 fs-0" href="app/events/event-detail.html">
                        <div class="d-flex align-items-center"><span class="badge fw-medium text-decoration-none me-2 badge-soft-success">events:</span>
                          <div class="flex-1 fs--1 title">Latest events in current month</div>
                        </div>
                      </a>
                      <a class="dropdown-item px-x1 py-1 fs-0" href="app/e-commerce/product/product-grid.html">
                        <div class="d-flex align-items-center"><span class="badge fw-medium text-decoration-none me-2 badge-soft-info">products:</span>
                          <div class="flex-1 fs--1 title">Most popular products</div>
                        </div>
                      </a>

                      <hr class="text-200 dark__text-900" />
                      <h6 class="dropdown-header fw-medium text-uppercase px-x1 fs--2 pt-0 pb-2">Files</h6><a class="dropdown-item px-x1 py-2" href="#!">
                        <div class="d-flex align-items-center">
                          <div class="file-thumbnail me-2"><img class="border h-100 w-100 fit-cover rounded-3" src="assets/img/products/3-thumb.png" alt="" /></div>
                          <div class="flex-1">
                            <h6 class="mb-0 title">iPhone</h6>
                            <p class="fs--2 mb-0 d-flex"><span class="fw-semi-bold">Antony</span><span class="fw-medium text-600 ms-2">27 Sep at 10:30 AM</span></p>
                          </div>
                        </div>
                      </a>
                      <a class="dropdown-item px-x1 py-2" href="#!">
                        <div class="d-flex align-items-center">
                          <div class="file-thumbnail me-2"><img class="img-fluid" src="assets/img/icons/zip.png" alt="" /></div>
                          <div class="flex-1">
                            <h6 class="mb-0 title">Falcon v1.8.2</h6>
                            <p class="fs--2 mb-0 d-flex"><span class="fw-semi-bold">John</span><span class="fw-medium text-600 ms-2">30 Sep at 12:30 PM</span></p>
                          </div>
                        </div>
                      </a>

                      <hr class="text-200 dark__text-900" />
                      <h6 class="dropdown-header fw-medium text-uppercase px-x1 fs--2 pt-0 pb-2">Members</h6><a class="dropdown-item px-x1 py-2" href="pages/user/profile.html">
                        <div class="d-flex align-items-center">
                          <div class="avatar avatar-l status-online me-2">
                            <img class="rounded-circle" src="assets/img/team/1.jpg" alt="" />

                          </div>
                          <div class="flex-1">
                            <h6 class="mb-0 title">Anna Karinina</h6>
                            <p class="fs--2 mb-0 d-flex">Technext Limited</p>
                          </div>
                        </div>
                      </a>
                      <a class="dropdown-item px-x1 py-2" href="pages/user/profile.html">
                        <div class="d-flex align-items-center">
                          <div class="avatar avatar-l me-2">
                            <img class="rounded-circle" src="assets/img/team/2.jpg" alt="" />

                          </div>
                          <div class="flex-1">
                            <h6 class="mb-0 title">Antony Hopkins</h6>
                            <p class="fs--2 mb-0 d-flex">Brain Trust</p>
                          </div>
                        </div>
                      </a>
                      <a class="dropdown-item px-x1 py-2" href="pages/user/profile.html">
                        <div class="d-flex align-items-center">
                          <div class="avatar avatar-l me-2">
                            <img class="rounded-circle" src="assets/img/team/3.jpg" alt="" />

                          </div>
                          <div class="flex-1">
                            <h6 class="mb-0 title">Emma Watson</h6>
                            <p class="fs--2 mb-0 d-flex">Google</p>
                          </div>
                        </div>
                      </a>

                    </div>
                    <div class="text-center mt-n3">
                      <p class="fallback fw-bold fs-1 d-none">No Result Found.</p>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
            <ul class="navbar-nav navbar-nav-icons ms-auto flex-row align-items-center">
              <li class="nav-item">
                <div class="theme-control-toggle fa-icon-wait px-2">
                  <input class="form-check-input ms-0 theme-control-toggle-input" id="themeControlToggle" type="checkbox" data-theme-control="theme" value="dark" />
                  <label class="mb-0 theme-control-toggle-label theme-control-toggle-light" for="themeControlToggle" data-bs-toggle="tooltip" data-bs-placement="left" title="Switch to light theme"><span class="fas fa-sun fs-0"></span></label>
                  <label class="mb-0 theme-control-toggle-label theme-control-toggle-dark" for="themeControlToggle" data-bs-toggle="tooltip" data-bs-placement="left" title="Switch to dark theme"><span class="fas fa-moon fs-0"></span></label>
                </div>
              </li>
              <li class="nav-item d-none d-sm-block">
                <a class="nav-link px-0 notification-indicator notification-indicator-warning notification-indicator-fill fa-icon-wait" href="app/e-commerce/shopping-cart.html"><span class="fas fa-shopping-cart" data-fa-transform="shrink-7" style="font-size: 33px;"></span><span class="notification-indicator-number">1</span></a>

              </li>
              <li class="nav-item dropdown">
                <a class="nav-link notification-indicator notification-indicator-primary px-0 fa-icon-wait" id="navbarDropdownNotification" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-hide-on-body-scroll="data-hide-on-body-scroll"><span class="fas fa-bell" data-fa-transform="shrink-6" style="font-size: 33px;"></span></a>
                <div class="dropdown-menu dropdown-caret dropdown-caret dropdown-menu-end dropdown-menu-card dropdown-menu-notification dropdown-caret-bg" aria-labelledby="navbarDropdownNotification">
                  <div class="card card-notification shadow-none">
                    <div class="card-header">
                      <div class="row justify-content-between align-items-center">
                        <div class="col-auto">
                          <h6 class="card-header-title mb-0">Notifications</h6>
                        </div>
                        <div class="col-auto ps-0 ps-sm-3"><a class="card-link fw-normal" href="#">Mark all as read</a></div>
                      </div>
                    </div>
                    <div class="scrollbar-overlay" style="max-height:19rem">
                      <div class="list-group list-group-flush fw-normal fs--1">
                        <div class="list-group-title border-bottom">NEW</div>
                        <div class="list-group-item">
                          <a class="notification notification-flush notification-unread" href="#!">
                            <div class="notification-avatar">
                              <div class="avatar avatar-2xl me-3">
                                <img class="rounded-circle" src="assets/img/team/1-thumb.png" alt="" />

                              </div>
                            </div>
                            <div class="notification-body">
                              <p class="mb-1"><strong>Emma Watson</strong> replied to your comment : "Hello world 😍"</p>
                              <span class="notification-time"><span class="me-2" role="img" aria-label="Emoji">💬</span>Just now</span>

                            </div>
                          </a>

                        </div>
                        <div class="list-group-item">
                          <a class="notification notification-flush notification-unread" href="#!">
                            <div class="notification-avatar">
                              <div class="avatar avatar-2xl me-3">
                                <div class="avatar-name rounded-circle"><span>AB</span></div>
                              </div>
                            </div>
                            <div class="notification-body">
                              <p class="mb-1"><strong>Albert Brooks</strong> reacted to <strong>Mia Khalifa's</strong> status</p>
                              <span class="notification-time"><span class="me-2 fab fa-gratipay text-danger"></span>9hr</span>

                            </div>
                          </a>

                        </div>
                        <div class="list-group-title border-bottom">EARLIER</div>
                        <div class="list-group-item">
                          <a class="notification notification-flush" href="#!">
                            <div class="notification-avatar">
                              <div class="avatar avatar-2xl me-3">
                                <img class="rounded-circle" src="assets/img/icons/weather-sm.jpg" alt="" />

                              </div>
                            </div>
                            <div class="notification-body">
                              <p class="mb-1">The forecast today shows a low of 20&#8451; in California. See today's weather.</p>
                              <span class="notification-time"><span class="me-2" role="img" aria-label="Emoji">🌤️</span>1d</span>

                            </div>
                          </a>

                        </div>
                        <div class="list-group-item">
                          <a class="border-bottom-0 notification-unread  notification notification-flush" href="#!">
                            <div class="notification-avatar">
                              <div class="avatar avatar-xl me-3">
                                <img class="rounded-circle" src="assets/img/logos/oxford.png" alt="" />

                              </div>
                            </div>
                            <div class="notification-body">
                              <p class="mb-1"><strong>University of Oxford</strong> created an event : "Causal Inference Hilary 2019"</p>
                              <span class="notification-time"><span class="me-2" role="img" aria-label="Emoji">✌️</span>1w</span>

                            </div>
                          </a>

                        </div>
                        <div class="list-group-item">
                          <a class="border-bottom-0 notification notification-flush" href="#!">
                            <div class="notification-avatar">
                              <div class="avatar avatar-xl me-3">
                                <img class="rounded-circle" src="assets/img/team/10.jpg" alt="" />

                              </div>
                            </div>
                            <div class="notification-body">
                              <p class="mb-1"><strong>James Cameron</strong> invited to join the group: United Nations International Children's Fund</p>
                              <span class="notification-time"><span class="me-2" role="img" aria-label="Emoji">🙋‍</span>2d</span>

                            </div>
                          </a>

                        </div>
                      </div>
                    </div>
                    <div class="card-footer text-center border-top"><a class="card-link d-block" href="app/social/notifications.html">View all</a></div>
                  </div>
                </div>

              </li>
              <li class="nav-item dropdown px-1">
                <a class="nav-link fa-icon-wait nine-dots p-1" id="navbarDropdownMenu" role="button" data-hide-on-body-scroll="data-hide-on-body-scroll" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="43" viewBox="0 0 16 16" fill="none">
                    <circle cx="2" cy="2" r="2" fill="#6C6E71"></circle>
                    <circle cx="2" cy="8" r="2" fill="#6C6E71"></circle>
                    <circle cx="2" cy="14" r="2" fill="#6C6E71"></circle>
                    <circle cx="8" cy="8" r="2" fill="#6C6E71"></circle>
                    <circle cx="8" cy="14" r="2" fill="#6C6E71"></circle>
                    <circle cx="14" cy="8" r="2" fill="#6C6E71"></circle>
                    <circle cx="14" cy="14" r="2" fill="#6C6E71"></circle>
                    <circle cx="8" cy="2" r="2" fill="#6C6E71"></circle>
                    <circle cx="14" cy="2" r="2" fill="#6C6E71"></circle>
                  </svg></a>
                <div class="dropdown-menu dropdown-caret dropdown-caret dropdown-menu-end dropdown-menu-card dropdown-caret-bg" aria-labelledby="navbarDropdownMenu">
                  <div class="card shadow-none">
                    <div class="scrollbar-overlay nine-dots-dropdown">
                      <div class="card-body px-3">
                        <div class="row text-center gx-0 gy-0">
                          <div class="col-4"><a class="d-block hover-bg-200 px-2 py-3 rounded-3 text-center text-decoration-none" href="entreprise.php">
                              <div class="avatar avatar-2xl"> <div class="avatar-name rounded-circle bg-soft-primary text-primary"><span class="fs-2">E</span></div></div>
                              <p class="mb-0 fw-medium text-800 text-truncate fs--2">Entreprises</p>
                            </a></div>
                          <div class="col-4"><a class="d-block hover-bg-200 px-2 py-3 rounded-3 text-center text-decoration-none" href="affectations.php">
                              <div class="avatar avatar-2xl"> <div class="avatar-name rounded-circle bg-soft-success text-success"><span class="fs-2">A</span></div></div>
                              <p class="mb-0 fw-medium text-800 text-truncate fs--2">Affectations</p>
                            </a></div>
                          <div class="col-4"><a class="d-block hover-bg-200 px-2 py-3 rounded-3 text-center text-decoration-none" href="rapports.php">
                              <div class="avatar avatar-2xl"> <div class="avatar-name rounded-circle bg-soft-warning text-warning"><span class="fs-2">R</span></div></div>
                              <p class="mb-0 fw-medium text-800 text-truncate fs--2">Rapports</p>
                            </a></div>
                          <div class="col-4"><a class="d-block hover-bg-200 px-2 py-3 rounded-3 text-center text-decoration-none" href="utilisateurs.php">
                              <div class="avatar avatar-2xl"> <div class="avatar-name rounded-circle bg-soft-info text-info"><span class="fs-2">U</span></div></div>
                              <p class="mb-0 fw-medium text-800 text-truncate fs--2">Utilisateurs</p>
                            </a></div>
                          <div class="col-4"><a class="d-block hover-bg-200 px-2 py-3 rounded-3 text-center text-decoration-none" href="settings.php">
                              <div class="avatar avatar-2xl"> <div class="avatar-name rounded-circle bg-soft-dark text-dark"><span class="fs-2">S</span></div></div>
                              <p class="mb-0 fw-medium text-800 text-truncate fs--2">Paramètres</p>
                            </a></div>
                          <div class="col-4"><a class="d-block hover-bg-200 px-2 py-3 rounded-3 text-center text-decoration-none" href="#" id="openHelp">
                              <div class="avatar avatar-2xl"> <div class="avatar-name rounded-circle bg-soft-secondary text-secondary"><span class="fs-2">?</span></div></div>
                              <p class="mb-0 fw-medium text-800 text-truncate fs--2">Aide</p>
                            </a></div>
                          <div class="col-12">
                            <hr class="my-3 mx-n3 bg-200" />
                          </div>
                          <div class="col-4"><a class="d-block hover-bg-200 px-2 py-3 rounded-3 text-center text-decoration-none" href="#!" target="_blank"><img class="rounded" src="assets/img/nav-icons/linkedin.png" alt="" width="40" height="40" />
                              <p class="mb-0 fw-medium text-800 text-truncate fs--2 pt-1">Linkedin</p>
                            </a></div>
                          <div class="col-4"><a class="d-block hover-bg-200 px-2 py-3 rounded-3 text-center text-decoration-none" href="#!" target="_blank"><img class="rounded" src="assets/img/nav-icons/twitter.png" alt="" width="40" height="40" />
                              <p class="mb-0 fw-medium text-800 text-truncate fs--2 pt-1">Twitter</p>
                            </a></div>
                          <div class="col-4"><a class="d-block hover-bg-200 px-2 py-3 rounded-3 text-center text-decoration-none" href="#!" target="_blank"><img class="rounded" src="assets/img/nav-icons/facebook.png" alt="" width="40" height="40" />
                              <p class="mb-0 fw-medium text-800 text-truncate fs--2 pt-1">Facebook</p>
                            </a></div>
                          <div class="col-4"><a class="d-block hover-bg-200 px-2 py-3 rounded-3 text-center text-decoration-none" href="#!" target="_blank"><img class="rounded" src="assets/img/nav-icons/instagram.png" alt="" width="40" height="40" />
                              <p class="mb-0 fw-medium text-800 text-truncate fs--2 pt-1">Instagram</p>
                            </a></div>
                          <div class="col-4"><a class="d-block hover-bg-200 px-2 py-3 rounded-3 text-center text-decoration-none" href="#!" target="_blank"><img class="rounded" src="assets/img/nav-icons/pinterest.png" alt="" width="40" height="40" />
                              <p class="mb-0 fw-medium text-800 text-truncate fs--2 pt-1">Pinterest</p>
                            </a></div>
                          <div class="col-4"><a class="d-block hover-bg-200 px-2 py-3 rounded-3 text-center text-decoration-none" href="#!" target="_blank"><img class="rounded" src="assets/img/nav-icons/slack.png" alt="" width="40" height="40" />
                              <p class="mb-0 fw-medium text-800 text-truncate fs--2 pt-1">Slack</p>
                            </a></div>
                          <div class="col-4"><a class="d-block hover-bg-200 px-2 py-3 rounded-3 text-center text-decoration-none" href="#!" target="_blank"><img class="rounded" src="assets/img/nav-icons/deviantart.png" alt="" width="40" height="40" />
                              <p class="mb-0 fw-medium text-800 text-truncate fs--2 pt-1">Deviantart</p>
                            </a></div>
                          <div class="col-4"><a class="d-block hover-bg-200 px-2 py-3 rounded-3 text-center text-decoration-none" href="app/events/event-detail.html" target="_blank">
                              <div class="avatar avatar-2xl">
                                <div class="avatar-name rounded-circle bg-soft-primary text-primary"><span class="fs-2">E</span></div>
                              </div>
                              <p class="mb-0 fw-medium text-800 text-truncate fs--2">Events</p>
                            </a></div>
                          <div class="col-12"><a class="btn btn-outline-primary btn-sm mt-4" href="#!">Show more</a></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </li>
              <li class="nav-item dropdown"><a class="nav-link pe-0 ps-2" id="navbarDropdownUser" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <div class="avatar avatar-xl">
                    <img class="rounded-circle" src="assets/img/team/3-thumb.png" alt="" />

                  </div>
                </a>
                <div class="dropdown-menu dropdown-caret dropdown-caret dropdown-menu-end py-0" aria-labelledby="navbarDropdownUser">
                  <div class="bg-white dark__bg-1000 rounded-2 py-2">
                    <a class="dropdown-item fw-bold text-warning" href="#!"><span class="fas fa-crown me-1"></span><span>Go Pro</span></a>

                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item" href="#!">Set status</a>
                    <a class="dropdown-item" href="pages/user/profile.html">Profile &amp; account</a>
                    <a class="dropdown-item" href="#!">Feedback</a>

                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item" href="pages/user/settings.html">Settings</a>
                    <a class="dropdown-item" href="pages/authentication/card/logout.html">Logout</a>
                  </div>
                </div>
              </li>
            </ul>
          </nav>
          <div class="card mb-3">
            <div class="card-body d-flex flex-wrap flex-between-center align-items-center">
              <div>
                <h6 class="text-primary">Gestion des Entreprises <span id="companiesCount" class="badge rounded-pill bg-info ms-2">0</span></h6>
                <p class="mb-0 text-600">Vue d'ensemble et actions rapides</p>
              </div>
              <div>
                <button id="btnToggleCompanies" class="btn btn-falcon-default btn-md me-2" type="button"><span class="fas fa-users me-md-1"></span><span class="d-none d-md-inline">Entreprises</span></button>
                <button id="btnAddCompany" class="btn btn-primary btn-md" type="button" data-bs-toggle="modal" data-bs-target="#modalCreateBusiness"><span class="fas fa-plus me-md-1"></span><span class="d-none d-md-inline">Ajouter Entreprise</span></button>
              </div>
            </div>
          </div>

          <!-- Main 3-pane layout: left = companies list (toggle), center = company details, right = magasins/guichets -->
          <div class="row g-3 mb-3" id="businessManager">
            <div class="col-lg-3" id="leftPane" style="display:none;">
              <div class="card h-100">
                <div class="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">Entreprises</h6>
                  <button class="btn btn-sm btn-link" id="refreshCompanies">Actualiser</button>
                </div>
                <div class="card-body p-0">
                  <div class="list-group list-group-flush" id="companiesList" style="max-height:60vh; overflow:auto;"></div>
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
                            <span id="budgetLight" class="badge rounded-pill bg-secondary">Budget: —</span>
                            <span id="guichetsLight" class="badge rounded-pill bg-secondary">Guichets: 0</span>
                            <span id="vendeursLight" class="badge rounded-pill bg-secondary">Vendeurs: 0</span>
                          </div>
                        </div>
                        <div class="text-end">
                          <div class="btn-group" role="group">
                            <button id="btnEditCompany" class="btn btn-outline-secondary btn-sm" type="button"><span class="fas fa-edit me-1"></span></button>
                            <button id="btnViewAffectations" class="btn btn-outline-primary btn-sm" disabled type="button"><span class="fas fa-eye me-1"></span>Affectations</button>
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
                          <div class="fs-5 text-700" id="companyBudget">-</div>
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
                      <div class="card h-100">
                        <div class="card-body text-center">
                          <h6 class="mb-1">Magasins</h6>
                          <div class="fs-5 text-700" id="companyStoresCount">0</div>
                          <div class="text-500 small mt-1">Guichets: <span id="companyCountersGuichets">0</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="card-body border-top">
                  <div class="row g-3 align-items-center">
                    <div class="col-md-8">
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 class="mb-1">Spendings</h6>
                          <div class="fs-3 fw-bold" id="companySpendings">$0.00</div>
                          <div class="mt-1"><span id="companySpendingsDelta" class="badge rounded-pill badge-soft-danger">—</span></div>
                        </div>
                        <div class="text-muted small text-end">
                          <div>Budget utilisé</div>
                          <div class="progress mt-1" style="height:8px;width:140px;">
                            <div id="budgetUsageBar" class="progress-bar bg-primary" role="progressbar" style="width:0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-4 d-flex justify-content-end">
                      <div id="spendingsChart" class="echart-default" data-echart-responsive="true" data-echarts='{"xAxis":{"data":["J1","J2","J3","J4","J5","J6","J7"]},"series":[{"type":"line","data":[10,20,15,30,25,20,35],"smooth":true,"lineStyle":{"width":2}}],"grid":{"bottom":"2%","top":"2%","right":"0px","left":"0px"}}' style="width:140px;height:60px"></div>
                    </div>
                  </div>

                  <div class="row mt-3">
                    <div class="col-12">
                      <div class="card">
                        <div class="card-header pb-0"><h6 class="mb-0">Informations</h6></div>
                        <div class="card-body">
                          <table class="table table-borderless fs--1 fw-medium mb-0">
                            <tbody id="companyDetailsTable">
                              <tr><td class="p-1" style="width:35%">Budget:</td><td class="p-1 text-600" id="companyBudget">-</td></tr>
                              <tr><td class="p-1">Devise:</td><td class="p-1 text-600" id="companyDevise">-</td></tr>
                              <tr><td class="p-1">Email:</td><td class="p-1 text-600" id="companyEmail">-</td></tr>
                              <tr><td class="p-1">Téléphone:</td><td class="p-1 text-600" id="companyTelephone">-</td></tr>
                            </tbody>
                          </table>
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
                  <h6 class="mb-0">Magasins & Guichets</h6><button id="btnAddMagasin" class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modalCreateMagasin" disabled><span class="fas fa-plus me-md-1"></span>Ajouter Magasin</button>
                </div>
                <div class="card-body p-0">
                  <div id="magasinsList" style="max-height:60vh; overflow:auto;">
                    <div class="p-3 text-center text-500">Sélectionner une entreprise pour afficher ses magasins</div>
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
                      <input name="logo" type="file" accept="image/*" class="form-control" />
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

          <!-- Modal: Create Magasin -->
          <div class="modal fade" id="modalCreateMagasin" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-md">
              <div class="modal-content">
                <div class="modal-header"><h5 class="modal-title">Créer un magasin</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>
                <div class="modal-body"><form id="formCreateMagasin"><div class="mb-2"><label class="form-label">Nom Magasin</label><input name="nom_magasin" class="form-control" required /></div><div class="mb-2"><label class="form-label">Adresse</label><input name="adresse" class="form-control" /></div><input type="hidden" name="businessId" id="magasinBusinessId" /></form></div>
                <div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button><button id="submitCreateMagasin" type="button" class="btn btn-primary">Créer</button></div>
              </div>
            </div>
          </div>
<!-- score -->
        <div class="row g-3 mb-3">
            <div class="col-md-12">
              <div class="card h-100 font-sans-serif">
                <div class="card-header bg-light d-flex flex-between-center py-2">
                  <h6 class="mb-0">Assignment Scores</h6><a class="btn btn-link btn-sm px-0 fw-medium" href="#!">Individual results<span class="fas fa-angle-right ms-1 fs--1"></span></a>
                </div>
                <div class="card-body">
                  <div class="row g-0 h-100">
                    <div class="col-sm-7 order-1 order-sm-0">
                      <div class="row g-sm-0 gy-4 row-cols-2 h-100 align-content-between">
                        <div class="col">
                          <div class="d-flex gap-2 mb-3">
                            <div class="vr rounded ps-1 bg-success"></div>
                            <h6 class="lh-base text-700 mb-0">90-100%</h6>
                          </div>
                          <h5 class="fw-normal" id="assignTopCount">—</h5>
                          <h6 class="mb-0"><span class="text-500 me-2">this week</span><span class="badge rounded-pill badge-soft-success"><span class="fas fa-caret-up me-1" data-fa-transform="shrink-4"></span><span id="assignTopDelta">—</span></span>
                          </h6>
                        </div>
                        <div class="col">
                          <div class="d-flex gap-2 mb-3">
                            <div class="vr rounded ps-1 bg-primary"></div>
                            <h6 class="lh-base text-700 mb-0">70-90%</h6>
                          </div>
                          <h5 class="fw-normal" id="assignMidCount">—</h5>
                          <h6 class="mb-0"><span class="text-500 me-2">this week</span><span class="badge rounded-pill badge-soft-danger"><span class="fas fa-caret-down me-1" data-fa-transform="shrink-4"></span><span id="assignMidDelta">—</span></span>
                          </h6>
                        </div>
                        <div class="col">
                          <div class="d-flex gap-2 mb-3">
                            <div class="vr rounded ps-1 bg-info"></div>
                            <h6 class="lh-base text-700 mb-0">40-70%</h6>
                          </div>
                          <h5 class="fw-normal" id="assignLowCount">—</h5>
                          <h6 class="mb-0"><span class="text-500 me-2">this week</span><span class="badge rounded-pill badge-soft-secondary"><span id="assignLowDelta">—</span><span class=" ms-1" data-fa-transform="shrink-4"></span></span>
                          </h6>
                        </div>
                        <div class="col">
                          <div class="d-flex gap-2 mb-3">
                            <div class="vr rounded ps-1 bg-warning"></div>
                            <h6 class="lh-base text-700 mb-0">0-40%</h6>
                          </div>
                          <h5 class="fw-normal" id="assignBottomCount">—</h5>
                          <h6 class="mb-0"><span class="text-500 me-2">this week</span><span class="badge rounded-pill badge-soft-primary"><span class="fas fa-plus me-1" data-fa-transform="shrink-4"></span><span id="assignBottomDelta">—</span></span>
                          </h6>
                        </div>
                      </div>
                    </div>
                    <div class="col-sm-5 mb-5 mb-sm-0">
                      <div class="echart-assignment-scores" data-echart-responsive="true"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>

          
          <div class="row g-3 mb-3">
            <div class="col-lg-5 col-xxl-3">
              <div class="card h-100">
                <div class="card-header bg-light d-flex flex-between-center py-2">
                  <h6 class="mb-0">Payment Methods</h6>
                  <div class="dropdown font-sans-serif position-static d-inline-block btn-reveal-trigger">
                    <button class="btn btn-link text-600 btn-sm dropdown-toggle btn-reveal dropdown-caret-none" type="button" id="dropdown-payment-methods" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs--1"></span></button>
                    <div class="dropdown-menu dropdown-menu-end border py-2" aria-labelledby="dropdown-payment-methods"><a class="dropdown-item" href="#!">View</a><a class="dropdown-item" href="#!">Edit</a>
                      <div class="dropdown-divider"></div><a class="dropdown-item text-danger" href="#!">Delete</a>
                    </div>
                  </div>
                </div>
                <div class="card-body">
                  <div class="row g-3 h-100">
                    <div class="col-sm-6 col-lg-12">
                      <div class="card position-relative rounded-4">
                        <div class="bg-holder bg-card rounded-4" style="background-image:url(assets/img/icons/spot-illustrations/corner-2.png);">
                        </div>
                        <!--/.bg-holder-->

                        <div class="card-body p-3 pt-5 pt-xxl-4"><img class="mb-3" src="assets/img/icons/chip.png" alt="" width="30" />
                          <h6 class="text-primary font-base lh-1 mb-1">**** **** **** 9876</h6>
                          <h6 class="fs--2 fw-semi-bold text-facebook mb-3">12/26</h6>
                          <h6 class="mb-0 text-facebook">Michael Giacchino</h6><img class="position-absolute end-0 bottom-0 mb-2 me-2" src="assets/img/icons/master-card.png" alt="" width="70" />
                        </div>
                      </div>
                    </div>
                    <div class="col-sm-6 col-lg-12">
                      <table class="table table-borderless fw-medium font-sans-serif fs--1 mb-2">
                        <tbody>
                          <tr>
                            <td class="p-1" style="width: 35%;">Type:</td>
                            <td class="p-1 text-600">Mastercard debit card</td>
                          </tr>
                          <tr>
                            <td class="p-1" style="width: 35%;">Name:</td>
                            <td class="p-1 text-600">Michael Giacchino</td>
                          </tr>
                          <tr>
                            <td class="p-1" style="width: 35%;">Expires:</td>
                            <td class="p-1 text-600">DEC 2026</td>
                          </tr>
                          <tr>
                            <td class="p-1" style="width: 35%;">Issuer:</td>
                            <td class="p-1 text-600">Falcon Finances</td>
                          </tr>
                          <tr>
                            <td class="p-1" style="width: 35%;">ID:</td>
                            <td class="p-1 text-600">card_3d1avx3zcafd62</td>
                          </tr>
                        </tbody>
                      </table><span class="badge rounded-pill badge-soft-success me-2"><span>Verified</span><span class="fas fa-check ms-1" data-fa-transform="shrink-4"></span></span><span class="badge rounded-pill badge-soft-warning"><span>Non Billable</span><span class="fas fa-exclamation-triangle ms-1" data-fa-transform="shrink-4"></span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-xxl-8 col-xxl-9 order-xxl-1 order-lg-2 order-1">
              <div class="card h-100" id="paymentHistoryTable" data-list='{"valueNames":["course","invoice","date","amount","status"],"page":5}'>
                <div class="card-header d-flex flex-between-center">
                  <h5 class="mb-0 text-nowrap py-2 py-xl-0">Payment History</h5>
                  <div>
                    <button class="btn btn-falcon-default btn-sm me-2" type="button"><span class="fas fa-filter fs--2"></span><span class="d-none d-sm-inline-block ms-1 align-middle">Filter</span></button>
                    <button class="btn btn-falcon-default btn-sm" type="button"><span class="fas fa-external-link-alt fs--2"></span><span class="d-none d-sm-inline-block ms-1 align-middle">Export</span></button>
                  </div>
                </div>
                <div class="card-body p-0">
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
                        <tr class="fw-semi-bold">
                          <td class="align-middle pe-5 py-3 course"><a href="app/e-learning/course/course-details.html">Course#123232</a></td>
                          <td class="align-middle white-space-nowrap pe-6 py-3 invoice">#FA613145</td>
                          <td class="align-middle white-space-nowrap pe-6 py-3 date">01/10/21</td>
                          <td class="align-middle white-space-nowrap py-3 text-end amount">$39.99</td>
                          <td class="align-middle text-end fw-medium font-sans-serif py-3 status text-warning">Pending</td>
                        </tr>
                        <tr class="fw-semi-bold">
                          <td class="align-middle pe-5 py-3 course"><a href="app/e-learning/course/course-details.html">Course#147832</a></td>
                          <td class="align-middle white-space-nowrap pe-6 py-3 invoice">#LC014357</td>
                          <td class="align-middle white-space-nowrap pe-6 py-3 date">12/12/21</td>
                          <td class="align-middle white-space-nowrap py-3 text-end amount">$19.99</td>
                          <td class="align-middle text-end fw-medium font-sans-serif py-3 status text-success">Successful</td>
                        </tr>
                        <tr class="fw-semi-bold">
                          <td class="align-middle pe-5 py-3 course"><a href="app/e-learning/course/course-details.html">Course#965473</a></td>
                          <td class="align-middle white-space-nowrap pe-6 py-3 invoice">#FC657916</td>
                          <td class="align-middle white-space-nowrap pe-6 py-3 date">23/08/21</td>
                          <td class="align-middle white-space-nowrap py-3 text-end amount">$35.99</td>
                          <td class="align-middle text-end fw-medium font-sans-serif py-3 status text-warning">Pending</td>
                        </tr>
                        <tr class="fw-semi-bold">
                          <td class="align-middle pe-5 py-3 course"><a href="app/e-learning/course/course-details.html">Course#854763</a></td>
                          <td class="align-middle white-space-nowrap pe-6 py-3 invoice">#TN654236</td>
                          <td class="align-middle white-space-nowrap pe-6 py-3 date">09/04/21</td>
                          <td class="align-middle white-space-nowrap py-3 text-end amount">$20.99</td>
                          <td class="align-middle text-end fw-medium font-sans-serif py-3 status text-danger">Denied</td>
                        </tr>
                        <tr class="fw-semi-bold">
                          <td class="align-middle pe-5 py-3 course"><a href="app/e-learning/course/course-details.html">Course#232645</a></td>
                          <td class="align-middle white-space-nowrap pe-6 py-3 invoice">#ON820965</td>
                          <td class="align-middle white-space-nowrap pe-6 py-3 date">03/09/21</td>
                          <td class="align-middle white-space-nowrap py-3 text-end amount">$45.49</td>
                          <td class="align-middle text-end fw-medium font-sans-serif py-3 status text-success">Successful</td>
                        </tr>
                        <tr class="fw-semi-bold">
                          <td class="align-middle pe-5 py-3 course"><a href="app/e-learning/course/course-details.html">Course#232471</a></td>
                          <td class="align-middle white-space-nowrap pe-6 py-3 invoice">#TN755429</td>
                          <td class="align-middle white-space-nowrap pe-6 py-3 date">31/12/21</td>
                          <td class="align-middle white-space-nowrap py-3 text-end amount">$99.95</td>
                          <td class="align-middle text-end fw-medium font-sans-serif py-3 status text-danger">Denied</td>
                        </tr>
                        <tr class="fw-semi-bold">
                          <td class="align-middle pe-5 py-3 course"><a href="app/e-learning/course/course-details.html">Course#232558</a></td>
                          <td class="align-middle white-space-nowrap pe-6 py-3 invoice">#TN789426</td>
                          <td class="align-middle white-space-nowrap pe-6 py-3 date">31/12/21</td>
                          <td class="align-middle white-space-nowrap py-3 text-end amount">$55.95</td>
                          <td class="align-middle text-end fw-medium font-sans-serif py-3 status text-warning">Pending</td>
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
            <div class="col-md-6 col-lg-6 col-xxl-4 order-xxl-2 order-lg-3 order-2">
              <div class="card h-100">
                <div class="card-header bg-light d-flex flex-between-center py-2">
                  <h6 class="mb-0">Billing Address</h6>
                  <div class="dropdown font-sans-serif position-static d-inline-block btn-reveal-trigger">
                    <button class="btn btn-link text-600 btn-sm dropdown-toggle btn-reveal dropdown-caret-none" type="button" id="dropdown-billing-address" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs--1"></span></button>
                    <div class="dropdown-menu dropdown-menu-end border py-2" aria-labelledby="dropdown-billing-address"><a class="dropdown-item" href="#!">View</a><a class="dropdown-item" href="#!">Edit</a>
                      <div class="dropdown-divider"></div><a class="dropdown-item text-danger" href="#!">Delete</a>
                    </div>
                  </div>
                </div>
                <div class="card-body p-0">
                  <div class="row g-0">
                    <div class="col-12">
                      <div class="googlemap" style="min-height: 18.75rem" data-latlng="48.8583701,2.2922873,17" data-scrollwheel="false" data-icon="assets/img/icons/map-marker.png" data-zoom="17" data-theme="Default">
                        <div class="marker-content">
                          <h5>Excellent Street </h5>
                          <div class="mb-0">987, Apartment 6, Excellent Street, Good Area, Clean City 5434, Canada</div>
                        </div>
                      </div>
                    </div>
                    <div class="col-12 p-x1">
                      <table class="table table-borderless fw-medium font-sans-serif fs--1 mb-0">
                        <tbody>
                          <tr class="hover-actions-trigger">
                            <td class="p-1" style="width: 35%;">Name:</td>
                            <td class="p-1 text-600">Michael Giacchino<a class="btn btn-link p-0 mt-n1 hover-actions" href="#!"><span class="fas fa-pencil-alt ms-1 fs--2"></span></a></td>
                          </tr>
                          <tr class="hover-actions-trigger">
                            <td class="p-1" style="width: 35%;">Address:</td>
                            <td class="p-1 text-600">987, Apartment 6, Excellent Street, Good Area, Clean City 5434, Canada.<a class="btn btn-link p-0 mt-n1 hover-actions" href="#!"><span class="fas fa-pencil-alt ms-1 fs--2"></span></a></td>
                          </tr>
                          <tr class="hover-actions-trigger">
                            <td class="p-1" style="width: 35%;">Email:</td>
                            <td class="p-1 text-600"> <a class="text-600 text-decoration-none" href="mailto:goodguy@nicemail.com">goodguy@nicemail.com </a><a class="btn btn-link p-0 mt-n1 hover-actions" href="#!"><span class="fas fa-pencil-alt ms-1 fs--2"></span></a></td>
                          </tr>
                          <tr class="hover-actions-trigger">
                            <td class="p-1" style="width: 35%;">Mobile No:</td>
                            <td class="p-1 text-primary"> <a class="text-600 text-decoration-none" href="tel:+12025550110">+1-202-555-0110</a><a class="btn btn-link p-0 mt-n1 hover-actions" href="#!"><span class="fas fa-pencil-alt ms-1 fs--2"></span></a></td>
                          </tr>
                          <tr class="hover-actions-trigger">
                            <td class="p-1" style="width: 35%;">SMS Invoice:</td>
                            <td class="p-1 text-600">On<a class="btn btn-link p-0 mt-n1 hover-actions" href="#!"><span class="fas fa-pencil-alt ms-1 fs--2"></span></a></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
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
                  <div class="timeline-simple">
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
            <div class="col-lg-6 col-xxl-4 order-4">
              <div class="card h-100 font-sans-serif">
                <div class="card-header bg-light py-2 d-flex flex-between-center">
                  <h6 class="mb-0">Course Status</h6><a class="btn btn-link btn-sm px-0 fw-medium" href="#!">Details<span class="fas fa-angle-right ms-1 fs--1"></span></a>
                </div>
                <div class="card-body p-0 d-flex flex-column justify-content-between">
                  <!-- Find the JS file for the following chart at: src/js/charts/echarts/course-status.js-->
                  <!-- If you are not using gulp based workflow, you can find the transpiled code at: public/assets/js/theme.js-->
                  <div class="echart-course-status" data-echart-responsive="true"></div>
                  <ul class="list-unstyled mb-0">
                    <li class="d-flex gap-2 flex-between-center flex-wrap fs--2 p-x1 bg-light">
                      <h6 class="fs-xxl--1 fs-lg--2 mb-0 d-flex align-items-center gap-2"><span class="fas fa-circle text-primary" data-fa-transform="shrink-4"></span>Completed Courses<span class="badge rounded-pill badge-soft-success"><span class="fas fa-caret-up me-1" data-fa-transform="shrink-4"></span><span>2.1%</span></span>
                      </h6>
                      <p class="text-600 mb-0">13 Courses</p>
                    </li>
                    <li class="d-flex gap-2 flex-between-center flex-wrap fs--2 p-x1">
                      <h6 class="fs-xxl--1 fs-lg--2 mb-0 d-flex align-items-center gap-2"><span class="fas fa-circle text-warning" data-fa-transform="shrink-4"></span>Dropped Courses<span class="badge rounded-pill badge-soft-primary"><span class="fas fa-caret-up me-1" data-fa-transform="shrink-4"></span><span>3.5%</span></span>
                      </h6>
                      <p class="text-600 mb-0">10 Courses</p>
                    </li>
                    <li class="d-flex gap-2 flex-between-center flex-wrap fs--2 p-x1 bg-light">
                      <h6 class="fs-xxl--1 fs-lg--2 mb-0 d-flex align-items-center gap-2"><span class="fas fa-circle text-success" data-fa-transform="shrink-4"></span>Refund Claimed<span class="badge rounded-pill badge-soft-secondary"><span class=" me-1" data-fa-transform="shrink-4"></span><span>0.00%</span></span>
                      </h6>
                      <p class="text-600 mb-0">7 Courses</p>
                    </li>
                    <li class="d-flex gap-2 flex-between-center flex-wrap fs--2 p-x1">
                      <h6 class="fs-xxl--1 fs-lg--2 mb-0 d-flex align-items-center gap-2"><span class="fas fa-circle text-info" data-fa-transform="shrink-4"></span>On-going Courses<span class="badge rounded-pill badge-soft-danger"><span class="fas fa-caret-down me-1" data-fa-transform="shrink-4"></span><span>5.1%</span></span>
                      </h6>
                      <p class="text-600 mb-0">20 Courses</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="card h-100 mb-3">
            <div class="card-header bg-light py-3">
              <h6 class="mb-0">Browsing New Courses</h6>
            </div>
            <div class="card-body">
              <!-- Find the JS file for the following chart at: src/js/charts/echarts/browsed-courses.js-->
              <!-- If you are not using gulp based workflow, you can find the transpiled code at: public/assets/js/theme.js-->
              <div class="echart-browsed-courses h-100" data-echart-responsive="true" data-options='{"optionOne":"newCourseBrowsed","optionTwo":"paidCourseBrowsed"}'></div>
            </div>
            <div class="card-footer bg-light py-2">
              <div class="row flex-between-center g-0">
                <div class="col-auto">
                  <button class="btn btn-sm btn-link fs--2 text-600 text-decoration-none px-0 me-2" id="newCourseBrowsed"><span class="fas fa-circle text-primary text-opacity-25 me-1" data-fa-transform="shrink-4"></span>New Courses Browsed</button>
                  <button class="btn btn-sm btn-link fs--2 text-600 text-decoration-none px-0" id="paidCourseBrowsed"><span class="fas fa-circle text-primary me-1" data-fa-transform="shrink-4"></span>Paid Courses Browsed</button>
                </div>
                <div class="col-auto"><a class="btn btn-link btn-sm px-0 fw-medium" href="#!">View report<span class="fas fa-chevron-right ms-1 fs--2"></span></a></div>
              </div>
            </div>
          </div>
          <div class="card" id="enrolledCoursesTable" data-list='{"valueNames":["title","trainer","date","time","progress","price"]}'>
            <div class="card-header d-flex flex-between-center">
              <h6 class="mb-0">Enrolled Courses</h6>
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
                      <th class="fw-medium sort" data-sort="title">Course Title </th>
                      <th class="fw-medium sort" data-sort="trainer">Trainer</th>
                      <th class="fw-medium sort" data-sort="date">Enrollment</th>
                      <th class="fw-medium sort" data-sort="time">Worked</th>
                      <th class="fw-medium sort" data-sort="progress">Progress</th>
                      <th class="fw-medium sort text-end" data-sort="price">Price</th>
                      <th class="fw-medium no-sort pe-1 align-middle data-table-row-action"></th>
                    </tr>
                  </thead>
                  <tbody class="list">
                    <tr class="btn-reveal-trigger fw-semi-bold">
                      <td class="align-middle white-space-nowrap title" style="max-width: 23rem;">
                        <div class="d-flex gap-3 align-items-center position-relative"><img class="rounded-1 border border-200" src="assets/img/elearning/courses/course3.png" width="60" alt="" /><a class="stretched-link text-truncate" href="app/e-learning/course/course-details.html">Advanced Design Tools for Modern Designs</a></div>
                      </td>
                      <td class="align-middle text-nowrap trainer"><a class="text-800" href="app/e-learning/trainer-profile.html">Bill finger</a></td>
                      <td class="align-middle date">01/10/21</td>
                      <td class="align-middle time">12h:50m:00s</td>
                      <td class="align-middle">
                        <div class="progress rounded-3 worked" style="height: 5px; width:5rem">
                          <div class="progress-bar bg-progress-gradient rounded-pill" role="progressbar" style="width: 75%" aria-valuenow="43.72" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                      </td>
                      <td class="align-middle text-end price">$39.99</td>
                      <td class="align-middle text-end">
                        <div class="dropdown font-sans-serif position-static d-inline-block btn-reveal-trigger">
                          <button class="btn btn-link text-600 btn-sm dropdown-toggle btn-reveal dropdown-caret-none float-end" type="button" id="dropdown0" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs--1"></span></button>
                          <div class="dropdown-menu dropdown-menu-end border py-2" aria-labelledby="dropdown0"><a class="dropdown-item" href="#!">View</a><a class="dropdown-item" href="#!">Edit</a>
                            <div class="dropdown-divider"></div><a class="dropdown-item text-danger" href="#!">Delete</a>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr class="btn-reveal-trigger fw-semi-bold">
                      <td class="align-middle white-space-nowrap title" style="max-width: 23rem;">
                        <div class="d-flex gap-3 align-items-center position-relative"><img class="rounded-1 border border-200" src="assets/img/elearning/courses/course8.png" width="60" alt="" /><a class="stretched-link text-truncate" href="app/e-learning/course/course-details.html">Character Design Masterclass: Your First Superhero</a></div>
                      </td>
                      <td class="align-middle text-nowrap trainer"><a class="text-800" href="app/e-learning/trainer-profile.html">Bruce Timm</a></td>
                      <td class="align-middle date">01/10/21</td>
                      <td class="align-middle time">10h:40m:50s</td>
                      <td class="align-middle">
                        <div class="progress rounded-3 worked" style="height: 5px; width:5rem">
                          <div class="progress-bar bg-progress-gradient rounded-pill" role="progressbar" style="width: 60%" aria-valuenow="43.72" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                      </td>
                      <td class="align-middle text-end price">$69.99</td>
                      <td class="align-middle text-end">
                        <div class="dropdown font-sans-serif position-static d-inline-block btn-reveal-trigger">
                          <button class="btn btn-link text-600 btn-sm dropdown-toggle btn-reveal dropdown-caret-none float-end" type="button" id="dropdown1" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs--1"></span></button>
                          <div class="dropdown-menu dropdown-menu-end border py-2" aria-labelledby="dropdown1"><a class="dropdown-item" href="#!">View</a><a class="dropdown-item" href="#!">Edit</a>
                            <div class="dropdown-divider"></div><a class="dropdown-item text-danger" href="#!">Delete</a>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr class="btn-reveal-trigger fw-semi-bold">
                      <td class="align-middle white-space-nowrap title" style="max-width: 23rem;">
                        <div class="d-flex gap-3 align-items-center position-relative"><img class="rounded-1 border border-200" src="assets/img/elearning/courses/course1.png" width="60" alt="" /><a class="stretched-link text-truncate" href="app/e-learning/course/course-details.html">Script Writing Masterclass: Introdution to Industry Cliches</a></div>
                      </td>
                      <td class="align-middle text-nowrap trainer"><a class="text-800" href="app/e-learning/trainer-profile.html">Bill finger</a></td>
                      <td class="align-middle date">01/10/21</td>
                      <td class="align-middle time">12h:50m:00s</td>
                      <td class="align-middle">
                        <div class="progress rounded-3 worked" style="height: 5px; width:5rem">
                          <div class="progress-bar bg-progress-gradient rounded-pill" role="progressbar" style="width: 55%" aria-valuenow="43.72" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                      </td>
                      <td class="align-middle text-end price">$69.55</td>
                      <td class="align-middle text-end">
                        <div class="dropdown font-sans-serif position-static d-inline-block btn-reveal-trigger">
                          <button class="btn btn-link text-600 btn-sm dropdown-toggle btn-reveal dropdown-caret-none float-end" type="button" id="dropdown2" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs--1"></span></button>
                          <div class="dropdown-menu dropdown-menu-end border py-2" aria-labelledby="dropdown2"><a class="dropdown-item" href="#!">View</a><a class="dropdown-item" href="#!">Edit</a>
                            <div class="dropdown-divider"></div><a class="dropdown-item text-danger" href="#!">Delete</a>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr class="btn-reveal-trigger fw-semi-bold">
                      <td class="align-middle white-space-nowrap title" style="max-width: 23rem;">
                        <div class="d-flex gap-3 align-items-center position-relative"><img class="rounded-1 border border-200" src="assets/img/elearning/courses/course5.png" width="60" alt="" /><a class="stretched-link text-truncate" href="app/e-learning/course/course-details.html">Abstract Painting: Zero to Mastery in Traditional Medium</a></div>
                      </td>
                      <td class="align-middle text-nowrap trainer"><a class="text-800" href="app/e-learning/trainer-profile.html">J. H. Williams III</a></td>
                      <td class="align-middle date">03/09/21</td>
                      <td class="align-middle time">38h:10m:09s</td>
                      <td class="align-middle">
                        <div class="progress rounded-3 worked" style="height: 5px; width:5rem">
                          <div class="progress-bar bg-progress-gradient rounded-pill" role="progressbar" style="width: 85%" aria-valuenow="43.72" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                      </td>
                      <td class="align-middle text-end price">$45.49</td>
                      <td class="align-middle text-end">
                        <div class="dropdown font-sans-serif position-static d-inline-block btn-reveal-trigger">
                          <button class="btn btn-link text-600 btn-sm dropdown-toggle btn-reveal dropdown-caret-none float-end" type="button" id="dropdown3" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs--1"></span></button>
                          <div class="dropdown-menu dropdown-menu-end border py-2" aria-labelledby="dropdown3"><a class="dropdown-item" href="#!">View</a><a class="dropdown-item" href="#!">Edit</a>
                            <div class="dropdown-divider"></div><a class="dropdown-item text-danger" href="#!">Delete</a>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr class="btn-reveal-trigger fw-semi-bold">
                      <td class="align-middle white-space-nowrap title" style="max-width: 23rem;">
                        <div class="d-flex gap-3 align-items-center position-relative"><img class="rounded-1 border border-200" src="assets/img/elearning/courses/course7.png" width="60" alt="" /><a class="stretched-link text-truncate" href="app/e-learning/course/course-details.html">Character Design Masterclass: Your First Supervillain</a></div>
                      </td>
                      <td class="align-middle text-nowrap trainer"><a class="text-800" href="app/e-learning/trainer-profile.html">Bill finger</a></td>
                      <td class="align-middle date">01/10/21</td>
                      <td class="align-middle time">02h:29m:00s</td>
                      <td class="align-middle">
                        <div class="progress rounded-3 worked" style="height: 5px; width:5rem">
                          <div class="progress-bar bg-progress-gradient rounded-pill" role="progressbar" style="width: 25%" aria-valuenow="43.72" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                      </td>
                      <td class="align-middle text-end price">$39.99</td>
                      <td class="align-middle text-end">
                        <div class="dropdown font-sans-serif position-static d-inline-block btn-reveal-trigger">
                          <button class="btn btn-link text-600 btn-sm dropdown-toggle btn-reveal dropdown-caret-none float-end" type="button" id="dropdown4" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs--1"></span></button>
                          <div class="dropdown-menu dropdown-menu-end border py-2" aria-labelledby="dropdown4"><a class="dropdown-item" href="#!">View</a><a class="dropdown-item" href="#!">Edit</a>
                            <div class="dropdown-divider"></div><a class="dropdown-item text-danger" href="#!">Delete</a>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr class="btn-reveal-trigger fw-semi-bold">
                      <td class="align-middle white-space-nowrap title" style="max-width: 23rem;">
                        <div class="d-flex gap-3 align-items-center position-relative"><img class="rounded-1 border border-200" src="assets/img/elearning/courses/course2.png" width="60" alt="" /><a class="stretched-link text-truncate" href="app/e-learning/course/course-details.html">Composition in Comics: Easy to Read Between Panels</a></div>
                      </td>
                      <td class="align-middle text-nowrap trainer"><a class="text-800" href="app/e-learning/trainer-profile.html">Bill finger</a></td>
                      <td class="align-middle date">31/12/21</td>
                      <td class="align-middle time">00h:50m:30s</td>
                      <td class="align-middle">
                        <div class="progress rounded-3 worked" style="height: 5px; width:5rem">
                          <div class="progress-bar bg-progress-gradient rounded-pill" role="progressbar" style="width: 15%" aria-valuenow="43.72" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                      </td>
                      <td class="align-middle text-end price">$99.99</td>
                      <td class="align-middle text-end">
                        <div class="dropdown font-sans-serif position-static d-inline-block btn-reveal-trigger">
                          <button class="btn btn-link text-600 btn-sm dropdown-toggle btn-reveal dropdown-caret-none float-end" type="button" id="dropdown5" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs--1"></span></button>
                          <div class="dropdown-menu dropdown-menu-end border py-2" aria-labelledby="dropdown5"><a class="dropdown-item" href="#!">View</a><a class="dropdown-item" href="#!">Edit</a>
                            <div class="dropdown-divider"></div><a class="dropdown-item text-danger" href="#!">Delete</a>
                          </div>
                        </div>
                      </td>
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
        <div class="modal fade" id="authentication-modal" tabindex="-1" role="dialog" aria-labelledby="authentication-modal-label" aria-hidden="true">
          <div class="modal-dialog mt-6" role="document">
            <div class="modal-content border-0">
              <div class="modal-header px-5 position-relative modal-shape-header bg-shape">
                <div class="position-relative z-index-1 light">
                  <h4 class="mb-0 text-white" id="authentication-modal-label">Register</h4>
                  <p class="fs--1 mb-0 text-white">Please create your free Falcon account</p>
                </div>
                <button class="btn-close btn-close-white position-absolute top-0 end-0 mt-2 me-2" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body py-4 px-5">
                <form>
                  <div class="mb-3">
                    <label class="form-label" for="modal-auth-name">Name</label>
                    <input class="form-control" type="text" autocomplete="on" id="modal-auth-name" />
                  </div>
                  <div class="mb-3">
                    <label class="form-label" for="modal-auth-email">Email address</label>
                    <input class="form-control" type="email" autocomplete="on" id="modal-auth-email" />
                  </div>
                  <div class="row gx-2">
                    <div class="mb-3 col-sm-6">
                      <label class="form-label" for="modal-auth-password">Password</label>
                      <input class="form-control" type="password" autocomplete="on" id="modal-auth-password" />
                    </div>
                    <div class="mb-3 col-sm-6">
                      <label class="form-label" for="modal-auth-confirm-password">Confirm Password</label>
                      <input class="form-control" type="password" autocomplete="on" id="modal-auth-confirm-password" />
                    </div>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="modal-auth-register-checkbox" />
                    <label class="form-label" for="modal-auth-register-checkbox">I accept the <a href="#!">terms </a>and <a href="#!">privacy policy</a></label>
                  </div>
                  <div class="mb-3">
                    <button class="btn btn-primary d-block w-100 mt-3" type="submit" name="submit">Register</button>
                  </div>
                </form>
                <div class="position-relative mt-5">
                  <hr />
                  <div class="divider-content-center">or register with</div>
                </div>
                <div class="row g-2 mt-2">
                  <div class="col-sm-6"><a class="btn btn-outline-google-plus btn-sm d-block w-100" href="#"><span class="fab fa-google-plus-g me-2" data-fa-transform="grow-8"></span> google</a></div>
                  <div class="col-sm-6"><a class="btn btn-outline-facebook btn-sm d-block w-100" href="#"><span class="fab fa-facebook-square me-2" data-fa-transform="grow-8"></span> facebook</a></div>
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
    </div><a class="card setting-toggle" href="#settings-offcanvas" data-bs-toggle="offcanvas">
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
    <script src="https://polyfill.io/v3/polyfill.min.js?features=window.scroll"></script>
    <script src="vendors/list.js/list.min.js"></script>
    <script src="assets/js/theme.js"></script>
    <script src="assets/js/entreprise.js"></script>


  </body>

</html>