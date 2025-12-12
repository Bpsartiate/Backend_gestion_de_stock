# 📚 API Complète - Guichets & Affectations

## 📊 Architecture Hiérarchique

```
Entreprise (Business)
├── Magasin
│   └── Guichet
│       └── Vendeur (Affectation)
```

**Logique:**
- Chaque entreprise a plusieurs magasins
- Chaque magasin a plusieurs guichets
- Chaque guichet a un vendeur principal et peut avoir plusieurs vendeurs
- Les vendeurs sont affectés via des affectations avec historique
- Chaque action est enregistrée dans Activity

---

## 🛠️ ENDPOINTS GUICHETS

### 1. **POST /api/protected/guichets** - Créer un guichet
**Authentification:** Requise  
**Droits:** Admin, Superviseur  

**Corps de la requête:**
```json
{
  "magasinId": "id_magasin",
  "nomGuichet": "Guichet 1",
  "codeGuichet": "G001",
  "status": 1,
  "vendeurPrincipal": "id_vendeur_optionnel",
  "objectifJournalier": 50000,
  "stockMax": 500
}
```

**Réponse (200):**
```json
{
  "message": "Guichet créé",
  "guichet": {
    "_id": "id_guichet",
    "magasinId": "id_magasin",
    "nom_guichet": "Guichet 1",
    "code": "G001",
    "status": 1,
    "vendeurPrincipal": "id_vendeur",
    "objectifJournalier": 50000,
    "stockMax": 500,
    "createdAt": "2024-..."
  }
}
```

**Actions enregistrées:**
- ✅ Création du guichet
- ✅ Affectation du vendeur principal (si fourni)
- ✅ Enregistrement dans Activity

---

### 2. **GET /api/protected/guichets/:magasinId** - Lister guichets d'un magasin
**Authentification:** Requise  
**Droits:** Tous (lecture)

**Réponse (200):**
```json
[
  {
    "_id": "id_guichet",
    "magasinId": "id_magasin",
    "nom_guichet": "Guichet 1",
    "code": "G001",
    "status": 1,
    "vendeurPrincipal": {
      "_id": "id_vendeur",
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean@example.com",
      "role": "vendeur"
    },
    "objectifJournalier": 50000,
    "stockMax": 500
  },
  ...
]
```

---

### 3. **GET /api/protected/guichets/detail/:guichetId** - Détail d'un guichet
**Authentification:** Requise  
**Droits:** Tous (lecture)

**Réponse (200):**
```json
{
  "_id": "id_guichet",
  "magasinId": { "nom_magasin": "Magasin Central", ... },
  "nom_guichet": "Guichet 1",
  "code": "G001",
  "status": 1,
  "vendeurPrincipal": { ... },
  "objectifJournalier": 50000,
  "stockMax": 500,
  "vendeurs": [
    {
      "_id": "id_vendeur1",
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean@example.com",
      "role": "vendeur"
    },
    ...
  ]
}
```

---

### 4. **PUT /api/protected/guichets/:id** - Modifier un guichet
**Authentification:** Requise  
**Droits:** Admin, Superviseur, Gestionnaire (ses magasins)

**Corps de la requête:**
```json
{
  "nom_guichet": "Guichet 1 (Rénovié)",
  "code": "G001-NEW",
  "status": 1,
  "vendeurPrincipal": "id_nouveau_vendeur",
  "objectifJournalier": 60000,
  "stockMax": 600
}
```

**Validations:**
- ✅ Gestionnaire ne peut modifier que ses magasins
- ✅ Vendeur doit exister et avoir le rôle "vendeur"
- ✅ Ancienne affectation supprimée, nouvelle créée

**Actions enregistrées:**
- ✅ Modification du guichet
- ✅ Changement de vendeur principal (si applicable)
- ✅ Enregistrement dans Activity

---

### 5. **DELETE /api/protected/guichets/:id** - Supprimer un guichet
**Authentification:** Requise  
**Droits:** Admin, Superviseur

**Réponse (200):**
```json
{
  "message": "Guichet supprimé"
}
```

**Actions:**
- ✅ Suppression du guichet
- ✅ Suppression des affectations associées
- ✅ Enregistrement dans Activity

---

### 6. **POST /api/protected/guichets/:guichetId/affecter-vendeur** - Affecter un vendeur
**Authentification:** Requise  
**Droits:** Admin, Superviseur, Gestionnaire (ses magasins)

**Corps de la requête:**
```json
{
  "vendeurId": "id_vendeur"
}
```

**Validations:**
- ✅ Vendeur doit exister et avoir le rôle "vendeur"
- ✅ Vendeur ne peut être affecté deux fois au même guichet
- ✅ Anciennes affectations du vendeur marquées comme inactives
- ✅ Gestionnaire ne peut affecter que ses vendeurs

