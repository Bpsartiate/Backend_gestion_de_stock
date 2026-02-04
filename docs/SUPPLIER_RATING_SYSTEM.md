# 🌟 Système d'Évaluation des Fournisseurs

## 📋 Vue d'ensemble

Le système d'évaluation des fournisseurs évalue automatiquement la performance de chaque fournisseur basé sur leurs performances de commande en utilisant une **échelle de 100 points** avec 4 critères d'évaluation.

## 🎯 Critères d'Évaluation

### 1. **Quantité (30 points)**
- Compare la quantité commandée vs reçue
- Pénalité: -1 point par 3% d'écart
- Exemple: commandé 100, reçu 95 = écart 5% = perte ~2 points

### 2. **Délai de Livraison (25 points)**
- Compare le délai prévu vs délai réel
- Pénalité: -1.5 points par jour de retard
- Exemple: prévu 7j, reçu en 9j = 2j de retard = perte 3 points

### 3. **Qualité du Produit (25 points)**
- Compare l'état attendu vs état reçu
- Niveaux: Neuf (4) > Bon état (3) > Usagé (2) > Endommagé (1)
- Pénalité: -8 points par niveau inférieur
- Exemple: attendu "Neuf", reçu "Usagé" = perte 16 points

### 4. **Conformité (20 points)**
- Compte les problèmes identifiés (dommages, étiquettes incorrectes, etc.)
- Pénalité: -5 points par problème identifié
- Exemple: 2 problèmes = perte 10 points

## 📊 Échelle d'Évaluation

| Score | Évaluation | Couleur | Interprétation |
|-------|------------|--------|-----------------|
| 90-100 | Excellent | 🟢 Vert | Fournisseur fiable et de qualité |
| 75-89 | Bon | 🔵 Bleu | Fournisseur satisfaisant |
| 60-74 | Acceptable | 🟡 Orange | À surveiller |
| 40-59 | Médiocre | 🟠 Orange foncé | Problèmes importants |
| < 40 | Mauvais | 🔴 Rouge | Très problématique |

## 💡 Recommandations d'Action

### Continuer (Score ≥ 80)
- Maintenir la relation commerciale
- Fournisseur de confiance pour commandes importantes

### Surveiller (Score 60-79)
- Suivi régulier des performances
- Documenter les problèmes
- Planifier une réunion de performance

### Améliorer (Score 40-59)
- Exiger des mesures correctives
- Augmenter les inspections
- Limiter les commandes importantes

### Réduire (Score 20-39)
- Réduire significativement les commandes
- Chercher des fournisseurs alternatifs
- Augmenter le contrôle qualité

### Arrêter (Score < 20)
- Cesser les commandes
- Basculer vers fournisseur alternatif
- Clôturer la relation commerciale

## 🔄 Flux de Travail

### 1️⃣ **Création de Commande** (`/api/protected/commandes`)
```bash
POST /api/protected/commandes
{
  "produitId": "...",
  "magasinId": "...",
  "quantiteCommandee": 100,
  "prixUnitaire": 50,
  "fournisseur": "Fournisseur ABC",
  "delaiLivraisonPrevu": 7,
  "etatPrevu": "Neuf",
  "remarquesCommande": "Urgent - pour réassort"
}
```

### 2️⃣ **Réception & Notation** (`/api/protected/commandes/:id/recevoir`)
```bash
POST /api/protected/commandes/123/recevoir
{
  "quantiteRecue": 98,
  "etatReel": "Bon état",
  "problemes": ["Emballage endommagé"],
  "remarques": "Produit OK mais emballage à réviser"
}
```

**Réponse:** Commande + Reception + **FournisseurRating** (auto-calculé)

### 3️⃣ **Consultation des Ratings** (`/api/protected/fournisseur-ranking`)
```bash
GET /api/protected/fournisseur-ranking?magasinId=...
```

## 📊 API Endpoints

### Créer une Notation
```bash
POST /api/protected/fournisseur-rating
{
  "commandeId": "...",
  "receptionId": "...",
  "quantiteRecue": 98,
  "etatReel": "Bon état",
  "dateReceptionReelle": "2024-01-15",
  "remarques": "...",
  "problemes": [...]
}
```

### Obtenir les Statistiques
```bash
GET /api/protected/fournisseur-stats?magasinId=...&fournisseur=...
```

Retourne:
- `totalEvaluations`: nombre d'évaluations
- `scoreMoyen`: score moyen du fournisseur
- `scoreMoyenParCategorie`: détails par catégorie
- `evaluations`: distribution des niveaux
- `recommandations`: distribution des recommandations
- `ratings`: liste complète des ratings

### Obtenir le Classement
```bash
GET /api/protected/fournisseur-ranking?magasinId=...
```

Retourne les Top 20 fournisseurs triés par score décroissant

### Voir un Rating Détaillé
```bash
GET /api/protected/fournisseur-rating/:ratingId
```

