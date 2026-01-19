# 📦 NOUVEAU SYSTÈME: SIMPLE vs LOT

## Vue d'ensemble

Le système supporte maintenant **deux types de produits**:

### 1️⃣ **TYPE SIMPLE** (Viande, Riz, Sucre, etc)
```
Stockage: 1 seul niveau
  └─ Catégorie: VIANDE
  └─ Unité: KG
  
Réception:
  Quantité: 50 kg
  Prix: 5$ par kg
  Total: 250$
  
Stock:
  50 kg (simple)
  
Vente:
  Client: Vendre 2 kg @ 8$/kg = 16$
  Stock devient: 48 kg
```

### 2️⃣ **TYPE LOT** (Rouleaux, Cartons, Boîtes, etc)
```
Stockage: Chaque PIÈCE trackée individuellement
  └─ Catégorie: ROULEAUX TISSU
  └─ Unité de stockage: PIÈCE
  └─ Unités de vente: PIÈCE, MÈTRE
  
Réception:
  Quantité pièces: 3
    ├─ Pièce #1: 100 mètres @ 10$/m = 1000$ (COMPLET)
    ├─ Pièce #2: 50 mètres @ 12$/m = 600$ (COMPLET)
    └─ Pièce #3: 75 mètres @ 11$/m = 825$ (COMPLET)
  
  Total: 3 pièces = 225 mètres @ 2425$

Stock:
  Pièce #1: 100m (COMPLET)
  Pièce #2: 50m (COMPLET)
  Pièce #3: 75m (COMPLET)

Ventes:
  Vente 1: 90m du Pièce #1 @ 10$/m = 900$
    └─ Pièce #1: 10m restants (PARTIEL_VENDU)
  
  Vente 2: 2m du Pièce #1 @ 10$/m = 20$
    └─ Pièce #1: 8m restants (PARTIEL_VENDU)
  
  Vente 3: Pièce #2 entier @ 12$/m = 600$ (50m)
    └─ Pièce #2: 0m (ÉPUISÉ)
  
  Stock final:
    Pièce #1: 8m (PARTIEL_VENDU) - toujours en rayon
    Pièce #2: 0m (ÉPUISÉ) - retiré automatiquement
    Pièce #3: 75m (COMPLET)
```

## Configuration dans TypeProduit

### SIMPLE:
```javascript
{
  nomType: "VIANDE FRAIS",
  typeStockage: "simple",        // ✅ Simple
  unitePrincipaleStockage: "kg",
  icone: "🥩",
  couleur: "#ff6b6b"
  // PAS de unitesVente
}
```

### LOT:
```javascript
{
  nomType: "ROULEAUX TISSU",
  typeStockage: "lot",           // ✅ Lot
  unitePrincipaleStockage: "PIÈCE",
  unitesVente: ["PIÈCE", "MÈTRE"],  // ✅ Les unités de vente
  icone: "🧵",
  couleur: "#3b82f6"
}
```

## Modèle LOT (pour typeStockage: "lot")

```javascript
{
  _id: ObjectId,
  produitId: ObjectId,           // Quel produit
  typeProduitId: ObjectId,       // Type de produit
  receptionId: ObjectId,         // D'où il vient
  
  // QUANTITÉ
  unitePrincipale: "PIÈCE",      // Unité de stockage
  quantiteInitiale: 100,         // Mètres (pour la pièce)
  quantiteRestante: 10,          // Mètres (après ventes)
  uniteDetail: "MÈTRE",          // La vraie unité
  
  // PRIX
  prixParUnite: 10,              // $/mètre
  prixTotal: 1000,               // 100 × 10
  
  // STATUT
  status: "partiel_vendu",       // complet | partiel_vendu | epuise
  peutEtreVendu: true,           // Peut-on vendre ce lot?
  pourcentageVendu: 90,          // Virtual: 90m/100m × 100
  
  // DATES
  dateReception: "2026-01-19",
  dateDerniereVente: "2026-01-19",
  
  // HISTORIQUE
  historique: [
    { date, action: "création", quantiteAvant: 0, quantiteApres: 100 },
    { date, action: "vente", quantiteAvant: 100, quantiteApres: 10 }
  ]
}
```

## Flux de travail

### Réception SIMPLE:
```
1. Créer réception
2. Entrer produit + quantité (50 kg) + prix (5$/kg)
3. Valider
   └─ Mise à jour stock: 50 kg
```

