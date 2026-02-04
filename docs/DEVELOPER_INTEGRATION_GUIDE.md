# 🔌 Supplier Rating System - Developer Integration Guide

## Quick Integration for Developers

### 1️⃣ **Import the Routes** (app.js)

```javascript
// At the top with other imports
const fournisseurRatingRoutes = require('./routes/fournisseurRating');

// In the routes section
app.use('/api/protected', fournisseurRatingRoutes);
```

✅ Status: Already done

---

### 2️⃣ **Check Model** (models/fournisseurRating.js)

Should exist with:
```javascript
- quantitePrevue, quantiteRecue
- delaiPrevu, delaiReel
- etatPrevu, etatReel
- scoreQuantite, scoreDelai, scoreQualite, scoreConformite
- scoreFinal (calculated)
- evaluation (enum)
- recommandation (enum)
```

✅ Status: Already created

---

### 3️⃣ **Enhance Reception Logic** (routes/commandes.js)

The endpoint `POST /api/protected/commandes/:id/recevoir` now:
- Accepts: `etatReel`, `problemes`, `remarques`
- Auto-calculates FournisseurRating
- Returns rating in response

✅ Status: Already integrated

---

### 4️⃣ **Add Menu Link** (sidebar.php)

Should have:
```html
<li class="nav-item">
  <a class="nav-link" href="pages/stock/fournisseurs.php">
    <i class="fas fa-star me-2"></i>
    <span class="nav-link-text ps-1">Évaluation des Fournisseurs</span>
  </a>
</li>
```

✅ Status: Already added

---

## 📱 Mobile Integration Examples

### React Native Example

```javascript
// Fetch supplier ranking
async function getSuppliersRanking(magasinId, token) {
  try {
    const response = await fetch(
      `${API_URL}/api/protected/fournisseur-ranking?magasinId=${magasinId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const data = await response.json();
    return data.ranking;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
  }
}

// Use in component
const [suppliers, setSuppliers] = useState([]);

useEffect(() => {
  getSuppliersRanking(magasinId, token).then(setSuppliers);
}, [magasinId, token]);

// Render
return (
  <FlatList
    data={suppliers}
    renderItem={({ item }) => (
      <View style={styles.card}>
        <Text style={styles.supplierName}>{item._id}</Text>
        <Text style={styles.score}>Score: {item.scoreMoyen.toFixed(1)}</Text>
        <Badge color={getEvaluationColor(item.scoreMoyen)}>
          {getEvaluationText(item.scoreMoyen)}
        </Badge>
        <Text style={styles.recommendation}>
          {item.recommendationPrincipal}
        </Text>
      </View>
    )}
    keyExtractor={item => item._id}
  />
);
```

### Flutter Example

```dart
// Fetch suppliers
Future<List<Supplier>> getSuppliersRanking(String magasinId, String token) async {
  final response = await http.get(
    Uri.parse('$apiUrl/api/protected/fournisseur-ranking?magasinId=$magasinId'),
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    },
  );

  if (response.statusCode == 200) {
    final jsonData = json.decode(response.body);
    return (jsonData['ranking'] as List)
        .map((item) => Supplier.fromJson(item))
        .toList();
  } else {
    throw Exception('Failed to load suppliers');
  }
}

// Model
class Supplier {
  final String name;
  final double score;
  final int evaluations;
  final String recommendation;

  Supplier({
    required this.name,
    required this.score,
    required this.evaluations,
    required this.recommendation,
  });

  factory Supplier.fromJson(Map<String, dynamic> json) {
    return Supplier(
      name: json['_id'],
      score: json['scoreMoyen'].toDouble(),
      evaluations: json['totalEvaluations'],
      recommendation: json['recommendationPrincipal'],
    );
  }
}

