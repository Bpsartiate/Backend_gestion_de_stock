# 🔗 Comment Tout Fonctionne Ensemble - Guide Visuel

## 🎯 Vue 30 Secondes

```
USER: Admin Jean se connecte
      ↓
FRONTEND: Jean va à vente.php
      ↓
UI: Sélectionne magasin "Stock A"
      ↓
JS: Appelle loadGuichets("stock_a")
      ↓
API: GET /magasins/stock_a/guichets
      ↓
RESPONSE: [Guichet1 (vendeur Robert), Guichet2 (vendeur Marie), ...]
      ↓
UI: Orange banner: "Guichet 1 | Robert | Change"
      ↓
JEAN: Peut cliquer "Change" si veut autre guichet
      ↓
JEAN: Ajoute produits au panier
      ↓
JEAN: Clique "Valider Vente"
      ↓
JS: validateVente() envoie:
    {magasinId, guichetId: "G1", articles, ...}
      ↓
BACKEND: POST /ventes
      ├─ Récupère utilisateurId du JWT (Jean)
      ├─ Reçoit guichetId du body (G1)
      ├─ Valide stocks
      ├─ Crée Vente dans DB
      └─ Retourne JSON avec:
         utilisateurId: {nom: "Jean", role: "ADMIN", ...}
         guichetId: {nom: "Guichet 1", vendeurPrincipal: {nom: "Robert"}}
         articles: [...]
      ↓
FRONTEND: Affiche "✅ Vente enregistrée par Jean Dupont"
      ↓
RESULT: Vente tracée - Jean (ADMIN) a vendu via Guichet 1 (normally Robert's)
```

---

## 🏗️ Architecture en Couches

```
┌────────────────────────────────────────────────────────────┐
│                    UTILISATEUR FINAL                       │
│                  (Admin/Superviseur/Vendeur)              │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                   INTERFACE (vente.php)                    │
│                                                            │
│  Orange Banner: "🪟 Guichet Sélectionné"               │
│  [Magasin ▼] [Produits] [Guichet N]                    │
│  [Products Grid]        [Form]      [Panier]           │
│  │                      │           │                   │
│  │                      │           │                   │
│  Bouton "Change"────────┘           │                   │
│                                      │                   │
│                                  Bouton "Valider"        │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│              JAVASCRIPT FRONTEND (vente.js)               │
│                                                            │
│  VenteManager {                                           │
│    currentGuichet: "G1_ID"                               │
│    guichets: [...]                                        │
│                                                            │
│    loadGuichets(magId) → Charge guichets du magasin      │
│    displayGuichets() → Affiche modal de sélection        │
│    selectGuichet(id) → Change le guichet sélectionné    │
│    updateGuichetDisplay() → Met à jour l'affichage      │
│    validateVente() → Envoie guichetId au backend        │
│  }                                                        │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                    HTTP REQUESTS                          │
│                                                            │
│  1. GET /magasins/:id/guichets                           │
│  2. POST /ventes {magasinId, guichetId, articles, ...}  │
│  3. GET /ventes (refresh historique)                    │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js)                        │
│                                                            │
│  routes/protected.js:                                     │
│  ├─ GET /magasins/:id/guichets                          │
│  │  └─ Retourne guichets avec vendeurPrincipal peuplé  │
│  │                                                        │
│  routes/ventes.js:                                       │
│  ├─ POST /ventes (authMiddleware)                       │
│  │  ├─ Extract utilisateurId from JWT                  │
│  │  ├─ Extract guichetId from body                     │
│  │  ├─ Valide stocks                                    │
│  │  ├─ Create Vente document                            │
│  │  ├─ Create StockMovement SORTIE                     │
│  │  └─ Return vente populée                             │
│  │                                                        │
│  ├─ GET /ventes (avec population complète)            │
│  └─ GET /ventes/:id (avec population complète)        │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                  BASE DE DONNÉES (MongoDB)               │
│                                                            │
│  Collections:                                             │
│  ├─ ventes                                                │
│  │  ├─ _id: ObjectId                                     │
│  │  ├─ utilisateurId: Ref(Utilisateur) ← QUI A VENDU    │
│  │  ├─ guichetId: Ref(Guichet) ← OÙ VENDU              │
│  │  ├─ magasinId: Ref(Magasin)                          │
│  │  ├─ articles: [                                       │
│  │  │    {produitId, rayonId, quantite, prixUnitaire}  │
│  │  │ ]                                                  │
│  │  └─ dateVente, montantTotalUSD, ...                 │
│  │                                                        │
│  ├─ guichets                                              │
│  │  ├─ _id: ObjectId                                     │
│  │  ├─ nom_guichet: String                              │
│  │  ├─ code: String                                      │
│  │  ├─ vendeurPrincipal: Ref(Utilisateur) ← ASSIGNÉ    │
│  │  └─ magasinId: Ref(Magasin)                          │
│  │                                                        │
│  ├─ utilisateurs                                          │
│  │  ├─ _id: ObjectId                                     │
│  │  ├─ nom, prenom, email                                │
│  │  └─ role: [ADMIN|SUPERVISEUR|VENDEUR]                │
│  │                                                        │
│  └─ Et d'autres...                                        │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux de Données Complet

### Étape 1: Sélection Magasin

```
USER sélectionne magasin
        ↓
