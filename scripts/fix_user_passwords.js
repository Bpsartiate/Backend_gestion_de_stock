require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function run(){
  const uri = process.env.MONGODB_URI;
  if(!uri){ console.error('MONGODB_URI missing'); process.exit(1); }
  
  // ⚠️ Ne jamais hardcoder les mots de passe - utiliser .env
  const tempPassword = process.env.TEMP_PASSWORD || 'ChangeMe@12345';
  if (!process.env.TEMP_PASSWORD) {
    console.warn('⚠️  TEMP_PASSWORD non défini - utilisation du mot de passe par défaut');
    console.warn('⚠️  Modifiez .env pour définir un mot de passe temporaire plus sécurisé');
  }
  
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
  const Utilisateur = require('../models/utilisateur');

  const users = await Utilisateur.find().lean();
  console.log('Users found:', users.length);
  
  let fixed = 0;
  for(const u of users){
    if(!u.password || u.password.length < 10){
      console.log(`Fixing user ${u._id} (${u.email || u.nom}): password missing or invalid`);
      const hashed = await bcrypt.hash(tempPassword, 10);
      await Utilisateur.updateOne({ _id: u._id }, { $set: { password: hashed } });
      console.log(`  ✓ Password reset`);
      fixed++;
    }
  }

  console.log('Fixed', fixed, 'users');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
