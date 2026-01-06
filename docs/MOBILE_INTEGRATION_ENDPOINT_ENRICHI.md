# 📱 Intégration Mobile - Pattern "INCLUDE"

## Guide complet pour implémenter l'endpoint enrichi sur mobile

---

## 🚀 Flux de l'application mobile

### 1️⃣ Écran LISTE (Produits du magasin)
```
GET /magasins/:id/produits?limit=20&page=1
├─ Requête légère
├─ Retourne: id, nom, ref, prix, quantité, photo thumbnail
└─ Temps réponse: ~500ms, 20-30 KB total
```

### 2️⃣ Écran DÉTAIL (Au clic sur un produit)
```
GET /produits/:id?include=receptions,alertes,enregistrement
├─ Requête complète
├─ Retourne: tout + historique réceptions + alertes
└─ Temps réponse: ~1-2s, 10-15 KB
```

### 3️⃣ Écran MOUVEMENTS (Historique)
```
GET /produits/:id?include=mouvements
├─ Requête spécialisée
├─ Retourne: historique des 50 mouvements
└─ Temps réponse: ~500-800ms, 5-8 KB
```

---

## 💻 Code d'exemple - React Native

### Installation dépendances
```bash
npm install axios
```

### Service API réutilisable
```javascript
// services/stockAPI.js
import axios from 'axios';

const API_BASE_URL = 'https://votre-api.com/api/protected';
let token = null;

export const initAPI = (authToken) => {
  token = authToken;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

api.interceptors.request.use(config => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 📦 Get produit basique
export const getProduitBasique = async (produitId) => {
  const response = await api.get(`/produits/${produitId}`);
  return response.data.data;
};

// 📋 Get produit détail complet
export const getProduitDetail = async (produitId) => {
  const response = await api.get(
    `/produits/${produitId}?include=receptions,alertes,enregistrement`
  );
  return response.data.data;
};

// 📈 Get avec mouvements
export const getProduitAvecMouvements = async (produitId) => {
  const response = await api.get(
    `/produits/${produitId}?include=mouvements,receptions`
  );
  return response.data.data;
};

// 🔴 Get alertes uniquement
export const getProduitAlertes = async (produitId) => {
  const response = await api.get(
    `/produits/${produitId}?include=alertes`
  );
  return response.data.data.alertes;
};

export default api;
```

### Écran LISTE (React Native)
```javascript
// screens/ProduitsListScreen.js
import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, Image } from 'react-native';
import { getProduits } from '../services/stockAPI';

export const ProduitsListScreen = ({ navigation }) => {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerProduits();
  }, []);

  const chargerProduits = async () => {
    try {
      setLoading(true);
      // ✅ Requête légère pour la liste
      const response = await api.get('/magasins/MAGASIN_ID/produits?limit=20&page=1');
      setProduits(response.data.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProduit = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Detail', { produitId: item._id })}
    >
      <Image 
        source={{ uri: item.photoUrl || 'https://via.placeholder.com/100' }}
        style={styles.photo}
      />
      <View style={styles.info}>
        <Text style={styles.nom}>{item.designation}</Text>
        <Text style={styles.ref}>{item.reference}</Text>
        <Text style={styles.prix}>{item.prixUnitaire}€</Text>
        <View style={styles.row}>
          <Text style={styles.quantite}>Stock: {item.quantiteActuelle}</Text>
          <Text style={[
            styles.badge,
            item.quantiteActuelle <= 0 && styles.rupture
          ]}>
            {item.quantiteActuelle <= 0 ? 'Rupture' : 'OK'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={produits}
        renderItem={renderProduit}
        keyExtractor={item => item._id}
        refreshing={loading}
        onRefresh={chargerProduits}
      />
    </View>
  );
};

const styles = {
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { flexDirection: 'row', margin: 10, padding: 10, backgroundColor: 'white', borderRadius: 8 },
  photo: { width: 80, height: 80, borderRadius: 4 },
  info: { flex: 1, marginLeft: 10, justifyContent: 'space-around' },
  nom: { fontSize: 16, fontWeight: 'bold' },
  ref: { fontSize: 12, color: '#999' },
  prix: { fontSize: 14, color: '#28a745', fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quantite: { fontSize: 12 },
  badge: { backgroundColor: '#28a745', color: 'white', padding: 4, borderRadius: 4 },
  rupture: { backgroundColor: '#dc3545' }
};
```

