# 🚀 Notes de Déploiement - Modal Produit Enrichi

## 📋 Avant Déploiement

### Checklist Pré-Deployment

**Backend:**
- [ ] Endpoint enrichi déployé dans `routes/protected.js`
- [ ] Tous les populate queries configurées
- [ ] Alertes se calculent correctement
- [ ] Tests Postman passent
- [ ] Pas de console.error ou warnings

**Frontend:**
- [ ] `modal_product_detail_premium.php` mis à jour
- [ ] JavaScript compile sans erreurs
- [ ] Tests navigateur passent (Chrome, Firefox, Safari)
- [ ] Responsive ok (mobile view testée)
- [ ] Lightbox images fonctionne

**Documentation:**
- [ ] 5 guides créés et vérifiés
- [ ] Exemples data valides
- [ ] Liens internes corrects

---

## 🔄 Procédure de Déploiement

### Étape 1: Backup

```bash
# Backup database MongoDB
mongodump --uri="mongodb+srv://..." --out=backup_$(date +%Y%m%d_%H%M%S)

# Backup fichiers critical
cp routes/protected.js routes/protected.js.bak
cp pages/stock/modal_product_detail_premium.php pages/stock/modal_product_detail_premium.php.bak
```

### Étape 2: Deploy Backend

**Sur Render (Node.js):**

```bash
# 1. Push code vers git
git add routes/protected.js
git commit -m "feat: add enriched product endpoint with INCLUDE pattern"
git push origin main

# 2. Render déploie automatiquement (webhook)
# Attendre build et déploiement (~2-5 min)

# 3. Vérifier déploiement
curl -H "Authorization: Bearer $TOKEN" \
  "https://your-api.onrender.com/api/protected/produits/TEST_ID?include=mouvements"
# Doit retourner 200 OK avec produit + mouvements
```

**Monitoring Render:**
- Voir logs: https://dashboard.render.com/services/...
- Chercher: "Server started on port"
- Chercher: Pas de "Error:" ou "TypeError:"

### Étape 3: Deploy Frontend

**Sur serveur MAMP/Hosting:**

```bash
# 1. Upload fichier updated
scp pages/stock/modal_product_detail_premium.php user@server:/path/to/pages/stock/

# 2. Vérifier permissions
chmod 644 modal_product_detail_premium.php

# 3. Browser cache clear (user side)
# Demander aux utilisateurs Ctrl+Shift+R ou Cmd+Shift+R
```

### Étape 4: Test Smoke

**Via Postman:**

1. **Test endpoint enrichi:**
```
GET /api/protected/produits/REAL_PRODUCT_ID?include=mouvements,receptions,alertes,enregistrement
Header: Authorization: Bearer <VALID_TOKEN>

Vérify:
- Status 200 OK
- Response has data.mouvements array
- Response has data.receptions array
- Response has data.alertes object
- Response has included array
```

2. **Test modal web:**
```
1. Aller sur /pages/stock/stocks_et_entreposage.php
2. Chercher un produit
3. Cliquer pour ouvrir modal
4. Console (F12): Doit afficher ✅ Endpoint enrichi utilisé
5. Vérifier 8 sections visibles
6. Déplier accordion réceptions
7. Cliquer sur image réception → lightbox
8. Pas d'erreurs console (rouges)
```

---

## 🔍 Vérifications Post-Deployment

### Performances

**Metrics à mesurer:**

| Métrique | Cible | Outil |
|----------|-------|-------|
| API response time | < 300ms | Postman / DevTools |
| Modal load time | < 1s | DevTools Timing |
| Largest image load | < 500ms | Network tab |
| Cache hit rate | > 80% | localStorage logs |

**Chrome DevTools:**
```
1. Ouvrir modal produit
2. F12 → Performance → Record
3. Déplier accordion réceptions
4. Stop recording
5. Voir Main thread time (doit être < 100ms)
```

### Monitoring

**Logs à checker:**

```bash
# Backend logs (Render)
# Rechercher ces patterns GOOD:
"GET /api/protected/produits/ 200" # Success
"Produit retrieved with mouvements" # Populate working

# Patterns MAUVAIS à éviter:
"404" # Endpoint not found
"TypeError" # Code error
"MongoError" # Database error
"503" # Service unavailable
```

**Frontend logs (Browser):**

```javascript
// Console doit afficher:
✅ Endpoint enrichi utilisé: { data: {...}, included: [...] }

// Console NE doit PAS afficher:
❌ Fetch error
❌ TypeError
❌ undefined is not a function
```

---

## 🐛 Rollback Plan

**Si quelque chose ne fonctionne pas:**

### Rollback Backend
```bash
# 1. Revert code
git revert <commit_id>
git push origin main

# 2. Render redeploy automatiquement
# Attendre ~2-5 min

# 3. Vérifier
curl https://your-api.onrender.com/api/protected/produits/TEST_ID
# Doit retourner 200 OK (endpoint classique)
```

### Rollback Frontend
```bash
# 1. Restaurer backup
scp user@server:/path/to/modal_product_detail_premium.php.bak 
  pages/stock/modal_product_detail_premium.php

# 2. Clear browser cache
# Demander aux users Ctrl+Shift+R

# 3. Vérifier
# Ouvrir modal → doit s'ouvrir sans erreur (mode ancien)
```

### Database Rollback
```bash
# Si data corrompue (très rare)
mongorestore --uri="mongodb+srv://..." backup_<timestamp>/
```

