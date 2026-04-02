# 🐛 Bug Fix: LOT Sale Quantity Not Processing Correctly

**Status:** ✅ FIXED (v2.4)  
**Severity:** 🔴 HIGH - Production Bug  
**Date Fixed:** 3 Avril 2026  
**Reported by:** User testing  
**Root Cause:** Frontend hardcoded `quantiteAuBackend = 1` when selling LOTs  

---

## Problem Description

When selling LOT products with `typeVente='entier'` (sell entire LOT as 1 unit):
- **Expected:** User enters quantité=4 → 4 LOTs sold
- **Actual:** User enters quantité=4 → Only 1 LOT sold ❌

The quantity field was being ignored, and only 1 LOT was processed regardless of user input.

### User Report (French)
> "a la venet pour le produit lot je selctionne la vente par lot mais ca ne prend qu'un lot, meme si j'ecrit 4 ou 10"  
> *"At sales, for LOT products I select 'sell by lot' but it only takes 1 LOT, even if I write 4 or 10"*

---

## Root Cause Analysis

### File: `assets/js/vente.js` (Line 991)

```javascript
// ❌ BEFORE (Buggy)
if (typeStockage === 'lot' && typeVente === 'entier') {
    const lotsDetails = window.currentStockInfo?.lotsDetails || [];
    if (lotsDetails.length > 0) {
        const premierLot = lotsDetails[0];
        quantiteAuBackend = 1;  // 🔴 HARDCODED TO 1!
        quantiteAffichee = premierLot.quantiteInitiale || quantite;
        // ...
    }
}
```

**Issue:** The code was hardcoding `quantiteAuBackend = 1` regardless of what the user entered in the quantity field.

### Flow of the Bug

```
Frontend Input:
┌─────────────────────────────────┐
│ User enters quantité = 4 LOTs   │
│ typeVente = 'entier'            │
│ (Each LOT = 40 meters)          │
└──────────────┬──────────────────┘
               │
               ▼
Frontend Processing (BUGGY):
┌─────────────────────────────────┐
│ quantiteAuBackend = 1 (hardcoded) ❌
│ quantiteAffichee = 40 (correct)  ✅
└──────────────┬──────────────────┘
               │
               ▼
Backend (routes/ventes.js):
┌─────────────────────────────────┐
│ sellLot(..., quantite=1, ...)   │
│ for (const lot) {               │
│   if (quantiteRestante <= 0)    │
│     break;   // Exits after 1   │
│   quantiteRestante -= 1;        │
│ }                               │
└──────────────┬──────────────────┘
               │
               ▼
Result:
┌─────────────────────────────────┐
│ Only 1 LOT Sold (not 4!) 🔴     │
│ User expects 4 → gets 1         │
└─────────────────────────────────┘
```

---

## Solution Applied

### Changed: `assets/js/vente.js` (Line 991-999)

```javascript
// ✅ AFTER (Fixed)
if (typeStockage === 'lot' && typeVente === 'entier') {
    const lotsDetails = window.currentStockInfo?.lotsDetails || [];
    if (lotsDetails.length > 0) {
        const premierLot = lotsDetails[0];
        quantiteAuBackend = quantite;  // ✅ Use actual user input!
        quantiteAffichee = (premierLot.quantiteInitiale || quantite) * quantite;  // Display total (4 LOTs × 40m = 160m)
        lotIdPrincipal = premierLot._id;
        console.log(`🎯 LOT ENTIER: Afficher=${quantiteAffichee}m (${quantite} LOTs), Envoyer au backend=${quantiteAuBackend} LOTs`);
    }
}
```

### Changes Made

1. **Line 992:** Changed from hardcoded `1` to dynamic `quantite`
2. **Line 993:** Updated display calculation to show total: `quantiteInitiale × quantite`
3. **Line 996:** Updated console log to show both values

### How It Works Now

```
Frontend Input:
┌─────────────────────────────────┐
│ User enters quantité = 4 LOTs   │
│ typeVente = 'entier'            │
│ (Each LOT = 40 meters)          │
└──────────────┬──────────────────┘
               │
               ▼
Frontend Processing (FIXED):
┌─────────────────────────────────┐
│ quantiteAuBackend = 4 ✅        │
│ quantiteAffichee = 160m (4×40) ✅
└──────────────┬──────────────────┘
               │
               ▼
Backend (routes/ventes.js):
┌─────────────────────────────────┐
│ sellLot(..., quantite=4, ...)   │
│ for (const lot) {               │
│   // Iteration 1: quantiteRestante=3
│   // Iteration 2: quantiteRestante=2
│   // Iteration 3: quantiteRestante=1
│   // Iteration 4: quantiteRestante=0
│   quantiteRestante -= 1;        │
│ }                               │
└──────────────┬──────────────────┘
               │
               ▼
Result:
┌─────────────────────────────────┐
│ All 4 LOTs Sold ✅              │
│ User expects 4 → gets 4         │
└─────────────────────────────────┘
```

