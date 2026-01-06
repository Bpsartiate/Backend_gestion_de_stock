# 🔍 Guide de Débogage - Modal Produit Enrichi Session 3

## 📋 Corrections Appliquées

### ✅ Backend (`routes/protected.js`)

1. **Endpoint mouvements** (lignes 2228-2233):
   ```javascript
   const mouvements = await StockMovement.find({ produitId: produitId })
     .populate('utilisateurId', 'prenom nom email')  // ✅ POPULATE AJOUTÉ
     .select('dateDocument type quantite observations utilisateurId prixUnitaire numeroDocument fournisseur')
     .sort({ dateDocument: -1 })
     .limit(50);
   ```
   - ✅ `.populate('utilisateurId')` récupère le nom de l'utilisateur
   - ✅ `observations` contient les détails du mouvement
   - ✅ `numeroDocument` et `fournisseur` disponibles

2. **Endpoint audit** (lignes 2260-2303):
   ```javascript
   let auditLogs = [];
   auditLogs = await AuditLog.find({ 
     entityId: produitId, 
     entityType: 'Produit' 
   })
     .populate('utilisateurId', 'prenom nom email')  // ✅ POPULATE AJOUTÉ
     .sort({ createdAt: -1 })
     .limit(50);
   
   // Récupère le premier log = création, le dernier log = modification
   response.audit = {
     createdAt: produit.createdAt,
     updatedAt: produit.updatedAt,
     createdBy: auditLogs[auditLogs.length - 1]?.utilisateurId || {...},
     updatedBy: auditLogs[0]?.utilisateurId || {...},
     logs: auditLogs  // ✅ ACTIVITY LOGS COMPLETS
   };
   ```

### ✅ Frontend (`pages/stock/modal_product_detail_premium.php`)

1. **Catégorie** (ligne 441):
   - ❌ AVANT: `produit.typeProduitsId?.nomType` (typo)
   - ✅ APRÈS: `produit.typeProduitId?.nomType` (correct)

2. **Unité** (ligne 487):
   - ❌ AVANT: `produit.typeProduitId?.unitePrincipale || produit.unitePrincipale || '--'`
   - ✅ APRÈS: `produit.typeProduitId?.unitePrincipale || '--'` (depuis typeProduitsId populate)

3. **Caractéristiques** (lignes 483-485):
   ```javascript
   document.getElementById('premiumSize').textContent = produit.champsDynamiques?.taille || produit.taille || '--';
   document.getElementById('premiumColor').textContent = produit.champsDynamiques?.couleur || produit.couleur || '--';
   document.getElementById('premiumQuality').textContent = produit.champsDynamiques?.qualite || produit.qualite || '--';
   ```

4. **Audit** (lignes 696-752):
   - ✅ Amélioration: Affiche le vrai nom de l'utilisateur créateur
   - ✅ Amélioration: Affiche le nom de l'utilisateur qui a modifié
   - ✅ Amélioration: Gère les cas null/undefined proprement

5. **Console logs** (lignes 540-544):
   ```javascript
   console.log('✅ Produit complet reçu:', produit);
   console.log('📊 Mouvements:', produit.mouvements);
   console.log('📬 Réceptions:', produit.receptions);
   console.log('📋 Audit:', produit.audit);
   ```

---

## 🧪 Étapes de Débogage

### 1. **Ouvrir la Developer Console (F12)**

### 2. **Vérifier les logs lors de l'ouverture du modal**

