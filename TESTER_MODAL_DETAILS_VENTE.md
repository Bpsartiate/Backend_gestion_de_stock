# 🧪 Test du Modal - Guide Pratique

## 🎯 Tester le Modal en 3 Étapes

### ✅ Étape 1: Ouvrir la Page vente.php
```
1. Naviguer vers: http://localhost/backend_Stock/vente.php
2. La page POS doit s'afficher
3. Vérifier le tableau d'historique des ventes en bas
```

### ✅ Étape 2: Chercher une Vente dans le Tableau
```
1. Regarder la section "Historique des Ventes"
2. Vous devez voir un tableau avec les ventes du jour
3. Chaque ligne a un bouton 👁️ (œil) dans la colonne "Actions"
```

**Si pas de ventes:**
- Créer d'abord une vente (ajouter produits + paiement)
- Puis chercher la vente créée

### ✅ Étape 3: Cliquer sur le Bouton 👁️

```
1. Cliquer sur le bouton 👁️ de n'importe quelle vente
2. Le modal doit s'ouvrir avec animation
3. Un spinner doit tourner pendant 1-2 secondes
4. Les données doivent s'afficher ensuite
```

---

## ✨ Ce Que Vous Devez Voir

### Dans le Modal

```
┌─────────────────────────────────────────────┐
│ 📋 Détails de la Vente      [Vente #ABC123] │  ← Header Purple
├─────────────────────────────────────────────┤
│                                               │
│  👤 INFORMATION DU VENDEUR                   │
│     [Photo] Jean Martin                      │
│     Rôle: VENDEUR | Email: jean@...        │
│                                               │
│  🏪 MAGASIN & GUICHET                       │
│     [Magasin Centre]        [Guichet 1]    │ ← Orange
│                                               │
│  📦 ARTICLES VENDUS                         │
│     • Laptop HP - $175.25 x2 = $350.50    │
│     • Souris - $25.00 x1 = $25.00         │
│                                               │
│  💵 RÉSUMÉ FINANCIER                        │
│     Montant USD: $375.50                   │
│     Mode Paiement: CASH                    │
│                                               │
│  📋 INFOS SUPPLÉMENTAIRES                   │
│     Date: 10/01/2026 14:30:45             │
│     Statut: COMPLÉTÉ                       │
│     Client: Monsieur Dupont                │
│     Quantité: 3 articles                   │
│                                               │
├─────────────────────────────────────────────┤
│ [🖨️ Imprimer] [❌ Annuler] [✅ Fermer]     │
└─────────────────────────────────────────────┘
```

---

## 🎯 Tester les Fonctionnalités

### Test 1: Affichage des Données
**Action:** Ouvrir un modal  
**Attendre:** Spinner pendant 1-2s  
**Vérifier:**
- ✅ Numero de vente visible
- ✅ Infos vendeur affichées
- ✅ Magasin et guichet visibles
- ✅ Articles avec photos
- ✅ Montants formatés
- ✅ Toutes les infos supplémentaires

---

### Test 2: Imprimer la Vente
**Action:** Cliquer sur bouton [🖨️ Imprimer]  
**Attendre:** Nouvelle fenêtre d'impression  
**Vérifier:**
- ✅ Fenêtre d'impression s'ouvre
- ✅ Document bien formaté
- ✅ Toutes les infos présentes
- ✅ Alerte "Impression lancée" en vert

---

### Test 3: Annuler la Vente
**Action:** Cliquer sur bouton [❌ Annuler]  
**Attendre:** Dialog de confirmation  
**Vérifier:**
- ✅ Boîte demande: "Êtes-vous sûr?"
- ✅ Cliquer OK:
  - Modal se ferme
  - Alerte verte "Vente annulée"
  - Vente disparaît du tableau
- ✅ OU Cliquer Cancel:
  - Modal reste ouvert
  - Rien ne change

---

### Test 4: Fermer le Modal
**Action:** Cliquer sur [✅ Fermer]  
**OU** Cliquer sur X  
**OU** Appuyer sur Échap  
**Vérifier:**
- ✅ Modal se ferme
- ✅ Tableau en arrière-plan inchangé

---

### Test 5: Système d'Alertes
**Vérifié automatiquement:**
- 🟢 **Succès (vert):** Affiche en bas-droit après imprimer
- 🔴 **Erreur (rouge):** Affiche si données manquantes
- 🟠 **Warning (orange):** N/A pour ce test
- 🔵 **Info (bleu):** N/A pour ce test

---

## 🔍 Checklist de Vérification

