# API des Ventes - Données Complètement Populées 🎯

## ⚡ Changement Important
Tous les endpoints des ventes retournent maintenant des données **complètement populées** pour faciliter le développement mobile. Plus besoin de faire de requêtes supplémentaires !

**🪟 NOUVEAU**: Les ventes incluent maintenant les informations du **guichet** du magasin!

---

## 📋 Endpoints Disponibles

### 1. **POST /api/protected/ventes**
**Créer une nouvelle vente**

**Request:**
```json
{
    "magasinId": "693bf84f9955cef110cae98b",
    "guichetId": "691234abcd1234567890guic1",
    "articles": [
        {
            "produitId": "695e09e7eede7b16ce748814",
            "rayonId": "691234abcd1234567890abcd",
            "quantite": 5,
            "prixUnitaire": 15.50,
            "observations": "Client spécial"
        }
    ],
    "client": "Jean Dupont",
    "modePaiement": "CASH",
    "tauxFC": 2650
}
```

**Response (201):**
```json
{
    "success": true,
    "message": "✅ Vente enregistrée avec succès",
    "vente": {
        "_id": "695f87c7e7a3841b24878a8c",
        "dateVente": "2026-01-08T11:38:00.000Z",
        "magasinId": {
            "_id": "693bf84f9955cef110cae98b",
            "nom_magasin": "Zongo marketing",
            "nom": "Zongo",
            "adresse": "kitkuku",
            "telephone": "09991898723",
            "photoUrl": "https://res.cloudinary.com/...",
            "latitude": 1.9536,
            "longitude": 29.8739,
            "businessId": {
                "_id": "691234abcd1234567890abcd",
                "nom_entreprise": "Tech Solutions SARL"
            }
        },
        "utilisateurId": {
            "_id": "691eebe005d8333cd988f743",
            "nom": "Akim",
            "prenom": "Hank",
            "email": "zozo@gmail.com",
            "role": "admin",
            "photoUrl": "https://res.cloudinary.com/.../profiles/xihb6q2ox6arb1hbel6o.png",
            "telephone": "243812123123"
        },
        "guichetId": {
            "_id": "691234abcd1234567890guic1",
            "nom_guichet": "Guichet Principal",
            "code": "GUK-001",
            "vendeurPrincipal": {
                "_id": "691234abcd1234567890vend1",
                "nom": "Dupont",
                "prenom": "Marie"
            }
        },
        "articles": [
            {
                "produitId": {
                    "_id": "695e09e7eede7b16ce748814",
                    "designation": "Poulet frais 2kg",
                    "photoUrl": "https://res.cloudinary.com/.../products/poulet.jpg",
                    "prixUnitaire": 15.50,
                    "quantiteActuelle": 45,
                    "seuilAlerte": 10,
                    "typeProduitId": {
                        "_id": "691234abcd1234567890abcd",
                        "nomType": "Viande",
                        "icone": "🍞",
                        "unitePrincipale": "kg",
                        "capaciteMax": 100
                    }
                },
                "rayonId": {
                    "_id": "691234abcd1234567890abcd",
                    "nomRayon": "Rayon Froid"
                },
                "nomProduit": "Poulet frais 2kg",
                "quantite": 5,
                "prixUnitaire": 15.50,
                "montantUSD": 77.50,
                "observations": "Client spécial"
            }
        ],
        "client": "Jean Dupont",
        "modePaiement": "CASH",
        "montantTotalUSD": 77.50,
        "tauxFC": 2650,
        "montantTotalFC": 205425,
        "statut": "VALIDÉE",
        "createdAt": "2026-01-08T11:38:00.000Z",
        "updatedAt": "2026-01-08T11:38:00.000Z"
    }
}
```

---

### 2. **GET /api/protected/ventes**
**Lister les ventes (avec filtres)**

**Query Parameters:**
- `magasinId` (optionnel): Filtrer par magasin
- `statut` (optionnel): VALIDÉE, ANNULÉE, REMBOURSÉE
- `page` (défaut: 1): Numéro de page
- `limit` (défaut: 20): Nombre de ventes par page

**Response:**
```json
{
    "ventes": [
        {
            "_id": "695f87c7e7a3841b24878a8c",
            "dateVente": "2026-01-08T11:38:00.000Z",
            "magasinId": { /* POPULÉ */ },
            "utilisateurId": { /* POPULÉ */ },
            "articles": [ /* TOUS POPULÉS */ ],
            "client": "Jean Dupont",
            "modePaiement": "CASH",
            "montantTotalUSD": 77.50,
            "tauxFC": 2650,
            "montantTotalFC": 205425,
            "statut": "VALIDÉE"
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 42,
        "pages": 3
    }
}
```

