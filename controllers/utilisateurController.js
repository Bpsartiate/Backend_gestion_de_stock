const bcrypt = require('bcryptjs');
const Utilisateur = require('../models/utilisateur');
const Business = require('../models/business');

// Modifier profil utilisateur avec contrôle d'accès
exports.modifierProfil = async (req, res) => {
  try {
    const editor = req.user;
    const targetUserId = req.params.id;
    const data = { ...req.body };

    const targetUser = await Utilisateur.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    // Contrôle accès modif
    if (editor.role === 'vendeur' && editor._id.toString() !== targetUserId) {
      return res.status(403).json({ message: 'Accès interdit' });
    }
    if (editor.role === 'superviseur') {
      if (targetUser.assignedTo?.toString() !== editor._id.toString()) {
        return res.status(403).json({ message: 'Accès interdit' });
      }
      if (data.password && !editor.canEditPasswords) {
        return res.status(403).json({ message: 'Modification mot de passe non autorisée' });
      }
      delete data.role;
      delete data.assignedTo;
    }
    if (editor.role === 'admin' && data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    if (editor.role === 'vendeur') {
      delete data.password;
      delete data.role;
      delete data.assignedTo;
    }

    Object.assign(targetUser, data);
    await targetUser.save();
    res.json({ message: 'Profil mis à jour', user: targetUser });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Lister membres selon rôle et entreprise
exports.listerMembres = async (req, res) => {
  try {
    const requester = req.user;
    let filter = { isActive: true };

    if (requester.role === 'superviseur') {
      filter.assignedTo = requester._id;
    } else if (requester.role === 'vendeur') {
      filter._id = requester._id;
    }
    // Filtrer sur entreprise: si liée, ajouter à filter

    const membres = await Utilisateur.find(filter).select('-password');
    res.json(membres);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer le profil d'un utilisateur (sans mot de passe)
exports.getProfil = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Utilisateur.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    console.error('getProfil error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Assignation vendeur -> gestionnaire (admin)
exports.assignerVendeur = async (req, res) => {
  try {
    const { vendeurId, gestionnaireId } = req.body;
    const vendeur = await Utilisateur.findById(vendeurId);
    const gestionnaire = await Utilisateur.findById(gestionnaireId);

    if (!vendeur || !gestionnaire || !['superviseur', 'admin'].includes(gestionnaire.role)) {
      return res.status(400).json({ message: 'Invalid IDs' });
    }

    vendeur.assignedTo = gestionnaireId;
    await vendeur.save();

    res.json({ message: 'Vendeur assigné', vendeur });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Modifier rôles et permissions (admin)
exports.modifierRoleEtPermissionsGestionnaire = async (req, res) => {
  try {
    const requester = req.user;
    if (!requester) return res.status(401).json({ message: 'Authentification requise' });

    const { gestionnaireId, role, canEditPasswords, canEditPhoto, canAssignVendors, canAssignManagers, canDeleteMembers, canEditProfileFields } = req.body;

    // Only admins can promote to admin or grant destructive permissions
    if (role === 'admin' && requester.role !== 'admin') {
      return res.status(403).json({ message: 'Seul un admin peut attribuer le rôle admin' });
    }
    if (canDeleteMembers === true && requester.role !== 'admin') {
      return res.status(403).json({ message: 'Seule un admin peut accorder la permission de supprimer des membres' });
    }

    if (!['admin', 'superviseur', 'vendeur'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }
    const gestionnaire = await Utilisateur.findById(gestionnaireId);
    if (!gestionnaire) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    gestionnaire.role = role;
    if (typeof canEditPasswords === 'boolean') gestionnaire.canEditPasswords = canEditPasswords;
    if (typeof canEditPhoto === 'boolean') gestionnaire.canEditPhoto = canEditPhoto;
    if (typeof canAssignVendors === 'boolean') gestionnaire.canAssignVendors = canAssignVendors;
    if (typeof canAssignManagers === 'boolean') gestionnaire.canAssignManagers = canAssignManagers;
    if (typeof canDeleteMembers === 'boolean') gestionnaire.canDeleteMembers = canDeleteMembers;
    if (typeof canEditProfileFields === 'boolean') gestionnaire.canEditProfileFields = canEditProfileFields;
    await gestionnaire.save();

    res.json({ message: 'Rôles et permissions modifiés', user: gestionnaire });
  } catch (error) {
    console.error('modifierRoleEtPermissionsGestionnaire error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
