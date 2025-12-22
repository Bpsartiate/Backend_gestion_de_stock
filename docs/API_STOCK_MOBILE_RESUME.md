# 📱 PRÉPARATION API STOCK POUR MOBILE - RÉSUMÉ

**Date:** 22 Décembre 2025  
**Status:** ✅ COMPLÈTE

---

## 🎯 Ce qui a été préparé

### 1️⃣ **Modèles Mongoose créés**

#### **Produit** (`models/produit.js`)
```javascript
{
  magasinId,          // Référence au magasin
  reference,          // Unique par magasin
  designation,
  typeProduitId,      // Type (VÊTEMENTS, PHARMACIE, etc.)
  rayonId,            // Rayon de stockage
  
  quantiteActuelle,   // Stock actuel
  quantiteEntree,     // Total reçu
  quantiteSortie,     // Total sorti
  
  prixUnitaire,
  prixTotal,          // Auto-calculé
  
  champsDynamiques,   // {couleur: "Rouge", dosage: "500mg"}
  etat,               // Neuf/Bon état/Usagé/Endommagé
  dateEntree,
  dateExpiration,
  
  seuilAlerte,        // Alert si quantité < seuil
  photoUrl,           // Stockée sur Cloudinary
  notes,
  
  status              // 1=Actif, 0=Supprimé (soft delete)
}
```

#### **StockMovement** (`models/stockMovement.js`)
```javascript
{
  magasinId,
  produitId,
  
  type,               // RECEPTION, SORTIE, TRANSFERT, RETOUR, INVENTAIRE, PERTE
  quantite,
  
  magasinDestinationId,  // Pour TRANSFERT
  numeroDocument,        // Facture, bon, etc.
  fournisseur,           // Pour RECEPTION
  
  utilisateurId,      // Qui a fait le mouvement
  prixUnitaire,       // Prix au moment du mouvement
  
  observations,
  statut,             // BROUILLON, VALIDÉ, ANNULÉ
  
  dateDocument,
  createdAt
}
```

---

### 2️⃣ **Routes API créées** (`routes/protected.js`)

#### **PRODUITS:**

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/protected/magasins/:magasinId/produits` | Lister tous les produits du magasin |
| POST | `/api/protected/magasins/:magasinId/produits` | Créer un nouveau produit (avec réception initiale) |
| PUT | `/api/protected/produits/:produitId` | Modifier un produit |
| DELETE | `/api/protected/produits/:produitId` | Supprimer un produit (soft delete) |

#### **MOUVEMENTS:**

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/protected/magasins/:magasinId/stock-movements` | Créer un mouvement (réception/sortie/transfert) |
| GET | `/api/protected/magasins/:magasinId/stock-movements` | Lister les mouvements du magasin (avec pagination) |
| GET | `/api/protected/produits/:produitId/mouvements` | Historique complet d'un produit |

---

### 3️⃣ **Fonctionnalités intégrées**

✅ **RBAC Automatique:**
- Admin → Voit TOUS les magasins et produits
- Gestionnaire → Voit seulement son magasin
- Vendeur → Accès bloqué (blockVendeur middleware)

✅ **Validation Automatique:**
- Unicité reference par magasin
- Stock suffisant avant SORTIE/TRANSFERT
- Rayon accepte le type produit
- magasinDestinationId requis pour TRANSFERT

✅ **Mise à jour de stock automatique:**
```
RECEPTION  → quantiteActuelle += quantite
SORTIE     → quantiteActuelle -= quantite
TRANSFERT  → Crée automatiquement RECEPTION au destination
RETOUR     → quantiteActuelle += quantite
```

✅ **Audit Trail:**
- Tous les mouvements enregistrés
- Utilisateur ID et timestamp
- Activity logging

✅ **Historique:**
- Chaque produit a l'historique complet de ses mouvements
- Traçabilité numéro document
- Prix à chaque mouvement

---

### 4️⃣ **Configuration API centralisée**

**Fichier:** `assets/js/api-config.js`

Nouveaux endpoints ajoutés:
```javascript
ENDPOINTS: {
  PRODUITS: '/api/protected/magasins/:magasinId/produits',
  PRODUIT: '/api/protected/produits/:produitId',
  PRODUIT_MOUVEMENTS: '/api/protected/produits/:produitId/mouvements',
  STOCK_MOVEMENTS: '/api/protected/magasins/:magasinId/stock-movements'
}
```

---

### 5️⃣ **Documentation complète**

**Fichier:** `docs/API_STOCK_MOBILE.md`

Contient:
- Guide complet d'utilisation pour mobile
- Exemples JSON pour chaque endpoint
- Cas d'usage réels (réception, sortie, transfert)
- Code Flutter/React Native d'intégration
- Gestion d'erreurs
- Bonnes pratiques
- Codes HTTP

---

## 🚀 Flux complet MOBILE

