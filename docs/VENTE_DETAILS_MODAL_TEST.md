# 🧪 Guide de Test - Modal Détails de Vente

## 📋 Vue d'ensemble des Tests

Ce guide vous montre comment tester complètement le modal avancé "Détails de Vente" avec tous ses fonctionnalités et cas d'usage.

## 🚀 Préparation de l'Environnement

### 1. Vérifier que tout est en place

```bash
# Fichiers créés/modifiés:
✅ vente.php (Modal HTML ajouté)
✅ assets/js/vente.js (Méthodes showVenteDetails, etc.)
✅ assets/css/vente-details-modal.css (Styles personnalisés)
✅ docs/VENTE_DETAILS_MODAL.md (Documentation complète)
```

### 2. Vérifier les dépendances

```html
<!-- Bootstrap 5 (déjà inclus) -->
<link href="assets/css/theme.min.css" rel="stylesheet">

<!-- FontAwesome (déjà inclus) -->
<script src="assets/fonts/fontawesome.js"></script>

<!-- Nouveau CSS -->
<link href="assets/css/vente-details-modal.css" rel="stylesheet">
```

## 📱 Scénarios de Test

### Scénario 1: Ouvrir le modal depuis la table d'historique

**Étapes:**
1. Naviguer vers la page `vente.php`
2. Vérifier que le tableau d'historique a des ventes
3. Cliquer sur le bouton 👁️ (œil) dans la colonne "Actions"
4. Le modal doit s'ouvrir avec un spinner de chargement

**Résultat attendu:**
- ✅ Modal s'affiche avec animation fade-in
- ✅ Spinner tourne pendant 1-2 secondes
- ✅ Les données se chargent depuis l'API
- ✅ Aucune erreur dans la console

**Vérifications:**
```javascript
// Dans la console du navigateur
console.log('Vérifier que venteManager existe');
venteManager instanceof VenteManager // true

// Appeler manuellement
venteManager.showVenteDetails('VENTE_ID_VALIDE');
```

---

### Scénario 2: Affichage des informations vendeur

**Ventes avec différents rôles:**
- Admin
- Superviseur
- Vendeur
- Caissier

**Vérifications:**
1. Photo de profil affichée correctement
2. Nom complet visible
3. Email affiché avec icône
4. Badge de rôle avec couleur appropriée:
   - ❌ Admin → Rouge
   - ⚠️ Superviseur → Orange
   - ℹ️ Vendeur → Bleu
   - ✅ Caissier → Vert

**Test de code:**
```javascript
venteManager.getRoleBadgeClass('ADMIN');      // 'bg-danger'
venteManager.getRoleBadgeClass('SUPERVISEUR'); // 'bg-warning text-dark'
venteManager.getRoleBadgeClass('VENDEUR');     // 'bg-info'
venteManager.getRoleBadgeClass('CAISSIER');    // 'bg-success'
```

---

### Scénario 3: Affichage Magasin et Guichet

**Cas 1: Magasin avec toutes les infos**
- Nom du magasin
- Adresse complète
- Entreprise/Groupe

**Cas 2: Magasin incomplet**
- Certains champs manquants (afficher "-")
- Pas de blocage de l'interface

**Cas 3: Guichet**
- Nom/numéro du guichet visible
- Code unique affiché
- Vendeur du guichet affiché
- Gradient orange appliqué

**Test visuel:**
- Magasin card: fond dégradé gris
- Guichet card: fond dégradé orange vif
- Les deux en grille responsive (2 colonnes sur desktop, 1 sur mobile)

---

### Scénario 4: Affichage Articles Vendus

**Test avec 1 article:**
```javascript
vente.articles = [
  {
    produit: {
      nom: "Laptop HP",
      code: "LAP-001",
      photo: "...",
      type: { nom: "Électronique" },
      rayon: { nom: "Informatique" }
    },
    quantite: 1,
    prixUnitaire: 999.99
  }
]
```

**Test avec 5+ articles:**
- Vérifier le scroll dans le modal
- Chaque article avec sa miniature photo
- Sous-total calculé et affiché correctement

