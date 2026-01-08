# 📱 Guide Mobile Dev - Interpréter les Réponses de Ventes

## 🎯 Vue d'Ensemble

Quand vous récupérez une vente depuis l'API, voici les informations critiques à comprendre:

---

## 📥 Réponse API Complète

### GET /api/protected/ventes/:venteId

```json
{
  "_id": "vente_001",
  "dateVente": "2026-01-08T14:30:00Z",
  
  "utilisateurId": {
    "_id": "user_888",
    "nom": "Kamila",
    "prenom": "Mvila",
    "email": "kamila@stock.com",
    "role": "SUPERVISEUR",
    "photoUrl": "https://...",
    "telephone": "+243..."
  },
  
  "magasinId": {
    "_id": "mag_001",
    "nom_magasin": "Stock Principal",
    "nom": "Stock Principal",
    "adresse": "Kinshasa",
    "telephone": "+243...",
    "photoUrl": "...",
    "businessId": {
      "_id": "biz_001",
      "nom_entreprise": "MegaStock SARL"
    }
  },
  
  "guichetId": {
    "_id": "guichet_45",
    "nom_guichet": "Guichet 3",
    "code": "G3",
    "vendeurPrincipal": {
      "_id": "user_789",
      "nom": "Robert",
      "prenom": "Kabamba",
      "email": "robert@stock.com"
    }
  },
  
  "articles": [
    {
      "_id": "article_1",
      "produitId": {
        "_id": "prod_123",
        "designation": "Riz Blanc 5kg",
        "photoUrl": "https://...",
        "prixUnitaire": 15.50,
        "quantiteActuelle": 245,
        "typeProduitId": {
          "_id": "type_1",
          "nomType": "Produits Secs",
          "icone": "🌾"
        }
      },
      "rayonId": {
        "_id": "rayon_12",
        "nomRayon": "Grains"
      },
      "quantite": 5,
      "prixUnitaire": 15.50,
      "montantUSD": 77.50,
      "observations": "Client régulier"
    }
  ],
  
  "client": "Magasin ABC",
  "montantTotalUSD": 77.50,
  "tauxFC": 2650,
  "montantTotalFC": 205487.50,
  "modePaiement": "CASH",
  "observations": "Livraison demain",
  "statut": "VALIDÉE",
  "dateCreation": "2026-01-08T14:30:00Z"
}
```

---

## 🔑 Champs Importants Expliqués

### 1️⃣ `utilisateurId` - QUI a fait la vente

```json
"utilisateurId": {
  "_id": "user_888",
  "nom": "Kamila",
  "prenom": "Mvila",
  "email": "kamila@stock.com",
  "role": "SUPERVISEUR",
  "photoUrl": "https://...",
  "telephone": "+243..."
}
```

**Signification:**
- C'est la **personne qui a vraiment créé la vente**
- Peut être un ADMIN, SUPERVISEUR ou VENDEUR
- Son **rôle** détermine ses permissions

**Cas d'usage UI mobile:**
```dart
// Afficher qui a vendu
Text("Vente par: ${vente.utilisateurId.nom} ${vente.utilisateurId.prenom}")
Text("Rôle: ${vente.utilisateurId.role}")
Text("Email: ${vente.utilisateurId.email}")

// Si vous avez un avatar:
Image.network(vente.utilisateurId.photoUrl)
```

---

### 2️⃣ `guichetId` - OÙ la vente s'est passée

```json
"guichetId": {
  "_id": "guichet_45",
  "nom_guichet": "Guichet 3",
  "code": "G3",
  "vendeurPrincipal": {
    "_id": "user_789",
    "nom": "Robert",
    "prenom": "Kabamba",
    "email": "robert@stock.com"
  }
}
```

**Signification:**
- Le **guichet (point de caisse)** où la vente a été enregistrée
- `vendeurPrincipal` = le vendeur **normally assigned** à ce guichet
- Peut être **différent** de `utilisateurId` si un superviseur/admin a vendu

