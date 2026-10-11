const express = require('express');
const router = express.Router();
const schedulingController = require('../controllers/schedulingController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/availability', authMiddleware, schedulingController.setAvailability);
router.get('/availability', authMiddleware, schedulingController.getAvailability);
router.get('/sessions', authMiddleware, schedulingController.getTherapistSessions);
router.put('/sessions/:id/cancel', authMiddleware, schedulingController.cancelSession);

router.get('/:slug/slots', schedulingController.getSlots);
router.post('/:slug/book', schedulingController.bookSlot);
router.post('/:slug/waitlist', schedulingController.joinWaitlist);

module.exports = router;