**Vérifications:**
```javascript
// Image produit s'affiche
document.querySelectorAll('#venteArticlesList img')[0] // <img>

// Sous-total correct
const sousTotal = article.prixUnitaire * article.quantite;
// Doit correspondre au montant affiché
```

---

### Scénario 5: Montants en USD et FC

**Cas 1: USD uniquement**
```json
{
  "montantUSD": 350.50,
  "montantFC": null,
  "taux": null
}
```
- Afficher uniquement USD
- Masquer FC et taux
- ✅ Vérifier avec `display: none`

**Cas 2: USD et FC**
```json
{
  "montantUSD": 350.50,
  "montantFC": 650000,
  "taux": 1857
}
```
- Afficher USD
- Afficher FC
- Afficher taux avec format "1 USD = X FC"
- Formatage correct des devises

**Test de formatage:**
```javascript
venteManager.formatDevise(350.50, 'USD');  // "$350,50"
venteManager.formatDevise(650000, 'FC');    // "650 000 FC"
```

---

### Scénario 6: Modes de Paiement

**Tester avec différents modes:**
- CASH
- CARTE
- CHÈQUE
- TRANSFERT
- CRÉDIT

**Vérification:**
- Texte en MAJUSCULES
- Badge visible et coloré
- Pas d'erreur pour mode manquant

---

### Scénario 7: Informations Supplémentaires

**Date et Heure:**
```javascript
// Format attendu: "15/01/2024 10:30:45"
venteManager.formatDateTime(new Date('2024-01-15T10:30:00Z'));
```

**Statut:**
- COMPLÉTÉ → Vert
- EN_COURS → Orange
- ANNULÉ → Rouge
- REMBOURSÉ → Bleu

**Client:**
- Afficher le nom complet
- Si vide: afficher "Client anonyme"

**Quantité totale:**
- Somme correcte de tous les articles

**Observations:**
- Afficher le texte complet
- Si vide: afficher message italique gris

---

### Scénario 8: Bouton Imprimer

**Étapes:**
1. Ouvrir un modal détails
2. Cliquer sur bouton "Imprimer"
3. Une nouvelle fenêtre s'ouvre

**Vérifications:**
- ✅ Fenêtre d'impression s'ouvre
- ✅ Format bien structuré
- ✅ Toutes les infos incluses
- ✅ Prêt pour impression réelle
- ✅ Alerte "Impression lancée" affichée

**Test de code:**
```javascript
const vente = { /* données complètes */ };
venteManager.printVente(vente);
// Une nouvelle fenêtre doit s'ouvrir avec le contenu à imprimer
```

---

### Scénario 9: Bouton Annuler

**Étapes:**
1. Ouvrir un modal détails
2. Cliquer sur bouton "Annuler"
3. Boîte de confirmation apparaît
4. Cliquer "OK"

**Vérifications:**
- ✅ Dialog de confirmation affiché
- ✅ Requête DELETE envoyée
- ✅ Alerte succès affichée
- ✅ Modal fermé
- ✅ Table d'historique rechargée
- ✅ Vente supprimée de la liste

**Cas d'erreur:**
- Annuler la confirmation → modal reste ouvert
- Erreur serveur → alerte danger affichée

**Test API:**
```javascript
// DELETE /api/ventes/:id
const venteId = 'ID_VALIDE';
venteManager.annulerVente(venteId);
```

---

### Scénario 10: Bouton Fermer

**Étapes:**
1. Cliquer sur bouton "Fermer"
2. OU cliquer le X du header
3. OU appuyer sur Échap

**Vérifications:**
- ✅ Modal se ferme smoothly
- ✅ Pas d'erreur de nettoyage
- ✅ État de la page inchangé

---

### Scénario 11: Système d'Alertes

**Test success:**
```javascript
venteManager.showAlert('Vente annulée avec succès', 'success');
// Toast vert en bas-droit, 4 secondes auto-fermeture
```

**Test danger:**
```javascript
venteManager.showAlert('Erreur lors du chargement', 'danger');
// Toast rouge, 4 secondes auto-fermeture
```

**Test warning:**
```javascript
venteManager.showAlert('Vérifiez les données', 'warning');
// Toast orange
```

**Test info:**
```javascript
venteManager.showAlert('Pour votre information', 'info');
// Toast bleu
```

