# 🎯 Logique des Rôles dans les Ventes - Guide Complet

## 📋 Structure des Rôles Utilisateur

Le système POS utilise une hiérarchie de rôles avec **permissions multiples par utilisateur**:

### Hiérarchie des Rôles

```
┌─────────────────────────────────────────────────────────┐
│                      ADMIN                              │
│         Rôles: [ADMIN, VENDEUR]                         │
│  - Gère tout (magasins, utilisateurs, configurations)  │
│  - Peut vendre via n'importe quel guichet              │
│  - Peut superviser d'autres vendeurs                    │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    SUPERVISEUR                           │
│         Rôles: [SUPERVISEUR, VENDEUR]                   │
│  - Gère les magasins et guichets                        │
│  - Peut vendre via n'importe quel guichet              │
│  - Supervise les vendeurs                              │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     VENDEUR                             │
│         Rôles: [VENDEUR]                                │
│  - Vend uniquement (pas d'accès aux autres fonctions)  │
│  - Peut vendre via un guichet assigné                  │
│  - Pas de supervision                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🪟 Logique de Vente par Guichet

### Concept Principal

**Quand une vente est créée, elle enregistre:**

1. **`utilisateurId`** → L'ID de la personne qui a créé la vente
   - Peut être un ADMIN, SUPERVISEUR ou VENDEUR
   - C'est la personne **réelle** qui a fait la transaction
   - Son rôle détermine ses permissions d'action

2. **`guichetId`** → Le guichet où la vente a été effectuée
   - Chaque guichet a un `vendeurPrincipal` assigné
   - Le guichet est le point de vente physique

3. **`guichet.vendeurPrincipal`** → Le vendeur assigné au guichet
   - Peut être différent de l'utilisateur qui a créé la vente
   - Utilisé pour les rapports et audit

---

## 💾 Flux de Création de Vente

### Cas 1: Vendeur Standard

```javascript
{
  utilisateurId: "vendeur_123",      // Vendeur qui vend
  guichetId: "guichet_45",           // Guichet utilisé
  
  // Dans la réponse API:
  "utilisateur": {                   // Celui qui a vendu
    _id: "vendeur_123",
    nom: "Martin",
    prenom: "Pierre",
    email: "martin@stock.com",
    role: "VENDEUR"
  },
  
  "guichet": {                       // Le guichet utilisé
    _id: "guichet_45",
    nom_guichet: "Guichet 3",
    code: "G3",
    vendeurPrincipal: {             // Vendeur assigné au guichet
      _id: "vendeur_123",
      nom: "Martin",
      prenom: "Pierre"
    }
  }
}
```

### Cas 2: Superviseur qui Vend

```javascript
{
  utilisateurId: "superviseur_67",   // Superviseur qui vend personnellement
  guichetId: "guichet_45",           // Guichet du superviseur
  
  // Dans la réponse API:
  "utilisateur": {                   // Celui qui a vendu
    _id: "superviseur_67",
    nom: "Jean",
    prenom: "Dupont",
    email: "dupont@stock.com",
    role: "SUPERVISEUR"              // ATTENTION: rôle différent du vendeurPrincipal
  },
  
  "guichet": {                       // Le guichet utilisé
    _id: "guichet_45",
    nom_guichet: "Guichet 3",
    code: "G3",
    vendeurPrincipal: {             // Vendeur normal du guichet
      _id: "vendeur_123",
      nom: "Martin",
      prenom: "Pierre"
    }
  }
}
```

### Cas 3: Admin qui Vend

```javascript
{
  utilisateurId: "admin_99",         // Admin qui vend
  guichetId: "guichet_45",           // Guichet utilisé
  
  // Dans la réponse API:
  "utilisateur": {                   // Celui qui a vendu
    _id: "admin_99",
    nom: "Alice",
    prenom: "Durand",
    email: "alice@stock.com",
    role: "ADMIN"                    // ADMIN VEND!
  },
  
  "guichet": {                       // Le guichet utilisé
    _id: "guichet_45",
    nom_guichet: "Guichet 3",
    code: "G3",
    vendeurPrincipal: {
      _id: "vendeur_123",
      nom: "Martin",
      prenom: "Pierre"
    }
  }
}
```

---

## 🔍 Traçabilité des Ventes

### Ce que les APIs Retournent

**Exemple réponse GET /api/protected/ventes/:venteId**

```json
{
  "_id": "vente_123",
  "dateVente": "2026-01-08T10:30:00Z",
  "magasinId": {
    "_id": "magasin_1",
    "nom_magasin": "Stock Central"
  },
  
  "utilisateurId": {
    "_id": "utilisateur_456",
    "nom": "Albert",
    "prenom": "Mukendi",
    "email": "albert@stock.com",
    "role": "SUPERVISEUR",           // ← Rôle de celui qui a VRAIMENT vendu
    "photoUrl": "...",
    "telephone": "..."
  },
  
  "guichetId": {
    "_id": "guichet_78",
    "nom_guichet": "Guichet 1",
    "code": "G1",
    "vendeurPrincipal": {
      "_id": "utilisateur_789",
      "nom": "Robert",
      "prenom": "Kabamba",
      "email": "robert@stock.com"
    }
  },
  
  "articles": [...],
  "montantTotalUSD": 450.75,
  "modePaiement": "CASH",
  "statut": "VALIDÉE"
}
```

### Interprétation

| Champ | Signification | Cas d'Usage |
|-------|---------------|-----------|
| `utilisateurId` | **Qui a fait la vente** | Rapports vendeur, audit, responsabilité |
| `guichetId.vendeurPrincipal` | **Qui est assigné au guichet** | Vérification des assignations |
| `guichetId` | **Par quel guichet** | Traçabilité du point de vente |

**Exemple d'interprétation:**
- Si `utilisateur.role = "SUPERVISEUR"` et `utilisateur._id ≠ guichet.vendeurPrincipal._id`
  → Un superviseur a vendu via le guichet d'un autre vendeur

---

## ✅ Endpoints API - Complètement Populés

### POST /api/protected/ventes
**Créer une vente**
- Enregistre `utilisateurId` = utilisateur connecté (JWT)
- Enregistre `guichetId` = guichet sélectionné en frontend
- Retourne vente complètement populée

### GET /api/protected/ventes
**Lister les ventes (avec filtres)**
- Retourne `utilisateurId` avec tous les détails
- Retourne `guichetId` avec `vendeurPrincipal` populé
- Retourne magasin, produits, rayons, types

### GET /api/protected/ventes/:venteId
**Détails complets d'une vente**
- Retourne `utilisateurId` avec tous les détails
- Retourne `guichetId` avec `vendeurPrincipal` complètement populé
- Retourne tous les détails imbriqués (magasin → business, produits → type → rayon)

### PUT /api/protected/ventes/:venteId
**Modifier une vente**
- Retourne la vente modifiée complètement populée

### DELETE /api/protected/ventes/:venteId
**Annuler une vente**
- Retourne la vente annulée complètement populée

---

## 🎬 Frontend - Guichet Selection Logic

### Dans vente.php

```javascript
// Quand l'utilisateur sélectionne un magasin:
onMagasinChange() {
    // Charge automatiquement les guichets du magasin
    loadGuichets(magasinId);
    
    // Le premier guichet se sélectionne automatiquement
    currentGuichet = guichets[0]._id;
}

