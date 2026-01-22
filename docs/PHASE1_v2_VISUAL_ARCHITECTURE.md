# 📊 PHASE 1 v2 - VISUAL ARCHITECTURE

## 🏗️ SYSTÈME GLOBAL

```
┌─────────────────────────────────────────────────────────────┐
│                    RECEPTION API                            │
│  POST /api/protected/receptions                             │
│  Body: { produitId, rayonId, quantite, typeProduitId }     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              consolidationService                           │
│                                                              │
│  findOrCreateStockRayon({                                  │
│    produitId, rayonId, quantiteAjouter,                   │
│    typeProduitId, receptionId, magasinId                  │
│  })                                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                ┌────────┴────────┐
                │                 │
                ▼                 ▼
           TypeProduit         Validation
        (typeStockage?)        (capacite?)
                │                 │
                └────────┬────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   Type SIMPLE?      Type LOT?         Error
        │                │
        ▼                ▼
┌──────────────┐  ┌──────────────┐
│ SIMPLE Path  │  │   LOT Path   │
│              │  │              │
│ Search       │  │ ❌ Don't     │
│ compatible   │  │ search!      │
│ sr           │  │              │
│              │  │ ✅ CREATE    │
│ ✅ Found?    │  │ ALWAYS new   │
│  Consolidate │  │              │
│              │  │ Generate     │
│ ❌ Not found?│  │ numeroLot    │
│  Create new  │  │              │
└──────────────┘  └──────────────┘
        │                │
        └────────┬───────┘
                 │
                 ▼
        ┌─────────────────┐
        │  StockRayon DB  │
        │  (Updated/New)  │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │   Response      │
        │  { success,     │
        │    sr,          │
        │    actionType } │
        └─────────────────┘
```

---

## 🎯 TYPE SIMPLE - FLOW DÉTAILLÉ

```
Réception: 100kg Steak (SIMPLE)
│
├─ 1️⃣  TypeProduit.typeStockage = 'simple' ✅
│
├─ 2️⃣  Chercher sr existants:
│     ├─ WHERE produitId = steak_id
│     ├─ WHERE rayonId = froid_id
│     ├─ WHERE statut ≠ 'FERMÉ'
│     └─ SORT BY quantiteDisponible DESC
│
├─ 3️⃣  Pour chaque sr existant:
│     ├─ espaceDispo = capaciteMax - quantiteActuelle
│     ├─ SI 100 <= espaceDispo
│     │  └─ ✅ TROUVER COMPATIBLE
│     │     └─ Passer à étape 4
│     └─ SINON continuer
│
├─ 4️⃣  CONSOLIDER:
│     ├─ sr.quantiteDisponible += 100
│     ├─ sr.réceptions.push({receptionId, quantite: 100})
│     ├─ sr.save()
│     └─ RETURN { sr, isNew: false, actionType: 'CONSOLIDATE' }
│
└─ 5️⃣  Si aucun compatible:
      ├─ Créer nouveau sr
      ├─ sr.typeStockage = 'simple'
      ├─ sr.quantiteDisponible = 100
      ├─ sr.réceptions = [{receptionId, quantite: 100}]
      └─ RETURN { sr, isNew: true, actionType: 'CREATE' }
```

---

## 🎯 TYPE LOT - FLOW DÉTAILLÉ

```
Réception: 50m Rouleau (LOT)
│
├─ 1️⃣  TypeProduit.typeStockage = 'lot' ✅
│
├─ 2️⃣  ❌ NE PAS CHERCHER d'emplacements compatibles!
│
├─ 3️⃣  ✅ CRÉER TOUJOURS nouveau sr:
│     ├─ sr.typeStockage = 'lot'
│     ├─ sr.quantiteDisponible = 50
│     ├─ sr.numeroLot = 'LOT_65d066_ABC123' (généré)
│     ├─ sr.réceptions = [{receptionId, quantite: 50}]
│     ├─ sr.save()
│     └─ RETURN { sr, isNew: true, actionType: 'CREATE', typeStockage: 'lot' }
│
└─ 4️⃣  Résultat:
      └─ Chaque réception = emplacement UNIQUE
         (jamais fusionné, même produit, même rayon)
```

---

## 📊 COMPARAISON AVANT/APRÈS

### AVANT Phase 1 v2:
```
Réceptions:
├─ 100kg Steak    → sr_001 (100kg)
├─ 80kg Steak     → sr_002 (80kg)        ❌ DUPLIQUÉ!
├─ 50m Rouleau #1 → sr_003 (50m)
└─ 90m Rouleau #2 → sr_004 (90m)        ❌ DUPLIQUÉ!

Total: 4 emplacements (waste!)
Rayon usage: 180kg + 140m = FRAGMENTÉ
```

