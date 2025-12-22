# 🏷️ Guide Implémentation Catégories

## Vue d'ensemble
Système fluide et moderne pour gérer les catégories de produits avec:
- **Recherche dynamique** en temps réel
- **Création rapide** de catégories
- **Badges animés** pour la sélection
- **Design responsive** et fluide

---

## 1. FRONTEND (✅ COMPLÉTÉ)

### Structure HTML
```html
<!-- Input de recherche avec bouton créer -->
<div class="input-group">
  <input id="categorieSearch" placeholder="🔍 Rechercher ou créer..." />
  <button id="btnNewCategorie" title="Créer">
    <i class="fas fa-plus"></i>
  </button>
</div>

<!-- Dropdown avec animation -->
<div id="categorieDropdown" class="position-absolute">
  <div id="categorieList" class="list-group">
    <!-- Catégories dynamiques -->
  </div>
</div>

<!-- Badges sélectionnés -->
<div id="selectedCategoriesList" class="d-flex flex-wrap gap-2">
  <!-- Badges animés -->
</div>

<!-- Input caché pour formulaire -->
<input type="hidden" name="categorieId" id="categorieId" />
```

### Fonctionnalités JavaScript

#### 1. Chargement des catégories
```javascript
async function loadCategories()
// Récupère les catégories du magasin actuellement sélectionné
```

#### 2. Affichage du dropdown
```javascript
function renderCategoriesDropdown()
// Affiche la liste avec animation slideDown
// Chaque catégorie est cliquable
```

#### 3. Sélection d'une catégorie
```javascript
function selectCategorie(categorieId, categorieName)
// Sélectionne la catégorie
// Met à jour l'input caché
// Affiche le badge avec animation slideIn
// Ferme le dropdown
```

#### 4. Créer nouvelle catégorie
```javascript
btnNewCategorie.addEventListener('click', async () => {
  // Valide le nom entré
  // Appelle API pour créer
  // Ajoute à la liste locale
  // Rafraîchit le dropdown
})
```

#### 5. Recherche fluide
```javascript
searchInput.addEventListener('input', (e) => {
  // Filtre en temps réel
  // Montre/cache les catégories
})
```

### Animations CSS
```css
@keyframes slideIn {
  /* Badge qui apparaît de gauche */
  opacity: 0 → 1
  transform: translateX(-10px) → translateX(0)
}

@keyframes slideDown {
  /* Dropdown qui apparaît du haut */
  opacity: 0 → 1
  transform: translateY(-5px) → translateY(0)
}

.categorie-item:hover {
  /* Effet hover avec décalage */
  background: #f0f6ff
  transform: translateX(4px)
}
```

---

## 2. BACKEND (À IMPLÉMENTER)

### MongoDB Schema - Categorie Collection

```javascript
{
  _id: ObjectId,
  nom: String (required, unique per magasin),
  description: String,
  icon: String (optional, ex: 'tags', 'box'),
  couleur: String (hex color, ex: '#667eea'),
  magasinId: ObjectId (reference Magasin),
  
  // Métadonnées
  nombreProduits: Number,
  produits: [ObjectId], // Références aux produits
  
  // Status & Timestamps
  status: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId (reference User)
}
```

### Routes API Requises

```javascript
// GET - Lister les catégories du magasin
GET /api/protected/magasins/:magasinId/categories
Response: Array<Categorie>

// POST - Créer une catégorie
POST /api/protected/magasins/:magasinId/categories
Body: { nom, description?, icon?, couleur? }
Response: Categorie

// PUT - Modifier une catégorie
PUT /api/protected/categories/:categorieId
Body: { nom?, description?, icon?, couleur?, status? }
Response: Categorie

// DELETE - Supprimer une catégorie
DELETE /api/protected/categories/:categorieId
Response: { success: true }

// GET - Catégories avec produits
GET /api/protected/categories/:categorieId/produits
Response: Array<Produit>
```

### Exemple Implémentation Node.js/Express

```javascript
// models/categorie.js
const mongoose = require('mongoose');

const categorieSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  description: String,
  icon: String,
  couleur: { type: String, default: '#667eea' },
  magasinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Magasin',
    required: true
  },
  produits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit'
  }],
  status: { type: Boolean, default: true },
  createdBy: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index pour recherche rapide
categorieSchema.index({ magasinId: 1, nom: 1 });
categorieSchema.index({ magasinId: 1, status: 1 });

module.exports = mongoose.model('Categorie', categorieSchema);
```

```javascript
// routes/categories.js
router.get('/magasins/:magasinId/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await Categorie.find({
      magasinId: req.params.magasinId,
      status: true
    }).sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/magasins/:magasinId/categories', authenticateToken, async (req, res) => {
  try {
    const categorie = new Categorie({
      nom: req.body.nom,
      description: req.body.description,
      icon: req.body.icon,
      couleur: req.body.couleur,
      magasinId: req.params.magasinId,
      createdBy: req.user.id
    });
    await categorie.save();
    res.status(201).json(categorie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
```

---

## 3. INTEGRATION AVEC LE FORMULAIRE PRODUIT

### Quand l'utilisateur ajoute un produit

1. **Catégorie sélectionnée** → stockée dans `categorieId`
2. **Produit créé** → associé à la catégorie
3. **Catégorie mise à jour** → ajouter l'ID du produit au tableau `produits`

```javascript
async function addProduct() {
  const categorieId = document.getElementById('categorieId').value;
  if (!categorieId) {
    showToast('Veuillez sélectionner une catégorie', 'warning');
    return;
  }

  const produitData = {
    reference: formData.get('reference'),
    designation: formData.get('designation'),
    categorieId: categorieId,  // ← Nouveau champ
    typeProduitId: formData.get('typeProduit'),
    // ... autres champs
  };

  const product = await API.post(
    API_CONFIG.ENDPOINTS.PRODUITS,
    produitData,
    { magasinId: MAGASIN_ID }
  );

  showToast('✅ Produit créé avec succès!', 'success');
}
```

---

## 4. CONFIGURATION MAGASIN

Mettre à jour l'endpoint `/magasins/:magasinId/stock-config` pour inclure les catégories:

```javascript
{
  rayons: [...],
  typesProduits: [...],
  categories: [  // ← NOUVEAU
    { _id: "...", nom: "Electronique", couleur: "#667eea" },
    { _id: "...", nom: "Vêtements", couleur: "#764ba2" },
    // ...
  ]
}
```

---

## 5. POINTS DE CONTRÔLE

- [ ] Modèle Categorie créé dans MongoDB
- [ ] Routes API implémentées (GET, POST, PUT, DELETE)
- [ ] Endpoint `/stock-config` inclut les catégories
- [ ] Frontend affiche les catégories avec recherche
- [ ] Création de catégories fonctionnelle
- [ ] Sélection de catégorie dans le formulaire produit
- [ ] Produits associés aux catégories dans la BD

---

## 6. AMÉLIORATIONS FUTURES

✨ **Phase 2:**
- Filtrer produits par catégorie
- Statistiques par catégorie
- Couleurs/icônes personnalisées
- Multi-catégories par produit
- Sous-catégories (hiérarchie)

