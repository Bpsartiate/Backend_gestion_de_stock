# 🏢 SYSTÈME D'ENTREPOSAGE - ARCHITECTURE MULTI-RAYON

## 📋 Vue d'ensemble

Le système a été mis à jour pour supporter une **logique réaliste d'entreposage** où une réception peut être distribuée sur **plusieurs rayons** avec gestion des capacités.

---

## 🎯 Problème résolu

### ❌ ANCIEN SYSTÈME
```
Une réception = Un seul rayon
Problem: Pas de distribution multi-rayon
Result: Logique incomplète
```

### ✅ NOUVEAU SYSTÈME
```
Une réception = Plusieurs rayons avec quantités
Problem SOLVED: Distribution multi-rayon complète
Result: Logique réaliste d'entreposage
```

---

## 📦 MODÈLES DE DONNÉES

### 1. Reception (MODIFIÉ)
```javascript
{
  _id: "rec_123",
  produitId: "prod_001",
  magasinId: "mag_1",
  quantite: 200,              // ← Quantité TOTALE
  
  // 🆕 NEW: Distributions par rayon
  distributions: [
    {
      rayonId: "rayon_A",
      quantite: 100,          // ← Distribuée au rayon A
      statut: "EN_STOCK"
    },
    {
      rayonId: "rayon_B",
      quantite: 100,          // ← Distribuée au rayon B
      statut: "EN_STOCK"
    }
  ],
  
  // 🆕 NEW: Statut global
  statutReception: "DISTRIBUÉE",  // EN_ATTENTE, DISTRIBUÉE, COMPLÈTE
  
  fournisseur: "Fournisseur XYZ",
  dateReception: "2026-01-22",
  prixAchat: 15
}
```

### 2. StockRayon (RÔLE ENRICHI)
```javascript
{
  _id: "sr_123",
  receptionId: "rec_123",
  rayonId: "rayon_A",
  produitId: "prod_001",
  
  quantiteInitiale: 100,      // ← Reçu initialement
  quantiteActuelle: 95,       // ← Après mouvements
  quantiteReservee: 5,        // ← Réservé (commandes)
  
  statut: "PARTIELLEMENT_VENDU",  // EN_STOCK, PARTIELLEMENT_VENDU, VIDE
  dateDistribution: "2026-01-22"
}
```

### 3. Rayon (ENRICHI)
```javascript
{
  _id: "rayon_A",
  nomRayon: "Rayon Viande",
  capaciteMax: 1000,          // ← Capacité max
  quantiteActuelle: 950,      // ← SUM de tous ses StockRayons
  typeRayon: "RAYON",
  typesProduitsAutorises: ["viande", "volaille"]
}
```

---

## 🔄 FLUX DE RÉCEPTION

### Étape 1: Créer une réception
```javascript
POST /api/protected/receptions {
  produitId: "prod_001",
  magasinId: "mag_1",
  quantite: 200,
  fournisseur: "Fournisseur XYZ",
  prixAchat: 15,
  distributions: [
    { rayonId: "rayon_A", quantite: 100 },
    { rayonId: "rayon_B", quantite: 100 }
  ]
}
```

### Étape 2: Validation
```
✅ Somme distributions = quantité totale (100+100 = 200)
✅ Rayon A: 100 + 950 (actuel) ≤ 1000 (capacité)
✅ Rayon B: 100 + 850 (actuel) ≤ 1000 (capacité)
```

### Étape 3: Création des StockRayons
```
StockRayon #1: rec_123 → rayon_A (100kg)
StockRayon #2: rec_123 → rayon_B (100kg)
```

### Étape 4: Mise à jour des rayons
```
Rayon A: 950 → 1050 (PLEIN!)
Rayon B: 850 → 950
```

### Résultat
```json
{
  "success": true,
  "reception": { _id, quantite: 200, distributions: [...] },
  "stockRayons": [
    { rayonId: "rayon_A", quantite: 100 },
    { rayonId: "rayon_B", quantite: 100 }
  ]
}
```

---

## 🛠️ API ENDPOINTS

### 1. Créer une réception avec distribution
```
POST /api/protected/receptions
Content-Type: application/json

{
  "produitId": "prod_001",
  "magasinId": "mag_1",
  "quantite": 200,
  "distributions": [
    { "rayonId": "rayon_A", "quantite": 100 },
    { "rayonId": "rayon_B", "quantite": 100 }
  ],
  "fournisseur": "Fournisseur XYZ",
  "prixAchat": 15
}
```

**Response:**
```json
{
  "success": true,
  "reception": { _id, quantite: 200, distributions: [...] },
  "stockRayons": [...]
}
```

### 2. Récupérer les distributions d'une réception
```
GET /api/protected/receptions/:receptionId/distributions
```

