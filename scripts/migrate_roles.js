require('dotenv').config();
const mongoose = require('mongoose');

async function run(){
  const uri = process.env.MONGODB_URI;
  if(!uri){ console.error('MONGODB_URI missing'); process.exit(1); }
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
  const Utilisateur = require('../models/utilisateur');
  const users = await Utilisateur.find().lean();
  console.log('Users to check:', users.length);
  let changed = 0;
  for(const u of users){
    const old = (u.role || '').toString();
    const low = old.toLowerCase();
    let mapped = null;
    if(low.includes('admin') || low.includes('administrat')) mapped = 'admin';
    else if(low.includes('super')) mapped = 'superviseur';
    else if(low.includes('vend')) mapped = 'vendeur';
    else if(low === 'user' || low.includes('fourn')) mapped = 'vendeur';
    if(mapped && mapped !== old){
      console.log(`Updating ${u._id} role: '${old}' -> '${mapped}'`);
      await Utilisateur.updateOne({ _id: u._id }, { $set: { role: mapped } });
      changed++;
    } else if(!mapped){
      console.log(`No mapping for ${u._id} role='${old}', skipping`);
    }
  }
  console.log('Migration complete. Roles changed:', changed);
  await mongoose.disconnect();
  process.exit(0);
}
run();
