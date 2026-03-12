# 📱 Documentation API Mobile - Gestion de Stock

**Version:** 1.0  
**Date:** 07/01/2026  
**Base URL:** `https://backend-gestion-de-stock.onrender.com`

---

## 📋 Table des matières

1. [🔐 Authentification](#authentification)
2. [📦 Magasins](#magasins)
3. [⚙️ Configuration](#configuration)
4. [📋 Produits](#produits)
5. [📥 Réceptions](#réceptions)
6. [💰 Mouvements/Ventes](#mouvements)
7. [🚨 Alertes](#alertes)
8. [📊 Audit & Traçabilité](#audit)
9. [🔑 Variables d'environnement](#variables)
10. [⚠️ Codes d'erreur](#erreurs)

---

## 🔐 Authentification {#authentification}

### POST /api/auth/login

**Authentifier un utilisateur et obtenir un token JWT**

#### Request
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "gestionnaire@example.com",
  "password": "password123"
}
```

#### Response (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "691eebe005d8333cd988f743",
    "nom": "Akim",
    "prenom": "Hank",
    "email": "zozo@gmail.com",
    "role": "admin",
    "telephone": "121213213213",
    "photoUrl": "https://res.cloudinary.com/..."
  }
}
```

#### Headers requis
```
Content-Type: application/json
```

#### Variables à sauvegarder
```
TOKEN = response.token
USER_ID = response.user._id
ROLE = response.user.role
```

#### Codes d'erreur
- `400` - Email ou password invalide
- `401` - Identifiants incorrects

---

## 📦 Magasins {#magasins}

### GET /api/protected/magasins

**Lister tous les magasins accessibles à l'utilisateur**

#### Request
```bash
GET /api/protected/magasins
Authorization: Bearer {{TOKEN}}
```

#### Response (200 OK)
```json
{
  "success": true,
  "magasins": [
    {
      "_id": "693bf84f9955cef110cae98b",
      "nom": "Zongo marketing",
      "adresse": "123 Rue du Commerce",
      "ville": "Dakar",
      "telephone": "221701234567",
      "managerId": "691eebe005d8333cd988f743",
      "nombreRayons": 5,
      "nombreProduits": 15,
      "capaciteTotale": 100,
      "stockActuel": 350,
      "occupation": "350%",
      "alertes": 2,
      "dateCreation": "2025-12-20T10:00:00.000Z"
    }
  ]
}
```

#### Headers requis
```
Authorization: Bearer {{TOKEN}}
```

#### Utilisation
1. Appelle cet endpoint après le login
2. Sauvegarde `MAGASIN_ID` pour les appels suivants
3. Affiche la liste des magasins à l'utilisateur
4. Laisse sélectionner un magasin

---

## ⚙️ Configuration {#configuration}

### GET /api/protected/magasins/:magasinId/rayons

**Charger tous les rayons du magasin**

#### Request
```bash
GET /api/protected/magasins/{{MAGASIN_ID}}/rayons
Authorization: Bearer {{TOKEN}}
```

#### Response (200 OK)
```json
[
  {
    "_id": "694fc2edff00de0189ebe6fb",
    "magasinId": "693bf84f9955cef110cae98b",
    "codeRayon": "A123",
    "nomRayon": "Rayon Froid",
    "typeRayon": "FROID",
    "capaciteMax": 1,
    "couleurRayon": "#10b981",
    "iconeRayon": "🍞",
    "quantiteActuelle": 300,
    "articles": 3,
    "occupation": 300,
    "typesProduitsAutorises": [
      {
        "_id": "694fb31f6161930096064950",
        "nomType": "Viande"
      }
    ]
  }
]
```

#### Champs importants
- `capaciteMax`: Nombre max de produits
- `articles`: Nombre de produits actuels
- `occupation`: % d'occupation (articles/capaciteMax * 100)
- `typesProduitsAutorises`: Types acceptés par ce rayon

#### ⚠️ Validations
- **Si `occupation >= 80%`**: ⚠️ Rayon presque plein
- **Si `occupation >= 100%`**: 🚫 Rayon PLEIN - Refuser ajout

---

### GET /api/protected/magasins/:magasinId/types-produits

**Charger tous les types de produits du magasin**

#### Request
```bash
GET /api/protected/magasins/{{MAGASIN_ID}}/types-produits
Authorization: Bearer {{TOKEN}}
```

#### Response (200 OK)
```json
{
  "success": true,
  "categories": [
    {
      "_id": "694fb31f6161930096064950",
      "magasinId": "693bf84f9955cef110cae98b",
      "nomType": "Viande",
      "code": "V123",
      "unitePrincipale": "kg",
      "icone": "🍞",
      "description": "Produits carnés frais"
    }
  ]
}
```

#### Utilisation
- Remplir les dropdowns "Type de produit"
- Filtrer les produits par type

---

### GET /api/protected/magasins/:magasinId/stock-config

**Charger la configuration complète du stock**

#### Request
```bash
GET /api/protected/magasins/{{MAGASIN_ID}}/stock-config
Authorization: Bearer {{TOKEN}}
```

#### Response (200 OK)
```json
{
  "success": true,
  "magasinId": "693bf84f9955cef110cae98b",
  "rayons": [...],
  "typesProduits": [...],
  "config": {
    "seuilAlerteParDefaut": 10,
    "capaciteTotale": 100,
    "capaciteActuelle": 350
  }
}
```

---

## 📋 Produits {#produits}

### GET /api/protected/magasins/:magasinId/produits

**Lister tous les produits du magasin (y compris EN_COMMANDE)** 🛒

#### Request
```bash
GET /api/protected/magasins/{{MAGASIN_ID}}/produits
Authorization: Bearer {{TOKEN}}
```

#### Response (200 OK)
```json
{
  "success": true,
  "produits": [
    {
      "_id": "695d705f366b025d9f34d1d7",
      "reference": "PROD001",
      "designation": "Poulet frais",
      "typeProduitId": {
        "_id": "694fb31f6161930096064950",
        "nomType": "Viande"
      },
      "rayonId": {
        "_id": "694fc2edff00de0189ebe6fb",
        "nomRayon": "Rayon Froid"
      },
      "quantiteActuelle": 60,
      "prixUnitaire": 2500,
      "seuilAlerte": 10,
      "etat": "STOCKÉ",
      "photoUrl": "https://...",
      "dateEntree": "2026-01-01T00:00:00.000Z"
    },
    {
      "_id": "695d705f366b025d9f34d1d8",
      "reference": "PROD002",
      "designation": "Riz blanc",
      "etat": "EN_COMMANDE",
      "quantiteActuelle": 100,
      "prixUnitaire": 1500,
      "commandesIds": ["696a1234567890123456789a"]
    }
  ]
}
```

#### 📝 Note importante
- ✅ Retourne TOUS les produits: stockés ET en commande
- 🛒 **EN_COMMANDE** = Produit commandé, en attente de réception
- 📦 **STOCKÉ** = Produit en stock normalement

#### Utilisation
- Afficher la liste des produits
- Pour **EN_COMMANDE**: Appeler POST /receptions pour réceptionner la commande
- Permettre la sélection pour ventes/mouvements (stocks normaux)
- Afficher le stock disponible

---

### GET /api/protected/produits/:produitId

**Voir les détails complets d'un produit (avec includes)**

#### Request
```bash
GET /api/protected/produits/{{PRODUIT_ID}}?include=mouvements,receptions,alertes,enregistrement
Authorization: Bearer {{TOKEN}}
```

#### Query Parameters
| Param | Type | Description |
|-------|------|-------------|
| `include` | string | Données à inclure: `mouvements,receptions,alertes,enregistrement` |

#### Response (200 OK)
```json
{
  "data": {
    "_id": "695d705f366b025d9f34d1d7",
    "reference": "PROD001",
    "designation": "Poulet frais",
    "quantiteActuelle": 60,
    "prixUnitaire": 2500,
    "seuilAlerte": 10,
    "photoUrl": "https://..."
  },
  "mouvements": [
    {
      "_id": "...",
      "type": "ENTREE_INITIALE",
      "quantite": 50,
      "dateCreation": "2026-01-06T20:28:15.866Z",
      "observations": "Stock initial"
    },
    {
      "_id": "...",
      "type": "SORTIE",
      "quantite": 5,
      "dateCreation": "2026-01-07T10:30:00.000Z",
      "utilisateurId": {
        "nom": "Akim",
        "prenom": "Hank"
      }
    }
  ],
  "receptions": [
    {
      "_id": "...",
      "quantite": 40,
      "fournisseur": "Fournisseur ABC",
      "dateReception": "2026-01-06T20:29:22.000Z",
      "prixAchat": 100,
      "prixTotal": 4000
    }
  ],
  "alertes": [
    {
      "_id": "...",
      "type": "STOCK_BAS",
      "statut": "ACTIVE",
      "dateCreation": "2026-01-07T10:00:00.000Z"
    }
  ]
}
```

---

### POST /api/protected/magasins/:magasinId/produits

**Ajouter un nouveau produit** ✨

#### Request
```bash
POST /api/protected/magasins/{{MAGASIN_ID}}/produits
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "reference": "Po1214",
  "designation": "Poulet frais",
  "typeProduitId": "696b44da0071eb6ffe8b24d8",
  "rayonId": "696b45110071eb6ffe8b24ea",
  "prixUnitaire": 2500,
  "quantiteEntree": 50,
  "photoUrl": "https://res.cloudinary.com/...",
  "seuilAlerte": 10,
  "etat": "Neuf",
  "notes": "Nouveau produit"
}
```

#### Body Parameters
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `reference` | string | ✅ | Code unique du produit |
| `designation` | string | ✅ | Nom du produit |
| `typeProduitId` | ObjectId | ✅ | ID du type de produit |
| `rayonId` | ObjectId | ✅ | ID du rayon |
| `prixUnitaire` | number | ✅ | Prix par unité |
| `quantiteEntree` | number | ✅ | Quantité initiale |
| `photoUrl` | string | ❌ | URL de la photo (Cloudinary) |
| `seuilAlerte` | number | ❌ | Seuil d'alerte (défaut: 10) |
| `etat` | string | ❌ | État (Neuf, Bon état, Usagé, Endommagé, EN_COMMANDE, STOCKÉ) |
| `notes` | string | ❌ | Remarques |

#### Response (201 Created)
```json
{
  "success": true,
  "produit": {
    "_id": "695d705f366b025d9f34d1d7",
    "reference": "Po1214",
    "designation": "Poulet frais",
    "quantiteActuelle": 50,
    "prixUnitaire": 2500,
    "etat": "Neuf",
    "photoUrl": "https://res.cloudinary.com/..."
  }
}
```

#### Validations
- ✅ Référence unique par magasin
- ✅ Type de produit accepté par le rayon
- ❌ **Rayon PLEIN**: Rejette si `occupation >= 100%`

#### Codes d'erreur
- `400` - Référence déjà existante
- `400` - Rayon n'accepte pas ce type
- `400` - Rayon plein (occupation >= 100%)
- `404` - Magasin/Rayon/Type non trouvé

---

### PUT /api/protected/produits/:produitId

**Modifier un produit** ✏️

#### Request
```bash
PUT /api/protected/produits/{{PRODUIT_ID}}
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "designation": "Poulet frais 1kg",
  "prixUnitaire": 2800,
  "seuilAlerte": 15,
  "notes": "Nouveau prix"
}
```

#### Body Parameters
| Param | Type | Description |
|-------|------|-------------|
| `designation` | string | Nouveau nom |
| `prixUnitaire` | number | Nouveau prix |
| `seuilAlerte` | number | Nouveau seuil |
| `etat` | string | Nouvel état |
| `notes` | string | Nouvelles notes |

#### Response (200 OK)
```json
{
  "success": true,
  "produit": {
    "_id": "695d705f366b025d9f34d1d7",
    "designation": "Poulet frais 1kg",
    "prixUnitaire": 2800
  },
  "changements": {
    "prixUnitaire": "2500 → 2800",
    "designation": "Poulet frais → Poulet frais 1kg"
  }
}
```

#### 📝 Audit
- Tous les changements sont enregistrés dans l'audit
- Traçable: Qui? Quand? Quoi?

---

### POST /api/protected/upload/produit-image

**Upload une photo pour un produit** 📸

#### Request
```bash
POST /api/protected/upload/produit-image
Authorization: Bearer {{TOKEN}}
Content-Type: multipart/form-data

Body:
  image: <binary file>
```

#### Response (200 OK)
```json
{
  "success": true,
  "photoUrl": "https://res.cloudinary.com/dsbejzvqv/image/upload/v1764828424/produits/abc123.jpg",
  "photoCloudinaryId": "produits/abc123"
}
```

#### Contraintes
- Max 5MB
- Formats: JPG, PNG, WebP

#### Utilisation
1. Sélectionne une image
2. Upload vers cet endpoint
3. Copie `photoUrl` dans `POST /produits` ou `PUT /produits/:id`

---

### GET /api/protected/produits/:produitId/stocks

**Voir les stocks d'un produit par rayon**

#### Request
```bash
GET /api/protected/produits/{{PRODUIT_ID}}/stocks
Authorization: Bearer {{TOKEN}}
```

#### Response (200 OK)
```json
{
  "produitId": "695d705f366b025d9f34d1d7",
  "designation": "Poulet frais",
  "stocks": [
    {
      "rayonId": "694fc2edff00de0189ebe6fb",
      "nomRayon": "Rayon Froid",
      "quantite": 60,
      "seuilAlerte": 10,
      "status": "✅ Normal"
    }
  ]
}
```

---

## 📥 Réceptions {#réceptions}

### POST /api/protected/receptions

**Enregistrer une réception (Fournisseur OU Réceptionner une commande)** ⭐

#### Request - Type 1: Réception Fournisseur Normal
```bash
POST /api/protected/receptions
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "magasinId": "693bf84f9955cef110cae98b",
  "produitId": "695d705f366b025d9f34d1d7",
  "rayonId": "694fc2edff00de0189ebe6fb",
  "typeProduitId": "694fb31f6161930096064950",
  "quantite": 50,
  "fournisseur": "Fournisseur XYZ",
  "prixAchat": 2000,
  "photoUrl": "https://...",
  "observations": "Livraison conforme"
}
```

#### Request - Type 2: Réceptionner une Commande 🛒
```bash
POST /api/protected/receptions
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "magasinId": "693bf84f9955cef110cae98b",
  "produitId": "695d705f366b025d9f34d1d7",
  "rayonId": "694fc2edff00de0189ebe6fb",
  "typeProduitId": "694fb31f6161930096064950",
  "quantite": 50,
  "prixAchat": 2000,
  "photoUrl": "https://...",
  "dateReceptionReelle": "2026-01-07",
  "etatReel": "Neuf"
}
```

#### Body Parameters
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `magasinId` | ObjectId | ✅ | ID du magasin |
| `produitId` | ObjectId | ✅ | ID du produit |
| `rayonId` | ObjectId | ✅ | ID du rayon |
| `typeProduitId` | ObjectId | ✅ | ID du type produit |
| `quantite` | number | ✅ | Quantité reçue |
| `prixAchat` | number | ✅ | Prix unitaire |
| `photoUrl` | string | ❌ | URL photo Cloudinary |
| `fournisseur` | string | ❌ | Nom fournisseur (réception normal) |
| `dateReceptionReelle` | date | ❌ | Date réelle (réception commande) |
| `etatReel` | string | ❌ | État produit (réception commande) |
| `numeroDocument` | string | ❌ | N° facture/bon |
| `observations` | string | ❌ | Remarques |

#### Response (201 Created)
```json
{
  "success": true,
  "reception": {
    "_id": "695d70a1366b025d9f34d228",
    "quantite": 50,
    "fournisseur": "Fournisseur XYZ",
    "dateReception": "2026-01-07T00:00:00.000Z",
    "prixAchat": 2000
  },
  "stockMovement": {
    "_id": "...",
    "type": "RECEPTION",
    "quantite": 50
  },
  "produitUpdated": {
    "id": "695d705f366b025d9f34d1d7",
    "quantiteActuelle": 50,
    "etat": "STOCKÉ"
  },
  "commandeUpdated": {
    "statut": "REÇUE",
    "dateReception": "2026-01-07T00:00:00.000Z"
  }
}
```

#### 📝 Automatismes
- ✅ Crée un mouvement de stock type `RECEPTION`
- ✅ Met à jour la `quantiteActuelle` du produit
- ✅ Pour réception commande (ET/LOT): passe produit de EN_COMMANDE → STOCKÉ
- ✅ Pour réception commande: marque la commande comme REÇUE
- ✅ Log l'audit avec timestamp et utilisateur
- ✅ Crée alerte si stock dépasse capacité rayon

#### 🎯 Difference Réception Commande vs Fournisseur

| Aspect | Réception Normale | Réception Commande |
|--------|-------------------|-------------------|
| `etat` avant | Peut être n'importe quoi | **EN_COMMANDE** |
| `etat` après | Reste inchangé | **STOCKÉ** ✨ |
| `fournisseur` | ✅ Utilisé | ❌ Ignoré |
| `dateReceptionReelle` | ❌ Ignoré | ✅ Utilisé (optionnel) |
| `etatReel` | ❌ Ignoré | ✅ Utilisé (optionnel) |
| Commande | ❌ Aucune | ✅ Marquée REÇUE |

#### Codes d'erreur
- `400` - Données manquantes ou invalides
- `400` - Rayon ne supporte pas ce type produit
- `404` - Produit/Rayon/Magasin non trouvé

---

### PUT /api/protected/receptions/:receptionId

**Modifier une réception existante** 🔧

#### Request
```bash
PUT /api/protected/receptions/{{RECEPTION_ID}}
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "magasinId": "693bf84f9955cef110cae98b",
  "quantite": 75,
  "fournisseur": "Fournisseur ABC",
  "dateReception": "2026-01-08",
  "prixAchat": 2500,
  "prixTotal": 187500,
  "statut": "Validée",
  "lotNumber": "LOT-2026-001",
  "datePeremption": "2027-01-07"
}
```

#### URL Parameters
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `receptionId` | ObjectId | ✅ | ID de la réception à modifier |

#### Body Parameters (tous optionnels)
| Param | Type | Description |
|-------|------|-------------|
| `magasinId` | ObjectId | ID du magasin (validation d'accès) |
| `quantite` | number | Nouvelle quantité |
| `fournisseur` | string | Nouveau fournisseur |
| `dateReception` | date | Nouvelle date |
| `prixAchat` | number | Nouveau prix unitaire |
| `prixTotal` | number | Nouveau prix total |
| `statut` | string | Nouveau statut (En attente, Validée, Rejetée) |
| `lotNumber` | string | Numéro de lot |
| `dateFabrication` | date | Date de fabrication |
| `datePeremption` | date | Date de péremption |
| `photoUrl` | string | URL ou path de la photo |

#### Response (200 OK)
```json
{
  "success": true,
  "reception": {
    "_id": "695d70a1366b025d9f34d228",
    "magasinId": {
      "_id": "693bf84f9955cef110cae98b",
      "nom": "Magasin Principal"
    },
    "produitId": {
      "_id": "695d705f366b025d9f34d1d7",
      "nomProduit": "Riz blanc",
      "typeProduitId": {
        "nomType": "Céréales",
        "code": "CER-001"
      }
    },
    "quantite": 75,
    "fournisseur": "Fournisseur ABC",
    "dateReception": "2026-01-08T00:00:00.000Z",
    "prixAchat": 2500,
    "prixTotal": 187500,
    "statut": "Validée",
    "lotNumber": "LOT-2026-001",
    "datePeremption": "2027-01-07T00:00:00.000Z",
    "photoUrl": "https://res.cloudinary.com/...",
    "updatedAt": "2026-01-10T14:30:00.000Z"
  }
}
```

#### 📋 Validation
- ✅ Vérifie que la réception existe (404 si non trouvée)
- ✅ Vérifie l'accès du gestionnaire au magasin (403 si refusé)
- ✅ Les champs sont optionnels (mise à jour partielle)
- ✅ Support upload photo via Cloudinary

#### 📸 Upload Photo
La photo peut être envoyée via `multipart/form-data`:
```bash
PUT /api/protected/receptions/{{RECEPTION_ID}}
Authorization: Bearer {{TOKEN}}
Content-Type: multipart/form-data

[form-data]
magasinId: "693bf84f9955cef110cae98b"
quantite: "75"
photo: [file]
```

#### Codes d'erreur
- `400` - Erreur lors de l'upload photo
- `403` - Accès refusé à ce magasin
- `404` - Réception non trouvée
- `500` - Erreur serveur

---

## 💰 Mouvements/Ventes {#mouvements}

### POST /api/protected/magasins/:magasinId/stock-movements

**Enregistrer un mouvement de stock (Vente, Transfert, etc.)** 💵

#### Request
```bash
POST /api/protected/magasins/{{MAGASIN_ID}}/stock-movements
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "type": "SORTIE",
  "quantite": 5,
  "produitId": "695d705f366b025d9f34d1d7",
  "rayonId": "694fc2edff00de0189ebe6fb",
  "observations": "Vente client #12345"
}
```

#### Body Parameters
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | ✅ | SORTIE, TRANSFERT, INVENTAIRE, PERTE, etc. |
| `quantite` | number | ✅ | Quantité |
| `produitId` | ObjectId | ✅ | ID du produit |
| `rayonId` | ObjectId | ✅ | ID du rayon source |
| `observations` | string | ❌ | Description du mouvement |

#### Types de mouvements
| Type | Description |
|------|-------------|
| `ENTREE_INITIALE` | Stock initial |
| `RECEPTION` | Réception fournisseur |
| `SORTIE` | Vente/Retrait |
| `TRANSFERT` | Vers un autre rayon |
| `RETOUR` | Retour fournisseur |
| `INVENTAIRE` | Ajustement inventaire |
| `PERTE` | Perte/Casse |

#### Response (201 Created)
```json
{
  "success": true,
  "mouvement": {
    "_id": "...",
    "type": "SORTIE",
    "quantite": 5,
    "dateCreation": "2026-01-07T15:30:00.000Z",
    "produit": {
      "designation": "Poulet frais",
      "quantiteActuelle": 55
    }
  }
}
```

#### Validations
- ✅ Stock sufisant (quantite <= quantiteActuelle)
- ✅ Produit/Rayon valide

#### Codes d'erreur
- `400` - Stock insuffisant
- `400` - Quantité invalide
- `404` - Produit/Rayon non trouvé

---

### GET /api/protected/magasins/:magasinId/stock-movements

**Lister les mouvements du magasin**

#### Request
```bash
GET /api/protected/magasins/{{MAGASIN_ID}}/stock-movements
Authorization: Bearer {{TOKEN}}
```

#### Response (200 OK)
```json
{
  "success": true,
  "mouvements": [
    {
      "_id": "...",
      "type": "SORTIE",
      "quantite": 5,
      "produitId": {
        "designation": "Poulet frais",
        "reference": "PROD001"
      },
      "utilisateurId": {
        "nom": "Akim",
        "prenom": "Hank"
      },
      "dateCreation": "2026-01-07T15:30:00.000Z",
      "observations": "Vente client #12345"
    }
  ]
}
```

---

### GET /api/protected/produits/:produitId/mouvements

**Lister les mouvements d'un produit**

#### Request
```bash
GET /api/protected/produits/{{PRODUIT_ID}}/mouvements
Authorization: Bearer {{TOKEN}}
```

#### Response (200 OK)
```json
{
  "produitId": "695d705f366b025d9f34d1d7",
  "designation": "Poulet frais",
  "mouvements": [
    {
      "_id": "...",
      "type": "ENTREE_INITIALE",
      "quantite": 50,
      "dateCreation": "2026-01-06T20:28:15.866Z"
    },
    {
      "_id": "...",
      "type": "RECEPTION",
      "quantite": 40,
      "dateCreation": "2026-01-06T20:29:22.687Z"
    }
  ]
}
```

---

## 🚨 Alertes {#alertes}

### GET /api/protected/magasins/:magasinId/alertes

**Lister les alertes du magasin** 🔴

#### Request
```bash
GET /api/protected/magasins/{{MAGASIN_ID}}/alertes?statut=ACTIVE
Authorization: Bearer {{TOKEN}}
```

#### Query Parameters
| Param | Type | Description |
|-------|------|-------------|
| `statut` | string | ACTIVE, RESOLUE, IGNOREE |
| `type` | string | STOCK_BAS, EXPIRATION, ANOMALIE |

#### Response (200 OK)
```json
[
  {
    "_id": "...",
    "type": "STOCK_BAS",
    "statut": "ACTIVE",
    "magasinId": "693bf84f9955cef110cae98b",
    "produitId": {
      "_id": "695d705f366b025d9f34d1d7",
      "designation": "Poulet frais",
      "quantiteActuelle": 8,
      "seuilAlerte": 10
    },
    "dateCreation": "2026-01-07T10:00:00.000Z",
    "message": "Stock sous le seuil d'alerte"
  }
]
```

#### Types d'alertes
| Type | Condition |
|------|-----------|
| `STOCK_BAS` | quantiteActuelle <= seuilAlerte |
| `EXPIRATION` | Date d'expiration < 30 jours |
| `ANOMALIE` | Discordance stock physique |

---

### PUT /api/protected/alertes/:alerteId

**Marquer une alerte comme résolue** ✅

#### Request
```bash
PUT /api/protected/alertes/{{ALERTE_ID}}
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "statut": "RESOLUE",
  "notes": "Stock complété le 07/01/2026"
}
```

#### Body Parameters
| Param | Type | Description |
|-------|------|-------------|
| `statut` | string | RESOLUE, IGNOREE |
| `notes` | string | Raison de la résolution |

#### Response (200 OK)
```json
{
  "success": true,
  "alerte": {
    "_id": "...",
    "statut": "RESOLUE",
    "notes": "Stock complété le 07/01/2026"
  }
}
```

---

## 📊 Audit & Traçabilité {#audit}

### GET /api/protected/magasins/:magasinId/audit-logs

**Voir l'audit log du magasin** 🔍

#### Request
```bash
GET /api/protected/magasins/{{MAGASIN_ID}}/audit-logs?action=CREATE_PRODUIT&limit=50
Authorization: Bearer {{TOKEN}}
```

#### Query Parameters
| Param | Type | Description |
|-------|------|-------------|
| `action` | string | CREATE_PRODUIT, UPDATE_PRODUIT, DELETE_PRODUIT, etc. |
| `entityType` | string | PRODUIT, RECEPTION, MOUVEMENT, ALERTE |
| `dateDebut` | date | Format: YYYY-MM-DD |
| `dateFin` | date | Format: YYYY-MM-DD |
| `limit` | number | Max 200, défaut 50 |
| `skip` | number | Pour pagination |

#### Response (200 OK)
```json
{
  "success": true,
  "magasinId": "693bf84f9955cef110cae98b",
  "magasinNom": "Zongo marketing",
  "logs": [
    {
      "_id": "...",
      "action": "CREATE_PRODUIT",
      "entityType": "PRODUIT",
      "entityId": "695d705f366b025d9f34d1d7",
      "utilisateur": {
        "id": "691eebe005d8333cd988f743",
        "nom": "Hank Akim",
        "email": "zozo@gmail.com"
      },
      "dateCreation": "2026-01-07T10:00:00.000Z",
      "details": {
        "reference": "PROD001",
        "designation": "Poulet frais"
      },
      "changements": {
        "quantiteEntree": 50,
        "prixUnitaire": 2500
      }
    }
  ],
  "count": 25
}
```

---

### GET /api/protected/audit-logs/:entityType/:entityId

**Historique complet d'une entité**

#### Request
```bash
GET /api/protected/audit-logs/PRODUIT/{{PRODUIT_ID}}
Authorization: Bearer {{TOKEN}}
```

#### Response (200 OK)
```json
{
  "success": true,
  "entityType": "PRODUIT",
  "entityId": "695d705f366b025d9f34d1d7",
  "logs": [
    {
      "action": "CREATE_PRODUIT",
      "utilisateur": "Hank Akim",
      "dateCreation": "2026-01-06T20:28:15.866Z"
    },
    {
      "action": "UPDATE_PRODUIT",
      "utilisateur": "Hank Akim",
      "dateCreation": "2026-01-07T10:00:00.000Z",
      "changements": {
        "prixUnitaire": "2500 → 2800"
      }
    }
  ]
}
```

---

## 🔑 Variables d'environnement {#variables}

Définis ces variables dans Postman pour faciliter les tests:

```
BASE_URL = https://backend-gestion-de-stock.onrender.com

TOKEN = (copié du login)
USER_ID = (copié du login)
MAGASIN_ID = 693bf84f9955cef110cae98b
PRODUIT_ID = 695d705f366b025d9f34d1d7
RAYON_ID = 694fc2edff00de0189ebe6fb
ALERTE_ID = (de la réponse des alertes)
```

---

## ⚠️ Codes d'erreur {#erreurs}

| Code | Message | Solution |
|------|---------|----------|
| `200` | ✅ OK | Succès |
| `201` | ✅ Created | Créé avec succès |
| `400` | ❌ Bad Request | Vérifie les données envoyées |
| `401` | ❌ Unauthorized | Token expiré, fais un nouveau login |
| `403` | ❌ Forbidden | Pas d'accès à cette ressource |
| `404` | ❌ Not Found | Ressource n'existe pas |
| `500` | ❌ Server Error | Erreur serveur, contacte support |

### Erreurs courantes

#### Rayon plein
```json
{
  "message": "❌ Rayon plein! Capacité max: 1 produits, actuels: 3",
  "occupation": "300%"
}
```
**Solution:** Vendre/Transférer du stock avant d'ajouter

#### Stock insuffisant
```json
{
  "message": "Stock insuffisant pour cette sortie"
}
```
**Solution:** Vérifier la quantité disponible

#### Token expiré
```json
{
  "message": "Token expiré"
}
```
**Solution:** Fais un nouveau login

---

## 🎯 Workflow type mobile

```
1. 🔐 LOGIN
   POST /api/auth/login
   → Obtiens TOKEN

2. 📦 SÉLECTIONNER MAGASIN
   GET /api/protected/magasins
   → Stocke MAGASIN_ID

3. ⚙️ CHARGER CONFIG
   GET /api/protected/magasins/:magasinId/rayons
   GET /api/protected/magasins/:magasinId/types-produits
   → Cache les données

4. 📋 LISTER PRODUITS
   GET /api/protected/magasins/:magasinId/produits
   → Affiche la liste

5. ✨ AJOUTER PRODUIT (optionnel)
   POST /api/protected/magasins/:magasinId/produits
   POST /api/protected/upload/produit-image (optionnel)

6. 📥 RÉCEPTIONNER MARCHANDISE
   POST /api/protected/receptions
   → Met à jour le stock

7. 💰 ENREGISTRER VENTE
   POST /api/protected/magasins/:magasinId/stock-movements
   → Réduit le stock

8. 🚨 VÉRIFIER ALERTES
   GET /api/protected/magasins/:magasinId/alertes?statut=ACTIVE
   → Affiche les alertes

9. 📊 VOIR TRAÇABILITÉ
   GET /api/protected/magasins/:magasinId/audit-logs
   → Historique complet
```

---

## 📞 Support

- **Email:** support@stock-management.com
- **Documentation:** https://github.com/stock-management/api
- **Status:** https://status.stock-management.com

---

**Dernière mise à jour:** 07/01/2026  
**Version API:** v1.0