**Response:**
```json
{
  "success": true,
  "distributions": [
    {
      "_id": "sr_123",
      "rayonId": { nomRayon: "Rayon A", capaciteMax: 1000 },
      "quantiteInitiale": 100,
      "quantiteActuelle": 95,
      "statut": "PARTIELLEMENT_VENDU"
    }
  ]
}
```

### 3. Récupérer le stock d'un produit par rayon
```
GET /api/protected/produits/:produitId/stock-par-rayon
```

**Response:**
```json
{
  "success": true,
  "stocks": [
    {
      "rayonId": "rayon_A",
      "nomRayon": "Rayon Viande",
      "quantiteActuelle": 95,
      "quantiteDisponible": 90,
      "receptionId": "rec_123",
      "dateReception": "2026-01-22",
      "fournisseur": "Fournisseur XYZ"
    }
  ]
}
```

---

## 🎨 INTERFACE UTILISATEUR

### Modal de Distribution
L'interface permet de:
- ✅ Sélectionner plusieurs rayons
- ✅ Entrer une quantité pour chaque rayon
- ✅ Voir la capacité disponible de chaque rayon
- ✅ Aperçu en temps réel de la distribution
- ✅ Validation automatique

```
[Produit: Viande] [Quantité: 200kg] [Fournisseur: XYZ]

Distribution:
┌─ Rayon Viande A ─────────────────────┐
│ Quantité: 100  Libre: 100 / 1000     │
└──────────────────────────────────────┘

┌─ Rayon Viande B ─────────────────────┐
│ Quantité: 100  Libre: 150 / 1000     │
└──────────────────────────────────────┘

Distribué: 200 / 200 kg ✅
```

---

## 📊 EXEMPLES CONCRETS

### Exemple 1: Réception de 40 pièces (capacité rayon = 40)
```
Réception: 40 pièces
Rayon A: capacité 40 (plein)
Rayon B: capacité 40 (plein)

Distribution:
- Rayon A: 20 pièces
- Rayon B: 20 pièces

Result: ✅ Répartition équilibrée
```

### Exemple 2: Réception de 200kg (capacités différentes)
```
Réception: 200kg
Rayon Viande: capacité 1000 (utilisé 900) → libre 100
Rayon Frigo: capacité 500 (utilisé 300) → libre 200

Distribution optimale:
- Rayon Viande: 100kg (limite capacité)
- Rayon Frigo: 100kg (reste disponible)

Result: ✅ Distribution intelligente
```

### Exemple 3: Réception impossible (surcharge)
```
Réception: 200kg
Rayon A: capacité 100 (plein)
Rayon B: capacité 100 (plein)
Rayon C: N/A (type produit non autorisé)

Distribution tentée:
- Rayon A: 100kg → ERROR (100+100 > 100)

Result: ❌ Rejeté - Pas d'espace disponible
```

---

## 🔐 VALIDATION & SÉCURITÉ

### Validations obligatoires
```javascript
✅ Somme distributions = quantité totale
✅ Chaque rayon existe
✅ Rayon autorise le type produit
✅ Quantité future ≤ capacité max
✅ Quantité > 0 pour chaque distribution
```

### Erreurs possibles
```
❌ "Somme distributions ≠ quantité totale"
❌ "Rayon dépasserait sa capacité"
❌ "Type produit non autorisé pour ce rayon"
❌ "Rayon inexistant"
```

---

## 🚀 MIGRATION DES DONNÉES

Pour les réceptions existantes (avec rayonId simple):

```javascript
// Créer automatiquement StockRayon pour chaque réception
db.receptions.forEach(reception => {
  if (reception.rayonId && !reception.distributions) {
    db.stockrayons.insert({
      receptionId: reception._id,
      rayonId: reception.rayonId,
      quantiteInitiale: reception.quantite,
      quantiteActuelle: reception.quantite,
      statut: 'EN_STOCK'
    });
  }
});
```

---

## 📝 CHECKLIST MISE EN PRODUCTION

- [ ] Modèle Reception mis à jour avec `distributions`
- [ ] Service `stockRayonService.js` déployé
- [ ] API endpoint `/receptions` adapté
- [ ] Modal distribution UI intégré
- [ ] Tests validation capacité
- [ ] Migration données anciennes réceptions
- [ ] Documentation utilisateur
- [ ] Tests A/B avec utilisateurs

---

## 💡 PROCHAINES ÉTAPES

1. **FIFO Automatique**: Sélectionner automatiquement les StockRayons les plus anciens
2. **Réservations**: Réserver du stock pour les commandes
3. **Transferts inter-rayon**: Déplacer du stock d'un rayon à l'autre
4. **Alertes capacité**: Notification quand rayon > 90% capacité
5. **Rapport d'occupation**: Dashboard des rayons par type produit

---

## 📞 SUPPORT

Pour questions sur la nouvelle logique:
- Vérifier `docs/ARCHITECTURE_STOCKRAYON.md`
- Consulter les exemples ci-dessus
- Tester avec le modal distribution
