# ⚠️ Troubleshooting & FAQ - Session 3

## Problèmes Courants

### 1. Modal Commande ne s'ouvre pas après création produit

**Symptôme:**
- Produit créé avec succès
- Modal réception se ferme
- Modal commande n'apparaît pas

**Causes possibles:**
- [ ] Script `commande-reception.js` non chargé
  - **Fix:** Vérifier `<script>` tag dans `stock_et_entrepo.php`
  - **Vérifier:** Console → pas d'erreur 404
  
- [ ] Fonction `openCommandeModal()` pas appelée
  - **Fix:** Vérifier dans `add_prod.php` ligne ~1290
  - **Chercher:** `setTimeout(() => { window.openCommandeModal(produit)`
  
- [ ] Variable `lastCreatedProduct` pas initialisée
  - **Fix:** Vérifier en haut du script `let selectedCommande = null`
  - **Console:** `console.log(window.lastCreatedProduct)`

**Diagnostic:**
```javascript
// En console du navigateur
console.log(typeof window.openCommandeModal);  // Doit être 'function'
console.log(window.lastCreatedProduct);         // Doit avoir produit data
```

---

### 2. Prévisions ne s'affichent pas en réception

**Symptôme:**
- Sélection produit fonctione
- Section "Prévisions" n'apparaît pas
- Réception s'affiche vide

**Causes possibles:**
- [ ] Route `/commandes/produit/:id` n'existe pas
  - **Fix:** Vérifier dans `routes/commandes.js` ligne ~75
  - **Vérifier:** Ordre routes (produit AVANT :commandeId)
  
- [ ] Produit n'a pas de commande liée
  - **Fix:** S'assurer commande créée et liée au produit
  - **Check BD:** Commande.produitId = produitId
  
- [ ] API retourne 404
  - **Fix:** Vérifier magasinId correct dans requête
  - **Console:** Vérifier réponse fetch

**Diagnostic:**
```javascript
// En console du navigateur
const produitId = document.getElementById('produitReception').value;
fetch(`/api/protected/commandes/produit/${produitId}`, {
  headers: {'Authorization': `Bearer ${getAuthToken()}`}
}).then(r => r.json()).then(console.log);
```

---

### 3. Score ne se calcule pas

**Symptôme:**
- Prévisions affichées OK
- Remplissage champs réalité
- Section score n'apparaît pas

**Causes possibles:**
- [ ] Script `commande-reception.js` pas chargé
  - **Fix:** Vérifier include dans stock_et_entrepo.php
  - **Console:** Chercher "commande-reception.js" dans Network
  
- [ ] Event listeners pas attachés
  - **Fix:** Vérifier que DOM éléments existent:
    ```javascript
    document.getElementById('quantiteReception') // Doit exister
    document.getElementById('etatReel')          // Doit exister
    ```
  
- [ ] Logique calculateScore() ne se déclenche pas
  - **Fix:** Ajouter console.log dans calculateScore()
  - Taper dans input → vérifier console

**Diagnostic:**
```javascript
// Forcer calcul
const calculateScore = window.calculateScore;
if (calculateScore) calculateScore();
else console.log('calculateScore pas trouvée');
```

---

### 4. Création commande échoue

**Symptôme:**
- Modal commande rempli
- Clique "Créer Commande"
- Notification erreur

**Causes possibles:**
- [ ] API retourne 400
  - **Fix:** Vérifier tous champs obligatoires remplis
  - **Checker:** quantiteCommandee > 0
  
- [ ] Fournisseur pas sélectionné
  - **Fix:** Dropdown doit avoir valeur
  - **Console:** `document.getElementById('commandeFournisseur').value`
  
- [ ] MagasinId manquant
  - **Fix:** Vérifier utilisateur a magasinId en session
  - **Backend:** Utilise `req.user.magasinId` si pas fourni

**Diagnostic:**
```javascript
// Vérifier avant submit
const formData = {
  produitId: lastCreatedProduct._id,
  fournisseurId: document.getElementById('commandeFournisseur').value,
  quantiteCommandee: parseFloat(document.getElementById('commandeQuantite').value),
  delaiLivraisonPrevu: parseInt(document.getElementById('commandeDelai').value),
  etatPrevu: document.getElementById('commandeEtat').value
};
console.log('Form data:', formData);
// Tous doivent être présents et valides
```

