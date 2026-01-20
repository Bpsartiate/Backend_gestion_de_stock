#!/usr/bin/env node
/**
 * Script pour vérifier et corriger le typeStockage du type "Rouleau"
 * Usage: node fix-rouleau-type.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const TypeProduit = require('../models/typeProduit');

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ MONGODB_URI not defined in .env');
  process.exit(1);
}

(async () => {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté');

    // Chercher le type "Rouleau"
    console.log('\n🔍 Recherche du type "Rouleau"...');
    const rouleau = await TypeProduit.findOne({ nomType: 'Rouleau' });

    if (!rouleau) {
      console.log('❌ Type "Rouleau" non trouvé');
      process.exit(1);
    }

    console.log('✅ Type "Rouleau" trouvé:');
    console.log(`   - ID: ${rouleau._id}`);
    console.log(`   - nomType: ${rouleau.nomType}`);
    console.log(`   - typeStockage actuel: ${rouleau.typeStockage || 'undefined'}`);
    console.log(`   - unitePrincipaleStockage: ${rouleau.unitePrincipaleStockage || 'undefined'}`);

    // Vérifier si le typeStockage est déjà 'lot'
    if (rouleau.typeStockage === 'lot') {
      console.log('\n✅ Le typeStockage est déjà défini à "lot"');
      process.exit(0);
    }

    // Mettre à jour le typeStockage à 'lot'
    console.log('\n⚙️ Mise à jour du typeStockage à "lot"...');
    rouleau.typeStockage = 'lot';
    rouleau.unitePrincipaleStockage = rouleau.unitePrincipaleStockage || 'ROULEAU';
    
    await rouleau.save();
    
    console.log('✅ Type "Rouleau" mis à jour avec succès!');
    console.log(`   - typeStockage: ${rouleau.typeStockage}`);
    console.log(`   - unitePrincipaleStockage: ${rouleau.unitePrincipaleStockage}`);

    await mongoose.connection.close();
    console.log('\n✅ Déconnecté de MongoDB');
    process.exit(0);

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
})();
