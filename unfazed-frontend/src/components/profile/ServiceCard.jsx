import React from 'react';
import { Clock, Video, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ title, duration, price, description, therapistSlug }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
            <Clock size={13} />
            <span>{duration} Mins</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Video size={13} className="text-emerald-500" />
            <span>Telehealth HD</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">{description}</p>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 block font-medium">Standard Fee</span>
          <span className="text-2xl font-black text-slate-900">₹{price.toLocaleString('en-IN')}</span>
        </div>
        <Link
          to={`/${therapistSlug}/book`}
          className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
        >
          <span>Select</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;
