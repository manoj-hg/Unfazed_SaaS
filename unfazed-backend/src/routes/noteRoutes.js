const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, noteController.createNote);
router.get('/client/:client_id', authMiddleware, noteController.getNotesForClient);
router.get('/shared/:client_id', noteController.getSharedNotes);

module.exports = router;
