# 🧪 Testing Checklist - Intégration Commandes & Scoring

## Prérequis
- [ ] Serveur running (`npm start`)
- [ ] Base de données initialisée
- [ ] Utilisateur connecté
- [ ] Magasin sélectionné en session

## 1. Modal Création Commande

### 1.1 Ouverture Auto
- [ ] Ouvrir modal "Ajouter Produit"
- [ ] Remplir formulaire produit (tous champs)
- [ ] Cliquer "Enregistrer Produit"
- [ ] Vérifier notification "Produit créé avec succès"
- [ ] ✓ Modal réception se ferme
- [ ] ✓ Modal "Créer Commande" s'ouvre automatiquement

### 1.2 Affichage Produit
- [ ] Vérifier "Référence" affichée correctement
- [ ] Vérifier "Désignation" affichée correctement

### 1.3 Sélection Fournisseur
- [ ] Cliquer dropdown "Fournisseur"
- [ ] ✓ Liste fournisseurs chargée
- [ ] Sélectionner un fournisseur
- [ ] ✓ Récapitulatif mis à jour avec nom fournisseur

### 1.4 Quantité
- [ ] Entrer "100" dans "Quantité Prévue"
- [ ] ✓ Récapitulatif montre "100 unités"
- [ ] Essayer "0" → vérifier comportement
- [ ] Essayer "-5" → vérifier comportement

### 1.5 Délai
- [ ] Entrer "7" dans "Délai Réception"
- [ ] ✓ Récapitulatif montre "7 jours"
- [ ] Changer à "14" → ✓ Récap met à jour
- [ ] Essayer "0" → vérifier validation

### 1.6 État Attendu
- [ ] Tester "Neuf"
- [ ] Tester "Bon état"
- [ ] Tester "Usagé"
- [ ] Tester "Endommagé"

### 1.7 Remarques
- [ ] Entrer "Emballage standard, certifications requises"
- [ ] ✓ Texte accepté

### 1.8 Soumission
- [ ] Remplir tous champs obligatoires
- [ ] Cliquer "Créer Commande"
- [ ] ✓ Notification "Commande créée avec succès"
- [ ] ✓ Modals se ferment
- [ ] ✓ Commande visible dans commandes.php (refresh page)

---

## 2. Prévisions en Réception

### 2.1 Load Prévisions
- [ ] Ouvrir modal "Gestion Réceptions"
- [ ] Tab "Nouvelle Réception" active
- [ ] Cliquer "Produit" → vérifier liste produits
- [ ] Sélectionner produit créé en test 1.8
- [ ] ✓ Section "Prévisions de Commande" apparaît
- [ ] Vérifier affichage:
  - [ ] Quantité Prévue: 100
  - [ ] Délai Prévu: 7 jours
  - [ ] État Attendu: (État choisi en 1.6)

### 2.2 Changement Produit
- [ ] Sélectionner autre produit (sans commande)
- [ ] ✓ Section prévisions disparaît
- [ ] Resélectionner produit initial
- [ ] ✓ Prévisions réapparaissent

### 2.3 Absent si Pas de Commande
- [ ] Créer nouveau produit (via add_prod)
- [ ] Annuler modal commande (sans créer)
- [ ] Aller réception, sélectionner ce produit
- [ ] ✓ Section prévisions n'apparaît pas
- [ ] ✓ Message "(Aucune commande trouvée)" optionnel

---

## 3. Scoring Temps Réel

### 3.1 Affichage Score
- [ ] Produit avec commande sélectionné
- [ ] Prévisions affichées
- [ ] ✓ Section "Score Fournisseur" INVISIBLE (avant saisie)

### 3.2 Activation Score
- [ ] Entrer "100" dans "Quantité Reçue"
- [ ] ✓ Section "Score Fournisseur" APPARAÎT
- [ ] Vérifier 4 scores affichés:
  - [ ] Quantité (30 pts)
  - [ ] Délai (25 pts)
  - [ ] Qualité (25 pts)
  - [ ] Conformité (20 pts)
- [ ] Vérifier Score Total affiché
- [ ] Vérifier Niveau d'Évaluation affiché
- [ ] Vérifier Recommandation affichée

### 3.3 Cas: Réception Parfaite
**Setup: Quantité=100, Délai=7j, État=Neuf, 0 problèmes**

- [ ] Quantité reçue: 100
- [ ] Date réception réelle: Aujourd'hui
- [ ] État réel: Neuf
- [ ] Problèmes: (vide)
- [ ] Vérifier scores:
  - [ ] Quantité: 30 (100% conformité)
  - [ ] Délai: 25 (0 jours retard)
  - [ ] Qualité: 25 (état conforme)
  - [ ] Conformité: 20 (aucun problème)
