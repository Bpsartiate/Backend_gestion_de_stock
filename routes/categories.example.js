/**
 * 📌 EXEMPLE IMPLÉMENTATION - Routes Catégories
 * À ajouter dans votre serveur Node.js/Express
 */

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// ================================
// 📦 MODÈLE CATEGORIE
// ================================

const categorieSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Nom de catégorie obligatoire'],
    trim: true,
    unique: false // unique par magasin, pas globalement
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'tag'
  },
  couleur: {
    type: String,
    default: '#667eea',
    match: /^#[0-9A-F]{6}$/i
  },
  magasinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Magasin',
    required: true
  },
  produits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit'
  }],
  status: {
    type: Boolean,
    default: true
  },
  createdBy: mongoose.Schema.Types.ObjectId,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes pour performance
categorieSchema.index({ magasinId: 1, nom: 1 }, { unique: true });
categorieSchema.index({ magasinId: 1, status: 1 });

// Validation: chaque catégorie est unique par magasin
categorieSchema.pre('save', async function(next) {
  if (this.isNew) {
    const exists = await mongoose.model('Categorie').findOne({
      magasinId: this.magasinId,
      nom: this.nom,
      _id: { $ne: this._id }
    });
    if (exists) {
      throw new Error(`Catégorie "${this.nom}" existe déjà pour ce magasin`);
    }
  }
  next();
});

const Categorie = mongoose.model('Categorie', categorieSchema);

// ================================
// 🔌 ROUTES API
// ================================

/**
 * GET /api/protected/magasins/:magasinId/categories
 * Lister toutes les catégories actives d'un magasin
 */
router.get('/magasins/:magasinId/categories', authenticateToken, async (req, res) => {
  try {
    const { magasinId } = req.params;

    // Vérifier que le magasin existe et appartient à l'utilisateur
    const magasin = await Magasin.findById(magasinId);
    if (!magasin) {
      return res.status(404).json({ error: 'Magasin non trouvé' });
    }

    const categories = await Categorie.find({
      magasinId,
      status: true
    })
    .select('_id nom description icon couleur produits createdAt')
    .sort({ createdAt: -1 });

    res.json(categories);
  } catch (err) {
    console.error('❌ Erreur GET categories:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/protected/magasins/:magasinId/categories
 * Créer une nouvelle catégorie
 */
router.post('/magasins/:magasinId/categories', authenticateToken, async (req, res) => {
  try {
    const { magasinId } = req.params;
    const { nom, description, icon, couleur } = req.body;

    // Validation
    if (!nom || nom.trim().length === 0) {
      return res.status(400).json({ error: 'Nom obligatoire' });
    }

    // Vérifier l'unicité par magasin
    const exists = await Categorie.findOne({
      magasinId,
      nom: nom.trim()
    });

    if (exists) {
      return res.status(400).json({ 
        error: `Catégorie "${nom}" existe déjà` 
      });
    }

    const categorie = new Categorie({
      nom: nom.trim(),
      description: description || '',
      icon: icon || 'tag',
      couleur: couleur || '#667eea',
      magasinId,
      createdBy: req.user.id,
      status: true
    });

    await categorie.save();

    res.status(201).json({
      message: '✅ Catégorie créée',
      categorie
    });
  } catch (err) {
    console.error('❌ Erreur POST categorie:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/protected/categories/:categorieId
 * Obtenir détails d'une catégorie avec ses produits
 */
router.get('/categories/:categorieId', authenticateToken, async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.categorieId)
      .populate('produits', 'reference designation quantiteActuelle');

    if (!categorie) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    res.json(categorie);
  } catch (err) {
    console.error('❌ Erreur GET categorie:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/protected/categories/:categorieId
 * Modifier une catégorie
 */
router.put('/categories/:categorieId', authenticateToken, async (req, res) => {
  try {
    const { nom, description, icon, couleur, status } = req.body;

    const categorie = await Categorie.findById(req.params.categorieId);
    if (!categorie) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    // Vérifier l'unicité du nom si changé
    if (nom && nom !== categorie.nom) {
      const exists = await Categorie.findOne({
        magasinId: categorie.magasinId,
        nom: nom.trim(),
        _id: { $ne: categorie._id }
      });
      if (exists) {
        return res.status(400).json({ 
          error: `Catégorie "${nom}" existe déjà` 
        });
      }
    }

    // Mise à jour
    if (nom) categorie.nom = nom.trim();
    if (description !== undefined) categorie.description = description;
    if (icon) categorie.icon = icon;
    if (couleur) categorie.couleur = couleur;
    if (status !== undefined) categorie.status = status;

    categorie.updatedAt = new Date();
    await categorie.save();

    res.json({
      message: '✅ Catégorie mise à jour',
      categorie
    });
  } catch (err) {
    console.error('❌ Erreur PUT categorie:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/protected/categories/:categorieId
 * Supprimer une catégorie (soft delete avec status: false)
 */
router.delete('/categories/:categorieId', authenticateToken, async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.categorieId);
    if (!categorie) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    // Soft delete
    categorie.status = false;
    categorie.updatedAt = new Date();
    await categorie.save();

    res.json({
      message: '✅ Catégorie supprimée',
      success: true
    });
  } catch (err) {
    console.error('❌ Erreur DELETE categorie:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/protected/categories/:categorieId/produits
 * Lister tous les produits d'une catégorie
 */
router.get('/categories/:categorieId/produits', authenticateToken, async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.categorieId)
      .populate('produits');

    if (!categorie) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    res.json({
      categorie: {
        _id: categorie._id,
        nom: categorie.nom,
        couleur: categorie.couleur
      },
      produits: categorie.produits,
      total: categorie.produits.length
    });
  } catch (err) {
    console.error('❌ Erreur GET produits categorie:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/protected/categories/:categorieId/produits/:produitId
 * Ajouter un produit à une catégorie
 */
router.post('/categories/:categorieId/produits/:produitId', authenticateToken, async (req, res) => {
  try {
    const { categorieId, produitId } = req.params;

    const categorie = await Categorie.findById(categorieId);
    if (!categorie) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    // Vérifier que le produit existe
    const produit = await Produit.findById(produitId);
    if (!produit) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    // Ajouter le produit s'il n'existe pas déjà
    if (!categorie.produits.includes(produitId)) {
      categorie.produits.push(produitId);
      categorie.updatedAt = new Date();
      await categorie.save();
    }

    res.json({
      message: '✅ Produit ajouté à la catégorie',
      categorie
    });
  } catch (err) {
    console.error('❌ Erreur POST produit categorie:', err);
    res.status(400).json({ error: err.message });
  }
});

// ================================
// 📤 EXPORT
// ================================

module.exports = router;
module.exports.Categorie = Categorie;

// ================================
// 🔗 UTILISATION
// ================================

/**
 * Dans votre main server file (app.js):
 * 
 * const categorieRoutes = require('./routes/categories');
 * app.use('/api/protected', categorieRoutes);
 */