onMagasinChange() triggered
        ↓
loadGuichets(magasinId)
        ↓
fetch('/api/protected/magasins/{magasinId}/guichets')
        ↓
BACKEND retourne:
[
  {
    _id: "G1",
    nom_guichet: "Guichet 1",
    vendeurPrincipal: {
      _id: "user_123",
      nom: "Robert"
    }
  },
  ...
]
        ↓
VenteManager.guichets = response
        ↓
currentGuichet = guichets[0]._id  (Auto-select)
        ↓
updateGuichetDisplay()
        ↓
FRONTEND affiche:
"🪟 Guichet 1 | Robert | [Change]"
```

### Étape 2: Validation Vente

```
USER clique "Valider"
        ↓
validateVente()
        ↓
Prépare body:
{
  magasinId: "mag_001",
  guichetId: "G1",        ← CLÉS: Frontend envoie guichet
  articles: [...],
  modePaiement: "CASH",
  tauxFC: 2650
}
        ↓
POST /api/protected/ventes
{headers: {Authorization: "Bearer {JWT}"}}
        ↓
BACKEND authMiddleware:
req.user.id = decrypt JWT = "user_456" (Jean)
        ↓
BACKEND routes/ventes.js:
vente = new Vente({
  utilisateurId: "user_456",      ← Du JWT (qui a vraiment vendu)
  guichetId: "G1",                 ← Du body (où vendu)
  magasinId: "mag_001",
  articles: [...],
  ...
})
        ↓
Valide stocks
        ↓
vente.save()
        ↓
Crée StockMovements
        ↓
POPULATE response:
vente.populate('utilisateurId')  → nom: Jean, role: ADMIN
vente.populate('guichetId')      
  .populate('guichetId.vendeurPrincipal') → Robert
vente.populate('articles.produitId')
  .populate('produitId.typeProduitId')
vente.populate('articles.rayonId')
        ↓
Retourne JSON:
{
  _id: "vente_001",
  utilisateurId: {
    _id: "user_456",
    nom: "Jean",
    role: "ADMIN"        ← ⚠️ ADMIN a vendu!
  },
  guichetId: {
    _id: "G1",
    nom_guichet: "Guichet 1",
    vendeurPrincipal: {
      _id: "user_123",
      nom: "Robert"       ← Different de utilisateurId!
    }
  },
  articles: [...]        ← Tous les détails
}
        ↓
FRONTEND reçoit response
        ↓
alert("✅ Vente enregistrée par Jean Dupont")
        ↓
Panier = vide
        ↓
Rafraîchit historique
```

---

## 🎯 Points Critiques à Comprendre

### 1. Deux Niveaux de Traçabilité

```
NIVEAU 1: Qui a créé la vente
──────────────────────────────
Source: JWT Token (automatique)
Field: vente.utilisateurId
Valeur: L'ID de la personne connectée
Peut être: ADMIN | SUPERVISEUR | VENDEUR
Implication: Responsabilité et permissions


NIVEAU 2: Par quel guichet
──────────────────────────
Source: Frontend (le user choisit)
Field: vente.guichetId
Valeur: L'ID du guichet sélectionné
Info: Inclut vendeurPrincipal du guichet


