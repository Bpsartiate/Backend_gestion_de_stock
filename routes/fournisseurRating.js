const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const FournisseurRating = require('../models/fournisseurRating');
const Commande = require('../models/commande');
const Produit = require('../models/produit');

/**
 * 🆕 Calculer le score du fournisseur
 */
function calculerScoreFournisseur(data) {
  const {
    quantitePrevue,
    quantiteRecue,
    delaiPrevu,
    delaiReel,
    etatPrevu,
    etatReel,
    problemes = []
  } = data;

  let scoreQuantite = 30;
  let scoreDelai = 25;
  let scoreQualite = 25;
  let scoreConformite = 20;

  // 📊 SCORE QUANTITÉ (0-30)
  if (quantitePrevue > 0) {
    const tauxConformite = (quantiteRecue / quantitePrevue) * 100;
    const ecart = Math.abs(100 - tauxConformite);
    scoreQuantite = Math.max(0, 30 - Math.floor(ecart * 0.3)); // -1 pt par 3% d'écart
  }

  // 📊 SCORE DÉLAI (0-25)
  const retardJours = Math.max(0, delaiReel - delaiPrevu);
  scoreDelai = Math.max(0, 25 - retardJours * 1.5); // -1.5 pt par jour de retard

  // 📊 SCORE QUALITÉ (0-25)
  const niveauEtat = {
    'Neuf': 4,
    'Bon état': 3,
    'Usagé': 2,
    'Endommagé': 1
  };
  
  const niveauPrevu = niveauEtat[etatPrevu] || 3;
  const niveauReel = niveauEtat[etatReel] || 3;
  
  if (niveauReel < niveauPrevu) {
    const differenceNiveau = niveauPrevu - niveauReel;
    scoreQualite = Math.max(0, 25 - (differenceNiveau * 8));
  }

  // 📊 SCORE CONFORMITÉ (0-20)
  const scoreProblemes = Math.max(0, 20 - (problemes.length * 5));
  scoreConformite = scoreProblemes;

  // 🎯 SCORE FINAL
  const scoreFinal = scoreQuantite + scoreDelai + scoreQualite + scoreConformite;

  // 🏆 ÉVALUATION
  let evaluation = 'Mauvais';
  if (scoreFinal >= 90) evaluation = 'Excellent';
  else if (scoreFinal >= 75) evaluation = 'Bon';
  else if (scoreFinal >= 60) evaluation = 'Acceptable';
  else if (scoreFinal >= 40) evaluation = 'Médiocre';

  // 💡 RECOMMANDATION
  let recommandation = 'Continuer';
  if (scoreFinal < 20) recommandation = 'Arrêter';
  else if (scoreFinal < 40) recommandation = 'Réduire';
  else if (scoreFinal < 60) recommandation = 'Améliorer';
  else if (scoreFinal < 80) recommandation = 'Surveiller';

  return {
    scoreQuantite,
    scoreDelai,
    scoreQualite,
    scoreConformite,
    scoreFinal: Math.round(scoreFinal),
    evaluation,
    recommandation
  };
}