**Cas d'usage UI mobile:**
```dart
// Afficher le guichet
Text("Guichet: ${vente.guichetId.nomGuichet} (${vente.guichetId.code})")

// Afficher le vendeur assigné au guichet
Text("Vendeur du guichet: ${vente.guichetId.vendeurPrincipal.nom}")

// Comparaison: L'utilisateur qui a vendu est différent du vendeur normal?
if (vente.utilisateurId.id != vente.guichetId.vendeurPrincipal.id) {
  Text("⚠️ Vente par superviseur/admin!") // Marquer comme exceptionnel
}
```

---

### 3️⃣ Articles - QUOI a été vendu

```json
"articles": [
  {
    "produitId": {
      "_id": "prod_123",
      "designation": "Riz Blanc 5kg",
      "photoUrl": "https://...",
      "prixUnitaire": 15.50,
      "typeProduitId": {
        "nomType": "Produits Secs",
        "icone": "🌾"
      }
    },
    "rayonId": {
      "nomRayon": "Grains"
    },
    "quantite": 5,
    "montantUSD": 77.50
  }
]
```

**Signification:**
- Liste de **tous les produits** vendus dans cette vente
- Chaque article a **toutes les infos** (photo, type, rayon)
- Pas besoin d'appels API supplémentaires!

**Cas d'usage UI mobile:**
```dart
// Afficher chaque article
for (var article in vente.articles) {
  Card(
    child: Column(
      children: [
        Image.network(article.produitId.photoUrl),
        Text(article.produitId.designation),
        Text("Type: ${article.produitId.typeProduitId.nomType}"),
        Text("Rayon: ${article.rayonId.nomRayon}"),
        Text("Qté: ${article.quantite}x ${article.produitId.prixUnitaire} USD = ${article.montantUSD} USD")
      ],
    ),
  );
}
```

---

### 4️⃣ Montants - COMBIEN ça coûte

```json
"montantTotalUSD": 77.50,
"tauxFC": 2650,
"montantTotalFC": 205487.50,
"modePaiement": "CASH"
```

**Signification:**
- `montantTotalUSD` = total en dollars (devise principale)
- `montantTotalFC` = équivalent en francs congolais (si taux fourni)
- `modePaiement` = CASH, CARD, CREDIT, CHEQUE

**Cas d'usage UI mobile:**
```dart
// Afficher les montants
Text("Total: ${vente.montantTotalUSD} USD")

if (vente.montantTotalFC != null) {
  Text("Équivalent: ${vente.montantTotalFC} FC")
}

Text("Mode: ${vente.modePaiement}")
```

---

### 5️⃣ Magasin - LEQUEL magasin

```json
"magasinId": {
  "_id": "mag_001",
  "nom_magasin": "Stock Principal",
  "adresse": "Kinshasa",
  "businessId": {
    "nom_entreprise": "MegaStock SARL"
  }
}
```

**Signification:**
- Le magasin où la vente a été effectuée
- Inclut l'entreprise/business associée

**Cas d'usage UI mobile:**
```dart
Text("Magasin: ${vente.magasinId.nomMagasin}")
Text("Adresse: ${vente.magasinId.adresse}")
Text("Entreprise: ${vente.magasinId.businessId.nomEntreprise}")
```

---

## 🔄 Flux Typique Mobile

### Scénario: Afficher la Liste des Ventes du Jour

```dart
// 1. Appeler l'API
final response = await http.get(
  Uri.parse('$API_BASE/api/protected/ventes?magasinId=mag_001'),
  headers: {'Authorization': 'Bearer $token'}
);

// 2. Parser les ventes
List<Vente> ventes = parseVentes(response.body);

// 3. Afficher en ListTile
ListView.builder(
  itemCount: ventes.length,
  itemBuilder: (context, index) {
    final vente = ventes[index];
    return ListTile(
      leading: CircleAvatar(
        backgroundImage: NetworkImage(vente.utilisateurId.photoUrl),
      ),
      title: Text("${vente.utilisateurId.nom} ${vente.utilisateurId.prenom}"),
      subtitle: Text("Guichet: ${vente.guichetId.nomGuichet}"),
      trailing: Text("${vente.montantTotalUSD} USD"),
      onTap: () => showVenteDetails(vente),
    );
  }
)
```

