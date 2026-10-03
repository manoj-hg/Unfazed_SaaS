const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireFeature } = require('../middleware/entitlementMiddleware');

// Note: Gating this behind the tier!
router.get('/', authMiddleware, requireFeature('can_view_advanced_analytics'), analyticsController.getDashboardStats);

module.exports = router;
