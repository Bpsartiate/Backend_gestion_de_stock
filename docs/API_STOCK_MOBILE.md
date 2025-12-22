# 📱 API STOCK POUR MOBILE - GUIDE COMPLET

## 🎯 Vue d'ensemble

Cette API permet à l'application mobile de gérer le stock en temps réel:
- Lister les produits
- Ajouter des produits en réception
- Enregistrer des sorties de stock
- Consulter l'historique des mouvements

---

## 🔐 Authentification

Tous les endpoints requirent un **Bearer Token** en header:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_TOKEN',
  'Content-Type': 'application/json'
}
```

---

## 📦 ENDPOINTS PRODUITS

### 1️⃣ Lister tous les produits du magasin

```http
GET /api/protected/magasins/:magasinId/produits
```

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "reference": "PROD-001",
    "designation": "T-Shirt Bleu",
    "typeProduitId": {
      "_id": "507f1f77bcf86cd799439012",
      "nomType": "Vêtements",
      "unitePrincipale": "pièces"
    },
    "rayonId": {
      "_id": "507f1f77bcf86cd799439013",
      "nomRayon": "Rayon 1",
      "codeRayon": "R001"
    },
    "quantiteActuelle": 50,
    "prixUnitaire": 5000,
    "etat": "Neuf",
    "dateEntree": "2025-12-22T10:00:00Z",
    "seuilAlerte": 10,
    "createdAt": "2025-12-22T10:00:00Z"
  }
]
```

---

### 2️⃣ Ajouter un nouveau produit (RÉCEPTION)

