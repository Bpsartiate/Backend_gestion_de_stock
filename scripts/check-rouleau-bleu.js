#!/usr/bin/env node
/**
 * Script pour vérifier le type de produit de "Rouleau bleu"
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Produit = require('../models/produit');

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ MONGODB_URI not defined in .env');
  process.exit(1);
}

(async () => {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté\n');

    // Chercher "Rouleau bleu"
    const produit = await Produit.findOne({ designation: 'Rouleau bleu' })
      .populate('typeProduitId', '_id nomType code typeStockage unitePrincipaleStockage')
      .populate('rayonId', '_id nomRayon');

    if (!produit) {
      console.log('❌ Produit "Rouleau bleu" non trouvé');
      process.exit(1);
    }

    console.log('✅ Produit "Rouleau bleu" trouvé:');
    console.log(`   - _id: ${produit._id}`);
    console.log(`   - designation: ${produit.designation}`);
    console.log(`   - reference: ${produit.reference}`);
    console.log(`   - typeProduitId: ${produit.typeProduitId}`);
    
    if (produit.typeProduitId) {
      console.log('\n📦 Informations du Type de Produit:');
      console.log(`   - _id: ${produit.typeProduitId._id}`);
      console.log(`   - nomType: ${produit.typeProduitId.nomType}`);
      console.log(`   - code: ${produit.typeProduitId.code}`);
      console.log(`   - typeStockage: ${produit.typeProduitId.typeStockage || 'undefined (par défaut: simple)'}`);
      console.log(`   - unitePrincipaleStockage: ${produit.typeProduitId.unitePrincipaleStockage || 'pièces'}`);
    } else {
      console.log('\n⚠️  Aucun type de produit assigné!');
    }

    console.log(`\n📍 Rayon: ${produit.rayonId?.nomRayon || 'non défini'}`);

    await mongoose.connection.close();
    console.log('\n✅ Déconnecté de MongoDB');
    process.exit(0);

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
})();
