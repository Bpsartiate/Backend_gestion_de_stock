# 📱 API STOCK - GUIDE RAPIDE MOBILE

**URL de base:** `https://backend-gestion-de-stock.onrender.com/api/protected`

---

## 🔐 AUTHENTIFICATION (Toujours requis!)

```javascript
const headers = {
  'Authorization': 'Bearer YOUR_TOKEN',
  'Content-Type': 'application/json'
};
```

**Obtenir le token:**
```javascript
// 1. Login
POST /auth/login
{
  "email": "utilisateur@example.com",
  "password": "mot_de_passe"
}

// Réponse:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "role": "...", "magasinId": "..." }
}
```

---

## 🚀 ENDPOINTS ESSENTIELS

### 📋 1. Lister les produits

```javascript
GET /magasins/{magasinId}/produits
```

**Exemple de réponse (minimalisée):**
```json
[
  {
    "_id": "6567abc123",
    "designation": "Poulet",
    "reference": "M23324",
    "quantiteActuelle": 50,
    "prixUnitaire": 15000,
    "seuilAlerte": 20,
    "typeProduitId": {
      "nomType": "Viande",
      "capaciteMax": 100
    },
    "rayonId": {
      "nomRayon": "Rayon Froid",
      "capaciteMax": 1000
    }
  }
]
```

---

### 📥 2. Ajouter une RÉCEPTION (Stock Entrée)

```javascript
POST /receptions
Content-Type: multipart/form-data
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

**Exemple avec fetch:**
```javascript
const formData = new FormData();
formData.append('produitId', '6567abc123');
formData.append('magasinId', '693bf84f9955cef110cae98b');
formData.append('rayonId', '694fc2edff00de0189ebe6fb');
formData.append('quantite', 50);
formData.append('prixAchat', 15000);
formData.append('photoFile', imageFile); // File object
formData.append('fournisseur', 'Fournisseur ABC');

fetch('https://backend-gestion-de-stock.onrender.com/api/protected/receptions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
    // NON multipart/form-data - laisse le navigateur le faire!
  },
  body: formData
})
.then(r => r.json())
.then(data => {
  if (data.error) {
    console.error('❌ Erreur:', data.error);
  } else {
    console.log('✅ Réception enregistrée:', data);
  }
});
```

**Réponse (201 Created):**
```json
{
  "success": true,
  "message": "Réception enregistrée",
  "reception": {
    "_id": "6567def456",
    "produitId": "6567abc123",
    "quantite": 50,
    "prixAchat": 15000,
    "dateReception": "2025-01-06T10:30:00Z"
  }
}
```

---

### 📤 3. Enregistrer une SORTIE (Mouvement)

```javascript
POST /magasins/{magasinId}/mouvements
```

**Body:**
```json
{
  "produitId": "6567abc123",
  "typeMouvement": "sortie",
  "quantite": 10,
  "raison": "Vente",
  "dateOperation": "2025-01-06T10:30:00Z",
  "rayonId": "694fc2edff00de0189ebe6fb"
}
```

---

### 📊 4. Lister les TYPES de produits

```javascript
GET /magasins/{magasinId}/types-produits
```

**Réponse (complète):**
```json
[
  {
    "_id": "6567type001",
    "nomType": "Viande",
    "code": "V123",
    "unitePrincipale": "kg",
    "seuilAlerte": 2,
    "capaciteMax": 100,
    "icone": "🍖",
    
    "produits": [
      {
        "_id": "6567abc123",
        "designation": "Poulet",
        "quantiteActuelle": 50,
        "prixUnitaire": 15000,
        "seuilAlerte": 20,
        "alertes": [],
        "nombreAlertes": 0
      }
    ],
    
    "stats": {
      "enStock": "150.50",           // Total kg en stock
      "articles": 3,                 // 3 produits différents
      "alertes": 1,                  // 1 produit en alerte
      "valeur": "2500000.00"         // Valeur totale CDF
    }
  }
]
```

---

### 🏪 5. Lister les RAYONS

```javascript
GET /magasins/{magasinId}/rayons
```

**Réponse:**
```json
[
  {
    "_id": "694fc2edff00de0189ebe6fb",
    "nomRayon": "Rayon Froid",
    "capaciteMax": 1000,
    "occupation": 150,              // Nombre d'articles
    "articles": 3,                  // Nombre de produits différents
    "capaciteOccupee": "150kg",     // Poids/volume occupé
    "alertes": 1,                   // Produits en alerte
    "etat": "Normal"
  }
]
```

---

## ❌ ERREURS COURANTES

### "Capacité rayon dépassée"
```json
{
  "error": "❌ Capacité du rayon dépassée",
  "details": "Capacité rayon: 1 articles, Actuels: 1, Après: 2"
}
```

**Solution:** Le rayon ne peut contenir qu'1 type de produit différent

### "Capacité type dépassée"
```json
{
  "error": "❌ Capacité du type dépassée",
  "details": "Capacité max: 100 kg, Total après: 150 kg"
}
```

**Solution:** Le type Viande a une limite de 100 kg au total

### "401 Unauthorized"
- Vérifiez que le token est valide et non expiré
- Format: `Authorization: Bearer YOUR_TOKEN`

---

## 💡 CONSEILS MOBILE

### Optimisation réseau
```javascript
// ✅ BON: Récupérer une seule fois au démarrage
const produits = await fetch('/produits').then(r => r.json());
localStorage.setItem('produits', JSON.stringify(produits));