---

### 5. Erreur 404 sur route /commandes/produit/:id

**Symptôme:**
- Console montre erreur 404
- Prévisions ne chargent pas

**Causes possibles:**
- [ ] Route pas enregistrée dans app.js
  - **Fix:** Vérifier dans app.js:
    ```javascript
    app.use('/api/protected', commandesRoutes);
    ```
  
- [ ] Nom du routeur incorrect
  - **Fix:** Vérifier export dans commandes.js:
    ```javascript
    module.exports = router;  // Pas 'routes'
    ```
  
- [ ] Route non-exacte (typo)
  - **Fix:** Chercher exactement:
    ```javascript
    router.get('/commandes/produit/:produitId', ...)
    ```
    Ne pas faire `/commande/produit/...` ou `/produit/...`

**Diagnostic:**
```bash
# Dans terminal
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/protected/commandes/produit/643d123abc...
```

---

### 6. Score ne s'affiche pas: 0/100

**Symptôme:**
- Score section apparaît
- Tous les scores à "0"
- Score total "0 / 100"

**Causes possibles:**
- [ ] selectedCommande pas chargée
  - **Fix:** Vérifier prévisions affichées avant d'entrer réalité
  
- [ ] Calcul score pas déclenché
  - **Fix:** Entrer valeur dans quantiteReception (force change event)
  
- [ ] Variables non mises à jour
  - **Fix:** Ajouter console.log(selectedCommande) dans calculateScore()

**Diagnostic:**
```javascript
// Dans calculateScore()
console.log('selectedCommande:', selectedCommande);
console.log('quantiteReelle:', quantiteReelle);
console.log('etatReel:', etatReel);
```

---

### 7. Erreur: "Cannot read property '_id' of null"

**Symptôme:**
- Erreur JavaScript
- Modal commande pas rempli correctement

**Causes possibles:**
- [ ] Produit créé pas retourné correctement
  - **Fix:** Vérifier réponse API en add_prod.php
  
- [ ] `lastCreatedProduct` pas assigné
  - **Fix:** Vérifier `openCommandeModal(produit)` reçoit data

**Diagnostic:**
```javascript
// En console lors création produit
window.lastCreatedProduct  // Doit être un objet avec _id
```

---

## Vérifications Pré-Test

### Avant de tester:

1. **Vérifier fichiers créés:**
   ```bash
   ls -la assets/js/commande-reception.js
   # Doit exister et avoir ~165 lignes
   ```

2. **Vérifier modifications:**
   ```bash
   grep -n "modalCreerCommande" pages/stock/add_prod.php
   # Doit trouver le modal
   
   grep -n "sectionPrevisions" pages/stock/modal_reception.php
   # Doit trouver la section
   ```

3. **Vérifier routes:**
   ```bash
   grep -n "/commandes/produit" routes/commandes.js
   # Doit trouver la route
   ```

4. **Vérifier includes:**
   ```bash
   grep -n "commande-reception.js" pages/stock/stock_et_entrepo.php
   # Doit trouver l'inclusion
   ```

5. **Vérifier console du navigateur:**
   ```javascript
   // Pas d'erreurs 404
   // Pas d'erreurs Uncaught
   // API réponses OK (200, 201)
   ```

---

## Debugging Pas à Pas

### Problème: "Commande pas créée"

**Étape 1: Vérifier form submit**
```javascript
document.getElementById('formCreerCommande').addEventListener('submit', (e) => {
  console.log('Form submitted');
  console.log('Données:', {
    fournisseur: document.getElementById('commandeFournisseur').value,
    quantite: document.getElementById('commandeQuantite').value,
    delai: document.getElementById('commandeDelai').value,
    etat: document.getElementById('commandeEtat').value
  });
  // Puis submit normal
});
```

**Étape 2: Vérifier fetch**
```javascript
const response = await fetch(`${API_BASE}/protected/commandes`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
  },
  body: JSON.stringify({...})
});
console.log('Response status:', response.status);
console.log('Response data:', await response.json());
```