---

### 3. **GET /api/protected/ventes/:venteId**
**Détails complets d'une vente (DONNÉES ENTIÈREMENT POPULÉES)**

**Response:**
```json
{
    "_id": "695f87c7e7a3841b24878a8c",
    "dateVente": "2026-01-08T11:38:00.000Z",
    "magasinId": {
        "_id": "693bf84f9955cef110cae98b",
        "nom_magasin": "Zongo marketing",
        "nom": "Zongo",
        "adresse": "kitkuku",
        "telephone": "09991898723",
        "photoUrl": "https://res.cloudinary.com/...",
        "latitude": 1.9536,
        "longitude": 29.8739,
        "businessId": {
            "_id": "691234abcd1234567890abcd",
            "nom_entreprise": "Tech Solutions SARL",
            "email": "info@techsolutions.cd"
        }
    },
    "utilisateurId": {
        "_id": "691eebe005d8333cd988f743",
        "nom": "Akim",
        "prenom": "Hank",
        "email": "zozo@gmail.com",
        "role": "admin",
        "photoUrl": "https://res.cloudinary.com/.../profiles/xihb6q2ox6arb1hbel6o.png",
        "telephone": "243812123123"
    },
    "articles": [
        {
            "_id": "691234567890abcdef123456",
            "produitId": {
                "_id": "695e09e7eede7b16ce748814",
                "designation": "Poulet frais 2kg",
                "photoUrl": "https://res.cloudinary.com/.../products/poulet.jpg",
                "prixUnitaire": 15.50,
                "quantiteActuelle": 45,
                "seuilAlerte": 10,
                "typeProduitId": {
                    "_id": "691234abcd1234567890abcd",
                    "nomType": "Viande",
                    "icone": "🍞",
                    "unitePrincipale": "kg",
                    "capaciteMax": 100
                }
            },
            "rayonId": {
                "_id": "691234abcd1234567890abcd",
                "nomRayon": "Rayon Froid"
            },
            "nomProduit": "Poulet frais 2kg",
            "quantite": 5,
            "prixUnitaire": 15.50,
            "montantUSD": 77.50,
            "observations": "Client spécial"
        }
    ],
    "client": "Jean Dupont",
    "modePaiement": "CASH",
    "montantTotalUSD": 77.50,
    "tauxFC": 2650,
    "montantTotalFC": 205425,
    "statut": "VALIDÉE",
    "createdAt": "2026-01-08T11:38:00.000Z",
    "updatedAt": "2026-01-08T11:38:00.000Z"
}
```

---

### 4. **GET /api/protected/magasins/:magasinId/ventes**
**Ventes d'un magasin spécifique (POPULÉES)**

**Query Parameters:**
- `statut` (défaut: VALIDÉE): Filtrer par statut
- `jour` (optionnel): true = ventes du jour uniquement

**Response:**
```json
{
    "ventes": [ /* Même structure que GET /ventes */ ]
}
```

---

### 5. **PUT /api/protected/ventes/:venteId**
**Modifier une vente (retour POPULÉ)**

**Request:**
```json
{
    "client": "Nouveau client",
    "modePaiement": "CARD",
    "observations": "Modifié"
}
```

**Response:**
```json
{
    "success": true,
    "message": "✅ Vente mise à jour",
    "vente": { /* ENTIÈREMENT POPULÉE */ }
}
```

---

### 6. **DELETE /api/protected/ventes/:venteId**
**Annuler une vente (retour POPULÉ)**

**Request:**
```json
{
    "motif": "Erreur client"
}
```

**Response:**
```json
{
    "success": true,
    "message": "✅ Vente annulée",
    "vente": { /* ENTIÈREMENT POPULÉE */ }
}
```

---

## 📦 Structure Complète des Données Populées

### **Magasin (magasinId)**
```json
{
    "_id": "693bf84f9955cef110cae98b",
    "nom_magasin": "Zongo marketing",
    "nom": "Zongo",
    "adresse": "kitkuku",
    "telephone": "09991898723",
    "photoUrl": "https://res.cloudinary.com/...",
    "latitude": 1.9536,
    "longitude": 29.8739,
    "businessId": {
        "_id": "691234abcd1234567890abcd",
        "nom_entreprise": "Tech Solutions SARL"
    }
}
```

### **Utilisateur (utilisateurId)**
```json
{
    "_id": "691eebe005d8333cd988f743",
    "nom": "Akim",
    "prenom": "Hank",
    "email": "zozo@gmail.com",
    "role": "admin",
    "photoUrl": "https://res.cloudinary.com/.../profiles/xihb6q2ox6arb1hbel6o.png",
    "telephone": "243812123123"
}
```