**Vérifications:**
- Toast apparaît en bas-droit
- Position fixe (survit au scroll)
- Z-index assez élevé
- Auto-fermeture après 4 secondes
- Fermeture manuelle disponible (X)
- Pas de chevauchement avec contenu

---

### Scénario 12: Gestion des Erreurs

**Cas 1: Vente non trouvée (404)**
```javascript
// Utiliser un ID invalide
venteManager.showVenteDetails('INVALID_ID');
// Doit afficher message d'erreur dans le modal
```

**Cas 2: Erreur réseau**
- Couper la connexion réseau
- Tenter d'ouvrir un modal
- Alerte "Erreur de connexion" doit s'afficher

**Cas 3: Token expiré (401)**
- Laisser la session expirer
- Tenter d'ouvrir un modal
- Redirection vers login

**Cas 4: Données partielles**
- Vente avec certains champs manquants
- Doit afficher "-" au lieu de bloquer

---

### Scénario 13: Responsive Design

**Desktop (1920px):**
- Grille 2 colonnes (Magasin et Guichet côte-à-côte)
- Tous les éléments bien visibles
- Pas de scroll horizontal

**Tablette (768px):**
- Grille 1-2 colonnes adaptée
- Textes lisibles
- Images bien dimensionnées

**Mobile (375px):**
- Modal fullscreen
- Scrollable
- Tous les éléments stackés verticalement
- Boutons adaptés au tactile

**Test de code:**
```javascript
// Tester à différentes résolutions
window.innerWidth; // 1920, 768, 375

// Ou utiliser DevTools responsive design
// F12 → Toggle device toolbar
```

---

### Scénario 14: Animations

**Vérifications visuelles:**
- Header avec animation float (mouvement doux)
- Fade-in du contenu au chargement
- Hover effects sur images
- Pulse animation sur montants
- Smooth transitions sur tous les éléments

**Test du hover:**
```css
/* Vérifier les transitions */
img:hover { transform: scale(1.05); }
.card:hover { transform: translateY(-2px); }
```

---

## 🧪 Tests Automatisés

### Test de la présence du modal

```javascript
// Vérifier que le HTML du modal existe
const modal = document.getElementById('modalDetailsVente');
console.assert(modal !== null, 'Modal HTML non trouvé');

// Vérifier que Bootstrap peut initialiser
const bsModal = new bootstrap.Modal(modal);
console.assert(bsModal !== null, 'Bootstrap Modal échoué');
```

### Test des méthodes VenteManager

```javascript
// Vérifier que toutes les méthodes existent
const methods = [
    'showVenteDetails',
    'populateVenteDetails',
    'displayVenteArticles',
    'getRoleBadgeClass',
    'getStatutBadgeClass',
    'formatDateTime',
    'formatDevise',
    'attachVenteDetailsEvents',
    'printVente',
    'confirmAnnulerVente',
    'annulerVente',
    'showAlert',
    'getAlertIcon'
];

methods.forEach(method => {
    console.assert(
        typeof venteManager[method] === 'function',
        `Méthode ${method} manquante`
    );
});
```

### Test d'appel API

```javascript
// Vérifier que l'authentification est en place
console.assert(venteManager.TOKEN !== null, 'Token manquant');
console.assert(venteManager.authHeaders()['Authorization'], 'Auth header manquant');

// Vérifier que l'API est accessible
fetch(venteManager.API_BASE + '/api/ventes', {
    headers: venteManager.authHeaders()
})
.then(r => console.assert(r.ok, 'API non accessible'))
.catch(e => console.error('Erreur API:', e));
```

---

## 📊 Checklist de Vérification

