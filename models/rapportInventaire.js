const mongoose = require('mongoose');

/**
 * 📊 MODEL RAPPORT INVENTAIRE
 * 
 * Snapshots périodiques du stock pour:
 * - Comparaison théorique vs réel
 * - Audit des différences
 * - Historique des inventaires
 */

const rapportInventaireSchema = new mongoose.Schema({
  magasinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Magasin',
    required: true,
    index: true
  },

  // IDENTIFICATION
  numeroInventaire: {
    type: String,
    required: true,
    unique: true
    // INV-2025-001, INV-MAG-A-001
  },

  // DATES
  dateDebut: {
    type: Date,
    default: Date.now,
    index: true
  },

  dateFin: {
    type: Date
  },

  dateCreation: {
    type: Date,
    default: Date.now
  },

  // STATUT
  statut: {
    type: String,
    enum: ['EN_COURS', 'COMPLETE', 'VALIDEE', 'REJETEE'],
    default: 'EN_COURS',
    index: true
  },

  // DÉTAILS INVENTAIRE
  ligneProduits: [{
    produitId: mongoose.Schema.Types.ObjectId,
    reference: String,
    designation: String,
    
    // QUANTITÉS
    quantiteTheorique: Number,  // Selon la BD
    quantitePhysique: Number,   // Comptée manuellement
    quantiteDifference: Number,  // Physique - Théorique
    percentageEcart: Number,     // (Difference / Théorique) * 100
    
    // RAYON
    rayonId: mongoose.Schema.Types.ObjectId,
    nomRayon: String,
    
    // NOTES
    notes: String,
    
    // LOTS (pour traçabilité FIFO)
    lots: [{
      lotId: mongoose.Schema.Types.ObjectId,
      numeroBatch: String,
      quantiteTheorique: Number,
      quantitePhysique: Number,
      dateEntree: Date,
      dateExpiration: Date,
      notes: String
    }]
  }],

  // RÉSUMÉ
  resume: {
    totalProduitsInventories: Number,
    totalProduitsAvecEcart: Number,
    pourcentageEcart: Number,
    
    // MONTANTS
    valeurTheorique: Number,    // Total prix * quantité théorique
    valeurPhysique: Number,     // Total prix * quantité physique
    differenceMontant: Number,  // Pertes financières
    
    // ÉCARTS
    ecartPositif: Number,       // Stock trouvé en plus
    ecartNegatif: Number,       // Stock manquant
    
    // RAYONS
    rayonsAffectes: [String]    // Rayons avec écarts
  },

  // UTILISATEURS
  utilisateurCreateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  },

  utilisateurValidateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  },

  // OBSERVATIONS
  observations: String,
  raiseCommentaires: String,   // Si rejeté

  // ACTIONS SUITE À INVENTAIRE
  ajustementsCrees: [{
    produitId: mongoose.Schema.Types.ObjectId,
    quantite: Number,
    type: {
      type: String,
      enum: ['AJOUT', 'DEDUCTION']
    },
    raison: String,
    dateAjustement: Date
  }],

  // PHOTOS INVENTAIRE (si nécessaire)
  photosInventaire: [String],   // URLs Cloudinary

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

// Indexes
rapportInventaireSchema.index({ magasinId: 1, dateDebut: -1 });
rapportInventaireSchema.index({ statut: 1 });

module.exports = mongoose.model('RapportInventaire', rapportInventaireSchema);
