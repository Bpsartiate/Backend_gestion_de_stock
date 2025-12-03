const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Utilisateur = require('../models/utilisateur');

module.exports = async function (req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Aucun token fourni' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Try to load fresh user record from DB to ensure up-to-date role/permissions
    try {
      const user = await Utilisateur.findById(decoded.id || decoded._id).select('-password');
      if (user) {
        // attach mongoose doc as plain object for convenience
        req.user = user;
        return next();
      }
    } catch (e) {
      // if DB lookup fails, fall back to token payload
      console.warn('auth middleware DB lookup failed', e && e.message);
    }

    // fallback to token payload
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalide' });
  }
};