### Écran DÉTAIL (React Native)
```javascript
// screens/ProduitDetailScreen.js
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, Image, ActivityIndicator } from 'react-native';
import { getProduitDetail } from '../services/stockAPI';

export const ProduitDetailScreen = ({ route }) => {
  const { produitId } = route.params;
  const [produit, setProduit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    chargerDetail();
  }, [produitId]);

  const chargerDetail = async () => {
    try {
      setLoading(true);
      // ✅ Requête complète avec includes
      const data = await getProduitDetail(produitId);
      setProduit(data);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  if (error) {
    return <Text style={{ margin: 20, color: 'red' }}>Erreur: {error}</Text>;
  }

  if (!produit) {
    return <Text style={{ margin: 20 }}>Produit non trouvé</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      {/* === PHOTO === */}
      <Image
        source={{ uri: produit.rayonId?.photoUrl }}
        style={styles.heroPhoto}
      />

      {/* === INFOS BASIQUES === */}
      <View style={styles.section}>
        <Text style={styles.designation}>{produit.designation}</Text>
        <Text style={styles.reference}>Ref: {produit.reference}</Text>
        <Text style={styles.category}>{produit.typeProduitId?.nomType}</Text>
      </View>

      {/* === STOCK & PRIX === */}
      <View style={styles.section}>
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Stock actuel</Text>
            <Text style={styles.value}>{produit.quantiteActuelle}</Text>
          </View>
          <View>
            <Text style={styles.label}>Prix unitaire</Text>
            <Text style={styles.value}>{produit.prixUnitaire}€</Text>
          </View>
          <View>
            <Text style={styles.label}>Valeur stock</Text>
            <Text style={styles.value}>{produit.stockStats?.valeurEnStock}€</Text>
          </View>
        </View>
      </View>

      {/* === ALERTES === */}
      {produit.alertes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertes</Text>
          <View style={[
            styles.alertBox,
            produit.alertes.niveau === 'critique' && styles.alertDanger,
            produit.alertes.niveau === 'warning' && styles.alertWarning
          ]}>
            <Text style={styles.alertText}>
              {produit.alertes.rupture && '🔴 Rupture de stock'}
              {produit.alertes.stockBas && !produit.alertes.rupture && '⚠️ Stock bas'}
              {produit.alertes.niveau === 'ok' && '✅ Stock OK'}
            </Text>
          </View>
        </View>
      )}

      {/* === RAYON === */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Localisation</Text>
        <Text style={styles.infoLabel}>Rayon</Text>
        <Text style={styles.infoValue}>{produit.rayonId?.nomRayon}</Text>
        <Text style={styles.infoLabel}>Code</Text>
        <Text style={styles.infoValue}>{produit.rayonId?.codeRayon}</Text>
      </View>

      {/* === RÉCEPTIONS RÉCENTES === */}
      {produit.receptions && produit.receptions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Réceptions récentes</Text>
          {produit.receptions.slice(0, 3).map((reception, idx) => (
            <View key={idx} style={styles.receptionCard}>
              <View style={styles.row}>
                <Text style={styles.receptionDate}>
                  {new Date(reception.dateReception).toLocaleDateString('fr-FR')}
                </Text>
                <Text style={styles.receptionQte}>{reception.quantite} unités</Text>
              </View>
              <Text style={styles.receptionFournisseur}>
                🏢 {reception.fournisseur}
              </Text>
              <Text style={styles.receptionPrix}>
                {reception.prixTotal}€ • Statut: {reception.statut}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* === ENREGISTREMENT === */}
      {produit.audit && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <Text style={styles.auditText}>
            Créé: {new Date(produit.audit.createdAt).toLocaleString('fr-FR')}
          </Text>
          {produit.audit.createdBy && (
            <Text style={styles.auditText}>
              Par: {produit.audit.createdBy.prenom} {produit.audit.createdBy.nom}
            </Text>
          )}
          <Text style={styles.auditText}>
            Modifié: {new Date(produit.audit.updatedAt).toLocaleString('fr-FR')}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = {
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  heroPhoto: { width: '100%', height: 300, backgroundColor: '#e0e0e0' },
  section: { margin: 15, padding: 15, backgroundColor: 'white', borderRadius: 8 },
  designation: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  reference: { fontSize: 12, color: '#999' },
  category: { fontSize: 14, color: '#666', marginTop: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  label: { fontSize: 12, color: '#999', marginBottom: 3 },
  value: { fontSize: 18, fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  alertBox: { padding: 12, borderRadius: 6, backgroundColor: '#e8f5e9' },
  alertDanger: { backgroundColor: '#ffebee' },
  alertWarning: { backgroundColor: '#fff3cd' },
  alertText: { fontSize: 14, fontWeight: '500' },
  infoLabel: { fontSize: 12, color: '#999', marginTop: 8 },
  infoValue: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  receptionCard: { marginVertical: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  receptionDate: { fontSize: 12, color: '#666' },
  receptionQte: { fontSize: 14, fontWeight: 'bold' },
  receptionFournisseur: { fontSize: 12, marginTop: 3 },
  receptionPrix: { fontSize: 12, color: '#999', marginTop: 3 },
  auditText: { fontSize: 12, color: '#666', marginVertical: 2 }
};
```