```markdown
### Affichage
- [ ] Modal s'ouvre avec animation fade-in
- [ ] Spinner tourne pendant le chargement
- [ ] Contenu apparaît après 1-2 secondes
- [ ] Header a gradient purple
- [ ] Guichet card a gradient orange

### Données
- [ ] Numéro de vente affiché
- [ ] Photo vendeur visible
- [ ] Nom vendeur affiché
- [ ] Email vendeur affiché
- [ ] Rôle avec badge coloré
- [ ] Nom magasin affiché
- [ ] Adresse magasin affiché
- [ ] Nom guichet affiché
- [ ] Articles avec photos
- [ ] Montants formatés (USD, FC si applicable)
- [ ] Mode paiement affiché
- [ ] Date/heure formatée
- [ ] Statut avec badge
- [ ] Client affiché
- [ ] Quantité totale correcte

### Interactions
- [ ] Bouton Imprimer fonctionne
- [ ] Bouton Annuler fonctionne
- [ ] Bouton Fermer fonctionne
- [ ] X header ferme modal
- [ ] Échap ferme modal

### Alertes
- [ ] Alerte "Impression lancée" après imprimer
- [ ] Alerte "Vente annulée" après annulation
- [ ] Toast en bas-droit
- [ ] Fermeture auto après 4s

### Design
- [ ] Couleurs correctes
- [ ] Spacing bon
- [ ] Textes lisibles
- [ ] Pas de texte coupé
- [ ] Images bien alignées
```

---

## 🐛 Dépannage

### Le modal ne s'ouvre pas
1. Ouvrir DevTools (F12)
2. Aller à l'onglet Console
3. Chercher les erreurs en rouge
4. Copier l'erreur et chercher

**Erreur courante:**
```
ReferenceError: venteManager is not defined
→ Solution: Recharger la page (Ctrl+R ou Cmd+R)
```

### Les données ne s'affichent pas
1. Ouvrir DevTools (F12)
2. Aller à l'onglet Network
3. Chercher la requête `/api/ventes/...`
4. Vérifier le status (200 = OK, 404 = Not Found, 500 = Error)

**Status 401 (Unauthorized):**
→ Token JWT expiré, se reconnecter

**Status 404 (Not Found):**
→ Vente n'existe pas

**Status 500 (Server Error):**
→ Erreur backend

### Les styles ne s'appliquent pas
1. Recharger la page (Ctrl+Shift+R pour hard refresh)
2. Vérifier que vente-details-modal.css est lié dans vente.php
3. Ouvrir DevTools → Inspector → Vérifier les styles appliqués

---

## ✨ Résultats Attendus

### Premier Clic - Succès ✅
```
1. Modal s'ouvre
2. Spinner apparaît
3. API appelle `/api/ventes/:id`
4. Spinner disparaît après ~1-2 secondes
5. Contenu apparaît avec animation
6. Toutes les données affichées
```

### Interaction - Succès ✅
```
Imprimer:    Fenêtre impression s'ouvre
Annuler:     Dialog de confirmation
Fermer:      Modal se ferme
```

### Alertes - Succès ✅
```
Toast vert en bas-droit avec icône ✓
Texte du message affiché
Auto-fermeture après 4 secondes
Ou fermeture manuelle sur X
```

---

## 📊 Vérification Backend

Si les données ne chargent pas, vérifier l'API:

```bash
# Test avec curl (remplacer les valeurs)
curl -X GET http://localhost:3000/api/ventes/VENTE_ID \
  -H "Authorization: Bearer TOKEN_JWT"

# Résultat attendu (200 OK):
{
  "_id": "...",
  "dateVente": "2024-01-10T...",
  "montantUSD": 350.50,
  "articles": [...],
  "utilisateur": {...},
  "magasin": {...},
  "guichet": {...}
}
```

---

## 💡 Tips

1. **Test avec plusieurs ventes:**
   - Ouvrir détails de vente 1
   - Fermer
   - Ouvrir détails de vente 2
   - Vérifier que données sont différentes

2. **Test mode mobile:**
   - F12 → Toggle device toolbar
   - Choisir iPhone/Android
   - Modal doit être fullscreen
   - Doit être scrollable

3. **Test en mode sombre (optionnel):**
   - Si dark mode est disponible
   - Styles doivent adapter

---

## 🎉 C'est Tout!

Le modal est prêt à être testé. Amusez-vous bien! 🚀

**Questions?** Consulter la documentation:
- `VENTE_DETAILS_MODAL_QUICK_START.md`
- `VENTE_DETAILS_MODAL.md`
