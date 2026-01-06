const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
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

  // TYPE DE MOUVEMENT
  type: {
    type: String,
    enum: ['ENTREE_INITIALE', 'RECEPTION', 'SORTIE', 'TRANSFERT', 'RETOUR', 'INVENTAIRE', 'PERTE'],
    required: true,
    index: true
  },

  // QUANTITÉS
  quantite: {
    type: Number,
    required: true,
    min: 0.01
  },

  // DIRECTION (pour les transferts inter-magasins)
  magasinDestinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Magasin'
    // Requis si type === 'TRANSFERT'
  },

  // INFORMATION DOCUMENT
  numeroDocument: String, // N° de facture, bon de reception, etc.
  
  // SOURCE/FOURNISSEUR
  fournisseur: {
    type: String,
    maxlength: 100
  },

  // UTILISATEUR QUI A FAIT LE MOUVEMENT
  utilisateurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },

  // PRIX UNITAIRE AU MOMENT DU MOUVEMENT
  prixUnitaire: {
    type: Number,
    default: 0
  },

  // NOTES/OBSERVATIONS
  observations: String,

  // STATUT
  statut: {
    type: String,
    enum: ['BROUILLON', 'VALIDÉ', 'ANNULÉ'],
    default: 'VALIDÉ'
  },

  // DATES
  dateDocument: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour les recherches
stockMovementSchema.index({ magasinId: 1, produitId: 1 });
stockMovementSchema.index({ magasinId: 1, type: 1 });
stockMovementSchema.index({ dateDocument: -1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
