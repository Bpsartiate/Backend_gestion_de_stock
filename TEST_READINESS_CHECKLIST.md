# ✅ Vérification des Champs pour Test Phase 1 v2

## 📊 État des Champs par Modèle

### 1️⃣ **TypeProduit** ✅ PRÊT
```
✓ nomType (string, requis)
✓ code (string, requis)
✓ typeStockage (enum: 'simple' | 'lot', requis) ⭐ CRITIQUE
✓ capaciteMax (number, default: absent?) ⚠️ À VÉRIFIER
✓ unitesVente (array)
✓ unitePrincipaleStockage (string)
✓ couleur (hex)
✓ icone (emoji)
```

**Exemple pour test:**
```json
{
  "nomType": "Viande",
  "code": "VIAND",
  "typeStockage": "simple",
  "capaciteMax": 500,
  "unitePrincipaleStockage": "kg"
}
```

### 2️⃣ **Rayon** ✅ PRÊT
```
✓ codeRayon (string, requis)
✓ nomRayon (string, requis)
✓ typeRayon (enum, default: 'RAYON')
✓ capaciteMax (number, default: 1000)
✓ couleurRayon (hex)
✓ typesProduitsAutorises (array)
```

**Exemple pour test:**
```json
{
  "codeRayon": "R001",
  "nomRayon": "Viandes Froides",
  "typeRayon": "RAYON",
  "capaciteMax": 1000
}
```

### 3️⃣ **Produit** ✅ PRÊT
```
✓ reference (string, requis)
✓ designation (string, requis)
✓ typeProduitId (ObjectId, requis) ⭐ CRITIQUE
✓ marque (string, optional) ✨ NOUVEAU
✓ rayonId (deprecated - peut être null)
✓ prixUnitaire (number, optional)
```

**Exemple pour test:**
```json
{
  "reference": "BEEF001",
  "designation": "Viande de Bœuf Frais",
  "typeProduitId": "OBJECT_ID_TYPE_VIANDE",
  "marque": "Premium Beef",
  "prixUnitaire": 25.50
}
```

### 4️⃣ **Reception** ✅ PRÊT
```
✓ produitId (ObjectId, requis)
✓ magasinId (ObjectId, requis)
✓ rayonId (ObjectId, optional - pour multi-rayon)
✓ quantite (number, requis)
✓ prixAchat (number, optional)
✓ fournisseur (string, optional)
✓ lotNumber (string, optional)
✓ dateReception (Date, auto)
✓ distributions (array, pour multi-rayon)
✓ statutReception (enum, default: 'EN_ATTENTE')
```

### 5️⃣ **StockRayon** ✅ PRÊT (Phase 1 v2)
```
✓ produitId (ObjectId, requis)
✓ rayonId (ObjectId, requis)
✓ magasinId (ObjectId, requis)
✓ typeProduitId (ObjectId, optional) ⭐ NOUVEAU
✓ typeStockage (string: 'simple'|'lot') ⭐ NOUVEAU
✓ quantiteDisponible (number)
✓ receptionIds (array) - Track toutes les réceptions consolidées
✓ numeroLot (string) - Pour Type LOT
✓ dateCreation (Date)
✓ dateUpdated (Date)
```

---

## 🚀 Prérequis Minimum pour Test

Pour tester POST /receptions avec consolidation Phase 1 v2:

### ✅ Vous avez:
- Produit model ✓
- TypeProduit model ✓ (typeStockage + capaciteMax)
- Rayon model ✓
- Reception model ✓
- StockRayon model ✓ (enrichi v2)
- consolidationService.js ✓ (intégré)
- API POST /receptions ✓ (adaptée)

### ⚠️ À vérifier AVANT TEST:

**1. TypeProduit.capaciteMax existe?**
```bash
# Vérifiez dans MongoDB:
db.typeproduits.findOne({ code: "VIAND" });
# Doit contenir "capaciteMax": 500 (ou autre nombre)
```

**2. Avoir au moins 1 de chaque:**
- 1x Magasin
- 1x TypeProduit (typeStockage: "simple")
- 1x TypeProduit (typeStockage: "lot")
- 2x Rayon
- 2x Produit (1 simple, 1 lot)

---

## 🧪 Test Rapide (5 minutes)

