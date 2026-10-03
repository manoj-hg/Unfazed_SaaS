const SessionNote = require('../models/SessionNote');

exports.createNote = async (req, res) => {
  try {
    const { client_id, session_id, content, type } = req.body;
    const note = new SessionNote({
      therapist_id: req.user.id,
      client_id,
      session_id,
      content,
      type
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getNotesForClient = async (req, res) => {
  try {
    const { client_id } = req.params;
    const notes = await SessionNote.find({ therapist_id: req.user.id, client_id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getSharedNotes = async (req, res) => {
  try {
    const { client_id } = req.params;
    const notes = await SessionNote.find({ client_id, type: 'shared' }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
