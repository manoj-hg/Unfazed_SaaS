const mongoose = require('mongoose');

const subscriptionTierSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  caps: {
    max_active_clients: { type: Number, default: 10 },
  },
  features: {
    can_use_shared_notes: { type: Boolean, default: false },
    can_view_advanced_analytics: { type: Boolean, default: false }
  }
});

module.exports = mongoose.model('SubscriptionTierConfig', subscriptionTierSchema);
