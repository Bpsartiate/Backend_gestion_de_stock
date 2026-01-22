# 🔧 GUIDE D'INTÉGRATION - SYSTÈME MULTI-RAYON

## 📌 RÉSUMÉ DES CHANGEMENTS

| Composant | Type | Statut | Impact |
|-----------|------|--------|--------|
| Modèle Reception | Modification | ✅ FAIT | Ajout champ `distributions` |
| Modèle StockRayon | Enrichissement | ✅ EXISTANT | Rôle renforcé |
| Service receptionService | Création | ✅ FAIT | Logique multi-rayon |
| API POST /receptions | Adaptation | ⏳ À FAIRE | Intégration service |
| Modal distribution | Création | ✅ FAIT | UI pour sélectionner rayons |
| Documentation | Création | ✅ FAIT | STOCKRAYON_SYSTEM.md |

---

## 🚀 ÉTAPES D'INTÉGRATION

### 1. Intégrer le service dans routes/protected.js

**Localiser** la ligne ~3869 où se trouve:
```javascript
router.post('/receptions', authMiddleware, checkMagasinAccess, async (req, res) => {
```

**Importer en haut du fichier:**
```javascript
const { 
  createReceptionWithDistributions,
  getReceptionDistributions,
  getProductStockByRayon 
} = require('../services/receptionService');
```

**Remplacer** la fonction POST /receptions existante par:
```javascript
router.post('/receptions', authMiddleware, checkMagasinAccess, async (req, res) => {
  return createReceptionWithDistributions(req, res);
});
```

### 2. Ajouter les nouveaux endpoints

**Après le endpoint POST /receptions, ajouter:**

```javascript
// GET /api/protected/receptions/:receptionId/distributions
router.get('/receptions/:receptionId/distributions', authMiddleware, checkMagasinAccess, 
  async (req, res) => {
    return getReceptionDistributions(req, res);
  }
);

// GET /api/protected/produits/:produitId/stock-par-rayon
router.get('/produits/:produitId/stock-par-rayon', authMiddleware, checkMagasinAccess,
  async (req, res) => {
    return getProductStockByRayon(req, res);
  }
);
```

### 3. Inclure le modal dans le template

**Dans les pages HTML qui ont besoin du modal de réception:**

```php
<!-- Ajouter ce include -->
<?php include 'pages/stock/modal_reception_distribution.php'; ?>
```

### 4. Déclencher le modal depuis l'UI

**Exemple: Bouton "Ajouter Réception"**

```javascript
function openReceptionForm() {
  const receptionData = {
    produit: { designation: 'Viande XYZ' },
    quantite: 40,
    unite: 'kg',
    fournisseur: 'Fournisseur ABC',
    dateReception: new Date(),
    magasinId: MAGASIN_ID
  };
  
  // Ouvrir le modal
  openReceptionDistributionModal(receptionData);
}
```

---

## 📝 MIGRATION DES DONNÉES

### Pour les réceptions existantes

**Créer les StockRayons automatiquement:**

```javascript
// migration-receptionsExistantes.js
const mongoose = require('mongoose');
const Reception = require('./models/reception');
const StockRayon = require('./models/stockRayon');
const Rayon = require('./models/rayon');

async function migrateReceptions() {
  try {
    console.log('🔄 Début migration...');
    
    const receptions = await Reception.find({ 
      $or: [
        { distributions: { $exists: false } },
        { distributions: [] }
      ]
    });

    console.log(`Trouvé ${receptions.length} réceptions à migrer`);

    for (const reception of receptions) {
      if (!reception.rayonId) {
        console.warn(`⚠️ Reception ${reception._id} n'a pas de rayonId, skip`);
        continue;
      }

      const rayon = await Rayon.findById(reception.rayonId);
      if (!rayon) {
        console.warn(`⚠️ Rayon ${reception.rayonId} non trouvé, skip`);
        continue;
      }

      // Créer StockRayon
      const existing = await StockRayon.findOne({
        receptionId: reception._id
      });

      if (!existing) {
        const stockRayon = new StockRayon({
          magasinId: reception.magasinId,
          produitId: reception.produitId,
          receptionId: reception._id,
          rayonId: reception.rayonId,
          quantiteInitiale: reception.quantite,
          quantiteActuelle: reception.quantite,
          quantiteReservee: 0,
          unitePrincipale: 'kg',
          statut: 'EN_STOCK'
        });

        await stockRayon.save();
        console.log(`  ✅ StockRayon créé: ${reception._id}`);
      }

      // Mettre à jour Reception
      reception.distributions = [{
        rayonId: reception.rayonId,
        quantite: reception.quantite,
        dateDistribution: reception.dateReception,
        statut: 'EN_STOCK'
      }];
      reception.statutReception = 'DISTRIBUÉE';
      await reception.save();
      console.log(`  ✅ Reception mise à jour`);
    }

    console.log('✅ Migration complète!');
  } catch (err) {
    console.error('❌ Erreur migration:', err);
  }
}