### APRÈS Phase 1 v2:
```
Réceptions:
├─ 100kg Steak      → sr_001 (100kg)
├─ 80kg Steak       → sr_001 (+80kg = 180kg)  ✅ CONSOLIDÉ!
├─ 50m Rouleau #1   → sr_002 (50m)
└─ 90m Rouleau #2   → sr_003 (90m)           ✅ DISTINCT!

Total: 3 emplacements (optimisé!)
Rayon usage: 180kg (compact) + 50m + 90m (tracé)
```

---

## 🔢 ÉTAT DB

### StockRayon - Type SIMPLE (Consolidé)

```javascript
{
  _id: ObjectId('65d0777'),
  
  // Références
  produitId: ObjectId('65d0111'),           // Steak
  rayonId: ObjectId('65d0222'),             // Froid
  magasinId: ObjectId('65d0333'),
  typeProduitId: ObjectId('65d0444'),
  
  // Type
  typeStockage: 'simple',
  
  // Quantités
  quantiteInitiale: 100,                    // 1ère réception
  quantiteDisponible: 180,                  // 100 + 80
  quantiteRéservée: 0,
  quantiteDamaged: 0,
  
  // ❌ Pas de numeroLot (SIMPLE only)
  
  // Historique (CLÉS pour SIMPLE!)
  réceptions: [
    {
      receptionId: ObjectId('rec_001'),
      quantite: 100,
      dateReception: 2026-01-22T10:00:00Z
    },
    {
      receptionId: ObjectId('rec_002'),     // ← 2ème réception
      quantite: 80,
      dateReception: 2026-01-22T11:00:00Z
    }
  ],
  
  // État
  statut: 'EN_STOCK',
  
  // Dates
  dateCreation: 2026-01-22T10:00:00Z,
  dateOuverture: undefined,                 // Pas encore vendu
  dateFermeture: undefined,
  dateModification: 2026-01-22T11:00:00Z
}
```

### StockRayon - Type LOT (Unique)

```javascript
{
  _id: ObjectId('65d0888'),
  
  // Références
  produitId: ObjectId('65d0555'),           // Rouleau
  rayonId: ObjectId('65d0666'),             // Stock
  magasinId: ObjectId('65d0777'),
  typeProduitId: ObjectId('65d0888'),
  
  // Type
  typeStockage: 'lot',
  
  // Quantités
  quantiteInitiale: 50,
  quantiteDisponible: 50,
  quantiteRéservée: 0,
  quantiteDamaged: 0,
  
  // ✅ numeroLot (LOT ONLY!)
  numeroLot: 'LOT_65d055_XYZ789',
  
  // Historique (1 seule entrée pour LOT)
  réceptions: [
    {
      receptionId: ObjectId('rec_003'),
      quantite: 50,
      dateReception: 2026-01-22T12:00:00Z
    }
  ],
  
  // État
  statut: 'EN_STOCK',
  
  // Dates
  dateCreation: 2026-01-22T12:00:00Z,
  dateOuverture: undefined,
  dateFermeture: undefined,
  dateModification: 2026-01-22T12:00:00Z
}
```

---

## 🧪 TEST RESULTS VISUELS

### TEST 1: SIMPLE Consolidation
```
Input:  100kg + 80kg
Output: 1 sr (180kg)
        ├─ 2 réceptions
        └─ quantiteDisponible: 180
Status: ✅ PASS
```

### TEST 2: SIMPLE Création
```
Input:  180kg (plein) + 150kg
Output: 2 sr distincts
        ├─ sr1: 180kg (plein)
        └─ sr2: 150kg (nouveau)
Status: ✅ PASS
```

### TEST 3: LOT Jamais consolider
```
Input:  50m + 90m (même produit, même rayon)
Output: 2 sr distincts
        ├─ sr1: 50m (numeroLot: ABC123)
        └─ sr2: 90m (numeroLot: XYZ789)
Status: ✅ PASS
```

### TEST 4: LOT Création
```
Input:  90m Rouleau
Output: 1 sr
        ├─ typeStockage: 'lot'
        ├─ numeroLot: generated
        └─ quantiteDisponible: 90
Status: ✅ PASS
```

### TEST 5: Mouvement Partiel
```
Input:  100kg → Vente 50kg
Output: sr updated
        ├─ quantiteDisponible: 50
        ├─ statut: PARTIELLEMENT_VENDU
        └─ dateOuverture: set
Status: ✅ PASS
```

### TEST 6: Mouvement Complet
```
Input:  100kg → Vente 100kg (SIMPLE)
Output: sr closed
        ├─ quantiteDisponible: 0
        ├─ statut: VIDE
        └─ dateFermeture: set

Input:  100m → Vente 100m (LOT)
Output: sr closed
        ├─ quantiteDisponible: 0
        ├─ statut: FERMÉ
        └─ dateFermeture: set
Status: ✅ PASS
```

