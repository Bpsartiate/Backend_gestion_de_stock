const mongoose = require('mongoose');

/**
 * PHASE 1 v2 - StockRayon enrichi
 * 
 * Supports:
 * - Type SIMPLE: Consolidation multiple réceptions
 * - Type LOT: Unique emplacement par lot
 */

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
  typeProduitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TypeProduit',
    required: false
  },

  // TYPE DE STOCKAGE (copié de TypeProduit pour perf)
  typeStockage: {
    type: String,
    enum: ['simple', 'lot'],
    default: 'simple',
    required: false
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
  quantiteInitiale: {
    type: Number,
    default: 0,
    min: 0
  },

  // POUR LOT UNIQUEMENT
  numeroLot: {
    type: String,
    required: false,
    sparse: true
  },

  // HISTORIQUE DES RÉCEPTIONS (pour FIFO et traçabilité)
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

  // ÉTAT DE L'EMPLACEMENT
  statut: {
    type: String,
    enum: ['EN_STOCK', 'PARTIELLEMENT_VENDU', 'VIDE', 'FERMÉ'],
    default: 'EN_STOCK'
  },

  // DATES
  dateCreation: {
    type: Date,
    default: Date.now
  },
  dateOuverture: {
    type: Date,
    required: false
  },
  dateFermeture: {
    type: Date,
    required: false
  },
  dateModification: {
    type: Date,
    default: Date.now
  }
});

// Middleware: Mettre à jour dateModification avant sauvegarde
stockRayonSchema.pre('save', function(next) {
  this.dateModification = new Date();
  next();
});

// VIRTUAL: quantité totale
stockRayonSchema.virtual('quantiteTotal').get(function() {
  return this.quantiteDisponible + this.quantiteRéservée + this.quantiteDamaged;
});

// VIRTUAL: nombre de réceptions fusionnées
stockRayonSchema.virtual('nombreReceptions').get(function() {
  return this.réceptions.length;
});

// METHOD: Ajouter réception à l'historique
stockRayonSchema.methods.ajouterReception = function(receptionId, quantite) {
  this.réceptions.push({
    receptionId,
    quantite,
    dateReception: new Date()
  });
  this.quantiteDisponible += quantite;
  return this.save();
};

// METHOD: Enlever quantité (mouvement)
stockRayonSchema.methods.enleverQuantite = function(quantite) {
  if (quantite > this.quantiteDisponible) {
    throw new Error(`Quantité insuffisante: ${this.quantiteDisponible} disponible, ${quantite} demandé`);
  }
  this.quantiteDisponible -= quantite;
  return this.save();
};

module.exports = mongoose.model('StockRayon', stockRayonSchema);