// Quand l'utilisateur crée une vente:
validateVente() {
    fetch('/api/protected/ventes', {
        body: {
            magasinId,
            guichetId: currentGuichet,   // ← Obligatoire
            articles,
            modePaiement,
            utilisateurId: JWT.currentUser  // ← Backend reprend req.user.id
        }
    });
}
```

**Résultat:**
- Admin/Superviseur sélectionne un guichet → vend par ce guichet
- Le backend enregistre qui a vraiment vendu (`utilisateurId` du JWT)
- La réponse contient les infos du guichet ET du vendeur actuel

---

## 📊 Rapports & Audit

### Voir les Ventes d'un Utilisateur Spécifique

```javascript
// Toutes les ventes créées par l'utilisateur ID "user_123"
GET /api/protected/ventes?filtre=utilisateurId:user_123

// Retour: Liste de ventes où utilisateurId._id = "user_123"
```

### Voir les Ventes d'un Guichet Spécifique

```javascript
// Toutes les ventes via le guichet ID "guichet_45"
GET /api/protected/magasins/:magasinId/guichets/guichet_45/ventes

// Retour: Ventes avec guichetId = "guichet_45"
```

### Audit: Qui a Vendu Quoi

```javascript
// Si utilisateurId.role = "SUPERVISEUR" et créé vente via guichet d'un vendeur
// → Superviseur a remplacé vendeur temporairement
// → Enregistrer dans logs pour audit
```

---

## 🔐 Contrôle d'Accès Frontend

```javascript
// Vérifier le rôle avant d'afficher certaines options
if (user.role.includes("ADMIN") || user.role.includes("SUPERVISEUR")) {
    // Afficher: bouton "Change guichet"
    // Afficher: rapports superviseur
    // Afficher: gestion du magasin
} else if (user.role.includes("VENDEUR")) {
    // Afficher: uniquement vente simple
    // Masquer: changement de guichet
}
```

---

## 📝 Résumé

| Aspect | Description |
|--------|-------------|
| **Qui Vend** | `vente.utilisateurId` (enregistré du JWT) |
| **Par Quel Guichet** | `vente.guichetId` (sélectionné en frontend) |
| **Vendeur du Guichet** | `vente.guichetId.vendeurPrincipal` (pour audit) |
| **Rôle du Vendeur** | `vente.utilisateurId.role` (ADMIN/SUPERVISEUR/VENDEUR) |
| **Traçabilité** | Complète: utilisateur, rôle, guichet, magasin, produits |

---

**Statut:** ✅ Implémenté et Documenté  
**Dernière mise à jour:** 2026-01-08  
**Version:** 1.0
