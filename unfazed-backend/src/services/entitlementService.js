const Therapist = require('../models/Therapist');
const SubscriptionTierConfig = require('../models/SubscriptionTierConfig');
const Client = require('../models/Client');

exports.canAccess = async (therapistId, featureKey) => {
  const therapist = await Therapist.findById(therapistId);
  if (!therapist) return false;

  let tier = await SubscriptionTierConfig.findOne({ name: therapist.subscription_tier });
  if (!tier) {
    tier = {
      caps: { max_active_clients: 5 },
      features: { can_use_shared_notes: false, can_view_advanced_analytics: false }
    };
  }

  if (featureKey === 'max_active_clients') {
    const clientCount = await Client.countDocuments({ therapist_id: therapistId, status: 'active' });
    return clientCount < tier.caps.max_active_clients;
  }

  return !!tier.features[featureKey];
};
