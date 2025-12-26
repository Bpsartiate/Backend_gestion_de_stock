const Utilisateur = require('../models/utilisateur');
const Magasin = require('../models/magasin');

/**
 * Middleware pour vérifier l'accès à un magasin
 * Admin: accès à tous les magasins
 * Gestionnaire (superviseur): accès UNIQUEMENT à ses magasins assignés
 * Vendeur: accès refusé
 */
const checkMagasinAccess = async (req, res, next) => {
  const requester = req.user;
  const magasinId = req.params.magasinId || req.body.magasinId || req.query.magasinId;

  // Vendeur: pas d'accès
  if (requester.role === 'vendeur') {
    return res.status(403).json({ 
      message: 'Accès refusé: les vendeurs ne peuvent pas accéder à cette ressource (utiliser le POS mobile)' 
    });
  }

  // Admin: accès à tout
  if (requester.role === 'admin') {
    return next();
  }

  // Gestionnaire (superviseur): vérifier que le magasin lui appartient
  if (requester.role === 'superviseur' || requester.role === 'gestionnaire') {
    const magasin = await Magasin.findById(magasinId).select('managerId');
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin introuvable' });
    }

    // Vérifier que le gestionnaire est le manager du magasin
    if (magasin.managerId?.toString() !== requester._id.toString()) {
      return res.status(403).json({ 
        message: 'Accès refusé: ce magasin ne vous appartient pas' 
      });
    }

    return next();
  }

  return res.status(403).json({ message: 'Rôle non reconnu' });
};

/**
 * Middleware pour vérifier l'accès à une entreprise
 * Admin: accès à tout
 * Gestionnaire: accès aux magasins de son entreprise
 */
const checkBusinessAccess = async (req, res, next) => {
  const requester = req.user;
  const businessId = req.params.businessId || req.body.businessId;

  // Vendeur: pas d'accès
  if (requester.role === 'vendeur') {
    return res.status(403).json({ 
      message: 'Accès refusé: les vendeurs ne peuvent pas accéder à cette ressource' 
    });
  }

  // Admin: accès à tout
  if (requester.role === 'admin') {
    return next();
  }

  // Gestionnaire: vérifier qu'il a accès à cette entreprise via ses magasins
  if (requester.role === 'superviseur' || requester.role === 'gestionnaire') {
    const magasinsDuGestionnaire = await Magasin.find({ managerId: requester._id }).select('businessId');
    const businessIds = magasinsDuGestionnaire.map(m => m.businessId?.toString());

    if (!businessIds.includes(businessId?.toString())) {
      return res.status(403).json({ 
        message: 'Accès refusé: cette entreprise ne vous appartient pas' 
      });
    }

    return next();
  }

  return res.status(403).json({ message: 'Rôle non reconnu' });
};

/**
 * Middleware pour bloquer les vendeurs
 * Les vendeurs ne doivent pas avoir accès au dashboard web
 */
const blockVendeur = (req, res, next) => {
  const requester = req.user;

  if (requester.role === 'vendeur') {
    return res.status(403).json({ 
      message: 'Accès refusé: les vendeurs doivent utiliser l\'application POS mobile' 
    });
  }

  return next();
};

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

module.exports = { canModifyUser, checkMagasinAccess, checkBusinessAccess, blockVendeur };