// ✅ POST /api/protected/fournisseur-rating - Créer une notation
router.post('/fournisseur-rating', authMiddleware, async (req, res) => {
  try {
    const {
      commandeId,
      receptionId,
      quantiteRecue,
      etatReel,
      dateReceptionReelle,
      remarques,
      problemes
    } = req.body;

    // Récupérer la commande
    const commande = await Commande.findById(commandeId)
      .populate('produitId')
      .populate('magasinId');

    if (!commande) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    // Calculer les différences
    const differenceQuantite = quantiteRecue - commande.quantiteCommandee;
    const delaiReel = Math.floor(
      (new Date(dateReceptionReelle) - new Date(commande.dateCommande)) / (1000 * 60 * 60 * 24)
    );
    const differenceDelai = delaiReel - (commande.delaiLivraisonPrevu || 7);

    // Créer la notation
    const scores = calculerScoreFournisseur({
      quantitePrevue: commande.quantiteCommandee,
      quantiteRecue,
      delaiPrevu: commande.delaiLivraisonPrevu || 7,
      delaiReel,
      etatPrevu: commande.etatPrevu || 'Neuf',
      etatReel,
      problemes: problemes || []
    });

    const rating = new FournisseurRating({
      commandeId,
      receptionId,
      produitId: commande.produitId._id,
      magasinId: commande.magasinId._id,
      fournisseur: commande.fournisseur,
      
      quantitePrevue: commande.quantiteCommandee,
      quantiteRecue,
      differenceQuantite,
      
      delaiPrevu: commande.delaiLivraisonPrevu || 7,
      delaiReel,
      differenceDelai,
      
      etatPrevu: commande.etatPrevu || 'Neuf',
      etatReel,
      etatConforme: etatReel === (commande.etatPrevu || 'Neuf'),
      
      ...scores,
      
      remarques,
      problemes: problemes || [],
      
      dateCommande: commande.dateCommande,
      dateEcheancePrevu: commande.dateEcheance,
      dateReceptionReelle,
      
      createdBy: req.user._id
    });

    await rating.save();

    res.status(201).json({
      success: true,
      message: 'Notation fournisseur créée',
      rating
    });

  } catch (error) {
    console.error('❌ POST /fournisseur-rating error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET /api/protected/fournisseur-stats - Stats globales fournisseur
router.get('/fournisseur-stats', authMiddleware, async (req, res) => {
  try {
    const { magasinId, fournisseur } = req.query;

    if (!magasinId) {
      return res.status(400).json({ error: 'magasinId requis' });
    }

    const filter = { magasinId };
    if (fournisseur) filter.fournisseur = fournisseur;

    // Statistiques
    const ratings = await FournisseurRating.find(filter);
    
    if (ratings.length === 0) {
      return res.json({
        success: true,
        stats: null,
        message: 'Aucune notation trouvée'
      });
    }

    // Calculer moyennes
    const totalScore = ratings.reduce((sum, r) => sum + r.scoreFinal, 0);
    const moyenneScore = (totalScore / ratings.length).toFixed(2);
    
    const scoreMoyen = {
      quantite: (ratings.reduce((sum, r) => sum + r.scoreQuantite, 0) / ratings.length).toFixed(1),
      delai: (ratings.reduce((sum, r) => sum + r.scoreDelai, 0) / ratings.length).toFixed(1),
      qualite: (ratings.reduce((sum, r) => sum + r.scoreQualite, 0) / ratings.length).toFixed(1),
      conformite: (ratings.reduce((sum, r) => sum + r.scoreConformite, 0) / ratings.length).toFixed(1)
    };

    // Comptages
    const evaluations = {};
    const recommandations = {};
    
    ratings.forEach(r => {
      evaluations[r.evaluation] = (evaluations[r.evaluation] || 0) + 1;
      recommandations[r.recommandation] = (recommandations[r.recommandation] || 0) + 1;
    });

    res.json({
      success: true,
      stats: {
        totalEvaluations: ratings.length,
        scoreMoyen: moyenneScore,
        scoreMoyenParCategorie: scoreMoyen,
        evaluations,
        recommandations,
        derniereEvaluation: ratings[ratings.length - 1]?.createdAt
      },
      ratings
    });

  } catch (error) {
    console.error('❌ GET /fournisseur-stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET /api/protected/fournisseur-ranking - Classement des fournisseurs
router.get('/fournisseur-ranking', authMiddleware, async (req, res) => {
  try {
    const { magasinId } = req.query;

    if (!magasinId) {
      return res.status(400).json({ error: 'magasinId requis' });
    }

    // Group by fournisseur et calculer moyennes
    const ranking = await FournisseurRating.aggregate([
      { $match: { magasinId: require('mongoose').Types.ObjectId(magasinId) } },
      {
        $group: {
          _id: '$fournisseur',
          scoreMoyen: { $avg: '$scoreFinal' },
          totalEvaluations: { $sum: 1 },
          derniereEvaluation: { $max: '$createdAt' },
          recommendationPrincipal: { $first: '$recommandation' }
        }
      },
      { $sort: { scoreMoyen: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      success: true,
      ranking
    });

  } catch (error) {
    console.error('❌ GET /fournisseur-ranking error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET /api/protected/fournisseur-rating/:ratingId - Détails
router.get('/fournisseur-rating/:ratingId', authMiddleware, async (req, res) => {
  try {
    const rating = await FournisseurRating.findById(req.params.ratingId)
      .populate('commandeId')
      .populate('produitId')
      .populate('createdBy', 'nom prenom email');

    if (!rating) {
      return res.status(404).json({ error: 'Rating non trouvé' });
    }

    res.json({
      success: true,
      rating
    });

  } catch (error) {
    console.error('❌ GET /fournisseur-rating/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
