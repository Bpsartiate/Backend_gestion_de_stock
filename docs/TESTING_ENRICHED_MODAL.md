# 🧪 Guide de Test - Modal Produit Enrichi

## 📋 Résumé

Le modal produit détaillé (`modal_product_detail_premium.php`) a été enrichi pour afficher:
- ✅ Données du produit (infos basiques)
- ✅ Alertes et état du stock (KPI cards)
- ✅ Réceptions récentes (historique avec accordion)
- ✅ Mouvements de stock (table détaillée)
- ✅ Enregistrement et audit (qui/quand créé/modifié)

## 🏗️ Architecture

### Endpoint utilisé
```
GET /api/protected/produits/:produitId?include=mouvements,receptions,alertes,enregistrement
```

### Fallbacks en cascade
1. **Niveau 1**: Nouvel endpoint enrichi (préféré)
2. **Niveau 2**: Cache local CACHE_PRODUITS
3. **Niveau 3**: API classique `/produits/:id`

### Structure HTML Ajoutée

```html
<!-- Section 5: Alertes & État -->
<h6>Alertes & État</h6>
<div id="premiumAlertStockActuel">Stock actuel</div>
<div id="premiumAlertSeuilAlerte">Seuil d'alerte</div>
<div id="premiumAlertLabel">Label d'alerte</div>
<div id="premiumAlertPeremption">Info péremption</div>

<!-- Section 6: Réceptions récentes -->
<h6>Réceptions récentes</h6>
<div id="premiumReceptionsContainer" class="accordion">
  <!-- Accord items générés dynamiquement -->
</div>

<!-- Section 8: Enregistrement & Audit -->
<h6>Enregistrement & Audit</h6>
<div id="premiumAuditCreatedBy">Créé par</div>
<div id="premiumAuditCreatedAt">Créé le</div>
<div id="premiumAuditUpdatedBy">Modifié par</div>
<div id="premiumAuditUpdatedAt">Modifié le</div>
```

## 🧪 Procédure de Test

### Test 1: Ouverture du modal avec endpoint enrichi

**Étapes:**
1. Aller sur la page stock (`/pages/stock/stocks_et_entreposage.php`)
2. Cliquer sur un produit pour ouvrir le modal détail
3. Vérifier dans la console: `✅ Endpoint enrichi utilisé`

**Vérifications:**
- ✅ Modal s'ouvre sans erreurs
- ✅ Console affiche: `✅ Endpoint enrichi utilisé: { data: {...}, included: [...] }`
- ✅ Les 8 sections sont visibles

---

### Test 2: Affichage des alertes

**Étapes:**
1. Ouvrir le modal d'un produit
2. Scroll jusqu'à **Section 5: Alertes & État**

**Vérifications:**
- ✅ Stock actuel = quantiteActuelle
- ✅ Seuil d'alerte = seuilAlerte
- ✅ Label d'alerte avec couleur:
  - 🟢 Vert (✅ OK) si stock > seuil
  - 🟡 Jaune (⚠️ Stock bas) si 0 < stock ≤ seuil
  - 🔴 Rouge (🔴 Rupture) si stock = 0
- ✅ Info péremption (date ou "N/A")

---

### Test 3: Affichage des réceptions

**Étapes:**
1. Ouvrir le modal d'un produit ayant des réceptions
2. Scroll jusqu'à **Section 6: Réceptions récentes**
3. Cliquer sur une réception pour déplier l'accordion

**Vérifications:**
- ✅ Chaque réception affiche:
  - En-tête: quantité + date + fournisseur + statut
  - Détails (dépliés):
    - Prix achat unitaire
    - Prix total
    - Lot/Série
    - Date fabrication
    - Date péremption avec badge:
      - 🔴 PÉRIMÉ si date < aujourd'hui
      - 🟡 XXX jours si < 30 jours
    - Utilisateur qui a enregistré
    - Photo (si disponible, clickable pour lightbox)

**Structure d'une réception:**
```javascript
{
  dateReception: Date,
  quantite: Number,
  fournisseur: String,
  prixAchat: Number,
  prixTotal: Number,
  dateFabrication: Date,
  datePeremption: Date,
  lotNumber: String,
  statut: 'stocke'|'controle'|'rejete',
  photoUrl: String (optional),
  utilisateurId: {
    prenom: String,
    nom: String
  }
}
```

---

### Test 4: Affichage des mouvements

**Étapes:**
1. Ouvrir le modal d'un produit
2. Scroll jusqu'à **Section 7: Mouvements de stock**

**Vérifications:**
- ✅ Table affiche les 20 derniers mouvements
- ✅ Chaque ligne contient:
  - Date: format JJ/MM/AAAA
  - Type: Entrée (🟢) ou Sortie (🔴)
  - Quantité: nombre
  - Détails: description ou rayon
  - Utilisateur: prénom de l'utilisateur

**Structure d'un mouvement:**
```javascript
{
  dateMouvement: Date,
  typeMouvement: 'Entrée'|'Sortie',
  quantite: Number,
  description: String,
  rayon: { nomRayon: String },
  utilisateurId: { prenom: String }
}
```

---

### Test 5: Affichage de l'audit

**Étapes:**
1. Ouvrir le modal d'un produit
2. Scroll jusqu'à **Section 8: Enregistrement & Audit**

**Vérifications:**
- ✅ Affiche:
  - Créé par: Prenom Nom
  - Créé le: JJ/MM/AAAA
  - Modifié par: Prenom Nom (ou "Pas de modification")
  - Modifié le: JJ/MM/AAAA (ou "Pas de modification")

