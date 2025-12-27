const mongoose = require('mongoose');

const stockRayonSchema = new mongoose.Schema({
  // RÉFÉRENCES
  produitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit',
    required: true,
    index: true
  },
  magasinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Magasin',
    required: true,
    index: true
  },
  rayonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rayon',
    required: true,
    index: true
  },

  // QUANTITÉS
  quantiteDisponible: {
    type: Number,
    default: 0,
    min: 0
  },
  quantiteRéservée: {
    type: Number,
    default: 0,
    min: 0
  },
  quantiteDamaged: {
    type: Number,
    default: 0,
    min: 0
  },

  // HISTORIQUE DES RÉCEPTIONS (pour FIFO)
  réceptions: [
    {
      receptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reception'
      },
      quantite: Number,
      dateReception: Date,
      lotNumber: String,
      fournisseur: String,
      datePeremption: Date
    }
  ],

  // METADATA
  dateCreation: {
    type: Date,
    default: Date.now
  },
  dateModification: {
    type: Date,
    default: Date.now
  },

  // INDEX COMPOSITE POUR ÉVITER LES DOUBLONS
}, {
  indexes: [
    { produitId: 1, magasinId: 1, rayonId: 1 } // Index unique virtuel
  ]
});

// Middleware: Mettre à jour dateModification avant sauvegarde
stockRayonSchema.pre('save', function(next) {
  this.dateModification = new Date();
  next();
});

// Calcul: quantité totale = disponible + réservée + damaged
stockRayonSchema.virtual('quantiteTotal').get(function() {
  return this.quantiteDisponible + this.quantiteRéservée + this.quantiteDamaged;
});

module.exports = mongoose.model('StockRayon', stockRayonSchema);
