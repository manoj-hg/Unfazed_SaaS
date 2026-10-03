const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  bio: {
    type: String,
    default: '',
  },
  specializations: [{
    type: String,
  }],
  languages: [{
    type: String,
  }],
  subscription_tier: {
    type: String,
    default: 'free'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Therapist', therapistSchema);
