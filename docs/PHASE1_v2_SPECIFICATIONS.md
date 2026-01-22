# 📋 PHASE 1 v2 - SPÉCIFICATIONS TECHNIQUES

**Date**: 22 janvier 2026  
**Version**: Phase 1 - Smart Warehousing (SIMPLE + LOT support)  
**Status**: Ready for Implementation

---

## 🎯 OBJECTIF PHASE 1 v2

Implémenter la logique d'entreposage intelligente avec:
- ✅ Consolidation pour Type SIMPLE
- ✅ Emplacement unique pour Type LOT
- ✅ Groupage par type produit
- ✅ Réutilisation emplacements vides
- ✅ Fusion petites quantités (SIMPLE only)

---

## 📊 LOGIQUE CORE

### Type SIMPLE (Viande, Légumes, Liquides)
```
Reception + 1 emplacement existant compatible = FUSIONNER
├─ Même produit
├─ Même rayonId
├─ Espace disponible
└─ Type = "SIMPLE"
```

### Type LOT (Rouleaux, Cartons, Pièces)
```
Reception = TOUJOURS 1 nouvel emplacement
├─ Jamais consolider
├─ Chaque lot = unique
├─ numeroLot distinct
└─ Type = "LOT"
```

---

## 🔄 ALGORITHME PRINCIPAL

```
RECEPTION(quantite, produitId, rayonId, receptionId)
  │
  ├─ 1. Récupérer TypeProduit
  │
  ├─ 2. SI typeStockage === "LOT"
  │     └─ CRÉER nouveau StockRayon (pas de fusion)
  │
  └─ 3. SI typeStockage === "SIMPLE"
       ├─ Chercher emplacements existants
       │  ├─ Même produit
       │  ├─ Même rayon
       │  ├─ Non fermé
       │  └─ Trier par quantiteActuelle DESC
       │
       ├─ Pour chaque emplacement:
       │  ├─ Calculer libre = capaciteMax - quantiteActuelle
       │  ├─ SI quantite <= libre
       │  │  └─ FUSIONNER (UPDATE sr, ajouter réception)
       │  │
       │  └─ SINON continuer
       │
       └─ Si aucun compatible
          └─ CRÉER nouveau StockRayon
```

---

## 💾 MODÈLES MODIFIÉS

### StockRayon (ENRICHI)

```javascript
{
  _id: ObjectId,
  
  // Références
  receptionId: ObjectId,              // UNE seule pour LOT
  rayonId: ObjectId,
  produitId: ObjectId,
  typeProduitId: ObjectId,
  magasinId: ObjectId,
  
  // Type de stockage (copié de TypeProduit)
  typeStockage: "simple" | "lot",
  
  // Quantités
  quantiteInitiale: Number,           // Première quantité reçue
  quantiteActuelle: Number,           // Après mouvements
  quantiteReservee: Number,
  
  // Pour LOT uniquement
  numeroLot: String,                  // "ROU_ROUGE_001" unique
  dateCreation: Date,
  
  // Pour SIMPLE uniquement (fusion)
  réceptions: [{                       // Array de réceptions fusionnées
    receptionId: ObjectId,
    quantite: Number,
    date: Date
  }],
  
  // État
  statut: "EN_STOCK" | "PARTIELLEMENT_VENDU" | "VIDE" | "FERMÉ",
  dateOuverture: Date,                // Quand 1ère consommation
  dateFermeture: Date,                // Quand complètement consommé
  
  // Audit
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔑 MÉTHODES SERVICE

### `findOrCreateStockRayon(rayonId, produitId, quantiteAjouter, typeProduitId, receptionId)`

**Input**:
- rayonId: destination rayon
- produitId: le produit
- quantiteAjouter: quantité de la réception
- typeProduitId: type du produit
- receptionId: la réception source

**Output**:
- StockRayon créé ou fusionné

**Logic**:
1. Récupérer TypeProduit + capaciteMax
2. SI type === "LOT" → créer nouveau sr
3. SI type === "SIMPLE" → chercher compatible + fusionner si possible
4. Sinon créer nouveau sr

---

### `updateStockQuantityOnMovement(stockRayonId, quantiteVendue)`

**Quand**: Mouvement de stock (vente, déchets, etc.)

**Logic**:
1. sr.quantiteActuelle -= quantiteVendue
2. SI quantiteActuelle === 0:
   - sr.statut = "VIDE" (SIMPLE) ou "FERMÉ" (LOT)
   - sr.dateFermeture = now
3. SI quantiteActuelle > 0 et < quantiteInitiale:
   - sr.statut = "PARTIELLEMENT_VENDU"
   - sr.dateOuverture = now (si premier mouvement)

---

### `validateStockRayonCreation(rayonId, typeProduitId, quantite)`

**Quand**: Avant créer nouveau StockRayon

**Validations**:
1. Rayon existe?
2. Type produit autorisé dans rayon?
3. quantite <= TypeProduit.capaciteMax?
4. Rayon a emplacements libres? (compter sr existants)

**Return**: {valid: boolean, message: string}

---

## 🎯 EXEMPLE COMPLET

### Scenario 1: Type SIMPLE (Consolidation)

```
State Before:
├─ sr_001: 100kg Viande (rayon_froid)
├─ sr_002: 60kg Volaille (rayon_froid)
└─ Rayon Froid: 160/1000kg

Réception: 80kg Viande

Algorithme:
1. typeProduit.typeStockage = "SIMPLE" ✅
2. Chercher sr existants:
   ├─ sr_001: 100kg Viande (libre: 100kg)
   │  └─ 80kg <= 100kg? OUI!
   └─ ✅ CONSOLIDATE

