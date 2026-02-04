# 📱 Documentation API Mobile - Phase 1 v2 (Ventes LOT/Unités)

**Version:** 2.0  
**Date:** 26/01/2026  
**Base URL:** `https://localhost:3001` (dev) ou `https://backend-gestion-de-stock.onrender.com` (prod)

---

## 🎯 Résumé Phase 1 v2

Phase 1 v2 introduit la gestion avancée des **ventes par LOT complet** ou **par unités individuelles**. Les API sont maintenant enrichies pour supporter :

- ✅ Distinction LOT vs SIMPLE products
- ✅ Mode de Vente (par unités / LOT entier)
- ✅ Stock dynamique par mode
- ✅ Calcul d'occupation des rayons excluant articles épuisés
- ✅ Factures avec détails de mode de vente
- ✅ Notifications toast en temps réel

---

## 📋 Table des matières

1. [🔐 Authentification](#authentification)
2. [📦 Magasins & Guichets](#magasins)
3. [📋 Produits & Stock](#produits)
4. [💰 Ventes](#ventes)
5. [📊 Mode de Vente (Phase 1 v2)](#mode-vente)
6. [🆕 Endpoints Phase 1 v2](#endpoints-phase1-v2)
7. [📱 Implémentation Mobile](#mobile-impl)
8. [⚠️ Gestion Erreurs](#erreurs)

---

## 🔐 Authentification {#authentification}

### POST /api/auth/login

Authentifier un utilisateur et obtenir un token JWT (requis pour tous les endpoints protégés).

#### Request
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "vendeur@magasin.com",
  "password": "password123"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "691eebe005d8333cd988f743",
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "vendeur@magasin.com",
    "role": "vendeur",
    "telephone": "221701234567",
    "photoUrl": "https://res.cloudinary.com/...",
    "businessId": "691eebe005d8333cd988f700",
    "affectations": [
      {
        "magasinId": "693bf84f9955cef110cae98b",
        "guichetId": "693bf84f9955cef110cae9c1",
        "status": "actif"
      }
    ]
  }
}
```

#### Stockage Mobile (Flutter/React Native)
```dart
// Sauvegarder le token
await storage.write(
  key: 'auth_token',
  value: response['token']
);

// Utiliser dans tous les headers
headers: {
  'Authorization': 'Bearer $token',
  'Content-Type': 'application/json'
}
```

---

## 📦 Magasins & Guichets {#magasins}

### GET /api/protected/magasins

Liste tous les magasins accessibles à l'utilisateur connecté.

#### Request
```bash
GET /api/protected/magasins
Authorization: Bearer {{TOKEN}}
```

#### Response (200 OK)
```json
{
  "success": true,
  "magasins": [
    {
      "_id": "693bf84f9955cef110cae98b",
      "nom": "Magasin Central Dakar",
      "nom_magasin": "Central",
      "adresse": "123 Rue du Commerce",
      "ville": "Dakar",
      "telephone": "221701234567",
      "photoUrl": "https://res.cloudinary.com/...",
      "businessId": {
        "_id": "691eebe005d8333cd988f700",
        "nomEntreprise": "Groupe Commerce SA",
        "email": "commerce@exemple.com",
        "budget": 50000,
        "devise": "USD"
      },
      "nombreRayons": 5,
      "nombreGuichets": 3,
      "nombreProduits": 42
    }
  ]
}
```

#### Headers requis
```
Authorization: Bearer {TOKEN}
Content-Type: application/json
```

---

## 📋 Produits & Stock {#produits}

### GET /api/protected/produits?magasinId={ID}

Récupère tous les produits d'un magasin avec calcul du stock par type.

#### Request
```bash
GET /api/protected/produits?magasinId=693bf84f9955cef110cae98b
Authorization: Bearer {{TOKEN}}
```

#### Response (200 OK)
```json
{
  "success": true,
  "produits": [
    {
      "_id": "prod_001",
      "designation": "Riz Gold Premium",
      "reference": "RIZ-001",
      "description": "Riz de haute qualité",
      "prixUnitaire": 2.50,
      "quantiteActuelle": 320,
      "seuilAlerte": 50,
      "photoUrl": "https://res.cloudinary.com/...",
      "typeProduitId": {
        "_id": "type_001",
        "nomType": "Céréales",
        "typeStockage": "lot",  // ⭐ "lot" ou "simple"
        "capaciteMax": 100,
        "icone": "🌾",
        "unitePrincipale": "unité"
      },
      "magasinId": "693bf84f9955cef110cae98b",
      "rayonsAssocies": [
        {
          "_id": "rayon_001",
          "nomRayon": "Rayon Riz",
          "codeRayon": "R001",
          "capaciteMax": 100,
          "occupationActuelle": 45,
          "taux": 45,
          "nombreArticles": 45,
          "nombreArticlesDisponibles": 35
        }
      ],
      "lotsTotal": 0,
      "lotsComplet": 0,
      "lotsPartielVendu": 0,
      "lotsEpuise": 0
    },
    {
      "_id": "prod_002",
      "designation": "Carton Oeufs x30",
      "reference": "OEU-002",
      "prixUnitaire": 5.00,
      "quantiteActuelle": 120,
      "photoUrl": "https://res.cloudinary.com/...",
      "typeProduitId": {
        "_id": "type_002",
        "nomType": "Laitiers",
        "typeStockage": "lot",  // ⭐ Type LOT
        "capaciteMax": 50,
        "icone": "🥚",
        "unitePrincipale": "carton"
      },
      "lotsTotal": 9,          // ⭐ PHASE 1 v2: Nombre total de LOTs
      "lotsComplet": 7,        // ⭐ LOTs complets (status: complet)
      "lotsPartielVendu": 2,   // ⭐ LOTs partiellement vendus (status: partiel_vendu)
      "lotsEpuise": 0          // ⭐ LOTs épuisés (status: épuisé)
    }
  ]
}
```

---

## 🆕 Endpoints Phase 1 v2 {#endpoints-phase1-v2}

### GET /api/protected/produits/:produitId/lots-disponibles

**[NOUVEAU]** Récupère les LOTs disponibles pour un produit spécifique.

#### Request
```bash
GET /api/protected/produits/prod_002/lots-disponibles
Authorization: Bearer {{TOKEN}}
```

#### Response (200 OK)
```json
{
  "success": true,
  "produitId": "prod_002",
  "typeStockage": "lot",
  "lotsDisponibles": 9,  // ⭐ Nombre de LOTs vendables
  "lotsDetails": [
    {
      "_id": "lot_001",
      "reference": "LOT-OEU-2601-001",
      "quantiteInitiale": 30,
      "quantiteRestante": 30,
      "status": "complet",  // complet | partiel_vendu | épuisé
      "dateCreation": "2026-01-20T10:30:00Z",
      "prixUnitaireLot": 150,  // Prix du LOT complet
      "rayonId": "rayon_002"
    },
    {
      "_id": "lot_002",
      "reference": "LOT-OEU-2601-002",
      "quantiteInitiale": 30,
      "quantiteRestante": 15,
      "status": "partiel_vendu",  // Partiellement vendu
      "prixUnitaireLot": 150,
      "rayonId": "rayon_002"
    }
  ]
}
```

---

## 💰 Ventes {#ventes}

### POST /api/protected/ventes

Créer une nouvelle vente avec support Phase 1 v2 (LOT/unités).

#### Request
```bash
POST /api/protected/ventes
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "magasinId": "693bf84f9955cef110cae98b",
  "guichetId": "693bf84f9955cef110cae9c1",
  "utilisateurId": "691eebe005d8333cd988f743",
  "client": "Jean Dupont",
  "montantTotal": 125.50,
  "montantPaye": 125.50,
  "tauxFC": 650,  // Taux de change USD -> FC (optionnel)
  "articles": [
    {
      "produitId": "prod_001",
      "quantite": 10,
      "prixUnitaire": 2.50,
      "montant": 25.00,
      "rayonId": "rayon_001",
      "typeVente": "partiel"  // 🔥 Phase 1 v2: "entier" pour LOT complet | "partiel" pour unités
    },
    {
      "produitId": "prod_002",
      "quantite": 2,  // 2 LOTs complets
      "prixUnitaire": 150,  // Prix du LOT
      "montant": 300.00,
      "rayonId": "rayon_002",
      "typeVente": "entier"  // 🔥 Vente de 2 LOTs complets
    }
  ],
  "observations": "Client VIP"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "vente": {
    "_id": "vente_12345",
    "magasinId": {
      "_id": "693bf84f9955cef110cae98b",
      "nom": "Magasin Central Dakar",
      "businessId": {
        "_id": "691eebe005d8333cd988f700",
        "nomEntreprise": "Groupe Commerce SA"
      }
    },
    "montantTotal": 125.50,
    "articles": [
      {
        "produitId": {
          "designation": "Riz Gold Premium",
          "typeProduitId": {
            "typeStockage": "simple"
          }
        },
        "quantite": 10,
        "prixUnitaire": 2.50,
        "montant": 25.00,
        "typeVente": "partiel"
      },
      {
        "produitId": {
          "designation": "Carton Oeufs x30",
          "typeProduitId": {
            "typeStockage": "lot"
          }
        },
        "quantite": 2,
        "prixUnitaire": 150,
        "montant": 300.00,
        "typeVente": "entier"  // 🔥 Mode LOT complet
      }
    ],
    "dateCreation": "2026-01-26T14:30:00Z",
    "status": "validee"
  }
}
```

#### Codes d'erreur
- `400` - Articles manquants ou données invalides
- `401` - Token invalide/expiré
- `403` - Pas d'accès au magasin/guichet
- `404` - Produit ou magasin non trouvé
- `422` - Stock insuffisant

---

### GET /api/protected/ventes/:venteId

Récupère les détails complets d'une vente (avec affichage Mode de Vente).

#### Request
```bash
GET /api/protected/ventes/vente_12345
Authorization: Bearer {{TOKEN}}
```

#### Response (200 OK)
```json
{
  "_id": "vente_12345",
  "magasinId": {
    "_id": "693bf84f9955cef110cae98b",
    "nom_magasin": "Central",
    "nom": "Magasin Central Dakar",
    "adresse": "123 Rue du Commerce",
    "businessId": {
      "_id": "691eebe005d8333cd988f700",
      "nomEntreprise": "Groupe Commerce SA",
      "email": "commerce@exemple.com"
    }
  },
  "utilisateurId": {
    "_id": "691eebe005d8333cd988f743",
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "vendeur@magasin.com"
  },
  "guichetId": {
    "_id": "693bf84f9955cef110cae9c1",
    "nom_guichet": "Guichet 1"
  },
  "client": "Jean Dupont",
  "montantTotal": 425.00,
  "montantPaye": 425.00,
  "montantRestant": 0,
  "articles": [
    {
      "_id": "art_001",
      "produitId": {
        "_id": "prod_001",
        "designation": "Riz Gold Premium",
        "reference": "RIZ-001",
        "prixUnitaire": 2.50,
        "typeProduitId": {
          "_id": "type_001",
          "nomType": "Céréales",
          "typeStockage": "simple",
          "icone": "🌾"
        }
      },
      "quantite": 10,
      "prixUnitaire": 2.50,
      "montant": 25.00,
      "rayonId": {
        "_id": "rayon_001",
        "nomRayon": "Rayon Riz",
        "codeRayon": "R001"
      },
      "typeVente": "partiel"  // 🔥 Mode unités
    },
    {
      "_id": "art_002",
      "produitId": {
        "_id": "prod_002",
        "designation": "Carton Oeufs x30",
        "reference": "OEU-002",
        "typeProduitId": {
          "_id": "type_002",
          "nomType": "Laitiers",
          "typeStockage": "lot",
          "icone": "🥚"
        }
      },
      "quantite": 2,
      "prixUnitaire": 150,
      "montant": 300.00,
      "rayonId": {
        "_id": "rayon_002",
        "nomRayon": "Rayon Laitiers",
        "codeRayon": "R002"
      },
      "typeVente": "entier"  // 🔥 Mode LOT complet
    }
  ],
  "dateCreation": "2026-01-26T14:30:00Z",
  "status": "validee"
}
```

---

### GET /api/protected/ventes

Récupère la liste des ventes du jour/mois avec pagination.

#### Query Parameters
```
magasinId  - Filtrer par magasin (REQUIS)
dateDebut  - Date début (ISO 8601)
dateFin    - Date fin (ISO 8601)
page       - Numéro page (défaut: 1)
limit      - Résultats par page (défaut: 20)
```

#### Request
```bash
GET /api/protected/ventes?magasinId=693bf84f9955cef110cae98b&page=1&limit=10
Authorization: Bearer {{TOKEN}}
```

#### Response (200 OK)
```json
{
  "success": true,
  "ventes": [
    { /* structure identique à GET /ventes/:id */ }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 145,
    "pages": 15
  }
}
```

---

## 📊 Mode de Vente (Phase 1 v2) {#mode-vente}

### Logique Mode de Vente

```
Product Type: LOT (typeStockage = "lot")
├─ Mode 1: "par unités" (typeVente = "partiel")
│  ├─ Affichage: 320 unités
│  ├─ Stock: quantiteActuelle
│  └─ Vente: Vendre X unités du LOT
│
└─ Mode 2: "LOT entier" (typeVente = "entier")
   ├─ Affichage: 9 LOTs
   ├─ Stock: lotsDisponibles (LOTs complets + partiels)
   └─ Vente: Vendre Y LOTs complets
```

### Implémentation Mobile (Flutter)

#### 1. Déterminer le type de produit
```dart
String typeStockage = produit['typeProduitId']['typeStockage'];

if (typeStockage == 'lot') {
  // Afficher le mode selector (radio buttons)
  // Mode 1: Par unités
  // Mode 2: LOT entier
} else {
  // Mode selector hidden (simple product)
}
```

#### 2. Affichage du stock selon le mode
```dart
String modeVente = selectedMode; // "partiel" ou "entier"
int stock = 0;

if (modeVente == "partiel") {
  stock = produit['quantiteActuelle']; // 320
  unitLabel = "unités";
} else if (modeVente == "entier") {
  stock = produit['lotsDisponibles']; // 9
  unitLabel = "LOTs";
}

Text("Stock: $stock $unitLabel");
```

#### 3. Créer une vente
```dart
Map<String, dynamic> article = {
  'produitId': produit['_id'],
  'quantite': quantity,  // 10 unités ou 2 LOTs
  'prixUnitaire': prixUnitaire,  // Prix par unité ou par LOT
  'rayonId': rayonId,
  'typeVente': selectedMode  // "partiel" ou "entier"
};
```

---

## 📱 Implémentation Mobile {#mobile-impl}

### Flutter Implementation Example

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class VenteService {
  final String baseUrl = 'http://localhost:3001/api';
  String? token;

  // 1. Login
  Future<void> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      token = data['token'];
      // Sauvegarder le token
      await _saveToken(token!);
    } else {
      throw Exception('Login failed');
    }
  }

  // 2. Récupérer les produits
  Future<List<dynamic>> getProduits(String magasinId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/protected/produits?magasinId=$magasinId'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['produits'];
    } else {
      throw Exception('Failed to load products');
    }
  }

  // 3. Récupérer les LOTs disponibles
  Future<Map<String, dynamic>> getLotsDisponibles(String produitId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/protected/produits/$produitId/lots-disponibles'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load lots');
    }
  }

  // 4. Créer une vente
  Future<Map<String, dynamic>> createVente({
    required String magasinId,
    required String guichetId,
    required String utilisateurId,
    required String client,
    required List<Map<String, dynamic>> articles,
    required double montantTotal,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/protected/ventes'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'magasinId': magasinId,
        'guichetId': guichetId,
        'utilisateurId': utilisateurId,
        'client': client,
        'articles': articles,
        'montantTotal': montantTotal,
        'montantPaye': montantTotal,
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create sale');
    }
  }

  // 5. Récupérer une vente
  Future<Map<String, dynamic>> getVente(String venteId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/protected/ventes/$venteId'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load sale');
    }
  }
}
```

### React Native Implementation

```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

class VenteService {
  constructor() {
    this.token = null;
  }

  async login(email, password) {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
      });
      this.token = response.data.token;
      await this.saveToken(this.token);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getProduits(magasinId) {
    try {
      const response = await axios.get(
        `${API_BASE}/protected/produits?magasinId=${magasinId}`,
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );
      return response.data.produits;
    } catch (error) {
      throw error;
    }
  }

  async getLotsDisponibles(produitId) {
    try {
      const response = await axios.get(
        `${API_BASE}/protected/produits/${produitId}/lots-disponibles`,
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createVente(venteData) {
    try {
      const response = await axios.post(
        `${API_BASE}/protected/ventes`,
        venteData,
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}
```

---

## ⚠️ Gestion Erreurs {#erreurs}

### Codes d'Erreur Standard

```json
{
  "400": {
    "message": "Requête invalide",
    "détails": "Vérifiez les paramètres et le format JSON"
  },
  "401": {
    "message": "Non authentifié",
    "détails": "Token manquant ou invalide"
  },
  "403": {
    "message": "Accès refusé",
    "détails": "Vous n'avez pas accès à cette ressource"
  },
  "404": {
    "message": "Non trouvé",
    "détails": "Ressource inexistante"
  },
  "422": {
    "message": "Données invalides",
    "détails": "Validation échouée (stock insuffisant, données manquantes)"
  },
  "500": {
    "message": "Erreur serveur",
    "détails": "Contactez l'administrateur"
  }
}
```

### Gestion des erreurs en Flutter

```dart
try {
  await venteService.createVente(
    magasinId: selectedMagasin['_id'],
    articles: selectedArticles,
    montantTotal: total,
  );
  
  // Succès
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text('✅ Vente enregistrée!')),
  );
} on SocketException {
  // Erreur réseau
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text('❌ Erreur réseau')),
  );
} catch (error) {
  // Autre erreur
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text('❌ Erreur: $error')),
  );
}
```

---

## 🔧 Configuration Mobile

### Variables d'Environnement (.env)

```env
API_BASE_URL=http://localhost:3001/api
API_TIMEOUT=30000
STORAGE_KEY_TOKEN=auth_token
STORAGE_KEY_USER=current_user
```

### Interceptors (Error Handling)

```dart
// Interceptor pour token expiré
dio.interceptors.add(InterceptorsWrapper(
  onRequest: (options, handler) {
    options.headers['Authorization'] = 'Bearer $token';
    return handler.next(options);
  },
  onError: (error, handler) {
    if (error.response?.statusCode == 401) {
      // Token expiré, rediriger vers login
      navigateToLogin();
    }
    return handler.next(error);
  },
));
```

---

## 📋 Checklist d'Intégration Mobile

- [ ] Authentification et stockage du token
- [ ] Listing des magasins avec sélection
- [ ] Listing des produits avec filtrage
- [ ] Détection du type de produit (LOT vs SIMPLE)
- [ ] Affichage conditionnel du sélecteur Mode de Vente
- [ ] Fetch des LOTs disponibles
- [ ] Calcul et affichage dynamique du stock
- [ ] Création de vente avec articles
- [ ] Support typeVente (entier/partiel)
- [ ] Gestion des erreurs et affichage
- [ ] Tests complets end-to-end
- [ ] Implémentation des toasts notifications

---

## 🧪 Test avec Postman

Collection Postman incluant tous les endpoints: [POSTMAN_MOBILE_API.json](../POSTMAN_MOBILE_API.json)

### Quick Test Sequence:
1. **POST** `/api/auth/login` → Récupérer le token
2. **GET** `/api/protected/magasins` → Lister magasins
3. **GET** `/api/protected/produits?magasinId=...` → Lister produits
4. **GET** `/api/protected/produits/{id}/lots-disponibles` → Récupérer LOTs (si type="lot")
5. **POST** `/api/protected/ventes` → Créer vente
6. **GET** `/api/protected/ventes/{id}` → Vérifier vente créée

---

**Dernière mise à jour:** 26/01/2026
**Auteur:** Dev Team
**Status:** ✅ Production Ready