**Réponse (200):**
```json
{
  "message": "Vendeur affecté",
  "affectation": {
    "_id": "id_affectation",
    "vendeurId": "id_vendeur",
    "guichetId": "id_guichet",
    "magasinId": "id_magasin",
    "dateAffectation": "2024-...",
    "statut": "active"
  }
}
```

**Actions enregistrées:**
- ✅ Affectation du vendeur
- ✅ Mise à jour du statut des anciennes affectations
- ✅ Enregistrement dans Activity (AFFECTER_VENDEUR)

---

## 👥 ENDPOINTS AFFECTATIONS

### 7. **GET /api/protected/affectations/list** - Lister les affectations
**Authentification:** Requise  
**Droits:** Tous (lecture)

**Paramètres Query:**
```
?vendeurId=id_vendeur
&guichetId=id_guichet
&magasinId=id_magasin
&statut=active|inactive
&limit=100
&skip=0
```

**Réponse (200):**
```json
{
  "data": [
    {
      "_id": "id_affectation",
      "vendeurId": {
        "_id": "id_vendeur",
        "nom": "Dupont",
        "prenom": "Jean",
        "email": "jean@example.com",
        "role": "vendeur"
      },
      "guichetId": {
        "_id": "id_guichet",
        "nom_guichet": "Guichet 1",
        "code": "G001"
      },
      "magasinId": {
        "_id": "id_magasin",
        "nom_magasin": "Magasin Central"
      },
      "dateAffectation": "2024-...",
      "dateFinAffectation": null,
      "statut": "active",
      "notes": "Affecté depuis le 15/12/2024"
    },
    ...
  ],
  "total": 50,
  "limit": 100,
  "skip": 0
}
```

---

### 8. **PUT /api/protected/affectations/:id** - Modifier une affectation
**Authentification:** Requise  
**Droits:** Admin, Superviseur, Gestionnaire

**Corps de la requête:**
```json
{
  "statut": "inactive",
  "notes": "Vendeur transféré"
}
```

**Actions:**
- ✅ Mise à jour du statut
- ✅ Ajout automatique de dateFinAffectation si statut = "inactive"
- ✅ Enregistrement dans Activity

---

### 9. **DELETE /api/protected/affectations/:id** - Supprimer une affectation
**Authentification:** Requise  
**Droits:** Admin, Superviseur

**Réponse (200):**
```json
{
  "message": "Affectation supprimée"
}
```

**Actions enregistrées:**
- ✅ Suppression de l'affectation
- ✅ Enregistrement dans Activity (SUPPRIMER_AFFECTATION)

---

## 📜 ENDPOINTS HISTORIQUE (ACTIVITÉS)

### 10. **GET /api/protected/activites** - Lister l'historique global
**Authentification:** Requise  
**Droits:** Tous (lecture)

**Paramètres Query:**
```
?action=MODIFIER_GUICHET|AFFECTER_VENDEUR|etc
&entityType=Guichet|Affectation|Magasin
&entityId=id_entite
&limit=100
&skip=0
```

**Réponse (200):**
```json
{
  "data": [
    {
      "_id": "id_activity",
      "utilisateurId": {
        "_id": "id_user",
        "nom": "Admin",
        "prenom": "John",
        "email": "admin@example.com",
        "role": "admin"
      },
      "action": "AFFECTER_VENDEUR",
      "entite": "Affectation",
      "entiteId": "id_affectation",
      "description": "Vendeur 'Jean Dupont' affecté au guichet 'Guichet 1'",
      "icon": "fas fa-user-check",
      "createdAt": "2024-12-12T15:30:00Z"
    },
    ...
  ],
  "total": 500,
  "limit": 100,
  "skip": 0
}
```

**Actions enregistrées pour:**
- AFFECTER_VENDEUR
- MODIFIER_AFFECTATION
- SUPPRIMER_AFFECTATION
- MODIFIER_GUICHET
- SUPPRIMER_GUICHET
- CRÉER_GUICHET
- MODIFIER_MAGASIN
- Et plus...

---

### 11. **GET /api/protected/activites/entite/:entityId** - Historique d'une entité
**Authentification:** Requise  
**Droits:** Tous (lecture)

**Réponse (200):**
```json
[
  {
    "_id": "id_activity",
    "utilisateurId": { ... },
    "action": "AFFECTER_VENDEUR",
    "entite": "Affectation",
    "entiteId": "id_affectation",
    "description": "Vendeur affecté",
    "createdAt": "2024-12-12T15:30:00Z"
  },
  ...
]
```

---

## 🔐 CONTRÔLE D'ACCÈS

### Par Rôle:

