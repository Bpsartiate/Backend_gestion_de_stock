<!-- <?php include_once __DIR__ . '/config.php'; ?> -->
<nav class="navbar navbar-light navbar-vertical navbar-expand-xl">
          <script>
            var navbarStyle = localStorage.getItem("navbarStyle");
            if (navbarStyle && navbarStyle !== 'transparent') {
              document.querySelector('.navbar-vertical').classList.add(`navbar-${navbarStyle}`);
            }
            
            // Fix navigation links to use BASE_URL
            document.addEventListener('DOMContentLoaded', function() {
              const baseUrl = (typeof window.BASE_URL !== 'undefined' && window.BASE_URL) ? window.BASE_URL.replace(/\/$/, '') : '/backend_Stock';
              
              // Links that need BASE_URL prefix
              const linksToFix = {
                'href="entreprise.php"': baseUrl + '/entreprise.php',
                'href="magasin.php"': baseUrl + '/magasin.php',
                'href="guichet.php"': baseUrl + '/guichet.php',
                'href="setting.php"': baseUrl + '/setting.php',
                'href="pages/stocks_et_entreposage.php"': baseUrl + '/pages/stocks_et_entreposage.php'
              };
              
              // Update all navigation links
              document.querySelectorAll('.navbar-vertical a[href]').forEach(link => {
                const href = link.getAttribute('href');
                Object.entries(linksToFix).forEach(([pattern, replacement]) => {
                  if (href && href.includes(pattern.replace('href="', '').replace('"', ''))) {
                    link.href = replacement;
                  }
                });
              });
            });
          </script>
            <div class="d-flex align-items-center">
            <div class="toggle-icon-wrapper">

              <button class="btn navbar-toggler-humburger-icon navbar-vertical-toggle" data-bs-toggle="tooltip" data-bs-placement="left" title="Toggle Navigation"><span class="navbar-toggle-icon"><span class="toggle-line"></span></span></button>

            </div><a class="navbar-brand" href="pages/e-commerce.php">
              <div class="d-flex align-items-center py-3">
                <span class="me-2" style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px;">A</span>
                <span class="font-sans-serif">Aurora</span>
              </div>
            </a>
          </div>
          <div class="collapse navbar-collapse" id="navbarVerticalCollapse">
            <div class="navbar-vertical-content scrollbar">
              <ul class="navbar-nav flex-column mb-3" id="navbarVerticalNav">
                 
                    <div class="d-flex align-items-center"><span class="nav-link-icon"><span class="fas fa-chart-pie"></span></span><span class="nav-link-text ps-1">Dashboard</span>
                    </div>
                  </a>
            
                <li class="nav-item">
                  <!-- label-->
                  <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                    <div class="col-auto navbar-vertical-label">App
                    </div>
                    <div class="col ps-0">
                      <hr class="mb-0 navbar-vertic al-divider" />
                    </div>
                  </div>
                
                  <!-- parent pages--><a class="nav-link dropdown-indicator" href="#email" role="button" data-bs-toggle="collapse" aria-expanded="false" aria-controls="email">
                    <div class="d-flex align-items-center"><span class="nav-link-icon"><span class="fas fa-truck"></span></span><span class="nav-link-text ps-1">Gestion d'entreprise</span>
                    </div>
                  </a>
                  <ul class="nav collapse" id="email">
                    <li class="nav-item"><a class="nav-link" href="entreprise.php">
                        <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Entreprises</span>
                        </div>
                      </a>
                      <!-- more inner pages-->
                    </li>
                    <li class="nav-item"><a class="nav-link" href="magasin.php">
                        <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Magasins</span>
                        </div>
                      </a>
                    </li>
                    <li class="nav-item"><a class="nav-link" href="guichet.php">
                        <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Guichets</span>
                        </div>
                      </a>
                    </li>
                    <li class="nav-item"><a class="nav-link" href="affectation.php">
                        <div class="d-flex align-items-center"><span class="nav-link-icon"><span class="fas fa-link"></span></span><span class="nav-link-text ps-1">Affectations</span>
                        </div>
                      </a>
                    </li>
                  </ul>
                  <!-- parent pages--><a class="nav-link dropdown-indicator" href="#events" role="button" data-bs-toggle="collapse" aria-expanded="false" aria-controls="events">
                    <div class="d-flex align-items-center"><span class="nav-link-icon"><span class="fas fa-warehouse"></span></span><span class="nav-link-text ps-1">Logistique</span>
                    </div>
                  </a>
                  <ul class="nav collapse" id="events">
                    <!-- <li class="nav-item"><a class="nav-link" href="pages/TransportEtLivraison.php">
                        <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Transport et livraison</span>
                        </div>
                      </a>
                      more inner pages
                    </li> -->
                  
                    <li class="nav-item"><a class="nav-link" href="pages/stocks_et_entreposage.php">
                        <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Stocks et entreposage</span>
                        </div>
                      </a>
                      <!-- more inner pages-->
                    </li>
                    <li class="nav-item"><a class="nav-link" href="vente.php">
                        <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Ventes & Mouvements</span>
                        </div>
                      </a>
                      <!-- more inner pages-->
                    </li>
                   
                  </ul>
                  <!-- parent pages--><a class="nav-link dropdown-indicator" href="#e-commerce" role="button" data-bs-toggle="collapse" aria-expanded="false" aria-controls="e-commerce">
                    <div class="d-flex align-items-center"><span class="nav-link-icon"><span class="fas fa-coins"></span></span><span class="nav-link-text ps-1">Finances</span>
                    </div>
                  </a>
                  <ul class="nav collapse" id="e-commerce">
                    <li class="nav-item"><a class="nav-link dropdown-indicator" href="#product" data-bs-toggle="collapse" aria-expanded="false" aria-controls="e-commerce">
                        <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Dmd de paiement</span>
                        </div>
                      </a>
                    </li>
                    <li class="nav-item"><a class="nav-link" href="app/e-commerce/product/product-list.php">
                            <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Rapports financiers</span>
                            </div>
                          </a>
                          <!-- more inner pages-->
                        </li>
                 
                  </ul>
                  <!-- parent pages-->
                   <a class="nav-link dropdown-indicator" href="#e-learning" role="button" data-bs-toggle="collapse" aria-expanded="false" aria-controls="e-learning">
                    <div class="d-flex align-items-center"><span class="nav-link-icon"><span class="fas fa-graduation-cap"></span></span><span class="nav-link-text ps-1">Documentation</span><span class="badge rounded-pill ms-2 badge-soft-success">New</span>
                    </div>
                  </a>
                  <ul class="nav collapse" id="e-learning">
                  <li class="nav-item"><a class="nav-link" href="app/e-learning/course/course-list.php">
                            <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Modèles et formulaires</span>
                            </div>
                          </a>
                          <!-- more inner pages-->
                        </li>
                    <li class="nav-item"><a class="nav-link" href="app/e-learning/course/course-list.php">
                            <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Rapports d’audit</span>
                            </div>
                          </a>
                          <!-- more inner pages-->
                        </li>
                  </ul>
                 
                </li>
                <li class="nav-item">
                  <!-- label-->
                  <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                    <div class="col-auto navbar-vertical-label">Pages
                    </div>
                    <div class="col ps-0">
                      <hr class="mb-0 navbar-vertical-divider" />
                    </div>
                  </div>
                  <!-- parent pages--><a class="nav-link dropdown-indicator" href="#authentication" role="button" data-bs-toggle="collapse" aria-expanded="false" aria-controls="authentication">
                    <div class="d-flex align-items-center"><span class="nav-link-icon"><span class="fas fa-users"></span></span><span class="nav-link-text ps-1">Users & paramètres</span>
                    </div>
                  </a>
                  <ul class="nav collapse" id="authentication">
                    <li class="nav-item"><a class="nav-link dropdown-indicator" href="#simple" data-bs-toggle="collapse" aria-expanded="false" aria-controls="authentication">
                        <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Gestion des utilisateurs</span>
                        </div>
                      </a>
                      <!-- more inner pages-->
                      <ul class="nav collapse" id="simple">
                        <li class="nav-item"><a class="nav-link" href="pages/authentication/simple/login.php">
                            <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Rôles et permissions</span>
                            </div>
                          </a>
                          <!-- more inner pages-->
                        </li>
                        <li class="nav-item"><a class="nav-link" href="pages/authentication/simple/logout.php">
                            <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Paramètres généraux</span>
                            </div>
                          </a>
                          <!-- more inner pages-->
                        </li>
                        <li class="nav-item"><a class="nav-link" href="pages/authentication/simple/register.php">
                            <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Register</span>
                            </div>
                          </a>
                          <!-- more inner pages-->
                        </li>
                        <li class="nav-item"><a class="nav-link" href="pages/authentication/simple/forgot-password.php">
                            <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Forgot password</span>
                            </div>
                          </a>
                          <!-- more inner pages-->
                        </li>
                        <li class="nav-item"><a class="nav-link" href="pages/authentication/simple/confirm-mail.php">
                            <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Confirm mail</span>
                            </div>
                          </a>
                          <!-- more inner pages-->
                        </li>
                        <li class="nav-item"><a class="nav-link" href="pages/authentication/simple/reset-password.php">
                            <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Reset password</span>
                            </div>
                          </a>
                          <!-- more inner pages-->
                        </li>
                        <li class="nav-item"><a class="nav-link" href="pages/authentication/simple/lock-screen.php">
                            <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Lock screen</span>
                            </div>
                          </a>
                          <!-- more inner pages-->
                        </li>
                      </ul>
                    </li>
                   
                  </ul>
                 <!-- parent pages--><a class="nav-link dropdown-indicator" href="#user" role="button" data-bs-toggle="collapse" aria-expanded="false" aria-controls="user">
                    <div class="d-flex align-items-center"><span class="nav-link-icon"><span class="fas fa-user"></span></span><span class="nav-link-text ps-1">User</span>
                    </div>
                  </a>
                  <ul class="nav collapse" id="user">
                    <li class="nav-item"><a class="nav-link" href="pages/user/profile.php">
                        <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Profile</span>
                        </div>
                      </a>
                      <!-- more inner pages-->
                    </li>
                    <li class="nav-item"><a class="nav-link" href="setting.php">
                        <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Settings</span>
                        </div>
                      </a>
                      <!-- more inner pages-->
                    </li>
                  </ul>

                  
                 
              </ul>
             
            </div>
          </div>
        </nav>