---

## 📞 Support Utilisateur

### Messages pour Utilisateurs

**Avant déploiement (notification):**
```
📢 MAINTENANCE PRÉVUE
Date: [date]
Durée: ~15 minutes
Impact: Modal détail produit sera temporairement indisponible

Amélioration: Affichage complet des réceptions et historique
```

**Si problèmes rencontrés:**
```
❌ "Le modal ne s'ouvre pas"
Solution: Ctrl+Shift+R pour clear cache

❌ "Les réceptions ne s'affichent pas"
Solution: Vérifier que produit a des réceptions
  (contacter admin si problème persiste)

❌ "L'image de réception est floue"
Solution: Cliquer sur image pour voir lightbox (meilleure qualité)
```

---

## 📊 Monitoring à Long Terme

### Daily (1ère semaine)

```
Checklist quotidienne:
- [ ] Render logs: Zéro errors?
- [ ] Browser console: Zéro errors?
- [ ] Users complaints? (Slack/email)
- [ ] API response time stable?
- [ ] Cache hit rate > 80%?
```

### Weekly (après 1 mois)

```
Métriques à tracker:
- Modal open latency (P50, P95, P99)
- Cache effectiveness
- Error rate by module
- User session duration
- Mobile vs Desktop split
```

### Monthly (après 3 mois)

```
Review complet:
- Performance trends
- User adoption rate
- Feature usage stats
- Bug/issue tracking
- Mobile app integration readiness
```

---

## 🔗 URLs Importantes

### Endpoints

| Environnement | URL | Statut |
|--------------|-----|--------|
| **Production** | `https://your-api.onrender.com/api/protected/produits/:id` | ✅ Live |
| **Staging** | `https://staging-api.onrender.com/api/protected/produits/:id` | Testing |
| **Local Dev** | `http://localhost:3000/api/protected/produits/:id` | Dev |

### Pages Web

| Page | URL |
|------|-----|
| **Stock** | `/pages/stock/stocks_et_entreposage.php` |
| **Modal** | `pages/stock/modal_product_detail_premium.php` |

### Dashboards

| Outil | URL |
|-------|-----|
| **Render** | https://dashboard.render.com |
| **MongoDB** | https://cloud.mongodb.com |
| **Postman** | https://postman.com/workspace/... |

---

## 🛠️ Dépannage Courant

### Problème: "404 Not Found"

```
Cause 1: Endpoint pas déployé
Solution: Vérifier que routes/protected.js est updated
  $ git log --oneline routes/protected.js | head -1
  
Cause 2: URL incorrecte
Solution: Vérifier qu'url exacte dans modal_product_detail_premium.php
  Search: `/api/protected/produits/`
  
Cause 3: Token expiré
Solution: Re-login user
  localStorage.removeItem('authToken')
```

### Problème: "Timeout Error"

```
Cause: API lente ou database slow
Solution: 
  1. Check Render logs pour queries slow
  2. Vérifier MongoDB index sur produits._id
  3. Vérifier populate queries sont optimisées
  
  Index: db.produits.createIndex({ _id: 1 })
```

### Problème: "Réceptions ne s'affichent pas"

```
Debug steps:
1. Ouvrir DevTools → Network
2. Chercher requête `/produits/...?include=`
3. Vérifier Response body:
   - data.receptions existe?
   - Array vide ou a items?
4. Si vide: Produit a pas de réceptions dans DB
   Solution: Créer une réception de test
```

### Problème: "Image réception not loading"

```
Cause 1: Image URL invalide
  Fix: Vérifier photoUrl dans réception MongoDB

Cause 2: CORS error
  Check: Response headers
    Access-Control-Allow-Origin: *

Cause 3: Image file deleted
  Solution: Re-upload image ou créer nouvelle réception
```

---

## 📈 Métriques de Succès

### Après 1 Semaine
- [ ] 0 critical errors
- [ ] API response < 300ms
- [ ] > 90% users can open modal
- [ ] Cache hit rate > 80%

### Après 1 Mois
- [ ] User adoption > 95%
- [ ] Zero rollbacks needed
- [ ] Mobile app ready for testing
- [ ] Performance stable

### Après 3 Mois
- [ ] New features (exports, filters)
- [ ] Mobile app launched
- [ ] Documentation updated
- [ ] Performance optimized

---

## ✨ Notes Finales

### Recommandations

1. **Communiquer** avec users avant/après deployment
2. **Monitor** activement 1ère semaine (alertes on)
3. **Documenter** tous les incidents (même mineurs)
4. **Iterate** rapidement sur feedback user
5. **Optimiser** basedon metrics collectées

### Prochaines Phases

- [ ] Mobile app testing (React Native)
- [ ] Features additionnelles (exports, filters)
- [ ] Performance tuning (caching avancé)
- [ ] Analytics dashboard (ventes trends)

---

## 📞 Contacts Escalation

| Rôle | Contact | Role |
|------|---------|------|
| **Développeur Backend** | Dev Backend | Deploy endpoint |
| **Développeur Frontend** | Dev Frontend | Deploy modal |
| **DevOps** | DevOps Engineer | Render management |
| **Database** | DB Admin | MongoDB backup/restore |
| **Support Utilisateur** | Support Lead | User complaints |

---

**Créé:** 2024
**Statut:** ✅ Prêt pour déploiement
**Version:** 1.0
**Prochaine Étape:** Exécuter la procédure déploiement
