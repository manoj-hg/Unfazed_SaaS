const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  therapist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  session_count: {
    type: Number,
    required: true,
    enum: [3, 6, 12]
  },
  price: {
    type: Number,
    required: true
  },
  discount_percentage: {
    type: Number,
    default: 10
  },
  description: {
    type: String,
    default: ''
  },
  validity_days: {
    type: Number,
    default: 90
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