- [ ] ✓ Total: 100/100
- [ ] ✓ Évaluation: "Excellent"
- [ ] ✓ Recommandation: "Continuer"

### 3.4 Cas: Quantité Inférieure
**Setup: Quantité prévue=100, reçue=95**

- [ ] Quantité reçue: 95
- [ ] ✓ Score Quantité: 30 (95% ≥ 95%)
- [ ] Changer à 85:
  - [ ] ✓ Score Quantité: 24 (85% ≥ 85%)
- [ ] Changer à 75:
  - [ ] ✓ Score Quantité: 18 (75% ≥ 75%)
- [ ] Changer à 50:
  - [ ] ✓ Score Quantité: 12 (60-75%)
- [ ] Vérifier recalcul auto à chaque changement

### 3.5 Cas: Retard Livraison
**Setup: Délai prévu=7j**

- [ ] Date réception = Date commande + 7j:
  - [ ] ✓ Score Délai: 25 (0 jours retard)
- [ ] Date réception = Date commande + 9j:
  - [ ] ✓ Score Délai: 20 (≤ 2j retard)
- [ ] Date réception = Date commande + 15j:
  - [ ] ✓ Score Délai: 15 (≤ 5j retard)
- [ ] Date réception = Date commande + 20j:
  - [ ] ✓ Score Délai: 10 (≤ 10j retard)
- [ ] Date réception = Date commande + 25j:
  - [ ] ✓ Score Délai: 5 (> 10j retard)

### 3.6 Cas: État Dégradé
**Setup: État attendu=Neuf**

- [ ] État reçu: Neuf
  - [ ] ✓ Score Qualité: 25
- [ ] État reçu: Bon état
  - [ ] ✓ Score Qualité: 20
- [ ] État reçu: Usagé
  - [ ] ✓ Score Qualité: 10
- [ ] État reçu: Endommagé
  - [ ] ✓ Score Qualité: 5

### 3.7 Cas: Problèmes Identifiés
**Setup: État=Neuf, Quantité=100, Délai OK**

- [ ] Problèmes: (vide)
  - [ ] ✓ Score Conformité: 20
- [ ] Problèmes: "3 pièces cassées"
  - [ ] ✓ Score Conformité: 10
- [ ] Vérifier Score Total recalculé

### 3.8 Niveau d'Évaluation
Test différents totals:

**Score ≥ 90**
- [ ] ✓ Niveau: "Excellent" (vert)
- [ ] ✓ Recommandation: "Continuer"

**Score 75-89**
- [ ] ✓ Niveau: "Bon" (bleu)
- [ ] ✓ Recommandation: "Continuer"

**Score 60-74**
- [ ] ✓ Niveau: "Acceptable" (jaune)
- [ ] ✓ Recommandation: "Surveiller"

**Score 40-59**
- [ ] ✓ Niveau: "Médiocre" (rouge clair)
- [ ] ✓ Recommandation: "Améliorer"

**Score < 40**
- [ ] ✓ Niveau: "Mauvais" (rouge)
- [ ] ✓ Recommandation: "Arrêter"

---

## 4. Enregistrement Réception

### 4.1 Validation
- [ ] Laisser "Quantité Reçue" vide → essayer enregistrer
  - [ ] ✓ Validation error ou feedback
- [ ] Saisir quantité
- [ ] Laisser autre champ obligatoire vide
  - [ ] ✓ Validation error

### 4.2 Soumission Avec Score
- [ ] Remplir tous champs:
  - [ ] Produit: Sélectionné
  - [ ] Quantité: 100
  - [ ] Date réception: Saisie
  - [ ] État réel: Sélectionné
  - [ ] Problèmes: (optionnel)
  - [ ] Photo: Uploadée
  - [ ] Autres champs requis: Remplis
- [ ] Cliquer "Enregistrer Réception"
- [ ] ✓ Notification "Réception enregistrée"
- [ ] ✓ Modal se ferme
- [ ] ✓ Tab "Historique Réceptions" updated (si refresh)

### 4.3 Vérification en BD
- [ ] Ouvrir commandes.php
- [ ] Vérifier commande existe
- [ ] Cliquer sur commande
- [ ] ✓ Vérifier réception liée:
  - [ ] Quantité correcte
  - [ ] Date correcte
  - [ ] État correct
- [ ] Vérifier FournisseurRating créée
  - [ ] Score correspond
  - [ ] Évaluation correcte
  - [ ] Recommandation correcte

