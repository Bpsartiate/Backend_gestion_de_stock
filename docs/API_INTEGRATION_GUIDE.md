# 📡 API INTEGRATION GUIDE - Modal Guichet

## 1. Endpoint Requis

### GET /api/protected/guichets/:id

**Requis par:** `loadGuichetDetails(id)`

**Response Structure:**
```json
{
  "_id": "ObjectId",
  "magasinId": "ObjectId",
  "nomGuichet": "Guichet 001",
  "codeGuichet": "G001",
  "status": 1,
  "vendeurPrincipal": {
    "_id": "ObjectId",
    "prenom": "Marie",
    "nom": "Kabila",
    "email": "marie@pharma.cd"
  },
  "caJour": 2450000,
  "nbVentesJour": 47,
  "caissierActuel": {
    "prenom": "Marie",
    "nom": "Kabila"
  },
  
  // ✨ NOUVEAU: Produits vendus aujourd'hui
  "produitVendus": [
    {
      "id": "P001",
      "nom": "Paracétamol 500mg",
      "quantiteVendue": 12,
      "prixUnitaire": 13000,
      "totalVente": 156000,
      "categorie": "Analgésique",
      "marge": 15
    },
    {
      "id": "P002",
      "nom": "Amoxicilline 500mg",
      "quantiteVendue": 8,
      "prixUnitaire": 11125,
      "totalVente": 89000,
      "categorie": "Antibiotique",
      "marge": 20
    },
    // ... autres
  ],
  
  // Optionnel pour futur
  "transactions": [
    {
      "id": "TX001",
      "client": "Jean Dupont",
      "montant": 8500,
      "heure": "09:47",
      "type": "Vente"
    }
  ]
}
```

---

## 2. Implémentation Backend (Node.js/Express)

### Route Handler

```javascript
// routes/protected.js ou controllers/guichetController.js

router.get('/api/protected/guichets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Récupérer le guichet
    const guichet = await Guichet.findById(id)
      .populate('vendeurPrincipal', 'prenom nom email');
    
    if (!guichet) {
      return res.status(404).json({ error: 'Guichet non trouvé' });
    }
    
    // 2. Calculer CA du jour
    const aujourd_hui = new Date();
    aujourd_hui.setHours(0, 0, 0, 0);
    const demain = new Date(aujourd_hui);
    demain.setDate(demain.getDate() + 1);
    
    // 3. Récupérer ventes du jour
    const ventes = await Vente.find({
      guichetId: id,
      createdAt: {
        $gte: aujourd_hui,
        $lt: demain
      }
    });
    
    // 4. Calculer produits vendus
    const produitsMap = {};
    let caJour = 0;
    
    for (const vente of ventes) {
      caJour += vente.montantTotal || 0;
      
      if (vente.detailsVente && Array.isArray(vente.detailsVente)) {
        for (const detail of vente.detailsVente) {
          const produitId = detail.produitId?.toString() || detail.id;
          
          if (!produitsMap[produitId]) {
            // Récupérer infos produit
            const produit = await Produit.findById(detail.produitId);
            
            produitsMap[produitId] = {
              id: produitId,
              nom: produit?.nom || detail.nom || 'Produit',
              categorie: produit?.categorie || 'Non catégorisé',
              quantiteVendue: 0,
              prixUnitaire: detail.prixUnitaire || detail.prix || 0,
              totalVente: 0,
              marge: produit?.marge || 15
            };
          }
          
          produitsMap[produitId].quantiteVendue += detail.quantite || 1;
          produitsMap[produitId].totalVente += (detail.quantite || 1) * (detail.prixUnitaire || 0);
        }
      }
    }
    
    // 5. Convertir map en array
    const produitVendus = Object.values(produitsMap);
    
    // 6. Répondre
    res.json({
      ...guichet.toObject(),
      caJour,
      nbVentesJour: ventes.length,
      produitVendus
    });
    
  } catch (error) {
    console.error('Erreur récupération guichet:', error);
    res.status(500).json({ error: error.message });
  }
});
```

---

## 3. Structure Mongoose Models

### Guichet Model
```javascript
// models/guichet.js

const guichetSchema = new Schema({
  magasinId: { type: Schema.Types.ObjectId, ref: 'Magasin', required: true },
  nomGuichet: { type: String, required: true },
  codeGuichet: { type: String, unique: true },
  status: { type: Number, default: 1 }, // 1=actif, 0=inactif
  vendeurPrincipal: { type: Schema.Types.ObjectId, ref: 'Utilisateur' },
  objectifJournalier: { type: Number, default: 50000 },
  
  // Historique
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date }
});

module.exports = mongoose.model('Guichet', guichetSchema);
```

### Vente Model (existant à adapter)
```javascript
// models/vente.js

const venteSchema = new Schema({
  guichetId: { type: Schema.Types.ObjectId, ref: 'Guichet', required: true },
  vendeurId: { type: Schema.Types.ObjectId, ref: 'Utilisateur' },
  montantTotal: { type: Number, required: true },
  
  // Détails produits
  detailsVente: [{
    produitId: { type: Schema.Types.ObjectId, ref: 'Produit' },
    nom: String,
    quantite: Number,
    prixUnitaire: Number,
    totalLigne: Number
  }],
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vente', venteSchema);
```

