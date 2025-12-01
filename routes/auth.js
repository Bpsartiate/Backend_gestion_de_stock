const express = require('express');
const router = express.Router();
const Utilisateur = require('../models/utilisateur');
const Affectation = require('../models/affectation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const upload = require('../middlewares/upload');
const path = require('path');

router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    console.log('[auth.register] req.file:', req.file ? { fieldname: req.file.fieldname, filename: req.file.filename, size: req.file.size } : 'NONE');
    const { nom, prenom, email, telephone, password, passwordConfirm, role } = req.body;

    if (!password || !passwordConfirm) {
      return res.status(400).json({ message: 'Les mots de passe sont requis.' });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ message: "Les mots de passe ne correspondent pas." });
    }

    // Vérifier si un admin existe déjà
    if (role === 'admin') {
      const adminExists = await Utilisateur.exists({ role: 'admin' });
      if (adminExists) {
        return res.status(403).json({ message: "Un administrateur existe déjà." });
      }
    }

    // Vérifier que l'email n'existe pas déjà
    if (email) {
      const emailExists = await Utilisateur.exists({ email });
      if (emailExists) {
        return res.status(409).json({ message: "Cet email est déjà utilisé." });
      }
    }

    // Vérifier que le téléphone n'existe pas déjà (si fourni)
    if (telephone) {
      const phoneExists = await Utilisateur.exists({ telephone });
      if (phoneExists) {
        return res.status(409).json({ message: "Ce numéro de téléphone est déjà utilisé." });
      }
    }

    // Hacher le mot de passe et créer l'utilisateur
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { nom, prenom, email, telephone, password: hashedPassword, role };
    
    if (req.file && req.file.buffer) {
      // upload buffer to cloudinary using upload_stream
      try{
        console.log('[auth.register] uploading to cloudinary via stream...');
        const cloudinary = require('../services/cloudinary');
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'profiles' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });
        if(result && result.secure_url) userData.photoUrl = result.secure_url;
        console.log('[auth.register] uploaded to cloudinary:', userData.photoUrl);
      }catch(e){
        console.error('cloudinary upload failed', e);
        // fail gracefully: don't create user if photo upload fails
        return res.status(400).json({ message: 'Erreur lors de l\'upload de la photo.' });
      }
    }
    const newUser = new Utilisateur(userData);
    await newUser.save();

    res.status(201).json({ message: "Utilisateur créé avec succès !" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body; // Email ou téléphone
  if (!identifier || !password) {
    return res.status(400).json({ message: 'Identifier et mot de passe requis' });
  }
  try {
    const utilisateur = await Utilisateur.findOne({
      $or: [{ email: identifier }, { telephone: identifier }]
    });
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    const validPassword = await bcrypt.compare(password, utilisateur.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Mot de passe invalide' });
    }

    // ===== VÉRIFICATIONS D'AFFECTATION PAR RÔLE =====
    
    // Vendeur : DOIT avoir une affectation à un guichet pour se connecter (MOBILE)
    if (utilisateur.role === 'vendeur') {
      const affectation = await Affectation.findOne({ 
        vendeurId: utilisateur._id, 
        status: 1 // Affectation active
      });
      if (!affectation) {
        return res.status(403).json({ 
          message: 'Accès refusé : Vous n\'avez pas d\'affectation active. Contactez votre superviseur.' 
        });
      }
    }

    // Superviseur : DOIT avoir une affectation à une entreprise/magasin pour se connecter (WEB)
    if (utilisateur.role === 'superviseur') {
      if (!utilisateur.businessId) {
        return res.status(403).json({ 
          message: 'Accès refusé : Vous n\'avez pas d\'affectation à une entreprise. Contactez l\'administrateur.' 
        });
      }
    }

    // Admin : Pas de restriction (accès WEB complet)

    const token = jwt.sign(
      { id: utilisateur._id, nom: utilisateur.nom, prenom: utilisateur.prenom, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(200).json({
      message: 'Authentification réussie',
      token,
      user: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        telephone: utilisateur.telephone,
        role: utilisateur.role,
        businessId: utilisateur.businessId,
        guichetId: utilisateur.guichetId
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
// Vérifie s'il existe au moins un utilisateur avec role: 'admin'
router.get('/admin-exists', async (req, res) => {
  try {
    const adminExists = await Utilisateur.exists({ role: 'admin' });
    // renvoyer un booléen simple
    return res.json({ exists: !!adminExists });
  } catch (err) {
    console.error('admin-exists error:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});
module.exports = router;
