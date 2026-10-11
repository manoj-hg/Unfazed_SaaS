import React from 'react';
import { Download, FileText, CheckCircle2, Building, User } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const InvoiceView = ({ payment, therapistName }) => {
  const invoiceNum = payment.invoice_number || `UNF-${payment._id?.toString().slice(-6)}`;
  const dateStr = new Date(payment.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const handleDownload = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    window.open(`${apiBase}/payments/invoice/${payment._id}`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block">GST Tax Invoice</span>
          <h3 className="font-extrabold text-slate-900 text-lg">{invoiceNum}</h3>
          <span className="text-xs text-slate-400">{dateStr}</span>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
        >
          <Download size={14} />
          <span>Download PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-slate-400 font-medium block mb-1">Status</span>
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
            <CheckCircle2 size={12} />
            <span>Paid in Full</span>
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block mb-1">Total Paid</span>
          <span className="font-black text-slate-900 text-sm">₹{payment.amount?.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600">
        <div className="flex justify-between">
          <span>SAC Code (Psychotherapy):</span>
          <span className="font-mono">999312</span>
        </div>
        <div className="flex justify-between">
          <span>Razorpay ID:</span>
          <span className="font-mono">{payment.razorpay_payment_id || 'RZP-TEST-PAID'}</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