---

## 5. Intégration Dashboard Fournisseurs

### 5.1 Score Visible
- [ ] Aller à page Fournisseurs
- [ ] Trouver le fournisseur de la commande test
- [ ] ✓ Score affiché dans tableau
- [ ] ✓ Évaluation affichée
- [ ] ✓ Recommandation affichée

### 5.2 Historique
- [ ] Cliquer sur fournisseur
- [ ] ✓ Historique évaluations visible
- [ ] ✓ Détails réception affichés
- [ ] ✓ Scores détaillés visibles

---

## 6. Cas d'Usage Complets

### 6.1 Fournisseur Excellent
**Objectif: Score 100/100**

- [ ] Créer produit
- [ ] Créer commande:
  - Quantité: 100
  - Délai: 7j
  - État: Neuf
- [ ] Aller réception:
  - Quantité reçue: 100
  - Date: +7j
  - État: Neuf
  - Problèmes: Aucun
- [ ] ✓ Score affiché: 100/100
- [ ] ✓ Évaluation: Excellent
- [ ] Enregistrer réception
- [ ] ✓ Vérifier dans fournisseurs

### 6.2 Fournisseur Moyen
**Objectif: Score 70-85**

- [ ] Créer produit
- [ ] Créer commande:
  - Quantité: 50
  - Délai: 5j
  - État: Bon état
- [ ] Aller réception:
  - Quantité reçue: 48
  - Date: +7j (2j retard)
  - État: Bon état
  - Problèmes: "Emballage usé"
- [ ] ✓ Score calculé: ~75
- [ ] ✓ Évaluation: Bon
- [ ] Enregistrer

### 6.3 Fournisseur Faible
**Objectif: Score 30-50**

- [ ] Créer produit
- [ ] Créer commande:
  - Quantité: 20
  - Délai: 10j
  - État: Neuf
- [ ] Aller réception:
  - Quantité reçue: 14 (70%)
  - Date: +20j (10j retard)
  - État: Endommagé
  - Problèmes: "5 pièces cassées"
- [ ] ✓ Score calculé: ~35
- [ ] ✓ Évaluation: Médiocre
- [ ] Enregistrer

---

## 7. Performance & Bugs

### 7.1 Chargement
- [ ] First load prévisions: < 2s
- [ ] Recalcul score: Instantané (< 100ms)
- [ ] Changement produit: < 1s

### 7.2 Validation
- [ ] Tous champs obligatoires testés
- [ ] Formats données acceptées
- [ ] Valeurs négatives rejetées
- [ ] Doublons détectés?

### 7.3 Erreurs
- [ ] Pas de console errors
- [ ] Messages d'erreur clairs
- [ ] Pas de freeze UI
- [ ] Navigation OK

### 7.4 Session
- [ ] Magasin correctement utilisé
- [ ] Utilisateur correctement tracé
- [ ] Autorisations vérifiées

---

## 8. Cleanup & Finalization

### 8.1 Code Review
- [ ] Pas de console.log() inutiles
- [ ] Variable names clairs
- [ ] Commentaires utiles présents
- [ ] Pas d'erreurs syntaxe

### 8.2 Validation BD
- [ ] Tous champs sauvegardés
- [ ] Types corrects
- [ ] Références valides
- [ ] Pas de orphans

### 8.3 UI/UX
- [ ] Messages clairs
- [ ] Pas de texte coupé
- [ ] Responsive mobile?
- [ ] Accessibilité OK?

---

## 9. Sign-off

- [ ] Tous tests passés ✓
- [ ] Pas de bugs critiques
- [ ] Pas de erreurs console
- [ ] Prêt pour production

**Testé par:** ________________  
**Date:** ________________  
**Notes:** _________________________________________________

---

## Quick Retest Script

Copier/coller en console pour tester rapidement:

```javascript
// Test 1: Charger produits
await fetch('/api/protected/produits?magasinId=YOUR_MAGASIN_ID');

// Test 2: Créer commande
const prod = await fetch('/api/protected/produits').then(r => r.json());
await fetch('/api/protected/commandes', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    produitId: prod[0]._id,
    quantiteCommandee: 100,
    delaiLivraisonPrevu: 7,
    etatPrevu: 'Neuf'
  })
});

// Test 3: Charger prévisions
const commande = await fetch(`/api/protected/commandes/produit/${prod[0]._id}`)
  .then(r => r.json());
console.log(commande);
```

---

**Status: PRÊT POUR TESTING COMPLET ✅**
