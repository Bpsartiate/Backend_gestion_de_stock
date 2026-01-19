# ✅ SYSTEM SIMPLE vs LOT - IMPLÉMENTATION COMPLÈTE

**Date**: 19 Janvier 2026  
**Status**: ✅ PRÊT POUR TESTS

---

## 📋 RÉSUMÉ DES MODIFICATIONS

### 1. **Modèles (Backend)**

#### ✅ models/typeProduit.js
```javascript
typeStockage: { 
  type: String, 
  enum: ['simple', 'lot'], 
  default: 'simple' 
}

unitePrincipaleStockage: String
// Exemple: "KILOGRAMME", "PIÈCE", "ROULEAU"

unitesVente: [String]
// Exemple pour LOT: ["PIÈCE", "MÈTRE"]
// Exemple pour SIMPLE: ["KILOGRAMME"]
```

#### ✅ models/lot.js
Modèle complet pour suivi individuel de chaque pièce:
- `quantiteInitiale`: Quantité reçue par pièce
- `quantiteRestante`: Décrémente à chaque vente
- `prixParUnite`: Prix fixé à la réception (flexible!)
- `uniteDetail`: Unité de mesure (MÈTRE, KG, etc)
- `status`: 'complet' → 'partiel_vendu' → 'epuise'

---

### 2. **Interface Utilisateur (Frontend)**

#### ✅ pages/stock/modal_stock_settings.php (Configuration Produits)

**Avant**: Table "Conversions d'Unités" complexe  
**Après**: Section simple "Type de Stockage"

**Nouveau formulaire**:
```
┌─ TYPE DE STOCKAGE ─────────────────┐
│ SIMPLE (viande, riz, etc)          │
│ ou                                  │
│ LOT (rouleaux, cartons, etc)        │
│                                    │
│ Unité Principale: [dropdown]       │
│                                    │
│ [SI LOT]                           │
│ Unités de Vente:                   │
│ ├─ [input] PIÈCE [delete]          │
│ ├─ [input] MÈTRE [delete]          │
│ └─ [button] + Ajouter Unité        │
└────────────────────────────────────┘
```

**JavaScript Functions** (modal_stock_settings.php):
- `updateUniteVenteVisibility()`: Affiche/cache les champs LOT
- `addUniteVente()`: Ajoute une nouvelle unité de vente
- `loadUniteVente()`: Charge les unités existantes
- `editCategory()`: Charge typeStockage et unitesVente
- `saveCategory()`: Envoie les données à l'API

#### ✅ pages/stock/modal_reception.php (Enregistrement Réception)

**Nouveau**: Section "Paramètres Lots" (caché par défaut)
```
┌─ PARAMÈTRES LOTS ──────────────────┐
│ Nombre de Pièces:        [input]   │
│ Quantité par Pièce:      [input]   │
│ Unité Détail:            [select]  │
│                                    │
│ (Ces champs apparaissent            │
│  SEULEMENT si produit=LOT)         │
└────────────────────────────────────┘
```

**Containers Dynamiques**:
- `simpleQuantityContainer`: Visible pour SIMPLE, caché pour LOT
- `lotContainer`: Visible pour LOT, caché pour SIMPLE

---

### 3. **Logique de Réception (assets/js/reception.js)**

#### ✅ Nouvelles Fonctions

**1. loadTypeProduitForReception(produitId)**
```javascript
// Charge le TypeProduit depuis l'API
// Détecte typeStockage
// Appelle showSimpleInterface() ou showLotInterface()
```

**2. showSimpleInterface()**
```javascript
// Affiche: quantiteReception (normal)
// Cache: lotContainer
// Label: "Kilogrammes", "Litres", etc
```

**3. showLotInterface()**
```javascript
// Cache: simpleQuantityContainer
// Affiche: lotContainer avec nombrePieces, quantiteParPiece, uniteDetail
// Remplit uniteDetail select avec unitesVente du TypeProduit
```

