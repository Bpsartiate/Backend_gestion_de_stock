# 📋 CHANGELOG - Gestion de Stock

Tous les changements majeurs du projet sont documentés ici, organisés par version.

---

## 🔄 Avril 2026

### v2.5 - Mobile LOT Reception Fix (3 Avril 2026)

#### 🐛 Mobile LOT Reception: No LOT Documents Created

**Problem:** On mobile app, LOT receptions created BUT no LOT documents → sales fail ❌

**Root Cause:** Architectural - backend relied on frontend to create LOT documents, but mobile apps don't implement this

**Change:** Backend NOW creates LOT documents automatically
```javascript
// BEFORE: Waits for frontend (❌ fails on mobile)
if (req.body.type === 'lot') { reception.save(); }

// AFTER: Backend creates LOTs  
for (let i = 0; i < nombrePieces; i++) {
  lot = new Lot(...); lot.save(); // ✅ Auto-created
}
```

**Impact:** ✅ CRITICAL - Mobile LOT sales now work  
**Files:** `routes/protected.js` (lines 4473-4545)  
**Docs:** [BUG_MOBILE_LOT_RECEPTION_FIX.md](BUG_MOBILE_LOT_RECEPTION_FIX.md)

**Test:**
- Request: POST /receptions avec type='lot' et nombrePieces=2
- Expected: Response contient lotsCreatedCount: 2 et lotsCreated array ✅
- DB: db.lots.find({receptionId: X}).count() retourne 2 ✅

---

### v2.4 - LOT Sale Quantity Hotfix (3 Avril 2026)

#### 🐛 LOT Sale Bug: Quantity Hardcoded to 1

**Problem:** When selling LOT products with `typeVente='entier'`, only 1 LOT was processed regardless of quantity entered (4, 10, etc)

**Root Cause:** Frontend hardcoded `quantiteAuBackend = 1` in `assets/js/vente.js` line 991

**Files Modified:**
- `assets/js/vente.js` (lines 991-999)

**Change:** 
```javascript
// BEFORE
quantiteAuBackend = 1;  // ❌ Hardcoded

// AFTER
quantiteAuBackend = quantite;  // ✅ Use actual user input
quantiteAffichee = (premierLot.quantiteInitiale || quantite) * quantite;  // Show total
```

**Expected:** User enters 4 LOTs → 4 LOTs sold ✅  
**Was:** User enters 4 LOTs → Only 1 LOT sold ❌

**Impact:** ✅ HAUTE - Production bug, affects all LOT product sales  
**Docs:** [BUG_LOT_VENTE_QUANTITE_FIX.md](BUG_LOT_VENTE_QUANTITE_FIX.md)

**Verification:**
```javascript
// Test: Sell 4 LOTs with typeVente='entier'
// Expected: 4 lotsAffectes entries, rayon.quantiteActuelle reduced by 4
// MongoDB: db.lots.find({status: 'epuise'}).count() should show 4
```

---

### v2.3 - Rayon Inventory Hotfixes (2 Avril 2026)

#### 🐛 Bugs Fixés

##### 1. Rayon Affiche 100% Plein Malgré Épuisements
- **Fichier** : `pages/stock/modal_stock_settings.php`
- **Ligne** : 1978-1982
- **Cause** : Frontend cache stale - rayons pas rechargés si même magasin
- **Fix** : Force `rayonsLoaded = false` + `loadRayonsModal()` à chaque ouverture
- **Impact** : ✅ HAUTE - Bloquait réceptions/ajouts produits
- **Docs** : [BUG_RAYON_OCCUPATION_FIX.md](BUG_RAYON_OCCUPATION_FIX.md)

**Avant :**
```javascript
} else {
  loadCategoriesModal();  // ❌ Rayons jamais rechargés
}
```

**Après :**
```javascript
} else {
  loadCategoriesModal();
  rayonsLoaded = false;   // ✅ Force reload
  loadRayonsModal();      // ✅ Fresh data
}
```

**Test:**
1. Vendre produit (épuisement)
2. Fermer modal
3. Réouvrir modal
4. ✅ Occupation recalculée correctement (pas 100%)
5. ✅ Réceptions/ajouts maintenant possibles

