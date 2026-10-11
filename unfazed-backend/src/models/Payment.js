const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  therapist_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  platform_fee: { type: Number, default: 0 },
  net_amount: { type: Number, default: function() { return this.amount; } },
  status: { type: String, enum: ['created', 'successful', 'failed', 'refunded'], default: 'created' },
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },
  type: { type: String, enum: ['session', 'package'], default: 'session' },
  reference_id: { type: mongoose.Schema.Types.ObjectId },
  invoice_number: { type: String },
  description: { type: String, default: 'Therapy Session Booking' },
  gst_rate: { type: Number, default: 18 },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
