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
    required: false,
  },
  google_id: {
    type: String,
    sparse: true,
  },
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
    default: 'Licensed Clinical Psychologist',
  },
  bio: {
    type: String,
    default: '',
  },
  qualifications: {
    type: String,
    default: 'M.Phil Clinical Psychology, RCI Certified',
  },
  experience_years: {
    type: Number,
    default: 7,
  },
  city: {
    type: String,
    default: 'Bengaluru, India',
  },
  session_rate: {
    type: Number,
    default: 2000,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  gstin: {
    type: String,
    default: '29AABCU9876Q1Z5',
  },
  phone: {
    type: String,
    default: '+91 98765 43210',
  },
  avatar: {
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
    default: 'free',
    enum: ['free', 'pro', 'enterprise']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Therapist', therapistSchema);
