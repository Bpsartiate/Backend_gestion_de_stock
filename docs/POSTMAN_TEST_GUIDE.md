# Guide Postman - Test API Magasins & Guichets

## Configuration de base
- **Base URL**: `https://backend-gestion-de-stock.onrender.com`
- **Header commun**: `Authorization: Bearer {TOKEN}`
- **Content-Type**: `application/json`

---

## 1. AUTHENTIFICATION - Obtenir un Token

### 1.1 Login (POST)
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Réponse attendue:**
```json
{
  "message": "Connecté",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "nom": "Admin",
    "prenom": "User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Copie le `token` pour les prochaines requêtes!**

---

## 2. MAGASINS - Récupérer & Créer

### 2.1 Lister TOUS les magasins (GET)
```
GET /api/protected/magasins
Authorization: Bearer {TOKEN}
```

**Réponse attendue (Array):**
```json
[
  {
    "_id": "magasin_id_1",
    "nom_magasin": "Magasin Centre",
    "adresse": "123 Rue Principale",
    "telephone": "+243123456789",
    "email": "centre@magasin.com",
    "photoUrl": "https://res.cloudinary.com/...",
    "businessId": {
      "_id": "entreprise_id",
      "nomEntreprise": "Mon Entreprise"
    },
    "guichets": [
      {
        "_id": "guichet_id",
        "nom_guichet": "Guichet 1",
        "code": "G001",
        "status": "actif"
      }
    ],
    "createdAt": "2024-12-10T10:00:00.000Z",
    "updatedAt": "2024-12-11T15:30:00.000Z"
  }
]
```

---

### 2.2 Créer un Magasin (POST)
```
POST /api/protected/magasins
Authorization: Bearer {TOKEN}
Content-Type: multipart/form-data

Form Data:
- nom_magasin: "Nouveau Magasin"
- adresse: "456 Avenue Commerce"
- telephone: "+243987654321"
- email: "nouveau@magasin.com"
- businessId: "entreprise_id_ici"
- photo: [fichier image]
```

**Réponse attendue:**
```json
{
  "message": "Magasin créé avec succès",
  "magasin": {
    "_id": "new_magasin_id",
    "nom_magasin": "Nouveau Magasin",
    "adresse": "456 Avenue Commerce",
    "photoUrl": "https://res.cloudinary.com/...",
    "businessId": "entreprise_id_ici"
  }
}
```

---

### 2.3 Mettre à jour un Magasin (PUT)
```
PUT /api/protected/magasins/{magasin_id}
Authorization: Bearer {TOKEN}
Content-Type: multipart/form-data

