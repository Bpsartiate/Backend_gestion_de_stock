# 📡 API Endpoints Reference (v2.8 - April 8, 2026)

## Réceptions (CRITICAL)

### POST /receptions - Create Reception
**Purpose:** Create reception (SIMPLE or LOT)  
**NEW:**
- Auto-creates LOTs if `nombrePieces` present
- v2.7: Checks if `nombrePieces` OR `type === 'lot'`
- v2.6+: Strict validation rejects incomplete LOT data

```bash
POST http://localhost:3000/api/protected/receptions
Authorization: Bearer TOKEN
Content-Type: application/json

# SIMPLE Reception
{
  "produitId": "...",
  "magasinId": "...",
  "rayonId": "...",
  "quantite": 100,
  "prixAchat": 50,
  "fournisseur": "GLOBAL",
  "dateReception": "2026-04-08T00:00:00Z"
}

# LOT Reception (WILL AUTO-CREATE LOTS)
{
  "produitId": "...",
  "magasinId": "...", 
  "rayonId": "...",
  "quantite": 250,
  "prixAchat": 15000,
  "typeProduitId": "...",
  "nombrePieces": 5,           ← REQUIRED
  "quantiteParPiece": 50,      ← REQUIRED
  "uniteDetail": "metre",      ← REQUIRED
  "prixParUnite": 15000,       ← REQUIRED
  "type": "lot",               ← OPTIONAL (v2.7: not needed if nombrePieces present)
  "fournisseur": "GLOBAL",
  "dateReception": "2026-04-08T00:00:00Z"
}

# Response (LOT):
{
  "success": true,
  "message": "✅ Réception LOT enregistrée - 5 LOTs créés automatiquement",
  "reception": {...},
  "lotsCreatedCount": 5,
  "lotsCreated": [
    { "_id": "...", "quantiteInitiale": 50, "status": "complet" },
    ...
  ]
}
```

### GET /receptions - List Receptions
**NEW v2.7:** Returns `lots[]` for each LOT-type reception

```bash
GET http://localhost:3000/api/protected/receptions?magasinId=...&page=1&limit=50
Authorization: Bearer TOKEN

# Response:
{
  "receptions": [
    {
      "_id": "...",
      "nombrePieces": 5,
      "lots": [                  ← NEW v2.7
        {
          "_id": "...",
          "quantiteInitiale": 50,
          "quantiteRestante": 50,
          "prixParUnite": 15000,
          "uniteDetail": "metre"
        },
        ...
      ],
      "lotsCount": 5             ← NEW v2.7
    }
  ]
}
```

### GET /receptions/:receptionId - Get Reception Details
**NEW v2.7:** Returns LOTs + verification flag

```bash
GET http://localhost:3000/api/protected/receptions/69d3dfac1b64e34740a016a5
Authorization: Bearer TOKEN

# Response:
{
  "reception": {
    "_id": "...",
    "nombrePieces": 5,
    "lots": [                    ← NEW v2.7
      { "_id": "...", "quantiteInitiale": 50, ... }
    ],
    "lotsCount": 5,              ← NEW v2.7
    "lotsCreatedSuccessfully": true  ← NEW v2.7 (lotsCount === nombrePieces)
  }
}
```

### POST /receptions/fix/missing-lots - Fix Orphaned LOTs
**NEW v2.7:** Creates missing LOTs for existing receptions

```bash
POST http://localhost:3000/api/protected/receptions/fix/missing-lots?convertSimpleToLot=true
Authorization: Bearer TOKEN

# Parameters:
# - convertSimpleToLot=true (optional): Also converts SIMPLE→LOT receptions

# Response:
{
  "success": true,
  "message": "✅ 8 réceptions corrigées - 18 LOTs créés",
  "receptionsFixed": 8,
  "lotsCreatedGlobal": 18,
  "results": [
    {
      "receptionId": "...",
      "produit": "Rouleau Rose",
      "lotsCreated": 5,
      "status": "FIXED ✅",
      "type": "nombrePieces_orphaned"
    }
  ]
}
```

---

## Ventes

### POST /ventes - Create Sale
**Fixed v2.4:** Now uses correct LOT quantity (not hardcoded 1)

```bash
POST http://localhost:3000/api/protected/ventes
Authorization: Bearer TOKEN
Content-Type: application/json

# LOT Sale
{
  "lots": [
    {
      "lotId": "...",
      "quantite": 25              ← Uses quantiteParPiece from LOT
    }
  ],
  "prixUnitaire": 100,
  "totalVente": 2500,
  "modePaiement": "CASH"
}

# Response:
{
  "success": true,
  "vente": {
    "_id": "...",
    "lots": [...],
    "totalVente": 2500
  }
}
```

### GET /ventes - List Sales