### **Produit (articles[].produitId)**
```json
{
    "_id": "695e09e7eede7b16ce748814",
    "designation": "Poulet frais 2kg",
    "photoUrl": "https://res.cloudinary.com/.../products/poulet.jpg",
    "prixUnitaire": 15.50,
    "quantiteActuelle": 45,
    "seuilAlerte": 10,
    "typeProduitId": {
        "_id": "691234abcd1234567890abcd",
        "nomType": "Viande",
        "icone": "🍞",
        "unitePrincipale": "kg",
        "capaciteMax": 100
    }
}
```

### **Guichet (guichetId)**
```json
{
    "_id": "691234abcd1234567890guic1",
    "nom_guichet": "Guichet Principal",
    "code": "GUK-001",
    "vendeurPrincipal": {
        "_id": "691234abcd1234567890vend1",
        "nom": "Dupont",
        "prenom": "Marie"
    }
}
```
```json
{
    "_id": "691234abcd1234567890abcd",
    "nomRayon": "Rayon Froid"
}
```

---

## 🎯 Avantages pour le Dev Mobile

✅ **Pas besoin de requêtes supplémentaires** - Toutes les données sont là  
✅ **Photos des produits directement incluses** - `produitId.photoUrl`  
✅ **Type de produit avec icône** - `produitId.typeProduitId.nomType`, `.icone`  
✅ **Infos complet utilisateur** - Nom, email, role, photo  
✅ **Infos complet du guichet** - 🪟 Nom, code, vendeur principal  
✅ **Coordonnées magasin** - Latitude, longitude, adresse, téléphone  
✅ **Unit de mesure du produit** - `produitId.typeProduitId.unitePrincipale` (kg, L, etc.)  

---

## 💡 Exemples d'Utilisation

### Afficher le panier avec photos et type
```javascript
vente.articles.forEach(article => {
    const produit = article.produitId;  // Déjà populé!
    console.log(`${produit.designation} (${produit.typeProduitId.nomType})`);
    console.log(`Photo: ${produit.photoUrl}`);
    console.log(`Unité: ${produit.typeProduitId.unitePrincipale}`);
});
```

### Afficher le vendeur et le magasin + guichet
```javascript
const vendeur = vente.utilisateurId;
const magasin = vente.magasinId;
const guichet = vente.guichetId;

console.log(`Vendeur: ${vendeur.prenom} ${vendeur.nom}`);
console.log(`Magasin: ${magasin.nom_magasin}`);
console.log(`Guichet: ${guichet.nom_guichet} (${guichet.code})`);
console.log(`Vendeur principal du guichet: ${guichet.vendeurPrincipal?.nom}`);
console.log(`Photo vendeur: ${vendeur.photoUrl}`);
```

### Récapitulatif complet
```javascript
{
    "vente_id": vente._id,
    "date": vente.dateVente,
    "vendeur": `${vente.utilisateurId.prenom} ${vente.utilisateurId.nom}`,
    "magasin": vente.magasinId.nom_magasin,
    "guichet": {
        "nom": vente.guichetId?.nom_guichet,
        "code": vente.guichetId?.code,
        "vendeur_principal": `${vente.guichetId?.vendeurPrincipal?.prenom} ${vente.guichetId?.vendeurPrincipal?.nom}`
    },
    "montant": vente.montantTotalUSD,
    "articles": vente.articles.map(art => ({
        "nom": art.produitId.designation,
        "photo": art.produitId.photoUrl,
        "type": art.produitId.typeProduitId.nomType,
        "rayon": art.rayonId.nomRayon,
        "quantite": art.quantite,
        "prix_unitaire": art.prixUnitaire
    }))
}
```

---

## ⚠️ Notes Importantes

1. **Authentification requise** - Tous les endpoints utilisent `authMiddleware`
2. **Header obligatoire**: `Authorization: Bearer <token>`
3. **Les photos peuvent être manquantes** - Vérifiez `photoUrl` avant d'afficher
4. **Les données sont immuables** - Les modifications doivent passer par les endpoints PUT/DELETE
5. **Pagination** - Par défaut 20 ventes par page, max 100

---

## 🔄 Migration depuis l'ancienne API

**AVANT** (3 requêtes):
```javascript
// 1. GET /ventes/:id
// 2. GET /produits/:id (pour chaque article)
// 3. GET /utilisateurs/:id
```

**MAINTENANT** (1 seule requête):
```javascript
// GET /ventes/:id → Tout est populé!
```

---

📅 **Dernière mise à jour**: 8 janvier 2026  
📱 **Optimisé pour**: Développement mobile (iOS/Android)  
⚡ **Performance**: Réduction de 70% des requêtes API!
