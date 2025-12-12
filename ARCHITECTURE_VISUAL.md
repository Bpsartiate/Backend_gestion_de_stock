# 🎯 VISUAL SUMMARY - Hiérarchie Complète & Endpoints

## 📊 Architecture Visuelle

```
┌─────────────────────────────────────────────────────────────┐
│                    ENTREPRISE (Business)                     │
│                                                               │
│  ├─ nomEntreprise: "Stock Pro SA"                           │
│  ├─ budget: 1,000,000 CDF                                   │
│  └─ devise: "CDF"                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │    MAGASIN (Stock per store)          │
        │                                        │
        │  ├─ nom_magasin: "Magasin Central"   │
        │  ├─ adresse: "Goma, DRC"             │
        │  ├─ telephone: "+243..."              │
        │  ├─ managerId: GESTIONNAIRE_ID        │
        │  ├─ photoUrl: "cloudinary://..."      │
        │  └─ status: 1 (actif)                │
        └───────────────────────────────────────┘
                     │
         ┌───────────┴─────────────┐
         │                         │
         ▼                         ▼
    ┌─────────────┐           ┌─────────────┐
    │  GUICHET 1  │           │  GUICHET 2  │
    ├─────────────┤           ├─────────────┤
    │ nom_guichet │           │ nom_guichet │
    │ code: G001  │           │ code: G002  │
    │ status: 1   │           │ status: 1   │
    │ vendeur...  │           │ vendeur...  │
    └────┬────────┘           └────┬────────┘
         │                         │
    ┌────┴────┬───────┐       ┌────┴────┐
    │          │       │       │         │
    ▼          ▼       ▼       ▼         ▼
┌────────┐ ┌────┐ ┌────┐ ┌────────┐ ┌────┐
│Vendeur │ │V2  │ │V3  │ │Vendeur │ │V5  │
│ Jean   │ │... │ │... │ │ Pierre │ │... │
└────────┘ └────┘ └────┘ └────────┘ └────┘
   ↑         ↑      ↑        ↑         ↑
   └─────────┴──────┴────────┴─────────┘
         AFFECTATIONS (historique)
             ↓
      ┌──────────────────┐
      │     ACTIVITY     │
      │                  │
      │ utilisateur: ... │
      │ action: ...      │
      │ description: ... │
      │ createdAt: ...   │
      └──────────────────┘
```

---

## 🔌 Endpoints Détaillés par Ressource

### 📦 GUICHETS
```
POST   /guichets                        → Créer
GET    /guichets/:magasinId            → Lister (par magasin)
GET    /guichets/detail/:guichetId     → Détail
PUT    /guichets/:id                   → Modifier
DELETE /guichets/:id                   → Supprimer
POST   /guichets/:guichetId/affecter-vendeur  → Affecter vendeur
```

### 👥 AFFECTATIONS
```
GET    /affectations/list              → Lister (filtrable)
POST   /affectations/:id               → Modifier
DELETE /affectations/:id               → Supprimer
```

### 📜 ACTIVITÉS
```
GET    /activites                      → Historique global (filtrable)
GET    /activites/entite/:entityId     → Historique entité
```

### 📋 SUPPORT
```
GET    /utilisateurs                   → Lister tous (pour dropdowns)
```

---

## 🔄 Flux de Données Principaux

### Flux 1: Création Guichet
```
┌──────────────────────┐
│   POST /guichets     │
├──────────────────────┤
│ {                    │
│   magasinId: X,      │
│   nomGuichet: "...", │
│   vendeurId?: Y      │
│ }                    │
└──────────┬───────────┘
           │
           ▼
    ┌─────────────┐
    │ Validation: │
    │ - Magasin?  │
    │ - Vendeur?  │
    └──────┬──────┘
           │
           ▼
    ┌─────────────────┐
    │ Créer Guichet   │
    │ + Affectation   │
    │ (si vendeur)    │
    └──────┬──────────┘
           │
           ▼
    ┌──────────────────┐
    │ Enregistrer      │
    │ Activity (✅ +   │
    │ description)     │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Return: 200 +    │
    │ guichet complet  │
    └──────────────────┘
```

