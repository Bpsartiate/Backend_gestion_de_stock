const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const utilisateurController = require('../controllers/utilisateurController');
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès admin requis' });
  next();
};

router.get('/profil', authMiddleware, (req, res) => {
  res.json({ message: 'Accès route protégée', user: req.user });
});
// Modifier profil utilisateur (accessible avec auth)
router.put('/profile/:id', authMiddleware, utilisateurController.modifierProfil);

// Assignation vendeur -> gestionnaire (admin uniquement)
router.put('/assign-vendeur', authMiddleware, authorizeAdmin, utilisateurController.assignerVendeur);

// Modifier rôle et permissions gestionnaire (admin uniquement)
router.put('/gestionnaire-permissions', authMiddleware, authorizeAdmin, utilisateurController.modifierRoleEtPermissionsGestionnaire);

module.exports = router;
