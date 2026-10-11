const mongoose = require('mongoose');

const subscriptionTierSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  display_name: { type: String, required: true },
  price_monthly: { type: Number, default: 0 },
  price_yearly: { type: Number, default: 0 },
  description: { type: String, default: '' },
  caps: {
    max_active_clients: { type: Number, default: 5 },
    max_packages: { type: Number, default: 1 }
  },
  features: {
    can_use_shared_notes: { type: Boolean, default: false },
    can_view_advanced_analytics: { type: Boolean, default: false },
    can_use_soap_templates: { type: Boolean, default: false },
    can_sell_packages: { type: Boolean, default: false },
    can_export_invoices: { type: Boolean, default: false },
    can_use_custom_branding: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionTierConfig', subscriptionTierSchema);
