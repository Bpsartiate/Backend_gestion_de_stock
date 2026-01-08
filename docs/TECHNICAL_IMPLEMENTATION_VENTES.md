# 🔧 Implémentation Technique - Ventes avec Rôles & Guichets

## 📋 Table des Matières

1. [Architecture Complète](#architecture-complète)
2. [Modèle de Données](#modèle-de-données)
3. [Endpoints API](#endpoints-api)
4. [Logique Frontend](#logique-frontend)
5. [Cas d'Utilisation](#cas-dutilisation)
6. [Debugging](#debugging)

---

## 🏗️ Architecture Complète

### Flux Complet de Vente

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (vente.php)                         │
│                                                                 │
│  1. User sélectionne magasin → loadMagasins()                  │
│  2. loadGuichets(magasinId) → affiche guichets                 │
│  3. User sélectionne guichet → currentGuichet = id             │
│  4. User ajoute produits au panier                             │
│  5. User valide vente → validateVente()                        │
│     ├─ Récupère JWT token (utilisateur connecté)               │
│     ├─ Récupère magasinId (sélectionné)                        │
│     ├─ Récupère currentGuichet (sélectionné)                   │
│     ├─ Récupère articles du panier                             │
│     └─ POST /api/protected/ventes {body}                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓ POST
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (routes/ventes.js)                   │
│                                                                 │
│  router.post('/ventes', authMiddleware, ...)                   │
│  ├─ Valide req.body {magasinId, guichetId, articles}           │
│  ├─ Récupère utilisateurId du JWT (req.user.id)               │
│  ├─ Crée Vente {                                               │
│  │   utilisateurId: req.user.id          👤 Qui a vendu        │
│  │   guichetId: req.body.guichetId       🪟 Où c'est passé     │
│  │   magasinId: req.body.magasinId       🏪 Quel magasin       │
│  │   articles: [...]                     📦 Quoi               │
│  │   montantTotalUSD: ...                💵 Combien            │
│  │ }                                                            │
│  ├─ Crée StockMovements SORTIE                                 │
│  ├─ Population complète (utilisateur, guichet, articles)       │
│  └─ Retourne vente complète populée                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓ Response
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (success handler)                    │
│                                                                 │
│  1. Parse réponse                                              │
│  2. Affiche confirmation avec nom du vendeur                   │
│  3. Vide le panier                                             │
│  4. Refresh historique des ventes                              │
│  5. Affiche rapport vente (optionnel)                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💾 Modèle de Données

### Schema Vente (models/vente.js)

```javascript
{
  _id: ObjectId,
  dateVente: Date,
  
  // 👤 QUI a vendu
  utilisateurId: {
    type: ObjectId,
    ref: 'Utilisateur',
    required: true,
    // Contient: _id, nom, prenom, email, role, photoUrl, telephone
    // role = "ADMIN" | "SUPERVISEUR" | "VENDEUR"
  },
  
  // 🪟 OÙ ça s'est passé
  guichetId: {
    type: ObjectId,
    ref: 'Guichet',
    default: null,
    // Contient: _id, nom_guichet, code, vendeurPrincipal (nested populate)
    // vendeurPrincipal = Utilisateur assigné au guichet
  },
  
  // 🏪 Quel magasin
  magasinId: {
    type: ObjectId,
    ref: 'Magasin',
    required: true,
    // Contient: _id, nom_magasin, businessId
  },
  
  // 👤 Client (optionnel)
  client: String,
  
  // 📦 Articles vendus
  articles: [
    {
      produitId: { type: ObjectId, ref: 'Produit' },
      rayonId: { type: ObjectId, ref: 'Rayon' },
      quantite: Number,
      prixUnitaire: Number,
      montantUSD: Number
    }
  ],
  
  // 💵 Montants
  montantTotalUSD: Number,
  tauxFC: Number (optional),
  montantTotalFC: Number (optional),
  
  // 🏦 Paiement
  modePaiement: String, // "CASH" | "CARD" | "CREDIT" | "CHEQUE"
  
  // Autres
  observations: String,
  statut: String, // "VALIDÉE", "ANNULÉE"
  dateCreation: Date,
  dateModification: Date
}
```

### Population Complète

```javascript
// Dans tous les endpoints GET:
Vente.findById(venteId)
  .populate({
    path: 'utilisateurId',
    select: '_id nom prenom email role photoUrl telephone'
    // 👤 Détails du vendeur
  })
  .populate({
    path: 'magasinId',
    select: '_id nom_magasin adresse telephone',
    populate: {
      path: 'businessId',
      select: '_id nom_entreprise'
    }
    // 🏪 Détails du magasin
  })
  .populate({
    path: 'guichetId',
    select: '_id nom_guichet code vendeurPrincipal',
    populate: {
      path: 'vendeurPrincipal',
      select: '_id nom prenom email'
      // 🪟 Détails du guichet + son vendeur normal
    }
  })
  .populate({
    path: 'articles.produitId',
    select: '_id designation photoUrl prixUnitaire',
    populate: {
      path: 'typeProduitId',
      select: '_id nomType icone'
    }
  })
  .populate({
    path: 'articles.rayonId',
    select: '_id nomRayon'
  });
```

---

## 🔌 Endpoints API

### POST /api/protected/ventes
**Créer une nouvelle vente**

```javascript
// Request
{
  magasinId: "mag_001",        // Requis
  guichetId: "guichet_45",     // Optionnel (assigné par JWT si null)
  articles: [
    {
      produitId: "prod_123",
      rayonId: "rayon_12",
      quantite: 5,
      prixUnitaire: 15.50,
      observations: "optional"
    }
  ],
  client: "Magasin ABC",       // Optionnel
  modePaiement: "CASH",        // Defaut: CASH
  tauxFC: 2650,                // Optionnel
  observations: "Livraison demain"
}

// Response (201 Created)
{
  success: true,
  message: "✅ Vente enregistrée avec succès",
  vente: {
    _id: "vente_001",
    dateVente: "2026-01-08T14:30:00Z",
    utilisateurId: {          // 👤 Du JWT
      _id: "user_888",
      nom: "Kamila",
      prenom: "Mvila",
      email: "kamila@stock.com",
      role: "SUPERVISEUR"
    },
    guichetId: {              // 🪟 Complètement peuplé
      _id: "guichet_45",
      nom_guichet: "Guichet 3",
      code: "G3",
      vendeurPrincipal: {
        _id: "user_789",
        nom: "Robert",
        prenom: "Kabamba"
      }
    },
    // ... autres champs
    montantTotalUSD: 77.50,
    modePaiement: "CASH",
    statut: "VALIDÉE"
  }
}
```

**Erreurs Possibles:**
```javascript
// 400 - Magasin ou articles manquants
{ message: "❌ Magasin et articles requis" }

// 400 - Stock insuffisant
{ 
  message: "❌ Stock insuffisant pour Riz Blanc 5kg! Disponible: 200",
  produit: "Riz Blanc 5kg",
  disponible: 200,
  demande: 5
}

// 401 - Non authentifié
{ error: "Unauthorized" }

// 500 - Erreur serveur
{ error: "..." }
```

---

### GET /api/protected/ventes
**Lister les ventes**

```javascript
// Request
GET /api/protected/ventes?magasinId=mag_001&page=1&limit=20

// Response (200 OK)
{
  ventes: [
    {
      _id: "vente_001",
      dateVente: "2026-01-08T14:30:00Z",
      utilisateurId: { /* Complètement populé */ },
      magasinId: { /* Complètement populé */ },
      guichetId: { /* Complètement populé */ },
      articles: [ /* Complètement peuplés */ ],
      montantTotalUSD: 77.50,
      // ... autres champs
    },
    // ... autres ventes
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 245,
    pages: 13
  }
}
```

---

### GET /api/protected/ventes/:venteId
**Détails d'une vente**

```javascript
// Request
GET /api/protected/ventes/vente_001

// Response (200 OK)
{
  _id: "vente_001",
  dateVente: "2026-01-08T14:30:00Z",
  utilisateurId: {
    _id: "user_888",
    nom: "Kamila",
    prenom: "Mvila",
    email: "kamila@stock.com",
    role: "SUPERVISEUR",
    photoUrl: "...",
    telephone: "+243..."
  },
  guichetId: {
    _id: "guichet_45",
    nom_guichet: "Guichet 3",
    code: "G3",
    vendeurPrincipal: {
      _id: "user_789",
      nom: "Robert",
      prenom: "Kabamba",
      email: "robert@stock.com"
    }
  },
  magasinId: {
    _id: "mag_001",
    nom_magasin: "Stock Principal",
    adresse: "Kinshasa",
    businessId: {
      _id: "biz_001",
      nom_entreprise: "MegaStock SARL"
    }
  },
  articles: [
    {
      produitId: {
        _id: "prod_123",
        designation: "Riz Blanc 5kg",
        photoUrl: "...",
        prixUnitaire: 15.50,
        typeProduitId: {
          nomType: "Produits Secs",
          icone: "🌾"
        }
      },
      rayonId: {
        _id: "rayon_12",
        nomRayon: "Grains"
      },
      quantite: 5,
      montantUSD: 77.50
    }
  ],
  montantTotalUSD: 77.50,
  modePaiement: "CASH",
  statut: "VALIDÉE"
}
```

---

### GET /api/protected/magasins/:magasinId/guichets
**Récupérer les guichets d'un magasin**

```javascript
// Request
GET /api/protected/magasins/mag_001/guichets

// Response (200 OK)
[
  {
    _id: "guichet_45",
    nom_guichet: "Guichet 1",
    code: "G1",
    vendeurPrincipal: {
      _id: "user_789",
      nom: "Robert",
      prenom: "Kabamba",
      email: "robert@stock.com"
    }
  },
  {
    _id: "guichet_46",
    nom_guichet: "Guichet 2",
    code: "G2",
    vendeurPrincipal: {
      _id: "user_890",
      nom: "Jean",
      prenom: "Ndongo",
      email: "jean@stock.com"
    }
  }
]
```

---

## 🖥️ Logique Frontend

### assets/js/vente.js - VenteManager Class

```javascript
class VenteManager {
  constructor() {
    this.magasins = [];
    this.guichets = [];
    this.produits = [];
    this.panier = [];
    
    // ===== 🪟 Guichet Selection =====
    this.currentGuichet = null;      // ID du guichet sélectionné
    this.selectedGuichetData = null; // Données complètes du guichet
  }
  
  // 🪟 Charger les guichets après sélection du magasin
  async loadGuichets(magasinId) {
    try {
      const response = await fetch(
        `${this.API_BASE}/api/protected/magasins/${magasinId}/guichets`
      );
      
      if (response.ok) {
        this.guichets = await response.json();
        
        // Auto-sélectionner le premier guichet
        if (this.guichets.length > 0) {
          this.currentGuichet = this.guichets[0]._id;
          this.selectedGuichetData = this.guichets[0];
          
          // Afficher le guichet sélectionné
          this.updateGuichetDisplay();
        }
      } else {
        console.error('Erreur chargement guichets:', response.status);
      }
    } catch (error) {
      console.error('Erreur loadGuichets:', error);
    }
  }
  
  // 🪟 Afficher le guichet sélectionné dans le formulaire
  updateGuichetDisplay() {
    const guicheletElement = document.getElementById('guichetSelected');
    const vendeurElement = document.getElementById('guichetVendeur');
    
    if (this.currentGuichet && this.selectedGuichetData) {
      guicheletElement.textContent = 
        `${this.selectedGuichetData.nom_guichet} (${this.selectedGuichetData.code})`;
      
      const vendeur = this.selectedGuichetData.vendeurPrincipal;
      if (vendeur) {
        vendeurElement.textContent = 
          `${vendeur.nom} ${vendeur.prenom}`;
      }
    }
  }
  
  // 🪟 Afficher modal de sélection guichet
  displayGuichets() {
    const guichetsListDiv = document.getElementById('guichetsList');
    const spinnerDiv = document.getElementById('guichetsSpinner');
    
    if (!this.guichets || this.guichets.length === 0) {
      guichetsListDiv.innerHTML = '<p>Aucun guichet disponible</p>';
      spinnerDiv.style.display = 'none';
      guichetsListDiv.style.display = 'block';
      return;
    }
    
    // Créer les cartes de guichets
    guichetsListDiv.innerHTML = this.guichets.map(guichet => `
      <div class="card mb-2 cursor-pointer" onclick="venteManager.selectGuichet('${guichet._id}')">
        <div class="card-body p-3">
          <h6 class="mb-1">${guichet.nom_guichet}</h6>
          <small class="text-muted">
            Code: ${guichet.code}<br>
            Vendeur: ${guichet.vendeurPrincipal?.nom || '--'}
          </small>
          ${this.currentGuichet === guichet._id ? 
            '<span class="badge bg-success ms-2">Sélectionné</span>' : ''}
        </div>
      </div>
    `).join('');
    
    spinnerDiv.style.display = 'none';
    guichetsListDiv.style.display = 'block';
  }
  
  // 🪟 Sélectionner un guichet
  selectGuichet(guichetId) {
    const guichet = this.guichets.find(g => g._id === guichetId);
    if (guichet) {
      this.currentGuichet = guichetId;
      this.selectedGuichetData = guichet;
      this.updateGuichetDisplay();
      
      // Fermer modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById('modalSelectGuichet')
      );
      if (modal) modal.hide();
      
      // Rafraîchir affichage modal
      this.displayGuichets();
    }
  }
  
  // ✅ Valider la vente (envoyer au backend)
  async validateVente() {
    if (!this.panier || this.panier.length === 0) {
      alert('Panier vide!');
      return;
    }
    
    if (!this.currentMagasin) {
      alert('Sélectionnez un magasin!');
      return;
    }
    
    if (!this.currentGuichet) {
      alert('Sélectionnez un guichet!');
      return;
    }
    
    // Préparer les données
    const articles = this.panier.map(item => ({
      produitId: item.produit._id,
      rayonId: item.produit.rayonId,
      quantite: item.quantite,
      prixUnitaire: item.prixUnitaire
    }));
    
    const body = {
      magasinId: this.currentMagasin,
      guichetId: this.currentGuichet,  // 🪟 Ajouter le guichet
      articles,
      client: document.getElementById('venteClient').value || null,
      modePaiement: document.getElementById('ventePaiement').value,
      tauxFC: parseFloat(document.getElementById('venteTauxFC').value) || null,
      observations: document.getElementById('venteObservations').value || null
    };
    
    try {
      const response = await fetch(`${this.API_BASE}/api/protected/ventes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Vente créée:', result.vente);
        
        // 👤 Afficher qui a vendu
        const vendeur = result.vente.utilisateurId;
        alert(`✅ Vente enregistrée par ${vendeur.nom} ${vendeur.prenom}`);
        
        // Vider panier et rafraîchir
        this.panier = [];
        this.loadVentes();
        this.updateAffichage();
      } else {
        const error = await response.json();
        alert(`❌ Erreur: ${error.message || error.error}`);
      }
    } catch (error) {
      console.error('Erreur validateVente:', error);
      alert(`❌ Erreur réseau: ${error.message}`);
    }
  }
}
```

### Event Listeners dans vente.php

```javascript
// Quand modal guichet s'ouvre
document.getElementById('modalSelectGuichet').addEventListener('show.bs.modal', () => {
  venteManager.displayGuichets();
});

// Quand utilisateur change de magasin
function onMagasinChange() {
  const magasinId = venteManager.currentMagasin;
  venteManager.loadGuichets(magasinId);
}
```

---

## 🎬 Cas d'Utilisation

### Cas 1: Vendeur Standard Vend

```
1. Vendeur se connecte (JWT token = user_123, role=VENDEUR)
2. Sélectionne magasin "Stock Central"
3. Guichets chargent: [G1, G2, G3]
4. Premier guichet auto-sélectionné (G1)
5. Ajoute produits au panier
6. Clique "Valider"

→ POST /api/protected/ventes
{
  magasinId: "mag_001",
  guichetId: "guichet_1",
  articles: [...],
  utilisateurId: "user_123" (du JWT)
}

→ Response vente créée avec:
utilisateurId: {id: user_123, nom: Robert, role: VENDEUR}
guichetId: {nom: G1, vendeurPrincipal: {id: user_123}}
```

### Cas 2: Superviseur Vend via Guichet d'un Autre Vendeur

```
1. Superviseur connecté (JWT token = user_456, role=SUPERVISEUR)
2. Sélectionne magasin "Stock Central"
3. Guichets chargent: [G1, G2, G3]
4. Sélectionne "G2" (vendeur assigné = Robert, user_123)
5. Ajoute produits et valide

→ POST /api/protected/ventes
{
  magasinId: "mag_001",
  guichetId: "guichet_2",
  articles: [...],
  utilisateurId: "user_456" (du JWT - SUPERVISEUR)
}

→ Response vente créée avec:
utilisateurId: {id: user_456, nom: Jean, role: SUPERVISEUR}
guichetId: {
  nom: G2,
  vendeurPrincipal: {id: user_123, nom: Robert}  ← Différent!
}

⚠️ Détail important: user_456 ≠ vendeur G2
→ Supervise a couvert le vendeur de G2
```

### Cas 3: Admin Crée une Vente

```
1. Admin connecté (JWT = user_789, role=ADMIN)
2. Sélectionne un magasin et un guichet
3. Crée une vente

→ utilisateurId: {id: user_789, nom: Alice, role: ADMIN}
→ Admin peut créer ventes même si elle a un autre rôle principal
```

---

## 🐛 Debugging

### Vérifier les Rôles

```javascript
// Frontend - Vérifier le JWT
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Rôles du JWT:', payload.role); // ['VENDEUR', 'SUPERVISEUR']
```

### Vérifier les API Responses

```javascript
// Browser DevTools - Vérifier une réponse POST /ventes
fetch('/api/protected/ventes', {...})
  .then(r => r.json())
  .then(data => {
    console.log('Utilisateur (qui a vendu):', data.vente.utilisateurId);
    console.log('Guichet:', data.vente.guichetId);
    console.log('Vendeur du guichet:', data.vente.guichetId.vendeurPrincipal);
  });
```

### Vérifier les Populations en Backend

```javascript
// Dans routes/ventes.js - Ajouter des logs
router.post('/ventes', authMiddleware, async (req, res) => {
  console.log('req.user.id:', req.user.id);           // Qui vend
  console.log('req.body.guichetId:', req.body.guichetId); // Quel guichet
  
  const vente = new Vente({
    utilisateurId: req.user.id,
    guichetId: req.body.guichetId,
    // ...
  });
  
  const populated = await Vente.findById(vente._id)
    .populate('utilisateurId')
    .populate({
      path: 'guichetId',
      populate: { path: 'vendeurPrincipal' }
    });
  
  console.log('Vente populée:', JSON.stringify(populated, null, 2));
});
```

### Erreurs Courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `utilisateurId is null` | JWT absent ou invalide | Vérifier localStorage['token'] |
| `guichetId is null` | Frontend ne passe pas guichetId | Ajouter guichetId au body POST |
| `guichetId.vendeurPrincipal` est null | Guichet mal populé | Vérifier populate dans routes |
| 401 Unauthorized | Token expiré ou invalide | Rafraîchir le JWT |
| 404 Vente non trouvée | Mauvais ID | Vérifier le venteId dans URL |

---

## ✅ Checklist Implémentation

- [x] Modèle Vente avec guichetId et utilisateurId
- [x] Endpoint POST /api/protected/ventes
  - [x] Accepte guichetId et magasinId
  - [x] Récupère utilisateurId du JWT
  - [x] Valide stock
  - [x] Crée mouvements de stock
  - [x] Retourne vente populée
- [x] Endpoint GET /api/protected/ventes/:venteId
  - [x] Population complète utilisateurId
  - [x] Population complète guichetId.vendeurPrincipal
  - [x] Population articles
- [x] Endpoint GET /api/protected/magasins/:magasinId/guichets
  - [x] Retourne guichets avec vendeurPrincipal populé
- [x] Frontend loadGuichets()
  - [x] Appel API pour charger guichets
  - [x] Auto-sélection du premier
  - [x] Affichage du guichet sélectionné
- [x] Frontend displayGuichets()
  - [x] Modal de sélection
  - [x] Liste des guichets avec vendeurs
- [x] Frontend validateVente()
  - [x] Vérifie guichet sélectionné
  - [x] Envoie guichetId au backend
  - [x] Affiche nom du vendeur en réponse

---

**Version:** 1.0  
**Status:** ✅ Complètement Implémenté  
**Dernière mise à jour:** 2026-01-08
