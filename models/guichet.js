const mongoose = require('mongoose');

const guichetSchema = new mongoose.Schema({
  magasinId: { type: mongoose.Schema.Types.ObjectId, ref: 'Magasin', required: true },
  nom_guichet: { type: String, trim: true, required: true },
  status: { type: Number, default: 1 }, // 1 = actif, 0 = désactivé
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

guichetSchema.index({ magasinId: 1 });

module.exports = mongoose.model('Guichet', guichetSchema);