```http
POST /api/protected/magasins/:magasinId/produits
```

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "reference": "PROD-002",
  "designation": "T-Shirt Rouge",
  "typeProduitId": "507f1f77bcf86cd799439012",
  "rayonId": "507f1f77bcf86cd799439013",
  "quantiteEntree": 100,
  "prixUnitaire": 5000,
  "etat": "Neuf",
  "dateEntree": "2025-12-22T10:30:00Z",
  "seuilAlerte": 10,
  "champsDynamiques": {
    "couleur": "Rouge",
    "taille": "M"
  },
  "notes": "Livraison fournisseur ABC"
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "reference": "PROD-002",
  "designation": "T-Shirt Rouge",
  "quantiteActuelle": 100,
  "quantiteEntree": 100,
  "prixUnitaire": 5000,
  "createdAt": "2025-12-22T10:30:00Z"
}
```

---

### 3️⃣ Modifier un produit

```http
PUT /api/protected/produits/:produitId
```

**Body:**
```json
{
  "designation": "T-Shirt Rouge Premium",
  "prixUnitaire": 5500,
  "etat": "Bon état",
  "seuilAlerte": 15,
  "notes": "Mise à jour prix"
}
```

**Response (200):** Produit mis à jour

---

### 4️⃣ Supprimer un produit (soft delete)

```http
DELETE /api/protected/produits/:produitId
```

**Response (200):**
```json
{
  "message": "Produit supprimé"
}
```

---

## 📊 ENDPOINTS MOUVEMENTS DE STOCK

### 5️⃣ Enregistrer un mouvement (réception/sortie/transfert)

```http
POST /api/protected/magasins/:magasinId/stock-movements
```

**Body - RÉCEPTION:**
```json
{
  "produitId": "507f1f77bcf86cd799439014",
  "type": "RECEPTION",
  "quantite": 50,
  "numeroDocument": "FAC-12345",
  "fournisseur": "Fournisseur ABC",
  "prixUnitaire": 5000,
  "observations": "Livraison reçue et contrôlée",
  "dateDocument": "2025-12-22T11:00:00Z"
}
```

**Body - SORTIE:**
```json
{
  "produitId": "507f1f77bcf86cd799439014",
  "type": "SORTIE",
  "quantite": 10,
  "numeroDocument": "BON-67890",
  "observations": "Vente magasin physique",
  "dateDocument": "2025-12-22T14:00:00Z"
}
```

**Body - TRANSFERT (inter-magasins):**
```json
{
  "produitId": "507f1f77bcf86cd799439014",
  "type": "TRANSFERT",
  "quantite": 20,
  "magasinDestinationId": "507f1f77bcf86cd799439099",
  "numeroDocument": "TRF-11111",
  "observations": "Transfer vers magasin sud",
  "dateDocument": "2025-12-22T15:00:00Z"
}
```

**Body - RETOUR:**
```json
{
  "produitId": "507f1f77bcf86cd799439014",
  "type": "RETOUR",
  "quantite": 5,
  "numeroDocument": "RET-22222",
  "observations": "Produit retourné par client",
  "dateDocument": "2025-12-22T16:00:00Z"
}
```

**Types disponibles:**
- `RECEPTION` - Entrée en stock
- `SORTIE` - Sortie de stock
- `TRANSFERT` - Entre magasins
- `RETOUR` - Retour client
- `INVENTAIRE` - Ajustement inventaire
- `PERTE` - Perte/casse

**Response (201):**
```json
{
  "movement": {
    "_id": "607f1f77bcf86cd799439015",
    "type": "RECEPTION",
    "quantite": 50,
    "dateDocument": "2025-12-22T11:00:00Z",
    "createdAt": "2025-12-22T11:00:00Z"
  },
  "produit": {
    "_id": "507f1f77bcf86cd799439014",
    "quantiteActuelle": 150,
    "quantiteEntree": 150
  }
}
```

---

### 6️⃣ Lister les mouvements du magasin

```http
GET /api/protected/magasins/:magasinId/stock-movements
```

**Query params:**
- `type` (optionnel): Filtrer par type (RECEPTION, SORTIE, etc.)
- `produitId` (optionnel): Filtrer par produit
- `limit` (optionnel, défaut: 50): Nombre de résultats
- `skip` (optionnel, défaut: 0): Décalage pagination

**Example:**
```http
GET /api/protected/magasins/507f1f77bcf86cd799439011/stock-movements?type=RECEPTION&limit=20&skip=0
```

**Response (200):**
```json
{
  "movements": [
    {
      "_id": "607f1f77bcf86cd799439015",
      "produitId": {
        "_id": "507f1f77bcf86cd799439014",
        "reference": "PROD-002",
        "designation": "T-Shirt Rouge"
      },
      "type": "RECEPTION",
      "quantite": 50,
      "numeroDocument": "FAC-12345",
      "utilisateurId": {
        "_id": "707f1f77bcf86cd799439016",
        "prenom": "Jean",
        "nom": "Dupont"
      },
      "dateDocument": "2025-12-22T11:00:00Z"
    }
  ],
  "total": 120,
  "limit": 20,
  "skip": 0
}
```

---

### 7️⃣ Historique d'un produit

```http
GET /api/protected/produits/:produitId/mouvements
```

**Response (200):**
```json
[
  {
    "_id": "607f1f77bcf86cd799439015",
    "type": "RECEPTION",
    "quantite": 100,
    "utilisateurId": {
      "prenom": "Jean",
      "nom": "Dupont"
    },
    "dateDocument": "2025-12-22T10:30:00Z"
  },
  {
    "_id": "607f1f77bcf86cd799439016",
    "type": "SORTIE",
    "quantite": 10,
    "utilisateurId": {
      "prenom": "Marie",
      "nom": "Martin"
    },
    "dateDocument": "2025-12-22T14:00:00Z"
  }
]
```

---

## 🔍 Cas d'usage MOBILE

### 📲 Scénario 1: Réception de marchandise

```javascript
// 1. Charger la liste des produits
const produits = await API_CONFIG.get('PRODUITS', { magasinId });

// 2. Utilisateur scanne le code-barres d'un produit existant
// OU crée un nouveau produit si première réception
const nouveauProduit = await API_CONFIG.post('PRODUITS', {
  reference: scannedReference,
  designation: userInput.designation,
  typeProduitId: userSelectedType,
  rayonId: userSelectedRayon,
  quantiteEntree: userInput.quantite,
  prixUnitaire: userInput.prix
}, { magasinId });

// 3. Enregistrer le mouvement
const movement = await API_CONFIG.post('STOCK_MOVEMENTS', {
  produitId: nouveauProduit._id,
  type: 'RECEPTION',
  quantite: userInput.quantite,
  numeroDocument: factureNumber,
  fournisseur: supplierName,
  dateDocument: new Date()
}, { magasinId });

// Stock du produit est maintenant mis à jour automatiquement
console.log('Produit reçu:', movement.produit.quantiteActuelle);
```

---

### 📦 Scénario 2: Enregistrer une sortie

```javascript
// 1. Utilisateur sélectionne un produit
const produit = await API_CONFIG.get('PRODUIT', { produitId });

