# ❓ FAQ - Logique des Rôles dans les Ventes

## 🎯 Questions Fréquentes

### Q1: Pourquoi Admin/Superviseur ont deux rôles?

**A:** C'est une pratique courante dans les systèmes hiérarchiques:

- **Admin** = ADMIN + VENDEUR
  - Raison: Admin doit pouvoir vendre si nécessaire (pas seulement gérer)
  - Exemple: Magasin fermé, seul admin présent → doit pouvoir vendre

- **Superviseur** = SUPERVISEUR + VENDEUR
  - Raison: Superviseur doit superviser ET vendre si un vendeur manque
  - Exemple: Vendeur malade, superviseur prend le relais

- **Vendeur** = VENDEUR uniquement
  - Raison: Vendeur ne doit faire que son job
  - Exemple: Vendre via son guichet assigné, rien d'autre

---

### Q2: Quelle est la différence entre utilisateurId et guichet.vendeurPrincipal?

**A:** 

| | utilisateurId | guichet.vendeurPrincipal |
|---|---|---|
| **Qui est?** | Personne qui a créé la vente | Personne assignée au guichet |
| **Source** | JWT Token (automatique) | Base de données (configuré) |
| **Peut être** | N'importe quel rôle | Normalement un VENDEUR |
| **Cas normal** | Même personne | Cas général (vendeur standard) |
| **Cas exceptionnel** | Superviseur/Admin | Différent (couverte temporaire) |
| **Signification si différent** | Quelqu'un d'autre a couvert | Le vendeur normal est absent |

**Exemple visuel:**
```
Situation 1 (Normal):
┌─────────────────────────────────┐
│ Guichet 1 assigné à Robert      │
├─────────────────────────────────┤
│ Vente créée par:                │
│ utilisateurId: Robert           │
│ guichetId.vendeurPrincipal: Robert │
│ ✅ Tout OK - c'est le bon vendeur │
└─────────────────────────────────┘

Situation 2 (Exception):
┌─────────────────────────────────┐
│ Guichet 2 assigné à Jean        │
├─────────────────────────────────┤
│ Vente créée par:                │
│ utilisateurId: Alice (SUPERVISEUR) │
│ guichetId.vendeurPrincipal: Jean   │
│ ⚠️ Alice (superviseur) a couvert Jean │
│ 🔍 Visible immédiatement en analytics │
└─────────────────────────────────┘
```

---

### Q3: Qui envoie le guichetId au backend?

**A:** **Le FRONTEND** (vente.php)

```javascript
// Dans validateVente() - assets/js/vente.js ligne 912-914

const body = {
    magasinId: this.currentMagasin,    // ← Magasin sélectionné
    guichetId: this.currentGuichet,    // ← FRONTEND envoie guichetId! ✅
    articles: [...],
    modePaiement: "CASH",
    tauxFC: 2650
};

fetch('/api/protected/ventes', {
    method: 'POST',
    body: JSON.stringify(body)
});
```

**Le backend récupère:**
- `utilisateurId` du JWT (automatique via authMiddleware)
- `guichetId` du body POST (envoyé par frontend)

---

### Q4: Que se passe-t-il si le frontend n'envoie pas guichetId?

**A:** 

```javascript
// Dans routes/ventes.js ligne 72

guichetId: guichetId || null,  // ← Si pas envoyé, reste null

// La vente est créée SANS guichet
vente.guichetId = null;

// ⚠️ Problème: On ne sait pas par quel guichet la vente s'est passée
// 📊 Mauvais pour la traçabilité et les rapports
```

**Solution:**
- Vérifier que frontend envoie toujours guichetId
- Rendre guichetId obligatoire en backend si nécessaire

---

### Q5: Peut-on changer de guichet après la création de la vente?

**A:** **Non**, pas dans l'implémentation actuelle.

```javascript
// routes/ventes.js - PUT endpoint

// Seuls client, modePaiement, observations peuvent changer
if (req.body.client !== undefined) vente.client = req.body.client;
if (req.body.modePaiement) vente.modePaiement = req.body.modePaiement;
// guichetId n'est PAS modifiable
```

**Pourquoi?**
- Traçabilité critique: on doit savoir le guichet exact
- Audit: changer après coup = danger
- Si besoin: créer une nouvelle vente

**Si vous voulez permettre:**
```javascript
// Ajouter dans PUT:
if (req.body.guichetId) vente.guichetId = req.body.guichetId;
```

---

### Q6: Comment un superviseur sait quel guichet il peut accéder?

**A:** **Le frontend charge tous les guichets du magasin sélectionné**

