# 🔄 Restructuration du Système de Stock par Rayon

## ✅ Changements effectués

### 1. **Nouveau Modèle: StockRayon** (`models/stockRayon.js`)
```javascript
{
  produitId,      // Référence au produit
  magasinId,      // Référence au magasin
  rayonId,        // Référence au rayon
  quantiteDisponible,
  quantiteRéservée,
  quantiteDamaged,
  réceptions[]    // FIFO: historique des réceptions
}
```

**Avantages:**
- ✅ Un produit peut être dans PLUSIEURS rayons
- ✅ Chaque rayon a sa propre quantité
- ✅ Historique FIFO des réceptions par rayon
- ✅ Gestion de la péremption précise

---

### 2. **Modèle Produit modifié** (`models/produit.js`)
- `rayonId` maintenant **optionnel** et DEPRECATED
- Sert juste de "rayon par défaut" pour l'affichage
- `quantiteActuelle` = **somme de tous les StockRayon**

---

### 3. **Endpoint POST /api/protected/receptions (modifié)**

**Ancien flux:**
```
Réception → Produit.rayonId = rayon Y ❌ Écrase le rayon!
```

**Nouveau flux:**
```
Réception → Crée/met à jour StockRayon(produit, rayon, quantite) ✅
         → Somme tous les StockRayon pour Produit.quantiteActuelle
         → Produit.rayonId ne change pas!
```

**Exemple concret:**
```
1. Créer Produit "Riz" → rayonId = RAYON-X

2. Réception 1: 100 Riz → RAYON-X
   └─ StockRayon(RIZ, RAYON-X) = 100

3. Réception 2: 50 Riz → RAYON-Y (autre rayon!)
   └─ StockRayon(RIZ, RAYON-Y) = 50
   └─ Produit.rayonId reste RAYON-X ✅

Résultat:
  Produit.quantiteActuelle = 100 + 50 = 150 ✅
  StockRayon(RIZ, RAYON-X) = 100
  StockRayon(RIZ, RAYON-Y) = 50
```

---

### 4. **Nouveaux endpoints**

#### `GET /api/protected/stock-rayons?magasinId=...&produitId=...`
Récupère le stock d'un produit par rayon
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "rayonId": { "nomRayon": "RAYON-X" },
      "quantiteDisponible": 100,
      "réceptions": [
        {
          "quantite": 100,
          "dateReception": "2025-01-01",
          "datePeremption": "2025-06-01"
        }
      ]
    },
    {
      "rayonId": { "nomRayon": "RAYON-Y" },
      "quantiteDisponible": 50,
      "réceptions": [...]
    }
  ],
  "summary": {
    "totalQuantite": 150,
    "nombreRayons": 2
  }
}
```

---

## 📋 TODO - À faire pour compléter

### [ ] Frontend - Affichage du stock
- [ ] Modifier `reception-history.js` pour afficher stock par rayon
- [ ] Ajouter colonne "Rayons" dans tableau produits
- [ ] Créer modal "Stock par Rayon" pour un produit

### [ ] Migration des données existantes
```javascript
// Script à exécuter une fois:
// Créer StockRayon pour toutes les réceptions existantes
```

### [ ] Gestion des mouvements
- [ ] Prélèvement par rayon (FIFO)
- [ ] Transfert entre rayons
- [ ] Destruction/Damage

### [ ] PUT /receptions/:id (édition)
- [ ] Adapter pour mettre à jour StockRayon

---

## 🔄 Logique après restructuration

### **Ajouter une réception**
```
POST /receptions
{
  produitId: "RIZ001",
  rayonId: "RAYON-Y",
  quantite: 50
}

Actions:
1. Créer Reception
2. Créer/Update StockRayon(RIZ001, RAYON-Y) += 50
3. Update Produit.quantiteActuelle = SUM(StockRayon)
```

### **Voir le stock**
```
GET /stock-rayons?produitId=RIZ001&magasinId=MAG-001

Résultat:
  StockRayon X: 100 unités
  StockRayon Y: 50 unités
  TOTAL: 150 unités
```

### **Préléver pour une commande** (futur)
```
Commande: 75 Riz
1. Chercher plus ancienne réception FIFO
   └─ ReceptionId A (RAYON-X) = 100 → Prélève 75
   └─ Reste 25 en RAYON-X
2. Update StockRayon(RIZ, RAYON-X) = 25
3. Produit.quantiteActuelle = 75 (100-25 + 50)
```

---

## 🎯 Prochaines étapes

1. ✅ **Modèle créé** - StockRayon.js
2. ✅ **Endpoint POST /receptions adapté**
3. ✅ **Endpoint GET /stock-rayons créé**
4. ⏳ **Frontend** - Afficher stock par rayon
5. ⏳ **Migration** - Données existantes
6. ⏳ **PUT /receptions** - Édition
7. ⏳ **Mouvements internes** - Transferts

**État: INFRASTRUCTURE PRÊTE ✅ - En attente du frontend**

