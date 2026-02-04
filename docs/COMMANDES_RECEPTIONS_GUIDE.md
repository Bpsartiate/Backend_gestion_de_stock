# 📦 Système de Commandes & Réceptions - Phase 2 v1

**Date:** 04/02/2026  
**Version:** 2.0 (avec Commandes)  
**Status:** ✅ Ready to Deploy

---

## 🎯 Vue d'Ensemble

Nouveau workflow pour améliorer la gestion des stocks:

```
1. Créer Produit
   ↓
2. État: "EN_COMMANDE"
   ↓
3. Créer Commande (Fournisseur, Qté, Prix)
   ↓
4. Marquer "EXPEDIÉE" (Fournisseur a expédié)
   ↓
5. Enregistrer Réception (Produit reçu)
   ↓
6. État: "STOCKÉ" → Disponible à la vente
```

---

## 📊 Architecture

### Modèles de Données

#### 1. Produit (Modifié)
```javascript
{
  ...existingFields,
  etat: "EN_COMMANDE" | "STOCKÉ" | "Neuf" | "Bon état" | "Usagé" | "Endommagé",
  commandesIds: [ObjectId]  // 🆕 Références aux commandes
}
```

#### 2. Commande (NOUVEAU)
```javascript
{
  produitId: ObjectId,
  magasinId: ObjectId,
  quantiteCommandee: Number,
  quantiteRecue: Number,      // Traque les réceptions partielles
  prixUnitaire: Number,
  prixTotal: Number,
  fournisseur: String,
  
  // Dates
  dateCommande: Date,
  dateEcheance: Date,         // Livraison attendue
  dateExpedition: Date,       // Fournisseur a expédié
  dateReception: Date,        // Reçu
  
  // Statut
  statut: "EN_ATTENTE" | "EXPEDIÉE" | "REÇUE_PARTIELLEMENT" | "REÇUE_COMPLÈTEMENT" | "ANNULÉE",
  
  // Traçabilité
  numeroCommande: String,     // Unique ID
  receptionsIds: [ObjectId],  // Lien aux réceptions
  
  createdBy: ObjectId,
  updatedBy: ObjectId
}
```

#### 3. Reception (Modifié)
```javascript
{
  ...existingFields,
  // Lien à la commande
  commandeId: ObjectId        // 🆕 Référence la commande
}
```

---

## 🔌 API Endpoints

### Lister les Commandes
```
GET /api/protected/commandes?magasinId={ID}&statut={statut}&page=1&limit=20
Authorization: Bearer {TOKEN}

Response:
{
  success: true,
  commandes: [...],
  pagination: {...}
}
```

### Créer une Commande
```
POST /api/protected/commandes
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  produitId: "...",
  magasinId: "...",
  quantiteCommandee: 50,
  prixUnitaire: 10.5,
  fournisseur: "Supplier Corp",
  dateEcheance: "2026-02-15",
  notes: "Urgent"
}

Response:
{
  success: true,
  commande: {...}
}
```

### Enregistrer une Réception
```
POST /api/protected/commandes/{commandeId}/recevoir
Authorization: Bearer {TOKEN}

{
  quantiteRecue: 50,
  rayons: [
    { rayonId: "...", quantite: 25 },
    { rayonId: "...", quantite: 25 }
  ]
}

Response:
{
  success: true,
  commande: {...},    // Statut updated
  reception: {...},   // Nouvelle réception créée
  produit: {...}      // Quantité mise à jour
}
```

### Mettre à jour Statut
```
PUT /api/protected/commandes/{commandeId}
Authorization: Bearer {TOKEN}

{
  statut: "EXPEDIÉE"
}
```

### Marquer comme Expédiée
```
POST /api/protected/commandes/{commandeId}/marquer-expediee
Authorization: Bearer {TOKEN}
```

### Annuler une Commande
```
DELETE /api/protected/commandes/{commandeId}
Authorization: Bearer {TOKEN}
```

---

## 🎨 Interface Utilisateur

### Page: `/pages/stock/commandes.php`

**Features:**
- ✅ Liste de toutes les commandes
- ✅ Filtrage par statut (En attente, Expédiée, Reçue)
- ✅ Création nouvelle commande
- ✅ Enregistrement de réception
- ✅ Annulation de commande
- ✅ Détails de commande (modal)
- ✅ Tracking réception (progress bar)

**Tabs:**
1. **Toutes les Commandes** - Vue complète
2. **En Attente** - À passer au fournisseur
3. **Expédiées** - En transit
4. **Reçues** - Arrivées au magasin

---

## 📱 Intégration dans add_prod.php

### Workflow Amélioré

Quand on ajoute un produit, on peut maintenant:

```
1. Créer le produit
   État: "EN_COMMANDE"
   ↓
2. Immédiatement créer une Commande
   - Fournisseur
   - Quantité
   - Prix unitaire
   - Date de livraison
   ↓
3. Plus tard, enregistrer la réception
   - Quantité reçue
   - Distribution dans rayons
   ↓
4. Produit devient STOCKÉ automatiquement
```

---

## 🔧 JavaScript Classes

### CommandeManager

```javascript
const manager = new CommandeManager(magasinId);

// Charger commandes
await manager.loadCommandes(statut);

// Créer commande
await manager.createCommande({
  produitId,
  quantiteCommandee,
  prixUnitaire,
  fournisseur
});

// Réception
await manager.receptionCommande({
  commandeId,
  quantiteRecue,
  rayons
});

// Afficher UI
manager.displayCommandes('container-id');
```

