import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { ShieldCheck, Check, Sparkles, Zap, Lock, AlertCircle } from 'lucide-react';
import Loader from '../../components/common/Loader';
import useEntitlement from '../../hooks/useEntitlement';

const Subscription = () => {
  const {
    entitlements,
    tier,
    refreshEntitlements,
    upgradeTier
  } = useEntitlement();
  const [upgradingTier, setUpgradingTier] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleUpgrade = async (targetTier) => {
    setUpgradingTier(targetTier);
    setSuccessMsg(null);
    try {
      await upgradeTier(targetTier);
      await refreshEntitlements();
      setSuccessMsg(`Practice plan successfully switched to ${targetTier.toUpperCase()}!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert('Failed to switch tier. Please try again.');
    } finally {
      setUpgradingTier(null);
    }
  };

  const activeCount = entitlements?.usage?.active_clients || 0;
  const maxCap = entitlements?.caps?.max_active_clients || 5;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
          Module 7: Architecture Highlight — Centralized Entitlements
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
          Subscription Tiers & Feature Governance
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Feature access is managed via the centralized Entitlement Service (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600">canAccess</code>). No routes hardcode subscription strings.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 text-xs font-bold flex items-center gap-2">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Current Usage Card */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block mb-1">
            Active Practice Entitlements
          </span>
          <h2 className="text-2xl md:text-3xl font-black font-heading capitalize">
            {tier} Tier Active
          </h2>
          <p className="text-indigo-200 text-xs mt-1">
            Governing active client capacities, SOAP clinical formats, and MongoDB analytics aggregations.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs space-y-1">
          <span className="text-indigo-200 font-semibold block">Client Capacity Utilization</span>
          <div className="text-xl font-black text-white">
            {activeCount} / {maxCap >= 9999 ? 'Unlimited' : maxCap} Clients
          </div>
          <div className="w-48 bg-white/20 rounded-full h-2 overflow-hidden mt-2">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (activeCount / (maxCap >= 9999 ? 100 : maxCap)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tier Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <div className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
          tier === 'free' ? 'border-2 border-indigo-600 shadow-md ring-2 ring-indigo-500/20' : 'border-slate-200'
        }`}>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Starter</span>
              {tier === 'free' && (
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  Current
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900">Solo Practice</h3>
            <div className="mt-4 mb-6">
              <span className="text-3xl font-black text-slate-900">₹0</span>
              <span className="text-xs text-slate-400 ml-1">/ month</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-600 mb-8">
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Up to 5 Active Clients</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Branded Public Booking Link</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Freeform Clinical Notes</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Razorpay Test Payments</li>
              <li className="flex items-center gap-2 text-slate-400 line-through"><span>SOAP & DAP Structured Notes</span></li>
              <li className="flex items-center gap-2 text-slate-400 line-through"><span>Client-Shared Resources</span></li>
              <li className="flex items-center gap-2 text-slate-400 line-through"><span>Multi-Session Retainer Bundles</span></li>
              <li className="flex items-center gap-2 text-slate-400 line-through"><span>MongoDB Aggregation Analytics</span></li>
            </ul>
          </div>

          <button
            onClick={() => handleUpgrade('free')}
            disabled={tier === 'free' || upgradingTier === 'free'}
            className="w-full py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {tier === 'free' ? 'Current Plan' : 'Downgrade to Free'}
          </button>
        </div>

        {/* Pro Plan */}
        <div className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between relative group ${
          tier === 'pro' ? 'border-2 border-indigo-600 shadow-xl ring-2 ring-indigo-500/20' : 'border-indigo-200 hover:border-indigo-400 shadow-sm'
        }`}>
          <div className="absolute -top-3 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
            Most Popular
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Professional</span>
              {tier === 'pro' && (
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  Current
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900">Growing Practice</h3>
            <div className="mt-4 mb-6">
              <span className="text-3xl font-black text-slate-900">₹2,499</span>
              <span className="text-xs text-slate-400 ml-1">/ month</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-600 mb-8">
              <li className="flex items-center gap-2 font-semibold text-slate-900"><Check size={14} className="text-emerald-500" /> Up to 25 Active Clients</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> SOAP & DAP Structured Formats</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Client-Shared Notes & Exercises</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Multi-Session Packages & Retainers</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Advanced Financial Aggregations</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Automated Event Notifications</li>
            </ul>
          </div>

          <button
            onClick={() => handleUpgrade('pro')}
            disabled={tier === 'pro' || upgradingTier === 'pro'}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {tier === 'pro' ? 'Current Plan' : upgradingTier === 'pro' ? 'Switching...' : 'Switch to Pro Plan'}
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
          tier === 'enterprise' ? 'border-2 border-purple-600 shadow-xl ring-2 ring-purple-500/20' : 'border-slate-200'
        }`}>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Enterprise</span>
              {tier === 'enterprise' && (
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700">
                  Current
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900">Clinical Suite</h3>
            <div className="mt-4 mb-6">
              <span className="text-3xl font-black text-slate-900">₹5,999</span>
              <span className="text-xs text-slate-400 ml-1">/ month</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-600 mb-8">
              <li className="flex items-center gap-2 font-semibold text-slate-900"><Check size={14} className="text-emerald-500" /> Unlimited Active Clients</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Custom Domain & White-Labeling</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Unlimited Package Bundles</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Priority WhatsApp & Direct SMS</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Dedicated Account Manager</li>
            </ul>
          </div>

          <button
            onClick={() => handleUpgrade('enterprise')}
            disabled={tier === 'enterprise' || upgradingTier === 'enterprise'}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {tier === 'enterprise' ? 'Current Plan' : upgradingTier === 'enterprise' ? 'Switching...' : 'Switch to Enterprise'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
