# 📱 Documentation Mobile - Index Complet

**Phase 1 v2 - Ventes LOT/Unités**  
**Mise à jour:** 26/01/2026

---

## 🎯 Commencer Ici

Choisis ton niveau d'expérience:

### 🟢 Je suis nouveau (5 min)
👉 **[MOBILE_QUICK_START_PHASE1_V2.md](./MOBILE_QUICK_START_PHASE1_V2.md)**
- Setup en 5 minutes
- Copy-paste ready code
- Les 3 changements clés

### 🟡 Je comprends les APIs (30 min)
👉 **[API_MOBILE_PHASE1_V2_COMPLETE.md](./API_MOBILE_PHASE1_V2_COMPLETE.md)**
- Documentation API complète
- Tous les endpoints
- Exemples Flutter & React Native
- Gestion erreurs

### 🔴 Je débogue (15 min)
👉 **[POSTMAN_MOBILE_API.json](../POSTMAN_MOBILE_API.json)**
- Collection Postman prête à importer
- Test chaque endpoint
- Mock data incluse

---

## 📚 Documentation par Sujet

### 🔐 Authentification
- **Quick:** [MOBILE_QUICK_START_PHASE1_V2.md#step-1](./MOBILE_QUICK_START_PHASE1_V2.md#step-1)
- **Complete:** [API_MOBILE_PHASE1_V2_COMPLETE.md#authentification](./API_MOBILE_PHASE1_V2_COMPLETE.md#authentification)

### 📦 Magasins & Configuration
- **Quick:** [MOBILE_QUICK_START_PHASE1_V2.md](./MOBILE_QUICK_START_PHASE1_V2.md)
- **Complete:** [API_MOBILE_PHASE1_V2_COMPLETE.md#magasins](./API_MOBILE_PHASE1_V2_COMPLETE.md#magasins)

### 📋 Produits & Stock
- **Quick:** [MOBILE_QUICK_START_PHASE1_V2.md#step-2](./MOBILE_QUICK_START_PHASE1_V2.md#step-2)
- **Complete:** [API_MOBILE_PHASE1_V2_COMPLETE.md#produits](./API_MOBILE_PHASE1_V2_COMPLETE.md#produits)
- **Endpoint:** `/api/protected/produits?magasinId={ID}`

### 🆕 LOTs Disponibles (NEW)
- **Quick:** [MOBILE_QUICK_START_PHASE1_V2.md#step-3](./MOBILE_QUICK_START_PHASE1_V2.md#step-3)
- **Complete:** [API_MOBILE_PHASE1_V2_COMPLETE.md#endpoints-phase1-v2](./API_MOBILE_PHASE1_V2_COMPLETE.md#endpoints-phase1-v2)
- **Endpoint:** `/api/protected/produits/{ID}/lots-disponibles`
- **Purpose:** Get available LOTs with details (reference, quantité, status)

### 💰 Ventes & Mode de Vente (PHASE 1 v2)
- **Quick:** [MOBILE_QUICK_START_PHASE1_V2.md#step-4-5](./MOBILE_QUICK_START_PHASE1_V2.md#step-4-5)
- **Complete:** [API_MOBILE_PHASE1_V2_COMPLETE.md#ventes](./API_MOBILE_PHASE1_V2_COMPLETE.md#ventes)
- **Mode Logic:** [API_MOBILE_PHASE1_V2_COMPLETE.md#mode-vente](./API_MOBILE_PHASE1_V2_COMPLETE.md#mode-vente)
- **Key:** Chaque article vente a maintenant `typeVente: "entier" | "partiel"`

### 🔧 Implémentation Mobile
- **Flutter:** [API_MOBILE_PHASE1_V2_COMPLETE.md#flutter](./API_MOBILE_PHASE1_V2_COMPLETE.md#flutter)
- **React Native:** [API_MOBILE_PHASE1_V2_COMPLETE.md#react-native](./API_MOBILE_PHASE1_V2_COMPLETE.md#react-native)
- **UI Layout:** [MOBILE_QUICK_START_PHASE1_V2.md#ui-layout](./MOBILE_QUICK_START_PHASE1_V2.md#ui-layout)

### ⚠️ Gestion Erreurs
- **Codes:** [API_MOBILE_PHASE1_V2_COMPLETE.md#erreurs](./API_MOBILE_PHASE1_V2_COMPLETE.md#erreurs)
- **Handling:** [MOBILE_QUICK_START_PHASE1_V2.md#common-mistakes](./MOBILE_QUICK_START_PHASE1_V2.md#common-mistakes)

---

## 🔄 Workflow Complet

```
1. Login → GET TOKEN
   POST /api/auth/login
   
2. Récupérer magasins → SELECT STORE
   GET /api/protected/magasins
   
3. Récupérer produits → SHOW PRODUCTS
   GET /api/protected/produits?magasinId=...
   
4. Si LOT product → SHOW MODE SELECTOR
   Display: [✓] Par unités  [ ] LOT entier
   
5. Si typeStockage='lot' → FETCH LOTS
   GET /api/protected/produits/{id}/lots-disponibles
   
6. Afficher stock dynamique → UPDATE UI
   Mode=partiel → Stock: 320 unités
   Mode=entier  → Stock: 9 LOTs
   
7. Créer vente → POST SALE
   POST /api/protected/ventes
   Include: typeVente per article
   
8. Afficher détail vente → SHOW MODE
   GET /api/protected/ventes/{id}
   Display: "🚀 LOT entier" or "✂️ Par unités"
```

---

## 🔑 Key Changes (Phase 1 v2)

### ✅ Endpoint Nouveaux
```
GET /api/protected/produits/{ID}/lots-disponibles
  Purpose: Récupérer détails des LOTs disponibles
  Response: {lotsDisponibles, lotsDetails[]}
```

### ✅ Champs Nouveaux (Produit)
```
lotsTotal          - Nombre total LOTs
lotsComplet        - LOTs avec status "complet"
lotsPartielVendu   - LOTs avec status "partiel_vendu"
lotsEpuise         - LOTs avec status "épuisé"
lotsDisponibles    - LOTs vendables (complet + partiel)
```

### ✅ Champs Nouveaux (Article dans Vente)
```
typeVente: "entier" | "partiel"
  "entier"   - Vente de LOT complet
  "partiel"  - Vente d'unités du LOT
```

### ✅ Logique Stock (Dynamique par Mode)
```
typeStockage = 'simple':
  - Pas de mode selector
  - Stock = quantiteActuelle (unités)
  
typeStockage = 'lot':
  - Mode selector visible
  - Mode = 'partiel' → Stock = quantiteActuelle (320 unités)
  - Mode = 'entier'  → Stock = lotsDisponibles (9 LOTs)
```

---

## 📊 Response Structures (Phase 1 v2)

### Produit (avec LOT info)
```json
{
  "_id": "prod_002",
  "designation": "Carton Oeufs x30",
  "typeProduitId": {
    "typeStockage": "lot"
  },
  "quantiteActuelle": 320,
  "lotsTotal": 9,
  "lotsComplet": 7,
  "lotsPartielVendu": 2,
  "lotsEpuise": 0,
  "lotsDisponibles": 9
}
```

### Article dans Vente (avec Mode)
```json
{
  "produitId": {...},
  "quantite": 2,
  "prixUnitaire": 150,
  "montant": 300,
  "typeVente": "entier"  // 🔥 Phase 1 v2
}
```

---

## 🧪 Testing

### Postman Collection
File: `../POSTMAN_MOBILE_API.json`

Import dans Postman:
1. File → Import
2. Select `POSTMAN_MOBILE_API.json`
3. Configure variables: `API_BASE`, `TOKEN`, `MAGASIN_ID`
4. Run requests

### Manual Test Sequence
```
1. POST /auth/login
   Save token variable
   
2. GET /magasins
   Select magasin ID
   
3. GET /produits?magasinId={ID}
   Identify LOT product
   
4. GET /produits/{LOT_ID}/lots-disponibles
   See lotsDisponibles
   
5. POST /ventes
   Test avec typeVente: "entier"
   
6. GET /ventes/{ID}
   Verify typeVente in response
```

---

## 🐛 Troubleshooting

### Problem: typeVente not in response
- **Check:** POST /ventes includes typeVente per article
- **Fix:** Add `"typeVente": "entier"` in article object

### Problem: lotsDisponibles is null
- **Check:** Product typeStockage = "lot"
- **Fix:** Use GET /produits/{id}/lots-disponibles endpoint

### Problem: Stock not updating
- **Check:** Mode change handler calls updateStockDisplay()
- **Fix:** Review [MOBILE_QUICK_START_PHASE1_V2.md#step-3](./MOBILE_QUICK_START_PHASE1_V2.md#step-3)

### Problem: Can't sell 2 LOTs
- **Check:** typeVente = "entier" in articles
- **Fix:** Each unit of quantity = 1 LOT (not units inside LOT)

---

## 📞 Support

**Questions?**
1. Check [API_MOBILE_PHASE1_V2_COMPLETE.md](./API_MOBILE_PHASE1_V2_COMPLETE.md)
2. See examples in [MOBILE_QUICK_START_PHASE1_V2.md](./MOBILE_QUICK_START_PHASE1_V2.md)
3. Test with Postman: `POSTMAN_MOBILE_API.json`
4. Review error codes: [API_MOBILE_PHASE1_V2_COMPLETE.md#erreurs](./API_MOBILE_PHASE1_V2_COMPLETE.md#erreurs)

---

## 📋 Checklist Intégration Mobile

- [ ] Phase 1 v2 Guide lu
- [ ] Quick Start setup complété
- [ ] Login API testée (Postman)
- [ ] Produits avec lotsDisponibles affichés
- [ ] Mode selector appear pour LOT only
- [ ] Stock affichage dynamique testé
- [ ] Vente créée avec typeVente
- [ ] Détail vente affiche typeVente
- [ ] Tous les endpoints testés
- [ ] Erreurs gérées correctement
- [ ] Toasts/Snackbars implémentés
- [ ] Production ready ✅

---

**Dernière mise à jour:** 26/01/2026  
**Status:** ✅ Production Ready
