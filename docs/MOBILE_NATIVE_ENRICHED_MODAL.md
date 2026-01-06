# 📱 Intégration Mobile - Utiliser le Modal Enrichi en React Native

## 🎯 Objectif

Afficher dans une app mobile (React Native) les mêmes données enrichies que le modal web premium, en utilisant l'endpoint `/produits/:id?include=mouvements,receptions,alertes,enregistrement`.

---

## 🏗️ Architecture Recommandée

```
MobileApp
├── screens/
│   └── ProduitDetailScreen.tsx
│       ├── Affiche toutes les 8 sections du modal web
│       ├── Appelle endpoint enrichi
│       └── Utilise composants réutilisables
│
├── services/
│   └── StockAPI.ts
│       └── getProduitDetail(id, includes)
│
├── components/
│   ├── AlertesCard.tsx
│   ├── ReceptionsAccordion.tsx
│   ├── MouvementsTable.tsx
│   └── AuditSection.tsx
│
└── types/
    └── produit.ts (TypeScript interfaces)
```

---

## 📦 Types TypeScript

```typescript
// types/produit.ts

export interface Produit {
  _id: string;
  designation: string;
  reference: string;
  quantiteActuelle: number;
  seuilAlerte: number;
  prixAchat: number;
  prixUnitaire: number;
  fournisseur?: string;
  marque?: string;
  taille?: string;
  couleur?: string;
  qualite?: string;
  unitePrincipale?: string;
  etat?: string;
  dateEntree?: Date;
  photoUrl?: string;
  
  // Données enrichies
  mouvements?: Mouvement[];
  receptions?: Reception[];
  alertes?: {
    stockBas: boolean;
    rupture: boolean;
    peremption: boolean;
    niveau: 'ok' | 'warning' | 'critique';
  };
  createdBy?: User;
  createdAt?: Date;
  updatedBy?: User;
  updatedAt?: Date;
}

export interface Reception {
  _id: string;
  dateReception: Date;
  quantite: number;
  fournisseur: string;
  prixAchat: number;
  prixTotal: number;
  dateFabrication?: Date;
  datePeremption?: Date;
  lotNumber?: string;
  statut: 'stocke' | 'controle' | 'rejete';
  photoUrl?: string;
  utilisateurId: User;
}

export interface Mouvement {
  _id: string;
  dateMouvement: Date;
  typeMouvement: 'Entrée' | 'Sortie';
  quantite: number;
  description?: string;
  rayon?: { nomRayon: string };
  utilisateurId: User;
}

export interface User {
  _id: string;
  prenom: string;
  nom: string;
  email?: string;
}

export interface ApiResponse {
  data: Produit;
  included: string[]; // ['mouvements', 'receptions', 'alertes', 'enregistrement']
  timestamp: Date;
}
```

---

## 🔗 Service API

```typescript
// services/StockAPI.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Produit, ApiResponse } from '../types/produit';

const BASE_URL = 'https://your-api-domain.com/api/protected';

export class StockAPI {
  static async getProduitDetail(
    produitId: string,
    includes: ('mouvements' | 'receptions' | 'alertes' | 'enregistrement')[] = [
      'mouvements',
      'receptions',
      'alertes',
      'enregistrement'
    ],
    useCache: boolean = true
  ): Promise<Produit> {
    
    // 1️⃣ Vérifier cache
    if (useCache) {
      const cached = await this.getFromCache(produitId);
      if (cached) return cached;
    }

    // 2️⃣ Construire URL avec includes
    const includeParam = includes.join(',');
    const url = `${BASE_URL}/produits/${produitId}?include=${includeParam}`;

    try {
      // 3️⃣ Fetcher données
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      const produit = data.data || data;

      // 4️⃣ Cacher les données
      await this.saveToCache(produitId, produit);
      
      return produit;
      
    } catch (error) {
      console.error('❌ Erreur fetch produit:', error);
      
      // 5️⃣ Fallback: retourner depuis cache même expiré
      const cachedFallback = await this.getFromCache(produitId, true);
      if (cachedFallback) {
        return cachedFallback;
      }
      
      throw error;
    }
  }

  // Cache helpers
  private static async getFromCache(
    produitId: string,
    ignoreExpiration: boolean = false
  ): Promise<Produit | null> {
    try {
      const cached = await AsyncStorage.getItem(`produit_${produitId}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      const maxAge = 5 * 60 * 1000; // 5 minutes

      if (!ignoreExpiration && age > maxAge) {
        await AsyncStorage.removeItem(`produit_${produitId}`);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Cache read error:', error);
      return null;
    }
  }

  private static async saveToCache(
    produitId: string,
    data: Produit
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `produit_${produitId}`,
        JSON.stringify({
          data,
          timestamp: Date.now()
        })
      );
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }

  static async clearCache(produitId?: string): Promise<void> {
    try {
      if (produitId) {
        await AsyncStorage.removeItem(`produit_${produitId}`);
      } else {
        const keys = await AsyncStorage.getAllKeys();
        const produitKeys = keys.filter(k => k.startsWith('produit_'));
        await AsyncStorage.multiRemove(produitKeys);
      }
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }
}
```

---

## 🎨 Composants React Native

### 1. Alertes Section

```typescript
// components/AlertesCard.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { Produit } from '../types/produit';

