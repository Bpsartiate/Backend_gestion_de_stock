/**
 * 🔄 MIGRATION: Adapter le endpoint POST /receptions pour multi-rayon
 * 
 * Ce code s'intègre dans routes/protected.js
 * Remplace la logique existante pour supporter les distributions
 */

const StockRayon = require('../models/stockRayon');
const Rayon = require('../models/rayon');
const { createDistributions } = require('../services/stockRayonService');

/**
 * POST /api/protected/receptions - VERSION MULTI-RAYON
 */
async function createReceptionWithDistributions(req, res) {
  try {
    console.log('\n🚀 === POST /receptions (MULTI-RAYON) ===\n');
    
    const {
      produitId,
      magasinId,
      quantite,
      distributions,  // ← NEW: Array de { rayonId, quantite, unitePrincipale?, numeroEmplacement? }
      rayonId,        // ← LEGACY: Support ancien format (single rayon)
      prixAchat,
      fournisseur,
      dateReception,
      ...otherFields
    } = req.body;

    // VALIDATION ÉTAPE 1: Champs obligatoires
    if (!produitId || !magasinId || !quantite || prixAchat === null || prixAchat === undefined) {
      return res.status(400).json({
        error: 'Champs manquants: produitId, magasinId, quantite, prixAchat'
      });
    }

    // VALIDATION ÉTAPE 2: Déterminer les distributions
    let distribAFaire = distributions;

    // Si pas de distributions mais rayonId (legacy), créer automatiquement
    if (!distribAFaire || distribAFaire.length === 0) {
      if (rayonId) {
        console.log('⚠️  Format legacy détecté - conversion automatique');
        distribAFaire = [{ rayonId, quantite }];
      } else {
        return res.status(400).json({
          error: 'Distributions manquantes ou rayonId manquant'
        });
      }
    }

    // VALIDATION ÉTAPE 3: Valider les distributions
    console.log('📦 Validating distributions...');
    
    const totalDistribue = distribAFaire.reduce((sum, d) => sum + (d.quantite || 0), 0);
    if (Math.abs(totalDistribue - quantite) > 0.01) { // Tolérance pour les décimales
      return res.status(400).json({
        error: `Total distribué (${totalDistribue}) ≠ quantité reçue (${quantite})`
      });
    }

    // Vérifier que chaque rayon existe et a la capacité
    for (const dist of distribAFaire) {
      const rayon = await Rayon.findById(dist.rayonId);
      if (!rayon) {
        return res.status(400).json({
          error: `Rayon ${dist.rayonId} non trouvé`
        });
      }

      const futureQte = rayon.quantiteActuelle + dist.quantite;
      if (futureQte > rayon.capaciteMax) {
        return res.status(400).json({
          error: `Rayon ${rayon.nomRayon} dépasserait capacité: ${futureQte}/${rayon.capaciteMax}`
        });
      }

      console.log(`  ✅ Rayon ${rayon.nomRayon}: ${dist.quantite} (libre: ${rayon.capaciteMax - rayon.quantiteActuelle})`);
    }

    // ÉTAPE 4: Créer la Reception
    console.log('📝 Création Reception...');
    const Reception = require('../models/reception');
    
    const reception = new Reception({
      produitId,
      magasinId,
      quantite,
      prixAchat,
      prixTotal: quantite * prixAchat,
      fournisseur: fournisseur || 'N/A',
      dateReception: dateReception || new Date(),
      distributions: distribAFaire.map(d => ({
        rayonId: d.rayonId,
        quantite: d.quantite,
        dateDistribution: new Date(),
        statut: 'EN_STOCK'
      })),
      statutReception: 'DISTRIBUÉE',
      ...otherFields
    });

    await reception.save();
    console.log(`✅ Reception créée: ${reception._id}`);

    // ÉTAPE 5: Créer les StockRayons
    console.log('📦 Création des StockRayons...');
    const stockRayons = [];

    for (const dist of distribAFaire) {
      const rayon = await Rayon.findById(dist.rayonId);
      
      // Créer StockRayon
      const stockRayon = new StockRayon({
        magasinId,
        produitId,
        receptionId: reception._id,
        rayonId: dist.rayonId,
        quantiteInitiale: dist.quantite,
        quantiteActuelle: dist.quantite,
        quantiteReservee: 0,
        unitePrincipale: dist.unitePrincipale || 'kg',
        numeroEmplacementPhysique: dist.numeroEmplacement || null,
        statut: 'EN_STOCK'
      });

      await stockRayon.save();
      stockRayons.push(stockRayon);

      // Mettre à jour le rayon
      rayon.quantiteActuelle += dist.quantite;
      rayon.updatedAt = new Date();
      await rayon.save();

      console.log(`  ✅ StockRayon: ${rayon.nomRayon} (+${dist.quantite}kg = ${rayon.quantiteActuelle}/${rayon.capaciteMax})`);
    }

    // ÉTAPE 6: Créer le mouvement de stock
    console.log('📊 Création StockMovement...');
    const StockMovement = require('../models/stockMovement');
    
    const mouvement = new StockMovement({
      magasinId,
      produitId,
      type: 'RECEPTION',
      quantite,
      dateDocument: dateReception || new Date(),
      observations: `Réception ${fournisseur}`,
      utilisateurId: req.user._id,
      prixUnitaire: prixAchat,
      numeroDocument: `REC-${Date.now()}`,
      fournisseur
    });

    await mouvement.save();
    console.log(`✅ Mouvement créé: ${mouvement._id}`);

    // RÉPONSE SUCCESS
    console.log('✅ === POST /receptions SUCCESS ===\n');
    
    return res.status(201).json({
      success: true,
      message: 'Réception créée avec distributions',
      reception: {
        _id: reception._id,
        quantite: reception.quantite,
        distributions: reception.distributions.map((d, i) => ({
          ...d,
          nomRayon: (distribAFaire[i] && require('../models/rayon')) ? 'Voir StockRayon' : null
        }))
      },
      stockRayons: stockRayons.map(sr => ({
        _id: sr._id,
        rayonId: sr.rayonId,
        quantite: sr.quantiteInitiale,
        statut: sr.statut
      })),
      mouvement: mouvement._id
    });

  } catch (error) {
    console.error('❌ POST /receptions ERROR:', error);
    return res.status(500).json({
      error: 'Erreur lors de la création de la réception',
      details: error.message
    });
  }
}