// Exécuter:
// node migration-receptionsExistantes.js
```

---

## 🧪 TESTS RECOMMANDÉS

### Test 1: Réception simple (1 rayon)
```javascript
POST /api/protected/receptions {
  "produitId": "prod_001",
  "magasinId": "mag_1",
  "quantite": 50,
  "distributions": [
    { "rayonId": "rayon_A", "quantite": 50 }
  ],
  "fournisseur": "Fournisseur Test",
  "prixAchat": 10
}

✅ Attendu: Réception créée + 1 StockRayon
```

### Test 2: Réception multi-rayon
```javascript
POST /api/protected/receptions {
  "produitId": "prod_002",
  "magasinId": "mag_1",
  "quantite": 100,
  "distributions": [
    { "rayonId": "rayon_A", "quantite": 50 },
    { "rayonId": "rayon_B", "quantite": 50 }
  ],
  "fournisseur": "Fournisseur Multi",
  "prixAchat": 15
}

✅ Attendu: Réception créée + 2 StockRayons
```

### Test 3: Dépassement capacité (doit échouer)
```javascript
POST /api/protected/receptions {
  "produitId": "prod_003",
  "magasinId": "mag_1",
  "quantite": 500,
  "distributions": [
    { "rayonId": "rayon_A", "quantite": 500 }  // Rayon A a capacité 100
  ],
  "fournisseur": "Test Surcharge",
  "prixAchat": 20
}

❌ Attendu: Erreur "Rayon dépasserait sa capacité"
```

### Test 4: Distribution invalide (somme ≠ quantité)
```javascript
POST /api/protected/receptions {
  "produitId": "prod_004",
  "magasinId": "mag_1",
  "quantite": 100,
  "distributions": [
    { "rayonId": "rayon_A", "quantite": 50 }  // Total = 50 ≠ 100
  ],
  "fournisseur": "Test Somme",
  "prixAchat": 25
}

❌ Attendu: Erreur "Total distribué ≠ quantité"
```

### Test 5: Récupérer les distributions
```javascript
GET /api/protected/receptions/rec_123/distributions

✅ Attendu: Array de tous les StockRayons
```

### Test 6: Stock par rayon
```javascript
GET /api/protected/produits/prod_001/stock-par-rayon?magasinId=mag_1

✅ Attendu: Stocks par rayon triés FIFO
```

---

## 📊 MONITORING & VÉRIFICATION

### Vérifier les données créées

```javascript
// MongoDB
use gestion_stock

// 1. Vérifier Reception
db.receptions.findOne({ _id: ObjectId("...") })
// Doit avoir: quantite, distributions array, statutReception

// 2. Vérifier StockRayons
db.stockrayons.find({ receptionId: ObjectId("...") })
// Doit avoir: quantiteInitiale, quantiteActuelle, rayonId, statut

// 3. Vérifier Rayons
db.rayons.findOne({ _id: ObjectId("...") })
// Doit avoir: quantiteActuelle = SUM(StockRayons.quantiteActuelle)

// 4. Vérifier Mouvements
db.stockmovements.find({ type: "RECEPTION" })
// Doit avoir: type=RECEPTION, quantite, dateDocument
```

---

## 🔍 TROUBLESHOOTING

### Problème: "rayonId required" lors de POST
**Cause**: Ancien format utilisé sans `distributions`
**Solution**: Ajouter `distributions: [{ rayonId, quantite }]` dans la requête

### Problème: "Rayon non trouvé"
**Cause**: `rayonId` invalide dans distributions
**Solution**: Vérifier que les rayonId existent dans la base

### Problème: "Dépasse capacité"
**Cause**: La somme quantitéActuelle + nouvelle > capaciteMax
**Solution**: 
- Vérifier capaciteMax du rayon
- Distribuer sur plusieurs rayons
- Libérer de l'espace avant réception

### Problème: StockRayons pas créés
**Cause**: Erreur pendant la création
**Solution**: Vérifier les logs de la route API

---

## 📚 FICHIERS MODIFIÉS/CRÉÉS

### ✅ Créés
- `models/stockRayon.js` (amélioré)
- `services/receptionService.js` (nouveau)
- `services/stockRayonService.js` (nouveau)
- `pages/stock/modal_reception_distribution.php` (nouveau)
- `docs/STOCKRAYON_SYSTEM.md` (nouveau)
- `docs/ARCHITECTURE_STOCKRAYON.md` (nouveau)

### 📝 Modifiés
- `models/reception.js` (ajout distributions, statutReception)
- `routes/protected.js` (à intégrer - voir étape 1 & 2)

---

## 🎯 CHECKLIST INTÉGRATION

- [ ] Fichiers créés copiés dans `/models`, `/services`, `/pages`
- [ ] `models/reception.js` modifié avec distributions
- [ ] `services/receptionService.js` importé dans routes/protected.js
- [ ] Nouveaux endpoints ajoutés à routes/protected.js
- [ ] Modal distribution incluait dans les pages
- [ ] Migration des réceptions existantes exécutée
- [ ] Tests des 6 cas passants
- [ ] Logs vérifiés en développement
- [ ] Documentation lue par l'équipe
- [ ] Déploiement staging

---

## 💬 QUESTIONS?

Voir:
- `docs/STOCKRAYON_SYSTEM.md` - Guide complet
- `docs/ARCHITECTURE_STOCKRAYON.md` - Architecture détaillée
- Code commenté dans `services/receptionService.js`