---

### Scénario: Afficher Détails d'une Vente

```dart
class VenteDetailsPage extends StatelessWidget {
  final Vente vente;
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Détails Vente")),
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 🧑 Qui a vendu
              Card(
                child: Padding(
                  padding: EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Vendeur", style: TextStyle(fontWeight: FontWeight.bold)),
                      Row(
                        children: [
                          CircleAvatar(
                            backgroundImage: NetworkImage(vente.utilisateurId.photoUrl),
                            radius: 24,
                          ),
                          SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text("${vente.utilisateurId.nom} ${vente.utilisateurId.prenom}"),
                              Text("Rôle: ${vente.utilisateurId.role}", 
                                style: TextStyle(fontSize: 12, color: Colors.grey)
                              ),
                              Text(vente.utilisateurId.email, 
                                style: TextStyle(fontSize: 11)
                              ),
                            ],
                          )
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              
              // 🪟 Où ça s'est passé
              Card(
                child: Padding(
                  padding: EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Guichet", style: TextStyle(fontWeight: FontWeight.bold)),
                      Text("${vente.guichetId.nomGuichet} (${vente.guichetId.code})"),
                      Text("Vendeur: ${vente.guichetId.vendeurPrincipal.nom}",
                        style: TextStyle(fontSize: 12, color: Colors.grey)
                      ),
                    ],
                  ),
                ),
              ),
              
              // 📦 Produits vendus
              Card(
                child: Padding(
                  padding: EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Articles (${vente.articles.length})", 
                        style: TextStyle(fontWeight: FontWeight.bold)
                      ),
                      ...vente.articles.map((article) => ListTile(
                        leading: Image.network(article.produitId.photoUrl, 
                          width: 40, height: 40, fit: BoxFit.cover),
                        title: Text(article.produitId.designation),
                        subtitle: Text(
                          "${article.produitId.typeProduitId.nomType} • ${article.rayonId.nomRayon}"
                        ),
                        trailing: Text("${article.quantite}x ${article.prixUnitaire} = ${article.montantUSD}"),
                      )).toList(),
                    ],
                  ),
                ),
              ),
              
              // 💵 Montants
              Card(
                child: Padding(
                  padding: EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text("Total USD:"),
                          Text("${vente.montantTotalUSD}", 
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)
                          ),
                        ],
                      ),
                      if (vente.montantTotalFC != null)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text("Total FC:"),
                            Text("${vente.montantTotalFC}", 
                              style: TextStyle(color: Colors.blue)
                            ),
                          ],
                        ),
                      SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text("Mode:"),
                          Text(vente.modePaiement),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## ⚡ Points Importants

### ✅ À Faire

- ✅ Afficher `utilisateurId` → montre qui a vraiment vendu
- ✅ Afficher `guichetId.vendeurPrincipal` → audit guichet
- ✅ Utiliser `articles` avec toutes les infos (photos, types, rayons)
- ✅ Afficher les deux montants USD et FC si disponible
- ✅ Marquer si superviseur/admin a vendu via guichet d'un autre vendeur

### ❌ À Éviter

- ❌ Ne pas confondre `utilisateurId` (qui a vendu) avec `guichetId.vendeurPrincipal` (qui gère le guichet)
- ❌ Ne pas faire d'appels API supplémentaires pour les détails de produits (c'est déjà dans articles)
- ❌ Ne pas ignorer `tauxFC` - l'afficher si présent

---

## 🔗 Autres Endpoints Utiles

### GET /api/protected/ventes
Récupère la **liste des ventes** avec pagination
```
Paramètres: ?magasinId=X&page=1&limit=20
Retour: Ventes complètement populées (même structure que /ventes/:id)
```

### GET /api/protected/magasins/:magasinId/guichets
Récupère les **guichets d'un magasin**
```
Retour: Guichets avec vendeurPrincipal populé
Util: Pour le sélecteur de guichet en mobile
```

---

**Version:** 1.0  
**Dernière mise à jour:** 2026-01-08  
**Status:** ✅ Complètement Implémenté
