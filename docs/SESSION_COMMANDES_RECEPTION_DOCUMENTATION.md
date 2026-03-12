# 📋 Documentation: Système de Commandes et Réceptions
**Date**: Février-Mars 2026  
**Session Focus**: Intégration complète du workflow commandes ↔ réceptions

---

## 🎯 Vue d'ensemble du projet

Le système gère le cycle de vie complet des commandes et réceptions de produits:
1. **Création de produits** en mode "En Commande" (EN_COMMANDE)
2. **Suivi des commandes** avec les détails fournisseur, dates, quantités
3. **Réception des produits** avec comparaison commande vs. réalité
4. **Mise à jour automatique** du statut produit & commande

### Architecture générale:
```
Produit (EN_COMMANDE)
    ↓
Commande créée
    ↓
Réception enregistrée
    ↓
Produit passe à STOCKÉ
    ↓
Commande passe à REÇUE
```

---

## ✅ Problèmes résolus dans cette session

### 1. **getAuthToken is not defined**
- **Fichier**: `assets/js/commande-reception.js:26`
- **Cause**: La fonction `getAuthToken()` n'était pas définie dans le module commande-reception
- **Solution**: Ajout de la fonction au début du fichier IIFE (lines 7-23)
- **Impact**: Module peut maintenant charger les commandes via API

### 2. **API 404 Not Found sur endpoint commandes**
- **Endpoint**: `/api/protected/commandes/produit/{produitId}`
- **Cause**: Path était incorrect - manquait `/api` 
- **Solution**: Correction du path dans commande-reception.js (line 44)
  - Avant: `${API_BASE}/protected/commandes/...`
  - Après: `${apiBase}/api/protected/commandes/...`
- **Note**: 404 pour aucune commande est un comportement normal (produit sans commande)

### 3. **TypeError: Cannot set properties of null**
- **Fichier**: `assets/js/commande-reception.js:196`
- **Cause**: `updateComparaisons()` essayait d'écrire dans des éléments qui n'existaient pas
- **Solution**: Ajout de vérifications `if (element)` avant de modifier les propriétés (lines 171-215)
- **Impact**: Pas d'erreur quand la section "Réalité Reçue & Comparaison" est cachée

### 4. **Produit reste EN_COMMANDE après réception**
- **Cause**: POST /receptions n'était pas mis à jour le statut du produit et de la commande
- **Solution**: Ajout de logique dans `routes/protected.js` (lines 4483-4500)
  - Si `produit.etat === 'EN_COMMANDE'` → passer à `'STOCKÉ'`
  - Mettre à jour la commande: `statut = 'REÇUE'` et `dateReception = now()`
- **Impact**: Produit affiche correctement le statut après réception

### 5. **Enum validation error: ACTIF is not valid**
- **Erreur**: `etat: 'ACTIF' is not a valid enum value`
- **Cause**: Enum valides pour `etat` sont: `['Neuf', 'Bon état', 'Usagé', 'Endommagé', 'EN_COMMANDE', 'STOCKÉ']`
- **Solution**: Changement de `'ACTIF'` à `'STOCKÉ'` dans protected.js
- **Impact**: Réception fonctionne maintenant sans erreur de validation

---

## 📁 Fichiers modifiés

### 1. **assets/js/commande-reception.js**
```javascript
Lines 7-23:     Ajout fonction getAuthToken()
Lines 41-47:    Correction du path API (+ /api/)
Lines 51-65:    Gestion améliorée des réponses (404 = pas de commande)
Lines 159-215:  Ajout de null checks dans updateComparaisons()
```

**Résumé des changements:**
- Module autosuffisant (n'a plus besoin d'une fonction globale getAuthToken)
- Path API correct montrant la structure `/api/protected/`
- Gestion robuste des éléments manquants du DOM
- Support complet des différentes réponses API (existant, 404, erreur)

### 2. **routes/protected.js**
```javascript
Lines 4483-4500: Mise à jour statut produit & commande après réception
```

**Logique ajoutée:**
```javascript
if (produit.etat === 'EN_COMMANDE') {
  // 1. Produit: EN_COMMANDE → STOCKÉ
  produit.etat = 'STOCKÉ';
  
  // 2. Commande: statut = REÇUE + dateReception
  commande.statut = 'REÇUE';
  commande.dateReception = new Date();
}
```

**Impact:**
- Réception complète le cycle commande → stockage
- Table de stock rafraîchit automatiquement avec nouveau statut
- Commande marquée comme reçue dans la base de données