// Widget
class SupplierRankingWidget extends StatelessWidget {
  final List<Supplier> suppliers;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: suppliers.length,
      itemBuilder: (context, index) {
        final supplier = suppliers[index];
        return Card(
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: _getScoreColor(supplier.score),
              child: Text(
                supplier.score.toStringAsFixed(0),
                style: TextStyle(color: Colors.white),
              ),
            ),
            title: Text(supplier.name),
            subtitle: Text('${supplier.evaluations} évaluations'),
            trailing: Chip(
              label: Text(supplier.recommendation),
              backgroundColor: _getRecommendationColor(supplier.recommendation),
            ),
          ),
        );
      },
    );
  }

  Color _getScoreColor(double score) {
    if (score >= 90) return Colors.green;
    if (score >= 75) return Colors.blue;
    if (score >= 60) return Colors.orange;
    if (score >= 40) return Colors.deepOrange;
    return Colors.red;
  }

  Color _getRecommendationColor(String rec) {
    switch (rec) {
      case 'Continuer': return Colors.green;
      case 'Surveiller': return Colors.blue;
      case 'Améliorer': return Colors.orange;
      case 'Réduire': return Colors.deepOrange;
      case 'Arrêter': return Colors.red;
      default: return Colors.grey;
    }
  }
}
```

---

## 🧩 JavaScript Integration

### In Commande Manager

```javascript
class CommandeManager {
  // ... existing methods

