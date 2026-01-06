# 📱 Endpoint Produit Enrichi - Pattern "INCLUDE"

## Vue d'ensemble

L'endpoint `GET /api/protected/produits/:id` utilise un **pattern "INCLUDE"** pour permettre aux clients (web, mobile, desktop) de demander exactement les données dont ils ont besoin.

### Avantages :
✅ **Flexible** - Le client choisit ce qu'il veut  
✅ **Optimisé** - Pas de données inutiles transmises  
✅ **Mobile-friendly** - Parfait pour les connexions lentes  
✅ **Scalable** - Facile d'ajouter de nouveaux includes  

---

## 🔗 Requêtes

### 1️⃣ Requête SIMPLE (Données basiques)
```bash
GET /api/protected/produits/507f1f77bcf86cd799439011
```

**Réponse :** ~1-2 KB
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "designation": "Produit A",
    "reference": "REF001",
    "quantiteActuelle": 50,
    "seuilAlerte": 10,
    "prixUnitaire": 15.50,
    "etat": "Neuf",
    "rayonId": {
      "_id": "...",
      "nomRayon": "Rayon 1",
      "codeRayon": "RAY001"
    },
    "typeProduitId": {
      "nomType": "Électronique",
      "unitePrincipale": "unité",
      "capaciteMax": 200
    },
    "stockStats": {
      "quantiteActuelle": 50,
      "seuilAlerte": 10,
      "valeurEnStock": 775,
      "tauxOccupation": 25
    },
    "statusLabel": "En stock",
    "statusColor": "success"
  },
  "included": []
}
```

---

### 2️⃣ Requête MOUVEMENTS (Histoire du produit)
```bash
GET /api/protected/produits/507f1f77bcf86cd799439011?include=mouvements
```

**Ajoute :** Dernier 50 mouvements de stock
```json
{
  "data": {
    "...": "données basiques",
    "mouvements": [
      {
        "date": "2026-01-06T12:35:50Z",
        "type": "entree",
        "quantite": 20,
        "details": "Réception fournisseur",
        "rayon": "Rayon 1"
      },
      {
        "date": "2026-01-05T08:15:00Z",
        "type": "sortie",
        "quantite": 5,
        "details": "Vente",
        "rayon": "Rayon 1"
      }
    ]
  },
  "included": ["mouvements"]
}
```

---

### 3️⃣ Requête RÉCEPTIONS (Historique entrées)
```bash
GET /api/protected/produits/507f1f77bcf86cd799439011?include=receptions
```

**Ajoute :** Dernières 20 réceptions
```json
{
  "data": {
    "...": "données basiques",
    "receptions": [
      {
        "_id": "...",
        "dateReception": "2026-01-06T12:22:11Z",
        "quantite": 50,
        "fournisseur": "Fournisseur XYZ",
        "prixAchat": 10.00,
        "prixTotal": 500.00,
        "photoUrl": "https://...",
        "dateFabrication": "2025-12-01T00:00:00Z",
        "datePeremption": "2026-06-01T00:00:00Z",
        "lotNumber": "LOT123",
        "statut": "stocke",
        "utilisateurId": {
          "prenom": "Hank",
          "nom": "Akim",
          "email": "hank@example.com"
        },
        "rayonId": {
          "nomRayon": "Rayon 1",
          "codeRayon": "RAY001"
        },
        "createdAt": "2026-01-06T12:22:11Z",
        "updatedAt": "2026-01-06T12:35:50Z"
      }
    ]
  },
  "included": ["receptions"]
}
```

---

### 4️⃣ Requête ALERTES (État du stock)
```bash
GET /api/protected/produits/507f1f77bcf86cd799439011?include=alertes
```

**Ajoute :** Alertes en temps réel
```json
{
  "data": {
    "...": "données basiques",
    "alertes": {
      "stockBas": false,
      "rupture": false,
      "peremption": false,
      "niveau": "ok"
    }
  },
  "included": ["alertes"]
}
```

---

### 5️⃣ Requête ENREGISTREMENT (Audit trail)
```bash
GET /api/protected/produits/507f1f77bcf86cd799439011?include=enregistrement
```

**Ajoute :** Informations d'audit
```json
{
  "data": {
    "...": "données basiques",
    "audit": {
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2026-01-06T12:35:50Z",
      "createdBy": {
        "_id": "...",
        "prenom": "Admin",
        "nom": "User",
        "email": "admin@example.com"
      },
      "version": 5
    }
  },
  "included": ["enregistrement"]
}
```

---

### 6️⃣ Requête COMPLÈTE (Tout)
```bash
GET /api/protected/produits/507f1f77bcf86cd799439011?include=mouvements,receptions,alertes,ventes,enregistrement
```

**Retourne :** Objet produit avec TOUS les includes
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "designation": "Produit A",
    "reference": "REF001",
    
    // Données basiques toujours présentes
    "stockStats": { ... },
    "statusLabel": "En stock",
    
    // Données optionnelles selon ?include=
    "mouvements": [ ... ],
    "receptions": [ ... ],
    "alertes": { ... },
    "ventes": [ ],
    "audit": { ... }
  },
  "included": [
    "mouvements",
    "receptions",
    "alertes",
    "ventes",
    "enregistrement"
  ]
}
```