### 3. **pages/stock/modal_reception.php** (Préalablement modifié)
```html
Lines 243-340: Section "Réalité Reçue & Comparaison"
- id="sectionRealiteComparaison" (caché par défaut)
- Deux groupes de champs: realiteSimple et realieLot
- Affichage des écarts (quantité, date, état)
```

### 4. **pages/stock/add_prod.php** (Préalablement modifié)
```javascript
Lines 2397-2470: Création de commande
- Sauvegarde des données commande AVANT reset du formulaire
- Récupération gracieuse du magasinId (localStorage, sessionStorage, etc.)
- Inclusion des champs: magasinId, dateEcheance, prixUnitaire
```

### 5. **routes/commandes.js** (Préalablement modifié)
```javascript
Lines 195-200: Populate chaining fix
- Reload document avec findById() AVANT populate()
- Sinon get error: "populate is not a function on instance"
```

---

## 🔄 Flux de travail complet

### Étape 1: Création de produit en commande
**Fichier**: `pages/stock/add_prod.php`
- Utilisateur sélectionne "En Commande" 
- Remplit: quantité, fournisseur, prix, date écheance
- Clique "Ajouter Commande"
- Données sauvegardées → Produit marqué EN_COMMANDE
- Commande créée dans la DB

### Étape 2: Affichage tableau de stock
**Fichier**: `assets/js/stock.js`
- Produit apparaît avec badge "🛒 En commande"
- Quantité affichée = quantiteCommandee (si disponible)
- Rayon = celui du produit

### Étape 3: Ouverture modal réception
**Fichier**: `assets/js/reception.js`
- Utilisateur clique "Réception"
- Modal se réinitialise avec liste des produits

### Étape 4: Sélection du produit EN_COMMANDE
**Fichier**: `assets/js/commande-reception.js`
- Produit sélectionné
- Module charge la commande depuis API: `GET /api/protected/commandes/produit/{produitId}`
- Section "Réalité Reçue & Comparaison" s'affiche
- Prévisions chargées: quantité commandée, date écheance, état prévu

### Étape 5: Remplissage réception
**Fichier**: `pages/stock/modal_reception.php`
- Utilisateur remplit:
  - Quantité reçue réelle
  - Nombre de pièces (si LOT)
  - Date de réception
  - État du colis
  - Photo
- En temps réel: écarts calculés et affichés
  - ✓ Vert si OK
  - ✗ Rouge si problème

### Étape 6: Enregistrement réception
**Fichier**: `routes/protected.js` POST /receptions
1. Validation produit, magasin, rayon
2. Création réception record
3. Création mouvement de stock
4. Mise à jour quantités produit
5. **NOUVEAU**: Mise à jour statut:
   - Produit: EN_COMMANDE → STOCKÉ
   - Commande: → REÇUE
6. Retour JSON avec détails

### Étape 7: Rafraîchissement tableau
**Fichier**: `assets/js/stock.js` afficherTableProduits()
- Récupère la liste produits mise à jour
- Produit affiche maintenant: badge normal (pas "En commande")
- Quantité = quantiteActuelle (au lieu de quantiteCommandee)

---

## 🗂️ Structure de base de données

