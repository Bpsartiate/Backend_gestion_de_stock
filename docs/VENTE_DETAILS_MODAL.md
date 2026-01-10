# 📋 Modal Détails de Vente - Guide Complet

## 🎯 Vue d'ensemble

Le modal **"Détails de Vente"** est une interface avancée et interactive pour visualiser l'ensemble des informations liées à une transaction commerciale. Il fournit une vue complète et détaillée avec tous les contextes associés à une vente.

## 🎨 Architecture du Modal

### Structure visuelle

```
┌─────────────────────────────────────────────┐
│ 📋 Détails de la Vente         [Vente #...]  │  ← Header Gradient
├─────────────────────────────────────────────┤
│                                               │
│  1️⃣ INFORMATION DU VENDEUR                   │
│     [Photo] Nom, Rôle, Email, Badge         │
│                                               │
│  ────────────────────────────────────────   │
│                                               │
│  2️⃣ MAGASIN & GUICHET                       │
│     [Magasin Info] [Guichet Info]           │
│                                               │
│  ────────────────────────────────────────   │
│                                               │
│  3️⃣ ARTICLES VENDUS                         │
│     [Article 1 avec photo, details]         │
│     [Article 2 avec photo, details]         │
│     ...                                      │
│                                               │
│  ────────────────────────────────────────   │
│                                               │
│  4️⃣ RÉSUMÉ FINANCIER                        │
│     💵 USD: $XXX.XX                         │
│     🇨🇩 FC: XXXXX FC (si applicable)        │
│     Mode Paiement: CASH/CARTE/CHÈQUE       │
│                                               │
│  ────────────────────────────────────────   │
│                                               │
│  5️⃣ INFORMATIONS SUPPLÉMENTAIRES            │
│     📅 Date/Heure, 📊 Statut, 👥 Client   │
│     📦 Quantité totale                      │
│     📝 Observations                         │
│                                               │
├─────────────────────────────────────────────┤
│ [Imprimer] [Annuler] [Fermer]  (footer)    │
└─────────────────────────────────────────────┘
```

## 🔧 Fonctionnalités Principales

### 1️⃣ Affichage des Détails Vendeur
- **Photo de profil** avec bordure colorée
- **Nom complet** du vendeur
- **Rôle** avec badge couleur (Admin, Superviseur, Vendeur, Caissier)
- **Email** avec icône de contact
- Indicateur visuel du rôle via badge Bootstrap

### 2️⃣ Informations Magasin et Guichet
**Magasin:**
- Nom du magasin
- Adresse physique
- Entreprise/Groupe associé

**Guichet:**
- Nom/Numéro du guichet (avec gradient orange)
- Code unique du guichet
- Vendeur du guichet

### 3️⃣ Liste des Articles Vendus
Pour chaque article:
- **Miniature photo** du produit
- **Nom du produit**
- **Type** (ex: Produit Électronique)
- **Rayon** (ex: Informatique)
- **Code produit** (code-barres ou référence)
- **Prix unitaire**
- **Quantité**
- **Sous-total** (prix × quantité)
- Design responsive avec affichage cartes mobiles-friendly

### 4️⃣ Résumé Financier
- **💵 Montant USD**: Valeur en dollars américains
- **🇨🇩 Montant FC**: Valeur en francs congolais (si applicable)
- **Taux de change**: FC/USD au moment de la transaction (si applicable)
- **Mode de paiement**: CASH, CARTE, CHÈQUE, TRANSFERT, etc.
- Affichage formaté avec séparateurs de milliers

### 5️⃣ Informations Supplémentaires
- **📅 Date et Heure**: Format `DD/MM/YYYY HH:MM:SS`
- **📊 Statut**: Complété, Annulé, Remboursé, En cours
- **👥 Client**: Nom du client (ou "Client anonyme")
- **📦 Quantité totale**: Nombre total d'articles
- **📝 Observations**: Notes ou remarques sur la vente

## 🚀 Utilisation

### Ouvrir le Modal des Détails

```javascript
// Depuis le bouton "Détails" dans la table d'historique
venteManager.showVenteDetails('ID_VENTE');

// Ou via la méthode viewDetails (appelée automatiquement)
venteManager.viewDetails('ID_VENTE');
```