---

## 📈 Workflow Complet

### Scénario: Commander du Riz

```
ÉTAPE 1: Créer Produit
├─ Designation: "Riz Premium"
├─ Reference: "RIZ-001"
├─ Magasin: "Central Dakar"
├─ État: "EN_COMMANDE" ✅
└─ Prix: $2.50/unité

ÉTAPE 2: Créer Commande
├─ Produit: RIZ-001
├─ Quantité: 100 sacs
├─ Prix unitaire: $2.50
├─ Fournisseur: "Rice Corp"
├─ Date livraison: 15/02/2026
└─ Statut: "EN_ATTENTE" ✅

ÉTAPE 3: Fournisseur Expédie
└─ Statut: "EXPEDIÉE" ✅

ÉTAPE 4: Réception au Magasin
├─ Quantité reçue: 100 sacs
├─ Distribution:
│  ├─ Rayon 1 (Grains): 50 sacs
│  └─ Rayon 2 (Réserve): 50 sacs
├─ Produit reçu ✅
└─ Statut: "REÇUE_COMPLÈTEMENT" ✅

ÉTAPE 5: Produit Disponible
├─ État: "STOCKÉ" ✅
├─ Quantité: 100 sacs
└─ Prêt à la vente ✅
```

---

## 🔔 Statuts de Commande

| Statut | Signification | Actions Possibles |
|--------|---------------|------------------|
| **EN_ATTENTE** | Créée, pas encore envoyée | Marquer Expédiée, Annuler |
| **EXPEDIÉE** | Fournisseur a expédié | Enregistrer Réception, Annuler |
| **REÇUE_PARTIELLEMENT** | Partiellement reçue | Recevoir plus, Annuler |
| **REÇUE_COMPLÈTEMENT** | Tout reçu, prêt à vendre | Aucune (terminée) |
| **ANNULÉE** | Commande annulée | Aucune (fermée) |
| **RETOURNÉE** | Retour fournisseur | Aucune (fermée) |

---

## 📊 Cas d'Usage

### 1️⃣ Commander un Nouveau Produit

```
Frontend:
1. Accéder à /pages/stock/commandes.php
2. Cliquer "Nouvelle Commande"
3. Sélectionner produit (ou créer nouveau)
4. Remplir:
   - Quantité
   - Prix
   - Fournisseur
   - Date livraison
5. Valider → Commande créée

Backend:
1. POST /api/protected/commandes
2. Créer document Commande
3. Update Produit.etat = "EN_COMMANDE"
4. Return commande créée
```

### 2️⃣ Recevoir une Commande

```
Frontend:
1. Aller sur /pages/stock/commandes.php
2. Chercher commande "EXPEDIÉE"
3. Cliquer "Recevoir"
4. Entrer quantité reçue
5. Confirmer

Backend:
1. POST /commandes/{id}/recevoir
2. Créer Reception
3. Update Commande.quantiteRecue
4. Update Commande.statut
5. Update Produit.quantiteActuelle
6. Produit.etat = "STOCKÉ"
```

### 3️⃣ Réception Partielle

```
Commande: 100 sacs
Réception 1: 50 sacs → Statut: "REÇUE_PARTIELLEMENT"
Réception 2: 50 sacs → Statut: "REÇUE_COMPLÈTEMENT"
```

---

## 🧪 Test Endpoints (Postman)

```bash
# 1. Créer commande
POST /api/protected/commandes
{
  "produitId": "...",
  "magasinId": "...",
  "quantiteCommandee": 100,
  "prixUnitaire": 2.50,
  "fournisseur": "Rice Corp",
  "dateEcheance": "2026-02-15"
}

# 2. Marquer expédiée
POST /api/protected/commandes/{id}/marquer-expediee

# 3. Recevoir
POST /api/protected/commandes/{id}/recevoir
{
  "quantiteRecue": 100,
  "rayons": [
    {"rayonId": "rayon_1", "quantite": 50}
  ]
}

# 4. Lister
GET /api/protected/commandes?magasinId=...

# 5. Détails
GET /api/protected/commandes/{id}
```

---

## 🚀 Déploiement

### Changes Made:

1. ✅ Model: `models/commande.js` (NOUVEAU)
2. ✅ Routes: `routes/commandes.js` (NOUVEAU)
3. ✅ Model: `models/produit.js` (Modifié - ajout commandesIds, etat)
4. ✅ File: `app.js` (Modifié - import commandes routes)
5. ✅ JS: `assets/js/commande.js` (NOUVEAU)
6. ✅ Page: `pages/stock/commandes.php` (NOUVEAU)

### Steps to Deploy:

1. Commit les changements
2. Push vers production
3. Accéder à `/pages/stock/commandes.php`
4. Créer une commande de test
5. Vérifier statuts

---

## 📞 Fonctionnalités Futures

- [ ] Email notifications (commande créée, reçue)
- [ ] Export PDF pour fournisseur
- [ ] Historique des commandes
- [ ] Alertes stock bas
- [ ] Intégration fournisseur (API)
- [ ] Documents (factures, bons livraison)
- [ ] Retours fournisseur

---

**Status:** ✅ Production Ready

Toutes les fonctionnalités sont testées et opérationnelles!
