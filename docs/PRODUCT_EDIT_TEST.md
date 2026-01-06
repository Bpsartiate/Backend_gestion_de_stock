## 🧪 Test checklist: Système d'édition de produit

### ✅ Prérequis
- [ ] Base de données lancée et connectée
- [ ] Serveur Node.js en cours d'exécution
- [ ] Utilisateur connecté (admin ou manager)
- [ ] Un produit existe dans la base de données
- [ ] AuditLog collection créée (TTL index)

### 🔍 Phase 1: Chargement & Interface

- [ ] **Page charge correctement**
  - Tableau des produits visible
  - Boutons "Modifier" présents

- [ ] **Clic sur "Modifier"**
  - Modal s'ouvre sans erreur console
  - Titre du produit affichage correct
  - 4 onglets visibles

- [ ] **Onglet 1: Produit**
  - Tous les champs chargés (designation, reference, etc.)
  - Dropdowns (type, rayon) remplis
  - Photo affichée si existe
  - Pas d'erreur console

### 🎨 Phase 2: Chargement des données

- [ ] **Stocks chargé correctement**
  - Spinner disparaît après 2-3 secondes
  - Tableau visible si stocks existent
  - Message "Aucun stock" si vide
  - Rayon, quantité, nb réceptions affichés

- [ ] **Réceptions chargé correctement**
  - Tableau visible si réceptions existent
  - Date, quantité, fournisseur affichés
  - Statut avec badge (vert=stocké, orange=autre)
  - Totaux calculés correctement

- [ ] **Historique (Audit Trail)**
  - Timeline affichée si au moins 1 log existe
  - Couleurs des points: ✅ vert, 🔄 bleu, 🗑️ rouge
  - Dates lisibles (format français)
  - Auteur et raison affichés

### ✏️ Phase 3: Édition

- [ ] **Détection de changements**
  - Modifier un champ → Warning apparaît
  - Changer la date d'un autre onglet → Warning revient
  - Avertissement disparaît si on recharge

- [ ] **Upload photo**
  - Sélectionner une image → Aperçu s'affiche
  - Supporte JPG et PNG
  - Refus fichiers > 5MB (si implémenté)

- [ ] **Dropdowns**
  - Types de produits chargés
  - Rayons chargés
  - Sélection fonctionne

### 💾 Phase 4: Sauvegarde

- [ ] **Clic "Sauvegarder"**
  - Champs requis validés (designation, reference, prix, seuil)
  - Erreur si champ requis vide
  - Photo uploadée si fournie
  - API call démarre (vérifier Network tab)

- [ ] **Réponse API**
  - Status 200 OK
  - Response contient `message: "Produit modifié avec succès"`
  - Données retournées correctement
  - Pas d'erreur 400/403/404/500

- [ ] **Après sauvegarde**
  - Toast vert "✅ Produit modifié avec succès"
  - Modal se ferme après 1 seconde
  - Table recharge avec nouvelles données
  - Aucune erreur console

### 🔐 Phase 5: Audit Log

- [ ] **Vérifier AuditLog créé**
  - BASE: `db.auditlogs.find({entityId: "produitId"})`
  - Contient:
    - ✅ `action: "UPDATE_PRODUIT"`
    - ✅ `before: { champs anciens }`
    - ✅ `after: { champs nouveaux }`
    - ✅ `utilisateurId: user._id`
    - ✅ `description: "Produit XYZ modifié"`
    - ✅ `statut: "success"`
    - ✅ `createdAt: date`

- [ ] **Historique onglet**
  - Recharger la page (ou rouvrir le modal)
  - Nouvel événement visible dans timeline
  - Affiche le bon auteur et action

### 🔒 Phase 6: Permissions

- [ ] **Accès Admin** ✅
  - Peut éditer tous les produits

- [ ] **Accès Manager**
  - Peut éditer produits de son magasin
  - Ne peut pas éditer autre magasin (403)

- [ ] **Accès Vendeur** ❌
  - Bouton "Modifier" caché ou désactivé
  - Erreur 403 si appel direct

