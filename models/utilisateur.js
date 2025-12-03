const mongoose = require('mongoose');

const utilisateurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String },
  email: { type: String, unique: true, sparse: true },
  telephone: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'superviseur', 'vendeur'], required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
  canEditPasswords: { type: Boolean, default: false },
  canEditPhoto: { type: Boolean, default: false },
  canAssignVendors: { type: Boolean, default: false },
  canAssignManagers: { type: Boolean, default: false },
  canDeleteMembers: { type: Boolean, default: false },
  canCreateGuichet: { type: Boolean, default: false },
  canEditProfileFields: { type: Boolean, default: false },
  photoUrl: { type: String },
  isActive: { type: Boolean, default: true },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' }, // Business assignée (admin/superviseur)
  guichetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guichet' }, // Guichet assigné (vendeur)
  entreprise: {
    nomEntreprise: { type: String },
    logoUrl: { type: String },
    description: { type: String },
    adresse: { type: String },
    telephone: { type: String },
    email: { type: String },
    typeBusiness: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Utilisateur', utilisateurSchema);
