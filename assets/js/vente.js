/**
 * MODULE VENTE - Gestion des ventes et mouvements de stock
 * Utilise les APIs backend pour gérer les ventes avec support USD/FC
 * 
 * @version 1.0
 * @author Système de Gestion
 */

class VenteManager {
    constructor() {
        this.API_BASE = window.API_BASE || 'https://backend-gestion-de-stock.onrender.com';
        this.TOKEN = this.getToken();
        this.currentUser = null;
        this.currentMagasin = null;
        this.currentGuichet = null;  // 🎯 Nouveau: guichet courant
        this.magasins = [];
        this.guichets = [];  // 🎯 Nouveau: liste des guichets
        this.rayons = [];
        this.produits = [];
        this.panier = [];
        this.ventesHistorique = []; // 📋 Cache des ventes pour modal détails
        
        // 📑 Pagination et Recherche
        this.allVentes = []; // Toutes les ventes
        this.filteredVentes = []; // Ventes filtrées
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchTerm = '';
        
        this.init();
    }

    /**
     * Récupère le token JWT du localStorage
     */
    getToken() {
        try {
            if (window.AuthProtection && typeof window.AuthProtection.getToken === 'function') {
                return window.AuthProtection.getToken();
            }
        } catch (e) {}
        
        const keys = ['token', 'authToken', 'jwt', 'accessToken', 'userToken'];
        for (const k of keys) {
            const v = localStorage.getItem(k);
            if (v) return v;
        }
        return null;
    }

