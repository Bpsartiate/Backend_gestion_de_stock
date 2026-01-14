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
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAllData();
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

        // Modal hidden reset
        $('#modalCreateAffectation').on('hidden.bs.modal', () => this.resetFormCreateAffectation());
        $('#modalTerminerAffectation').on('hidden.bs.modal', () => this.resetFormTerminer());
    }

    // ==================== CHARGEMENT DATA ====================
    async loadAllData() {
        try {
            // Afficher le spinner
            $('#affectationSpinner').show();
            $('#affectationEmpty').hide();
            
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
                if (vendRes.ok) {
                    const vendData = await vendRes.json();
                    // Charger TOUS les utilisateurs (sans filtre de rôle) pour les managerId
                    const allUsers = Array.isArray(vendData) ? vendData : vendData.utilisateurs || [];
                    // Garder aussi une liste filtrée pour le formulaire
                    this.allVendeurs = allUsers; // Charger TOUS
                    this.vendeursFiltres = allUsers.filter(v => v.role === 'vendeur' || v.role === 'manager') || [];
                    console.log('✅ Tous les utilisateurs chargés:', this.allVendeurs.length);
                    console.log('🔍 IDs disponibles:', this.allVendeurs.map(v => ({ id: v._id, role: v.role, nom: v.prenom + ' ' + v.nom })).slice(0, 5));
                } else {
                    this.allVendeurs = [];
                    this.vendeursFiltres = [];
                }
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
                    console.log('✅ Magasins chargés:', this.allMagasins.length, this.allMagasins.map(m => ({id: m._id, nom: m.nom})));
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
                console.log('✅ Guichets chargés:', this.allGuichets.length, this.allGuichets.map(g => ({id: g._id, nom: g.nom})));
            } catch (e) {
                console.error('Erreur guichets:', e);
                this.allGuichets = [];
            }

            // Charger les entreprises
            try {
                const entRes = await fetch(`${window.API_BASE}/api/business`, { headers });
                if (entRes.ok) {
                    const entData = await entRes.json();
                    this.allEntreprises = Array.isArray(entData) ? entData : entData.business || [];
                    console.log('✅ Entreprises chargées:', this.allEntreprises.length, this.allEntreprises.map(e => ({id: e._id, nom: e.nom})));
                } else {
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
            
            // Cacher le spinner et afficher les données
            this.toggleLoading(false);

        } catch (error) {
            console.error('Erreur chargement data:', error);
            this.showAlert('Erreur lors du chargement des données', 'danger');
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
            $('#filterEntreprise').append(`<option value="${e._id}">${e.nom}</option>`);
        });

        // Magasins
        $('#filterMagasin').html('<option value="">Tous les magasins</option>');
        this.allMagasins.forEach(m => {
            $('#filterMagasin').append(`<option value="${m._id}">${m.nom}</option>`);
        });

        // Guichets
        $('#filterGuichet').html('<option value="">Tous les guichets</option>');
        this.allGuichets.forEach(g => {
            $('#filterGuichet').append(`<option value="${g._id}">${g.nom}</option>`);
        });

        // Vendeurs - utiliser vendeursFiltres
        $('#filterVendeur').html('<option value="">Tous les vendeurs</option>');
        this.vendeursFiltres.forEach(v => {
            $('#filterVendeur').append(`<option value="${v._id}">${v.prenom} ${v.nom}</option>`);
        });
    }

    populateFormOptions() {
        // Form: Entreprises
        $('#affectEntreprise').html('<option value="">Sélectionner une entreprise</option>');
        this.allEntreprises.forEach(e => {
            $('#affectEntreprise').append(`<option value="${e._id}">${e.nom}</option>`);
        });

        // Form: Magasins
        $('#affectMagasin').html('<option value="">Sélectionner un magasin</option>');
        this.allMagasins.forEach(m => {
            $('#affectMagasin').append(`<option value="${m._id}">${m.nom}</option>`);
        });

        // Form: Guichets (vide initialement, rempli au changement de magasin)
        $('#affectGuichet').html('<option value="">Sélectionner un guichet</option>');

        // Form: Vendeurs - utiliser vendeursFiltres pour les formulaires
        $('#affectVendeur').html('<option value="">Sélectionner un vendeur</option>');
        this.vendeursFiltres.forEach(v => {
            $('#affectVendeur').append(`<option value="${v._id}">${v.prenom} ${v.nom}</option>`);
        });
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
            const affectVendeurId = a.vendeurId || a.managerId;
            
            const matchEntreprise = !entrepriseId || a.entrepriseId === entrepriseId;
            const matchMagasin = !magasinId || a.magasinId === magasinId;
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
    }

    displayAffectations() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const paginated = this.filteredAffectations.slice(start, end);

        const tbody = $('#affectationsTableBody');
        
        // Cacher le spinner
        $('#affectationSpinner').hide();

        if (paginated.length === 0) {
            tbody.html('<tr><td colspan="7" class="text-center py-4 text-muted"><i class="fas fa-inbox me-2"></i>Aucune affectation trouvée</td></tr>');
            $('#affectationInfo').text('Affichage 0 sur 0');
            this.displayPagination();
            return;
        }

        let rowsHtml = '';
        paginated.forEach(a => {
            // Utiliser managerId au lieu de vendeurId (selon structure API)
            const vendeurId = a.vendeurId || a.managerId;
            const vendeur = this.allVendeurs.find(v => v._id === vendeurId);
            
            // Gérer les cas où magasinId/entrepriseId peuvent être des objets ou des strings
            const guichetId = typeof a.guichetId === 'string' ? a.guichetId : (a.guichetId?._id || null);
            const magasinId = typeof a.magasinId === 'string' ? a.magasinId : (a.magasinId?._id || null);
            const entrepriseId = typeof a.entrepriseId === 'string' ? a.entrepriseId : (a.entrepriseId?._id || null);
            
            const guichet = guichetId ? this.allGuichets.find(g => g._id === guichetId) : null;
            const magasin = magasinId ? this.allMagasins.find(m => m._id === magasinId) : null;
            const entreprise = entrepriseId ? this.allEntreprises.find(e => e._id === entrepriseId) : null;

            const vendeurName = vendeur ? `${vendeur.prenom} ${vendeur.nom}` : 'Inconnu';
            const guichetName = guichet ? guichet.nom : 'N/A';
            const magasinName = magasin ? magasin.nom : 'N/A';
            const entrepriseName = entreprise ? entreprise.nom : 'N/A';

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
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="avatar avatar-sm rounded-circle bg-primary-soft text-primary fw-bold">
                                ${vendeurName.charAt(0)}
                            </div>
                            <div>
                                <strong>${vendeurName}</strong><br>
                                <small class="text-muted">${vendeurId || 'N/A'}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <i class="fas fa-cash-register text-info me-2"></i>${guichetName}
                    </td>
                    <td>
                        <i class="fas fa-store text-success me-2"></i>${magasinName}
                    </td>
                    <td>
                        <i class="fas fa-building text-warning me-2"></i>${entrepriseName}
                    </td>
                    <td>
                        <small>${dateStr}</small>
                    </td>
                    <td>
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

        tbody.html(rowsHtml);

        // Event listeners pour les boutons d'action
        $('.btnEditAffectation').on('click', (e) => this.editAffectation($(e.target).closest('button').data('id')));
        $('.btnTerminerAffectation').on('click', (e) => this.openTerminerModal($(e.target).closest('button').data('id')));
        $('.btnDeleteAffectation').on('click', (e) => this.deleteAffectation($(e.target).closest('button').data('id')));

        // Update info
        const total = this.filteredAffectations.length;
        const displayed = paginated.length;
        $('#affectationInfo').text(`Affichage ${displayed} sur ${total}`);
        $('#countAffectations').text(total);

        this.displayPagination();
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
        this.resetFormCreateAffectation();
        const modal = new bootstrap.Modal(document.getElementById('modalCreateAffectation'));
        modal.show();
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

            const res = await fetch(`${window.API_BASE}/api/protected/affectations`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Erreur lors de la création');
            }

            this.showAlert('Affectation créée avec succès', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalCreateAffectation')).hide();
            this.loadAllData();

        } catch (error) {
            console.error('Erreur save affectation:', error);
            this.showAlert(`Erreur: ${error.message}`, 'danger');
        }
    }

    editAffectation(affectationId) {
        const affectation = this.allAffectations.find(a => a._id === affectationId);
        if (!affectation) return;

        // Ouvrir le modal avec les données
        $('#affectEntreprise').val(affectation.entrepriseId);
        this.loadMagasinsForAffectation();
        
        setTimeout(() => {
            $('#affectMagasin').val(affectation.magasinId);
            this.loadGuichetsForAffectation();
            this.loadVendeursForAffectation();
        }, 100);

        setTimeout(() => {
            $('#affectGuichet').val(affectation.guichetId);
            $('#affectVendeur').val(affectation.vendeurId);
            $('#affectDate').val(affectation.dateAffectation.split('T')[0]);
            $('#affectObservations').val(affectation.observations || '');
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
                body: JSON.stringify({ status: 0 })
            });

            if (!res.ok) {
                throw new Error('Erreur lors de la terminaison');
            }

            this.showAlert('Affectation terminée avec succès', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalTerminerAffectation')).hide();
            this.loadAllData();

        } catch (error) {
            console.error('Erreur terminer affectation:', error);
            this.showAlert(`Erreur: ${error.message}`, 'danger');
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
        const vendeursAffectes = new Set(affectationsActives.map(a => a.vendeurId || a.managerId).filter(id => id));
        const vendeursSansAffectation = this.allVendeurs.filter(v => !vendeursAffectes.has(v._id)).length;

        // Durée moyenne
        const durees = affectationsTerminees.map(a => {
            const start = new Date(a.dateAffectation);
            const end = new Date(a.dateTerminaison || new Date());
            return (end - start) / (1000 * 60 * 60 * 24); // en jours
        });
        const dureeAverage = durees.length > 0 ? Math.round(durees.reduce((a, b) => a + b) / durees.length) : 0;

        $('#kpiActives').text(affectationsActives.length);
        $('#kpiInactives').text(affectationsTerminees.length);
        $('#kpiSansAffectation').text(vendeursSansAffectation);
        $('#kpiDureeAverage').text(`${dureeAverage}j`);
        
        $('#totalAffectations').text(affectationsActives.length);
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
}

// Initialiser l'application au chargement
$(document).ready(function() {
    window.affectationManager = new AffectationManager();
});