**4. createLotsForReception(reception, produitId)**
```javascript
// Crée N LOT records individuels (un par pièce)
// Pour chaque LOT:
//   - quantiteInitiale: quantiteParPiece
//   - prixParUnite: prixAchat
//   - uniteDetail: unité sélectionnée
//   - status: 'complet'
// Appelle POST /api/protected/lots pour chaque LOT
```

#### ✅ Validation Améliorée

**Avant**: Validation standard HTML5  
**Après**: Validation conditionnelle

```javascript
if (typeStockage === 'lot') {
  // Valide: nombrePieces, quantiteParPiece, uniteDetail
  // Ignore: quantiteReception (non utilisé)
} else {
  // Valide: quantiteReception
  // Ignore: nombrePieces, quantiteParPiece
}
```

---

### 4. **API Endpoints (Backend)**

#### ✅ POST /api/protected/lots (NOUVEAU)

Créé un LOT individuel:
```json
POST /api/protected/lots
{
  "magasinId": "...",
  "produitId": "...",
  "typeProduitId": "...",
  "receptionId": "...",
  "unitePrincipale": "PIÈCE",
  "quantiteInitiale": 100,
  "uniteDetail": "MÈTRE",
  "prixParUnite": 10,
  "rayonId": "...",
  "dateReception": "2026-01-19"
}
```

**Response**:
```json
{
  "_id": "...",
  "quantiteInitiale": 100,
  "quantiteRestante": 100,
  "prixTotal": 1000,
  "status": "complet",
  "peutEtreVendu": true
}
```

#### ✅ POST /api/protected/receptions (MODIFIÉ)

Maintenant supporte `type: 'lot'`:
```json
{
  "produitId": "...",
  "type": "lot",
  "nombrePieces": 3,
  "quantiteParPiece": 100,
  "uniteDetail": "MÈTRE",
  ...
}
```

**Logique**:
- SI `type === 'lot'`: 
  - Crée Reception
  - NE crée PAS StockRayon (LOTs le feront)
  - Retourne Reception
- SI `type === 'simple'` (ou omis):
  - Crée Reception
  - Crée/met à jour StockRayon
  - Retourne Reception

---

## 🧪 GUIDE DE TEST

### Test 1: Créer un Produit SIMPLE

