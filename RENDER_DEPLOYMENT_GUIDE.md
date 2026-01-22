# Déploiement sur Render - Phase 1 v2 API

## 📋 Prérequis

- Compte Render (https://render.com - création gratuite)
- Git installé localement
- Repository GitHub connecté

## 🚀 Étapes de Déploiement

### 1. Initialiser Git (si pas déjà fait)

```bash
cd c:\MAMP\htdocs\backend_Stock
git init
git add .
git commit -m "Phase 1 v2 API Ready for Production"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/backend_Stock.git
git push -u origin main
```

### 2. Connecter à Render

1. Allez sur https://render.com
2. Cliquez sur "New +"
3. Sélectionnez "Web Service"
4. Connectez votre repository GitHub
5. Sélectionnez `backend_Stock`

### 3. Configuration Render

**Service Settings:**
- **Name:** backend-stock-api
- **Runtime:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Free (ou Paid pour production)

### 4. Variables d'Environnement

Ajoutez dans le dashboard Render:

```
MONGODB_URI = mongodb+srv://hnkakim_db_user:E6npxptJcM9PaUD0@cluster0.f9kimqd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

NODE_ENV = production

PORT = 3000
```

⚠️ **IMPORTANT**: 
- Marquez `MONGODB_URI` comme "Secret"
- Ne commitez PAS le `.env` (il est déjà dans `.gitignore`)

### 5. Deploy

Cliquez sur "Create Web Service" - Render déploiera automatiquement!

Le déploiement prendra 2-5 minutes. Vous verrez:
```
✓ Build succeeded
✓ Service deployed successfully
✓ Live at: https://backend-stock-api-xxxx.onrender.com
```

## 🔗 Utiliser l'API Déployée

Remplacez vos URLs locales:

**Local:**
```
http://localhost:3001/api/protected/...
```

**Render:**
```
https://backend-stock-api-xxxx.onrender.com/api/protected/...
```

### Test POST /receptions

```bash
curl -X POST https://backend-stock-api-xxxx.onrender.com/api/protected/receptions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "produitId": "...",
    "quantite": 100,
    "rayonId": "...",
    "magasinId": "...",
    "typeProduitId": "..."
  }'
```

## 📊 Monitoring

1. **Logs en temps réel:** Render Dashboard → Logs
2. **Erreurs:** Cherchez "ERROR" ou "CONSOLIDATE|CREATE"
3. **Performance:** Curl avec `-w "@curl-format.txt"` pour les temps

## ⚙️ Redéployer

Simplement push vers GitHub:
```bash
git add .
git commit -m "API improvements"
git push origin main
```

Render redéploiera automatiquement en 1-2 minutes!

## 🔄 Rollback

Si problème:
1. Render Dashboard → Deployments
2. Sélectionnez une version antérieure
3. Cliquez "Rollback"

## 🚨 Troubleshooting

**Erreur: "MONGODB_URI not defined"**
- ✓ Vérifiez la variable dans Render Settings
- ✓ Redéployez après ajout

**Erreur: "Cannot connect to MongoDB"**
- ✓ Vérifiez MONGODB_URI correcte
- ✓ Whitelist IP Render chez MongoDB Atlas (0.0.0.0/0)

**Service crashes après deploy**
- Allez dans Logs → trouvez l'erreur
- Corriger localement → push → redeploy

## 📝 Notes

- ✅ Port 3000 (Render gère l'exposition automatiquement)
- ✅ consolidationService.js activé et testé
- ✅ Marque field ajouté au Produit
- ✅ typeProduitId requis pour Type-aware logic
- ✅ SSL/HTTPS automatique sur Render

## 🎯 Prochaines Étapes

1. **Test API** depuis votre app React
2. **Vérifier logs** POST /receptions
3. **Valider consolidation** (actionType CREATE vs CONSOLIDATE)
4. **Passer à Paid plan** quand prêt pour production

---

**API Ready:** https://backend-stock-api-xxxx.onrender.com ✓
