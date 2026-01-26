# Test Mode de Vente - Phase 1 v2

## Scénario de test

### Produit: Rouleau rouge (LOT)
- Type: LOT (typeStockage = 'lot')
- quantiteActuelle: 320 unités
- lotsDisponibles: 9 LOTs

## Comportement attendu

### 1. Chargement du produit
```
Radios initialisés:
- radioPartiel: checked = true (par défaut)
- radioEntier: checked = false

Affichage du stock:
- Stock affiché: 320 (quantiteActuelle)
- Description: "✂️ Réduire les quantités du LOT par unités de vente"
```

### 2. Utilisateur clique sur "Par unités"
```
Radios:
- radioPartiel: checked = true
- radioEntier: checked = false

Affichage du stock:
- Stock affiché: 320 (quantiteActuelle)
- Description: "✂️ Réduire les quantités du LOT par unités de vente"
```

### 3. Utilisateur clique sur "LOT entier"
```
Radios:
- radioPartiel: checked = false
- radioEntier: checked = true

Affichage du stock:
- Stock affiché: 9 (lotsDisponibles)
- Description: "🚀 Vendre le LOT entier (pas de réduction possible)"
```

### 4. Utilisateur change de produit puis revient
```
Même comportement qu'au chargement initial:
- Stock affiché: 320 (car radioPartiel est toujours checked)
- Le mode de vente persiste
```

## Vérification en console

Ouvrir la console (F12) et chercher ces logs:

```javascript
// Au chargement du produit:
📦 Affichage produit: Rouleau rouge, Type: Lot, Stock: 320, TypeStockage: lot
🎯 LOT Product detected! Setting mode selector visible
📦 LOTs disponibles: 9
📊 Stock affichage: 320 UNITÉS (mode par unités)

// Au clic sur "LOT entier":
✂️ Mode changed to: LOT entier (user click)
📊 Stock affichage: 9 LOTS (mode LOT entier)

// Au clic sur "Par unités":
✅ Mode changed to: Par unités (user click)
📊 Stock affichage: 320 UNITÉS (mode par unités)
```

## Fichiers modifiés

1. **assets/js/vente.js**
   - Ajout de `window.currentStockInfo` pour stocker les infos de stock
   - Ajout de méthode `updateStockDisplay()`
   - Appel de `updateStockDisplay()` après fetch des LOTs
   - Appel de `updateStockDisplay()` dans les handlers des radios

2. **routes/ventes.js**
   - GET endpoint `/api/protected/produits/:produitId/lots-disponibles` (déjà implémenté)

3. **vente.php**
   - Radios déjà avec `checked` par défaut sur "Par unités"
