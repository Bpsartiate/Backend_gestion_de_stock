const mongoose = require('mongoose');

const magasinSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  nom_magasin: { type: String, trim: true, required: true },
  adresse: { type: String, trim: true },
  telephone: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  status: { type: Number, default: 1 }, // 1 = actif, 0 = désactivé
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

magasinSchema.index({ businessId: 1 });

module.exports = mongoose.model('Magasin', magasinSchema);
