import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import StatCard from '../../components/analytics/StatCard';
import RevenueChart from '../../components/analytics/RevenueChart';
import UpgradeModal from '../../components/common/UpgradeModal';
import Loader from '../../components/common/Loader';
import useEntitlement from '../../hooks/useEntitlement';
import { 
  TrendingUp, 
  Users, 
  CalendarCheck, 
  CreditCard, 
  AlertTriangle, 
  Lock, 
  Sparkles,
  PieChart as PieIcon
} from 'lucide-react';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    tier,
    canAccess,
    modalOpen,
    setModalOpen,
    upgradeTier,
    refreshEntitlements
  } = useEntitlement();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/analytics');
        setStats(res.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setError(err.response.data?.message || 'Upgrade your subscription tier to access Advanced Analytics.');
        } else {
          setError('Failed to load practice analytics.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [tier]);

  if (loading) return <Loader text="Executing MongoDB aggregation pipelines for practice analytics..." />;

  // Entitlement Lock Screen
  if (error || !canAccess('can_view_advanced_analytics')) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center mt-12 space-y-6">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-indigo-100">
          <Lock size={36} />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
            Module 7: Subscription Tiers & Feature Gating
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 font-heading">
            Advanced Analytics Engine Locked
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            {error || 'MongoDB Aggregation revenue trending, no-show rate analysis, and cohort retention metrics require a Professional Practice plan.'}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-600/25 flex items-center gap-2 mx-auto transition-all cursor-pointer"
        >
          <Sparkles size={18} />
          <span>Upgrade to Professional Plan</span>
        </button>

        <UpgradeModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          featureKey="can_view_advanced_analytics"
          onUpgradeSuccess={async (newTier) => {
            await upgradeTier(newTier);
            refreshEntitlements();
          }}
        />
      </div>
    );
  }

  const breakdown = stats?.sessionBreakdown || { booked: 0, completed: 0, cancelled: 0, no_show: 0 };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
          Module 7: Real MongoDB Aggregations & Clinical Business Metrics
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
          Practice Performance & Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Server-side pipeline metrics computed in real time from database collections.
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Clients"
          value={stats?.activeClientsCount ?? 0}
          subtitle="Registered in CRM"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Monthly Sessions"
          value={stats?.completedSessions ?? 0}
          subtitle="Completed this month"
          icon={CalendarCheck}
          color="emerald"
        />
        <StatCard
          title="Revenue (Month)"
          value={`₹${(stats?.revenue ?? 0).toLocaleString('en-IN')}`}
          subtitle="From confirmed bookings"
          icon={CreditCard}
          color="purple"
        />
        <StatCard
          title="No-Show Rate"
          value={`${stats?.noShowRate ?? 0}%`}
          subtitle="Missed appointments"
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      {/* Revenue Aggregation Chart */}
      <RevenueChart data={stats?.revenueTrend || []} />

      {/* Sessions Breakdown Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Session Volume Distribution</h3>
          <p className="text-xs text-slate-400">Status breakdown computed via $group pipeline</p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold block">Completed</span>
              <span className="text-2xl font-black text-emerald-600">{breakdown.completed}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold block">Upcoming Booked</span>
              <span className="text-2xl font-black text-indigo-600">{breakdown.booked}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold block">Cancelled</span>
              <span className="text-2xl font-black text-rose-500">{breakdown.cancelled}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold block">No-Shows</span>
              <span className="text-2xl font-black text-amber-500">{breakdown.no_show}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Lifetime Financial Metrics</h3>
            <p className="text-xs text-slate-400">Total gross receipts processed</p>

            <div className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 space-y-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                Total Practice Lifetime Revenue
              </span>
              <div className="text-4xl font-black text-indigo-950 font-heading">
                ₹{(stats?.allTimeRevenue ?? 0).toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-500">
                Inclusive of all session consultations and retainer package purchases.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center justify-between pt-4 border-t border-slate-100">
            <span>GST Reporting: 18% SAC 999312</span>
            <span className="font-bold text-emerald-600">Reconciled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
