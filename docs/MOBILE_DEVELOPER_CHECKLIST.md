# 📱 CHECKLIST DÉVELOPPEUR MOBILE

## ✅ AVANT DE DÉMARRER

- [ ] Lire [API_MOBILE_QUICK_START.md](./API_MOBILE_QUICK_START.md)
- [ ] Importer Postman Collection et tester les 5 endpoints
- [ ] Vérifier que le token API est disponible
- [ ] Vérifier l'accès au magasin (`magasinId`)
- [ ] Créer les variables d'environnement
- [ ] Installer les dépendances requises

---

## ✅ PHASE 1: AUTHENTIFICATION

### Checklist
- [ ] Écran de login créé
- [ ] Endpoint POST `/auth/login` fonctionnel
- [ ] Token sauvegardé localement (localStorage / SharedPreferences)
- [ ] Vérifier que le token est au bon format JWT
- [ ] Gestion des erreurs de login (email/password invalides)
- [ ] Déconnexion supprime le token
- [ ] Test: Login → recharge page → reste connecté

**Endpoints:**
```
POST /auth/login
```

**Code d'exemple:**
```javascript
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token, user } = await response.json();
localStorage.setItem('token', token);
localStorage.setItem('magasinId', user.magasinId);
```

---

## ✅ PHASE 2: CHARGER LES DONNÉES

### Checklist
- [ ] Écran de chargement créé
- [ ] Endpoint GET `/magasins/:id/produits` fonctionnel
- [ ] Endpoint GET `/magasins/:id/types-produits` fonctionnel
- [ ] Endpoint GET `/magasins/:id/rayons` fonctionnel
- [ ] Données cachées en localStorage
- [ ] Spinner affiché pendant le chargement
- [ ] Erreurs gérées proprement
- [ ] Test: Données affichées dans une liste

**Endpoints:**
```
GET /magasins/{magasinId}/produits
GET /magasins/{magasinId}/types-produits
GET /magasins/{magasinId}/rayons
```

**Paramètre de requête:**
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## ✅ PHASE 3: RÉCEPTION (STOCK ENTRÉE)

### Checklist
- [ ] Formulaire de réception créé
- [ ] Sélection produit avec autocomplete
- [ ] Sélection rayon automatique (du produit)
- [ ] Champs: quantite, prix, fournisseur (optionnel)
- [ ] Sélection photo du téléphone
- [ ] Prévisualisation photo en temps réel
- [ ] Compression photo avant envoi (max 800px, 60% qualité)
- [ ] Alerte capacité type en temps réel
- [ ] Validation avant soumission
- [ ] Upload multipart/form-data fonctionnel
- [ ] Gestion des erreurs (capacité dépassée, etc.)
- [ ] Message de succès affiché
- [ ] Formulaire réinitialisé après succès
- [ ] Test: Réception enregistrée dans la base

**Endpoint:**
```
POST /receptions (multipart/form-data)
```

**Champs requis:**
```
- produitId (ObjectId)
- magasinId (ObjectId)
- rayonId (ObjectId)
- quantite (number)
- prixAchat (number)
- photoFile (file - image)
- fournisseur (string) - optionnel
```

**Code d'exemple:**
```javascript
const formData = new FormData();
formData.append('produitId', produitId);
formData.append('magasinId', magasinId);
formData.append('rayonId', rayonId);
formData.append('quantite', quantite);
formData.append('prixAchat', prixAchat);
formData.append('photoFile', photoFile);

const response = await fetch('/api/protected/receptions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

---

## ✅ PHASE 4: MOUVEMENTS (OPTIONNEL)

### Checklist
- [ ] Écran de mouvement créé
- [ ] Sélection produit et rayon
- [ ] Choix type: entree / sortie
- [ ] Champ quantité
- [ ] Champ raison (optionnel)
- [ ] Validation avant soumission
- [ ] Message de succès
- [ ] Test: Mouvement enregistré

**Endpoint:**
```
POST /magasins/{magasinId}/mouvements
```

---

## ✅ PHASE 5: DASHBOARD

### Checklist
- [ ] KPI affichés: total stock, produits, types, rayons
- [ ] Produits en alerte surlignés
- [ ] Rayons pleins affichés
- [ ] Indicateurs de capacité (progress bars)
- [ ] Bouton de refresh
- [ ] Auto-refresh toutes les X secondes (optionnel)
- [ ] Pas de lag au scroll
- [ ] Test: Données à jour après opération

**Données utilisées:**
```json
stats: {
  enStock,      // Quantité totale
  articles,     // Nombre de produits
  alertes,      // Nombre en alerte
  valeur        // Valeur totale
}
```

---

## ✅ OPTIMISATION MOBILE

### Checklist
- [ ] Images compressées (max 800px, 60% qualité)
- [ ] Requêtes cachées en localStorage
- [ ] Lazy loading des images
- [ ] Buttons désactivés pendant le chargement
- [ ] Pas de requêtes multiples pour la même donnée
- [ ] Messages d'erreur clairs
- [ ] Offline mode (optional)
- [ ] Pas de console.log en production
- [ ] Performance test sur connexion lente

**Code d'optimisation:**
```javascript
// Cache
const cached = localStorage.getItem('produits');
if (cached && !forceRefresh) {
  return JSON.parse(cached);
}

