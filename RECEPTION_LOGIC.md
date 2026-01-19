# 📦 Logique de Réception et Ajout de Produit

## 🎯 Vue d'Ensemble

Le système fonctionne en **3 niveaux d'entités**:

```
┌─────────────────┐
│  PRODUIT        │  (Master record - contient les infos générales)
│ ─────────────── │  • Référence, designation
│ quantiteActuelle│  • Prix unitaire
│ quantiteEntree  │  • État (Neuf, Bon état, etc.)
│ quantiteSortie  │  • Propriétés dynamiques (couleur, dosage)
└────────┬────────┘
         │
         ├─────────────────────────┐
         │                         │
         ▼                         ▼
┌──────────────────────┐    ┌──────────────────┐
│  STOCKRAYON          │    │  RECEPTION       │
│ ──────────────────── │    │ ────────────────│
│ (Localisation)       │    │ (Transaction)   │
│                      │    │                 │
│ • quantiteDisponible │    │ • quantite      │
│ • quantiteRéservée   │    │ • prixAchat     │
│ • quantiteDamaged    │    │ • fournisseur   │
│ • réceptions[]       │◄───│ • lotNumber     │
│   (historique FIFO)  │    │ • datePeremption│
└──────────────────────┘    └──────────────────┘
```

## 🔄 Flux Complet: Réception + Ajout de Produit

### **Étape 1: Vérifier si le produit existe**

```javascript
// Chercher le produit par référence
const produitExistant = await Produit.findOne({
  magasinId: magasinId,
  reference: referenceData
});

if (produitExistant) {
  // MISE À JOUR: Le produit existe déjà
  // → Aller à l'étape "Recevoir le stock"
} else {
  // CRÉATION: Nouveau produit
  // → Aller à l'étape "Créer le produit"
}
```

### **Étape 2A: CRÉER un nouveau produit**

Si le produit n'existe pas:

```javascript
const nouveauProduit = new Produit({
  magasinId: magasinId,
  reference: referenceData,
  designation: nomProduit,
  typeProduitId: typeProduitId,
  
  // QUANTITÉS INITIALES (à 0)
  quantiteActuelle: 0,
  quantiteEntree: 0,
  quantiteSortie: 0,
  
  // PRIX
  prixUnitaire: prixUnitaire,
  prixTotal: 0,
  
  // ÉTAT
  etat: etat,
  dateEntree: Date.now(),
  
  // PROPRIÉTÉS DYNAMIQUES (optionnelles)
  champsDynamiques: {
    couleur: couleur,
    dosage: dosage,
    format: format
    // etc...
  }
});

await nouveauProduit.save();
```

**État après création**:
```
PRODUIT créé avec:
- quantiteActuelle = 0 (rien reçu encore)
- quantiteEntree = 0
- quantiteSortie = 0
- prixUnitaire défini
- prixTotal = 0
```

### **Étape 2B: Vérifier le rayon (localisation)**

Avant de recevoir, s'assurer que le StockRayon existe:

```javascript
let stockRayon = await StockRayon.findOne({
  produitId: produitId,
  magasinId: magasinId,
  rayonId: rayonId
});

if (!stockRayon) {
  // Créer un nouveau StockRayon pour cette localisation
  stockRayon = new StockRayon({
    produitId: produitId,
    magasinId: magasinId,
    rayonId: rayonId,
    quantiteDisponible: 0,
    quantiteRéservée: 0,
    quantiteDamaged: 0,
    réceptions: []
  });
  await stockRayon.save();
}
```

**État après création de StockRayon**:
```
STOCKRAYON créé avec:
- quantiteDisponible = 0
- quantiteRéservée = 0
- quantiteDamaged = 0
- réceptions[] = [] (vide)
```

### **Étape 3: RECEVOIR le stock (Créer la réception)**

Quand on reçoit des produits:

```javascript
const reception = new Reception({
  produitId: produitId,
  magasinId: magasinId,
  rayonId: rayonId,
  
  // QUANTITÉ ET PRIX
  quantite: quantiteRecue,           // Ex: 100
  prixAchat: prixUnitaire,          // Ex: 5.00
  prixTotal: quantiteRecue * prixUnitaire,  // 100 * 5 = 500
  
  // DÉTAILS
  fournisseur: nomFournisseur,
  lotNumber: numeroLot,
  dateReception: Date.now(),
  datePeremption: dateExpiration,
  dateFabrication: dateFab
});

await reception.save();
```

**État après création de Reception**:
```
RECEPTION créée
- quantite = 100
- prixTotal = 500
- dateReception = maintenant
```

### **Étape 4: Mettre à jour PRODUIT (quantités)**

Après la réception, mettre à jour le PRODUIT:

```javascript
const produit = await Produit.findById(produitId);

// AUGMENTER LES QUANTITÉS
produit.quantiteActuelle += quantiteRecue;    // 0 + 100 = 100
produit.quantiteEntree += quantiteRecue;       // 0 + 100 = 100

// RECALCULER LE PRIX TOTAL
produit.prixTotal = produit.quantiteActuelle * produit.prixUnitaire;

await produit.save();
```

