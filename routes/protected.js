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

// POST /api/protected/guichets - créer un guichet lié à un magasin
router.post('/guichets', authMiddleware, async (req, res) => {
  try {
    const requester = req.user;
    if (!requester || !['admin', 'superviseur'].includes(requester.role)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // If superviseur, optionally check a permission flag
    if (requester.role === 'superviseur' && requester.canCreateGuichet === false) {
      return res.status(403).json({ message: 'Permission refusée: le superviseur ne peut pas créer de guichets' });
    }

    const { magasinId, nomGuichet, codeGuichet, status, vendeurPrincipal, objectifJournalier, stockMax } = req.body;
    if (!magasinId || !nomGuichet) return res.status(400).json({ message: 'magasinId et nomGuichet requis' });

    const magasin = await Magasin.findById(magasinId);
    if (!magasin) return res.status(404).json({ message: 'Magasin non trouvé' });

    // create the guichet
    const guichet = new Guichet({
      magasinId: magasin._id,
      nom_guichet: nomGuichet,
      code: codeGuichet || undefined,
      status: typeof status !== 'undefined' ? Number(status) : 1,
      vendeurPrincipal: vendeurPrincipal || null,
      objectifJournalier: objectifJournalier ? Number(objectifJournalier) : 0,
      stockMax: stockMax ? Number(stockMax) : 0
    });
    await guichet.save();

    // If a vendeurPrincipal was provided, create an affectation for them on this guichet
    if (vendeurPrincipal) {
      try {
        const vendeur = await Utilisateur.findById(vendeurPrincipal);
        if (vendeur && vendeur.role === 'vendeur') {
          // End previous affectations
          await Affectation.updateMany({ vendeurId: vendeur._id, status: 1 }, { $set: { status: 0, dateFinAffectation: new Date() } });

          const newAffect = new Affectation({
            vendeurId: vendeur._id,
            guichetId: guichet._id,
            magasinId: magasin._id,
            entrepriseId: magasin.businessId,
            dateAffectation: new Date(),
            status: 1,
            notes: `Assigné automatiquement lors de la création du guichet par ${requester.prenom||requester.nom||requester.email||requester.id}`
          });
          await newAffect.save();

          // update vendeur record
          await Utilisateur.findByIdAndUpdate(vendeur._id, { $set: { guichetId: guichet._id, businessId: magasin.businessId } });
        }
      } catch (e) {
        console.warn('assign vendeur on guichet failed', e);
      }
    }

    // activity
    try {
      const activity = new Activity({
        businessId: magasin.businessId,
        userId: requester.id,
        title: 'Guichet créé',
        description: `Guichet '${guichet.nom_guichet}' créé pour le magasin '${magasin.nom_magasin || magasin.nom}'`,
        icon: 'fas fa-cash-register'
      });
      await activity.save();
    } catch (actErr) { console.warn('activity save guichet', actErr); }

    return res.json({ message: 'Guichet créé', guichet });
  } catch (err) {
    console.error('guichets.create.error', err);
    return res.status(500).json({ message: 'Erreur création guichet' });
  }
});

// GET /api/protected/magasins - Lister tous les magasins de l'utilisateur (admin/superviseur)
router.get('/magasins', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // Les admins voient tous les magasins, les superviseurs voir seulement ceux auxquels ils sont assignés
    let filter = {};
    if (user.role === 'superviseur') {
      filter.managerId = user.id;
    }
    
    const magasins = await Magasin.find(filter)
      .populate('businessId', 'nomEntreprise')
      .populate('managerId', 'nom prenom email')
      .lean()
      .exec();
    
    // Fetch guichets for each magasin
    const magasinsWithGuichets = await Promise.all(
      magasins.map(async (m) => {
        const guichets = await Guichet.find({ magasinId: m._id })
          .populate('vendeurPrincipal', 'nom prenom email')
          .lean()
          .exec();
        return { ...m, guichets: guichets || [] };
      })
    );
    
    return res.json(magasinsWithGuichets);
  } catch (err) {
    console.error('magasins.list.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/protected/stats/magasins-guichets - Statistiques magasins/guichets
router.get('/stats/magasins-guichets', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    let magasinFilter = {};
    if (user.role === 'superviseur') {
      magasinFilter.managerId = user.id;
    }
    
    const totalMagasins = await Magasin.countDocuments(magasinFilter);
    
    // Get magasin IDs for guichet filtering
    const magasinIds = await Magasin.find(magasinFilter).select('_id').lean();
    const magasinIdList = magasinIds.map(m => m._id);
    
    let guichetFilter = {};
    if (magasinIdList.length > 0) {
      guichetFilter.magasinId = { $in: magasinIdList };
    }
    
    const totalGuichets = await Guichet.countDocuments(guichetFilter);
    
    // Get unique vendeurs (from affectations)
    const affectations = await Affectation.find({ 
      status: 1,
      ...(magasinIdList.length > 0 && { magasinId: { $in: magasinIdList } })
    }).distinct('vendeurId');
    const totalVendeurs = affectations.length;
    
    // Calculate total stock (sum of stockMax from all guichets)
    const stockData = await Guichet.aggregate([
      { $match: guichetFilter },
      { $group: { _id: null, totalStock: { $sum: '$stockMax' } } }
    ]);
    const totalStock = stockData.length > 0 ? stockData[0].totalStock : 0;
    
    // Get entreprise info (for admin)
    let entreprise = null;
    if (user.role === 'admin') {
      const businesses = await Business.find().select('nomEntreprise').limit(1);
      entreprise = businesses.length > 0 ? businesses[0] : null;
    } else if (user.role === 'superviseur') {
      // Superviseur: get the business of their first magasin
      const mag = await Magasin.findOne(magasinFilter).populate('businessId', 'nomEntreprise');
      entreprise = mag ? mag.businessId : null;
    }
    
    return res.json({
      totalMagasins,
      totalGuichets,
      totalVendeurs,
      totalStock,
      entreprise: entreprise || { nomEntreprise: 'Non définie' }
    });
  } catch (err) {
    console.error('stats.magasins-guichets.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