---

## 📊 Stratégie de mise en cache (Pour optimiser la mobile)

```javascript
// Exemple avec AsyncStorage (React Native)
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getProduitAvecCache = async (produitId) => {
  const cacheKey = `produit_${produitId}`;
  
  try {
    // 1. Vérifier le cache
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log('📦 Cache hit');
        return data;
      }
    }

    // 2. Récupérer l'API
    console.log('📡 API call');
    const data = await getProduitDetail(produitId);

    // 3. Sauvegarder en cache
    await AsyncStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));

    return data;
  } catch (error) {
    // 4. En cas d'erreur, utiliser le cache expiré
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      console.warn('Using expired cache');
      return JSON.parse(cached).data;
    }
    throw error;
  }
};
```

---

## 🎯 Points clés pour mobile

| Aspect | Recommandation |
|--------|-----------------|
| **Requête liste** | Sans includes → ~2 KB |
| **Requête détail** | `?include=receptions,alertes,enregistrement` → ~10-15 KB |
| **Cache** | 5-10 minutes pour le détail |
| **Timeout** | 10 secondes max |
| **Compression** | gzip activée (automatique avec axios) |
| **Images** | Utiliser des thumbnails pour la liste |

---

## 🚨 Gestion d'erreurs

```javascript
const handleAPIError = (error) => {
  if (error.response?.status === 404) {
    return 'Produit non trouvé';
  } else if (error.response?.status === 403) {
    return 'Accès refusé';
  } else if (error.code === 'ECONNABORTED') {
    return 'Timeout - connexion trop lente';
  } else if (!error.response) {
    return 'Pas de connexion internet';
  } else {
    return `Erreur: ${error.message}`;
  }
};
```

---

## ✅ Checklist implémentation

- [ ] Importer `getProduitDetail` et autres fonctions
- [ ] Initialiser API avec token: `initAPI(token)`
- [ ] Écran liste: GET basique
- [ ] Écran détail: GET avec includes
- [ ] Gérer les états: loading, error, success
- [ ] Implémenter le cache
- [ ] Gestion des images (compression/thumbnail)
- [ ] Traduire les statuts (français)
- [ ] Tester avec connexion lente (DevTools)
