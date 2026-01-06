# 📱 GUIDE D'INTÉGRATION MOBILE

**Contenu:**
- 🔧 Classe SDK réutilisable
- 📲 Exemples React Native
- 🦋 Exemples Flutter
- 🔐 Gestion authentification
- 📷 Upload de photos

---

## 🔧 SDK JAVASCRIPT/TYPESCRIPT

### Installation
```bash
npm install axios dotenv
```

### Fichier `stockapi.js`
```javascript
import axios from 'axios';

class StockAPI {
  constructor(config = {}) {
    this.baseURL = config.baseURL || 'https://backend-gestion-de-stock.onrender.com/api/protected';
    this.token = config.token;
    this.magasinId = config.magasinId;
    this.timeout = config.timeout || 30000;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Intercepteur pour ajouter le token
    this.client.interceptors.request.use(config => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Intercepteur pour gérer les erreurs
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          console.error('❌ Token expiré ou invalide');
          // Émettre un événement pour rediriger vers login
          window.dispatchEvent(new CustomEvent('unauthorized'));
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== AUTHENTIFICATION ====================

  async login(email, password) {
    try {
      const response = await axios.post(
        `${this.baseURL.replace('/api/protected', '')}/auth/login`,
        { email, password },
        { timeout: this.timeout }
      );
      
      this.token = response.data.token;
      this.magasinId = response.data.user.magasinId;
      
      localStorage.setItem('token', this.token);
      localStorage.setItem('magasinId', this.magasinId);
      
      console.log('✅ Login réussi');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur login:', error.response?.data?.message);
      throw error;
    }
  }

  setToken(token, magasinId) {
    this.token = token;
    this.magasinId = magasinId;
  }

  logout() {
    this.token = null;
    this.magasinId = null;
    localStorage.removeItem('token');
    localStorage.removeItem('magasinId');
  }

  // ==================== PRODUITS ====================

  async getProduits() {
    try {
      console.log(`📦 Récupération des produits...`);
      const response = await this.client.get(`/magasins/${this.magasinId}/produits`);
      console.log(`✅ ${response.data.length} produits chargés`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getProduits:', error.message);
      throw error;
    }
  }

  async getProduit(produitId) {
    try {
      const response = await this.client.get(`/magasins/${this.magasinId}/produits/${produitId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getProduit ${produitId}:`, error.message);
      throw error;
    }
  }

  // ==================== RÉCEPTIONS ====================

  async addReception(data) {
    try {
      console.log('📥 Enregistrement réception...');
      
      const formData = new FormData();
      formData.append('produitId', data.produitId);
      formData.append('magasinId', this.magasinId);
      formData.append('rayonId', data.rayonId);
      formData.append('quantite', data.quantite);
      formData.append('prixAchat', data.prixAchat);
      
      if (data.fournisseur) formData.append('fournisseur', data.fournisseur);
      if (data.dateReception) formData.append('dateReception', data.dateReception);
      if (data.datePeremption) formData.append('datePeremption', data.datePeremption);
      if (data.lotNumber) formData.append('lotNumber', data.lotNumber);
      if (data.photoFile) formData.append('photoFile', data.photoFile);

      const response = await axios.post(
        `${this.baseURL}/receptions`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'multipart/form-data'
          },
          timeout: this.timeout
        }
      );

      console.log('✅ Réception enregistrée:', response.data);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      console.error('❌ Erreur addReception:', errorMsg);
      throw error;
    }
  }

  // ==================== MOUVEMENTS ====================

  async addMouvement(data) {
    try {
      console.log('📤 Enregistrement mouvement...');
      
      const payload = {
        produitId: data.produitId,
        rayonId: data.rayonId,
        typeMouvement: data.typeMouvement || 'sortie',
        quantite: data.quantite,
        raison: data.raison || 'Opération stock',
        dateOperation: data.dateOperation || new Date().toISOString()
      };

      const response = await this.client.post(
        `/magasins/${this.magasinId}/mouvements`,
        payload
      );

      console.log('✅ Mouvement enregistré');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur addMouvement:', error.message);
      throw error;
    }
  }

  // ==================== TYPES PRODUITS ====================

  async getTypesProduits() {
    try {
      console.log('📊 Récupération des types...');
      const response = await this.client.get(`/magasins/${this.magasinId}/types-produits`);
      console.log(`✅ ${response.data.length} types chargés`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getTypesProduits:', error.message);
      throw error;
    }
  }

  // ==================== RAYONS ====================

  async getRayons() {
    try {
      console.log('🏪 Récupération des rayons...');
      const response = await this.client.get(`/magasins/${this.magasinId}/rayons`);
      console.log(`✅ ${response.data.length} rayons chargés`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getRayons:', error.message);
      throw error;
    }
  }

  // ==================== UTILITAIRES ====================

  isAuthenticated() {
    return !!this.token && !!this.magasinId;
  }

  async loadFromStorage() {
    const token = localStorage.getItem('token');
    const magasinId = localStorage.getItem('magasinId');
    
    if (token && magasinId) {
      this.setToken(token, magasinId);
      return true;
    }
    return false;
  }
}

export default StockAPI;
```

---

## 📲 REACT NATIVE EXPO

### Installation
```bash
expo init StockApp
cd StockApp
npm install axios expo-image-picker expo-file-system
```

### `screens/LoginScreen.js`
```javascript
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import StockAPI from '../api/stockapi';

export default function LoginScreen({ navigation, setApi }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const api = new StockAPI();
      await api.login(email, password);
      setApi(api);
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Erreur de connexion', error.response?.data?.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📱 Gestion de Stock</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Connexion...' : 'Connexion'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 8 },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 8 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' }
});
```

### `screens/ReceptionScreen.js`
```javascript
import React, { useState, useEffect } from 'react';
import { 
  View, TextInput, TouchableOpacity, Text, Alert, 
  ScrollView, StyleSheet, ActivityIndicator 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ReceptionScreen({ api }) {
  const [produits, setProduits] = useState([]);
  const [rayons, setRayons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState('');
  const [selectedRayon, setSelectedRayon] = useState('');
  const [quantite, setQuantite] = useState('');
  const [prixAchat, setPrixAchat] = useState('');
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [produitsData, rayonsData] = await Promise.all([
        api.getProduits(),
        api.getRayons()
      ]);
      setProduits(produitsData);
      setRayons(rayonsData);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer la photo');
    }
  };

  const handleSubmit = async () => {
    if (!selectedProduit || !selectedRayon || !quantite || !prixAchat) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!photo) {
      Alert.alert('Erreur', 'Veuillez ajouter une photo');
      return;
    }

    setSubmitting(true);
    try {
      const photoFile = {
        uri: photo.uri,
        type: 'image/jpeg',
        name: `reception_${Date.now()}.jpg`
      };

      await api.addReception({
        produitId: selectedProduit,
        rayonId: selectedRayon,
        quantite: parseFloat(quantite),
        prixAchat: parseFloat(prixAchat),
        photoFile
      });

      Alert.alert('Succès', 'Réception enregistrée');
      // Réinitialiser le formulaire
      setSelectedProduit('');
      setSelectedRayon('');
      setQuantite('');
      setPrixAchat('');
      setPhoto(null);
      
      // Recharger les données
      loadData();
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.error || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📥 Nouvelle Réception</Text>

      {/* Sélection produit */}
      <Text style={styles.label}>Produit</Text>
      <View style={styles.picker}>
        {/* Utiliser FlatList ou picker natif */}
        <Text style={styles.subtitle}>
          {produits.find(p => p._id === selectedProduit)?.designation || 'Sélectionner...'}
        </Text>
      </View>

      {/* Quantité */}
      <Text style={styles.label}>Quantité</Text>
      <TextInput
        style={styles.input}
        placeholder="50"
        keyboardType="decimal-pad"
        value={quantite}
        onChangeText={setQuantite}
        editable={!submitting}
      />

      {/* Prix */}
      <Text style={styles.label}>Prix Achat</Text>
      <TextInput
        style={styles.input}
        placeholder="15000"
        keyboardType="decimal-pad"
        value={prixAchat}
        onChangeText={setPrixAchat}
        editable={!submitting}
      />

      {/* Photo */}
      <TouchableOpacity 
        style={styles.photoButton}
        onPress={pickImage}
        disabled={submitting}
      >
        <Text style={styles.photoButtonText}>
          📷 {photo ? 'Changer la photo' : 'Ajouter une photo'}
        </Text>
      </TouchableOpacity>

      {photo && <Text style={styles.photoInfo}>✅ Photo ajoutée</Text>}

      {/* Submit */}
      <TouchableOpacity 
        style={[styles.submitButton, submitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitButtonText}>
          {submitting ? 'Enregistrement...' : '✅ Enregistrer Réception'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 15, marginBottom: 8 },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 12, 
    borderRadius: 8, 
    backgroundColor: 'white' 
  },
  picker: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 12, 
    borderRadius: 8, 
    backgroundColor: 'white' 
  },
  subtitle: { fontSize: 16 },
  photoButton: { 
    backgroundColor: '#007bff', 
    padding: 12, 
    borderRadius: 8, 
    marginTop: 15 
  },
  photoButtonText: { color: 'white', textAlign: 'center', fontWeight: '600' },
  photoInfo: { color: 'green', marginTop: 10, fontWeight: '600' },
  submitButton: { 
    backgroundColor: '#28a745', 
    padding: 15, 
    borderRadius: 8, 
    marginTop: 20,
    marginBottom: 30
  },
  submitButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  buttonDisabled: { opacity: 0.5 }
});
```

---

## 🦋 FLUTTER

### `pubspec.yaml`
```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  image_picker: ^1.0.0
  cached_network_image: ^3.3.0
  shared_preferences: ^2.2.0
```

### `lib/api/stock_api.dart`
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class StockAPI {
  static const String baseURL = 'https://backend-gestion-de-stock.onrender.com/api/protected';
  
  String? token;
  String? magasinId;

  Future<bool> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseURL/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        token = data['token'];
        magasinId = data['user']['magasinId'];
        
        final prefs = await SharedPreferences.getInstance();
        prefs.setString('token', token!);
        prefs.setString('magasinId', magasinId!);
        
        return true;
      }
      return false;
    } catch (e) {
      print('❌ Erreur login: $e');
      return false;
    }
  }

  Future<List<dynamic>> getProduits() async {
    try {
      final response = await http.get(
        Uri.parse('$baseURL/magasins/$magasinId/produits'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      throw Exception('Erreur: ${response.statusCode}');
    } catch (e) {
      print('❌ Erreur getProduits: $e');
      rethrow;
    }
  }

  Future<Map<String, dynamic>> addReception({
    required String produitId,
    required String rayonId,
    required double quantite,
    required double prixAchat,
    required String photoPath,
    String? fournisseur,
  }) async {
    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseURL/receptions'),
      );

      request.headers['Authorization'] = 'Bearer $token';
      
      request.fields['produitId'] = produitId;
      request.fields['magasinId'] = magasinId!;
      request.fields['rayonId'] = rayonId;
      request.fields['quantite'] = quantite.toString();
      request.fields['prixAchat'] = prixAchat.toString();
      if (fournisseur != null) request.fields['fournisseur'] = fournisseur;

      request.files.add(await http.MultipartFile.fromPath('photoFile', photoPath));

      final response = await request.send();
      final responseBody = await response.stream.bytesToString();

      if (response.statusCode == 201 || response.statusCode == 200) {
        return jsonDecode(responseBody);
      } else {
        throw Exception('Erreur: ${response.statusCode} - $responseBody');
      }
    } catch (e) {
      print('❌ Erreur addReception: $e');
      rethrow;
    }
  }

  Future<bool> loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    token = prefs.getString('token');
    magasinId = prefs.getString('magasinId');
    return token != null && magasinId != null;
  }
}
```

---

## 📷 GESTION DES PHOTOS

### Compression image côté client
```javascript
async function compressImage(file, maxWidth = 800, quality = 0.6) {
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
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
    };
  });
}

