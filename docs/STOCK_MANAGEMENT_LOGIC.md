# 📦 Documentation Complète - Logique de Gestion des Stocks

## Table des Matières
1. [Concept Fondamental](#concept-fondamental)
2. [Les 5 Types de Mouvements](#les-5-types-de-mouvements)
3. [Workflow Complet du Produit](#workflow-complet-du-produit)
4. [Ajouter un Produit vs Nouvelle Réception](#ajouter-un-produit-vs-nouvelle-réception)
5. [Comment Ils Sont Liés](#comment-ils-sont-liés)
6. [Exemple Concret Complet](#exemple-concret-complet)
7. [Architecture des Données](#architecture-des-données)

---

## 1. Concept Fondamental

### Qu'est-ce qu'un Mouvement?

Un **mouvement** est une action qui **trace chaque changement de quantité/état d'un produit**. C'est l'**historique complet et auditable** du produit dans votre magasin.

```
Chaque mouvement répond à 4 questions:
  ✅ QUI? → Utilisateur qui a fait l'action
  ✅ QUOI? → Quel produit (reference, id)
  ✅ COMBIEN? → Quantité modifiée
  ✅ QUAND? → Date/heure exacte
  ✅ POURQUOI? → Type et observations
```

### Objectif Principal

**Garantir la traçabilité** : Chaque unité en stock peut être tracée d'origine (réception) à destination (vente/perte).

---

## 2. Les 5 Types de Mouvements

### 📥 **RÉCEPTION** - Stock Augmente
```
Quand? Marchandise arrive du fournisseur
Effet: Stock augmente
Exemple: 
  Avant: 100 unités
  Réception: +50 unités
  Après: 150 unités

Données tracées:
  - Fournisseur
  - Numéro de lot (FIFO/LIFO)
  - Date d'expiration
  - Prix d'achat
  - Photo de réception
```

### 📤 **SORTIE** - Stock Diminue
```
Quand? Produit vendu ou utilisé
Effet: Stock diminue
Exemple:
  Avant: 150 unités
  Sortie: -20 unités (vente client)
  Après: 130 unités

Données tracées:
  - Raison (vente, utilisation, etc)
  - Client/Destination
  - Observations
  - Peut déclencher alerte si stock < seuil
```

### 📦 **TRANSFERT** - Déplacement
```
Quand? Produit déplacé entre rayons/magasins
Effet: Quantité inchangée, localisation change
Exemple:
  Avant: Rayon A1 - 50 unités
  Transfert: Vers Rayon B3
  Après: Rayon B3 - 50 unités

Données tracées:
  - Rayon source
  - Rayon destination
  - Raison du déplacement
```

### 📊 **INVENTAIRE** - Correction de Stock
```
Quand? Comptage physique vs système
Effet: Correction automatique du stock
Exemple:
  Comptage physique: 45 unités
  Système affichait: 50 unités
  Ajustement: -5 unités
  Cause: Casse/Perte détectée

Données tracées:
  - Quantité trouvée
  - Quantité système
  - Écart détecté
  - Observations
```

### ⚙️ **AJUSTEMENT** - Correction Manuelle
```
Quand? Correction manuelle (casse, vol, erreur)
Effet: Stock augmente ou diminue
Exemple:
  Ajustement: -3 unités
  Raison: "Produits cassés lors du déplacement"
  
Données tracées:
  - Quantité ajustée
  - Raison
  - Autorité (qui a approuvé)
  - Observations détaillées
```

---

## 3. Workflow Complet du Produit

### 🔄 Cycle de Vie Complet

```
╔═════════════════════════════════════════════════════════════════════╗
║  ÉTAPE 1: CRÉER LA FICHE PRODUIT                                   ║
║                                                                     ║
║  Action: "Ajouter un produit"                                     ║
║  Crée: Référence, Désignation, Type, Prix, Rayon, Catégorie      ║
║                                                                     ║
║  Backend:                                                          ║
║    {                                                               ║
║      _id: "123abc",                                               ║
║      reference: "SONY-XS-001",                                    ║
║      designation: "iPhone XS",                                    ║
║      prixUnitaire: 800,                                           ║
║      rayonId: "A1",                                               ║
║      quantiteActuelle: 0,          ⚠️ STOCK VIDE!                ║
║      seuilAlerte: 10,                                             ║
║      etat: "nouveau",                                             ║
║      dateEntree: "2025-12-23"                                     ║
║    }                                                               ║
║                                                                     ║
║  📊 Affichage:                                                     ║
║  ┌──────────────────────────────────────────┐                    ║
║  │ iPhone XS | 0 stock | ⚠️ En rupture      │                    ║
║  └──────────────────────────────────────────┘                    ║
║                                                                     ║
║  ⚠️ IMPORTANT: Pas de mouvement créé!                             ║
║              Stock = 0 jusqu'à la première réception               ║
╚═════════════════════════════════════════════════════════════════════╝
                                ↓
╔═════════════════════════════════════════════════════════════════════╗
║  ÉTAPE 2: ENREGISTRER UNE RÉCEPTION                                ║
║                                                                     ║
║  Action: "Nouvelle réception"                                     ║
║  Sélectionne: iPhone XS (produit créé en ÉTAPE 1)                 ║
║  Entre: Quantité reçue, Fournisseur, Prix achat, Lot, Photo      ║
║                                                                     ║
║  Backend traite la réception:                                     ║
║                                                                     ║
║    1️⃣ Crée un LOT (FIFO/LIFO):                                     ║
║       {                                                           ║
║         _id: "lot_456",                                           ║
║         numeroBatch: "LOT-2025-ABC123",                          ║
║         produitId: "123abc",                                      ║
║         quantiteEntree: 50,                                       ║
║         quantiteDisponible: 50,                                   ║
║         prixUnitaireAchat: 750,                                   ║
║         dateEntree: "2025-12-24",                                 ║
║         dateExpiration: "2026-12-24",                             ║
║         fournisseur: "Apple Store"                                ║
║       }                                                           ║
║                                                                     ║
║    2️⃣ Crée un MOUVEMENT RÉCEPTION:                               ║
║       {                                                           ║
║         _id: "mov_789",                                           ║
║         produitId: "123abc",                                      ║
║         type: "RÉCEPTION",                                        ║
║         quantite: 50,                                             ║
║         magasinId: "XYZ",                                         ║
║         dateCreation: "2025-12-24 10:30",                         ║
║         observations: "Réception Apple Store",                    ║
║         photoUrl: "https://..."                                   ║
║       }                                                           ║
║                                                                     ║
║    3️⃣ MET À JOUR le stock du produit:                             ║
║       quantiteActuelle: 0 + 50 = 50  ✅ STOCK AUGMENTÉ!          ║
║                                                                     ║
║    4️⃣ CRÉE une ALERTE si nécessaire:                              ║
║       - Si quantiteActuelle > capaciteMax → "Rayon plein"        ║
║       - Si quantiteActuelle < seuilAlerte → "Stock faible"       ║
║                                                                     ║
║  📊 Affichage (MIS À JOUR):                                       ║
║  ┌──────────────────────────────────────────┐                    ║
║  │ iPhone XS | 50 stock | ✅ Disponible    │                    ║
║  └──────────────────────────────────────────┘                    ║
║                                                                     ║
║  📋 Historique (NOUVEAU):                                         ║
║  ├─ 24/12 10:30 - RÉCEPTION 50 unités (Apple Store)             ║
╚═════════════════════════════════════════════════════════════════════╝
                                ↓
╔═════════════════════════════════════════════════════════════════════╗
║  ÉTAPE 3: GÉRER LES MOUVEMENTS (après réception)                  ║
║                                                                     ║
║  Actions possibles: Sortie, Transfert, Inventaire, Ajustement     ║
║                                                                     ║
║  EXEMPLE - SORTIE (Vente):                                        ║
║  ┌──────────────────────────────────────────┐                    ║
║  │ Type: SORTIE                             │                    ║
║  │ Quantité: 15 unités                      │                    ║
║  │ Observations: "Vente client"             │                    ║
║  └──────────────────────────────────────────┘                    ║
║                                                                     ║
║  Backend traite la sortie:                                        ║
║    ✅ Crée un mouvement SORTIE                                   ║
║    ✅ Stock: 50 - 15 = 35                                        ║
║    ✅ Enregistre dans l'historique                               ║
║                                                                     ║
║  📊 Affichage (MIS À JOUR):                                       ║
║  ┌──────────────────────────────────────────┐                    ║
║  │ iPhone XS | 35 stock | ✅ Disponible    │                    ║
║  └──────────────────────────────────────────┘                    ║
║                                                                     ║
║  📋 Historique (MIS À JOUR):                                      ║
║  ├─ 24/12 15:45 - SORTIE 15 unités (Vente client)               ║
║  ├─ 24/12 10:30 - RÉCEPTION 50 unités (Apple Store)             ║
╚═════════════════════════════════════════════════════════════════════╝
```

---

## 4. Ajouter un Produit vs Nouvelle Réception

### 🆚 Comparaison Détaillée

| Aspect | Ajouter un produit | Nouvelle Réception |
|--------|---|---|
| **Fichier** | `add_prod.php` | `modal_reception.php` |
| **Objectif** | Créer la fiche produit | Enregistrer une entrée de stock |
| **Bouton** | "Ajouter produit" | "Nouvelle réception" |
| **Icône** | 📦 | 🚚 |
| **Couleur** | Bleu (Primary) | Vert (Success) |
| **Pré-requis** | Aucun | Produit doit exister |
| **Sélection** | Créer nouveau | Sélectionner existant |
| **Champs Principaux** | Référence, Désignation, Catégorie, Type | Produit, Fournisseur, Quantité |
| **Stock** | Optionnel, initialisé | **OBLIGATOIRE** (quantité reçue) |
| **Numéro Lot** | Optionnel | **OBLIGATOIRE** |
| **Fournisseur** | ❌ Non | ✅ Oui |
| **Photo** | ❌ Non | ✅ **Obligatoire** |
| **Mouvement Créé** | ❌ Non | ✅ Oui (RÉCEPTION) |
| **Historique** | ❌ Aucun | ✅ Enregistré |
| **Stock Augmente** | ❌ Non (initial seulement) | ✅ **Automatiquement** |
| **Alerte Créée** | ❌ Non | ✅ Oui, si besoin |

### 📊 Tableau Comparatif Visuel

**"Ajouter un produit"**
```
┌─────────────────────────────────────┐
│ 📦 AJOUTER UN PRODUIT               │
├─────────────────────────────────────┤
│ • Référence          [________]     │
│ • Désignation        [________]     │
│ • Catégorie          [________]     │
│ • Type               [________]     │
│ • Rayon              [________]     │
│ • Prix               [________]     │
│ • Stock initial      [0]            │
│                                     │
│        [CRÉER LE PRODUIT]          │
├─────────────────────────────────────┤
│ ✅ Résultat: Produit vide (stock=0)│
│ ❌ PAS de mouvement créé            │
└─────────────────────────────────────┘
```

**"Nouvelle Réception"**
```
┌─────────────────────────────────────┐
│ 🚚 NOUVELLE RÉCEPTION                │
├─────────────────────────────────────┤
│ • Produit            [Sélectionner]│
│ • Fournisseur        [________]     │
│ • Quantité reçue     [________]     │
│ • Rayon destination  [________]     │
│ • Prix achat         [________]     │
│ • Numéro lot         [________]     │
│ • Photo réception    [Télécharger] │
│ • Date expiration    [__/__/__]     │
│                                     │
│   [ENREGISTRER RÉCEPTION]           │
├─────────────────────────────────────┤
│ ✅ Lot créé + tracé                 │
│ ✅ Mouvement RÉCEPTION enregistré   │
│ ✅ Stock AUGMENTÉ automatiquement   │
│ ✅ Alerte créée si besoin           │
│ ✅ Photo sauvegardée                │
└─────────────────────────────────────┘
```

---

## 5. Comment Ils Sont Liés

### 🔗 La Relation

```
        AJOUTER UN PRODUIT
        (Crée la fiche)
              │
              ↓
        Produit existe
        Stock = 0
              │
              ↓
        NOUVELLE RÉCEPTION
        (Remplit le stock)
              │
              ├─ Sélectionne le produit créé
              ├─ Reçoit de la marchandise
              ├─ Crée un lot FIFO
              ├─ Crée un mouvement
              └─ Stock augmente
              │
              ↓
        Autres mouvements possibles
        (Sortie, Transfert, etc)
              │
              └─ Historique complet + auditable
```

### 🎯 Flux Complet

```
1️⃣ AJOUTER UN PRODUIT
   └─→ "Je crée une fiche produit"
       ├─ Référence: IPHONE-XS-001
       ├─ Désignation: iPhone XS
       ├─ Prix: $800
       └─ Stock: 0

2️⃣ NOUVELLE RÉCEPTION
   └─→ "Je reçois de la marchandise"
       ├─ Sélectionne: iPhone XS (du produit #1)
       ├─ Quantité: 50 unités
       ├─ Fournisseur: Apple Store
       ├─ Lot: LOT-2025-001
       └─ Stock: 0 + 50 = 50

3️⃣ MOUVEMENTS ULTÉRIEURS
   ├─ SORTIE: 50 - 20 = 30 (vente)
   ├─ TRANSFERT: A1 → B3 (déplacement)
   ├─ INVENTAIRE: 30 - 2 = 28 (correction)
   └─ AJUSTEMENT: 28 - 1 = 27 (casse)

4️⃣ HISTORIQUE FINAL
   ├─ 27 unités restantes
   ├─ Traçabilité complète
   ├─ Audit complet disponible
   └─ FIFO pour expiration gérée
```

---

## 6. Exemple Concret Complet

### 📝 Cas d'Usage: Gestion d'une Réception de Téléphones

#### **Jour 1 - Matin: Création de la fiche**

**Action:** Clic sur "Ajouter produit"

```
Form rempli:
  Référence: SAMSUNG-A50-2024
  Désignation: Samsung Galaxy A50 - 2024
  Catégorie: Téléphones
  Type: Smartphone
  Rayon: C2 (Électronique)
  Prix unitaire: $300
  Stock initial: 0
  Seuil alerte: 5

Clic: [CRÉER LE PRODUIT]
```

**Résultat Base de Données:**
```javascript
{
  _id: "prod_12345",
  reference: "SAMSUNG-A50-2024",
  designation: "Samsung Galaxy A50 - 2024",
  prixUnitaire: 300,
  rayonId: "C2",
  quantiteActuelle: 0,           // ⚠️ VIDE!
  seuilAlerte: 5,
  etat: "nouveau",
  dateEntree: "2024-12-23",
  magasinId: "mag_001"
}
```

**Affichage Table:**
```
┌──────────────────────────────────────────────┐
│ Samsung Galaxy A50 | 0 | ⚠️ En rupture      │
└──────────────────────────────────────────────┘
```

---

#### **Jour 3 - Après-midi: Réception de marchandise**

**Action:** Clic sur "Nouvelle réception"

```
Form rempli:
  Produit: Samsung Galaxy A50 - 2024 [Sélectionné]
  Fournisseur: Samsung Distributor Africa
  Quantité reçue: 25 unités
  Rayon destination: C2
  Prix achat unitaire: $280/unité
  Numéro lot: LOT-2024-SAMSUNG-DEC-001
  Date réception: 23/12/2024
  Date péremption: 23/12/2027
  Statut: Stocké
  Photo: [Image du colis reçu - OBLIGATOIRE]

Clic: [ENREGISTRER RÉCEPTION]
```

**Opérations Backend:**

```javascript
// 1️⃣ CRÉE UN LOT FIFO
{
  _id: "lot_67890",
  numeroBatch: "LOT-2024-SAMSUNG-DEC-001",
  produitId: "prod_12345",
  quantiteEntree: 25,
  quantiteDisponible: 25,
  prixUnitaireAchat: 280,
  dateEntree: "2024-12-23 14:30",
  dateExpiration: "2027-12-23",
  fournisseur: "Samsung Distributor Africa",
  photoUrl: "https://cloudinary.com/...",
  magasinId: "mag_001"
}

// 2️⃣ CRÉE UN MOUVEMENT RÉCEPTION
{
  _id: "mov_11111",
  produitId: "prod_12345",
  type: "RÉCEPTION",
  quantite: 25,
  magasinId: "mag_001",
  dateCreation: "2024-12-23 14:30",
  numeroDocument: "",
  fournisseur: "Samsung Distributor Africa",
  observations: "Réception du distributeur",
  photoUrl: "https://cloudinary.com/..."
}

// 3️⃣ MET À JOUR LE PRODUIT
{
  _id: "prod_12345",
  quantiteActuelle: 0 + 25 = 25,      ✅ AUGMENTÉ!
  emplacement: "C2",
  lastMovement: "mov_11111",
  lastMovementDate: "2024-12-23 14:30"
}

// 4️⃣ CRÉE UNE ALERTE?
// Vérifications:
//   - Si 25 > capaciteMax? Non
//   - Si 25 < seuilAlerte (5)? Non
//   → Pas d'alerte créée
```

**Affichage Table (ACTUALISÉ):**
```
┌──────────────────────────────────────────────┐
│ Samsung Galaxy A50 | 25 | ✅ Disponible     │
└──────────────────────────────────────────────┘
```

**Historique du Produit (NOUVEAU):**
```
📋 Historique Samsung Galaxy A50
│
├─ 23/12/2024 14:30 - RÉCEPTION 25 unités
│  Fournisseur: Samsung Distributor Africa
│  Lot: LOT-2024-SAMSUNG-DEC-001
│  Prix achat: $280/unité
│  Photo: ✅ Disponible
│
└─ Fin
```

---

#### **Jour 5 - Premières ventes**

**Action:** Clic Modifier/Mouvement → Onglet "Mouvements"

```
Form rempli (SORTIE):
  Type: SORTIE
  Quantité: 8
  Observations: Ventes client (clients A, B, C)

Clic: [ENREGISTRER LE MOUVEMENT]
```

**Opérations Backend:**

```javascript
// CRÉE UN MOUVEMENT SORTIE
{
  _id: "mov_22222",
  produitId: "prod_12345",
  type: "SORTIE",
  quantite: 8,
  magasinId: "mag_001",
  dateCreation: "2024-12-25 11:45",
  observations: "Ventes clients"
}

// MET À JOUR LE PRODUIT
{
  quantiteActuelle: 25 - 8 = 17    ✅ DIMINUÉ!
}

// CRÉE ALERTE?
//   - Si 17 < seuilAlerte (5)? Non
//   → Pas d'alerte
```

**Affichage Table (ACTUALISÉ):**
```
┌──────────────────────────────────────────────┐
│ Samsung Galaxy A50 | 17 | ✅ Disponible     │
└──────────────────────────────────────────────┘
```

**Historique (ACTUALISÉ):**
```
📋 Historique Samsung Galaxy A50
│
├─ 25/12/2024 11:45 - SORTIE 8 unités
│  Observations: Ventes clients
│
├─ 23/12/2024 14:30 - RÉCEPTION 25 unités
│  Fournisseur: Samsung Distributor Africa
│  Lot: LOT-2024-SAMSUNG-DEC-001
│
└─ Fin (17 unités restantes)
```

---

#### **État Final Après Tous les Mouvements**

```
PRODUIT: Samsung Galaxy A50
├─ Stock actuel: 17 unités
├─ Rayon: C2
├─ Prix: $300
├─ Seuil alerte: 5
├─ État: Disponible ✅
│
HISTORIQUE COMPLET:
├─ 25/12 11:45 - SORTIE 8 (Ventes)
├─ 23/12 14:30 - RÉCEPTION 25 (Samsung Distributor)
│
TRAÇABILITÉ:
├─ Lots: 1 lot FIFO (LOT-2024-SAMSUNG-DEC-001)
├─ Photos: 1 photo de réception
├─ Audit: Complet et vérifiable
└─ Expiration: 23/12/2027

ALERTES:
└─ Aucune (stock correct)
```

---

## 7. Architecture des Données

### 📊 Structure Produit

```javascript
{
  _id: ObjectId,                          // ID unique
  reference: String,                      // Référence produit
  designation: String,                    // Nom complet
  prixUnitaire: Number,                   // Prix de vente
  rayonId: ObjectId,                      // Rayon de stockage
  categorieId: ObjectId,                  // Catégorie
  quantiteActuelle: Number,               // Stock actuel ← MIS À JOUR par mouvements
  quantiteVendue: Number,                 // Total vendu
  seuilAlerte: Number,                    // Niveau minimum
  etat: String,                           // État du produit
  dateEntree: Date,                       // Quand créé
  photoUrl: String,                       // Photo du produit
  magasinId: ObjectId,                    // Magasin
  createdAt: Date,
  updatedAt: Date                         // Dernière modification
}
```

### 📊 Structure Lot (FIFO/LIFO)

```javascript
{
  _id: ObjectId,
  numeroBatch: String,                    // LOT-2024-XXX
  produitId: ObjectId,                    // Quel produit
  quantiteEntree: Number,                 // Quantité reçue
  quantiteDisponible: Number,             // Restante
  prixUnitaireAchat: Number,              // Coût d'achat
  dateEntree: Date,                       // Quand reçu
  dateExpiration: Date,                   // Limite de vente
  fournisseur: String,                    // Qui a envoyé
  photoUrl: String,                       // Photo réception
  numeroDocument: String,                 // Bon de livraison
  magasinId: ObjectId,
  createdAt: Date
}
```

### 📊 Structure Mouvement

```javascript
{
  _id: ObjectId,
  produitId: ObjectId,                    // Quel produit
  type: String,                           // RÉCEPTION/SORTIE/TRANSFERT/INVENTAIRE/AJUSTEMENT
  quantite: Number,                       // Quantité du mouvement
  magasinId: ObjectId,                    // Dans quel magasin
  rayonSource: ObjectId,                  // Rayon origine (transfert)
  rayonDest: ObjectId,                    // Rayon destination (transfert)
  fournisseur: String,                    // Pour réception
  utilisateurId: ObjectId,                // Qui l'a fait
  dateCreation: Date,                     // Quand
  observations: String,                   // Pourquoi/notes
  photoUrl: String,                       // Photo du mouvement
  numeroDocument: String,                 // Bon/facture
  createdAt: Date
}
```

### 📊 Structure Alerte

```javascript
{
  _id: ObjectId,
  produitId: ObjectId,                    // Quel produit
  type: String,                           // "stock_faible" / "rayon_plein" / "expiration"
  message: String,                        // Description
  quantiteActuelle: Number,               // Stock au moment de l'alerte
  seuilAlerte: Number,                    // Niveau limite
  severity: String,                       // "warning" / "critical"
  statut: String,                         // "ACTIVE" / "RÉSOLUE"
  dateCreation: Date,
  dateRésolution: Date
}
```

---

## 📋 Checklist d'Implémentation

### ✅ Pour Ajouter un Produit
- [x] Formulaire avec champs: Référence, Désignation, Catégorie, Type, Rayon, Prix
- [x] Stockage dans DB avec quantiteActuelle = 0
- [x] Modal avec icône 📦 (Bleu/Primary)
- [x] Pas de création de mouvement
- [x] Pas de traçabilité au départ

### ✅ Pour Nouvelle Réception
- [x] Sélection d'un produit existant
- [x] Champs: Quantité, Fournisseur, Rayon destination, Prix achat, Lot, Photo
- [x] Photo OBLIGATOIRE
- [x] Création de Lot FIFO avec numéro
- [x] Création de Mouvement RÉCEPTION
- [x] Mise à jour automatique du stock
- [x] Création d'alerte si besoin
- [x] Modal avec icône 🚚 (Vert/Success)

### ✅ Pour Mouvements Ultérieurs
- [x] Modal Détail Produit avec onglet "Mouvements"
- [x] Sélection du type: SORTIE, TRANSFERT, INVENTAIRE, AJUSTEMENT
- [x] Enregistrement automatique du mouvement
- [x] Mise à jour du stock
- [x] Affichage de l'historique complet
- [x] Traçabilité FIFO/LIFO pour expiration

---

## 🎯 Points Clés à Retenir

```
1️⃣ AJOUTER UN PRODUIT
   └─ Crée une fiche vide (stock = 0)
   └─ Pas de mouvement créé
   └─ Juste de la structure

2️⃣ NOUVELLE RÉCEPTION
   └─ Sélectionne le produit créé
   └─ Reçoit de la marchandise
   └─ Crée un lot tracé (FIFO/LIFO)
   └─ Crée un mouvement enregistré
   └─ Stock AUGMENTE automatiquement

3️⃣ MOUVEMENTS ULTÉRIEURS
   └─ Peuvent être de tout type
   └─ Tous tracés dans l'historique
   └─ Stock mis à jour à chaque fois
   └─ Alertes créées si besoin

4️⃣ TRAÇABILITÉ
   └─ Chaque unité peut être tracée du fournisseur à la vente
   └─ FIFO/LIFO gère l'expiration automatiquement
   └─ Audit complet et vérifiable
```

---

## 📞 Questions Fréquentes

### Q: Pourquoi le stock = 0 quand on crée un produit?
**A:** Parce qu'on crée juste la fiche technique. La marchandise arrive après avec une réception.

### Q: Peut-on ajouter un produit avec stock initial?
**A:** Oui, mais c'est une initialisation. Le vrai mouvement RÉCEPTION devrait venir après.

### Q: Pourquoi créer un Lot?
**A:** Pour tracer FIFO/LIFO - savoir quel lot a été reçu quand (pour expiration, rotation).

### Q: La réception met à jour le stock automatiquement?
**A:** OUI! Le backend le fait lors du POST de réception.

### Q: Et les mouvements suivants?
**A:** Chaque mouvement (SORTIE, TRANSFERT, etc) met à jour le stock ET enregistre l'historique.

### Q: Je peux vendre un produit sans le recevoir?
**A:** Techniquement oui, mais c'est une erreur de flux. Il faut toujours: Ajouter → Recevoir → Vendre.

### Q: Comment gérer les erreurs/casses?
**A:** Via un mouvement AJUSTEMENT avec observations détaillées pour audit.

---

## 📚 Ressources Connexes

- [Documentation API Produits](./API_INTEGRATION_GUIDE.md)
- [Guide Modal Détail Produit](./MODAL_PRODUCT_DETAIL.md)
- [Gestion des Alertes Stock](./ALERTES_STOCK.md)
- [FIFO/LIFO Rotation](./FIFO_LIFO_GESTION.md)

---

**Dernière mise à jour:** 23/12/2024  
**Version:** 1.0  
**Auteur:** System Documentation
