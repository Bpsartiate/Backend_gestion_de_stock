# 🧪 Supplier Rating System - Testing Guide

## 📋 Pre-Test Checklist

Before testing, ensure:
- [ ] Backend server is running (`node server.js`)
- [ ] MongoDB is connected
- [ ] User is authenticated with valid token
- [ ] Magasin ID is available
- [ ] Postman or similar API client is ready

## 🧪 Test Scenarios

### Test 1: Create a Simple Order

**Objective:** Create an order and verify it's saved

**API Call:**
```bash
POST http://localhost:3000/api/protected/commandes
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json

{
  "produitId": "PRODUCT_ID_HERE",
  "magasinId": "MAGASIN_ID_HERE",
  "quantiteCommandee": 100,
  "prixUnitaire": 50,
  "fournisseur": "Acier Premium",
  "delaiLivraisonPrevu": 7,
  "etatPrevu": "Neuf",
  "remarquesCommande": "Test commande"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Commande créée avec succès",
  "commande": {
    "_id": "COMMANDE_ID",
    "statut": "EN_ATTENTE",
    "quantiteRecue": 0
  }
}
```

**Verification:**
✅ Statut est "EN_ATTENTE"
✅ quantiteRecue commence à 0
✅ Commande ID est retourné

---

### Test 2: Receive Order with Perfect Performance

**Objective:** Receive all items on time with perfect condition

**API Call:**
```bash
POST http://localhost:3000/api/protected/commandes/COMMANDE_ID/recevoir
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json

{
  "quantiteRecue": 100,
  "etatReel": "Neuf",
  "problemes": [],
  "remarques": "Parfait!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Réception enregistrée avec succès",
  "fournisseurRating": {
    "scoreFinal": 100,
    "scoreQuantite": 30,
    "scoreDelai": 25,
    "scoreQualite": 25,
    "scoreConformite": 20,
    "evaluation": "Excellent",
    "recommandation": "Continuer"
  }
}
```

**Verification:**
✅ Score = 100
✅ Évaluation = "Excellent"
✅ Recommandation = "Continuer"
✅ Statut = "REÇUE_COMPLÈTEMENT"

---

### Test 3: Receive Order with Issues

**Objective:** Receive partially with late delivery and damage

**API Call:**
```bash
POST http://localhost:3000/api/protected/commandes/COMMANDE_ID/recevoir
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json

{
  "quantiteRecue": 85,
  "etatReel": "Usagé",
  "problemes": ["Emballage endommagé", "Étiquette manquante"],
  "remarques": "Plusieurs problèmes"
}
```

**Expected:**
- Score quantité: ~24 (85/100 = -5% = -1.5 pts)
- Score délai: Dépend du délai réel
- Score qualité: 9 (Usagé vs Neuf = 2 niveaux = -16 pts)
- Score conformité: 10 (2 problèmes = -10 pts)
- **Total: ~43-53** = Médiocre → "Améliorer"

**Verification:**
✅ Score < 60
✅ Évaluation = "Médiocre"
✅ Recommandation = "Améliorer"
✅ Rating créé avec tous les détails

---

### Test 4: View Supplier Ranking

**Objective:** Get top suppliers by score

**API Call:**
```bash
GET http://localhost:3000/api/protected/fournisseur-ranking?magasinId=MAGASIN_ID
Authorization: Bearer <YOUR_TOKEN>
```

**Expected Response:**
```json
{
  "success": true,
  "ranking": [
    {
      "_id": "Acier Premium",
      "scoreMoyen": 95.5,
      "totalEvaluations": 3,
      "recommendationPrincipal": "Continuer"
    },
    {
      "_id": "Plastiques Inc",
      "scoreMoyen": 62.3,
      "totalEvaluations": 2,
      "recommendationPrincipal": "Améliorer"
    }
  ]
}
```

**Verification:**
✅ Array of suppliers by score
✅ Each supplier has scoreMoyen, totalEvaluations
✅ Sorted by highest score first

---

### Test 5: View Supplier Statistics

**Objective:** Get detailed stats for a supplier

**API Call:**
```bash
GET http://localhost:3000/api/protected/fournisseur-stats?magasinId=MAGASIN_ID&fournisseur=Acier%20Premium
Authorization: Bearer <YOUR_TOKEN>
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "totalEvaluations": 5,
    "scoreMoyen": "84.2",
    "scoreMoyenParCategorie": {
      "quantite": "28",
      "delai": "21.5",
      "qualite": "22",
      "conformite": "18"
    },
    "evaluations": {
      "Excellent": 2,
      "Bon": 2,
      "Acceptable": 1
    },
    "recommandations": {
      "Continuer": 3,
      "Surveiller": 2
    }
  },
  "ratings": [...]
}
```

**Verification:**
✅ Statistics calculated correctly
✅ Categories sum to total
✅ All ratings included

---

### Test 6: Partial Reception

**Objective:** Receive product in multiple shipments

**Commande:** Quantité commandée = 100

**1st Reception:**
```bash
POST /api/protected/commandes/ID/recevoir
{
  "quantiteRecue": 50,
  "etatReel": "Neuf"
}
```
→ Statut should be "REÇUE_PARTIELLEMENT"

**2nd Reception:**
```bash
POST /api/protected/commandes/ID/recevoir
{
  "quantiteRecue": 50,
  "etatReel": "Neuf"
}
```
→ Total received = 100
→ Statut should change to "REÇUE_COMPLÈTEMENT"

