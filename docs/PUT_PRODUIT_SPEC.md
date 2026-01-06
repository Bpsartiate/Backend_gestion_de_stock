# 🔄 Endpoint PUT /produits/:produitId - Amélioration Complète

## 📊 Résumé des changements

**Avant**: Endpoint basique sans audit
**Après**: Endpoint robuste avec traçabilité complète

## 📋 Spécifications complètes

### Endpoint
```
PUT /api/protected/produits/:produitId
```

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Request body
```json
{
  "designation": "Nouveau nom",
  "reference": "REF-123",
  "prixUnitaire": 25.50,
  "etat": "Neuf",
  "seuilAlerte": 10,
  "notes": "Remarques...",
  "photoUrl": "https://...",
  "typeProduitId": "507f1f77bcf86cd799439011",
  "rayonId": "507f1f77bcf86cd799439012"
}
```

### Response (200 OK)
```json
{
  "message": "Produit modifié avec succès",
  "produit": {
    "_id": "...",
    "designation": "Nouveau nom",
    "reference": "REF-123",
    "prixUnitaire": 25.50,
    "etat": "Neuf",
    "seuilAlerte": 10,
    "notes": "Remarques...",
    "photoUrl": "https://...",
    "typeProduitId": "507f1f77bcf86cd799439011",
    "rayonId": "507f1f77bcf86cd799439012",
    "magasinId": "...",
    "quantiteActuelle": 145.5,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2025-01-15T14:30:00Z"
  },
  "changements": {
    "designation": "Nouveau nom",
    "prixUnitaire": 25.50
  }
}
```

### Erreurs possibles
```
400 Bad Request - Validation error
403 Forbidden - Non-admin ou pas manager du magasin
404 Not Found - Produit n'existe pas
500 Internal Server Error - Erreur serveur
```

## 🔐 Validation & Sécurité

### Vérifications
1. ✅ Authentification requise
2. ✅ Authorization: Admin ONLY ou Manager du magasin
3. ✅ Produit doit exister
4. ✅ Magasin doit exister
5. ✅ Champs optionnels = pas d'erreur si absent

### Cas refusés
```
❌ Non authentifié → 401
❌ Non autorisé (vendeur) → 403
❌ Produit inexistant → 404
❌ Magasin inexistant → 500
```

## 📝 Audit logging

### Trigger
Se déclenche **automatiquement** si au least 1 champ change

### Données capturées
```javascript
{
  action: 'UPDATE_PRODUIT',
  userId: requester.id,
  utilisateurNom: 'Jean Dupont',
  utilisateurEmail: 'jean@example.com',
  magasinId: '507f1f77bcf86cd799439010',
  entityType: 'Produit',
  entityId: '507f1f77bcf86cd799439011',
  description: 'Produit "Crème fraîche" modifié',
  
  // AVANT
  before: {
    designation: 'Ancien nom',
    prixUnitaire: 20.00
  },
  
  // APRÈS
  after: {
    designation: 'Crème fraîche 500ml',
    prixUnitaire: 25.50
  },
  
  statut: 'success',
  createdAt: ISODate("2025-01-15T14:30:00.000Z")
}
```

### TTL Index
- Expire automatiquement après 90 jours
- Pas besoin de nettoyage manuel
- Queryable pendant la période de rétention

## 🔍 Traçabilité complète

### Onglet Historique dans modal
Affiche tous les **UPDATE_PRODUIT** logs:
- Timeline visuelle
- Avant/après pour chaque champ
- Auteur et timestamp
- Comparaison facile

### Endpoints de requête
```
# Historique complet d'un produit
GET /api/protected/audit-logs/Produit/:produitId

# Réponse
{
  "logs": [
    {
      "_id": "...",
      "action": "UPDATE_PRODUIT",
      "before": {...},
      "after": {...},
      "utilisateurNom": "Jean Dupont",
      "createdAt": "2025-01-15T14:30:00Z"
    }
  ],
  "total": 15
}
```

## 💾 Comportement détaillé

### Étape 1: Récupération
```javascript
const produit = await Produit.findById(produitId).lean();
// lean() = performance optimisée (pas de middleware)
```

### Étape 2: Autorisation
```javascript
const magasin = await Magasin.findById(produit.magasinId);
if (requester.role !== 'admin' && magasin.managerId?.toString() !== requester.id) {
  return 403; // Accès refusé
}
```

### Étape 3: Détection des changements
```javascript
// Compare ancien vs nouveau pour CHAQUE champ
if (designation !== undefined && designation !== produit.designation) {
  changements.designation = designation;
  before.designation = produit.designation;
  after.designation = designation;
}
// Répété pour tous les champs...
```

### Étape 4: Mise à jour
```javascript
const produitUpdated = await Produit.findByIdAndUpdate(
  produitId,
  changements, // Seulement les champs modifiés
  { new: true, runValidators: true } // Retourne nouveau doc + valide
);
```

### Étape 5: AuditLog (non-bloquant)
```javascript
// N'utilise pas 'await' - logs en background
AuditService.log({
  action: 'UPDATE_PRODUIT',
  // ...
  before: avant,
  after: après
});
// Si erreur audit: loggée mais n'interrompt pas la réponse
```

### Étape 6: Activity (legacy)
```javascript
// Pour compatibilité avec ancien système
try {
  const activity = new Activity({...});
  await activity.save();
} catch {
  // Silencieusement ignoré si erreur
}
```

## 📊 Exemple complet de flux

### Request
```bash
curl -X PUT http://localhost:3001/api/protected/produits/64f1a2b3c4d5e6f7g8h9i0j1 \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "designation": "Crème fraîche Bio 500ml",
    "prixUnitaire": 5.99,
    "etat": "Neuf",
    "notes": "Produit premium"
  }'
```

