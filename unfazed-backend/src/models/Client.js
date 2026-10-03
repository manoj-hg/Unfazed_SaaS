const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  therapist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'lead'],
    default: 'active'
  },
  tags: [{
    type: String
  }],
  intake_form: {
    type: mongoose.Schema.Types.Mixed, // flexible JSON for form responses
    default: {}
  },
  consent_signed_at: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
