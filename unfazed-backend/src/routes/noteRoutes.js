const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, noteController.createNote);
router.get('/client/:client_id', authMiddleware, noteController.getNotesForClient);
router.delete('/:id', authMiddleware, noteController.deleteNote);

// Public/Client portal shared notes endpoint (Private notes NEVER exposed)
router.get('/shared/:slug/:clientEmail', noteController.getSharedNotes);

module.exports = router;
