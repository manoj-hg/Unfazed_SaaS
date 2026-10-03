const express = require('express');
const router = express.Router();
const schedulingController = require('../controllers/schedulingController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/availability', authMiddleware, schedulingController.setAvailability);
router.get('/availability', authMiddleware, schedulingController.getAvailability);

router.get('/:slug/slots', schedulingController.getSlots);
router.post('/:slug/book', schedulingController.bookSlot);

module.exports = router;
