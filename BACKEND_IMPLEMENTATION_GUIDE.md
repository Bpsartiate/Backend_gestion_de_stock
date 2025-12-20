# 🔧 Implémentation Backend - Produits Vendus dans Modal Guichet

## 📋 Objectif
Ajouter une section "Produits Vendus Aujourd'hui" au modal détail guichet avec des informations détaillées sur les ventes du jour.

---

## 🏗️ Architecture Actuelle

### Routes Existantes
```
GET /api/protected/guichets/:magasinId
    → Récupère la liste des guichets d'un magasin

GET /api/protected/guichets/detail/:guichetId
    → Récupère les détails d'un guichet + vendeurs affectés

PUT /api/protected/guichets/:id
    → Modifie un guichet

DELETE /api/protected/guichets/:id
    → Supprime un guichet
```

### Données Actuelles Retournées
```javascript
{
    _id: ObjectId,
    magasinId: { ... },
    nom_guichet: String,
    code: String,
    status: Number,
    vendeurPrincipal: { nom, prenom, email, role },
    objectifJournalier: Number,
    stockMax: Number,
    vendeurs: [ { nom, prenom, email, role } ],
    createdAt: Date,
    updatedAt: Date
}
```

---

## ✨ Données à Ajouter

### Nouveaux Champs dans la Réponse
```javascript
{
    // ... champs existants ...
    
    produitVendus: [
        {
            id: ObjectId (produit ID),
            nom: String,                    // "Paracétamol 500mg"
            quantiteVendue: Number,         // 12
            prixUnitaire: Number,           // 13000 (CDF)
            totalVente: Number,             // 156000 (quantité × prix)
            categorie: String,              // "Analgésique"
            marge: Number                   // 15 (%)
        },
        // ... autres produits ...
    ],
    
    // Optionnel: Résumé des ventes
    resumeVentes: {
        totalVenteJour: Number,             // Somme totale CDF
        totalProduitsVendus: Number,        // Nombre de produits différents
        totalUnitesVendues: Number,         // Total d'unités vendues
        margesMoyenne: Number               // % marge moyenne
    }
}
```

---

## 🛠️ Étapes d'Implémentation

### Étape 1: Créer un Modèle pour les Ventes (si inexistant)

**Fichier**: `models/vente.js`

```javascript
const mongoose = require('mongoose');

const venteDetailSchema = new mongoose.Schema({
  guichetId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Guichet', 
    required: true 
  },
  produitId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Produit', 
    required: true 
  },
  vendeurId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Utilisateur' 
  },
  quantite: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  prixUnitaire: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  montant: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  client: String,                           // Nom du client (optionnel)
  reference: String,                        // Numéro de reçu/facture
  notes: String,                            // Notes supplémentaires
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

venteDetailSchema.index({ guichetId: 1, createdAt: -1 });
venteDetailSchema.index({ produitId: 1 });
venteDetailSchema.index({ createdAt: -1 });

module.exports = mongoose.model('VenteDetail', venteDetailSchema);
```

**Fichier**: `models/produit.js` (si inexistant)

```javascript
const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  nom: { 
    type: String, 
    required: true, 
    trim: true 
  },
  categorie: { 
    type: String, 
    trim: true 
  },
  prixCout: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  prixVente: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  margeVente: { 
    type: Number, 
    default: 20 
  },
  stockMin: { 
    type: Number, 
    default: 0 
  },
  stockMax: { 
    type: Number, 
    default: 0 
  },
  description: String,
  code: String,
  businessId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Business', 
    required: true 
  },
  actif: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Produit', produitSchema);
```

---

### Étape 2: Améliorer la Route GET /guichets/detail/:guichetId

**Fichier**: `routes/protected.js` (ligne ~484)

```javascript
// GET /api/protected/guichets/detail/:guichetId - Détail d'un guichet avec produits vendus
router.get('/guichets/detail/:guichetId', authMiddleware, async (req, res) => {
  try {
    const guichetId = req.params.guichetId;
    
    // 1. Récupérer le guichet
    const guichet = await Guichet.findById(guichetId)
      .populate('magasinId')
      .populate('vendeurPrincipal', 'nom prenom email role')
      .lean();
    
    if (!guichet) {
      return res.status(404).json({ message: 'Guichet non trouvé' });
    }
    
    // 2. Récupérer les vendeurs affectés à ce guichet
    const affectations = await Affectation.find({ guichetId })
      .populate('vendeurId', 'nom prenom email role')
      .lean();
    
    // 3. ✨ NOUVEAU: Récupérer les produits vendus du jour
    const aujourd_hui = new Date();
    aujourd_hui.setHours(0, 0, 0, 0);
    
    // Nécessite le modèle VenteDetail
    let produitVendus = [];
    try {
      const VenteDetail = require('../models/vente');
      const Produit = require('../models/produit');
      
      const ventes = await VenteDetail.aggregate([
        {
          $match: {
            guichetId: mongoose.Types.ObjectId(guichetId),
            createdAt: { $gte: aujourd_hui }
          }
        },
        {
          $group: {
            _id: '$produitId',
            quantiteVendue: { $sum: '$quantite' },
            totalVente: { $sum: '$montant' },
            prixUnitaire: { $first: '$prixUnitaire' }
          }
        },
        {
          $lookup: {
            from: 'produits',
            localField: '_id',
            foreignField: '_id',
            as: 'produit'
          }
        },
        { $unwind: '$produit' },
        { $sort: { totalVente: -1 } }
      ]);
      
      produitVendus = ventes.map(v => ({
        id: v._id,
        nom: v.produit.nom,
        quantiteVendue: v.quantiteVendue,
        prixUnitaire: v.prixUnitaire,
        totalVente: v.totalVente,
        categorie: v.produit.categorie || 'N/A',
        marge: v.produit.margeVente || 15
      }));
      
    } catch (venteErr) {
      console.warn('Erreur récupération ventes:', venteErr.message);
      // Continue sans produits vendus si erreur
    }
    
    // 4. ✨ Calculer le résumé des ventes
    const resumeVentes = {
      totalVenteJour: produitVendus.reduce((sum, p) => sum + (p.totalVente || 0), 0),
      totalProduitsVendus: produitVendus.length,
      totalUnitesVendues: produitVendus.reduce((sum, p) => sum + (p.quantiteVendue || 0), 0),
      margesMoyenne: produitVendus.length > 0 
        ? Math.round(produitVendus.reduce((sum, p) => sum + (p.marge || 0), 0) / produitVendus.length)
        : 0
    };
    
    return res.json({
      ...guichet,
      vendeurs: affectations.map(a => a.vendeurId),
      produitVendus,
      resumeVentes
    });
    
  } catch (err) {
    console.error('guichets.detail.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});
```

