const express = require('express');
const router = express.Router();
const Business = require('../models/business');
const authenticateToken = require('../middlewares/authenticateToken'); // Middleware JWT

// Helper validation
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => /^[0-9+\s-]{7,20}$/.test(phone);

// Créer ou modifier profil business (admin connecté)
router.post('/business', authenticateToken, async (req, res) => {
  const ownerId = req.user?.id;
  if (!ownerId) return res.status(401).json({ message: 'Utilisateur non authentifié' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès admin requis' });

  try {
    // Sanitize / whitelist fields
    const allowed = ['nomEntreprise','logoUrl','description','adresse','telephone','email','typeBusiness'];
    const payload = {};
    allowed.forEach(k => {
      if (req.body[k] !== undefined && req.body[k] !== null) payload[k] = String(req.body[k]).trim();
    });
    if (payload.email) payload.email = payload.email.toLowerCase();

    // Validation
    if (payload.email && !isValidEmail(payload.email)) {
      return res.status(400).json({ message: 'Email invalide' });
    }
    if (payload.telephone && !isValidPhone(payload.telephone)) {
      return res.status(400).json({ message: 'Téléphone invalide' });
    }

    const existingBusiness = await Business.findOne({ ownerId });
    if (existingBusiness) {
      await Business.updateOne({ ownerId }, { $set: payload });
      const updated = await Business.findOne({ ownerId });
      return res.json({ message: 'Profil entreprise mis à jour', business: updated });
    } else {
      const newBusiness = new Business({ ...payload, ownerId });
      await newBusiness.save();
      return res.status(201).json({ message: 'Profil entreprise créé', business: newBusiness });
    }
  } catch(err) {
    // Duplicate key (race) or index violation
    if (err && err.code === 11000) {
      console.error('business.duplicate', { ownerId, err });
      return res.status(409).json({ message: 'Un profil entreprise existe déjà pour cet utilisateur' });
    }
    console.error('business.error', { ownerId: req.user?.id, err });
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer le profil business de l'admin connecté
router.get('/business', authenticateToken, async (req, res) => {
  const ownerId = req.user?.id;
  if (!ownerId) return res.status(401).json({ message: 'Utilisateur non authentifié' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès admin requis' });

  try {
    const business = await Business.findOne({ ownerId });
    if (!business) {
      return res.status(404).json({ message: 'Profil entreprise non trouvé' });
    }
    return res.json(business);
  } catch(err) {
    console.error('business.get.error', { ownerId, err });
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
