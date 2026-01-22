/**
 * 🎯 HELPER FUNCTION: Gérer la distribution multi-rayon
 * 
 * Quand une réception est créée, elle doit être distribuée sur les rayons
 * Cette fonction crée les enregistrements StockRayon automatiquement
 */

const StockRayon = require('../models/stockRayon');
const Rayon = require('../models/rayon');

/**
 * Créer les distributions StockRayon pour une réception
 * @param {Object} reception - Reception créée
 * @param {Array} distributions - Array de { rayonId, quantite }
 * @returns {Array} StockRayons créés
 */
async function createDistributions(reception, distributions) {
  console.log('\n📦 === Création des distributions ===');
  
  if (!distributions || distributions.length === 0) {
    throw new Error('Au moins une distribution est requise');
  }

  // Valider que la somme des distributions = quantité totale
  const totalDistribue = distributions.reduce((sum, d) => sum + d.quantite, 0);
  if (totalDistribue !== reception.quantite) {
    throw new Error(
      `Total distribué (${totalDistribue}kg) ≠ quantité reçue (${reception.quantite}kg)`
    );
  }

  const stockRayons = [];

  for (const dist of distributions) {
    console.log(`  📍 Rayon: ${dist.rayonId} | Quantité: ${dist.quantite}`);

    // Vérifier le rayon existe
    const rayon = await Rayon.findById(dist.rayonId);
    if (!rayon) {
      throw new Error(`Rayon ${dist.rayonId} non trouvé`);
    }

    // Vérifier la capacité
    const futureQuantite = rayon.quantiteActuelle + dist.quantite;
    if (futureQuantite > rayon.capaciteMax) {
      throw new Error(
        `Rayon ${rayon.nomRayon} dépasserait la capacité: ${futureQuantite}/${rayon.capaciteMax}`
      );
    }

    // Créer StockRayon
    const stockRayon = new StockRayon({
      magasinId: reception.magasinId,
      produitId: reception.produitId,
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

    // Mettre à jour la quantité du rayon
    rayon.quantiteActuelle += dist.quantite;
    rayon.updatedAt = new Date();
    await rayon.save();

    console.log(`    ✅ StockRayon créé | ${rayon.nomRayon}: ${rayon.quantiteActuelle}/${rayon.capaciteMax}`);
  }

  console.log(`✅ ${stockRayons.length} distribution(s) créée(s)\n`);
  return stockRayons;
}

/**
 * Récupérer tous les StockRayon d'une réception
 */
async function getReceptionDistributions(receptionId) {
  return await StockRayon.find({ receptionId })
    .populate('rayonId', 'nomRayon codeRayon capaciteMax')
    .sort({ dateDistribution: 1 });
}

/**
 * Récupérer le stock disponible d'un produit par rayon
 */
async function getProductStockByRayon(produitId, magasinId) {
  return await StockRayon.find({
    produitId,
    magasinId,
    statut: { $ne: 'VIDE' }
  })
    .populate('rayonId', 'nomRayon codeRayon')
    .populate('receptionId', 'dateReception fournisseur')
    .sort({ dateDistribution: 1 }); // FIFO
}

/**
 * Mettre à jour la quantité disponible (après mouvement de stock)
 */
async function updateStockQuantity(stockRayonId, quantiteVendue) {
  const stockRayon = await StockRayon.findById(stockRayonId);
  if (!stockRayon) throw new Error('StockRayon non trouvé');

  const nouvelle = Math.max(0, stockRayon.quantiteActuelle - quantiteVendue);
  stockRayon.quantiteActuelle = nouvelle;

  // Mettre à jour le statut
  if (nouvelle === 0) {
    stockRayon.statut = 'VIDE';
  } else if (nouvelle < stockRayon.quantiteInitiale) {
    stockRayon.statut = 'PARTIELLEMENT_VENDU';
  } else {
    stockRayon.statut = 'EN_STOCK';
  }

  await stockRayon.save();

  // Mettre à jour le rayon
  const rayon = await Rayon.findById(stockRayon.rayonId);
  rayon.quantiteActuelle = Math.max(0, rayon.quantiteActuelle - quantiteVendue);
  await rayon.save();

  return stockRayon;
}

module.exports = {
  createDistributions,
  getReceptionDistributions,
  getProductStockByRayon,
  updateStockQuantity
};
