#!/usr/bin/env node
/**
 * Script pour lister tous les produits
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

    // Chercher tous les produits
    const produits = await Produit.find({})
      .select('_id designation reference typeProduitId rayonId')
      .limit(20);

    if (produits.length === 0) {
      console.log('❌ Aucun produit trouvé');
      process.exit(1);
    }

    console.log(`📦 ${produits.length} produit(s) trouvé(s):\n`);
    produits.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.designation} (${p.reference})`);
      console.log(`   - typeProduitId: ${p.typeProduitId || 'null'}`);
      console.log(`   - rayonId: ${p.rayonId || 'null'}`);
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
