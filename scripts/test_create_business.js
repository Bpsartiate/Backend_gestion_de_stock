require('dotenv').config();
const mongoose = require('mongoose');

async function run(){
  const uri = process.env.MONGODB_URI;
  if(!uri){ console.error('MONGODB_URI missing'); process.exit(1); }
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
  const Utilisateur = require('../models/utilisateur');
  const Business = require('../models/business');

  const admin = await Utilisateur.findOne({ role: 'admin' }).lean();
  if(!admin){ console.error('No admin user found in DB'); await mongoose.disconnect(); process.exit(1); }
  console.log('Found admin:', admin._id.toString(), admin.nom || admin.email || '');
  const count = await Business.countDocuments({ ownerId: admin._id });
  console.log('Existing businesses for this admin:', count);

  const biz = new Business({ ownerId: admin._id, nomEntreprise: 'Test Company ' + Date.now(), email: 'test+'+Date.now()+'@example.com' });
  try{
    const saved = await biz.save();
    console.log('Business created:', saved._id.toString());
  }catch(err){
    console.error('Error creating business:', err && err.message, err.code, err && err.keyValue);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run();
