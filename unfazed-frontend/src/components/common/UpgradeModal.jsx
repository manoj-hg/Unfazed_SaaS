import React, { useState } from 'react';
import { Sparkles, Check, X, ShieldCheck, Zap } from 'lucide-react';

const FEATURE_NAMES = {
  can_use_shared_notes: 'Client-Shared Clinical Notes & Resources',
  can_view_advanced_analytics: 'Advanced Financial & Clinical Aggregations',
  can_use_soap_templates: 'Standardized SOAP & DAP Clinical Formats',
  can_sell_packages: 'Multi-Session Packages & Advance Retainers',
  max_active_clients: 'Expanded Active Clients Capacity (25+ Clients)'
};

const UpgradeModal = ({ isOpen, onClose, featureKey, onUpgradeSuccess }) => {
  const [upgrading, setUpgrading] = useState(false);
  const [selectedTier, setSelectedTier] = useState('pro');

  if (!isOpen) return null;

  const featureLabel = FEATURE_NAMES[featureKey] || 'This Premium Feature';

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      if (onUpgradeSuccess) {
        await onUpgradeSuccess(selectedTier);
      }
      onClose();
    } catch (err) {
      alert('Failed to upgrade tier. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Glow Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles size={14} /> Practice Upgrade Required
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Unlock {featureLabel}</h2>
          <p className="text-indigo-100 text-sm mt-1">
            Centralized Entitlement Service gated this action for your current practice tier. Upgrade instantly to unlock.
          </p>
        </div>

        {/* Tier Cards Comparison */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Pro Tier */}
            <div 
              onClick={() => setSelectedTier('pro')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedTier === 'pro' 
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2.5 py-0.5 rounded-full">Recommended</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">Professional Practice</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-slate-900">₹2,499</span>
                  <span className="text-xs text-slate-500 block">/ month</span>
                </div>
              </div>
              <ul className="space-y-2 mt-4 text-xs text-slate-600">
                <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Up to 25 Active Clients</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> SOAP & DAP Structured Notes</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Client-Facing Shared Resources</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Multi-Session Packages & Retainers</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Advanced Analytics & Aggregations</li>
              </ul>
            </div>

            {/* Enterprise Tier */}
            <div 
              onClick={() => setSelectedTier('enterprise')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedTier === 'enterprise' 
                  ? 'border-purple-600 bg-purple-50/50 shadow-md ring-2 ring-purple-500/20' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-100 px-2.5 py-0.5 rounded-full">Unlimited</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">Clinical Enterprise</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-slate-900">₹5,999</span>
                  <span className="text-xs text-slate-500 block">/ month</span>
                </div>
              </div>
              <ul className="space-y-2 mt-4 text-xs text-slate-600">
                <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Unlimited Active Clients</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Custom Domain / White-labeling</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Priority WhatsApp & SMS Gateways</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Unlimited Package Bundles</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Instant provisioning via Entitlement Service. Cancel anytime.</span>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={upgrading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                <Zap size={16} />
                {upgrading ? 'Upgrading...' : `Upgrade to ${selectedTier.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
