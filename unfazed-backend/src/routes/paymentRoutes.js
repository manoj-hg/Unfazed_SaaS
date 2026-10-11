const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);
router.post('/webhook', paymentController.handleWebhook);
router.get('/invoice/:id', paymentController.downloadInvoice);
router.get('/', authMiddleware, paymentController.getPayments);

module.exports = router;