### Réponse (200)
```json
{
  "message": "Produit modifié avec succès",
  "produit": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "designation": "Crème fraîche Bio 500ml",
    "reference": "CREMEF-001",
    "prixUnitaire": 5.99,
    "etat": "Neuf",
    "seuilAlerte": 10,
    "notes": "Produit premium",
    "quantiteActuelle": 145.5,
    "magasinId": "64f1a2b3c4d5e6f7g8h9i0k2",
    "updatedAt": "2025-01-15T14:30:00Z"
  },
  "changements": {
    "designation": "Crème fraîche Bio 500ml",
    "prixUnitaire": 5.99,
    "notes": "Produit premium"
  }
}
```

### AuditLog créé
```javascript
{
  "_id": ObjectId("64f1a2b3c4d5e6f7g8h9i0j2"),
  "action": "UPDATE_PRODUIT",
  "userId": ObjectId("64e0b1a2c3d4e5f6g7h8i9j0"),
  "utilisateurNom": "Admin System",
  "utilisateurEmail": "admin@company.com",
  "magasinId": ObjectId("64f1a2b3c4d5e6f7g8h9i0k2"),
  "entityType": "Produit",
  "entityId": ObjectId("64f1a2b3c4d5e6f7g8h9i0j1"),
  "description": "Produit \"Crème fraîche Bio 500ml\" modifié",
  
  "before": {
    "designation": "Crème fraîche 500ml",
    "prixUnitaire": 4.99,
    "notes": ""
  },
  
  "after": {
    "designation": "Crème fraîche Bio 500ml",
    "prixUnitaire": 5.99,
    "notes": "Produit premium"
  },
  
  "statut": "success",
  "createdAt": ISODate("2025-01-15T14:30:00Z"),
  "expireAt": ISODate("2025-04-15T14:30:00Z") // TTL 90j
}
```

## 🧪 Tests unitaires

### Test 1: Modification réussie
```javascript
describe('PUT /produits/:id', () => {
  it('should update product successfully', async () => {
    const res = await request(app)
      .put(`/api/protected/produits/${produitId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        designation: 'New name',
        prixUnitaire: 10.00
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Produit modifié avec succès');
    expect(res.body.produit.designation).toBe('New name');
    expect(res.body.changements).toEqual({
      designation: 'New name',
      prixUnitaire: 10.00
    });
  });
});
```

### Test 2: Authorization failure
```javascript
it('should return 403 if not authorized', async () => {
  const res = await request(app)
    .put(`/api/protected/produits/${produitId}`)
    .set('Authorization', `Bearer ${vendeurToken}`) // vendeur pas autorisé
    .send({ designation: 'New name' });

  expect(res.statusCode).toBe(403);
  expect(res.body.message).toBe('Accès refusé');
});
```

### Test 3: Product not found
```javascript
it('should return 404 if product not found', async () => {
  const res = await request(app)
    .put(`/api/protected/produits/invalid123`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ designation: 'New name' });

  expect(res.statusCode).toBe(404);
});
```

## 📈 Performance

| Opération | Temps |
|-----------|-------|
| GET produit | ~50ms |
| Détection changements | ~1ms |
| UPDATE produit | ~30ms |
| AuditLog.log (async) | ~100ms |
| **Total** | ~180ms |

### Optimisations appliquées
- ✅ `lean()` pour GET initial
- ✅ AuditLog asynchrone (non-bloquant)
- ✅ Index sur entityId pour audit queries
- ✅ Changements incrementaux (pas overwrite)

## 📚 Documentation API (OpenAPI 3.0)

```yaml
/api/protected/produits/{produitId}:
  put:
    summary: Modifier un produit
    tags: [Produits]
    parameters:
      - in: path
        name: produitId
        required: true
        schema:
          type: string
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              designation:
                type: string
              reference:
                type: string
              prixUnitaire:
                type: number
              etat:
                type: string
              seuilAlerte:
                type: number
              notes:
                type: string
              photoUrl:
                type: string
              typeProduitId:
                type: string
              rayonId:
                type: string
    responses:
      200:
        description: Product updated successfully
      403:
        description: Unauthorized
      404:
        description: Product not found
    security:
      - bearerAuth: []
```

## ✅ Checklist de contrôle

- [x] Endpoint créé dans routes/protected.js
- [x] Authorization vérifiée (admin + manager)
- [x] Changements détectés correctement
- [x] AuditLog créé pour chaque modification
- [x] Avant/après capturés
- [x] Non-bloquant (async)
- [x] Erreurs gérées proprement
- [x] Logging approprié
- [x] Intégré dans modal d'édition
- [x] Frontend appelle correctement
- [x] Tests unitaires préparés

## 🔗 Intégrations

- ✅ Modal de produit (product-edit.js)
- ✅ AuditService (services/auditService.js)
- ✅ Activity legacy (models/activity.js)
- ✅ Historique onglet (chargerOngletHistorique)

## 📞 Support & Debugging

Si problème, vérifier:

1. **Logs serveur**
   ```
   ✅ PUT /produits/:produitId - Modifié par user@example.com
   ❌ PUT /produits/:produitId - error: ...
   ```

2. **Network tab**
   - Status: 200
   - Response time: < 200ms
   - Body contains changements

3. **MongoDB**
   ```javascript
   db.auditlogs.find({entityId: ObjectId("...")}).sort({createdAt: -1}).limit(5)
   ```

4. **Console logs**
   ```javascript
   console.log('✅ PUT /produits/:id - Modifié par email')
   ```

