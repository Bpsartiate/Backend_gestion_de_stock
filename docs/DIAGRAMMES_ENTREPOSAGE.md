# 🎨 DIAGRAMMES - SYSTÈME MULTI-RAYON

## 1️⃣ ARCHITECTURE GLOBALE

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION ENTREPOSAGE                  │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
            ┌───▼──┐      ┌───▼──┐      ┌──▼────┐
            │RAYONS│      │TYPES │      │PRODUIT│
            └──────┘      │PRODUIT      └────┬──┘
                          └───────┘           │
                              │               │
                    ┌──────────┴───────────┬──┘
                    │                      │
                ┌───▼────┐            ┌────▼────┐
                │RECEPTION              │STOCKRAYON
                └─┬──────┘            └────┬─────┘
                  │                        │
                  └────────────┬───────────┘
                               │
                        ┌──────▼──────┐
                        │STOCKMOUVEMENT
                        └──────────────┘
```

---

## 2️⃣ FLUX DE RÉCEPTION

### Flow détaillé (8 étapes)

```
USER
  │
  ├─► 1. Ouvre formulaire réception
  │
  ▼
┌──────────────────────────────────────┐
│ MODAL RÉCEPTION DISTRIBUTION         │
│ ┌────────────────────────────────┐  │
│ │ Produit: Viande (200kg)        │  │
│ │ Fournisseur: Fournisseur XYZ   │  │
│ │                                │  │
│ │ Distribution:                  │  │
│ │ ├─ Rayon A: 100kg (select)     │  │
│ │ ├─ Rayon B: 100kg (select)     │  │
│ │                                │  │
│ │ Progress: 200/200 ✅           │  │
│ │                                │  │
│ │ [Confirmer Distribution] ───┐  │  │
│ └────────────────────────────│─┘  │
└───────────────────────────────│────┘
                                │
                        ┌───────▼────────┐
                        │ 2. Valide:     │
                        │ • Sommes       │
                        │ • Capacité     │
                        └───────┬────────┘
                                │
                        ┌───────▼──────────────┐
                        │ 3. Crée Reception    │
                        │ + distributions      │
                        └───────┬──────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼────────┐  ┌───▼────────┐  ┌──▼─────────┐
        │4. StockRayon A │  │4. StockRay │  │4. STOCK    │
        │   100kg        │  │   100kg    │  │MOUVEMENT   │
        │   EN_STOCK     │  │   EN_STOCK │  │ +200kg     │
        └───────┬────────┘  └───┬────────┘  └──┬─────────┘
                │               │             │
                └───┬───────────┴─────────────┘
                    │
            ┌───────▼─────────┐
            │5. Maj Rayons:   │
            │ Rayon A: +100kg │
            │ Rayon B: +100kg │
            └───────┬─────────┘
                    │
            ┌───────▼─────────┐
            │✅ SUCCESS       │
            │Réception créée  │
            └─────────────────┘
```

---

## 3️⃣ RÉPARTITION DONNÉES

### Base de données

```
MONGODB
├─ Receptions
│  ├─ _id: reception_123
│  ├─ quantite: 200
│  ├─ distributions: [
│  │  { rayonId: rayon_A, quantite: 100 },
│  │  { rayonId: rayon_B, quantite: 100 }
│  │]
│  └─ statutReception: "DISTRIBUÉE"
│
├─ StockRayons
│  ├─ _id: sr_001
│  ├─ receptionId: reception_123
│  ├─ rayonId: rayon_A
│  ├─ quantiteInitiale: 100
│  ├─ quantiteActuelle: 100
│  └─ statut: "EN_STOCK"
│
│  ├─ _id: sr_002
│  ├─ receptionId: reception_123
│  ├─ rayonId: rayon_B
│  ├─ quantiteInitiale: 100
│  ├─ quantiteActuelle: 100
│  └─ statut: "EN_STOCK"
│
├─ Rayons
│  ├─ _id: rayon_A
│  ├─ capaciteMax: 1000
│  ├─ quantiteActuelle: 950 ← SUM(StockRayons)
│  └─ typesProduitsAutorises: [viande]
│
│  ├─ _id: rayon_B
│  ├─ capaciteMax: 1000
│  ├─ quantiteActuelle: 850 ← SUM(StockRayons)
│  └─ typesProduitsAutorises: [viande]
│
└─ StockMovements
   └─ type: "RECEPTION"
      quantite: 200
      dateDocument: 2026-01-22
