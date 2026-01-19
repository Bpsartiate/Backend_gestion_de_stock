# 🚀 INTÉGRATION SYSTÈME SIMPLE vs LOT

## ÉTAPE 1: Inclure le JavaScript dans le HTML

Dans [pages/stock/stock_et_entrepo.php](pages/stock/stock_et_entrepo.php), ajouter avant `</body>`:

```php
<!-- Gestion Réception SIMPLE vs LOT -->
<script src="pages/stock/gestion_reception.js"></script>
```

## ÉTAPE 2: Mettre à jour la modal de réception

Le fichier [modal_reception.php](pages/stock/modal_reception.php) est déjà bon, juste s'assurer que:
- ✅ `id="produitReception"` existe
- ✅ `id="quantiteReception"` existe  
- ✅ `id="prixAchat"` existe
- ✅ `id="nombrePieces"` pour les LOTs (créé dynamiquement)
- ✅ `id="quantiteParPiece"` pour les LOTs (créé dynamiquement)
- ✅ `id="uniteDetail"` pour les LOTs (créé dynamiquement)

## ÉTAPE 3: Mettre à jour le modal stock settings

Dans [modal_stock_settings.php](pages/stock/modal_stock_settings.php), remplacer la section "Conversions d'Unités" par:

```php
<!-- ✨ NOUVEAU: TYPE DE STOCKAGE ET UNITÉS DE VENTE -->
<div class="mb-4 p-3 bg-info bg-opacity-10 border border-info rounded">
  <label class="form-label fw-bold d-flex justify-content-between align-items-center">
    <span>
      <i class="fas fa-exchange-alt me-2 text-info"></i>Type de Stockage
      <a href="javascript:void(0)" class="btn btn-link p-0 ms-2" data-bs-toggle="tooltip" title="SIMPLE: Viande, Riz (1 niveau). LOT: Rouleaux, Boîtes (track individuel)">
        <i class="fas fa-question-circle text-info"></i>
      </a>
    </span>
  </label>

  <!-- Type Stockage -->
  <div class="mb-3">
    <label class="form-label fw-semibold">Type de Stockage</label>
    <select id="catEditTypeStockage" class="form-select" required>
      <option value="simple">SIMPLE (Viande, Riz, Sucre)</option>
      <option value="lot">LOT (Rouleaux, Cartons, Boîtes)</option>
    </select>
    <small class="text-muted">
      SIMPLE: Produits simples, une unité<br>
      LOT: Produits complexes, track par pièce
    </small>
  </div>

  <!-- Unité Principale de Stockage -->
  <div class="mb-3">
    <label class="form-label fw-semibold">Unité Principale de Stockage</label>
    <input type="text" class="form-control" id="catEditUnitePrincipale" 
           placeholder="Ex: KILOGRAMME, PIÈCE, ROULEAU" required>
    <small class="text-muted">L'unité dans laquelle vous stockez physiquement</small>
  </div>

  <!-- Unités de Vente (seulement pour LOT) -->
  <div id="unitesVenteContainer" style="display: none;">
    <label class="form-label fw-semibold">Unités de Vente (pour LOT)</label>
    <div id="unitesVenteList" class="mb-2">
      <!-- Rempli dynamiquement -->
    </div>
    <button type="button" class="btn btn-sm btn-outline-info" id="btnAddUniteVente">
      <i class="fas fa-plus me-1"></i>Ajouter Unité de Vente
    </button>
  </div>
</div>
```

## ÉTAPE 4: Mettre à jour saveCategory() dans modal_stock_settings.php

Adapter la fonction `saveCategory()` pour:

```javascript
// Collecter typeStockage et unitesVente
const typeStockage = document.getElementById('catEditTypeStockage').value;
const unitesVente = [];

if (typeStockage === 'lot') {
  document.querySelectorAll('#unitesVenteList .unite-item').forEach(item => {
    const unite = item.querySelector('input[data-unite-name]')?.value?.trim();
    if (unite) {
      unitesVente.push(unite);
    }
  });
}

// Ajouter à categoryData
const categoryData = {
  nomType: nom,
  code: code,
  typeStockage: typeStockage,              // ✨ NOUVEAU
  unitePrincipaleStockage: unitePrincipaleStockage,
  unitesVente: unitesVente,                // ✨ NOUVEAU (si LOT)
  icone: icone,
  couleur: couleur,
  seuilAlerte: seuil,
  capaciteMax: capacite,
  photoRequise: photoRequired,
  champsSupplementaires: champsSupplementaires
};
```

