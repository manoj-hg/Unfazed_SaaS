const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  therapist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true
  },
  client_name: {
    type: String,
    required: true
  },
  client_email: {
    type: String,
    required: true
  },
  start_time: {
    type: Date,
    required: true
  },
  end_time: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['booked', 'cancelled', 'completed'],
    default: 'booked'
  }
}, { timestamps: true });

// Prevent double booking at the database level for exact same start time
sessionSchema.index({ therapist_id: 1, start_time: 1 }, { unique: true });

module.exports = mongoose.model('Session', sessionSchema);