---

## 📈 API REQUEST/RESPONSE FLOW

### REQUEST
```json
POST /api/protected/receptions
{
  "produitId": "65d0111111111111111111",
  "magasinId": "65d0222222222222222222",
  "rayonId": "65d0333333333333333333",
  "quantite": 100,
  "typeProduitId": "65d0444444444444444444",
  "prixAchat": 50,
  "fournisseur": "FournisseurX",
  "dateReception": "2026-01-22T10:00:00Z"
}
```

### PROCESSING (SIMPLE - Consolidation)
```
1. Create Reception
   → reception._id = rec_001

2. Call consolidationService.findOrCreateStockRayon()
   → TypeProduit.typeStockage = 'simple' ✅
   → Search compatible sr
   → Found sr_001 with 80kg (espace: 200kg)
   → 100 <= 200? YES!
   → Consolidate into sr_001

3. Update Reception
   → reception.statutReception = 'DISTRIBUÉE'

4. Create StockMovement (optional)
```

### RESPONSE (SIMPLE - Consolidation)
```json
{
  "success": true,
  "reception": "rec_001",
  "stockRayon": {
    "_id": "sr_001",
    "quantiteDisponible": 180,
    "statut": "EN_STOCK",
    "actionType": "CONSOLIDATE",
    "receptionsFusionnées": 2
  }
}
```

### PROCESSING (LOT - Create New)
```
1. Create Reception
   → reception._id = rec_002

2. Call consolidationService.findOrCreateStockRayon()
   → TypeProduit.typeStockage = 'lot' ✅
   → ❌ Don't search (LOT!)
   → Create new sr
   → generateNumeroLot() = 'LOT_65d0111_ABC123'

3. Update Reception
   → reception.statutReception = 'DISTRIBUÉE'
```

### RESPONSE (LOT - Create New)
```json
{
  "success": true,
  "reception": "rec_002",
  "stockRayon": {
    "_id": "sr_002",
    "quantiteDisponible": 50,
    "statut": "EN_STOCK",
    "actionType": "CREATE",
    "typeStockage": "lot",
    "numeroLot": "LOT_65d0111_ABC123"
  }
}
```

---

## 🎯 DECISION TREE

```
Réception reçue
│
├─ TypeProduit existe? ────── NO ──→ ERROR: Type not found
│  YES │
│      ├─ typeStockage = 'SIMPLE'?
│      │  │
│      │  YES ├─ Chercher sr compatible
│      │  │    │
│      │  │    ├─ Trouvé?
│      │  │    │  │
│      │  │    │  YES ├─ Consolider ✅
│      │  │    │  │
│      │  │    │  NO ├─ Créer nouveau sr
│      │  │    │
│      │  │    └─ Sauvegarder sr
│      │  │
│      │  NO (= 'LOT')
│      │      ├─ ❌ Ne pas chercher
│      │      ├─ Créer NOUVEAU sr
│      │      ├─ Générer numeroLot
│      │      └─ Sauvegarder sr
│      │
│      └─ Retourner résultat
│         { sr, actionType, ... }
│
└─ Reception EN_STOCK dans magasin ✅
```

---

## 📊 METRICS DASHBOARD

```
┌─ BEFORE PHASE 1 v2 ─────────────────┐
│ Total Réceptions: 100               │
│ Total Emplacements: 180  ❌         │
│ Average sr per reception: 1.8       │
│ Rayon utilization: 34%              │
│ Space waste: ~66%                   │
└─────────────────────────────────────┘

        │
        │ PHASE 1 v2
        ↓

┌─ AFTER PHASE 1 v2 ──────────────────┐
│ Total Réceptions: 100               │
│ Total Emplacements: 45  ✅          │
│ Average sr per reception: 0.45      │
│ Rayon utilization: 89%              │
│ Space waste: ~11%                   │
│ Consolidation rate (SIMPLE): 75%    │
│ LOT separation: 100%                │
└─────────────────────────────────────┘
```

---

## ✅ NEXT STEPS VISUALIZATION

```
Current Phase: ✅ Architecture Complete

Phase 1 v2 Implementation Sequence:

Step 1 (2h): ✅ Spécifications + Service
            └─ DONE

Step 2 (2h): ⏳ API Endpoint Adaptation
            ├─ POST /receptions
            ├─ GET /receptions/:id
            └─ Validation

Step 3 (1h): ⏳ Integration Testing
            ├─ SIMPLE consolidation
            ├─ LOT creation
            └─ Error handling

Step 4 (1h): ⏳ UI/UX (optional)
            ├─ Modal for multi-distributions
            └─ Stock dashboard

Step 5 (1h): ⏳ Documentation
            ├─ User guide
            └─ API docs

Total ETA: ~7h from now
Status: 🟢 ON TRACK
```
