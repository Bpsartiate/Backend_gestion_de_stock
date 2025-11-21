require('dotenv').config();
const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI non défini dans les variables d\'environnement');
  }
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connectée');
    return mongoose;
  } catch (err) {
    console.error('Erreur connexion MongoDB:', err);
    throw err;
  }
}

module.exports = { connectDB, mongoose };