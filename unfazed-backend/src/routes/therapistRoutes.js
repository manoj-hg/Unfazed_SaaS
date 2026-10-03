const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapistController');
const authMiddleware = require('../middleware/authMiddleware');

router.put('/profile', authMiddleware, therapistController.updateProfile);
router.get('/:slug', therapistController.getPublicProfileBySlug);

module.exports = router;