```

---

## 4️⃣ SCÉNARIO: DÉPASSEMENT CAPACITÉ

```
POST /receptions {
  quantite: 300,
  distributions: [
    { rayonId: rayon_A, quantite: 300 }
  ]
}

Validation:
1. Somme: 300 = 300 ✅
2. Rayon A:
   - Capacité: 1000
   - Actuel: 950
   - Libre: 50
   - Demandé: 300
   
   300 > 50 ❌ ERREUR!

Response:
{
  "error": "Rayon dépasserait sa capacité: 1250/1000"
}
```

---

## 5️⃣ REQUÊTE/RÉPONSE COMPLÈTE

### Requête

```http
POST /api/protected/receptions
Content-Type: application/json
Authorization: Bearer <token>

{
  "produitId": "prod_001",
  "magasinId": "mag_1",
  "quantite": 200,
  "distributions": [
    {
      "rayonId": "rayon_A",
      "quantite": 100,
      "unitePrincipale": "kg"
    },
    {
      "rayonId": "rayon_B",
      "quantite": 100,
      "unitePrincipale": "kg"
    }
  ],
  "fournisseur": "Fournisseur XYZ",
  "prixAchat": 15,
  "dateReception": "2026-01-22"
}
```

### Réponse

```json
{
  "success": true,
  "message": "Réception créée avec distributions",
  "reception": {
    "_id": "rec_12345",
    "quantite": 200,
    "distributions": [
      {
        "rayonId": "rayon_A",
        "quantite": 100,
        "statut": "EN_STOCK",
        "dateDistribution": "2026-01-22T10:30:00Z"
      },
      {
        "rayonId": "rayon_B",
        "quantite": 100,
        "statut": "EN_STOCK",
        "dateDistribution": "2026-01-22T10:30:00Z"
      }
    ]
  },
  "stockRayons": [
    {
      "_id": "sr_001",
      "rayonId": "rayon_A",
      "quantite": 100,
      "statut": "EN_STOCK"
    },
    {
      "_id": "sr_002",
      "rayonId": "rayon_B",
      "quantite": 100,
      "statut": "EN_STOCK"
    }
  ],
  "mouvement": "mov_789"
}
```

---

## 6️⃣ ÉTATS POSSIBLES - STOCKRAYON

```
┌──────────────────────────┐
│     StockRayon States    │
└──────────────────────────┘

         ┌─────────────────────┐
         │     EN_STOCK        │
         │ (Quantité complète) │
         └──────┬──────┬───────┘
                │      │
        Mouvement  Réservation
                │      │
    ┌───────────┘      └──────────┐
    │                             │
