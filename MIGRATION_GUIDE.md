# 🚀 Guide de Migration - Nouvel Ordinateur (Avril 8, 2026)

## 📋 État du Projet (v2.8)

**Dernière version:** v2.8 - Validation Stricte Pre-Submit  
**Date:** Avril 8, 2026  
**Stack:** Node.js + Express + MongoDB + PHP Frontend

### État des Fixes
- ✅ v2.3: Rayon occupation bug fixé
- ✅ v2.4: LOT quantity hardcoding fixé
- ✅ v2.5: Backend LOT auto-creation implémenté
- ✅ v2.6: Strict LOT validation (frontend + backend)
- ✅ v2.7: Fix endpoint pour LOTs orphelines + conversion SIMPLE→LOT
- ✅ v2.8: Validation stricte pre-submit (mobile)

---

## 📦 Prérequis Système

### Windows/Mac/Linux
- **Node.js:** >= 18 et < 21  
  - Vérifier: `node --version`
  - Télécharger: https://nodejs.org/

- **MongoDB:** Local ou Atlas Cloud
  - Local: https://www.mongodb.com/try/download/community
  - Cloud: https://www.mongodb.com/cloud/atlas (gratuit)

- **MAMP/XAMPP:** Pour PHP (frontend)
  - Télécharger: https://www.mamp.info/ ou https://www.apachefriends.org/

- **Git:** Pour versionning
  - `git --version` pour vérifier

---

## ⚙️ Configuration du Nouvel Ordinateur

### Étape 1: Cloner le Projet

```bash
# SSH (recommandé)
git clone git@github.com:votre-repo/backend_Stock.git

# Ou HTTPS
git clone https://github.com/votre-repo/backend_Stock.git

cd backend_Stock
```

### Étape 2: Installer les Dépendances Node.js

```bash
npm install
```

**⚠️ Si erreurs de version:**
```bash
npm install --legacy-peer-deps
```

### Étape 3: Configurer le Fichier .env

Créer un fichier `.env` à la racine du projet:

```env
# === CONFIGURATION DE BASE ===

# Port du serveur
PORT=3000

# === MONGODB ===

# Option 1: MongoDB Local
MONGODB_URI=mongodb://localhost:27017/stock_management

# Option 2: MongoDB Atlas Cloud (recommandé)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/stock_management?retryWrites=true&w=majority
# ⚠️ Ne jamais commiter vos identifiants MongoDB dans un dépôt public !
# Remplacez <username>, <password> et <cluster> par vos informations personnelles dans un fichier .env localement.

# === JWT (Authentification) ===
JWT_SECRET=votre-secret-jwt-très-sécurisé-changez-moi
JWT_EXPIRE=7d

# === CLOUDINARY (Upload Images) ===
CLOUDINARY_NAME=votre-cloudinary-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret

# === BASE URL API ===
API_BASE_URL=http://localhost:3000

# === FRONTEND URL (pour CORS) ===
FRONTEND_URL=http://localhost:8888

# === NODE ENVIRONMENT ===
NODE_ENV=development
```

**⚠️ Pour MongoDB:**
- **Local:** Installer MongoDB Community et le lancer: `mongod`
- **Atlas:** Créer compte gratuit et copier la connection string

### Étape 4: Vérifier la Connexion MongoDB

```bash
# Lancer le serveur
npm start

# Résultat attendu:
# MongoDB connectée
# Serveur lancé sur le port 3000
```

---

## 🏗️ Structure du Projet