**Structure de l'audit:**
```javascript
{
  createdBy: { prenom: String, nom: String },
  createdAt: Date,
  updatedBy: { prenom: String, nom: String } (optional),
  updatedAt: Date (optional)
}
```

---

## 🧪 Tests de Fallback

### Test 6: Fallback vers le cache

**Étapes:**
1. Ouvrir DevTools → Network
2. Bloquer la requête API enrichie (DevTools → Network → throttling)
3. Ouvrir un modal produit
4. Vérifier dans la console

**Vérifications:**
- ✅ Console affiche: `⚠️ Endpoint enrichi non disponible, fallback au cache`
- ✅ Modal s'ouvre quand même avec les données du cache
- ✅ Sections qui dépendent de l'endpoint enrichi sont vides ou affichent "Aucune réception"

### Test 7: Pas de réceptions

**Étapes:**
1. Créer un nouveau produit (pas de réception)
2. Ouvrir le modal détail

**Vérifications:**
- ✅ Section 6 affiche: `<i class="fas fa-inbox"></i> Aucune réception`
- ✅ Pas d'erreurs en console

---

## 🔧 Dépannage

### Problème: "404 Endpoint not found"
**Solution:** L'endpoint enrichi n'existe pas encore dans `routes/protected.js`
- Vérifier que l'endpoint a bien été créé/déployé
- Fallback vers cache/API classique fonctionne

### Problème: Réceptions non visibles
**Étapes de débogage:**
1. Ouvrir Console → Network → Chercher `/produits/..?include=`
2. Vérifier la réponse JSON:
   - Clé `receptions` présente?
   - Format correct?
3. Vérifier que le produit a bien des réceptions dans MongoDB

### Problème: Images de réceptions non visibles
**Vérifications:**
1. Réception a bien `photoUrl`?
2. URL est accessible (CORS, authentification)?
3. Fichier existe sur le serveur?

---

## 📊 Données de Test

### Produit de test avec réceptions
```javascript
{
  "_id": "prod123",
  "designation": "Produit Test",
  "reference": "REF-001",
  "quantiteActuelle": 45,
  "seuilAlerte": 20,
  "prixAchat": 10.50,
  "prixUnitaire": 25.00,
  
  "receptions": [
    {
      "dateReception": "2024-01-15T10:30:00Z",
      "quantite": 50,
      "fournisseur": "Fournisseur ABC",
      "prixAchat": 10.50,
      "prixTotal": 525.00,
      "dateFabrication": "2024-01-10T00:00:00Z",
      "datePeremption": "2025-01-15T00:00:00Z",
      "lotNumber": "LOT-2024-001",
      "statut": "stocke",
      "photoUrl": "https://..../reception-photo.jpg",
      "utilisateurId": { "prenom": "Jean", "nom": "Dupont" }
    }
  ],
  
  "mouvements": [
    {
      "dateMouvement": "2024-01-16T14:20:00Z",
      "typeMouvement": "Sortie",
      "quantite": 5,
      "rayon": { "nomRayon": "Rayon A" },
      "utilisateurId": { "prenom": "Marie" }
    }
  ],
  
  "alertes": {
    "stockBas": false,
    "rupture": false,
    "peremption": false,
    "niveau": "ok"
  },
  
  "createdBy": { "prenom": "Admin", "nom": "Système" },
  "createdAt": "2024-01-10T08:00:00Z",
  "updatedBy": { "prenom": "Jean", "nom": "Dupont" },
  "updatedAt": "2024-01-16T14:20:00Z"
}
```

---

## 📝 Checklist de Validation

### Frontend
- [ ] Modal s'ouvre avec endpoint enrichi
- [ ] Fallback fonctionne (cache, API classique)
- [ ] Section Alertes affiche correctement
- [ ] Section Réceptions avec accordion fonctionne
- [ ] Section Mouvements affiche 20 derniers
- [ ] Section Audit affiche correctement
- [ ] Images clickables pour lightbox
- [ ] Pas d'erreurs en console

### Backend
- [ ] Endpoint `GET /produits/:id?include=mouvements,receptions,alertes,enregistrement` existe
- [ ] Populate `mouvements` retourne bien les données
- [ ] Populate `receptions` retourne bien les données
- [ ] Alertes calculées correctement
- [ ] Audit retourné avec createdBy/updatedBy

### UX
- [ ] Modal s'ouvre rapidement (< 1s)
- [ ] Accordion réceptions est intuitive
- [ ] Couleurs des alertes claires
- [ ] Pas de données manquantes/tronquées
- [ ] Responsive sur mobile (accordion collapse correctement)

---

## 🚀 Prochaines Étapes

1. **Performance:** Implémenter un cache localStorage pour les réceptions
2. **Mobile:** Tester sur navigateur mobile (iPhone/Android)
3. **Exportation:** Ajouter bouton "Exporter fiche produit" (PDF)
4. **Historique:** Ajouter filtre date pour les mouvements
5. **Ventes:** Intégrer le module ventes (futures données)

---

## 📚 Fichiers Modifiés

- `pages/stock/modal_product_detail_premium.php` - HTML + JavaScript enrichis
- `routes/protected.js` - Endpoint enrichi `GET /produits/:id`
- `docs/API_PRODUIT_ENRICHI.md` - Documentation API (déjà créée)
- `docs/MOBILE_INTEGRATION_ENDPOINT_ENRICHI.md` - Guide mobile (déjà créée)

---

**Créé:** 2024
**Statut:** 🟢 En production
**Version:** 1.0 (Modal enrichi)
