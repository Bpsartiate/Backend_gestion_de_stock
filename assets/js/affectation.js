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

    // Gestion du loading des boutons
    setButtonLoading(selector, isLoading = true, originalText = null) {
        const $btn = $(selector);
        console.log('🔄 setButtonLoading - Selector:', selector, 'isLoading:', isLoading, 'Button exists:', $btn.length > 0);
        
        if (!isLoading) {
            // Restaurer l'état normal
            $btn.prop('disabled', false);
            if (originalText) {
                $btn.html(originalText);
                console.log('✅ Button restauré avec:', originalText);
            }
        } else {
            // État de chargement
            if (!$btn.data('original-text') && originalText) {
                $btn.data('original-text', originalText);
            }
            $btn.prop('disabled', true);
            $btn.html('<i class="fas fa-spinner fa-spin me-2"></i>Veuillez patienter...');
            console.log('⏳ Loading lancé sur:', selector);
        }
    }

    restoreButtonLoading(selector) {
        const $btn = $(selector);
        const originalText = $btn.data('original-text');
        if (originalText) {
            this.setButtonLoading(selector, false, originalText);
        }
    }

    initializeListJs() {
        if (typeof List !== 'undefined' && document.getElementById('affectationsTable')) {
            try {
                // Détruire l'ancienne instance si elle existe et a une méthode destroy
                if (this.listInstance && typeof this.listInstance.destroy === 'function') {
                    try {
                        this.listInstance.destroy();
                    } catch(e) {
                        console.warn('Avertissement destruction list:', e);
                    }
                }
                this.listInstance = null;
                
                // Configuration personnalisée pour éviter les problèmes avec le tri
                this.listInstance = new List('affectationsTable', {
                    valueNames: ['vendeur-name', 'guichet-name', 'magasin-name', 'entreprise-name', 'date-affectation', 'statut'],
                    page: 10,
                    pagination: true,
                    listClass: 'list'
                });
                console.log('OK List.js initialise avec succes');
            } catch(e) {
                console.error('Erreur initialisation list.js:', e);
                this.listInstance = null;
            }
        } else {
            console.warn('List.js ou le tableau non trouve');
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
        $('#btnConfirmReprendre').on('click', () => this.confirmReprendreAffectation());

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
                    console.log(' Affectations chargées:', this.allAffectations.length);
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
                console.log(' Tous les utilisateurs chargés:', this.allVendeurs.length, '(incluant managers des affectations)');
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
                    console.log(' Magasins chargés:', this.allMagasins.length);
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
                console.log(' Guichets chargés:', this.allGuichets.length);
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
                        console.log(' Entreprises chargées:', this.allEntreprises.length);
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

    // Récupérer les vendeurs sans affectation active
    getVendeursSansAffectation() {
        // Récupérer les IDs des vendeurs avec affectation active
        const vendeurIdsAffectes = new Set(
            this.allAffectations
                .filter(a => a.status === 1 || a.status === true) // Seulement les actifs
                .map(a => {
                    let vendeurId = a.vendeurId || a.managerId;
                    if (typeof vendeurId === 'object' && vendeurId !== null) {
                        vendeurId = vendeurId._id;
                    }
                    return vendeurId;
                })
                .filter(id => id)
        );
        
        console.log('🔍 Vendeurs affectés:', vendeurIdsAffectes.size, Array.from(vendeurIdsAffectes));
        
        // Filtrer les vendeurs disponibles
        return this.allVendeurs.filter(v => !vendeurIdsAffectes.has(v._id));
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
            console.log(' Entreprises remplies:', this.allEntreprises.length);
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
            console.log(' Magasins remplis:', this.allMagasins.length);
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
            console.log(' Guichets remplis:', this.allGuichets.length);
        }

        // Form: Vendeurs - FILTRER pour n'afficher que ceux SANS affectation active
        const vendeursSansAffect = this.getVendeursSansAffectation();
        $('#affectVendeur').html('<option value="">Sélectionner un vendeur</option>');
        if (vendeursSansAffect && vendeursSansAffect.length > 0) {
            console.log('📝 Remplissage Vendeurs disponibles...');
            vendeursSansAffect.forEach((v, idx) => {
                const nomVendeur = `${v.prenom || ''} ${v.nom || ''}`.trim() || 'Sans nom';
                console.log(`   [${idx}] ID: ${v._id}, Nom: ${nomVendeur}`);
                $('#affectVendeur').append(`<option value="${v._id}">${nomVendeur}</option>`);
            });
            console.log(' Vendeurs disponibles remplis:', vendeursSansAffect.length);
        } else {
            console.warn('⚠️ Aucun vendeur disponible (tous affectés)');
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

        this.showConfirmation(
            'Terminer les affectations',
            `<strong>${this.selectedAffectations.size} affectation(s)</strong> seront terminées.<br><small class="text-muted">Les vendeurs ne pourront plus accéder à leurs guichets.</small>`,
            'terminate-bulk',
            () => this.executeBulkTerminer()
        );
    }

    async executeBulkTerminer() {
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

            this.showAlert(` ${successCount} terminée(s) - ❌ ${errorCount} échouée(s)`, 'success');
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

        this.showConfirmation(
            'Supprimer les affectations',
            `<strong>${this.selectedAffectations.size} affectation(s)</strong> seront définitivement supprimées.<br><span class="badge bg-danger">⚠️ Action irréversible</span>`,
            'delete-bulk',
            () => this.executeBulkDelete()
        );
    }

    async executeBulkDelete() {
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

            this.showAlert(` ${successCount} supprimée(s) - ❌ ${errorCount} échouée(s)`, 'success');
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
        this.showAlert(` ${selectedData.length} affectation(s) exportée(s) en CSV`, 'success');
    }

    exportToCSV(data, filename) {
        // Préparer les en-têtes complètes
        const headers = ['ID', 'Vendeur', 'Téléphone', 'Email', 'Guichet', 'Magasin', 'Entreprise', 'Date Affectation', 'Date Fin', 'Durée (jours)', 'Statut', 'Observations'];
        
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
            const vendeurPhone = vendeur?.telephone || 'N/A';
            const vendeurEmail = vendeur?.email || 'N/A';
            const guichetName = guichet?.nom_guichet || guichet?.nom || 'N/A';
            const magasinName = magasin?.nom_magasin || magasin?.nom || 'N/A';
            const entrepriseName = entreprise?.nomEntreprise || entreprise?.nom || 'N/A';
            const dateStart = new Date(a.dateAffectation).toLocaleDateString('fr-FR');
            const dateEnd = a.dateFinAffectation ? new Date(a.dateFinAffectation).toLocaleDateString('fr-FR') : 'En cours';
            
            // Calculer la durée
            const startDate = new Date(a.dateAffectation);
            const endDate = a.dateFinAffectation ? new Date(a.dateFinAffectation) : new Date();
            const dureeJours = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
            
            const statut = a.status === 1 ? 'Actif' : 'Terminé';
            const observations = a.observations || 'Aucune';

            return [a._id.substring(0, 8), vendeurName, vendeurPhone, vendeurEmail, guichetName, magasinName, entrepriseName, dateStart, dateEnd, dureeJours, statut, observations];
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
            const entrepriseName = entreprise?.nomEntreprise || 'N/A';

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
                            <button type="button" class="btn btn-outline-primary btnEditAffectation" data-id="${a._id}" title="Modifier" ${a.status === 0 ? 'disabled' : ''}>
                                <i class="fas fa-edit"></i>
                            </button>
                            <button type="button" class="btn btn-outline-info btnHistoriqueAffectation" data-id="${a._id}" title="Historique">
                                <i class="fas fa-history"></i>
                            </button>
                            ${a.status === 1 ? `
                            <button type="button" class="btn btn-outline-danger btnTerminerAffectation" data-id="${a._id}" title="Suspendre">
                                <i class="fas fa-pause-circle"></i>
                            </button>
                            ` : `
                            <button type="button" class="btn btn-outline-success btnReprendreAffectation" data-id="${a._id}" title="Lever la suspension">
                                <i class="fas fa-play-circle"></i>
                            </button>
                            `}
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
        
        console.log(' Affichage de', this.filteredAffectations.length, 'affectations');
        console.log(' Checkboxes créées:', $('.affectation-checkbox').length);

        // Event listeners pour les checkboxes
        $('.affectation-checkbox').on('change', (e) => this.updateBulkSelection());

        // Event listeners pour les boutons d'action
        $('.btnEditAffectation').on('click', (e) => this.editAffectation($(e.target).closest('button').data('id')));
        $('.btnHistoriqueAffectation').on('click', (e) => {
            const idClic = $(e.target).closest('button').data('id');
            console.log('CLIC SUR HISTORIQUE - ID:', idClic);
            this.showHistoriqueAffectation(idClic);
        });
        $('.btnTerminerAffectation').on('click', (e) => this.openTerminerModal($(e.target).closest('button').data('id')));
        $('.btnReprendreAffectation').on('click', (e) => this.openReprendreModal($(e.target).closest('button').data('id')));
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
        
        // Réinitialiser les selects avec les bons noms de champs
        $('#affectEntreprise').html('<option value="">Sélectionner une entreprise</option>');
        this.allEntreprises.forEach(e => {
            $('#affectEntreprise').append(`<option value="${e._id}">${e.nomEntreprise}</option>`);
        });
        
        $('#affectMagasin').html('<option value="">Sélectionner un magasin</option>');
        this.allMagasins.forEach(m => {
            $('#affectMagasin').append(`<option value="${m._id}">${m.nom_magasin}</option>`);
        });
        
        $('#affectGuichet').html('<option value="">Sélectionner un guichet</option>');
        this.allGuichets.forEach(g => {
            $('#affectGuichet').append(`<option value="${g._id}">${g.nom_guichet}</option>`);
        });
        
        // Afficher SEULEMENT les vendeurs sans affectation active
        const vendeursSansAffect = this.getVendeursSansAffectation();
        $('#affectVendeur').html('<option value="">Sélectionner un vendeur</option>');
        vendeursSansAffect.forEach(v => {
            $('#affectVendeur').append(`<option value="${v._id}">${v.prenom} ${v.nom}</option>`);
        });
        
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
            const errorDiv = $(`
                <div class="alert alert-danger alert-dismissible fade show border-start border-4 border-danger" role="alert">
                    <div class="d-flex align-items-start">
                        <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-circle text-danger me-3 mt-1"></i>
                        </div>
                        <div class="flex-grow-1">
                            <strong>Erreurs détectées:</strong>
                            <div class="mt-2">
                                ${errors.map(e => `<div class="mb-2"><small>${e}</small></div>`).join('')}
                            </div>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                </div>
            `);
            container.append(errorDiv);
        }

        if (warnings.length > 0) {
            const warningDiv = $(`
                <div class="alert alert-warning alert-dismissible fade show border-start border-4 border-warning" role="alert">
                    <div class="d-flex align-items-start">
                        <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-triangle text-warning me-3 mt-1"></i>
                        </div>
                        <div class="flex-grow-1">
                            <strong>Avertissements:</strong>
                            <div class="mt-2">
                                ${warnings.map(w => `<div class="mb-2"><small>${w}</small></div>`).join('')}
                            </div>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                </div>
            `);
            container.append(warningDiv);
        }

        if (errors.length === 0 && warnings.length === 0) {
            const successDiv = $(`
                <div class="alert alert-success alert-dismissible fade show border-start border-4 border-success" role="alert">
                    <div class="d-flex align-items-start">
                        <div class="flex-shrink-0">
                            <i class="fas fa-check-circle text-success me-3 mt-1"></i>
                        </div>
                        <div class="flex-grow-1">
                            <strong> Aucun conflit détecté!</strong> L'affectation peut être créée.
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                </div>
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
        const originalHtml = btnSave.data('original-text') || btnSave.html();
        btnSave.data('original-text', originalHtml);
        this.setButtonLoading('#btnSaveAffectation', true, originalHtml);

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
                successMsg = ' Affectation modifiée avec succès';
            } else {
                // Mode CRÉATION
                method = 'POST';
                url = `${window.API_BASE}/api/protected/affectations`;
                successMsg = ' Affectation créée avec succès';
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
            console.log(' Affectation sauvegardée:', responseData);
            
            // Log de l'action
            console.log('DEBUG - editingAffectationId:', this.editingAffectationId);
            if (this.editingAffectationId) {
                console.log('MODE MODIFICATION - ID:', this.editingAffectationId);
                this.logAffectationChange(this.editingAffectationId, 'update', {
                    vendeur: this.getVendeurName($('#affectVendeur').val()),
                    guichet: this.getGuichetName($('#affectGuichet').val()),
                    observations: $('#affectObservations').val()
                });
                this.showSuccessAlert('Affectation modifiée avec succès');
            } else {
                const newId = responseData.data._id || responseData._id;
                console.log('MODE CREATION - ID:', newId);
                this.logAffectationChange(newId, 'create', {
                    vendeur: this.getVendeurName($('#affectVendeur').val()),
                    guichet: this.getGuichetName($('#affectGuichet').val())
                });
                this.showSuccessAlert('Affectation créée avec succès');
            }
            
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
            this.showErrorAlert(error.message);
            // Restaurer le bouton en cas d'erreur
            this.restoreButtonLoading('#btnSaveAffectation');
        }
    }

    editAffectation(affectationId) {
        const affectation = this.allAffectations.find(a => a._id === affectationId);
        if (!affectation) return;

        console.log('🔧 editAffectation - Affectation trouvée:', affectation);

        // Stocker l'ID de l'affectation à modifier
        this.editingAffectationId = affectationId;

        // Extraire les IDs (gérer les objets peuplés)
        let entrepriseId = affectation.entrepriseId;
        if (typeof entrepriseId === 'object' && entrepriseId !== null) entrepriseId = entrepriseId._id;
        
        let magasinId = affectation.magasinId;
        if (typeof magasinId === 'object' && magasinId !== null) magasinId = magasinId._id;
        
        let guichetId = affectation.guichetId;
        if (typeof guichetId === 'object' && guichetId !== null) guichetId = guichetId._id;
        
        let vendeurId = affectation.vendeurId;
        if (typeof vendeurId === 'object' && vendeurId !== null) vendeurId = vendeurId._id;

        console.log('🔑 IDs extraits:', { entrepriseId, magasinId, guichetId, vendeurId });

        // D'abord, populer tous les champs
        this.populateFormOptions();

        // Ensuite, attacher les event listeners
        $('#affectEntreprise').off('change').on('change', (e) => this.onEntrepriseChange());
        $('#affectMagasin').off('change').on('change', (e) => this.onMagasinChange());

        // Maintenant remplir avec les valeurs de l'affectation
        setTimeout(() => {
            console.log('📌 Setting enterprise:', entrepriseId);
            $('#affectEntreprise').val(entrepriseId);
            
            // Déclencher le changement pour filtrer les magasins
            $('#affectEntreprise').trigger('change');
            
            // Attendre que les magasins soient filtrés
            setTimeout(() => {
                console.log('📌 Setting magasin:', magasinId);
                $('#affectMagasin').val(magasinId);
                
                // Déclencher le changement pour filtrer les guichets
                $('#affectMagasin').trigger('change');
                
                // Attendre que les guichets soient filtrés
                setTimeout(() => {
                    console.log('📌 Setting guichet:', guichetId);
                    console.log('📌 Setting vendeur:', vendeurId);
                    $('#affectGuichet').val(guichetId);
                    $('#affectVendeur').val(vendeurId);
                    
                    // Remplir les autres champs
                    const dateStr = affectation.dateAffectation ? affectation.dateAffectation.split('T')[0] : '';
                    $('#affectDate').val(dateStr);
                    $('#affectObservations').val(affectation.notes || '');
                    
                    console.log(' Tous les champs remplis');
                }, 100);
            }, 100);
        }, 100);

        // Changer le titre et bouton du modal
        $('#modalCreateAffectation .modal-title').html('<i class="fas fa-edit me-2"></i>Modifier Affectation');
        $('#btnSaveAffectation').html('<i class="fas fa-save me-2"></i>Mettre à Jour');
        $('#validationMessages').empty();

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

    openReprendreModal(affectationId) {
        this.selectedAffectationId = affectationId;
        const affectation = this.allAffectations.find(a => a._id === affectationId);
        
        if (affectation) {
            const vendeur = this.allVendeurs.find(v => v._id === affectation.vendeurId);
            const guichet = this.allGuichets.find(g => g._id === affectation.guichetId);
            if (vendeur && guichet) {
                const info = document.createElement('div');
                info.className = 'alert alert-success';
                info.innerHTML = `<small><i class="fas fa-info-circle me-2"></i>
                    <strong>${vendeur.prenom} ${vendeur.nom}</strong> - Guichet <strong>${guichet.nom}</strong></small>`;
                
                // Insérer après le premier p
                const p = document.querySelector('#modalReprendreAffectation .modal-body p');
                if (p) p.parentNode.insertBefore(info, p.nextSibling);
            }
        }

        const modal = new bootstrap.Modal(document.getElementById('modalReprendreAffectation'));
        modal.show();
    }    async confirmTerminerAffectation() {
        if (!this.selectedAffectationId) return;

        this.setButtonLoading('#btnConfirmTerminer', true, '<i class="fas fa-check me-2"></i>Confirmer');

        try {
            const headers = this.getAuthHeaders();
            headers['Content-Type'] = 'application/json';

            const res = await fetch(`${window.API_BASE}/api/protected/affectations/${this.selectedAffectationId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status: 0 })
            });

            if (!res.ok) {
                throw new Error('Erreur lors de la terminaison');
            }

            // Log de la terminaison
            const raison = $('#terminerRaison').val() || 'Aucune raison spécifiée';
            this.logAffectationChange(this.selectedAffectationId, 'terminate', {
                raison: raison
            });

            this.showSuccessAlert('Affectation terminée avec succès');
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
                
                // Ajouter log pour debug
                console.log('🔄 DEBUG - Chargement des données après suspension...');
            }, 500);
            
            // Restaurer le bouton après 2 secondes (après loadAllData)
            setTimeout(() => {
                this.restoreButtonLoading('#btnConfirmTerminer');
                console.log('✅ DEBUG - Bouton Terminer restauré');
            }, 2500);

        } catch (error) {
            console.error('Erreur terminer affectation:', error);
            this.showErrorAlert(error.message);
            this.restoreButtonLoading('#btnConfirmTerminer');
        }
    }

    async confirmReprendreAffectation() {
        if (!this.selectedAffectationId) return;

        this.setButtonLoading('#btnConfirmReprendre', true, '<i class="fas fa-check me-2"></i>Confirmer');

        try {
            const headers = this.getAuthHeaders();
            headers['Content-Type'] = 'application/json';

            const res = await fetch(`${window.API_BASE}/api/protected/affectations/${this.selectedAffectationId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status: 1 })
            });

            if (!res.ok) {
                throw new Error('Erreur lors de la reprise');
            }

            // Log de la reprise
            const raison = $('#reprendreRaison').val() || 'Suspension levée';
            this.logAffectationChange(this.selectedAffectationId, 'resume', {
                raison: raison
            });

            this.showSuccessAlert('Affectation reprise avec succès');
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalReprendreAffectation'));
            if (modal) {
                modal.hide();
            }
            
            // Nettoyer le backdrop s'il reste
            setTimeout(() => {
                document.body.classList.remove('modal-open');
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
                this.loadAllData();
                
                // Ajouter log pour debug
                console.log('🔄 DEBUG - Chargement des données après reprise...');
            }, 500);
            
            // Restaurer le bouton après 2 secondes (après loadAllData)
            setTimeout(() => {
                this.restoreButtonLoading('#btnConfirmReprendre');
                console.log('✅ DEBUG - Bouton Reprendre restauré');
            }, 2500);

        } catch (error) {
            console.error('Erreur reprendre affectation:', error);
            this.showErrorAlert(error.message);
            this.restoreButtonLoading('#btnConfirmReprendre');
        }
    }    async deleteAffectation(affectationId) {
        this.showConfirmation(
            'Supprimer l\'affectation',
            'Cette affectation sera définitivement supprimée.<br><span class="badge bg-danger">⚠️ Action irréversible</span>',
            'delete',
            () => this.executeDelete(affectationId)
        );
    }

    async executeDelete(affectationId) {
        try {
            const headers = this.getAuthHeaders();

            const res = await fetch(`${window.API_BASE}/api/protected/affectations/${affectationId}`, {
                method: 'DELETE',
                headers
            });

            if (!res.ok) {
                throw new Error('Erreur lors de la suppression');
            }

            // Log de la suppression
            this.logAffectationChange(affectationId, 'delete', {});
            
            this.showSuccessAlert('Affectation supprimée avec succès');
            this.loadAllData();

        } catch (error) {
            console.error('Erreur delete affectation:', error);
            this.showErrorAlert(error.message);
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
        
        console.log(` KPIs mis à jour: ${affectationsActives.length} actifs, ${affectationsTerminees.length} terminés`);

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
        // Créer un conteneur pour les alertes s'il n'existe pas
        let alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.id = 'alertContainer';
            alertContainer.style.position = 'fixed';
            alertContainer.style.top = '20px';
            alertContainer.style.right = '20px';
            alertContainer.style.zIndex = '9999';
            alertContainer.style.width = '100%';
            alertContainer.style.maxWidth = '400px';
            alertContainer.style.pointerEvents = 'none';
            document.body.appendChild(alertContainer);
        }

        // Créer l'alerte avec icône et style amélioré
        const alertDiv = document.createElement('div');
        
        // Déterminer l'icône et la couleur selon le type
        let icon = 'info-circle';
        let bgColor = 'bg-info';
        let textColor = 'text-info';
        let borderColor = 'border-info';
        
        switch(type) {
            case 'success':
                icon = 'check-circle';
                bgColor = 'bg-success';
                textColor = 'text-success';
                borderColor = 'border-success';
                break;
            case 'danger':
                icon = 'exclamation-circle';
                bgColor = 'bg-danger';
                textColor = 'text-danger';
                borderColor = 'border-danger';
                break;
            case 'warning':
                icon = 'exclamation-triangle';
                bgColor = 'bg-warning';
                textColor = 'text-warning';
                borderColor = 'border-warning';
                break;
            case 'primary':
                icon = 'info-circle';
                bgColor = 'bg-primary';
                textColor = 'text-primary';
                borderColor = 'border-primary';
                break;
        }
        
        alertDiv.className = `alert alert-${type} alert-dismissible fade show mb-3 border-start border-4 ${borderColor}`;
        alertDiv.style.pointerEvents = 'auto';
        alertDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        alertDiv.style.borderRadius = '0.375rem';
        
        alertDiv.innerHTML = `
            <div class="d-flex align-items-start">
                <div class="flex-shrink-0">
                    <i class="fas fa-${icon} ${textColor} me-3 mt-1"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="fw-500">${message}</div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fermer"></button>
            </div>
        `;
        
        // Ajouter au conteneur
        alertContainer.appendChild(alertDiv);
        
        // Ajouter l'animation Bootstrap
        alertDiv.classList.add('animate-fadeInDown');
        
        // Ajouter un style CSS pour l'animation
        if (!document.getElementById('alertStyles')) {
            const style = document.createElement('style');
            style.id = 'alertStyles';
            style.textContent = `
                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translate(0, -20px);
                    }
                    to {
                        opacity: 1;
                        transform: translate(0, 0);
                    }
                }
                .animate-fadeInDown {
                    animation: fadeInDown 0.3s ease-out;
                }
                #alertContainer .alert {
                    margin-bottom: 10px;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Auto-fermer après 5 secondes (sauf pour danger)
        const duration = type === 'danger' ? 8000 : 5000;
        const timeout = setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, duration);
        
        // Permettre la fermeture manuelle
        const closeBtn = alertDiv.querySelector('.btn-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                clearTimeout(timeout);
                alertDiv.classList.remove('show');
                setTimeout(() => alertDiv.remove(), 150);
            });
        }
    }

    // Méthode pour afficher une alerte de validation avec plusieurs erreurs
    showValidationAlert(errors) {
        if (!errors || errors.length === 0) return;
        
        const message = errors.length === 1 
            ? errors[0]
            : `<ul class="mb-0"><li>${errors.join('</li><li>')}</li></ul>`;
        
        this.showAlert(message, 'warning');
    }

    // Méthode pour afficher une alerte de succès avec son
    showSuccessAlert(message) {
        this.showAlert(`<strong> Succès!</strong><br>${message}`, 'success');
    }

    // Méthode pour afficher une alerte d'erreur avec son
    showErrorAlert(message) {
        this.showAlert(`<strong>❌ Erreur!</strong><br>${message}`, 'danger');
    }

    // Méthode pour afficher une modal de confirmation
    showConfirmation(title, message, actionType = 'delete', callback) {
        // Stocker le callback pour utilisation ultérieure
        this.confirmationCallback = callback;
        
        // Mettre à jour le header
        const headerContainer = document.getElementById('confirmHeaderContainer');
        let headerColor = 'bg-danger';
        let icon = 'trash';
        let btnText = 'Supprimer';
        
        if (actionType === 'terminate') {
            headerColor = 'bg-warning text-white';
            icon = 'stop-circle';
            btnText = 'Terminer';
        } else if (actionType === 'delete-bulk') {
            headerColor = 'bg-danger text-white';
            icon = 'trash';
            btnText = 'Supprimer tous';
        } else if (actionType === 'terminate-bulk') {
            headerColor = 'bg-warning text-white';
            icon = 'stop-circle';
            btnText = 'Terminer tous';
        }
        
        headerContainer.className = `modal-header border-0 pb-0 ${headerColor}`;
        
        // Mettre à jour le titre
        document.getElementById('confirmTitle').innerHTML = `<i class="fas fa-${icon} me-2"></i>${title}`;
        
        // Mettre à jour le message
        document.getElementById('confirmMessage').innerHTML = message;
        
        // Mettre à jour le bouton
        const confirmBtn = document.getElementById('btnConfirmAction');
        confirmBtn.innerHTML = `<i class="fas fa-${icon} me-2"></i>${btnText}`;
        confirmBtn.className = `btn ${actionType === 'terminate' || actionType === 'terminate-bulk' ? 'btn-warning' : 'btn-danger'}`;
        
        // Supprimer les anciens listeners
        confirmBtn.replaceWith(confirmBtn.cloneNode(true));
        const newConfirmBtn = document.getElementById('btnConfirmAction');
        
        // Ajouter le nouveau listener
        newConfirmBtn.addEventListener('click', () => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalConfirmation'));
            if (modal) modal.hide();
            
            if (callback) {
                callback();
            }
        });
        
        // Afficher la modal
        const modal = new bootstrap.Modal(document.getElementById('modalConfirmation'));
        modal.show();
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

    // ==================== AUDIT TRAIL (HISTORIQUE) ====================
    getCurrentUserInfo() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return { userId: 'unknown', userName: 'Unknown User', userEmail: '' };

            // Décoder le JWT (base64 decode de la partie payload)
            const parts = token.split('.');
            if (parts.length !== 3) return { userId: 'unknown', userName: 'Unknown User', userEmail: '' };

            const decoded = JSON.parse(atob(parts[1]));
            return {
                userId: decoded._id || decoded.id || 'unknown',
                userName: decoded.prenom && decoded.nom 
                    ? `${decoded.prenom} ${decoded.nom}` 
                    : decoded.email || 'Unknown User',
                userEmail: decoded.email || '',
                userRole: decoded.role || 'user'
            };
        } catch (error) {
            console.warn('⚠️ Impossible de décoder le token:', error);
            return { userId: 'unknown', userName: 'Unknown User', userEmail: '' };
        }
    }

    logAffectationChange(affectationId, action, details = {}) {
        console.log('LOG ACTION - affectationId:', affectationId, 'action:', action);
        const timestamp = new Date().toISOString();
        const userInfo = this.getCurrentUserInfo();
        
        const log = {
            affectationId,
            action, // 'create', 'update', 'delete', 'terminate'
            timestamp,
            details,
            userId: userInfo.userId,
            userName: userInfo.userName,
            userEmail: userInfo.userEmail,
            userRole: userInfo.userRole
        };
        
        // Sauvegarder dans localStorage (persiste dans le navigateur)
        const storageKey = `affectationLogs_${affectationId}`;
        let logs = JSON.parse(localStorage.getItem(storageKey) || '[]');
        logs.push(log);
        localStorage.setItem(storageKey, JSON.stringify(logs));
        console.log('SAUVEGARDE LOG - Clé:', storageKey, 'Total logs:', logs.length);
        
        // Aussi sauvegarder un index global
        let allLogs = JSON.parse(localStorage.getItem('affectationLogs_all') || '[]');
        allLogs.push(log);
        localStorage.setItem('affectationLogs_all', JSON.stringify(allLogs));
        
        console.log('📝 Audit log enregistré:', log);
        return log;
    }

    showHistoriqueAffectation(affectationId) {
        console.log('===== AFFICHAGE HISTORIQUE =====');
        console.log('ID RECU:', affectationId);
        
        const affectation = this.allAffectations.find(a => a._id === affectationId);
        if (!affectation) {
            this.showErrorAlert('Affectation introuvable');
            return;
        }

        // Récupérer les logs de l'affectation depuis localStorage
        const storageKey = `affectationLogs_${affectationId}`;
        console.log('CLÉ STORAGE:', storageKey);
        
        let allLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');
        console.log('LOGS BRUTS:', allLogs);
        console.log('NOMBRE BRUT:', allLogs.length);
        
        let logs = allLogs.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        console.log('LOGS APRES TRI:', logs);
        console.log('NOMBRE APRES TRI:', logs.length);

        console.log('� Storage Key:', storageKey);
        console.log('📜 Tous les logs trouvés:', allLogs);
        console.log('📜 Logs triés:', logs);
        console.log('📊 Nombre de logs:', logs.length);
        
        if (allLogs.length === 0) {
            console.log('⚠️ Aucun log trouvé. Clés localStorage disponibles:');
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.includes('affectationLogs')) {
                    console.log(`  - ${key}: ${JSON.parse(localStorage.getItem(key) || '[]').length} logs`);
                }
            }
        }

        // Générer le HTML de l'historique - Style Falcon Timeline AMÉLIORÉ
        let historiqueHTML = `
            <div class="card-body position-relative" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);">
                <div class="row">
                    <div class="col-lg-12">
                        <div class="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                            <div>
                                <p class="text-muted small px-3"><i class="fas fa-info-circle me-1"></i>Toutes les modifications effectuées sur cette affectation</p>
                            </div>
                            <span class="badge bg-info bg-gradient fs-2 px-3 py-2">${logs.length} action(s)</span>
                        </div>
                    </div>
                </div>
                <div class="timeline mt-3">
        `;
        
        if (logs.length === 0) {
            // Si pas de logs en session, créer un log de création
            historiqueHTML += `
                    <div class=" col-m timeline-item">
                        <div class="timeline-item-marker bg-success-soft">
                            <div class="bg-success rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; color: white;">
                                <i class="fas fa-check-circle fa-lg"></i>
                            </div>
                        </div>
                        <div class="timeline-item-content ps-4">
                            <h6 class="mb-1 fw-bold text-success">Création</h6>
                            <p class="text-muted small mb-2">${new Date(affectation.dateAffectation).toLocaleString('fr-FR')}</p>
                            <div class="bg-light p-3 rounded border border-light">
                                <small>
                                    <div class="mb-2"><strong>Vendeur:</strong> ${this.getVendeurName(affectation.vendeurId || affectation.managerId)}</div>
                                    <div class="mb-2"><strong>Guichet:</strong> ${this.getGuichetName(affectation.guichetId)}</div>
                                    <div class="mb-2"><strong>Magasin:</strong> ${this.getMagasinName(affectation.magasinId)}</div>
                                    <div><strong>Entreprise:</strong> ${this.getEntrepriseName(affectation.entrepriseId)}</div>
                                </small>
                            </div>
                        </div>
                    </div>
            `;
        } else {
            logs.forEach((log, index) => {
                let iconClass = 'fa-info-circle';
                let bgColorClass = 'bg-info-soft';
                let textColorClass = 'text-info';
                let actionText = log.action;
                let actionIcon = 'fa-info-circle';

                switch (log.action) {
                    case 'create':
                        iconClass = 'fa-plus-circle';
                        bgColorClass = 'bg-success-soft';
                        textColorClass = 'text-success';
                        actionText = 'Création';
                        actionIcon = 'fa-check-circle';
                        break;
                    case 'update':
                        iconClass = 'fa-edit';
                        bgColorClass = 'bg-primary-soft';
                        textColorClass = 'text-primary';
                        actionText = 'Modification';
                        actionIcon = 'fa-pen';
                        break;
                    case 'terminate':
                        iconClass = 'fa-stop-circle';
                        bgColorClass = 'bg-warning-soft';
                        textColorClass = 'text-warning';
                        actionText = 'Suspension';
                        actionIcon = 'fa-pause-circle';
                        break;
                    case 'resume':
                        iconClass = 'fa-play-circle';
                        bgColorClass = 'bg-success-soft';
                        textColorClass = 'text-success';
                        actionText = 'Reprise';
                        actionIcon = 'fa-play-circle';
                        break;
                    case 'delete':
                        iconClass = 'fa-trash';
                        bgColorClass = 'bg-danger-soft';
                        textColorClass = 'text-danger';
                        actionText = 'Suppression';
                        actionIcon = 'fa-trash-alt';
                        break;
                }

                const dateTime = new Date(log.timestamp).toLocaleString('fr-FR');
                const detailsHTML = Object.keys(log.details).length > 0 
                    ? `<div class="mt-3 pt-3 border-top">
                        <small class="d-block fw-bold text-muted mb-2"><i class="fas fa-note-sticky me-1"></i>Détails de la modification:</small>
                        <div class="details-grid">
                            ${Object.entries(log.details).map(([key, value]) => `
                                <div class="detail-item mb-2 p-2" style="background: #f8f9fa; border-left: 3px solid #667eea; border-radius: 4px;">
                                    <small class="text-muted"><strong>${key}:</strong></small>
                                    <div class="text-dark fw-500" style="font-size: 0.85rem;">${value || '<em>non spécifié</em>'}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>`
                    : '';

                historiqueHTML += `
                    <div class="timeline-item${index === logs.length - 1 ? '' : ''}">
                        <div class="timeline-item-marker ${bgColorClass}">
                            <div class="${textColorClass} rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background: currentColor; color: white; opacity: 0.9; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                <i class="fas ${actionIcon} fa-sm"></i>
                            </div>
                        </div>
                        <div class="timeline-item-content ps-4">
                            <div class="d-flex align-items-center justify-content-between mb-2">
                                <h6 class="mb-0 fw-bold ${textColorClass}" style="font-size: 1rem;">${actionText}</h6>
                                <span class="badge ${textColorClass === 'text-success' ? 'bg-success-soft text-success' : textColorClass === 'text-primary' ? 'bg-primary-soft text-primary' : textColorClass === 'text-warning' ? 'bg-warning-soft text-warning' : 'bg-danger-soft text-danger'} px-2 py-1 small">
                                    ${log.userName}
                                </span>
                            </div>
                            <p class="text-muted small mb-3" style="font-size: 0.8rem;">
                                <i class="fas fa-clock me-1"></i>${dateTime}
                            </p>
                            <div class="bg-light p-3 rounded border border-200 mb-2">
                                <div class="row g-2">
                                    <div class="col-lg-6">
                                        <small>
                                            <div class="mb-2">
                                                <strong><i class="fas fa-user me-1 text-info"></i>Utilisateur:</strong> 
                                                <span class="fw-semibold">${log.userName}</span>
                                            </div>
                                            ${log.userEmail ? `
                                            <div class="mb-2">
                                                <strong><i class="fas fa-envelope me-1 text-info"></i>Email:</strong> 
                                                <span class="text-truncate" title="${log.userEmail}">${log.userEmail}</span>
                                            </div>
                                            ` : ''}
                                        </small>
                                    </div>
                                    <div class="col-lg-6">
                                        <small>
                                            <div>
                                                <strong><i class="fas fa-shield-alt me-1 text-info"></i>Rôle:</strong> 
                                                <span class="badge bg-secondary">${log.userRole || 'user'}</span>
                                            </div>
                                        </small>
                                    </div>
                                </div>
                            </div>
                            ${detailsHTML}
                        </div>
                    </div>
                `;
            });
        }
        
        historiqueHTML += `
                </div>
            </div>
        `;

        // Ajouter du CSS pour la timeline Falcon si pas déjà présent
        if (!document.getElementById('timeline-styles')) {
            const style = document.createElement('style');
            style.id = 'timeline-styles';
            style.innerHTML = `
                .timeline {
                    position: relative;
                    padding: 10px 0;
                }
                
                .timeline::before {
                    content: '';
                    position: absolute;
                    left: 19px;
                    top: 50px;
                    bottom: 0;
                    width: 2px;
                    background: linear-gradient(180deg, #dee2e6 0%, #e9ecef 100%);
                }
                
                .timeline-item {
                    position: relative;
                    padding-left: 50px;
                    margin-bottom: 24px;
                }
                
                .timeline-item:last-child {
                    margin-bottom: 0;
                }
                
                .timeline-item:last-child::after {
                    content: '';
                    position: absolute;
                    left: 19px;
                    top: 50px;
                    bottom: -24px;
                    width: 2px;
                    background: transparent;
                }
                
                .timeline-item-marker {
                    position: absolute;
                    left: 0;
                    top: 0;
                    z-index: 10;
                }
                
                .timeline-item-content {
                    position: relative;
                    background: white;
                    padding: 16px;
                    border-radius: 8px;
                    border: 1px solid #e9ecef;
                    transition: all 0.3s ease;
                }
                
                .timeline-item:hover .timeline-item-content {
                    box-shadow: 0 8px 16px rgba(0,0,0,0.08);
                    border-color: #dee2e6;
                }
                
                .timeline-item-content h6 {
                    font-size: 0.95rem;
                    margin-bottom: 0.5rem;
                    letter-spacing: 0.5px;
                }
                
                .timeline-item-content .bg-light {
                    background: linear-gradient(135deg, #f8f9fa 0%, #f0f2f5 100%) !important;
                    border-left: 3px solid #667eea;
                    transition: background 0.3s ease;
                }
                
                .detail-item {
                    animation: slideIn 0.3s ease;
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                
            `;
            document.head.appendChild(style);
        }

        $('#historiqueAffectationContent').html(historiqueHTML);
        const modal = new bootstrap.Modal(document.getElementById('modalHistoriqueAffectation'));
        modal.show();
    }

    // Helper functions pour obtenir les noms
    getVendeurName(vendeurId) {
        if (!vendeurId) return 'N/A';
        if (typeof vendeurId === 'object') vendeurId = vendeurId._id;
        const vendeur = this.allVendeurs.find(v => v._id === vendeurId);
        return vendeur ? `${vendeur.prenom} ${vendeur.nom}` : 'N/A';
    }

    getGuichetName(guichetId) {
        if (!guichetId) return 'N/A';
        if (typeof guichetId === 'object') guichetId = guichetId._id;
        const guichet = this.allGuichets.find(g => g._id === guichetId);
        return guichet ? (guichet.nom_guichet || guichet.nom) : 'N/A';
    }

    getMagasinName(magasinId) {
        if (!magasinId) return 'N/A';
        if (typeof magasinId === 'object') magasinId = magasinId._id;
        const magasin = this.allMagasins.find(m => m._id === magasinId);
        return magasin ? (magasin.nom_magasin || magasin.nom) : 'N/A';
    }

    getEntrepriseName(entrepriseId) {
        if (!entrepriseId) return 'N/A';
        if (typeof entrepriseId === 'object') entrepriseId = entrepriseId._id;
        const entreprise = this.allEntreprises.find(e => e._id === entrepriseId);
        return entreprise ? (entreprise.nomEntreprise || entreprise.nom) : 'N/A';
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
