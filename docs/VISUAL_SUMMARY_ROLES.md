# 🎯 Résumé Visuel - Logique des Rôles dans les Ventes

## 📊 Diagramme de Flux Complet

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                        UTILISATEUR SE CONNECTE                      ┃
┃                                                                     ┃
┃  Role:  ADMIN = [ADMIN, VENDEUR]                                  ┃
┃         SUPERVISEUR = [SUPERVISEUR, VENDEUR]                      ┃
┃         VENDEUR = [VENDEUR]                                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                 ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    ACCÈS À LA PAGE VENTE                           ┃
┃                    vente.php - VenteManager                        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                 ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃          1️⃣ SÉLECTIONNER MAGASIN (obligatoire)                     ┃
┃                                                                     ┃
┃  onMagasinChange()                                                 ┃
┃  ├─ this.currentMagasin = magasinId                               ┃
┃  └─ this.loadGuichets(magasinId) ← Charger guichets du magasin   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                 ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃          2️⃣ GUICHETS CHARGENT & AUTO-SÉLECTION                     ┃
┃                                                                     ┃
┃  loadGuichets(magasinId)                                           ┃
┃  ├─ GET /api/protected/magasins/{id}/guichets                     ┃
┃  ├─ Response: [                                                   ┃
┃  │   { _id: G1, nom: Guichet 1, vendeurPrincipal: {Robert} },   ┃
┃  │   { _id: G2, nom: Guichet 2, vendeurPrincipal: {Jean} },     ┃
┃  │   { _id: G3, nom: Guichet 3, vendeurPrincipal: {Marie} }     ┃
┃  │ ]                                                             ┃
┃  ├─ this.currentGuichet = G1 (premier auto-sélectionné)          ┃
┃  └─ updateGuichetDisplay() ← Afficher dans le formulaire         ┃
┃                                                                     ┃
┃  💡 Orange banner montre: "🪟 Guichet 1 | Robert | Change"      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                 ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃      3️⃣ OPTION: CHANGER DE GUICHET (clic bouton Change)           ┃
┃                                                                     ┃
┃  Click #btnChangeGuichet                                          ┃
┃  ├─ Modal #modalSelectGuichet s'ouvre                            ┃
┃  ├─ displayGuichets() affiche liste avec vendeurs:                ┃
┃  │  [ Guichet 1 (Robert) ]                                        ┃
┃  │  [ Guichet 2 (Jean) ]                                          ┃
┃  │  [ Guichet 3 ✓ Sélectionné ]                                  ┃
┃  ├─ User clique sur un guichet                                    ┃
┃  └─ selectGuichet(guichetId)                                      ┃
┃     ├─ this.currentGuichet = new_guichet_id                       ┃
┃     ├─ updateGuichetDisplay() ← Afficher la nouvelle sélection   ┃
┃     └─ Modal se ferme                                             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                 ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              4️⃣ AJOUTER PRODUITS AU PANIER                          ┃
┃                                                                     ┃
┃  - Sélectionner produit                                           ┃
┃  - Entrer quantité et prix                                        ┃
┃  - Cliquer "Ajouter au panier"                                    ┃
┃  - Panier se remplit avec articles                                ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                 ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃      5️⃣ VALIDER VENTE (Cliquer "Valider Vente")                    ┃
┃                                                                     ┃
┃  validateVente()                                                   ┃
┃  ├─ Vérifie: panier ≠ vide, magasin sélectionné, guichet OK      ┃
┃  ├─ Prépare body:                                                 ┃
┃  │  {                                                             ┃
┃  │    magasinId: "mag_001",        ← Magasin sélectionné         ┃
┃  │    guichetId: "G1",             ← Guichet sélectionné ✅       ┃
┃  │    articles: [...],             ← Panier                       ┃
┃  │    modePaiement: "CASH",                                       ┃
┃  │    tauxFC: 2650                                                ┃
┃  │  }                                                             ┃
┃  └─ POST /api/protected/ventes body                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                 ↓ BACKEND
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   router.post('/ventes', authMiddleware, async (req, res) => {      ┃
┃                                                                     ┃
┃   1. Extract JWT token: req.user.id (LA VRAIE PERSONNE QUI VEND)  ┃
┃   2. Extract body: magasinId, guichetId, articles                 ┃
┃   3. Valide stock pour chaque article                              ┃
┃   4. Create Vente:                                                 ┃
┃      {                                                             ┃
┃        dateVente: Date.now(),                                      ┃
┃        utilisateurId: req.user.id,    👤 IMPORTANT: Du JWT!       ┃
┃        guichetId: req.body.guichetId, 🪟 IMPORTANT: Du body!      ┃
┃        magasinId: req.body.magasinId,                             ┃
┃        articles: [...],                                            ┃
┃        montantTotalUSD: calculated,                                ┃
┃        modePaiement: req.body.modePaiement                         ┃
┃      }                                                             ┃
┃   5. Create StockMovements (SORTIE) pour chaque article           ┃
┃   6. POPULATE complètement:                                        ┃
┃      .populate('utilisateurId') → nom, prenom, email, role        ┃
┃      .populate('guichetId')     → nom, code, vendeurPrincipal     ┃
┃         .populate('guichetId.vendeurPrincipal')                   ┃
┃      .populate('articles.produitId') → photo, type, rayon         ┃
┃   7. Return Response 201:                                          ┃
┃      {                                                             ┃
┃        success: true,                                              ┃
┃        message: "✅ Vente enregistrée",                            ┃
┃        vente: {                                                    ┃
┃          utilisateurId: {                                          ┃
┃            _id: "user_456",                                        ┃
┃            nom: "Kamila",                                          ┃
┃            prenom: "Mvila",                                        ┃
┃            role: "SUPERVISEUR",  ← Peut être ADMIN/SUPERVISEUR!   ┃
┃            email: "..."                                            ┃
┃          },                                                        ┃
┃          guichetId: {                                              ┃
┃            _id: "G1",                                              ┃
┃            nom_guichet: "Guichet 1",                               ┃
┃            code: "G1",                                             ┃
┃            vendeurPrincipal: {                                     ┃
┃              _id: "user_123",                                      ┃
┃              nom: "Robert",                                        ┃
┃              prenom: "Kabamba"                                     ┃
┃            }                                                       ┃
┃          },                                                        ┃
┃          articles: [                                               ┃
┃            {                                                       ┃
┃              produitId: { photo, type, rayon, ... },              ┃
┃              quantite: 5,                                          ┃
┃              prixUnitaire: 15.50,                                  ┃
┃              montantUSD: 77.50                                     ┃
┃            }                                                       ┃
┃          ],                                                        ┃
┃          montantTotalUSD: 77.50,                                   ┃
┃          modePaiement: "CASH",                                     ┃
┃          statut: "VALIDÉE"                                         ┃
┃        }                                                           ┃
┃      }                                                             ┃
┃   })                                                               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                 ↓ FRONTEND
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  6️⃣ CONFIRMATION & AFFICHAGE RÉSULTAT                             ┃
┃                                                                     ┃
┃  if (response.ok) {                                                ┃
┃    const result = await response.json();                          ┃
┃    const vendeur = result.vente.utilisateurId;                   ┃
┃                                                                     ┃
┃    // 👤 AFFICHER QUI A VENDU                                      ┃
┃    alert(`✅ Vente enregistrée par ${vendeur.nom} ${vendeur.prenom}`)┃
┃                                                                     ┃
┃    // 🪟 PEUT MONTRER DÉTAILS DU GUICHET                           ┃
┃    console.log('Guichet:', result.vente.guichetId.nom_guichet);   ┃
┃    console.log('Vendeur du guichet:', result.vente.guichetId.vendeurPrincipal.nom)┃
┃                                                                     ┃
┃    // Vider panier, rafraîchir historique, etc.                   ┃
┃  }                                                                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 🎭 Trois Scénarios Possibles

