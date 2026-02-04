const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  magasinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Magasin',
    required: true,
    index: true
  },

  // INFOS PRINCIPALES
  reference: {
    type: String,
    required: true,
    maxlength: 50
  },
  designation: {
    type: String,
    required: true,
    maxlength: 200
  },

  // CLASSIFICATION
  typeProduitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TypeProduit',
    required: true
  },
  
  // MARQUE DU PRODUIT
  marque: {
    type: String,
    maxlength: 100,
    default: null
  },
  
  // ⚠️ rayonId: DEPRECATED - Utiliser StockRayon pour la localisation
  // Gardé pour compatibilité, mais ne devrait pas être modifié
  rayonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rayon',
    default: null
  },

  // QUANTITÉS (TOTALES - somme de tous les rayons)
  quantiteActuelle: {
    type: Number,
    default: 0,
    min: 0
  },
  quantiteEntree: {
    type: Number,
    default: 0
  },
  quantiteSortie: {
    type: Number,
    default: 0
  },

  // PRIX ET COÛTS
  prixUnitaire: {
    type: Number,
    default: 0,
    min: 0
  },
  prixTotal: {
    type: Number,
    default: 0,
    min: 0
  },

  // CHAMPS DYNAMIQUES (couleur, dosage, etc.)
  champsDynamiques: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // INFORMATIONS SUPPLÉMENTAIRES
  etat: {
    type: String,
    enum: ['Neuf', 'Bon état', 'Usagé', 'Endommagé', 'EN_COMMANDE', 'STOCKÉ'],
    default: 'Neuf'
  },
  dateEntree: {
    type: Date,
    default: Date.now
  },
  dateReception: Date,
  dateFabrication: Date,
  dateExpiration: Date,
  datePeremption: Date,

  // SEUIL D'ALERTE
  seuilAlerte: {
    type: Number,
    default: 10,
    min: 0
  },

  // PHOTO
  photoUrl: String,
  photoCloudinaryId: String,

  // NOTES
  notes: String,

  // 🆕 COMMANDES LIÉES
  commandesIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commande'
    }
  ],

  // STATUT
  statut: {
    type: String,
    enum: ['controle', 'stocke', 'rejete'],
    default: 'stocke'
  },

  // PRIORITÉ
  priorite: {
    type: String,
    enum: ['normale', 'urgente'],
    default: 'normale'
  },

  status: {
    type: Number,
    enum: [0, 1],
    default: 1 // 1 = Actif, 0 = Inactif/Supprimé
  },

  // SOFT DELETE
  estSupprime: {
    type: Boolean,
    default: false,
    index: true
  },
  dateSuppression: Date,
  raison: String, // Raison de la suppression
  supprimePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  },

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

// Index composé pour éviter les doublons par magasin
produitSchema.index({ magasinId: 1, reference: 1 }, { unique: true });

// Index pour les recherches
produitSchema.index({ magasinId: 1, rayonId: 1 });
produitSchema.index({ magasinId: 1, typeProduitId: 1 });

// Middleware pour mettre à jour updatedAt
produitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  // Recalculer le prix total
  this.prixTotal = (this.prixUnitaire || 0) * (this.quantiteActuelle || 0);
  next();
});

module.exports = mongoose.model('Produit', produitSchema);
