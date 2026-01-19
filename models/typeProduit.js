const mongoose = require('mongoose');

const typeProduitSchema = new mongoose.Schema({
  magasinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Magasin',
    required: true,
    index: true
  },
  
  // INFOS PRINCIPALES
  nomType: {
    type: String,
    required: true,
    maxlength: 50
  },
  
  // UNITÉ DE MESURE PRINCIPALE (deprecated - kept for backward compatibility)
  unitePrincipale: {
    type: String,
    default: 'pièces'
  },

  // CODE ET IDENTIFICATION
  code: {
    type: String,
    required: true,
    maxlength: 10,
    uppercase: true
  },

  // ICÔNE VISUELLE
  icone: {
    type: String,
    default: '📦'
  },

  // COULEUR
  couleur: {
    type: String,
    default: '#3b82f6',
    validate: {
      validator: function(v) {
        return /^#[0-9A-Fa-f]{6}$/.test(v);
      },
      message: 'La couleur doit être au format hex (#RRGGBB)'
    }
  },
  
  // ✨ TYPE DE STOCKAGE
  // "simple": Viande, Riz, etc - juste une quantité
  // "lot": Rouleaux, Boîtes, Cartons - chaque pièce trackée individuellement
  typeStockage: {
    type: String,
    enum: ['simple', 'lot'],
    default: 'simple'
  },
  
  // ✨ UNITÉS DE VENTE (uniquement pour typeStockage: "lot")
  // Les unités dans lesquelles on peut vendre ce produit
  unitesVente: [{
    type: String                    // ex: "PIÈCE", "MÈTRE", "BOÎTE", "KG"
  }],
  
  // Unité principale de stockage (pour lot: PIÈCE, CARTON, etc)
  unitePrincipaleStockage: {
    type: String,
    default: 'pièces'             // ex: "ROULEAU", "CAISSE", "PIÈCE"
  },
  
  // CHAMPS DYNAMIQUES SUPPLÉMENTAIRES
  champsSupplementaires: [{
    nomChamp: String,           // ex: "Couleur", "Dosage"
    typeChamp: {
      type: String,
      enum: ['text', 'select', 'number', 'date'],
      default: 'text'
    },
    optionsChamp: [String],     // Pour type select: ['Rouge', 'Bleu', 'Vert']
    obligatoire: Boolean,
    ordre: Number
  }],
  
  // PARAMÈTRES DE STOCK
  seuilAlerte: {
    type: Number,
    default: 10,
    min: 0
  },
  capaciteMax: {
    type: Number,
    min: 0
  },
  
  // CONDITIONS
  photoRequise: {
    type: Boolean,
    default: false
  },
  
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

// Index composé pour éviter les doublons par magasin
typeProduitSchema.index({ magasinId: 1, nomType: 1 }, { unique: true });

// Middleware pour mettre à jour updatedAt
typeProduitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('TypeProduit', typeProduitSchema);