**Étapes**:
1. Allez à "Gestion Produits" → "Ajouter"
2. Remplissez le formulaire
3. **Type de Stockage**: SIMPLE
4. **Unité Principale**: KILOGRAMME
5. **Unités de Vente**: [vide, c'est SIMPLE]
6. Sauvegardez

**Résultat**:
- TypeProduit créé avec `typeStockage: 'simple'`
- `unitePrincipaleStockage: 'KILOGRAMME'`
- `unitesVente: []`

### Test 2: Créer une Réception SIMPLE

**Étapes**:
1. Ouvrez la modal "Réceptions"
2. Sélectionnez le produit SIMPLE créé à Test 1
3. Observez: 
   - ✅ `simpleQuantityContainer` est VISIBLE
   - ✅ `lotContainer` est CACHÉ
   - ✅ Label affiche "KILOGRAMME"
4. Entrez:
   - Quantité: 50
   - Rayon: [choisir]
   - Prix: 5
   - Photo: [upload]
5. Cliquez "Enregistrer"

**Résultat**:
- Reception créée avec `quantite: 50`
- StockRayon créé/mis à jour avec `quantiteDisponible: 50`
- PAS de LOTs créés (c'est SIMPLE)

### Test 3: Créer un Produit LOT

**Étapes**:
1. Allez à "Gestion Produits" → "Ajouter"
2. Remplissez le formulaire
3. **Type de Stockage**: LOT
4. **Unité Principale**: PIÈCE
5. **Unités de Vente**: 
   - [input] PIÈCE → [delete]
   - [input] MÈTRE → [delete]
   - [button] + Ajouter Unité
6. Sauvegardez

**Résultat**:
- TypeProduit créé avec `typeStockage: 'lot'`
- `unitePrincipaleStockage: 'PIÈCE'`
- `unitesVente: ['PIÈCE', 'MÈTRE']`

### Test 4: Créer une Réception LOT

**Étapes**:
1. Ouvrez la modal "Réceptions"
2. Sélectionnez le produit LOT créé à Test 3
3. Observez:
   - ✅ `simpleQuantityContainer` est CACHÉ
   - ✅ `lotContainer` est VISIBLE
   - ✅ `uniteDetail` select affiche: PIÈCE, MÈTRE
4. Entrez:
   - Nombre de Pièces: 3
   - Quantité par Pièce: 100
   - Unité Détail: MÈTRE
   - Prix Achat: 10
   - Rayon: [choisir]
   - Photo: [upload]
5. Cliquez "Enregistrer"

**Résultat** (VÉRIFIER):
- ✅ Reception créée avec `quantite: 3` (nombre de pièces, pas total!)
- ✅ 3 LOTs créés:
  - LOT #1: 100m @ 10$/m = 1000 CDF
  - LOT #2: 100m @ 10$/m = 1000 CDF
  - LOT #3: 100m @ 10$/m = 1000 CDF
- ✅ Chaque LOT a `status: 'complet'`
- ✅ PAS de StockRayon créé (LOTs le remplacent)

---

## 🔍 VÉRIFICATION POST-RÉCEPTION

### Pour Produit SIMPLE:
```
GET /api/protected/magasins/{magasinId}/stocks/rayon/{rayonId}

Résultat:
{
  "produitId": "...",
  "designationProduit": "Viande",
  "quantiteDisponible": 50,  ← Direct depuis StockRayon
  "prixUnitaire": 5
}
```

### Pour Produit LOT:
```
GET /api/protected/magasins/{magasinId}/lots?produitId={produitId}

Résultat:
[
  {
    "_id": "lot1",
    "quantiteInitiale": 100,
    "quantiteRestante": 100,
    "uniteDetail": "MÈTRE",
    "prixParUnite": 10,
    "status": "complet",
    "peutEtreVendu": true
  },
  {
    "_id": "lot2",
    "quantiteInitiale": 100,
    "quantiteRestante": 100,
    "uniteDetail": "MÈTRE",
    "prixParUnite": 10,
    "status": "complet",
    "peutEtreVendu": true
  },
  {
    "_id": "lot3",
    "quantiteInitiale": 100,
    "quantiteRestante": 100,
    "uniteDetail": "MÈTRE",
    "prixParUnite": 10,
    "status": "complet",
    "peutEtreVendu": true
  }
]
```

---

## ⚙️ FLUX COMPLET

### SIMPLE Product Flow:
```
TypeProduit (simple)
        ↓
    Reception
        ↓
  StockRayon (une seule entrée, quantité totale)
```

### LOT Product Flow:
```
TypeProduit (lot)
        ↓
    Reception
        ↓
    Lot #1, #2, #3, ... (chaque pièce tracée individuellement)
```

---

## 🎯 POINTS CLÉS À RETENIR

1. **Pas de prix fixe**: Tous les prix se déterminent à la réception
2. **Chaque pièce compte**: Pour LOT, chaque rouleau/carton est un record séparé
3. **Status auto**: Les LOTs passent de 'complet' → 'partiel_vendu' → 'épuisé' automatiquement
4. **Interface dynamique**: Le formulaire change complètement selon SIMPLE vs LOT
5. **Validation contrôlée**: Seuls les champs pertinents sont validés

---

## 🚀 PROCHAINES ÉTAPES

Après validation:

1. ✅ Créer interface de vente pour LOT (sélection de LOT + quantité)
2. ✅ Mettre à jour le calcul de quantiteRestante lors de ventes
3. ✅ Ajouter rapports de stock par LOT
4. ✅ Ajouter export CSV avec détails LOT
5. ✅ Implémenter FIFO/LIFO pour sélection LOT automatique

---

**Statut**: ✅ IMPLÉMENTATION COMPLÈTE & TESTABLE
