// AFFECTATION MANAGER - Gestion complète des affectations vendeur <-> guichet
class AffectationManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.allAffectations = [];
        this.filteredAffectations = [];
        this.allVendeurs = [];
        this.allGuichets = [];
        this.allMagasins = [];
        this.allEntreprises = [];
        this.selectedAffectationId = null;
        this.editingAffectationId = null; // Pour mode édition
        this.selectedAffectations = new Set(); // Pour les sélections en masse
        this.listInstance = null; // Pour list.js
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAllData();
    }

    initializeListJs() {
        if (typeof List !== 'undefined' && document.getElementById('affectationsTable')) {
            try {
                // Détruire l'ancienne instance si elle existe
                if (this.listInstance) {
                    this.listInstance.destroy();
                }
                
                // Configuration personnalisée pour éviter les problèmes avec le tri
                this.listInstance = new List('affectationsTable', {
                    valueNames: ['vendeur-name', 'guichet-name', 'magasin-name', 'entreprise-name', 'date-affectation', 'statut'],
                    page: 10,
                    pagination: true,
                    listClass: 'list'
                });
                console.log('✅ List.js initialisé avec succès');
            } catch(e) {
                console.error('❌ Erreur initialisation list.js:', e);
            }
        } else {
            console.warn('⚠️ List.js ou le tableau non trouvé');
        }
    }

    setupEventListeners() {
        // Boutons principaux
        $('#refreshAllData').on('click', () => this.loadAllData());
        $('#btnCreateAffectation').on('click', () => this.openCreateModal());
        
        // Filtres
        $('#filterEntreprise').on('change', () => this.applyFilters());
        $('#filterMagasin').on('change', () => this.applyFilters());
        $('#filterGuichet').on('change', () => this.applyFilters());
        $('#filterVendeur').on('change', () => this.applyFilters());
        $('#filterStatut').on('change', () => this.applyFilters());
        $('#btnSearch').on('click', () => this.applyFilters());
        $('#searchAffectation').on('keyup', () => this.applyFilters());

        // Cascading selects dans le formulaire
        $('#affectEntreprise').on('change', () => this.loadMagasinsForAffectation());
        $('#affectMagasin').on('change', () => this.loadGuichetsForAffectation());
        $('#affectMagasin').on('change', () => this.loadVendeursForAffectation());

        // Modal actions
        $('#btnSaveAffectation').on('click', () => this.saveAffectation());
        $('#btnConfirmTerminer').on('click', () => this.confirmTerminerAffectation());

        // Validation en temps réel quand vendeur/guichet change
        $('#affectVendeur').on('change', () => this.validateFormChanges());
        $('#affectGuichet').on('change', () => this.validateFormChanges());
        $('#affectMagasin').on('change', () => this.validateFormChanges());

        // Actions en masse
        $('#checkAllAffectations').on('change', (e) => this.toggleSelectAll(e.target.checked));
        $('#btnBulkTerminer').on('click', () => this.bulkTerminerAffectations());
        $('#btnBulkDelete').on('click', () => this.bulkDeleteAffectations());
        $('#btnBulkExport').on('click', () => this.bulkExportAffectations());
        $('#btnBulkCancel').on('click', () => this.cancelBulkActions());

        // Modal hidden reset
        $('#modalCreateAffectation').on('hidden.bs.modal', () => {
            this.resetFormCreateAffectation();
            // Nettoyer le backdrop
            document.body.classList.remove('modal-open');
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
        });
        
        $('#modalTerminerAffectation').on('hidden.bs.modal', () => {
            this.resetFormTerminer();
            // Nettoyer le backdrop
            document.body.classList.remove('modal-open');
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
        });
    }

    // ==================== CHARGEMENT DATA ====================
    async loadAllData() {
        try {
            // Afficher le spinner et les loaders KPI
            $('#affectationSpinner').show();
            this.showKPILoaders();
            this.toggleLoading(true);
            
            const headers = this.getAuthHeaders();
            // Charger les affectations
            try {
                const affectRes = await fetch(`${window.API_BASE}/api/protected/affectations`, { headers });
                if (affectRes.ok) {
                    const affectData = await affectRes.json();
                    this.allAffectations = affectData.affectations || affectData || [];
                    console.log('✅ Affectations chargées:', this.allAffectations.length);
                }
            } catch (e) {
                console.error('Erreur affectations:', e);
                this.allAffectations = [];
            }

            // Charger les vendeurs
            try {
                let vendRes = await fetch(`${window.API_BASE}/api/protected/utilisateurs`, { headers });
                if (!vendRes.ok) {
                    vendRes = await fetch(`${window.API_BASE}/api/utilisateurs`, { headers });
                }
                let allUsers = [];
                if (vendRes.ok) {
                    const vendData = await vendRes.json();
                    allUsers = Array.isArray(vendData) ? vendData : vendData.utilisateurs || [];
                }
                
                // Ajouter les managers depuis les affectations (qui sont populés)
                // Cela capture les utilisateurs qui ne seraient pas retournés par l'endpoint utilisateurs
                const managersFromAffectations = new Map();
                this.allAffectations.forEach(a => {
                    if (a.managerId && typeof a.managerId === 'object' && a.managerId._id) {
                        if (!managersFromAffectations.has(a.managerId._id)) {
                            managersFromAffectations.set(a.managerId._id, {
                                _id: a.managerId._id,
                                nom: a.managerId.nom || '',
                                prenom: a.managerId.prenom || '',
                                email: a.managerId.email || '',
                                role: a.managerId.role || 'manager'
                            });
                        }
                    }
                });
                
                // Fusionner: allUsers + managers des affectations
                const managersArray = Array.from(managersFromAffectations.values());
                const mergedUsers = [...allUsers];
                managersArray.forEach(manager => {
                    if (!mergedUsers.find(u => u._id === manager._id)) {
                        mergedUsers.push(manager);
                    }
                });
                
                this.allVendeurs = mergedUsers; // Tous les utilisateurs + managers des affectations
                this.vendeursFiltres = mergedUsers.filter(v => v.role === 'vendeur' || v.role === 'manager') || [];
                console.log('✅ Tous les utilisateurs chargés:', this.allVendeurs.length, '(incluant managers des affectations)');
                console.log('🔍 IDs disponibles:', this.allVendeurs.map(v => ({ id: v._id, role: v.role, nom: (v.prenom || '') + ' ' + (v.nom || '') })).slice(0, 5));
            } catch (e) {
                console.error('Erreur vendeurs:', e);
                this.allVendeurs = [];
                this.vendeursFiltres = [];
            }

            // Charger les magasins
            try {
                const magRes = await fetch(`${window.API_BASE}/api/protected/magasins`, { headers });
                if (magRes.ok) {
                    const magData = await magRes.json();
                    this.allMagasins = Array.isArray(magData) ? magData : magData.magasins || [];
                    console.log('✅ Magasins chargés:', this.allMagasins.length);
                    if (this.allMagasins.length > 0) {
                        console.log('🔍 PREMIER MAGASIN - TOUS LES CHAMPS:', this.allMagasins[0]);
                        console.log('📋 Clés magasin disponibles:', Object.keys(this.allMagasins[0]));
                    }
                } else {
                    this.allMagasins = [];
                }
            } catch (e) {
                console.error('Erreur magasins:', e);
                this.allMagasins = [];
            }

            // Charger les guichets par magasin
            try {
                for (const magasin of this.allMagasins) {
                    const guichRes = await fetch(`${window.API_BASE}/api/protected/magasins/${magasin._id}/guichets`, { headers });
                    if (guichRes.ok) {
                        const guichData = await guichRes.json();
                        const guichets = Array.isArray(guichData) ? guichData : guichData.guichets || [];
                        this.allGuichets = [...this.allGuichets, ...guichets];
                    }
                }
                console.log('✅ Guichets chargés:', this.allGuichets.length);
                if (this.allGuichets.length > 0) {
                    console.log('🔍 PREMIER GUICHET - TOUS LES CHAMPS:', this.allGuichets[0]);
                    console.log('📋 Clés guichet disponibles:', Object.keys(this.allGuichets[0]));
                }
            } catch (e) {
                console.error('Erreur guichets:', e);
                this.allGuichets = [];
            }

            // Charger les entreprises
            try {
                const entRes = await fetch(`${window.API_BASE}/api/business`, { headers });
                if (entRes.ok) {
                    const entData = await entRes.json();
                    console.log('📦 Données brutes entreprises reçues:', entData);
                    
                    // Essayer différents formats
                    if (Array.isArray(entData)) {
                        this.allEntreprises = entData;
                    } else if (entData.business && Array.isArray(entData.business)) {
                        this.allEntreprises = entData.business;
                    } else if (entData.data && Array.isArray(entData.data)) {
                        this.allEntreprises = entData.data;
                    } else if (typeof entData === 'object') {
                        // Si c'est un objet, essayer d'extraire les entreprises
                        this.allEntreprises = Object.values(entData).filter(item => item && typeof item === 'object');
                    } else {
                        this.allEntreprises = [];
                    }
                    
                    if (this.allEntreprises.length === 0) {
                        console.warn('⚠️ Aucune entreprise trouvée. Vérifiez la structure des données:', entData);
                    } else {
                        console.log('✅ Entreprises chargées:', this.allEntreprises.length);
                        console.log('📋 Première entreprise complète:', this.allEntreprises[0]);
                        console.log('🔑 Clés disponibles dans l\'entreprise:', Object.keys(this.allEntreprises[0]));
                        console.log('📌 Valeur du champ "nom":', this.allEntreprises[0].nom);
                        console.log('📌 Valeur du champ "nomEntreprise":', this.allEntreprises[0].nomEntreprise);
                        console.log('📌 Valeur du champ "name":', this.allEntreprises[0].name);
                    }
                } else {
                    console.error('❌ Erreur chargement entreprises, status:', entRes.status);
                    this.allEntreprises = [];
                }
            } catch (e) {
                console.error('Erreur entreprises:', e);
                this.allEntreprises = [];
            }

            // Debug des affectations
            if (this.allAffectations.length > 0) {
                console.log('🔍 Première affectation:', this.allAffectations[0]);
                console.log('🔍 Tous les managerId uniques:', [...new Set(this.allAffectations.map(a => a.managerId || a.vendeurId))]);
            }

            this.populateFilterOptions();
            this.populateFormOptions();
            this.applyFilters();
            this.updateKPIs();
            this.updateHeaderCounters();
            this.initializeListJs(); // Initialiser list.js
            
            // Cacher le spinner et afficher les données
            $('#affectationSpinner').hide();
            this.toggleLoading(false);

        } catch (error) {
            console.error('Erreur chargement data:', error);
            this.showAlert('Erreur lors du chargement des données', 'danger');
            $('#affectationSpinner').hide();
            this.toggleLoading(false);
        }
    }

    loadMagasinsForAffectation() {
        const entrepriseId = $('#affectEntreprise').val();
        $('#affectMagasin').html('<option value="">Sélectionner un magasin</option>');
        
        if (!entrepriseId) return;

        const magasins = this.allMagasins.filter(m => m.entrepriseId === entrepriseId);
        magasins.forEach(m => {
            $('#affectMagasin').append(`<option value="${m._id}">${m.nom}</option>`);
        });
    }

    loadGuichetsForAffectation() {
        const magasinId = $('#affectMagasin').val();
        $('#affectGuichet').html('<option value="">Sélectionner un guichet</option>');
        
        if (!magasinId) return;

        const guichets = this.allGuichets.filter(g => g.magasinId === magasinId);
        guichets.forEach(g => {
            $('#affectGuichet').append(`<option value="${g._id}">${g.nom}</option>`);
        });
    }

    loadVendeursForAffectation() {
        // Charger les vendeurs non encore affectés à ce magasin
        const magasinId = $('#affectMagasin').val();
        $('#affectVendeur').html('<option value="">Sélectionner un vendeur</option>');
        
        if (!magasinId) {
            // Si pas de magasin sélectionné, afficher tous les vendeurs filtrés
            this.vendeursFiltres.forEach(v => {
                $('#affectVendeur').append(`<option value="${v._id}">${v.prenom} ${v.nom}</option>`);
            });
            return;
        }

        // Afficher les vendeurs filtrés avec indication du nombre d'affectations
        this.vendeursFiltres.forEach(v => {
            // Utiliser managerId au lieu de vendeurId
            const affectCount = this.allAffectations.filter(a => {
                const affectVendeurId = a.vendeurId || a.managerId;
                return affectVendeurId === v._id && a.status === 1;
            }).length;
            const label = affectCount > 0 ? `${v.prenom} ${v.nom} (${affectCount} affectation${affectCount > 1 ? 's' : ''})` : `${v.prenom} ${v.nom}`;
            $('#affectVendeur').append(`<option value="${v._id}">${label}</option>`);
        });
    }

    populateFilterOptions() {
        // Entreprises
        $('#filterEntreprise').html('<option value="">Toutes les entreprises</option>');
        this.allEntreprises.forEach(e => {
            $('#filterEntreprise').append(`<option value="${e._id}">${e.nomEntreprise || 'Sans nom'}</option>`);
        });

        // Magasins
        $('#filterMagasin').html('<option value="">Tous les magasins</option>');
        this.allMagasins.forEach(m => {
            $('#filterMagasin').append(`<option value="${m._id}">${m.nom_magasin || 'Sans nom'}</option>`);
        });

        // Guichets
        $('#filterGuichet').html('<option value="">Tous les guichets</option>');
        this.allGuichets.forEach(g => {
            $('#filterGuichet').append(`<option value="${g._id}">${g.nom_guichet || 'Sans nom'}</option>`);
        });

        // Vendeurs - utiliser vendeursFiltres
        $('#filterVendeur').html('<option value="">Tous les vendeurs</option>');
        this.vendeursFiltres.forEach(v => {
            $('#filterVendeur').append(`<option value="${v._id}">${v.prenom} ${v.nom}</option>`);
        });
    }

    populateFormOptions() {
        console.log('🔧 populateFormOptions() appelée');
        console.log('   - allEntreprises:', this.allEntreprises);
        console.log('   - allMagasins:', this.allMagasins);
        console.log('   - allGuichets:', this.allGuichets);
        
        // Form: Entreprises
        $('#affectEntreprise').html('<option value="">Sélectionner une entreprise</option>');
        if (this.allEntreprises && this.allEntreprises.length > 0) {
            console.log('📝 Remplissage Entreprises...');
            this.allEntreprises.forEach((e, idx) => {
                const nomEntreprise = e.nomEntreprise || 'Sans nom';
                console.log(`   [${idx}] ID: ${e._id}, Nom: ${nomEntreprise}`);
                $('#affectEntreprise').append(`<option value="${e._id}">${nomEntreprise}</option>`);
            });
            console.log('✅ Entreprises remplies:', this.allEntreprises.length);
        } else {
            console.warn('⚠️ allEntreprises vide ou undefined');
        }

        // Form: Magasins
        $('#affectMagasin').html('<option value="">Sélectionner un magasin</option>');
        if (this.allMagasins && this.allMagasins.length > 0) {
            console.log('📝 Remplissage Magasins...');
            this.allMagasins.forEach((m, idx) => {
                const nomMagasin = m.nom_magasin || 'Sans nom';
                console.log(`   [${idx}] ID: ${m._id}, Nom: ${nomMagasin}`);
                $('#affectMagasin').append(`<option value="${m._id}">${nomMagasin}</option>`);
            });
            console.log('✅ Magasins remplis:', this.allMagasins.length);
        } else {
            console.warn('⚠️ allMagasins vide ou undefined');
        }

        // Form: Guichets (vide initialement, rempli au changement de magasin)
        $('#affectGuichet').html('<option value="">Sélectionner un guichet</option>');
        if (this.allGuichets && this.allGuichets.length > 0) {
            console.log('📝 Remplissage Guichets initiaux...');
            this.allGuichets.forEach((g, idx) => {
                const nomGuichet = g.nom_guichet || 'Sans nom';
                console.log(`   [${idx}] ID: ${g._id}, Nom: ${nomGuichet}`);
                $('#affectGuichet').append(`<option value="${g._id}">${nomGuichet}</option>`);
            });
            console.log('✅ Guichets remplis:', this.allGuichets.length);
        }

        // Form: Vendeurs - utiliser vendeursFiltres pour les formulaires
        $('#affectVendeur').html('<option value="">Sélectionner un vendeur</option>');
        if (this.vendeursFiltres && this.vendeursFiltres.length > 0) {
            console.log('📝 Remplissage Vendeurs...');
            this.vendeursFiltres.forEach((v, idx) => {
                const nomVendeur = `${v.prenom || ''} ${v.nom || ''}`.trim() || 'Sans nom';
                console.log(`   [${idx}] ID: ${v._id}, Nom: ${nomVendeur}`);
                $('#affectVendeur').append(`<option value="${v._id}">${nomVendeur}</option>`);
            });
            console.log('✅ Vendeurs remplis:', this.vendeursFiltres.length);
        } else {
            console.warn('⚠️ vendeursFiltres vide ou undefined');
        }
    }

    // ==================== FILTRES & AFFICHAGE ====================
    applyFilters() {
        const entrepriseId = $('#filterEntreprise').val();
        const magasinId = $('#filterMagasin').val();
        const guichetId = $('#filterGuichet').val();
        const vendeurId = $('#filterVendeur').val();
        const statut = $('#filterStatut').val();
        const search = $('#searchAffectation').val().toLowerCase();

        this.filteredAffectations = this.allAffectations.filter(a => {
            // Utiliser managerId au lieu de vendeurId
            let affectVendeurId = a.vendeurId || a.managerId;
            if (typeof affectVendeurId === 'object' && affectVendeurId !== null) {
                affectVendeurId = affectVendeurId._id;
            }
            
            // Gérer magasinId/entrepriseId qui peuvent être des objets
            let affectMagasinId = a.magasinId;
            if (typeof affectMagasinId === 'object' && affectMagasinId !== null) {
                affectMagasinId = affectMagasinId._id;
            }
            
            let affectEntrepriseId = a.entrepriseId;
            if (typeof affectEntrepriseId === 'object' && affectEntrepriseId !== null) {
                affectEntrepriseId = affectEntrepriseId._id;
            }
            
            const matchEntreprise = !entrepriseId || affectEntrepriseId === entrepriseId;
            const matchMagasin = !magasinId || affectMagasinId === magasinId;
            const matchGuichet = !guichetId || a.guichetId === guichetId;
            const matchVendeur = !vendeurId || affectVendeurId === vendeurId;
            const matchStatut = statut === '' || a.status.toString() === statut;

            const vendeur = this.allVendeurs.find(v => v._id === affectVendeurId);
            const guichet = this.allGuichets.find(g => g._id === a.guichetId);
            const searchMatch = !search || 
                (vendeur && `${vendeur.prenom} ${vendeur.nom}`.toLowerCase().includes(search)) ||
                (guichet && guichet.nom.toLowerCase().includes(search));

            return matchEntreprise && matchMagasin && matchGuichet && matchVendeur && matchStatut && searchMatch;
        });

        this.currentPage = 1;
        this.displayAffectations();
        this.resetBulkSelection();
    }

    // ==================== ACTIONS EN MASSE ====================
    updateBulkSelection() {
        this.selectedAffectations.clear();
        $('.affectation-checkbox:checked').each((idx, el) => {
            this.selectedAffectations.add($(el).data('affectation-id'));
        });

        const count = this.selectedAffectations.size;
        if (count > 0) {
            $('#bulkActionsBar').show();
            $('#bulkSelectedCount').text(count);
        } else {
            $('#bulkActionsBar').hide();
        }
    }

    toggleSelectAll(checked) {
        $('.affectation-checkbox').prop('checked', checked);
        this.updateBulkSelection();
    }

    resetBulkSelection() {
        this.selectedAffectations.clear();
        $('#checkAllAffectations').prop('checked', false);
        $('#bulkActionsBar').hide();
    }

    cancelBulkActions() {
        this.resetBulkSelection();
    }

    async bulkTerminerAffectations() {
        if (this.selectedAffectations.size === 0) {
            this.showAlert('Aucune affectation sélectionnée', 'warning');
            return;
        }

        if (!confirm(`Êtes-vous sûr de vouloir terminer ${this.selectedAffectations.size} affectation(s) ?`)) {
            return;
        }

        try {
            const headers = this.getAuthHeaders();
            headers['Content-Type'] = 'application/json';
            let successCount = 0;
            let errorCount = 0;

            for (const affectationId of this.selectedAffectations) {
                const res = await fetch(`${window.API_BASE}/api/protected/affectations/${affectationId}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({ statut: 0 })
                });

                if (res.ok) {
                    successCount++;
                } else {
                    errorCount++;
                }
            }

            this.showAlert(`✅ ${successCount} terminée(s) - ❌ ${errorCount} échouée(s)`, 'success');
            this.loadAllData();

        } catch (error) {
            console.error('Erreur bulk terminer:', error);
            this.showAlert('Erreur lors de la terminaison en masse', 'danger');
        }
    }

    async bulkDeleteAffectations() {
        if (this.selectedAffectations.size === 0) {
            this.showAlert('Aucune affectation sélectionnée', 'warning');
            return;
        }

        if (!confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedAffectations.size} affectation(s) ? Cette action est irréversible.`)) {
            return;
        }

        try {
            const headers = this.getAuthHeaders();
            let successCount = 0;
            let errorCount = 0;

            for (const affectationId of this.selectedAffectations) {
                const res = await fetch(`${window.API_BASE}/api/protected/affectations/${affectationId}`, {
                    method: 'DELETE',
                    headers
                });

                if (res.ok) {
                    successCount++;
                } else {
                    errorCount++;
                }
            }

            this.showAlert(`✅ ${successCount} supprimée(s) - ❌ ${errorCount} échouée(s)`, 'success');
            this.loadAllData();

        } catch (error) {
            console.error('Erreur bulk delete:', error);
            this.showAlert('Erreur lors de la suppression en masse', 'danger');
        }
    }

    bulkExportAffectations() {
        if (this.selectedAffectations.size === 0) {
            this.showAlert('Aucune affectation sélectionnée', 'warning');
            return;
        }

        const selectedData = this.allAffectations.filter(a => this.selectedAffectations.has(a._id));
        this.exportToCSV(selectedData, `affectations_export_${new Date().getTime()}.csv`);
        this.showAlert(`✅ ${selectedData.length} affectation(s) exportée(s) en CSV`, 'success');
    }

    exportToCSV(data, filename) {
        // Préparer les en-têtes
        const headers = ['Vendeur', 'Guichet', 'Magasin', 'Entreprise', 'Date Affectation', 'Statut'];
        
        // Préparer les lignes
        const rows = data.map(a => {
            let vendeurId = a.vendeurId || a.managerId;
            if (typeof vendeurId === 'object' && vendeurId !== null) {
                vendeurId = vendeurId._id;
            }
            const vendeur = this.allVendeurs.find(v => v._id === vendeurId);
            const guichet = this.allGuichets.find(g => g._id === a.guichetId);
            const magasin = this.allMagasins.find(m => m._id === (typeof a.magasinId === 'string' ? a.magasinId : a.magasinId?._id));
            const entreprise = this.allEntreprises.find(e => e._id === (typeof a.entrepriseId === 'string' ? a.entrepriseId : a.entrepriseId?._id));

            const vendeurName = vendeur ? `${vendeur.prenom} ${vendeur.nom}` : 'N/A';
            const guichetName = guichet?.nom_guichet || guichet?.nom || 'N/A';
            const magasinName = magasin?.nom_magasin || magasin?.nom || 'N/A';
            const entrepriseName = entreprise?.nom || 'N/A';
            const dateStr = new Date(a.dateAffectation).toLocaleDateString('fr-FR');
            const statut = a.status === 1 ? 'Actif' : 'Terminé';

            return [vendeurName, guichetName, magasinName, entrepriseName, dateStr, statut];
        });

        // Créer le CSV
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Télécharger
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    displayAffectations() {
        // Afficher le spinner
        $('#affectationSpinner').show();
        const tbody = $('#affectationsTableBody');

        if (this.filteredAffectations.length === 0) {
            // Vider le tbody et afficher le message vide
            tbody.html('<tr><td colspan="7" class="text-center py-4 text-muted"><i class="fas fa-inbox me-2"></i>Aucune affectation trouvée</td></tr>');
            $('#affectationInfo').text('Affichage 0 sur 0');
            $('#affectationSpinner').hide();
            return;
        }

        let rowsHtml = '';
        this.filteredAffectations.forEach(a => {
            // Utiliser managerId au lieu de vendeurId (selon structure API)
            // Extraire l'ID si managerId est un objet populé, sinon utiliser la valeur directement
            let vendeurId = a.vendeurId || a.managerId;
            if (typeof vendeurId === 'object' && vendeurId !== null) {
                vendeurId = vendeurId._id;
            }
            const vendeur = this.allVendeurs.find(v => v._id === vendeurId);
            
            // Gérer les cas où magasinId/entrepriseId peuvent être des objets ou des strings
            const guichetId = typeof a.guichetId === 'string' ? a.guichetId : (a.guichetId?._id || null);
            const magasinId = typeof a.magasinId === 'string' ? a.magasinId : (a.magasinId?._id || null);
            const entrepriseId = typeof a.entrepriseId === 'string' ? a.entrepriseId : (a.entrepriseId?._id || null);
            
            const guichet = guichetId ? this.allGuichets.find(g => g._id === guichetId) : null;
            const magasin = magasinId ? this.allMagasins.find(m => m._id === magasinId) : null;
            const entreprise = entrepriseId ? this.allEntreprises.find(e => e._id === entrepriseId) : null;

            // Debug si N/A
            if (!magasin && magasinId) {
                console.warn('⚠️ Magasin non trouvé:', magasinId, 'Magasins dispo:', this.allMagasins.map(m => m._id));
            }
            if (!guichet && guichetId) {
                console.warn('⚠️ Guichet non trouvé:', guichetId, 'Guichets dispo:', this.allGuichets.map(g => g._id));
            }

            const vendeurName = vendeur ? `${vendeur.prenom || ''} ${vendeur.nom || ''}`.trim() || 'N/A' : 'Inconnu';
            const guichetName = guichet?.nom_guichet || 'N/A';
            const magasinName = magasin?.nom_magasin || 'N/A';
            const entrepriseName = entreprise?.nom || 'N/A';

            const dateAffect = new Date(a.dateAffectation);
            const dateStr = dateAffect.toLocaleDateString('fr-FR');
            const statusBadge = a.status === 1 
                ? '<span class="badge bg-success"><i class="fas fa-check-circle me-1"></i>Actif</span>'
                : '<span class="badge bg-secondary"><i class="fas fa-stop-circle me-1"></i>Terminé</span>';

            // Debug si inconnu
            if (vendeurName === 'Inconnu') {
                console.warn('🔍 Vendeur introuvable pour managerId:', vendeurId, 'Affectation:', a);
                console.log('   Vendeurs dispo:', this.allVendeurs.map(v => v._id).slice(0, 3));
            }

            const row = `
                <tr class="align-middle hover-highlight" data-affectation-id="${a._id}">
                    <td style="width: 30px;">
                        <input type="checkbox" class="form-check-input affectation-checkbox" data-affectation-id="${a._id}" title="Sélectionner">
                    </td>
                    <td class="vendeur-name">
                        <div class="d-flex align-items-center gap-2">
                            <div class="avatar avatar-sm rounded-circle bg-primary-soft text-primary fw-bold">
                                ${vendeurName.charAt(0)}
                            </div>
                            <div>
                                <strong>${vendeurName}</strong>
                            </div>
                        </div>
                    </td>
                    <td class="guichet-name">
                        <i class="fas fa-cash-register text-info me-2"></i>${guichetName}
                    </td>
                    <td class="magasin-name">
                        <i class="fas fa-store text-success me-2"></i>${magasinName}
                    </td>
                    <td class="entreprise-name">
                        <i class="fas fa-building text-warning me-2"></i>${entrepriseName}
                    </td>
                    <td class="date-affectation">
                        <small>${dateStr}</small>
                    </td>
                    <td class="statut">
                        ${statusBadge}
                    </td>
                    <td class="text-end">
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-outline-primary btnEditAffectation" data-id="${a._id}" title="Modifier">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button type="button" class="btn btn-outline-danger btnTerminerAffectation" data-id="${a._id}" title="Terminer" ${a.status === 0 ? 'disabled' : ''}>
                                <i class="fas fa-stop-circle"></i>
                            </button>
                            <button type="button" class="btn btn-outline-secondary btnDeleteAffectation" data-id="${a._id}" title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            rowsHtml += row;
        });

        // Vider le tbody et ajouter les rows
        tbody.empty();
        tbody.html(rowsHtml);
        
        console.log('✅ Affichage de', this.filteredAffectations.length, 'affectations');
        console.log('✅ Checkboxes créées:', $('.affectation-checkbox').length);

        // Event listeners pour les checkboxes
        $('.affectation-checkbox').on('change', (e) => this.updateBulkSelection());

        // Event listeners pour les boutons d'action
        $('.btnEditAffectation').on('click', (e) => this.editAffectation($(e.target).closest('button').data('id')));
        $('.btnTerminerAffectation').on('click', (e) => this.openTerminerModal($(e.target).closest('button').data('id')));
        $('.btnDeleteAffectation').on('click', (e) => this.deleteAffectation($(e.target).closest('button').data('id')));

        // Update info et cacher le spinner
        const total = this.filteredAffectations.length;
        $('#affectationInfo').text(`Affichage de ${total} affectations`);
        $('#countAffectations').text(total);
        $('#affectationSpinner').hide();
        
        // Réinitialiser list.js après avoir mis à jour le DOM
        setTimeout(() => {
            if (!this.listInstance || typeof this.listInstance !== 'object') {
                this.initializeListJs();
            } else {
                try {
                    this.listInstance.reIndex();
                } catch(e) {
                    console.warn('Erreur reIndex list.js, réinitialisation:', e);
                    this.initializeListJs();
                }
            }
        }, 100);

        // Mettre à jour les KPIs
        this.updateKPIs();
    }

    displayPagination() {
        const totalPages = Math.ceil(this.filteredAffectations.length / this.itemsPerPage);
        const pagination = $('#paginationAffectations');
        pagination.html('');

        if (totalPages <= 1) return;

        // Prev
        pagination.append(`
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${this.currentPage - 1}">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `);

        // Pages
        for (let i = 1; i <= totalPages; i++) {
            pagination.append(`
                <li class="page-item ${this.currentPage === i ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `);
        }

        // Next
        pagination.append(`
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${this.currentPage + 1}">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `);

        // Event listeners
        pagination.find('a').on('click', (e) => {
            e.preventDefault();
            const page = parseInt($(e.target).closest('a').data('page'));
            if (page > 0 && page <= totalPages) {
                this.currentPage = page;
                this.displayAffectations();
            }
        });
    }

    // ==================== CRUD OPÉRATIONS ====================
    openCreateModal() {
        this.editingAffectationId = null; // Mode création
        this.resetFormCreateAffectation();
        
        // Remplir les selects avec les données actuelles
        this.populateFormOptions();
        
        // Réinitialiser le titre du modal
        $('#modalCreateAffectation .modal-title').html('<i class="fas fa-plus-circle me-2"></i>Nouvelle Affectation');
        $('#btnSaveAffectation').html('<i class="fas fa-save me-2"></i>Créer Affectation');
        
        // Écouter les changements d'entreprise pour filtrer les magasins
        $('#affectEntreprise').off('change').on('change', (e) => this.onEntrepriseChange());
        
        // Écouter les changements de magasin pour filtrer les guichets
        $('#affectMagasin').off('change').on('change', (e) => this.onMagasinChange());
        
        const modal = new bootstrap.Modal(document.getElementById('modalCreateAffectation'));
        modal.show();
    }

    validateFormChanges() {
        const vendeurId = $('#affectVendeur').val();
        const guichetId = $('#affectGuichet').val();
        const magasinId = $('#affectMagasin').val();

        if (!vendeurId || !guichetId || !magasinId) {
            $('#validationMessages').empty();
            return;
        }

        const validation = this.validateAffectation({
            vendeurId,
            guichetId,
            magasinId,
            entrepriseId: $('#affectEntreprise').val()
        });

        this.displayValidationMessages(validation.errors, validation.warnings);
    }

    resetFormCreateAffectation() {
        $('#formCreateAffectation')[0].reset();
        $('#affectDate').val(new Date().toISOString().split('T')[0]);
        $('#affectEntreprise').html('<option value="">Sélectionner une entreprise</option>');
        this.allEntreprises.forEach(e => {
            $('#affectEntreprise').append(`<option value="${e._id}">${e.nom}</option>`);
        });
        $('#affectMagasin').html('<option value="">Sélectionner un magasin</option>');
        $('#affectGuichet').html('<option value="">Sélectionner un guichet</option>');
        $('#affectVendeur').html('<option value="">Sélectionner un vendeur</option>');
        $('#validationMessages').empty();
        
        // Réinitialiser le bouton et le mode
        const btnSave = $('#btnSaveAffectation');
        btnSave.prop('disabled', false).html('<i class="fas fa-save me-2"></i>Créer Affectation');
        
        // Réinitialiser les titres du modal
        const modalTitle = $('#modalCreateAffectation .modal-title');
        if (modalTitle.length) {
            modalTitle.html('<i class="fas fa-plus-circle me-2"></i>Nouvelle Affectation');
        }
        
        this.editingAffectationId = null;
    }

    // ==================== VALIDATIONS ====================
    validateAffectation(data) {
        const errors = [];
        const warnings = [];

        // 1. Vérifier les doublons (vendeur + guichet + magasin)
        const existingAffectation = this.allAffectations.find(a => 
            a.vendeurId === data.vendeurId && 
            a.guichetId === data.guichetId && 
            a.magasinId === data.magasinId && 
            a.status === 1 // Affectation active
        );
        if (existingAffectation) {
            const vendeur = this.allVendeurs.find(v => v._id === data.vendeurId);
            const guichet = this.allGuichets.find(g => g._id === data.guichetId);
            errors.push(`❌ <strong>${vendeur?.prenom} ${vendeur?.nom}</strong> est déjà affecté au guichet <strong>${guichet?.nom}</strong>`);
        }

        // 2. Vérifier la surcharge vendeur (max 3 affectations actives)
        const vendeurAffectations = this.allAffectations.filter(a => 
            a.vendeurId === data.vendeurId && 
            a.status === 1
        ).length;
        if (vendeurAffectations >= 3) {
            const vendeur = this.allVendeurs.find(v => v._id === data.vendeurId);
            warnings.push(`⚠️ <strong>${vendeur?.prenom} ${vendeur?.nom}</strong> a déjà ${vendeurAffectations} affectations actives`);
        }

        // 3. Vérifier la disponibilité du guichet
        const guichetAffectations = this.allAffectations.filter(a => 
            a.guichetId === data.guichetId && 
            a.status === 1
        ).length;
        if (guichetAffectations >= 2) {
            const guichet = this.allGuichets.find(g => g._id === data.guichetId);
            warnings.push(`⚠️ Le guichet <strong>${guichet?.nom}</strong> a déjà ${guichetAffectations} vendeurs assignés`);
        }

        return { valid: errors.length === 0, errors, warnings };
    }

    displayValidationMessages(errors, warnings) {
        const container = $('#validationMessages');
        container.empty();

        if (errors.length > 0) {
            const errorDiv = $('<div class="alert alert-danger alert-dismissible fade show" role="alert"></div>');
            errorDiv.html(`
                <strong><i class="fas fa-exclamation-circle me-2"></i>Erreurs détectées:</strong><br>
                ${errors.map(e => `<div class="mt-2">${e}</div>`).join('')}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `);
            container.append(errorDiv);
        }

        if (warnings.length > 0) {
            const warningDiv = $('<div class="alert alert-warning alert-dismissible fade show" role="alert"></div>');
            warningDiv.html(`
                <strong><i class="fas fa-exclamation-triangle me-2"></i>Avertissements:</strong><br>
                ${warnings.map(w => `<div class="mt-2">${w}</div>`).join('')}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `);
            container.append(warningDiv);
        }

        if (errors.length === 0 && warnings.length === 0) {
            const successDiv = $('<div class="alert alert-success alert-dismissible fade show" role="alert"></div>');
            successDiv.html(`
                <i class="fas fa-check-circle me-2"></i><strong>Aucun conflit détecté!</strong> L'affectation peut être créée.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `);
            container.append(successDiv);
        }
    }

    async saveAffectation() {
        const entrepriseId = $('#affectEntreprise').val();
        const magasinId = $('#affectMagasin').val();
        const guichetId = $('#affectGuichet').val();
        const vendeurId = $('#affectVendeur').val();
        const dateAffectation = $('#affectDate').val();
        const observations = $('#affectObservations').val();

        if (!entrepriseId || !magasinId || !guichetId || !vendeurId) {
            this.showAlert('Veuillez remplir tous les champs requis', 'warning');
            return;
        }

        // Si on est en mode édition, ne valider que pour éviter les doublons (sauf si c'est la même affectation)
        if (!this.editingAffectationId) {
            // Créer: Valider l'affectation
            const validation = this.validateAffectation({
                vendeurId,
                guichetId,
                magasinId,
                entrepriseId
            });

            this.displayValidationMessages(validation.errors, validation.warnings);

            if (!validation.valid) {
                this.showAlert('Impossible de créer l\'affectation: conflits détectés', 'danger');
                return;
            }
        }

        // Désactiver le bouton et afficher le loader
        const btnSave = $('#btnSaveAffectation');
        const originalHtml = btnSave.html();
        btnSave.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-2"></i>Enregistrement...');

        try {
            const payload = {
                entrepriseId,
                magasinId,
                guichetId,
                vendeurId,
                dateAffectation,
                observations,
                status: 1
            };

            const headers = this.getAuthHeaders();
            headers['Content-Type'] = 'application/json';

            let res, method, url, successMsg;

            if (this.editingAffectationId) {
                // Mode MODIFICATION
                method = 'PUT';
                url = `${window.API_BASE}/api/protected/affectations/${this.editingAffectationId}`;
                successMsg = '✅ Affectation modifiée avec succès';
            } else {
                // Mode CRÉATION
                method = 'POST';
                url = `${window.API_BASE}/api/protected/affectations`;
                successMsg = '✅ Affectation créée avec succès';
            }

            res = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(payload)
            });

            console.log('📤 Requête envoyée:', { method, url, payload });
            console.log('📥 Réponse reçue - Status:', res.status, 'OK:', res.ok);

            if (!res.ok) {
                const responseText = await res.text();
                console.error('❌ Réponse API (non-OK):', responseText.substring(0, 200));
                
                // Essayer de parser en JSON si c'est du JSON
                try {
                    const error = JSON.parse(responseText);
                    throw new Error(error.message || 'Erreur lors de l\'opération');
                } catch (e) {
                    throw new Error(`Erreur ${res.status}: ${responseText.substring(0, 100)}`);
                }
            }

            const responseData = await res.json();
            console.log('✅ Affectation sauvegardée:', responseData);
            this.showAlert(successMsg, 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalCreateAffectation'));
            if (modal) {
                modal.hide();
            }
            this.editingAffectationId = null; // Réinitialiser
            
            // Nettoyer le backdrop s'il reste
            setTimeout(() => {
                document.body.classList.remove('modal-open');
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
                this.loadAllData();
            }, 500);

        } catch (error) {
            console.error('Erreur save affectation:', error);
            this.showAlert(`❌ Erreur: ${error.message}`, 'danger');
            // Restaurer le bouton en cas d'erreur
            btnSave.prop('disabled', false).html(originalHtml);
        }
    }

    editAffectation(affectationId) {
        const affectation = this.allAffectations.find(a => a._id === affectationId);
        if (!affectation) return;

        // Stocker l'ID de l'affectation à modifier
        this.editingAffectationId = affectationId;

        // Charger les données
        let entrepriseId = affectation.entrepriseId;
        if (typeof entrepriseId === 'object') entrepriseId = entrepriseId._id;
        
        let magasinId = affectation.magasinId;
        if (typeof magasinId === 'object') magasinId = magasinId._id;
        
        let vendeurId = affectation.vendeurId || affectation.managerId;
        if (typeof vendeurId === 'object') vendeurId = vendeurId._id;

        $('#affectEntreprise').val(entrepriseId);
        this.loadMagasinsForAffectation();
        
        setTimeout(() => {
            $('#affectMagasin').val(magasinId);
            this.loadGuichetsForAffectation();
            this.loadVendeursForAffectation();
        }, 100);

        setTimeout(() => {
            $('#affectGuichet').val(affectation.guichetId);
            $('#affectVendeur').val(vendeurId);
            $('#affectDate').val(affectation.dateAffectation.split('T')[0]);
            $('#affectObservations').val(affectation.observations || '');
            
            // Changer le titre et bouton du modal
            $('#modalCreateAffectation .modal-title').html('<i class="fas fa-edit me-2"></i>Modifier Affectation');
            $('#btnSaveAffectation').html('<i class="fas fa-save me-2"></i>Mettre à Jour');
            $('#validationMessages').empty();
        }, 200);

        const modal = new bootstrap.Modal(document.getElementById('modalCreateAffectation'));
        modal.show();
    }

    openTerminerModal(affectationId) {
        this.selectedAffectationId = affectationId;
        const affectation = this.allAffectations.find(a => a._id === affectationId);
        
        if (affectation) {
            const vendeur = this.allVendeurs.find(v => v._id === affectation.vendeurId);
            const guichet = this.allGuichets.find(g => g._id === affectation.guichetId);
            if (vendeur && guichet) {
                const info = document.createElement('div');
                info.className = 'alert alert-info';
                info.innerHTML = `<small><i class="fas fa-info-circle me-2"></i>
                    <strong>${vendeur.prenom} ${vendeur.nom}</strong> - Guichet <strong>${guichet.nom}</strong></small>`;
                
                // Insérer après le premier p
                const p = document.querySelector('#modalTerminerAffectation .modal-body p');
                if (p) p.parentNode.insertBefore(info, p.nextSibling);
            }
        }

        const modal = new bootstrap.Modal(document.getElementById('modalTerminerAffectation'));
        modal.show();
    }

    resetFormTerminer() {
        $('#terminerRaison').val('');
        this.selectedAffectationId = null;
    }

    async confirmTerminerAffectation() {
        if (!this.selectedAffectationId) return;

        try {
            const headers = this.getAuthHeaders();
            headers['Content-Type'] = 'application/json';

            const res = await fetch(`${window.API_BASE}/api/protected/affectations/${this.selectedAffectationId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ statut: 0 })
            });

            if (!res.ok) {
                throw new Error('Erreur lors de la terminaison');
            }

            this.showAlert('✅ Affectation terminée avec succès', 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalTerminerAffectation'));
            if (modal) {
                modal.hide();
            }
            
            // Nettoyer le backdrop s'il reste
            setTimeout(() => {
                document.body.classList.remove('modal-open');
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
                this.loadAllData();
            }, 500);

        } catch (error) {
            console.error('Erreur terminer affectation:', error);
            this.showAlert(`❌ Erreur: ${error.message}`, 'danger');
        }
    }

    async deleteAffectation(affectationId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) return;

        try {
            const headers = this.getAuthHeaders();

            const res = await fetch(`${window.API_BASE}/api/protected/affectations/${affectationId}`, {
                method: 'DELETE',
                headers
            });

            if (!res.ok) {
                throw new Error('Erreur lors de la suppression');
            }

            this.showAlert('Affectation supprimée avec succès', 'success');
            this.loadAllData();

        } catch (error) {
            console.error('Erreur delete affectation:', error);
            this.showAlert(`Erreur: ${error.message}`, 'danger');
        }
    }

    // ==================== KPIs ====================
    updateKPIs() {
        const affectationsActives = this.allAffectations.filter(a => a.status === 1);
        const affectationsTerminees = this.allAffectations.filter(a => a.status === 0);
        
        // Vendeurs sans affectation active - utiliser managerId
        const vendeursAffectes = new Set(affectationsActives.map(a => {
            let vendeurId = a.vendeurId || a.managerId;
            if (typeof vendeurId === 'object' && vendeurId !== null) {
                vendeurId = vendeurId._id;
            }
            return vendeurId;
        }).filter(id => id));
        
        const vendeursSansAffectation = this.allVendeurs.filter(v => !vendeursAffectes.has(v._id)).length;

        // Durée moyenne
        const durees = affectationsTerminees.map(a => {
            const start = new Date(a.dateAffectation);
            const end = new Date(a.dateFinAffectation || new Date());
            return (end - start) / (1000 * 60 * 60 * 24); // en jours
        });
        const dureeAverage = durees.length > 0 ? Math.round(durees.reduce((a, b) => a + b) / durees.length) : 0;

        // Calcul des couleurs KPI en fonction de la charge
        const tauxOccupation = this.allVendeurs.length > 0 ? Math.round((vendeursAffectes.size / this.allVendeurs.length) * 100) : 0;
        const taux = Math.min(100, Math.max(0, tauxOccupation));

        // Mise à jour des KPIs avec animation
        this.animateKPI('#kpiActives', affectationsActives.length, 'text');
        this.animateKPI('#kpiInactives', affectationsTerminees.length, 'text');
        this.animateKPI('#kpiSansAffectation', vendeursSansAffectation, 'text');
        this.animateKPI('#kpiDureeAverage', `${dureeAverage}j`, 'text');
        
        // Mettre à jour la couleur des KPIs
        this.updateKPIColors(affectationsActives.length, affectationsTerminees.length, vendeursSansAffectation);
        
        // KPI Total
        const totalAffectations = this.allAffectations.length;
        this.animateKPI('#kpiTotal', totalAffectations, 'text');
        
        console.log(`✅ KPIs mis à jour: ${affectationsActives.length} actifs, ${affectationsTerminees.length} terminés`);

        // Mettre à jour le cercle de progression pour les affectations actives
        const maxAffectations = this.allGuichets.length * 2; // Estimation max
        const percentage = Math.min(100, Math.round((affectationsActives.length / maxAffectations) * 100));
        const circumference = 2 * Math.PI * 45; // rayon = 45
        const offset = circumference - (percentage / 100) * circumference;
        $('.kpi-actives-circle').css('stroke-dashoffset', offset);
    }

    animateKPI(selector, endValue, type = 'text') {
        const element = $(selector);
        if (type === 'text') {
            // Si c'est une chaîne comme "5j", afficher directement
            if (typeof endValue === 'string') {
                element.text(endValue);
                return;
            }
            
            const currentValue = parseInt(element.text()) || 0;
            const difference = endValue - currentValue;
            const steps = 20;
            let currentStep = 0;

            const interval = setInterval(() => {
                currentStep++;
                const newValue = Math.round(currentValue + (difference * currentStep / steps));
                element.text(newValue);
                if (currentStep >= steps) {
                    element.text(endValue);
                    clearInterval(interval);
                }
            }, 30);
        }
    }

    updateKPIColors(active, inactive, sansAffectation) {
        // Actifs - Vert si > 0
        const activeColor = active > 0 ? 'text-success' : 'text-muted';
        $('#kpiActives').removeClass('text-success text-muted').addClass(activeColor);

        // Inactifs - Orange si > 0
        const inactiveColor = inactive > 0 ? 'text-warning' : 'text-muted';
        $('#kpiInactives').removeClass('text-warning text-muted').addClass(inactiveColor);

        // Sans affectation - Rouge si > 0
        const sansAffectationColor = sansAffectation > 0 ? 'text-danger' : 'text-success';
        $('#kpiSansAffectation').removeClass('text-danger text-success text-muted').addClass(sansAffectationColor);
    }

    // ==================== UTILITIES ====================
    toggleLoading(show) {
        if (show) {
            $('#affectationSpinner').show();
        } else {
            $('#affectationSpinner').hide();
        }
    }

    getAuthHeaders() {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    showAlert(message, type = 'info') {
        // Créer une alerte Bootstrap
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.zIndex = '9999';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.minWidth = '300px';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    // ==================== LOADERS KPI ====================
    showKPILoaders() {
        $('#kpiActives').html('<div class="spinner-border spinner-border-sm text-success" role="status"><span class="visually-hidden">Chargement...</span></div>');
        $('#kpiInactives').html('<div class="spinner-border spinner-border-sm text-warning" role="status"><span class="visually-hidden">Chargement...</span></div>');
        $('#kpiSansAffectation').html('<div class="spinner-border spinner-border-sm text-danger" role="status"><span class="visually-hidden">Chargement...</span></div>');
        $('#kpiDureeAverage').html('<div class="spinner-border spinner-border-sm text-info" role="status"><span class="visually-hidden">Chargement...</span></div>');
        $('#kpiTotal').html('<div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">Chargement...</span></div>');
    }

    // ==================== FILTRAGE DYNAMIQUE FORMULAIRE ====================
    onEntrepriseChange() {
        const entrepriseId = $('#affectEntreprise').val();
        console.log('🏢 Entreprise changée:', entrepriseId);
        
        // Si pas d'entreprise, vider les magasins et guichets
        if (!entrepriseId) {
            $('#affectMagasin').html('<option value="">Sélectionner un magasin</option>');
            $('#affectGuichet').html('<option value="">Sélectionner un guichet</option>');
            return;
        }
        
        // Filtrer les magasins par entreprise (via businessId)
        const magasinsFiltrés = this.allMagasins.filter(m => {
            const busId = typeof m.businessId === 'object' ? m.businessId._id : m.businessId;
            return busId === entrepriseId;
        });
        
        console.log('🏪 Magasins filtrés:', magasinsFiltrés.length);
        
        $('#affectMagasin').html('<option value="">Sélectionner un magasin</option>');
        magasinsFiltrés.forEach(m => {
            const nomMagasin = m.nom_magasin || 'Sans nom';
            $('#affectMagasin').append(`<option value="${m._id}">${nomMagasin}</option>`);
        });
    }

    onMagasinChange() {
        const magasinId = $('#affectMagasin').val();
        console.log('🏪 Magasin changé:', magasinId);
        
        // Si pas de magasin, vider les guichets
        if (!magasinId) {
            $('#affectGuichet').html('<option value="">Sélectionner un guichet</option>');
            return;
        }
        
        // Filtrer les guichets par magasin
        const guichetsFiltrés = this.allGuichets.filter(g => g.magasinId === magasinId);
        
        console.log('🪟 Guichets filtrés:', guichetsFiltrés.length);
        
        $('#affectGuichet').html('<option value="">Sélectionner un guichet</option>');
        guichetsFiltrés.forEach(g => {
            const nomGuichet = g.nom_guichet || 'Sans nom';
            $('#affectGuichet').append(`<option value="${g._id}">${nomGuichet}</option>`);
        });
    }

    // ==================== MISE À JOUR COMPTEURS HEADER ====================
    updateHeaderCounters() {
        const activeAffectations = this.allAffectations.filter(a => a.status === 1).length;
        const uniqueVendeurs = new Set(this.allAffectations
            .filter(a => a.status === 1)
            .map(a => a.vendeurId || a.managerId)
            .filter(v => v)
        ).size;
        
        $('#totalVendeurs').text(uniqueVendeurs);
        $('#totalGuichets').text(this.allGuichets.length);
        $('#totalAffectations').text(activeAffectations);
        
        console.log(`📊 Compteurs mis à jour: ${uniqueVendeurs} vendeurs, ${this.allGuichets.length} guichets, ${activeAffectations} affectations actives`);
    }
}

// Initialiser l'application au chargement
$(document).ready(function() {
    window.affectationManager = new AffectationManager();
});
