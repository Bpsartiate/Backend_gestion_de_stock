const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Vente = require('../models/vente');
const StockMovement = require('../models/stockMovement');
const Produit = require('../models/produit');
const Magasin = require('../models/magasin');
const Utilisateur = require('../models/utilisateur');
const Guichet = require('../models/guichet');
const Rayon = require('../models/rayon');
const StockRayon = require('../models/stockRayon');  // 🆕 PHASE 1 v2
const Lot = require('../models/lot');                // 🆕 PHASE 1 v2
const TypeProduit = require('../models/typeProduit'); // 🆕 PHASE 1 v2

// ========================================
// 🆕 HELPERS PHASE 1 v2 - VENTE
// ========================================

/**
 * Vendre des LOTs
 * @param {string} produitId - ID du produit
 * @param {string} rayonId - ID du rayon
 * @param {number} quantiteVendue - Quantité à vendre
 * @param {string} typeVente - 'entier' (lot complet) ou 'partiel' (par unités)
 * @returns {object} { lotsAffectes }
 */
async function sellLot(produitId, rayonId, quantiteVendue, typeVente = 'partiel') {
  let quantiteRestante = quantiteVendue;
  let lotsAffectes = [];
  
  // Chercher les LOTs du produit dans ce rayon (complèt ou partiels)
  const lots = await Lot.find({
    produitId,
    rayonId,
    status: { $in: ['complet', 'partiel_vendu'] }
  }).sort({ dateReception: 1 }); // FIFO
  
  if (lots.length === 0) {
    throw new Error(`❌ Aucun LOT trouvé pour le produit ${produitId} dans le rayon ${rayonId}`);
  }
  
  for (const lot of lots) {
    if (quantiteRestante <= 0) break;
    
    if (typeVente === 'entier') {
      // 🎯 Vendre le LOT entièrement - 1 LOT = 1 unité de vente
      lot.quantiteRestante = 0;
      lot.status = 'epuise';
      lotsAffectes.push({
        lotId: lot._id,
        quantiteVendue: lot.quantiteInitiale,  // Nombre de pièces du LOT
        ancienStatut: 'complet/partiel',
        nouveauStatut: 'epuise'
      });
      quantiteRestante -= 1;  // 🆕 Diminuer par 1 LOT, pas par quantiteInitiale
    } else {
      // 🎯 Vendre par unités (réduire le LOT)
      const vendu = Math.min(quantiteRestante, lot.quantiteRestante);
      lot.quantiteRestante -= vendu;
      
      // Mettre à jour le statut
      if (lot.quantiteRestante === 0) {
        lot.status = 'epuise';
      } else if (lot.quantiteRestante < lot.quantiteInitiale) {
        lot.status = 'partiel_vendu';
      }
      
      lotsAffectes.push({
        lotId: lot._id,
        quantiteVendue: vendu,
        ancienStatut: 'complet/partiel',
        nouveauStatut: lot.status
      });
      
      quantiteRestante -= vendu;
    }
    
    await lot.save();
  }
  
  if (quantiteRestante > 0) {
    throw new Error(`❌ Stock insuffisant! Demandé: ${quantiteVendue}, Disponible: ${quantiteVendue - quantiteRestante}`);
  }
  
  return { lotsAffectes };
}

/**
 * Vendre des articles SIMPLE (consolidés en emplacements)
 * @param {string} produitId - ID du produit
 * @param {string} rayonId - ID du rayon
 * @param {number} quantiteVendue - Quantité à vendre
 * @returns {object} { stocksAffectes }
 */
