const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema(
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
    fournisseurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fournisseur'
      // Optionnel si fournisseur est juste un string
    },

    // Détails commande
    quantiteCommandee: {
      type: Number,
      required: true,
      min: 1
    },
    quantiteRecue: {
      type: Number,
      default: 0,
      min: 0
    },

    // 🆕 DÉTAILS POUR PRODUITS LOT
    nombrePieces: {
      type: Number,
      default: null
      // Ex: 5 rouleaux, 10 cartons, etc.
    },
    quantiteParPiece: {
      type: Number,
      default: null
      // Ex: 100 mètres par rouleau, 20 kg par carton
    },
    uniteDetail: {
      type: String,
      default: null
      // Ex: mètre, kg, litre, etc.
    },

    // Coûts
    prixUnitaire: {
      type: Number,
      required: true,
      min: 0
    },
    prixTotal: {
      type: Number,
      default: 0
      // = quantiteCommandee * prixUnitaire
    },

    // Fournisseur (info simple)
    fournisseur: {
      type: String,
      maxlength: 200
    },

    // 🆕 MARQUE DU PRODUIT
    marque: {
      type: String,
      maxlength: 100,
      trim: true
      // Ex: Samsung, LG, Dell, etc.
    },

    // 🆕 PRÉVISIONS & SPÉCIFICATIONS
    etatPrevu: {
      type: String,
      enum: ['Neuf', 'Bon état', 'Usagé', 'Endommagé'],
      default: 'Neuf'
      // État attendu du produit à la réception
    },
    delaiLivraisonPrevu: {
      type: Number, // en jours
      default: 7
      // Délai attendu pour la livraison
    },
    remarquesCommande: String,
    remarques: String,  // Alias pour remarquesCommande (spécifications fournisseur)
    // Autres spécifications (emballage, certifications, etc.)
    specifications: mongoose.Schema.Types.Mixed,

    // Dates
    dateCommande: {
      type: Date,
      default: Date.now
    },
    dateExpedition: Date,
    dateEcheance: Date, // Date de livraison attendue
    dateReception: Date, // Après réception réelle

    // 🔥 STATUT COMMANDE
    statut: {
      type: String,
      enum: ['EN_ATTENTE', 'EXPEDIÉE', 'REÇUE_PARTIELLEMENT', 'REÇUE_COMPLÈTEMENT', 'ANNULÉE', 'RETOURNÉE'],
      default: 'EN_ATTENTE'
    },

    // Informations supplémentaires
    numeroCommande: {
      type: String,
      unique: true,
      sparse: true
    },
    numeroFacture: String,
    numeroTracking: String,
    notes: String,
    observation: String,

    // Récepctions liées
    receptionsIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reception'
      }
    ],

    // Lot/Batch info
    lotNumber: String,
    dateFabrication: Date,
    datePeremption: Date,

    // Pièces jointes
    documents: [
      {
        nom: String,
        url: String,
        type: String, // 'facture', 'bon_livraison', 'certificat'
        dateAjout: {
          type: Date,
          default: Date.now
        }
      }
    ],

    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur'
    }
  },
  {
    timestamps: true,
    collection: 'commandes'
  }
);

// Index pour recherche rapide
commandeSchema.index({ magasinId: 1, statut: 1 });
commandeSchema.index({ produitId: 1 });
// numeroCommande a déjà un index via 'unique: true'
commandeSchema.index({ dateCommande: -1 });

// Virtual pour résumer
commandeSchema.virtual('pourcentageRecuision').get(function () {
  if (this.quantiteCommandee === 0) return 0;
  return Math.round((this.quantiteRecue / this.quantiteCommandee) * 100);
});

// Pré-save hook pour calculer prixTotal
commandeSchema.pre('save', function (next) {
  this.prixTotal = this.quantiteCommandee * this.prixUnitaire;
  next();
});

module.exports = mongoose.model('Commande', commandeSchema);