| Endpoint | Admin | Superviseur | Gestionnaire | Vendeur |
|----------|-------|------------|--------------|---------|
| POST guichet | ✅ | ✅ | ❌ | ❌ |
| GET guichets | ✅ | ✅ | ✅ | ✅ |
| PUT guichet | ✅ | ✅ | ✅* | ❌ |
| DELETE guichet | ✅ | ✅ | ❌ | ❌ |
| POST affecter | ✅ | ✅ | ✅* | ❌ |
| GET affectations | ✅ | ✅ | ✅ | ✅ |
| PUT affectation | ✅ | ✅ | ✅ | ❌ |
| DELETE affectation | ✅ | ✅ | ❌ | ❌ |
| GET activités | ✅ | ✅ | ✅ | ✅ |

**\* = Gestionnaire ne peut agir que sur ses magasins**

---

## 📋 MODÈLES DE DONNÉES

### Guichet
```javascript
{
  _id: ObjectId,
  magasinId: ObjectId (ref: Magasin),
  nom_guichet: String,
  code: String,
  status: Number (1=actif, 0=inactif),
  vendeurPrincipal: ObjectId (ref: Utilisateur),
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
  vendeurId: ObjectId (ref: Utilisateur),
  guichetId: ObjectId (ref: Guichet),
  magasinId: ObjectId (ref: Magasin),
  dateAffectation: Date,
  dateFinAffectation: Date,
  statut: String (active/inactive),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Activity
```javascript
{
  _id: ObjectId,
  utilisateurId: ObjectId (ref: Utilisateur),
  action: String (AFFECTER_VENDEUR, MODIFIER_GUICHET, etc),
  entite: String (Guichet, Affectation, Magasin, etc),
  entiteId: ObjectId,
  description: String,
  icon: String,
  createdAt: Date
}
```

---

## 🧪 Exemple de Flux Complet

### 1️⃣ Créer un guichet
```bash
POST /api/protected/guichets
Body: {
  "magasinId": "5f5a1b2c3d4e5f6g7h8i",
  "nomGuichet": "Guichet Central",
  "codeGuichet": "G001"
}
```

### 2️⃣ Lister les guichets
```bash
GET /api/protected/guichets/5f5a1b2c3d4e5f6g7h8i
```

### 3️⃣ Affecter un vendeur
```bash
POST /api/protected/guichets/6f6b2c3d4e5f6g7h8i9j/affecter-vendeur
Body: {
  "vendeurId": "7g7c3d4e5f6g7h8i9j0k"
}
```

### 4️⃣ Consulter l'historique
```bash
GET /api/protected/activites/entite/6f6b2c3d4e5f6g7h8i9j
```

---

## ✅ Validations & Règles de Métier

### Guichets:
- ✅ Un guichet doit appartenir à un magasin existant
- ✅ Le code du guichet est optionnel mais unique si fourni
- ✅ Un vendeur ne peut être vendeur principal que d'un seul guichet à la fois
- ✅ Un guichet peut avoir plusieurs vendeurs via affectations

### Affectations:
- ✅ Un vendeur ne peut être affecté deux fois au même guichet
- ✅ Quand un vendeur est affecté à un nouveau guichet, son ancienne affectation est fermée
- ✅ Chaque affectation a une dateAffectation et optionnellement une dateFinAffectation
- ✅ Statut peut être "active" ou "inactive"

### Activités:
- ✅ Chaque action est enregistrée avec timestamp
- ✅ L'utilisateur qui a effectué l'action est enregistré
- ✅ Description détaillée incluse
- ✅ Icon pour représentation visuelle

---

## 🔧 Troubleshooting

### Erreur: "Accès refusé"
**Cause:** Utilisateur n'a pas les droits nécessaires  
**Solution:** Vérifier le rôle et les permissions de l'utilisateur

### Erreur: "Magasin non trouvé"
**Cause:** L'ID du magasin n'existe pas  
**Solution:** Vérifier l'ID avec `GET /api/protected/magasins`

### Erreur: "Vendeur déjà affecté à ce guichet"
**Cause:** Tentative d'affecter deux fois le même vendeur  
**Solution:** Utiliser `PUT /affectations/:id` pour modifier ou créer une nouvelle affectation

---

## 📊 Statistiques Utiles

### Pour obtenir les performances:
```bash
GET /api/protected/activites?action=AFFECTER_VENDEUR&limit=50
```

### Pour obtenir l'historique d'un vendeur:
```bash
GET /api/protected/affectations/list?vendeurId=ID
```

### Pour obtenir l'historique d'un guichet:
```bash
GET /api/protected/activites/entite/ID
```

---

**Documenté le:** 2024-12-12  
**Version API:** 1.0  
**Dernière mise à jour:** Implémentation complète avec hiérarchie d'entreprise ✅
