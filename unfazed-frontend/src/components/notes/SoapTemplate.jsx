import React from 'react';

const SoapTemplate = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
          S - Subjective
        </label>
        <p className="text-xs text-slate-400 mb-2">Client's report of symptoms, emotional state, homework review, and direct quotes.</p>
        <textarea
          rows={3}
          value={data?.subjective || ''}
          onChange={(e) => handleChange('subjective', e.target.value)}
          placeholder="e.g. Client reports sleeping 5 hours/night, feelings of panic before weekly standup meetings..."
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
          O - Objective
        </label>
        <p className="text-xs text-slate-400 mb-2">Therapist's observations, affect, orientation, psychometrics (PHQ-9/GAD-7), and behavioral signs.</p>
        <textarea
          rows={3}
          value={data?.objective || ''}
          onChange={(e) => handleChange('objective', e.target.value)}
          placeholder="e.g. Affect anxious; psychomotor agitation noted. GAD-7 score: 14. Responsive to mindfulness prompt."
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
          A - Assessment
        </label>
        <p className="text-xs text-slate-400 mb-2">Clinical analysis of progress, cognitive distortions identified, coping response, and prognosis.</p>
        <textarea
          rows={3}
          value={data?.assessment || ''}
          onChange={(e) => handleChange('assessment', e.target.value)}
          placeholder="e.g. Demonstrates developing insight into catastrophizing thoughts. Moderate progress toward goal 1."
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
          P - Plan
        </label>
        <p className="text-xs text-slate-400 mb-2">Take-home exercises, psychoeducation, therapeutic modalities, next scheduled appointment.</p>
        <textarea
          rows={3}
          value={data?.plan || ''}
          onChange={(e) => handleChange('plan', e.target.value)}
          placeholder="e.g. Continue 3-column thought record. Next session scheduled for Thursday 4:00 PM."
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>
    </div>
  );
};

export default SoapTemplate;