async function sellSimple(produitId, rayonId, quantiteVendue) {
  let quantiteRestante = quantiteVendue;
  let stocksAffectes = [];
  
  // Chercher les StockRayon du produit dans ce rayon (EN_STOCK ou PARTIELLEMENT_VENDU)
  const stocks = await StockRayon.find({
    produitId,
    rayonId,
    typeStockage: { $ne: 'lot' },
    statut: { $in: ['EN_STOCK', 'PARTIELLEMENT_VENDU'] },
    quantiteDisponible: { $gt: 0 }
  }).sort({ dateCreation: 1 }); // FIFO
  
  if (stocks.length === 0) {
    throw new Error(`❌ Aucun emplacement SIMPLE trouvé pour le produit ${produitId} dans le rayon ${rayonId}`);
  }
  
  for (const stock of stocks) {
    if (quantiteRestante <= 0) break;
    
    const vendu = Math.min(quantiteRestante, stock.quantiteDisponible);
    stock.quantiteDisponible -= vendu;
    
    // Mettre à jour le statut
    if (stock.quantiteDisponible === 0) {
      stock.statut = 'VIDE';
    } else if (stock.quantiteDisponible < stock.quantiteInitiale) {
      stock.statut = 'PARTIELLEMENT_VENDU';
    }
    
    stocksAffectes.push({
      stockRayonId: stock._id,
      quantiteVendue: vendu,
      ancienStatut: 'EN_STOCK/PARTIELLEMENT_VENDU',
      nouveauStatut: stock.statut
    });
    
    await stock.save();
    quantiteRestante -= vendu;
  }
  
  if (quantiteRestante > 0) {
    throw new Error(`❌ Stock insuffisant! Demandé: ${quantiteVendue}, Disponible: ${quantiteVendue - quantiteRestante}`);
  }
  
  // Si des emplacements deviennent VIDE, mettre à jour le rayon
  const rayon = await Rayon.findById(rayonId);
  const emplacementsVides = await StockRayon.countDocuments({
    rayonId,
    produitId,
    statut: 'VIDE'
  });
  
  if (emplacementsVides > 0) {
    rayon.quantiteActuelle = Math.max(0, rayon.quantiteActuelle - emplacementsVides);
    await rayon.save();
  }
  
  return { stocksAffectes };
}

/**
 * POST /api/protected/ventes
 * Créer une nouvelle vente avec panier (PHASE 1 v2)
 */
