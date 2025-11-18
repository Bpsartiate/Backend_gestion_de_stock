const express = require('express');
const router = express.Router();
const Utilisateur = require('../models/utilisateur');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  const { nom, email, telephone, password, passwordConfirm, role } = req.body;
  if (!nom || (!email && !telephone) || !password || !passwordConfirm || !role) {
    return res.status(400).json({ message: 'Tous les champs requis doivent être remplis' });
  }
  if (password !== passwordConfirm) {
    return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
  }
  try {
    const existingUser = await Utilisateur.findOne({
      $or: [{ email }, { telephone }]
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Email ou téléphone déjà utilisé' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Utilisateur({
      nom,
      email,
      telephone,
      password: hashedPassword,
      role
    });
    await newUser.save();
    res.status(201).json({ message: 'Inscription réussie' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
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
