const mongoose = require('mongoose');

/**
 * 📦 MODEL LOT - Gestion FIFO/LIFO
 * 
 * Chaque lot représente une entrée de produits avec:
 * - Date d'entrée
 * - Date d'expiration
 * - Quantité disponible
 * - Quantité vendue/utilisée (pour FIFO)
 * - Prix d'achat
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

  // IDENTIFICATION DU LOT
  numeroBatch: {
    type: String,
    required: true,
    maxlength: 50
    // Exemple: LOT-2025-001, BATCH-ABC-123
  },

  // QUANTITÉS
  quantiteEntree: {
    type: Number,
    required: true,
    min: 0.01
  },

  quantiteDisponible: {
    type: Number,
    required: true,
    min: 0
    // = quantiteEntree - quantiteVendue
  },

  quantiteVendue: {
    type: Number,
    default: 0,
    min: 0
    // Pour FIFO tracking
  },

  // PRIX
  prixUnitaireAchat: {
    type: Number,
    required: true,
    min: 0
  },

  prixTotal: {
    type: Number,
    required: true,
    min: 0
    // quantiteEntree * prixUnitaireAchat
  },

  // DATES IMPORTANTES
  dateEntree: {
    type: Date,
    default: Date.now,
    index: true
    // Pour FIFO
  },

  dateExpiration: Date,
  // null si pas d'expiration

  // DOCUMENT SOURCE
  numeroDocument: String,
  // Facture d'achat, bon de réception, etc.

  fournisseur: String,

  // LOCALISATION
  rayonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rayon'
  },

  // STATUT
  status: {
    type: String,
    enum: ['ACTIF', 'EXPIRE', 'EPUISE', 'ANNULE'],
    default: 'ACTIF',
    index: true
  },

  // NOTES
  notes: String,

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

// Index pour FIFO: par magasin, produit, date d'entrée
lotSchema.index({ magasinId: 1, produitId: 1, dateEntree: 1 });

// Index pour vérifier expiration
lotSchema.index({ dateExpiration: 1, status: 1 });

// Middleware pré-save
lotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculer le prix total
  this.prixTotal = (this.prixUnitaireAchat || 0) * (this.quantiteEntree || 0);
  
  // Assurer quantité vendue <= quantité entrée
  if (this.quantiteVendue > this.quantiteEntree) {
    this.quantiteVendue = this.quantiteEntree;
  }
  
  // Calculer quantité disponible
  this.quantiteDisponible = this.quantiteEntree - this.quantiteVendue;
  
  // Vérifier expiration
  if (this.dateExpiration && new Date() > this.dateExpiration && this.status === 'ACTIF') {
    this.status = 'EXPIRE';
  }
  
  // Si tout vendu
  if (this.quantiteDisponible <= 0) {
    this.status = 'EPUISE';
  }
  
  next();
});

module.exports = mongoose.model('Lot', lotSchema);
