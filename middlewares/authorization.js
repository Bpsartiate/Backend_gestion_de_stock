const Utilisateur = require('../models/utilisateur');

const canModifyUser = async (req, res, next) => {
  const requester = req.user;
  const targetId = req.params.id || req.body.userId;

  if (requester.role === 'admin') return next();

  const targetUser = await Utilisateur.findById(targetId);
  if (!targetUser) return res.status(404).json({ message: 'Utilisateur introuvable' });

  if (requester.role === 'superviseur' && targetUser.assignedTo?.toString() === requester._id.toString()) {
    return next();
  }

  if (requester.role === 'vendeur' && targetUser._id.toString() === requester._id.toString()) {
    return next();
  }

  return res.status(403).json({ message: 'Accès refusé' });
};

module.exports = { canModifyUser };
