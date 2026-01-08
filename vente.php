<?php 
include_once 'includes/auth-init.php';

// Contrôle d'accès: seuls vendeur, superviseur et admin
$userRole = $_SESSION['role'] ?? 'guest';
if (!in_array($userRole, ['VENDEUR', 'SUPERVISEUR', 'ADMIN'])) {
    header('Location: index.php?error=access_denied');
    exit();
}
?>
<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>POS Ventes - Dashboard Pro</title>

    <!-- Favicons & PWA -->
    <link rel="apple-touch-icon" sizes="180x180" href="assets/img/favicons/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/img/favicons/favicon-32x32.png">
    <link rel="manifest" href="assets/img/favicons/manifest.json">
    <meta name="theme-color" content="#6366f1">

    <!-- Vos styles Falcon existants -->
    <script src="assets/js/config.js"></script>
    <script src="vendors/simplebar/simplebar.min.js"></script>
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,600,700%7cPoppins:300,400,500,600,700,800,900&display=swap" rel="stylesheet">
    <link href="vendors/simplebar/simplebar.min.css" rel="stylesheet">
    <link href="assets/css/theme-rtl.min.css" rel="stylesheet" id="style-rtl">
    <link href="assets/css/theme.min.css" rel="stylesheet" id="style-default">
    <link href="assets/css/user-rtl.min.css" rel="stylesheet" id="user-style-rtl">
    <link href="assets/css/user.min.css" rel="stylesheet" id="user-style-default">

    <script>
        // RTL/Theme existant
        var isRTL = JSON.parse(localStorage.getItem('isRTL'));
        if (isRTL) {
            document.querySelector('html').setAttribute('dir', 'rtl');
            document.getElementById('style-default').disabled = true;
            document.getElementById('user-style-default').disabled = true;
        } else {
            document.getElementById('style-rtl').disabled = true;
            document.getElementById('user-style-rtl').disabled = true;
        }
    </script>
    <script>
        if(typeof window.API_BASE === 'undefined' || !window.API_BASE){
            window.API_BASE = 'https://backend-gestion-de-stock.onrender.com';
        }
        // Config utilisateur pour contrôle d'accès
        window.USER_ROLE = '<?php echo htmlspecialchars($userRole); ?>';
        window.USER_ID = '<?php echo htmlspecialchars($_SESSION['userId'] ?? ''); ?>';
    </script>
    <style>
        .gradient-header {
            background: linear-gradient(90deg, #ff6b35 0%, #f7931e 100%);
        }
        .card-vente {
            border: 1px solid #e0e0e0;
            transition: all 0.3s ease;
        }
        .card-vente:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .panier-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 6px;
            margin-bottom: 8px;
        }
        .badge-qty {
            background: #ff6b35;
            color: white;
            border-radius: 20px;
            padding: 4px 8px;
            font-size: 12px;
        }
        .total-vente {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            font-weight: bold;
        }
        .btn-vendre {
            background: linear-gradient(90deg, #ff6b35 0%, #f7931e 100%);
            color: white;
            border: none;
        }
        .btn-vendre:hover {
            background: linear-gradient(90deg, #e55a2b 0%, #e68018 100%);
            color: white;
        }
        .metric-card {
            border: 1px solid #e0e0e0;
        }
        .sortable-list {
            cursor: grab;
        }
    </style>
</head>

<body>
    <main class="main" id="top">
        <div class="container-fluid" data-layout="container">
            <?php include_once 'sidebar.php'; ?>
            
            <div class="content">
                <?php include_once 'topbar.php'; ?>

                <!-- HEADER ULTRA-MODERNE POS -->
                <div class="card mb-2 border-0 overflow-hidden">
                    <div class="gradient-header text-white p-3 p-md-4 position-relative" style="background: linear-gradient(90deg, #ff6b35 0%, #f7931e 100%);">
                        <div class="row align-items-center gx-3">
                            <div class="col-auto d-none d-md-block">
                                <div class="avatar bg-white-10 rounded-circle d-flex align-items-center justify-content-center" style="width:72px;height:72px;">
                                    <i class="fas fa-cash-register fa-2x text-white"></i>
                                </div>
                            </div>
                            <div class="col">
                                <div class="d-flex align-items-center">
                                    <h2 class="mb-0 fw-bold me-3">POS - Point de Vente</h2>
                                    <div class="small text-white-75">Système de gestion des ventes</div>
                                </div>
                                <div class="mt-2 d-flex flex-wrap gap-2 align-items-center">
                                    <span class="badge bg-white bg-opacity-15 text-white">
                                        <i class="fas fa-store me-1"></i> 
                                        <span id="currentMagasinName">-</span>
                                    </span>
                                    <span class="badge bg-white bg-opacity-15 text-white"><i class="fas fa-shopping-cart me-1"></i> <span id="ventesToday">0</span> ventes</span>
                                    <span class="badge bg-white bg-opacity-15 text-white"><i class="fas fa-dollar-sign me-1"></i> <span id="totalVentes">0.00</span> USD</span>
                                </div>
                            </div>
                            <div class="col-auto text-end">
                                <div class="d-flex align-items-center gap-2">
                                    <!-- Sélecteur magasin pour ADMIN -->
                                    <?php if ($userRole === 'ADMIN'): ?>
                                    <div class="input-group input-group-sm" style="width: 200px;">
                                        <span class="input-group-text bg-white-10 border-0 text-white">
                                            <i class="fas fa-store"></i>
                                        </span>
                                        <select id="adminMagasinSelect" class="form-select form-select-sm bg-white-10 border-0 text-white" style="max-width: 150px;">
                                            <option value="">Sélectionner magasin...</option>
                                        </select>
                                    </div>
                                    <?php endif; ?>
                                    <button class="btn btn-light btn-sm" id="refreshData" title="Actualiser"><i class="fas fa-sync-alt" id="refreshIcon"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- WIDGETS: Quick overview -->
                <div class="row g-3 mb-3">
                    <div class="col-md-3">
                        <div class="card h-100 metric-card p-3 text-center">
                            <div class="d-flex align-items-center justify-content-center mb-2">
                                <i class="fas fa-cart-plus fa-2x text-success"></i>
                            </div>
                            <div class="fs-3 fw-bold text-success" id="widgetVentesJour">0</div>
                            <div class="small text-muted">Ventes aujourd'hui</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card h-100 metric-card p-3 text-center">
                            <div class="d-flex align-items-center justify-content-center mb-2">
                                <i class="fas fa-chart-line fa-2x text-primary"></i>
                            </div>
                            <div class="fs-3 fw-bold text-primary" id="widgetChiffre">0.00</div>
                            <div class="small text-muted">Chiffre d'affaires</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card h-100 metric-card p-3 text-center">
                            <div class="d-flex align-items-center justify-content-center mb-2">
                                <i class="fas fa-boxes fa-2x text-info"></i>
                            </div>
                            <div class="fs-3 fw-bold text-info" id="widgetQteSortie">0</div>
                            <div class="small text-muted">Quantités sorties</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card h-100 metric-card p-3 text-center">
                            <div class="d-flex align-items-center justify-content-center mb-2">
                                <i class="fas fa-exchange-alt fa-2x text-warning"></i>
                            </div>
                            <div class="fs-3 fw-bold text-warning" id="widgetMouvements">0</div>
                            <div class="small text-muted">Mouvements</div>
                        </div>
                    </div>
                </div>

                <!-- MAIN CONTENT: 3-panes layout -->
                <div class="row g-3" style="display: flex; gap: 1rem; flex-wrap: nowrap;">
                    
                    <!-- PANEL 1: Sélection Produits -->
                    <div id="panelProduits" style="flex: 0 0 25%; min-width: 250px;">
                        <div class="card border-0 h-100">
                            <div class="card-header bg-light d-flex justify-content-between align-items-center p-3">
                                <h6 class="mb-0 fw-semibold">
                                    <i class="fas fa-list text-success me-2"></i>Produits
                                </h6>
                                <button class="btn btn-sm btn-outline-success toggle-panel-btn" id="togglePanelProduits" title="Minimiser">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>

                            <div class="panel-expanded">
                                <div class="card-header border-bottom p-2 bg-light">
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text border-0 bg-transparent">
                                            <i class="fas fa-search text-muted"></i>
                                        </span>
                                        <input id="searchProduits" class="form-control border-start-0 ps-0 bg-transparent" placeholder="Rechercher produit..." style="border: none;">
                                    </div>
                                </div>
                                <div class="card-body p-0">
                                    <div id="produitsList" class="list-group list-group-flush" style="max-height: 65vh; overflow: auto;">
                                        <div class="d-flex align-items-center justify-content-center" style="height: 400px;">
                                            <div class="text-center">
                                                <div class="spinner-border spinner-border-sm text-success mb-2" role="status"></div>
                                                <p class="text-muted small">Chargement...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="panel-collapsed p-2">
                                <div id="produitsPhotosGrid" class="d-flex flex-column gap-1" style="max-height: 65vh; overflow: auto;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- PANEL 2: Formulaire Vente -->
                    <div id="panelFormulaire" style="flex: 0 0 35%; min-width: 300px;">
                        <div class="card border-0 h-100">
                            <div class="card-header bg-light p-3">
                                <h6 class="mb-0 fw-semibold">
                                    <i class="fas fa-edit text-primary me-2"></i>Nouvelle Vente
                                </h6>
                            </div>
                            <div class="card-body">
                                <!-- Magasin Selection -->
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Magasin</label>
                                    <select id="venteSelectMagasin" class="form-select form-select-sm">
                                        <option value="">-- Sélectionner magasin --</option>
                                    </select>
                                    <small class="text-muted d-block mt-1" id="venteSelectMagasinHelp"></small>
                                </div>

                                <!-- Rayon Selection -->
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Rayon</label>
                                    <select id="venteSelectRayon" class="form-select form-select-sm">
                                        <option value="">-- Sélectionner rayon --</option>
                                    </select>
                                </div>

                                <!-- Produit Selection -->
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Produit</label>
                                    <select id="venteSelectProduit" class="form-select form-select-sm">
                                        <option value="">-- Sélectionner produit --</option>
                                    </select>
                                    <small class="text-muted d-block mt-1">
                                        Stock actuel: <span id="venteProduitStock" class="badge bg-info">0</span>
                                    </small>
                                </div>

                                <!-- Quantité -->
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Quantité</label>
                                    <div class="input-group input-group-sm">
                                        <button class="btn btn-outline-secondary" type="button" id="btnMoinsQte">−</button>
                                        <input type="number" id="venteQuantite" class="form-control text-center" value="1" min="1">
                                        <button class="btn btn-outline-secondary" type="button" id="btnPlusQte">+</button>
                                    </div>
                                </div>

                                <!-- Prix USD -->
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">💵 Prix Unitaire (USD)</label>
                                    <input type="number" id="ventePrix" class="form-control form-control-sm" placeholder="0.00" step="0.01">
                                    <small class="text-muted">Prix suggéré: <span id="ventePrixSuggere" class="badge bg-warning">0.00</span> USD</small>
                                </div>

                                <!-- Total USD -->
                                <div class="total-vente mb-3">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span>💵 Total USD:</span>
                                        <span id="venteTotalPartiel" class="fs-5">0.00</span>
                                    </div>
                                </div>

                                <!-- Taux de Conversion FC (optionnel) -->
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">🇨🇩 Taux FC/USD (optionnel)</label>
                                    <div class="input-group input-group-sm">
                                        <input type="number" id="venteTauxFC" class="form-control" placeholder="Ex: 2650" step="0.01" value="">
                                        <span class="input-group-text">FC</span>
                                    </div>
                                    <small class="text-muted d-block mt-1">Équivalent: <span id="venteTotalFC" class="badge bg-info">-</span></small>
                                </div>

                                <!-- Client (optional) -->
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Client (optionnel)</label>
                                    <input type="text" id="venteClient" class="form-control form-control-sm" placeholder="Nom client">
                                </div>

                                <!-- Observations -->
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Observations</label>
                                    <textarea id="venteObservations" class="form-control form-control-sm" rows="2" placeholder="Remarques..."></textarea>
                                </div>

                                <!-- Bouton Ajouter au panier -->
                                <button class="btn btn-success btn-sm w-100 mb-2" id="btnAjouterPanier">
                                    <i class="fas fa-plus me-1"></i>Ajouter au panier
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- PANEL 3: Panier & Validation -->
                    <div id="panelPanier" style="flex: 0 0 38%; min-width: 300px;">
                        <div class="card border-0 h-100">
                            <div class="card-header bg-light p-3">
                                <h6 class="mb-0 fw-semibold">
                                    <i class="fas fa-shopping-bag text-danger me-2"></i>Panier Vente
                                </h6>
                                <small class="text-muted" id="paniernbArticles">(0 articles)</small>
                            </div>
                            <div class="card-body p-3" style="max-height: 45vh; overflow-y: auto;">
                                <div id="panieListe" class="mb-3">
                                    <div class="text-center text-muted py-5">
                                        <i class="fas fa-shopping-cart fa-2x mb-2 opacity-50"></i>
                                        <p class="small">Panier vide</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Résumé -->
                            <div class="card-footer bg-light p-3">
                                <div class="mb-3">
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>💵 Sous-total (USD):</span>
                                        <span id="panierSousTotal" class="fw-semibold">0.00</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Quantité totale:</span>
                                        <span id="panierQteTotale" class="fw-semibold">0</span>
                                    </div>
                                    <hr>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <h5 class="mb-0">💵 TOTAL (USD):</h5>
                                        <h5 class="mb-0 text-danger" id="panierTotal">0.00</h5>
                                    </div>
                                    <div id="panierTotalFCDiv" class="d-flex justify-content-between align-items-center mt-2" style="display: none;">
                                        <h5 class="mb-0">🇨🇩 TOTAL (FC):</h5>
                                        <h5 class="mb-0 text-info" id="panierTotalFC">-</h5>
                                    </div>
                                </div>

                                <!-- Paiement -->
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Mode de paiement</label>
                                    <select id="ventePaiement" class="form-select form-select-sm">
                                        <option value="CASH">💵 Cash</option>
                                        <option value="CARD">💳 Carte</option>
                                        <option value="CREDIT">📋 Crédit</option>
                                        <option value="CHEQUE">✓ Chèque</option>
                                    </select>
                                </div>

                                <!-- Boutons -->
                                <div class="btn-group w-100" role="group">
                                    <button type="button" class="btn btn-outline-danger btn-sm" id="btnViderPanier">
                                        <i class="fas fa-trash me-1"></i>Vider
                                    </button>
                                    <button type="button" class="btn btn-vendre btn-sm" id="btnValiderVente" disabled>
                                        <i class="fas fa-check me-1"></i>Valider Vente
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- HISTORIQUE VENTES -->
                <div class="row g-3 mt-3">
                    <div class="col-12">
                        <div class="card border-0">
                            <div class="card-header bg-light p-3">
                                <h6 class="mb-0 fw-semibold">
                                    <i class="fas fa-history text-info me-2"></i>Historique des Ventes
                                </h6>
                            </div>
                            <div class="card-body p-3">
                                <div id="ventesHistorique" class="table-responsive">
                                    <table class="table table-sm table-hover mb-0">
                                        <thead class="bg-light">
                                            <tr>
                                                <th>Heure</th>
                                                <th>Magasin</th>
                                                <th>Produits</th>
                                                <th>Quantité</th>
                                                <th>Montant (USD)</th>
                                                <th>Paiement</th>
                                                <th>Utilisateur</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="ventesTableBody">
                                            <tr>
                                                <td colspan="8" class="text-center text-muted py-3">Aucune vente enregistrée</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Scripts -->
    <script src="vendors/popper/popper.min.js"></script>
    <script src="vendors/bootstrap/bootstrap.min.js"></script>
    <script src="vendors/anchorjs/anchor.min.js"></script>
    <script src="vendors/is/is.min.js"></script>
    <script src="vendors/echarts/echarts.min.js"></script>
    <script src="vendors/fontawesome/all.min.js"></script>
    <script src="vendors/lodash/lodash.min.js"></script>
    <script src="vendors/list.js/list.min.js"></script>
    <script src="assets/js/theme.js"></script>

    <!-- Module Vente -->
    <script src="assets/js/vente.js"></script>
</body>
</html>