```bash
GET http://localhost:3000/api/protected/ventes?magasinId=...
Authorization: Bearer TOKEN

# Returns list of sales with LOT details
```

---

## Produits

### GET /produits - List Products

```bash
GET http://localhost:3000/api/protected/produits?magasinId=...
Authorization: Bearer TOKEN

# Response includes:
{
  "produits": [
    {
      "_id": "...",
      "designation": "Rouleau Rose",
      "typeProduitId": {
        "nomType": "Rouleau",
        "typeStockage": "lot"      ← key: "lot" or "simple"
      },
      "quantiteActuelle": 210,
      "receptions": [...],         ← Recent receptions for this product
      "mouvements": [...]          ← Stock movements
    }
  ]
}
```

### GET /produits/:produitId - Get Product Details

```bash
GET http://localhost:3000/api/protected/produits/69d1f9f7339298d6f4bdcaff
Authorization: Bearer TOKEN

# Response includes full product data + receptions + movements
# See GET /produits for structure
```

### POST /produits - Create Product

```bash
POST http://localhost:3000/api/protected/produits
Authorization: Bearer TOKEN

{
  "designation": "Rouleau Bleu",
  "reference": "RLB-001",
  "typeProduitId": "...",        ← Must exist
  "prixUnitaire": 100,
  "magasinId": "..."
}
```

### PUT /produits/:produitId - Update Product

```bash
PUT http://localhost:3000/api/protected/produits/69d1f9f7339298d6f4bdcaff
Authorization: Bearer TOKEN

{
  "designation": "Rouleau Rose (Updated)",
  "prixUnitaire": 120
}
```

---

## Rayons (Shelves)

### GET /rayons - List Shelves

```bash
GET http://localhost:3000/api/protected/rayons?magasinId=...
Authorization: Bearer TOKEN

# Response:
{
  "rayons": [
    {
      "_id": "...",
      "nomRayon": "Rouleau",
      "capaciteMax": 10,
      "quantiteActuelle": 8,     ← Current occupancy (fixed in v2.3)
      "typeRayon": "ETAGERE"
    }
  ]
}
```

---

## Lots

### GET /lots - List LOTs

```bash
GET http://localhost:3000/api/protected/lots?receptionId=...
Authorization: Bearer TOKEN

# Response:
{
  "lots": [
    {
      "_id": "...",
      "quantiteInitiale": 50,
      "quantiteRestante": 50,
      "status": "complet",
      "dateReception": "2026-04-05T05:59:31.732Z",
      "prixParUnite": 10,
      "uniteDetail": "metre"
    }
  ]
}
```

---

## Authentification

### POST /api/public/auth/login - Login

```bash
POST http://localhost:3000/api/public/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "nom": "Akim",
    "email": "user@example.com"
  }
}
```

---

## Validation (v2.8 Frontend)

**LOTFields Required:**
- ✅ `nombrePieces` > 0
- ✅ `quantiteParPiece` > 0
- ✅ `uniteDetail` (not empty)
- ✅ `prixParUnite` (valid number)

**Validation Flow:**
1. Frontend validates (v2.8 pre-submit check)
2. Shows detailed error if any field missing
3. Blocks submit until ALL fields filled
4. Backend validates AGAIN (v2.6 strict validation)
5. Returns 400 if still invalid

---

## Error Responses

### Incomplete LOT Reception (v2.6+)
```json
{
  "success": false,
  "error": "❌ ERREUR CRITIQUE - Réception LOT incomplète!",
  "fields_required": ["nombrePieces", "quantiteParPiece", "uniteDetail", "prixParUnite"],
  "missing_fields": ["uniteDetail", "prixParUnite"],
  "received": {
    "nombrePieces": 5,
    "quantiteParPiece": 50,
    "uniteDetail": null,
    "prixParUnite": null
  }
}
```

### Missing Authentication
```json
{
  "status": 401,
  "message": "Non autorisé - Token invalide ou manquant"
}
```

### Rayon Capacity Exceeded
```json
{
  "success": false,
  "error": "❌ Capacité du rayon dépassée",
  "details": "Rayon peut contenir max 10 articles, actuels: 8, après ajout: 15"
}
```

---

## Testing with Postman

**Collection file:**
- `docs/Postman_Collection_Complete.json`

**Quick Test:**
1. Login → Get TOKEN
2. GET /produits → Verify products load
3. POST /receptions (LOT) → Verify LOTs auto-created
4. GET /receptions/:id → Verify LOTs returned
5. POST /receptions/fix/missing-lots → Verify orphaned LOTs created

---

## Status

✅ All v2.8 endpoints tested and working  
✅ LOT validation strict (frontend + backend)  
✅ GET endpoints return LOTs (v2.7)  
✅ Cleanup endpoint available (v2.7)  
✅ Mobile validation pre-submit (v2.8)

**Last Updated:** April 8, 2026  
**Version:** 2.8
