const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
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
    type: String,
    default: ''
  },
  service_interested: {
    type: String,
    default: 'Individual Therapy'
  },
  preferred_time: {
    type: String,
    default: 'Evening'
  },
  status: {
    type: String,
    enum: ['new', 'waitlist', 'contacted', 'converted'],
    default: 'new'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