```markdown
### Interface Visuelle
- [ ] Modal s'ouvre en cliquant le bouton détails
- [ ] Header avec gradient visible
- [ ] Spinner pendant chargement
- [ ] Contenu s'affiche après chargement
- [ ] Animations fluides

### Sections d'Information
- [ ] Section Vendeur avec photo et infos
- [ ] Section Magasin avec toutes les infos
- [ ] Section Guichet avec gradient orange
- [ ] Articles avec photos et détails
- [ ] Montants en USD et FC (si applicable)
- [ ] Infos supplémentaires complètes

### Système d'Alertes
- [ ] Toast success (vert)
- [ ] Toast danger (rouge)
- [ ] Toast warning (orange)
- [ ] Toast info (bleu)
- [ ] Auto-fermeture après 4 sec
- [ ] Fermeture manuelle (X) fonctionne

### Boutons d'Action
- [ ] Bouton "Imprimer" ouvre une fenêtre
- [ ] Impression contient toutes les infos
- [ ] Bouton "Annuler" demande confirmation
- [ ] Annulation supprime la vente
- [ ] Bouton "Fermer" ferme le modal

### Gestion des Erreurs
- [ ] Erreur API affichée correctement
- [ ] "-" affiché pour données manquantes
- [ ] Pas de blocage de l'interface
- [ ] Messages d'erreur clairs

### Responsive Design
- [ ] Desktop: grille 2 colonnes
- [ ] Tablette: grille adaptée
- [ ] Mobile: scroll vertical seulement

### Performance
- [ ] Chargement rapide (<2s)
- [ ] Pas de lag ou freeze
- [ ] Images optimisées
- [ ] CSS chargé rapidement

### Accessibilité
- [ ] Couleurs contrastées
- [ ] Textes lisibles
- [ ] Navigation au clavier possible
- [ ] Labels et titles appropriés
```

---

## 🐛 Déboguer les Problèmes Courants

### Le modal ne s'ouvre pas

**Vérifications:**
```javascript
// 1. Modal HTML existe
document.getElementById('modalDetailsVente'); // Should not be null

// 2. VenteManager chargé
venteManager; // Should be instance of VenteManager

// 3. Bootstrap.Modal disponible
bootstrap.Modal; // Should be defined

// 4. Regarder les erreurs console
// F12 → Console → Chercher les erreurs en rouge
```

### Les données ne se chargent pas

**Vérifications:**
```javascript
// 1. Token valide
localStorage.getItem('token'); // Should return token

// 2. API accessible
fetch('API_URL/api/ventes/TEST_ID', {
    headers: { 'Authorization': 'Bearer ' + token }
}).then(r => console.log(r));

// 3. Network tab dans DevTools
// F12 → Network → Voir la requête vers /api/ventes/:id
// Vérifier le status (200, 404, 401, 500, etc.)
```

### Les styles ne s'appliquent pas

**Vérifications:**
```javascript
// 1. CSS chargé
document.styleSheets[0]; // Should show vente-details-modal.css

// 2. Pas de conflit CSS
// F12 → Inspect element → Voir les styles appliqués

// 3. Recharger hard
// Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)
```

### Les alertes ne s'affichent pas

**Vérifications:**
```javascript
// 1. ThemeManager disponible
window.themeManager; // Check if exists

// 2. Bootstrap.Toast disponible
bootstrap.Toast; // Should be defined

// 3. Tester manuellement
venteManager.showAlert('Test', 'success'); // Should show toast
```

---

## 🎯 Résultats Attendus

### Premier Lancement
- ✅ Pas d'erreurs en console
- ✅ Modal s'affiche proprement
- ✅ Données se chargent
- ✅ Alertes fonctionnent
- ✅ Boutons réactifs

### Performance
- ⚡ Chargement initial: <1s
- ⚡ Affichage modal: <100ms
- ⚡ Chargement données: <2s
- ⚡ Aucun lag UI

### Qualité
- 🎨 Design professionnel
- 🎨 Animations fluides
- 🎨 Responsive sur tous les appareils
- 🎨 Accessibilité decent

---

## 📝 Notes de Test

**Fournisseur de Données:**
- Utiliser des données réelles du système
- Tester avec ventes complètes et incomplètes
- Tester avec différents utilisateurs/rôles

**Environnement:**
- Tester sur navigateurs multiples (Chrome, Firefox, Safari, Edge)
- Tester sur appareils multiples (Desktop, Tablet, Mobile)
- Tester avec connection réseau et offline

**Rapport de Bug:**
Si vous trouvez un problème:
1. Noter les étapes exactes pour reproduire
2. Joindre une capture d'écran
3. Partager les erreurs console
4. Noter la version du navigateur
