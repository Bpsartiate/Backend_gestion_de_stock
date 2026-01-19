const mongoose = require('mongoose');

/**
 * 📦 MODEL LOT - Suivi individuel de chaque pièce/rouleau
 * 
 * Pour produits avec typeStockage: "lot"
 * Chaque lot = UNE PIÈCE (rouleau, carton, boîte, etc)
 * 
 * Exemple:
 *   Rouleau #001: 100 mètres @ 10$/m (reçu)
 *   Après vente de 90m: 10m restants (partiel_vendu)
 *   On peut vendre les 10m restants
 */

const lotSchema = new mongoose.Schema({
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

  typeProduitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TypeProduit',
    required: true,
    index: true
  },

  receptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reception',
    required: true,
    index: true
  },

  // QUANTITÉ (pour un lot = une pièce)
  unitePrincipale: {
    type: String,
    required: true              // ex: "PIÈCE"
  },

  quantiteInitiale: {
    type: Number,
    required: true,
    min: 0                      // ex: 100 (mètres pour un rouleau)
  },

  quantiteRestante: {
    type: Number,
    required: true,
    min: 0                      // Décrémente à chaque vente
  },

  // PRIX
  prixParUnite: {
    type: Number,
    required: true,
    min: 0                      // ex: 10 (dollars par mètre)
  },

  prixTotal: {
    type: Number,
    required: true,
    min: 0                      // quantiteInitiale × prixParUnite
  },

  // UNITÉ DÉTAILLÉE
  uniteDetail: {
    type: String                // ex: "MÈTRE" (la vraie unité de vente)
  },

  // STATUT
  status: {
    type: String,
    enum: ['complet', 'partiel_vendu', 'epuise'],
    default: 'complet'
  },

  // DISPONIBILITÉ
  peutEtreVendu: {
    type: Boolean,
    default: true
  },

  // LOCALISATION
  rayonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rayon'
  },

  stockRayonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StockRayon'
  },

  // DATES
  dateReception: {
    type: Date,
    default: Date.now,
    index: true
  },

  dateExpiration: Date,

  dateDerniereVente: Date,

  // NOTES
  notes: String,

  // MÉTADONNÉES
  historique: [{
    date: { type: Date, default: Date.now },
    action: String,             // "création", "vente", "ajustement"
    quantiteAvant: Number,
    quantiteApres: Number,
    details: String
  }],

  // AUDIT
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// VIRTUEL: Pourcentage vendu
lotSchema.virtual('pourcentageVendu').get(function() {
  if (this.quantiteInitiale === 0) return 0;
  return Math.round(((this.quantiteInitiale - this.quantiteRestante) / this.quantiteInitiale) * 100);
});

// INDEX
lotSchema.index({ magasinId: 1, produitId: 1, status: 1 });
lotSchema.index({ receptionId: 1 });
lotSchema.index({ dateReception: -1 });

// PRE-SAVE: Mettre à jour le status
lotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.quantiteRestante === this.quantiteInitiale) {
    this.status = 'complet';
  } else if (this.quantiteRestante === 0) {
    this.status = 'epuise';
    this.peutEtreVendu = false;
  } else {
    this.status = 'partiel_vendu';
  }
  next();
});

module.exports = mongoose.model('Lot', lotSchema);
