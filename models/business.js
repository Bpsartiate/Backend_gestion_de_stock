const mongoose = require('mongoose');

// basic validators
const emailValidator = {
  validator: function(v) {
    if (!v) return true; // allow empty (optional)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  },
  message: props => `${props.value} n'est pas un email valide.`
};

const phoneValidator = {
  validator: function(v) {
    if (!v) return true;
    return /^[0-9+\s-]{7,20}$/.test(v);
  },
  message: props => `${props.value} n'est pas un numéro de téléphone valide.`
};

const businessSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
  nomEntreprise: { type: String, trim: true, required: true },
  logoUrl: { type: String, trim: true },
  description: { type: String, trim: true },    // infos complémentaires
  adresse: { type: String, trim: true },
  telephone: { type: String, trim: true, validate: phoneValidator },
  email: { type: String, trim: true, lowercase: true, validate: emailValidator },
  typeBusiness: { type: String, trim: true } // Champ libre pour type de commerce
}, { timestamps: true });

// Ensure single business per ownerId at DB level
businessSchema.index({ ownerId: 1 }, { unique: true });

module.exports = mongoose.model('Business', businessSchema);
