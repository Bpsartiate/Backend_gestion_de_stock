# ⚙️ CONFIGURATION RAYONS & TYPES PRODUITS

## 📌 APERÇU

Le modal "Stock Settings" permet de configurer:
1. **Rayons** - Emplacements physiques avec capacités
2. **Types Produits** - Classifications avec unités

Avec le nouveau système multi-rayon, ces configurations sont **critiques** pour la distribution automatique.

---

## 🏠 RAYONS (Shelves/Racks)

### Qu'est-ce qu'un Rayon?

Un **rayon** est une zone physique de stockage avec:
- ✅ Capacité max (poids, volume ou quantité)
- ✅ Types produits autorisés
- ✅ Quantité actuelle (en temps réel)
- ✅ Status (actif/inactif)

### Exemple de configuration

```
┌─ Magasin Principal ────────────────────┐
│                                        │
│ ┌─ Rayon Viande (FROID) ────────────┐ │
│ │ Capacité: 1000kg                  │ │
│ │ Actuel: 850kg (85% utilisé)       │ │
│ │ Types autorisés: [Viande, Volaille]
│ │ Température: -18°C                │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌─ Rayon Légumes (NORMAL) ──────────┐ │
│ │ Capacité: 500kg                   │ │
│ │ Actuel: 200kg (40% utilisé)       │ │
│ │ Types autorisés: [Légumes]        │ │
│ └────────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

### Paramètres de configuration

| Paramètre | Type | Obligatoire | Description |
|-----------|------|---|---|
| **codeRayon** | String | ✅ | Code unique (ex: VIA-01) |
| **nomRayon** | String | ✅ | Nom lisible (ex: Rayon Viande A) |
| **capaciteMax** | Number | ✅ | Capacité maximale (kg ou pièces) |
| **typeRayon** | Enum | ✅ | RAYON, ETAGERE, SOL, FROID, VITRINE |
| **typesProduitsAutorises** | Array | ❌ | Types produits autorisés |
| **couleurRayon** | Hex | ❌ | Couleur pour l'UI (#10b981) |
| **iconeRayon** | Emoji | ❌ | Icône (📦, 🧊, 🥕, etc.) |
| **description** | String | ❌ | Notes sur le rayon |

### Exemple de création

```javascript
// POST /api/protected/rayons
{
  "magasinId": "mag_1",
  "codeRayon": "VIA-01",
  "nomRayon": "Rayon Viande - Entrée",
  "typeRayon": "FROID",
  "capaciteMax": 1000,
  "couleurRayon": "#0ea5e9",
  "iconeRayon": "🥩",
  "typesProduitsAutorises": ["typeProduit_viande", "typeProduit_volaille"],
  "description": "Chambre froide à -18°C, accès restreint"
}

✅ Response:
{
  "success": true,
  "rayon": {
    "_id": "rayon_001",
    "codeRayon": "VIA-01",
    "nomRayon": "Rayon Viande - Entrée",
    "capaciteMax": 1000,
    "quantiteActuelle": 0
  }
}
```

### Impact sur la distribution

**Lors d'une réception de 40 pièces:**

```
Distribution demandée:
- Rayon A (capacité 40): 20 pièces
- Rayon B (capacité 40): 20 pièces

Validation:
✅ Rayon A: 20 + 0 (actuel) ≤ 40 → OK
✅ Rayon B: 20 + 0 (actuel) ≤ 40 → OK

Résultat:
Rayon A: 0 → 20 (50% utilisé)
Rayon B: 0 → 20 (50% utilisé)
```

---

## 📦 TYPES PRODUITS (Categories)

### Qu'est-ce qu'un Type Produit?

Un **type produit** est une classification avec:
- ✅ Unité principale de stockage
- ✅ Type de stockage (simple ou lot)
- ✅ Capacité par emplacement
- ✅ Rayons autorisés

### Exemple de configuration

```
┌─ Type Produit: VIANDE ─────────────┐
│ Unité principale: kg               │
│ Type stockage: simple              │
│ Capacité max: 100kg par rayon      │
│ Rayons autorisés: [Rayon Viande]   │
└────────────────────────────────────┘

┌─ Type Produit: ROULEAU ────────────┐
│ Unité principale: pièce            │
│ Type stockage: lot                 │
│ Capacité max: 20 pièces par rayon  │
│ Rayons autorisés: [Rayon Stock]    │
└────────────────────────────────────┘
```

### Paramètres de configuration

| Paramètre | Type | Obligatoire | Description |
|-----------|------|---|---|
| **nomType** | String | ✅ | Nom (ex: Viande, Rouleau) |
| **code** | String | ✅ | Code unique (ex: VIA, ROU) |
| **unitePrincipaleStockage** | String | ✅ | Unité (kg, pièce, litre, mètre) |
| **typeStockage** | Enum | ✅ | "simple" ou "lot" |
| **capaciteMax** | Number | ❌ | Capacité max par emplacement |
| **rayonsAutorises** | Array | ❌ | Rayons où peut être stocké |

### Types de stockage

#### 1. Type SIMPLE (vrac)
```javascript
{
  nomType: "Viande",
  unitePrincipaleStockage: "kg",
  typeStockage: "simple",
  capaciteMax: 1000
}

