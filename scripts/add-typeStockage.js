#!/usr/bin/env node
/**
 * Script pour ajouter typeStockage au type "Rouleau" (ou à celui de Rouleau bleu)
 */

require('dotenv').config();
const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://admin:admin%40123@cluster0.d75p8.mongodb.net/gestion_stock?retryWrites=true&w=majority';

(async () => {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté\n');

    // Accès direct à la collection MongoDB
    const db = mongoose.connection.db;
    const typeProduitsCollection = db.collection('typeproduites');
    const produitsCollection = db.collection('produits');

    // 1. Chercher "Rouleau bleu" pour trouver son typeProduitId
    console.log('🔍 Recherche du produit "Rouleau bleu"...');
    const roubleauBleu = await produitsCollection.findOne({ designation: 'Rouleau bleu' });

    if (!roubleauBleu) {
      console.log('⚠️  Produit "Rouleau bleu" non trouvé');
      console.log('\n📋 Affichage de tous les types disponibles:');
      const allTypes = await typeProduitsCollection.find({}).toArray();
      allTypes.forEach(t => {
        console.log(`   - ${t.nomType} (${t.code}): typeStockage=${t.typeStockage || 'undefined'}`);
      });
      process.exit(0);
    }

    console.log(`✅ Produit "Rouleau bleu" trouvé`);
    console.log(`   - typeProduitId: ${roubleauBleu.typeProduitId}`);

    // 2. Récupérer le type de ce produit
    const typeId = roubleauBleu.typeProduitId;
    const typeRouleau = await typeProduitsCollection.findOne({ _id: typeId });

    if (!typeRouleau) {
      console.log(`❌ Type ${typeId} non trouvé`);
      process.exit(1);
    }

    console.log(`\n✅ Type de produit trouvé:`);
    console.log(`   - nomType: ${typeRouleau.nomType}`);
    console.log(`   - code: ${typeRouleau.code}`);
    console.log(`   - typeStockage actuel: ${typeRouleau.typeStockage || 'undefined'}`);
    console.log(`   - unitePrincipaleStockage actuel: ${typeRouleau.unitePrincipaleStockage || 'undefined'}`);

    // 3. Mettre à jour typeStockage
    console.log(`\n⚙️  Mise à jour...`);
    const result = await typeProduitsCollection.updateOne(
      { _id: typeId },
      {
        $set: {
          typeStockage: 'lot',
          unitePrincipaleStockage: 'ROULEAU'
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Type mis à jour avec succès!');
      console.log(`   - typeStockage: lot`);
      console.log(`   - unitePrincipaleStockage: ROULEAU`);
    } else if (result.matchedCount > 0) {
      console.log('⚠️  Type trouvé mais aucune modification nécessaire');
    } else {
      console.log('❌ Type non trouvé');
    }

    // 4. Vérifier les autres types aussi
    console.log('\n📋 État de tous les types maintenant:');
    const allTypes = await typeProduitsCollection.find({}).toArray();
    allTypes.forEach(t => {
      const status = t.typeStockage === 'lot' ? '✅' : '⚠️';
      console.log(`${status} ${t.nomType} (${t.code}): typeStockage=${t.typeStockage || 'simple (défaut)'}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Déconnecté de MongoDB');
    process.exit(0);

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
})();
