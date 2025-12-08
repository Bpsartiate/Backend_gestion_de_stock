const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
  title: { type: String, required: true },
  description: { type: String },
  icon: { type: String, default: 'fas fa-info-circle' },
  ts: { type: Number, default: () => Date.now() }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
