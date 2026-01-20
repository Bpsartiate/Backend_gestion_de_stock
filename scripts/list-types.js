#!/usr/bin/env node
/**
 * Script pour lister tous les types de produits
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
    console.log('✅ Connecté\n');

    // Lister tous les types
    const types = await TypeProduit.find({}).select('_id nomType code typeStockage unitePrincipaleStockage magasinId');

    if (types.length === 0) {
      console.log('❌ Aucun type de produit trouvé');
      process.exit(0);
    }

    console.log(`📋 ${types.length} type(s) de produit trouvé(s):\n`);
    types.forEach((type, idx) => {
      console.log(`${idx + 1}. ${type.nomType} (${type.code})`);
      console.log(`   - ID: ${type._id}`);
      console.log(`   - typeStockage: ${type.typeStockage || 'undefined (par défaut: simple)'}`);
      console.log(`   - unitePrincipaleStockage: ${type.unitePrincipaleStockage || 'pièces'}`);
      console.log(`   - magasinId: ${type.magasinId}`);
      console.log('');
    });

    await mongoose.connection.close();
    console.log('✅ Déconnecté de MongoDB');
    process.exit(0);

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
})();