// Compression
const compressed = await compressImage(file, 800, 0.6);

// Lazy load
<img loading="lazy" src={url} />

// Disable button
<button disabled={loading}>
  {loading ? 'Chargement...' : 'Envoyer'}
</button>
```

---

## ✅ SÉCURITÉ

### Checklist
- [ ] Token ne jamais en dur dans le code
- [ ] Token supprimé au logout
- [ ] Variables d'environnement pour baseURL
- [ ] Validation côté client avant envoi
- [ ] Pas de données sensibles en localStorage (sauf token)
- [ ] HTTPS utilisé (en production)
- [ ] Gestion 401 (redirect login)
- [ ] Pas de logs sensibles en console

**Code sécurisé:**
```javascript
// ✅ BIEN
const token = localStorage.getItem('token');
const baseURL = process.env.REACT_APP_BASE_URL;

// ❌ MAL
const token = 'abc123...'; // Hard-coded!
const baseURL = 'http://localhost:3000'; // En clair!
```

---

## ✅ TESTS POSTMAN

### Ordre de test
1. [ ] Login → copier token
2. [ ] GET Produits
3. [ ] GET Types (avec stats)
4. [ ] GET Rayons (avec occupation)
5. [ ] POST Réception (avec photo)
6. [ ] POST Mouvement
7. [ ] GET Produits (refresh pour vérifier)

### Vérifications
- [ ] Tous les endpoints retournent 200 ou 201
- [ ] Les réponses contiennent les champs attendus
- [ ] Les stats sont correctes (enStock, articles, alertes, valeur)
- [ ] Les capacités max sont présentes (typeProduitId.capaciteMax)
- [ ] Les photos sont bien uploadées

---

## 🚀 WORKFLOW COMPLET UTILISATEUR

```
┌─────────────────────────────────────────┐
│ 1. LOGIN                                 │
│   - Email/Password                       │
│   - Récupère token et magasinId          │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ 2. DASHBOARD                            │
│   - Charger produits, types, rayons      │
│   - Afficher KPIs et stats               │
│   - Afficher les alertes                 │
└──────────────┬──────────────────────────┘
               │
               ↓
       ┌───────┴────────┐
       │                │
   Réception          Mouvement
       │                │
       ↓                ↓
┌─────────────┐    ┌──────────────┐
│ Formulaire  │    │ Formulaire   │
│ Réception   │    │ Mouvement    │
│             │    │              │
│ - Produit   │    │ - Produit    │
│ - Rayon     │    │ - Rayon      │
│ - Quantité  │    │ - Quantité   │
│ - Prix      │    │ - Raison     │
│ - Photo ✅  │    │              │
│ - Validation│    │ - Validation │
└──────┬──────┘    └──────┬───────┘
       │                  │
       ├─ Alerte       ← Validation
       │  capacité      serveur
       │
       ↓
    Soumission
       │
       ├─ ✅ Succès → Refresh dashboard
       │
       └─ ❌ Erreur → Afficher message
              (capacité, réseau, etc.)
```

---

## 📊 MATRICE DE VALIDATION

| Feature | Login | Produits | Réception | Mouvements | Dashboard |
|---------|-------|----------|-----------|------------|-----------|
| Authentification | ✅ | ✅ | ✅ | ✅ | ✅ |
| Récupération données | ❌ | ✅ | ✅ | ✅ | ✅ |
| Cache local | ❌ | ✅ | ❌ | ❌ | ❌ |
| Upload photo | ❌ | ❌ | ✅ | ❌ | ❌ |
| Validation form | ❌ | ❌ | ✅ | ✅ | ❌ |
| Alerte temps réel | ❌ | ❌ | ✅ | ❌ | ✅ |
| Gestion erreurs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Loading spinner | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🐛 DEBUGGING

### Log recommandés
```javascript
// À chaque requête
console.log(`📡 ${method} ${endpoint}`, payload);

// À la réponse
console.log(`✅ ${method} ${endpoint}`, response);

// Aux erreurs
console.error(`❌ ${method} ${endpoint}`, error);

// Token
console.log('🔐 Token:', token ? '✅ Présent' : '❌ Manquant');

// Données
console.log('📊 Produits:', produits.length);
console.log('📊 Types:', types.length);
console.log('📊 Rayons:', rayons.length);
```

### Erreurs courantes à chercher
- [ ] Token manquant ou expiré (401)
- [ ] magasinId incorrect ou manquant
- [ ] Capacité dépassée (400)
- [ ] Photo corrompue ou trop grosse
- [ ] Champs obligatoires manquants
- [ ] Problèmes de réseau (timeout)

---

## 📋 CHECKLIST AVANT PRODUCTION

- [ ] Tous les logs debug supprimés
- [ ] Variables d'environnement configurées
- [ ] Gestion erreurs 4xx et 5xx
- [ ] Spinner affiché en chargement
- [ ] Messages clairs pour l'utilisateur
- [ ] Pas de requêtes en dur
- [ ] Compression photos testée
- [ ] Offline handling (optionnel)
- [ ] Tests manuels sur vrais appareils
- [ ] Performance accepté (< 2s de chargement)
- [ ] Pas de fuite mémoire détectée
- [ ] Responsive design mobile testé

---

**Version:** 1.0.0  
**Dernière mise à jour:** 06/01/2026