/**
 * GET /api/protected/receptions/:receptionId/distributions
 * Récupérer toutes les distributions d'une réception
 */
async function getReceptionDistributions(req, res) {
  try {
    const { receptionId } = req.params;

    const distributions = await StockRayon.find({ receptionId })
      .populate('rayonId', 'nomRayon codeRayon capaciteMax quantiteActuelle')
      .sort({ dateDistribution: 1 });

    return res.json({
      success: true,
      receptionId,
      distributions,
      total: distributions.length,
      totalQuantite: distributions.reduce((sum, d) => sum + d.quantiteInitiale, 0)
    });

  } catch (error) {
    console.error('❌ GET distributions ERROR:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/protected/produits/:produitId/stock-par-rayon
 * Stock disponible d'un produit par rayon (FIFO)
 */
async function getProductStockByRayon(req, res) {
  try {
    const { produitId } = req.params;
    const { magasinId } = req.query;

    const stocks = await StockRayon.find({
      produitId,
      magasinId,
      statut: { $ne: 'VIDE' }
    })
      .populate('rayonId', 'nomRayon codeRayon capaciteMax')
      .populate('receptionId', 'fournisseur dateReception datePeremption')
      .sort({ dateDistribution: 1 }); // FIFO

    return res.json({
      success: true,
      produitId,
      stocks: stocks.map(s => ({
        _id: s._id,
        rayonId: s.rayonId._id,
        nomRayon: s.rayonId.nomRayon,
        quantiteActuelle: s.quantiteActuelle,
        quantiteDisponible: s.quantiteDisponible, // virtual
        quantiteInitiale: s.quantiteInitiale,
        quantiteReservee: s.quantiteReservee,
        statut: s.statut,
        fournisseur: s.receptionId?.fournisseur,
        dateReception: s.receptionId?.dateReception,
        datePeremption: s.receptionId?.datePeremption
      })),
      totalDisponible: stocks.reduce((sum, s) => sum + s.quantiteDisponible, 0),
      rayonsOccupes: [...new Set(stocks.map(s => s.rayonId._id))].length
    });

  } catch (error) {
    console.error('❌ GET stock-par-rayon ERROR:', error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createReceptionWithDistributions,
  getReceptionDistributions,
  getProductStockByRayon
};