```
backend_Stock/
├── server.js                 # Point d'entrée
├── app.js                    # Configuration Express
├── package.json              # Dépendances Node.js
├── .env                      # Variables d'environnement (À CRÉER)
│
├── config/
│   └── db.js                 # Connexion MongoDB
│
├── models/
│   ├── Produit.js
│   ├── Rayon.js
│   ├── StockRayon.js
│   ├── Lot.js
│   ├── Reception.js          # ← Critique pour v2.7 + v2.8
│   ├── Vente.js
│   └── ...
│
├── routes/
│   ├── protected.js          # ← PRINCIPAL (1000+ lignes)
│   │   - POST /receptions
│   │   - POST /receptions/fix/missing-lots (NEW v2.7)
│   │   - GET /receptions (avec LOTs v2.7)
│   │   - GET /receptions/:id (avec LOTs v2.7)
│   ├── public.js
│   └── ...
│
├── middleware/
│   ├── auth.js               # JWT validation
│   └── ...
│
├── services/
│   ├── consolidationService.js  # Gestion SIMPLE vs LOT
│   └── ...
│
├── controllers/
│   └── ...
│
├── assets/                   # Frontend (PHP + JS)
│   ├── js/
│   │   └── reception.js      # ← Validation v2.8 appliquée
│   ├── css/
│   └── ...
│
├── docs/                     # Documentation
│   ├── FIX_v2_8_VALIDATION_STRICT.md  # ← NEW
│   ├── PHASE1_v2_*.md
│   └── ... (100+ docs)
│
└── README.md
```

---

## 🚀 Démarrer le Projet

### 1️⃣ Terminal 1 - Backend Node.js

```bash
cd /path/to/backend_Stock
npm start

# Résultat attendu:
# MongoDB connectée
# Serveur lancé sur le port 3000
```

### 2️⃣ Terminal 2 - Frontend PHP (MAMP)

```bash
# Placer le dossier frontend dans MAMP/htdocs/backend_Stock/
# Ou créer un lien symbolique

# MAMP: Ouvrir l'app et démarrer Apache
# URL: http://localhost:8888/backend_Stock/

# XAMPP: Démarrer Apache dans le panneau de contrôle
# URL: http://localhost/backend_Stock/
```

---

## 🧪 Tester le Setup

### Test 1: Backend API

```bash
# Terminal 1: Vérifier que le serveur démarre
npm start
# ✓ MongoDB connectée
# ✓ Serveur lancé sur le port 3000
```

### Test 2: Vérifier les Collections MongoDB

```bash
# Ouvrir MongoDB Compass ou client CLI
# Vérifier que les collections existent:
# - produits
# - rayons
# - receptions
# - lots
# - ventes
# - users
```

### Test 3: Accéder au Frontend

```
http://localhost:8888/backend_Stock/
```

Vous devriez voir la page de login.

### Test 4: Test API Réception LOT (Postman)

```
POST http://localhost:3000/api/protected/receptions
Authorization: Bearer YOUR_TOKEN

Body:
{
  "produitId": "...",
  "magasinId": "...",
  "rayonId": "...",
  "quantite": 5,
  "prixAchat": 100,
  "nombrePieces": 5,
  "quantiteParPiece": 50,
  "uniteDetail": "metre",
  "prixParUnite": 100,
  "type": "lot"
}

✓ Réponse: Réception créée + 5 LOTs automatiques
```

---

## 📚 Documentation Clé

### À Lire d'Abord
1. **[FIX_v2_8_VALIDATION_STRICT.md](docs/FIX_v2_8_VALIDATION_STRICT.md)** ← Commencer ici
2. **[PHASE1_v2_QUICK_START.md](docs/PHASE1_v2_QUICK_START.md)**
3. **[API_MOBILE_PHASE1_V2_COMPLETE.md](docs/API_MOBILE_PHASE1_V2_COMPLETE.md)**

### Référence Technique
- [RECEPTION_LOGIC.md](docs/RECEPTION_LOGIC.md) - Logique des réceptions
- [SYSTEM_SIMPLE_VS_LOT.md](docs/SYSTEM_SIMPLE_VS_LOT.md) - Différence SIMPLE vs LOT
- [STOCK_MANAGEMENT_LOGIC.md](docs/STOCK_MANAGEMENT_LOGIC.md) - Gestion du stock
- [MOBILE_INTEGRATION_GUIDE.md](docs/MOBILE_INTEGRATION_GUIDE.md) - API mobile

### Testing
- [POSTMAN_TEST_GUIDE.md](docs/POSTMAN_TEST_GUIDE.md) - Tests API
- [TESTING_GUIDE.md](docs/TESTING_GUIDE.md) - Tests complets

---

## 🔄 Flux de Récréation LOTs Manquants (v2.7)

Si vous avez des réceptions sans LOTs (exemple: réceptions de "kakule"):