---

## Files Modified

| File | Lines | Change | Status |
|------|-------|--------|--------|
| [assets/js/vente.js](../../assets/js/vente.js#L991-L999) | 991-999 | Fix hardcoded quantiteAuBackend | ✅ DONE |

---

## Testing Procedure

### Test Case 1: Sell 4 LOTs with typeVente='entier'

**Steps:**
1. Navigate to Sales (Vente) interface
2. Select a LOT product (typeStockage='lot')
3. Select a magasin/rayon
4. Click radio button: "LOT entier" (or "Vendre le LOT entier")
5. Enter quantité = 4
6. Click "Ajouter au panier"
7. Click "Valider la vente" to submit

**Expected Results:**
- ✅ Panier shows: "160 mètres" (4 LOTs × 40m each)
- ✅ Console log shows: `🎯 LOT ENTIER: Afficher=160m (4 LOTs), Envoyer au backend=4 LOTs`
- ✅ Backend processes: 4 LOTs marked as epuisé
- ✅ Rayon quantité updated: -4 (not -1)
- ✅ Vente created with 4 lotsAffectes entries

**Verify in MongoDB:**
```javascript
// Check Lot collection - should be 4 lots with status='epuise'
db.lots.find({ produitId: ObjectId("..."), status: 'epuise' }).count()
// Should return 4 (not 1)

// Check Vente collection - should have 4 entries in lotsAffectes
db.ventes.findOne().mouvements[0].lotsAffectes.length
// Should return 4 (not 1)

// Check Rayon - quantiteActuelle should be reduced by 4
db.rayons.findOne()._id
// quantiteActuelle should be -4 from previous value
```

### Test Case 2: Sell 10 LOTs

**Steps:** Same as Test Case 1, but enter quantité = 10

**Expected Results:**
- ✅ Panier shows: "400 mètres" (10 LOTs × 40m each)
- ✅ 10 LOTs marked as epuisé in DB
- ✅ Rayon quantity reduced by 10

### Test Case 3: Sell Mixed - Some Lots Exist, Some Don't

**Setup:** Product has only 3 LOTs available

**Steps:**
1. Try to sell quantité = 4 when only 3 exist
2. Expected: Get error "❌ Stock insuffisant! Demandé: 4, Disponible: 3"

**Expected Results:**
- ✅ Error shows correct quantities
- ✅ No LOTs sold
- ✅ Transaction rolled back

---

## Key Learning

**Problem:** The previous developer tried to send `quantite=1` for all LOT sales, assuming LOT size was always the display unit. But this breaks when users want to sell multiple LOTs in one transaction.

**Solution:** The backend loop was already designed to handle multiple LOTs (it loops while `quantiteRestante > 0`). We just needed to send the correct quantity from frontend.

**Architecture Insight:**
- For LOT products with `typeVente='entier'`: 1 quantité unit = 1 whole LOT
- For LOT products with `typeVente='partiel'`: 1 quantité unit = 1 detail unit (meter, etc.)
- Display can show the expanded value (4 LOTs × 40m = 160m), but backend always works with LOT counts for `entier` mode

---

## Console Logs Added

```javascript
// Line 996 - Debug log when adding LOT to cart
console.log(`🎯 LOT ENTIER: Afficher=${quantiteAffichee}m (${quantite} LOTs), Envoyer au backend=${quantiteAuBackend} LOTs`);

// Example output:
// 🎯 LOT ENTIER: Afficher=160m (4 LOTs), Envoyer au backend=4 LOTs
```

---

## Version Bump

- **v2.4** - Hotfix: LOT sale quantity bug (allow selling multiple LOTs in one transaction)

---

## Impact Assessment

- **Scope:** LOT product sales with `typeVente='entier'` mode
- **User Impact:** Medium - affects all LOT product sales, but workaround exists (sell 1 LOT, repeat)
- **Risk:** Low - frontend only change, backend logic unchanged
- **Rollback:** Easy - revert line 991-999 in assets/js/vente.js

---

## Related Bugs

- **v2.2** - Double-counting bug in rayon occupation (FIXED)
- **v2.2** - EN_COMMANDE display on mobile (FIXED)
- **v2.3** - Rayon cache stale on modal reopen (FIXED)
- **v2.4** - LOT sale quantity hardcoded to 1 (THIS FIX) ✅

---

## Sign-Off

- **Developer:** System AI Assistant
- **Date:** 3 Avril 2026
- **Verification:** Logic traced, backend confirmed correct, fix deployed