### **Réception de marchandise:**
```
1. Mobile scanne le code-barres
2. Cherche le produit: GET /produits?reference=...
3. Si n'existe pas → POST /produits (create avec quantiteEntree)
4. Si existe → PUT /produits/:id (update prix/info)
5. Enregistre mouvement: POST /stock-movements (type: RECEPTION)
6. Stock automatiquement +50, quantiteEntree +50
```

### **Enregistrement d'une vente:**
```
1. Mobile scanne produit
2. Vérifie stock: GET /produits/:id
3. Si stock < quantité → Erreur
4. Enregistre sortie: POST /stock-movements (type: SORTIE)
5. Stock automatiquement -quantité, quantiteSortie +quantité
6. Affiche nouveau stock
```

### **Transfert magasin A → magasin B:**
```
1. POST /stock-movements (type: TRANSFERT, magasinDestinationId)
2. Crée automatiquement:
   - SORTIE dans magasin A
   - RECEPTION dans magasin B
3. Les deux stocks mis à jour correctement
```

---

## 📊 Structure de données pour MOBILE

### **Affichage liste produits:**
```json
{
  "produits": [
    {
      "id": "507f1f77bcf86cd799439014",
      "reference": "PROD-001",
      "designation": "T-Shirt Bleu",
      "rayon": "R001 - Rayon 1",
      "quantite": 50,
      "prix": 5000,
      "etat": "Neuf",
      "alerteStock": false  // true si < seuilAlerte
    }
  ]
}
```

### **Affichage détail produit:**
```json
{
  "produit": {
    "id": "507f1f77bcf86cd799439014",
    "reference": "PROD-001",
    "designation": "T-Shirt Bleu",
    "typeProduit": "Vêtements",
    "rayon": "Rayon 1",
    "quantiteActuelle": 50,
    "quantiteEntree": 100,
    "quantiteSortie": 50,
    "prixUnitaire": 5000,
    "dateEntree": "2025-12-22T10:00:00Z",
    "seuilAlerte": 10,
    "champsDynamiques": {
      "couleur": "Bleu",
      "taille": "M"
    },
    "historique": [
      {
        "date": "2025-12-22T14:00:00Z",
        "type": "SORTIE",
        "quantite": 10,
        "user": "Jean Dupont"
      }
    ]
  }
}
```

---

## 🔐 Sécurité

✅ **Bearer Token JWT:** Tous les endpoints protégés  
✅ **RBAC:** Admin/Gestionnaire/Vendeur  
✅ **Validation données:** Types, quantités, références  
✅ **Soft Delete:** Produits jamais définitivement supprimés  
✅ **Audit Trail:** Toutes les actions enregistrées  
✅ **Isolation magasin:** Données séparées par magasin  

---

## ⚡ Performance

✅ **Indexes Mongoose:**
- `{ magasinId, reference }` pour produits
- `{ magasinId, produitId }` pour mouvements
- `{ dateDocument: -1 }` pour tri chronologique

✅ **Pagination:** Limit/skip sur mouvements  
✅ **Lean queries:** Récupération optimisée MongoDB  
✅ **Populate**: Données complètes en un appel  

---

## 🎯 Tests recommandés

### Avec Postman:
1. ✅ Créer un produit (POST /produits)
2. ✅ Lister les produits (GET /produits)
3. ✅ Enregistrer réception (POST /stock-movements RECEPTION)
4. ✅ Enregistrer sortie (POST /stock-movements SORTIE)
5. ✅ Vérifier stock mis à jour
6. ✅ Consulter historique (GET /mouvements)
7. ✅ Tester RBAC (Gestionnaire ne voit que son magasin)

---

## 📱 Points d'intégration MOBILE

**Pour React Native / Flutter:**

```javascript
// Réception simple
async function receptionProduit(magasinId, produitData) {
  const produit = await API_CONFIG.post('PRODUITS', produitData, { magasinId });
  const movement = await API_CONFIG.post('STOCK_MOVEMENTS', {
    produitId: produit._id,
    type: 'RECEPTION',
    quantite: produitData.quantiteEntree,
    dateDocument: new Date()
  }, { magasinId });
  return movement;
}

// Sortie simple
async function sortieStock(magasinId, produitId, quantite) {
  const movement = await API_CONFIG.post('STOCK_MOVEMENTS', {
    produitId,
    type: 'SORTIE',
    quantite,
    dateDocument: new Date()
  }, { magasinId });
  return movement;
}
```

---

## ✅ Checklist pré-test

- [x] Modèles Mongoose créés et indexés
- [x] Routes API implémentées avec RBAC
- [x] Validation de données complète
- [x] Mise à jour stock automatique
- [x] Audit trail en place
- [x] API-config.js mis à jour
- [x] Documentation API complète
- [x] Exemples code mobile fournis

---

**Prochaines étapes:**

1. Test des endpoints avec Postman
2. Intégration dans l'app web (add_prod.php)
3. Intégration dans l'app mobile
4. Tests RBAC
5. Déploiement Render

---

**Status:** 🚀 Prêt à tester!