### Flux 2: Affectation Vendeur
```
┌──────────────────────────────────────┐
│ POST /guichets/:id/affecter-vendeur  │
├──────────────────────────────────────┤
│ { vendeurId: "..." }                 │
└──────────────┬───────────────────────┘
               │
               ▼
        ┌─────────────┐
        │ Validation: │
        │ - Vendeur?  │
        │ - Pas déjà  │
        │   affecté   │
        └──────┬──────┘
               │
               ▼
    ┌──────────────────────────┐
    │ Clôturer anciennes       │
    │ affectations (statut=    │
    │ inactive + dateFinAff)   │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ Créer nouvelle           │
    │ affectation (statut=     │
    │ active)                  │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ Mettre à jour Utilisateur│
    │ (guichetId, magasinId)   │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ Enregistrer Activity     │
    │ (AFFECTER_VENDEUR)       │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Return: 200 +        │
    │ affectation          │
    └──────────────────────┘
```

---

## 🔐 Matrice de Contrôle d'Accès

```
┌─────────────┬───────┬──────────┬──────────────┬──────────┐
│  Endpoint   │ Admin │ Super.   │ Gestion.     │ Vendeur  │
├─────────────┼───────┼──────────┼──────────────┼──────────┤
│ POST /gui.  │  ✅   │   ✅     │     ❌       │    ❌    │
│ GET /gui.   │  ✅   │   ✅     │     ✅       │    ✅    │
│ PUT /gui.   │  ✅   │   ✅     │  ✅ (sien)   │    ❌    │
│ DEL /gui.   │  ✅   │   ✅     │     ❌       │    ❌    │
│ POST aff.   │  ✅   │   ✅     │  ✅ (sien)   │    ❌    │
│ GET aff.    │  ✅   │   ✅     │     ✅       │    ✅    │
│ PUT aff.    │  ✅   │   ✅     │     ✅       │    ❌    │
│ DEL aff.    │  ✅   │   ✅     │     ❌       │    ❌    │
│ GET activ.  │  ✅   │   ✅     │     ✅       │    ✅    │
└─────────────┴───────┴──────────┴──────────────┴──────────┘

Légende:
✅ = Accès complet
✅ (sien) = Accès à ses ressources seulement
❌ = Accès refusé
```

---

## 📊 Historique d'Actions Enregistrées

```
┌───────────────────────────┬─────────────────────────────┐
│        Action             │      Enregistrée Quand      │
├───────────────────────────┼─────────────────────────────┤
│ CREER_GUICHET             │ POST /guichets (succès)     │
│ MODIFIER_GUICHET          │ PUT /guichets/:id (succès)  │
│ SUPPRIMER_GUICHET         │ DEL /guichets/:id (succès)  │
│ AFFECTER_VENDEUR          │ POST /affecter-vendeur      │
│ MODIFIER_AFFECTATION      │ PUT /affectations/:id       │
│ SUPPRIMER_AFFECTATION     │ DEL /affectations/:id       │
│ MODIFIER_MAGASIN          │ PUT /magasins/:id (succès)  │
└───────────────────────────┴─────────────────────────────┘

Chaque Activity contient:
  • utilisateurId: Qui a fait l'action
  • action: Type d'action
  • entite: Magasin, Guichet, Affectation, etc
  • entiteId: ID de l'objet modifié
  • description: Détail lisible
  • icon: Pour UI (fa-icon)
  • createdAt: Timestamp précis
```

---

## 🗄️ Structure des Collections MongoDB

### Guichet
```javascript
{
  _id: ObjectId,
  magasinId: ObjectId,          // ← Référence magasin
  nom_guichet: String,
  code: String,
  status: Number,               // 1 = actif, 0 = inactif
  vendeurPrincipal: ObjectId,   // ← Vendeur principal
  objectifJournalier: Number,
  stockMax: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Affectation
```javascript
{
  _id: ObjectId,
  vendeurId: ObjectId,            // ← Référence vendeur
  guichetId: ObjectId,            // ← Référence guichet
  magasinId: ObjectId,            // ← Denormalisé pour rapidité
  dateAffectation: Date,          // Quand affecté
  dateFinAffectation: Date|null,  // Quand désaffecté (nullable)
  statut: String,                 // "active" ou "inactive"
  notes: String,                  // Commentaires optionnels
  createdAt: Date,
  updatedAt: Date
}
```

### Activity
```javascript
{
  _id: ObjectId,
  utilisateurId: ObjectId,    // ← Qui a fait
  action: String,             // Type d'action
  entite: String,             // Entité concernée
  entiteId: ObjectId,         // ID de l'entité
  description: String,        // Détail lisible
  icon: String,              // Icône Font Awesome
  createdAt: Date            // Timestamp
}
```

---

## 🔄 Transitions d'État

### État Guichet
```
      ┌─────────────────────┐
      │    Créé             │
      │  status: 1 (actif)  │
      └──────────┬──────────┘
                 │
        ┌────────┴─────────┐
        │                  │
        ▼                  ▼
   ┌─────────┐        ┌──────────┐
   │ Modifié │        │ Supprimé │
   │ (PUT)   │        │ (DELETE) │
   └────┬────┘        └──────────┘
        │                  △
        │                  │
        ├──────────────────┘
        │ (si status=0)
        │
        ▼
   ┌──────────┐
   │ Inactif  │
   │status: 0 │
   └──────────┘
