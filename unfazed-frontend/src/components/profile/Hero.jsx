import React from 'react';
import { Calendar, ShieldCheck, MapPin, Award, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = ({ therapist }) => {
  return (
    <div className="relative bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white overflow-hidden py-16 md:py-24">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Avatar / Photo */}
          <div className="relative group">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 shadow-2xl shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-800 rounded-[22px] flex items-center justify-center text-5xl font-black text-indigo-300 overflow-hidden">
                {therapist.avatar ? (
                  <img src={therapist.avatar} alt={therapist.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{therapist.name.charAt(0)}</span>
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg ring-4 ring-slate-900">
              <ShieldCheck size={18} />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-4">
              <Award size={14} />
              <span>{therapist.qualifications || 'Certified Clinical Mental Health Practitioner'}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-2 font-heading">
              {therapist.name}
            </h1>

            <p className="text-lg text-indigo-200 font-medium mb-4">
              {therapist.title || 'Licensed Clinical Psychologist & Psychotherapist'}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300 mb-8">
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <MapPin size={14} className="text-indigo-400" />
                {therapist.city || 'Bengaluru, India'}
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <Star size={14} className="text-amber-400" />
                {therapist.experience_years || 8}+ Years Clinical Experience
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Accepting New Clients
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Link
                to={`/${therapist.slug}/book`}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <Calendar size={18} />
                <span>Book a Consultation</span>
              </Link>
              <a
                href="#packages"
                className="w-full sm:w-auto px-6 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 transition-all text-center"
              >
                View Session Bundles
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
