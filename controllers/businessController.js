const Business = require('../models/business');

exports.creerBusiness = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const existing = await Business.findOne({ ownerId });
    if (existing) return res.status(400).json({ message: 'Business déjà enregistré' });

    const newBusiness = new Business({
      ownerId,
      nomEntreprise: req.body.nomEntreprise,
      logoUrl: req.body.logoUrl,
      description: req.body.description,
      adresse: req.body.adresse,
      telephone: req.body.telephone,
      email: req.body.email,
      typeBusiness: req.body.typeBusiness
    });
    await newBusiness.save();
    res.status(201).json({ message: 'Business créé', business: newBusiness });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
