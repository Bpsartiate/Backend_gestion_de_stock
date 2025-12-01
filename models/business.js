const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
  nomEntreprise: { type: String, trim: true, required: true },
  logoUrl: { type: String, trim: true },
  description: { type: String, trim: true },
  adresse: { type: String, trim: true },
  telephone: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  typeBusiness: { type: String, trim: true },
  budget: { type: Number, default: 0 }, // Budget de l'entreprise
  devise: { type: String, default: 'USD' }, // Devise (currency) pour le suivi financier
  chiffre_affaires: { type: Number, default: 0 }, // Chiffre d'affaires total
  status: { type: Number, default: 1 } // 1 = actif, 0 = désactivé
}, { timestamps: true });

businessSchema.index({ ownerId: 1 }, { unique: true });

module.exports = mongoose.model('Business', businessSchema);