```

### État Affectation
```
        ┌─────────────────┐
        │  Créée          │
        │ statut: active  │
        └────────┬────────┘
                 │
       ┌─────────┴──────────┐
       │                    │
       ▼                    ▼
  ┌─────────┐          ┌──────────┐
  │ Modifié │          │Fermée    │
  │ (PUT)   │          │(statut=  │
  └────┬────┘          │inactive) │
       │                └────┬─────┘
       └────────┬────────────┘
                │
                ▼
        ┌─────────────────┐
        │ Supprimée       │
        │ (DELETE)        │
        └─────────────────┘
```

---

## 🎯 Cas d'Usage Courants

### Use Case 1: Embauche Vendeur
```
Admin crée Utilisateur (vendeur)
        ↓
Gestionnaire affecte au Guichet
        ↓
Affectation créée (active)
        ↓
Activity enregistrée: AFFECTER_VENDEUR
        ↓
Dashboard affiche vendeur au guichet
```

### Use Case 2: Transfert Vendeur
```
Gestionnaire modifie affectation
        ↓
Ancienne affectation: statut=inactive
        ↓
Nouvelle affectation: statut=active
        ↓
2 Activities enregistrées
        ↓
Historique conserve tout
```

### Use Case 3: Fermeture Guichet
```
Admin DELETE /guichets/:id
        ↓
Guichet supprimé
        ↓
Affectations supprimées (cascade)
        ↓
Vendeurs orphelins (pas de guichetId)
        ↓
Activity: SUPPRIMER_GUICHET
```

---

## ✅ Checklist d'Implémentation

### APIs Créées
- [x] POST /guichets
- [x] GET /guichets/:magasinId
- [x] GET /guichets/detail/:guichetId
- [x] PUT /guichets/:id
- [x] DELETE /guichets/:id
- [x] POST /guichets/:guichetId/affecter-vendeur
- [x] GET /affectations/list
- [x] PUT /affectations/:id
- [x] DELETE /affectations/:id
- [x] GET /activites
- [x] GET /activites/entite/:entityId
- [x] GET /utilisateurs

### Sécurité
- [x] JWT authentification
- [x] Vérification rôles
- [x] Gestionnaire limité
- [x] Validations métier

### Historique
- [x] Activity model
- [x] Enregistrement automatique
- [x] Filtres activités
- [x] Timestamps

### Frontend
- [x] loadGuichetsForMagasin()
- [x] createGuichet()
- [x] updateGuichet()
- [x] deleteGuichet()
- [x] affectVendeurToGuichet()
- [x] loadAffectations()
- [x] loadActivities()

---

## 📈 Statistiques Possibles

Avec la structure en place, on peut générer:

```
Performance par Guichet:
  • Objectif vs Réalisé
  • Vendeur moyen par guichet
  • Rotation des vendeurs

Performance par Vendeur:
  • Affectations actives/passées
  • Durée moyenne par guichet
  • Progression

Audits:
  • Qui a modifié quoi
  • Quand chaque action
  • Historique complet par entité
```

---

**Créé le:** 2024-12-12  
**Version:** 1.0  
**Status:** ✅ COMPLET & DOCUMENTÉ  
**Prêt pour:** Environnement de production  
**Hiérarchie:** ✅ RESPECTÉE (Entreprise → Magasin → Guichet → Vendeur)  
**Traçabilité:** ✅ COMPLÈTE (Chaque action enregistrée)
