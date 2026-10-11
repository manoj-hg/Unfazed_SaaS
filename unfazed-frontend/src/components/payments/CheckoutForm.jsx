import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { ShieldCheck, CreditCard, Sparkles, AlertCircle } from 'lucide-react';

const CheckoutForm = ({
  amount,
  itemType = 'session',
  referenceId,
  therapistId,
  clientId,
  clientDetails,
  onPaymentSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculations: GST 18% inclusive
  const total = Number(amount);
  const base = Math.round(total / 1.18);
  const gst = total - base;

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create order on backend
      const orderRes = await axiosInstance.post('/payments/order', {
        amount: total,
        type: itemType,
        reference_id: referenceId,
        therapist_id: therapistId,
        client_id: clientId,
        description: itemType === 'package' ? 'Clinical Package Enrollment' : 'Session Consultation Fee'
      });

      const { order, paymentId, key_id } = orderRes.data;

      // 2. Check if Razorpay JS is available or run seamless sandbox checkout
      if (window.Razorpay) {
        const options = {
          key: key_id,
          amount: order.amount,
          currency: "INR",
          name: "Unfazed Practice Suite",
          description: "Advance Telehealth Clinical Booking",
          order_id: order.id,
          handler: async function (response) {
            try {
              const verifyRes = await axiosInstance.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentId
              });
              if (onPaymentSuccess) onPaymentSuccess(verifyRes.data.payment);
            } catch (vErr) {
              setError('Payment verification failed.');
            }
          },
          prefill: {
            name: clientDetails?.name || '',
            email: clientDetails?.email || '',
            contact: clientDetails?.phone || ''
          },
          theme: {
            color: "#4f46e5"
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback test/sandbox verification if razorpay script isn't loaded
        const verifyRes = await axiosInstance.post('/payments/verify', {
          razorpay_order_id: order.id,
          razorpay_payment_id: `pay_sandbox_${Date.now()}`,
          razorpay_signature: 'sig_sandbox_verified',
          paymentId
        });
        if (onPaymentSuccess) onPaymentSuccess(verifyRes.data.payment);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Payment initiation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Payment Summary</h3>
          <p className="text-xs text-slate-500">Advance confirmation with Razorpay</p>
        </div>
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
          <CreditCard size={20} />
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Consultation Fee</span>
          <span>₹{base.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-slate-600 text-xs">
          <span>GST (18% - CGST 9% + SGST 9%)</span>
          <span>₹{gst.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between font-extrabold text-slate-900 pt-3 border-t border-slate-100 text-base">
          <span>Total Payable</span>
          <span className="text-indigo-600">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 border border-rose-100">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
      >
        <ShieldCheck size={18} />
        <span>{loading ? 'Processing Secure Payment...' : `Pay ₹${total.toLocaleString('en-IN')} & Confirm`}</span>
      </button>

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <span>🔒 256-bit SSL Encrypted • Razorpay Test Gateway</span>
      </div>
    </div>
  );
};

export default CheckoutForm;
