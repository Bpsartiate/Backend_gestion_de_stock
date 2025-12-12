# 🧪 Guide de Test - Modification des Magasins

## Test Rapide (2-3 minutes)

### Prérequis
- ✅ Backend en cours d'exécution sur Render (ou localhost:5000)
- ✅ Connecté en tant qu'admin ou superviseur
- ✅ Magasin visible dans la liste

### Étapes

1. **Accédez à la page magasin**
   - URL: `http://localhost/backend_Stock/magasin.php`

2. **Sélectionnez un magasin**
   - Cliquez sur un magasin dans la liste de gauche
   - Vérifiez que les détails s'affichent

3. **Ouvrez le modal d'édition**
   - Cliquez sur le bouton ✏️ (Modifier) en haut à droite de la carte
   - ✅ Modal doit s'ouvrir avec le titre "Modifier [nom magasin]"

4. **Vérifiez les données pré-remplies**
   - ✅ Nom du magasin
   - ✅ Adresse
   - ✅ Téléphone
   - ✅ Description
   - ✅ Gestionnaire sélectionné
   - ✅ Photo affichée en preview

5. **Modifiez le nom**
   - Changez le nom du magasin
   - Cliquez "Enregistrer"
   - ✅ Toast: "✅ Magasin modifié avec succès"
   - ✅ Modal fermeture automatique
   - ✅ La liste et détails se mettent à jour

6. **Testez le changement de gestionnaire**
   - Cliquez de nouveau sur "Modifier"
   - Sélectionnez un autre gestionnaire
   - Cliquez "Enregistrer"
   - ✅ Toast succès
   - ✅ Gestionnaire mis à jour

7. **Testez l'upload de photo**
   - Cliquez de nouveau sur "Modifier"
   - Cliquez "Remplacer photo"
   - Sélectionnez une image locale
   - Cliquez "Enregistrer"
   - ✅ Photo mise à jour

## Tests d'Erreur

### Cas: Nom vide
- Laissez le nom vide
- Cliquez "Enregistrer"
- ✅ Toast: "❌ Le nom du magasin est obligatoire"

### Cas: Sans droits
- Connectez-vous en tant que vendeur
- Essayez de modifier un magasin
- ✅ Toast: "❌ Accès refusé"

### Cas: API non disponible
- Arrêtez le backend
- Essayez de modifier
- ✅ Toast: "❌ [message d'erreur]"

## Vérifications Côté Serveur

### Base de Données
```bash
# Vérifier la modification dans MongoDB
db.magasins.findOne({ _id: ObjectId("...") })
```

### Logs de l'API
```bash
# Doit afficher:
# "🔄 Chargement magasin: [id]"
# "✅ Magasin modifié"
```

---

**Succès = Tous les tests passent ✅**