```bash
# Terminal avec Backend actif

# Créer les LOTs manquants + convertir SIMPLE→LOT
curl -X POST http://localhost:3000/api/protected/receptions/fix/missing-lots?convertSimpleToLot=true \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Réponse exemple:
{
  "success": true,
  "receptionsFixed": 8,
  "lotsCreatedGlobal": 18,
  "message": "✅ 8 réceptions corrigées - 18 LOTs créés"
}
```

---

## 🔐 Variables d'Environnement Importantes

| Variable | Exemple | Obligatoire | Notes |
|----------|---------|-------------|-------|
| PORT | 3000 | Non | Défaut: 3000 |
| MONGODB_URI | mongodb://localhost:27017/stock | **OUI** | Sans ça, le serveur crash |
| JWT_SECRET | super-secret-key | **OUI** | Auth: changer en production |
| CLOUDINARY_NAME | xyz | Non | Pour upload images |
| CLOUDINARY_API_KEY | key123 | Non | Pour upload images |
| CLOUDINARY_API_SECRET | secret456 | Non | Pour upload images |
| NODE_ENV | development | Non | development/production |

---

## ⚠️ Problèmes Courants & Solutions

### Erreur: "MONGODB_URI non défini"
**Solution:** Créer le fichier `.env` avec MONGODB_URI configurée

### Erreur: "Cannot find module"
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 déjà utilisé
**Solution:** Changer le PORT dans `.env`
```env
PORT=3001
```

### MongoDB ne démarre pas
**Solution:**
- **Windows:** MongoDB service doit être lancé via Services.msc or installer comme service
- **Mac:** `brew services start mongodb-community`
- **Linux:** `sudo systemctl start mongod`

### Frontend (PHP) ne se charge pas
**Solution:** Vérifier que MAMP/XAMPP Apache est démarré et que les fichiers sont dans le bon dossier

---

## 📱 Validation v2.8 (Mobile)

La nouvelle validation stricte pre-submit empêche les réceptions LOT incomplètes.

**Champs obligatoires pour LOT:**
- ✅ Nombre de Pièces (> 0)
- ✅ Quantité par Pièce (> 0)
- ✅ Unité (non vide)
- ✅ Prix par Unité (valide)

**Si un champ manque:**
```
⛔ RÉCEPTION LOT BLOQUÉE
❌ Champs manquants: Unité, Prix par Unité
➡️ Veuillez remplir TOUS ces champs
```

---

## 🔗 Checklist Migration

- [ ] Node.js >=18 installé: `node --version`
- [ ] MongoDB configuré (local ou Atlas)
- [ ] Projet cloné: `git clone ...`
- [ ] `.env` créé avec MONGODB_URI
- [ ] `npm install` exécuté
- [ ] `npm start` fonctionne
- [ ] Frontend accessible (PHP)
- [ ] MongoDB collections présentes
- [ ] Test API simple fonctionne
- [ ] Documentation lue (au minimum les 3 fichiers clés)

---

## 🆘 Support & Ressources

### Fichiers Importants à Comprendre
- `routes/protected.js` - 5000+ lignes, contient toute la logique API
- `assets/js/reception.js` - Validation LOT front-end (v2.8)
- `models/Reception.js` - Schema réception
- `models/Lot.js` - Schema LOT

### À Faire Après Migration
1. Vérifier les réceptions existantes
2. Lancer le cleanup LOTs manquants (endpoint v2.7)
3. Tester réceptions LOT complètes
4. Vérifier que validation v2.8 bloque les réceptions incomplètes

---

## 📝 Version History

| Version | Date | Changement |
|---------|------|-----------|
| v2.3 | Apr 2 | Rayon occupation fix |
| v2.4 | Apr 2 | LOT quantity hardcode fix |
| v2.5 | Apr 3 | Backend LOT auto-creation |
| v2.6 | Apr 5 | Strict LOT validation |
| v2.7 | Apr 7 | Fix orphaned LOTs + cleanup endpoint |
| v2.8 | Apr 8 | Mobile validation stricte pre-submit |

---

**Bon courage pour la migration! 🚀**

Pour questions: Consulter la documentation dans `docs/` ou relancer le serveur avec logs détaillés.
