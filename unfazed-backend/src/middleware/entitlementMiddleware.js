const entitlementService = require('../services/entitlementService');

const requireFeature = (featureKey) => {
  return async (req, res, next) => {
    try {
      const hasAccess = await entitlementService.canAccess(req.user.id, featureKey);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Upgrade your subscription to access this feature.' });
      }
      next();
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  };
};

module.exports = { requireFeature };