### Scénario 1: Vendeur Standard Vend

```
┌──────────────────────────────────────────────────┐
│ Utilisateur: Robert (VENDEUR)                    │
│ Token JWT: { id: "user_123", role: "VENDEUR" } │
└──────────────────────────────────────────────────┘
                    ↓
        Sélectionne Guichet 1 (son guichet)
                    ↓
            Crée vente (validateVente)
                    ↓
┌──────────────────────────────────────────────────┐
│ Backend reçoit:                                  │
│ - utilisateurId (JWT): user_123                  │
│ - guichetId (body): G1                           │
│ - vendeurPrincipal de G1: user_123 (LUI)        │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│ Response inclut:                                 │
│ utilizateurId: {                                │
│   id: user_123,                                 │
│   nom: "Robert",                                │
│   role: "VENDEUR"                               │
│ }                                                │
│                                                  │
│ guichetId: {                                     │
│   nom: "Guichet 1",                             │
│   vendeurPrincipal: {                           │
│     id: user_123,                               │
│     nom: "Robert"                               │
│   }                                              │
│ }                                                │
└──────────────────────────────────────────────────┘
         ✅ Tout normal - Vendeur vend via son guichet
```

### Scénario 2: Superviseur Vend via Guichet d'un Autre

```
┌──────────────────────────────────────────────────┐
│ Utilisateur: Jean (SUPERVISEUR)                 │
│ Token JWT: {                                     │
│   id: "user_456",                               │
│   role: ["SUPERVISEUR", "VENDEUR"]              │
│ }                                                │
└──────────────────────────────────────────────────┘
                    ↓
    Sélectionne Guichet 2 (normalement pour Robert)
                    ↓
            Crée vente (validateVente)
                    ↓
┌──────────────────────────────────────────────────┐
│ Backend reçoit:                                  │
│ - utilisateurId (JWT): user_456 (JEAN)          │
│ - guichetId (body): G2                          │
│ - vendeurPrincipal de G2: user_123 (ROBERT)    │
│                                                  │
│ ⚠️ ATTENTION: user_456 ≠ user_123              │
│    Superviseur couvre le vendeur!               │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│ Response inclut:                                 │
│ utilizateurId: {                                │
│   id: user_456,                                 │
│   nom: "Jean",                                  │
│   role: "SUPERVISEUR"  ← SUPERVISEUR A VENDU!  │
│ }                                                │
│                                                  │
│ guichetId: {                                     │
│   nom: "Guichet 2",                             │
│   vendeurPrincipal: {                           │
│     id: user_123,     ← DIFFÉRENT!              │
│     nom: "Robert"                               │
│   }                                              │
│ }                                                │
└──────────────────────────────────────────────────┘
         ⚠️ Superviseur a temporairement couvert le vendeur
         🔍 Visible en analytics: user_456 ≠ guichet.vendeurPrincipal
```