### Réception LOT:
```
1. Créer réception
2. Sélectionner produit TYPE LOT (ex: ROULEAUX)
3. Entrer nombre de pièces (3)
4. Pour CHAQUE pièce:
   ├─ Quantité de détail (100 mètres)
   ├─ Prix par unité de détail (10$/m)
   └─ Créer LOT
5. Valider
   └─ Créer 3 LOTs individuels:
      ├─ Pièce #1: 100m @ 10$/m
      ├─ Pièce #2: 100m @ 10$/m
      └─ Pièce #3: 100m @ 10$/m
```

### Vente SIMPLE:
```
1. Créer vente
2. Sélectionner produit VIANDE
3. Quantité: 2 kg @ 8$/kg
4. Valider
   └─ Stock: 50 - 2 = 48 kg
```

### Vente LOT:
```
1. Créer vente
2. Sélectionner produit ROULEAUX
3. Dropdown pièces:
   ├─ ☑ Pièce #1 (100m, COMPLET)
   ├─ ☐ Pièce #2 (100m, COMPLET)
   └─ ☑ Pièce #3 (75m, COMPLET)
4. Unité de vente: MÈTRE
5. Quantité: 90 (du Pièce #1 sélectionné)
6. Prix unitaire: 10 (peut être ajusté)
7. Valider
   └─ Pièce #1: 100 - 90 = 10m (PARTIEL_VENDU)
```

## Avantages

✅ **Flexibilité extrême** - Adaptable à tous les types de commerce
✅ **Réalité africaine** - Prix changent, quantités changent
✅ **Traçabilité** - Chaque pièce est trackée individuellement
✅ **Pas de scénario impossible** - Un rouleau partiellement vendu peut rester en stock
✅ **Simple pour le simple** - Viande/Riz: un seul niveau, rapide
✅ **Complexe pour le complexe** - Rouleaux: suivi fin des pièces

## Migrations (si nécessaire)

Pour produits existants:
```javascript
// Produits simples (viande, riz, etc) -> typeStockage: "simple"
// Produits complexes (rouleaux, cartons) -> typeStockage: "lot"
// + remplir unitesVente
```

## Questions-Réponses

**Q: Et si un rouleau est partiellement vendu?**
A: Il devient `status: "partiel_vendu"` et reste en rayon. On peut vendre le reste.

**Q: Et si on veut savoir combien de mètres au total?**
A: Query tous les LOTs du produit, sum quantiteRestante.

**Q: Et si le prix change entre deux pièces?**
A: Chaque LOT a son propre `prixParUnite`. Aucun problème.

**Q: Comment faire un FIFO?**
A: Trier par `dateReception` quand on crée une vente (vendre les plus vieux d'abord).

## Exemple Complet

**Produit: ROULEAUX AFRICAINS**

Type produit:
```javascript
{
  nomType: "ROULEAUX AFRICAINS",
  typeStockage: "lot",
  unitePrincipaleStockage: "PIÈCE",
  unitesVente: ["PIÈCE", "MÈTRE"],
  icone: "🧵"
}
```

Réception #1 (du fournisseur):
```
"Je reçois 50 pièces"
  ├─ Pièce 1-10: 100m @ 10$/m chacun = 1000$ chacun
  ├─ Pièce 11-30: 50m @ 12$/m chacun = 600$ chacun
  └─ Pièce 31-50: 75m @ 11$/m chacun = 825$ chacun

Total: 50 pièces = 3750m @ 36,750$
```

Ventes:
```
Jour 1: Client vend 1 pièce entière (100m) @ 100$/pièce
  └─ Pièce 1: ÉPUISÉE

Jour 2: Vendeur coupe 30m du Pièce 2 @ 10$/m = 300$
  └─ Pièce 2: 20m restants (PARTIEL)

Jour 3: Vendeur vend les 20m restants @ 10$/m = 200$
  └─ Pièce 2: ÉPUISÉE

Jour 4: Vendeur vend 1 Pièce entière (50m) @ 25$/pièce = 1250$
  └─ Pièce 11: ÉPUISÉE
```

Stock final:
```
Pièces COMPLÈTES: 39 pièces = 3190m (prix original 29,600$)
Pièces PARTIELLES: 9 pièces (certaines retirées de la vente)
Pièces ÉPUISÉES: 2 pièces
```

Rapport:
```
Reçu: 3750m @ 36,750$
Vendu: 210m @ 1,700$
Restant: 3540m
Marge brute: 1,700$ - (210m/3750m × 36,750$) = ... (calcul proportionnel)
```

Voilà! 🎉
