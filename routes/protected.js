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

// PUT /api/protected/magasins/:id - Modifier un magasin
router.put('/magasins/:id', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const requester = req.user;
    if (!requester || !['admin', 'superviseur'].includes(requester.role)) {
      return res.status(403).json({ message: 'Accès refusé: seuls les admins et superviseurs peuvent modifier des magasins' });
    }

    const magasinId = req.params.id;
    const { nom_magasin, adresse, telephone, description, managerId } = req.body;

    // Vérifier que le magasin existe
    const magasin = await Magasin.findById(magasinId).populate('managerId');
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    // Mettre à jour les champs
    if (nom_magasin) magasin.nom_magasin = nom_magasin;
    if (adresse) magasin.adresse = adresse;
    if (telephone) magasin.telephone = telephone;
    if (description) magasin.description = description;

    // Gérer la photo si fournie
    if (req.file) {
      try {
        // Upload stream qui se termine immédiatement
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'magasins' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary error:', error);
              throw new Error('Erreur upload photo');
            }
            if (result) {
              magasin.photoUrl = result.secure_url;
            }
          }
        );
        
        // Écrire le buffer et fermer le stream
        stream.write(req.file.buffer);
        stream.end();
        
        // Attendre que le stream se termine
        await new Promise((resolve, reject) => {
          stream.on('finish', resolve);
          stream.on('error', reject);
        });
      } catch (photoErr) {
        console.error('Photo upload error:', photoErr);
        return res.status(500).json({ message: 'Erreur upload photo: ' + photoErr.message });
      }
    }

    // Gérer le changement de gestionnaire
    if (managerId && managerId !== magasin.managerId?.toString()) {
      const newManager = await Utilisateur.findById(managerId);
      if (!newManager) {
        return res.status(404).json({ message: 'Gestionnaire non trouvé' });
      }
      
      // Supprimer l'ancienne affectation
      if (magasin.managerId) {
        await Affectation.findOneAndDelete({ utilisateurId: magasin.managerId, magasinId });
      }

      // Créer la nouvelle affectation
      const newAffect = new Affectation({
        managerId: managerId,
        magasinId,
        entrepriseId: magasin.businessId,  // ✅ AJOUTER entrepriseId requis
        dateAffectation: new Date(),
        statut: 'active'
      });
      await newAffect.save();

      magasin.managerId = managerId;
    }

    // Sauvegarder
    await magasin.save();

    // Rafraîchir les données avec le manager
    const updatedMagasin = await Magasin.findById(magasinId)
      .populate('managerId', 'prenom nom email role')
      .lean();

    // Enregistrer l'activité
    try {
      const activity = new Activity({
        utilisateurId: requester.id,
        action: 'MODIFIER_MAGASIN',
        entite: 'Magasin',
        entiteId: magasinId,
        description: `Magasin '${updatedMagasin.nom_magasin}' modifié`,
        icon: 'fas fa-edit'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    return res.json({ message: 'Magasin modifié', magasin: updatedMagasin });
  } catch (err) {
    console.error('magasins.update.error', err);
    return res.status(500).json({ message: 'Erreur modification magasin: ' + err.message });
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

// GET /api/protected/guichets/:magasinId - Lister guichets d'un magasin
router.get('/guichets/:magasinId', authMiddleware, async (req, res) => {
  try {
    const magasinId = req.params.magasinId;
    
    const magasin = await Magasin.findById(magasinId);
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }
    
    const guichets = await Guichet.find({ magasinId })
      .populate('vendeurPrincipal', 'nom prenom email role')
      .lean();
    
    return res.json(guichets);
  } catch (err) {
    console.error('guichets.list.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/protected/guichets/detail/:guichetId - Détail d'un guichet
router.get('/guichets/detail/:guichetId', authMiddleware, async (req, res) => {
  try {
    const guichetId = req.params.guichetId;
    
    const guichet = await Guichet.findById(guichetId)
      .populate('magasinId')
      .populate('vendeurPrincipal', 'nom prenom email role')
      .lean();
    
    if (!guichet) {
      return res.status(404).json({ message: 'Guichet non trouvé' });
    }
    
    // Récupérer les vendeurs affectés à ce guichet
    const affectations = await Affectation.find({ guichetId })
      .populate('vendeurId', 'nom prenom email role')
      .lean();
    
    return res.json({
      ...guichet,
      vendeurs: affectations.map(a => a.vendeurId)
    });
  } catch (err) {
    console.error('guichets.detail.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/protected/guichets/:id - Modifier un guichet
router.put('/guichets/:id', authMiddleware, async (req, res) => {
  try {
    const requester = req.user;
    if (!requester || !['admin', 'superviseur', 'gestionnaire'].includes(requester.role)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const guichetId = req.params.id;
    const { nom_guichet, code, status, vendeurPrincipal, objectifJournalier, stockMax } = req.body;

    const guichet = await Guichet.findById(guichetId).populate('magasinId');
    if (!guichet) {
      return res.status(404).json({ message: 'Guichet non trouvé' });
    }

    // Vérifier les droits: gestionnaire ne peut modifier que ses magasins
    if (requester.role === 'gestionnaire') {
      const affectation = await Affectation.findOne({
        utilisateurId: requester.id,
        magasinId: guichet.magasinId._id,
        statut: 'active'
      });
      if (!affectation) {
        return res.status(403).json({ message: 'Vous ne pouvez modifier que vos magasins' });
      }
    }

    // Mettre à jour les champs
    if (nom_guichet) guichet.nom_guichet = nom_guichet;
    if (code) guichet.code = code;
    if (typeof status !== 'undefined') guichet.status = status;
    if (objectifJournalier !== undefined) guichet.objectifJournalier = Number(objectifJournalier);
    if (stockMax !== undefined) guichet.stockMax = Number(stockMax);

    // Gérer le changement de vendeur principal
    if (vendeurPrincipal && vendeurPrincipal !== guichet.vendeurPrincipal?.toString()) {
      const vendeur = await Utilisateur.findById(vendeurPrincipal);
      if (!vendeur || vendeur.role !== 'vendeur') {
        return res.status(404).json({ message: 'Vendeur non trouvé ou rôle invalide' });
      }

      // Supprimer les anciennes affectations
      await Affectation.findOneAndDelete({
        guichetId,
        vendeurId: guichet.vendeurPrincipal
      });

      // Créer la nouvelle affectation
      const newAffect = new Affectation({
        vendeurId: vendeurPrincipal,
        guichetId,
        magasinId: guichet.magasinId._id,
        entrepriseId: guichet.magasinId.businessId,
        dateAffectation: new Date(),
        statut: 'active'
      });
      await newAffect.save();

      guichet.vendeurPrincipal = vendeurPrincipal;
    }

    await guichet.save();

    // Enregistrer l'activité
    try {
      const activity = new Activity({
        utilisateurId: requester.id,
        action: 'MODIFIER_GUICHET',
        entite: 'Guichet',
        entiteId: guichetId,
        description: `Guichet '${guichet.nom_guichet}' modifié`,
        icon: 'fas fa-cash-register'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    return res.json({ message: 'Guichet modifié', guichet });
  } catch (err) {
    console.error('guichets.update.error', err);
    return res.status(500).json({ message: 'Erreur modification guichet: ' + err.message });
  }
});

// DELETE /api/protected/guichets/:id - Supprimer un guichet
router.delete('/guichets/:id', authMiddleware, async (req, res) => {
  try {
    const requester = req.user;
    if (!requester || !['admin', 'superviseur'].includes(requester.role)) {
      return res.status(403).json({ message: 'Seuls les admins et superviseurs peuvent supprimer des guichets' });
    }

    const guichetId = req.params.id;
    const guichet = await Guichet.findById(guichetId);
    if (!guichet) {
      return res.status(404).json({ message: 'Guichet non trouvé' });
    }

    const guichetNom = guichet.nom_guichet;

    // Supprimer les affectations associées
    await Affectation.deleteMany({ guichetId });

    // Supprimer le guichet
    await Guichet.findByIdAndDelete(guichetId);

    // Enregistrer l'activité
    try {
      const activity = new Activity({
        utilisateurId: requester.id,
        action: 'SUPPRIMER_GUICHET',
        entite: 'Guichet',
        entiteId: guichetId,
        description: `Guichet '${guichetNom}' supprimé`,
        icon: 'fas fa-trash'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    return res.json({ message: 'Guichet supprimé' });
  } catch (err) {
    console.error('guichets.delete.error', err);
    return res.status(500).json({ message: 'Erreur suppression guichet: ' + err.message });
  }
});

// POST /api/protected/guichets/:guichetId/affecter-vendeur - Affecter un vendeur à un guichet
router.post('/guichets/:guichetId/affecter-vendeur', authMiddleware, async (req, res) => {
  try {
    const requester = req.user;
    if (!requester || !['admin', 'superviseur', 'gestionnaire'].includes(requester.role)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const guichetId = req.params.guichetId;
    const { vendeurId } = req.body;

    if (!vendeurId) {
      return res.status(400).json({ message: 'vendeurId requis' });
    }

    const guichet = await Guichet.findById(guichetId).populate('magasinId');
    if (!guichet) {
      return res.status(404).json({ message: 'Guichet non trouvé' });
    }

    const vendeur = await Utilisateur.findById(vendeurId);
    if (!vendeur || vendeur.role !== 'vendeur') {
      return res.status(404).json({ message: 'Vendeur non trouvé' });
    }

    // Vérifier les droits du gestionnaire
    if (requester.role === 'gestionnaire') {
      const affectation = await Affectation.findOne({
        utilisateurId: requester.id,
        magasinId: guichet.magasinId._id,
        statut: 'active'
      });
      if (!affectation) {
        return res.status(403).json({ message: 'Vous ne pouvez affecter que vos vendeurs' });
      }
    }

    // Vérifier si le vendeur est déjà affecté à ce guichet
    const existingAffect = await Affectation.findOne({
      vendeurId,
      guichetId,
      statut: 'active'
    });

    if (existingAffect) {
      return res.status(400).json({ message: 'Vendeur déjà affecté à ce guichet' });
    }

    // Supprimer les anciennes affectations du vendeur
    await Affectation.updateMany(
      { vendeurId, statut: 'active' },
      { $set: { statut: 'inactive', dateFinAffectation: new Date() } }
    );

    // Créer la nouvelle affectation
    const newAffect = new Affectation({
      vendeurId,
      guichetId,
      magasinId: guichet.magasinId._id,
      dateAffectation: new Date(),
      statut: 'active'
    });
    await newAffect.save();

    // Mettre à jour le vendeur
    await Utilisateur.findByIdAndUpdate(vendeurId, {
      guichetId: guichetId,
      magasinId: guichet.magasinId._id
    });

    // Enregistrer l'activité
    try {
      const activity = new Activity({
        utilisateurId: requester.id,
        action: 'AFFECTER_VENDEUR',
        entite: 'Affectation',
        entiteId: newAffect._id,
        description: `Vendeur '${vendeur.prenom} ${vendeur.nom}' affecté au guichet '${guichet.nom_guichet}'`,
        icon: 'fas fa-user-check'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    return res.json({ message: 'Vendeur affecté', affectation: newAffect });
  } catch (err) {
    console.error('guichets.affecter.error', err);
    return res.status(500).json({ message: 'Erreur affectation vendeur: ' + err.message });
  }
});

// GET /api/protected/magasins - Lister TOUS les magasins de TOUTES les entreprises
router.get('/magasins', authMiddleware, async (req, res) => {
  try {
    // Retourner TOUS les magasins, peu importe le rôle ou l'utilisateur
    const magasins = await Magasin.find({})
      .populate('businessId', 'nomEntreprise budget devise')
      .populate('managerId', 'nom prenom email')
      .lean()
      .exec();
    
    // Fetch guichets and vendeurs count for each magasin
    const magasinsData = await Promise.all(
      magasins.map(async (m) => {
        // Fetch guichets
        const guichets = await Guichet.find({ magasinId: m._id })
          .populate('vendeurPrincipal', 'nom prenom email')
          .lean()
          .exec();
        
        // Count active vendeurs for the magasin
        const vendeurs = await Affectation.find({ magasinId: m._id, status: 1 }).distinct('vendeurId');
        const vendeursCount = vendeurs.length;

        return { ...m, guichets: guichets || [], vendeursCount };
      })
    );
    
    return res.json(magasinsData);
  } catch (err) {
    console.error('magasins.list.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/protected/stats/magasins-guichets - Statistiques TOUS les magasins/guichets de TOUTES les entreprises
router.get('/stats/magasins-guichets', authMiddleware, async (req, res) => {
  try {
    // Compter TOUS les magasins peu importe l'entreprise
    const totalMagasins = await Magasin.countDocuments({});
    
    // Compter TOUS les guichets
    const totalGuichets = await Guichet.countDocuments({});
    
    // Get unique vendeurs (from ALL affectations)
    const affectations = await Affectation.find({ status: 1 }).distinct('vendeurId');
    const totalVendeurs = affectations.length;
    
    // Calculate total stock (sum of stockMax from ALL guichets)
    const stockData = await Guichet.aggregate([
      { $group: { _id: null, totalStock: { $sum: '$stockMax' } } }
    ]);
    const totalStock = stockData.length > 0 ? stockData[0].totalStock : 0;
    
    // Get first entreprise for display
    const entreprise = await Business.findOne().select('nomEntreprise').lean();
    
    return res.json({
      totalMagasins,
      totalGuichets,
      totalVendeurs,
      totalStock,
      entreprise: entreprise || { nomEntreprise: 'Toutes les entreprises' }
    });
  } catch (err) {
    console.error('stats.magasins-guichets.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/protected/utilisateurs - Lister tous les utilisateurs
router.get('/utilisateurs', authMiddleware, async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.find({})
      .select('_id prenom nom email role')
      .lean();
    
    return res.json(utilisateurs);
  } catch (err) {
    console.error('utilisateurs.list.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/protected/activites - Lister l'historique d'activités
router.get('/activites', authMiddleware, async (req, res) => {
  try {
    const { limit = 100, skip = 0, action, entityType, entityId } = req.query;

    // Construire le filtre
    const filter = {};
    if (action) filter.action = action;
    if (entityType) filter.entite = entityType;
    if (entityId) filter.entiteId = entityId;

    const activites = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .populate('utilisateurId', 'nom prenom email role')
      .lean();

    const total = await Activity.countDocuments(filter);

    return res.json({
      data: activites,
      total,
      limit: Number(limit),
      skip: Number(skip)
    });
  } catch (err) {
    console.error('activites.list.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/protected/activites/:entityId - Historique d'une entité spécifique
router.get('/activites/entite/:entityId', authMiddleware, async (req, res) => {
  try {
    const entityId = req.params.entityId;

    const activites = await Activity.find({ entiteId: entityId })
      .sort({ createdAt: -1 })
      .populate('utilisateurId', 'nom prenom email role')
      .lean();

    return res.json(activites);
  } catch (err) {
    console.error('activites.entite.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/protected/affectations - Lister les affectations avec filtres
router.get('/affectations/list', authMiddleware, async (req, res) => {
  try {
    const { vendeurId, guichetId, magasinId, statut = 'active', limit = 100, skip = 0 } = req.query;

    const filter = {};
    if (vendeurId) filter.vendeurId = vendeurId;
    if (guichetId) filter.guichetId = guichetId;
    if (magasinId) filter.magasinId = magasinId;
    if (statut) filter.statut = statut;

    const affectations = await Affectation.find(filter)
      .sort({ dateAffectation: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .populate('vendeurId', 'nom prenom email role')
      .populate('guichetId', 'nom_guichet code')
      .populate('magasinId', 'nom_magasin')
      .lean();

    const total = await Affectation.countDocuments(filter);

    return res.json({
      data: affectations,
      total,
      limit: Number(limit),
      skip: Number(skip)
    });
  } catch (err) {
    console.error('affectations.list.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/protected/affectations/:id - Mettre à jour une affectation
router.put('/affectations/:id', authMiddleware, async (req, res) => {
  try {
    const requester = req.user;
    if (!requester || !['admin', 'superviseur', 'gestionnaire'].includes(requester.role)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const affectationId = req.params.id;
    const { statut, notes } = req.body;

    const affectation = await Affectation.findById(affectationId);
    if (!affectation) {
      return res.status(404).json({ message: 'Affectation non trouvée' });
    }

    if (statut) affectation.statut = statut;
    if (notes) affectation.notes = notes;

    if (statut === 'inactive' && !affectation.dateFinAffectation) {
      affectation.dateFinAffectation = new Date();
    }

    await affectation.save();

    // Enregistrer l'activité
    try {
      const vendeur = await Utilisateur.findById(affectation.vendeurId);
      const activity = new Activity({
        utilisateurId: requester.id,
        action: 'MODIFIER_AFFECTATION',
        entite: 'Affectation',
        entiteId: affectationId,
        description: `Affectation de '${vendeur?.prenom} ${vendeur?.nom}' modifiée (statut: ${statut})`,
        icon: 'fas fa-edit'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    return res.json({ message: 'Affectation mise à jour', affectation });
  } catch (err) {
    console.error('affectations.update.error', err);
    return res.status(500).json({ message: 'Erreur modification affectation: ' + err.message });
  }
});

// DELETE /api/protected/affectations/:id - Supprimer une affectation
router.delete('/affectations/:id', authMiddleware, async (req, res) => {
  try {
    const requester = req.user;
    if (!requester || !['admin', 'superviseur'].includes(requester.role)) {
      return res.status(403).json({ message: 'Seuls les admins peuvent supprimer des affectations' });
    }

    const affectationId = req.params.id;
    const affectation = await Affectation.findById(affectationId);
    if (!affectation) {
      return res.status(404).json({ message: 'Affectation non trouvée' });
    }

    const vendeur = await Utilisateur.findById(affectation.vendeurId);
    await Affectation.findByIdAndDelete(affectationId);

    // Enregistrer l'activité
    try {
      const activity = new Activity({
        utilisateurId: requester.id,
        action: 'SUPPRIMER_AFFECTATION',
        entite: 'Affectation',
        entiteId: affectationId,
        description: `Affectation de '${vendeur?.prenom} ${vendeur?.nom}' supprimée`,
        icon: 'fas fa-trash'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    return res.json({ message: 'Affectation supprimée' });
  } catch (err) {
    console.error('affectations.delete.error', err);
    return res.status(500).json({ message: 'Erreur suppression affectation: ' + err.message });
  }
});

module.exports = router;