Form Data:
- nom_magasin: "Magasin Renommé"
- adresse: "789 Rue Modifiée"
- telephone: "+243111111111"
- email: "updated@magasin.com"
- photo: [fichier image - optionnel]
```

**Réponse attendue:**
```json
{
  "message": "Magasin mis à jour",
  "magasin": {
    "_id": "magasin_id",
    "nom_magasin": "Magasin Renommé",
    "adresse": "789 Rue Modifiée"
  }
}
```

---

## 3. GUICHETS - Récupérer & Créer

### 3.1 Créer un Guichet (POST)
```
POST /api/protected/guichets
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "magasinId": "magasin_id_ici",
  "nom_guichet": "Guichet Principal",
  "code": "G001",
  "vendeurPrincipal": "vendeur_id_ici",
  "objectifJournalier": 1000,
  "stockMax": 5000
}
```

**Réponse attendue:**
```json
{
  "message": "Guichet créé",
  "guichet": {
    "_id": "guichet_id",
    "magasinId": "magasin_id_ici",
    "nom_guichet": "Guichet Principal",
    "code": "G001",
    "status": "actif",
    "vendeurPrincipal": "vendeur_id_ici",
    "objectifJournalier": 1000,
    "stockMax": 5000,
    "createdAt": "2024-12-11T16:00:00.000Z"
  }
}
```

---

## 4. STATISTIQUES

### 4.1 Obtenir les Stats Magasins & Guichets (GET)
```
GET /api/protected/stats/magasins-guichets
Authorization: Bearer {TOKEN}
```

**Réponse attendue:**
```json
{
  "totalMagasins": 5,
  "totalGuichets": 12,
  "totalVendeurs": 8,
  "totalStock": 45000,
  "entreprise": {
    "_id": "entreprise_id",
    "nomEntreprise": "Toutes les entreprises"
  }
}
```

---

## 5. AFFECTATIONS - Assigner un Vendeur à un Guichet

### 5.1 Assigner Vendeur (PUT)
```
PUT /api/protected/assign-guichet
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "vendeurId": "vendeur_id_ici",
  "guichetId": "guichet_id_ici"
}
```

**Réponse attendue:**
```json
{
  "message": "Vendeur assigné au guichet",
  "affectation": {
    "_id": "affectation_id",
    "vendeurId": "vendeur_id_ici",
    "guichetId": "guichet_id_ici",
    "magasinId": "magasin_id",
    "entrepriseId": "entreprise_id",
    "dateAffectation": "2024-12-11T16:00:00.000Z",
    "status": 1
  }
}
```

---

## 6. LISTE DES MEMBRES - Récupérer les Utilisateurs

### 6.1 Lister les Membres (GET)
```
GET /api/protected/members
Authorization: Bearer {TOKEN}
```

**Réponse attendue:**
```json
[
  {
    "_id": "user_id_1",
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean@example.com",
    "role": "vendeur",
    "photoUrl": "https://res.cloudinary.com/...",
    "createdAt": "2024-12-01T10:00:00.000Z"
  }
]
```

---

## ERREURS COURANTES

### 401 Unauthorized
**Cause**: Token manquant ou expiré
**Solution**: 
1. Assure-toi d'avoir copié le token du login
2. Vérifie que l'en-tête `Authorization: Bearer {TOKEN}` est présent
3. Le token expire après ~24h, fais un nouveau login

### 403 Forbidden
**Cause**: Rôle insuffisant pour l'action
**Solution**: 
- Assure-toi que l'utilisateur est `admin` ou `superviseur`
- Pour certaines actions, un rôle spécifique est requis

### 404 Not Found
**Cause**: ID invalide (magasin, guichet, vendeur non trouvé)
**Solution**: 
1. Vérifie que l'ID est correct
2. Utilise les listes (GET) pour obtenir les IDs valides

### 400 Bad Request
**Cause**: Données obligatoires manquantes
**Solution**: 
- Vérifie que tous les champs requis sont remplis
- Regarde le message d'erreur pour plus de détails

---

## ÉTAPES POUR TESTER COMPLÈTEMENT

1. **Login** → Obtiens le TOKEN
2. **Lister magasins** → Vérifie les données
3. **Lister stats** → Vérifie les compteurs
4. **Créer un magasin** (optionnel avec photo)
5. **Créer un guichet** dans ce magasin
6. **Assigner un vendeur** au guichet
7. **Vérifier les stats** à nouveau

---

## VARIABLES POSTMAN (Utile)

Dans **Postman**, tu peux créer une **Environment** avec ces variables:

```
{
  "base_url": "https://backend-gestion-de-stock.onrender.com",
  "token": "{{token_du_login}}",
  "magasin_id": "{{id_magasin}}",
  "guichet_id": "{{id_guichet}}",
  "vendeur_id": "{{id_vendeur}}"
}
```

Puis utilise-les dans tes requêtes:
```
GET {{base_url}}/api/protected/magasins
Authorization: Bearer {{token}}
```

---

## NOTES
- Remplace tous les `{...}` par les vraies valeurs
- Les réponses peuvent varier légèrement selon les données en base
- Test d'abord en GET, puis en POST/PUT pour éviter les erreurs
