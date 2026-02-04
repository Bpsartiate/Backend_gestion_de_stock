const mongoose = require('mongoose');

const fournisseurRatingSchema = new mongoose.Schema(
  {
    // Références
    commandeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commande',
      required: true
    },
    receptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reception'
    },
    produitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true
    },
    magasinId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Magasin',
      required: true
    },
    fournisseur: {
      type: String,
      required: true,
      maxlength: 200
    },

    // 📊 COMPARAISON PRÉVU vs RÉEL
    
    // Quantité
    quantitePrevue: {
      type: Number,
      required: true
    },
    quantiteRecue: {
      type: Number,
      required: true
    },
    differenceQuantite: {
      type: Number,
      default: 0
      // = quantiteRecue - quantitePrevue (négatif = manquant)
    },

    // Délai de livraison
    delaiPrevu: {
      type: Number, // en jours
      required: true
    },
    delaiReel: {
      type: Number, // en jours
      default: 0
    },
    differenceDelai: {
      type: Number,
      default: 0
      // = delaiReel - delaiPrevu (négatif = en avance, bon!)
    },

    // État du produit
    etatPrevu: {
      type: String,
      enum: ['Neuf', 'Bon état', 'Usagé', 'Endommagé'],
      required: true
    },
    etatReel: {
      type: String,
      enum: ['Neuf', 'Bon état', 'Usagé', 'Endommagé'],
      required: true
    },
    etatConforme: {
      type: Boolean,
      default: false
      // true si etatReel >= etatPrevu
    },

    // 🎯 SCORING

    // Score quantité (0-30 points)
    scoreQuantite: {
      type: Number,
      default: 30,
      min: 0,
      max: 30
      // 30 = quantité exacte
      // -1 point par % d'écart
    },

    // Score délai (0-25 points)
    scoreDelai: {
      type: Number,
      default: 25,
      min: 0,
      max: 25
      // 25 = délai respecté ou mieux
      // -1 point par jour de retard
    },

    // Score qualité état (0-25 points)
    scoreQualite: {
      type: Number,
      default: 25,
      min: 0,
      max: 25
      // 25 = état conforme ou mieux
      // -5 points par palier inférieur
    },

    // Score conformité globale (0-20 points)
    scoreConformite: {
      type: Number,
      default: 20,
      min: 0,
      max: 20
      // 20 = pas de remarques
      // -5 points par problème (manquants, dégâts, etc.)
    },

    // ⭐ SCORE FINAL (0-100)
    scoreFinal: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
      // = scoreQuantite + scoreDelai + scoreQualite + scoreConformite
    },

    // Évaluation texte
    evaluation: {
      type: String,
      enum: ['Excellent', 'Bon', 'Acceptable', 'Médiocre', 'Mauvais'],
      default: 'Bon'
      // Excellent: 90-100
      // Bon: 75-89
      // Acceptable: 60-74
      // Médiocre: 40-59
      // Mauvais: 0-39
    },

    // Notes et remarques
    remarques: String,
    problemes: [
      {
        type: String,
        enum: [
          'Quantité insuffisante',
          'Quantité excédentaire',
          'Délai non respecté',
          'État dégradé',
          'Produits cassés',
          'Emballage endommagé',
          'Etiquetage incorrect',
          'Autres'
        ]
      }
    ],

    // Recommandations
    recommandation: {
      type: String,
      enum: ['Continuer', 'Surveiller', 'Améliorer', 'Réduire', 'Arrêter'],
      default: 'Continuer'
      // Continuer: score >= 80
      // Surveiller: 60-79
      // Améliorer: 40-59
      // Réduire: 20-39
      // Arrêter: < 20
    },

    // Dates
    dateCommande: Date,
    dateEcheancePrevu: Date,
    dateReceptionReelle: Date,

    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'fournisseur_ratings'
  }
);

// Index pour recherche par fournisseur
fournisseurRatingSchema.index({ fournisseur: 1, magasinId: 1 });
fournisseurRatingSchema.index({ scoreFinal: -1 });
fournisseurRatingSchema.index({ createdAt: -1 });

// Virtual pour statistiques fournisseur
fournisseurRatingSchema.virtual('historique').get(function () {
  return {
    score: this.scoreFinal,
    evaluation: this.evaluation,
    date: this.createdAt
  };
});

module.exports = mongoose.model('FournisseurRating', fournisseurRatingSchema);
