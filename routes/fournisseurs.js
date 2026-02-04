const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Fournisseur = require('../models/fournisseur');

/**
 * GET /api/protected/fournisseurs
 * Lister tous les fournisseurs
 */
router.get('/fournisseurs', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 GET /api/protected/fournisseurs');
    
    const fournisseurs = await Fournisseur.find({ actif: true })
      .select('_id nom telephone email adresse ville codePostal actif')
      .sort({ nom: 1 })
      .lean();
    
    console.log(`✅ ${fournisseurs.length} fournisseurs trouvés`);
    res.json(fournisseurs);
  } catch (error) {
    console.error('❌ Erreur récupération fournisseurs:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

/**
 * GET /api/protected/fournisseurs/:id
 * Obtenir détails d'un fournisseur
 */
router.get('/fournisseurs/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`🔍 GET /api/protected/fournisseurs/${req.params.id}`);
    
    const fournisseur = await Fournisseur.findById(req.params.id)
      .populate('paysId', 'nom code')
      .populate('createdBy', 'nom email')
      .populate('updatedBy', 'nom email');
    
    if (!fournisseur) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }
    
    console.log(`✅ Fournisseur trouvé: ${fournisseur.nom}`);
    res.json(fournisseur);
  } catch (error) {
    console.error('❌ Erreur récupération fournisseur:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

/**
 * POST /api/protected/fournisseurs
 * Créer un nouveau fournisseur
 */
router.post('/fournisseurs', authMiddleware, async (req, res) => {
  try {
    console.log('📝 POST /api/protected/fournisseurs');
    const { nom, telephone, email, adresse, ville, codePostal, paysId, notes } = req.body;

    // Validation
    if (!nom || nom.trim() === '') {
      return res.status(400).json({ message: 'Le nom du fournisseur est obligatoire' });
    }

    // Vérifier si fournisseur existe déjà
    const existant = await Fournisseur.findOne({ 
      nom: { $regex: `^${nom.trim()}$`, $options: 'i' } 
    });
    
    if (existant) {
      return res.status(409).json({ message: 'Un fournisseur avec ce nom existe déjà' });
    }

    // Créer nouveau fournisseur
    const nouveauFournisseur = new Fournisseur({
      nom: nom.trim(),
      telephone: telephone || '',
      email: email ? email.trim().toLowerCase() : '',
      adresse: adresse ? adresse.trim() : '',
      ville: ville ? ville.trim() : '',
      codePostal: codePostal ? codePostal.trim() : '',
      paysId: paysId || null,
      notes: notes || '',
      createdBy: req.user.id,
      updatedBy: req.user.id,
      actif: true
    });

    await nouveauFournisseur.save();
    console.log(`✅ Fournisseur créé: ${nouveauFournisseur._id} - ${nom}`);

    res.status(201).json({
      message: 'Fournisseur créé avec succès',
      fournisseur: nouveauFournisseur
    });
  } catch (error) {
    console.error('❌ Erreur création fournisseur:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

/**
 * PUT /api/protected/fournisseurs/:id
 * Modifier un fournisseur
 */
router.put('/fournisseurs/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`✏️ PUT /api/protected/fournisseurs/${req.params.id}`);
    const { nom, telephone, email, adresse, ville, codePostal, paysId, notes, actif } = req.body;

    const fournisseur = await Fournisseur.findById(req.params.id);
    if (!fournisseur) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    // Mise à jour
    if (nom) fournisseur.nom = nom.trim();
    if (telephone !== undefined) fournisseur.telephone = telephone;
    if (email !== undefined) fournisseur.email = email ? email.trim().toLowerCase() : '';
    if (adresse !== undefined) fournisseur.adresse = adresse ? adresse.trim() : '';
    if (ville !== undefined) fournisseur.ville = ville ? ville.trim() : '';
    if (codePostal !== undefined) fournisseur.codePostal = codePostal ? codePostal.trim() : '';
    if (paysId !== undefined) fournisseur.paysId = paysId;
    if (notes !== undefined) fournisseur.notes = notes;
    if (actif !== undefined) fournisseur.actif = actif;
    
    fournisseur.updatedBy = req.user.id;

    await fournisseur.save();
    console.log(`✅ Fournisseur modifié: ${fournisseur._id}`);

    res.json({
      message: 'Fournisseur modifié avec succès',
      fournisseur
    });
  } catch (error) {
    console.error('❌ Erreur modification fournisseur:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

/**
 * DELETE /api/protected/fournisseurs/:id
 * Supprimer (désactiver) un fournisseur
 */
router.delete('/fournisseurs/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`🗑️ DELETE /api/protected/fournisseurs/${req.params.id}`);

    const fournisseur = await Fournisseur.findById(req.params.id);
    if (!fournisseur) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    // Soft delete: marquer comme inactif plutôt que supprimer
    fournisseur.actif = false;
    fournisseur.updatedBy = req.user.id;
    await fournisseur.save();

    console.log(`✅ Fournisseur désactivé: ${fournisseur._id}`);

    res.json({
      message: 'Fournisseur désactivé avec succès',
      fournisseur
    });
  } catch (error) {
    console.error('❌ Erreur suppression fournisseur:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
