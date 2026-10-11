const entitlementService = require('../services/entitlementService');

const requireFeature = (featureKey) => {
  return async (req, res, next) => {
    try {
      const therapistId = req.user.id || req.user._id;
      const result = await entitlementService.canAccess(therapistId, featureKey);
      
      if (!result.allowed) {
        return res.status(403).json({
          success: false,
          code: 'ENTITLEMENT_LOCKED',
          feature: featureKey,
          message: result.reason,
          tier: result.tier,
          cap: result.cap,
          current: result.current
        });
      }
      next();
    } catch (err) {
      console.error('Entitlement check error:', err);
      res.status(500).json({ message: 'Error checking subscription permissions' });
    }
  };
};

module.exports = { requireFeature };