**Étape 3: Vérifier serveur**
```bash
# Terminal backend
npm start
# Chercher logs d'erreur
# Doit voir "POST /api/protected/commandes"
```

**Étape 4: Vérifier BD**
```javascript
// Mongo console ou tool
db.commandes.find({}).sort({dateCommande: -1}).limit(1)
// Doit voir la dernière commande créée
```

---

## Questions Fréquentes (FAQ)

### Q1: Modal commande s'ouvre mais sans produit?
**A:** Vérifier que `openCommandeModal(produit)` reçoit data correcte
```javascript
// Ajouter dans openCommandeModal()
console.log('produit reçu:', productData);
```

### Q2: Prévisions chargées mais score pas calculé?
**A:** Vérifier que vous modifiez les champs réalité (quantité, état, date)
```javascript
// Vérifier événement change déclenché
document.getElementById('quantiteReception').addEventListener('change', () => {
  console.log('Quantité changée, recalc score');
});
```

### Q3: Erreur "API_BASE is not defined"?
**A:** Vérifier que `api-config.js` est chargé AVANT les autres scripts
```html
<script src="assets/js/api-config.js"></script>
<script src="assets/js/commande-reception.js"></script>
```

### Q4: Score incorrect (ex: devrait être 75, affiche 100)?
**A:** Vérifier l'algorithme de calcul:
- Quantité: ratio% vs prévue
- Délai: jours vs prévu
- État: exact match
- Conformité: problèmes oui/non

### Q5: Fournisseur dropdown vide?
**A:** Vérifier que fournisseurs existent en BD
```javascript
// Console
fetch('/api/protected/fournisseurs')
  .then(r => r.json())
  .then(console.log);
```

### Q6: Commande créée mais pas visible dans réception?
**A:** Vérifier que produit sélectionné a `produitId` correct
```javascript
// Console
document.getElementById('produitReception').value
// Doit matcher le produit créé
```

### Q7: Photo obligatoire mais scoring pas affecté?
**A:** Photo c'est pour réception, pas pour scoring
Score utilise: quantité, délai, état, problèmes (SEULEMENT)

### Q8: Comment tester sans créer manuellement?
**A:** Utiliser le script de test en console:
```javascript
// Créer rapidement un produit + commande
const produit = await fetch('/api/protected/produits', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({designation: 'TEST', ...})
}).then(r => r.json());

await fetch('/api/protected/commandes', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    produitId: produit._id,
    quantiteCommandee: 100,
    ...
  })
});
```

---

## Logs Utiles

### Activer verbose logging:
```javascript
// En haut de commande-reception.js
const DEBUG = true;

function log(msg, data) {
  if (DEBUG) console.log('[COMMANDE]', msg, data);
}
```

### Vérifier workflow complet:
```javascript
// Console du navigateur
// 1. Vérifier produit sélectionné
const produitId = document.getElementById('produitReception').value;
log('Produit sélectionné:', produitId);

// 2. Charger commande
const commande = await fetch(`/api/protected/commandes/produit/${produitId}`)
  .then(r => r.json());
log('Commande chargée:', commande);

// 3. Afficher prévisions
log('Prévisions:',{
  qty: commande.quantiteCommandee,
  delai: commande.delaiLivraisonPrevu,
  etat: commande.etatPrevu
});

// 4. Simuler réalité
log('Réalité saisie:', {
  qty: 100,
  delai_real: 8,
  etat_real: 'Neuf'
});

// 5. Calculer score
// (script auto-déclenche)
log('Score calculé:',{
  quantite: 30,
  delai: 20,
  qualite: 25,
  conformite: 20,
  total: 95
});
```

---

## Contact & Support

Si problème persiste:

1. **Vérifier tous les fichiers modifiés** (voir FICHIERS_MODIFIES_SESSION3.md)
2. **Exécuter test complet** (voir TESTING_CHECKLIST_SESSION3.md)
3. **Vérifier logs** (navigateur console + serveur terminal)
4. **Reset et rebuild:**
   ```bash
   npm start
   # Puis clear cache navigateur (Ctrl+Shift+Del)
   # Puis reload page (Ctrl+F5)
   ```

---

**Status: READY FOR TROUBLESHOOTING** ✅

Tous les problèmes courants documentés avec solutions!
