# ⚡ QUICK REFERENCE - Session 2

## 🎯 En 30 Secondes

**Quoi** : Amélioration modale guichet + design panel 3 + edit modal + doc centralisée  
**Où** : `assets/js/magasin_guichet.js` + `modals/magasins-guichets-modals.php` + `docs/`  
**Résultat** : 100% complété ✅  

---

## 🚀 Commandes Rapides

### Test API_BASE (Console Browser)
```javascript
// F12 → Console
window.API_BASE
// Output: "https://backend-gestion-de-stock.onrender.com"
```

### Ouvrir Modal Guichet
```javascript
openGuichetModal('guichet_id')
```

### Ouvrir Modal Edit Guichet
```javascript
editGuichetModal('guichet_id')
```

### Rendre Liste Guichets
```javascript
// Automatique lors du clic sur magasin
// Ou manuellement :
loadGuichetsForMagasin('magasin_id')
```

---

## 📂 Fichiers Clés

| Fichier | Fonction | Ligne |
|---------|----------|-------|
| `magasin.php` | Config API_BASE | 48 |
| `magasin_guichet.js` | renderGuichets() | 546 |
| `magasin_guichet.js` | loadGuichetDetails() | 610 |
| `magasin_guichet.js` | editGuichetModal() | 1010 |
| `magasins-guichets-modals.php` | Modal edit HTML | 211 |
| `docs/DOCS_INDEX.md` | Documentation | - |

---

## 🔧 Configuration

### Changer API Endpoint
```javascript
// Dans magasin.php ligne 48
// Development
window.API_BASE = 'http://localhost:3000'

// Production
window.API_BASE = 'https://backend-gestion-de-stock.onrender.com'
```

---

## 🎯 Checklist Utilisateur

- [ ] API endpoint `/api/protected/guichets/:id` disponible
- [ ] Response inclut `vendeurPrincipal.prenom` et `.nom`
- [ ] Cache browser vidé (Ctrl+Shift+R)
- [ ] Console browser ouverte (F12) pour debug

---

## 🐛 Troubleshooting Rapide

| Problème | Solution |
|----------|----------|
| Données pas chargées | Vérifier API_BASE + token auth |
| Vendeur pas affiché | Vérifier que API retourne `vendeurPrincipal` |
| Styles cassés | Vider cache (Ctrl+Shift+R) |
| Modal edit pas ouverte | Vérifier ID guichet valide |

---

## 📊 Impact

| Avant | Après |
|-------|-------|
| 10+ URLs hardcodées | 0 URLs hardcodées |
| Données simulées | API réelle |
| Design simple | Design premium |
| 3 CRUD | 4 CRUD (+ Edit) |
| 15 doc files | 26 doc files |

---

## 🎓 3 Points Clés

1. **API Centralisée** : `window.API_BASE` partout
2. **Hybrid Approach** : PHP structure + JS data + CSS style
3. **Documentation** : `/docs` organized by role

---

## 📖 Liens

- 📚 [Documentation](./docs/DOCS_INDEX.md)
- 📝 [Changelog](./docs/CHANGELOG_SESSION2.md)
- ⏱️ [Quick Start](./docs/QUICK_START.md)
- 🏗️ [Architecture](./docs/HYBRID_APPROACH_REFACTOR.md)

---

**Last Update** : 19 Dec 2025  
**Status** : ✅ COMPLETE
