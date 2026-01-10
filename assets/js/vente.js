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
        
        if (!this.TOKEN) {
            console.error('❌ Aucun token JWT trouvé! Impossible de charger les données.');
            alert('⚠️ Authentification requise. Veuillez vous reconnecter.');
            return;
        }
        
        try {
            await this.loadUserInfo();
            await this.loadMagasins();
            this.attachEventListeners();
            await this.loadVentesHistorique();
            console.log('✅ Module Vente initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation Vente:', error);
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
            
            console.log('✅ JWT décodé avec succès');
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
            
            // Mettre à jour le header avec le nom du magasin
            if (this.magasins.length > 0) {
                const magasinName = this.magasins[0].nom;
                const badge = document.getElementById('currentMagasinName');
                if (badge) badge.textContent = magasinName;
            }
            
            // Charger les données du premier magasin
            if (this.magasins.length > 0 && !this.currentMagasin) {
                this.currentMagasin = this.magasins[0]._id;
                await this.onMagasinChange(this.currentMagasin);
            } else if (this.currentMagasin) {
                await this.onMagasinChange(this.currentMagasin);
            }
            
        } catch (error) {
            console.error('❌ Erreur chargement magasins:', error);
            alert('❌ Erreur lors du chargement des magasins');
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
        list.innerHTML = this.guichets.map(guichet => `
            <div class="card mb-2 cursor-pointer ${guichet._id === this.currentGuichet ? 'border-warning border-2' : ''}" 
                 onclick="venteManager.selectGuichet('${guichet._id}')" 
                 style="cursor: pointer; transition: all 0.2s ease;">
                <div class="card-body p-2">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <h6 class="mb-1 fw-bold">
                                <i class="fas fa-window-maximize me-2" style="color: #f7931e;"></i>${guichet.nom_guichet}
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
    displaySelectedProduit() {
        const alertBox = document.getElementById('venteProduitSelected');
        if (!alertBox || !this.currentProduit) return;

        const produit = this.currentProduit;
        const nomProduit = produit.designation || produit.nomProduit || produit.nom || 'Sans nom';
        const rayonNom = produit.rayonId?.nomRayon || produit.rayonId?.nom || 'Non défini';
        const quantite = produit.quantiteActuelle || 0;
        const imageSrc = produit.photoUrl || 'assets/img/placeholder.svg';
        
        // Type de produit - champ: typeProduitId (objet imbriqué)
        let typeNom = 'Non défini';
        let typeIcone = '📦';
        let unitePrincipale = '';
        if (produit.typeProduitId) {
            typeNom = produit.typeProduitId.nomType || 'Non défini';
            typeIcone = produit.typeProduitId.icone || '📦';
            unitePrincipale = produit.typeProduitId.unitePrincipale || '';
        }
        
        // Récupérer le magasin sélectionné du sélecteur ou de currentMagasin
        let magasinNom = 'Non défini';
        if (this.currentMagasin) {
            const magasinInfo = this.magasins.find(m => m._id === this.currentMagasin);
            // Chercher le nom avec la bonne structure (nom_magasin est le champ réel)
            if (magasinInfo) {
                magasinNom = magasinInfo.nom_magasin || magasinInfo.nom || magasinInfo.name || 'Non défini';
            }
        }
        
        console.log(`📦 Affichage produit: ${nomProduit}, Type: ${typeNom} (${typeIcone}), Unité: ${unitePrincipale}, Magasin: ${magasinNom}, Rayon: ${rayonNom}`);
        
        // Mettre à jour l'image de fond
        const bgImg = document.getElementById('venteProduitBgImage');
        if (bgImg) bgImg.src = imageSrc;
        
        // Mettre à jour les infos avec vérification null
        const nomEl = document.getElementById('venteProduitNom');
        if (nomEl) nomEl.textContent = nomProduit;
        
        const magasinEl = document.getElementById('venteProduitMagasin');
        if (magasinEl) magasinEl.textContent = magasinNom;
        
        const rayonEl = document.getElementById('venteProduitRayon');
        if (rayonEl) rayonEl.textContent = rayonNom;
        
        const stockEl = document.getElementById('venteProduitStock');
        if (stockEl) stockEl.textContent = quantite;
        
        // Ajouter le type et l'unité si disponibles
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
            alert('⚠️ Veuillez sélectionner un produit, un magasin et une quantité');
            return;
        }

        const produit = this.currentProduit;
        if (!produit) {
            alert('⚠️ Produit non trouvé');
            return;
        }

        // Vérification stock
        if (produit.quantiteActuelle < quantite) {
            alert(`⚠️ Stock insuffisant! Disponible: ${produit.quantiteActuelle}`);
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

        // Ajouter au panier avec tous les détails nécessaires
        const rayonId = produit.rayonId?._id || produit.rayonId;
        const panierItem = {
            produitId,
            nomProduit: produit.designation || produit.nomProduit || 'Produit',
            nomMagasin: nomMagasin,
            magasinId: magasinId,
            rayonId: rayonId,  // Récupérer l'ID du rayon (peut être string ou object._id)
            quantite,
            prix,
            total: quantite * prix,
            observations
        };
        
        this.panier.push(panierItem);

        console.log(`✅ Article ajouté au panier:`, {
            produit: produit.designation,
            quantite: quantite,
            magasin: nomMagasin,
            rayonId: rayonId,
            rayonIdOriginal: produit.rayonId,
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
            alert('⚠️ Panier vide');
            return;
        }

        if (!this.currentMagasin) {
            alert('⚠️ Veuillez sélectionner un magasin');
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
                // Préparer les articles avec tous les détails nécessaires
                const articles = this.panier.map(item => ({
                    produitId: item.produitId,
                    designation: item.nomProduit,
                    rayonId: item.rayonId || undefined,
                    quantite: item.quantite,
                    prixUnitaire: item.prix,
                    montant: item.total,
                    observations: item.observations
                }));

                console.log('📦 Articles à envoyer:', JSON.stringify(articles, null, 2));
                console.log('🔍 Détail de chaque article:');
                articles.forEach((art, idx) => {
                    console.log(`  [${idx}] produitId=${art.produitId}, rayonId=${art.rayonId}, designation=${art.designation}, qty=${art.quantite}`);
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
                
                console.log(`✅ Vente créée: ${result.vente._id}`);
                alert(`✅ Vente enregistrée!\nMontant: ${totalMontant.toFixed(2)} USD${tauxFC > 0 ? ' (' + (totalMontant * tauxFC).toFixed(0) + ' FC)' : ''}`);
                
                // Réinitialiser
                this.panier = [];
                this.displayPanier();
                document.getElementById('venteClient').value = '';
                document.getElementById('venteTauxFC').value = '';
                await this.loadVentesHistorique();
                
                console.log('✅ Vente finalisée');
                restoreButton();
            } catch (error) {
                console.error('❌ Erreur vente:', error);
                alert('❌ Erreur: ' + error.message);
                restoreButton();
            }
        }
    }

    /**
     * Charge l'historique des ventes du jour
     */
    async loadVentesHistorique() {
        try {
            // Utiliser le magasin sélectionné actuellement au lieu de chercher un select
            const magasinId = this.currentMagasin;
            if (!magasinId) {
                console.log('⚠️ Pas de magasin sélectionné pour charger l\'historique');
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
                console.log(`✅ ${ventes.length} vente(s) chargée(s)`);
                this.displayVentesHistorique(ventes);
            } else {
                console.error('❌ Erreur réponse:', response.status);
            }
        } catch (error) {
            console.error('❌ Erreur chargement historique:', error);
        }
    }

    /**
     * Affiche l'historique des ventes
     */
    displayVentesHistorique(ventes) {
        const tbody = document.getElementById('ventesTableBody');
        
        console.log('📋 Affichage historique:', ventes);
        
        // 📋 Stocker les ventes dans le cache pour la modal détails
        this.ventesHistorique = ventes || [];
        
        if (!ventes || ventes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">Aucune vente enregistrée</td></tr>';
            return;
        }

        tbody.innerHTML = ventes.map(vente => {
            const montantUSD = (vente.montantTotalUSD || 0).toFixed(2);
            const heureLocal = new Date(vente.dateVente).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Récupérer le nom du magasin - les données sont maintenant populées directement
            const magasinInfo = typeof vente.magasinId === 'object' ? vente.magasinId : this.magasins.find(m => m._id === vente.magasinId);
            const magasinNom = magasinInfo?.nom_magasin || magasinInfo?.nom || 'Non défini';
            
            // Récupérer les noms des produits et quantité totale + photos
            let produitsHtml = '-';
            let quantiteTotale = 0;
            
            if (vente.articles && vente.articles.length > 0) {
                const produitsPhotos = vente.articles.map(art => {
                    quantiteTotale += art.quantite || 0;
                    // Les données sont maintenant directement populées dans art.produitId
                    const produit = typeof art.produitId === 'object' ? art.produitId : null;
                    const photoUrl = produit?.photoUrl || 'assets/img/placeholder.svg';
                    const nom = produit?.designation || art.nomProduit || 'Produit';
                    const typeName = produit?.typeProduitId?.nomType ? ` (${produit.typeProduitId.nomType})` : '';
                    return `<img src="${photoUrl}" alt="${nom}" style="width: 30px; height: 30px; border-radius: 4px; margin-right: 4px; object-fit: cover; vertical-align: middle;" title="${nom}${typeName}">`;
                }).join('');
                const produitsNoms = vente.articles.map(art => {
                    const produit = typeof art.produitId === 'object' ? art.produitId : null;
                    return produit?.designation || art.nomProduit || 'Produit';
                }).join(', ');
                produitsHtml = `<div style="display: flex; align-items: center;">${produitsPhotos}<span>${produitsNoms}</span></div>`;
            }
            
            // Récupérer les infos de l'utilisateur - données populées
            const utilisateurInfo = typeof vente.utilisateurId === 'object' ? vente.utilisateurId : null;
            const utilisateurNom = utilisateurInfo ? `${utilisateurInfo.prenom} ${utilisateurInfo.nom}` : 'Système';

            return `
                <tr>
                    <td class="small">${heureLocal}</td>
                    <td class="small">${magasinNom}</td>
                    <td class="small">${produitsHtml}</td>
                    <td class="small fw-semibold text-center">${quantiteTotale}</td>
                    <td class="small fw-semibold">${montantUSD}</td>
                    <td><span class="badge bg-secondary">${vente.modePaiement || 'CASH'}</span></td>
                    <td class="small text-muted">${utilisateurNom}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-info" onclick="venteManager.viewDetails('${vente._id}')" title="Détails">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Affiche les détails d'une vente
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
            console.log('✅ Actualisation terminée');
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

            console.log('✅ Vente chargée:', vente);

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
        document.getElementById('venteClient').textContent = 
            vente.client || vente.nomClient || 'Client anonyme';
        
        const qteTotale = articles.reduce((sum, a) => sum + (a.quantite || 0), 0);
        document.getElementById('venteQteTotale').textContent = `${qteTotale} articles`;
        
        // Client
        const clientNom = vente.client || vente.nomClient || vente.clientNom || 'Client anonyme';
        const clientElement = document.getElementById('venteClient');
        if (clientElement) {
            // Use .value if it's an input, .textContent for other elements
            if (clientElement.tagName === 'INPUT') {
                clientElement.value = clientNom;
            } else {
                clientElement.textContent = clientNom;
            }
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
            
            // Code: cherche code, codeBarre, ou codeArticle (fallback to designation)
            const codeProduit = produit.code || produit.codeBarre || produit.codeArticle || produit.designation?.split('-')[0] || '-';
            const prixUnitaire = article.prixUnitaire || article.prix || 0;
            const quantite = article.quantite || 0;
            const sousTotal = prixUnitaire * quantite;

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
                                    <i class="fas fa-barcode me-1"></i>Code: ${codeProduit}
                                </div>
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
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Vente #${vente._id}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { text-align: center; color: #333; }
                    .info { margin: 20px 0; }
                    .articles { margin-top: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .total { font-weight: bold; font-size: 1.2em; }
                    .footer { margin-top: 30px; text-align: center; color: #666; }
                </style>
            </head>
            <body>
                <h1>REÇU DE VENTE</h1>
                <div class="info">
                    <p><strong>Numéro:</strong> ${vente._id}</p>
                    <p><strong>Date:</strong> ${this.formatDateTime(vente.dateVente)}</p>
                    <p><strong>Vendeur:</strong> ${vente.utilisateur?.nom || '-'}</p>
                    <p><strong>Magasin:</strong> ${vente.magasin?.nom || '-'}</p>
                    <p><strong>Guichet:</strong> ${vente.guichet?.nom || '-'}</p>
                </div>

                <div class="articles">
                    <h3>Articles</h3>
                    <table>
                        <tr>
                            <th>Produit</th>
                            <th>Qté</th>
                            <th>Prix Unitaire</th>
                            <th>Sous-total</th>
                        </tr>
                        ${vente.articles.map(a => `
                            <tr>
                                <td>${a.produit?.nom || '-'}</td>
                                <td>${a.quantite}</td>
                                <td>$${a.prixUnitaire.toFixed(2)}</td>
                                <td>$${(a.prixUnitaire * a.quantite).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>

                <p class="total" style="text-align: right; margin-top: 20px;">
                    Total: ${this.formatDevise(vente.montantUSD, 'USD')}
                </p>

                <div class="footer">
                    <p>Merci de votre achat!</p>
                    <p style="font-size: 0.8em;">${new Date().toLocaleString('fr-FR')}</p>
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
