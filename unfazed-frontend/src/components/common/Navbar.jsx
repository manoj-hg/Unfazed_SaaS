import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, Lock } from 'lucide-react';

const Navbar = ({ therapistSlug, therapistName }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
        <Link to={`/${therapistSlug || ''}`} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            U
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-lg block leading-none">
              {therapistName || 'Unfazed'}
            </span>
            <span className="text-[11px] font-semibold text-indigo-600 tracking-wider uppercase">
              Clinical Telehealth Practice
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/${therapistSlug}/book`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all"
          >
            <Calendar size={16} />
            <span>Book Session</span>
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
          >
            <Lock size={14} />
            <span>Therapist Sign In</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
