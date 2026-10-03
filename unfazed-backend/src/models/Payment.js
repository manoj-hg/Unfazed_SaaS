const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  therapist_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['created', 'successful', 'failed'], default: 'created' },
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },
  type: { type: String, enum: ['session', 'package'], default: 'session' },
  reference_id: { type: mongoose.Schema.Types.ObjectId }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