**Verification:**
✅ First statut = "REÇUE_PARTIELLEMENT"
✅ Second statut = "REÇUE_COMPLÈTEMENT"
✅ quantiteRecue cumulated correctly
✅ Two receptions created

---

### Test 7: Access Web Interface

**Objective:** Verify UI loads and displays data

**Steps:**
1. Open browser → `http://localhost:3000/backend_Stock/pages/stock/fournisseurs.php?magasinId=YOUR_ID`
2. Wait for page to load
3. Check each tab

**Expected:**

**Onglet Classement:**
✅ Table loads with supplier ranking
✅ Scores displayed in circles
✅ Colors match evaluation level
✅ Recommendations shown
✅ "Voir" button functional

**Onglet Détails:**
✅ Table with all ratings
✅ DataTable with pagination
✅ Can sort by column
✅ "Détail" buttons clickable

**Onglet Analyse:**
✅ 3 charts load correctly
✅ Chart 1: Distribution doughnut chart
✅ Chart 2: Bar chart with categories
✅ Chart 3: Horizontal bar chart

**En-tête:**
✅ Stats calculated and displayed
✅ Refresh button works

---

## 🔍 Detailed Scoring Verification

### Example Calculation

**Order Created:**
```
Quantité: 100
Délai Prévu: 7 jours
État Prévu: Neuf
```

**Order Received (after 10 days):**
```
Quantité Reçue: 90
Délai Réel: 10 jours
État Réel: Bon état
Problèmes: ["Emballage endommagé"]
```

**Manual Verification:**

1. **Score Quantité:**
   - Taux conformité = 90/100 = 90%
   - Écart = |100 - 90| = 10%
   - Pénalité = 10% × 0.3 = 3 points
   - Score = 30 - 3 = **27**

2. **Score Délai:**
   - Retard = 10 - 7 = 3 jours
   - Pénalité = 3 × 1.5 = 4.5 points
   - Score = 25 - 4.5 = **20.5** → **20** (arrondi)

3. **Score Qualité:**
   - Neuf(4) vs Bon état(3) = 1 niveau différent
   - Pénalité = 1 × 8 = 8 points
   - Score = 25 - 8 = **17**

4. **Score Conformité:**
   - Problèmes = 1
   - Pénalité = 1 × 5 = 5 points
   - Score = 20 - 5 = **15**

**Total = 27 + 20 + 17 + 15 = 79**

**API Response should show:**
```json
{
  "scoreQuantite": 27,
  "scoreDelai": 20,
  "scoreQualite": 17,
  "scoreConformite": 15,
  "scoreFinal": 79,
  "evaluation": "Bon",
  "recommandation": "Surveiller"
}
```

---

## 🐛 Troubleshooting

### Issue: "FournisseurRating model not found"
**Solution:** Ensure `routes/fournisseurRating.js` is imported in app.js

### Issue: "Scores not calculating"
**Solution:** Check that `etatReel` is provided in reception request

### Issue: "Fournisseur ranking shows empty"
**Solution:** Ensure at least one order has been fully received with `etatReel`

### Issue: "UI not loading"
**Solution:** Check browser console for auth token errors

### Issue: "Charts not displaying"
**Solution:** Check that Chart.js CDN is loaded (no network errors)

---

## 📊 Expected Test Results

After completing all tests:

| Test | Expected Status | Actual Status |
|------|-----------------|---------------|
| 1. Create Order | ✅ | |
| 2. Perfect Receipt | ✅ Score = 100 | |
| 3. Poor Receipt | ✅ Score < 60 | |
| 4. View Ranking | ✅ Shows suppliers | |
| 5. View Stats | ✅ Shows categories | |
| 6. Partial Receipt | ✅ Status changes | |
| 7. UI Interface | ✅ All 3 tabs | |
| 8. Scoring Math | ✅ Manual calc match | |

---

## 🔄 Regression Testing

Before deploying, test:

1. **Existing Commandes still work**
   - POST /api/protected/commandes (no etat fields)

2. **Existing Reception still works**
   - POST /api/protected/commandes/:id/recevoir (without etat params)

3. **Can view old commandes**
   - GET /api/protected/commandes

4. **Can update commande statut**
   - PUT /api/protected/commandes/:id

---

## 📈 Performance Testing

### Load Test
1. Create 100 orders
2. Receive 100 orders (with etat calculations)
3. Query ranking → should return in <1 second
4. Load UI → should respond in <2 seconds

### Stress Test
1. Create 10 orders simultaneously
2. Receive 10 orders simultaneously
3. UI should not crash
4. All ratings should be created

---

## ✅ Final Checklist

Before marking as complete:

- [ ] All 8 test scenarios passed
- [ ] Scoring calculations verified manually
- [ ] Web UI loads and displays correctly
- [ ] All 3 tabs functional
- [ ] No JavaScript errors in console
- [ ] No MongoDB errors in terminal
- [ ] Ratings persist after page refresh
- [ ] Can click "Voir détails" and see modal
- [ ] Charts render correctly
- [ ] Responsive design works on mobile

---

**Test Environment:**
- Backend: Node.js + Express
- Database: MongoDB
- Frontend: Bootstrap 5 + Chart.js
- Browser: Chrome/Firefox/Edge

**Test Date:** _________________
**Tester Name:** _________________
**Result:** ✅ PASSED / ❌ FAILED
