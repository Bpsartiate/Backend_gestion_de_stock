const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { canModifyUser, checkMagasinAccess, checkBusinessAccess, blockVendeur } = require('../middlewares/authorization');
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
const Rayon = require('../models/rayon');
const TypeProduit = require('../models/typeProduit');
const Produit = require('../models/produit');
const StockMovement = require('../models/stockMovement');
const Lot = require('../models/lot');
const AlerteStock = require('../models/alerteStock');
const RapportInventaire = require('../models/rapportInventaire');
const Reception = require('../models/reception');
const StockRayon = require('../models/stockRayon');

// Profil et membres protégés
router.get('/members', authMiddleware, utilisateurController.listerMembres);

// GET /api/protected/vendeurs-available - Retourne les vendeurs sans affectation active
router.get('/vendeurs-available', authMiddleware, async (req, res) => {
  try {
    // Récupérer tous les vendeurs
    const vendeurs = await Utilisateur.find({ role: 'vendeur' })
      .select('_id prenom nom email telephone')
      .lean();
    
    // Récupérer les IDs des vendeurs avec affectation active
    // ✅ Chercher avec SOIT statut: 'active' SOIT status: 1 (pour couvrir les deux formats)
    const affectationsActives = await Affectation.find({
      $or: [
        { statut: 'active' },
        { status: 1 },
        { status: true }
      ]
    })
      .select('vendeurId')
      .lean();
    
    const vendeurIdsActifs = affectationsActives.map(a => a.vendeurId?.toString()).filter(Boolean);
    
    console.log('📊 Total vendeurs:', vendeurs.length, '| Affectés:', vendeurIdsActifs.length);
    
    // Filtrer les vendeurs disponibles (sans affectation active)
    const vendeursDispo = vendeurs.filter(v => !vendeurIdsActifs.includes(v._id.toString()));
    
    console.log('✅ Vendeurs disponibles:', vendeursDispo.length);
    
    return res.json(vendeursDispo);
  } catch(err) {
    console.error('vendeurs-available:', err);
    res.status(500).json({ message: 'Erreur chargement vendeurs disponibles: ' + err.message });
  }
});

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
    const magasinId = req.params.id;

    // Vérifier que le magasin existe
    const magasin = await Magasin.findById(magasinId).populate('managerId');
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    // ✅ CONTRÔLE D'ACCÈS
    // Admin: accès complet
    // Gestionnaire: UNIQUEMENT s'il est manager du magasin
    // Vendeur: refusé
    if (requester.role === 'vendeur') {
      return res.status(403).json({ message: 'Accès refusé: les vendeurs ne peuvent pas modifier les magasins' });
    }

    if (requester.role === 'superviseur' || requester.role === 'gestionnaire') {
      if (magasin.managerId?.toString() !== requester._id.toString()) {
        return res.status(403).json({ message: 'Accès refusé: ce magasin ne vous appartient pas' });
      }
    } else if (requester.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé: seuls les admins et gestionnaires peuvent modifier des magasins' });
    }

    const { nom_magasin, adresse, telephone, description, managerId } = req.body;

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
    const { magasinId, nomGuichet, codeGuichet, status, vendeurPrincipal, objectifJournalier, stockMax } = req.body;

    // ✅ VALIDATION: Champs obligatoires
    if (!magasinId || !nomGuichet) {
      return res.status(400).json({ message: 'Champs obligatoires manquants: magasinId, nomGuichet' });
    }

    console.log('📝 Creating guichet with:', { magasinId, nomGuichet, codeGuichet, status, vendeurPrincipal });

    // Vendeur: pas d'accès
    if (requester.role === 'vendeur') {
      return res.status(403).json({ message: 'Accès refusé: les vendeurs ne peuvent pas créer de guichets' });
    }

    // Get magasin
    const magasin = await Magasin.findById(magasinId);
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    // Gestionnaire: vérifier que le magasin lui appartient
    if (requester.role === 'superviseur' || requester.role === 'gestionnaire') {
      if (magasin.managerId?.toString() !== requester._id.toString()) {
        return res.status(403).json({ message: 'Accès refusé: ce magasin ne vous appartient pas' });
      }
      if (requester.role === 'superviseur' && requester.canCreateGuichet === false) {
        return res.status(403).json({ message: 'Permission refusée: le gestionnaire ne peut pas créer de guichets' });
      }
    } else if (requester.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // create the guichet
    const guichetData = {
      magasinId: magasin._id,
      nom_guichet: nomGuichet,
      code: codeGuichet || '',
      status: typeof status !== 'undefined' ? Number(status) : 1,
      vendeurPrincipal: vendeurPrincipal || null,
      objectifJournalier: objectifJournalier ? Number(objectifJournalier) : 0,
      stockMax: stockMax ? Number(stockMax) : 0
    };

    console.log('🛠️ Guichet data prepared:', guichetData);

    const guichet = new Guichet(guichetData);
    await guichet.save();

    console.log('✅ Guichet saved:', guichet._id);

    // If a vendeurPrincipal was provided, create an affectation for them on this guichet
    if (vendeurPrincipal) {
      try {
        const vendeur = await Utilisateur.findById(vendeurPrincipal);
        if (vendeur && vendeur.role === 'vendeur') {
          // ✅ End previous affectations avec le bon champ
          await Affectation.updateMany({ vendeurId: vendeur._id, $or: [{ status: 1 }, { statut: 'active' }] }, { $set: { status: 0, statut: 'inactive', dateFinAffectation: new Date() } });

          const newAffect = new Affectation({
            vendeurId: vendeur._id,
            guichetId: guichet._id,
            magasinId: magasin._id,
            entrepriseId: magasin.businessId,
            dateAffectation: new Date(),
            status: 1,
            statut: 'active',  // ✅ Aussi enregistrer avec le champ text
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
      // ✅ Get businessId from magasin or from requester context
      const businessId = magasin.businessId || magasin.entrepriseId || null;
      
      if (businessId) {
        const activity = new Activity({
          businessId: businessId,
          title: 'Guichet créé',
          description: `Guichet '${guichet.nom_guichet}' créé pour le magasin '${magasin.nom_magasin || magasin.nom}'`,
          icon: 'fas fa-cash-register'
        });
        await activity.save();
        console.log('✅ Activity saved for guichet creation');
      } else {
        console.warn('⚠️ No businessId found for activity - skipping');
      }
    } catch (actErr) { 
      console.warn('activity.save.error (non-blocking):', actErr.message);
      // Ne pas bloquer la réponse si l'activité échoue
    }

    console.log('✅ Guichet creation complete - returning response');
    return res.json({ message: 'Guichet créé', guichet });
  } catch (err) {
    console.error('guichets.create.error (CRITICAL):', err);
    return res.status(500).json({ message: 'Erreur création guichet: ' + err.message });
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
    const requester = req.user;
    const guichetId = req.params.guichetId;
    
    const guichet = await Guichet.findById(guichetId)
      .populate('magasinId')
      .populate('vendeurPrincipal', 'nom prenom email role')
      .lean();
    
    if (!guichet) {
      return res.status(404).json({ message: 'Guichet non trouvé' });
    }

    // ✅ CONTRÔLE D'ACCÈS
    if (requester.role === 'vendeur') {
      return res.status(403).json({ message: 'Accès refusé: les vendeurs ne peuvent pas accéder aux détails des guichets' });
    }
    if (requester.role === 'superviseur' || requester.role === 'gestionnaire') {
      if (guichet.magasinId?.managerId?.toString() !== requester._id.toString()) {
        return res.status(403).json({ message: 'Accès refusé: ce guichet ne vous appartient pas' });
      }
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
    const guichetId = req.params.id;

    const guichet = await Guichet.findById(guichetId).populate('magasinId');
    if (!guichet) {
      return res.status(404).json({ message: 'Guichet non trouvé' });
    }

    // ✅ CONTRÔLE D'ACCÈS
    // Vendeur: pas d'accès
    if (requester.role === 'vendeur') {
      return res.status(403).json({ message: 'Accès refusé: les vendeurs ne peuvent pas modifier les guichets' });
    }

    // Gestionnaire: UNIQUEMENT ses magasins
    if (requester.role === 'superviseur' || requester.role === 'gestionnaire') {
      if (guichet.magasinId?.managerId?.toString() !== requester._id.toString()) {
        return res.status(403).json({ message: 'Accès refusé: ce guichet ne vous appartient pas' });
      }
    } else if (requester.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { nom_guichet, code, status, vendeurPrincipal, objectifJournalier, stockMax } = req.body;

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
    const guichetId = req.params.id;

    const guichet = await Guichet.findById(guichetId).populate('magasinId');
    if (!guichet) {
      return res.status(404).json({ message: 'Guichet non trouvé' });
    }

    // ✅ CONTRÔLE D'ACCÈS
    // Vendeur: pas d'accès
    if (requester.role === 'vendeur') {
      return res.status(403).json({ message: 'Accès refusé: les vendeurs ne peuvent pas supprimer les guichets' });
    }

    // Gestionnaire: UNIQUEMENT ses magasins
    if (requester.role === 'superviseur' || requester.role === 'gestionnaire') {
      if (guichet.magasinId?.managerId?.toString() !== requester._id.toString()) {
        return res.status(403).json({ message: 'Accès refusé: ce guichet ne vous appartient pas' });
      }
    } else if (requester.role !== 'admin') {
      return res.status(403).json({ message: 'Seuls les admins et gestionnaires peuvent supprimer des guichets' });
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
    const guichetId = req.params.guichetId;

    // Vendeur: pas d'accès
    if (requester.role === 'vendeur') {
      return res.status(403).json({ message: 'Accès refusé: les vendeurs ne peuvent pas affecter de vendeurs' });
    }

    const guichet = await Guichet.findById(guichetId).populate('magasinId');
    if (!guichet) {
      return res.status(404).json({ message: 'Guichet non trouvé' });
    }

    // Gestionnaire: UNIQUEMENT ses magasins
    if (requester.role === 'superviseur' || requester.role === 'gestionnaire') {
      if (guichet.magasinId?.managerId?.toString() !== requester._id.toString()) {
        return res.status(403).json({ message: 'Accès refusé: ce guichet ne vous appartient pas' });
      }
    } else if (requester.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { vendeurId } = req.body;

    if (!vendeurId) {
      return res.status(400).json({ message: 'vendeurId requis' });
    }
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

    // Validation: verifier qu'aucun autre vendeur n'est a ce guichet
    const otherAffectations = await Affectation.find({
      guichetId,
      statut: 'active',
      vendeurId: { $ne: null, $ne: vendeurId }
    }).populate('vendeurId', 'prenom nom');

    if (otherAffectations.length > 0) {
      const vendeurExistant = otherAffectations[0].vendeurId;
      return res.status(400).json({ message: 'Ce guichet a deja un vendeur: ' + vendeurExistant.prenom + ' ' + vendeurExistant.nom });
    }

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
router.get('/magasins', authMiddleware, blockVendeur, async (req, res) => {
  try {
    const requester = req.user;
    let magasins = [];

    // Admin: voir TOUS les magasins
    if (requester.role === 'admin') {
      magasins = await Magasin.find({})
        .populate('businessId', 'nomEntreprise budget devise')
        .populate('managerId', 'nom prenom email')
        .lean();
    } 
    // Gestionnaire: voir UNIQUEMENT ses magasins assignés
    else if (requester.role === 'superviseur' || requester.role === 'gestionnaire') {
      magasins = await Magasin.find({ managerId: requester._id })
        .populate('businessId', 'nomEntreprise budget devise')
        .populate('managerId', 'nom prenom email')
        .lean();
    }
      
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

// ================================
// 📦 ROUTES STOCK - RAYONS
// ================================

// GET /api/protected/magasins/:magasinId/rayons - Lister les rayons
router.get('/magasins/:magasinId/rayons', authMiddleware, async (req, res) => {
  try {
    const { magasinId } = req.params;
    const requester = req.user;

    // Vérifier l'accès au magasin
    const magasin = await Magasin.findById(magasinId);
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    // Vérifier les permissions: Admin voit tout, Gestionnaire voit seulement SES magasins
    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const rayons = await Rayon.find({ magasinId })
      .populate('typesProduitsAutorises', 'nomType')
      .sort({ codeRayon: 1 })
      .lean();

    return res.json(rayons);
  } catch (err) {
    console.error('rayons.list.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// POST /api/protected/magasins/:magasinId/rayons - Créer un rayon
router.post('/magasins/:magasinId/rayons', authMiddleware, blockVendeur, async (req, res) => {
  try {
    const { magasinId } = req.params;
    const requester = req.user;
    const { codeRayon, nomRayon, typeRayon, capaciteMax, couleurRayon, iconeRayon, typesProduitsAutorises, description } = req.body;

    console.log('📝 POST /magasins/:magasinId/rayons reçu');
    console.log('   typesProduitsAutorises:', typesProduitsAutorises);
    console.log('   Types reçus:', typeof typesProduitsAutorises, Array.isArray(typesProduitsAutorises));

    // Vérifier l'accès au magasin
    const magasin = await Magasin.findById(magasinId);
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Vérifier que le code rayon est unique pour ce magasin
    const existant = await Rayon.findOne({ magasinId, codeRayon: codeRayon.toUpperCase() });
    if (existant) {
      return res.status(400).json({ message: 'Code rayon déjà existant' });
    }

    // Convertir les IDs string en ObjectId
    const typesIds = Array.isArray(typesProduitsAutorises) 
      ? typesProduitsAutorises.map(id => mongoose.Types.ObjectId(id))
      : [];

    const rayon = new Rayon({
      magasinId,
      codeRayon,
      nomRayon,
      typeRayon,
      capaciteMax,
      couleurRayon,
      iconeRayon,
      typesProduitsAutorises: typesIds,
      description
    });

    console.log('✅ Rayon créé avec types:', rayon.typesProduitsAutorises);

    await rayon.save();

    // Enregistrer l'activité
    try {
      const activity = new Activity({
        utilisateurId: requester.id,
        action: 'CREER_RAYON',
        entite: 'Rayon',
        entiteId: rayon._id,
        description: `Rayon '${nomRayon}' créé`,
        icon: 'fas fa-plus'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    return res.status(201).json(rayon);
  } catch (err) {
    console.error('rayons.create.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// PUT /api/protected/rayons/:rayonId - Modifier un rayon
router.put('/rayons/:rayonId', authMiddleware, blockVendeur, async (req, res) => {
  try {
    const { rayonId } = req.params;
    const requester = req.user;
    const { nomRayon, typeRayon, capaciteMax, couleurRayon, iconeRayon, typesProduitsAutorises, description } = req.body;

    console.log('📝 PUT /rayons/:rayonId reçu');
    console.log('   typesProduitsAutorises:', typesProduitsAutorises);
    console.log('   Types reçus:', typeof typesProduitsAutorises, Array.isArray(typesProduitsAutorises));

    const rayon = await Rayon.findById(rayonId);
    if (!rayon) {
      return res.status(404).json({ message: 'Rayon non trouvé' });
    }

    // Vérifier l'accès
    const magasin = await Magasin.findById(rayon.magasinId);
    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Mettre à jour les champs
    rayon.nomRayon = nomRayon || rayon.nomRayon;
    rayon.typeRayon = typeRayon || rayon.typeRayon;
    rayon.capaciteMax = capaciteMax !== undefined ? capaciteMax : rayon.capaciteMax;
    rayon.couleurRayon = couleurRayon || rayon.couleurRayon;
    rayon.iconeRayon = iconeRayon || rayon.iconeRayon;
    
    // Mettre à jour les types produits (array of ObjectIds)
    if (Array.isArray(typesProduitsAutorises)) {
      rayon.typesProduitsAutorises = typesProduitsAutorises.map(id => mongoose.Types.ObjectId(id));
      console.log('✅ Types produits mis à jour:', rayon.typesProduitsAutorises);
    }
    
    rayon.description = description !== undefined ? description : rayon.description;

    await rayon.save();

    console.log('✅ Rayon sauvegardé avec types:', rayon.typesProduitsAutorises);

    try {
      const activity = new Activity({
        utilisateurId: requester.id,
        action: 'MODIFIER_RAYON',
        entite: 'Rayon',
        entiteId: rayonId,
        description: `Rayon '${nomRayon}' modifié`,
        icon: 'fas fa-edit'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    return res.json(rayon);
  } catch (err) {
    console.error('rayons.update.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// DELETE /api/protected/rayons/:rayonId - Supprimer un rayon
router.delete('/rayons/:rayonId', authMiddleware, blockVendeur, async (req, res) => {
  try {
    const { rayonId } = req.params;
    const requester = req.user;

    const rayon = await Rayon.findById(rayonId);
    if (!rayon) {
      return res.status(404).json({ message: 'Rayon non trouvé' });
    }

    const magasin = await Magasin.findById(rayon.magasinId);
    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const nomRayon = rayon.nomRayon;
    await Rayon.findByIdAndDelete(rayonId);

    try {
      const activity = new Activity({
        utilisateurId: requester.id,
        action: 'SUPPRIMER_RAYON',
        entite: 'Rayon',
        entiteId: rayonId,
        description: `Rayon '${nomRayon}' supprimé`,
        icon: 'fas fa-trash'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    return res.json({ message: 'Rayon supprimé' });
  } catch (err) {
    console.error('rayons.delete.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// ================================
// 📦 ROUTES STOCK - TYPES PRODUITS
// ================================

// GET /api/protected/magasins/:magasinId/types-produits - Lister les types de produits
router.get('/magasins/:magasinId/types-produits', authMiddleware, async (req, res) => {
  try {
    const { magasinId } = req.params;
    const requester = req.user;

    const magasin = await Magasin.findById(magasinId);
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const typesProduits = await TypeProduit.find({ magasinId })
      .sort({ nomType: 1 })
      .lean();

    return res.json(typesProduits);
  } catch (err) {
    console.error('types-produits.list.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// POST /api/protected/magasins/:magasinId/types-produits - Créer un type de produit
router.post('/magasins/:magasinId/types-produits', authMiddleware, blockVendeur, async (req, res) => {
  try {
    const { magasinId } = req.params;
    const requester = req.user;
    const { nomType, code, unitePrincipale, champsSupplementaires, seuilAlerte, capaciteMax, photoRequise } = req.body;

    const magasin = await Magasin.findById(magasinId);
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Vérifier l'unicité du nom par magasin
    const existant = await TypeProduit.findOne({ magasinId, nomType });
    if (existant) {
      return res.status(400).json({ message: 'Type de produit déjà existant' });
    }

    // Générer le code si non fourni (3 premières lettres du nomType en majuscules)
    const generatedCode = code || nomType.substring(0, 3).toUpperCase();

    const typeProduit = new TypeProduit({
      magasinId,
      nomType,
      code: generatedCode,
      unitePrincipale,
      champsSupplementaires,
      seuilAlerte,
      capaciteMax,
      photoRequise
    });

    await typeProduit.save();

    try {
      const activity = new Activity({
        utilisateurId: requester.id,
        action: 'CREER_TYPE_PRODUIT',
        entite: 'TypeProduit',
        entiteId: typeProduit._id,
        description: `Type produit '${nomType}' créé`,
        icon: 'fas fa-plus'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    return res.status(201).json(typeProduit);
  } catch (err) {
    console.error('types-produits.create.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// PUT /api/protected/types-produits/:typeProduitId - Modifier un type de produit
router.put('/types-produits/:typeProduitId', authMiddleware, blockVendeur, async (req, res) => {
  try {
    const { typeProduitId } = req.params;
    const requester = req.user;
    const { nomType, code, unitePrincipale, champsSupplementaires, seuilAlerte, capaciteMax, photoRequise } = req.body;

    const typeProduit = await TypeProduit.findById(typeProduitId);
    if (!typeProduit) {
      return res.status(404).json({ message: 'Type de produit non trouvé' });
    }

    const magasin = await Magasin.findById(typeProduit.magasinId);
    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    typeProduit.nomType = nomType || typeProduit.nomType;
    typeProduit.code = code || typeProduit.code;
    typeProduit.unitePrincipale = unitePrincipale || typeProduit.unitePrincipale;
    typeProduit.champsSupplementaires = champsSupplementaires || typeProduit.champsSupplementaires;
    typeProduit.seuilAlerte = seuilAlerte !== undefined ? seuilAlerte : typeProduit.seuilAlerte;
    typeProduit.capaciteMax = capaciteMax !== undefined ? capaciteMax : typeProduit.capaciteMax;
    typeProduit.photoRequise = photoRequise !== undefined ? photoRequise : typeProduit.photoRequise;

    await typeProduit.save();

    try {
      const activity = new Activity({
        utilisateurId: requester.id,
        action: 'MODIFIER_TYPE_PRODUIT',
        entite: 'TypeProduit',
        entiteId: typeProduitId,
        description: `Type produit '${nomType}' modifié`,
        icon: 'fas fa-edit'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    return res.json(typeProduit);
  } catch (err) {
    console.error('types-produits.update.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// DELETE /api/protected/types-produits/:typeProduitId - Supprimer un type de produit
router.delete('/types-produits/:typeProduitId', authMiddleware, blockVendeur, async (req, res) => {
  try {
    const { typeProduitId } = req.params;
    const requester = req.user;

    const typeProduit = await TypeProduit.findById(typeProduitId);
    if (!typeProduit) {
      return res.status(404).json({ message: 'Type de produit non trouvé' });
    }

    const magasin = await Magasin.findById(typeProduit.magasinId);
    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const nomType = typeProduit.nomType;
    await TypeProduit.findByIdAndDelete(typeProduitId);

    try {
      const activity = new Activity({
        utilisateurId: requester.id,
        action: 'SUPPRIMER_TYPE_PRODUIT',
        entite: 'TypeProduit',
        entiteId: typeProduitId,
        description: `Type produit '${nomType}' supprimé`,
        icon: 'fas fa-trash'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    return res.json({ message: 'Type de produit supprimé' });
  } catch (err) {
    console.error('types-produits.delete.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// ================================
// 📦 ROUTE MAÎTRESSE STOCK
// ================================

// GET /api/protected/magasins/:magasinId/stock-config - Récupère toute la config stock pour un magasin
router.get('/magasins/:magasinId/stock-config', authMiddleware, async (req, res) => {
  try {
    const { magasinId } = req.params;
    const requester = req.user;

    // Vérifier l'accès: Admin voit tout, Gestionnaire voit seulement SES magasins
    const magasin = await Magasin.findById(magasinId);
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Récupérer rayons et types de produits
    const rayons = await Rayon.find({ magasinId })
      .select('_id codeRayon nomRayon typeRayon capaciteMax couleurRayon iconeRayon typesProduitsAutorises status')
      .sort({ codeRayon: 1 })
      .lean();

    const typesProduits = await TypeProduit.find({ magasinId })
      .select('_id nomType unitePrincipale champsSupplementaires seuilAlerte capaciteMax photoRequise status')
      .sort({ nomType: 1 })
      .lean();

    return res.json({
      magasinId,
      rayons,
      typesProduits
    });
  } catch (err) {
    console.error('stock-config.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// ================================
// 📦 ROUTES STOCK - PRODUITS
// ================================

// POST /api/protected/upload/produit-image - Upload d'image produit vers Cloudinary
router.post('/upload/produit-image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    // Exact même pattern que /magasins - reçoit le fichier binaire via multer
    let photoUrl = null;
    
    if (req.file && req.file.buffer) {
      try {
        console.log(`📤 Upload image produit: ${(req.file.buffer.length / 1024).toFixed(2)}KB`);
        
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'produits', quality: 'auto:good' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });
        
        photoUrl = result.secure_url;
        console.log('✅ Image uploadée Cloudinary:', result.public_id);
        return res.json({ 
          success: true, 
          photoUrl: photoUrl,
          photoCloudinaryId: result.public_id
        });
      } catch (upErr) {
        console.error('❌ Cloudinary upload error (produit):', upErr);
        return res.status(400).json({ error: 'Erreur lors de l\'upload de la photo: ' + upErr.message });
      }
    } else {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ error: 'Erreur: ' + err.message });
  }
});

// GET /api/protected/magasins/:magasinId/produits - Lister les produits
router.get('/magasins/:magasinId/produits', authMiddleware, async (req, res) => {
  try {
    const { magasinId } = req.params;
    const requester = req.user;

    const magasin = await Magasin.findById(magasinId);
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const produits = await Produit.find({ magasinId, status: 1 })
      .populate({
        path: 'typeProduitId',
        select: 'nomType unitePrincipale code icone seuilAlerte'
      })
      .populate({
        path: 'rayonId',
        select: 'nomRayon codeRayon typeRayon iconeRayon capaciteMax quantiteActuelle'
      })
      .sort({ designation: 1 })
      .lean();

    // Pour chaque produit, récupérer ses alertes actives
    const produitsAvecAlertes = await Promise.all(
      produits.map(async (produit) => {
        const alertes = await AlerteStock.find({
          produitId: produit._id,
          statut: 'ACTIVE'
        })
        .select('type severite message quantiteActuelle seuilAlerte quantiteManquante dateCreation actionRecommandee')
        .lean();

        return {
          ...produit,
          alertes: alertes || []
        };
      })
    );

    return res.json(produitsAvecAlertes);
  } catch (err) {
    console.error('produits.list.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// POST /api/protected/magasins/:magasinId/produits - Créer un produit
router.post('/magasins/:magasinId/produits', authMiddleware, async (req, res) => {
  try {
    const { magasinId } = req.params;
    const requester = req.user;
    const {
      reference,
      designation,
      typeProduitId,
      rayonId,
      quantiteEntree,
      prixUnitaire,
      champsDynamiques,
      etat,
      dateEntree,
      dateReception,
      dateFabrication,
      datePeremption,
      statut,
      priorite,
      seuilAlerte,
      photoUrl,
      notes
    } = req.body;

    const magasin = await Magasin.findById(magasinId);
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Vérifier que la référence est unique par magasin
    const existant = await Produit.findOne({ magasinId, reference });
    if (existant) {
      return res.status(400).json({ message: 'Référence déjà existante pour ce magasin' });
    }

    // Vérifier que le rayon accepte ce type de produit
    const rayon = await Rayon.findById(rayonId);
    if (!rayon || rayon.magasinId.toString() !== magasinId) {
      return res.status(400).json({ message: 'Rayon invalide' });
    }

    const typeProduit = await TypeProduit.findById(typeProduitId);
    if (!typeProduit || typeProduit.magasinId.toString() !== magasinId) {
      return res.status(400).json({ message: 'Type de produit invalide' });
    }

    // Vérifier que le rayon accepte ce type
    if (rayon.typesProduitsAutorises && rayon.typesProduitsAutorises.length > 0) {
      const accepte = rayon.typesProduitsAutorises.some(t => t.toString() === typeProduitId);
      if (!accepte) {
        return res.status(400).json({ message: 'Ce rayon n\'accepte pas ce type de produit' });
      }
    }

    const produit = new Produit({
      magasinId,
      reference,
      designation,
      typeProduitId,
      rayonId,
      quantiteActuelle: quantiteEntree || 0,
      quantiteEntree: quantiteEntree || 0,
      prixUnitaire,
      champsDynamiques,
      etat,
      dateEntree: dateEntree || dateReception || new Date(),
      dateReception: dateReception || new Date(),
      dateFabrication,
      dateExpiration: datePeremption,
      datePeremption,
      statut: statut || 'stocke',
      priorite: priorite || 'normale',
      seuilAlerte,
      photoUrl,
      notes
    });

    await produit.save();

    // Créer un mouvement de stock pour la réception
    if (quantiteEntree && quantiteEntree > 0) {
      const movement = new StockMovement({
        magasinId,
        produitId: produit._id,
        type: 'RECEPTION',
        quantite: quantiteEntree,
        utilisateurId: requester.id,
        prixUnitaire,
        numeroDocument: `REC-${produit._id.toString().slice(-8)}`,
        dateDocument: dateEntree || new Date(),
        observations: `Produit créé avec réception initiale`
      });
      await movement.save();
    }

    try {
      const activity = new Activity({
        utilisateurId: requester.id,
        action: 'CREER_PRODUIT',
        entite: 'Produit',
        entiteId: produit._id,
        description: `Produit '${designation}' créé avec ${quantiteEntree || 0} unités`,
        icon: 'fas fa-box'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    return res.status(201).json(produit);
  } catch (err) {
    console.error('produits.create.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// PUT /api/protected/produits/:produitId - Modifier un produit
router.put('/produits/:produitId', authMiddleware, async (req, res) => {
  try {
    const { produitId } = req.params;
    const requester = req.user;
    const { designation, prixUnitaire, etat, seuilAlerte, notes, photoUrl, reference } = req.body;

    const produit = await Produit.findById(produitId);
    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    const magasin = await Magasin.findById(produit.magasinId);
    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    produit.designation = designation || produit.designation;
    produit.prixUnitaire = prixUnitaire !== undefined ? prixUnitaire : produit.prixUnitaire;
    produit.etat = etat || produit.etat;
    produit.seuilAlerte = seuilAlerte !== undefined ? seuilAlerte : produit.seuilAlerte;
    produit.notes = notes !== undefined ? notes : produit.notes;
    produit.photoUrl = photoUrl || produit.photoUrl;
    produit.reference = reference || produit.reference;

    await produit.save();

    try {
      const activity = new Activity({
        utilisateurId: requester.id,
        action: 'MODIFIER_PRODUIT',
        entite: 'Produit',
        entiteId: produitId,
        description: `Produit '${designation}' modifié`,
        icon: 'fas fa-edit'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    return res.json(produit);
  } catch (err) {
    console.error('produits.update.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// DELETE /api/protected/produits/:produitId - Soft delete un produit
router.delete('/produits/:produitId', authMiddleware, async (req, res) => {
  try {
    const { produitId } = req.params;
    const requester = req.user;

    const produit = await Produit.findById(produitId);
    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    const magasin = await Magasin.findById(produit.magasinId);
    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    produit.status = 0; // Soft delete
    await produit.save();

    try {
      const activity = new Activity({
        utilisateurId: requester.id,
        action: 'SUPPRIMER_PRODUIT',
        entite: 'Produit',
        entiteId: produitId,
        description: `Produit '${produit.designation}' supprimé`,
        icon: 'fas fa-trash'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    return res.json({ message: 'Produit supprimé' });
  } catch (err) {
    console.error('produits.delete.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// ================================
// 📦 ROUTES STOCK - MOUVEMENTS
// ================================

// POST /api/protected/magasins/:magasinId/stock-movements - Créer un mouvement
router.post('/magasins/:magasinId/stock-movements', authMiddleware, async (req, res) => {
  try {
    const { magasinId } = req.params;
    const requester = req.user;
    const {
      produitId,
      type,
      quantite,
      magasinDestinationId,
      numeroDocument,
      fournisseur,
      prixUnitaire,
      observations,
      dateDocument
    } = req.body;

    const magasin = await Magasin.findById(magasinId);
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const produit = await Produit.findById(produitId);
    if (!produit || produit.magasinId.toString() !== magasinId) {
      return res.status(400).json({ message: 'Produit invalide' });
    }

    // Vérifier les quantités disponibles pour les sorties/transferts
    if ((type === 'SORTIE' || type === 'TRANSFERT' || type === 'RETOUR') && produit.quantiteActuelle < quantite) {
      return res.status(400).json({ 
        message: `Stock insuffisant. Disponible: ${produit.quantiteActuelle}, Demandé: ${quantite}` 
      });
    }

    // Créer le mouvement
    const movement = new StockMovement({
      magasinId,
      produitId,
      type,
      quantite,
      magasinDestinationId: type === 'TRANSFERT' ? magasinDestinationId : undefined,
      numeroDocument,
      fournisseur,
      utilisateurId: requester.id,
      prixUnitaire,
      observations,
      dateDocument: dateDocument || new Date()
    });

    await movement.save();

    // Mettre à jour le stock du produit
    if (type === 'RECEPTION') {
      produit.quantiteActuelle += quantite;
      produit.quantiteEntree += quantite;
    } else if (type === 'SORTIE') {
      produit.quantiteActuelle -= quantite;
      produit.quantiteSortie += quantite;
    } else if (type === 'TRANSFERT') {
      produit.quantiteActuelle -= quantite;
      produit.quantiteSortie += quantite;
      // Créer un mouvement de réception dans le magasin destination
      const movementDest = new StockMovement({
        magasinId: magasinDestinationId,
        produitId,
        type: 'RECEPTION',
        quantite,
        numeroDocument,
        utilisateurId: requester.id,
        prixUnitaire,
        observations: `Transfert depuis ${magasin.nom_magasin}`,
        dateDocument: dateDocument || new Date()
      });
      await movementDest.save();
    } else if (type === 'RETOUR') {
      produit.quantiteActuelle += quantite;
      produit.quantiteEntree += quantite;
    }

    await produit.save();

    try {
      const activity = new Activity({
        utilisateurId: requester.id,
        action: 'MOUVEMENT_STOCK',
        entite: 'StockMovement',
        entiteId: movement._id,
        description: `${type} de ${quantite} unités du produit '${produit.designation}'`,
        icon: 'fas fa-exchange-alt'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    return res.status(201).json({ movement, produit });
  } catch (err) {
    console.error('stock-movements.create.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// GET /api/protected/magasins/:magasinId/stock-movements - Lister les mouvements
router.get('/magasins/:magasinId/stock-movements', authMiddleware, async (req, res) => {
  try {
    const { magasinId } = req.params;
    const requester = req.user;
    const { type, produitId, limit = 50, skip = 0 } = req.query;

    const magasin = await Magasin.findById(magasinId);
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const filter = { magasinId };
    if (type) filter.type = type;
    if (produitId) filter.produitId = produitId;

    const movements = await StockMovement.find(filter)
      .populate('produitId', 'reference designation quantiteActuelle')
      .populate('utilisateurId', 'prenom nom')
      .sort({ dateDocument: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await StockMovement.countDocuments(filter);

    return res.json({
      movements,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (err) {
    console.error('stock-movements.list.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// GET /api/protected/produits/:produitId/mouvements - Historique d'un produit
router.get('/produits/:produitId/mouvements', authMiddleware, async (req, res) => {
  try {
    const { produitId } = req.params;
    const requester = req.user;

    const produit = await Produit.findById(produitId);
    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    const magasin = await Magasin.findById(produit.magasinId);
    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const movements = await StockMovement.find({ produitId })
      .populate('utilisateurId', 'prenom nom')
      .sort({ dateDocument: -1 })
      .lean();

    return res.json(movements);
  } catch (err) {
    console.error('produit.mouvements.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// ================================
// 📦 ROUTES STOCK - LOTS (FIFO/LIFO)
// ================================

// POST /api/protected/magasins/:magasinId/lots - Créer un lot
router.post('/magasins/:magasinId/lots', authMiddleware, blockVendeur, async (req, res) => {
  try {
    const { magasinId } = req.params;
    const requester = req.user;
    const {
      produitId,
      numeroBatch,
      quantiteEntree,
      prixUnitaireAchat,
      dateEntree,
      dateExpiration,
      numeroDocument,
      fournisseur,
      rayonId
    } = req.body;

    const magasin = await Magasin.findById(magasinId);
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const produit = await Produit.findById(produitId);
    if (!produit || produit.magasinId.toString() !== magasinId) {
      return res.status(400).json({ message: 'Produit invalide' });
    }

    const lot = new Lot({
      magasinId,
      produitId,
      numeroBatch,
      quantiteEntree,
      quantiteDisponible: quantiteEntree,
      prixUnitaireAchat,
      prixTotal: prixUnitaireAchat * quantiteEntree,
      dateEntree,
      dateExpiration,
      numeroDocument,
      fournisseur,
      rayonId
    });

    await lot.save();

    try {
      const activity = new Activity({
        utilisateurId: requester.id,
        action: 'CREER_LOT',
        entite: 'Lot',
        entiteId: lot._id,
        description: `Lot '${numeroBatch}' créé avec ${quantiteEntree} unités`,
        icon: 'fas fa-box'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    return res.status(201).json(lot);
  } catch (err) {
    console.error('lots.create.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// GET /api/protected/magasins/:magasinId/lots - Lister les lots
router.get('/magasins/:magasinId/lots', authMiddleware, async (req, res) => {
  try {
    const { magasinId } = req.params;
    const requester = req.user;
    const { produitId, statut = 'ACTIF' } = req.query;

    const magasin = await Magasin.findById(magasinId);
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const filter = { magasinId };
    if (produitId) filter.produitId = produitId;
    if (statut) filter.status = statut;

    // Trier par date entrée (FIFO)
    const lots = await Lot.find(filter)
      .populate('produitId', 'reference designation')
      .sort({ dateEntree: 1 })
      .lean();

    return res.json(lots);
  } catch (err) {
    console.error('lots.list.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// ================================
// 🚨 ROUTES STOCK - ALERTES
// ================================

// Fonction utilitaire: Créer alerte stock
async function creerAlerte(magasinId, produitId, type, severite, data) {
  try {
    const produit = await Produit.findById(produitId).populate('magasinId');
    if (!produit) return;

    let message = '';
    let actionRecommandee = 'COMMANDER_FOURNISSEUR';

    if (type === 'STOCK_BAS') {
      message = `${produit.designation}: Stock à ${produit.quantiteActuelle} unités, seuil: ${produit.seuilAlerte}`;
      actionRecommandee = 'COMMANDER_FOURNISSEUR';
    } else if (type === 'RUPTURE_STOCK') {
      message = `${produit.designation}: RUPTURE DE STOCK`;
      actionRecommandee = 'COMMANDER_FOURNISSEUR';
    } else if (type === 'PRODUIT_EXPIRE') {
      message = `${produit.designation}: PRODUIT EXPIRÉ`;
      actionRecommandee = 'EVACUER_PRODUIT';
    }

    const alerte = new AlerteStock({
      magasinId,
      produitId,
      type,
      severite,
      message,
      actionRecommandee,
      ...data
    });

    await alerte.save();
    return alerte;
  } catch (err) {
    console.error('creerAlerte.error', err);
  }
}

// GET /api/protected/magasins/:magasinId/alertes - Lister les alertes
router.get('/magasins/:magasinId/alertes', authMiddleware, async (req, res) => {
  try {
    const { magasinId } = req.params;
    const requester = req.user;
    const { statut = 'ACTIVE', type } = req.query;

    const magasin = await Magasin.findById(magasinId);
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const filter = { magasinId };
    if (statut) filter.statut = statut;
    if (type) filter.type = type;

    const alertes = await AlerteStock.find(filter)
      .populate({
        path: 'produitId',
        select: 'reference designation quantiteActuelle prixUnitaire typeProduitId rayonId photoUrl',
        populate: [
          {
            path: 'typeProduitId',
            select: 'nomType unitePrincipale code icone'
          },
          {
            path: 'rayonId',
            select: 'nomRayon codeRayon typeRayon iconeRayon'
          }
        ]
      })
      .populate('utilisateurId', 'nom prenom email')
      .populate('lotId', 'numeroLot dateExpiration')
      .sort({ dateCreation: -1 })
      .lean();

    return res.json(alertes);
  } catch (err) {
    console.error('alertes.list.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// PUT /api/protected/alertes/:alerteId - Mettre à jour statut alerte
router.put('/alertes/:alerteId', authMiddleware, async (req, res) => {
  try {
    const { alerteId } = req.params;
    const requester = req.user;
    const { statut, notes } = req.body;

    const alerte = await AlerteStock.findById(alerteId);
    if (!alerte) {
      return res.status(404).json({ message: 'Alerte non trouvée' });
    }

    const magasin = await Magasin.findById(alerte.magasinId);
    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    alerte.statut = statut;
    alerte.utilisateurId = requester.id;
    if (statut === 'RESOLUE' || statut === 'FAUSSE_ALERTE') {
      alerte.dateResolution = new Date();
    }
    if (notes) alerte.notes = notes;

    await alerte.save();
    return res.json(alerte);
  } catch (err) {
    console.error('alertes.update.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// ================================
// 📊 ROUTES STOCK - RAPPORTS INVENTAIRE
// ================================

// POST /api/protected/magasins/:magasinId/inventaires - Démarrer inventaire
router.post('/magasins/:magasinId/inventaires', authMiddleware, blockVendeur, async (req, res) => {
  try {
    const { magasinId } = req.params;
    const requester = req.user;
    const { observations } = req.body;

    const magasin = await Magasin.findById(magasinId);
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Générer numéro inventaire
    const date = new Date();
    const count = await RapportInventaire.countDocuments({ magasinId });
    const numeroInventaire = `INV-${date.getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const rapport = new RapportInventaire({
      magasinId,
      numeroInventaire,
      utilisateurCreateur: requester.id,
      observations
    });

    await rapport.save();

    return res.status(201).json(rapport);
  } catch (err) {
    console.error('inventaires.create.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// GET /api/protected/magasins/:magasinId/inventaires - Lister inventaires
router.get('/magasins/:magasinId/inventaires', authMiddleware, async (req, res) => {
  try {
    const { magasinId } = req.params;
    const requester = req.user;

    const magasin = await Magasin.findById(magasinId);
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const inventaires = await RapportInventaire.find({ magasinId })
      .populate('utilisateurCreateur', 'prenom nom')
      .populate('utilisateurValidateur', 'prenom nom')
      .sort({ dateDebut: -1 })
      .lean();

    return res.json(inventaires);
  } catch (err) {
    console.error('inventaires.list.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// PUT /api/protected/inventaires/:rapportId/lignes - Ajouter une ligne à inventaire
router.put('/inventaires/:rapportId/lignes', authMiddleware, async (req, res) => {
  try {
    const { rapportId } = req.params;
    const requester = req.user;
    const { produitId, quantitePhysique, rayonId, notes } = req.body;

    const rapport = await RapportInventaire.findById(rapportId);
    if (!rapport) {
      return res.status(404).json({ message: 'Rapport non trouvé' });
    }

    if (rapport.statut !== 'EN_COURS') {
      return res.status(400).json({ message: 'Cet inventaire n\'est pas en cours' });
    }

    const produit = await Produit.findById(produitId);
    if (!produit) {
      return res.status(400).json({ message: 'Produit invalide' });
    }

    const ligne = {
      produitId,
      reference: produit.reference,
      designation: produit.designation,
      quantiteTheorique: produit.quantiteActuelle,
      quantitePhysique,
      quantiteDifference: quantitePhysique - produit.quantiteActuelle,
      percentageEcart: ((quantitePhysique - produit.quantiteActuelle) / (produit.quantiteActuelle || 1) * 100).toFixed(2),
      rayonId,
      notes
    };

    rapport.ligneProduits.push(ligne);
    await rapport.save();

    return res.json(rapport);
  } catch (err) {
    console.error('inventaires.lignes.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// PUT /api/protected/inventaires/:rapportId/valider - Valider l'inventaire
router.put('/inventaires/:rapportId/valider', authMiddleware, blockVendeur, async (req, res) => {
  try {
    const { rapportId } = req.params;
    const requester = req.user;

    const rapport = await RapportInventaire.findById(rapportId);
    if (!rapport) {
      return res.status(404).json({ message: 'Rapport non trouvé' });
    }

    if (rapport.statut !== 'EN_COURS') {
      return res.status(400).json({ message: 'Cet inventaire n\'est pas en cours' });
    }

    // Calculer résumé
    let totalAvecEcart = 0;
    let valeurTheorique = 0;
    let valeurPhysique = 0;
    let ecartPositif = 0;
    let ecartNegatif = 0;

    rapport.ligneProduits.forEach(ligne => {
      if (ligne.quantiteDifference !== 0) totalAvecEcart++;
      
      const produit = Produit.findById(ligne.produitId);
      valeurTheorique += (ligne.quantiteTheorique * (produit?.prixUnitaire || 0));
      valeurPhysique += (ligne.quantitePhysique * (produit?.prixUnitaire || 0));

      if (ligne.quantiteDifference > 0) {
        ecartPositif += ligne.quantiteDifference;
      } else {
        ecartNegatif += Math.abs(ligne.quantiteDifference);
      }
    });

    rapport.resume = {
      totalProduitsInventories: rapport.ligneProduits.length,
      totalProduitsAvecEcart: totalAvecEcart,
      pourcentageEcart: (totalAvecEcart / rapport.ligneProduits.length * 100).toFixed(2),
      valeurTheorique,
      valeurPhysique,
      differenceMontant: valeurPhysique - valeurTheorique,
      ecartPositif,
      ecartNegatif
    };

    rapport.statut = 'VALIDEE';
    rapport.utilisateurValidateur = requester.id;
    rapport.dateFin = new Date();

    await rapport.save();

    try {
      const activity = new Activity({
        utilisateurId: requester.id,
        action: 'VALIDER_INVENTAIRE',
        entite: 'RapportInventaire',
        entiteId: rapport._id,
        description: `Inventaire ${rapport.numeroInventaire} validé`,
        icon: 'fas fa-check'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    return res.json(rapport);
  } catch (err) {
    console.error('inventaires.valider.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// ==========================================
// 📦 ROUTES CATÉGORIES / TYPES PRODUITS
// ==========================================

/**
 * GET /api/protected/magasins/:magasinId/categories
 * Récupérer toutes les catégories d'un magasin
 */
router.get('/magasins/:magasinId/categories', authMiddleware, async (req, res) => {
  try {
    const { magasinId } = req.params;
    
    // ✅ Utiliser les noms corrects du modèle TypeProduit
    const categories = await TypeProduit.find({ magasinId })
      .select('_id nomType code unitePrincipale icone couleur seuilAlerte capaciteMax photoRequise champsSupplementaires status createdAt updatedAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, categories });
  } catch (error) {
    console.error('❌ GET categories error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/protected/magasins/:magasinId/categories
 * Créer une nouvelle catégorie
 */
router.post('/magasins/:magasinId/categories', authMiddleware, async (req, res) => {
  try {
    const { magasinId } = req.params;
    // ✅ MAPPING: Les noms du frontend vers les noms du modèle
    const { 
      nomType, code, unitePrincipale, icone, couleur, 
      seuilAlerte, capaciteMax, photoRequise, champsSupplementaires 
    } = req.body;

    // Validation - utiliser les noms du modèle
    if (!nomType || !code || !unitePrincipale || !icone) {
      return res.status(400).json({ error: 'Champs obligatoires: nomType, code, unitePrincipale, icone' });
    }

    // Vérifier l'unicité du code par magasin
    const exists = await TypeProduit.findOne({ magasinId, code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ error: `Code "${code}" existe déjà pour ce magasin` });
    }

    const newCategory = new TypeProduit({
      magasinId,
      nomType,
      code: code.toUpperCase(),
      unitePrincipale,
      icone,
      couleur: couleur || '#3b82f6',
      seuilAlerte: seuilAlerte || 5,
      capaciteMax: capaciteMax || 1000,
      photoRequise: photoRequise !== false,
      champsSupplementaires: champsSupplementaires || []
    });

    await newCategory.save();
    res.status(201).json({ success: true, message: '✅ Catégorie créée', category: newCategory });
  } catch (error) {
    console.error('❌ POST category error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/protected/categories/:categoryId
 * Détails d'une catégorie
 */
router.get('/categories/:categoryId', authMiddleware, async (req, res) => {
  try {
    const category = await TypeProduit.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }
    res.json({ success: true, category });
  } catch (error) {
    console.error('❌ GET category error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/protected/categories/:categoryId
 * Modifier une catégorie
 */
router.put('/categories/:categoryId', authMiddleware, async (req, res) => {
  try {
    // ✅ MAPPING: Les noms du frontend vers les noms du modèle
    const { 
      nomType, code, unitePrincipale, icone, couleur, 
      seuilAlerte, capaciteMax, photoRequise, champsSupplementaires 
    } = req.body;

    const category = await TypeProduit.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    // Vérifier l'unicité du code si changé
    if (code && code.toUpperCase() !== category.code) {
      const exists = await TypeProduit.findOne({
        magasinId: category.magasinId,
        code: code.toUpperCase(),
        _id: { $ne: category._id }
      });
      if (exists) {
        return res.status(400).json({ error: `Code "${code}" existe déjà` });
      }
    }

    // Mise à jour - utiliser les noms du modèle
    if (nomType) category.nomType = nomType;
    if (code) category.code = code.toUpperCase();
    if (unitePrincipale) category.unitePrincipale = unitePrincipale;
    if (icone) category.icone = icone;
    if (couleur) category.couleur = couleur;
    if (seuilAlerte !== undefined) category.seuilAlerte = seuilAlerte;
    if (capaciteMax !== undefined) category.capaciteMax = capaciteMax;
    if (photoRequise !== undefined) category.photoRequise = photoRequise;
    if (champsSupplementaires) category.champsSupplementaires = champsSupplementaires;

    await category.save();
    res.json({ success: true, message: '✅ Catégorie modifiée', category });
  } catch (error) {
    console.error('❌ PUT category error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/protected/categories/:categoryId
 * Supprimer une catégorie
 */
router.delete('/categories/:categoryId', authMiddleware, async (req, res) => {
  try {
    const category = await TypeProduit.findByIdAndDelete(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }
    res.json({ success: true, message: '✅ Catégorie supprimée' });
  } catch (error) {
    console.error('❌ DELETE category error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// ENDPOINT: POST /api/protected/receptions
// Description: Create a new reception record with automatic stock movement
// ============================================================================

router.post('/receptions', authMiddleware, checkMagasinAccess, async (req, res) => {
  try {
    const {
      produitId,
      magasinId,
      rayonId,
      quantite,
      prixAchat,
      photoUrl,
      fournisseur,
      lotNumber,
      dateReception,
      datePeremption,
      dateFabrication,
      statut,
      priorite,
      numeroBatch,
      certificat,
      numeroSerie,
      codeBarres,
      etatColis,
      garantie
    } = req.body;

    // Log les données reçues
    console.log('📥 POST /receptions reçues:', {
      produitId: produitId || 'MISSING',
      magasinId: magasinId || 'MISSING',
      rayonId: rayonId || 'MISSING',
      quantite: quantite || 'MISSING',
      prixAchat: prixAchat || 'MISSING'
    });

    // Validation des champs requis
    if (!produitId || !magasinId || !rayonId || !quantite || prixAchat === null || prixAchat === undefined) {
      return res.status(400).json({
        error: 'Champs requis manquants',
        received: { produitId, magasinId, rayonId, quantite, prixAchat }
      });
    }

    // Vérifier que la quantité est valide
    if (quantite <= 0) {
      return res.status(400).json({ error: 'Quantité doit être > 0' });
    }

    // Vérifier que le produit existe et qu'il n'est pas supprimé
    const produit = await Produit.findById(produitId);
    if (!produit || produit.estSupprime) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    // Vérifier que le magasin existe
    const magasin = await Magasin.findById(magasinId);
    if (!magasin || magasin.estSupprime) {
      return res.status(404).json({ error: 'Magasin non trouvé' });
    }

    // Vérifier que le rayon existe
    const rayon = await Rayon.findById(rayonId)
      .populate('typesProduitsAutorises', 'nomType');
    if (!rayon || rayon.estSupprime) {
      return res.status(404).json({ error: 'Rayon non trouvé' });
    }

    // ⚠️ VALIDATION: Vérifier si le type de produit est autorisé dans ce rayon
    if (rayon.typesProduitsAutorises && rayon.typesProduitsAutorises.length > 0) {
      const typeProduitsIds = rayon.typesProduitsAutorises.map(t => t._id.toString());
      const produitTypeId = produit.typeProduitId.toString();
      
      if (!typeProduitsIds.includes(produitTypeId)) {
        const typesNoms = rayon.typesProduitsAutorises.map(t => t.nomType).join(', ');
        return res.status(400).json({
          error: `❌ Type produit non autorisé dans ce rayon`,
          details: `Ce rayon n'accepte que: ${typesNoms}`,
          typeProduitsAutorisés: typesNoms
        });
      }
      console.log(`✅ Type produit autorisé dans ce rayon`);
    }

    // ⚠️ VALIDATION: Vérifier la capacité TOTALE du rayon (tous les produits)
    const allStocksInRayon = await StockRayon.find({
      rayonId,
      magasinId
    });
    
    const quantiteTotalRayonActuelle = allStocksInRayon.reduce((sum, stock) => sum + stock.quantiteDisponible, 0);
    const quantiteTotalRayonApreAjout = quantiteTotalRayonActuelle + parseFloat(quantite);
    
    if (quantiteTotalRayonApreAjout > rayon.capaciteMax) {
      return res.status(400).json({
        error: '❌ Capacité du rayon dépassée',
        details: `Capacité totale rayon: ${rayon.capaciteMax} ${rayon.uniteMesure || 'unités'}, Stock total actuel: ${quantiteTotalRayonActuelle}, À ajouter: ${quantite}, Total après: ${quantiteTotalRayonApreAjout}`,
        capaciteRayon: rayon.capaciteMax,
        stockTotalActuel: quantiteTotalRayonActuelle,
        quantiteAjout: quantite,
        quantiteTotaleApreAjout: quantiteTotalRayonApreAjout
      });
    }
    console.log(`✅ Capacité rayon OK - ${rayon.nomRayon} (${quantiteTotalRayonApreAjout}/${rayon.capaciteMax})`);

    // ⚠️ VALIDATION: Vérifier la capacité MAX du TYPE DE PRODUIT (tous les rayons du magasin)
    const typeProduit = await TypeProduit.findById(produit.typeProduitId);
    if (typeProduit && typeProduit.capaciteMax) {
      // Calculer la quantité totale de ce type de produit dans ce magasin
      const produitsType = await Produit.find({ typeProduitId: produit.typeProduitId, magasinId }).select('_id');
      const produitsTypeIds = produitsType.map(p => p._id);
      
      const allStocksTypeProduit = await StockRayon.find({
        produitId: { $in: produitsTypeIds },
        magasinId
      });
      
      const quantiteTotalTypeProduit = allStocksTypeProduit.reduce((sum, stock) => sum + stock.quantiteDisponible, 0);
      const quantiteTotalTypeApreAjout = quantiteTotalTypeProduit + parseFloat(quantite);
      
      if (quantiteTotalTypeApreAjout > typeProduit.capaciteMax) {
        return res.status(400).json({
          error: '❌ Capacité du type de produit dépassée',
          details: `Capacité max pour type "${typeProduit.nomType}": ${typeProduit.capaciteMax} ${typeProduit.unitePrincipale || 'unités'}, Stock actuel: ${quantiteTotalTypeProduit}, À ajouter: ${quantite}, Total: ${quantiteTotalTypeApreAjout}`,
          capaciteType: typeProduit.capaciteMax,
          stockTypeActuel: quantiteTotalTypeProduit,
          quantiteAjout: quantite,
          quantiteTotalType: quantiteTotalTypeApreAjout
        });
      }
      console.log(`✅ Capacité type produit OK - "${typeProduit.nomType}" (${quantiteTotalTypeApreAjout}/${typeProduit.capaciteMax})`);
    }

    console.log(`✅ Validations OK - Produit: ${produit.designation}, Quantité: ${quantite}`);

    // Calculer le prix total
    const prixTotal = quantite * prixAchat;

    // 1. Créer l'enregistrement Reception
    const reception = new Reception({
      produitId,
      magasinId,
      rayonId,
      quantite,
      prixAchat,
      prixTotal,
      photoUrl,
      fournisseur: fournisseur || 'Non spécifié',
      lotNumber: lotNumber || `LOT-${Date.now()}`,
      dateReception: dateReception || new Date(),
      datePeremption,
      dateFabrication,
      statut: statut || 'controle',
      priorite: priorite || 'normale',
      utilisateurId: req.user.id,
      // Champs dynamiques
      numeroBatch,
      certificat,
      numeroSerie,
      codeBarres,
      etatColis,
      garantie
    });

    // Sauvegarder la réception
    await reception.save();
    console.log(`✅ Réception créée: ${reception._id}`);

    // 2. Créer automatiquement un mouvement de stock (RÉCEPTION)
    const stockMovement = new StockMovement({
      produitId,
      magasinId,
      rayonId,
      type: 'RECEPTION',  // 👈 RECEPTION en majuscules sans accent (comme défini dans l'enum)
      quantite,
      quantiteEntree: quantite,
      quantiteSortie: 0,
      reference: reception._id,
      description: `Réception - Fournisseur: ${fournisseur || 'Non spécifié'}, Lot: ${lotNumber || ''}`,
      utilisateurId: req.user.id,
      dateCreation: new Date()
    });

    await stockMovement.save();
    console.log(`✅ Mouvement de stock créé: ${stockMovement._id}`);

    // 3. Mettre à jour StockRayon (NEW LOGIC)
    let stockRayon = await StockRayon.findOne({
      produitId,
      magasinId,
      rayonId
    });

    if (!stockRayon) {
      // Créer une nouvelle entrée StockRayon
      stockRayon = new StockRayon({
        produitId,
        magasinId,
        rayonId,
        quantiteDisponible: parseFloat(quantite),
        réceptions: [
          {
            receptionId: reception._id,
            quantite: parseFloat(quantite),
            dateReception: dateReception || new Date(),
            lotNumber: lotNumber || `LOT-${Date.now()}`,
            fournisseur: fournisseur || 'Non spécifié',
            datePeremption
          }
        ]
      });
      console.log(`✅ StockRayon créé pour Rayon: ${rayonId}`);
    } else {
      // Mettre à jour le StockRayon existant
      stockRayon.quantiteDisponible = (stockRayon.quantiteDisponible || 0) + parseFloat(quantite);
      stockRayon.réceptions.push({
        receptionId: reception._id,
        quantite: parseFloat(quantite),
        dateReception: dateReception || new Date(),
        lotNumber: lotNumber || `LOT-${Date.now()}`,
        fournisseur: fournisseur || 'Non spécifié',
        datePeremption
      });
      console.log(`✅ StockRayon mis à jour: ${stockRayon._id}`);
    }

    await stockRayon.save();

    // 4. Mettre à jour la quantité du rayon
    rayon.quantiteActuelle = (rayon.quantiteActuelle || 0) + parseFloat(quantite);
    await rayon.save();
    console.log(`✅ Rayon mis à jour: ${rayon.nomRayon} (${rayon.quantiteActuelle}/${rayon.capaciteMax})`);

    // 5. Mettre à jour la quantité totale du produit (somme de tous les rayons)
    const totalStockParProduit = await StockRayon.aggregate([
      {
        $match: {
          produitId: mongoose.Types.ObjectId(produitId),
          magasinId: mongoose.Types.ObjectId(magasinId)
        }
      },
      {
        $group: {
          _id: '$produitId',
          totalQuantite: { $sum: '$quantiteDisponible' }
        }
      }
    ]);

    produit.quantiteActuelle = (totalStockParProduit[0]?.totalQuantite || 0);
    produit.quantiteEntree = (produit.quantiteEntree || 0) + parseFloat(quantite);
    produit.dateLastMovement = new Date();

    // Si le produit n'a pas encore de rayonId, assigner le premier
    if (!produit.rayonId) {
      produit.rayonId = rayonId;
      console.log(`📍 Premier rayon assigné au produit: ${rayonId}`);
    }

    await produit.save();
    console.log(`✅ Produit mis à jour: quantité totale ${produit.quantiteActuelle}`);

    // 6. Lier le mouvement à la réception
    reception.mouvementStockId = stockMovement._id;
    await reception.save();

    // 7. Retourner la réception avec tous les détails

    const populatedReception = await Reception.findById(reception._id)
      .populate('produitId', 'designation reference image quantiteActuelle')
      .populate('magasinId', 'nom')
      .populate('rayonId', 'nom')
      .populate('mouvementStockId');

    res.status(201).json({
      success: true,
      message: '✅ Réception enregistrée avec succès',
      reception: populatedReception,
      mouvement: stockMovement,
      produitUpdated: {
        id: produit._id,
        quantiteActuelle: produit.quantiteActuelle,
        quantiteEntree: produit.quantiteEntree
      }
    });
  } catch (error) {
    console.error('❌ POST /receptions error:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'enregistrement de la réception',
      details: error.message
    });
  }
});

// ============================================================================
// ENDPOINT: GET /api/protected/stock-rayons
// Description: Get stock par rayon for a product/magasin
// ============================================================================

router.get('/stock-rayons', authMiddleware, checkMagasinAccess, async (req, res) => {
  try {
    const { magasinId, produitId } = req.query;

    if (!magasinId || !produitId) {
      return res.status(400).json({ error: 'magasinId et produitId requis' });
    }

    // Récupérer tous les StockRayon pour ce produit/magasin
    const stocksRayons = await StockRayon.find({
      produitId,
      magasinId
    })
      .populate('rayonId', 'nomRayon codeRayon')
      .populate({
        path: 'réceptions.receptionId',
        select: 'dateReception fournisseur lotNumber datePeremption'
      })
      .sort({ 'rayonId': 1 });

    res.json({
      success: true,
      data: stocksRayons,
      summary: {
        totalQuantite: stocksRayons.reduce((sum, s) => sum + (s.quantiteDisponible || 0), 0),
        nombreRayons: stocksRayons.length
      }
    });
  } catch (error) {
    console.error('❌ GET /stock-rayons error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// ENDPOINT: GET /api/protected/receptions
// Description: Get all receptions for a magasin with filters
// ============================================================================

router.get('/receptions', authMiddleware, checkMagasinAccess, async (req, res) => {
  try {
    const { magasinId, statut, produitId, dateDebut, dateFin, limit = 50, page = 1 } = req.query;

    // Construire le filtre
    const filter = {
      magasinId: magasinId || req.user.magasinId
    };

    if (statut) {
      filter.statut = statut;
    }

    if (produitId) {
      filter.produitId = produitId;
    }

    // Filtre de date
    if (dateDebut || dateFin) {
      filter.dateReception = {};
      if (dateDebut) {
        filter.dateReception.$gte = new Date(dateDebut);
      }
      if (dateFin) {
        const endDate = new Date(dateFin);
        endDate.setHours(23, 59, 59, 999);
        filter.dateReception.$lte = endDate;
      }
    }

    // Calculer la pagination
    const skip = (page - 1) * limit;

    // Récupérer les réceptions
    const receptions = await Reception.find(filter)
      .populate({
        path: 'produitId',
        select: 'designation reference image quantiteActuelle prixUnitaire typeProduitId seuilAlerte etat',
        populate: {
          path: 'typeProduitId',
          select: 'nomType unitePrincipale code icone'
        }
      })
      .populate('magasinId', 'nom')
      .populate({
        path: 'rayonId',
        select: 'codeRayon nomRayon typeRayon quantiteActuelle capaciteMax couleurRayon iconeRayon typesProduitsAutorises description status'
      })
      .populate('mouvementStockId')
      .populate('utilisateurId', 'nom prenom email')
      .sort({ dateReception: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Compter total
    const total = await Reception.countDocuments(filter);

    // Calculer les stats
    const stats = await Reception.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$statut',
          count: { $sum: 1 },
          totalQuantite: { $sum: '$quantite' },
          totalPrix: { $sum: '$prixTotal' }
        }
      }
    ]);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
      receptions,
      stats: stats.reduce((acc, s) => {
        acc[s._id] = { count: s.count, totalQuantite: s.totalQuantite, totalPrix: s.totalPrix };
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('❌ GET /receptions error:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des réceptions',
      details: error.message
    });
  }
});

// ============================================================================
// ENDPOINT: GET /api/protected/receptions/:receptionId
// Description: Get a specific reception detail with all populated fields
// ============================================================================

router.get('/receptions/:receptionId', authMiddleware, checkMagasinAccess, async (req, res) => {
  try {
    const reception = await Reception.findById(req.params.receptionId)
      .populate({
        path: 'produitId',
        populate: {
          path: 'typeProduitId',
          select: 'nomType unitePrincipale code icone'
        }
      })
      .populate('magasinId', 'nom')
      .populate({
        path: 'rayonId',
        select: 'codeRayon nomRayon typeRayon quantiteActuelle capaciteMax couleurRayon iconeRayon typesProduitsAutorises description status createdAt updatedAt'
      })
      .populate('mouvementStockId')
      .populate('utilisateurId', 'nom prenom email');

    if (!reception) {
      return res.status(404).json({ error: 'Réception non trouvée' });
    }

    res.json({ success: true, reception });
  } catch (error) {
    console.error('❌ GET /receptions/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// ENDPOINT: PUT /api/protected/receptions/:receptionId
// Description: Update a specific reception
// ============================================================================

router.put('/receptions/:receptionId', authMiddleware, upload.single('photo'), checkMagasinAccess, async (req, res) => {
  try {
    console.log('\n=== PUT /receptions/:receptionId START ===');
    console.log('📦 req.file:', req.file ? `${req.file.filename} (${req.file.size} bytes)` : 'null');
    
    const { receptionId } = req.params;
    const { 
      quantite, 
      prixAchat, 
      prixTotal, 
      dateReception, 
      datePeremption, 
      lotNumber, 
      dateFabrication, 
      statut, 
      fournisseur,
      magasinId,
      photoUrl
    } = req.body;

    console.log('📝 Champs reçus:', { quantite, prixAchat, fournisseur, statut });

    // Vérifier que la réception existe
    const reception = await Reception.findById(receptionId);
    if (!reception) {
      return res.status(404).json({ error: 'Réception non trouvée' });
    }

    // Vérifier que l'utilisateur a accès à ce magasin
    if (reception.magasinId.toString() !== magasinId) {
      return res.status(403).json({ error: 'Accès refusé à ce magasin' });
    }

    // Mettre à jour les champs
    if (quantite !== undefined) reception.quantite = parseInt(quantite);
    if (prixAchat !== undefined) reception.prixAchat = parseFloat(prixAchat);
    if (prixTotal !== undefined) reception.prixTotal = parseFloat(prixTotal);
    if (dateReception) reception.dateReception = new Date(dateReception);
    if (datePeremption) reception.datePeremption = new Date(datePeremption);
    if (lotNumber !== undefined) reception.lotNumber = lotNumber;
    if (dateFabrication) reception.dateFabrication = new Date(dateFabrication);
    if (statut) reception.statut = statut;
    if (fournisseur !== undefined) reception.fournisseur = fournisseur;

    // Gérer l'upload de la photo
    if (req.file && req.file.buffer) {
      try {
        console.log('📸 Photo reçue pour upload Cloudinary:', (req.file.buffer.length / 1024).toFixed(2), 'KB');
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream({ folder: 'receptions' }, (error, result) => {
            if (error) {
              console.error('❌ Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('✅ Upload Cloudinary réussi:', result.secure_url);
              resolve(result);
            }
          });
          uploadStream.end(req.file.buffer);
        });
        reception.photoUrl = result.secure_url;
        console.log('✅ PhotoUrl mise à jour (Cloudinary):', reception.photoUrl);
      } catch (upErr) {
        console.error('❌ Erreur Cloudinary upload:', upErr);
        return res.status(400).json({ message: 'Erreur lors de l\'upload de la photo.' });
      }
    } else if (photoUrl) {
      // Si une photoUrl est fournie directement dans le body
      console.log('📷 photoUrl du body utilisée:', photoUrl);
      reception.photoUrl = photoUrl;
    } else {
      console.log('⚠️ Aucune photo uploadée, photoUrl conservée:', reception.photoUrl);
    }

    // Sauvegarder
    await reception.save();

    console.log('✅ Réception modifiée et sauvegardée:', {
      id: receptionId,
      quantite,
      prixTotal,
      statut,
      photoUrl: reception.photoUrl
    });

    // Retourner la réception mise à jour avec données peuplées
    const updatedReception = await Reception.findById(receptionId)
      .populate({
        path: 'produitId',
        populate: {
          path: 'typeProduitId',
          select: 'nomType unitePrincipale code icone'
        }
      })
      .populate('magasinId', 'nom')
      .populate({
        path: 'rayonId',
        select: 'codeRayon nomRayon typeRayon quantiteActuelle capaciteMax couleurRayon iconeRayon typesProduitsAutorises description status createdAt updatedAt'
      })
      .populate('mouvementStockId')
      .populate('utilisateurId', 'nom prenom email');

    console.log('📤 Réponse avec photoUrl:', updatedReception.photoUrl);
    console.log('=== PUT /receptions/:receptionId END ===\n');
    
    res.json({ success: true, reception: updatedReception });

  } catch (error) {
    console.error('❌ PUT /receptions/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;




