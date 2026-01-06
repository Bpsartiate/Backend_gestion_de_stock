# 📚 DOCUMENTATION API - GESTION DE STOCK

## 📋 Index de la Documentation

### 🚀 **Pour démarrer rapidement**
- **[API_MOBILE_QUICK_START.md](./API_MOBILE_QUICK_START.md)** ⭐ START HERE
  - Guide en 5 minutes
  - Les 5 endpoints essentiels
  - Erreurs courantes et solutions
  - Conseils d'optimisation mobile

### 🔧 **Pour les développeurs mobiles**
- **[MOBILE_INTEGRATION_GUIDE.md](./MOBILE_INTEGRATION_GUIDE.md)**
  - Classe SDK JavaScript réutilisable
  - Exemples React Native Expo
  - Exemples Flutter complets
  - Gestion des photos et authentification
  - Dashboard exemple

### 📱 **Pour les intégrateurs**
- **[API_STOCK_MOBILE.md](./API_STOCK_MOBILE.md)** (Documentation complète)
  - Tous les endpoints détaillés
  - Structures de données complètes
  - Exemples d'erreurs

### 🛠️ **Outils pour tester**
- **[Postman_Collection.json](./Postman_Collection.json)**
  - Importer dans Postman/Insomnia
  - Tous les endpoints prêts à tester
  - Variables d'environnement configurées

- **[openapi.json](./openapi.json)**
  - Spécification OpenAPI 3.0
  - Importer dans Swagger Editor
  - Générer des clients SDK automatiquement

---

## 🎯 GUIDE RAPIDE

### 1️⃣ Authentification
```javascript
POST /auth/login
{
  "email": "utilisateur@example.com",
  "password": "mot_de_passe"
}
```
**Réponse:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "magasinId": "693bf84f9955cef110cae98b"
  }
}
```

### 2️⃣ Toujours ajouter le header
```
Authorization: Bearer YOUR_TOKEN
```

### 3️⃣ Endpoints principaux
| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/magasins/{id}/produits` | GET | Lister les produits |
| `/receptions` | POST | Ajouter une réception (multipart) |
| `/magasins/{id}/mouvements` | POST | Enregistrer un mouvement |
| `/magasins/{id}/types-produits` | GET | Types avec stats complètes |
| `/magasins/{id}/rayons` | GET | Rayons avec occupation |

---

## 💡 BONNES PRATIQUES

### ✅ À FAIRE
```javascript
// ✅ Charger une fois et mettre en cache
const produits = await api.getProduits();
localStorage.setItem('produits', JSON.stringify(produits));

// ✅ Compresser les photos avant d'envoyer
const compressed = await compressImage(file, 800, 0.6);

// ✅ Gérer les erreurs 401
if (error.status === 401) {
  window.location.href = '/login';
}

// ✅ Utiliser FormData pour multipart
const formData = new FormData();
formData.append('photoFile', file);
```

### ❌ À ÉVITER
```javascript
// ❌ Ne pas faire des requêtes à chaque rendu
// ❌ Envoyer des images non compressées
// ❌ Mettre le token en dur dans le code
// ❌ Oublier le header Authorization
// ❌ Ne pas gérer les erreurs réseau
```

---

## 🚨 ERREURS COURANTES

### "Capacité rayon dépassée"
**Cause:** Le rayon ne peut contenir qu'1 type de produit différent
**Solution:** Vérifier que `rayonId` n'a pas déjà d'autre type

### "Capacité type dépassée"
**Cause:** La quantité dépasse la limite du type (ex: Viande max 100 kg)
**Solution:** Fractionner en plusieurs réceptions

### "401 Unauthorized"
**Cause:** Token invalide ou expiré
**Solution:** Récréer un token avec login

### "400 Bad Request"
**Cause:** Champs manquants ou format incorrect
**Solution:** Vérifier les champs requis (produitId, quantite, etc.)

---

## 📊 STRUCTURE DE RÉPONSE TYPES

### Produit (minimalisé)
```json
{
  "_id": "6567abc123",
  "designation": "Poulet",
  "reference": "M23324",
  "quantiteActuelle": 50,
  "prixUnitaire": 15000,
  "seuilAlerte": 20,
  "typeProduitId": {
    "_id": "...",
    "nomType": "Viande",
    "capaciteMax": 100,
    "unitePrincipale": "kg"
  },
  "rayonId": {
    "_id": "...",
    "nomRayon": "Rayon Froid",
    "capaciteMax": 1000
  }
}
```

