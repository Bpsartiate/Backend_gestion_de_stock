/**
 * TESTS PHASE 1 v2 - Service de consolidation
 * 
 * Teste les 6 scénarios principaux:
 * 1. Type SIMPLE - Consolidation
 * 2. Type SIMPLE - Création nouveau (plein)
 * 3. Type LOT - Jamais consolider
 * 4. Type LOT - Création unique
 * 5. Mouvements - Vente partielle
 * 6. Mouvements - Complètement vide
 */

const mongoose = require('mongoose');
const consolidationService = require('../services/consolidationService');
const StockRayon = require('../models/stockRayon');
const TypeProduit = require('../models/typeProduit');
const Rayon = require('../models/rayon');
const Produit = require('../models/produit');

// 🧪 TEST HELPER
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ ${message}`);
}

// =====================================================
// TEST SUITE
// =====================================================

async function runAllTests() {
  try {
    console.log('\n🚀 DÉMARRAGE TESTS PHASE 1 v2\n');

    // TEST 1: Type SIMPLE - Consolidation
    await testSimpleConsolidation();

    // TEST 2: Type SIMPLE - Création nouveau
    await testSimpleCreation();

    // TEST 3: Type LOT - Jamais consolider
    await testLotNeverConsolidate();

    // TEST 4: Type LOT - Création unique
    await testLotCreation();

    // TEST 5: Mouvements - Vente partielle
    await testPartialMovement();

    // TEST 6: Mouvements - Complètement vide
    await testCompleteMovement();

    console.log('\n✅ TOUS LES TESTS PASSÉS! 🎉\n');

  } catch (error) {
    console.error('\n❌ ERREUR TESTS:', error.message);
    process.exit(1);
  }
}

// =====================================================
// TEST 1: Type SIMPLE - Consolidation
// =====================================================
async function testSimpleConsolidation() {
  console.log('\n📋 TEST 1: Type SIMPLE - Consolidation');
  console.log('─'.repeat(50));

  try {
    // Setup: créer types, produits, rayons
    const typeProduit = await TypeProduit.create({
      nom: 'Viande Simple',
      typeStockage: 'simple',
      capaciteMax: 1000,
      unitePrincipaleStockage: 'kg'
    });

    const produit = await Produit.create({
      nom: 'Steak Haché',
      typeProduitId: typeProduit._id
    });

    const rayon = await Rayon.create({
      nom: 'Rayon Froid',
      magasinId: new mongoose.Types.ObjectId(),
      capaciteMax: 1000
    });

    // Créer 1ère réception: 100kg
    const rec1 = new mongoose.Types.ObjectId();
    const result1 = await consolidationService.findOrCreateStockRayon({
      produitId: produit._id,
      rayonId: rayon._id,
      quantiteAjouter: 100,
      typeProduitId: typeProduit._id,
      receptionId: rec1,
      magasinId: rayon.magasinId
    });

    assert(result1.isNew === true, 'Première réception crée nouvel sr');
    assert(result1.actionType === 'CREATE', 'Action est CREATE');
    const sr1Id = result1.sr._id;

    // Créer 2ème réception: 80kg
    const rec2 = new mongoose.Types.ObjectId();
    const result2 = await consolidationService.findOrCreateStockRayon({
      produitId: produit._id,
      rayonId: rayon._id,
      quantiteAjouter: 80,
      typeProduitId: typeProduit._id,
      receptionId: rec2,
      magasinId: rayon.magasinId
    });

    assert(result2.isNew === false, 'Deuxième réception consolide');
    assert(result2.actionType === 'CONSOLIDATE', 'Action est CONSOLIDATE');
    assert(result2.sr._id.toString() === sr1Id.toString(), 'Même sr utilisé');
    assert(result2.sr.quantiteDisponible === 180, 'Quantité totale: 180kg');
    assert(result2.receptionsFusionnées === 2, '2 réceptions fusionnées');

    console.log('✅ TEST 1 PASSÉ');

  } catch (error) {
    console.error('❌ TEST 1 ÉCHOUÉ:', error.message);
    throw error;
  }
}

// =====================================================
// TEST 2: Type SIMPLE - Création nouveau (plein)
// =====================================================
async function testSimpleCreation() {
  console.log('\n📋 TEST 2: Type SIMPLE - Création nouveau (plein)');
  console.log('─'.repeat(50));

  try {
    const typeProduit = await TypeProduit.create({
      nom: 'Légumes Simple',
      typeStockage: 'simple',
      capaciteMax: 200,
      unitePrincipaleStockage: 'kg'
    });

    const produit = await Produit.create({
      nom: 'Tomate',
      typeProduitId: typeProduit._id
    });

    const rayon = await Rayon.create({
      nom: 'Rayon Légumes',
      magasinId: new mongoose.Types.ObjectId(),
      capaciteMax: 1000
    });

    // 1ère réception: 180kg (sr1 plein)
    const rec1 = new mongoose.Types.ObjectId();
    const result1 = await consolidationService.findOrCreateStockRayon({
      produitId: produit._id,
      rayonId: rayon._id,
      quantiteAjouter: 180,
      typeProduitId: typeProduit._id,
      receptionId: rec1,
      magasinId: rayon.magasinId
    });

    const sr1Id = result1.sr._id;
    assert(result1.sr.quantiteDisponible === 180, 'sr1: 180kg');

    // 2ème réception: 150kg (ne rentre pas dans sr1)
    const rec2 = new mongoose.Types.ObjectId();
    const result2 = await consolidationService.findOrCreateStockRayon({
      produitId: produit._id,
      rayonId: rayon._id,
      quantiteAjouter: 150,
      typeProduitId: typeProduit._id,
      receptionId: rec2,
      magasinId: rayon.magasinId
    });

    assert(result2.isNew === true, 'Crée nouvel sr (sr1 plein)');
    assert(result2.sr._id.toString() !== sr1Id.toString(), 'Différent sr créé');
    assert(result2.sr.quantiteDisponible === 150, 'sr2: 150kg');

    console.log('✅ TEST 2 PASSÉ');

  } catch (error) {
    console.error('❌ TEST 2 ÉCHOUÉ:', error.message);
    throw error;
  }
}

// =====================================================
// TEST 3: Type LOT - Jamais consolider
// =====================================================
async function testLotNeverConsolidate() {
  console.log('\n📋 TEST 3: Type LOT - Jamais consolider');
  console.log('─'.repeat(50));

  try {
    const typeProduit = await TypeProduit.create({
      nom: 'Rouleau LOT',
      typeStockage: 'lot',
      capaciteMax: 500,
      unitePrincipaleStockage: 'mètre'
    });

    const produit = await Produit.create({
      nom: 'Rouleau Bleu',
      typeProduitId: typeProduit._id
    });

    const rayon = await Rayon.create({
      nom: 'Rayon Stock',
      magasinId: new mongoose.Types.ObjectId(),
      capaciteMax: 2000
    });

    // 1ère réception: 50m
    const rec1 = new mongoose.Types.ObjectId();
    const result1 = await consolidationService.findOrCreateStockRayon({
      produitId: produit._id,
      rayonId: rayon._id,
      quantiteAjouter: 50,
      typeProduitId: typeProduit._id,
      receptionId: rec1,
      magasinId: rayon.magasinId
    });

    assert(result1.typeStockage === 'lot', 'Type LOT détecté');
    assert(result1.sr.numeroLot !== undefined, 'numeroLot généré');
    const sr1Id = result1.sr._id;
    const lot1Num = result1.sr.numeroLot;

    // 2ème réception: 90m (DOIT créer nouveau sr, jamais consolider!)
    const rec2 = new mongoose.Types.ObjectId();
    const result2 = await consolidationService.findOrCreateStockRayon({
      produitId: produit._id,
      rayonId: rayon._id,
      quantiteAjouter: 90,
      typeProduitId: typeProduit._id,
      receptionId: rec2,
      magasinId: rayon.magasinId
    });

    assert(result2.isNew === true, 'Crée NOUVEAU sr (jamais consolider LOT)');
    assert(result2.sr._id.toString() !== sr1Id.toString(), 'Différent sr');
    assert(result2.sr.numeroLot !== lot1Num, 'Numéro lot différent');
    assert(result2.sr.quantiteDisponible === 90, 'sr2: 90m');

    // Vérifier que sr1 n'a pas changé
    const sr1Verify = await StockRayon.findById(sr1Id);
    assert(sr1Verify.quantiteDisponible === 50, 'sr1: toujours 50m');
    assert(sr1Verify.réceptions.length === 1, 'sr1: 1 réception seulement');

    console.log('✅ TEST 3 PASSÉ');

  } catch (error) {
    console.error('❌ TEST 3 ÉCHOUÉ:', error.message);
    throw error;
  }
}

// =====================================================
// TEST 4: Type LOT - Création unique
// =====================================================
async function testLotCreation() {
  console.log('\n📋 TEST 4: Type LOT - Création unique');
  console.log('─'.repeat(50));

  try {
    const typeProduit = await TypeProduit.create({
      nom: 'Carton LOT',
      typeStockage: 'lot',
      capaciteMax: 100,
      unitePrincipaleStockage: 'pièce'
    });

    const produit = await Produit.create({
      nom: 'Carton Rouge',
      typeProduitId: typeProduit._id
    });

    const rayon = await Rayon.create({
      nom: 'Rayon Cartons',
      magasinId: new mongoose.Types.ObjectId(),
      capaciteMax: 1000
    });

    const rec = new mongoose.Types.ObjectId();
    const result = await consolidationService.findOrCreateStockRayon({
      produitId: produit._id,
      rayonId: rayon._id,
      quantiteAjouter: 75,
      typeProduitId: typeProduit._id,
      receptionId: rec,
      magasinId: rayon.magasinId
    });

    assert(result.isNew === true, 'Crée nouvel sr');
    assert(result.typeStockage === 'lot', 'Type LOT');
    assert(result.sr.numeroLot.startsWith('LOT_'), 'numeroLot au bon format');
    assert(result.sr.quantiteDisponible === 75, 'Quantité: 75 pièces');
    assert(result.sr.réceptions.length === 1, '1 réception');

    console.log('✅ TEST 4 PASSÉ');

  } catch (error) {
    console.error('❌ TEST 4 ÉCHOUÉ:', error.message);
    throw error;
  }
}

// =====================================================
// TEST 5: Mouvements - Vente partielle
// =====================================================
async function testPartialMovement() {
  console.log('\n📋 TEST 5: Mouvements - Vente partielle');
  console.log('─'.repeat(50));

  try {
    const typeProduit = await TypeProduit.create({
      nom: 'Viande Mouvement',
      typeStockage: 'simple',
      capaciteMax: 1000,
      unitePrincipaleStockage: 'kg'
    });

    const produit = await Produit.create({
      nom: 'Poulet',
      typeProduitId: typeProduit._id
    });

    const rayon = await Rayon.create({
      nom: 'Rayon Mouvement',
      magasinId: new mongoose.Types.ObjectId(),
      capaciteMax: 1000
    });

    // Créer sr avec 100kg
    const rec = new mongoose.Types.ObjectId();
    const result = await consolidationService.findOrCreateStockRayon({
      produitId: produit._id,
      rayonId: rayon._id,
      quantiteAjouter: 100,
      typeProduitId: typeProduit._id,
      receptionId: rec,
      magasinId: rayon.magasinId
    });

    const sr = result.sr;
    assert(sr.quantiteDisponible === 100, 'Initial: 100kg');
    assert(sr.statut === 'EN_STOCK', 'Statut: EN_STOCK');

    // Vente 50kg
    await consolidationService.updateStockQuantityOnMovement(sr._id, 50, 'VENTE');

    const srAfter = await StockRayon.findById(sr._id);
    assert(srAfter.quantiteDisponible === 50, 'Après vente: 50kg');
    assert(srAfter.statut === 'PARTIELLEMENT_VENDU', 'Statut: PARTIELLEMENT_VENDU');
    assert(srAfter.dateOuverture !== undefined, 'dateOuverture set');

    console.log('✅ TEST 5 PASSÉ');

  } catch (error) {
    console.error('❌ TEST 5 ÉCHOUÉ:', error.message);
    throw error;
  }
}

// =====================================================
// TEST 6: Mouvements - Complètement vide
// =====================================================
async function testCompleteMovement() {
  console.log('\n📋 TEST 6: Mouvements - Complètement vide');
  console.log('─'.repeat(50));

  try {
    // SIMPLE type
    const typeSimple = await TypeProduit.create({
      nom: 'Viande Complète',
      typeStockage: 'simple',
      capaciteMax: 1000,
      unitePrincipaleStockage: 'kg'
    });

    const produitSimple = await Produit.create({
      nom: 'Boeuf',
      typeProduitId: typeSimple._id
    });

    const rayonSimple = await Rayon.create({
      nom: 'Rayon Complet',
      magasinId: new mongoose.Types.ObjectId(),
      capaciteMax: 1000
    });

    const rec1 = new mongoose.Types.ObjectId();
    const resultSimple = await consolidationService.findOrCreateStockRayon({
      produitId: produitSimple._id,
      rayonId: rayonSimple._id,
      quantiteAjouter: 100,
      typeProduitId: typeSimple._id,
      receptionId: rec1,
      magasinId: rayonSimple.magasinId
    });

    const srSimple = resultSimple.sr;

    // Vendre tout
    await consolidationService.updateStockQuantityOnMovement(srSimple._id, 100, 'VENTE');

    const srSimpleAfter = await StockRayon.findById(srSimple._id);
    assert(srSimpleAfter.quantiteDisponible === 0, 'Quantité: 0');
    assert(srSimpleAfter.statut === 'VIDE', 'Statut SIMPLE: VIDE');
    assert(srSimpleAfter.dateFermeture !== undefined, 'dateFermeture set');

    // LOT type
    const typeLot = await TypeProduit.create({
      nom: 'Rouleau Complet',
      typeStockage: 'lot',
      capaciteMax: 500,
      unitePrincipaleStockage: 'mètre'
    });

    const produitLot = await Produit.create({
      nom: 'Rouleau',
      typeProduitId: typeLot._id
    });

    const rayonLot = await Rayon.create({
      nom: 'Rayon LOT',
      magasinId: new mongoose.Types.ObjectId(),
      capaciteMax: 1000
    });

    const rec2 = new mongoose.Types.ObjectId();
    const resultLot = await consolidationService.findOrCreateStockRayon({
      produitId: produitLot._id,
      rayonId: rayonLot._id,
      quantiteAjouter: 100,
      typeProduitId: typeLot._id,
      receptionId: rec2,
      magasinId: rayonLot.magasinId
    });

    const srLot = resultLot.sr;

    // Vendre tout
    await consolidationService.updateStockQuantityOnMovement(srLot._id, 100, 'VENTE');

    const srLotAfter = await StockRayon.findById(srLot._id);
    assert(srLotAfter.quantiteDisponible === 0, 'Quantité: 0');
    assert(srLotAfter.statut === 'FERMÉ', 'Statut LOT: FERMÉ');
    assert(srLotAfter.dateFermeture !== undefined, 'dateFermeture set');

    console.log('✅ TEST 6 PASSÉ');

  } catch (error) {
    console.error('❌ TEST 6 ÉCHOUÉ:', error.message);
    throw error;
  }
}

// =====================================================
// RUN TESTS
// =====================================================

// Export pour utilisation externe
module.exports = {
  runAllTests
};

// Si lancé directement
if (require.main === module) {
  runAllTests()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Test Error:', err);
      process.exit(1);
    });
}