---

## 🎯 Cas d'usage typiques

### 📱 Mobile - Écran Liste
```bash
# Requête légère pour afficher une liste
GET /api/protected/produits/507f1f77bcf86cd799439011
# Retourne: nom, référence, quantité, prix, état (~ 1-2 KB)
```

### 📱 Mobile - Écran Détail Produit
```bash
# Requête pour afficher le détail complet
GET /api/protected/produits/507f1f77bcf86cd799439011?include=receptions,alertes,enregistrement
# Retourne: tout sauf mouvements/ventes (~ 5-10 KB)
```

### 🖥️ Web - Historique Complet
```bash
# Requête pour tableau de bord complet
GET /api/protected/produits/507f1f77bcf86cd799439011?include=mouvements,receptions,alertes,enregistrement
# Retourne: données complètes (~ 20-50 KB)
```

---

## 🔄 Includes disponibles

| Include | Description | Limite | Taille |
|---------|-------------|--------|--------|
| `mouvements` | Derniers mouvements de stock | 50 derniers | +2-5 KB |
| `receptions` | Historique des réceptions | 20 dernières | +5-10 KB |
| `alertes` | Alertes en temps réel | - | +0.5 KB |
| `ventes` | Historique des ventes | - | À venir |
| `enregistrement` | Audit trail (créé/modifié) | - | +1 KB |

---

## 📊 Réponse Structure

### Avec `success: true`
```json
{
  "success": true,
  "data": { ... },
  "included": ["mouvements", "receptions"]
}
```

### Avec `success: false`
```json
{
  "success": false,
  "error": "Produit non trouvé"
}
```

---

## 🛡️ Sécurité

- ✅ **Authentification requise** : Tous les requêtes doivent avoir un Bearer token
- ✅ **Contrôle d'accès** : L'utilisateur ne peut voir que les produits du magasin auquel il a accès
- ✅ **Validation** : Les includes invalides sont ignorés silencieusement

---

## 💡 Bonnes pratiques

### ✅ À faire
```bash
# Demander uniquement les données nécessaires
GET /api/protected/produits/:id?include=receptions,alertes

# Combiner avec pagination côté client
GET /api/protected/produits/:id?include=mouvements&limit=10
```

### ❌ À éviter
```bash
# Pas besoin - données basiques seront toujours retournées
GET /api/protected/produits/:id?include=

# Les typos dans includes sont ignorées (pas d'erreur)
GET /api/protected/produits/:id?include=movementsss
# → Seront ignorés, retour des données basiques seulement
```

---

## 🔧 Exemple d'utilisation (JavaScript)

### Liste simple (Mobile)
```javascript
// Requête légère pour une liste
const produits = await fetch(
  `/api/protected/produits/${id}`,
  { headers: { Authorization: `Bearer ${token}` } }
).then(r => r.json());

console.log(produits.data.designation); // "Produit A"
console.log(produits.data.quantiteActuelle); // 50
```

### Détail complet (Mobile Detail Screen)
```javascript
// Requête pour écran de détail
const response = await fetch(
  `/api/protected/produits/${id}?include=receptions,alertes,enregistrement`,
  { headers: { Authorization: `Bearer ${token}` } }
).then(r => r.json());

const produit = response.data;
console.log(produit.receptions); // Array des réceptions
console.log(produit.alertes.niveau); // "ok", "warning", "critique"
console.log(produit.audit.createdBy.prenom); // "Admin"
```

### Historique complet (Web Dashboard)
```javascript
// Requête pour tableau de bord
const response = await fetch(
  `/api/protected/produits/${id}?include=mouvements,receptions,alertes,enregistrement`,
  { headers: { Authorization: `Bearer ${token}` } }
).then(r => r.json());

const { mouvements, receptions, alertes, audit } = response.data;
// Afficher tous les détails
```

---

## 📝 Notes

- Les includes sont **optionnels** et **indépendants**
- Vous pouvez combiner autant d'includes que vous voulez
- Les données basiques (nom, référence, quantité, etc.) sont **toujours** retournées
- Les alertes sont **calculées en temps réel** (pas stockées en base)
