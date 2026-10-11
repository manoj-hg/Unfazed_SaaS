import React from 'react';
import { Sparkles, Globe, HeartHandshake, CheckCircle } from 'lucide-react';

const About = ({ therapist }) => {
  return (
    <div className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Main Bio */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 block">
                Clinical Philosophy & Approach
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-heading">
                About the Practitioner
              </h2>
            </div>

            <p className="text-slate-600 leading-relaxed text-base">
              {therapist.bio ||
                'Compassionate, evidence-based psychotherapy tailored to help you navigate life transitions, reduce anxiety, and build lasting emotional resilience.'}
            </p>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <HeartHandshake className="text-indigo-600" size={18} />
                <span>What to Expect in Our Sessions</span>
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                  <span>Trauma-informed, confidential safe space</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                  <span>CBT & Mindfulness-integrated coping</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                  <span>Take-home structured reflections</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                  <span>HIPAA & Indian Telehealth compliant</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Specs Sidebar */}
          <div className="space-y-6 bg-slate-50 p-6 rounded-3xl border border-slate-100 h-fit">
            {/* Specializations */}
            <div>
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-3">
                <Sparkles size={16} />
                <span>Specializations</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {therapist.specializations?.map((spec, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-2xs"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="pt-4 border-t border-slate-200/60">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-3">
                <Globe size={16} />
                <span>Languages Spoken</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {therapist.languages?.map((lang, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-indigo-50/70 border border-indigo-100 rounded-full text-xs font-semibold text-indigo-800"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Session Rate */}
            <div className="pt-4 border-t border-slate-200/60">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">
                Standard Fee
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">₹{therapist.session_rate || 2000}</span>
                <span className="text-xs text-slate-500">/ 60-min session</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
