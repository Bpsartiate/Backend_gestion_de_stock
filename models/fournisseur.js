const mongoose = require('mongoose');

const fournisseurSchema = new mongoose.Schema(
  {
    // Informations de base
    nom: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    
    telephone: {
      type: String,
      trim: true,
      maxlength: 20
    },
    
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 100
    },
    
    // Adresse
    adresse: {
      type: String,
      trim: true,
      maxlength: 300
    },
    
    ville: {
      type: String,
      trim: true,
      maxlength: 100
    },
    
    codePostal: {
      type: String,
      trim: true,
      maxlength: 20
    },
    
    paysId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pays'
    },
    
    // Métadonnées
    actif: {
      type: Boolean,
      default: true
    },
    
    notes: {
      type: String,
      maxlength: 1000
    },
    
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
    timestamps: true
  }
);

// Index pour recherche rapide
fournisseurSchema.index({ nom: 1 });
fournisseurSchema.index({ email: 1 });
fournisseurSchema.index({ telephone: 1 });

module.exports = mongoose.model('Fournisseur', fournisseurSchema);