### Flux d'Utilisation

1. **Cliquer sur le bouton 👁️** dans la colonne "Actions" du tableau d'historique
2. **Le modal s'ouvre** avec un spinner de chargement
3. **Les détails se chargent** depuis l'API `/api/ventes/:id`
4. **Les informations s'affichent** avec un design élégant
5. **Interagir** avec les boutons d'action (Imprimer, Annuler, Fermer)

## 🔌 API Utilisée

### Endpoint: `GET /api/ventes/:id`

**Response Example:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "dateVente": "2024-01-15T10:30:00Z",
  "montantUSD": 350.50,
  "montantFC": 650000,
  "taux": 1857,
  "modePaiement": "CASH",
  "client": "Monsieur Dupont",
  "statut": "COMPLÉTÉ",
  "observations": "Livraison demandée pour lundi",
  "articles": [
    {
      "_id": "...",
      "produit": {
        "_id": "...",
        "nom": "Laptop HP",
        "code": "LAP-001",
        "photo": "...",
        "type": { "nom": "Électronique" },
        "rayon": { "nom": "Informatique" }
      },
      "quantite": 2,
      "prixUnitaire": 175.25
    }
  ],
  "utilisateur": {
    "_id": "...",
    "nom": "Martin",
    "prenom": "Jean",
    "email": "jean.martin@company.com",
    "role": "VENDEUR",
    "photo": "..."
  },
  "magasin": {
    "_id": "...",
    "nom": "Magasin Centre",
    "adresse": "123 Rue Principale",
    "entreprise": "Groupe Commerce+"
  },
  "guichet": {
    "_id": "...",
    "nom": "Guichet 1",
    "code": "G001",
    "vendeur": "Jean Martin"
  }
}
```

## 🎨 Design et Styling

### Couleurs et Gradients

**Header:**
- Gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Couleur: Blanc sur dégradé

**Magasin Card:**
- Fond gris clair: `bg-light`

**Guichet Card:**
- Gradient orange: `linear-gradient(135deg, #f7931e 0%, #ff6b35 100%)`
- Couleur texte: Blanc

**Badges de Rôle:**
- Admin: `bg-danger`
- Superviseur: `bg-warning text-dark`
- Vendeur: `bg-info`
- Caissier: `bg-success`

**Badges de Statut:**
- Complété: `bg-success`
- En cours: `bg-warning text-dark`
- Annulé: `bg-danger`
- Remboursé: `bg-info`

### Responsive Design

- **Desktop**: Grilles complètes avec 2+ colonnes
- **Tablette**: Grilles adaptées 1-2 colonnes
- **Mobile**: Affichage empilé 1 colonne
- **Modal scrollable**: Pour contenu long sur petits écrans

## 🔔 Système d'Alertes

### Types d'Alertes

**Succès** (Vert):
- Vente annulée avec succès
- Impression lancée
- Action complétée

**Danger** (Rouge):
- Erreur lors du chargement
- Impossible d'annuler la vente
- Erreur API

**Info** (Bleu):
- Chargement en cours
- Information générale

**Warning** (Orange):
- Confirmation d'action

### Affichage des Alertes

```javascript
// Appel automatique du système d'alertes
this.showAlert('Message', 'success|danger|warning|info');

// Utilise ThemeManager si disponible, sinon crée un toast Bootstrap
// Toast apparaît en bas-droit avec auto-fermeture après 4 secondes
```

## 🖨️ Impression

### Fonctionnalité

Bouton "Imprimer" génère un document imprimable contenant:
- En-tête "REÇU DE VENTE"
- Numéro, date, heure de la vente
- Informations vendeur
- Magasin et guichet
- Table des articles avec détails
- Montant total
- Footer de remerciement

### Impression Rapide

```javascript
venteManager.printVente(venteObject);
```

## ❌ Annulation de Vente

### Processus

1. Cliquer sur bouton "Annuler"
2. Confirmation par dialog
3. Appel API DELETE `/api/ventes/:id`
4. Affichage message de succès
5. Fermeture du modal
6. Rechargement de l'historique

### Code

```javascript
venteManager.confirmAnnulerVente(vente);
```

## 🔄 Flux de Chargement

```
Clic sur bouton détails
        ↓
showVenteDetails(venteId) appelée
        ↓
Modal s'ouvre avec spinner
        ↓
Fetch API /api/ventes/:id
        ↓
populateVenteDetails() remplit les champs
        ↓
displayVenteArticles() affiche articles
        ↓
Spinner disparaît, contenu visible
        ↓
attachVenteDetailsEvents() connecte boutons
```

## 📱 Comportement Mobile

- Modal fullscreen sur mobile (`modal-fullscreen-sm-down`)
- Scrollable pour long content
- Boutons adaptés au tactile
- Images responsive
- Texte lisible sur petits écrans

## 🛡️ Gestion des Erreurs

### Cas d'Erreur Gérés

1. **Vente non trouvée** (404)
   - Message: "Vente non trouvée"
   - Alerte danger
   - Fermeture du modal

2. **Erreur réseau** (Network Error)
   - Message: "Erreur de connexion"
   - Alerte danger
   - Spinner caché, erreur affichée

3. **Données incomplètes**
   - Affichage "-" pour données manquantes
   - Pas de blocage de l'interface
   - Alerte warning

4. **Erreur API générale**
   - Message descriptif du statut HTTP
   - Alerte danger

## 🔐 Authentification

- Toutes les requêtes inclus le JWT token
- En-tête: `Authorization: Bearer TOKEN`
- Gestion automatique du token via `authHeaders()`

## 📊 Statistiques et Suivi

Le modal capture et log:
- Affichage du modal
- Chargement des détails
- Actions utilisateur (print, cancel)
- Erreurs et exceptions

## 🎯 Cas d'Usage Principaux

### 1. Vérification Rapide
Consulter rapidement les détails d'une vente sans la modifier

### 2. Audit et Conformité
Examiner les détails complets d'une transaction pour audit

### 3. Service Client
Fournir des informations précises au client (Imprimer le reçu)

### 4. Gestion des Retours
Vérifier les articles et montants avant traitement de retour/échange

### 5. Investigation d'Erreur
Examiner les détails en cas de problème ou discordance

## 🔧 Intégration avec le Système

### Dépendances

- Bootstrap 5
- FontAwesome (icônes)
- VenteManager (classe principale)
- API Backend (endpoints ventes)

### Événements Liés

- `showVenteDetails(id)` → Ouverture modal
- `populateVenteDetails(data)` → Remplissage données
- `attachVenteDetailsEvents(data)` → Connexion événements
- `printVente(data)` → Impression
- `annulerVente(id)` → Annulation
- `showAlert(msg, type)` → Notification

## 📝 Exemples de Code

### Ouvrir le modal programmatiquement

```javascript
// Avec ID de vente
venteManager.showVenteDetails('507f1f77bcf86cd799439011');

// Avec événement
document.getElementById('btnViewDetails').addEventListener('click', () => {
    const venteId = 'VENTE_ID';
    venteManager.showVenteDetails(venteId);
});
```

### Ajouter des événements personnalisés

```javascript
// Après l'affichage des détails
const modal = document.getElementById('modalDetailsVente');
modal.addEventListener('shown.bs.modal', () => {
    console.log('Modal ouvert');
});

modal.addEventListener('hidden.bs.modal', () => {
    console.log('Modal fermé');
});
```

### Afficher une alerte personnalisée

```javascript
venteManager.showAlert('Vente préparée pour livraison', 'success');
venteManager.showAlert('Erreur lors du chargement', 'danger');
venteManager.showAlert('Modification en cours...', 'warning');
venteManager.showAlert('Pour votre information', 'info');
```

## 🚀 Performance

- Chargement asynchrone des données
- Spinner pendant le chargement
- Cache des données magasin/guichet
- Formatage efficace des montants
- Rendu optimisé des articles

## 🔄 Mise à Jour Future

Améliorations possibles:
- Édition en ligne des détails
- Export PDF directement
- Partage par email
- Historique des modifications
- Notes collaboratives

## 📞 Support

Pour toute question ou problème:
1. Vérifier les logs console
2. Vérifier la réponse API dans Network tab
3. Vérifier que le token JWT est valide
4. Vérifier les données MongoDB
