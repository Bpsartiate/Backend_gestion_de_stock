const mongoose = require('mongoose');

/**
 * 🚨 MODEL ALERTE STOCK
 * 
 * Alertes intelligentes pour:
 * - Stock bas (< seuil)
 * - Stock critique (très bas)
 * - Rupture (= 0)
 * - Produit expirant (< 30 jours)
 * - Produit expiré
 */

const alerteStockSchema = new mongoose.Schema({
  magasinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Magasin',
    required: true,
    index: true
  },

  produitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit',
    required: true,
    index: true
  },

  // TYPE D'ALERTE
  type: {
    type: String,
    enum: [
      'STOCK_BAS',        // quantité < seuil
      'STOCK_CRITIQUE',   // quantité < 50% du seuil
      'RUPTURE_STOCK',    // quantité = 0
      'PRODUIT_EXPIRE',   // dateExpiration < aujourd'hui
      'PRODUIT_EXPIRATION_PROCHE',  // dateExpiration < 30 jours
      'LOT_EXPIRE',       // Un lot expiré détecté
      'TRANSFERT_OVERSTOCK'  // Trop de stock (surstock)
    ],
    required: true,
    index: true
  },

  // GRAVITÉ
  severite: {
    type: String,
    enum: ['BASSE', 'MOYEN', 'HAUTE', 'CRITIQUE'],
    default: 'MOYEN',
    index: true
  },

  // DONNÉES DE L'ALERTE
  quantiteActuelle: Number,
  seuilAlerte: Number,
  quantiteManquante: Number,  // Pour stock bas

  // Pour expiration
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot'
  },
  dateExpirationLot: Date,
  joursAvantExpiration: Number,

  // MESSAGE
  message: String,
  // Ex: "T-Shirt Bleu: Stock à 5 unités, seuil 10"

  // STATUT
  statut: {
    type: String,
    enum: ['ACTIVE', 'IGNOREE', 'RESOLUE', 'FAUSSE_ALERTE'],
    default: 'ACTIVE',
    index: true
  },

  // UTILISATEUR QUI A AGI
  utilisateurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  },

  // QUAND
  dateCreation: {
    type: Date,
    default: Date.now,
    index: true
  },

  dateResolution: Date,

  // ACTION RECOMMANDÉE
  actionRecommandee: {
    type: String,
    enum: ['COMMANDER_FOURNISSEUR', 'TRANSFERT_MAGASIN', 'VERIFIER_STOCK', 'EVACUER_PRODUIT'],
    default: 'COMMANDER_FOURNISSEUR'
  },

  // NOTES
  notes: String
});

// Index pour recherches rapides
alerteStockSchema.index({ magasinId: 1, statut: 1 });
alerteStockSchema.index({ dateCreation: -1 });

// TTL: Auto-supprimer après 90 jours si résolue
alerteStockSchema.index({ dateResolution: 1 }, { 
  expireAfterSeconds: 7776000  // 90 jours
});

module.exports = mongoose.model('AlerteStock', alerteStockSchema);