```javascript
// assets/js/vente.js - loadGuichets()

async loadGuichets(magasinId) {
    const response = await fetch(
        `/api/protected/magasins/${magasinId}/guichets`
    );
    
    this.guichets = await response.json();  // Tous les guichets
    
    // Superviseur peut voir et sélectionner n'importe quel guichet
    // Pas de restrictions en frontend
}
```

**Si vous voulez restreindre:**
- Ajouter logique en backend
- Retourner seulement guichets assignés au superviseur
- Ou: retourner tous, mais frontend cache certains en JS

**Actuellement: Pas de restriction** → Superviseur peut vendre via n'importe quel guichet

---

### Q7: Comment voir qui a vraiment vendu (admin vs vendeur)?

**A:** Regarder le rôle dans la réponse API

```javascript
// Après GET /api/protected/ventes/:id

vente.utilisateurId.role === "VENDEUR"      // ✅ Vendeur standard
vente.utilisateurId.role === "SUPERVISEUR"  // ⚠️ Superviseur a vendu
vente.utilisateurId.role === "ADMIN"        // ⚠️ Admin a vendu

// Afficher différemment
if (vente.utilisateurId.role !== "VENDEUR") {
    console.log("🚨 Vente par", vente.utilisateurId.role);
}
```

---

### Q8: Peut-on avoir un vendeur qui vend via plusieurs guichets?

**A:** **Techniquement OUI, mais c'est pas prévu.**

Actuellement:
- Vendeur est "assigné" à un seul guichet
- Mais rien l'empêche de sélectionner un autre guichet en frontend
- Système laisse faire (pas de validation)

**Cas réel:**
```
Situation: Vendeur Robert assigné à Guichet 1

Scénario 1 (Normal):
- Robert sélectionne Mag A → Guichet 1 auto-sélectionné → vend
- utilisateurId = Robert
- guichetId = Guichet 1
- vendeurPrincipal = Robert ✅

Scénario 2 (Possible mais anormal):
- Robert clique "Change" 
- Sélectionne Guichet 2 (assigné à Jean)
- Vend via Guichet 2
- utilisateurId = Robert
- guichetId = Guichet 2
- vendeurPrincipal = Jean ⚠️
```

**Si vous voulez l'empêcher:**
```javascript
// En backend, valider que:
if (vente.utilisateurId !== guichet.vendeurPrincipal._id) {
    // Seulement superviseur/admin autorisé
    if (!req.user.role.includes("SUPERVISEUR|ADMIN")) {
        return res.status(403).json({ error: "Pas autorisé" });
    }
}
```

---

### Q9: Pourquoi "utilisateurId" et pas "vendeurId"?

**A:** Bonne question! Raisons:

1. **Générique**: Pas juste des vendeurs → Admins/Superviseurs aussi
2. **Cohérence**: Autres modèles (StockMovement, etc.) utilisent utilisateurId
3. **Clarté**: "utilisateur qui a créé la vente" vs "vendeur du guichet"

**Alternative possible:**
```javascript
// Renommer pour clarté
{
    createdBy: ObjectId,           // Qui a créé (Admin/Super/Vendeur)
    guichetId: ObjectId,           // Guichet utilisé
    guichet.vendeurPrincipal: ObjectId  // Vendeur assigné
}

// Mais actuellement utilisateurId fonctionne bien
```

---

### Q10: Comment tracer les couvertures (superviseur → vendeur)?

**A:** Comparer les IDs

```javascript
function isSupervisionCoverage(vente) {
    if (!vente.guichetId?.vendeurPrincipal) return false;
    
    // Si utilisateurId ≠ vendeurPrincipal et role = SUPERVISEUR/ADMIN
    const vendorOfGuichet = vente.guichetId.vendeurPrincipal._id;
    const personWhoSold = vente.utilisateurId._id;
    const role = vente.utilisateurId.role;
    
    return (
        vendorOfGuichet !== personWhoSold && 
        (role === "SUPERVISEUR" || role === "ADMIN")
    );
}

// Utilisation
if (isSupervisionCoverage(vente)) {
    console.log(`⚠️ ${vente.utilisateurId.nom} a couvert ${vente.guichetId.vendeurPrincipal.nom}`);
}
```

**Pour les rapports:**
```sql
-- Nombre de ventes où superviseur/admin a couvert
SELECT COUNT(*) 
FROM ventes v
WHERE v.utilisateurId.role IN ("SUPERVISEUR", "ADMIN")
  AND v.utilisateurId._id != v.guichetId.vendeurPrincipal._id
  AND DATE(v.dateVente) = TODAY();
```

---

### Q11: Que se passe-t-il si on supprime un vendeur?

**A:** Les ventes restent, mais avec orphelin

```javascript
// Avant suppression
vente.utilisateurId = "user_123" (Robert)
vente.guichetId.vendeurPrincipal = "user_123"

// Suppression Robert
Utilisateur.deleteOne({_id: "user_123"})

// Après
vente.utilisateurId = null (ORPHELIN)
vente.guichetId.vendeurPrincipal = null (ORPHELIN)
```