### Type Produit (avec stats)
```json
{
  "_id": "6567type001",
  "nomType": "Viande",
  "code": "V123",
  "capaciteMax": 100,
  "unitePrincipale": "kg",
  
  "produits": [
    { ... },
    { ... }
  ],
  
  "stats": {
    "enStock": "150.50",
    "articles": 3,
    "alertes": 1,
    "valeur": "2500000.00"
  }
}
```

### Rayon (avec occupation)
```json
{
  "_id": "694fc2edff00de0189ebe6fb",
  "nomRayon": "Rayon Froid",
  "capaciteMax": 1000,
  "occupation": 150,
  "articles": 3,
  "capaciteOccupee": "150kg",
  "alertes": 1,
  "etat": "Normal"
}
```

---

## 🔐 AUTHENTIFICATION

### Flow Complet
```
1. User remplit email/password
   ↓
2. POST /auth/login
   ↓
3. Récupérer token et magasinId
   ↓
4. Sauvegarder en localStorage/SharedPreferences
   ↓
5. Ajouter header Authorization à chaque requête
   ↓
6. Si 401 → rediriger vers login
```

### Variables d'environnement
```javascript
// Jamais en dur!
const API_KEY = process.env.REACT_APP_API_KEY;
const BASE_URL = process.env.REACT_APP_BASE_URL;
```

---

## 📸 UPLOAD DE PHOTOS

### Workflow
```
1. User sélectionne photo
   ↓
2. Compresser (maxWidth: 800, quality: 0.6)
   ↓
3. Créer FormData
   ↓
4. POST /receptions avec multipart/form-data
   ↓
5. Photo sauvegardée sur Cloudinary
```

### Exemple
```javascript
const photoFile = document.getElementById('photo').files[0];
const compressed = await compressImage(photoFile);

const formData = new FormData();
formData.append('photoFile', compressed);
formData.append('produitId', '...');
// ... autres champs

fetch('/api/protected/receptions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
    // NON 'Content-Type': 'multipart/form-data'
  },
  body: formData
});
```

---

## 🧪 TESTER AVEC POSTMAN

### Import
1. Ouvrir Postman
2. File → Import
3. Choisir `Postman_Collection.json`
4. Cliquer Import

### Configuration
1. Aller à "Environments"
2. Créer "Stock API Development"
3. Ajouter variables:
   - `baseUrl`: `https://backend-gestion-de-stock.onrender.com/api/protected`
   - `token`: Laisser vide (sera rempli après login)
   - `magasinId`: Laisser vide

### Test
1. Faire Login (récupère token automatiquement)
2. Tester les autres endpoints
3. Exporter pour partager avec l'équipe

---

## 🦋 TESTER AVEC FLUTTER

### Installation
```bash
flutter pub get
```

### Exécution
```bash
flutter run
```

### Debug
```bash
flutter run -v
```

---

## 🌐 TESTER AVEC SWAGGER

### Option 1: En ligne
1. Aller https://editor.swagger.io
2. File → Import URL
3. Coller: `https://backend-gestion-de-stock.onrender.com/docs/openapi.json`

### Option 2: Local
```bash
# Installer swagger-ui
npm install swagger-ui-express

# Servir le fichier openapi.json
```

---

## 📞 SUPPORT

### Documentation complète
- **API Détaillée:** [API_STOCK_MOBILE.md](./API_STOCK_MOBILE.md)
- **Intégration Mobile:** [MOBILE_INTEGRATION_GUIDE.md](./MOBILE_INTEGRATION_GUIDE.md)
- **Quick Start:** [API_MOBILE_QUICK_START.md](./API_MOBILE_QUICK_START.md)

### Questions fréquentes
- **Q: Comment gérer les tokens?**
  - R: Voir section Authentification

- **Q: Comment envoyer des photos?**
  - R: Voir section Upload de photos

- **Q: Comment tester avant de coder?**
  - R: Importer Postman_Collection.json

---

## 📈 PROCHAINES ÉTAPES

1. ✅ Lire [API_MOBILE_QUICK_START.md](./API_MOBILE_QUICK_START.md)
2. ✅ Importer Postman Collection et tester
3. ✅ Choisir un framework (React Native / Flutter / Web)
4. ✅ Utiliser le SDK StockAPI fourni
5. ✅ Intégrer avec vos écrans

---

**Version:** 1.0.0  
**Dernière mise à jour:** 06/01/2026  
**Endpoint API:** https://backend-gestion-de-stock.onrender.com/api/protected
