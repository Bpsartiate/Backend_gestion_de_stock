# 🚀 Mobile Quick Start - Phase 1 v2 (5 min setup)

**Cible:** Développeurs Flutter/React Native intégrant Phase 1 v2  
**Temps:** ~5 minutes  
**Date:** 26/01/2026

---

## ⚡ Les 3 Changements Clés

### 1️⃣ Produits LOT ont un sélecteur Mode

```dart
// AVANT: Tous les produits étaient vendus pareil
// MAINTENANT: LOT products permettent 2 modes

if (produit['typeProduitId']['typeStockage'] == 'lot') {
  // Afficher: [✓] Par unités  [ ] LOT entier
  showModeSelector();
} else {
  // Simple product - pas de selector
  hideModeSelector();
}
```

### 2️⃣ Stock Change avec le Mode

```dart
// Mode 1: "par unités"
stock = produit['quantiteActuelle'];  // 320

// Mode 2: "LOT entier"  
stock = produit['lotsDisponibles'];   // 9
```

### 3️⃣ Vente inclut le typeVente

```dart
Map article = {
  'produitId': id,
  'quantite': qty,
  'typeVente': selectedMode,  // 🔥 NOUVEAU: "partiel" ou "entier"
  'prixUnitaire': price,
};
```

---

## 🔧 Setup (Copier-Coller)

### Step 1: Import & Variables

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const API_BASE = 'http://localhost:3001/api';

class Stock {
  final storage = const FlutterSecureStorage();
  String? token;

  // ✅ Phase 1 v2 Ready
}
```

### Step 2: Récupérer Produits (avec LOT info)

```dart
Future<void> loadProduits(String magasinId) async {
  final res = await http.get(
    Uri.parse('$API_BASE/protected/produits?magasinId=$magasinId'),
    headers: {'Authorization': 'Bearer $token'},
  );

  final data = jsonDecode(res.body);
  
  // Les produits LOT ont maintenant:
  // - typeProduitId.typeStockage = "lot"
  // - lotsDisponibles = nombre de LOTs
  // - lotsComplet, lotsPartielVendu, lotsEpuise
  
  for (var p in data['produits']) {
    print('${p['designation']}: ${p['lotsDisponibles']} LOTs');
  }
}
```

### Step 3: Déterminer Mode & Stock

```dart
void updateStockDisplay(Map produit) {
  if (produit['typeProduitId']['typeStockage'] != 'lot') {
    // ❌ Pas de mode pour simple products
    stock = produit['quantiteActuelle'];
    return;
  }
  
  // ✅ Mode selector pour LOT products
  if (selectedMode == 'partiel') {
    stock = produit['quantiteActuelle'];
    label = 'unités';
  } else {
    stock = produit['lotsDisponibles'];
    label = 'LOTs';
  }
  
  setState(() {});
}
```

### Step 4: Créer Vente (avec typeVente)

```dart
Future<void> createVente() async {
  final articles = selectedItems.map((item) => {
    'produitId': item['_id'],
    'quantite': item['quantity'],
    'prixUnitaire': item['price'],
    'rayonId': item['rayonId'],
    'typeVente': item['modeVente'], // 🔥 NOUVEAU: "partiel" ou "entier"
  }).toList();

  final res = await http.post(
    Uri.parse('$API_BASE/protected/ventes'),
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'magasinId': selectedMagasin,
      'articles': articles,
      'montantTotal': total,
      'montantPaye': total,
    }),
  );

  if (res.statusCode == 201) {
    showToast('✅ Vente enregistrée!');
  }
}
```

### Step 5: Afficher Vente (avec Mode)

```dart
Future<void> showVenteDetail(String venteId) async {
  final res = await http.get(
    Uri.parse('$API_BASE/protected/ventes/$venteId'),
    headers: {'Authorization': 'Bearer $token'},
  );

  final vente = jsonDecode(res.body);
  
  for (var article in vente['articles']) {
    // 🔥 Maintenant chaque article a un typeVente
    String mode = article['typeVente'] == 'entier' 
      ? '🚀 LOT entier' 
      : '✂️ Par unités';
    
    print('${article['produitId']['designation']}: $mode');
  }
}
```

---

## 📱 UI Layout (Flutter)

```dart
Column(
  children: [
    // Mode Selector (LOT products only)
    if (produit['typeProduitId']['typeStockage'] == 'lot')
      Column(
        children: [
          Text('Mode de Vente:'),
          Row(
            children: [
              Radio(
                value: 'partiel',
                groupValue: selectedMode,
                onChanged: (val) {
                  setState(() {
                    selectedMode = val;
                    updateStockDisplay(produit);
                  });
                },
              ),
              Text('Par unités'),
              SizedBox(width: 20),
              Radio(
                value: 'entier',
                groupValue: selectedMode,
                onChanged: (val) {
                  setState(() {
                    selectedMode = val;
                    updateStockDisplay(produit);
                  });
                },
              ),
              Text('LOT entier'),
            ],
          ),
        ],
      ),
    
    // Stock Display (dynamic)
    Text('Stock: $stock $label'),
    
    // Quantity Input
    TextField(
      controller: qtyController,
      keyboardType: TextInputType.number,
      decoration: InputDecoration(
        label: Text('Quantité ($label)'),
      ),
    ),
    
    // Price
    Text('Prix: \$${price.toStringAsFixed(2)}'),
    
    // Add to Cart
    ElevatedButton(
      onPressed: addToCart,
      child: Text('Ajouter au panier'),
    ),
  ],
)
```

---

## 🧪 Test Checklist

```
✅ Login & Token storage
✅ Load magasins
✅ Load produits with lotsDisponibles
  ✅ Simple products: lotsDisponibles = null or 0
  ✅ LOT products: lotsDisponibles = 9