---

### v2.2 - Rayon Inventory Fixes (31 Mars 2026)

#### 🔧 Double-Counting Bug (CRITICAL)

**Fichier** : `routes/ventes.js`

##### sellSimple() Function
- **Ligne** : 97-162
- **Bug** : `countDocuments({statut: 'VIDE'})` comptait ALL historiques VIDE, decrement répétés
- **Fix** : State-change tracking - `emplacements_qui_viennent_de_devenir_vides`
- **Impact** : CRITIQUE - Inventory corruption après multiples sales

**Avant (BUG):**
```javascript
// ❌ Compte TOUS les VIDE, décrement multiple
const emplacementsVides = await StockRayon.countDocuments({
  rayonId, produitId, statut: 'VIDE'
});
rayon.quantiteActuelle -= emplacementsVides;  // BUG: decrement par ALL, pas juste nouveaux
```

**Après (FIX):**
```javascript
// ✅ Tracker seulement les VIDE de CETTE vente
let emplacements_qui_viennent_de_devenir_vides = 0;

for (const stock of stocks) {
  if (stock.quantiteDisponible === 0 && ancienStatus !== 'VIDE') {
    emplacements_qui_viennent_de_devenir_vides++;
  }
}

if (emplacements_qui_viennent_de_devenir_vides > 0) {
  rayon.quantiteActuelle -= emplacements_qui_viennent_de_devenir_vides;  // Seulement nouveaux
}
```

##### sellLot() Function
- **Ligne** : 18-95
- **Bug** : ZÉRO rayon update - oubli rayon decrement quand LOTs épuisés
- **Fix** : Ajout tracking + update rayon.quantiteActuelle
- **Impact** : HAUTE - LOT sales ignoraient rayon inventory

**Avant (BUG):**
```javascript
// ❌ LOTs épuisés mais rayon.quantiteActuelle pas décrémenté!
for (const lot of lotsAffectes) {
  await lot.save();
  // Rayon pas update = inventory corruption
}
```

**Après (FIX):**
```javascript
// ✅ Track LOTs épuisés et decrement rayon
let lots_qui_viennent_de_devenir_epuises = 0;
for (const lot of lots) {
  if (ancienStatus !== 'epuise' && newStatus === 'epuise') {
    lots_qui_viennent_de_devenir_epuises++;
  }
}

if (lots_qui_viennent_de_devenir_epuises > 0) {
  rayon.quantiteActuelle -= lots_qui_viennent_de_devenir_epuises;
  await rayon.save();
}
```

#### 📱 Mobile Product Status Display

**Fichier** : `routes/protected.js`

##### EN_COMMANDE Products Showing As "Rupture"
- **Ligne** : 2701-2710, 2878-2882
- **Cause** : Alert logic checked `quantiteActuelle <= 0` sans vérifier `etat`
- **Fix** : Exclude EN_COMMANDE from rupture alert + added `enCommande` flag
- **Impact** : MOYENNE - UX issue mobile

**Avant (BUG):**
```javascript
// ❌ Produits EN_COMMANDE affichaient "rupture" (rouge) au lieu de "en commande" (bleu)
const alerteRupture = produit.quantiteActuelle <= 0;  // Oublie état du produit
```

**Après (FIX):**
```javascript
// ✅ Exclure EN_COMMANDE du rupture alert
const alerteRupture = produit.quantiteActuelle <= 0 && produit.etat !== 'EN_COMMANDE';

// ✅ Ajouter flag enCommande pour mobile UI
response.alertes = {
  stockBas: alerteStock,
  rupture: alerteRupture,
  enCommande: produit.etat === 'EN_COMMANDE',  // 🆕 Flag pour mobile
  niveau: alerteRupture ? 'critique' : ...
};
```

**Frontend Update** : `assets/js/reception-history.js` (ligne 335-336, 468-473)
```javascript
// ✅ Afficher "EN ATTENTE" (bleu) pour produits EN_COMMANDE, pas "rupture" (rouge)
const stockStatus = produit.etat === 'EN_COMMANDE' ? 'En commande' : 'Rupture';
```

