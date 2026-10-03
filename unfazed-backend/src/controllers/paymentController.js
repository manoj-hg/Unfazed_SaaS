const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');

exports.createOrder = async (req, res) => {
  try {
    const { amount, type, reference_id, therapist_id, client_id } = req.body;

    const options = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    const payment = new Payment({
      therapist_id,
      client_id,
      amount,
      status: 'created',
      razorpay_order_id: order.id,
      type,
      reference_id
    });
    await payment.save();

    res.json({ order, paymentId: payment._id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      await Payment.findByIdAndUpdate(paymentId, {
        status: 'successful',
        razorpay_payment_id,
        razorpay_signature
      });
      return res.json({ message: "Payment verified successfully" });
    } else {
      await Payment.findByIdAndUpdate(paymentId, { status: 'failed' });
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
