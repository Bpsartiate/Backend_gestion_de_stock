<?php include_once "../includes/auth-init.php"; ?>


<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Évaluation des Fournisseurs</title>
    
    <!-- ✅ Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- ✅ DataTables CSS -->
    <link href="https://cdn.datatables.net/1.13.4/css/dataTables.bootstrap5.min.css" rel="stylesheet">
    
    <!-- ✅ Charts.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    
    <!-- ✅ Font Awesome Icons -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    
    <!-- ✅ Custom Styles -->
    <style>
        :root {
            --excellent: #28a745;
            --bon: #17a2b8;
            --acceptable: #ffc107;
            --mediocre: #fd7e14;
            --mauvais: #dc3545;
        }

        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .card {
            border: none;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .page-header {
            background: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .rating-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            color: white;
            font-size: 0.9rem;
        }

        .rating-excellent { background-color: var(--excellent); }
        .rating-bon { background-color: var(--bon); }
        .rating-acceptable { background-color: var(--acceptable); color: #333; }
        .rating-mediocre { background-color: var(--mediocre); }
        .rating-mauvais { background-color: var(--mauvais); }

        .score-circle {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: bold;
            color: white;
            position: relative;
        }

        .score-circle.excellent { background: linear-gradient(135deg, var(--excellent) 0%, #20c997 100%); }
        .score-circle.bon { background: linear-gradient(135deg, var(--bon) 0%, #39f 100%); }
        .score-circle.acceptable { background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); }
        .score-circle.mediocre { background: linear-gradient(135deg, var(--mediocre) 0%, #f67280 100%); }
        .score-circle.mauvais { background: linear-gradient(135deg, var(--mauvais) 0%, #c0392b 100%); }

        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .stat-card h6 {
            color: #666;
            font-size: 0.85rem;
            text-transform: uppercase;
            margin-bottom: 10px;
        }

        .stat-card .value {
            font-size: 28px;
            font-weight: bold;
            color: #333;
        }

        .progress-bar-custom {
            height: 8px;
            border-radius: 4px;
        }

        .recommendation {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 500;
        }

        .rec-continuer { background: #d4edda; color: #155724; }
        .rec-surveiller { background: #cfe2ff; color: #084298; }
        .rec-ameliorer { background: #fff3cd; color: #664d03; }
        .rec-reduire { background: #f8d7da; color: #842029; }
        .rec-arreter { background: #f5c2c7; color: #842029; }

        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 400px;
        }

        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255, 255, 255, 0.3);
            border-top: 5px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .tabs-container {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .nav-pills .nav-link {
            color: #666;
            border-radius: 8px;
            margin-right: 10px;
            transition: all 0.3s ease;
        }

        .nav-pills .nav-link.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .chart-container {
            position: relative;
            height: 300px;
            margin-bottom: 30px;
        }

        table.dataTable thead th {
            background: #f8f9fa;
            color: #333;
            font-weight: 600;
            border-bottom: 2px solid #dee2e6;
            padding: 15px;
        }

        table.dataTable tbody td {
            padding: 15px;
            vertical-align: middle;
        }

        table.dataTable tbody tr:hover {
            background: rgba(102, 126, 234, 0.05);
        }

        .action-buttons {
            display: flex;
            gap: 8px;
        }

        .action-btn {
            padding: 6px 12px;
            font-size: 0.85rem;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .action-btn:hover {
            transform: translateY(-2px);
        }

        .modal-content {
            border-radius: 12px;
            border: none;
        }

        .modal-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px 12px 0 0;
        }

        .modal-header .btn-close {
            filter: brightness(0) invert(1);
        }

        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        }

        .alert-toast {
            border-radius: 8px;
            border: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container-fluid p-4">
        <!-- 📊 PAGE HEADER -->
        <div class="page-header">
            <div class="row align-items-center">
                <div class="col">
                    <h1 class="mb-2">
                        <i class="fas fa-star"></i> Évaluation des Fournisseurs
                    </h1>
                    <p class="text-muted mb-0">Suivez les performances et évaluez la qualité de vos fournisseurs</p>
                </div>
                <div class="col-auto">
                    <button class="btn btn-outline-primary" id="refreshBtn">
                        <i class="fas fa-sync-alt"></i> Actualiser
                    </button>
                </div>
            </div>
        </div>

        <!-- 📈 STATISTICS CARDS -->
        <div class="row mb-4" id="statsContainer">
            <div class="col-md-3">
                <div class="stat-card">
                    <h6>Total Évaluations</h6>
                    <div class="value" id="totalEvals">-</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <h6>Score Moyen</h6>
                    <div class="value" id="avgScore">-</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <h6>Fournisseurs</h6>
                    <div class="value" id="totalSuppliers">-</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <h6>Excellents</h6>
                    <div class="value text-success" id="excellentCount">-</div>
                </div>
            </div>
        </div>

        <!-- 🔖 TABS -->
        <div class="tabs-container">
            <ul class="nav nav-pills mb-4" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="ranking-tab" data-bs-toggle="tab" data-bs-target="#ranking" type="button">
                        <i class="fas fa-ranking-star"></i> Classement
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="details-tab" data-bs-toggle="tab" data-bs-target="#details" type="button">
                        <i class="fas fa-list-check"></i> Détails
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="charts-tab" data-bs-toggle="tab" data-bs-target="#charts" type="button">
                        <i class="fas fa-chart-bar"></i> Analyse
                    </button>
                </li>
            </ul>

            <div class="tab-content">
                <!-- 🏆 RANKING TAB -->
                <div class="tab-pane fade show active" id="ranking">
                    <div class="loading" id="rankingLoading">
                        <div class="loading-spinner"></div>
                    </div>
                    <div id="rankingContent" style="display: none;">
                        <table class="table table-hover" id="rankingTable">
                            <thead>
                                <tr>
                                    <th>Position</th>
                                    <th>Fournisseur</th>
                                    <th>Score</th>
                                    <th>Évaluation</th>
                                    <th>Recommandation</th>
                                    <th>Évaluations</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="rankingBody">
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 📋 DETAILS TAB -->
                <div class="tab-pane fade" id="details">
                    <div class="loading" id="detailsLoading">
                        <div class="loading-spinner"></div>
                    </div>
                    <div id="detailsContent" style="display: none;">
                        <table class="table table-hover" id="detailsTable">
                            <thead>
                                <tr>
                                    <th>Produit</th>
                                    <th>Fournisseur</th>
                                    <th>Qté Prévue</th>
                                    <th>Qté Reçue</th>
                                    <th>État</th>
                                    <th>Délai (j)</th>
                                    <th>Score</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="detailsBody">
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 📊 CHARTS TAB -->
                <div class="tab-pane fade" id="charts">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-body">
                                    <h6 class="card-title">Distribution des Évaluations</h6>
                                    <div class="chart-container">
                                        <canvas id="evaluationChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-body">
                                    <h6 class="card-title">Score Moyen par Catégorie</h6>
                                    <div class="chart-container">
                                        <canvas id="categoryChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-body">
                                    <h6 class="card-title">Recommandations Principales</h6>
                                    <div class="chart-container">
                                        <canvas id="recommendationChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 🔍 DETAIL MODAL -->
    <div class="modal fade" id="detailModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Détails de l'Évaluation</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="detailModalBody">
                    <!-- Dynamically filled -->
                </div>
            </div>
        </div>
    </div>

    <!-- 📢 TOAST CONTAINER -->
    <div class="toast-container" id="toastContainer"></div>

    <!-- ✅ Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.4/js/dataTables.bootstrap5.min.js"></script>

    <script>
        const API_URL = '<?php echo str_replace('/index.php', '', $_SERVER['PHP_SELF']); ?>';
        const MAGASIN_ID = '<?php echo $magasinId; ?>';
        const BASE_URL = '<?php echo $baseUrl; ?>';

        // 📊 Global Charts
        let evaluationChart = null;
        let categoryChart = null;
        let recommendationChart = null;

        // 🎯 Initialiser la page
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 Page fournisseurs chargée');
            console.log('MAGASIN_ID:', MAGASIN_ID);
            console.log('BASE_URL:', BASE_URL);

            if (MAGASIN_ID) {
                loadSupplierRanking();
                loadSupplierStats();
                loadDetailedRatings();
            } else {
                showAlert('Veuillez sélectionner un magasin', 'warning');
            }
        });

        // 🔄 Refresh button
        document.getElementById('refreshBtn').addEventListener('click', function() {
            location.reload();
        });

        // 📊 Charger le classement des fournisseurs
        function loadSupplierRanking() {
            fetch(`${BASE_URL}/api/protected/fournisseur-ranking?magasinId=${MAGASIN_ID}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.ranking) {
                    renderRanking(data.ranking);
                } else {
                    showAlert('Erreur au chargement du classement', 'danger');
                }
                document.getElementById('rankingLoading').style.display = 'none';
                document.getElementById('rankingContent').style.display = 'block';
            })
            .catch(err => {
                console.error('❌ Ranking error:', err);
                showAlert('Erreur réseau', 'danger');
                document.getElementById('rankingLoading').style.display = 'none';
            });
        }

        // 🏆 Rendu du classement
        function renderRanking(ranking) {
            const tbody = document.getElementById('rankingBody');
            tbody.innerHTML = '';

            ranking.forEach((supplier, index) => {
                const score = Math.round(supplier.scoreMoyen);
                const evaluation = getEvaluation(score);
                const evaluationClass = evaluation.toLowerCase().replace(/\s+/g, '-');

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <span class="badge bg-primary">#${index + 1}</span>
                    </td>
                    <td><strong>${supplier._id}</strong></td>
                    <td>
                        <div class="score-circle ${evaluationClass}">
                            ${score}
                        </div>
                    </td>
                    <td>
                        <span class="rating-badge rating-${evaluationClass}">
                            ${evaluation}
                        </span>
                    </td>
                    <td>
                        <span class="recommendation rec-${supplier.recommendationPrincipal?.toLowerCase().replace(/\s+/g, '-')}">
                            ${supplier.recommendationPrincipal}
                        </span>
                    </td>
                    <td><strong>${supplier.totalEvaluations}</strong></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="viewSupplierDetails('${supplier._id}')">
                            <i class="fas fa-eye"></i> Voir
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        // 📊 Charger les statistiques
        function loadSupplierStats() {
            fetch(`${BASE_URL}/api/protected/fournisseur-stats?magasinId=${MAGASIN_ID}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.stats) {
                    const stats = data.stats;
                    document.getElementById('totalEvals').textContent = stats.totalEvaluations;
                    document.getElementById('avgScore').textContent = stats.scoreMoyen;
                    
                    // Compter les excellents
                    document.getElementById('excellentCount').textContent = 
                        stats.evaluations['Excellent'] || 0;

                    // Compter les fournisseurs uniques
                    const suppliers = new Set(data.ratings.map(r => r.fournisseur));
                    document.getElementById('totalSuppliers').textContent = suppliers.size;

                    // Charger les charts
                    renderCharts(stats);
                }
            })
            .catch(err => console.error('❌ Stats error:', err));
        }

        // 📈 Charger les détails
        function loadDetailedRatings() {
            fetch(`${BASE_URL}/api/protected/fournisseur-stats?magasinId=${MAGASIN_ID}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.ratings) {
                    renderDetails(data.ratings);
                }
                document.getElementById('detailsLoading').style.display = 'none';
                document.getElementById('detailsContent').style.display = 'block';
            })
            .catch(err => {
                console.error('❌ Details error:', err);
                document.getElementById('detailsLoading').style.display = 'none';
            });
        }

        // 📋 Rendu des détails
        function renderDetails(ratings) {
            const tbody = document.getElementById('detailsBody');
            tbody.innerHTML = '';

            ratings.forEach(rating => {
                const etatClass = rating.etatConforme ? 'text-success' : 'text-danger';
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${rating.produitId?.designation || 'N/A'}</td>
                    <td>${rating.fournisseur}</td>
                    <td>${rating.quantitePrevue}</td>
                    <td>
                        <strong class="${rating.quantiteRecue >= rating.quantitePrevue ? 'text-success' : 'text-warning'}">
                            ${rating.quantiteRecue}
                        </strong>
                    </td>
                    <td>
                        <span class="${etatClass}">
                            ${rating.etatReel} <i class="${rating.etatConforme ? 'fas fa-check' : 'fas fa-times'}"></i>
                        </span>
                    </td>
                    <td>
                        <span class="${rating.differenceDelai > 0 ? 'text-danger' : 'text-success'}">
                            ${rating.delaiReel} <small>(${rating.delaiPrevu} prévu)</small>
                        </span>
                    </td>
                    <td>
                        <strong>${rating.scoreFinal}/100</strong>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-info" onclick="viewRatingDetail('${rating._id}')">
                            <i class="fas fa-info-circle"></i> Détail
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Initialiser DataTable
            if ($.fn.dataTable.isDataTable('#detailsTable')) {
                $('#detailsTable').DataTable().destroy();
            }
            $('#detailsTable').DataTable({
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/fr-FR.json'
                },
                pageLength: 10
            });
        }

        // 📊 Rendre les charts
        function renderCharts(stats) {
            // Chart 1: Distribution des évaluations
            const evalCtx = document.getElementById('evaluationChart').getContext('2d');
            evaluationChart = new Chart(evalCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Excellent', 'Bon', 'Acceptable', 'Médiocre', 'Mauvais'],
                    datasets: [{
                        data: [
                            stats.evaluations['Excellent'] || 0,
                            stats.evaluations['Bon'] || 0,
                            stats.evaluations['Acceptable'] || 0,
                            stats.evaluations['Médiocre'] || 0,
                            stats.evaluations['Mauvais'] || 0
                        ],
                        backgroundColor: [
                            'var(--excellent)',
                            'var(--bon)',
                            'var(--acceptable)',
                            'var(--mediocre)',
                            'var(--mauvais)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });

            // Chart 2: Score par catégorie
            const catCtx = document.getElementById('categoryChart').getContext('2d');
            categoryChart = new Chart(catCtx, {
                type: 'bar',
                data: {
                    labels: ['Quantité', 'Délai', 'Qualité', 'Conformité'],
                    datasets: [{
                        label: 'Score Moyen',
                        data: [
                            stats.scoreMoyenParCategorie.quantite,
                            stats.scoreMoyenParCategorie.delai,
                            stats.scoreMoyenParCategorie.qualite,
                            stats.scoreMoyenParCategorie.conformite
                        ],
                        backgroundColor: 'rgba(102, 126, 234, 0.6)',
                        borderColor: 'rgba(102, 126, 234, 1)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { max: 30 }
                    }
                }
            });

            // Chart 3: Recommandations
            const recCtx = document.getElementById('recommendationChart').getContext('2d');
            recommendationChart = new Chart(recCtx, {
                type: 'bar',
                data: {
                    labels: ['Continuer', 'Surveiller', 'Améliorer', 'Réduire', 'Arrêter'],
                    datasets: [{
                        label: 'Nombre de Fournisseurs',
                        data: [
                            stats.recommandations['Continuer'] || 0,
                            stats.recommandations['Surveiller'] || 0,
                            stats.recommandations['Améliorer'] || 0,
                            stats.recommandations['Réduire'] || 0,
                            stats.recommandations['Arrêter'] || 0
                        ],
                        backgroundColor: [
                            '#28a745',
                            '#17a2b8',
                            '#ffc107',
                            '#fd7e14',
                            '#dc3545'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y'
                }
            });
        }

        // 🔍 Voir les détails d'un fournisseur
        function viewSupplierDetails(supplier) {
            fetch(`${BASE_URL}/api/protected/fournisseur-stats?magasinId=${MAGASIN_ID}&fournisseur=${supplier}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.stats) {
                    const stats = data.stats;
                    const score = Math.round(stats.scoreMoyen);
                    const evaluation = getEvaluation(score);
                    
                    const html = `
                        <div class="text-center mb-4">
                            <h6 class="text-muted">${supplier}</h6>
                            <div class="score-circle ${evaluation.toLowerCase().replace(/\s+/g, '-')}" 
                                 style="margin: 20px auto;">
                                ${score}
                            </div>
                            <span class="rating-badge rating-${evaluation.toLowerCase().replace(/\s+/g, '-')}">
                                ${evaluation}
                            </span>
                        </div>

                        <div class="row">
                            <div class="col-6">
                                <h6>Quantité <i class="fas fa-box"></i></h6>
                                <div class="progress mb-3">
                                    <div class="progress-bar" style="width: ${stats.scoreMoyenParCategorie.quantite}%"></div>
                                </div>
                                <small>${stats.scoreMoyenParCategorie.quantite}/30</small>
                            </div>
                            <div class="col-6">
                                <h6>Délai <i class="fas fa-clock"></i></h6>
                                <div class="progress mb-3">
                                    <div class="progress-bar" style="width: ${stats.scoreMoyenParCategorie.delai}%"></div>
                                </div>
                                <small>${stats.scoreMoyenParCategorie.delai}/25</small>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-6">
                                <h6>Qualité <i class="fas fa-star"></i></h6>
                                <div class="progress mb-3">
                                    <div class="progress-bar" style="width: ${stats.scoreMoyenParCategorie.qualite}%"></div>
                                </div>
                                <small>${stats.scoreMoyenParCategorie.qualite}/25</small>
                            </div>
                            <div class="col-6">
                                <h6>Conformité <i class="fas fa-check"></i></h6>
                                <div class="progress mb-3">
                                    <div class="progress-bar" style="width: ${stats.scoreMoyenParCategorie.conformite}%"></div>
                                </div>
                                <small>${stats.scoreMoyenParCategorie.conformite}/20</small>
                            </div>
                        </div>

                        <hr>

                        <div class="row">
                            <div class="col-6 text-center">
                                <strong>${stats.totalEvaluations}</strong>
                                <br><small class="text-muted">Évaluations</small>
                            </div>
                            <div class="col-6 text-center">
                                <span class="recommendation rec-${stats.evaluations[Object.keys(stats.evaluations)[0]]?.toLowerCase().replace(/\s+/g, '-')}">
                                    Recommandation
                                </span>
                            </div>
                        </div>
                    `;

                    document.getElementById('detailModalBody').innerHTML = html;
                    new bootstrap.Modal(document.getElementById('detailModal')).show();
                }
            });
        }

        // 🔍 Voir les détails d'une évaluation
        function viewRatingDetail(ratingId) {
            fetch(`${BASE_URL}/api/protected/fournisseur-rating/${ratingId}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.rating) {
                    const rating = data.rating;
                    const etatClass = rating.etatConforme ? 'success' : 'danger';

                    const html = `
                        <div class="mb-4">
                            <h6>${rating.fournisseur}</h6>
                            <small class="text-muted">${new Date(rating.dateReceptionReelle).toLocaleDateString('fr-FR')}</small>
                        </div>

                        <div class="row mb-4">
                            <div class="col-6">
                                <strong>Quantité</strong>
                                <div class="text-muted">
                                    Prévue: ${rating.quantitePrevue}
                                    <br>Reçue: <strong>${rating.quantiteRecue}</strong>
                                    <br><small class="text-danger">Diff: ${rating.differenceQuantite}</small>
                                </div>
                            </div>
                            <div class="col-6">
                                <strong>Délai</strong>
                                <div class="text-muted">
                                    Prévu: ${rating.delaiPrevu}j
                                    <br>Réel: <strong>${rating.delaiReel}j</strong>
                                    <br><small class="${rating.differenceDelai > 0 ? 'text-danger' : 'text-success'}">
                                        ${rating.differenceDelai > 0 ? '+' : ''}${rating.differenceDelai}j
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div class="row mb-4">
                            <div class="col-6">
                                <strong>État du Produit</strong>
                                <div class="text-muted">
                                    Prévu: ${rating.etatPrevu}
                                    <br>Reçu: <strong>${rating.etatReel}</strong>
                                    <br><span class="text-${etatClass}">
                                        ${rating.etatConforme ? '✓ Conforme' : '✗ Non-Conforme'}
                                    </span>
                                </div>
                            </div>
                            <div class="col-6">
                                <strong>Score Final</strong>
                                <div style="text-align: center; margin-top: 10px;">
                                    <div class="score-circle ${rating.evaluation.toLowerCase().replace(/\s+/g, '-')}" 
                                         style="width: 80px; height: 80px; margin: 0 auto;">
                                        ${rating.scoreFinal}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr>

                        <h6>Détails du Scoring</h6>
                        <div class="row">
                            <div class="col-6">
                                <div class="mb-2">
                                    <small class="text-muted">Quantité</small>
                                    <div class="progress" style="height: 6px;">
                                        <div class="progress-bar" style="width: ${(rating.scoreQuantite/30)*100}%"></div>
                                    </div>
                                    <small>${rating.scoreQuantite}/30 pts</small>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="mb-2">
                                    <small class="text-muted">Délai</small>
                                    <div class="progress" style="height: 6px;">
                                        <div class="progress-bar" style="width: ${(rating.scoreDelai/25)*100}%"></div>
                                    </div>
                                    <small>${rating.scoreDelai}/25 pts</small>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-6">
                                <div class="mb-2">
                                    <small class="text-muted">Qualité</small>
                                    <div class="progress" style="height: 6px;">
                                        <div class="progress-bar" style="width: ${(rating.scoreQualite/25)*100}%"></div>
                                    </div>
                                    <small>${rating.scoreQualite}/25 pts</small>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="mb-2">
                                    <small class="text-muted">Conformité</small>
                                    <div class="progress" style="height: 6px;">
                                        <div class="progress-bar" style="width: ${(rating.scoreConformite/20)*100}%"></div>
                                    </div>
                                    <small>${rating.scoreConformite}/20 pts</small>
                                </div>
                            </div>
                        </div>

                        ${rating.problemes && rating.problemes.length > 0 ? `
                            <hr>
                            <h6>Problèmes Identifiés</h6>
                            <ul class="small">
                                ${rating.problemes.map(p => `<li class="text-danger">${p}</li>`).join('')}
                            </ul>
                        ` : ''}

                        ${rating.remarques ? `
                            <hr>
                            <h6>Remarques</h6>
                            <p class="small text-muted">${rating.remarques}</p>
                        ` : ''}
                    `;

                    document.getElementById('detailModalBody').innerHTML = html;
                    new bootstrap.Modal(document.getElementById('detailModal')).show();
                }
            });
        }

        // 🎯 Helper: Get evaluation text
        function getEvaluation(score) {
            if (score >= 90) return 'Excellent';
            if (score >= 75) return 'Bon';
            if (score >= 60) return 'Acceptable';
            if (score >= 40) return 'Médiocre';
            return 'Mauvais';
        }

        // 📢 Show alert/toast
        function showAlert(message, type = 'info') {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = `alert alert-${type} alert-toast`;
            toast.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <span>${message}</span>
                    <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
                </div>
            `;
            container.appendChild(toast);

            setTimeout(() => toast.remove(), 5000);
        }
    </script>
</body>
</html>
