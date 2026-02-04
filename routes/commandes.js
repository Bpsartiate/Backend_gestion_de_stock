const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Commande = require('../models/commande');
const Produit = require('../models/produit');
const Reception = require('../models/reception');
const Magasin = require('../models/magasin');
const FournisseurRating = require('../models/fournisseurRating');

// ✅ GET /api/protected/commandes - Lister toutes les commandes d'un magasin
router.get('/commandes', authMiddleware, async (req, res) => {
  try {
    const { magasinId, statut, page = 1, limit = 20 } = req.query;

    if (!magasinId) {
      return res.status(400).json({ error: 'magasinId requis' });
    }

    // Filtres
    const filter = { magasinId };
    if (statut) filter.statut = statut;

    const total = await Commande.countDocuments(filter);
    const commandes = await Commande.find(filter)
      .populate('produitId', 'designation reference typeStockage')
      .populate('fournisseurId')
      .populate('createdBy', 'nom prenom email')
      .populate('receptionsIds')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ dateCommande: -1 });

    res.json({
      success: true,
      commandes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ GET /commandes error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET /api/protected/commandes/produit/:produitId - Charger commande par produit
router.get('/commandes/produit/:produitId', authMiddleware, async (req, res) => {
  try {
    const commande = await Commande.findOne({ produitId: req.params.produitId })
      .populate('produitId')
      .populate('magasinId')
      .populate('fournisseurId')
      .populate('createdBy', 'nom prenom email')
      .sort({ dateCommande: -1 }); // La plus récente d'abord

    if (!commande) {
      return res.status(404).json({ error: 'Aucune commande trouvée pour ce produit' });
    }

    res.json(commande);
  } catch (error) {
    console.error('❌ GET /commandes/produit/:produitId error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET /api/protected/commandes/:commandeId - Détails d'une commande
router.get('/commandes/:commandeId', authMiddleware, async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.commandeId)
      .populate('produitId')
      .populate('magasinId')
      .populate('fournisseurId')
      .populate('receptionsIds')
      .populate('createdBy', 'nom prenom email')
      .populate('updatedBy', 'nom prenom email');

    if (!commande) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json({
      success: true,
      commande
    });
  } catch (error) {
    console.error('❌ GET /commandes/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET /api/protected/commandes/produit/:produitId - Charger commande par produit
router.get('/commandes/produit/:produitId', authMiddleware, async (req, res) => {
  try {
    const commande = await Commande.findOne({ produitId: req.params.produitId })
      .populate('produitId')
      .populate('magasinId')
      .populate('fournisseurId')
      .populate('createdBy', 'nom prenom email')
      .sort({ dateCommande: -1 }); // La plus récente d'abord

    if (!commande) {
      return res.status(404).json({ error: 'Aucune commande trouvée pour ce produit' });
    }

    res.json(commande);
  } catch (error) {
    console.error('❌ GET /commandes/produit/:produitId error:', error);
    res.status(500).json({ error: error.message });
  }
});


// ✅ POST /api/protected/commandes - Créer une commande
router.post('/commandes', authMiddleware, async (req, res) => {
  try {
    const {
      produitId,
      magasinId,
      quantiteCommandee,
      prixUnitaire,
      fournisseur,
      fournisseurId,
      dateEcheance,
      notes,
      numeroCommande,
      delaiLivraisonPrevu,  // Nouveau: délai prévu en jours
      etatPrevu,             // Nouveau: état attendu
      remarques              // Nouveau: remarques fournisseur
    } = req.body;

    // Validation
    if (!produitId || !quantiteCommandee) {
      return res.status(400).json({ error: 'produitId et quantiteCommandee requis' });
    }

    // Vérifier que le produit existe
    const produit = await Produit.findById(produitId);
    if (!produit) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    // Si magasinId pas fourni, utiliser le magasin de l'utilisateur depuis la session
    const finalMagasinId = magasinId || req.user?.magasinId;
    if (!finalMagasinId) {
      return res.status(400).json({ error: 'magasinId requis' });
    }

    // Vérifier que le magasin existe
    const magasin = await Magasin.findById(finalMagasinId);
    if (!magasin) {
      return res.status(404).json({ error: 'Magasin non trouvé' });
    }

    // Créer la commande
    const newCommande = new Commande({
      produitId,
      magasinId: finalMagasinId,
      quantiteCommandee,
      prixUnitaire: prixUnitaire || 0,
      fournisseur: fournisseur || fournisseurId?.name || 'Non spécifié',
      fournisseurId,
      dateEcheance: dateEcheance || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours par défaut
      notes: notes || remarques || '',
      numeroCommande: numeroCommande || `CMD-${Date.now()}`,
      createdBy: req.user._id,
      statut: 'EN_ATTENTE',
      prixTotal: (prixUnitaire || 0) * quantiteCommandee,
      // Nouveaux champs pour prévisions
      delaiLivraisonPrevu: delaiLivraisonPrevu || 7,  // Par défaut 7 jours
      etatPrevu: etatPrevu || 'Neuf',
      remarques: remarques || ''
    });

    await newCommande.save();

    // Mettre à jour le produit avec le statut EN_COMMANDE
    await Produit.findByIdAndUpdate(
      produitId,
      { 
        etat: 'EN_COMMANDE',
        $push: { commandesIds: newCommande._id }
      },
      { new: true }
    );

    const commandePopulated = await newCommande
      .populate('produitId')
      .populate('magasinId')
      .populate('fournisseurId')
      .populate('createdBy', 'nom prenom email');

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      commande: commandePopulated
    });

  } catch (error) {
    console.error('❌ POST /commandes error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ PUT /api/protected/commandes/:commandeId - Mettre à jour une commande
router.put('/commandes/:commandeId', authMiddleware, async (req, res) => {
  try {
    const { statut, dateExpedition, dateReception, notes } = req.body;

    const commande = await Commande.findById(req.params.commandeId);
    if (!commande) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    // Mise à jour
    if (statut) commande.statut = statut;
    if (dateExpedition) commande.dateExpedition = dateExpedition;
    if (dateReception) commande.dateReception = dateReception;
    if (notes) commande.notes = notes;
    commande.updatedBy = req.user._id;

    await commande.save();

    res.json({
      success: true,
      message: 'Commande mise à jour',
      commande
    });

  } catch (error) {
    console.error('❌ PUT /commandes/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ POST /api/protected/commandes/:commandeId/recevoir - Faire la réception
router.post('/commandes/:commandeId/recevoir', authMiddleware, async (req, res) => {
  try {
    const { 
      quantiteRecue, 
      rayons, // [{rayonId, quantite}, ...]
      etatReel,  // État du produit reçu (Neuf, Bon état, Usagé, Endommagé)
      problemes, // Dommages, étiquettes incorrectes, etc.
      remarques
    } = req.body;

    if (!quantiteRecue || quantiteRecue <= 0) {
      return res.status(400).json({ error: 'Quantité reçue invalide' });
    }

    const commande = await Commande.findById(req.params.commandeId)
      .populate('produitId')
      .populate('magasinId');

    if (!commande) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    if (commande.statut === 'ANNULÉE' || commande.statut === 'RETOURNÉE') {
      return res.status(400).json({ error: 'Cannot receive cancelled/returned order' });
    }

    // Mettre à jour quantiteRecue
    commande.quantiteRecue += quantiteRecue;
    commande.updatedBy = req.user._id;

    // Déterminer le nouveau statut
    if (commande.quantiteRecue < commande.quantiteCommandee) {
      commande.statut = 'REÇUE_PARTIELLEMENT';
    } else if (commande.quantiteRecue >= commande.quantiteCommandee) {
      commande.statut = 'REÇUE_COMPLÈTEMENT';
    }

    await commande.save();

    // Créer une réception
    const reception = new Reception({
      produitId: commande.produitId._id,
      magasinId: commande.magasinId._id,
      quantite: quantiteRecue,
      prixAchat: commande.prixUnitaire,
      prixTotal: quantiteRecue * commande.prixUnitaire,
      fournisseur: commande.fournisseur,
      lotNumber: commande.lotNumber,
      dateReception: new Date(),
      statut: 'controle',
      statutReception: 'EN_ATTENTE'
    });

    // Si rayons fournis, ajouter distributions
    if (rayons && Array.isArray(rayons)) {
      reception.distributions = rayons.map(r => ({
        rayonId: r.rayonId,
        quantite: r.quantite,
        statut: 'EN_STOCK'
      }));
    }

    await reception.save();

    // Ajouter la réception à la commande
    commande.receptionsIds.push(reception._id);
    await commande.save();

    // Mettre à jour le produit
    const produit = await Produit.findByIdAndUpdate(
      commande.produitId._id,
      { 
        etat: 'STOCKÉ',
        $inc: { quantiteActuelle: quantiteRecue }
      },
      { new: true }
    );

    // 🆕 CRÉER LA NOTATION FOURNISSEUR (si état réel fourni)
    let fournisseurRating = null;
    if (etatReel) {
      // Calculer les différences
      const differenceQuantite = quantiteRecue - commande.quantiteCommandee;
      const delaiReel = Math.floor(
        (new Date() - new Date(commande.dateCommande)) / (1000 * 60 * 60 * 24)
      );
      const differenceDelai = delaiReel - (commande.delaiLivraisonPrevu || 7);

      // Calculer le score du fournisseur
      const niveauEtat = {
        'Neuf': 4,
        'Bon état': 3,
        'Usagé': 2,
        'Endommagé': 1
      };

      const niveauPrevu = niveauEtat[commande.etatPrevu || 'Neuf'] || 3;
      const niveauReel = niveauEtat[etatReel] || 3;

      // SCORING (total 100 points)
      let scoreQuantite = 30;
      let scoreDelai = 25;
      let scoreQualite = 25;
      let scoreConformite = 20;

      // 📊 Score Quantité
      if (commande.quantiteCommandee > 0) {
        const tauxConformite = (quantiteRecue / commande.quantiteCommandee) * 100;
        const ecart = Math.abs(100 - tauxConformite);
        scoreQuantite = Math.max(0, 30 - Math.floor(ecart * 0.3));
      }

      // 📊 Score Délai
      scoreDelai = Math.max(0, 25 - delaiReel * 1.5);

      // 📊 Score Qualité
      if (niveauReel < niveauPrevu) {
        const differenceNiveau = niveauPrevu - niveauReel;
        scoreQualite = Math.max(0, 25 - (differenceNiveau * 8));
      }

      // 📊 Score Conformité
      const scoreProblemes = Math.max(0, 20 - ((problemes?.length || 0) * 5));
      scoreConformite = scoreProblemes;

      // 🎯 Score final
      const scoreFinal = scoreQuantite + scoreDelai + scoreQualite + scoreConformite;

      // 🏆 Évaluation
      let evaluation = 'Mauvais';
      if (scoreFinal >= 90) evaluation = 'Excellent';
      else if (scoreFinal >= 75) evaluation = 'Bon';
      else if (scoreFinal >= 60) evaluation = 'Acceptable';
      else if (scoreFinal >= 40) evaluation = 'Médiocre';

      // 💡 Recommandation
      let recommandation = 'Continuer';
      if (scoreFinal < 20) recommandation = 'Arrêter';
      else if (scoreFinal < 40) recommandation = 'Réduire';
      else if (scoreFinal < 60) recommandation = 'Améliorer';
      else if (scoreFinal < 80) recommandation = 'Surveiller';

      fournisseurRating = new FournisseurRating({
        commandeId: commande._id,
        receptionId: reception._id,
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
        
        scoreQuantite,
        scoreDelai,
        scoreQualite,
        scoreConformite,
        scoreFinal: Math.round(scoreFinal),
        evaluation,
        recommandation,
        
        remarques,
        problemes: problemes || [],
        
        dateCommande: commande.dateCommande,
        dateEcheancePrevu: commande.dateEcheance,
        dateReceptionReelle: new Date(),
        
        createdBy: req.user._id
      });

      await fournisseurRating.save();
    }

    res.status(201).json({
      success: true,
      message: 'Réception enregistrée avec succès',
      commande,
      reception,
      produit,
      fournisseurRating
    });

  } catch (error) {
    console.error('❌ POST /commandes/:id/recevoir error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ DELETE /api/protected/commandes/:commandeId - Annuler une commande
router.delete('/commandes/:commandeId', authMiddleware, async (req, res) => {
  try {
    const commande = await Commande.findByIdAndUpdate(
      req.params.commandeId,
      { 
        statut: 'ANNULÉE',
        updatedBy: req.user._id
      },
      { new: true }
    );

    if (!commande) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    // Si aucune réception n'a eu lieu, réinitialiser l'état du produit
    if (commande.receptionsIds.length === 0) {
      await Produit.findByIdAndUpdate(
        commande.produitId,
        { etat: 'STOCKÉ' },
        { new: true }
      );
    }

    res.json({
      success: true,
      message: 'Commande annulée',
      commande
    });

  } catch (error) {
    console.error('❌ DELETE /commandes/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ POST /api/protected/commandes/:commandeId/marquer-expediee
router.post('/commandes/:commandeId/marquer-expediee', authMiddleware, async (req, res) => {
  try {
    const commande = await Commande.findByIdAndUpdate(
      req.params.commandeId,
      { 
        statut: 'EXPEDIÉE',
        dateExpedition: new Date(),
        updatedBy: req.user._id
      },
      { new: true }
    );

    if (!commande) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json({
      success: true,
      message: 'Commande marquée comme expédiée',
      commande
    });

  } catch (error) {
    console.error('❌ POST /commandes/:id/marquer-expediee error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
