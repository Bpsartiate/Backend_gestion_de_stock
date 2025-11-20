const express = require('express');
const router = express.Router();
const Utilisateur = require('../models/utilisateur');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  try {
    const { nom, email, telephone, password, passwordConfirm, role } = req.body;

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
    const newUser = new Utilisateur({ nom, email, telephone, password: hashedPassword, role });
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
    const token = jwt.sign(
      { id: utilisateur._id, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(200).json({ message: 'Authentification réussie', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
