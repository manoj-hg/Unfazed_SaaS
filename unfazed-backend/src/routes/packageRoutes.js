const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, packageController.getPackages);
router.post('/', authMiddleware, packageController.createPackage);
router.delete('/:id', authMiddleware, packageController.deletePackage);
router.get('/clients', authMiddleware, packageController.getClientPackages);

module.exports = router;
