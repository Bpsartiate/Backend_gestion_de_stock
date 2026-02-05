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
const AuditLog = require('../models/auditLog');
const AuditService = require('../services/auditService');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../services/cloudinary');

const utilisateurController = require('../controllers/utilisateurController');
const upload = require('../middlewares/upload');
const Rayon = require('../models/rayon');
const Produit = require('../models/produit');
const TypeProduit = require('../models/typeProduit');
const StockMovement = require('../models/stockMovement');
const Lot = require('../models/lot');
const AlerteStock = require('../models/alerteStock');
const RapportInventaire = require('../models/rapportInventaire');
const Reception = require('../models/reception');
const StockRayon = require('../models/stockRayon');
const consolidationService = require('../services/consolidationService');

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
      .populate('vendeurId', 'nom prenom email role')
      .populate('managerId', 'nom prenom email role')
      .populate('guichetId', 'nom')
      .populate('magasinId', 'nom')
      .populate('entrepriseId', 'nom');
    
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

// POST /api/protected/affectations - Créer une nouvelle affectation
router.post('/affectations', authMiddleware, async (req, res) => {
  try {
    // Vérifier les droits d'accès
    if (!['admin', 'superviseur'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { vendeurId, guichetId, magasinId, entrepriseId, dateAffectation, notes } = req.body;

    // Validation des champs requis
    if (!vendeurId || !guichetId || !magasinId || !entrepriseId) {
      return res.status(400).json({ 
        message: 'Champs requis manquants: vendeurId, guichetId, magasinId, entrepriseId' 
      });
    }

    // Vérifier que le vendeur existe et est un vendeur
    const vendeur = await Utilisateur.findById(vendeurId).select('role nom prenom');
    if (!vendeur || vendeur.role !== 'vendeur') {
      return res.status(400).json({ message: 'Vendeur invalide ou inexistant' });
    }

    // Vérifier que le guichet existe
    const guichet = await Guichet.findById(guichetId).select('_id magasinId nom_guichet');
    if (!guichet) {
      return res.status(400).json({ message: 'Guichet invalide ou inexistant' });
    }

    // Vérifier que le magasin existe
    const magasin = await Magasin.findById(magasinId).select('_id businessId nom_magasin');
    if (!magasin) {
      return res.status(400).json({ message: 'Magasin invalide ou inexistant' });
    }

    // Vérifier que l'entreprise existe
    const entreprise = await Business.findById(entrepriseId).select('_id nomEntreprise');
    if (!entreprise) {
      return res.status(400).json({ message: 'Entreprise invalide ou inexistante' });
    }

    // Vérifier que le vendeur n'a pas déjà une affectation active
    const affectationExistante = await Affectation.findOne({
      vendeurId,
      $or: [
        { status: 1 },
        { status: true },
        { statut: 'active' }
      ]
    });

    if (affectationExistante) {
      return res.status(400).json({ 
        message: 'Ce vendeur a déjà une affectation active' 
      });
    }

    // Créer la nouvelle affectation
    const nouvelleAffectation = new Affectation({
      vendeurId,
      guichetId,
      magasinId,
      entrepriseId,
      managerId: req.user.id,
      dateAffectation: dateAffectation ? new Date(dateAffectation) : new Date(),
      status: 1,
      notes: notes || ''
    });

    await nouvelleAffectation.save();

    // Populer les références pour la réponse
    const affectationPopulee = await Affectation.findById(nouvelleAffectation._id)
      .populate('vendeurId', 'nom prenom email role')
      .populate('managerId', 'nom prenom email role')
      .populate('guichetId', 'nom_guichet code')
      .populate('magasinId', 'nom_magasin adresse')
      .populate('entrepriseId', 'nomEntreprise budget devise');

    console.log('✅ Affectation créée:', affectationPopulee._id);
    
    return res.status(201).json({
      message: 'Affectation créée avec succès',
      affectation: affectationPopulee
    });
  } catch(err) {
    console.error('affectations.create.error', err);
    return res.status(500).json({ message: 'Erreur lors de la création: ' + err.message });
  }
});

// PUT /api/protected/affectations/:id - Modifier une affectation
router.put('/affectations/:id', authMiddleware, async (req, res) => {
  try {
    // Vérifier les droits d'accès
    if (!['admin', 'superviseur'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const affectationId = req.params.id;
    const { vendeurId, guichetId, magasinId, entrepriseId, dateAffectation, status, notes } = req.body;

    // Vérifier que l'affectation existe
    const affectation = await Affectation.findById(affectationId);
    if (!affectation) {
      return res.status(404).json({ message: 'Affectation introuvable' });
    }

    // Mise à jour des champs
    if (vendeurId) affectation.vendeurId = vendeurId;
    if (guichetId) affectation.guichetId = guichetId;
    if (magasinId) affectation.magasinId = magasinId;
    if (entrepriseId) affectation.entrepriseId = entrepriseId;
    if (dateAffectation) affectation.dateAffectation = new Date(dateAffectation);
    if (typeof status !== 'undefined') affectation.status = status;
    if (notes !== undefined) affectation.notes = notes;

    await affectation.save();

    // Populer les références pour la réponse
    const affectationPopulee = await Affectation.findById(affectationId)
      .populate('vendeurId', 'nom prenom email role')
      .populate('managerId', 'nom prenom email role')
      .populate('guichetId', 'nom_guichet code')
      .populate('magasinId', 'nom_magasin adresse')
      .populate('entrepriseId', 'nomEntreprise budget devise');

    console.log('✅ Affectation modifiée:', affectationId);
    
    return res.json({
      message: 'Affectation modifiée avec succès',
      affectation: affectationPopulee
    });
  } catch(err) {
    console.error('affectations.update.error', err);
    return res.status(500).json({ message: 'Erreur lors de la modification: ' + err.message });
  }
});

// DELETE /api/protected/affectations/:id - Supprimer une affectation
router.delete('/affectations/:id', authMiddleware, async (req, res) => {
  try {
    // Vérifier les droits d'accès
    if (!['admin', 'superviseur'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const affectationId = req.params.id;

    // Vérifier que l'affectation existe
    const affectation = await Affectation.findById(affectationId);
    if (!affectation) {
      return res.status(404).json({ message: 'Affectation introuvable' });
    }

    // Supprimer l'affectation
    await Affectation.findByIdAndDelete(affectationId);

    console.log('✅ Affectation supprimée:', affectationId);
    
    return res.json({
      message: 'Affectation supprimée avec succès'
    });
  } catch(err) {
    console.error('affectations.delete.error', err);
    return res.status(500).json({ message: 'Erreur lors de la suppression: ' + err.message });
  }
});

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

// GET /api/protected/guichets/detail/:guichetId - Détail d'un guichet avec ventes
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
      .populate('vendeurId', 'nom prenom email role photoUrl')
      .lean();
    
    // 🎯 NOUVEAU: Récupérer les ventes du guichet
    const Vente = require('../models/vente');
    const ventes = await Vente.find({ guichetId })
      .select('_id dateVente montantTotalUSD articles utilisateurId client modePaiement')
      .populate('utilisateurId', 'nom prenom email')
      .populate({
        path: 'articles.produitId',
        select: 'designation prixUnitaire'
      })
      .sort({ dateVente: -1 })
      .limit(100)
      .lean();
    
    // Calculer les statistiques du guichet
    const totalVentes = ventes.length;
    const totalMontant = ventes.reduce((sum, v) => sum + (v.montantTotalUSD || 0), 0);
    const totalArticles = ventes.reduce((sum, v) => sum + (v.articles?.length || 0), 0);
    
    return res.json({
      ...guichet,
      vendeurs: affectations.map(a => a.vendeurId),
      ventes: ventes,
      statistiques: {
        totalVentes,
        totalMontant: totalMontant.toFixed(2),
        totalArticles,
        joursActifs: new Set(ventes.map(v => new Date(v.dateVente).toLocaleDateString())).size
      }
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
    
    // 🎯 NOUVEAU: Get unique vendeurs AVEC affectation ACTIVE à un guichet
    const affectations = await Affectation.find({ status: 1 }).distinct('vendeurId');
    const totalVendeurs = affectations.length;
    
    // Calculate total stock (sum of stockMax from ALL guichets)
    const stockData = await Guichet.aggregate([
      { $group: { _id: null, totalStock: { $sum: '$stockMax' } } }
    ]);
    const totalStock = stockData.length > 0 ? stockData[0].totalStock : 0;
    
    // 🎯 NOUVEAU: Compter les alertes stock (produits avec quantité < seuil d'alerte)
    const stockAlerts = await Produit.countDocuments({
      $expr: { $lt: ['$quantiteActuelle', '$seuilAlerte'] }
    });
    
    // Get first entreprise for display
    const entreprise = await Business.findOne().select('nomEntreprise').lean();
    
    return res.json({
      totalMagasins,
      totalGuichets,
      totalVendeurs,  // ✅ Vendeurs avec affectation active
      totalStock,
      stockAlerts,    // ✅ Produits en alerte stock
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
      .populate('managerId', 'nom prenom email role')
      .populate('guichetId', 'nom code')
      .populate('magasinId', 'nom')
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
    const { vendeurId, guichetId, magasinId, entrepriseId, dateAffectation, observations, status, statut, notes } = req.body;

    const affectation = await Affectation.findById(affectationId);
    if (!affectation) {
      return res.status(404).json({ message: 'Affectation non trouvée' });
    }

    // Mettre à jour les champs disponibles
    if (vendeurId) affectation.vendeurId = vendeurId;
    if (guichetId) affectation.guichetId = guichetId;
    if (magasinId) affectation.magasinId = magasinId;
    if (entrepriseId) affectation.entrepriseId = entrepriseId;
    if (dateAffectation) affectation.dateAffectation = dateAffectation;
    if (observations) affectation.observations = observations;
    
    // Support des deux formats: statut/status
    if (status !== undefined) affectation.status = status;
    if (statut !== undefined) affectation.status = statut; // Mapper statut vers status
    if (notes) affectation.notes = notes;

    if ((statut === 'inactive' || status === 0) && !affectation.dateFinAffectation) {
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
        description: `Affectation modifiée${vendeur ? ` (${vendeur.prenom} ${vendeur.nom})` : ''}`,
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

// GET /api/protected/magasins/:magasinId/rayons - Lister les rayons avec stats
/**
 * 🪟 GET /api/protected/magasins/:magasinId/guichets
 * Récupère les guichets d'un magasin
 */
router.get('/magasins/:magasinId/guichets', authMiddleware, async (req, res) => {
  try {
    const { magasinId } = req.params;

    // Vérifier que le magasin existe
    const magasin = await Magasin.findById(magasinId);
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    // Récupérer les guichets du magasin
    const guichets = await Guichet.find({ magasinId })
      .populate('vendeurPrincipal', '_id nom prenom email')
      .sort({ nom_guichet: 1 });

    console.log(`🪟 ${guichets.length} guichet(s) trouvé(s) pour magasin ${magasinId}`);
    
    res.json(guichets);
  } catch (error) {
    console.error('❌ Erreur GET guichets:', error);
    res.status(500).json({ message: 'Erreur: ' + error.message });
  }
});

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

    // Enrichir chaque rayon avec les stats de stock
    const rayonsAvecStats = await Promise.all(rayons.map(async (rayon) => {
      // 1. Compter les articles (StockRayons distincts pour ce rayon) - SAUF VIDES
      const stocks = await StockRayon.find({ 
        rayonId: rayon._id,
        statut: { $ne: 'VIDE' }  // 🆕 Exclure les emplacements vides
      })
        .select('_id quantiteDisponible produitId typeStockage statut')
        .populate('produitId', 'designation reference');
      const nombreArticlesSTOCK = stocks.length;
      
      // 1b. Compter les LOTs individuels pour ce rayon (Phase 1 v2) - SAUF épuisés
      const lots = await Lot.find({ 
        rayonId: rayon._id,
        status: { $in: ['complet', 'partiel_vendu'] }  // 🆕 Exclure les LOTs épuisés
      }).select('_id');
      const nombreArticlesLOT = lots.length;
      
      // Nombre total d'articles = StockRayons + LOTs
      const nombreArticles = nombreArticlesSTOCK + nombreArticlesLOT;
      
      console.log(`📊 Rayon "${rayon.nomRayon}" (${rayon._id}):`);
      console.log(`   - StockRayons trouvés: ${nombreArticlesSTOCK}`);
      console.log(`   - LOTs trouvés: ${nombreArticlesLOT}`);
      console.log(`   - Total articles: ${nombreArticles}`);
      console.log(`   - StockRayons details:`);
      stocks.forEach((s, idx) => {
        const produitNom = s.produitId?.designation || 'Produit inconnu';
        const produitRef = s.produitId?.reference || 'N/A';
        console.log(`     [${idx + 1}] ${produitNom} (${produitRef}): ${s.quantiteDisponible} pièces | Type: ${s.typeStockage || 'simple'} | Statut: ${s.statut}`);
      });
      console.log(`   - rayon.quantiteActuelle AVANT SYNC: ${rayon.quantiteActuelle}`);
      
      // 2. Calculer la quantité totale (STOCK seulement, pas LOTs)
      const quantiteTotale = stocks.reduce((sum, stock) => sum + stock.quantiteDisponible, 0);
      console.log(`   - quantiteTotale (calculée): ${quantiteTotale}`);
      
      // 2️⃣.5️⃣ SYNCHRONISATION - Mettre à jour quantiteActuelle du rayon si incohérence
      // quantiteActuelle = nombre d'articles (emplacements) = StockRayons + LOTs
      if (nombreArticles !== rayon.quantiteActuelle) {
        console.log(`⚠️ [SYNC RAYON] Incohérence détectée pour rayon ${rayon.nomRayon}:`);
        console.log(`   - quantiteActuelle en DB: ${rayon.quantiteActuelle}`);
        console.log(`   - Nombre articles (StockRayons + LOTs): ${nombreArticles}`);
        rayon.quantiteActuelle = nombreArticles;  // ✅ Compter aussi les LOTs!
        await Rayon.findByIdAndUpdate(rayon._id, { quantiteActuelle: nombreArticles });
        console.log(`   ✅ Rayon mis à jour avec le nombre réel d'articles (${nombreArticles})`);
      }
      
      // 3. Calculer l'occupation (%) - basé sur NOMBRE D'ARTICLES DIFFÉRENTS
      const capaciteMax = rayon.capaciteMax || 1000;
      const occupationPourcent = Math.round((nombreArticles / capaciteMax) * 100);
      console.log(`   - occupation: ${nombreArticles}/${capaciteMax} = ${occupationPourcent}%`);
      
      // 4. Compter les alertes (produits avec quantité <= seuilAlerte)
      // Récupérer les produits avec leurs seuils d'alerte
      const produitsIds = stocks.map(s => s.produitId);
      const produits = await Produit.find({ _id: { $in: produitsIds } }).select('_id quantiteActuelle seuilAlerte');
      
      // Compter les produits avec quantité <= seuil
      const nombreAlertes = produits.filter(p => {
        const seuil = p.seuilAlerte || 10;
        return p.quantiteActuelle <= seuil;
      }).length;
      
      console.log(`   - Produits en alerte (< seuil): ${nombreAlertes}`);
      
      return {
        ...rayon,
        // STATS DU RAYON - Retourner AUSSI au niveau root pour le frontend
        occupation: occupationPourcent,  // % au niveau root
        articles: nombreArticles,  // Nombre d'articles au niveau root
        capaciteOccupee: nombreArticles,  // Pour compatibilité frontend
        alertes: nombreAlertes,  // Nombre d'alertes au niveau root
        stocks: {
          occupation: occupationPourcent,  // %
          articles: `${nombreArticles}/${capaciteMax}`,  // Nombre/Capacité
          quantiteTotale: quantiteTotale,  // Total en kg/L/etc
          alertes: `${nombreAlertes}/${nombreArticles}`,  // Alertes/Total
          capacite: capaciteMax
        }
      };
    }));

    return res.json(rayonsAvecStats);
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

    console.log('\n🚀 POST /magasins/:magasinId/rayons REÇU');
    console.log('   magasinId:', magasinId);
    console.log('   codeRayon:', codeRayon);
    console.log('   nomRayon:', nomRayon);
    console.log('   capaciteMax:', capaciteMax, `(type: ${typeof capaciteMax})`);
    console.log('   typeRayon:', typeRayon);
    console.log('   typesProduitsAutorises:', typesProduitsAutorises);

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
      ? typesProduitsAutorises.map(id => new mongoose.Types.ObjectId(id))
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
      rayon.typesProduitsAutorises = typesProduitsAutorises.map(id => new mongoose.Types.ObjectId(id));
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

// GET /api/protected/rayons/:rayonId/stocks - Obtenir les stocks d'un rayon
router.get('/magasins/:magasinId/rayons/:rayonId/stocks', authMiddleware, async (req, res) => {
  try {
    const { magasinId, rayonId } = req.params;
    const requester = req.user;

    // Vérifier l'accès au magasin
    const magasin = await Magasin.findById(magasinId);
    if (!magasin || (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Vérifier que le rayon appartient au magasin
    const rayon = await Rayon.findById(rayonId);
    if (!rayon || rayon.magasinId.toString() !== magasinId) {
      return res.status(404).json({ message: 'Rayon non trouvé dans ce magasin' });
    }

    // 🆕 PHASE 1 v2: Récupérer stocks SIMPLE et LOTs séparément avec populate
    const stocksSimple = await StockRayon.find({ 
      rayonId,
      typeStockage: { $ne: 'lot' } // Exclure les LOTs
    })
      .select('_id produitId quantiteDisponible statut typeStockage')
      .populate('produitId', 'designation reference')
      .lean();

    const stocksLot = await Lot.find({ 
      rayonId 
    })
      .select('_id produitId quantiteInitiale quantiteRestante status nombrePieces')
      .populate('produitId', 'designation reference')
      .lean();
    
    console.log(`✅ Récupéré ${stocksSimple.length} stocks SIMPLE et ${stocksLot.length} LOTs pour rayon ${rayonId}`);
    
    return res.json({
      stocksSimple,
      stocksLot
    });
  } catch (err) {
    console.error('rayons.stocks.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// ================================
// 📦 ROUTES STOCK - TYPES PRODUITS
// ================================

// GET /api/protected/magasins/:magasinId/types-produits - Lister les types de produits avec stats
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

    // Enrichir chaque type avec les stats de stock
    const typesAvecStats = await Promise.all(typesProduits.map(async (type) => {
      // 1. Obtenir tous les produits de ce type dans ce magasin
      const produits = await Produit.find({ 
        magasinId, 
        typeProduitId: type._id,
        estSupprime: false
      })
        .select('_id designation reference quantiteActuelle prixUnitaire seuilAlerte photoUrl')
        .populate({
          path: 'rayonId',
          select: 'nomRayon codeRayon'
        })
        .lean();
      
      // 2. Récupérer les alertes pour chaque produit
      const produitsAvecAlertes = await Promise.all(produits.map(async (produit) => {
        const alertes = await AlerteStock.find({
          produitId: produit._id,
          statut: 'ACTIVE'
        })
          .select('type severite message')
          .lean();
        
        return {
          ...produit,
          alertes: alertes || [],
          nombreAlertes: alertes?.length || 0
        };
      }));
      
      // 3. Calculer les stats
      const enStock = produits.reduce((sum, p) => sum + (p.quantiteActuelle || 0), 0);
      const valeurTotale = produits.reduce((sum, p) => sum + ((p.quantiteActuelle || 0) * (p.prixUnitaire || 0)), 0);
      const nombreArticles = produits.length;
      
      // 4. Compter les alertes (produits avec quantité <= seuilAlerte)
      const nombreAlertes = produits.filter(p => {
        const seuil = p.seuilAlerte || 10;
        return (p.quantiteActuelle || 0) <= seuil;
      }).length;
      
      return {
        ...type,
        // PRODUITS DU TYPE
        produits: produitsAvecAlertes,
        // STATS DU TYPE DE PRODUIT
        stats: {
          enStock: enStock.toFixed(2),      // Quantité totale en stock
          articles: nombreArticles,          // Nombre de produits différents
          alertes: nombreAlertes,            // Nombre en alerte
          valeur: valeurTotale.toFixed(2)   // Valeur totale en CDF
        }
      };
    }));

    return res.json(typesAvecStats);
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

// GET /api/protected/types-produits/:typeProduitId - Obtenir les détails d'un type de produit
router.get('/types-produits/:typeProduitId', authMiddleware, async (req, res) => {
  try {
    const { typeProduitId } = req.params;
    
    const typeProduit = await TypeProduit.findById(typeProduitId);
    if (!typeProduit) {
      return res.status(404).json({ error: 'Type produit non trouvé' });
    }
    
    res.json(typeProduit);
  } catch (err) {
    console.error('types-produits.get.error', err);
    res.status(500).json({ error: err.message });
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
      .select('_id codeRayon nomRayon typeRayon capaciteMax couleurRayon iconeRayon typesProduitsAutorises status quantiteActuelle')
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

    const produits = await Produit.find({ 
      magasinId, 
      status: 1,
      estSupprime: false  // Filtre pour ne pas afficher les produits supprimés
    })
      .populate({
        path: 'typeProduitId',
        select: 'nomType unitePrincipale code icone seuilAlerte capaciteMax typeStockage unitesVente unitePrincipaleStockage'
      })
      .populate({
        path: 'rayonId',
        select: 'nomRayon codeRayon typeRayon iconeRayon capaciteMax quantiteActuelle'
      })
      .populate({
        path: 'commandesIds',
        select: 'quantiteCommandee quantiteRecue etatPrevu statut dateEcheance',
        options: { limit: 1, sort: { dateCommande: -1 } }  // Dernière commande seulement
      })
      .sort({ designation: 1 });

    console.log(`📦 [PRODUITS LIST] Magasin ${magasinId}: ${produits.length} produits trouvés`);
    
    // Déboguer les produits qui ne seraient pas retournés
    const tousLesProduits = await Produit.find({ magasinId }).select('_id designation status estSupprime');
    const produitsSupprimesOuInactifs = tousLesProduits.filter(p => p.status !== 1 || p.estSupprime);
    if (produitsSupprimesOuInactifs.length > 0) {
      console.log(`⚠️ [PRODUITS LIST] ${produitsSupprimesOuInactifs.length} produits exclus (supprimés ou inactifs):`);
      produitsSupprimesOuInactifs.forEach(p => {
        console.log(`   - ${p.designation}: status=${p.status}, estSupprime=${p.estSupprime}`);
      });
    }

    // 🔄 SYNCHRONISATION STOCK - Recalculer quantiteActuelle depuis StockRayons + LOTs pour chaque produit
    const produitsSync = await Promise.all(
      produits.map(async (produit) => {
        // Compter les StockRayons
        const stocksActuelsProduit = await StockRayon.find({
          produitId: produit._id,
          magasinId: magasinId
        });
        const quantiteStockRayons = stocksActuelsProduit.reduce((sum, stock) => sum + stock.quantiteDisponible, 0);

        // Compter les LOTs (tous sauf épuisés)
        const lotsActuelsProduit = await Lot.find({
          produitId: produit._id,
          magasinId: magasinId,
          status: { $ne: 'epuise' }
        });
        const quantiteLots = lotsActuelsProduit.reduce((sum, lot) => sum + (lot.quantiteInitiale || 0), 0);

        // Total = StockRayons + LOTs
        const quantiteReeleProduit = quantiteStockRayons + quantiteLots;
        
        if (quantiteReeleProduit !== produit.quantiteActuelle) {
          console.log(`⚠️ [SYNC LIST] Incohérence détectée pour produit ${produit.designation}:`);
          console.log(`   - quantiteActuelle en DB: ${produit.quantiteActuelle}`);
          console.log(`   - Somme StockRayons: ${quantiteStockRayons}`);
          console.log(`   - Somme LOTs: ${quantiteLots}`);
          console.log(`   - Total: ${quantiteReeleProduit}`);
          produit.quantiteActuelle = quantiteReeleProduit;
          await produit.save();
          console.log(`   ✅ Produit mis à jour`);
        }
        
        return produit;
      })
    );

    // Pour chaque produit, récupérer ses alertes actives
    const produitsAvecAlertes = await Promise.all(
      produitsSync.map(async (produit) => {
        const alertes = await AlerteStock.find({
          produitId: produit._id,
          statut: 'ACTIVE'
        })
        .select('type severite message quantiteActuelle seuilAlerte quantiteManquante dateCreation actionRecommandee')
        .lean();

        return {
          ...produit.toObject(),
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

// ================================
// 📋 AUDIT LOGS - TRAÇABILITÉ
// ================================

// GET /api/protected/audit-logs - Lister les logs d'audit (ADMIN only)
router.get('/audit-logs', authMiddleware, blockVendeur, async (req, res) => {
  try {
    const requester = req.user;
    const { magasinId, entityType, action, dateDebut, dateFin, limit = 50, skip = 0 } = req.query;

    // Vérifier que c'est un admin
    if (requester.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé - Admin seulement' });
    }

    console.log('🔍 GET /audit-logs');

    const filters = {};
    if (magasinId) filters.magasinId = magasinId;
    if (entityType) filters.entityType = entityType;
    if (action) filters.action = action;
    if (dateDebut || dateFin) {
      filters.dateDebut = dateDebut;
      filters.dateFin = dateFin;
    }

    const result = await AuditService.getHistory(
      filters,
      parseInt(limit),
      parseInt(skip)
    );

    console.log(`✅ ${result.count} audit log(s) trouvé(s)`);

    return res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('❌ audit-logs.list.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// GET /api/protected/audit-logs/:entityType/:entityId - Historique complet d'une entité
router.get('/audit-logs/:entityType/:entityId', authMiddleware, blockVendeur, async (req, res) => {
  try {
    const requester = req.user;
    const { entityType, entityId } = req.params;

    // Vérifier que c'est un admin
    if (requester.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé - Admin seulement' });
    }

    console.log(`🔍 GET /audit-logs/${entityType}/${entityId}`);

    const result = await AuditService.getHistory(
      { entityType, entityId },
      200,
      0
    );

    console.log(`✅ ${result.count} log(s) pour ${entityType}/${entityId}`);

    return res.json({
      success: true,
      entityType,
      entityId,
      ...result
    });
  } catch (err) {
    console.error('❌ audit-logs.detail.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// GET /api/protected/magasins/:magasinId/audit-logs - Logs d'audit du magasin
router.get('/magasins/:magasinId/audit-logs', authMiddleware, async (req, res) => {
  try {
    const { magasinId } = req.params;
    const requester = req.user;
    const { action, entityType, dateDebut, dateFin, limit = 50, skip = 0 } = req.query;

    const magasin = await Magasin.findById(magasinId);
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const filters = { magasinId };
    if (action) filters.action = action;
    if (entityType) filters.entityType = entityType;
    if (dateDebut || dateFin) {
      filters.dateDebut = dateDebut;
      filters.dateFin = dateFin;
    }

    const result = await AuditService.getHistory(
      filters,
      parseInt(limit),
      parseInt(skip)
    );

    console.log(`✅ ${result.count} audit log(s) pour magasin ${magasin.nom}`);

    return res.json({
      success: true,
      magasinId,
      magasinNom: magasin.nom,
      ...result
    });
  } catch (err) {
    console.error('❌ magasins.audit-logs.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// GET /api/protected/magasins/:magasinId/produits-supprimés - Lister les produits supprimés (ADMIN only)
router.get('/magasins/:magasinId/produits-supprimes', authMiddleware, blockVendeur, async (req, res) => {
  try {
    const { magasinId } = req.params;
    const requester = req.user;

    const magasin = await Magasin.findById(magasinId);
    if (!magasin) {
      return res.status(404).json({ message: 'Magasin non trouvé' });
    }

    // Vérifier les permissions: Admin seulement
    if (requester.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé - Admin seulement' });
    }

    // Récupérer les produits supprimés
    const produitsSupprimés = await Produit.find({ 
      magasinId, 
      estSupprime: true
    })
      .populate('typeProduitId', 'nomType unitePrincipale code typeStockage')
      .populate('supprimePar', 'nom prenom email')
      .sort({ dateSuppression: -1 })
      .lean();

    console.log(`📋 ${produitsSupprimés.length} produit(s) supprimé(s) trouvé(s)`);

    return res.json({
      success: true,
      count: produitsSupprimés.length,
      produits: produitsSupprimés
    });
  } catch (err) {
    console.error('produits.list-supprimes.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// POST /api/protected/produits/:produitId/restore - Restaurer un produit supprimé (ADMIN only)
router.post('/produits/:produitId/restore', authMiddleware, blockVendeur, async (req, res) => {
  try {
    const { produitId } = req.params;
    const requester = req.user;

    // Vérifier les permissions: Admin seulement
    if (requester.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé - Admin seulement' });
    }

    const produit = await Produit.findById(produitId);
    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    if (!produit.estSupprime) {
      return res.status(400).json({ message: 'Ce produit n\'est pas supprimé' });
    }

    // Restaurer le produit
    console.log(`🔄 Restauration du produit: ${produit.designation}`);
    produit.estSupprime = false;
    produit.status = 1;
    produit.dateSuppression = null;
    produit.raison = null;
    produit.supprimePar = null;

    await produit.save();
    console.log(`✅ Produit restauré: ${produit.designation}`);

    return res.json({
      success: true,
      message: `Produit '${produit.designation}' restauré`,
      produit
    });
  } catch (err) {
    console.error('produits.restore.error', err);
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

    // ⚠️ VÉRIFIER LA CAPACITÉ DU RAYON
    const protuitsRayon = await Produit.countDocuments({ rayonId });
    if (rayon.capaciteMax && protuitsRayon >= rayon.capaciteMax) {
      return res.status(400).json({ 
        message: `❌ Rayon plein! Capacité max: ${rayon.capaciteMax} produits, actuels: ${protuitsRayon}`,
        rayonNom: rayon.nomRayon,
        capaciteMax: rayon.capaciteMax,
        articles: protuitsRayon,
        occupation: ((protuitsRayon / rayon.capaciteMax) * 100).toFixed(0) + '%'
      });
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

    // ⚡ CRÉER UN AUDIT LOG pour tracker la création
    try {
      await AuditService.log({
        action: 'CREATE_PRODUIT',
        utilisateur: {
          id: requester.id,
          nom: requester.prenom && requester.nom ? `${requester.prenom} ${requester.nom}` : requester.email,
          email: requester.email
        },
        magasin: {
          id: magasinId,
          nom: magasin.nom_magasin
        },
        entityType: 'Produit',
        entityId: produit._id,
        entityName: produit.designation,
        description: `Produit '${designation}' créé`,
        changes: {
          before: null,
          after: {
            reference: produit.reference,
            designation: produit.designation,
            prixUnitaire: produit.prixUnitaire,
            quantiteEntree: quantiteEntree || 0
          }
        },
        statut: 'SUCCESS'
      });
    } catch (auditErr) {
      console.error('⚠️ Erreur création AuditLog (non bloquant):', auditErr.message);
      // Ne pas bloquer la création du produit si l'AuditLog échoue
    }

    // ⚡ CRÉER UN STOCK RAYON pour enregistrer que ce produit est dans ce rayon
    // Le StockRayon lie un produit à un rayon spécifique
    const StockRayon = require('../models/stockRayon'); // À adapter si le modèle a un autre nom
    try {
      const stockRayon = new StockRayon({
        magasinId,
        produitId: produit._id,
        rayonId,
        quantiteDisponible: quantiteEntree || 0,
        quantiteReservee: 0,
        emplacementDetaille: '',
        dateAjout: new Date(),
        statut: 'EN_STOCK'  // ✅ CORRECT: enum valide du modèle
      });
      await stockRayon.save();
      console.log(`✅ StockRayon créé pour produit ${produit.reference} dans rayon ${rayonId}`);
    } catch (stockErr) {
      console.error('⚠️ Erreur création StockRayon (non bloquant):', stockErr.message);
      // Ne pas bloquer la création du produit si le StockRayon échoue
    }

    // ⚠️ NOTE: Le mouvement RECEPTION est créé automatiquement par le LOT créé par le frontend
    // Donc on ne crée PAS un mouvement supplémentaire ici pour éviter la duplication

    // 🎬 Créer un mouvement de stock pour tracker le stock initial
    if (quantiteEntree && quantiteEntree > 0) {
      try {
        const movement = new StockMovement({
          magasinId,
          produitId: produit._id,
          type: 'ENTREE_INITIALE',
          quantite: quantiteEntree,
          utilisateurId: requester.id,
          prixUnitaire,
          numeroDocument: `INIT-${produit._id.toString().slice(-8)}`,
          dateDocument: dateEntree || new Date(),
          observations: `Entrée initiale du produit`
        });
        await movement.save();
        console.log(`✅ Mouvement entrée initiale créé pour produit ${produit.reference}: ${quantiteEntree} unités`);
      } catch (movErr) {
        console.error('⚠️ Erreur création mouvement (non bloquant):', movErr.message);
      }
    }

    try {
      const activity = new Activity({
        utilisateurId: requester.id,
        action: 'CREER_PRODUIT',
        entite: 'Produit',
        entiteId: produit._id,
        description: `Produit '${designation}' créé`,
        icon: 'fas fa-plus'
      });
      await activity.save();
    } catch (actErr) {
      // Ignorer les erreurs d'Activity - ce n'est pas critique
      console.debug('⚠️ Activity log skipped (non critical)', actErr.message);
    }

    return res.status(201).json(produit);
  } catch (err) {
    console.error('produits.create.error', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// GET /api/protected/produits/:produitId - Récupérer un produit spécifique
// ====================================================================
// 📱 ENDPOINT MOBILE COMPLET - GET /produits/:produitId?include=...
// Pattern "INCLUDE" pour requêtes flexibles et optimisées
// ====================================================================
// Usage:
//   GET /api/protected/produits/:id                    → Données basiques
//   GET /api/protected/produits/:id?include=mouvements → Avec mouvements
//   GET /api/protected/produits/:id?include=mouvements,receptions,alertes,enregistrement
// ====================================================================
router.get('/produits/:produitId', authMiddleware, async (req, res) => {
  try {
    const { produitId } = req.params;
    const { include = '' } = req.query; // "mouvements,receptions,alertes,ventes,enregistrement"
    const requester = req.user;

    // Parse les includes demandés
    const includes = include
      .split(',')
      .map(i => i.trim())
      .filter(Boolean)
      .map(i => i.toLowerCase());

    // 1️⃣ RÉCUPÉRER LE PRODUIT - Base (avec tous les champs y compris champsDynamiques)
    let query = Produit.findById(produitId)
      .populate('magasinId', '_id nomMagasin')
      .populate({
        path: 'typeProduitId',
        select: '_id nomType unitePrincipale unitePrincipaleStockage typeStockage capaciteMax'
      })
      .populate({
        path: 'rayonId',
        select: '_id nomRayon codeRayon typeRayon capaciteMax quantiteActuelle iconeRayon description'
      });

    const produit = await query;

    if (!produit) {
      return res.status(404).json({ success: false, error: 'Produit non trouvé' });
    }

    // 2️⃣ VÉRIFIER L'ACCÈS
    const magasin = await Magasin.findById(produit.magasinId._id);
    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ success: false, error: 'Accès refusé' });
    }

    // 2️⃣.5️⃣ SYNCHRONISATION STOCK - Recalculer quantiteActuelle depuis StockRayons + LOTs (Phase 1 v2)
    const stocksActuelsProduit = await StockRayon.find({
      produitId: produitId,
      magasinId: produit.magasinId._id
    });
    
    // Calculer quantité totale: StockRayons + LOTs
    const quantiteStockRayons = stocksActuelsProduit.reduce((sum, stock) => sum + stock.quantiteDisponible, 0);
    
    // Compter aussi les LOTs pour ce produit (Phase 1 v2)
    const lotsTotal = await Lot.aggregate([
      {
        $match: {
          produitId: new mongoose.Types.ObjectId(produitId),
          magasinId: new mongoose.Types.ObjectId(produit.magasinId._id)
        }
      },
      {
        $group: {
          _id: '$produitId',
          totalQuantite: { $sum: '$quantiteInitiale' }
        }
      }
    ]);
    const quantiteLots = (lotsTotal[0]?.totalQuantite || 0);
    
    const quantiteReeleProduit = quantiteStockRayons + quantiteLots;  // StockRayons + LOTs
    
    if (quantiteReeleProduit !== produit.quantiteActuelle) {
      console.log(`⚠️ [SYNC] Incohérence détectée pour produit ${produit.designation}:`);
      console.log(`   - quantiteActuelle en DB: ${produit.quantiteActuelle}`);
      console.log(`   - Somme StockRayons: ${quantiteStockRayons}`);
      console.log(`   - Somme LOTs: ${quantiteLots}`);
      console.log(`   - Total réel: ${quantiteReeleProduit}`);
      produit.quantiteActuelle = quantiteReeleProduit;
      await produit.save();
      console.log(`   ✅ Produit mis à jour avec la quantité réelle (${quantiteReeleProduit})`);
    }

    // 3️⃣ CONSTRUCTION DE LA RÉPONSE ENRICHIE
    const response = produit.toObject();

    // 📦 AJOUTER LES DONNÉES OPTIONNELLES SELON "INCLUDE"

    // 🔴 ALERTES EN TEMPS RÉEL
    if (includes.includes('alertes')) {
      const alerteStock = produit.quantiteActuelle <= (produit.seuilAlerte || 10);
      const alertePeremption = false; // À implémenter si vous avez datePeremption
      const alerteRupture = produit.quantiteActuelle <= 0;

      response.alertes = {
        stockBas: alerteStock,
        rupture: alerteRupture,
        peremption: alertePeremption,
        niveau: alerteRupture ? 'critique' : alerteStock ? 'warning' : 'ok'
      };
    }

    // 📊 STATS DE STOCK CALCULÉES
    response.stockStats = {
      quantiteActuelle: produit.quantiteActuelle,
      seuilAlerte: produit.seuilAlerte || 10,
      valeurEnStock: (produit.quantiteActuelle || 0) * (produit.prixUnitaire || 0),
      tauxOccupation: produit.typeProduitsId?.capaciteMax
        ? ((produit.quantiteActuelle || 0) / produit.typeProduitsId.capaciteMax) * 100
        : 0
    };

    // 📈 MOUVEMENTS DE STOCK
    if (includes.includes('mouvements')) {
      const mouvements = await StockMovement.find({ produitId: produitId })
        .populate('utilisateurId', 'prenom nom email')
        .select('dateDocument type quantite observations utilisateurId prixUnitaire numeroDocument fournisseur')
        .sort({ dateDocument: -1 })
        .limit(50);

      response.mouvements = mouvements;
    }

    // 📬 RÉCEPTIONS (Historique des entrées)
    if (includes.includes('receptions')) {
      const receptions = await Reception.find({ produitId: produitId })
        .populate('utilisateurId', 'prenom nom email')
        .populate('rayonId', 'nomRayon codeRayon')
        .select(
          'dateReception quantite fournisseur prixAchat prixTotal photoUrl ' +
          'dateFabrication datePeremption lotNumber statut utilisateurId rayonId createdAt updatedAt ' +
          'nombrePieces quantiteParPiece uniteDetail prixParUnite'
        )
        .sort({ dateReception: -1 })
        .limit(20);

      console.log(`📬 Receptions trouvées: ${receptions.length}`);
      receptions.forEach((r, idx) => {
        console.log(`   Reception ${idx}: nombrePieces=${r.nombrePieces}, quantiteParPiece=${r.quantiteParPiece}, uniteDetail=${r.uniteDetail}, prixParUnite=${r.prixParUnite}`);
      });

      // 🎁 Pour chaque réception LOT, chercher les lots associés
      const receptionsWithLots = await Promise.all(receptions.map(async (reception) => {
        const receptionObj = reception.toObject();
        
        // Si c'est une réception LOT (nombrePieces > 0), charger les lots
        if (receptionObj.nombrePieces && receptionObj.nombrePieces > 0) {
          try {
            const lots = await Lot.find({ receptionId: reception._id })
              .select('quantiteInitiale quantiteRestante prixParUnite uniteDetail statut')
              .limit(100);
            
            console.log(`🎁 ${lots.length} lots trouvés pour réception ${reception._id}`);
            receptionObj.lots = lots;
          } catch (lotsErr) {
            console.warn(`⚠️ Erreur chargement lots pour réception ${reception._id}:`, lotsErr.message);
            receptionObj.lots = [];
          }
        } else {
          receptionObj.lots = [];
        }
        
        return receptionObj;
      }));

      response.receptions = receptionsWithLots;
    }

    // 🛍️ VENTES (À implémenter quand module vente existera)
    if (includes.includes('ventes')) {
      // Placeholder pour futures ventes
      response.ventes = [];
    }

    // 📋 AUDIT / ENREGISTREMENT avec ACTIVITY LOGS
    if (includes.includes('enregistrement')) {
      // Récupérer l'historique d'audit depuis auditLog (triée par date)
      let auditLogs = [];
      try {
        auditLogs = await AuditLog.find({ 
          entityId: produitId, 
          entityType: 'Produit' 
        })
          .populate('utilisateurId', 'prenom nom email')
          .sort({ createdAt: -1 })
          .limit(50);
        
        console.log(`🔍 [AUDIT] Audit logs trouvés pour produit ${produitId}:`, auditLogs.length);
        if (auditLogs.length > 0) {
          console.log(`   - Plus ancien log:`, auditLogs[auditLogs.length - 1]);
          console.log(`   - Plus récent log:`, auditLogs[0]);
        }
      } catch (auditErr) {
        console.warn('⚠️ Erreur récupération audit logs:', auditErr);
      }

      let createdByUser = null;
      let updatedByUser = null;
      let createdAtDate = produit.createdAt;
      let updatedAtDate = produit.updatedAt;

      // ✅ Le plus ancien log = création
      if (auditLogs.length > 0) {
        const oldestLog = auditLogs[auditLogs.length - 1];
        console.log(`📝 [AUDIT] oldestLog.utilisateurId:`, oldestLog.utilisateurId);
        if (oldestLog.utilisateurId && (oldestLog.utilisateurId.prenom || oldestLog.utilisateurId.nom)) {
          createdByUser = oldestLog.utilisateurId;
          createdAtDate = oldestLog.createdAt || produit.createdAt;
          console.log(`✅ [AUDIT] createdByUser assigné:`, createdByUser);
        } else {
          console.log(`⚠️ [AUDIT] oldestLog.utilisateurId invalide ou vide`);
        }
      }

      // ✅ Le plus récent log = dernière modification
      if (auditLogs.length > 0) {
        const newestLog = auditLogs[0];
        console.log(`📝 [AUDIT] newestLog.utilisateurId:`, newestLog.utilisateurId);
        if (newestLog.utilisateurId && (newestLog.utilisateurId.prenom || newestLog.utilisateurId.nom)) {
          updatedByUser = newestLog.utilisateurId;
          updatedAtDate = newestLog.createdAt || produit.updatedAt;
          console.log(`✅ [AUDIT] updatedByUser assigné:`, updatedByUser);
        } else {
          console.log(`⚠️ [AUDIT] newestLog.utilisateurId invalide ou vide`);
        }
      }

      // Si pas de logs d'audit, utiliser les informations de création du produit
      if (!createdByUser) {
        console.log(`⚠️ [AUDIT] Pas de createdByUser, utilisant Système Automatique`);
        createdByUser = { prenom: 'Système', nom: 'Automatique' };
      }

      if (!updatedByUser) {
        console.log(`⚠️ [AUDIT] Pas de updatedByUser, utilisant createdByUser comme fallback`);
        updatedByUser = createdByUser; // Par défaut, même utilisateur
      }

      response.audit = {
        createdAt: createdAtDate,
        updatedAt: updatedAtDate,
        createdBy: createdByUser,
        updatedBy: updatedByUser,
        logs: auditLogs.map(log => ({
          action: log.action,
          utilisateur: log.utilisateurId,
          description: log.description,
          createdAt: log.createdAt,
          changes: log.changes
        }))
      };
    }

    // 4️⃣ ENRICHISSEMENT SUPPLÉMENTAIRE - Toujours inclus
    response.statusLabel = 
      produit.quantiteActuelle <= 0 ? 'Rupture' :
      produit.quantiteActuelle <= (produit.seuilAlerte || 10) ? 'Stock faible' : 'En stock';

    response.statusColor =
      produit.quantiteActuelle <= 0 ? 'danger' :
      produit.quantiteActuelle <= (produit.seuilAlerte || 10) ? 'warning' : 'success';

    return res.json({
      success: true,
      data: response,
      included: includes
    });

  } catch (err) {
    console.error('❌ GET /produits/:produitId - error:', err);
    return res.status(500).json({
      success: false,
      error: 'Erreur: ' + err.message
    });
  }
});

// GET /api/protected/produits/:produitId/stocks - Récupérer les stocks d'un produit
router.get('/produits/:produitId/stocks', authMiddleware, async (req, res) => {
  try {
    const { produitId } = req.params;
    const requester = req.user;

    // 1. Vérifier que le produit existe
    const produit = await Produit.findById(produitId);
    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // 2. Vérifier l'accès
    const magasin = await Magasin.findById(produit.magasinId);
    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // 3. Récupérer les stocks
    const stocks = await StockRayon.find({ produitId: produitId })
      .populate('rayonId', '_id nomRayon')
      .populate('magasinId', '_id nomMagasin');

    return res.json(stocks);
  } catch (err) {
    console.error('❌ GET /produits/:produitId/stocks - error:', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// PUT /api/protected/produits/:produitId - Modifier un produit avec audit trail
router.put('/produits/:produitId', authMiddleware, async (req, res) => {
  try {
    const { produitId } = req.params;
    const requester = req.user;
    const { designation, prixUnitaire, etat, seuilAlerte, notes, photoUrl, reference, typeProduitId, rayonId } = req.body;

    // 1. Trouver le produit
    const produit = await Produit.findById(produitId).lean();
    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // 2. Vérifier l'accès
    const magasin = await Magasin.findById(produit.magasinId);
    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // 3. Préparer les changements
    const changements = {};
    const anciennesProprietes = {};
    const nouvellesProprietes = {};

    if (designation !== undefined && designation !== produit.designation) {
      changements.designation = designation;
      anciennesProprietes.designation = produit.designation;
      nouvellesProprietes.designation = designation;
    }

    if (reference !== undefined && reference !== produit.reference) {
      changements.reference = reference;
      anciennesProprietes.reference = produit.reference;
      nouvellesProprietes.reference = reference;
    }

    if (prixUnitaire !== undefined && prixUnitaire !== produit.prixUnitaire) {
      changements.prixUnitaire = prixUnitaire;
      anciennesProprietes.prixUnitaire = produit.prixUnitaire;
      nouvellesProprietes.prixUnitaire = prixUnitaire;
    }

    if (etat !== undefined && etat !== produit.etat) {
      changements.etat = etat;
      anciennesProprietes.etat = produit.etat;
      nouvellesProprietes.etat = etat;
    }

    if (seuilAlerte !== undefined && seuilAlerte !== produit.seuilAlerte) {
      changements.seuilAlerte = seuilAlerte;
      anciennesProprietes.seuilAlerte = produit.seuilAlerte;
      nouvellesProprietes.seuilAlerte = seuilAlerte;
    }

    if (notes !== undefined && notes !== produit.notes) {
      changements.notes = notes;
      anciennesProprietes.notes = produit.notes;
      nouvellesProprietes.notes = notes;
    }

    if (photoUrl !== undefined && photoUrl !== produit.photoUrl) {
      changements.photoUrl = photoUrl;
      anciennesProprietes.photoUrl = produit.photoUrl;
      nouvellesProprietes.photoUrl = photoUrl;
    }

    if (typeProduitId !== undefined && typeProduitId !== produit.typeProduitId?.toString()) {
      changements.typeProduitId = typeProduitId;
      anciennesProprietes.typeProduitId = produit.typeProduitId;
      nouvellesProprietes.typeProduitId = typeProduitId;
    }

    if (rayonId !== undefined && rayonId !== produit.rayonId?.toString()) {
      changements.rayonId = rayonId || null;
      anciennesProprietes.rayonId = produit.rayonId;
      nouvellesProprietes.rayonId = rayonId || null;
    }

    // 4. Appliquer les changements
    const produitUpdated = await Produit.findByIdAndUpdate(
      produitId,
      changements,
      { new: true, runValidators: true }
    );

    // 5. Créer AuditLog seulement s'il y a eu changements
    if (Object.keys(changements).length > 0) {
      AuditService.log({
        action: 'UPDATE_PRODUIT',
        userId: requester.id,
        utilisateurNom: `${requester.prenom} ${requester.nom}`,
        utilisateurEmail: requester.email,
        magasinId: produit.magasinId,
        entityType: 'Produit',
        entityId: produitId,
        description: `Produit '${designation || produit.designation}' modifié`,
        before: anciennesProprietes,
        after: nouvellesProprietes,
        statut: 'success'
      });
    }

    // 6. Activity log (non-bloquant)
    try {
      const activity = new Activity({
        utilisateurId: requester.id,
        action: 'MODIFIER_PRODUIT',
        entite: 'Produit',
        entiteId: produitId,
        description: `Produit '${designation || produit.designation}' modifié`,
        icon: 'fas fa-edit'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    console.log(`✅ PUT /produits/${produitId} - Modifié par ${requester.email} - Changements: ${Object.keys(changements).join(', ')}`);

    return res.json({
      message: 'Produit modifié avec succès',
      produit: produitUpdated,
      changements: changements
    });
  } catch (err) {
    console.error('❌ PUT /produits/:produitId - error:', err);
    return res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});

// DELETE /api/protected/produits/:produitId - Soft delete un produit avec nettoyage des stocks
router.delete('/produits/:produitId', authMiddleware, async (req, res) => {
  try {
    const { produitId } = req.params;
    const requester = req.user;
    const { raison } = req.body; // Raison de suppression (optionnel)

    console.log('\n🗑️ === DELETE PRODUIT COMMENCÉ ===');
    console.log(`   produitId: ${produitId}`);
    console.log(`   Utilisateur: ${requester.id} (${requester.role})`);

    // Vérifier que le produit existe
    const produit = await Produit.findById(produitId);
    if (!produit) {
      console.error('❌ Produit non trouvé');
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    console.log(`✅ Produit trouvé: ${produit.designation}`);

    // Vérifier les permissions
    const magasin = await Magasin.findById(produit.magasinId);
    if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
      console.error('❌ Accès refusé');
      return res.status(403).json({ message: 'Accès refusé' });
    }

    console.log('✅ Permissions vérifiées');

    // ⚠️ ÉTAPE 1: Supprimer tous les StockRayons associés à ce produit
    console.log('🔍 Suppression des StockRayons...');
    const stockRayonsDeleteResult = await StockRayon.deleteMany({ produitId });
    console.log(`✅ ${stockRayonsDeleteResult.deletedCount} StockRayon(s) supprimés`);

    // ⚠️ ÉTAPE 1B: Supprimer tous les LOTs associés à ce produit ET décrémenter les rayons
    console.log('🔍 Suppression des LOTs et mise à jour des rayons...');
    const lotsASupprimer = await Lot.find({ produitId });
    console.log(`📦 ${lotsASupprimer.length} LOT(s) à supprimer`);
    
    // Décrémenter quantiteActuelle des rayons concernés
    for (const lot of lotsASupprimer) {
      if (lot.rayonId) {
        try {
          const rayon = await Rayon.findById(lot.rayonId);
          if (rayon && rayon.quantiteActuelle > 0) {
            rayon.quantiteActuelle -= 1;  // Chaque LOT = 1 emplacement
            await rayon.save();
            console.log(`   ✅ Rayon ${rayon.nomRayon}: quantiteActuelle = ${rayon.quantiteActuelle}`);
          }
        } catch (rayonErr) {
          console.error(`   ⚠️ Erreur mise à jour rayon ${lot.rayonId}:`, rayonErr.message);
        }
      }
    }
    
    const lotsDeleteResult = await Lot.deleteMany({ produitId });
    console.log(`✅ ${lotsDeleteResult.deletedCount} LOT(s) supprimé(s)`);

    // ⚠️ ÉTAPE 2: Supprimer ou archiver les réceptions associées
    console.log('🔍 Suppression des réceptions...');
    const receptionsDeleteResult = await Reception.deleteMany({ produitId });
    console.log(`✅ ${receptionsDeleteResult.deletedCount} Réception(s) supprimée(s)`);

    // ⚠️ ÉTAPE 3: Supprimer les mouvements de stock associés
    console.log('🔍 Suppression des mouvements de stock...');
    const movementsDeleteResult = await StockMovement.deleteMany({ produitId });
    console.log(`✅ ${movementsDeleteResult.deletedCount} Mouvement(s) supprimé(s)`);

    // ⚠️ ÉTAPE 4: SUPPRIMER définitivement le produit de la base de données
    console.log('🔍 Suppression définitive du produit de la base de données...');
    const produitDeleteResult = await Produit.deleteOne({ _id: produitId });
    console.log(`✅ Produit supprimé définitivement de la BD`);

    // ⚠️ ÉTAPE 5: Log d'audit COMPLET via AuditService
    await AuditService.log({
      action: 'DELETE_PRODUIT',
      utilisateur: {
        id: requester.id,
        nom: requester.nom + ' ' + requester.prenom,
        email: requester.email
      },
      magasin: {
        id: magasin._id,
        nom: magasin.nom
      },
      entityType: 'Produit',
      entityId: produitId,
      entityName: produit.designation,
      description: `Produit '${produit.designation}' supprimé définitivement`,
      raison: raison || 'Suppression standard',
      changes: {
        before: {
          reference: produit.reference,
          designation: produit.designation,
          quantiteActuelle: produit.quantiteActuelle
        },
        after: null
      },
      statut: 'SUCCESS'
    });

    console.log('✅ AuditLog créé');

    console.log('✅ === DELETE PRODUIT COMPLÉTÉ ===\n');

    return res.json({
      success: true,
      message: `Produit '${produit.designation}' supprimé avec succès`,
      suppression: {
        produitId: produitId,
        designation: produit.designation,
        stockRayonsSupprimés: stockRayonsDeleteResult.deletedCount,
        receptionsSupprimées: receptionsDeleteResult.deletedCount,
        mouvementsSupprimés: movementsDeleteResult.deletedCount,
        raison: raison || 'Suppression standard'
      }
    });
  } catch (err) {
    console.error('❌ produits.delete.error', err);
    return res.status(500).json({
      message: 'Erreur lors de la suppression du produit',
      error: err.message
    });
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

// POST /api/protected/lots - Créer un LOT individuel (pour système SIMPLE/LOT)
router.post('/lots', authMiddleware, checkMagasinAccess, async (req, res) => {
  try {
    const requester = req.user;
    const {
      magasinId,
      produitId,
      typeProduitId,
      receptionId,
      unitePrincipale,
      quantiteInitiale,
      uniteDetail,
      prixParUnite,
      rayonId,
      dateReception
    } = req.body;

    // Validation des champs requis
    if (!magasinId || !produitId || !quantiteInitiale || !uniteDetail) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

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

    // Créer le LOT
    const lot = new Lot({
      magasinId,
      produitId,
      typeProduitId,
      receptionId,
      unitePrincipale,
      quantiteInitiale,
      quantiteRestante: quantiteInitiale,
      uniteDetail,
      prixParUnite: prixParUnite || 0,
      prixTotal: (prixParUnite || 0) * quantiteInitiale,
      rayonId,
      dateReception: dateReception || new Date(),
      peutEtreVendu: true
    });

    await lot.save();

    // 🎁 METTRE À JOUR LA CAPACITÉ DU RAYON
    // Chaque LOT créé = 1 emplacement occupé
    if (rayonId) {
      try {
        const rayon = await Rayon.findById(rayonId);
        if (rayon) {
          // ⚠️ VÉRIFIER LA CAPACITÉ AVANT D'AJOUTER
          const nouvelleCapacite = (rayon.quantiteActuelle || 0) + 1;
          if (nouvelleCapacite > rayon.capaciteMax) {
            // BLOQUER - rayon plein!
            return res.status(400).json({ 
              success: false,
              message: `❌ Rayon plein! Capacité: ${rayon.capaciteMax}, Articles actuels: ${rayon.quantiteActuelle}`,
              capaciteMax: rayon.capaciteMax,
              capaciteActuelle: rayon.quantiteActuelle
            });
          }
          
          rayon.quantiteActuelle = nouvelleCapacite;
          await rayon.save();
          console.log(`✅ Rayon mis à jour: ${rayon.nomRayon} (${rayon.quantiteActuelle}/${rayon.capaciteMax})`);
        }
      } catch (rayonErr) {
        console.error('⚠️ Erreur mise à jour rayon:', rayonErr);
        // Ne pas bloquer - le LOT est créé même si rayon non mis à jour
      }
    }

    // 🎁 METTRE À JOUR LA QUANTITÉ DU PRODUIT
    // Recalculer la quantité totale du produit à partir des LOTs
    try {
      const lotsTotal = await Lot.aggregate([
        {
          $match: {
            produitId: new mongoose.Types.ObjectId(produitId),
            magasinId: new mongoose.Types.ObjectId(magasinId)
          }
        },
        {
          $group: {
            _id: '$produitId',
            totalQuantite: { $sum: '$quantiteInitiale' }
          }
        }
      ]);

      const nouvelleQuantiteActuelle = (lotsTotal[0]?.totalQuantite || 0);
      produit.quantiteActuelle = nouvelleQuantiteActuelle;
      produit.quantiteEntree = (produit.quantiteEntree || 0) + quantiteInitiale;
      produit.dateLastMovement = new Date();
      
      if (!produit.rayonId) {
        produit.rayonId = rayonId;
      }
      
      await produit.save();
      console.log(`✅ Produit "${produit.designation}" mis à jour:`);
      console.log(`   - quantiteActuelle: ${nouvelleQuantiteActuelle}`);
      console.log(`   - quantiteEntree: ${produit.quantiteEntree}`);
    } catch (prodErr) {
      console.error('⚠️ Erreur mise à jour produit:', prodErr);
      // Ne pas bloquer - le LOT est créé même si produit non mis à jour
    }

    // Log activity
    try {
      const magasin = await Magasin.findById(magasinId);
      const activity = new Activity({
        title: `Création LOT - ${uniteDetail}`,
        businessId: magasin?.businessId,
        utilisateurId: requester.id,
        action: 'CREER_LOT_SIMPLE_LOT',
        entite: 'Lot',
        entiteId: lot._id,
        description: `LOT '${uniteDetail}' créé: ${quantiteInitiale} ${unitePrincipale} @ ${prixParUnite}/${uniteDetail}`,
        icon: 'fas fa-box'
      });
      await activity.save();
    } catch (actErr) {
      console.error('activity.save.error', actErr);
    }

    console.log('✅ LOT créé:', lot._id);
    return res.status(201).json(lot);
  } catch (err) {
    console.error('lots.create.error', err);
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
      .select('_id nomType code unitePrincipale unitePrincipaleStockage typeStockage unitesVente icone couleur seuilAlerte capaciteMax photoRequise champsSupplementaires status createdAt updatedAt')
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
      seuilAlerte, capaciteMax, photoRequise, champsSupplementaires,
      typeStockage, unitePrincipaleStockage, unitesVente
    } = req.body;

    // Validation - utiliser les noms du modèle
    if (!nomType || !code || !icone) {
      return res.status(400).json({ error: 'Champs obligatoires: nomType, code, icone' });
    }

    // Validation de l'unité principale (peut être unitePrincipale ou unitePrincipaleStockage)
    const finalUnitePrincipale = unitePrincipaleStockage || unitePrincipale;
    if (!finalUnitePrincipale) {
      return res.status(400).json({ error: 'Champs obligatoires: Unité Principale' });
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
      unitePrincipale: finalUnitePrincipale,
      unitePrincipaleStockage: finalUnitePrincipale,
      typeStockage: typeStockage || 'simple',
      unitesVente: unitesVente || [],
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
      seuilAlerte, capaciteMax, photoRequise, champsSupplementaires,
      typeStockage, unitePrincipaleStockage, unitesVente
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
    const finalUnitePrincipale = unitePrincipaleStockage || unitePrincipale;
    if (finalUnitePrincipale) {
      category.unitePrincipale = finalUnitePrincipale;
      category.unitePrincipaleStockage = finalUnitePrincipale;
    }
    if (icone) category.icone = icone;
    if (couleur) category.couleur = couleur;
    if (seuilAlerte !== undefined) category.seuilAlerte = seuilAlerte;
    if (capaciteMax !== undefined) category.capaciteMax = capaciteMax;
    if (photoRequise !== undefined) category.photoRequise = photoRequise;
    if (champsSupplementaires) category.champsSupplementaires = champsSupplementaires;
    if (typeStockage) category.typeStockage = typeStockage;
    if (unitesVente) category.unitesVente = unitesVente;

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
    console.log('\n\n🚀🚀🚀 === DÉBUT POST /RECEPTIONS ===');
    
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
      garantie,
      typeProduitId,        // ← NOUVEAU: requis pour Phase 1 v2
      // 🎁 LOT fields
      nombrePieces,
      quantiteParPiece,
      uniteDetail,
      prixParUnite
    } = req.body;

    // Log les données reçues
    console.log('📥 POST /receptions reçues:', {
      produitId: produitId || 'MISSING',
      magasinId: magasinId || 'MISSING',
      rayonId: rayonId || 'MISSING',
      quantite: quantite || 'MISSING',
      prixAchat: prixAchat || 'MISSING',
      typeProduitId: typeProduitId || 'MISSING'  // ← NOUVEAU
    });

    // Validation des champs requis
    if (!produitId || !magasinId || !rayonId || !quantite || !typeProduitId || prixAchat === null || prixAchat === undefined) {
      console.error('❌ Champs manquants - ARRÊT');
      return res.status(400).json({
        error: 'Champs requis manquants (produitId, magasinId, rayonId, quantite, typeProduitId, prixAchat)',
        received: { produitId, magasinId, rayonId, quantite, prixAchat, typeProduitId }
      });
    }
    console.log('✅ Tous les champs requis présents');

    // Vérifier que la quantité est valide
    if (quantite <= 0) {
      console.error('❌ Quantité invalide - ARRÊT');
      return res.status(400).json({ error: 'Quantité doit être > 0' });
    }
    console.log('✅ Quantité valide:', quantite);

    // Vérifier que le produit existe et qu'il n'est pas supprimé
    const produit = await Produit.findById(produitId);
    if (!produit || produit.estSupprime) {
      console.error('❌ Produit non trouvé ou supprimé - ARRÊT');
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    console.log('✅ Produit trouvé:', produit.designation);

    // Vérifier que le magasin existe
    const magasin = await Magasin.findById(magasinId);
    if (!magasin || magasin.estSupprime) {
      console.error('❌ Magasin non trouvé ou supprimé - ARRÊT');
      return res.status(404).json({ error: 'Magasin non trouvé' });
    }
    console.log('✅ Magasin trouvé:', magasin.nom);

    // Vérifier que le rayon existe
    const rayon = await Rayon.findById(rayonId)
      .populate('typesProduitsAutorises', 'nomType');
    if (!rayon || rayon.estSupprime) {
      console.error('❌ Rayon non trouvé ou supprimé - ARRÊT');
      return res.status(404).json({ error: 'Rayon non trouvé' });
    }
    console.log('✅ Rayon trouvé:', rayon.nomRayon);

    // ⚠️ VALIDATION: Vérifier si le type de produit est autorisé dans ce rayon
    console.log('🔍 VALIDATION 1: Type produit autorisé?');
    console.log(`   typesProduitsAutorises: ${rayon.typesProduitsAutorises ? rayon.typesProduitsAutorises.length + ' types' : 'NONE'}`);
    
    if (rayon.typesProduitsAutorises && rayon.typesProduitsAutorises.length > 0) {
      const typeProduitsIds = rayon.typesProduitsAutorises.map(t => t._id.toString());
      const produitTypeId = produit.typeProduitId.toString();
      
      console.log(`   typeProduitsIds autorisés: [${typeProduitsIds.join(', ')}]`);
      console.log(`   produitTypeId: ${produitTypeId}`);
      
      if (!typeProduitsIds.includes(produitTypeId)) {
        const typesNoms = rayon.typesProduitsAutorises.map(t => t.nomType).join(', ');
        console.error(`❌ VALIDATION 1 ÉCHOUÉE - Type produit non autorisé - ARRÊT`);
        return res.status(400).json({
          error: `❌ Type produit non autorisé dans ce rayon`,
          details: `Ce rayon n'accepte que: ${typesNoms}`,
          typeProduitsAutorisés: typesNoms
        });
      }
      console.log(`✅ VALIDATION 1 OK - Type produit autorisé`);
    } else {
      console.log(`✅ VALIDATION 1 OK - Pas de restriction de types`);
    }

    // ⚠️ VALIDATION 2: Vérifier la capacité TOTALE du rayon (nombre d'articles ET quantité totale)
    // ⚠️ IMPORTANT: Pour LOTs, nombrePieces = nombre de LOTs à créer = nombre d'emplacements à réserver
    console.log('🔍 VALIDATION 2: Capacité rayon?');
    const allStocksInRayon = await StockRayon.find({
      rayonId,
      magasinId,
      statut: { $ne: 'VIDE' }  // 🆕 Exclure les emplacements vides
    });
    
    // Compter aussi les LOTs (chaque LOT = 1 article/emplacement)
    const allLotsInRayon = await Lot.find({
      rayonId,
      magasinId,
      status: { $ne: 'epuise' }  // Compter que les LOTs actifs
    });
    
    // Vérifier DEUX choses:
    // 1. Nombre d'articles (produits différents)
    // 2. Quantité totale en fonction de la capacité du type
    
    // 🎁 IMPORTANT: Pour LOT, ajouter "nombrePieces" articles (chaque pièce = 1 LOT = 1 emplacement)
    // Pour SIMPLE, ajouter 1 article
    const articlesAjouter = typeProduitId.typeStockage === 'lot' ? (nombrePieces || 1) : 1;
    
    const produitExisteEnRayon = allStocksInRayon.some(stock => stock.produitId.toString() === produitId);
    const nombreArticlesActuel = allStocksInRayon.length + allLotsInRayon.length;  // StockRayons + LOTs
    
    // 🎁 IMPORTANT LOGIC:
    // - SIMPLE + produit existe = CONSOLIDATION = pas d'article supplémentaire
    // - SIMPLE + produit n'existe pas = NOUVEAU = +1 article
    // - LOT = toujours +nombrePieces articles (chaque LOT = emplacement)
    const nombreArticlesApreAjout = 
      (typeProduitId.typeStockage === 'simple' && produitExisteEnRayon)
        ? nombreArticlesActuel  // Consolidation = même nombre d'articles
        : nombreArticlesActuel + articlesAjouter;  // Nouveau ou LOT
    
    console.log(`   StockRayons dans ce rayon: ${allStocksInRayon.length}`);
    console.log(`   LOTs dans ce rayon: ${allLotsInRayon.length}`);
    console.log(`   Produit existe déjà en rayon?: ${produitExisteEnRayon}`);
    console.log(`   Nombre d'articles actuels: ${nombreArticlesActuel}`);
    console.log(`   Articles à ajouter: ${articlesAjouter}`);
    console.log(`   Nombre d'articles après ajout: ${nombreArticlesApreAjout}`);
    console.log(`   Capacité max rayon (en articles): ${rayon.capaciteMax}`);
    
    // Vérifier la capacité EN NOMBRE D'ARTICLES
    if (nombreArticlesApreAjout > rayon.capaciteMax) {
      console.error(`❌ VALIDATION 2a ÉCHOUÉE - Trop d'articles différents dans le rayon`);
      return res.status(400).json({
        error: '❌ Capacité du rayon dépassée (nombre d\'articles)',
        details: `Rayon peut contenir max ${rayon.capaciteMax} articles, actuels: ${nombreArticlesActuel}, après ajout: ${nombreArticlesApreAjout}`,
        capaciteRayonArticles: rayon.capaciteMax,
        articlesActuels: nombreArticlesActuel,
        articlesApreAjout: nombreArticlesApreAjout
      });
    }
    
    // ⚡ NOUVEAU: Vérifier la capacité EN QUANTITÉ TOTALE
    // Capacité totale = nombre d'emplacements × capacité par type produit
    const typeProduitForCapacity = await TypeProduit.findById(produit.typeProduitId);
    if (typeProduitForCapacity && typeProduitForCapacity.capaciteMax) {
      const capaciteTotalRayon = rayon.capaciteMax * typeProduitForCapacity.capaciteMax;
      // ⚡ CORRECTION: Utiliser quantiteDisponible (pas quantite)
      const quantiteTotalActuelle = allStocksInRayon.reduce((sum, sr) => sum + (sr.quantiteDisponible || 0), 0);
      const quantiteTotalApreAjout = quantiteTotalActuelle + parseFloat(quantite);
      
      console.log(`   Capacité totale rayon: ${rayon.capaciteMax} × ${typeProduitForCapacity.capaciteMax} = ${capaciteTotalRayon} ${typeProduitForCapacity.unitePrincipale}`);
      console.log(`   Quantité totale actuelle: ${quantiteTotalActuelle}`);
      console.log(`   Quantité à ajouter: ${quantite}`);
      console.log(`   Quantité totale après: ${quantiteTotalApreAjout}`);
      
      if (quantiteTotalApreAjout > capaciteTotalRayon) {
        console.error(`❌ VALIDATION 2b ÉCHOUÉE - Capacité totale en quantité dépassée`);
        return res.status(400).json({
          error: '❌ Capacité du rayon dépassée (quantité totale)',
          details: `Rayon peut contenir max ${capaciteTotalRayon} ${typeProduitForCapacity.unitePrincipale}, actuels: ${quantiteTotalActuelle}, après ajout: ${quantiteTotalApreAjout}`,
          capaciteTotalRayon: capaciteTotalRayon,
          quantiteTotalActuelle: quantiteTotalActuelle,
          quantiteTotalApreAjout: quantiteTotalApreAjout
        });
      }
      console.log(`✅ VALIDATION 2 OK - Capacité rayon respectée (articles ET quantité)`);
    } else {
      console.log(`✅ VALIDATION 2 OK - Capacité rayon respectée (articles uniquement)`);
    }

    // 🔄 SYNCHRONISATION: Recalculer quantiteActuelle du produit avant validation
    console.log('🔄 SYNCHRONISATION: Recalcul quantiteActuelle produit');
    const stocksActuelsProduit = await StockRayon.find({
      produitId,
      magasinId
    });
    
    const quantiteRealeProduit = stocksActuelsProduit.reduce((sum, stock) => sum + stock.quantiteDisponible, 0);
    console.log(`   Quantité réelle trouvée en StockRayons: ${quantiteRealeProduit}`);
    console.log(`   Quantité dans Produit.quantiteActuelle: ${produit.quantiteActuelle || 0}`);
    
    if (quantiteRealeProduit !== (produit.quantiteActuelle || 0)) {
      console.log(`   ⚠️ INCOHÉRENCE DÉTECTÉE - Mise à jour produit`);
      produit.quantiteActuelle = quantiteRealeProduit;
      await produit.save();
    }

    // ℹ️ PHASE 1 v2 INFO: Vérifier la capacité MAX du TYPE DE PRODUIT (pour l'info seulement)
    // La consolidation intelligente est gérée par consolidationService ci-dessous
    console.log('ℹ️ PHASE 1 v2: Vérification capacité type (INFO SEULEMENT - consolidationService gère la logique)');
    const typeProduit = await TypeProduit.findById(produit.typeProduitId);
    let capaciteInfo = null;
    
    if (typeProduit && typeProduit.capaciteMax) {
      const quantiteActuelleProduit = quantiteRealeProduit;
      const quantiteApreAjoutProduit = quantiteActuelleProduit + parseFloat(quantite);
      
      if (quantiteApreAjoutProduit > typeProduit.capaciteMax) {
        // 🎁 Pour SIMPLE: dépassement capacité type est NORMAL (consolidation gère ça)
        // 🎁 Pour LOT: chaque LOT = 1 emplacement distinct (pas de dépassement possible)
        
        if (typeProduit.typeStockage === 'simple') {
          capaciteInfo = {
            type: 'info_simple',
            capaciteMax: typeProduit.capaciteMax,
            quantiteActuelle: quantiteActuelleProduit,
            quantiteAjout: quantite,
            quantiteApreAjout: quantiteApreAjoutProduit,
            nbEmplacements: Math.ceil(quantiteApreAjoutProduit / typeProduit.capaciteMax)
          };
          console.log(`ℹ️ INFO: Type SIMPLE - Consolidation multi-emplacements`);
          console.log(`   Type: ${typeProduit.nomType}, Capacité par emplacement: ${typeProduit.capaciteMax}`);
          console.log(`   Produit: ${produit.designation}`);
          console.log(`   Actuel: ${quantiteActuelleProduit}, Ajout: ${quantite}, Total: ${quantiteApreAjoutProduit}`);
          console.log(`   ✅ Nombre d'emplacements requis: ~${capaciteInfo.nbEmplacements}`);
          console.log(`   ✅ consolidationService consoldera intelligemment dans les emplacements existants`);
        } else if (typeProduit.typeStockage === 'lot') {
          // Pour LOT: les emplacements sont gérés au niveau de chaque LOT individuel
          capaciteInfo = {
            type: 'info_lot',
            capaciteMax: typeProduit.capaciteMax,
            quantiteActuelle: quantiteActuelleProduit,
            quantiteAjout: quantite,
            quantiteApreAjout: quantiteApreAjoutProduit
          };
          console.log(`ℹ️ INFO: Type LOT - Emplacements individuels par LOT`);
          console.log(`   Type: ${typeProduit.nomType}, Capacité par LOT: ${typeProduit.capaciteMax}`);
          console.log(`   Produit: ${produit.designation}`);
          console.log(`   Actuel: ${quantiteActuelleProduit}, Ajout: ${quantite}, Total: ${quantiteApreAjoutProduit}`);
          console.log(`   ✅ Chaque pièce = 1 LOT (emplacements gérés par nombrePieces)`);
        } else {
          capaciteInfo = {
            type: 'depassement',
            capaciteMax: typeProduit.capaciteMax,
            quantiteActuelle: quantiteActuelleProduit,
            quantiteAjout: quantite,
            quantiteApreAjout: quantiteApreAjoutProduit,
            depassement: quantiteApreAjoutProduit - typeProduit.capaciteMax
          };
          console.log(`ℹ️ INFO: Dépassement de capacité type détecté`);
          console.log(`   Type: ${typeProduit.nomType}, Max: ${typeProduit.capaciteMax}`);
          console.log(`   Produit: ${produit.designation}`);
          console.log(`   Actuel: ${quantiteActuelleProduit}, Ajout: ${quantite}, Total: ${quantiteApreAjoutProduit}`);
          console.log(`   Dépassement: ${capaciteInfo.depassement} ${typeProduit.unitePrincipale || 'unités'}`);
        }
      }
    }

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
      garantie,
      // 🎁 Champs LOT
      nombrePieces: nombrePieces || null,
      quantiteParPiece: quantiteParPiece || null,
      uniteDetail: uniteDetail || null,
      prixParUnite: prixParUnite || null
    });

    // Sauvegarder la réception
    await reception.save();
    console.log(`✅ Réception créée: ${reception._id}`);
    console.log(`🎁 Réception LOT fields:`);
    console.log(`   - nombrePieces: ${reception.nombrePieces}`);
    console.log(`   - quantiteParPiece: ${reception.quantiteParPiece}`);
    console.log(`   - uniteDetail: ${reception.uniteDetail}`);
    console.log(`   - prixParUnite: ${reception.prixParUnite}`);

    // 2. Créer automatiquement un mouvement de stock (RÉCEPTION)
    const stockMovement = new StockMovement({
      produitId,
      magasinId,
      rayonId,
      type: 'RECEPTION',
      quantite,
      fournisseur: fournisseur || 'Non spécifié',
      utilisateurId: req.user.id,
      numeroDocument: lotNumber || `LOT-${Date.now()}`,
      observations: `Réception ${fournisseur || 'Non spécifié'}`,
      dateDocument: dateReception || new Date()
    });

    await stockMovement.save();
    console.log(`✅ Mouvement de stock créé: ${stockMovement._id}`);

    // 🎁 PHASE 1 v2 - LOT: Ne pas créer StockRayon ici!
    // Le frontend crée les LOTs individuels via POST /lots
    // Chaque POST /lots crée son propre StockRayon et met à jour le rayon
    
    if (req.body.type === 'lot') {
      console.log(`🎁 Type = LOT - Réception créée, attente des LOTs individuels du frontend...`);
      
      // Juste enregistrer la réception et laisser le frontend créer les LOTs
      reception.mouvementStockId = stockMovement._id;
      await reception.save();
      
      try {
        const magasinData = await Magasin.findById(magasinId);
        const activity = new Activity({
          title: `Réception LOT - ${produit.designation}`,
          businessId: magasinData?.businessId,
          utilisateurId: req.user.id,
          action: 'CREER_RECEPTION_LOT',
          entite: 'Reception',
          entiteId: reception._id,
          description: `Réception LOT créée - ${req.body.nombrePieces} pièces de ${produit.designation}`,
          icon: 'fas fa-truck-loading'
        });
        await activity.save();
      } catch (actErr) {
        console.error('activity.save.error', actErr);
      }

      const populatedReception = await Reception.findById(reception._id)
        .populate('produitId', 'designation reference image quantiteActuelle')
        .populate('magasinId', 'nom')
        .populate('rayonId', 'nom')
        .populate('mouvementStockId');

      return res.status(201).json({
        success: true,
        message: '✅ Réception LOT enregistrée (LOTs à créer via frontend)',
        reception: populatedReception,
        mouvement: stockMovement
      });
    }

    // 🆕 PHASE 1 v2: Utiliser consolidationService pour logique intelligente (SIMPLE)
    
    let consolidationResult;
    try {
      consolidationResult = await consolidationService.findOrCreateStockRayon({
        produitId,
        rayonId,
        quantiteAjouter: parseFloat(quantite),
        typeProduitId,
        receptionId: reception._id,
        magasinId
      });
      console.log(`✅ consolidationService OK: ${consolidationResult.actionType}`);
    } catch (consolidationError) {
      console.error(`❌ Erreur consolidationService:`, consolidationError.message);
      return res.status(400).json({
        error: 'Erreur consolidation stock',
        details: consolidationError.message
      });
    }

    const stockRayon = consolidationResult.sr;
    console.log(`   Action: ${consolidationResult.actionType}`);
    console.log(`   StockRayon: ${stockRayon._id}`);
    console.log(`   Quantité après: ${stockRayon.quantiteDisponible}`);
    console.log(`   Type: ${stockRayon.typeStockage || 'simple'}`);
    if (stockRayon.numeroLot) {
      console.log(`   NuméroLot: ${stockRayon.numeroLot}`);
    }

    // 4. Mettre à jour la quantité du rayon
    // 🎁 IMPORTANT: 
    // - Pour LOT: chaque LOT = 1 emplacement (déjà géré par POST /lots)
    // - Pour SIMPLE: nouveaux StockRayons créés = +1 emplacement (pas +quantité)
    // - Ici c'est POST /receptions: consolide OU crée nouveau
    if (consolidationResult.actionType === 'CREATE') {
      // Créé un NOUVEAU emplacement
      rayon.quantiteActuelle = (rayon.quantiteActuelle || 0) + 1;  // +1 emplacement
    } else if (consolidationResult.actionType === 'CREATE_SPLIT') {
      // 🆕 PHASE 1 v2: Créé plusieurs emplacements (Type SIMPLE split)
      const nombreEmplacements = consolidationResult.nombreEmplacements || 1;
      rayon.quantiteActuelle = (rayon.quantiteActuelle || 0) + nombreEmplacements;
      console.log(`   🔄 SPLIT: +${nombreEmplacements} emplacements (total: ${rayon.quantiteActuelle})`);
    }
    // Si CONSOLIDATE: pas de changement à quantiteActuelle (même emplacement)
    await rayon.save();
    console.log(`✅ Rayon mis à jour: ${rayon.nomRayon} (${rayon.quantiteActuelle}/${rayon.capaciteMax})`);

    // 5. Mettre à jour la quantité totale du produit (somme de tous les rayons)
    const totalStockParProduit = await StockRayon.aggregate([
      {
        $match: {
          produitId: new mongoose.Types.ObjectId(produitId),
          magasinId: new mongoose.Types.ObjectId(magasinId)
        }
      },
      {
        $group: {
          _id: '$produitId',
          totalQuantite: { $sum: '$quantiteDisponible' }
        }
      }
    ]);

    const nouvelleQuantiteActuelle = (totalStockParProduit[0]?.totalQuantite || 0);
    produit.quantiteActuelle = nouvelleQuantiteActuelle;
    produit.quantiteEntree = (produit.quantiteEntree || 0) + parseFloat(quantite);
    produit.dateLastMovement = new Date();

    // Si le produit n'a pas encore de rayonId, assigner le premier
    if (!produit.rayonId) {
      produit.rayonId = rayonId;
      console.log(`📍 Premier rayon assigné au produit: ${rayonId}`);
    }

    await produit.save();
    console.log(`✅ Produit "${produit.designation}" mis à jour:`);
    console.log(`   - quantiteActuelle: ${nouvelleQuantiteActuelle}`);
    console.log(`   - quantiteEntree: ${produit.quantiteEntree}`);

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
      stockRayon: {
        _id: stockRayon._id,
        quantiteDisponible: stockRayon.quantiteDisponible,
        statut: stockRayon.statut,
        typeStockage: stockRayon.typeStockage,
        numeroLot: stockRayon.numeroLot || undefined,
        actionType: consolidationResult.actionType,  // CREATE ou CONSOLIDATE
        receptionsFusionnées: consolidationResult.receptionsFusionnées || 1
      },
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