### Produit Model
```javascript
// models/produit.js

const produitSchema = new Schema({
  nom: { type: String, required: true },
  categorie: String,
  prixUnitaire: Number,
  marge: { type: Number, default: 15 }, // En %
  
  // Pour futur stock
  stockInitial: Number,
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Produit', produitSchema);
```

---

## 4. Données de Test (Seed)

```javascript
// scripts/seed_guichets.js

const Guichet = require('../models/guichet');
const Produit = require('../models/produit');
const Vente = require('../models/vente');

async function seedData() {
  // Créer produits
  const produits = await Produit.insertMany([
    { nom: 'Paracétamol 500mg', categorie: 'Analgésique', prixUnitaire: 13000, marge: 15 },
    { nom: 'Amoxicilline 500mg', categorie: 'Antibiotique', prixUnitaire: 11125, marge: 20 },
    { nom: 'Ibuprofène 400mg', categorie: 'Anti-inflammatoire', prixUnitaire: 13666, marge: 18 },
    { nom: 'Vitamine C 1000mg', categorie: 'Vitamines', prixUnitaire: 8000, marge: 22 },
    { nom: 'Doliprane 1000mg', categorie: 'Analgésique', prixUnitaire: 15000, marge: 16 }
  ]);
  
  // Créer ventes du jour
  const aujourd_hui = new Date();
  aujourd_hui.setHours(0, 0, 0, 0);
  
  const ventes = await Vente.insertMany([
    {
      guichetId: 'guichet_id_ici',
      montantTotal: 156000,
      detailsVente: [
        { produitId: produits[0]._id, nom: produits[0].nom, quantite: 12, prixUnitaire: 13000, totalLigne: 156000 }
      ],
      createdAt: new Date(aujourd_hui.getTime() + 60000 * 47) // 09:47
    },
    {
      guichetId: 'guichet_id_ici',
      montantTotal: 89000,
      detailsVente: [
        { produitId: produits[1]._id, nom: produits[1].nom, quantite: 8, prixUnitaire: 11125, totalLigne: 89000 }
      ],
      createdAt: new Date(aujourd_hui.getTime() + 60000 * 42) // 09:42
    },
    // ... plus de ventes
  ]);
  
  console.log('✅ Données de test créées');
}

seedData().catch(console.error);
```

---

## 5. Appel Frontend (Exemple)

```javascript
// Dans magasin_guichet.js

async function loadGuichetDetails(guichetId) {
  CURRENT_GUICHET_ID = guichetId;
  
  $('#guichetSpinner').show();
  $('#guichetPlaceholder').hide();
  $('#guichetContent').hide();
  
  try {
    const token = localStorage.getItem('token');
    
    // ✨ APPEL API RÉELLE
    const response = await fetch(
      `${API_BASE}/api/protected/guichets/${guichetId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const g = await response.json();
    
    // Cache pour réutilisation
    GUICHETS_CACHE[guichetId] = g;
    
    // Remplissage du modal
    updateGuichetHeader(g);
    updateGuichetStats(g);
    updateProduitsVendus(g);
    updateTransactionsRecentes(g);
    initGuichetChart();
    
    // Affichage
    setTimeout(() => {
      $('#guichetSpinner').hide();
      $('#guichetPlaceholder').hide();
      $('#guichetContent').fadeIn(400);
    }, 400);
    
    showToast(`✅ ${g.nomGuichet} chargé`, 'success');
    
  } catch (err) {
    console.error('❌ Erreur:', err);
    $('#guichetSpinner').hide();
    $('#guichetContent').hide();
    $('#guichetPlaceholder').html(`
      <div class="text-center p-5">
        <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
        <h5 class="text-danger">Erreur chargement</h5>
        <p class="text-muted">${err.message}</p>
      </div>
    `).show();
    
    showToast('❌ ' + err.message, 'danger');
  }
}
```

---

## 6. Points Clés Integration

### ✅ À faire
- [ ] Vérifier que endpoint retourne `produitVendus[]`
- [ ] Tester avec données réelles
- [ ] Valider structure response
- [ ] Optimiser requête DB (populate, lean)
- [ ] Ajouter cache côté serveur (Redis optionnel)

### ⚠️ À considérer
- Performance: Grouper produits par date/heure pour futur graphique
- Marge: Obtenir du produit ou de la vente?
- Transactions: Inclure dans produitVendus ou séparé?
- Permissions: Vérifier accès guichet (user == vendeur?)

### 🔒 Sécurité
```javascript
// Vérifier que l'utilisateur accède à son propre guichet
if (req.user.role !== 'admin' && req.user._id !== guichet.vendeurPrincipal) {
  return res.status(403).json({ error: 'Accès refusé' });
}
```

---

## 7. Exemple curl de test

```bash
curl -X GET "http://localhost:3000/api/protected/guichets/62abc123xyz" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json"
```

---

## 8. Évolution Future (Phase 2)

```javascript
// Ajouter à response:
{
  "stocks": [
    { produitId, quantiteStock, seuil, lastRestock }
  ],
  "transferts": [
    { id, deGuichet, versGuichet, produits, statut }
  ],
  "alertes": [
    { id, type: "stock_bas", produitId, message }
  ]
}
```

---

**Status:** Prêt à l'implémentation backend 🚀