┌───▼──────────────────┐  ┌──────▼────┐
│PARTIELLEMENT_VENDU   │  │  RESERVE   │
│(Entre 0 et initial)  │  │(Quantité   │
│                      │  │ réservée)  │
└───┬──────────────────┘  └──────┬────┘
    │                           │
    └─────────────┬─────────────┘
                  │
              Consomme tout
                  │
            ┌─────▼────┐
            │   VIDE    │
            │(Quantité 0│
            └───────────┘
```

---

## 7️⃣ COMPARAISON AVANT/APRÈS

```
AVANT (ANCIEN SYSTÈME)
═════════════════════════════════════════════════════════

Reception {
  produitId,
  quantite: 200,
  rayonId: rayon_A  ← Single rayon seulement!
}

Rayon A: 200kg → PLEIN!
Rayon B: Rien


PROBLÈME: 
❌ 200kg tout dans un rayon
❌ Pas d'option pour distribuer
❌ Surcharge rapide


═════════════════════════════════════════════════════════


APRÈS (NOUVEAU SYSTÈME)
═════════════════════════════════════════════════════════

Reception {
  produitId,
  quantite: 200,
  distributions: [
    { rayonId: rayon_A, quantite: 100 },
    { rayonId: rayon_B, quantite: 100 }
  ]
}

Rayon A: 100kg (50% utilisé)
Rayon B: 100kg (50% utilisé)


AVANTAGE:
✅ Distribution équilibrée
✅ Respecte capacités
✅ Prévient surcharge
✅ Logique réaliste
```

---

## 8️⃣ CHEMINS DE REQUÊTE API

```
POST /api/protected/receptions
  ├─► receptionService.createReceptionWithDistributions()
  │   ├─► Valide input
  │   ├─► Crée Reception
  │   ├─► Crée StockRayons (via stockRayonService)
  │   ├─► Maj Rayons
  │   └─► Crée StockMovement

GET /api/protected/receptions/:id/distributions
  ├─► receptionService.getReceptionDistributions()
  └─► Retourne tous les StockRayons

GET /api/protected/produits/:id/stock-par-rayon?magasinId=mag_1
  ├─► receptionService.getProductStockByRayon()
  └─► Retourne stocks par rayon (FIFO)
```

---

## 9️⃣ INTERFACE UTILISATEUR

```
┌─ MODAL DISTRIBUTION ─────────────────────────────────┐
│                                                       │
│ 📦 Distribution de Réception                         │
│                                                       │
│ Produit: Viande | Quantité: 200kg | Date: 22/01    │
│                                                       │
│ ┌─ Distribution par rayon ──────────────────────┐  │
│ │                                               │  │
│ │ Rayon A [dropdown] | Quantité: 100 [input]   │  │
│ │ Libre: 100/1000                              │  │
│ │                                               │  │
│ │ Rayon B [dropdown] | Quantité: 100 [input]   │  │
│ │ Libre: 150/1000                              │  │
│ │                                               │  │
│ │ [+ Ajouter un rayon]                         │  │
│ └───────────────────────────────────────────────┘  │
│                                                       │
│ ┌─ Résumé ────────────────────────────────────────┐ │
│ │ Distribué: 200 / 200 kg ✅                     │ │
│ │ [████████████████████] 100%                    │ │
│ └──────────────────────────────────────────────────┘ │
│                                                       │
│ [Annuler] [Confirmer Distribution]                 │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## 🔟 MIGRATION DONNÉES

```
AVANT MIGRATION
═══════════════════════════════════════════════════

receptions: [
  { _id: rec_001, quantite: 200, rayonId: rayon_A }
  { _id: rec_002, quantite: 150, rayonId: rayon_B }
]

stockrayons: []  ← VIDE!

═══════════════════════════════════════════════════

APRÈS MIGRATION
═══════════════════════════════════════════════════

receptions: [
  { 
    _id: rec_001, 
    quantite: 200,
    distributions: [{rayonId: rayon_A, quantite: 200}],
    statutReception: "DISTRIBUÉE"
  },
  { 
    _id: rec_002, 
    quantite: 150,
    distributions: [{rayonId: rayon_B, quantite: 150}],
    statutReception: "DISTRIBUÉE"
  }
]

stockrayons: [
  { _id: sr_001, receptionId: rec_001, rayonId: rayon_A, quantite: 200 },
  { _id: sr_002, receptionId: rec_002, rayonId: rayon_B, quantite: 150 }
]

═══════════════════════════════════════════════════
```

---

## 📊 STATISTIQUES

```
Nouveau système offre:

✅ 0 → ∞ distributions par réception (scalable)
✅ 100% de validation automatique
✅ 0 risque de surcharge rayon
✅ 100% traçabilité FIFO
✅ ~4 nouveaux endpoints API
✅ ~7 nouveaux fichiers de doc
✅ 1 nouvelle UI (modal distribution)
```

**FIN DES DIAGRAMMES** 🎨
