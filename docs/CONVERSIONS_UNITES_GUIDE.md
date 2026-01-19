# 📦 Système de Conversions d'Unités - Guide Complet

## 🎯 Concept

**Stocker d'une façon, vendre de plusieurs façons!**

Un même produit peut être:
- **Stocké** en: Rouleaux, Caisses, Boîtes, Paquets
- **Vendu** en: Mètres, Pièces, Cartouches, Paquets individuels

## 📊 Exemple Concret

### **Cas 1: Tissu en rouleau**

```
Configuration:
├─ Unité de Stockage: ROULEAU
├─ 1 Rouleau = 100 mètres
├─ Coûte: 50$

Conversions d'Unités:
├─ ROULEAU:
│  ├─ Quantité en base: 1
│  ├─ Prix achat: 50$
│  ├─ Peut vendre: OUI
│  └─ Icône: 📜
│
└─ MÈTRE:
   ├─ Quantité en base: 0.01 (1m = 1/100 rouleau)
   ├─ Prix achat: 0.50$ (auto-calculé: 50/100)
   ├─ Peut vendre: OUI
   └─ Icône: 📏
```

**À la vente:**
- Vendre 1 Rouleau = 50$
- Vendre 2.5 mètres = 1.25$
- Vendre 100 mètres = 50$

### **Cas 2: Médicaments en boîte**

```
Configuration:
├─ Unité de Stockage: CAISSE
├─ 1 Caisse = 5 Boîtes = 50 Pièces
├─ Coûte: 25$

Conversions d'Unités:
├─ CAISSE:
│  ├─ Quantité en base: 1
│  ├─ Prix achat: 25$
│  ├─ Peut vendre: OUI
│  └─ Icône: 📦
│
├─ BOÎTE:
│  ├─ Quantité en base: 0.2 (1 boîte = 1/5 caisse)
│  ├─ Prix achat: 5$
│  ├─ Peut vendre: OUI
│  └─ Icône: 📦
│
└─ PIÈCE:
   ├─ Quantité en base: 0.02 (1 pièce = 1/50 caisse)
   ├─ Prix achat: 0.50$
   ├─ Peut vendre: OUI
   └─ Icône: 1️⃣
```

**À la vente:**
- Vendre 2 Caisses = 50$
- Vendre 1 Caisse + 3 Boîtes = 30$
- Vendre 100 Pièces = 50$

## 🔧 Comment Configurer

### **Étape 1: Créer une nouvelle catégorie**

1. Ouvrir "Configuration → Types Produits"
2. Cliquer "Créer nouvelle catégorie"
3. Remplir les informations de base:
   - Nom: "Tissu en Rouleau"
   - Code: "TIS"
   - Icône: "🧵"
   - Couleur: bleu

### **Étape 2: Définir l'unité principale**

```
Unité Principale de Stockage: [ROULEAU]
```

C'est l'unité dans laquelle vous stockez **physiquement** le produit.

### **Étape 3: Ajouter les conversions**

Cliquer **"Ajouter Unité"** pour chaque unité de vente possible:

**Pour ROULEAU:**
| Icône | Unité | Quantité | Prix | Peut Vendre |
|-------|-------|----------|------|------------|
| 📜 | ROULEAU | 1 | 50 | ✓ |

**Pour MÈTRE:**
| Icône | Unité | Quantité | Prix | Peut Vendre |
|-------|-------|----------|------|------------|
| 📏 | MÈTRE | 0.01 | 0.50 | ✓ |

**Explication:**
- **Quantité en base**: 0.01 veut dire "1 mètre = 0.01 rouleau"
- **Prix**: 0.50$ = le prix d'achat du mètre (peut être ajusté manuellement)
- **Peut Vendre**: Oui, les clients peuvent acheter par mètre

## 📝 Champs Expliqués

