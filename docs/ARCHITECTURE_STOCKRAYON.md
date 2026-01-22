# 📦 LOGIQUE ENTREPOSAGE - MISE À JOUR DU SYSTÈME

## 🎯 Objectif
Implémenter une vraie logique d'entreposage où une **réception** peut être distribuée sur **plusieurs rayons**.

---

## 📊 STRUCTURE DE DONNÉES

### 1️⃣ Reception (INCHANGÉ)
```javascript
{
  produitId,
  magasinId,
  quantite,         // Quantité TOTALE reçue
  fournisseur,
  dateReception
  // ⚠️ rayonId → À SUPPRIMER (logique au niveau StockRayon)
}
```

### 2️⃣ StockRayon (NOUVEAU RÔLE)
```javascript
{
  receptionId,      // Lien vers la réception mère
  rayonId,          // Emplacement physique
  quantiteInitiale, // Quantité distribuée à ce rayon
  quantiteActuelle, // Quantité restante (après mouvements)
  statut,           // EN_STOCK, PARTIELLEMENT_VENDU, VIDE
  dateDistribution
}
```

### 3️⃣ Rayon (AUGMENTÉ)
```javascript
{
  capaciteMax,      // 40 pièces ou 1000kg
  quantiteActuelle, // SUM des quantiteActuelle de tous ses StockRayon
  statut
}
```

---

## 🔄 FLUX DE RÉCEPTION

### Avant (❌ ANCIEN)
```
POST /receptions { produitId, quantite: 40, rayonId: "A" }
  ↓
Reception créée { quantite: 40 }
Rayon A: quantiteActuelle += 40
```

### Après (✅ NOUVEAU)
```
POST /receptions { produitId, quantite: 40, distributions: [
  { rayonId: "A", quantite: 20 },
  { rayonId: "B", quantite: 20 }
]}
  ↓
Reception créée { quantite: 40, statut: "DISTRIBUÉE" }
  ↓
StockRayon #1: Reception → Rayon A (20 pièces)
StockRayon #2: Reception → Rayon B (20 pièces)
  ↓
Rayon A: quantiteActuelle += 20
Rayon B: quantiteActuelle += 20
```

---

## 🛠️ MISES À JOUR NÉCESSAIRES

### 1. Modèle Reception
- ✅ Garder structure actuelle
- ⚠️ Ajouter champ `distributions` (array de distributions par rayon)
- ⚠️ Ajouter champ `statut`: "EN_ATTENTE" → "DISTRIBUÉE" → "COMPLÈTE"

### 2. Route POST /receptions
- Accepter array `distributions`
- Créer automatiquement les StockRayon
- Mettre à jour les rayons

### 3. Route GET /produits/:id
- Retourner les StockRayon par rayon
- Afficher la disponibilité par rayon

### 4. UI Modal Stock Settings
- Afficher les rayons avec capacité
- Permettre de sélectionner rayons multiples lors d'une réception
- Afficher distribution actuelle

---

## 🎨 EXEMPLE: Réception de 200kg de viande

**Scénario:**
- Rayon Viande A: capacité 100kg (libre)
- Rayon Viande B: capacité 100kg (libre)
- On reçoit 200kg

**Requête:**
```javascript
POST /api/protected/receptions {
  produitId: "viande_001",
  magasinId: "magasin_1",
  quantite: 200,
  distributions: [
    { rayonId: "rayon_A", quantite: 100 },
    { rayonId: "rayon_B", quantite: 100 }
  ],
  fournisseur: "Fournisseur XYZ",
  prixAchat: 15
}
```

**Résultat:**
```
✅ Reception créée (ID: reception_123, quantite: 200)
✅ StockRayon #1: reception_123 → rayonA (100kg, EN_STOCK)
✅ StockRayon #2: reception_123 → rayonB (100kg, EN_STOCK)
✅ Rayon A: quantiteActuelle = 100
✅ Rayon B: quantiteActuelle = 100
```

---

## 📋 CHECKLIST IMPLÉMENTATION

- [ ] Mettre à jour modèle Reception
- [ ] Adapter endpoint POST /receptions
- [ ] Ajouter validation multi-rayon
- [ ] Mettre à jour interface modal_stock_settings
- [ ] Tests de distribution
