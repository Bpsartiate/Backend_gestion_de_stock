<?php
require_once __DIR__ . '/../../includes/auth-init.php';

// Vérifier que l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    header('Location: /login.php');
    exit;
}

$title = 'Gestion des Commandes';
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $title ?> - Gestion de Stock</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8f9fa;
        }
        .card {
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border: none;
        }
        .btn-group-sm .btn {
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
        }
        .statut-badge {
            font-size: 0.85rem;
            padding: 0.4rem 0.8rem;
        }
        .tabs-container {
            margin-bottom: 30px;
        }
        .tab-content {
            background: white;
            padding: 20px;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <!-- Include Sidebar & Topbar -->
    <?php include __DIR__ . '/../../sidebar.php'; ?>
    <?php include __DIR__ . '/../../topbar.php'; ?>

    <main style="margin-left: 250px; padding: 20px;">
        <div class="container-fluid">
            <!-- Header -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="h3">
                        <i class="fas fa-boxes text-primary me-2"></i>
                        Gestion des Commandes
                    </h1>
                    <p class="text-muted mb-0">Gérez les commandes de produits</p>
                </div>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#newCommandeModal">
                    <i class="fas fa-plus me-2"></i>Nouvelle Commande
                </button>
            </div>

            <!-- Tabs Navigation -->
            <div class="tabs-container">
                <ul class="nav nav-tabs" id="commandeTabs">
                    <li class="nav-item">
                        <a class="nav-link active" href="#tab-all" data-bs-toggle="tab">
                            <i class="fas fa-list me-2"></i>Toutes les Commandes
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#tab-attente" data-bs-toggle="tab">
                            <i class="fas fa-clock me-2"></i>En Attente
                            <span class="badge bg-warning ms-2" id="badge-attente">0</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#tab-expedie" data-bs-toggle="tab">
                            <i class="fas fa-truck me-2"></i>Expédiées
                            <span class="badge bg-info ms-2" id="badge-expedie">0</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#tab-recue" data-bs-toggle="tab">
                            <i class="fas fa-check-circle me-2"></i>Reçues
                            <span class="badge bg-success ms-2" id="badge-recue">0</span>
                        </a>
                    </li>
                </ul>
            </div>

            <!-- Tab Content -->
            <div class="tab-content">
                <div class="tab-pane fade show active" id="tab-all">
                    <div id="commandes-all-container" class="loading">
                        <div class="text-center py-5">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Chargement...</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="tab-attente">
                    <div id="commandes-attente-container"></div>
                </div>

                <div class="tab-pane fade" id="tab-expedie">
                    <div id="commandes-expedie-container"></div>
                </div>

                <div class="tab-pane fade" id="tab-recue">
                    <div id="commandes-recue-container"></div>
                </div>
            </div>
        </div>
    </main>

    <!-- Modal: Nouvelle Commande -->
    <div class="modal fade" id="newCommandeModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Nouvelle Commande</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div id="produit-select-container" class="mb-3">
                        <label class="form-label">Sélectionner un produit:</label>
                        <select class="form-select" id="produit-select">
                            <option selected disabled>Choisir un produit...</option>
                        </select>
                        <small class="text-muted d-block mt-1">
                            Ou <a href="/pages/stock/add_prod.php" target="_blank">créer un nouveau produit</a>
                        </small>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Quantité à commander:</label>
                            <input type="number" class="form-control" id="qte-commandee" min="1" value="1">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Prix unitaire:</label>
                            <input type="number" class="form-control" id="prix-unitaire" min="0" step="0.01" value="0">
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Fournisseur:</label>
                        <input type="text" class="form-control" id="fournisseur" placeholder="Nom du fournisseur">
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Date de livraison attendue:</label>
                        <input type="date" class="form-control" id="date-echeance">
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Notes (optionnel):</label>
                        <textarea class="form-control" id="notes-commande" rows="3" placeholder="Notes sur la commande..."></textarea>
                    </div>

                    <div class="alert alert-info">
                        <strong>Prix Total:</strong> <span id="prix-total">0.00</span> USD
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button type="button" class="btn btn-primary" id="btn-create-commande">Créer Commande</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Container pour les modals dynamiques -->
    <div id="modals-container"></div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="/assets/js/commande.js"></script>
    <script>
        // Token JWT
        const TOKEN = localStorage.getItem('token');
        const API_BASE = '/api/protected';

        // Récupérer le magasinId depuis sessionStorage/localStorage
        let MAGASIN_ID = localStorage.getItem('venteSelectedMagasin') || sessionStorage.getItem('magasinId');

        // Instance du CommandeManager
        let commandeManager;

        /**
         * 🔧 Initialize
         */
        async function init() {
            if (!MAGASIN_ID) {
                alert('❌ Magasin non sélectionné');
                return;
            }

            commandeManager = new CommandeManager(MAGASIN_ID);
            
            // Charger les commandes
            await loadCommandes();
            
            // Charger les produits pour le select
            await loadProduitsSelect();
            
            // Attacher les event listeners
            attachEventListeners();
        }

        /**
         * 📋 Charger les commandes
         */
        async function loadCommandes() {
            try {
                await commandeManager.loadCommandes();
                
                // Afficher par tab
                displayCommandesByStatus();
                
                // Mettre à jour les badges
                updateBadges();
            } catch (error) {
                console.error('Error loading commandes:', error);
                document.getElementById('commandes-all-container').innerHTML = 
                    '<div class="alert alert-danger">Erreur chargement des commandes</div>';
            }
        }

        /**
         * 📊 Afficher par statut
         */
        function displayCommandesByStatus() {
            // Toutes
            commandeManager.displayCommandes('commandes-all-container');
            
            // En attente
            const qtyAttente = commandeManager.commandes.filter(c => c.statut === 'EN_ATTENTE').length;
            if (qtyAttente > 0) {
                const filtered = { statut: 'EN_ATTENTE' };
                const clone = {...commandeManager};
                clone.commandes = commandeManager.commandes.filter(c => c.statut === 'EN_ATTENTE');
                commandeManager.displayCommandes('commandes-attente-container');
            } else {
                document.getElementById('commandes-attente-container').innerHTML = 
                    '<p class="text-muted text-center py-5">Aucune commande en attente</p>';
            }

            // Expédiées
            const qtyExpediee = commandeManager.commandes.filter(c => c.statut === 'EXPEDIÉE').length;
            if (qtyExpediee > 0) {
                const filtered = { statut: 'EXPEDIÉE' };
                commandeManager.displayCommandes('commandes-expedie-container');
            } else {
                document.getElementById('commandes-expedie-container').innerHTML = 
                    '<p class="text-muted text-center py-5">Aucune commande expédiée</p>';
            }

            // Reçues
            const qtyRecue = commandeManager.commandes.filter(c => 
                c.statut === 'REÇUE_PARTIELLEMENT' || c.statut === 'REÇUE_COMPLÈTEMENT'
            ).length;
            if (qtyRecue > 0) {
                commandeManager.displayCommandes('commandes-recue-container');
            } else {
                document.getElementById('commandes-recue-container').innerHTML = 
                    '<p class="text-muted text-center py-5">Aucune commande reçue</p>';
            }
        }

        /**
         * 🏷️ Mettre à jour les badges
         */
        function updateBadges() {
            document.getElementById('badge-attente').textContent = 
                commandeManager.commandes.filter(c => c.statut === 'EN_ATTENTE').length;
            document.getElementById('badge-expedie').textContent = 
                commandeManager.commandes.filter(c => c.statut === 'EXPEDIÉE').length;
            document.getElementById('badge-recue').textContent = 
                commandeManager.commandes.filter(c => 
                    c.statut === 'REÇUE_PARTIELLEMENT' || c.statut === 'REÇUE_COMPLÈTEMENT'
                ).length;
        }

        /**
         * 📦 Charger produits pour select
         */
        async function loadProduitsSelect() {
            try {
                const response = await fetch(`${API_BASE}/produits?magasinId=${MAGASIN_ID}`, {
                    headers: { 'Authorization': `Bearer ${TOKEN}` }
                });

                if (!response.ok) throw new Error('Erreur chargement produits');

                const data = await response.json();
                const select = document.getElementById('produit-select');
                
                data.produits.forEach(produit => {
                    const option = document.createElement('option');
                    option.value = produit._id;
                    option.textContent = `${produit.designation} (${produit.reference})`;
                    select.appendChild(option);
                });

                // Event: prix unitaire auto-fill
                select.addEventListener('change', (e) => {
                    const produit = data.produits.find(p => p._id === e.target.value);
                    if (produit) {
                        document.getElementById('prix-unitaire').value = produit.prixUnitaire || 0;
                        updatePrixTotal();
                    }
                });
            } catch (error) {
                console.error('Error loading produits:', error);
            }
        }

        /**
         * 💰 Calculer prix total
         */
        function updatePrixTotal() {
            const qte = parseInt(document.getElementById('qte-commandee').value) || 0;
            const prix = parseFloat(document.getElementById('prix-unitaire').value) || 0;
            const total = (qte * prix).toFixed(2);
            document.getElementById('prix-total').textContent = total;
        }

        /**
         * 🔌 Event Listeners
         */
        function attachEventListeners() {
            // Mise à jour prix total
            document.getElementById('qte-commandee').addEventListener('change', updatePrixTotal);
            document.getElementById('prix-unitaire').addEventListener('change', updatePrixTotal);

            // Créer commande
            document.getElementById('btn-create-commande').addEventListener('click', async () => {
                await createNewCommande();
            });
        }

        /**
         * ✨ Créer nouvelle commande
         */
        async function createNewCommande() {
            const produitId = document.getElementById('produit-select').value;
            const qte = document.getElementById('qte-commandee').value;
            const prix = document.getElementById('prix-unitaire').value;
            const fournisseur = document.getElementById('fournisseur').value;
            const dateEcheance = document.getElementById('date-echeance').value;
            const notes = document.getElementById('notes-commande').value;

            if (!produitId || !qte || !prix) {
                alert('⚠️ Remplissez tous les champs requis');
                return;
            }

            try {
                const btn = document.getElementById('btn-create-commande');
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Création...';

                await commandeManager.createCommande({
                    produitId,
                    quantiteCommandee: qte,
                    prixUnitaire: prix,
                    fournisseur,
                    dateEcheance,
                    notes
                });

                // Reset form
                document.getElementById('newCommandeModal').querySelectorAll('input, textarea').forEach(el => el.value = '');
                
                // Fermer modal
                bootstrap.Modal.getInstance(document.getElementById('newCommandeModal')).hide();

                // Recharger
                await loadCommandes();

                // Toast success
                showToast('✅ Commande créée avec succès!', 'success');
            } catch (error) {
                showToast(`❌ Erreur: ${error.message}`, 'danger');
            } finally {
                const btn = document.getElementById('btn-create-commande');
                btn.disabled = false;
                btn.innerHTML = 'Créer Commande';
            }
        }

        /**
         * 🔔 Toast notifications
         */
        function showToast(message, type = 'info') {
            const toastId = `toast-${Date.now()}`;
            const bgClass = `bg-${type}`;
            const toastHtml = `
                <div id="${toastId}" class="toast align-items-center border-0" role="alert">
                    <div class="d-flex ${bgClass} text-white">
                        <div class="toast-body">${message}</div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                    </div>
                </div>
            `;

            const container = document.body;
            container.insertAdjacentHTML('beforeend', toastHtml);

            const toastElement = document.getElementById(toastId);
            const toast = new bootstrap.Toast(toastElement);
            toast.show();

            setTimeout(() => toastElement.remove(), 3000);
        }

        // 🚀 Initialize
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>
