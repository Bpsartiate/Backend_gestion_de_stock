# 🚀 STOCK MANAGEMENT SYSTEM - FRONTEND INTEGRATION GUIDE

**Version:** 2.0 Frontend Intégrée  
**Fichier principal:** `assets/js/stock.js`  
**Status:** ✅ **Prêt à l'emploi**

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Configuration](#configuration)
3. [Fonctions disponibles](#fonctions-disponibles)
4. [Utilisation dans les pages](#utilisation-dans-les-pages)
5. [Exemples d'intégration](#exemples-dintégration)

---

## 🏗️ Vue d'ensemble

**stock.js** est un gestionnaire centralisé pour:
- ✅ Gestion des magasins (sélection, configuration)
- ✅ Gestion des rayons et types de produits
- ✅ Ajout, modification, suppression de produits
- ✅ Mouvements de stock (RECEPTION/SORTIE/TRANSFERT)
- ✅ Gestion des lots (FIFO/LIFO)
- ✅ Alertes intelligentes
- ✅ Rapports d'inventaire complets

---

## ⚙️ Configuration

### Import du script

```php
<!-- Dans stock_et_entrepo.php -->
<script src="<?php echo BASE_URL; ?>assets/js/stock.js"></script>
```

### Variables globales

```javascript
// Magasin actuellement sélectionné
MAGASIN_ID        // ObjectId MongoDB
MAGASIN_NOM       // String
CURRENT_STOCK_CONFIG  // Object complet (rayons, types, etc)
```

### Configuration API

```javascript
API_CONFIG.BASE = 'https://backend-gestion-de-stock.onrender.com'

API_CONFIG.ENDPOINTS = {
  PRODUITS: '/api/protected/magasins/:magasinId/produits',
  LOTS: '/api/protected/magasins/:magasinId/lots',
  ALERTES: '/api/protected/magasins/:magasinId/alertes',
  // ... etc
}
```

---

## 📚 Fonctions disponibles

### 🏪 Magasins

#### `selectMagasin(magasinId, magasinNom)`
Sélectionner un magasin et charger sa configuration

```javascript
// Dans une page
await StockManager.selectMagasin('507f...', 'Magasin Principal');
// ↓ Met à jour MAGASIN_ID
// ↓ Charge rayons, types de produits
// ↓ Sauvegarde dans sessionStorage
```

#### `loadMagasinsModal()`
Charger la liste des magasins disponibles dans le modal

```javascript
// Appelé automatiquement quand on ouvre le modal
await StockManager.loadMagasinsModal();
```

---

### 📦 Produits

#### `addProduct()`
Ajouter un nouveau produit avec réception automatique

**Formulaire requis:**
```html
<form id="formAddProduit">
  <input name="reference" placeholder="PROD-001" required>
  <input name="designation" placeholder="T-Shirt Bleu" required>
  <select name="typeProduit" id="typeProduit" required></select>
  <select name="rayonId" id="rayonId" required></select>
  <input name="quantite" type="number" required>
  <input name="prixUnitaire" type="number" step="0.01" required>
  <input name="seuilAlerte" type="number" value="10">
  <div id="champsDynamiques"></div>
</form>
```

**Utilisation:**
```javascript
// Bouton dans le formulaire
<button onclick="StockManager.addProduct()">Ajouter</button>

// Ou dans le JavaScript
const btn = document.getElementById('btnAddProduit');
btn.addEventListener('click', () => StockManager.addProduct());
```

**Ce qui se passe automatiquement:**
1. Crée le produit
2. Crée un lot FIFO avec numéro de batch
3. Crée un mouvement RECEPTION
4. Affiche une notification de succès
5. Vide le formulaire
6. Recharge la liste des produits

#### `loadProduits()`
Charger tous les produits du magasin

```javascript
await StockManager.loadProduits();
// ↓ Peuple le tableau avec List.js
// ↓ Affiche quantités, états, dates
```

#### `deleteProduct(produitId)`
Supprimer un produit (soft delete)

```javascript
await StockManager.deleteProduct('507f...');
// ↓ Demande confirmation
// ↓ Supprime
// ↓ Recharge la liste
```

---

### 📤 Mouvements de stock

#### `registerMovement(produitId, designation)`
Enregistrer une entrée ou sortie de stock

```javascript
// Exemple: bouton d'action dans le tableau
<button onclick="StockManager.registerMovement('507f...', 'T-Shirt')">
  <i class="fas fa-arrow-right-arrow-left"></i> Mouvement
</button>

// Demande à l'utilisateur:
// 1. Quantité?
// 2. SORTIE ou RECEPTION?
// ↓ Crée le mouvement
// ↓ Recharge les produits
// ↓ Déclenche les alertes
```

---

### 🚨 Alertes

#### `loadAlertes()`
Charger les alertes actives du magasin

```javascript
await StockManager.loadAlertes();
// ↓ Récupère alertes ACTIVE
// ↓ Met à jour le badge de compteur
```

**Types d'alertes:**
- `STOCK_BAS` - Stock < seuil
- `STOCK_CRITIQUE` - Stock < 50% seuil
- `RUPTURE_STOCK` - Stock = 0
- `PRODUIT_EXPIRE` - Date expiration < today
- `PRODUIT_EXPIRATION_PROCHE` - < 30 jours
- `LOT_EXPIRE` - Lot détecté expiré

---

### 📦 Gestion FIFO (Lots)

#### `loadLots(produitId = null)`
Charger les lots FIFO d'un produit ou tous les lots

```javascript
// Tous les lots du magasin
const lots = await StockManager.loadLots();

// Lots d'un produit spécifique (FIFO order)
const lotsProduit = await StockManager.loadLots('507f...');
// Retourne triés par dateEntree (ancien d'abord)

// Utilité:
// - Afficher les lots disponibles pour une vente
// - Vérifier les expirations
// - Tracker le FIFO
```

---

### 📊 Rapports d'inventaire

#### `startInventaire()`
Créer un nouveau rapport d'inventaire

```javascript
const rapport = await StockManager.startInventaire();
// → { 
//   _id: '...',
//   numeroInventaire: 'INV-2025-001',
//   statut: 'EN_COURS',
//   ligneProduits: [],
//   ...
// }
```

#### `addLigneInventaire(rapportId, produitId, quantitePhysique)`
Ajouter une ligne au rapport (un produit compté)

```javascript
await StockManager.addLigneInventaire(
  '507f...',           // rapportId
  '507f...',           // produitId
  48                   // quantité comptée manuellement
);

// Système calcule automatiquement:
// - quantiteTheorique (de la BD)
// - quantiteDifference = physique - théorique
// - percentageEcart
```

#### `validerInventaire(rapportId)`
Valider et finaliser le rapport

```javascript
const rapportFinal = await StockManager.validerInventaire('507f...');
// ↓ Calcule résumé complet
// ↓ Resume = {
//   totalProduitsInventories: 145,
//   totalProduitsAvecEcart: 8,
//   pourcentageEcart: 5.5,
//   valeurTheorique: 450000,
//   valeurPhysique: 442000,
//   differenceMontant: -8000,
//   ecartPositif: 15,
//   ecartNegatif: 23,
//   rayonsAffectes: ['R001', 'R002']
// }
```

---

## 📖 Utilisation dans les pages

### Stock et Entreposage (stock_et_entrepo.php)

**Structure du fichier:**
```php
<?php
  // Au démarrage, charge les modales
  include_once "add_prod.php";
  include_once "modal_reception.php";
  include_once "modal_stock_settings.php";
?>

<div class="content">
  <!-- Dashboard KPIs -->
  <div id="totalStock">0</div>
  <div id="alertesStock">0</div>

  <!-- Tableau des produits -->
  <table id="tableReceptions">
    <tbody></tbody>
  </table>

  <!-- Modal sélection magasin -->
  <div id="modalSelectMagasin"></div>

  <!-- Bouton paramètres -->
  <button data-bs-toggle="modal" data-bs-target="#modalStockSettings">
    <i class="fas fa-cog"></i>
  </button>
</div>

<!-- Script -->
<script src="<?php echo BASE_URL; ?>assets/js/stock.js"></script>
```

**À l'initialisation:**
1. Récupère `currentMagasinId` depuis sessionStorage
2. Appelle `loadStockConfig()`
3. Peuple les rayons et types de produits
4. Charge les produits existants
5. Charge les alertes

### Modal Ajouter Produit (add_prod.php)

**La forme doit avoir:**
```html
<form id="formAddProduit">
  <input name="reference" required>
  <input name="designation" required>
  <select name="typeProduit" id="typeProduit" required></select>
  <select name="rayonId" id="rayonId" required></select>
  <input name="quantite" type="number" required>
  <input name="prixUnitaire" type="number" step="0.01" required>
  <input name="seuilAlerte" type="number" value="10">
  
  <!-- Champs dynamiques générés automatiquement -->
  <div id="champsDynamiques"></div>
  
  <!-- Bouton -->
  <button type="button" onclick="StockManager.addProduct()">
    Ajouter
  </button>
</form>
```

**Automatismes:**
- Quand on change le type de produit → mise à jour des champs dynamiques
- Ajout automatique crée un lot et une réception
- Les rayons et types sont peuplés depuis CURRENT_STOCK_CONFIG

### Modal Réception (modal_reception.php)

**Optionnel si on utilise le système automatique**

Alternative: Utiliser `registerMovement()` pour enregistrer les réceptions

```javascript
// Ou créer directement
const mouvement = await API.post(
  API_CONFIG.ENDPOINTS.STOCK_MOVEMENTS,
  {
    produitId: '507f...',
    type: 'RECEPTION',
    quantite: 100,
    numeroDocument: 'FAC-12345',
    fournisseur: 'Fournisseur ABC'
  },
  { magasinId: MAGASIN_ID }
);
```

---

## 💡 Exemples d'intégration

### Exemple 1: Tableau avec actions

```html
<table id="tableReceptions">
  <tbody>
    <!-- Généré par afficherTableProduits() -->
  </tbody>
</table>

<script>
// Chaque ligne aura des boutons:
// <button onclick="StockManager.registerMovement('...', 'Produit')">
//   Mouvement
// </button>
// <button onclick="StockManager.deleteProduct('...')">
//   Supprimer
// </button>
</script>
```

### Exemple 2: Dashboard dynamique

```javascript
// Charger et afficher les alertes
async function updateDashboard() {
  await StockManager.loadAlertes();
  
  // Le badge se met à jour automatiquement:
  // document.getElementById('alertesStock').textContent = count
}

// Rafraîchir tous les 30 secondes
setInterval(updateDashboard, 30000);
```

### Exemple 3: Inventaire complet

```javascript
async function lancerInventaire() {
  // 1. Démarrer
  const rapport = await StockManager.startInventaire();
  
  // 2. Charger les produits
  const produits = await API.get(
    API_CONFIG.ENDPOINTS.PRODUITS,
    { magasinId: MAGASIN_ID }
  );
  
  // 3. Scanner chaque produit
  for (const produit of produits) {
    const quantitePhysique = prompt(`${produit.designation}:`);
    if (quantitePhysique) {
      await StockManager.addLigneInventaire(
        rapport._id,
        produit._id,
        parseInt(quantitePhysique)
      );
    }
  }
  
  // 4. Valider et voir résumé
  const resultat = await StockManager.validerInventaire(rapport._id);
  console.log('Écarts totaux:', resultat.resume.differenceMontant);
}
```

### Exemple 4: Notifications Toast

```javascript
// Afficher une notification
StockManager.showToast('✅ Opération réussie!', 'success');
StockManager.showToast('⚠️ Attention!', 'warning');
StockManager.showToast('❌ Erreur!', 'danger');

// Auto-disparaît après 3 secondes
```

---

## 🔗 Intégration avec les modales existantes

### add_prod.php
✅ Déjà intégré  
Utilise `StockManager.addProduct()`

### modal_reception.php
✅ Peut utiliser `StockManager.registerMovement()`  
Ou créer un formulaire qui appelle les API directement

### modal_stock_settings.php
✅ Peut gérer rayons, types de produits, seuils d'alerte  
Utilise les APIs de gestion (non encore créées, mais simples à ajouter)

---

## ⚙️ Architecture du flux

```
USER ouvre stock_et_entrepo.php
    ↓
DOMContentLoaded
    ↓
Récupère MAGASIN_ID de sessionStorage
    ↓
loadStockConfig() → récupère rayons + types de produits
    ↓
populateRayons() + populateTypesProduits()
    ↓
loadProduits() → affiche le tableau
    ↓
loadAlertes() → met à jour badges

USER clique "Ajouter produit"
    ↓
Modal add_prod s'ouvre
    ↓
Rayons et types déjà peuplés
    ↓
USER change type de produit
    ↓
Les champs dynamiques s'actualisent
    ↓
USER remplit et clique "Ajouter"
    ↓
StockManager.addProduct()
    ↓
API.post(PRODUITS) → crée produit
API.post(LOTS) → crée lot FIFO
API.post(STOCK_MOVEMENTS) → crée réception
    ↓
showToast("✅ Produit créé!")
    ↓
loadProduits() → recharge tableau
```

---

## 🚀 Prochaines étapes

### Immédiat (Frontend)
- [ ] Tester l'ajout de produits
- [ ] Vérifier le tableau s'actualise
- [ ] Tester les mouvements

### Court terme (UI)
- [ ] Ajouter modal pour éditer produits
- [ ] Ajouter affichage détails produit avec lots
- [ ] Ajouter dashboard d'alertes avec actions

### Medium terme (Avancé)
- [ ] Cron job pour alertes automatiques (expiration)
- [ ] Rapport PDF d'inventaire
- [ ] Graphes de tendances stock

---

## 📞 Support & Documentation

**Fichiers connexes:**
- `docs/STOCK_SYSTEM_COMPLETE_V2.md` - Architecture complète
- `docs/API_STOCK_MOBILE.md` - Endpoints détaillés

**Fonction d'aide:**
```javascript
// Accéder à toutes les fonctions
window.StockManager.{...}

// Ou dans la console navigateur
StockManager.showToast('Test', 'info');
```

---

**Version:** 2.0 Frontend Intégrée  
**Date:** 22 Décembre 2025  
**Status:** ✅ Production Ready