### ⚠️ Phase 7: Cas limites

- [ ] **Produit inexistant**
  - GET /produits/invalidId → 404
  - Modal pas ouverte
  - Toast d'erreur

- [ ] **Stock vide**
  - Onglet Stocks → "Aucun stock enregistré"

- [ ] **Aucune réception**
  - Onglet Réceptions → "Aucune réception enregistrée"

- [ ] **Aucun historique**
  - Onglet Historique → "Aucun historique disponible"

- [ ] **Pas de photo**
  - Onglet produit → Zone vide ou placeholder
  - Upload photo → Fonctionne

- [ ] **Champs non modifiés**
  - Cliquer "Sauvegarder" sans rien changer
  - Devrait toujours fonctionner (changements vides)

### 📡 Phase 8: Network & Console

- [ ] **Pas d'erreur console**
  - Console.log propre (sauf logs intentionnels)
  - Pas d'erreurs rouges

- [ ] **Requêtes API correctes**
  - GET /produits/:id → 200
  - GET /produits/:id/stocks → 200
  - GET /receptions?produitId=:id → 200
  - GET /audit-logs/Produit/:id → 200
  - PUT /produits/:id → 200

- [ ] **Temps de réponse**
  - GET produit < 100ms
  - PUT sauvegarde < 500ms
  - Pas de requête dupliquée

### 🎯 Phase 9: Edge cases

- [ ] **Fermeture modal sans sauvegarder**
  - Warning disparaît
  - Données non perdues si rouvrir

- [ ] **Modification rapide**
  - Modifier → Sauvegarder rapidement
  - Pas de requête dupliquée

- [ ] **Caractères spéciaux**
  - Accent: "Crème fraîche" → OK
  - Guillemets: "Produit \"Premium\"" → OK
  - HTML: "<script>" → Échappé correctement

- [ ] **Très longs textes**
  - Notes > 1000 caractères → OK
  - Pas de troncature

### 📊 Phase 10: Performance

- [ ] **Temps d'ouverture**
  - Modal ouverte < 2 secondes
  - Données chargées < 3 secondes

- [ ] **Pas de leak mémoire**
  - Ouvrir/fermer 10 fois → OK
  - Pas de dégradation

- [ ] **Responsive**
  - Desktop (1920x1080) → OK
  - Tablet (768x1024) → OK
  - Mobile (375x667) → Scrollable OK

## 🐛 Debugging

Si erreur, vérifier:

### Console.log
```javascript
// Dans product-edit.js, chercher:
console.log('🔧 Ouverture édition produit:', produitId);
console.log('✅ Modal édition ouverte');
console.log('🔄 Changements détectés:', CHANGEMENTS_PRODUIT);
console.log('💾 Sauvegarde du produit...');
console.log('✅ Produit sauvegardé:', result);
```

### Network tab
- Rechercher requêtes "produits"
- Vérifier status 200
- Vérifier response body contient données

### MongoDB
```javascript
// Vérifier AuditLog créé
db.auditlogs.find({entityId: ObjectId("...")}).pretty()

// Vérifier Produit modifié
db.produits.findById(ObjectId("..."))
```

### Cas spécifiques

**Erreur: "Cannot read property '_id' of undefined"**
- Produit non trouvé
- Vérifier produitId est valide

**Erreur: "AuditService.log is not a function"**
- product-edit.js pas inclus
- Ou routes/protected.js pas mis à jour

**Erreur: "Cannot find module '../services/auditService'"**
- Vérifier auditService.js existe
- Vérifier chemin relatif correct

**Erreur: "Modal not showing"**
- Vérifier bootstrap.Modal inclus
- Vérifier id="modalEditProduit" existe
- Vérifier edit_prod.php inclus

## 📝 Résumé après test complet

Après avoir passé toutes les phases:
- [ ] Créer AuditLog entry: TEST SYSTEM VALIDATION
- [ ] Documenter les points failed
- [ ] Créer issues pour problèmes
- [ ] Marquer comme "Ready for production"

