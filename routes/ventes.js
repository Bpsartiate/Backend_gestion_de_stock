const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Vente = require('../models/vente');
const StockMovement = require('../models/stockMovement');  // ✅ CORRIGÉ: utiliser le modèle StockMovement
const Produit = require('../models/produit');  // ✅ CORRIGÉ: utiliser le modèle Produit
const Magasin = require('../models/magasin');
const Utilisateur = require('../models/utilisateur');
const Guichet = require('../models/guichet');  // ✅ Pour valider le statut du guichet

/**
 * POST /api/protected/ventes
 * Créer une nouvelle vente avec panier
 */
router.post('/ventes', authMiddleware, async (req, res) => {
    try {
        console.log('\n=== POST /ventes START ===');
        
        const {
            magasinId,
            guichetId,     // 🎯 Nouveau: guichet
            articles,      // Array d'articles
            client,
            modePaiement,
            tauxFC,
            observations
        } = req.body;
        
        // Validations
        if (!magasinId || !articles || articles.length === 0) {
            return res.status(400).json({
                message: '❌ Magasin et articles requis'
            });
        }
        
        // 🎯 NOUVEAU: Vérifier que le guichet est actif (si guichet fourni)
        if (guichetId) {
            const guichet = await Guichet.findById(guichetId);
            if (!guichet) {
                return res.status(404).json({
                    message: '❌ Guichet non trouvé'
                });
            }
            if (guichet.status !== 1) {
                return res.status(400).json({
                    message: `❌ Le guichet ${guichet.nom_guichet} est inactif. Impossible de faire une vente.`,
                    guichet: guichet.nom_guichet,
                    status: guichet.status
                });
            }
        }
        
        // Vérifier chaque article et calculer total
        let montantTotalUSD = 0;
        let articlesProcesses = [];
        
        for (const article of articles) {
            const produit = await Produit.findById(article.produitId);
            
            if (!produit) {
                return res.status(404).json({
                    message: `❌ Produit ${article.produitId} non trouvé`
                });
            }
            
            // Vérifier stock
            if (produit.quantiteActuelle < article.quantite) {
                return res.status(400).json({
                    message: `❌ Stock insuffisant pour ${produit.designation}! Disponible: ${produit.quantiteActuelle}`,
                    produit: produit.designation,
                    disponible: produit.quantiteActuelle,
                    demande: article.quantite
                });
            }
            
            const montantUSD = article.quantite * article.prixUnitaire;
            montantTotalUSD += montantUSD;
            
            articlesProcesses.push({
                produitId: article.produitId,
                rayonId: article.rayonId,
                nomProduit: produit.designation,  // Correspond à l'article.designation du frontend
                quantite: article.quantite,
                prixUnitaire: article.prixUnitaire,
                montantUSD: montantUSD,
                observations: article.observations
            });
        }
        
        // Créer la vente
        const vente = new Vente({
            dateVente: new Date(),
            magasinId,
            utilisateurId: req.user.id,
            guichetId: guichetId || null,  // 🎯 Ajouter le guichet
            client: client || null,
            articles: articlesProcesses,
            montantTotalUSD,
            tauxFC: tauxFC || null,
            montantTotalFC: tauxFC ? (montantTotalUSD * tauxFC) : null,
            modePaiement: modePaiement || 'CASH',
            observations
        });
        
        await vente.save();
        
        console.log(`✅ Vente créée: ${vente._id}`);
        
        // Créer les mouvements de stock SORTIE
        for (const article of articlesProcesses) {
            const mouvement = new StockMovement({
                type: 'SORTIE',
                produitId: article.produitId,
                rayonId: article.rayonId,
                quantite: article.quantite,
                prix: article.prixUnitaire,
                magasinId,
                utilisateurId: req.user.id,
                venteId: vente._id,  // Lien avec la vente
                observations: `Vente #${vente._id}`
            });
            
            await mouvement.save();
            
            // Mettre à jour le produit
            await Produit.findByIdAndUpdate(
                article.produitId,
                {
                    $inc: { quantiteActuelle: -article.quantite }
                }
            );
            
            console.log(`✅ Mouvement créé pour ${article.designation}`);
        }
        
        // Retourner la vente complètement populée pour le mobile dev
        const venteComplete = await Vente.findById(vente._id)
            .populate({
                path: 'magasinId',
                select: '_id nom_magasin nom adresse telephone photoUrl latitude longitude',
                populate: { path: 'businessId', select: '_id nom_entreprise email' }
            })
            .populate({
                path: 'utilisateurId',
                select: '_id nom prenom email role photoUrl telephone'
            })
            .populate({
                path: 'guichetId',
                select: '_id nom_guichet code vendeurPrincipal',
                populate: { path: 'vendeurPrincipal', select: '_id nom prenom' }
            })
            .populate({
                path: 'articles.produitId',
                select: '_id designation photoUrl prixUnitaire quantiteActuelle seuilAlerte',
                populate: { path: 'typeProduitId', select: '_id nomType icone unitePrincipale capaciteMax' }
            })
            .populate({
                path: 'articles.rayonId',
                select: '_id nomRayon'
            });
        
        console.log('=== POST /ventes END ===\n');
        
        res.status(201).json({
            success: true,
            message: '✅ Vente enregistrée avec succès',
            vente: venteComplete
        });
        
    } catch (error) {
        console.error('❌ POST /ventes error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/protected/ventes
 * Lister les ventes (avec filtres) - DONNÉES COMPLÈTEMENT POPULÉES pour mobile dev
 */
router.get('/ventes', authMiddleware, async (req, res) => {
    try {
        const { magasinId, statut, page = 1, limit = 20 } = req.query;
        
        const filter = {};
        if (magasinId) filter.magasinId = magasinId;
        if (statut) filter.statut = statut;
        
        const ventes = await Vente.find(filter)
            .populate({
                path: 'magasinId',
                select: '_id nom_magasin nom adresse telephone photoUrl',
                populate: {
                    path: 'businessId',
                    select: '_id nom_entreprise'
                }
            })
            .populate({
                path: 'utilisateurId',
                select: '_id nom prenom email role photoUrl telephone'
            })
            .populate({
                path: 'guichetId',
                select: '_id nom_guichet code vendeurPrincipal',
                populate: { path: 'vendeurPrincipal', select: '_id nom prenom email' }
            })
            .populate({
                path: 'articles.produitId',
                select: '_id designation photoUrl prixUnitaire quantiteActuelle',
                populate: {
                    path: 'typeProduitId',
                    select: '_id nomType icone unitePrincipale'
                }
            })
            .populate({
                path: 'articles.rayonId',
                select: '_id nomRayon'
            })
            .sort({ dateVente: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const total = await Vente.countDocuments(filter);
        
        res.json({
            ventes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('❌ GET /ventes error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/protected/ventes/:venteId
 * Détails d'une vente - DONNÉES COMPLÈTEMENT POPULÉES
 */
router.get('/ventes/:venteId', authMiddleware, async (req, res) => {
    try {
        const vente = await Vente.findById(req.params.venteId)
            .populate({
                path: 'magasinId',
                select: '_id nom_magasin nom adresse telephone photoUrl latitude longitude',
                populate: {
                    path: 'businessId',
                    select: '_id nomEntreprise email'
                }
            })
            .populate({
                path: 'utilisateurId',
                select: '_id nom prenom email role photoUrl telephone'
            })
            .populate({
                path: 'guichetId',
                select: '_id nom_guichet code vendeurPrincipal',
                populate: { path: 'vendeurPrincipal', select: '_id nom prenom' }
            })
            .populate({
                path: 'articles.produitId',
                select: '_id designation reference photoUrl prixUnitaire quantiteActuelle seuilAlerte',
                populate: {
                    path: 'typeProduitId',
                    select: '_id nomType icone unitePrincipale capaciteMax'
                }
            })
            .populate({
                path: 'articles.rayonId',
                select: '_id nomRayon codeRayon'
            });
        
        if (!vente) {
            return res.status(404).json({ error: 'Vente non trouvée' });
        }
        
        res.json(vente);
        
    } catch (error) {
        console.error('❌ GET /ventes/:id error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/protected/ventes/:venteId
 * Modifier une vente (avant validation) - Retour POPULÉ
 */
router.put('/ventes/:venteId', authMiddleware, async (req, res) => {
    try {
        const vente = await Vente.findById(req.params.venteId);
        
        if (!vente) {
            return res.status(404).json({ error: 'Vente non trouvée' });
        }
        
        // Seules les ventes non validées peuvent être modifiées
        if (vente.statut !== 'VALIDÉE') {
            return res.status(400).json({
                error: `❌ Impossible de modifier une vente ${vente.statut}`
            });
        }
        
        // Mise à jour simple des champs
        if (req.body.client !== undefined) vente.client = req.body.client;
        if (req.body.modePaiement) vente.modePaiement = req.body.modePaiement;
        if (req.body.observations !== undefined) vente.observations = req.body.observations;
        
        await vente.save();
        
        // Retourner la vente populée
        const ventePopulee = await Vente.findById(vente._id)
            .populate({
                path: 'magasinId',
                select: '_id nom_magasin nom adresse telephone photoUrl',
                populate: { path: 'businessId', select: '_id nom_entreprise' }
            })
            .populate({ path: 'utilisateurId', select: '_id nom prenom email role photoUrl' })
            .populate({
                path: 'guichetId',
                select: '_id nom_guichet code vendeurPrincipal'
            })
            .populate({
                path: 'articles.produitId',
                select: '_id designation photoUrl prixUnitaire',
                populate: { path: 'typeProduitId', select: '_id nomType icone unitePrincipale' }
            })
            .populate({ path: 'articles.rayonId', select: '_id nomRayon codeRayon' });
        
        res.json({
            success: true,
            message: '✅ Vente mise à jour',
            vente: ventePopulee
        });
        
    } catch (error) {
        console.error('❌ PUT /ventes/:id error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/protected/ventes/:venteId
 * Annuler une vente - Retour POPULÉ
 */
router.delete('/ventes/:venteId', authMiddleware, async (req, res) => {
    try {
        const { motif } = req.body;
        
        const vente = await Vente.findById(req.params.venteId);
        
        if (!vente) {
            return res.status(404).json({ error: 'Vente non trouvée' });
        }
        
        // Annuler
        await vente.annuler(motif || 'Annulation par utilisateur');
        
        // TODO: Restaurer le stock si nécessaire
        
        // Retourner la vente populée
        const ventePopulee = await Vente.findById(vente._id)
            .populate({
                path: 'magasinId',
                select: '_id nom_magasin nom adresse telephone photoUrl',
                populate: { path: 'businessId', select: '_id nom_entreprise' }
            })
            .populate({ path: 'utilisateurId', select: '_id nom prenom email role photoUrl' })
            .populate({
                path: 'guichetId',
                select: '_id nom_guichet code vendeurPrincipal'
            })
            .populate({
                path: 'articles.produitId',
                select: '_id designation photoUrl prixUnitaire',
                populate: { path: 'typeProduitId', select: '_id nomType icone unitePrincipale' }
            })
            .populate({ path: 'articles.rayonId', select: '_id nomRayon codeRayon' });
        
        res.json({
            success: true,
            message: '✅ Vente annulée',
            vente: ventePopulee
        });
        
    } catch (error) {
        console.error('❌ DELETE /ventes/:id error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/protected/magasins/:magasinId/ventes
 * Ventes d'un magasin - DONNÉES COMPLÈTEMENT POPULÉES
 */
router.get('/magasins/:magasinId/ventes', authMiddleware, async (req, res) => {
    try {
        const { statut = 'VALIDÉE', jour } = req.query;
        
        const filter = {
            magasinId: req.params.magasinId,
            statut
        };
        
        if (jour === 'true') {
            const debut = new Date();
            debut.setHours(0, 0, 0, 0);
            const fin = new Date();
            fin.setHours(23, 59, 59, 999);
            
            filter.dateVente = { $gte: debut, $lte: fin };
        }
        
        const ventes = await Vente.find(filter)
            .populate({
                path: 'magasinId',
                select: '_id nom_magasin nom adresse telephone photoUrl',
                populate: {
                    path: 'businessId',
                    select: '_id nom_entreprise'
                }
            })
            .populate({
                path: 'utilisateurId',
                select: '_id nom prenom email role photoUrl'
            })
            .populate({
                path: 'guichetId',
                select: '_id nom_guichet code vendeurPrincipal'
            })
            .populate({
                path: 'articles.produitId',
                select: '_id designation photoUrl prixUnitaire',
                populate: {
                    path: 'typeProduitId',
                    select: '_id nomType icone unitePrincipale'
                }
            })
            .populate({
                path: 'articles.rayonId',
                select: '_id nomRayon'
            })
            .sort({ dateVente: -1 });
        
        res.json({ ventes });
        
    } catch (error) {
        console.error('❌ GET /magasins/:id/ventes error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/protected/magasins/:magasinId/ventes/stats/jour
 * Stats des ventes du jour
 */
router.get('/magasins/:magasinId/ventes/stats/jour', authMiddleware, async (req, res) => {
    try {
        const stats = await Vente.statsJour(req.params.magasinId);
        
        res.json({
            date: new Date().toLocaleDateString('fr-FR'),
            ...stats
        });
        
    } catch (error) {
        console.error('❌ GET /stats/jour error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