✅ Mode selector appears only for LOT products
✅ Stock updates when mode changes
  ✅ partiel: 320 unités
  ✅ entier: 9 LOTs
✅ Create vente with typeVente
  ✅ typeVente: "partiel" → sells units
  ✅ typeVente: "entier" → sells complete LOTs
✅ Fetch vente detail shows typeVente
✅ Facturation displays correct mode
```

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Oublier de vérifier typeStockage
```dart
// MAUVAIS
showModeSelector();  // Pour tous les produits!

// BON
if (produit['typeProduitId']['typeStockage'] == 'lot') {
  showModeSelector();
}
```

### ❌ Mistake 2: Confondre stock par mode
```dart
// MAUVAIS
stock = produit['lotsDisponibles'];  // Toujours LOTs!

// BON
if (selectedMode == 'partiel') {
  stock = produit['quantiteActuelle'];
} else {
  stock = produit['lotsDisponibles'];
}
```

### ❌ Mistake 3: Oublier typeVente dans article
```dart
// MAUVAIS
Map article = {
  'produitId': id,
  'quantite': qty,
  // typeVente manquant!
};

// BON
Map article = {
  'produitId': id,
  'quantite': qty,
  'typeVente': selectedMode,  // 🔥 Ne pas oublier!
};
```

### ❌ Mistake 4: Prix mal calculé
```dart
// MAUVAIS
prixTotal = qty * prixUnitaire;  // Même pour LOT?

// BON
if (typeVente == 'entier') {
  prixTotal = qty * prixLOT;      // Prix du LOT complet
} else {
  prixTotal = qty * prixUnitaire; // Prix par unité
}
```

---

## 📞 Endpoints Reference

| Endpoint | Method | Purpose | Phase 1 v2 |
|----------|--------|---------|-----------|
| `/auth/login` | POST | Login | ✅ |
| `/protected/magasins` | GET | List stores | ✅ |
| `/protected/produits` | GET | List products | 🔥 lotsDisponibles |
| `/protected/produits/{id}/lots-disponibles` | GET | Get LOT details | 🆕 NEW |
| `/protected/ventes` | POST | Create sale | 🔥 typeVente |
| `/protected/ventes/{id}` | GET | Get sale detail | 🔥 typeVente |
| `/protected/ventes` | GET | List sales | ✅ |

---

## 🎓 Full Documentation

👉 See [API_MOBILE_PHASE1_V2_COMPLETE.md](./API_MOBILE_PHASE1_V2_COMPLETE.md) for complete API reference

---

**Ready to build?** Start with Step 1 above! 🚀