### Scénario 3: Admin Vend

```
┌──────────────────────────────────────────────────┐
│ Utilisateur: Alice (ADMIN)                       │
│ Token JWT: {                                     │
│   id: "user_789",                               │
│   role: ["ADMIN", "VENDEUR"]                    │
│ }                                                │
└──────────────────────────────────────────────────┘
                    ↓
        Sélectionne n'importe quel guichet
                    ↓
            Crée vente (validateVente)
                    ↓
┌──────────────────────────────────────────────────┐
│ Response inclut:                                 │
│ utilizateurId: {                                │
│   id: user_789,                                 │
│   nom: "Alice",                                 │
│   role: "ADMIN"        ← ADMIN A VENDU!        │
│ }                                                │
│                                                  │
│ guichetId: {                                     │
│   nom_guichet: "X",                             │
│   vendeurPrincipal: {                           │
│     id: user_Y                                  │
│   }                                              │
│ }                                                │
└──────────────────────────────────────────────────┘
         ✅ Admin a les permissions pour vendre
         🔍 Enregistré comme vendeur dans la vente
```

---

## 🔑 Points Critiques

### ✅ UTILISATEURID

```
┌────────────────────────────────────────────────┐
│ 👤 UTILISATEURID = LA VRAIE PERSONNE QUI VEND │
├────────────────────────────────────────────────┤
│ Source:     JWT Token (req.user.id)           │
│ Peut être:  ADMIN | SUPERVISEUR | VENDEUR    │
│ Stored:     Dans vente.utilisateurId          │
│ Retourné:   Complètement peuplé dans API     │
│            (nom, prenom, email, role, photo) │
└────────────────────────────────────────────────┘
```

### ✅ GUICHETID

```
┌────────────────────────────────────────────────┐
│  🪟 GUICHETID = OÙ LA VENTE S'EST PASSÉE      │
├────────────────────────────────────────────────┤
│ Source:           Body du POST                │
│ Envoyé par:       Frontend (validateVente)   │
│ Stored:           Dans vente.guichetId       │
│ Retourné avec:    vendeurPrincipal populé   │
│ Peut être:        ≠ de utilisateurId         │
│                   (si superviseur/admin vend)│
└────────────────────────────────────────────────┘
```

### ✅ GUICHET.VENDEURPRINCIPAL

