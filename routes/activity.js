const express = require('express');
const router = express.Router({ mergeParams: true });
const Activity = require('../models/activity');
const Business = require('../models/business');
const authenticateToken = require('../middlewares/authenticateToken');

// GET /api/business/:businessId/activities - list activities for a business
router.get('/', authenticateToken, async (req, res) => {
  const businessId = req.params.businessId;
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;
    const activities = await Activity.find({ businessId }).sort({ ts: -1 }).skip(skip).limit(limit).lean();
    return res.json({ activities });
  } catch (err) {
    console.error('activities.list.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/business/:businessId/activities - create activity for a business
router.post('/', authenticateToken, async (req, res) => {
  const businessId = req.params.businessId;
  try {
    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ message: 'Entreprise non trouvée' });

    const { title, description, icon, ts } = req.body;
    if (!title) return res.status(400).json({ message: 'title est requis' });

    const activity = new Activity({
      businessId,
      userId: req.user && req.user._id ? req.user._id : (req.user && req.user.id) || null,
      title: String(title).trim(),
      description: description ? String(description) : '',
      icon: icon ? String(icon) : 'fas fa-info-circle',
      ts: ts ? Number(ts) : Date.now()
    });

    await activity.save();

    // Also push a lightweight record into Business.activities for quick reference
    try {
      const summary = { title: activity.title, description: activity.description, icon: activity.icon, ts: activity.ts };
      await Business.findByIdAndUpdate(businessId, { $push: { activities: { $each: [summary], $position: 0 }, }, });
    } catch (e) {
      console.warn('Failed to push activity summary to Business.activities', e && e.message);
    }

    return res.status(201).json({ message: 'Activity created', activity });
  } catch (err) {
    console.error('activities.create.error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