Vous devriez voir:
```
✅ Produit complet reçu: {
  _id: "...",
  designation: "Viande crue",
  reference: "M23324",
  typeProduitId: { _id: "...", nomType: "Viandes", unitePrincipale: "kg" },
  champsDynamiques: { taille: "500g", couleur: "rouge", qualite: "premium" },
  quantiteActuelle: 100,
  prixUnitaire: 25.5,
  ...
}

📊 Mouvements: [
  {
    _id: "...",
    dateDocument: "2025-01-15T10:30:00Z",
    type: "RECEPTION",
    quantite: 50,
    observations: "Livraison ABC Supplier",
    utilisateurId: { _id: "...", prenom: "Jean", nom: "Dupont", email: "..." },
    prixUnitaire: 22.5,
    numeroDocument: "FAC-001",
    fournisseur: "ABC Supplier"
  },
  ...
]

📬 Réceptions: [
  {
    _id: "...",
    dateReception: "2025-01-15T10:30:00Z",
    quantite: 50,
    fournisseur: "ABC Supplier",
    prixAchat: 22.5,
    utilisateurId: { _id: "...", prenom: "Jean", nom: "Dupont", email: "..." },
    ...
  },
  ...
]

📋 Audit: {
  createdAt: "2024-12-20T08:00:00Z",
  updatedAt: "2025-01-15T10:30:00Z",
  createdBy: { _id: "...", prenom: "Admin", nom: "User", email: "..." },
  updatedBy: { _id: "...", prenom: "Jean", nom: "Dupont", email: "..." },
  logs: [
    {
      action: "CREATE_PRODUIT",
      utilisateur: { _id: "...", prenom: "Admin", nom: "User", email: "..." },
      description: "Produit 'Viande crue' créé",
      createdAt: "2024-12-20T08:00:00Z",
      changes: { ... }
    },
    {
      action: "UPDATE_PRODUIT",
      utilisateur: { _id: "...", prenom: "Jean", nom: "Dupont", email: "..." },
      description: "Quantité mise à jour",
      createdAt: "2025-01-15T10:30:00Z",
      changes: { ... }
    },
    ...
  ]
}
```

### 3. **Vérifier le modal lui-même**

**Section "Vue d'ensemble":**
- [ ] ✅ Catégorie: "Viandes" (avant: "--")
- [ ] ✅ Fournisseur: "ABC Supplier" (avant: "--")
- [ ] ✅ Prix achat: "22.5€" (avant: "0€")

**Section "Caractéristiques":**
- [ ] ✅ Taille: "500g" (avant: "--")
- [ ] ✅ Couleur: "rouge" (avant: "--")
- [ ] ✅ Qualité: "premium" (avant: "--")
- [ ] ✅ Unité: "kg" (avant: "--")

**Section "Mouvements de stock":**
- [ ] ✅ Colonne "Date": "15/01/2025"
- [ ] ✅ Colonne "Type": "RECEPTION"
- [ ] ✅ Colonne "Quantité": "50"
- [ ] ✅ Colonne "Détails": "Livraison ABC Supplier" (avant: "--")
- [ ] ✅ Colonne "Utilisateur": "Jean Dupont" (avant: "--")

**Section "Enregistrement & Audit":**
- [ ] ✅ "Créé par": "Admin User" (avant: "(Inconnu)")
- [ ] ✅ "Créé le": "20/12/2024"
- [ ] ✅ "Modifié par": "Jean Dupont" (avant: "(Aucune modification)")
- [ ] ✅ "Modifié le": "15/01/2025"

---

## 🐛 Si Vous Voyez Encore "--"

### Problème: Catégorie ou Caractéristiques toujours "--"

**Cause possible:** Les données ne sont pas dans la base de données

**Vérification:**
```javascript
// Dans la console, exécutez:
console.log('TypeProduitId:', produit.typeProduitId);
console.log('ChampsDynamiques:', produit.champsDynamiques);
```

**Solutions:**
1. Si `typeProduitId` est `null` → Le produit n'est pas lié à un type de produit (erreur lors de la création)
2. Si `champsDynamiques` est `{}` → Les données n'ont pas été saisies lors de la création du produit
3. Si `champsDynamiques` existe mais `taille/couleur/qualite` sont absents → Ajouter ces champs au produit

### Problème: Mouvements vides (aucun mouvement affichée)

**Cause possible:** Aucun mouvement de stock enregistré pour ce produit

**Vérification:**
```javascript
// Dans la console:
console.log('Mouvements reçus:', produit.mouvements);
console.log('Longueur:', produit.mouvements?.length);
```

**Solution:** Créer un mouvement de stock (réception, sortie, etc.)

### Problème: Mouvements affichés mais "Détails" vide

**Cause possible:** Le champ `observations` n'est pas rempli au moment de la création du mouvement