## 🎨 Interface Utilisateur

### Page: `/pages/stock/fournisseurs.php`

#### 📈 Onglet "Classement"
- Liste des fournisseurs triés par score
- Score circulaire avec couleur
- Badge d'évaluation
- Recommandation d'action
- Nombre d'évaluations
- Bouton "Voir détails"

#### 📋 Onglet "Détails"
- Tableau complet de tous les ratings
- Colonnes: Produit, Fournisseur, Qté, État, Délai, Score
- Liens vers chaque évaluation
- DataTable avec tri/filtre/pagination

#### 📊 Onglet "Analyse"
- **Chart 1:** Distribution des évaluations (doughnut chart)
- **Chart 2:** Score moyen par catégorie (bar chart)
- **Chart 3:** Recommandations principales (bar chart)

### Statistiques en En-Tête
- Total Évaluations
- Score Moyen
- Nombre de Fournisseurs
- Nombre d'Excellents

## 🔍 Exemple de Notation

### Commande
```
Fournisseur: "Acier Premium"
Quantité Prévue: 100 pièces
Délai Prévu: 7 jours
État Attendu: Neuf
```

### Réception
```
Quantité Reçue: 95 pièces (-5)
Délai Réel: 8 jours (+1)
État Reçu: Bon état
Problèmes: "Étiquettes manquantes"
```

### Calcul du Score

| Critère | Prévision | Réalité | Calcul | Score |
|---------|-----------|---------|--------|-------|
| **Quantité** | 100 | 95 | -5% écart = -1.67 pt | **28** |
| **Délai** | 7j | 8j | +1j = -1.5 pt | **24** |
| **Qualité** | Neuf(4) | Bon(3) | -1 niveau = -8 pt | **17** |
| **Conformité** | 0 issues | 1 issue | 1 problème = -5 pt | **15** |
| **TOTAL** | | | | **84** |

### Résultat
- **Score Final: 84/100** = "Bon" 
- **Recommandation: Surveiller**
- **Actions:** Contacter pour améliorer le délai et les étiquettes

## 📱 Intégration Mobile

Les données des ratings sont accessibles via l'API REST et peuvent être intégrées dans l'application mobile pour:

- Afficher le score du fournisseur lors d'une commande
- Afficher les avertissements si score < 60
- Consulter l'historique des performances

## 🔧 Configuration

### Modifier les Pénalités
Fichier: `routes/fournisseurRating.js` - fonction `calculerScoreFournisseur()`

```javascript
// Exemple: augmenter pénalité pour délai
scoreDelai = Math.max(0, 25 - retardJours * 2); // au lieu de 1.5
```

### Modifier les Seuils d'Évaluation
Fichier: `routes/fournisseurRating.js` - section "ÉVALUATION"

```javascript
if (scoreFinal >= 95) evaluation = 'Excellent'; // au lieu de 90
```

### Modifier les Seuils de Recommandation
Fichier: `routes/fournisseurRating.js` - section "RECOMMANDATION"

```javascript
if (scoreFinal < 25) recommandation = 'Arrêter'; // au lieu de 20
```

## 📈 Cas d'Usage

### Cas 1: Fournisseur Fiable
```
Score: 95/100
Évaluation: Excellent
Recommandation: Continuer
→ Augmenter les volumes
→ Fournisseur "préféré"
```

### Cas 2: Fournisseur Problématique
```
Score: 35/100
Évaluation: Mauvais
Recommandation: Arrêter
→ Cesser les commandes
→ Trouver alternative
→ Débriefing avec management
```

### Cas 3: Fournisseur À Surveiller
```
Score: 65/100
Évaluation: Acceptable
Recommandation: Améliorer
→ Demander plan d'action
→ Augmenter inspections
→ Limiter commandes importantes
```

## 🚀 Bonnes Pratiques

1. **Toujours indiquer l'état réel** lors de la réception (ne pas laisser vide)
2. **Documenter les problèmes** pour traçabilité
3. **Revoir les ratings** mensuellement
4. **Planifier des réunions** avec les fournisseurs en alerte
5. **Exporter les rapports** pour reporting management

## 📊 Rapports Disponibles

Via la page fournisseurs.php:

- **Rapport de Classement:** Top 20 fournisseurs
- **Rapport de Performances:** Tous les ratings avec détails
- **Rapport d'Analyse:** Graphiques et tendances
- **Export possible:** Copier les données pour Excel

## 🔐 Sécurité

- Toutes les évaluations nécessitent authentification
- Audit trail: chaque rating enregistre qui l'a créé
- Historique complet des modifications
- Magasin-specific: chaque magasin voit ses propres données

## 📞 Support

Pour toute question sur le système:
1. Consulter cette documentation
2. Vérifier les logs de l'API
3. Vérifier les scores dans la base de données

---

**Version:** 1.0
**Dernière mise à jour:** 2024
**Statut:** ✅ Production Ready
