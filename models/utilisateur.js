const mongoose = require('mongoose');

const utilisateurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  telephone: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'superviseur', 'vendeur'], required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
  canEditPasswords: { type: Boolean, default: false },
  canEditPhoto: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  entreprise: {
    nomEntreprise: { type: String },
    logoUrl: { type: String },
    description: { type: String },
    adresse: { type: String },
    telephone: { type: String },
    email: { type: String },
    typeBusiness: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Utilisateur', utilisateurSchema);