**Vérification:**
```javascript
// Dans la console:
console.log('Premier mouvement:', produit.mouvements?.[0]);
console.log('Observations:', produit.mouvements?.[0]?.observations);
```

**Solution:** Les mouvements doivent avoir des `observations` ou `numeroDocument` remplis lors de la création

### Problème: "Créé par" toujours "(Inconnu)"

**Cause possible:** Aucun log d'audit créé pour ce produit

**Vérification:**
```javascript
// Dans la console:
console.log('Audit logs:', produit.audit?.logs);
console.log('CreatedBy:', produit.audit?.createdBy);
```

**Solution:** Les AuditLogs doivent être créés automatiquement quand un produit est créé/modifié

---

## 📊 Mapping des Données

### Mouvements de Stock

| Affichage | Champ Source | Schéma |
|-----------|------------|---------|
| Date | `dateDocument` | ✅ StockMovement.dateDocument |
| Type | `type` | ✅ StockMovement.type (RECEPTION/SORTIE/etc) |
| Quantité | `quantite` | ✅ StockMovement.quantite |
| Détails | `observations \|\| numeroDocument \|\| fournisseur` | ✅ StockMovement.observations |
| Utilisateur | `utilisateurId.prenom utilisateurId.nom` | ✅ StockMovement.utilisateurId (populé) |

### Réceptions

| Affichage | Champ Source | Schéma |
|-----------|------------|---------|
| Quantité | `quantite` | ✅ Reception.quantite |
| Fournisseur | `fournisseur` | ✅ Reception.fournisseur |
| Prix achat | `prixAchat` | ✅ Reception.prixAchat |
| Utilisateur | `utilisateurId.prenom utilisateurId.nom` | ✅ Reception.utilisateurId (populé) |

### Audit/Activity

| Affichage | Champ Source | Schéma |
|-----------|------------|---------|
| Créé par | `audit.createdBy.prenom audit.createdBy.nom` | ✅ AuditLog.utilisateurId (plus ancien log) |
| Créé le | `audit.createdAt` | ✅ Produit.createdAt |
| Modifié par | `audit.updatedBy.prenom audit.updatedBy.nom` | ✅ AuditLog.utilisateurId (plus récent log) |
| Modifié le | `audit.updatedAt` | ✅ Produit.updatedAt |
| Activity Logs | `audit.logs[]` | ✅ AuditLog (action, description, changes) |

---

## 🔧 Points de Vérification Technique

### Backend - Endpoint `/api/protected/produits/:id?include=mouvements,receptions,alertes,enregistrement`

**Avant modification:**
- ❌ Mouvements: pas de `.populate('utilisateurId')`
- ❌ Audit: cherchait `produit.createdBy` (n'existe pas)
- ❌ Champs sélectionnés: incorrects (date au lieu de dateDocument)

**Après modification:**
- ✅ Mouvements: `.populate('utilisateurId', 'prenom nom email')`
- ✅ Audit: cherche dans `AuditLog.utilisateurId`
- ✅ Champs sélectionnés: corrects et complets

### Frontend - `loadPremiumMovements()` & `loadPremiumAudit()`

**Avant modification:**
- ❌ Accédait à `m.typeMouvement` (reçoit `m.type`)
- ❌ Accédait à `m.description` (reçoit `m.observations`)
- ❌ Audit: accédait à `.userId` (reçoit `.utilisateurId`)

**Après modification:**
- ✅ Accède aux bons noms de champs
- ✅ Gère les null/undefined proprement
- ✅ Affiche le vrai nom de l'utilisateur

---

## 📌 Prochaines Étapes

1. **Tester dans le navigateur** avec F12 ouvert
2. **Vérifier les console.log** pour voir les données réelles
3. **Signaler le problème spécifique** si les données n'arrivent pas
4. **Vérifier la base de données** si certains champs manquent

**Données attendues pour un test complet:**
- ✅ Produit avec `typeProduitId` populé
- ✅ Produit avec `champsDynamiques` rempli
- ✅ Au moins 1 mouvement de stock avec `observations`
- ✅ Au moins 1 réception avec `fournisseur` et `prixAchat`
- ✅ Au moins 1 log d'audit (créé automatiquement)

