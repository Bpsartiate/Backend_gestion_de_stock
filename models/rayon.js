const mongoose = require('mongoose');

const rayonSchema = new mongoose.Schema({
  magasinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Magasin',
    required: true,
    index: true
  },
  
  // INFOS PRINCIPALES
  codeRayon: {
    type: String,
    required: true,
    maxlength: 6,
    uppercase: true
  },
  nomRayon: {
    type: String,
    required: true
  },
  
  // PARAMÈTRES
  typeRayon: {
    type: String,
    enum: ['RAYON', 'ETAGERE', 'SOL', 'FROID', 'VITRINE'],
    default: 'RAYON'
  },
  capaciteMax: {
    type: Number,
    default: 1000,
    min: 1
  },
  
  // STYLING
  couleurRayon: {
    type: String,
    default: '#10b981' // Couleur hex pour identification visuelle
  },
  iconeRayon: {
    type: String,
    default: '📦' // Emoji ou icône
  },
  
  // TYPES PRODUITS AUTORISÉS
  typesProduitsAutorises: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TypeProduit'
  }],
  
  // STOCK ACTUEL
  quantiteActuelle: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // INFOS SUPPLÉMENTAIRES
  description: String,
  
  // STATUT
  status: {
    type: Number,
    enum: [0, 1],
    default: 1 // 1 = Actif, 0 = Inactif
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

// Index composé pour éviter les doublons
rayonSchema.index({ magasinId: 1, codeRayon: 1 }, { unique: true });

// Middleware pour mettre à jour updatedAt
rayonSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Rayon', rayonSchema);