```
┌────────────────────────────────────────────────┐
│ 🏷️ VENDEURPRINCIPAL = VENDEUR ASSIGNÉ AU     │
│                       GUICHET                  │
├────────────────────────────────────────────────┤
│ Source:      Data du guichet en DB            │
│ Stored in:   guichetId.vendeurPrincipal      │
│ Purpose:     Audit + assignation              │
│ Compare à:   utilisateurId pour détection    │
│              si superviseur/admin a couvert  │
└────────────────────────────────────────────────┘
```

---

## 📝 Tableau Comparatif

| Aspect | VENDEUR | SUPERVISEUR | ADMIN |
|--------|---------|-------------|-------|
| **Rôle(s)** | VENDEUR | SUPERVISEUR + VENDEUR | ADMIN + VENDEUR |
| **Peut vendre** | ✅ Via son guichet | ✅ Via n'importe quel guichet | ✅ Via n'importe quel guichet |
| **Peut voir autres ventes** | ❌ Ses ventes | ✅ Du magasin | ✅ Tout |
| **Peut modifier ventes** | ❌ Non | ✅ Oui | ✅ Oui |
| **Peut affecter guichets** | ❌ Non | ✅ Oui | ✅ Oui |
| **Dans les ventes** | utilisateurId.role = VENDEUR | utilisateurId.role = SUPERVISEUR | utilisateurId.role = ADMIN |
| **Peut couvrir guichet** | ❌ Non | ✅ Oui | ✅ Oui |

---

## 🔄 Cycle de Vie Complet

```
ÉTAPE 1: LOGIN
   ├─ User se connecte
   ├─ Reçoit JWT token
   └─ Role récupéré: ADMIN | SUPERVISEUR | VENDEUR

ÉTAPE 2: ACCÈS VENTE
   ├─ Page vente.php charge
   ├─ VenteManager initialise
   └─ Event listeners attachés

ÉTAPE 3: SÉLECTION MAGASIN
   ├─ User sélectionne magasin
   ├─ loadMagasins() récupère magasins
   └─ loadGuichets() charge guichets du magasin

ÉTAPE 4: GUICHET AUTO/MANUEL
   ├─ Premier guichet auto-sélectionné
   ├─ Affichage dans orange banner
   └─ User peut cliquer "Change" pour autre guichet

ÉTAPE 5: SÉLECTION PRODUITS
   ├─ User cherche produit
   ├─ Clique pour afficher détails
   ├─ Ajoute quantité et prix
   └─ Ajoute au panier

ÉTAPE 6: VALIDATION
   ├─ User clique "Valider Vente"
   ├─ validateVente() envoie guichetId
   └─ Backend crée vente avec utilisateurId (JWT)

ÉTAPE 7: CONFIRMATION
   ├─ Response retourne vente populée
   ├─ Affiche "Vente par {nom} {prenom}"
   ├─ Panier se vide
   └─ Historique se rafraîchit

ÉTAPE 8: TRAÇABILITÉ
   ├─ utilisateurId = qui a vraiment vendu
   ├─ guichetId = où ça s'est passé
   ├─ guichet.vendeurPrincipal = pour audit
   └─ Tous les détails (photos, types, rayons) inclus
```

---

## ✨ Résumé Ultra-Court

**AVANT:**
- ❌ Admin/Superviseur ne pouvaient pas vendre
- ❌ Ventes sans traçabilité du guichet
- ❌ Frontend ne montrait pas où vendre

**APRÈS:**
- ✅ Admin/Superviseur peuvent vendre via n'importe quel guichet
- ✅ Chaque vente enregistre utilisateurId (qui a vendu) + guichetId (où)
- ✅ Frontend affiche orange banner avec guichet sélectionné
- ✅ Modal pour changer rapidement de guichet
- ✅ APIs retournent tous les détails (pas d'appels supplémentaires)
- ✅ Traçabilité complète: détécter quand superviseur/admin a couvert

**LOGIQUE SIMPLE:**
```
1. User a un rôle (JWT)
2. User sélectionne un guichet (frontend)
3. User crée une vente
4. Backend enregistre: qui (JWT) + guichet (body)
5. API retourne: utilisateur + guichet + tous les détails
6. Mobile dev reçoit données complètes, zéro appels supplémentaires
```

---

**Status:** ✅ Implémenté, Testé, Documenté  
**Dernière mise à jour:** 2026-01-08