DÉTECTION DE COUVERTURE:
if (vente.utilisateurId.id !== vente.guichetId.vendeurPrincipal.id &&
    vente.utilisateurId.role in ["SUPERVISEUR", "ADMIN"]) {
  // Superviseur/Admin a couvert le vendeur!
}
```

### 2. Hiérarchie des Permissions

```
┌──────────────────────────────────────────┐
│ ADMIN [ADMIN, VENDEUR]                   │
│ ├─ Peut vendre via n'importe quel guichet│
│ ├─ Peut modifier/annuler ventes         │
│ ├─ Peut assigner vendeurs à guichets    │
│ └─ Couverture temporaire autorisée      │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│ SUPERVISEUR [SUPERVISEUR, VENDEUR]       │
│ ├─ Peut vendre via guichets du magasin  │
│ ├─ Peut couvrir les vendeurs            │
│ ├─ Peut voir historique du magasin      │
│ └─ Peut modifier rapports                │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│ VENDEUR [VENDEUR]                        │
│ ├─ Peut vendre via son guichet          │
│ ├─ Peut voir ses propres ventes         │
│ └─ Pas de modification de configuration │
└──────────────────────────────────────────┘
```

### 3. Flux des Données dans les APIs

```
REQUÊTE:
────────
POST /api/protected/ventes
{
  Authorization: "Bearer JWT_token"
  Body: {magasinId, guichetId, articles, ...}
}

↓↓↓ BACKEND ↓↓↓

TRAITEMENT:
───────────
1. Décoder JWT → utilisateurId = "user_456"
2. Lire body → guichetId = "G1", magasinId = "mag_001"
3. Valider stocks
4. Créer Vente {utilisateurId, guichetId, magasinId, articles}
5. Créer StockMovements
6. POPULER: utilisateurId, guichetId (avec vendeurPrincipal), articles

↓↓↓ RESPONSE ↓↓↓

RÉPONSE:
────────
{
  utilisateurId: {
    _id: "user_456",
    nom: "Jean",
    email: "jean@...",
    role: "ADMIN",
    photoUrl: "...",
    telephone: "..."
  },
  guichetId: {
    _id: "G1",
    nom_guichet: "Guichet 1",
    code: "G1",
    vendeurPrincipal: {
      _id: "user_123",
      nom: "Robert",
      email: "robert@..."
    }
  },
  articles: [
    {
      produitId: {
        designation: "Riz 5kg",
        photoUrl: "...",
        typeProduitId: {nomType: "Grains"},
        prixUnitaire: 15.50
      },
      rayonId: {nomRayon: "Produits Secs"},
      quantite: 5,
      montantUSD: 77.50
    }
  ],
  montantTotalUSD: 77.50,
  modePaiement: "CASH",
  dateVente: "2026-01-08T14:30:00Z",
  statut: "VALIDÉE"
}

↓↓↓ FRONTEND ↓↓↓

AFFICHAGE:
──────────
✅ Vente enregistrée par Jean Dupont
(Affiche les détails de la vente
 avec toutes les infos: photos, types, rayons, etc.)
```

---

## 🔍 Exemple Réel Complet

### Scénario: Superviseur couvre le vendeur

```
SETUP:
──────
Magasin: "Stock A"
├─ Guichet 1: Assigné à Robert (VENDEUR)
├─ Guichet 2: Assigné à Marie (VENDEUR)
└─ Superviseur: Jean (SUPERVISEUR, VENDEUR)


TIMELINE:
─────────

10:00 - Jean se connecte
        JWT: {id: "jean_id", role: ["SUPERVISEUR", "VENDEUR"]}

10:05 - Jean accède vente.php
        VenteManager initialise

10:10 - Jean sélectionne "Stock A"
        onMagasinChange("stock_a")
        ↓
        loadGuichets("stock_a")
        ↓
        GET /magasins/stock_a/guichets
        ↓
        [
          {_id: "G1", nom: "Guichet 1", vendeurPrincipal: {id: "robert_id"}},
          {_id: "G2", nom: "Guichet 2", vendeurPrincipal: {id: "marie_id"}}
        ]
        ↓
        Affiche: "🪟 Guichet 1 | Robert | Change"