    /**
     * En-têtes HTTP avec authentification
     */
    authHeaders() {
        return {
            'Authorization': `Bearer ${this.TOKEN}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Initialisation du module
     */
    async init() {
        console.log('🛒 Initialisation du module Vente...');
        console.log('📋 TOKEN disponible:', !!this.TOKEN);
        console.log('📋 localStorage tokens:', {
            token: !!localStorage.getItem('token'),
            authToken: !!localStorage.getItem('authToken'),
            jwt: !!localStorage.getItem('jwt'),
            accessToken: !!localStorage.getItem('accessToken'),
            userToken: !!localStorage.getItem('userToken')
        });
        
        // 📊 Afficher le loading des KPIs dès le démarrage
        this.showKPIsLoading(true);
        
        if (!this.TOKEN) {
            console.error('❌ Aucun token JWT trouvé! Impossible de charger les données.');
            this.showAlert('⚠️ Authentification requise. Veuillez vous reconnecter.', 'warning');
            this.showKPIsLoading(false);
            return;
        }
        
        try {
            await this.loadUserInfo();
            await this.loadMagasins();
            this.attachEventListeners();
            await this.loadVentesHistorique();
            console.log(' Module Vente initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation Vente:', error);
            this.showKPIsLoading(false);
        }
    }

    /**
     * Récupère les informations utilisateur
     */
    async loadUserInfo() {
        try {
            // Décoder le JWT pour obtenir l'ID utilisateur ET le rôle
            const payload = this.decodeJWT(this.TOKEN);
            if (!payload) {
                console.warn('⚠️ Impossible de décoder le token');
                return;
            }

            console.log('📋 Payload complet du token:', payload);

            // Chercher l'ID dans différents champs possibles
            const userId = payload.sub || payload._id || payload.id || payload.userId;
            
            // Chercher le rôle dans différents champs possibles
            let userRole = payload.role || payload.userRole || payload.type || window.USER_ROLE || 'VENDEUR';
            
            // Normaliser le rôle en majuscules
            userRole = userRole.toUpperCase();
            
            if (!userId) {
                console.warn('⚠️ Aucun ID utilisateur trouvé dans le token');
                return;
            }

            console.log(`🔑 ID utilisateur trouvé: ${userId}`);
            console.log(`👥 Rôle trouvé: ${userRole}`);
            
            // Stocker pour utilisation dans loadMagasins
            window.USER_ROLE = userRole;
            window.USER_ID = userId;
            
            const response = await fetch(`${this.API_BASE}/api/protected/profile/${userId}`, {
                headers: this.authHeaders()
            });
            
            if (response.ok) {
                this.currentUser = await response.json();
                console.log('👤 Utilisateur chargé:', this.currentUser.nom);
            } else {
                console.warn(`⚠️ Erreur chargement profil (${response.status})`);
            }
        } catch (error) {
            console.error('❌ Erreur chargement utilisateur:', error);
        }
    }

    /**
     * Décode un JWT pour extraire le payload
     */
    decodeJWT(token) {
        try {
            if (!token) {
                console.error('❌ Token vide');
                return null;
            }

            const parts = token.split('.');
            if (parts.length !== 3) {
                console.error('❌ Format JWT invalide (attendu 3 parties, reçu ' + parts.length + ')');
                return null;
            }
            
            const payload = parts[1];
            // Ajouter le padding si nécessaire
            const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
            const decoded = atob(paddedPayload);
            const result = JSON.parse(decoded);
            
            console.log(' JWT décodé avec succès');
            return result;
        } catch (e) {
            console.error('❌ Erreur décodage JWT:', e);
            console.log('🔍 Token reçu:', token ? token.substring(0, 50) + '...' : 'null');
            return null;
        }
    }

    /**
     * Charge la liste des magasins selon le rôle utilisateur
     */
    async loadMagasins() {
        try {
            // Utiliser le rôle mis à jour par loadUserInfo()
            const userRole = window.USER_ROLE || 'VENDEUR';
            const userId = window.USER_ID;
            
            console.log(`👤 Rôle utilisateur: ${userRole}, ID: ${userId}`);
            
            let endpoint = `${this.API_BASE}/api/protected/magasins`;
            
            const response = await fetch(endpoint, {
                headers: this.authHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            let allMagasins = await response.json();
            console.log(`📦 ${allMagasins.length} magasin(s) total(aux)`);
            
            // Filtrer selon le rôle
            if (userRole === 'ADMIN') {
                // ADMIN: voir tous les magasins
                this.magasins = allMagasins;
                console.log(`👑 ADMIN - Accès à ${this.magasins.length} magasin(s)`);
            } else if (userRole === 'SUPERVISEUR') {
                // SUPERVISEUR: voir magasins assignés aux superviseurs
                this.magasins = allMagasins.filter(m => m.superviseurs?.includes(userId));
                console.log(`👁️ SUPERVISEUR - Accès à ${this.magasins.length} magasin(s)`);
            } else if (userRole === 'VENDEUR') {
                // VENDEUR: voir seulement magasin assigné
                this.magasins = allMagasins.filter(m => m.vendeurs?.includes(userId));
                console.log(`💰 VENDEUR - Accès à ${this.magasins.length} magasin(s)`);
                
                // Auto-sélectionner si un seul magasin
                if (this.magasins.length === 1) {
                    this.currentMagasin = this.magasins[0]._id;
                }
            }
            
            this.displayMagasins();
            
            // 🆕 Restaurer le magasin depuis localStorage s'il existe
            const savedMagasinId = localStorage.getItem('venteSelectedMagasin');
            if (savedMagasinId && this.magasins.some(m => m._id === savedMagasinId)) {
                this.currentMagasin = savedMagasinId;
                console.log(`📍 Magasin restauré depuis localStorage: ${savedMagasinId}`);
            }
            
            // Mettre à jour le header avec le nom du magasin
            if (this.magasins.length > 0) {
                const magasin = this.magasins.find(m => m._id === this.currentMagasin) || this.magasins[0];
                const magasinName = magasin.nom_magasin || magasin.nom || 'Magasin';
                const badge = document.getElementById('currentMagasinName');
                if (badge) badge.textContent = magasinName;
            }
            
            // Charger les données du magasin sélectionné
            if (this.magasins.length > 0 && !this.currentMagasin) {
                this.currentMagasin = this.magasins[0]._id;
                await this.onMagasinChange(this.currentMagasin);
            } else if (this.currentMagasin) {
                await this.onMagasinChange(this.currentMagasin);
            }
            
        } catch (error) {
            console.error('❌ Erreur chargement magasins:', error);
            this.showAlert('❌ Erreur lors du chargement des magasins', 'danger');
        }
    }

    /**
     * Affiche les magasins dans le modal
     */
    displayMagasins() {
        const listDiv = document.getElementById('magasinsListVente');
        const spinnerDiv = document.getElementById('magasinsSpinnerVente');
        const errorDiv = document.getElementById('magasinsErrorVente');
        
        if (!listDiv) {
            console.warn('⚠️ Élément magasinsListVente non trouvé');
            return;
        }

        // Masquer le spinner et l'erreur
        if (spinnerDiv) spinnerDiv.style.display = 'none';
        if (errorDiv) errorDiv.style.display = 'none';

        console.log('🏪 Magasins reçus:', this.magasins);
        
        // Remplir la liste des magasins
        listDiv.innerHTML = this.magasins.map((magasin, idx) => {
            // Logger la structure complète du premier magasin pour déboguer
            if (idx === 0) {
                console.log('🔍 Structure du magasin 0:', magasin);
                console.log('   Keys disponibles:', Object.keys(magasin));
            }
            
            // Chercher le nom dans différents champs - nom_magasin est le champ réel!
            let nomMagasin = 'Magasin sans nom';
            if (magasin.nom_magasin) nomMagasin = magasin.nom_magasin;
            else if (magasin.nom) nomMagasin = magasin.nom;
            else if (magasin.name) nomMagasin = magasin.name;
            else if (magasin.label) nomMagasin = magasin.label;
            else if (magasin.title) nomMagasin = magasin.title;
            
            const adresseMagasin = magasin.adresse || magasin.address || magasin.localisation || magasin.city || 'Localisation non disponible';
            const isSelected = this.currentMagasin && magasin._id === this.currentMagasin;
            
            console.log(`🏪 Mag ${idx}: ID=${magasin._id}, nom="${nomMagasin}", adresse="${adresseMagasin}"`);
            
            return `
                <button type="button" class="btn btn-light w-100 text-start mb-2 p-3 border ${isSelected ? 'border-primary bg-primary bg-opacity-10' : ''}"
                        onclick="venteManager.selectMagasinModal('${magasin._id}', '${nomMagasin}')">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <h6 class="mb-1 fw-semibold">${nomMagasin}</h6>
                            <small class="text-muted">${adresseMagasin}</small>
                        </div>
                        ${isSelected ? '<i class="fas fa-check-circle text-primary fs-5"></i>' : '<i class="fas fa-store text-muted"></i>'}
                    </div>
                </button>
            `;
        }).join('');

        listDiv.style.display = 'block';
    }

    /**
     * Sélectionne un magasin depuis le modal
     */
    selectMagasinModal(magasinId, magasinNom) {
        this.currentMagasin = magasinId;
        
        // 🆕 Sauvegarder le magasin dans localStorage
        localStorage.setItem('venteSelectedMagasin', magasinId);
        
        // Mettre à jour le label du bouton
        const btnLabel = document.getElementById('magasinActuelTextVente');
        if (btnLabel) {
            btnLabel.textContent = magasinNom;
        }
        
        // Mettre à jour le badge du header
        const badgeLabel = document.getElementById('currentMagasinName');
        if (badgeLabel) {
            badgeLabel.textContent = magasinNom;
        }

        // Charger les produits
        this.onMagasinChange(magasinId);

        // Fermer le modal
        const modal = document.getElementById('modalSelectMagasinVente');
        if (modal) {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) modalInstance.hide();
        }

        console.log(`🏪 Magasin sélectionné: ${magasinNom}`);
    }

    /**
     * Change de magasin et charge rayons/produits + guichets
     */
    async onMagasinChange(magasinId) {
        if (!magasinId) return;
        
        this.currentMagasin = magasinId;
        this.currentGuichet = null;  // Réinitialiser le guichet
        console.log(`🏪 Magasin sélectionné: ${magasinId}`);
        
        try {
            await this.loadGuichets(magasinId);  // 🎯 Charger les guichets du magasin
            await this.loadProduits(magasinId);
            await this.loadVentesHistorique();  // 📊 Charger les ventes et KPIs
        } catch (error) {
            console.error('❌ Erreur changement magasin:', error);
        }
    }



    /**
     * 🎯 Charge les guichets d'un magasin
     */
    async loadGuichets(magasinId) {
        try {
            const response = await fetch(
                `${this.API_BASE}/api/protected/magasins/${magasinId}/guichets`,
                { headers: this.authHeaders() }
            );
            
            if (response.ok) {
                this.guichets = await response.json();
                // Auto-sélectionner le premier guichet s'il y en a un
                if (this.guichets.length > 0) {
                    this.currentGuichet = this.guichets[0]._id;
                    console.log(`🪟 ${this.guichets.length} guichet(s) chargé(s), sélectionné: ${this.guichets[0].nom_guichet}`);
                    this.updateGuichetDisplay();  // 🎯 Mettre à jour l'affichage
                }
            } else {
                console.warn(`⚠️ Erreur chargement guichets: ${response.status}`);
                this.guichets = [];
            }
        } catch (error) {
            console.error('❌ Erreur chargement guichets:', error);
            this.guichets = [];
        }
    }

    /**
     * 🪟 Met à jour l'affichage du guichet sélectionné
     */
    updateGuichetDisplay() {
        const guichetSelected = document.getElementById('guichetSelected');
        const guichetVendeur = document.getElementById('guichetVendeur');
        
        if (!guichetSelected || !guichetVendeur) return;
        
        if (this.currentGuichet && this.guichets.length > 0) {
            const guichet = this.guichets.find(g => g._id === this.currentGuichet);
            if (guichet) {
                guichetSelected.textContent = `${guichet.nom_guichet} (${guichet.code || 'N/A'})`;
                const vendeur = guichet.vendeurPrincipal;
                if (vendeur) {
                    guichetVendeur.textContent = `Vendeur: ${vendeur.prenom} ${vendeur.nom}`;
                } else {
                    guichetVendeur.textContent = '';
                }
            }
        } else {
            guichetSelected.textContent = 'Aucun guichet';
            guichetVendeur.textContent = '';
        }
    }

    /**
     * 🪟 Affiche les guichets dans le modal de sélection
     */
    displayGuichets() {
        const spinner = document.getElementById('guichetsSpinner');
        const list = document.getElementById('guichetsList');
        const error = document.getElementById('guichetsError');
        
        if (!list) return;
        
        // Vérifier qu'un magasin est sélectionné
        if (!this.currentMagasin) {
            error.textContent = '⚠️ Veuillez d\'abord sélectionner un magasin';
            error.style.display = 'block';
            spinner.style.display = 'none';
            list.style.display = 'none';
            return;
        }
        
        error.style.display = 'none';
        
        if (!this.guichets || this.guichets.length === 0) {
            spinner.style.display = 'none';
            list.innerHTML = '<p class="text-center text-muted py-3">Aucun guichet disponible</p>';
            list.style.display = 'block';
            return;
        }
        
        spinner.style.display = 'none';
        
        // 🎯 FILTRE: Séparer guichets actifs et inactifs
        const guichetsActifs = this.guichets.filter(g => g.status === 1);
        const guichetsInactifs = this.guichets.filter(g => g.status !== 1);
        
        let html = '';
        
        // Afficher guichets ACTIFS
        if (guichetsActifs.length > 0) {
            html += guichetsActifs.map(guichet => `
                <div class="card mb-2 cursor-pointer ${guichet._id === this.currentGuichet ? 'border-warning border-2' : ''}" 
                     onclick="venteManager.selectGuichet('${guichet._id}')" 
                     style="cursor: pointer; transition: all 0.2s ease; background: #fff;">
                    <div class="card-body p-2">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <h6 class="mb-1 fw-bold text-dark">
                                    <i class="fas fa-window-maximize me-2" style="color: #f7931e;"></i>${guichet.nom_guichet}
                                    <span class="badge bg-success ms-2">Actif</span>
                                </h6>
                                <small class="text-muted">Code: ${guichet.code || 'N/A'}</small>
                                ${guichet.vendeurPrincipal ? `<br><small class="text-info">Vendeur: <strong>${guichet.vendeurPrincipal.prenom} ${guichet.vendeurPrincipal.nom}</strong></small>` : ''}
                            </div>
                            <div>
                                ${guichet._id === this.currentGuichet ? '<i class="fas fa-check-circle fa-2x text-success"></i>' : '<i class="fas fa-circle fa-2x text-secondary" style="opacity: 0.3;"></i>'}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        // Afficher guichets INACTIFS (désactivés)
        if (guichetsInactifs.length > 0) {
            html += '<div class="mb-3"><small class="text-muted fw-bold">⚠️ Guichets Inactifs (Non disponibles)</small></div>';
            html += guichetsInactifs.map(guichet => `
                <div class="card mb-2" 
                     style="cursor: not-allowed; transition: all 0.2s ease; background: #f8f9fa; opacity: 0.6;">
                    <div class="card-body p-2" onclick="event.stopPropagation(); window.venteManager.showAlert('❌ Ce guichet est inactif. Impossible de faire une vente.', 'danger');">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <h6 class="mb-1 fw-bold text-muted">
                                    <i class="fas fa-window-maximize me-2" style="color: #999;"></i>${guichet.nom_guichet}
                                    <span class="badge bg-danger ms-2">Inactif</span>
                                </h6>
                                <small class="text-muted">Code: ${guichet.code || 'N/A'}</small>
                                ${guichet.vendeurPrincipal ? `<br><small class="text-muted" style="opacity: 0.6;">Vendeur: <strong>${guichet.vendeurPrincipal.prenom} ${guichet.vendeurPrincipal.nom}</strong></small>` : ''}
                            </div>
                            <div>
                                <i class="fas fa-lock fa-2x text-danger" style="opacity: 0.5;"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        list.innerHTML = html || '<p class="text-center text-muted py-3">Aucun guichet disponible</p>';
        list.style.display = 'block';
    }

    /**
     * 🪟 Sélectionne un guichet
     */
    selectGuichet(guichetId) {
        this.currentGuichet = guichetId;
        console.log(`🪟 Guichet sélectionné: ${guichetId}`);
        this.updateGuichetDisplay();
        this.displayGuichets();  // Rafraîchir l'affichage du modal
        
        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalSelectGuichet'));
        if (modal) modal.hide();
    }

    /**
     * Charge les produits d'un magasin
     */
    async loadProduits(magasinId) {
        try {
            const response = await fetch(
                `${this.API_BASE}/api/protected/magasins/${magasinId}/produits`,
                { headers: this.authHeaders() }
            );
            
            if (response.ok) {
                this.produits = await response.json();
                this.displayProduits();
                console.log(`📦 ${this.produits.length} produit(s) chargé(s)`);
            }
        } catch (error) {
            console.error('❌ Erreur chargement produits:', error);
        }
    }

    /**
     * Affiche la liste élégante des produits
     */
    displayProduits() {
        const grid = document.getElementById('produitsGridView');
        
        if (!grid) {
            console.warn('⚠️ Élément produitsGridView non trouvé');
            return;
        }
        
        if (this.produits.length === 0) {
            grid.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-inbox fa-2x mb-2 opacity-50"></i>
                    <p class="small">Aucun produit disponible</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.produits.map((produit, index) => {
            // Nom du produit - champ: designation
            const nomProduit = produit.designation || 
                              produit.nomProduit || 
                              produit.nom || 
                              produit.name || 
                              `Produit ${index + 1}`;
            
            // Image - champ: photoUrl
            let imageSrc = produit.photoUrl || 
                          produit.imageProduit || 
                          produit.image || 
                          'assets/img/placeholder.svg';
            
            // Rayon - champ: rayonId.nomRayon
            let rayonNom = 'Non défini';
            if (produit.rayonId?.nomRayon) {
                rayonNom = produit.rayonId.nomRayon;
            } else if (produit.rayonId?.nom) {
                rayonNom = produit.rayonId.nom;
            } else if (typeof produit.rayon === 'string') {
                rayonNom = produit.rayon;
            }
            
            // Type de produit - champ: typeProduitId (objet imbriqué)
            let typeNom = '';
            let typeIcone = '📦';
            let unitePrincipale = '';
            if (produit.typeProduitId) {
                typeNom = produit.typeProduitId.nomType || 'Type';
                typeIcone = produit.typeProduitId.icone || '📦';
                unitePrincipale = produit.typeProduitId.unitePrincipale || '';
            }
            
            // Quantité
            const quantite = produit.quantiteActuelle || 0;
            
            // Prix
            const prix = produit.prixUnitaire || 0;
            
            console.log(`📦 Prod ${index + 1}: nom="${nomProduit}", type="${typeNom}" (${typeIcone}), rayon="${rayonNom}", unité="${unitePrincipale}", prix=${prix}, qty=${quantite}`);
            
            return `
            <div class="d-flex align-items-center gap-2 p-2 border-bottom cursor-pointer transition-all"
                 style="cursor: pointer; transition: background-color 0.2s, transform 0.2s; min-height: 70px;"
                 onmouseenter="this.style.backgroundColor='#f8f9fa'; this.style.transform='translateX(3px)';"
                 onmouseleave="this.style.backgroundColor='transparent'; this.style.transform='translateX(0)';"
                 onclick="venteManager.selectProduit('${produit._id}')">
                
                <!-- Image Compacte -->
                <div style="flex-shrink: 0; position: relative;">
                    <img src="${imageSrc}" 
                         alt="${nomProduit}"
                         style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #e0e0e0;"
                         onerror="this.src='assets/img/placeholder.svg'">
                    <span class="badge badge-sm bg-success" style="position: absolute; bottom: -8px; right: -8px; font-size: 0.65rem; padding: 3px 5px;">
                        ${quantite}
                    </span>
                </div>
                
                <!-- Infos Compactées -->
                <div class="flex-grow-1 min-width-0" style="overflow: hidden;">
                    <div class="fw-semibold text-dark" style="font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${nomProduit}
                    </div>
                    <div class="small text-muted" style="font-size: 0.65rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${typeIcone} ${typeNom} ${unitePrincipale ? '· ' + unitePrincipale : ''} ${rayonNom ? '· ' + rayonNom : ''}
                    </div>
                </div>
                
                <!-- Prix & Chevron -->
                <div class="text-end flex-shrink-0" style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
                    <div style="font-weight: 600; color: #0d6efd; font-size: 0.95rem;">
                        ${prix.toFixed(2)}
                    </div>
                    <i class="fas fa-chevron-right" style="opacity: 0.4; font-size: 0.85rem;"></i>
                </div>
            </div>
        `; }).join('');
    }

    /**
     * Sélectionne un produit et affiche les détails
     */
    selectProduit(produitId) {
        const produit = this.produits.find(p => p._id === produitId);
        if (!produit) {
            console.error('❌ Produit non trouvé');
            return;
        }

        this.currentProduit = produit;
        const nomProduit = produit.designation || produit.nomProduit || produit.nom || 'Sans nom';
        console.log(`📦 Produit sélectionné: ${nomProduit}`);

        // Remplir le select caché pour compatibilité
        const select = document.getElementById('venteSelectProduit');
        if (select) {
            select.value = produitId;
        }

        // Afficher les détails du produit sélectionné
        this.displaySelectedProduit();
        
        // Initialiser la quantité et le prix
        document.getElementById('venteQuantite').value = 1;
        document.getElementById('ventePrix').value = (produit.prixUnitaire || 0).toFixed(2);
        document.getElementById('ventePrixSuggere').textContent = (produit.prixUnitaire || 0).toFixed(2);
        
        this.updateVenteTotalPartiel();
    }

    /**
     * Affiche les détails du produit sélectionné dans le panel 2
     */
    async displaySelectedProduit() {
        const alertBox = document.getElementById('venteProduitSelected');
        if (!alertBox || !this.currentProduit) return;

        const produit = this.currentProduit;
        const nomProduit = produit.designation || produit.nomProduit || produit.nom || 'Sans nom';
        const rayonNom = produit.rayonId?.nomRayon || produit.rayonId?.nom || 'Non défini';
        let quantite = produit.quantiteActuelle || 0;  // Quantité totale (unités)
        const imageSrc = produit.photoUrl || 'assets/img/placeholder.svg';
        
        // 🆕 Stocker les infos de stock pour usage dans les handlers
        window.currentStockInfo = {
            quantiteActuelle: quantite,  // 320 unités
            lotsDisponibles: 0  // Sera mis à jour ci-dessous
        };
        
        // Type de produit - champ: typeProduitId (objet imbriqué)
        let typeNom = 'Non défini';
        let typeIcone = '📦';
        let unitePrincipale = '';
        let typeStockage = 'simple';  // 🆕 PHASE 1 v2
        if (produit.typeProduitId) {
            typeNom = produit.typeProduitId.nomType || 'Non défini';
            typeIcone = produit.typeProduitId.icone || '📦';
            unitePrincipale = produit.typeProduitId.unitePrincipale || '';
            typeStockage = produit.typeProduitId.typeStockage || 'simple';  // 🆕 PHASE 1 v2
        }
        
        // Récupérer le magasin sélectionné du sélecteur ou de currentMagasin
        let magasinNom = 'Non défini';
        if (this.currentMagasin) {
            const magasinInfo = this.magasins.find(m => m._id === this.currentMagasin);
            if (magasinInfo) {
                magasinNom = magasinInfo.nom_magasin || magasinInfo.nom || magasinInfo.name || 'Non défini';
            }
        }
        
        console.log(`📦 Affichage produit: ${nomProduit}, Type: ${typeNom}, Stock: ${quantite}, TypeStockage: ${typeStockage}`);
        
        // Mettre à jour l'image de fond
        const bgImg = document.getElementById('venteProduitBgImage');
        if (bgImg) bgImg.src = imageSrc;
        
        // Mettre à jour les infos
        const nomEl = document.getElementById('venteProduitNom');
        if (nomEl) nomEl.textContent = nomProduit;
        
        const magasinEl = document.getElementById('venteProduitMagasin');
        if (magasinEl) magasinEl.textContent = magasinNom;
        
        const rayonEl = document.getElementById('venteProduitRayon');
        if (rayonEl) rayonEl.textContent = rayonNom;
        
        const stockEl = document.getElementById('venteProduitStock');
        if (stockEl) stockEl.textContent = quantite;
        
        // 🆕 FIX: Affichage stock en temps réel - NE PAS modifier parentElement.innerHTML
        const stockRealEl = document.getElementById('venteProduitStockReal');
        if (stockRealEl) {
            stockRealEl.textContent = quantite;  // Juste le nombre
        }
        
        // Ajouter le type et l'unité
        const typeLabel = document.getElementById('venteProduitType');
        if (typeLabel) {
            typeLabel.innerHTML = `${typeIcone} ${typeNom}`;
            typeLabel.style.display = 'block';
        }
        
        const uniteLabel = document.getElementById('venteProduitUnite');
        if (uniteLabel && unitePrincipale) {
            uniteLabel.textContent = unitePrincipale;
            uniteLabel.style.display = 'block';
        }
        
        // 🆕 FIX PHASE 1 v2: Gérer le Mode de Vente pour LOTs
        const typeVenteDiv = document.getElementById('typeVenteDiv');
        const radioPartiel = document.getElementById('radioPartiel');
        const radioEntier = document.getElementById('radioEntier');
        const typeVenteDesc = document.getElementById('typeVenteDescription');
        
        if (typeStockage === 'lot') {
            console.log(`🎯 LOT Product detected! Setting mode selector visible`);
            // Afficher le sélecteur pour les LOTs
            if (typeVenteDiv) typeVenteDiv.style.display = 'block';
            
            // 🆕 PHASE 1 v2: Charger le nombre réel de LOTs disponibles
            try {
                const lotsResponse = await fetch(
                    `${this.API_BASE}/api/protected/produits/${produit._id}/lots-disponibles`,
                    { headers: this.authHeaders() }
                );
                
                if (lotsResponse.ok) {
                    const lotsData = await lotsResponse.json();
                    const lotsCount = lotsData.lotsDisponibles || 0;
                    
                    // 🆕 Stocker le lotsCount pour usage dans les handlers
                    window.currentStockInfo.lotsDisponibles = lotsCount;
                    console.log(`📦 LOTs disponibles: ${lotsCount}`);
                    
                    // 🆕 Afficher le stock selon le mode sélectionné
                    this.updateStockDisplay();
                } else {
                    console.warn('⚠️ Impossible de charger les LOTs disponibles');
                }
            } catch (error) {
                console.error('❌ Erreur fetch lots-disponibles:', error);
            }
            
            // 🆕 NE PAS modifier l'état des radios! 
            // Seulement mettre à jour la description basée sur l'état COURANT
            if (typeVenteDesc) {
                if (radioPartiel && radioPartiel.checked) {
                    typeVenteDesc.innerHTML = '✂️ Réduire les quantités du LOT par unités de vente';
                    console.log(`✅ Description updated to "partiel"`);
                } else if (radioEntier && radioEntier.checked) {
                    typeVenteDesc.innerHTML = '🚀 Vendre le LOT entier (pas de réduction possible)';
                    console.log(`✅ Description updated to "entier"`);
                } else {
                    // Par défaut à "partiel" si aucun n'est sélectionné
                    typeVenteDesc.innerHTML = '✂️ Réduire les quantités du LOT par unités de vente';
                    console.log(`✅ Description set to default "partiel"`);
                }
            }
        } else {
            // Masquer le sélecteur pour les SIMPLE
            if (typeVenteDiv) typeVenteDiv.style.display = 'none';
            console.log(`📦 SIMPLE Product - Mode selector hidden`);
        }
        
        // 🆕 Récupérer le VRAI prix du produit
        const prixInput = document.getElementById('ventePrix');
        const prixUnitaire = produit.prixUnitaire || 0;
        if (prixInput) {
            prixInput.value = prixUnitaire.toFixed(2);
        }
        
        const prixSuggere = document.getElementById('ventePrixSuggere');
        if (prixSuggere) {
            prixSuggere.textContent = prixUnitaire.toFixed(2);
        }
        
        // Mettre à jour le total automatiquement
        this.updateVenteTotalPartiel();
        
        alertBox.style.display = 'flex';
    }

    /**
     * Efface la sélection du produit
     */
    clearSelection() {
        this.currentProduit = null;
        const alertBox = document.getElementById('venteProduitSelected');
        if (alertBox) {
            alertBox.style.display = 'none';
            // Ne pas vider le innerHTML - on en aura besoin pour le prochain produit
        }
        const select = document.getElementById('venteSelectProduit');
        if (select) {
            select.value = '';
        }
        document.getElementById('venteQuantite').value = 1;
        document.getElementById('ventePrix').value = '';
    }

    /**
     * Événement: changement de produit
     */
    onProduitChange(produitId) {
        if (!produitId) return;
        
        const produit = this.produits.find(p => p._id === produitId);
        if (!produit) return;
        
        console.log(`📦 Produit sélectionné: ${produit.nomProduit}`);
        document.getElementById('venteProduitStock').textContent = produit.quantiteActuelle || 0;
        document.getElementById('ventePrix').value = (produit.prixUnitaire || 0).toFixed(2);
        document.getElementById('ventePrixSuggere').textContent = (produit.prixUnitaire || 0).toFixed(2);
        document.getElementById('venteQuantite').value = 1;
        this.updateVenteTotalPartiel();
    }

    /**
     * Augmente la quantité
     */
    increaseQte() {
        const input = document.getElementById('venteQuantite');
        input.value = parseInt(input.value || 0) + 1;
        this.updateVenteTotalPartiel();
    }

    /**
     * Diminue la quantité
     */
    decreaseQte() {
        const input = document.getElementById('venteQuantite');
        const val = parseInt(input.value || 1) - 1;
        input.value = Math.max(1, val);
        this.updateVenteTotalPartiel();
    }

    /**
     * Met à jour le total partiel de la vente
     */
    updateVenteTotalPartiel() {
        const qty = parseInt(document.getElementById('venteQuantite').value || 0);
        const prix = parseFloat(document.getElementById('ventePrix').value || 0);
        const total = qty * prix;
        const tauxFC = parseFloat(document.getElementById('venteTauxFC').value || 0);
        
        document.getElementById('venteTotalPartiel').textContent = total.toFixed(2);
        
        if (tauxFC > 0) {
            const totalFC = total * tauxFC;
            document.getElementById('venteTotalFC').textContent = totalFC.toFixed(0) + ' FC';
        } else {
            document.getElementById('venteTotalFC').textContent = '-';
        }
    }

    /**
     * 🆕 Met à jour l'affichage du stock selon le Mode de Vente sélectionné
     */
    updateStockDisplay() {
        const stockRealEl = document.getElementById('venteProduitStockReal');
        if (!stockRealEl) return;
        
        const radioPartiel = document.getElementById('radioPartiel');
        const radioEntier = document.getElementById('radioEntier');
        const stockInfo = window.currentStockInfo || {};
        
        if (radioPartiel && radioPartiel.checked) {
            // Mode "Par unités" → Afficher quantiteActuelle (320)
            const stock = stockInfo.quantiteActuelle || 0;
            stockRealEl.textContent = stock;
            console.log(`📊 Stock affichage: ${stock} UNITÉS (mode par unités)`);
        } else if (radioEntier && radioEntier.checked) {
            // Mode "LOT entier" → Afficher lotsDisponibles (9)
            const stock = stockInfo.lotsDisponibles || 0;
            stockRealEl.textContent = stock;
            console.log(`📊 Stock affichage: ${stock} LOTS (mode LOT entier)`);
        }
    }

    /**
     * Ajoute un article au panier
     */
    addToPanier() {
        const btnAjouter = document.getElementById('btnAjouterPanier');
        
        const produitId = this.currentProduit?._id;
        const magasinId = this.currentMagasin;
        const quantite = parseInt(document.getElementById('venteQuantite').value || 0);
        const prix = parseFloat(document.getElementById('ventePrix').value || 0);
        const observations = document.getElementById('venteObservations').value;

        if (!produitId || !magasinId || quantite < 1) {
            this.showAlert('⚠️ Veuillez sélectionner un produit, un magasin et une quantité', 'warning');
            return;
        }

        const produit = this.currentProduit;
        if (!produit) {
            this.showAlert('⚠️ Produit non trouvé', 'warning');
            return;
        }

        // 🆕 PHASE 1 v2: Vérifier le type de produit
        const typeStockage = produit.typeProduitId?.typeStockage || 'simple';
        
        // Vérification stock
        if (produit.quantiteActuelle < quantite) {
            this.showAlert(`⚠️ Stock insuffisant! Disponible: ${produit.quantiteActuelle}`, 'warning');
            return;
        }

        // Afficher le loading
        if (btnAjouter) {
            btnAjouter.disabled = true;
            const originalHTML = btnAjouter.innerHTML;
            btnAjouter.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Ajout en cours...';

            setTimeout(() => {
                btnAjouter.disabled = false;
                btnAjouter.innerHTML = originalHTML;
            }, 500);
        }

        // Récupérer le nom du magasin
        const magasinInfo = this.magasins.find(m => m._id === magasinId);
        const nomMagasin = magasinInfo?.nom_magasin || magasinInfo?.nom || 'Magasin inconnu';

        // 🆕 PHASE 1 v2: Ajouter typeVente pour LOTs
        const rayonId = produit.rayonId?._id || produit.rayonId;
        const typeVente = typeStockage === 'lot' ? 
            (document.querySelector('input[name="venteTypeVente"]:checked')?.value || 'partiel') : 
            undefined;  // undefined pour SIMPLE
        
        const panierItem = {
            produitId,
            nomProduit: produit.designation || produit.nomProduit || 'Produit',
            nomMagasin: nomMagasin,
            magasinId: magasinId,
            rayonId: rayonId,
            quantite,
            prix,
            total: quantite * prix,
            observations,
            typeStockage,  // 🆕 PHASE 1 v2
            typeVente  // 🆕 PHASE 1 v2: Mode de vente pour LOTs
        };
        
        this.panier.push(panierItem);

        console.log(`✅ Article ajouté au panier (Phase 1 v2):`, {
            produit: produit.designation,
            type: typeStockage,
            typeVente: typeVente,
            quantite: quantite,
            magasin: nomMagasin,
            rayonId: rayonId,
            prixUnitaire: prix,
            total: (quantite * prix).toFixed(2)
        });

        // Reset formulaire
        this.displayPanier();
        this.clearSelection();
        document.getElementById('venteQuantite').value = 1;
        document.getElementById('venteObservations').value = '';
        this.updateVenteTotalPartiel();
    }

    /**
     * Affiche le panier
     */
    displayPanier() {
        const liste = document.getElementById('panieListe');
        const nbArticles = document.getElementById('paniernbArticles');
        const total = document.getElementById('panierTotal');
        const sousTotal = document.getElementById('panierSousTotal');
        const qteTotale = document.getElementById('panierQteTotale');
        const btnValider = document.getElementById('btnValiderVente');
        const tauxFC = parseFloat(document.getElementById('venteTauxFC').value || 0);
        const panierTotalFCDiv = document.getElementById('panierTotalFCDiv');
        const panierTotalFC = document.getElementById('panierTotalFC');

        if (this.panier.length === 0) {
            liste.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-shopping-cart fa-2x mb-2 opacity-50"></i>
                    <p class="small">Panier vide</p>
                </div>
            `;
            nbArticles.textContent = '(0 articles)';
            total.textContent = '0.00';
            sousTotal.textContent = '0.00';
            qteTotale.textContent = '0';
            panierTotalFCDiv.style.display = 'none';
            btnValider.disabled = true;
            return;
        }

        const totalMontant = this.panier.reduce((sum, item) => sum + item.total, 0);
        const totalQuantite = this.panier.reduce((sum, item) => sum + item.quantite, 0);

        liste.innerHTML = this.panier.map((item, idx) => `
            <div class="panier-item">
                <div class="flex-grow-1">
                    <h6 class="mb-1 small fw-semibold">${item.nomProduit}</h6>
                    <small class="text-muted d-block">${item.quantite} x ${item.prix.toFixed(2)} USD</small>
                </div>
                <div class="text-end">
                    <div class="small fw-semibold text-dark">${item.total.toFixed(2)} USD</div>
                    <button class="btn btn-sm btn-outline-danger mt-1" onclick="venteManager.removePanierItem(${idx})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        nbArticles.textContent = `(${this.panier.length} articles)`;
        total.textContent = totalMontant.toFixed(2);
        sousTotal.textContent = totalMontant.toFixed(2);
        qteTotale.textContent = totalQuantite;

        // Conversion FC
        if (tauxFC > 0) {
            const totalMontantFC = totalMontant * tauxFC;
            panierTotalFC.textContent = totalMontantFC.toFixed(0) + ' FC';
            panierTotalFCDiv.style.display = 'flex';
        } else {
            panierTotalFCDiv.style.display = 'none';
        }

        btnValider.disabled = false;
    }

    /**
     * Supprime un article du panier
     */
    removePanierItem(index) {
        const nomProduit = this.panier[index].nomProduit;
        this.panier.splice(index, 1);
        console.log(`🗑️ Article supprimé: ${nomProduit}`);
        this.displayPanier();
    }

    /**
     * Vide le panier
     */
    clearPanier() {
        const btnVider = document.getElementById('btnViderPanier');
        
        if (!confirm('Vider le panier?')) return;
        
        // Afficher le loading
        if (btnVider) {
            btnVider.disabled = true;
            const originalHTML = btnVider.innerHTML;
            btnVider.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Suppression...';

            setTimeout(() => {
                this.panier = [];
                this.displayPanier();
                console.log('🗑️ Panier vidé');
                
                btnVider.disabled = false;
                btnVider.innerHTML = originalHTML;
            }, 500);
        }
    }

    /**
     * Valide la vente en envoyant au serveur
     */
    async validateVente() {
        const btnValider = document.getElementById('btnValiderVente');
        
        if (this.panier.length === 0) {
            this.showAlert('⚠️ Panier vide', 'warning');
            return;
        }

        if (!this.currentMagasin) {
            this.showAlert('⚠️ Veuillez sélectionner un magasin', 'warning');
            return;
        }

        // Afficher le loading
        if (btnValider) {
            btnValider.disabled = true;
            const originalHTML = btnValider.innerHTML;
            btnValider.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Traitement...';

            // Restaurer le bouton à la fin (succès ou erreur)
            const restoreButton = () => {
                if (btnValider) {
                    btnValider.disabled = false;
                    btnValider.innerHTML = originalHTML;
                }
            };

            const magasinId = this.currentMagasin;
            const modePaiement = document.getElementById('ventePaiement').value;
            const client = document.getElementById('venteClient').value;
            const tauxFC = parseFloat(document.getElementById('venteTauxFC').value || 0);

            console.log('💾 Validation de la vente...');
            const totalMontant = this.panier.reduce((sum, item) => sum + item.total, 0);

            try {
            // 🆕 PHASE 1 v2: Préparer les articles avec typeVente pour LOTs
            const articles = this.panier.map(item => ({
                produitId: item.produitId,
                designation: item.nomProduit,
                rayonId: item.rayonId || undefined,
                quantite: item.quantite,
                prixUnitaire: item.prix,
                montant: item.total,
                observations: item.observations,
                typeVente: item.typeVente  // 🆕 PHASE 1 v2: Mode de vente pour LOTs
            }));

            console.log('📦 Articles à envoyer (Phase 1 v2):', JSON.stringify(articles, null, 2));
            console.log('🔍 Détail de chaque article:');
            articles.forEach((art, idx) => {
                console.log(`  [${idx}] produitId=${art.produitId}, rayonId=${art.rayonId}, designation=${art.designation}, qty=${art.quantite}, typeVente=${art.typeVente}`);
            });

                // Créer la vente via la nouvelle API
                const response = await fetch(
                    `${this.API_BASE}/api/protected/ventes`,
                    {
                        method: 'POST',
                        headers: this.authHeaders(),
                        body: JSON.stringify({
                            magasinId,
                            guichetId: this.currentGuichet || undefined,  // 🎯 Ajouter le guichetId
                            articles,
                            client: client || undefined,
                            modePaiement,
                            tauxFC: tauxFC > 0 ? tauxFC : undefined
                        })
                    }
                );

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Erreur lors de la création de la vente');
                }

                const result = await response.json();
                
                console.log(` Vente créée: ${result.vente._id}`);
                this.showAlert(` Vente enregistrée!\nMontant: ${totalMontant.toFixed(2)} USD${tauxFC > 0 ? ' (' + (totalMontant * tauxFC).toFixed(0) + ' FC)' : ''}`, 'success');
                
                // 🆕 Réinitialiser et actualiser TOUS les panneaux
                this.panier = [];
                this.displayPanier();
                document.getElementById('venteClient').value = '';
                document.getElementById('venteTauxFC').value = '';
                
                // 🆕 Actualiser COMPLÈTEMENT: produits (stock), ventes et KPIs
                console.log('🔄 Actualisation complète après vente...');
                await this.loadProduits(this.currentMagasin);  // Rafraîchir les produits (stock)
                await this.loadVentesHistorique();  // Rafraîchir les ventes et KPIs
                
                console.log(' Vente finalisée et panneaux actualisés');
                restoreButton();
            } catch (error) {
                console.error('❌ Erreur vente:', error);
                this.showAlert('❌ Erreur: ' + error.message, 'danger');
                restoreButton();
            }
        }
    }

    /**
     * Charge l'historique des ventes du jour
     */
    async loadVentesHistorique() {
        try {
            // Afficher le loading dans les KPIs et la table
            this.showKPIsLoading(true);
            
            // Afficher le loader dans le tbody
            const loadingRow = document.getElementById('ventesLoadingRow');
            const tbody = document.getElementById('ventesTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr id="ventesLoadingRow"><td colspan="8" class="text-center py-4"><div class="spinner-border text-info" role="status"><span class="visually-hidden">Chargement...</span></div><p class="mt-2 text-muted small">Chargement des ventes...</p></td></tr>';
            }
            
            // Utiliser le magasin sélectionné actuellement au lieu de chercher un select
            const magasinId = this.currentMagasin;
            if (!magasinId) {
                console.log('⚠️ Pas de magasin sélectionné pour charger l\'historique');
                if (loadingRow) loadingRow.style.display = 'none';
                return;
            }

            console.log(`📊 Chargement historique pour magasin: ${magasinId}`);

            // Essayer d'abord l'endpoint magasin-spécifique
            let response = await fetch(
                `${this.API_BASE}/api/protected/magasins/${magasinId}/ventes?limit=50`,
                { headers: this.authHeaders() }
            );

            // Si l'endpoint magasin n'existe pas, essayer l'endpoint général
            if (!response.ok) {
                console.log('⚠️ Endpoint magasin/ventes non disponible, essai endpoint général...');
                response = await fetch(
                    `${this.API_BASE}/api/protected/ventes?magasinId=${magasinId}&limit=50`,
                    { headers: this.authHeaders() }
                );
            }

            if (response.ok) {
                const data = await response.json();
                const ventes = data.ventes || data || [];
                console.log(` ${ventes.length} vente(s) chargée(s)`);
                this.displayVentesHistorique(ventes);
            } else {
                console.error('❌ Erreur réponse:', response.status);
            }
        } catch (error) {
            console.error('❌ Erreur chargement historique:', error);
        } finally {
            // Masquer le loading des KPIs
            this.showKPIsLoading(false);
            // Masquer le loader (fallback si erreur)
            const loadingRow = document.getElementById('ventesLoadingRow');
            if (loadingRow) loadingRow.style.display = 'none';
        }
    }

    /**
     * Affiche l'historique des ventes
     */
    displayVentesHistorique(ventes) {
        // 📋 Stocker TOUTES les ventes
        this.allVentes = ventes || [];
        this.filteredVentes = ventes || [];
        this.ventesHistorique = ventes || [];
        this.currentPage = 1;
        this.searchTerm = '';
        
        // Initialiser la recherche
        this.initializeSearch();
        
        // Afficher la première page
        this.renderVentesPage();
        
        // 📊 Calculer et afficher les KPIs
        this.updateKPIs(ventes);
    }

    /**
     * 📊 Calculer et afficher les KPIs
     */
    updateKPIs(ventes) {
        if (!ventes || ventes.length === 0) {
            // Pas de ventes: afficher 0
            document.getElementById('widgetVentesJour').textContent = '0';
            document.getElementById('widgetChiffre').textContent = '0.00';
            document.getElementById('widgetQteSortie').textContent = '0';
            document.getElementById('widgetMouvements').textContent = '0';
            document.getElementById('ventesToday').textContent = '0';
            document.getElementById('totalVentes').textContent = '0.00';
            return;
        }

        // Calculer les KPIs
        let totalVentes = 0;
        let totalMontantUSD = 0;
        let totalQteSortie = 0;

        ventes.forEach(vente => {
            totalVentes++;
            totalMontantUSD += vente.montantTotalUSD || 0;
            
            // Additionner les quantités de tous les articles
            if (vente.articles && Array.isArray(vente.articles)) {
                vente.articles.forEach(article => {
                    totalQteSortie += article.quantite || 0;
                });
            }
        });

        // Mettre à jour les widgets
        const venteCount = totalVentes;
        const montantUSD = totalMontantUSD.toFixed(2);
        const qteCount = totalQteSortie;
        const mouvementCount = ventes.length; // Nombre de mouvements = nombre de ventes

        document.getElementById('widgetVentesJour').textContent = venteCount;
        document.getElementById('widgetChiffre').textContent = montantUSD;
        document.getElementById('widgetQteSortie').textContent = qteCount;
        document.getElementById('widgetMouvements').textContent = mouvementCount;
        
        // Mettre à jour le header aussi
        document.getElementById('ventesToday').textContent = venteCount;
        document.getElementById('totalVentes').textContent = montantUSD;
    }

    /**
     * � Afficher/Masquer le loading des KPIs
     */
    showKPIsLoading(isLoading) {
        const kpiLoadingIds = [
            'kpiVentesLoading', 'kpiChiffresLoading', 'kpiQteLoading', 'kpiMouvementsLoading'
        ];
        const kpiContentIds = [
            'kpiVentesContent', 'kpiChiffresContent', 'kpiQteContent', 'kpiMouvementsContent'
        ];
        
        kpiLoadingIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = isLoading ? 'block' : 'none';
        });
        
        kpiContentIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = isLoading ? 'none' : 'block';
        });
    }

    /**
     * �🔍 Initialiser la recherche
     */
    initializeSearch() {
        const searchInput = document.getElementById('ventesSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.filterAndRenderVentes();
            });
        }
    }

    /**
     * 🔎 Filtrer les ventes par terme de recherche
     */
    filterAndRenderVentes() {
        if (!this.searchTerm) {
            this.filteredVentes = [...this.allVentes];
        } else {
            this.filteredVentes = this.allVentes.filter(vente => {
                const searchFields = [
                    // Magasin
                    (typeof vente.magasinId === 'object' ? vente.magasinId.nom_magasin : '').toLowerCase(),
                    (typeof vente.magasinId === 'object' ? vente.magasinId.adresse : '').toLowerCase(),
                    // Produits
                    (vente.articles || []).map(art => {
                        const produit = typeof art.produitId === 'object' ? art.produitId : null;
                        return (produit?.designation || art.nomProduit || '').toLowerCase();
                    }).join(' '),
                    // Utilisateur
                    (typeof vente.utilisateurId === 'object' ? 
                        `${vente.utilisateurId.prenom} ${vente.utilisateurId.nom}` : '').toLowerCase(),
                    // Mode paiement
                    (vente.modePaiement || '').toLowerCase()
                ].join(' ');
                
                return searchFields.includes(this.searchTerm);
            });
        }
        
        this.renderVentesPage();
    }

    /**
     * 📑 Afficher la page actuelle
     */
    renderVentesPage() {
        const tbody = document.getElementById('ventesTableBody');
        const noResults = document.getElementById('ventesNoResults');
        const loadingRow = document.getElementById('ventesLoadingRow');
        const emptyRow = document.getElementById('ventesEmptyRow');
        
        // Masquer le loading
        if (loadingRow) loadingRow.style.display = 'none';
        
        if (!this.filteredVentes || this.filteredVentes.length === 0) {
            tbody.innerHTML = '';
            if (emptyRow) emptyRow.style.display = 'none';
            noResults.style.display = 'block';
            this.updatePaginationInfo();
            return;
        }
        
        if (emptyRow) emptyRow.style.display = 'none';
        
        // Calculer la pagination
        const totalPages = Math.ceil(this.filteredVentes.length / this.itemsPerPage);
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = Math.min(start + this.itemsPerPage, this.filteredVentes.length);
        const paginaledVentes = this.filteredVentes.slice(start, end);
        
        // Afficher les ventes de la page
        tbody.innerHTML = paginaledVentes.map(vente => {
            const montantUSD = (vente.montantTotalUSD || 0).toFixed(2);
            const heureLocal = new Date(vente.dateVente).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Récupérer le nom du magasin
            const magasinInfo = typeof vente.magasinId === 'object' ? vente.magasinId : this.magasins.find(m => m._id === vente.magasinId);
            const magasinNom = magasinInfo?.nom_magasin || magasinInfo?.nom || 'Non défini';
            
            // Récupérer les noms des produits et quantité totale + photos
            let produitsHtml = '-';
            let quantiteTotale = 0;
            const MAX_SHOWN = 2;
            
            if (vente.articles && vente.articles.length > 0) {
                const articlesToShow = vente.articles.slice(0, MAX_SHOWN);
                const articlesRestantes = vente.articles.length - MAX_SHOWN;
                
                const produitsPhotos = articlesToShow.map(art => {
                    const produit = typeof art.produitId === 'object' ? art.produitId : null;
                    const photoUrl = produit?.photoUrl || 'assets/img/placeholder.svg';
                    const nom = produit?.designation || art.nomProduit || 'Produit';
                    const typeName = produit?.typeProduitId?.nomType ? ` (${produit.typeProduitId.nomType})` : '';
                    return `<img src="${photoUrl}" alt="${nom}" style="width: 30px; height: 30px; border-radius: 4px; margin-right: 4px; object-fit: cover; vertical-align: middle;" title="${nom}${typeName}">`;
                }).join('');
                
                const produitsNoms = articlesToShow.map(art => {
                    const produit = typeof art.produitId === 'object' ? art.produitId : null;
                    return produit?.designation || art.nomProduit || 'Produit';
                }).join(', ');
                
                const badgePlus = articlesRestantes > 0 ? 
                    `<span class="badge bg-info ms-2" title="${articlesRestantes} produit(s) supplémentaire(s)">+${articlesRestantes}</span>` : '';
                
                quantiteTotale = vente.articles.reduce((sum, art) => sum + (art.quantite || 0), 0);
                
                produitsHtml = `<div style="display: flex; align-items: center; flex-wrap: wrap;">${produitsPhotos}<span>${produitsNoms}</span>${badgePlus}</div>`;
            }
            
            const utilisateurInfo = typeof vente.utilisateurId === 'object' ? vente.utilisateurId : null;
            const utilisateurNom = utilisateurInfo ? `${utilisateurInfo.prenom} ${utilisateurInfo.nom}` : 'Système';

            return `
                <tr>
                    <td class="small text-nowrap">${heureLocal}</td>
                    <td class="small text-nowrap">${magasinNom}</td>
                    <td class="small" style="max-width: 250px; overflow: hidden; text-overflow: ellipsis;">${produitsHtml}</td>
                    <td class="small fw-semibold text-center text-nowrap">${quantiteTotale}</td>
                    <td class="small fw-semibold text-nowrap">${montantUSD} $</td>
                    <td><span class="badge bg-secondary">${vente.modePaiement || 'CASH'}</span></td>
                    <td class="small text-muted text-nowrap">${utilisateurNom}</td>
                    <td class="text-nowrap">
                        <button class="btn btn-sm btn-outline-info" onclick="venteManager.viewDetails('${vente._id}')" title="Voir tous les détails">
                            <i class="fas fa-eye"></i> Détails
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Mettre à jour les infos de pagination
        this.updatePaginationInfo();
    }

    /**
     * 📊 Mettre à jour les infos de pagination
     */
    updatePaginationInfo() {
        const totalPages = Math.ceil(this.filteredVentes.length / this.itemsPerPage);
        const start = this.filteredVentes.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredVentes.length);
        
        // Mettre à jour les spans
        document.getElementById('ventesStart').textContent = start;
        document.getElementById('ventesEnd').textContent = end;
        document.getElementById('ventesTotal').textContent = this.filteredVentes.length;
        document.getElementById('ventesCurrentPage').textContent = this.currentPage;
        document.getElementById('ventesTotalPages').textContent = totalPages || 1;
        
        // Activer/désactiver les boutons de pagination
        const prevBtn = document.getElementById('ventes-prev');
        const nextBtn = document.getElementById('ventes-next');
        
        if (prevBtn) prevBtn.classList.toggle('disabled', this.currentPage === 1);
        if (nextBtn) nextBtn.classList.toggle('disabled', this.currentPage >= totalPages);
    }

    /**
     * ⬅️ Page précédente
     */
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderVentesPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    /**
     * ➡️ Page suivante
     */
    nextPage() {
        const totalPages = Math.ceil(this.filteredVentes.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderVentesPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    /**
     * 📋 Affiche les détails d'une vente
     */
    viewDetails(id) {
        console.log('📋 Affichage modal détails vente:', id);
        this.showVenteDetails(id);
    }

    /**
     * Actualise les données
     */
    async refresh() {
        console.log('🔄 Actualisation...');
        const icon = document.getElementById('refreshIcon');
        icon.classList.add('fa-spin');
        
        try {
            await this.loadVentesHistorique();
            console.log(' Actualisation terminée');
        } catch (error) {
            console.error('❌ Erreur actualisation:', error);
        } finally {
            icon.classList.remove('fa-spin');
        }
    }

    /**
     * Attache les écouteurs d'événements
     */
    attachEventListeners() {
        // Sélecteur magasin pour ADMIN (deprecated - remplacé par modal)
        const adminMagasinSelect = document.getElementById('adminMagasinSelect');
        if (adminMagasinSelect) {
            adminMagasinSelect.addEventListener('change', (e) => {
                const magasinId = e.target.value;
                if (magasinId) {
                    this.currentMagasin = magasinId;
                    const magasinName = this.magasins.find(m => m._id === magasinId)?.nom || 'Magasin';
                    document.getElementById('currentMagasinName').textContent = magasinName;
                    this.onMagasinChange(magasinId);
                    this.loadVentesHistorique();
                }
            });
            // Peupler le sélecteur admin après chargement
            setTimeout(() => this.populateAdminMagasinSelect(), 500);
        }

        // Modal de sélection magasin - afficher les magasins quand le modal s'ouvre
        const modalMagasinVente = document.getElementById('modalSelectMagasinVente');
        if (modalMagasinVente) {
            modalMagasinVente.addEventListener('show.bs.modal', () => {
                this.displayMagasins();
            });
        }

        // 🪟 Modal de sélection guichet - afficher les guichets quand le modal s'ouvre
        const modalSelectGuichet = document.getElementById('modalSelectGuichet');
        if (modalSelectGuichet) {
            modalSelectGuichet.addEventListener('show.bs.modal', () => {
                this.displayGuichets();
            });
        }

        // Sélecteur magasin deprecated (ancienne version)
        document.getElementById('venteSelectMagasin')?.addEventListener('change', (e) => {
            this.onMagasinChange(e.target.value);
            this.loadVentesHistorique();
        });

        document.getElementById('venteSelectProduit')?.addEventListener('change', (e) => {
            this.onProduitChange(e.target.value);
        });

        // Quantité
        document.getElementById('btnPlusQte')?.addEventListener('click', () => this.increaseQte());
        document.getElementById('btnMoinsQte')?.addEventListener('click', () => this.decreaseQte());
        document.getElementById('venteQuantite')?.addEventListener('change', () => this.updateVenteTotalPartiel());

        // Prix et taux
        document.getElementById('ventePrix')?.addEventListener('change', () => this.updateVenteTotalPartiel());
        document.getElementById('venteTauxFC')?.addEventListener('change', () => {
            this.updateVenteTotalPartiel();
            this.displayPanier();
        });

        // Panier
        document.getElementById('btnAjouterPanier')?.addEventListener('click', () => this.addToPanier());
        document.getElementById('btnViderPanier')?.addEventListener('click', () => this.clearPanier());
        document.getElementById('btnValiderVente')?.addEventListener('click', () => this.validateVente());

        // Refresh
        document.getElementById('refreshData')?.addEventListener('click', () => this.refresh());

        // 🆕 PHASE 1 v2: Initialize Mode de Vente handlers ONCE
        const radioPartiel = document.getElementById('radioPartiel');
        const radioEntier = document.getElementById('radioEntier');
        const typeVenteDesc = document.getElementById('typeVenteDescription');
        
        if (radioPartiel) {
            radioPartiel.addEventListener('change', () => {
                if (window.venteInitializing) return;  // Ignore during init
                if (typeVenteDesc) {
                    typeVenteDesc.innerHTML = '✂️ Réduire les quantités du LOT par unités de vente';
                    console.log('✅ Mode changed to: Par unités (user click)');
                }
                // 🆕 Mettre à jour l'affichage du stock
                this.updateStockDisplay();
            });
        }
        
        if (radioEntier) {
            radioEntier.addEventListener('change', () => {
                if (window.venteInitializing) return;  // Ignore during init
                if (typeVenteDesc) {
                    typeVenteDesc.innerHTML = '🚀 Vendre le LOT entier (pas de réduction possible)';
                    console.log('✅ Mode changed to: LOT entier (user click)');
                }
                // 🆕 Mettre à jour l'affichage du stock
                this.updateStockDisplay();
            });
        }

        console.log('📌 Écouteurs d\'événements attachés');
    }

    /**
     * Remplit le sélecteur magasin pour l'admin
     */
    populateAdminMagasinSelect() {
        const select = document.getElementById('adminMagasinSelect');
        if (!select) return;

        select.innerHTML = '<option value="">Sélectionner magasin...</option>';
        this.magasins.forEach(magasin => {
            const option = document.createElement('option');
            option.value = magasin._id;
            option.textContent = magasin.nom;
            select.appendChild(option);
        });

        // Pré-sélectionner le magasin courant
        if (this.currentMagasin) {
            select.value = this.currentMagasin;
        }
    }

    /**
     * 📋 Afficher les détails d'une vente dans un modal avancé
     */
    async showVenteDetails(venteId) {
        let loader, content, error;
        
        try {
            const modal = new bootstrap.Modal(document.getElementById('modalDetailsVente'));
            loader = document.getElementById('venteLoadingSpinner');
            content = document.getElementById('venteDetailsContent');
            error = document.getElementById('venteErrorMessage');

            // Réinitialiser l'affichage
            if (loader) loader.style.display = 'block';
            if (content) content.style.display = 'none';
            if (error) error.style.display = 'none';

            // Afficher le modal
            modal.show();

            console.log('🔍 Chargement détails vente:', venteId);
            
            // Toujours appeler l'API pour obtenir les données complètes avec relations peuplées
            const response = await fetch(
                `${this.API_BASE}/api/protected/ventes/${venteId}`,
                { headers: this.authHeaders() }
            );

            let vente;
            if (!response.ok) {
                // Essayer un autre endpoint si celui-ci échoue
                const response2 = await fetch(
                    `${this.API_BASE}/api/ventes/${venteId}`,
                    { headers: this.authHeaders() }
                );
                if (!response2.ok) {
                    throw new Error(`Erreur: ${response2.status}`);
                }
                vente = await response2.json();
            } else {
                vente = await response.json();
                // Si la réponse est un objet avec une propriété "vente", l'extraire
                if (vente && vente.vente && typeof vente.vente === 'object') {
                    vente = vente.vente;
                }
            }

            console.log(' Vente chargée:', vente);

            // Petit délai pour effet de chargement
            await new Promise(resolve => setTimeout(resolve, 500));

            // Remplir les détails
            this.populateVenteDetails(vente);

            // Afficher le contenu, cacher le loader
            if (loader) loader.style.display = 'none';
            if (content) content.style.display = 'block';

            // Attacher les événements
            this.attachVenteDetailsEvents(vente);

        } catch (err) {
            console.error('❌ Erreur lors du chargement des détails:', err);
            if (loader) loader.style.display = 'none';
            
            const errorDiv = document.getElementById('venteErrorMessage');
            if (errorDiv) {
                errorDiv.style.display = 'block';
                errorDiv.innerHTML = `<div class="alert alert-danger">❌ ${err.message}</div>`;
            }
        }
    }

    /**
     * 📝 Remplir le modal avec les données de la vente
     */
    populateVenteDetails(vente) {
        console.log('📝 Remplissage modal avec:', vente);
        
        // 1️⃣ Numéro de vente
        document.getElementById('venteNumero').textContent = `Vente #${vente._id.substring(0, 8).toUpperCase()}`;

        // 2️⃣ Vendeur - CHERCHER DANS utilisateurId (API populate)
        const vendeur = vente.utilisateurId || vente.utilisateur || {};
        console.log('👤 Vendeur trouvé:', vendeur);
        
        if (vendeur && vendeur._id) {
            document.getElementById('venteVendeurNom').textContent = `${vendeur.prenom || ''} ${vendeur.nom || ''}`.trim() || '-';
            document.getElementById('venteVendeurRole').textContent = vendeur.role || '-';
            document.getElementById('venteVendeurEmail').innerHTML = `<i class="fas fa-envelope me-1"></i><span>${vendeur.email || '-'}</span>`;
            document.getElementById('venteVendeurRoleBadge').textContent = (vendeur.role || '-').toUpperCase();
            document.getElementById('venteVendeurRoleBadge').className = `badge ${this.getRoleBadgeClass(vendeur.role)}`;
            
            // Photo vendeur
            if (vendeur.photoUrl || vendeur.photo) {
                document.getElementById('venteVendeurPhoto').src = vendeur.photoUrl || vendeur.photo;
            }
        } else {
            document.getElementById('venteVendeurNom').textContent = '-';
            document.getElementById('venteVendeurRole').textContent = '-';
            document.getElementById('venteVendeurEmail').innerHTML = `<i class="fas fa-envelope me-1"></i><span>-</span>`;
            document.getElementById('venteVendeurRoleBadge').textContent = '-';
        }

        // 3️⃣ Magasin - CHERCHER DANS magasinId (API populate)
        const magasin = vente.magasinId || vente.magasin || {};
        console.log('🏪 Magasin trouvé:', magasin);
        
        if (magasin && magasin._id) {
            document.getElementById('venteMagasinNom').textContent = magasin.nom_magasin || magasin.nom || '-';
            document.getElementById('venteMagasinAdresse').textContent = magasin.adresse || magasin.localisation || '-';
            
            // Entreprise liée au magasin
            let entrepriseNom = '-';
            if (magasin.businessId) {
                if (typeof magasin.businessId === 'object') {
                    // Correct field name is nomEntreprise
                    entrepriseNom = magasin.businessId.nomEntreprise || '-';
                } else {
                    entrepriseNom = magasin.businessId;
                }
            }
            document.getElementById('venteMagasinEntreprise').innerHTML = 
                `<i class="fas fa-building me-1"></i><span>${entrepriseNom}</span>`;
        } else {
            document.getElementById('venteMagasinNom').textContent = '-';
            document.getElementById('venteMagasinAdresse').textContent = '-';
            document.getElementById('venteMagasinEntreprise').innerHTML = 
                `<i class="fas fa-building me-1"></i><span>-</span>`;
        }

        // 4️⃣ Guichet - CHERCHER DANS guichetId (API populate)
        const guichet = vente.guichetId || vente.guichet || {};
        console.log('🪟 Guichet trouvé:', guichet);
        
        if (guichet && guichet._id) {
            document.getElementById('venteGuichetNom').textContent = guichet.nom_guichet || guichet.nom || '-';
            document.getElementById('venteGuichetCode').textContent = `Code: ${guichet.code || '-'}`;
            
            // Vendeur principal du guichet
            if (guichet.vendeurPrincipal) {
                const vendeurGuichet = typeof guichet.vendeurPrincipal === 'object' ?
                    `${guichet.vendeurPrincipal.prenom || ''} ${guichet.vendeurPrincipal.nom || ''}`.trim() :
                    guichet.vendeurPrincipal;
                document.getElementById('venteGuichetVendeur').innerHTML = 
                    `<i class="fas fa-user me-1"></i><span>${vendeurGuichet || '-'}</span>`;
            } else {
                document.getElementById('venteGuichetVendeur').innerHTML = 
                    `<i class="fas fa-user me-1"></i><span>-</span>`;
            }
        } else {
            document.getElementById('venteGuichetNom').textContent = '-';
            document.getElementById('venteGuichetCode').textContent = 'Code: -';
            document.getElementById('venteGuichetVendeur').innerHTML = 
                `<i class="fas fa-user me-1"></i><span>-</span>`;
        }

        // 5️⃣ Articles vendus
        const articles = vente.articles || [];
        this.displayVenteArticles(articles);

        // 6️⃣ Montants et paiement
        const montantUSD = vente.montantTotalUSD || vente.montantUSD || 0;
        document.getElementById('venteMontantUSD').textContent = 
            this.formatDevise(montantUSD, 'USD');
        document.getElementById('venteModePaiement').textContent = 
            (vente.modePaiement || 'Non spécifié').toUpperCase();

        // Si montant FC existe
        const montantFC = vente.montantFC || vente.montantTotalFC;
        if (montantFC) {
            document.getElementById('venteMontantFCDiv').style.display = 'flex';
            document.getElementById('venteMontantFC').textContent = 
                this.formatDevise(montantFC, 'FC');
            
            // Afficher le taux si disponible
            if (vente.taux || vente.tauxFC) {
                document.getElementById('venteTauxDiv').style.display = 'flex';
                const tauxValue = vente.taux || vente.tauxFC || '-';
                document.getElementById('venteTaux').textContent = `1 USD = ${tauxValue} FC`;
            }
        } else {
            document.getElementById('venteMontantFCDiv').style.display = 'none';
            document.getElementById('venteTauxDiv').style.display = 'none';
        }

        // 7️⃣ Infos supplémentaires
        document.getElementById('venteDateHeure').textContent = 
            this.formatDateTime(vente.dateVente || vente.createdAt || new Date());
        
        const statut = vente.statut || 'VALIDÉE';
        document.getElementById('venteStatut').textContent = statut.toUpperCase();
        document.getElementById('venteStatut').className = 
            `badge ${this.getStatutBadgeClass(statut)}`;
        
        const qteTotale = articles.reduce((sum, a) => sum + (a.quantite || 0), 0);
        document.getElementById('venteQteTotale').textContent = `${qteTotale} articles`;
        
        // Client - Set on MODAL element (venteClientModal), not form input
        console.log('🔍 DEBUG Client - vente.client:', vente.client);
        console.log('🔍 DEBUG Client - vente object keys:', Object.keys(vente));
        const clientNom = vente.client || vente.nomClient || vente.clientNom || 'Client anonyme';
        console.log('🔍 DEBUG Client - Final clientNom:', clientNom);
        const clientModalElement = document.getElementById('venteClientModal');
        console.log('🔍 DEBUG Client - Modal Element found:', !!clientModalElement);
        if (clientModalElement) {
            clientModalElement.textContent = clientNom;
            console.log('🔍 DEBUG Client - Set on modal, now:', clientModalElement.textContent);
        }

        // Observations
        document.getElementById('venteObservations').innerHTML = 
            vente.observations || '<i class="text-muted">Aucune observation</i>';
    }

    /**
     * 📦 Afficher la liste des articles
     */
    displayVenteArticles(articles) {
        const container = document.getElementById('venteArticlesList');
        container.innerHTML = '';

        if (!articles || articles.length === 0) {
            container.innerHTML = '<p class="text-muted">Aucun article</p>';
            return;
        }

        articles.forEach((article, index) => {
            // Gérer différentes structures de données possibles
            const produit = article.produit || article.produitId || {};
            const nomProduit = produit.nom || produit.designation || 'Article';
            const photoProduit = produit.photo || produit.photoUrl || 'https://via.placeholder.com/60';
            
            // Type: cherche dans produit.type, produit.typeProduitId.nomType, ou article.typeProduitId.nomType
            let typeNom = '-';
            if (produit.type) {
                typeNom = typeof produit.type === 'object' ? produit.type.nomType || produit.type.nom : produit.type;
            } else if (produit.typeProduitId) {
                typeNom = typeof produit.typeProduitId === 'object' ? produit.typeProduitId.nomType : produit.typeProduitId;
            }
            
            // Rayon: cherche dans produit.rayon, produit.rayonId.nomRayon, ou article.rayonId.nomRayon
            let rayonNom = '-';
            if (article.rayonId) {
                rayonNom = typeof article.rayonId === 'object' ? article.rayonId.nomRayon || article.rayonId.nom : article.rayonId;
            } else if (produit.rayon) {
                rayonNom = typeof produit.rayon === 'object' ? produit.rayon.nomRayon || produit.rayon.nom : produit.rayon;
            } else if (produit.rayonId) {
                rayonNom = typeof produit.rayonId === 'object' ? produit.rayonId.nomRayon || produit.rayonId.nom : produit.rayonId;
            }
            
            // Code: Display rayon code (codeRayon) instead of product reference
            let codeAffiche = '-';
            console.log(`📦 Article ${index} - rayonId complet:`, article.rayonId);
            console.log(`📦 Article ${index} - rayonId keys:`, article.rayonId ? Object.keys(article.rayonId) : 'null');
            if (article.rayonId && typeof article.rayonId === 'object') {
                codeAffiche = article.rayonId.codeRayon || '-';
                console.log(`📦 Article ${index} - codeRayon trouvé:`, article.rayonId.codeRayon, '| affichage:', codeAffiche);
            }
            const prixUnitaire = article.prixUnitaire || article.prix || 0;
            const quantite = article.quantite || 0;
            const sousTotal = prixUnitaire * quantite;

            // 🆕 Affichage du mode de vente pour LOTs
            let typeVenteDisplay = '';
            const typeStockage = produit.typeProduitId?.typeStockage || article.typeStockage || 'simple';
            if (typeStockage === 'lot' && article.typeVente) {
                const modeIcon = article.typeVente === 'entier' ? '🚀' : '✂️';
                const modeTexte = article.typeVente === 'entier' ? 'LOT entier' : 'Par unités';
                typeVenteDisplay = `
                    <div class="col-auto">
                        <i class="fas fa-cube me-1"></i>Mode: ${modeIcon} ${modeTexte}
                    </div>
                `;
            }

            const html = `
                <div class="list-group-item border-0 border-bottom pb-3 mb-3">
                    <div class="row g-3">
                        <!-- Image produit -->
                        <div class="col-auto">
                            <img src="${photoProduit}" 
                                alt="${nomProduit}" 
                                class="rounded border" 
                                style="width: 60px; height: 60px; object-fit: cover;">
                        </div>
                        
                        <!-- Infos produit -->
                        <div class="col">
                            <h6 class="mb-1 fw-bold">${nomProduit}</h6>
                            <div class="row g-2 small text-muted">
                                <div class="col-auto">
                                    <i class="fas fa-tag me-1"></i>Type: ${typeNom}
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-layer-group me-1"></i>Rayon: ${rayonNom}
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-barcode me-1"></i>Code Rayon: ${codeAffiche}
                                </div>
                                ${typeVenteDisplay}
                            </div>
                        </div>

                        <!-- Prix & Qté -->
                        <div class="col-md-3 text-end">
                            <div class="mb-2">
                                <strong>${this.formatDevise(prixUnitaire, 'USD')}</strong>
                                <span class="text-muted small">/unité</span>
                            </div>
                            <div class="badge bg-info">
                                Qté: ${quantite}
                            </div>
                        </div>

                        <!-- Total -->
                        <div class="col-12">
                            <div class="d-flex justify-content-between" style="background: #f8f9fa; padding: 8px; border-radius: 4px;">
                                <span class="text-muted small">Sous-total:</span>
                                <strong class="text-success">
                                    ${this.formatDevise(sousTotal, 'USD')}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });
    }

    /**
     * 🎨 Classe CSS pour badge rôle
     */
    getRoleBadgeClass(role) {
        const roles = {
            'ADMIN': 'bg-danger',
            'SUPERVISEUR': 'bg-warning text-dark',
            'VENDEUR': 'bg-info',
            'CAISSIER': 'bg-success'
        };
        return roles[role?.toUpperCase()] || 'bg-secondary';
    }

    /**
     * 🎨 Classe CSS pour badge statut
     */
    getStatutBadgeClass(statut) {
        const statuts = {
            'COMPLÉTÉ': 'bg-success',
            'EN_COURS': 'bg-warning text-dark',
            'ANNULÉ': 'bg-danger',
            'REMBOURSÉ': 'bg-info'
        };
        return statuts[statut?.toUpperCase()] || 'bg-secondary';
    }

    /**
     * 📅 Formater une date/heure
     */
    formatDateTime(date) {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    /**
     * 💵 Formater une devise
     */
    formatDevise(montant, devise = 'USD') {
        if (!montant) return '0 ' + devise;
        
        try {
            // Essayer avec Intl.NumberFormat pour les devises standard
            return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: devise
            }).format(montant);
        } catch (e) {
            // Si le code de devise n'est pas reconnu (ex: FC), formater manuellement
            const formatted = new Intl.NumberFormat('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(montant);
            return `${formatted} ${devise}`;
        }
    }

    /**
     * ⚠️ Afficher un message d'erreur dans le modal
     */
    showVenteError(message) {
        const loader = document.getElementById('venteLoadingSpinner');
        const content = document.getElementById('venteDetailsContent');
        const error = document.getElementById('venteErrorMessage');

        loader.style.display = 'none';
        content.style.display = 'none';
        error.style.display = 'block';
        document.getElementById('venteErrorText').textContent = message;

        this.showAlert(message, 'danger');
    }

    /**
     * 🎯 Attacher les événements au modal des détails
     */
    attachVenteDetailsEvents(vente) {
        const btnPrint = document.getElementById('btnPrinterVente');
        const btnCancel = document.getElementById('btnAnnulerVente');

        // Imprimer
        btnPrint.onclick = () => this.printVente(vente);

        // Annuler la vente
        btnCancel.onclick = () => this.confirmAnnulerVente(vente);
    }

    /**
     * 🖨️ Imprimer la vente
     */
    printVente(vente) {
        // Créer une fenêtre d'impression
        const printWindow = window.open('', '', 'width=900,height=1000');
        const magasinInfo = vente.magasinId && typeof vente.magasinId === 'object' ? vente.magasinId : {};
        const businessInfo = magasinInfo.businessId && typeof magasinInfo.businessId === 'object' ? magasinInfo.businessId : {};
        const vendeurInfo = vente.utilisateurId && typeof vente.utilisateurId === 'object' ? vente.utilisateurId : {};
        const guichetInfo = vente.guichetId && typeof vente.guichetId === 'object' ? vente.guichetId : {};

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Reçu de Vente</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 20px;
                        background: white;
                        color: #333;
                    }
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                        border: 2px solid #667eea;
                        border-radius: 8px;
                        padding: 30px;
                        background: white;
                    }
                    /* En-tête Premium */
                    .header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 3px solid #667eea;
                    }
                    .logo-section {
                        display: flex;
                        align-items: center;
                        gap: 15px;
                    }
                    .logo {
                        width: 60px;
                        height: 60px;
                        border-radius: 8px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 28px;
                        font-weight: bold;
                    }
                    .company-info h2 {
                        color: #667eea;
                        font-size: 1.4em;
                        margin-bottom: 4px;
                    }
                    .company-info p {
                        font-size: 0.85em;
                        color: #666;
                        line-height: 1.4;
                    }
                    .receipt-title {
                        text-align: right;
                    }
                    .receipt-title h1 {
                        color: #667eea;
                        font-size: 1.8em;
                        margin-bottom: 4px;
                    }
                    .receipt-title p {
                        color: #999;
                        font-size: 0.9em;
                    }
                    /* Info Section */
                    .info-section {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        margin-bottom: 30px;
                        padding: 20px;
                        background: #f8fafc;
                        border-radius: 8px;
                    }
                    .info-box h3 {
                        color: #667eea;
                        font-size: 0.9em;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        margin-bottom: 10px;
                        border-bottom: 2px solid #667eea;
                        padding-bottom: 8px;
                    }
                    .info-box p {
                        font-size: 0.95em;
                        margin: 6px 0;
                        line-height: 1.5;
                    }
                    .info-box strong {
                        color: #333;
                        display: inline-block;
                        min-width: 100px;
                    }
                    /* Table */
                    .articles {
                        margin-bottom: 30px;
                    }
                    .articles h3 {
                        color: #667eea;
                        font-size: 1.1em;
                        margin-bottom: 15px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        background: white;
                    }
                    th {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 12px 8px;
                        text-align: left;
                        font-weight: 600;
                        font-size: 0.9em;
                    }
                    td {
                        padding: 12px 8px;
                        border-bottom: 1px solid #e0e0e0;
                    }
                    tr:hover {
                        background: #f8fafc;
                    }
                    /* Totals */
                    .totals {
                        display: flex;
                        justify-content: flex-end;
                        margin-bottom: 30px;
                    }
                    .totals-box {
                        width: 350px;
                        padding: 20px;
                        background: linear-gradient(135deg, #f5f7ff 0%, #fafbff 100%);
                        border: 2px solid #667eea;
                        border-radius: 8px;
                    }
                    .total-line {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 12px;
                        font-size: 0.95em;
                    }
                    .total-line strong {
                        color: #333;
                    }
                    .total-amount {
                        display: flex;
                        justify-content: space-between;
                        font-size: 1.3em;
                        font-weight: bold;
                        color: #667eea;
                        border-top: 2px solid #667eea;
                        padding-top: 12px;
                        margin-top: 12px;
                    }
                    /* Footer */
                    .footer {
                        text-align: center;
                        padding-top: 20px;
                        border-top: 2px solid #e0e0e0;
                        color: #666;
                        font-size: 0.9em;
                    }
                    .footer .thank-you {
                        font-weight: bold;
                        color: #667eea;
                        margin-bottom: 10px;
                        font-size: 1.1em;
                    }
                    .footer .timestamp {
                        color: #999;
                        font-size: 0.85em;
                    }
                    @media print {
                        body { margin: 0; padding: 0; }
                        .container { border: 1px solid #ddd; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <!-- En-tête avec logo et titre -->
                    <div class="header">
                        <div class="logo-section">
                            <div class="logo">🏪</div>
                            <div class="company-info">
                                <h2>${businessInfo.nom_entreprise || 'Entreprise'}</h2>
                                <p>${magasinInfo.nom_magasin || 'Magasin'}</p>
                                <p>${magasinInfo.adresse || 'Adresse non disponible'}</p>
                                <p>Tel: ${magasinInfo.telephone || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="receipt-title">
                            <h1>REÇU</h1>
                            <p>de Vente</p>
                        </div>
                    </div>

                    <!-- Infos Vente -->
                    <div class="info-section">
                        <div class="info-box">
                            <h3>📌 Détails Vente</h3>
                            <p><strong>N° Vente:</strong> ${vente._id.substring(0, 12)}</p>
                            <p><strong>Date:</strong> ${this.formatDateTime(vente.dateVente)}</p>
                            <p><strong>Magasin:</strong> ${magasinInfo.nom_magasin || 'N/A'}</p>
                            <p><strong>Guichet:</strong> ${guichetInfo.nom_guichet || 'N/A'}</p>
                        </div>
                        <div class="info-box">
                            <h3>👤 Informations</h3>
                            <p><strong>Vendeur:</strong> ${vendeurInfo.prenom || ''} ${vendeurInfo.nom || '-'}</p>
                            <p><strong>Mode Paiement:</strong> ${vente.modePaiement || 'CASH'}</p>
                            <p><strong>Devise:</strong> USD</p>
                        </div>
                    </div>

                    <!-- Articles -->
                    <div class="articles">
                        <h3>📦 Articles</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Produit</th>
                                    <th style="text-align: center;">Qté</th>
                                    <th style="text-align: right;">Prix Unitaire</th>
                                    <th style="text-align: right;">Sous-total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${vente.articles.map(a => {
                                    const produit = a.produitId && typeof a.produitId === 'object' ? a.produitId : {};
                                    const sousTotal = (a.quantite * (a.prixUnitaire || 0)).toFixed(2);
                                    return `
                                        <tr>
                                            <td>${produit.designation || a.nomProduit || 'Produit'}</td>
                                            <td style="text-align: center;">${a.quantite}</td>
                                            <td style="text-align: right;">$${(a.prixUnitaire || 0).toFixed(2)}</td>
                                            <td style="text-align: right;">$${sousTotal}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- Totaux -->
                    <div class="totals">
                        <div class="totals-box">
                            <div class="total-line">
                                <strong>Sous-total:</strong>
                                <span>$${(vente.montantTotalUSD || 0).toFixed(2)}</span>
                            </div>
                            <div class="total-amount">
                                <strong>TOTAL:</strong>
                                <span>$${(vente.montantTotalUSD || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <div class="thank-you"> Merci de votre achat!</div>
                        <p class="timestamp">Reçu généré le ${new Date().toLocaleString('fr-FR')}</p>
                        <p style="margin-top: 10px; font-size: 0.8em;">Veuillez conserver ce reçu</p>
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();

        this.showAlert('Impression lancée', 'success');
    }

    /**
     * ❌ Confirmer l'annulation d'une vente
     */
    confirmAnnulerVente(vente) {
        if (confirm(`Êtes-vous sûr d'annuler la vente #${vente._id.substring(0, 8)}?`)) {
            this.annulerVente(vente._id);
        }
    }

    /**
     * ❌ Annuler une vente
     */
    async annulerVente(venteId) {
        try {
            const response = await fetch(
                `${this.API_BASE}/api/ventes/${venteId}`,
                {
                    method: 'DELETE',
                    headers: this.authHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(`Erreur: ${response.status}`);
            }

            this.showAlert('Vente annulée avec succès', 'success');
            
            // Fermer le modal
            bootstrap.Modal.getInstance(document.getElementById('modalDetailsVente')).hide();
            
            // Recharger la liste des ventes
            this.loadVentes();

        } catch (error) {
            console.error('Erreur lors de l\'annulation:', error);
            this.showAlert(`Impossible d'annuler: ${error.message}`, 'danger');
        }
    }

    /**
     * 📢 Afficher une alerte/toast
     */
    showAlert(message, type = 'info') {
        // Vérifier si on utilise ThemeManager
        if (window.themeManager && typeof window.themeManager.showAlert === 'function') {
            window.themeManager.showAlert(message, type);
            return;
        }

        // Créer un toast Bootstrap personnalisé
        const toastId = `toast-${Date.now()}`;
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center border-0 shadow-sm" 
                role="alert" aria-live="assertive" aria-atomic="true"
                style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; min-width: 300px;">
                <div class="d-flex bg-${type}${type !== 'warning' ? ' text-white' : ''}">
                    <div class="toast-body">
                        <i class="fas fa-${this.getAlertIcon(type)} me-2"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-${type === 'light' || type === 'warning' ? 'dark' : 'white'} me-2 m-auto" 
                        data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
        toast.show();

        // Supprimer après fermeture
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    /**
     * 🎨 Icône pour alerte
     */
    getAlertIcon(type) {
        const icons = {
            'success': 'check-circle',
            'danger': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Instance globale
let venteManager;

// Initialiser au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    venteManager = new VenteManager();
});