// Utilisation
const originalFile = document.getElementById('photoInput').files[0];
const compressedBlob = await compressImage(originalFile);
const compressedFile = new File([compressedBlob], 'photo.jpg', { type: 'image/jpeg' });
```

---

## 🔐 GESTION TOKENS

### LocalStorage (Web)
```javascript
// Sauvegarder
localStorage.setItem('token', response.token);

// Récupérer
const token = localStorage.getItem('token');

// Supprimer (logout)
localStorage.removeItem('token');
localStorage.removeItem('magasinId');
```

### SharedPreferences (React Native/Flutter)
Voir exemples React Native et Flutter ci-dessus.

---

## 📊 EXEMPLE COMPLET: DASHBOARD

```javascript
class StockDashboard {
  constructor(api) {
    this.api = api;
    this.produits = [];
    this.types = [];
    this.rayons = [];
  }

  async initialize() {
    console.log('⏳ Chargement du dashboard...');
    
    const [produits, types, rayons] = await Promise.all([
      this.api.getProduits(),
      this.api.getTypesProduits(),
      this.api.getRayons()
    ]);

    this.produits = produits;
    this.types = types;
    this.rayons = rayons;

    console.log('✅ Dashboard prêt');
    return this.getStats();
  }

  getStats() {
    return {
      totalProduits: this.produits.length,
      totalTypes: this.types.length,
      totalRayons: this.rayons.length,
      stockTotal: this.produits.reduce((sum, p) => sum + p.quantiteActuelle, 0),
      produitEnAlerte: this.produits.filter(p => 
        p.quantiteActuelle <= p.seuilAlerte
      ).length,
      rayonsPlains: this.rayons.filter(r => 
        (r.occupation / r.capaciteMax) >= 0.8
      ).length
    };
  }
}
```

---

**👉 Importer la Collection Postman:**
1. Ouvrir Postman
2. Cliquer "Import"
3. Coller le contenu de `Postman_Collection.json`
4. Configurer les variables: `baseUrl`, `token`, `magasinId`
5. Tester les endpoints!

**👉 Utiliser OpenAPI dans Swagger:**
1. Aller sur https://editor.swagger.io
2. Coller le contenu de `openapi.json`
3. Voir la documentation interactive
4. Générer des clients SDK automatiquement