📊 Stockage:
- Quantité cumulée
- Pas de traçabilité individuelle
- FIFO automatique
- Convient pour: Viande, Légumes, Liquides
```

#### 2. Type LOT (pièces individuelles)
```javascript
{
  nomType: "Rouleau",
  unitePrincipaleStockage: "pièce",
  typeStockage: "lot",
  capaciteMax: 50
}

📊 Stockage:
- Une pièce = une ligne Lot
- Traçabilité complète
- Date de fabrication/péremption par lot
- Convient pour: Rouleaux, Cartons, Boîtes
```

### Exemple de création

```javascript
// POST /api/protected/types-produits
{
  "magasinId": "mag_1",
  "nomType": "Viande Fraîche",
  "code": "VF",
  "unitePrincipaleStockage": "kg",
  "typeStockage": "simple",
  "capaciteMax": 100,
  "rayonsAutorises": ["rayon_viande_01", "rayon_viande_02"]
}

✅ Response:
{
  "success": true,
  "typeProduit": {
    "_id": "type_001",
    "nomType": "Viande Fraîche",
    "unitePrincipaleStockage": "kg",
    "typeStockage": "simple"
  }
}
```

---

## 🔗 RELATION RAYONS ↔ TYPES PRODUITS

### Configuration multi-rayon recommandée

```
Type: VIANDE
├─ Rayon A: Viande_Froid_1 (FROID, capacité 1000kg)
├─ Rayon B: Viande_Froid_2 (FROID, capacité 1000kg)
├─ Rayon C: Viande_Normal (RAYON, capacité 500kg)

Type: LÉGUMES
├─ Rayon D: Légumes_Frais (RAYON, capacité 800kg)
├─ Rayon E: Légumes_Surgelés (FROID, capacité 600kg)

Type: ROULEAUX
└─ Rayon F: Stock_Rouleaux (SOL, capacité 100 pièces)
```

### Validation lors de la réception

```
Réception: 150kg de Viande

Distribution proposée:
- Rayon A (Viande_Froid_1): 75kg ✅ Type autorisé
- Rayon B (Viande_Froid_2): 75kg ✅ Type autorisé

Distribution rejetée:
- Rayon D (Légumes_Frais): 150kg ❌ Type non autorisé
```

---

## 📋 CHECKLIST CONFIGURATION

### Pour chaque Rayon, vérifier:
- [ ] Code unique (ex: VIA-01, LEG-02)
- [ ] Nom explicite
- [ ] Capacité réaliste
- [ ] Type rayon correct (FROID, SOL, etc.)
- [ ] Types produits autorisés définis
- [ ] Icône et couleur pour l'UI

### Pour chaque Type Produit, vérifier:
- [ ] Unité principale cohérente
- [ ] Type stockage défini (simple ou lot)
- [ ] Rayons autorisés assignés
- [ ] Capacité max logique

---

## 🎯 EXEMPLE COMPLET: Magasin Alimentaire

### Rayons configurés

```
RAYON 1: Viande Fraîche (FROID)
├─ Code: VIA-F
├─ Capacité: 500kg
├─ Types: Viande, Volaille
├─ Température: -18°C

RAYON 2: Viande Surgelée (FROID)
├─ Code: VIA-S
├─ Capacité: 600kg
├─ Types: Viande, Volaille
├─ Température: -25°C

RAYON 3: Légumes Frais (RAYON)
├─ Code: LEG-F
├─ Capacité: 800kg
├─ Types: Légumes
├─ Température: 4-8°C

RAYON 4: Stock General (SOL)
├─ Code: STK-G
├─ Capacité: 2000kg
├─ Types: Tous sauf congelé
```

### Types produits configurés

```
TYPE 1: Viande Fraîche
├─ Code: VF
├─ Unité: kg
├─ Stockage: simple
├─ Rayons autorisés: [VIA-F]

TYPE 2: Viande Surgelée
├─ Code: VS
├─ Unité: kg
├─ Stockage: simple
├─ Rayons autorisés: [VIA-S]

TYPE 3: Légumes
├─ Code: LEG
├─ Unité: kg
├─ Stockage: simple
├─ Rayons autorisés: [LEG-F, STK-G]

TYPE 4: Rouleaux Emballage
├─ Code: ROU
├─ Unité: pièce
├─ Stockage: lot
├─ Rayons autorisés: [STK-G]
```

### Réception exemple

```
Réception: 200kg Viande Fraîche

Logique automatique:
1. Type = Viande Fraîche
2. Rayon autorisé = VIA-F
3. VIA-F capacité = 500kg, actuel = 100kg
4. Distribution: VIA-F ← 200kg
5. Résultat: VIA-F = 300kg (60% utilisé)

✅ OK - Réception acceptée
```

---

## 🔐 BONNES PRATIQUES

### ✅ À FAIRE
- Créer des rayons avec capacités réalistes
- Assigner chaque type produit à au minimum 1 rayon
- Utiliser des codes courts et mémorables
- Documenter les types de rayon (FROID, SOL, etc.)
- Mettre à jour les capacités si situation change

### ❌ À ÉVITER
- Créer des rayons sans capacité définie
- Autoriser tous les types produits partout
- Utiliser des noms génériques ("Rayon 1")
- Oublier de vérifier la capacité lors de réception
- Modifier les capacités sans vérifier l'impact

---

## 📞 SUPPORT

Pour questions sur la configuration:
- Contacter l'administrateur magasin
- Consulter `docs/STOCKRAYON_SYSTEM.md`
- Tester dans l'interface "Stock Settings"