| Champ | Signification | Exemple |
|-------|---------------|---------|
| **Icône** | Symbole visuel pour reconnaître l'unité | 📜 pour rouleau |
| **Unité** | Nom de l'unité | ROULEAU, MÈTRE, PIÈCE |
| **Quantité en base** | Comment cette unité se convertit | 0.01 = 1/100 |
| **Prix achat** | Coûte de cette unité | 0.50$ (manuel!) |
| **Peut vendre?** | Clients peuvent-ils acheter cette unité? | OUI/NON |

## 💡 Règles Importantes

1. **Toutes les conversions doivent être exactes**
   - 1 Rouleau = 100 mètres
   - 1 Rouleau = 0.01 est INCORRECT
   - 1 mètre = 0.01 est CORRECT

2. **Le prix peut être ajusté à tout moment**
   - Prix d'achat: manuel, peut changer
   - Prix de vente: défini AU MOMENT DE LA VENTE (flex africain!)

3. **Une unité peut ne pas être vendue**
   - Stocker en CAISSE, mais vendre uniquement par PIÈCE
   - CAISSE: "Peut vendre?" = NON
   - PIÈCE: "Peut vendre?" = OUI

## 🛒 À la Vente

**Quand on crée une vente:**

```
Produit: Tissu en Rouleau

Unité de vente: [ROULEAU ▼]  ← Dropdown avec les unités
Quantité: [2.5        ]
Prix unitaire: [20        ] ← AJUSTABLE! Peut pas être 0.50
Montant total: 50$

OU

Unité de vente: [MÈTRE ▼]
Quantité: [250       ]
Prix unitaire: [0.20      ] ← Peut changer chaque jour!
Montant total: 50$
```

**Le système:**
- ✅ Affiche dropdown avec unités "Peut vendre? = OUI"
- ✅ Propose prix par défaut (0.50$ pour le mètre)
- ✅ **L'utilisateur peut modifier le prix** (flexible!)
- ✅ Calcule montant total = Quantité × Prix ajusté

## 📦 Impact sur le Stock

**Quand on reçoit 10 rouleaux:**
```
Stock: 10 × 1 = 10 rouleaux = 1000 mètres
```

**Quand on vend 2.5 mètres:**
```
Stock: 10 - 0.025 = 9.975 rouleaux = 997.5 mètres
```

**Quand on vend 1 rouleau:**
```
Stock: 9.975 - 1 = 8.975 rouleaux = 897.5 mètres
```

**Le stock reste toujours en unité de base (ROULEAU)** mais on peut afficher les deux!

## ✨ Avantages

✅ **Flexibilité maximale** - Chaque commerce ses propres conversions
✅ **Prix adaptable** - Changer le prix chaque jour (réalité africaine)
✅ **Traçabilité** - Savoir exact combien on a en mètres et rouleaux
✅ **Pas d'erreur** - Système automatique de conversion
✅ **Scalable** - Fonctionne pour N unités (2, 3, 5, 10...)

## 🚨 Erreurs Courantes

❌ **"Quantité en base" inversée**
- MAUVAIS: 1 mètre = 100 (100 fois plus grand qu'un rouleau?)
- BON: 1 mètre = 0.01 (100 fois plus petit)

❌ **"Peut vendre" déscoché pour toutes les unités**
- Les clients ne peuvent rien acheter!
- Au moins UNE unité doit être cochée

❌ **Prix négatif**
- Le système refuse automatiquement

## 🔍 Comment Vérifier

Après configuration, dans le formulaire d'ajout de produit:

1. Sélectionner le type "Tissu en Rouleau"
2. Les champs doivent afficher:
   - Unités de vente: ROULEAU, MÈTRE
   - Prix par défaut: 50$ (rouleau), 0.50$ (mètre)
3. À la vente, avoir le dropdown avec ces unités

## 📞 Support

Si vous avez des doutes:
- ✅ Tester avec un petit produit d'abord
- ✅ Vérifier que les maths des conversions sont correctes
- ✅ Vérifier que les prix sont réalistes

Bon stockage! 📦✨