router.post('/ventes', authMiddleware, async (req, res) => {
    try {
        console.log('\n🛒 === POST /ventes (PHASE 1 v2) START ===');
        
        const {
            magasinId,
            guichetId,
            articles,      // Array: { produitId, rayonId, quantite, prixUnitaire, typeVente? }
            client,
            modePaiement,
            tauxFC,
            observations
        } = req.body;
        
        // ✅ VALIDATIONS
        if (!magasinId || !articles || articles.length === 0) {
            return res.status(400).json({
                message: '❌ Magasin et articles requis'
            });
        }
        
        // Vérifier le guichet s'il est fourni
        if (guichetId) {
            const guichet = await Guichet.findById(guichetId);
            if (!guichet) {
                return res.status(404).json({ message: '❌ Guichet non trouvé' });
            }
            if (guichet.status !== 1) {
                return res.status(400).json({
                    message: `❌ Le guichet ${guichet.nom_guichet} est inactif`
                });
            }
        }
        
        // ✅ TRAITER LES ARTICLES (PHASE 1 v2)
        let montantTotalUSD = 0;
        let articlesProcesses = [];
        let mouvementsStock = [];  // Pour tracer les changements de stock
        
        for (const article of articles) {
            const produit = await Produit.findById(article.produitId);
            if (!produit) {
                return res.status(404).json({
                    message: `❌ Produit ${article.produitId} non trouvé`
                });
            }
            
            const typeProduit = await TypeProduit.findById(produit.typeProduitId);
            const typeStockage = typeProduit?.typeStockage || 'simple';
            
            console.log(`\n📦 Traiter article: ${produit.designation} (Type: ${typeStockage}, Qty: ${article.quantite})`);
            
            // 🆕 PHASE 1 v2: Traiter LOT vs SIMPLE différemment
            let mouvementDetail = {
                produitId: article.produitId,
                designation: produit.designation,
                rayonId: article.rayonId,
                quantite: article.quantite,
                prixUnitaire: article.prixUnitaire,
                typeStockage,
                typeVente: article.typeVente || 'partiel'
            };
            
            try {
                if (typeStockage === 'lot') {
                    // 🎯 VENDRE DES LOTS
                    const { lotsAffectes } = await sellLot(
                        article.produitId,
                        article.rayonId,
                        article.quantite,
                        article.typeVente || 'partiel'
                    );
                    mouvementDetail.lotsAffectes = lotsAffectes;
                    console.log(`   ✅ LOTs vendus:`, lotsAffectes.length);
                } else {
                    // 🎯 VENDRE DES SIMPLES
                    const { stocksAffectes } = await sellSimple(
                        article.produitId,
                        article.rayonId,
                        article.quantite
                    );
                    mouvementDetail.stocksAffectes = stocksAffectes;
                    console.log(`   ✅ Emplacements affectés:`, stocksAffectes.length);
                }
            } catch (err) {
                return res.status(400).json({
                    message: err.message,
                    produit: produit.designation
                });
            }
            
            const montantUSD = article.quantite * article.prixUnitaire;
            montantTotalUSD += montantUSD;
            
            articlesProcesses.push({
                produitId: article.produitId,
                rayonId: article.rayonId,
                nomProduit: produit.designation,
                quantite: article.quantite,
                prixUnitaire: article.prixUnitaire,
                montantUSD: montantUSD,
                observations: article.observations
            });
            
            mouvementsStock.push(mouvementDetail);
            
            // Mettre à jour quantiteActuelle du produit
            await Produit.findByIdAndUpdate(
                article.produitId,
                { $inc: { quantiteActuelle: -article.quantite } }
            );
        }
        
        // ✅ CRÉER LA VENTE
        const vente = new Vente({
            dateVente: new Date(),
            magasinId,
            utilisateurId: req.user.id,
            guichetId: guichetId || null,
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
        
        // ✅ CRÉER LES MOUVEMENTS STOCK (StockMovement)
        for (const mouvement of mouvementsStock) {
            const sm = new StockMovement({
                type: 'SORTIE',
                produitId: mouvement.produitId,
                rayonId: mouvement.rayonId,
                quantite: mouvement.quantite,
                prix: mouvement.prixUnitaire,
                magasinId,
                utilisateurId: req.user.id,
                venteId: vente._id,
                observations: `Vente #${vente._id} (${mouvement.typeStockage})`
            });
            await sm.save();
        }
        console.log(`✅ ${mouvementsStock.length} mouvements créés`);
        
        // ✅ RETOURNER LA VENTE COMPLÈTE
        const venteComplete = await Vente.findById(vente._id)
            .populate({
                path: 'magasinId',
                select: '_id nom_magasin nom adresse telephone',
                populate: { path: 'businessId', select: '_id nom_entreprise' }
            })
            .populate({
                path: 'utilisateurId',
                select: '_id nom prenom email role'
            })
            .populate({
                path: 'guichetId',
                select: '_id nom_guichet code'
            })
            .populate({
                path: 'articles.produitId',
                select: '_id designation prixUnitaire quantiteActuelle',
                populate: { path: 'typeProduitId', select: '_id nomType typeStockage' }
            })
            .populate({
                path: 'articles.rayonId',
                select: '_id nomRayon'
            });
        
        console.log('✅ === POST /ventes END ===\n');
        
        res.status(201).json({
            success: true,
            message: '✅ Vente enregistrée avec succès (Phase 1 v2)',
            vente: venteComplete,
            mouvementsStock
        });
        
    } catch (error) {
        console.error('❌ POST /ventes error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vente',
            error: error.message
        });
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
                populate: { path: 'typeProduitId', select: '_id nomType icone unitePrincipale typeStockage unitesVente unitePrincipaleStockage' }
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
                populate: { path: 'typeProduitId', select: '_id nomType icone unitePrincipale typeStockage unitesVente unitePrincipaleStockage' }
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

/**
 * 🆕 GET /api/protected/produits/:produitId/lots-disponibles
 * Compter les LOTs disponibles pour un produit (PHASE 1 v2)
 * Retourne le nombre de LOTs avec status 'complet' ou 'partiel_vendu'
 */
router.get('/produits/:produitId/lots-disponibles', authMiddleware, async (req, res) => {
    try {
        const { produitId } = req.params;
        
        // Vérifier que le produit existe
        const produit = await Produit.findById(produitId);
        if (!produit) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        
        // Compter les LOTs disponibles
        const lotsCount = await Lot.countDocuments({
            produitId,
            status: { $in: ['complet', 'partiel_vendu'] }
        });
        
        console.log(`📦 ${lotsCount} LOT(s) disponible(s) pour produit ${produitId}`);
        
        res.json({
            produitId,
            lotsDisponibles: lotsCount,
            quantiteActuelle: produit.quantiteActuelle || 0
        });
        
    } catch (error) {
        console.error('❌ GET /produits/:produitId/lots-disponibles error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