**Solution:**
```javascript
// Au lieu de delete
// Déactiver l'utilisateur
Utilisateur.updateOne(
    {_id: "user_123"},
    {actif: false}  // ← Au lieu de supprimer
)

// Ou: Reassigner au superviseur avant delete
Vente.updateMany(
    {utilisateurId: "user_123"},
    {utilisateurId: "user_superviseur"}
)
```

---

### Q12: Peut-on avoir plusieurs superviseurs au même magasin?

**A:** **OUI**, aucune restriction

```javascript
// Rien l'empêche d'avoir:
Magasin A:
├─ Superviseur Jean
├─ Superviseur Marie
├─ Vendeur Robert
└─ Vendeur Paul

// Tous les deux peuvent:
// - Couvrir n'importe quel guichet
// - Superviser les vendeurs
// - Voir toutes les ventes du magasin
```

**Si vous voulez une seule:**
```javascript
// Ajouter validation
Magasin.schema.pre('save', async function() {
    const existingSupervisor = await Utilisateur.findOne({
        magasinId: this._id,
        role: "SUPERVISEUR"
    });
    
    if (existingSupervisor) {
        throw new Error("Un seul superviseur par magasin");
    }
});
```

---

### Q13: Comment forcer guichet obligatoire?

**A:** Ajouter validation en backend

```javascript
// routes/ventes.js - POST

const { magasinId, guichetId, articles } = req.body;

// Validation AVANT création
if (!magasinId || !guichetId || !articles?.length) {
    return res.status(400).json({
        message: "❌ magasinId, guichetId, et articles sont obligatoires"
    });
}

// Vérifier que guichet existe
const guichet = await Guichet.findById(guichetId);
if (!guichet) {
    return res.status(404).json({
        message: "❌ Guichet introuvable"
    });
}

// Vérifier que guichet appartient au magasin
if (guichet.magasinId.toString() !== magasinId) {
    return res.status(400).json({
        message: "❌ Guichet n'appartient pas à ce magasin"
    });
}
```

---

### Q14: Comment afficher les ventes d'un guichet spécifique?

**A:** Filtrer par guichetId

```javascript
// Frontend
GET /api/protected/ventes?guichetId=G1&page=1&limit=20

// Backend - à ajouter
const { guichetId } = req.query;
const filter = {};
if (guichetId) filter.guichetId = guichetId;

const ventes = await Vente.find(filter);

// Retour: Ventes pour Guichet 1 seulement
```

---

### Q15: Erreur "guichetId is null after populate" - pourquoi?

**A:** Guichet n'existe pas en DB

```javascript
// Problème
vente.guichetId = "invalid_id"
populate('guichetId') → null (guichet pas trouvé)

// Solutions
1. Vérifier que guichet existe
2. Vérifier ObjectId valide
3. Vérifier DATABASE contient le guichet

// Debug
const guichet = await Guichet.findById("invalid_id");
console.log(guichet); // null?
```

---

## 🔧 Commandes Utiles

### Vérifier les rôles du JWT

```bash
# Terminal browser dev console
const token = localStorage.getItem('token');
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log(decoded.role); // ['VENDEUR'] ou ['SUPERVISEUR', 'VENDEUR']
```

### Tester API manuellement

```bash
# Get tous les guichets d'un magasin
curl -H "Authorization: Bearer TOKEN" \
  https://api.example.com/api/protected/magasins/mag_001/guichets

# Create vente avec guichet
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "magasinId": "mag_001",
    "guichetId": "G1",
    "articles": [...]
  }' \
  https://api.example.com/api/protected/ventes
```

### Vérifier les ventes d'un vendeur

```javascript
// Frontend
const ventes = await fetch(
    `/api/protected/ventes?userId=${userId}`
);
```

---

## ✅ Résumé Rapide

| Question | Réponse Rapide |
|----------|---|
| Pourquoi 2 rôles? | Admin/Super doivent pouvoir vendre |
| Qui envoie guichetId? | Frontend (validateVente) |
| Différence utilisateurId vs vendeurPrincipal? | Qui a vendu vs assigné au guichet |
| Peut-on changer guichet après? | Non (pas implémenté) |
| Comment voir superviseur a couvert? | Comparer IDs + vérifier role |
| Si guichet manquant? | Validation backend à ajouter |
| Plusieurs superviseurs OK? | Oui, aucune restriction actuellement |
| Comment filtrer par guichet? | GET /ventes?guichetId=X |

---

**Version:** 1.0  
**Dernière mise à jour:** 2026-01-08  
**Status:** ✅ Complètement Répondu
