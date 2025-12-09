const mongoose = require('mongoose');

const affectationSchema = new mongoose.Schema({
  vendeurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
  guichetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guichet' },
  magasinId: { type: mongoose.Schema.Types.ObjectId, ref: 'Magasin', required: true },
  entrepriseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  dateAffectation: { type: Date, default: Date.now }, // Date de début
  dateFinAffectation: { type: Date }, // Date de fin (si null = toujours assigné)
  status: { type: Number, default: 1 }, // 1 = actif, 0 = inactif/terminé
  notes: { type: String }, // Notes sur l'affectation
}, { timestamps: true });

// Index pour requêtes rapides
// Indexes pour requêtes rapides
affectationSchema.index({ vendeurId: 1 });
affectationSchema.index({ guichetId: 1 });
affectationSchema.index({ magasinId: 1 });
affectationSchema.index({ entrepriseId: 1 });
affectationSchema.index({ vendeurId: 1, status: 1 }); // Pour trouver l'affectation actuelle d'un vendeur

module.exports = mongoose.model('Affectation', affectationSchema);