3. sr_001.quantiteActuelle: 100 → 180kg
4. sr_001.réceptions.push(rec_nouvelle)

Result:
├─ sr_001: 180kg Viande (2 réceptions)
├─ sr_002: 60kg Volaille
└─ Rayon Froid: 240/1000kg
Emplacements: 2 utilisés ✅
```

### Scenario 2: Type LOT (Jamais fusionner)

```
State Before:
├─ sr_001: Rouleau Bleu #001 (50m)
├─ sr_002: Rouleau Bleu #002 (0m - FERMÉ)
└─ Rayon Stock: 50/1000m

Réception: Rouleau Bleu #003 (90m)

Algorithme:
1. typeProduit.typeStockage = "LOT" ✅
2. ❌ NE PAS chercher sr existants
3. CRÉER sr_003 (nouveau)

Result:
├─ sr_001: 50m Rouleau #001
├─ sr_002: 0m Rouleau #002 (FERMÉ)
├─ sr_003: 90m Rouleau #003 (NOUVEAU)
└─ Rayon Stock: 140/1000m
Emplacements: 3 utilisés ❌
Pas de fusion
```

### Scenario 3: Type SIMPLE (Création nouveau)

```
State Before:
├─ sr_001: 180kg Viande (rayon_froid) PLEIN!
└─ Rayon Froid: 180/1000kg

Réception: 150kg Viande

Algorithme:
1. typeProduit.typeStockage = "SIMPLE" ✅
2. Chercher sr existants:
   └─ sr_001: 180kg (libre: 20kg)
      └─ 150kg <= 20kg? NON!
3. ❌ Aucun compatible
4. CRÉER sr_002 (nouveau)

Result:
├─ sr_001: 180kg Viande
├─ sr_002: 150kg Viande (NOUVEAU)
└─ Rayon Froid: 330/1000kg
Emplacements: 2 utilisés ✅
Consolidation non possible (plein)
```

---

## 📝 API ENDPOINT MODIFIÉ

### POST /api/protected/receptions

**Input**:
```javascript
{
  produitId,
  magasinId,
  rayonId,          // Distribution primaire
  quantite,
  prixAchat,
  fournisseur,
  dateReception,
  // ...autres champs
}
```

**Process**:
1. Créer Reception en DB
2. Appeler `findOrCreateStockRayon()`
3. Créer/Update StockRayon
4. Mettre à jour Rayon.quantiteActuelle
5. Créer StockMovement

**Output**:
```javascript
{
  success: true,
  reception: {...},
  stockRayon: {
    _id,
    quantiteActuelle,
    statut,
    receptionsFusionnées?: [...]
  }
}
```

---

## 🧪 TESTS REQUIS

### Test 1: Type SIMPLE - Consolidation
```
Input: 100kg + 80kg Viande
Expected: 1 sr (180kg)
Check: sr.réceptions.length === 2
```

### Test 2: Type SIMPLE - Création
```
Input: 180kg (sr plein) + 150kg Viande
Expected: 2 sr (180kg + 150kg)
Check: sr1.quantiteActuelle === 180, sr2.quantiteActuelle === 150
```

### Test 3: Type LOT - Jamais fusionner
```
Input: Rouleau #1 (50m) + Rouleau #2 (90m)
Expected: 2 sr distincts
Check: sr1.numeroLot !== sr2.numeroLot
```

### Test 4: Type LOT - Création
```
Input: Rouleau Rouge (90m)
Expected: 1 sr nouveau
Check: sr.numeroLot === "ROU_ROUGE_..."
```

### Test 5: Mouvements - Vente
```
Input: sr (100kg) → Vente 50kg
Expected: sr.quantiteActuelle = 50
Check: sr.statut === "PARTIELLEMENT_VENDU"
```

### Test 6: Mouvements - Complètement vide
```
Input: sr (100kg) → Vente 100kg
Expected: sr.quantiteActuelle = 0
Check: sr.statut === "FERMÉ" (LOT) ou "VIDE" (SIMPLE)
```

---

## ✅ VALIDATION CÔTÉ SERVICE

### Avant créer reception:
```javascript
✅ produitId existe
✅ rayonId existe
✅ quantite > 0
✅ prixAchat >= 0
✅ TypeProduit existe
✅ Rayon accepte ce type
✅ quantite <= TypeProduit.capaciteMax
```

---

## 📦 FICHIERS À CRÉER/MODIFIER

### Créer:
```
services/consolidationService.js     (NEW)
```

### Modifier:
```
models/stockRayon.js                 (ENRICHIR)
services/receptionService.js         (ADAPTER)
routes/protected.js                  (POST /receptions)
```

---

## 🎯 TIMELINE IMPLÉMENTATION

```
Jour 1:
├─ 09h-11h: Adapter modèles
├─ 11h-13h: Créer consolidationService
└─ 14h-17h: Tests unitaires

Jour 2:
├─ 09h-11h: Adapter API endpoint
├─ 11h-13h: Tests intégration
└─ 14h-17h: UI / Debug

Jour 3:
├─ 09h-12h: Tests complets (6 cas)
├─ 13h-15h: Performance check
└─ 15h-17h: Documentation + cleanup
```

---

## ✅ CHECKLIST AVANT CODE

- [ ] Spécifications approuvées
- [ ] Modèles compris
- [ ] Algorithme clair
- [ ] Tests planifiés
- [ ] Team alignée

**Status: READY FOR CODE! 🚀**