// ❌ MAUVAIS: Faire des requêtes à chaque action
```

### Compression photos
```javascript
// Compresser avant d'envoyer
function compressImage(file, maxWidth = 800, quality = 0.6) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = e => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = img.height / img.width;
        canvas.width = maxWidth;
        canvas.height = maxWidth * ratio;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
    };
  });
}
```

### Gestion de l'authentification
```javascript
// Stocker le token sécurisé
localStorage.setItem('token', response.token);

// Inclure dans chaque requête
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
};

// Vérifier l'expiration
if (error.status === 401) {
  // Token expiré - rediriger vers login
  window.location.href = '/login';
}
```

---

## 🎯 WORKFLOW COMPLET MOBILE

```
1. LOGIN
   POST /auth/login
   ↓
2. CHARGER LES DONNÉES
   GET /magasins/{id}/produits
   GET /magasins/{id}/types-produits
   GET /magasins/{id}/rayons
   ↓
3. AJOUTER RÉCEPTION
   POST /receptions (avec photo)
   ↓
4. VÉRIFIER CAPACITÉS
   - Type: quantiteActuelle + reception <= capaciteMax
   - Rayon: articles + 1 (si nouveau) <= capaciteMax
   ↓
5. ENREGISTRER MOUVEMENT (optionnel)
   POST /mouvements
   ↓
6. RAFRAÎCHIR AFFICHAGE
   Recharger les produits et rayons
```

---

## 📱 EXEMPLE COMPLET: APP MOBILE (React/Vue)

```javascript
class StockAPI {
  constructor(token, magasinId) {
    this.token = token;
    this.magasinId = magasinId;
    this.baseURL = 'https://backend-gestion-de-stock.onrender.com/api/protected';
  }

  // Helper pour faire des requêtes
  async request(method, endpoint, body = null) {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(`${this.baseURL}${endpoint}`, options);
    if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
    return response.json();
  }

  // Récupérer les produits
  async getProduits() {
    return this.request('GET', `/magasins/${this.magasinId}/produits`);
  }

  // Récupérer les types
  async getTypesProduits() {
    return this.request('GET', `/magasins/${this.magasinId}/types-produits`);
  }

  // Récupérer les rayons
  async getRayons() {
    return this.request('GET', `/magasins/${this.magasinId}/rayons`);
  }

  // Ajouter une réception
  async addReception(produitId, rayonId, quantite, prixAchat, photoFile, fournisseur) {
    const formData = new FormData();
    formData.append('produitId', produitId);
    formData.append('magasinId', this.magasinId);
    formData.append('rayonId', rayonId);
    formData.append('quantite', quantite);
    formData.append('prixAchat', prixAchat);
    formData.append('photoFile', photoFile);
    if (fournisseur) formData.append('fournisseur', fournisseur);

    const response = await fetch(`${this.baseURL}/receptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });

    if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
    return response.json();
  }

  // Enregistrer un mouvement
  async addMouvement(produitId, rayonId, typeMouvement, quantite, raison) {
    return this.request('POST', `/magasins/${this.magasinId}/mouvements`, {
      produitId,
      rayonId,
      typeMouvement,
      quantite,
      raison,
      dateOperation: new Date().toISOString()
    });
  }
}

// Utilisation
const api = new StockAPI(token, magasinId);

// Charger les données au démarrage
const [produits, types, rayons] = await Promise.all([
  api.getProduits(),
  api.getTypesProduits(),
  api.getRayons()
]);

// Ajouter une réception
const reception = await api.addReception(
  '6567abc123',      // produitId
  '694fc2edff00de0189ebe6fb', // rayonId
  50,                 // quantite
  15000,              // prixAchat
  photoFile,          // File object
  'Fournisseur ABC'   // fournisseur
);

console.log('✅ Réception:', reception);
```

---

**Questions? Consultez la doc complète:** `/docs/API_STOCK_MOBILE.md`
