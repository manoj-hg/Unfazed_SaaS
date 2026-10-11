const mongoose = require('mongoose');

const sessionNoteSchema = new mongoose.Schema({
  therapist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true
  },
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  title: {
    type: String,
    default: 'Clinical Note'
  },
  type: {
    type: String,
    enum: ['private', 'shared'],
    default: 'private',
    required: true
  },
  format: {
    type: String,
    enum: ['freeform', 'soap', 'dap'],
    default: 'freeform'
  },
  content: {
    type: String,
    required: true
  },
  soap_data: {
    subjective: { type: String, default: '' },
    objective: { type: String, default: '' },
    assessment: { type: String, default: '' },
    plan: { type: String, default: '' }
  },
  dap_data: {
    data: { type: String, default: '' },
    assessment: { type: String, default: '' },
    plan: { type: String, default: '' }
  },
  tags: [{
    type: String
  }]
}, { timestamps: true });

// Ensure compound index for fast queries
sessionNoteSchema.index({ therapist_id: 1, client_id: 1, type: 1 });

module.exports = mongoose.model('SessionNote', sessionNoteSchema);