### Étape 1: Créer les données de base
```bash
# Magasin (supposé existant)
magasinId="6xxx..." # Votre magasin

# TypeProduit - SIMPLE
typeProduitSimple=$(curl -X POST http://localhost:3001/api/protected/types-produits \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "magasinId": "'$magasinId'",
    "nomType": "Viande",
    "code": "VIAND",
    "typeStockage": "simple",
    "capaciteMax": 500
  }' | jq -r '._id')

# TypeProduit - LOT
typeProduitLot=$(curl -X POST http://localhost:3001/api/protected/types-produits \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "magasinId": "'$magasinId'",
    "nomType": "Tissu",
    "code": "TISS",
    "typeStockage": "lot",
    "capaciteMax": 1000,
    "unitesVente": ["MÈTRE", "ROULEAU"]
  }' | jq -r '._id')

# Rayon
rayonId=$(curl -X POST http://localhost:3001/api/protected/rayons \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "magasinId": "'$magasinId'",
    "codeRayon": "R001",
    "nomRayon": "Viandes Froides"
  }' | jq -r '._id')

# Produit - Type SIMPLE
produitSimple=$(curl -X POST http://localhost:3001/api/protected/produits \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "magasinId": "'$magasinId'",
    "reference": "BEEF001",
    "designation": "Viande de Bœuf",
    "typeProduitId": "'$typeProduitSimple'",
    "marque": "Premium"
  }' | jq -r '._id')

# Produit - Type LOT
produitLot=$(curl -X POST http://localhost:3001/api/protected/produits \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "magasinId": "'$magasinId'",
    "reference": "TISS001",
    "designation": "Tissu Coton",
    "typeProduitId": "'$typeProduitLot'",
    "marque": "Quality"
  }' | jq -r '._id')
```

### Étape 2: Tester POST /receptions

**Test SIMPLE (consolidation):**
```bash
# Réception 1
curl -X POST http://localhost:3001/api/protected/receptions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "produitId": "'$produitSimple'",
    "magasinId": "'$magasinId'",
    "rayonId": "'$rayonId'",
    "typeProduitId": "'$typeProduitSimple'",
    "quantite": 100,
    "fournisseur": "Fournisseur A"
  }'

# Réception 2 (MÊME produit)
curl -X POST http://localhost:3001/api/protected/receptions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "produitId": "'$produitSimple'",
    "magasinId": "'$magasinId'",
    "rayonId": "'$rayonId'",
    "typeProduitId": "'$typeProduitSimple'",
    "quantite": 80,
    "fournisseur": "Fournisseur B"
  }'

# ✓ Attendu: 
# - 1ère: actionType: "CREATE"
# - 2ème: actionType: "CONSOLIDATE" + receptionsFusionnées: 2
```

**Test LOT (unique):**
```bash
# Réception 1
curl -X POST http://localhost:3001/api/protected/receptions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "produitId": "'$produitLot'",
    "magasinId": "'$magasinId'",
    "rayonId": "'$rayonId'",
    "typeProduitId": "'$typeProduitLot'",
    "quantite": 50,
    "lotNumber": "LOT-001"
  }'

# Réception 2
curl -X POST http://localhost:3001/api/protected/receptions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "produitId": "'$produitLot'",
    "magasinId": "'$magasinId'",
    "rayonId": "'$rayonId'",
    "typeProduitId": "'$typeProduitLot'",
    "quantite": 90,
    "lotNumber": "LOT-002"
  }'

# ✓ Attendu:
# - 1ère: actionType: "CREATE"
# - 2ème: actionType: "CREATE" (NEW emplacement, pas consolidé!)
```

---

## 🎯 Résultat Final

### ✅ OUI, vous pouvez tester!

**Champs suffisants pour:**
- ✓ Créer produits avec marque
- ✓ Tester consolidation SIMPLE (100+80=180kg dans 1 emplacement)
- ✓ Tester unicité LOT (50m + 90m = 2 emplacements différents)
- ✓ Vérifier actionType (CREATE vs CONSOLIDATE)
- ✓ Vérifier receptionsFusionnées

### ⚠️ À faire AVANT:
1. **Vérifier capaciteMax** dans TypeProduit (sinon ajouter)
2. **Avoir un Magasin** existant
3. **Avoir un Token JWT** valide
4. **Lancer le serveur** (npm start)

### 🚀 Prochaine étape:
Voulez-vous que je crée un **script de test complet** (Bash/Node) qui:
- Crée toutes les données automatiquement
- Teste les 2 scénarios (SIMPLE + LOT)
- Affiche les résultats formatés
- Valide les réponses

?

---

**État:** ✅ PRÊT À TESTER
**Temps estimé:** 10 minutes pour setup + 5 min de tests