---

## 🎯 Summary by Component

### Backend Routes (`routes/protected.js`)

| Feature | Ligne | Type | Status |
|---------|-------|------|--------|
| Rayon calculation (exclut VIDE) | 1410-1490 | FIX | ✅ |
| Alert logic (exclut EN_COMMANDE) | 2701-2710 | FIX | ✅ |
| statusLabel logic | 2878-2882 | FIX | ✅ |

### Backend Routes (`routes/ventes.js`)

| Function | Ligne | Bug | Fix Status |
|----------|-------|-----|-----------|
| sellSimple | 97-162 | Double-counting rayon | ✅ |
| sellLot | 18-95 | Missing rayon update | ✅ |

### Frontend Pages (`pages/stock/modal_stock_settings.php`)

| Function | Ligne | Bug | Fix Status |
|----------|-------|-----|-----------|
| Modal show event | 1978-1982 | Cache stale | ✅ |

### Frontend JS (`assets/js/reception-history.js`)

| Logic | Ligne | Update | Status |
|-------|-------|--------|--------|
| Stock status | 335-336 | Check etat === EN_COMMANDE | ✅ |
| Rupture badge | 468-473 | Show "EN ATTENTE" for ordered | ✅ |

---

## 🔗 Related Documentation

- **Full Details** : [BUG_RAYON_OCCUPATION_FIX.md](BUG_RAYON_OCCUPATION_FIX.md)
- **Implementation** : [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Architecture** : [HYBRID_APPROACH_REFACTOR.md](HYBRID_APPROACH_REFACTOR.md)

---

## ✅ Testing Checklist

### Rayon Occupation Fix (2 Avril)
- [ ] Vendre produit jusqu'épuisement
- [ ] Fermer modal stock settings
- [ ] Réouvrir modal
- [ ] Vérifier occupation corrigée (pas 100%)
- [ ] Vérifier réceptions possibles
- [ ] Vérifier ajouts produits possibles

### Inventory Double-Counting Fix (31 Mars)
- [ ] Vendre multiple fois même produit
- [ ] Vérifier `rayon.quantiteActuelle` decrement une fois par vente
- [ ] Vérifier rayon pas "stuck" négatif
- [ ] Tester LOT sales
- [ ] Tester SIMPLE sales

### Mobile Status Display Fix (31 Mars)
- [ ] Afficher produit EN_COMMANDE sur mobile
- [ ] Vérifier affiche "En commande" (bleu) pas "Rupture" (rouge)
- [ ] Vérifier alertesStandard.enCommande = true
- [ ] Tester sur app mobile React Native

---

## 🚀 Deployment

### Version 2.3 (2 Avril 2026)
```
Affected Files:
- pages/stock/modal_stock_settings.php (1 ligne modifiée)

Type: Bug Fix (Frontend Cache)
Breaking Changes: NON
Migration Required: NON
Rollback Risk: FAIBLE
Deployment: Standard (no special steps)
```

### Version 2.2 (31 Mars 2026)
```
Affected Files:
- routes/ventes.js (2 functions modified)
- routes/protected.js (2 locations modified)
- assets/js/reception-history.js (2 locations modified)

Type: Critical Inventory + UX Fixes
Breaking Changes: NON
Migration Required: NON (DB schema unchanged)
Rollback Risk: TRÈS FAIBLE
Deployment: Standard (restart server)
```

---

## 📊 Release Timeline

| Version | Date | Type | Status |
|---------|------|------|--------|
| 2.3 | 2 Avril 2026 | Hotfix Frontend | ✅ Released |
| 2.2 | 31 Mars 2026 | Critical Inventory | ✅ Released |
| 2.1 | 20 Mars 2026 | Mobile Phase 1 v2 | ✅ Released |
| 2.0 | Février 2026 | Major Refactor | ✅ Released |
| 1.0 | Janvier 2026 | Initial Release | ✅ Released |

---

**Last Updated:** 2 Avril 2026  
**Maintained By:** Development Team  
**Status:** Current Production Build
