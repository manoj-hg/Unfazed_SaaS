import React from 'react';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const PackageCard = ({ pkg, therapistSlug }) => {
  const perSession = Math.round(pkg.price / pkg.session_count);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative group">
      {pkg.discount_percentage > 0 && (
        <div className="absolute -top-3 right-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
          Save {pkg.discount_percentage}%
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 text-indigo-600 mb-2">
          <Sparkles size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">{pkg.session_count} Sessions Bundle</span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mb-2">{pkg.name}</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">{pkg.description}</p>

        <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900">₹{pkg.price.toLocaleString('en-IN')}</span>
            <span className="text-xs text-slate-500 font-medium">total package</span>
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            Only ₹{perSession.toLocaleString('en-IN')} / session
          </p>
        </div>

        <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
          <li className="flex items-center gap-2">
            <Check size={14} className="text-emerald-500 shrink-0" />
            <span>Valid for {pkg.validity_days || 90} days from purchase</span>
          </li>
          <li className="flex items-center gap-2">
            <Check size={14} className="text-emerald-500 shrink-0" />
            <span>Priority booking slot reservations</span>
          </li>
          <li className="flex items-center gap-2">
            <Check size={14} className="text-emerald-500 shrink-0" />
            <span>Integrated progress tracking & shared notes</span>
          </li>
        </ul>
      </div>

      <Link
        to={`/${therapistSlug}/book?packageId=${pkg._id}`}
        className="w-full py-3.5 px-4 rounded-xl bg-slate-900 group-hover:bg-indigo-600 text-white font-bold text-sm text-center shadow-md flex items-center justify-center gap-2 transition-colors"
      >
        <span>Enroll in Package</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
};

export default PackageCard;