  async receptionWithRating(commandeId, quantiteRecue, etatReel, problemes = []) {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/protected/commandes/${commandeId}/recevoir`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            quantiteRecue,
            etatReel,
            problemes
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        // Use the returned rating
        console.log('Supplier Rating:', data.fournisseurRating);
        
        // Show rating summary
        this.showRatingSummary(data.fournisseurRating);
        
        return data;
      }
    } catch (error) {
      console.error('Reception error:', error);
      throw error;
    }
  }

  showRatingSummary(rating) {
    const evaluation = rating.evaluation;
    const color = this.getEvaluationColor(evaluation);
    
    console.log(`
      📊 SUPPLIER RATING
      ────────────────
      Supplier: ${rating.fournisseur}
      Score: ${rating.scoreFinal}/100
      Evaluation: ${evaluation}
      Recommendation: ${rating.recommandation}
    `);
  }

  getEvaluationColor(evaluation) {
    const colors = {
      'Excellent': '#28a745',
      'Bon': '#17a2b8',
      'Acceptable': '#ffc107',
      'Médiocre': '#fd7e14',
      'Mauvais': '#dc3545'
    };
    return colors[evaluation] || '#6c757d';
  }
}
```

---

## 🔗 REST API Usage

### cURL Examples

**Create Order:**
```bash
curl -X POST http://localhost:3000/api/protected/commandes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "produitId": "123",
    "magasinId": "456",
    "quantiteCommandee": 100,
    "prixUnitaire": 50,
    "fournisseur": "Supplier ABC",
    "delaiLivraisonPrevu": 7,
    "etatPrevu": "Neuf"
  }'
```

**Receive with Rating:**
```bash
curl -X POST http://localhost:3000/api/protected/commandes/CMD123/recevoir \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantiteRecue": 98,
    "etatReel": "Bon état",
    "problemes": ["Étiquette manquante"],
    "remarques": "Satisfait globalement"
  }'
```

**Get Ranking:**
```bash
curl http://localhost:3000/api/protected/fournisseur-ranking?magasinId=123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Stats:**
```bash
curl "http://localhost:3000/api/protected/fournisseur-stats?magasinId=123&fournisseur=Supplier%20ABC" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Data Flow

```
┌─────────────────┐
│  Create Order   │  POST /commandes
│  (etatPrevu)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Store in Commande Model        │
│  - quantiteCommandee: 100       │
│  - etatPrevu: "Neuf"            │
│  - delaiLivraisonPrevu: 7       │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Receive Order                  │
│  POST /commandes/:id/recevoir   │
│  (etatReel, problemes)          │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Calculate Score                │
│  - Compare qty/delay/quality    │
│  - Apply penalties              │
│  - Generate FournisseurRating   │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Return Complete Response       │
│  - Updated Commande             │
│  - Reception record             │
│  - FournisseurRating (NEW)      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Query Rankings/Stats           │
│  GET /fournisseur-ranking       │
│  GET /fournisseur-stats         │
└─────────────────────────────────┘
```

---

## 🛠️ Configuration Options

### Scoring Weights (routes/fournisseurRating.js)

```javascript
// Modify these to change scoring
const SCORES = {
  QUANTITE: 30,    // weight for quantity
  DELAI: 25,       // weight for delivery time
  QUALITE: 25,     // weight for quality
  CONFORMITE: 20   // weight for compliance
};

// Modify penalties
const PENALTIES = {
  QUANTITY_PENALTY_PERCENT: 0.3,      // -1 per 3% deviation
  DELAY_PENALTY_PER_DAY: 1.5,         // -1.5 per day
  QUALITY_PENALTY_PER_TIER: 8,        // -8 per quality level
  COMPLIANCE_PENALTY_PER_ISSUE: 5     // -5 per problem
};

// Modify evaluation thresholds
const EVALUATION_THRESHOLDS = {
  EXCELLENT: 90,
  BON: 75,
  ACCEPTABLE: 60,
  MEDIOCRE: 40
};
```

---

## 🔒 Security Considerations

- ✅ All endpoints require authentication (`authMiddleware`)
- ✅ All writes are audit-tracked (createdBy field)
- ✅ Data is magasin-scoped (per warehouse)
- ✅ No sensitive data in response
- ✅ Proper error handling without leaking internals

### Best Practices:
1. Always include Authorization header
2. Validate token is fresh
3. Rate limit API calls on frontend
4. Log important rating changes
5. Backup database before bulk operations

---

## 📈 Performance Tips

- **Cache ranking results** - They don't change every second
- **Paginate large supplier lists** - Don't load all at once
- **Index fournisseur field** - Already done in model
- **Use aggregation for stats** - Already optimized in API
- **Lazy load charts** - Only generate when tab clicked

---

## 🧪 Testing Integration

Test suppliers rating in your app:

```javascript
async function testSupplierRating() {
  try {
    // 1. Create order
    const orderRes = await fetch('/api/protected/commandes', {
      method: 'POST',
      body: JSON.stringify({
        produitId: TEST_PRODUCT_ID,
        magasinId: TEST_MAGASIN_ID,
        quantiteCommandee: 100,
        etatPrevu: 'Neuf',
        delaiLivraisonPrevu: 7,
        fournisseur: 'Test Supplier'
      })
    });
    const order = await orderRes.json();
    
    // 2. Receive order
    const receiptRes = await fetch(
      `/api/protected/commandes/${order.commande._id}/recevoir`,
      {
        method: 'POST',
        body: JSON.stringify({
          quantiteRecue: 98,
          etatReel: 'Bon état'
        })
      }
    );
    const receipt = await receiptRes.json();
    
    // 3. Verify rating was created
    console.assert(receipt.fournisseurRating, 'Rating should exist');
    console.assert(receipt.fournisseurRating.scoreFinal, 'Score should be calculated');
    
    // 4. Get ranking
    const rankingRes = await fetch(
      `/api/protected/fournisseur-ranking?magasinId=${TEST_MAGASIN_ID}`
    );
    const ranking = await rankingRes.json();
    
    console.log('✅ All tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}
```

---

## 📚 Reference Links

- API Docs: `docs/SUPPLIER_RATING_SYSTEM.md`
- Quick Start: `SUPPLIER_RATING_QUICK_START.md`
- Testing: `docs/SUPPLIER_RATING_TESTING.md`
- Implementation Summary: `docs/SUPPLIER_RATING_IMPLEMENTATION_SUMMARY.md`

---

**Status:** ✅ Ready for Integration
**Last Updated:** 2024
**Version:** 1.0
