# 🧪 GUIDE COMPLET DE TEST - APIs Guichets & Affectations

## 📋 Table des Matières
1. [Préparation](#préparation)
2. [Tests Guichets](#tests-guichets)
3. [Tests Affectations](#tests-affectations)
4. [Tests Historique](#tests-historique)
5. [Scénarios Complets](#scénarios-complets)

---

## 🔧 Préparation

### Variables d'Environnement
```bash
API_BASE=https://backend-gestion-de-stock.onrender.com
TOKEN=<votre_jwt_token>
MAGASIN_ID=<id_d_un_magasin>
VENDEUR_ID=<id_d_un_vendeur>
ADMIN_ID=<id_d_un_admin>
```

### Headers Standards
```
Authorization: Bearer {TOKEN}
Content-Type: application/json
Accept: application/json
```

---

## ✅ TESTS GUICHETS

### Test 1.1: Créer un Guichet
**Endpoint:** `POST /api/protected/guichets`

```bash
curl -X POST https://backend-gestion-de-stock.onrender.com/api/protected/guichets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "magasinId": "'$MAGASIN_ID'",
    "nomGuichet": "Guichet Principal",
    "codeGuichet": "G001",
    "status": 1,
    "objectifJournalier": 50000,
    "stockMax": 500
  }'
```

**Réponse Attendue (200):**
```json
{
  "message": "Guichet créé",
  "guichet": {
    "_id": "GUICHET_ID_RETURNED",
    "magasinId": "MAGASIN_ID",
    "nom_guichet": "Guichet Principal",
    "code": "G001",
    "status": 1,
    "vendeurPrincipal": null,
    "objectifJournalier": 50000,
    "stockMax": 500
  }
}
```

**Tests de Validation:**
- ❌ Sans magasinId → Erreur 400
- ❌ magasinId inexistant → Erreur 404
- ❌ Non authentifié → Erreur 401
- ❌ Vendeur non-vendeur → Erreur 404
- ✅ Avec vendeurPrincipal valide → Créé + affectation automatique

---

### Test 1.2: Lister Guichets d'un Magasin
**Endpoint:** `GET /api/protected/guichets/:magasinId`

```bash
curl -X GET https://backend-gestion-de-stock.onrender.com/api/protected/guichets/$MAGASIN_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse Attendue (200):**
```json
[
  {
    "_id": "GUICHET_ID",
    "magasinId": "MAGASIN_ID",
    "nom_guichet": "Guichet Principal",
    "code": "G001",
    "status": 1,
    "vendeurPrincipal": {
      "_id": "VENDEUR_ID",
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean@example.com",
      "role": "vendeur"
    },
    "objectifJournalier": 50000,
    "stockMax": 500
  }
]
```

**Tests:**
- ✅ Magasin avec guichets → Liste retournée
- ✅ Magasin sans guichets → Array vide []
- ❌ Magasin inexistant → Erreur 404

---

### Test 1.3: Détail d'un Guichet
**Endpoint:** `GET /api/protected/guichets/detail/:guichetId`

```bash
curl -X GET https://backend-gestion-de-stock.onrender.com/api/protected/guichets/detail/$GUICHET_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse Attendue (200):**
```json
{
  "_id": "GUICHET_ID",
  "magasinId": { ... },
  "nom_guichet": "Guichet Principal",
  "vendeurPrincipal": { ... },
  "vendeurs": [
    {
      "_id": "VENDEUR1_ID",
      "nom": "Dupont",
      "prenom": "Jean"
    },
    {
      "_id": "VENDEUR2_ID",
      "nom": "Martin",
      "prenom": "Pierre"
    }
  ]
}
```

---

### Test 1.4: Modifier un Guichet
**Endpoint:** `PUT /api/protected/guichets/:id`

```bash
curl -X PUT https://backend-gestion-de-stock.onrender.com/api/protected/guichets/$GUICHET_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom_guichet": "Guichet Principal (Rénovié)",
    "objectifJournalier": 60000,
    "stockMax": 600
  }'
```

**Tests:**
- ✅ Modification champs simples → OK
- ✅ Changement vendeur principal → Affectation mise à jour
- ❌ Vendeur invalide → Erreur 404
- ❌ Non propriétaire (gestionnaire) → Erreur 403

---

### Test 1.5: Supprimer un Guichet
**Endpoint:** `DELETE /api/protected/guichets/:id`

```bash
curl -X DELETE https://backend-gestion-de-stock.onrender.com/api/protected/guichets/$GUICHET_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse Attendue (200):**
```json
{
  "message": "Guichet supprimé"
}
```

**Vérifications Après:**
- ❌ GET /guichets/:id → 404 (supprimé)
- ❌ Affectations du guichet → Supprimées aussi
- ✅ Activity enregistrée avec type SUPPRIMER_GUICHET

---

## 👥 TESTS AFFECTATIONS

### Test 2.1: Affecter un Vendeur
**Endpoint:** `POST /api/protected/guichets/:guichetId/affecter-vendeur`

```bash
curl -X POST https://backend-gestion-de-stock.onrender.com/api/protected/guichets/$GUICHET_ID/affecter-vendeur \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vendeurId": "'$VENDEUR_ID'"
  }'
```

**Réponse Attendue (200):**
```json
{
  "message": "Vendeur affecté",
  "affectation": {
    "_id": "AFFECTATION_ID",
    "vendeurId": "VENDEUR_ID",
    "guichetId": "GUICHET_ID",
    "magasinId": "MAGASIN_ID",
    "dateAffectation": "2024-12-12T15:30:00Z",
    "statut": "active"
  }
}
```

**Tests d'Erreur:**
- ❌ Vendeur inexistant → Erreur 404
- ❌ Rôle ≠ vendeur → Erreur 404
- ❌ Vendeur déjà affecté → Erreur 400
- ❌ Gestionnaire vendeur d'un autre magasin → Erreur 403

**Vérifications Après:**
- ✅ Antiga affectation du vendeur → statut = "inactive"
- ✅ dateFinAffectation rempli pour ancienne
- ✅ Nouvelle affectation active
- ✅ Activity enregistrée

---

### Test 2.2: Lister Affectations
**Endpoint:** `GET /api/protected/affectations/list`

```bash
# Sans filtres
curl -X GET "https://backend-gestion-de-stock.onrender.com/api/protected/affectations/list" \
  -H "Authorization: Bearer $TOKEN"

# Avec filtres
curl -X GET "https://backend-gestion-de-stock.onrender.com/api/protected/affectations/list?vendeurId=$VENDEUR_ID&statut=active&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Guichet spécifique
curl -X GET "https://backend-gestion-de-stock.onrender.com/api/protected/affectations/list?guichetId=$GUICHET_ID" \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse Attendue (200):**
```json
{
  "data": [
    {
      "_id": "AFFECTATION_ID",
      "vendeurId": {
        "_id": "VENDEUR_ID",
        "nom": "Dupont",
        "prenom": "Jean",
        "role": "vendeur"
      },
      "guichetId": {
        "_id": "GUICHET_ID",
        "nom_guichet": "Guichet Principal"
      },
      "magasinId": {
        "_id": "MAGASIN_ID",
        "nom_magasin": "Magasin Central"
      },
      "dateAffectation": "2024-12-12T15:30:00Z",
      "statut": "active"
    }
  ],
  "total": 25,
  "limit": 10,
  "skip": 0
}
```

**Tests de Filtres:**
- ✅ vendeurId → Affectations de ce vendeur
- ✅ guichetId → Affectations de ce guichet
- ✅ magasinId → Affectations du magasin
- ✅ statut=active → Seulement actives
- ✅ Pagination (limit, skip)

---

### Test 2.3: Modifier une Affectation
**Endpoint:** `PUT /api/protected/affectations/:id`

```bash
curl -X PUT https://backend-gestion-de-stock.onrender.com/api/protected/affectations/$AFFECTATION_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "statut": "inactive",
    "notes": "Vendeur transféré au magasin B"
  }'
```

**Vérifications Après:**
- ✅ statut changé à "inactive"
- ✅ dateFinAffectation rempli automatiquement
- ✅ notes ajoutées
- ✅ Activity enregistrée

---

### Test 2.4: Supprimer une Affectation
**Endpoint:** `DELETE /api/protected/affectations/:id`

```bash
curl -X DELETE https://backend-gestion-de-stock.onrender.com/api/protected/affectations/$AFFECTATION_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse Attendue (200):**
```json
{
  "message": "Affectation supprimée"
}
```

---

## 📜 TESTS HISTORIQUE

### Test 3.1: Lister Historique Global
**Endpoint:** `GET /api/protected/activites`

```bash
# Tous les événements
curl -X GET "https://backend-gestion-de-stock.onrender.com/api/protected/activites?limit=50" \
  -H "Authorization: Bearer $TOKEN"

# Filtrer par action
curl -X GET "https://backend-gestion-de-stock.onrender.com/api/protected/activites?action=AFFECTER_VENDEUR&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Filtrer par entité
curl -X GET "https://backend-gestion-de-stock.onrender.com/api/protected/activites?entityType=Guichet&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse Attendue (200):**
```json
{
  "data": [
    {
      "_id": "ACTIVITY_ID",
      "utilisateurId": {
        "_id": "USER_ID",
        "nom": "Admin",
        "prenom": "John",
        "role": "admin"
      },
      "action": "AFFECTER_VENDEUR",
      "entite": "Affectation",
      "entiteId": "AFFECTATION_ID",
      "description": "Vendeur 'Jean Dupont' affecté au guichet 'Guichet 1'",
      "icon": "fas fa-user-check",
      "createdAt": "2024-12-12T15:30:00Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "skip": 0
}
```

---

### Test 3.2: Historique d'une Entité Spécifique
**Endpoint:** `GET /api/protected/activites/entite/:entityId`

```bash
curl -X GET https://backend-gestion-de-stock.onrender.com/api/protected/activites/entite/$GUICHET_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Cas d'Usage:**
- Historique complet d'un guichet
- Historique complet d'une affectation
- Qui a modifié quoi et quand

---

## 🔄 SCÉNARIOS COMPLETS

### Scénario 1: Création → Modification → Affectation Vendeur

```bash
#!/bin/bash

echo "1️⃣ Créer un guichet"
GUICHET=$(curl -s -X POST https://backend-gestion-de-stock.onrender.com/api/protected/guichets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "magasinId": "'$MAGASIN_ID'",
    "nomGuichet": "Nouveau Guichet",
    "codeGuichet": "G999",
    "status": 1
  }' | jq '.guichet._id' -r)

echo "Guichet créé: $GUICHET"

echo ""
echo "2️⃣ Modifier le guichet"
curl -s -X PUT https://backend-gestion-de-stock.onrender.com/api/protected/guichets/$GUICHET \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom_guichet": "Nouveau Guichet (Premium)",
    "objectifJournalier": 100000
  }' | jq .

echo ""
echo "3️⃣ Affecter un vendeur"
curl -s -X POST https://backend-gestion-de-stock.onrender.com/api/protected/guichets/$GUICHET/affecter-vendeur \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vendeurId": "'$VENDEUR_ID'"
  }' | jq .

echo ""
echo "4️⃣ Consulter l'historique"
curl -s -X GET https://backend-gestion-de-stock.onrender.com/api/protected/activites/entite/$GUICHET \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

---

### Scénario 2: Transfert Vendeur

```bash
#!/bin/bash

echo "1️⃣ Lister affectations actuelles"
curl -s -X GET "https://backend-gestion-de-stock.onrender.com/api/protected/affectations/list?vendeurId=$VENDEUR_ID&statut=active" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[0]' > affectation.json

OLD_GUICHET=$(cat affectation.json | jq '.guichetId._id' -r)
OLD_AFFECTATION=$(cat affectation.json | jq '._id' -r)

echo "Vendeur actuellement au guichet: $OLD_GUICHET"
echo "Affectation ID: $OLD_AFFECTATION"

echo ""
echo "2️⃣ Affecter à nouveau guichet (ancienne fermée automatiquement)"
curl -s -X POST https://backend-gestion-de-stock.onrender.com/api/protected/guichets/$NEW_GUICHET/affecter-vendeur \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vendeurId": "'$VENDEUR_ID'"}' | jq .

echo ""
echo "3️⃣ Vérifier ancienne affectation fermée"
curl -s -X GET "https://backend-gestion-de-stock.onrender.com/api/protected/affectations/list?vendeurId=$VENDEUR_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {statut, dateFinAffectation}'
```

---

## ✓ Checklist de Validation

### Après Chaque Test:
- [ ] Statut HTTP correct (200, 400, 403, 404)
- [ ] Message d'erreur clair en cas d'erreur
- [ ] Activity enregistrée en BD
- [ ] Données cohérentes (pas de doublons)
- [ ] Pagination fonctionne (limit, skip)
- [ ] Filtres appliqués correctement
- [ ] JWT token validé
- [ ] Autorisation vérifiée

### Données Cohérentes:
- [ ] Guichet existe si trouvé
- [ ] Vendeur existe si affecté
- [ ] Affectation active = une seule par vendeur/guichet
- [ ] dateFinAffectation rempli si inactif
- [ ] Activity contient bon utilisateurId
- [ ] Magnitudes numériques correctes

### Performance:
- [ ] GET < 1s pour liste < 100
- [ ] POST/PUT < 2s avec affectations
- [ ] DELETE < 1s

---

## 🐛 Debugging

### Si une requête échoue:
```bash
# 1. Vérifier le token
echo $TOKEN
echo $TOKEN | jq -R 'split(".") | .[1] | @base64d | fromjson'

# 2. Vérifier l'ID
curl -s -X GET https://backend-gestion-de-stock.onrender.com/api/protected/guichets/detail/$GUICHET_ID \
  -H "Authorization: Bearer $TOKEN" | jq .

# 3. Vérifier les logs serveur
# Sur Render, voir les logs de l'application

# 4. Tester avec curl verbose
curl -v -X GET ... -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Rapport de Test Recommandé

Créer un fichier `test_results.json`:
```json
{
  "date": "2024-12-12",
  "tester": "nom",
  "tests": {
    "guichets": {
      "create": "✅ PASS",
      "list": "✅ PASS",
      "detail": "✅ PASS",
      "update": "✅ PASS",
      "delete": "✅ PASS"
    },
    "affectations": {
      "assign": "✅ PASS",
      "list": "✅ PASS",
      "update": "✅ PASS",
      "delete": "✅ PASS"
    },
    "activites": {
      "list": "✅ PASS",
      "entite_history": "✅ PASS"
    }
  },
  "total_tests": 11,
  "passed": 11,
  "failed": 0,
  "notes": "Toutes les APIs testées et fonctionnelles"
}
```

---

**Crée le:** 2024-12-12  
**Dernière maj:** Implémentation complète  
**Status:** ✅ PRÊT POUR PRODUCTION
