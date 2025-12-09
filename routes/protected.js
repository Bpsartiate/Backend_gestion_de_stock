const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { canModifyUser } = require('../middlewares/authorization');
const Utilisateur = require('../models/utilisateur');
const Guichet = require('../models/guichet');
const Magasin = require('../models/magasin');
const Business = require('../models/business');
const Affectation = require('../models/affectation');
const Activity = require('../models/activity');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../services/cloudinary');

const utilisateurController = require('../controllers/utilisateurController');
const upload = require('../middlewares/upload');

// Profil et membres protégés
router.get('/members', authMiddleware, utilisateurController.listerMembres);
router.get('/profile/:id', authMiddleware, utilisateurController.getProfil);
router.put('/profile/:id', authMiddleware, canModifyUser, upload.single('photo'), utilisateurController.modifierProfil);
router.put('/assign-vendeur', authMiddleware, utilisateurController.assignerVendeur);
router.put('/modifier-role', authMiddleware, utilisateurController.modifierRoleEtPermissionsGestionnaire);

// PUT /api/protected/assign-guichet - Superviseur assigne un vendeur à un guichet
router.put('/assign-guichet', authMiddleware, async (req, res) => {
  const requesterId = req.user?.id;
  if (!requesterId) return res.status(401).json({ message: 'Utilisateur non authentifié' });

  // Load requester from DB to get up-to-date permissions
  const requester = await Utilisateur.findById(requesterId).select('role canCreateGuichet nom prenom');
  if (!requester) return res.status(401).json({ message: 'Utilisateur non trouvé' });

  // Only admins or superviseurs may perform this action
  if (!['admin', 'superviseur'].includes(requester.role)) {
    return res.status(403).json({ message: 'Accès superviseur requis' });
  }

  // If the requester is a superviseur, ensure they have the canCreateGuichet permission
  if (requester.role === 'superviseur' && !requester.canCreateGuichet) {
    return res.status(403).json({ message: 'Permission refusée: le superviseur ne peut pas assigner de guichets' });
  }

  try {
    const { vendeurId, guichetId } = req.body;
    
    if (!vendeurId || !guichetId) {
      return res.status(400).json({ message: 'vendeurId et guichetId sont requis' });
    }

    // Vérifier que le guichet existe
    const guichet = await Guichet.findById(guichetId).populate('magasinId');
    if (!guichet) return res.status(404).json({ message: 'Guichet non trouvé' });

    // Vérifier que le magasin existe et récupérer l'entrepriseId
    const magasin = await Magasin.findById(guichet.magasinId);
    if (!magasin) return res.status(404).json({ message: 'Magasin non trouvé' });

    // Vérifier que l'entreprise existe
    const entreprise = await Business.findById(magasin.businessId);
    if (!entreprise) return res.status(404).json({ message: 'Entreprise non trouvée' });

    // Vérifier que le vendeur existe et est bien un vendeur
    const vendeur = await Utilisateur.findById(vendeurId);
    if (!vendeur) return res.status(404).json({ message: 'Vendeur non trouvé' });
    if (vendeur.role !== 'vendeur') return res.status(400).json({ message: 'Cet utilisateur n\'est pas un vendeur' });

    // Terminer l'affectation précédente (si elle existe et est active)
    await Affectation.updateMany(
      { vendeurId, status: 1 },
      { $set: { status: 0, dateFinAffectation: new Date() } }
    );

    // Créer une nouvelle affectation
    const newAffectation = new Affectation({
      vendeurId,
      guichetId,
      magasinId: magasin._id,
      entrepriseId: magasin.businessId,
      dateAffectation: new Date(),
      status: 1,
      notes: `Affecté par ${requester.prenom} ${requester.nom}`
    });
    await newAffectation.save();

    // Mettre à jour le vendeur avec la nouvelle affectation
    await Utilisateur.findByIdAndUpdate(
      vendeurId,
      { $set: { guichetId, businessId: magasin.businessId } },
      { new: true }
    );
    
    return res.json({
      message: 'Vendeur assigné au guichet avec succès',
      affectation: {
        affectationId: newAffectation._id,
        vendeur: { id: vendeur._id, nom: vendeur.nom, prenom: vendeur.prenom },
        guichetId,
        magasinId: magasin._id,
        entrepriseId: magasin.businessId,
        dateAffectation: newAffectation.dateAffectation
      }
    });
  } catch(err) {
    console.error('assign-guichet.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/protected/affectations - Lister toutes les affectations (admin/superviseur)
router.get('/affectations', authMiddleware, async (req, res) => {
  if (!['admin', 'superviseur'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès non autorisé' });
  }

  try {
    const affectations = await Affectation.find()
      .populate('vendeurId', 'nom prenom email')
      .populate('guichetId', 'nom_guichet')
      .populate('magasinId', 'nom_magasin')
      .populate('entrepriseId', 'nomEntreprise');
    
    return res.json(affectations);
  } catch(err) {
    console.error('affectations.list.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/protected/affectations/vendeur/:vendeurId - Affectation actuelle d'un vendeur
router.get('/affectations/vendeur/:vendeurId', authMiddleware, async (req, res) => {
  try {
    const affectation = await Affectation.findOne({ vendeurId: req.params.vendeurId, status: 1 })
      .populate('vendeurId', 'nom prenom email')
      .populate('guichetId', 'nom_guichet')
      .populate('magasinId', 'nom_magasin adresse')
      .populate('entrepriseId', 'nomEntreprise budget devise');
    
    if (!affectation) {
      return res.status(404).json({ message: 'Aucune affectation active pour ce vendeur' });
    }
    
    return res.json(affectation);
  } catch(err) {
    console.error('affectations.vendeur.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/protected/affectations/rapport - Rapport d'affectations (par entreprise/magasin/guichet)
router.get('/affectations/rapport', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès admin requis' });
  }

  try {
    const { entrepriseId, magasinId, dateDebut, dateFin } = req.query;
    let filter = {};

    if (entrepriseId) filter.entrepriseId = entrepriseId;
    if (magasinId) filter.magasinId = magasinId;
    
    if (dateDebut || dateFin) {
      filter.dateAffectation = {};
      if (dateDebut) filter.dateAffectation.$gte = new Date(dateDebut);
      if (dateFin) filter.dateAffectation.$lte = new Date(dateFin);
    }

    const affectations = await Affectation.find(filter)
      .populate('vendeurId', 'nom prenom email')
      .populate('guichetId', 'nom_guichet')
      .populate('magasinId', 'nom_magasin')
      .populate('entrepriseId', 'nomEntreprise budget devise')
      .sort({ dateAffectation: -1 });
    
    return res.json(affectations);
  } catch(err) {
    console.error('affectations.rapport.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;

// POST /api/protected/magasins - créer un magasin (with optional photo)
router.post('/magasins', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    // Only admin or superviseur can create magasins
    const requester = req.user;
    if (!requester || !['admin', 'superviseur'].includes(requester.role)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { businessId, nom_magasin, adresse, telephone, email, latitude, longitude, managerId } = req.body;
    if (!businessId || !nom_magasin) return res.status(400).json({ message: 'businessId et nom_magasin requis' });
    if (!managerId) return res.status(400).json({ message: 'managerId (superviseur) requis' });

    // Vérifier existence entreprise
    const entreprise = await Business.findById(businessId);
    if (!entreprise) return res.status(404).json({ message: 'Entreprise non trouvée' });

    // Vérifier que le manager existe et a le rôle superviseur
    const manager = await Utilisateur.findById(managerId);
    if (!manager) return res.status(404).json({ message: 'Gestionnaire non trouvé' });
    if (manager.role !== 'superviseur') return res.status(400).json({ message: 'L\'utilisateur n\'a pas le rôle superviseur' });

    // Handle photo upload (req.file from multer memory storage)
    // Upload directly to Cloudinary (magasin images stored in 'magasins' folder)
    let photoUrl = null;
    if (req.file && req.file.buffer) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream({ folder: 'magasins' }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
          uploadStream.end(req.file.buffer);
        });
        photoUrl = result.secure_url;
      } catch (upErr) {
        console.error('cloudinary upload error (magasin)', upErr);
        return res.status(400).json({ message: 'Erreur lors de l\'upload de la photo.' });
      }
    }

    // Create magasin
    const newMagasin = new Magasin({
      businessId,
      nom_magasin,
      adresse: adresse || undefined,
      telephone: telephone || undefined,
      email: email || undefined,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      photoUrl: photoUrl || undefined,
      managerId: managerId
    });
    await newMagasin.save();

    // Record affectation for manager (create affectation entry)
    const newAffect = new Affectation({
      managerId: managerId,
      magasinId: newMagasin._id,
      entrepriseId: businessId,
      dateAffectation: new Date(),
      status: 1,
      notes: `Gestionnaire affecté lors de la création du magasin par ${requester.nom || requester.email || requester.id}`
    });
    await newAffect.save();

    // Update manager user with businessId and magasinId (optional)
    await Utilisateur.findByIdAndUpdate(managerId, { $set: { businessId, guichetId: null } });

    // Create activity for business
    try {
      const activity = new Activity({
        businessId,
        userId: requester.id,
        title: 'Magasin créé',
        description: `Magasin '${newMagasin.nom_magasin}' créé et gestionnaire assigné: ${manager.prenom || ''} ${manager.nom || ''}`,
        icon: 'fas fa-store'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    return res.json({ message: 'Magasin créé', magasin: newMagasin, affectation: newAffect });
  } catch (err) {
    console.error('magasins.create.error', err);
    return res.status(500).json({ message: 'Erreur création magasin' });
  }
});