## ÉTAPE 5: Routes Backend à créer/modifier

### 1. GET `/types-produits/:id`
```javascript
// Retourner le type complet avec typeStockage et unitesVente
router.get('/types-produits/:id', async (req, res) => {
  const typeProduit = await TypeProduit.findById(req.params.id);
  res.json(typeProduit);
});
```

### 2. POST `/lots`
```javascript
// Créer un LOT individuel
router.post('/lots', async (req, res) => {
  const lot = new Lot(req.body);
  await lot.save();
  res.json(lot);
});
```

### 3. Adapter POST `/receptions`
```javascript
// Modifier pour supporter type: "simple" | "lot"
router.post('/receptions', async (req, res) => {
  const reception = new Reception(req.body);
  await reception.save();
  
  // Si type LOT, les LOTs sont créés après via handleLotReception
  
  res.json(reception);
});
```

## ÉTAPE 6: Test complet

### Cas 1: SIMPLE (Viande)
```
1. Configuration type: "VIANDE"
   - typeStockage: "simple"
   - unitePrincipaleStockage: "KILOGRAMME"
   
2. Réception
   - Produit: VIANDE
   - Quantité: 50 kg
   - Prix: 5$/kg
   → Crée 1 réception simple, stock = 50 kg
   
3. Vente
   - Vendre 2 kg @ 8$/kg
   → Stock = 48 kg
```

### Cas 2: LOT (Rouleaux)
```
1. Configuration type: "ROULEAUX TISSU"
   - typeStockage: "lot"
   - unitePrincipaleStockage: "PIÈCE"
   - unitesVente: ["PIÈCE", "MÈTRE"]
   
2. Réception
   - Produit: ROULEAUX TISSU
   - Nombre de pièces: 3
   - Quantité par pièce: 100 mètres
   - Unité de détail: MÈTRE
   - Prix: 10$/mètre
   → Crée 1 réception + 3 LOTs:
      ├─ LOT 1: 100m @ 10$/m (COMPLET)
      ├─ LOT 2: 100m @ 10$/m (COMPLET)
      └─ LOT 3: 100m @ 10$/m (COMPLET)
   
3. Vente
   - Sélectionner LOT 1
   - Vendre 90 mètres
   → LOT 1: 10m restants (PARTIEL_VENDU)
   → Stock total: 2 pièces complètes + 1 pièce partielle
```

## ÉTAPE 7: Logs de vérification

Après création d'une réception LOT, vérifier:

```javascript
// Dans la console (F12)
// Doit afficher:
// 📦 Type produit chargé: { typeStockage: "lot", unitesVente: [...] }
// 🎁 Interface LOT
// ✅ 3 LOTs créés
```

## Fichiers modifiés/créés

- ✅ `models/typeProduit.js` - Ajouté typeStockage et unitesVente
- ✅ `models/lot.js` - Modèle LOT pour track individuel
- ✅ `pages/stock/gestion_reception.js` - NOUVEAU: gestion SIMPLE vs LOT
- 🔄 `pages/stock/modal_stock_settings.php` - À mettre à jour (UI typeStockage)
- 🔄 `routes/` - À créer/adapter les endpoints

## Variables globales requises

Dans le JS global (app.js ou similaire):
```javascript
const API_BASE = 'http://localhost:3000/api'; // À adapter
const currentMagasinId = localStorage.getItem('magasinId');
```

## Notes importantes

⚠️ **Migration des produits existants**:
- Tous les produits existants doivent avoir un `typeStockage` défini
- Par défaut: "simple"
- Mettre en place un script de migration si besoin

⚠️ **Stock reporting**:
- Pour SIMPLE: `stock = quantité simple`
- Pour LOT: `stock = sum(allLots.quantiteRestante)`

✅ **Traçabilité améliorée**:
- Chaque LOT a un historique de ventes
- Peut voir quel lot a vendu à qui et quand

Prêt pour le test! 🚀
