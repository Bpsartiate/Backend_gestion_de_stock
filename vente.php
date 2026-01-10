<?php 
include_once 'includes/auth-init.php';

// Contrôle d'accès: seuls vendeur, superviseur et admin
// Note: Les rôles peuvent être stockés en session PHP OU en JWT token (localStorage)
// Si pas de session, on laisse le frontend vérifier via JWT
$userRole = $_SESSION['role'] ?? null;

// Si on a une session avec un rôle, on vérifie
if ($userRole && !in_array($userRole, ['VENDEUR', 'SUPERVISEUR', 'ADMIN'])) {
    header('Location: index.php?error=access_denied');
    exit();
}
// Si pas de session, on continue (le frontend vérifier via JWT)
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
    <link href="assets/css/vente-details-modal.css" rel="stylesheet">

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
        
        /* Responsive table improvements */
        .table-responsive {
            border-radius: 6px;
            overflow-x: auto;
        }
        
        .table th {
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 0.5px;
        }
        
        .table td {
            vertical-align: middle;
            padding: 12px 8px;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
            .table {
                font-size: 0.80rem;
            }
            
            .table td, .table th {
                padding: 8px 4px;
            }
            
            .btn-sm {
                padding: 0.25rem 0.4rem;
                font-size: 0.7rem;
            }
            
            /* Hide less important columns on small screens */
            .table th:nth-child(6),
            .table td:nth-child(6) {
                display: none; /* Hide Payment Mode */
            }
            
            .table th:nth-child(7),
            .table td:nth-child(7) {
                display: none; /* Hide User */
            }
        }
        
        @media (max-width: 576px) {
            /* Hide even more columns on extra small screens */
            .table th:nth-child(4),
            .table td:nth-child(4) {
                display: none; /* Hide Quantity */
            }
        }
        
        /* Product display truncation */
        .product-column {
            max-width: 200px;
            white-space: normal;
            word-break: break-word;
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
                                <div class="avatar bg-black-10 rounded-circle d-flex align-items-center justify-content-center" style="width:72px;height:72px;">
                                    <i class="fas fa-cash-register fa-2x text-white"></i>
                                </div>
                            </div>
                            <div class="col">
                                <div class="d-flex align-items-center">
                                    <h2 class="mb-0 fw-bold me-3">POS - Point de Vente</h2>
                                    <div class="small text-white-75">Système de gestion des ventes</div>
                                </div>
                                <div class="mt-2 d-flex flex-wrap gap-2 align-items-center">
                                    <span class="badge bg-black bg-opacity-15 text-white">
                                        <i class="fas fa-store me-1"></i> 
                                        <span id="currentMagasinName">-</span>
                                    </span>
                                    <span class="badge bg-black bg-opacity-15 text-white"><i class="fas fa-shopping-cart me-1"></i> <span id="ventesToday">0</span> ventes</span>
                                    <span class="badge bg-black bg-opacity-15 text-white"><i class="fas fa-dollar-sign me-1"></i> <span id="totalVentes">0.00</span> USD</span>
                                </div>
                            </div>
                            <div class="col-auto text-end">
                                <div class="d-flex align-items-center gap-2">
                                    <!-- Sélecteur magasin -->
                                    <button class="btn btn-outline-light btn-sm" data-bs-toggle="modal" data-bs-target="#modalSelectMagasinVente">
                                        <i class="fas fa-store me-1"></i>
                                        <span id="magasinActuelTextVente">Sélectionner magasin</span>
                                    </button>
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
                                <div class="card-body p-2">
                                    <div id="produitsGridView" class="d-flex flex-column" style="max-height: 65vh; overflow: auto; border: 1px solid #e0e0e0; border-radius: 8px;">
                                        <div class="d-flex align-items-center justify-content-center" style="height: 400px;">
                                            <div class="text-center">
                                                <div class="spinner-border spinner-border-sm text-success mb-2" role="status"></div>
                                                <p class="text-muted small">Chargement des produits...</p>
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
                                <!-- 🪟 Sélection Guichet -->
                                <div class="mb-3 p-3 rounded" style="background: linear-gradient(135deg, #f7931e 0%, #ff6b35 100%); color: white;">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <small class="fw-semibold" style="opacity: 0.9; font-size: 0.75rem; text-transform: uppercase;">🪟 Guichet Sélectionné</small>
                                            <div id="guichetSelected" class="fw-bold" style="font-size: 1.1rem;">Chargement...</div>
                                            <small id="guichetVendeur" style="opacity: 0.85; font-size: 0.8rem;">--</small>
                                        </div>
                                        <button class="btn btn-sm btn-light" id="btnChangeGuichet" data-bs-toggle="modal" data-bs-target="#modalSelectGuichet" style="flex-shrink: 0;">
                                            <i class="fas fa-exchange-alt"></i>
                                        </button>
                                    </div>
                                </div>

                                <!-- Produit Selection avec background image en flou -->
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Produit Sélectionné</label>
                                    <div id="venteProduitSelected" class="position-relative rounded overflow-hidden mb-3" style="display: none; height: 300px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                                        <!-- Background image en flou -->
                                        <img id="venteProduitBgImage" src="" alt="" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; filter: blur(1px) brightness(0.35); z-index: 1;">
                                        
                                        <!-- Overlay dégradé -->
                                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, rgba(102, 126, 234, 0.85) 0%, rgba(118, 75, 162, 0.85) 100%); z-index: 1.5;"></div>
                                        
                                        <!-- Contenu overlay -->
                                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; display: flex; flex-direction: column; justify-content: space-between; padding: 14px;">
                                            <!-- Header: Nom + Bouton fermer -->
                                            <div class="d-flex justify-content-between align-items-start">
                                                <div style="flex-grow: 1; min-width: 0;">
                                                    <h5 class="mb-2 text-white fw-bold" id="venteProduitNom" style="font-size: 1.05rem; word-break: break-word; line-height: 1.3;">-</h5>
                                                </div>
                                                <button class="btn btn-sm btn-outline-light ms-2" onclick="venteManager.clearSelection()" style="flex-shrink: 0; opacity: 0.9;">
                                                    <i class="fas fa-times"></i>
                                                </button>
                                            </div>
                                            
                                            <!-- Infos: 2 colonnes (gauche: Magasin/Type/Rayon, droite: Unité/Stock) -->
                                            <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 12px;">
                                                <!-- Gauche: Magasin, Type, Rayon -->
                                                <div>
                                                    <div class="small" style="opacity: 0.8; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px;">🏪 Magasin</div>
                                                    <div id="venteProduitMagasin" class="fw-semibold" style="font-size: 0.85rem; line-height: 1.2;">-</div>
                                                    
                                                    <div class="small" style="opacity: 0.8; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 6px;">🏷️ Type</div>
                                                    <div id="venteProduitType" class="fw-semibold" style="font-size: 0.85rem;">-</div>
                                                    
                                                    <div class="small" style="opacity: 0.8; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 6px;">🏢 Rayon</div>
                                                    <div id="venteProduitRayon" class="fw-semibold" style="font-size: 0.85rem;">-</div>
                                                </div>
                                                
                                                <!-- Droite: Unité et Stock -->
                                                <div class="text-end">
                                                    <div class="small" style="opacity: 0.8; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px;">📏 Unité</div>
                                                    <div>
                                                        <span id="venteProduitUnite" class="badge bg-warning fw-bold" style="font-size: 0.6rem; padding: 4px 8px;">-</span>
                                                    </div>
                                                    <div class="small" style="opacity: 0.8; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 6px;">📦 Stock</div>
                                                    <div>
                                                        <span id="venteProduitStock" class="badge bg-success fw-bold" style="font-size: 0.9rem; padding: 4px 8px;">0</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <select id="venteSelectProduit" class="form-select form-select-sm" style="display: none;">
                                        <option value="">-- Cliquez sur un produit --</option>
                                    </select>
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
                                <div class="d-flex justify-content-between align-items-center">
                                    <h6 class="mb-0 fw-semibold">
                                        <i class="fas fa-history text-info me-2"></i>Historique des Ventes
                                    </h6>
                                    <!-- Loading Spinner -->
                                    <div id="ventesLoading" class="spinner-border spinner-border-sm text-info" role="status" style="display: none;">
                                        <span class="visually-hidden">Chargement...</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Search Bar -->
                            <div class="card-body p-3 border-bottom">
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-0">
                                        <i class="fas fa-search text-muted"></i>
                                    </span>
                                    <input 
                                        type="text" 
                                        id="ventesSearch" 
                                        class="form-control border-0 bg-light" 
                                        placeholder="Rechercher par magasin, produit, utilisateur..."
                                        autocomplete="off"
                                    >
                                </div>
                            </div>
                            
                            <!-- Table -->
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
                                
                                <!-- No Results Message -->
                                <div id="ventesNoResults" class="text-center text-muted py-4" style="display: none;">
                                    <i class="fas fa-search fa-2x mb-3 d-block text-secondary"></i>
                                    <p>Aucune vente trouvée. Essayez une autre recherche.</p>
                                </div>
                            </div>
                            
                            <!-- Pagination -->
                            <div class="card-footer bg-light p-3">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <small class="text-muted">
                                            Affichage <span id="ventesStart">0</span>-<span id="ventesEnd">0</span> 
                                            sur <span id="ventesTotal">0</span> vente(s)
                                        </small>
                                    </div>
                                    <nav>
                                        <ul class="pagination pagination-sm mb-0">
                                            <li class="page-item" id="ventes-prev">
                                                <a class="page-link" href="#" onclick="event.preventDefault(); venteManager.previousPage()">Précédent</a>
                                            </li>
                                            <li class="page-item active" id="ventes-page-info">
                                                <span class="page-link">Page <span id="ventesCurrentPage">1</span>/<span id="ventesTotalPages">1</span></span>
                                            </li>
                                            <li class="page-item" id="ventes-next">
                                                <a class="page-link" href="#" onclick="event.preventDefault(); venteManager.nextPage()">Suivant</a>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- 🏪 MODAL SÉLECTION MAGASIN VENTE -->
    <div class="modal fade" id="modalSelectMagasinVente" tabindex="-1" aria-labelledby="modalSelectMagasinVenteLabel" aria-hidden="true">
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
                    <div id="magasinsSpinnerVente" class="text-center py-5">
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="visually-hidden">Chargement...</span>
                        </div>
                        <p class="text-muted">Chargement des magasins...</p>
                    </div>

                    <!-- Liste des magasins -->
                    <div id="magasinsListVente" style="display: none;">
                        <!-- Sera rempli par JavaScript -->
                    </div>

                    <!-- Message d'erreur -->
                    <div id="magasinsErrorVente" style="display: none;" class="alert alert-danger mb-0"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- 🪟 MODAL SÉLECTION GUICHET VENTE -->
    <div class="modal fade" id="modalSelectGuichet" tabindex="-1" aria-labelledby="modalSelectGuichetLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content shadow-xl border-0">
                <div class="modal-header" style="background: linear-gradient(135deg, #f7931e 0%, #ff6b35 100%); color: white; border: none;">
                    <h5 class="modal-title">
                        <i class="fas fa-window-maximize me-2"></i>Sélectionner un guichet
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <!-- Spinner de chargement -->
                    <div id="guichetsSpinner" class="text-center py-5">
                        <div class="spinner-border text-warning mb-3" role="status">
                            <span class="visually-hidden">Chargement...</span>
                        </div>
                        <p class="text-muted">Chargement des guichets...</p>
                    </div>

                    <!-- Liste des guichets -->
                    <div id="guichetsList" style="display: none;">
                        <!-- Sera rempli par JavaScript -->
                    </div>

                    <!-- Message d'erreur -->
                    <div id="guichetsError" style="display: none;" class="alert alert-danger mb-0"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- 📋 MODAL DÉTAILS VENTE (Avancé) -->
    <div class="modal fade" id="modalDetailsVente" tabindex="-1" aria-labelledby="modalDetailsVenteLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content shadow-xl border-0">
                <!-- Header Gradient -->
                <div class="modal-header border-0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px;">
                    <div class="w-100">
                        <h5 class="modal-title mb-1" id="modalDetailsVenteLabel">
                            <i class="fas fa-receipt me-2"></i>Détails de la Vente
                        </h5>
                        <small id="venteNumero" style="opacity: 0.9;">Vente #...</small>
                    </div>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <!-- Spinner de Chargement -->
                <div id="venteLoadingSpinner" class="text-center py-5">
                    <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <p class="text-muted">Chargement des détails...</p>
                </div>

                <!-- Contenu Principal (caché au démarrage) -->
                <div id="venteDetailsContent" style="display: none;" class="modal-body">
                    <!-- 1️⃣ INFO VENDEUR -->
                    <div class="mb-4">
                        <h6 class="fw-bold text-primary mb-3">
                            <i class="fas fa-user me-2"></i>Information du Vendeur
                        </h6>
                        <div class="row g-3">
                            <div class="col-auto">
                                <img id="venteVendeurPhoto" src="https://via.placeholder.com/80" alt="Vendeur" 
                                    class="rounded-circle border border-3 border-primary" 
                                    style="width: 80px; height: 80px; object-fit: cover;">
                            </div>
                            <div class="col">
                                <div class="d-flex flex-column justify-content-center h-100">
                                    <h6 id="venteVendeurNom" class="mb-1 fw-bold">-</h6>
                                    <small id="venteVendeurRole" class="text-muted mb-2">-</small>
                                    <small id="venteVendeurEmail" class="text-muted">
                                        <i class="fas fa-envelope me-1"></i>
                                        <span>-</span>
                                    </small>
                                </div>
                            </div>
                            <div class="col-auto text-end">
                                <div class="badge bg-primary" id="venteVendeurRoleBadge">-</div>
                            </div>
                        </div>
                    </div>

                    <hr>

                    <!-- 2️⃣ INFO GUICHET & MAGASIN -->
                    <div class="mb-4">
                        <h6 class="fw-bold text-info mb-3">
                            <i class="fas fa-store me-2"></i>Magasin & Guichet
                        </h6>
                        <div class="row g-3">
                            <!-- Magasin -->
                            <div class="col-md-6">
                                <div class="card border-0 bg-light">
                                    <div class="card-body">
                                        <small class="text-muted fw-semibold">🏪 MAGASIN</small>
                                        <h6 id="venteMagasinNom" class="mb-1 text-black">-</h6>
                                        <small id="venteMagasinAdresse" class="text-muted">-</small>
                                        <br>
                                        <small id="venteMagasinEntreprise" class="text-muted d-block mt-2">
                                            <i class="fas fa-building me-1"></i><span>-</span>
                                        </small>
                                    </div>
                                </div>
                            </div>

                            <!-- Guichet -->
                            <div class="col-md-6">
                                <div class="card border-0" style="background: linear-gradient(135deg, #f7931e 0%, #ff6b35 100%); color: white;">
                                    <div class="card-body">
                                        <small class="fw-semibold" style="opacity: 0.9;">🪟 GUICHET</small>
                                        <h6 class="mb-1" id="venteGuichetNom">-</h6>
                                        <small style="opacity: 0.85;" id="venteGuichetCode">Code: -</small>
                                        <br>
                                        <small style="opacity: 0.85; display: block; margin-top: 8px;" id="venteGuichetVendeur">
                                            <i class="fas fa-user me-1"></i><span>-</span>
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr>

                    <!-- 3️⃣ ARTICLES VENDUS -->
                    <div class="mb-4">
                        <h6 class="fw-bold text-success mb-3">
                            <i class="fas fa-box me-2"></i>Articles Vendus
                        </h6>
                        <div id="venteArticlesList" class="list-group list-group-flush">
                            <!-- Sera rempli par JavaScript -->
                        </div>
                    </div>

                    <hr>

                    <!-- 4️⃣ MONTANTS & PAIEMENT -->
                    <div class="mb-4">
                        <h6 class="fw-bold text-warning mb-3">
                            <i class="fas fa-dollar-sign me-2"></i>Résumé Financier
                        </h6>
                        <div class="card border-0 bg-light">
                            <div class="card-body">
                                <!-- Montant USD -->
                                <div class="d-flex justify-content-between mb-2">
                                    <span class="text-black" >💵 Montant USD:</span>
                                    <span id="venteMontantUSD" class="fw-bold">-</span>
                                </div>

                                <!-- Montant FC (si applicable) -->
                                <div id="venteMontantFCDiv" class="d-flex text-black justify-content-between mb-2" style="display: none;">
                                    <span>🇨🇩 Montant FC:</span>
                                    <span id="venteMontantFC" class="fw-bold text-info">-</span>
                                </div>

                                <!-- Taux -->
                                <div id="venteTauxDiv" class="d-flex justify-content-between mb-2 small text-muted" style="display: none;">
                                    <span>Taux FC/USD:</span>
                                    <span id="venteTaux">-</span>
                                </div>

                                <hr class="my-2">

                                <!-- Mode de Paiement -->
                                <div class="d-flex text-black justify-content-between">
                                    <span>Mode de Paiement:</span>
                                    <span id="venteModePaiement" class="badge bg-success">-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr>

                    <!-- 5️⃣ INFOS SUPPLÉMENTAIRES -->
                    <div class="mb-4">
                        <h6 class="fw-bold text-secondary mb-3">
                            <i class="fas fa-info-circle me-2"></i>Informations Supplémentaires
                        </h6>
                        <div class="row g-3">
                            <!-- Date -->
                            <div class="col-md-6">
                                <small class="text-muted fw-semibold">📅 DATE & HEURE</small>
                                <p id="venteDateHeure" class="mb-0 fw-semibold">-</p>
                            </div>

                            <!-- Statut -->
                            <div class="col-md-6">
                                <small class="text-muted fw-semibold">📊 STATUT</small>
                                <p class="mb-0">
                                    <span id="venteStatut" class="badge bg-secondary">-</span>
                                </p>
                            </div>

                            <!-- Client -->
                            <div class="col-md-6">
                                <small class="text-muted fw-semibold">👥 CLIENT</small>
                                <p id="venteClientModal" class="mb-0 fw-semibold">-</p>
                            </div>

                            <!-- Quantité -->
                            <div class="col-md-6">
                                <small class="text-muted fw-semibold">📦 QTÉ TOTALE</small>
                                <p id="venteQteTotale" class="mb-0 fw-semibold">-</p>
                            </div>
                        </div>

                        <!-- Observations -->
                        <div class="mt-3">
                            <small class="text-muted fw-semibold">📝 OBSERVATIONS</small>
                            <div id="venteObservations" class="card border-0 bg-light p-2 mt-1" style="font-size: 0.9rem;">
                                -
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer avec boutons d'action -->
                <div class="modal-footer  bg-light">
                    <button type="button" class="btn btn-outline-secondary btn-sm" id="btnPrinterVente">
                        <i class="fas fa-print me-1"></i>Imprimer
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm" id="btnAnnulerVente">
                        <i class="fas fa-times me-1"></i>Annuler
                    </button>
                    <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal">
                        <i class="fas fa-check me-1"></i>Fermer
                    </button>
                </div>

                <!-- Message d'Erreur -->
                <div id="venteErrorMessage" class="modal-body" style="display: none;">
                    <div class="alert alert-danger mb-0">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        <span id="venteErrorText">Une erreur est survenue</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

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
    <script src="assets/js/vente.js?v=<?php echo time(); ?>"></script>
</body>
</html>
