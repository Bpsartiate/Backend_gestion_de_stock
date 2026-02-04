# 🌟 Supplier Rating System - Quick Summary

## ✨ Qu'est-ce que c'est?

Un système automatisé d'**évaluation des fournisseurs** basé sur la performance de leurs livraisons. Chaque commande reçue génère automatiquement une notation (score 0-100).

## 🎯 Fonctionnement Simple

1. **Créer une commande** avec les prévisions (quantité, délai, qualité, etc.)
2. **Recevoir la commande** et indiquer la réalité (quantité reçue, délai réel, état)
3. **Système auto-score:** calcule automatiquement le score du fournisseur
4. **Voir le classement** dans le tableau de bord des fournisseurs

## 📊 Exemple Concret

```
COMMANDE PASSÉE:
├─ Quantité: 100 pièces
├─ Délai Prévu: 7 jours
├─ État Attendu: Neuf
└─ Fournisseur: "Acier Premium"

RÉCEPTION EFFECTUÉE:
├─ Quantité Reçue: 98 pièces  ❌ -2 pièces
├─ Délai Réel: 8 jours        ❌ +1 jour
├─ État Reçu: Bon état        ✓ Acceptable
└─ Problèmes: Étiquette déchirée

RÉSULTAT AUTOMATIQUE:
├─ Score: 82/100
├─ Évaluation: BON
└─ Recommandation: Surveiller
```

## 📈 Les 4 Critères d'Évaluation

| Critère | Poids | Détail |
|---------|-------|--------|
| **Quantité** | 30 pts | -1 pt par 3% d'écart |
| **Délai** | 25 pts | -1.5 pt par jour de retard |
| **Qualité** | 25 pts | -8 pts par niveau inférieur |
| **Conformité** | 20 pts | -5 pts par problème |

## 🏆 5 Niveaux d'Évaluation

```
90+ → EXCELLENT   🟢  "Continuer" (fournisseur de confiance)
75-89 → BON       🔵  "Surveiller" (suivi régulier)
60-74 → ACCEPTABLE🟡  "Améliorer" (exiger corrections)
40-59 → MÉDIOCRE  🟠  "Réduire" (limiter les commandes)
<40 → MAUVAIS     🔴  "Arrêter" (cesser la relation)
```

## 🚀 Où l'Utiliser?

### 1️⃣ **Créer une Commande**
Endpoint: `POST /api/protected/commandes`
```json
{
  "produitId": "...",
  "quantiteCommandee": 100,
  "delaiLivraisonPrevu": 7,
  "etatPrevu": "Neuf"
}
```

### 2️⃣ **Recevoir une Commande**
Endpoint: `POST /api/protected/commandes/:id/recevoir`
```json
{
  "quantiteRecue": 98,
  "etatReel": "Bon état",
  "problemes": ["Étiquette déchirée"]
}
```
→ **Score auto-calculé et enregistré** ✅

### 3️⃣ **Voir le Classement**
URL: `/pages/stock/fournisseurs.php?magasinId=...`
- Top 20 fournisseurs par score
- Graphiques de performance
- Historique complet des ratings

## 💡 Cas d'Usage Courants

### Cas 1: "Je veux voir tous mes fournisseurs par score"
→ Aller à: `/pages/stock/fournisseurs.php`
→ Onglet: "Classement"
→ Trier par score (meilleur au pire)

### Cas 2: "Je veux voir pourquoi ce fournisseur a un mauvais score"
→ Cliquer sur le fournisseur → "Voir détails"
→ Voir tous les ratings
→ Cliquer sur chaque evaluation → voir détails du scoring

### Cas 3: "Je veux analyser les performances"
→ Aller à: `/pages/stock/fournisseurs.php`
→ Onglet: "Analyse"
→ Voir graphiques et tendances

## 🔌 API Complète

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/protected/commandes` | POST | Créer commande |
| `/api/protected/commandes/:id/recevoir` | POST | Recevoir + score |
| `/api/protected/fournisseur-ranking` | GET | Top 20 fournisseurs |
| `/api/protected/fournisseur-stats` | GET | Stats fournisseur |
| `/api/protected/fournisseur-rating/:id` | GET | Détail 1 évaluation |

## 🎨 Interface Utilisateur

### Page: `/pages/stock/fournisseurs.php`

**3 Onglets:**

1. **Classement** 🏆
   - Liste des fournisseurs par score
   - Score en cercle coloré
   - Recommandation d'action

2. **Détails** 📋
   - Tableau complet des 100 dernières évaluations
   - Tri, recherche, pagination
   - Cliquer pour voir détails du scoring

3. **Analyse** 📊
   - Graphique distribution des évaluations
   - Score moyen par catégorie
   - Recommandations principales

**En-tête:** 4 statistiques clés
- Total évaluations
- Score moyen général
- Nombre de fournisseurs
- Nombre d'excellents

## 🔄 Flux Complet

```
┌─────────────────────┐
│ 1. Créer Commande   │ (avec prévisions)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 2. Recevoir Produit │ (indiquer réalité)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 3. Auto-Score       │ (calcul automatique)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 4. Voir Classement  │ (tableau de bord)
└─────────────────────┘
```

## ⚙️ Configuration

Modifier les pénalités de score:
- Fichier: `routes/fournisseurRating.js`
- Fonction: `calculerScoreFournisseur()`

Modifier les seuils d'évaluation:
- Fichier: `routes/fournisseurRating.js`
- Sections: "ÉVALUATION" et "RECOMMANDATION"

## 📱 Pour Mobile

Tous les données sont accessible via l'API REST:
- `GET /api/protected/fournisseur-ranking`
- `GET /api/protected/fournisseur-stats`

Pour afficher le score du fournisseur lors de la création d'une commande.

## 🎓 Formation

1. Voir [SUPPLIER_RATING_SYSTEM.md](./SUPPLIER_RATING_SYSTEM.md) pour détails complets
2. Test avec exemples: créer 5 commandes, recevoir, voir scores
3. Consulter régulièrement le tableau de bord des fournisseurs

## ✅ Checklist de Mise en Production

- [ ] Modèle `FournisseurRating` créé
- [ ] Routes API déployées (4 endpoints)
- [ ] Page PHP `/pages/stock/fournisseurs.php` créée
- [ ] Menu sidebar mis à jour
- [ ] Tests: créer commande → recevoir → score calculé
- [ ] Tests: voir classement des fournisseurs
- [ ] Tests: voir graphiques

---

**Statut:** ✅ Prêt pour Production
**Création:** 2024
**Dernière mise à jour:** 2024
