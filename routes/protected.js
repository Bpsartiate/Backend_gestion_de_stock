const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { canModifyUser } = require('../middlewares/authorization');

const utilisateurController = require('../controllers/utilisateurController');

// Profil et membres protégés
router.get('/members', authMiddleware, utilisateurController.listerMembres);
router.get('/profile/:id', authMiddleware, utilisateurController.getProfil);
router.put('/profile/:id', authMiddleware, canModifyUser, utilisateurController.modifierProfil);
router.put('/assign-vendeur', authMiddleware, utilisateurController.assignerVendeur);
router.put('/modifier-role', authMiddleware, utilisateurController.modifierRoleEtPermissionsGestionnaire);

module.exports = router;
