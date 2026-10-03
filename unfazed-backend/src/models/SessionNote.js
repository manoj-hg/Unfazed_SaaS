const mongoose = require('mongoose');

const sessionNoteSchema = new mongoose.Schema({
  therapist_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  content: { type: String, required: true },
  type: { type: String, enum: ['private', 'shared'], default: 'private' }
}, { timestamps: true });

module.exports = mongoose.model('SessionNote', sessionNoteSchema);