---

### Étape 3: Modifier le Frontend (magasin_guichet.js)

**Modification de `loadGuichetDetails()`** (ligne ~615):

```javascript
function loadGuichetDetails(id) {
    console.log('🔄 Guichet details:', id);
    
    if (!id) {
        showToast('❌ ID guichet manquant', 'danger');
        return;
    }
    
    $('#guichetSpinner').show();
    $('#guichetPlaceholder, #guichetDetailsData').hide();
    
    let g;
    try {
        g = GUICHETS_CACHE[id];
        if (!g) {
            // ✅ Appel API RÉELLE au lieu de simulateGuichetData
            const token = getTokenLocal();
            const endpoint = `${API_BASE || ''}/api/protected/guichets/detail/${id}`;
            
            const response = await fetch(endpoint, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            
            if (!response.ok) {
                throw new Error(`Erreur API: ${response.statusText}`);
            }
            
            g = await response.json();
            GUICHETS_CACHE[id] = g;
        }
        
        injectGuichetContent();
        updateGuichetHeader(g);
        updateGuichetKPI(g);
        updateCaissierInfo(g);
        updateProduitsVendus(g);          // ✨ Utilise les vraies données
        updateStocksActifs(g);
        updateTransactionsRecentes(g);
        initGuichetChart();
        
        setTimeout(() => {
            $('#guichetSpinner').hide();
            $('#guichetDetailsData').fadeIn(400);
        }, 600);
        
        showToast(`✅ ${g.nomGuichet || g.nom_guichet} chargé`, 'success', 2000);
        
    } catch (err) {
        console.error('❌ Erreur loadGuichetDetails:', err);
        $('#guichetSpinner').hide();
        $('#guichetPlaceholder').html(`
            <div class="text-center p-5">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h5 class="text-danger">Guichet introuvable</h5>
                <p class="text-muted">${err.message}</p>
            </div>
        `).show();
        showToast('❌ ' + err.message, 'danger');
    }
}
```

---

## 🧪 Résumé de l'Implémentation

| Composant | État | Action |
|-----------|------|--------|
| Frontend (HTML/CSS) | ✅ Prêt | Déjà implémenté dans `magasin_guichet.js` |
| Frontend (JS) | ✅ Prêt | `updateProduitsVendus()` prêt à l'emploi |
| Modèle Produit | ❓ À créer | Créer `models/produit.js` |
| Modèle Vente | ❓ À créer | Créer `models/vente.js` |
| Route Backend | ⚠️ À améliorer | Enrichir `GET /guichets/detail/:guichetId` |
| Intégration | 🔄 En cours | Modifier `loadGuichetDetails()` |

---

## 🚀 Commandes pour Tester

### Avec Postman
```
GET http://localhost:5000/api/protected/guichets/detail/[GUICHET_ID]
Headers: Authorization: Bearer [TOKEN]
```

### Réponse Attendue
```json
{
  "_id": "...",
  "nom_guichet": "Guichet 001",
  "status": 1,
  "produitVendus": [
    {
      "id": "...",
      "nom": "Paracétamol 500mg",
      "quantiteVendue": 12,
      "prixUnitaire": 13000,
      "totalVente": 156000,
      "categorie": "Analgésique",
      "marge": 15
    }
  ],
  "resumeVentes": {
    "totalVenteJour": 500000,
    "totalProduitsVendus": 5,
    "totalUnitesVendues": 47,
    "margesMoyenne": 18
  },
  "vendeurs": [...]
}
```

---

## 📝 Notes Importantes

1. **MongoDB doit supporter `ObjectId()` en aggregation**
   - Assurez-vous que mongoose est correctement configuré

2. **Performance**
   - Ajoutez des index sur `guichetId` et `createdAt`
   - Considérez un cache Redis pour les ventes du jour

3. **Sécurité**
   - Validez que l'utilisateur a accès à ce guichet
   - Vérifiez l'entreprise du guichet = entreprise de l'utilisateur

4. **Compatibilité**
   - Test avec et sans données de ventes
   - Fallback gracieux si les modèles manquent

---

**Prochaines étapes**: Implémenter la partie **Stock et Entreposage** avec:
- Localisation physique des produits
- Historique de mouvements
- Alertes de stock bas
- Transferts inter-guichets