**État après mise à jour du PRODUIT**:
```
PRODUIT mis à jour
- quantiteActuelle = 100 (on a maintenant 100 unités)
- quantiteEntree = 100 (total entré en stock)
- quantiteSortie = 0 (rien n'a été vendu)
- prixTotal = 100 * 5 = 500
```

### **Étape 5: Mettre à jour STOCKRAYON (localisation)**

Enfin, ajouter à l'historique du StockRayon:

```javascript
const stockRayon = await StockRayon.findOne({
  produitId: produitId,
  magasinId: magasinId,
  rayonId: rayonId
});

// AJOUTER LA RÉCEPTION À L'HISTORIQUE
stockRayon.réceptions.push({
  receptionId: reception._id,
  quantite: quantiteRecue,
  dateReception: reception.dateReception,
  lotNumber: reception.lotNumber,
  fournisseur: reception.fournisseur,
  datePeremption: reception.datePeremption
});

// AUGMENTER LA QUANTITÉ DISPONIBLE
stockRayon.quantiteDisponible += quantiteRecue;  // 0 + 100 = 100

await stockRayon.save();
```

**État après mise à jour du STOCKRAYON**:
```
STOCKRAYON mis à jour
- quantiteDisponible = 100
- réceptions[0] = {
    receptionId: [ID Reception],
    quantite: 100,
    dateReception: [timestamp],
    lotNumber: "LOT001",
    fournisseur: "Fournisseur ABC",
    datePeremption: [date]
  }
```

## 📊 Exemple Complet: Ajouter 100 unités de paracétamol

### **Scénario**:
- Magasin: "Pharmacie Central"
- Produit: Paracétamol 500mg (nouveau)
- Quantité: 100 boîtes
- Fournisseur: "Pharma Global"
- Prix unitaire: $2.50
- Lot: "PAR-2024-001"
- Expiration: 2026-12-31

### **Flux d'exécution**:

```
1️⃣ VÉRIFIER si Paracétamol 500mg existe
   ❌ N'existe pas
   
2️⃣ CRÉER PRODUIT "Paracétamol 500mg"
   PRODUIT {
     reference: "PAR-500",
     designation: "Paracétamol 500mg",
     quantiteActuelle: 0,
     prixUnitaire: 2.50,
     prixTotal: 0
   }
   
3️⃣ VÉRIFIER STOCKRAYON pour le rayon "Médicaments généraux"
   ❌ N'existe pas
   
4️⃣ CRÉER STOCKRAYON
   STOCKRAYON {
     quantiteDisponible: 0,
     réceptions: []
   }
   
5️⃣ CRÉER RECEPTION
   RECEPTION {
     quantite: 100,
     prixAchat: 2.50,
     prixTotal: 250.00,
     fournisseur: "Pharma Global",
     lotNumber: "PAR-2024-001",
     datePeremption: 2026-12-31
   }
   
6️⃣ METTRE À JOUR PRODUIT
   PRODUIT {
     quantiteActuelle: 0 + 100 = 100,
     quantiteEntree: 0 + 100 = 100,
     prixTotal: 100 * 2.50 = 250.00
   }
   
7️⃣ METTRE À JOUR STOCKRAYON
   STOCKRAYON {
     quantiteDisponible: 0 + 100 = 100,
     réceptions: [{
       receptionId: [ID],
       quantite: 100,
       lotNumber: "PAR-2024-001",
       datePeremption: 2026-12-31
     }]
   }
```

## 🔑 Points Clés

| Entité | Rôle | Données |
|--------|------|---------|
| **PRODUIT** | Master record du produit | Infos générales, quantités totales, prix |
| **STOCKRAYON** | Localisation + Historique | Quantité par rayon, historique FIFO des lots |
| **RECEPTION** | Transaction d'entrée | Détails de la réception (fournisseur, lot, etc.) |

## 🚀 Séquence Résumée

```
Nouvelle Réception
       ↓
Produit existe? 
   NON → Créer Produit (qty = 0)
   OUI → Continuer
       ↓
StockRayon existe?
   NON → Créer StockRayon (qty = 0)
   OUI → Continuer
       ↓
Créer Reception (enregistrer la transaction)
       ↓
Mettre à jour PRODUIT (augmenter quantiteActuelle)
       ↓
Mettre à jour STOCKRAYON (augmenter disponible + historique)
       ↓
✅ Réception complète!
```

## 💡 Pourquoi 3 collections?

- **PRODUIT**: Besoin d'une vue globale (combien de X au total?)
- **STOCKRAYON**: Besoin de savoir où c'est (combien au rayon A, B, C?)
- **RECEPTION**: Traçabilité (qui a fourni? quand? quel lot? expiration?)

C'est la base de la **gestion de stock efficace**! 📦✨
