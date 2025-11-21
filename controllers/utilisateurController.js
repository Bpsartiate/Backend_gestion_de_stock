const Utilisateur = require('../models/utilisateur');

// Modifier le profil utilisateur (PUT /profile/:id)
exports.modifierProfil = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Empêcher la modification du mot de passe via cette route
    delete updates.password;

    const updated = await Utilisateur.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ message: 'Profil mis à jour', user: updated });
  } catch (err) {
    console.error('modifierProfil error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Assignation d'un vendeur à un gestionnaire (admin seulement)
exports.assignerVendeur = async (req, res) => {
  try {
    const { vendeurId, gestionnaireId } = req.body;
    if (!vendeurId || !gestionnaireId) return res.status(400).json({ message: 'vendeurId et gestionnaireId requis' });

    const vendeur = await Utilisateur.findById(vendeurId);
    const gestionnaire = await Utilisateur.findById(gestionnaireId);
    if (!vendeur || !gestionnaire) return res.status(404).json({ message: 'Utilisateur introuvable' });

    vendeur.assignedTo = gestionnaire._id;
    await vendeur.save();

    res.json({ message: 'Vendeur assigné au gestionnaire', vendeur });
  } catch (err) {
    console.error('assignerVendeur error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Modifier rôle et permissions d'un gestionnaire (admin seulement)
exports.modifierRoleEtPermissionsGestionnaire = async (req, res) => {
  try {
    const { userId, role, canEditPasswords } = req.body;
    if (!userId || !role) return res.status(400).json({ message: 'userId et role requis' });

    const user = await Utilisateur.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    user.role = role;
    if (typeof canEditPasswords === 'boolean') user.canEditPasswords = canEditPasswords;
    await user.save();

    res.json({ message: 'Rôle et permissions mis à jour', user });
  } catch (err) {
    console.error('modifierRoleEtPermissionsGestionnaire error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
const bcrypt = require('bcryptjs');
const Utilisateur = require('../models/utilisateur');

exports.modifierProfil = async (req, res) => {
  try {
    const editor = req.user;         // utilisateur connecté (donné par middleware auth)
    const targetUserId = req.params.id;
    const data = req.body;

    const targetUser = await Utilisateur.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    // Contrôle d'accès
    if (editor.role === 'vendeur' && editor._id.toString() !== targetUserId) {
      return res.status(403).json({ message: 'Accès interdit' });
    }

    if (editor.role === 'gestionnaire') {
      if (targetUser.assignedTo?.toString() !== editor._id.toString()) {
        return res.status(403).json({ message: 'Accès interdit' });
      }
      // Gestionnaire ne peut modifier le mot de passe que si autorisé
      if (data.password) {
        if (!editor.canEditPasswords) {
          return res.status(403).json({ message: 'Modification du mot de passe non autorisée' });
        }
        data.password = await bcrypt.hash(data.password, 10);
      }
      // Gestionnaire ne peut modifier ni rôle ni assignedTo
      delete data.role;
      delete data.assignedTo;
    }

    if (editor.role === 'admin' && data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    if (editor.role === 'vendeur') {
      // Limiter champs modifiables par vendeur (ex: photo, téléphone)
      delete data.password;
      delete data.role;
      delete data.assignedTo;
      // filtre supplémentaire côté frontend conseillé
    }

    // Mise à jour
    Object.assign(targetUser, data);
    await targetUser.save();

    res.json({ message: 'Profil mis à jour avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.assignerVendeur = async (req, res) => {
  try {
    const { vendeurId, gestionnaireId } = req.body;
    const vendeur = await Utilisateur.findById(vendeurId);
    if (!vendeur) return res.status(404).json({ message: 'Vendeur non trouvé' });

    const gestionnaire = await Utilisateur.findById(gestionnaireId);
    if (!gestionnaire || !['superviseur', 'admin'].includes(gestionnaire.role)) {
      return res.status(400).json({ message: 'Gestionnaire invalide' });
    }

    vendeur.assignedTo = gestionnaireId;
    await vendeur.save();

    res.json({ message: 'Vendeur assigné au gestionnaire' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.modifierRoleEtPermissionsGestionnaire = async (req, res) => {
  try {
    const { gestionnaireId, role, canEditPasswords } = req.body;

    if (!['admin', 'superviseur', 'vendeur'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    const gestionnaire = await Utilisateur.findById(gestionnaireId);
    if (!gestionnaire) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    gestionnaire.role = role;
    gestionnaire.canEditPasswords = canEditPasswords;
    await gestionnaire.save();

    res.json({ message: 'Rôle et permissions modifiés' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