// 2. Vérifier le stock disponible
if (produit.quantiteActuelle < quantiteDemandee) {
  alert('Stock insuffisant!');
  return;
}

// 3. Enregistrer la sortie
const movement = await API_CONFIG.post('STOCK_MOVEMENTS', {
  produitId,
  type: 'SORTIE',
  quantite: quantiteDemandee,
  numeroDocument: bonNumber,
  observations: vendorName,
  dateDocument: new Date()
}, { magasinId });

// Stock décrémenté automatiquement
```

---

### 📤 Scénario 3: Transfert inter-magasins

```javascript
const movement = await API_CONFIG.post('STOCK_MOVEMENTS', {
  produitId,
  type: 'TRANSFERT',
  quantite: 50,
  magasinDestinationId: otherMagasinId, // Important!
  numeroDocument: 'TRF-001',
  dateDocument: new Date()
}, { magasinId: sourceMagasinId });

// Cela crée automatiquement:
// - SORTIE du magasin source
// - RECEPTION au magasin destination
```

---

## 🚨 Codes d'erreur

| Code | Message | Solution |
|------|---------|----------|
| 400 | "Référence déjà existante" | Utilisez une autre référence |
| 400 | "Stock insuffisant" | Vérifiez la quantité disponible |
| 400 | "Rayon invalide" | Sélectionnez un rayon du bon magasin |
| 403 | "Accès refusé" | Vérifiez vos permissions (Admin/Gestionnaire) |
| 404 | "Magasin non trouvé" | MagasinId invalide |
| 404 | "Produit non trouvé" | ProduitId invalide |
| 500 | "Erreur serveur" | Contactez l'admin |

---

## 💡 Bonnes pratiques

✅ **À FAIRE:**
- Toujours passer le `magasinId` correct
- Vérifier le stock avant de créer une SORTIE
- Utiliser `dateDocument` pour la traçabilité
- Sauvegarder le `numeroDocument` pour la facturation
- Gérer les erreurs réseau (retry logic)

❌ **À NE PAS FAIRE:**
- Ne pas ignorer les erreurs 403 (permission)
- Ne pas envoyer des quantités négatives
- Ne pas modifier manuellement les quantités en DB
- Ne pas transférer sans magasinDestinationId

---

## 📱 Exemple d'intégration Flutter/React Native

```javascript
// api-service.js
class StockAPI {
  async reception(magasinId, produit, quantite) {
    try {
      // Créer/mettre à jour le produit
      const prod = await API_CONFIG.post('PRODUITS', {
        reference: produit.reference,
        designation: produit.designation,
        typeProduitId: produit.typeProduitId,
        rayonId: produit.rayonId,
        quantiteEntree: quantite,
        prixUnitaire: produit.prixUnitaire
      }, { magasinId });

      // Enregistrer le mouvement
      const movement = await API_CONFIG.post('STOCK_MOVEMENTS', {
        produitId: prod._id,
        type: 'RECEPTION',
        quantite,
        numeroDocument: generateInvoiceNumber(),
        dateDocument: new Date()
      }, { magasinId });

      return movement;
    } catch (error) {
      console.error('Erreur réception:', error);
      throw error;
    }
  }

  async sortie(magasinId, produitId, quantite, raison) {
    const movement = await API_CONFIG.post('STOCK_MOVEMENTS', {
      produitId,
      type: 'SORTIE',
      quantite,
      observations: raison,
      dateDocument: new Date()
    }, { magasinId });

    return movement;
  }
}

export default new StockAPI();
```

---

## 🔄 Authentification (obtenir le token)

```javascript
// Sur la page login
const response = await fetch('https://backend-gestion-de-stock.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: userEmail,
    password: userPassword
  })
});

const data = await response.json();
localStorage.setItem('token', data.token); // Garder le token pour les requêtes suivantes
```

---

## 📝 Notes importantes

1. **Transactions atomiques**: Chaque création de produit crée automatiquement un mouvement RECEPTION
2. **Soft Delete**: Les produits ne sont jamais vraiment supprimés (status = 0)
3. **Audit**: Tous les mouvements sont enregistrés avec userId et timestamp
4. **RBAC**: Admin voit tous les magasins, Gestionnaire voit le sien seulement
5. **Validation**: Le système vérifie automatiquement que le rayon accepte le type produit

---

**Version API:** 1.0  
**Dernière mise à jour:** 2025-12-22  
**Support:** contact@backend-gestion-de-stock.onrender.com