### Modèle Produit
```javascript
{
  _id: ObjectId,
  designation: String,
  reference: String,
  typeProduitId: ObjectId → TypeProduit,
  magasinId: ObjectId → Magasin,
  rayonId: ObjectId → Rayon,
  
  // États possibles: 'Neuf', 'Bon état', 'Usagé', 'Endommagé', 'EN_COMMANDE', 'STOCKÉ'
  etat: String,
  
  quantiteActuelle: Number,
  quantiteEntree: Number,
  quantiteSortie: Number,
  
  commandesIds: [ObjectId],  // Références aux commandes
  
  prixUnitaire: Number,
  seuilAlerte: Number,
  
  photoUrl: String,
  dateEntree: Date,
  dateReception: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

### Modèle Commande
```javascript
{
  _id: ObjectId,
  produitId: ObjectId → Produit,
  magasinId: ObjectId → Magasin,
  fournisseurId: ObjectId → Fournisseur,
  
  quantiteCommandee: Number,
  prixUnitaire: Number,
  prixTotal: Number,
  
  dateCommande: Date,
  dateEcheance: Date,
  dateReception: Date,
  dateExpedition: Date,
  
  // Statuts: 'EN_ATTENTE', 'EXPÉDIÉE', 'REÇUE', 'ANNULÉE', 'PARTIELLEMENT_REÇUE'
  statut: String,
  
  quantiteRecue: Number,
  etatPrevu: String,  // État attendu du produit
  
  receptionsIds: [ObjectId],  // Références aux réceptions
  
  createdBy: ObjectId,
  updatedBy: ObjectId,
  
  createdAt: Date,
  updatedAt: Date
}
```

### Modèle Reception
```javascript
{
  _id: ObjectId,
  produitId: ObjectId → Produit,
  magasinId: ObjectId → Magasin,
  rayonId: ObjectId → Rayon,
  
  quantite: Number,
  prixAchat: Number,
  fournisseur: String,
  
  // LOT fields
  nombrePieces: Number,
  quantiteParPiece: Number,
  uniteDetail: String,
  
  photoUrl: String,
  
  dateReception: Date,
  datePeremption: Date,
  
  statut: String,
  
  mouvementStockId: ObjectId,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 Endpoints API impliqués

### GET /api/protected/commandes/produit/{produitId}
**Module**: `routes/commandes.js:50-65`
**Retourne**: 
```json
{
  _id: "...",
  produitId: {...},
  quantiteCommandee: 60,
  dateEcheance: "2026-02-15",
  etatPrevu: "Neuf",
  statut: "EN_ATTENTE"
}
```
**Note**: Retourne 404 si aucune commande n'existe (comportement normal)

### POST /api/protected/receptions
**Module**: `routes/protected.js:4039+`
**Entrée**:
```json
{
  produitId: "...",
  magasinId: "...",
  rayonId: "...",
  quantite: 95,
  typeProduitId: "...",
  prixAchat: 300,
  photoUrl: "https://..."
}
```
**Sortie**:
```json
{
  success: true,
  message: "✅ Réception enregistrée avec succès",
  reception: {...},
  produitUpdated: {
    etat: "STOCKÉ",  // ← NOUVEAU: etat updated
    quantiteActuelle: 95
  }
}
```

### GET /api/protected/produits/{magasinId}
**Module**: Affichage table stocks
**Note**: Returns products with updated `etat` after reception

---

## 🐛 Problèmes connus et solutions

### 1. Modal réception ne se met pas à jour après fermeture
- **Solution**: Cliquer deux fois sur Réception ou rafraîchir la page
- **Root cause**: Cache du frontend - événement de fermeture modal incohérent
- **À améliorer**: Émettre un événement global lors de reception réussie

### 2. Comparaison ne s'affiche pas pour produits sans commande
- **Comportement**: Normal - la section est cachée
- **Si vous voulez afficher**: Modifier logique dans `commande-reception.js` displayPrevisions()

### 3. Produits multiples avec même référence
- **État actuel**: Tous les produits affichent le même statut
- **Amélioration possible**: Gérer les commandes partielles/multiples par produit

---

## 🚀 Prochaines étapes possibles

### Court terme (1-2 jours):
1. **Tester commandes partielles**
   - Commande: 100 unités
   - Réception 1: 60 unités → PARTIELLEMENT_REÇUE
   - Réception 2: 40 unités → REÇUE
   - **Fichier à modifier**: `routes/protected.js` POST /receptions (faire calcul quantité totale)

2. **Ajouter historique des réceptions**
   - Afficher timeline: date commande → date expédition → date réception
   - **Fichier**: Créer modal history (déjà partiellement implémenté)

3. **Notification fournisseur**
   - Envoyer email au fournisseur quand commande créée
   - **Fichier à créer**: `services/notificationService.js`

### Moyen terme (1-2 semaines):
1. **Dashboard commandes**
   - Filtrer par: statut, fournisseur, date, magasin
   - Graphiques: taux de réception à temps, fournisseur performance
   - **Fichier**: Créer `pages/stock/commandes-dashboard.php`

2. **Gestion des retours**
   - Si produit reçu endommagé: créer retour
   - Statut RETOURNÉ → fournisseur
   - **Fichier à créer**: `models/retour.js`

3. **Évaluation fournisseur**
   - Score basé sur: délai, qualité, conformité
   - **Fichier**: Améliorer `models/fournisseurRating.js`

### Long terme (1 mois+):
1. **Interface mobile**
   - App React Native pour réception sur terrain
   - Code-barres scanning
   - **Stack**: React Native + Expo

2. **Prévisions de stock**
   - Prévoir besoin basé sur: commandes, saisonnalité
   - Suggestions auto-commande
   - **Stack**: Machine Learning (Python)

3. **Intégration ERP**
   - Synchroniser avec systèmes externes
   - **Format**: JSON API, webhooks

---

## 📚 Ressources et références

### Fichiers clés
- `models/produit.js` - Schéma produit (states, quantités)
- `models/commande.js` - Schéma commande
- `models/reception.js` - Schéma réception
- `routes/protected.js` - Endpoints complète réception
- `routes/commandes.js` - Endpoints gestion commandes
- `assets/js/commande-reception.js` - Logique modal réception (chargement commande)
- `assets/js/reception.js` - Logique complète modal réception
- `assets/js/stock.js` - Affichage tableau stock (détection EN_COMMANDE)
- `pages/stock/modal_reception.php` - HTML/CSS modal réception

### Modules JavaScript chargés
```html
<!-- Dans stocks_et_entreposage.php -->
<script src="/assets/js/commande-reception.js"></script>
<script src="/assets/js/reception.js"></script>
<script src="/assets/js/reception-history.js"></script>
```

### Énums et constantes
```javascript
// État produit (produit.js)
etat: ['Neuf', 'Bon état', 'Usagé', 'Endommagé', 'EN_COMMANDE', 'STOCKÉ']

// Statut commande (commande.js)
statut: ['EN_ATTENTE', 'EXPÉDIÉE', 'REÇUE', 'ANNULÉE', 'PARTIELLEMENT_REÇUE']
```

---

## 🔐 Authentification et autorisations

### Token JWT
- **Storage**: localStorage/sessionStorage
- **Clé**: `token` ou `authToken`
- **Récupération**: Fonction `getAuthToken()` dans chaque module
- **Expiration**: À vérifier dans topbar.js

### Middleware
- `authMiddleware` - Valide token dans tous les endpoints /api/protected
- `checkMagasinAccess` - Vérifie accès utilisateur au magasin
- Headers requis: `Authorization: Bearer {token}`

---

## 📝 Conventions de code

### Logging
```javascript
// Info
console.log('✅ Message OK');
console.log('📦 Données');
console.log('🔵 Action en cours');

// Erreur
console.error('❌ Erreur message');
console.error('❌ GET /endpoint error:', error);

// Debug
console.log('🔍 DEBUG variable:', value);
console.log('   Propriété: ${prop}');
```

### Nommage
- Fonctions: `camelCase` (submitReception)
- Constantes: `UPPER_CASE` (MAGASIN_ID)
- Variables DOM: `id="sectionRealiteComparaison"` (kebab-case)
- CSS classes: `badge bg-info` (Bootstrap classes)

### Async/Await
```javascript
// Pattern utilisé
try {
  const response = await fetch(url, { headers: {...} });
  if (response.ok) {
    const data = await response.json();
    // Process
  } else {
    console.error('Status:', response.status);
  }
} catch (error) {
  console.error('Error:', error);
}
```

---

## ✨ Comment continuer le développement

### Pour ajouter une nouvelle feature:
1. **Identifier le fichier à modifier** en se basant sur la structure ci-dessus
2. **Vérifier les endpoints API** nécessaires
3. **Ajouter logging** pour debug
4. **Tester sur produit EN_COMMANDE** en priorité
5. **Vérifier l'enum** si modification d'état (produit.etat)
6. **Tester réception** complète après modification

### Pour déboguer:
1. **Ouvrir console** (F12) et chercher les `❌` (erreurs rouges)
2. **Vérifier token** avec `localStorage.getItem('token')`
3. **Tester endpoint** avec Postman en utilisant le token
4. **Ajouter console.log** autour du code suspect
5. **Vérifier base de données** MongoDB compass pour voir l'état réel

### Pour déployer:
1. **Push code** vers Git
2. **Backend se redéploie** automatiquement sur Render
3. **Attendre ~2 min** pour que les changements soient live
4. **Hard refresh** du frontend (Ctrl+Shift+R)
5. **Vérifier logs** Render pour erreurs

---

## 📞 Support et questions

### Erreur: "Produit validation failed: etat: `XXX` is not valid"
- **Solution**: Vérifier l'enum exact dans `models/produit.js`
- **Values valides**: 'Neuf', 'Bon état', 'Usagé', 'Endommagé', 'EN_COMMANDE', 'STOCKÉ'

### Erreur: "getAuthToken is not defined"
- **Solution**: Vérifier que `getAuthToken()` est défini dans le fichier IIFE
- **Ou**: Utiliser `window.API_BASE` pour accès global

### Réception pas visible dans tableau après submitting
- **Solution**: Rafraîchir la page
- **À améliorer**: Ajouter événement refresh automatique

### Commande ne charge pas (404)
- **Normal si**: Produit créé en normal (sans commande)
- **À déboguer si**: Produit EN_COMMANDE mais pas de commande en DB

---

**Fin de la documentation**  
Pour questions ou ajouts, référer aux logs console et fichiers source mentionnés.
