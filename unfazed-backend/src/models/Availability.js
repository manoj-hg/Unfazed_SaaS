const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  therapist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true,
    unique: true
  },
  session_duration: {
    type: Number,
    enum: [30, 45, 60, 90],
    default: 60
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  buffer_time: {
    type: Number,
    default: 15
  },
  weekly_schedule: {
    monday: { isAvailable: { type: Boolean, default: false }, start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" } },
    tuesday: { isAvailable: { type: Boolean, default: false }, start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" } },
    wednesday: { isAvailable: { type: Boolean, default: false }, start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" } },
    thursday: { isAvailable: { type: Boolean, default: false }, start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" } },
    friday: { isAvailable: { type: Boolean, default: false }, start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" } },
    saturday: { isAvailable: { type: Boolean, default: false }, start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" } },
    sunday: { isAvailable: { type: Boolean, default: false }, start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" } }
  }
}, { timestamps: true });

module.exports = mongoose.model('Availability', availabilitySchema);
