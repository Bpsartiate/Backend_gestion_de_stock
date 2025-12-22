# 🧪 POSTMAN TEST GUIDE - STOCK MANAGEMENT APIs

**Version:** 2.0 Complète  
**Date:** 22 Décembre 2025  
**Base URL:** `https://backend-gestion-de-stock.onrender.com`

---

## 📋 TABLE DES MATIÈRES

1. [Setup Postman](#-setup-postman)
2. [Configuration des headers](#-configuration-des-headers)
3. [Test des APIs](#-test-des-apis)
4. [Scénarios de test complets](#-scénarios-de-test-complets)

---

## 🔧 Setup Postman

### 1. Import de la collection

**Créer une nouvelle collection:** `Stock Management API`

### 2. Variables d'environnement

Créer un nouvel environnement `Stock-Dev`

```json
{
  "base_url": "https://backend-gestion-de-stock.onrender.com",
  "api_path": "/api/protected",
  "token": "votre_jwt_token_ici",
  "magasin_id": "id_du_magasin",
  "produit_id": "id_du_produit",
  "lot_id": "id_du_lot",
  "rapport_id": "id_du_rapport_inventaire",
  "alerte_id": "id_de_lalerte"
}
```

### 3. Pre-request Script global

Ajouter ce script à la collection:

```javascript
// Récupérer le token du localStorage (depuis une vraie requête login)
// ou hardcoder temporairement pour les tests

if (!pm.environment.get("token")) {
  console.log("⚠️ Token non défini. Veuillez vous authentifier d'abord.");
}

// Fonction d'aide pour générer des IDs MongoDB valides
// const objectId = require('crypto').randomBytes(12).toString('hex');
```

---

## 📤 Configuration des Headers

Pour **chaque requête**, ajouter les headers:

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Dans Postman:**
```
Key: Authorization
Value: Bearer {{token}}

Key: Content-Type
Value: application/json
```

---

## 🧪 Test des APIs

### 🏪 MAGASINS

#### 1. Lister les magasins

```http
GET {{base_url}}/api/protected/magasins
```

**Response attendue:**
```json
[
  {
    "_id": "507f...",
    "nom_magasin": "Magasin Principal",
    "adresse_magasin": "123 Rue de la Paix",
    "telephone_magasin": "020123456",
    "status": 1
  }
]
```

**Sauvegarde l'ID du magasin dans `{{magasin_id}}`**

---

### 📦 PRODUITS

#### 2. Créer un produit

```http
POST {{base_url}}/api/protected/magasins/{{magasin_id}}/produits

Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (JSON):
{
  "reference": "PROD-TEST-001",
  "designation": "T-Shirt Bleu Test",
  "typeProduitId": "507f...",
  "rayonId": "507f...",
  "prixUnitaire": 500,
  "quantiteEntree": 100,
  "quantiteActuelle": 100,
  "seuilAlerte": 10,
  "etat": "nouveau",
  "champsDynamiques": {
    "couleur": "bleu",
    "taille": "M"
  }
}
```

**Response:**
```json
{
  "_id": "507f...",
  "reference": "PROD-TEST-001",
  "designation": "T-Shirt Bleu Test",
  "quantiteActuelle": 100,
  "createdAt": "2025-12-22T..."
}
```

**Sauvegarde l'ID dans `{{produit_id}}`**

---

#### 3. Lister les produits

```http
GET {{base_url}}/api/protected/magasins/{{magasin_id}}/produits
```

**Devrait retourner le produit créé**

---

#### 4. Récupérer les mouvements d'un produit

```http
GET {{base_url}}/api/protected/produits/{{produit_id}}/mouvements
```

---

#### 5. Modifier un produit

```http
PUT {{base_url}}/api/protected/produits/{{produit_id}}

Body:
{
  "prixUnitaire": 600,
  "seuilAlerte": 20
}
```

---

### 📤 MOUVEMENTS DE STOCK

#### 6. Créer un mouvement RECEPTION

```http
POST {{base_url}}/api/protected/magasins/{{magasin_id}}/stock-movements

Body:
{
  "produitId": "{{produit_id}}",
  "type": "RECEPTION",
  "quantite": 50,
  "numeroDocument": "FAC-12345",
  "fournisseur": "Fournisseur ABC",
  "observations": "Réception test",
  "prixUnitaire": 500
}
```

**Résultat:**
- Produit.quantiteActuelle augmente de 50 ✅
- Un lot FIFO est créé automatiquement ✅

---

#### 7. Créer un mouvement SORTIE

```http
POST {{base_url}}/api/protected/magasins/{{magasin_id}}/stock-movements

Body:
{
  "produitId": "{{produit_id}}",
  "type": "SORTIE",
  "quantite": 20,
  "numeroDocument": "BON-001",
  "observations": "Vente test"
}
```

**Résultat:**
- Produit.quantiteActuelle diminue de 20 ✅
- Le lot FIFO le plus ancien est consommé ✅
- Une alerte "STOCK_BAS" est créée si quantité < seuil ✅

---

#### 8. Créer un mouvement TRANSFERT

```http
POST {{base_url}}/api/protected/magasins/{{magasin_id}}/stock-movements

Body:
{
  "produitId": "{{produit_id}}",
  "type": "TRANSFERT",
  "quantite": 30,
  "magasinDestinationId": "{{autre_magasin_id}}",
  "numeroDocument": "TRF-001",
  "observations": "Transfert inter-magasin"
}
```

**Résultat:**
- Magasin source: -30
- Magasin destination: +30
- 2 mouvements créés (opposés)

---

#### 9. Lister les mouvements

```http
GET {{base_url}}/api/protected/magasins/{{magasin_id}}/stock-movements
```

**Filtres optionnels:**
```
?type=SORTIE
?statut=VALIDÉ
```

---

### 📦 LOTS (FIFO)

#### 10. Créer un lot manuellement

```http
POST {{base_url}}/api/protected/magasins/{{magasin_id}}/lots

Body:
{
  "produitId": "{{produit_id}}",
  "numeroBatch": "LOT-2025-001",
  "quantiteEntree": 100,
  "quantiteDisponible": 100,
  "prixUnitaireAchat": 500,
  "dateEntree": "2025-12-22T10:00:00Z",
  "dateExpiration": "2026-12-22T23:59:59Z",
  "numeroDocument": "FAC-001",
  "fournisseur": "Fournisseur Test",
  "rayonId": "{{rayon_id}}"
}
```

**Sauvegarde l'ID dans `{{lot_id}}`**

---

#### 11. Lister les lots (FIFO)

```http
GET {{base_url}}/api/protected/magasins/{{magasin_id}}/lots

Filtres optionnels:
?produitId={{produit_id}}
?statut=ACTIF
```

**Les lots retournés sont triés par dateEntree ASC (ancien d'abord = FIFO) ✅**

---

#### 12. Vérifier le lot créé

Response attendue:
```json
{
  "_id": "507f...",
  "numeroBatch": "LOT-2025-001",
  "quantiteEntree": 100,
  "quantiteDisponible": 100,
  "quantiteVendue": 0,
  "dateEntree": "2025-12-22T10:00:00Z",
  "dateExpiration": "2026-12-22T23:59:59Z",
  "status": "ACTIF",
  "prixTotal": 50000
}
```

---

### 🚨 ALERTES

#### 13. Lister les alertes

```http
GET {{base_url}}/api/protected/magasins/{{magasin_id}}/alertes

Filtres optionnels:
?statut=ACTIVE
?type=STOCK_BAS
?type=RUPTURE_STOCK
```

**Devrait afficher les alertes créées automatiquement**

---

#### 14. Détails d'une alerte

```json
{
  "_id": "507f...",
  "type": "STOCK_BAS",
  "severite": "MOYEN",
  "statut": "ACTIVE",
  "produitId": "507f...",
  "message": "Stock du produit XXX inférieur au seuil",
  "actionRecommandee": "COMMANDER_FOURNISSEUR",
  "dateCreation": "2025-12-22T...",
  "utilisateurId": "507f..."
}
```

---

#### 15. Mettre à jour une alerte

```http
PUT {{base_url}}/api/protected/alertes/{{alerte_id}}

Body:
{
  "statut": "RESOLUE",
  "notes": "Stock réapprovisionné par transfert"
}
```

**Résultat:**
- Alerte passe à RESOLUE ✅
- dateResolution est définie ✅
- Disparaît après 90 jours automatiquement ✅

---

### 📊 RAPPORTS D'INVENTAIRE

#### 16. Créer un rapport d'inventaire

```http
POST {{base_url}}/api/protected/magasins/{{magasin_id}}/inventaires

Body:
{
  "observations": "Inventaire annuel décembre 2025"
}
```

**Response:**
```json
{
  "_id": "507f...",
  "numeroInventaire": "INV-2025-001",
  "statut": "EN_COURS",
  "dateDebut": "2025-12-22T...",
  "ligneProduits": [],
  "resume": {}
}
```

**Sauvegarde l'ID dans `{{rapport_id}}`**

---

#### 17. Ajouter une ligne au rapport

```http
PUT {{base_url}}/api/protected/inventaires/{{rapport_id}}/lignes

Body:
{
  "produitId": "{{produit_id}}",
  "quantitePhysique": 48,
  "rayonId": "{{rayon_id}}",
  "notes": "Bien correspondu"
}
```

**Système calcule:**
- quantiteTheorique (de la BD) = 100
- quantitePhysique = 48
- quantiteDifference = 48 - 100 = -52 ❌ (rupture?)
- percentageEcart = (-52 / 100) * 100 = -52%

**Response:**
```json
{
  "produitId": "507f...",
  "designation": "T-Shirt Bleu Test",
  "quantiteTheorique": 100,
  "quantitePhysique": 48,
  "quantiteDifference": -52,
  "percentageEcart": -52
}
```

---

#### 18. Ajouter plusieurs lignes

Répéter l'étape 17 pour chaque produit:

```http
PUT {{base_url}}/api/protected/inventaires/{{rapport_id}}/lignes

Body pour produit 2:
{
  "produitId": "{{produit_id_2}}",
  "quantitePhysique": 75,
  "notes": "Variation normal"
}
```

---

#### 19. Valider le rapport

```http
PUT {{base_url}}/api/protected/inventaires/{{rapport_id}}/valider
```

**Le système calcule automatiquement:**

```json
{
  "statut": "VALIDEE",
  "resume": {
    "totalProduitsInventories": 2,
    "totalProduitsAvecEcart": 2,
    "pourcentageEcart": 26.5,
    
    "valeurTheorique": 125000,
    "valeurPhysique": 92150,
    "differenceMontant": -32850,
    
    "ecartPositif": 0,
    "ecartNegatif": 52,
    
    "rayonsAffectes": ["R001", "R002"]
  }
}
```

---

#### 20. Lister les rapports

```http
GET {{base_url}}/api/protected/magasins/{{magasin_id}}/inventaires

Filtres optionnels:
?statut=VALIDEE
```

---

## 🎯 Scénarios de test complets

### Scénario 1: Ajout produit simple

```
1. POST /produits → Crée produit + lot auto + réception auto
2. GET /produits → Vérifie quantité = 100
3. GET /lots → Vérifie lot créé
4. GET /stock-movements → Vérifie mouvement RECEPTION
```

---

### Scénario 2: Vente avec FIFO

```
1. POST /stock-movements (RECEPTION) → Crée lot ancien 1 (100 pcs)
2. POST /stock-movements (RECEPTION) → Crée lot ancien 2 (50 pcs)
3. GET /lots → Vérifie lot 1 en premier (FIFO)
4. POST /stock-movements (SORTIE 80 pcs) 
   → Consume lot 1 entièrement (80 - 100)
   → Consume lot 2 partiellement (0 de 50)
5. GET /lots → Vérifie lot 1 = EPUISE, lot 2 = 20 restants
6. GET /alertes → Vérifie alerte STOCK_BAS créée
```

---

### Scénario 3: Inventaire complet

```
1. POST /inventaires → Crée rapport INV-2025-001
2. POST /stock-movements (5 RECEPTIONS différentes)
3. PUT /inventaires/lignes (pour chaque produit)
   → Compte manuellement: ex. 48 au lieu de 50
4. PUT /inventaires/valider
   → Calcule écart de 2 unités
5. GET /inventaires → Vérifie résumé avec écarts
```

---

### Scénario 4: Alertes intelligentes

```
1. POST /produits (seuil = 10)
2. POST /stock-movements (RECEPTION 100)
   → Vérifie quantité = 100, pas d'alerte
3. POST /stock-movements (SORTIE 92)
   → Quantité = 8 < 10
   → Alerte STOCK_BAS créée ✅
4. POST /stock-movements (SORTIE 8)
   → Quantité = 0
   → Alerte RUPTURE_STOCK créée ✅
5. GET /alertes → Vérifie 2 alertes ACTIVE
```

---

### Scénario 5: Transfert inter-magasins

```
1. Magasin A: POST /produits (100 unités)
2. Magasin B: Vérifier stock = 0
3. POST /stock-movements (TRANSFERT 60 vers magasin B)
   → Magasin A: 100 - 60 = 40
   → Magasin B: 0 + 60 = 60
4. GET /magasins/A/produits → Vérifie 40
5. GET /magasins/B/produits → Vérifie 60
```

---

## ✅ Checklist de test

### APIs Fondamentales
- [ ] Lister magasins
- [ ] Créer produit
- [ ] Lister produits
- [ ] Modifier produit
- [ ] Supprimer produit

### Mouvements
- [ ] RECEPTION
- [ ] SORTIE
- [ ] TRANSFERT
- [ ] RETOUR
- [ ] INVENTAIRE
- [ ] PERTE

### FIFO/LOTS
- [ ] Créer lot manuellement
- [ ] Lister lots triés FIFO
- [ ] Vérifier consommation FIFO

### Alertes
- [ ] STOCK_BAS créée
- [ ] STOCK_CRITIQUE créée
- [ ] RUPTURE_STOCK créée
- [ ] PRODUIT_EXPIRE détecté
- [ ] Mettre à jour alerte

### Inventaire
- [ ] Créer rapport
- [ ] Ajouter lignes
- [ ] Calculer écarts
- [ ] Valider rapport

### RBAC
- [ ] Admin voit tous les magasins
- [ ] Gestionnaire voit son magasin
- [ ] Vendeur accès refusé (401)

---

## 🐛 Debugging

### Erreur: 401 Unauthorized
```
→ Token expiré ou invalide
→ Vérifier dans Headers: Authorization: Bearer {{token}}
```

### Erreur: 404 Not Found
```
→ Endpoint incorrect
→ Vérifier le format: /api/protected/magasins/:magasinId/produits
→ Remplacer :magasinId par l'ID réel
```

### Erreur: 400 Bad Request
```
→ Données manquantes ou invalides
→ Vérifier le Body JSON
→ Vérifier les champs requis
```

### Erreur: 500 Internal Server
```
→ Erreur serveur
→ Vérifier les logs: pm2 logs backend
→ Vérifier les index MongoDB
```

---

## 📝 Notes importantes

1. **FIFO Automatique**: Les lots sont créés automatiquement lors d'une RECEPTION
2. **Alertes Automatiques**: Les alertes sont créées lors des mouvements
3. **Suppression Soft**: Les produits ne sont pas supprimés, juste marqués inactifs
4. **Timestamps UTC**: Toutes les dates sont en UTC/ISO
5. **RBAC**: Les routes vérifient que l'utilisateur a accès au magasin

---

**Status:** ✅ Prêt à tester  
**Dernière mise à jour:** 22 Décembre 2025
