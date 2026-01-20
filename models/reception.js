const mongoose = require('mongoose');

const receptionSchema = new mongoose.Schema(
  {
    // Références
    produitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true
    },
    magasinId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Magasin',
      required: true
    },
    rayonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rayon',
      required: true
    },

    // Détails réception
    quantite: {
      type: Number,
      required: true,
      min: 0
    },
    prixAchat: {
      type: Number,
      default: 0
    },
    prixTotal: {
      type: Number, // quantite * prixAchat
      default: 0
    },

    // Fournisseur et lot
    fournisseur: String,
    lotNumber: String,
    photoUrl: String,

    // Dates
    dateReception: {
      type: Date,
      default: Date.now
    },
    datePeremption: Date,
    dateFabrication: Date,

    // État et priorité
    statut: {
      type: String,
      enum: ['controle', 'stocke', 'rejete'],
      default: 'controle'
    },
    priorite: {
      type: String,
      enum: ['normale', 'urgente'],
      default: 'normale'
    },

    // Champs dynamiques
    numeroBatch: String,
    certificat: String,
    numeroSerie: String,
    codeBarres: String,
    etatColis: String,
    garantie: Number,

    // 🎁 Champs LOT (pour produits avec typeStockage: 'lot')
    nombrePieces: {
      type: Number,
      default: 0
    },
    quantiteParPiece: {
      type: Number,
      default: 0
    },
    uniteDetail: String,
    prixParUnite: {
      type: Number,
      default: 0
    },

    // Traçabilité
    mouvementStockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StockMovement'
    },
    utilisateurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur'
    },
    notes: String,
    status: {
      type: Number,
      default: 1 // 1 = actif, 0 = archivé
    }
  },
  {
    timestamps: true
  }
);

// Index
receptionSchema.index({ magasinId: 1, dateReception: -1 });
receptionSchema.index({ produitId: 1 });
receptionSchema.index({ statut: 1 });

// Virtual: prixTotal
receptionSchema.pre('save', function(next) {
  if (this.quantite && this.prixAchat) {
    this.prixTotal = this.quantite * this.prixAchat;
  }
  next();
});

module.exports = mongoose.model('Reception', receptionSchema);
