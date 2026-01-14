const express = require('express');
const router = express.Router();
const Business = require('../models/business');
const Magasin = require('../models/magasin');
const Guichet = require('../models/guichet');
const Vente = require('../models/vente');
const Affectation = require('../models/affectation');
const Activity = require('../models/activity');
const authenticateToken = require('../middlewares/authenticateToken'); // Middleware JWT
const upload = require('../middlewares/upload');
const cloudinary = require('../services/cloudinary');

// Helper validation
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => /^[0-9+\s-]{7,20}$/.test(phone);

// ===== BUSINESS ROUTES =====

// POST /api/business - Créer une nouvelle business (admin)
router.post('/', authenticateToken, upload.single('logo'), async (req, res) => {
  const ownerId = req.user?.id;
  if (!ownerId) return res.status(401).json({ message: 'Utilisateur non authentifié' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès admin requis' });

  try {
    const allowed = ['nomEntreprise', 'logoUrl', 'description', 'adresse', 'telephone', 'email', 'typeBusiness', 'budget', 'devise', 'rccm', 'idNat', 'totalSpendings', 'productsSoldCount', 'activities', 'chiffre_affaires', 'totalSales', 'siteWeb', 'formeJuridique', 'capitalSocial', 'siegeSocial'];
    const payload = { ownerId: ownerId };
    // If a file was uploaded (multer memory storage), upload buffer to Cloudinary
    if (req.file && req.file.buffer) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream({ folder: 'business_logos' }, (error, result) => {
            if (error) reject(error); else resolve(result);
          });
          uploadStream.end(req.file.buffer);
        });
        payload.logoUrl = result.secure_url;
      } catch (upErr) {
        console.error('cloudinary upload error (business create)', upErr);
        return res.status(400).json({ message: 'Erreur lors de l\'upload du logo' });
      }
    }
    allowed.forEach(k => {
      if (req.body[k] !== undefined && req.body[k] !== null) {
        if (k === 'budget' || k === 'totalSpendings' || k === 'productsSoldCount' || k === 'chiffre_affaires' || k === 'totalSales' || k === 'capitalSocial') payload[k] = Number(req.body[k]);
        else if (k === 'activities') {
          try { payload.activities = Array.isArray(req.body.activities) ? req.body.activities : JSON.parse(req.body.activities); } catch(e) { payload.activities = []; }
        } else payload[k] = String(req.body[k]).trim();
      }
    });
    if (payload.email) payload.email = payload.email.toLowerCase();

    if (payload.email && !isValidEmail(payload.email)) {
      return res.status(400).json({ message: 'Email invalide' });
    }
    if (payload.telephone && !isValidPhone(payload.telephone)) {
      return res.status(400).json({ message: 'Téléphone invalide' });
    }
    if (!payload.nomEntreprise) {
      return res.status(400).json({ message: 'Le nom de l\'entreprise est requis' });
    }

    const newBusiness = new Business(payload);
    await newBusiness.save();
    return res.status(201).json({ message: 'Entreprise créée', business: newBusiness });
  } catch(err) {
    console.error('business.create.error', err.message, err);
    return res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /api/business - Lister toutes les businesses (admin)
router.get('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès admin requis' });

  try {
    const businesses = await Business.find().populate('ownerId', 'nom prenom email');
    return res.json(businesses);
  } catch(err) {
    console.error('business.list.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/business/:id - Récupérer une business par ID (admin)
router.get('/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès admin requis' });

  try {
    const business = await Business.findById(req.params.id).populate('ownerId', 'nom prenom email');
    if (!business) return res.status(404).json({ message: 'Entreprise non trouvée' });
    return res.json(business);
  } catch(err) {
    console.error('business.get.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/business/:id - Mettre à jour une business (admin)
router.put('/:id', authenticateToken, upload.single('logo'), async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès admin requis' });

  try {
    const allowed = ['nomEntreprise', 'logoUrl', 'description', 'adresse', 'telephone', 'email', 'typeBusiness', 'budget', 'devise', 'status', 'rccm', 'idNat', 'totalSpendings', 'productsSoldCount', 'activities', 'chiffre_affaires', 'totalSales', 'siteWeb', 'formeJuridique', 'capitalSocial', 'siegeSocial'];
    const payload = {};
    // handle logo upload if provided (use upload middleware in route if needed)
    if (req.file && req.file.buffer) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream({ folder: 'business_logos' }, (error, result) => {
            if (error) reject(error); else resolve(result);
          });
          uploadStream.end(req.file.buffer);
        });
        payload.logoUrl = result.secure_url;
      } catch (upErr) {
        console.error('cloudinary upload error (business update)', upErr);
        return res.status(400).json({ message: 'Erreur lors de l\'upload du logo' });
      }
    }
    allowed.forEach(k => {
      if (req.body[k] !== undefined && req.body[k] !== null) {
        if (k === 'budget' || k === 'status' || k === 'totalSpendings' || k === 'productsSoldCount' || k === 'chiffre_affaires' || k === 'totalSales' || k === 'capitalSocial') payload[k] = Number(req.body[k]);
        else if (k === 'activities') {
          try { payload.activities = Array.isArray(req.body.activities) ? req.body.activities : JSON.parse(req.body.activities); } catch(e) { payload.activities = [] }
        } else payload[k] = String(req.body[k]).trim();
      }
    });
    if (payload.email) payload.email = payload.email.toLowerCase();

    if (payload.email && !isValidEmail(payload.email)) {
      return res.status(400).json({ message: 'Email invalide' });
    }
    if (payload.telephone && !isValidPhone(payload.telephone)) {
      return res.status(400).json({ message: 'Téléphone invalide' });
    }

    const updated = await Business.findByIdAndUpdate(req.params.id, { $set: payload }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Entreprise non trouvée' });
    return res.json({ message: 'Entreprise mise à jour', business: updated });
  } catch(err) {
    console.error('business.update.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/business/:id - Supprimer une business et TOUT ce qui la concerne (admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès admin requis' });

  try {
    const businessId = req.params.id;
    
    // 1. Récupérer tous les magasins de l'entreprise
    const magasins = await Magasin.find({ businessId });
    const magasinIds = magasins.map(m => m._id);
    
    // 2. Récupérer tous les guichets de ces magasins
    const guichets = await Guichet.find({ magasinId: { $in: magasinIds } });
    const guichetIds = guichets.map(g => g._id);
    
    // 3. Supprimer les ventes associées aux magasins
    await Vente.deleteMany({ magasinId: { $in: magasinIds } });
    
    // 4. Supprimer les affectations associées aux guichets
    await Affectation.deleteMany({ guichetId: { $in: guichetIds } });
    
    // 5. Supprimer les activités associées à l'entreprise
    await Activity.deleteMany({ businessId });
    
    // 6. Supprimer tous les guichets
    await Guichet.deleteMany({ magasinId: { $in: magasinIds } });
    
    // 7. Supprimer tous les magasins
    await Magasin.deleteMany({ businessId });
    
    // 8. Supprimer l'entreprise elle-même
    const deleted = await Business.findByIdAndDelete(businessId);
    if (!deleted) return res.status(404).json({ message: 'Entreprise non trouvée' });
    
    return res.json({ 
      message: 'Entreprise et toutes ses données associées supprimées',
      details: {
        magasins: magasins.length,
        guichets: guichets.length,
        ventes: 'supprimées',
        affectations: 'supprimées',
        activites: 'supprimées'
      }
    });
  } catch(err) {
    console.error('business.delete.error', err);
    return res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// ===== MAGASIN ROUTES =====

// POST /api/business/magasin - Créer un magasin (admin)
router.post('/magasin', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès admin requis' });

  try {
    const { businessId, nom_magasin, adresse, telephone, email } = req.body;
    
    if (!businessId || !nom_magasin) {
      return res.status(400).json({ message: 'businessId et nom_magasin sont requis' });
    }

    // Vérifier que la business existe
    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ message: 'Entreprise non trouvée' });

    const payload = { businessId, nom_magasin: nom_magasin.trim() };
    if (adresse) payload.adresse = adresse.trim();
    if (telephone) {
      if (!isValidPhone(telephone)) return res.status(400).json({ message: 'Téléphone invalide' });
      payload.telephone = telephone;
    }
    if (email) {
      if (!isValidEmail(email)) return res.status(400).json({ message: 'Email invalide' });
      payload.email = email.toLowerCase();
    }

    const newMagasin = new Magasin(payload);
    await newMagasin.save();
    return res.status(201).json({ message: 'Magasin créé', magasin: newMagasin });
  } catch(err) {
    console.error('magasin.create.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/business/magasin/:businessId - Lister les magasins d'une business
router.get('/magasin/:businessId', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès admin requis' });

  try {
    const magasins = await Magasin.find({ businessId: req.params.businessId }).populate('businessId', 'nomEntreprise');
    return res.json(magasins);
  } catch(err) {
    console.error('magasin.list.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/business/magasin/:id - Mettre à jour un magasin
router.put('/magasin/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès admin requis' });

  try {
    const allowed = ['nom_magasin', 'adresse', 'telephone', 'email', 'status'];
    const payload = {};
    allowed.forEach(k => {
      if (req.body[k] !== undefined && req.body[k] !== null) {
        if (k === 'status') payload[k] = Number(req.body[k]);
        else payload[k] = String(req.body[k]).trim();
      }
    });
    if (payload.email) payload.email = payload.email.toLowerCase();

    if (payload.email && !isValidEmail(payload.email)) {
      return res.status(400).json({ message: 'Email invalide' });
    }
    if (payload.telephone && !isValidPhone(payload.telephone)) {
      return res.status(400).json({ message: 'Téléphone invalide' });
    }

    const updated = await Magasin.findByIdAndUpdate(req.params.id, { $set: payload }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Magasin non trouvé' });
    return res.json({ message: 'Magasin mis à jour', magasin: updated });
  } catch(err) {
    console.error('magasin.update.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/business/magasin/:id - Supprimer un magasin
router.delete('/magasin/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès admin requis' });

  try {
    const magasin = await Magasin.findByIdAndDelete(req.params.id);
    if (!magasin) return res.status(404).json({ message: 'Magasin non trouvé' });
    
    // Supprimer tous les guichets du magasin
    await Guichet.deleteMany({ magasinId: req.params.id });
    
    return res.json({ message: 'Magasin et ses guichets supprimés' });
  } catch(err) {
    console.error('magasin.delete.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ===== GUICHET ROUTES =====

// POST /api/business/guichet - Créer un guichet (admin)
router.post('/guichet', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès admin requis' });

  try {
    const { magasinId, nom_guichet } = req.body;
    
    if (!magasinId || !nom_guichet) {
      return res.status(400).json({ message: 'magasinId et nom_guichet sont requis' });
    }

    // Vérifier que le magasin existe
    const magasin = await Magasin.findById(magasinId);
    if (!magasin) return res.status(404).json({ message: 'Magasin non trouvé' });

    const newGuichet = new Guichet({ magasinId, nom_guichet: nom_guichet.trim() });
    await newGuichet.save();
    return res.status(201).json({ message: 'Guichet créé', guichet: newGuichet });
  } catch(err) {
    console.error('guichet.create.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/business/guichet/:magasinId - Lister les guichets d'un magasin
router.get('/guichet/:magasinId', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès admin requis' });

  try {
    const guichets = await Guichet.find({ magasinId: req.params.magasinId }).populate('magasinId', 'nom_magasin');
    return res.json(guichets);
  } catch(err) {
    console.error('guichet.list.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/business/guichet/:id - Mettre à jour un guichet
router.put('/guichet/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès admin requis' });

  try {
    const allowed = ['nom_guichet', 'status'];
    const payload = {};
    allowed.forEach(k => {
      if (req.body[k] !== undefined && req.body[k] !== null) {
        if (k === 'status') payload[k] = Number(req.body[k]);
        else payload[k] = String(req.body[k]).trim();
      }
    });

    const updated = await Guichet.findByIdAndUpdate(req.params.id, { $set: payload }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Guichet non trouvé' });
    return res.json({ message: 'Guichet mis à jour', guichet: updated });
  } catch(err) {
    console.error('guichet.update.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/business/guichet/:id - Supprimer un guichet
router.delete('/guichet/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès admin requis' });

  try {
    const deleted = await Guichet.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Guichet non trouvé' });
    return res.json({ message: 'Guichet supprimé' });
  } catch(err) {
    console.error('guichet.delete.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
