/**
 * Migration Script: Add codeRayon to existing Rayon documents
 * 
 * This script adds the missing codeRayon field to rayon documents that were
 * created before this field was added to the schema.
 * 
 * Usage: node scripts/add_codeRayon_to_rayons.js
 */

const mongoose = require('mongoose');
const Rayon = require('../models/rayon');

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion-stock';

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('✅ MongoDB connectée');
    
    try {
        // Find all rayons that don't have a codeRayon or have an empty codeRayon
        const rayonsWithoutCode = await Rayon.find({ 
            $or: [
                { codeRayon: { $exists: false } },
                { codeRayon: null },
                { codeRayon: '' }
            ]
        });
        
        console.log(`\n📊 Rayons trouvés sans codeRayon: ${rayonsWithoutCode.length}\n`);
        
        if (rayonsWithoutCode.length === 0) {
            console.log('✅ Tous les rayons ont déjà un codeRayon!');
            mongoose.disconnect();
            return;
        }
        
        // Generate codes and update
        let updated = 0;
        for (const rayon of rayonsWithoutCode) {
            // Generate code based on rayon name
            // Examples: "rayon testille" → "RT", "Rayon Froid" → "RF"
            const words = rayon.nomRayon.trim().split(/\s+/);
            const codeRayon = words.map(w => w[0].toUpperCase()).join('').substring(0, 6);
            
            rayon.codeRayon = codeRayon;
            await rayon.save();
            
            console.log(`✅ Mise à jour: "${rayon.nomRayon}" → Code: "${codeRayon}"`);
            updated++;
        }
        
        console.log(`\n✅ ${updated} rayon(s) mise(s) à jour avec succès!`);
        
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
    } finally {
        mongoose.disconnect();
        console.log('\n✅ Déconnexion MongoDB');
    }
    
}).catch(err => {
    console.error('❌ Erreur de connexion MongoDB:', err);
    process.exit(1);
});
