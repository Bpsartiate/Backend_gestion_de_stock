const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // IDENTIFICATION DE L'ACTION
  action: {
    type: String,
    enum: [
      'CREATE_PRODUIT',
      'UPDATE_PRODUIT',
      'DELETE_PRODUIT',
      'CREATE_RECEPTION',
      'UPDATE_RECEPTION',
      'DELETE_RECEPTION',
      'CREATE_RAYON',
      'UPDATE_RAYON',
      'DELETE_RAYON',
      'CREATE_TYPE_PRODUIT',
      'UPDATE_TYPE_PRODUIT',
      'DELETE_TYPE_PRODUIT',
      'CREATE_MOUVEMENT',
      'UPDATE_MOUVEMENT',
      'LOGIN',
      'LOGOUT',
      'CHANGE_PASSWORD',
      'OTHER'
    ],
    required: true,
    index: true
  },

  // QUI A FAIT L'ACTION
  utilisateurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true,
    index: true
  },
  utilisateurNom: String, // Cache du nom pour éviter lookup
  utilisateurEmail: String, // Cache de l'email

  // SUR QUEL MAGASIN
  magasinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Magasin',
    index: true
  },
  magasinNom: String, // Cache du nom

  // SUR QUELLE ENTITÉ
  entityType: {
    type: String,
    enum: [
      'Produit',
      'Reception',
      'Rayon',
      'TypeProduit',
      'StockMovement',
      'Utilisateur',
      'Magasin',
      'OTHER'
    ],
    required: true,
    index: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  entityName: String, // Cache du nom (ex: "Viande crue" pour un produit)

  // DÉTAILS DE L'ACTION
  description: String, // Description lisible: "Produit 'Viande' supprimé"
  raison: String, // Raison optionnelle pour suppression
  
  // CHANGEMENTS
  changes: {
    before: mongoose.Schema.Types.Mixed, // État avant
    after: mongoose.Schema.Types.Mixed   // État après
  },

  // MÉTADONNÉES
  ipAddress: String, // Adresse IP du client
  userAgent: String, // User agent du navigateur
  
  // STATUT
  statut: {
    type: String,
    enum: ['SUCCESS', 'FAILED'],
    default: 'SUCCESS'
  },
  erreur: String, // Message d'erreur si échoué

  // TIMESTAMPS
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 7776000 // Auto-suppression après 90 jours (TTL index)
  }
});

// Index composés pour recherches fréquentes
auditLogSchema.index({ utilisateurId: 1, createdAt: -1 });
auditLogSchema.index({ magasinId: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

// Middleware: Ajouter des informations utilisateur au save
auditLogSchema.pre('save', async function(next) {
  if (!this.utilisateurId) {
    return next();
  }

  try {
    // On ne peut pas faire de populate en pre-save facilement
    // Le service qui crée l'AuditLog doit le faire
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
