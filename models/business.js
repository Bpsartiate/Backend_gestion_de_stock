const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
  nomEntreprise: { type: String, trim: true, required: true },
  logoUrl: { type: String, trim: true },
  description: { type: String, trim: true },
  adresse: { type: String, trim: true },
  rccm: { type: String, trim: true },
  idNat: { type: String, trim: true },
  telephone: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  typeBusiness: { type: String, trim: true },
  budget: { type: Number, default: 0 }, // Budget de l'entreprise
  devise: { type: String, default: 'USD' }, // Devise (currency) pour le suivi financier
  chiffre_affaires: { type: Number, default: 0 }, // Chiffre d'affaires total
  totalSpendings: { type: Number, default: 0 }, // Dépenses totales enregistrées
  productsSoldCount: { type: Number, default: 0 }, // Nombre total de produits vendus
  activities: [{ title: String, description: String, icon: String, ts: Number }],
  status: { type: Number, default: 1 } // 1 = actif, 0 = désactivé
}, { timestamps: true });

// No explicit index on ownerId to avoid accidental unique constraints at the DB level

module.exports = mongoose.model('Business', businessSchema);
