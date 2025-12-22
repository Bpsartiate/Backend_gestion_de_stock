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
  rayonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rayon',
    required: true
  },

  // QUANTITÉS
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
    enum: ['Neuf', 'Bon état', 'Usagé', 'Endommagé'],
    default: 'Neuf'
  },
  dateEntree: {
    type: Date,
    default: Date.now
  },
  dateExpiration: Date,

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

  // STATUT
  status: {
    type: Number,
    enum: [0, 1],
    default: 1 // 1 = Actif, 0 = Inactif/Supprimé
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
