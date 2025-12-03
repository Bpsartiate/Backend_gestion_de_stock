require('dotenv').config();
const mongoose = require('mongoose');
(async function(){
  const uri = process.env.MONGODB_URI; if(!uri){ console.error('MONGODB_URI missing'); process.exit(1); }
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
  const Utilisateur = require('../models/utilisateur');
  const users = await Utilisateur.find().limit(20).lean();
  console.log('Users found:', users.length);
  users.forEach(u => console.log(u._id.toString(), u.email, u.role));
  await mongoose.disconnect();
  process.exit(0);
})();
