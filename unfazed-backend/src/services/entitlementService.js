const Therapist = require('../models/Therapist');
const SubscriptionTierConfig = require('../models/SubscriptionTierConfig');
const Client = require('../models/Client');

/**
 * Centralized Entitlement Service
 * Single source of truth for feature access and tier gating.
 */
exports.canAccess = async (therapistId, featureKey, context = {}) => {
  const therapist = await Therapist.findById(therapistId);
  if (!therapist) {
    return { allowed: false, reason: 'Therapist not found', tier: 'free' };
  }

  const tierName = therapist.subscription_tier || 'free';
  let tier = await SubscriptionTierConfig.findOne({ name: tierName });

  if (!tier) {
    // Default fallback if DB config not initialized
    tier = {
      name: tierName,
      caps: { max_active_clients: tierName === 'pro' ? 25 : tierName === 'enterprise' ? 99999 : 5 },
      features: {
        can_use_shared_notes: tierName !== 'free',
        can_view_advanced_analytics: tierName !== 'free',
        can_use_soap_templates: tierName !== 'free',
        can_sell_packages: tierName !== 'free',
        can_export_invoices: true,
        can_use_custom_branding: tierName === 'enterprise'
      }
    };
  }

  if (featureKey === 'max_active_clients') {
    const clientCount = await Client.countDocuments({ therapist_id: therapistId, status: 'active' });
    const cap = tier.caps?.max_active_clients || 5;
    const allowed = clientCount < cap;
    return {
      allowed,
      reason: allowed ? 'Access granted' : `Active client cap (${cap}) reached for ${tierName.toUpperCase()} tier. Please upgrade.`,
      tier: tierName,
      current: clientCount,
      cap
    };
  }

  const isFeatureAllowed = !!(tier.features && tier.features[featureKey]);
  return {
    allowed: isFeatureAllowed,
    reason: isFeatureAllowed ? 'Access granted' : `Feature '${featureKey}' is locked in ${tierName.toUpperCase()} tier. Upgrade to unlock.`,
    tier: tierName,
    featureKey
  };
};

/**
 * Get all entitlements and limits for a therapist
 */
exports.getTherapistEntitlements = async (therapistId) => {
  const therapist = await Therapist.findById(therapistId);
  if (!therapist) return null;

  const tierName = therapist.subscription_tier || 'free';
  let tier = await SubscriptionTierConfig.findOne({ name: tierName });

  if (!tier) {
    tier = {
      name: tierName,
      display_name: tierName === 'pro' ? 'Professional' : tierName === 'enterprise' ? 'Enterprise' : 'Starter Free',
      caps: { max_active_clients: tierName === 'pro' ? 25 : tierName === 'enterprise' ? 99999 : 5 },
      features: {
        can_use_shared_notes: tierName !== 'free',
        can_view_advanced_analytics: tierName !== 'free',
        can_use_soap_templates: tierName !== 'free',
        can_sell_packages: tierName !== 'free',
        can_export_invoices: true,
        can_use_custom_branding: tierName === 'enterprise'
      }
    };
  }

  const activeClients = await Client.countDocuments({ therapist_id: therapistId, status: 'active' });

  return {
    tier: tierName,
    display_name: tier.display_name || tierName.toUpperCase(),
    caps: tier.caps,
    features: tier.features,
    usage: {
      active_clients: activeClients,
      max_active_clients: tier.caps?.max_active_clients || 5
    }
  };
};
