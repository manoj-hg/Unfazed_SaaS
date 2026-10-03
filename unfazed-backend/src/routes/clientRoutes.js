const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, clientController.getClients);
router.get('/:id', authMiddleware, clientController.getClientById);
router.put('/:id', authMiddleware, clientController.updateClient);
router.post('/:id/intake', authMiddleware, clientController.submitIntake);

module.exports = router;
