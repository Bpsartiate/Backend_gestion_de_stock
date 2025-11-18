const mongoose = require('mongoose');

const utilisateurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  telephone: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'superviseur', 'vendeur'], required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Utilisateur', utilisateurSchema);