10:15 - Jean clique "Change" (Marie n'est pas venue)
        Modal s'ouvre
        ↓
        displayGuichets()
        ↓
        Affiche:
        [ Guichet 1 (Robert) ]
        [ Guichet 2 (Marie) ] ← Jean clique ici
        ↓
        selectGuichet("G2")
        ↓
        Affiche: "🪟 Guichet 2 | Marie | Change"

10:20 - Jean ajoute produits au panier

10:25 - Jean clique "Valider"
        validateVente()
        ↓
        body = {
          magasinId: "stock_a",
          guichetId: "G2",
          articles: [{produitId, quantite, prix}],
          modePaiement: "CASH"
        }
        ↓
        POST /api/protected/ventes
        Headers: {Authorization: "Bearer jean_token"}
        ↓
        Backend authMiddleware:
        req.user.id = "jean_id"
        ↓
        Backend reçoit:
        utilisateurId: "jean_id" (Jean du JWT)
        guichetId: "G2" (Du body)
        ↓
        Crée:
        Vente {
          utilisateurId: "jean_id",
          guichetId: "G2",
          articles: [...],
          dateVente: now(),
          statut: "VALIDÉE"
        }
        ↓
        Crée:
        StockMovement {
          type: "SORTIE",
          produit: ...,
          quantite: ...,
          utilisateurId: "jean_id",
          magasinId: "stock_a"
        }
        ↓
        POPULATE response
        ↓
        Retourne:
        {
          utilisateurId: {
            _id: "jean_id",
            nom: "Jean",
            role: "SUPERVISEUR"    ← KEY: SUPERVISEUR a vendu!
          },
          guichetId: {
            _id: "G2",
            nom_guichet: "Guichet 2",
            vendeurPrincipal: {
              _id: "marie_id",      ← KEY: DIFFERENT de utilisateurId!
              nom: "Marie"
            }
          },
          articles: [{...}, ...],
          montantTotalUSD: 245.50
        }

10:26 - Frontend affiche:
        ✅ Vente enregistrée par Jean Dupont
        [Détails de la vente avec toutes infos]
        ↓
        Historique rafraîchit
        ↓
        Panier se vide

RÉSULTAT:
─────────
✅ Vente enregistrée avec traçabilité complète:
   - Jean (SUPERVISEUR) a vendu
   - Via Guichet 2 (normalement Marie)
   - Stock decrementé correctement
   - Audit log: Jean a couvert Marie
```

---

## 📱 Pour Devs Mobile

Quand ils reçoivent cette vente via l'API, ils voient:

```dart
// Dart/Flutter
class Vente {
  String id;
  
  // 👤 QUI a vendu
  Utilisateur utilisateurId;  
  // → nom: "Jean", role: "SUPERVISEUR"
  
  // 🪟 OÙ c'est passé  
  Guichet guichetId;
  // → nom: "Guichet 2"
  // → vendeurPrincipal: Utilisateur(nom: "Marie")
  
  // 📦 QUOI a été vendu
  List<Article> articles;
  // → Chaque article a photos, type, rayon
  
  // 💵 COMBIEN ça coûte
  double montantTotalUSD;
  double montantTotalFC;  // optional
  
  DateTime dateVente;
  String statut;
}

// Afficher:
Text("Par: ${vente.utilisateurId.nom}")
Text("Guichet: ${vente.guichetId.nomGuichet}")
Text("Vendeur guichet: ${vente.guichetId.vendeurPrincipal.nom}")

// Détécter couverture:
if (vente.utilisateurId.id != vente.guichetId.vendeurPrincipal.id) {
  Text("⚠️ Vente par ${vente.utilisateurId.role}")
}
```

---

## ✅ Résumé Ultra-Simple

```
1. USER → Frontend envoie guichetId (sélectionné)
2. JWT  → Backend récupère utilisateurId (connecté)
3. DB   → Vente enregistre: utilisateurId + guichetId
4. API  → Retourne les deux complètement peuplés
5. UI   → Affiche qui a vraiment vendu
6. Audit→ Visible si admin/superviseur a couvert
```

---

**Compris? C'est simple!** 🎉