interface AlertesCardProps {
  produit: Produit;
}

export const AlertesCard: React.FC<AlertesCardProps> = ({ produit }) => {
  const getAlertColor = () => {
    if (produit.alertes?.rupture) return '#dc3545';
    if (produit.alertes?.stockBas) return '#ffc107';
    return '#28a745';
  };

  const getAlertIcon = () => {
    if (produit.alertes?.rupture) return 'alert-circle';
    if (produit.alertes?.stockBas) return 'alert';
    return 'check-circle';
  };

  const getAlertLabel = () => {
    if (produit.alertes?.rupture) return '🔴 Rupture';
    if (produit.alertes?.stockBas) return '⚠️ Stock bas';
    return '✅ OK';
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Alertes & État</Text>
      
      <View style={styles.row}>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>Stock actuel</Text>
          <Text style={styles.kpiValue}>{produit.quantiteActuelle}</Text>
        </View>
        
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>Seuil alerte</Text>
          <Text style={styles.kpiValue}>{produit.seuilAlerte}</Text>
        </View>
      </View>

      <View style={[styles.alertBox, { borderLeftColor: getAlertColor() }]}>
        <MaterialCommunityIcons
          name={getAlertIcon()}
          size={24}
          color={getAlertColor()}
        />
        <View style={styles.alertText}>
          <Text style={[styles.alertLabel, { color: getAlertColor() }]}>
            {getAlertLabel()}
          </Text>
          {produit.alertes?.peremption && (
            <Text style={styles.alertDesc}>⚠️ Péremption à surveiller</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  kpi: { flex: 1, padding: 12, backgroundColor: 'white', borderRadius: 6 },
  kpiLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  kpiValue: { fontSize: 20, fontWeight: 'bold' },
  alertBox: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 6,
    borderLeftWidth: 4,
    gap: 12,
    alignItems: 'center'
  },
  alertText: { flex: 1 },
  alertLabel: { fontSize: 14, fontWeight: 'bold' },
  alertDesc: { fontSize: 12, color: '#666', marginTop: 4 }
});
```

### 2. Réceptions Accordion

```typescript
// components/ReceptionsAccordion.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { Reception } from '../types/produit';

interface ReceptionsAccordionProps {
  receptions: Reception[] | undefined;
}

export const ReceptionsAccordion: React.FC<ReceptionsAccordionProps> = ({
  receptions = []
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!receptions?.length) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="inbox" size={24} color="#999" />
        <Text style={styles.emptyText}>Aucune réception</Text>
      </View>
    );
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'stocke': return '#28a745';
      case 'controle': return '#ffc107';
      default: return '#dc3545';
    }
  };

  const getDaysUntilExpiration = (date?: Date) => {
    if (!date) return null;
    const days = Math.floor((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <ScrollView style={styles.container}>
      {receptions.map((reception) => {
        const isExpanded = expandedId === reception._id;
        const daysLeft = getDaysUntilExpiration(reception.datePeremption);
        
        return (
          <View key={reception._id} style={styles.item}>
            <TouchableOpacity
              style={styles.header}
              onPress={() => setExpandedId(isExpanded ? null : reception._id)}
            >
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>
                  📦 {reception.quantite} unités
                </Text>
                <Text style={styles.headerDate}>
                  {new Date(reception.dateReception).toLocaleDateString('fr-FR')}
                </Text>
              </View>
              
              <View style={styles.headerRight}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: getStatutColor(reception.statut) }
                  ]}
                >
                  <Text style={styles.badgeText}>{reception.statut}</Text>
                </View>
                <MaterialCommunityIcons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color="#666"
                />
              </View>
            </TouchableOpacity>

            <Text style={styles.supplier}>
              🏢 {reception.fournisseur}
            </Text>

            {isExpanded && (
              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Prix achat unitaire</Text>
                  <Text style={styles.detailValue}>
                    {reception.prixAchat.toFixed(2)}€
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Prix total</Text>
                  <Text style={[styles.detailValue, styles.success]}>
                    {reception.prixTotal.toFixed(2)}€
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Lot/Série</Text>
                  <Text style={styles.detailValue}>
                    {reception.lotNumber || 'N/A'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date fabrication</Text>
                  <Text style={styles.detailValue}>
                    {reception.dateFabrication
                      ? new Date(reception.dateFabrication).toLocaleDateString('fr-FR')
                      : 'N/A'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Péremption</Text>
                  <View>
                    <Text
                      style={[
                        styles.detailValue,
                        daysLeft && daysLeft < 0 && styles.danger,
                        daysLeft && daysLeft >= 0 && daysLeft < 30 && styles.warning
                      ]}
                    >
                      {reception.datePeremption
                        ? new Date(reception.datePeremption).toLocaleDateString('fr-FR')
                        : 'N/A'}
                    </Text>
                    {daysLeft && daysLeft < 0 && (
                      <Text style={styles.badge_small}>🔴 PÉRIMÉ</Text>
                    )}
                    {daysLeft && daysLeft >= 0 && daysLeft < 30 && (
                      <Text style={styles.badge_small}>⚠️ {daysLeft} jours</Text>
                    )}
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Enregistré par</Text>
                  <Text style={styles.detailValue}>
                    {reception.utilisateurId?.prenom}{' '}
                    {reception.utilisateurId?.nom}
                  </Text>
                </View>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#f8f9fa' },
  item: { marginBottom: 8, backgroundColor: 'white', borderRadius: 6 },
  header: {
    flexDirection: 'row',
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 14, fontWeight: 'bold' },
  headerDate: { fontSize: 12, color: '#666', marginTop: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  supplier: { fontSize: 12, color: '#666', paddingHorizontal: 12 },
  details: { padding: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  detailRow: { marginBottom: 12 },
  detailLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  detailValue: { fontSize: 14, fontWeight: '600' },
  success: { color: '#28a745' },
  danger: { color: '#dc3545' },
  warning: { color: '#ffc107' },
  badge_small: { fontSize: 11, marginTop: 4, fontWeight: 'bold' },
  emptyContainer: { padding: 24, alignItems: 'center' },
  emptyText: { color: '#999', marginTop: 8 }
});
```

---

## 📱 Screen d'Affichage Complet

```typescript
// screens/ProduitDetailScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { StockAPI } from '../services/StockAPI';
import { AlertesCard } from '../components/AlertesCard';
import { ReceptionsAccordion } from '../components/ReceptionsAccordion';
import { MouvementsTable } from '../components/MouvementsTable';
import type { Produit } from '../types/produit';

interface ProduitDetailScreenProps {
  route: {
    params: {
      produitId: string;
    };
  };
}

export const ProduitDetailScreen: React.FC<ProduitDetailScreenProps> = ({
  route
}) => {
  const { produitId } = route.params;
  const [produit, setProduit] = useState<Produit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProduit();
  }, [produitId]);

  const loadProduit = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await StockAPI.getProduitDetail(produitId);
      setProduit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (error || !produit) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          ❌ {error || 'Produit non trouvé'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{produit.designation}</Text>
        <Text style={styles.ref}>{produit.reference}</Text>
      </View>

      {/* KPIs */}
      <View style={styles.section}>
        <View style={styles.kpiRow}>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Stock</Text>
            <Text style={styles.kpiValue}>{produit.quantiteActuelle}</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Prix</Text>
            <Text style={styles.kpiValue}>{produit.prixUnitaire}€</Text>
          </View>
        </View>
      </View>

      {/* Alertes */}
      <View style={styles.section}>
        <AlertesCard produit={produit} />
      </View>

      {/* Réceptions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Réceptions récentes</Text>
        <ReceptionsAccordion receptions={produit.receptions} />
      </View>

      {/* Mouvements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mouvements de stock</Text>
        <MouvementsTable mouvements={produit.mouvements} />
      </View>

      {/* Audit */}
      {produit.createdBy && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audit</Text>
          <View style={styles.auditBox}>
            <Text style={styles.auditLabel}>
              Créé par: {produit.createdBy.prenom} {produit.createdBy.nom}
            </Text>
            <Text style={styles.auditDate}>
              {produit.createdAt?.toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, backgroundColor: '#f8f9fa' },
  title: { fontSize: 20, fontWeight: 'bold' },
  ref: { fontSize: 12, color: '#666', marginTop: 4 },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  kpiRow: { flexDirection: 'row', gap: 12 },
  kpi: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    alignItems: 'center'
  },
  kpiLabel: { fontSize: 12, color: '#666' },
  kpiValue: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  errorText: { fontSize: 16, color: '#dc3545', textAlign: 'center' },
  auditBox: { padding: 12, backgroundColor: '#f8f9fa', borderRadius: 6 },
  auditLabel: { fontSize: 12, fontWeight: '600' },
  auditDate: { fontSize: 11, color: '#666', marginTop: 4 }
});
```

---

## 🔄 Gestion du Cache

```typescript
// Hook personnalisé pour le cache

import { useEffect, useState } from 'react';
import { StockAPI } from '../services/StockAPI';
import type { Produit } from '../types/produit';

export function useProduitDetail(produitId: string) {
  const [produit, setProduit] = useState<Produit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      // useCache=false pour forcer refresh depuis API
      const data = await StockAPI.getProduitDetail(produitId, 
        ['mouvements', 'receptions', 'alertes', 'enregistrement'],
        false
      );
      setProduit(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    StockAPI.clearCache(produitId);
    refetch();
  };

  useEffect(() => {
    refetch();
  }, [produitId]);

  return { produit, loading, error, refetch, clearCache };
}

// Utilisation dans composant
const { produit, loading, error, refetch } = useProduitDetail(produitId);
```

---

## 📊 Performance Tips

1. **Caching:** Cache 5 minutes par défaut
   ```typescript
   const produit = await StockAPI.getProduitDetail(id); // Cache actif
   const produit = await StockAPI.getProduitDetail(id, [...], false); // Force refresh
   ```

2. **Selective Includes:** Charger seulement ce qu'on affiche
   ```typescript
   // Si on affiche pas les mouvements:
   const produit = await StockAPI.getProduitDetail(id, ['receptions', 'alertes']);
   ```

3. **FlatList pour longues listes:** Au lieu de ScrollView
   ```typescript
   <FlatList
     data={produit.mouvements}
     renderItem={({ item }) => <MouvementItem mouvement={item} />}
     keyExtractor={(item) => item._id}
   />
   ```

4. **Image lazy loading:** Pour photos réceptions
   ```typescript
   <FastImage
     source={{ uri: reception.photoUrl, priority: FastImage.priority.low }}
     style={{ width: 200, height: 200 }}
   />
   ```

---

## 🚀 Déploiement

1. **Variables d'environnement:**
   ```typescript
   // .env
   REACT_APP_API_URL=https://your-api-domain.com/api/protected
   REACT_APP_CACHE_DURATION=300000 // 5 min en ms
   ```

2. **Token gestion:**
   - Stocker dans AsyncStorage avec encryption
   - Refresh automatique si expiré

3. **Test:**
   ```bash
   npm test
   npm run build:ios
   npm run build:android
   ```

---

**Créé:** 2024
**Statut:** ✅ Production Ready
**Version:** 1.0
