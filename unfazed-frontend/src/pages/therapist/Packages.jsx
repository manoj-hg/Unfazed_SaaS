import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import PackageCard from '../../components/profile/PackageCard';
import UpgradeModal from '../../components/common/UpgradeModal';
import Loader from '../../components/common/Loader';
import useEntitlement from '../../hooks/useEntitlement';
import { Package, Plus, Sparkles, CheckCircle2, Lock, Trash2 } from 'lucide-react';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [clientPackages, setClientPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // New package form state
  const [name, setName] = useState('');
  const [sessionCount, setSessionCount] = useState(6);
  const [price, setPrice] = useState(10000);
  const [discount, setDiscount] = useState(15);
  const [description, setDescription] = useState('');
  const [validityDays, setValidityDays] = useState(90);

  const {
    canAccess,
    gateAction,
    modalOpen,
    setModalOpen,
    blockedFeature,
    setBlockedFeature,
    upgradeTier,
    refreshEntitlements
  } = useEntitlement();

  const fetchPackagesData = async () => {
    try {
      const [pkgRes, clientPkgRes] = await Promise.all([
        axiosInstance.get('/packages'),
        axiosInstance.get('/packages/clients')
      ]);
      setPackages(pkgRes.data);
      setClientPackages(clientPkgRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackagesData();
  }, []);

  const handleOpenCreate = () => {
    gateAction('can_sell_packages', () => {
      setIsCreating(true);
    });
  };

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/packages', {
        name,
        session_count: Number(sessionCount),
        price: Number(price),
        discount_percentage: Number(discount),
        description,
        validity_days: Number(validityDays)
      });
      setPackages([...packages, res.data]);
      setIsCreating(false);
      setName('');
      setDescription('');
    } catch (err) {
      if (err.response?.data?.code === 'ENTITLEMENT_LOCKED') {
        setIsCreating(false);
        setBlockedFeature('can_sell_packages');
        setModalOpen(true);
      } else {
        alert(err.response?.data?.message || 'Failed to create package');
      }
    }
  };

  const handleDeletePackage = async (id) => {
    if (!window.confirm('Delete this package?')) return;
    try {
      await axiosInstance.delete(`/packages/${id}`);
      setPackages(packages.filter((p) => p._id !== id));
    } catch (err) {
      alert('Failed to delete package');
    }
  };

  if (loading) return <Loader text="Loading session bundle configurations..." />;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
            Module 4: Multi-Session Retainers & Packages
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">Session Packages</h1>
          <p className="text-sm text-slate-500 mt-1">
            Offer 3, 6, or 12 session bundles with built-in discount incentives and expiry tracking.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Create Session Bundle</span>
        </button>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="bg-white rounded-3xl p-6 border border-indigo-200 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-extrabold text-slate-900 text-base">New Multi-Session Package</h3>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreatePackage} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cognitive Growth Pack (6 Sessions)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Count</label>
                <select
                  value={sessionCount}
                  onChange={(e) => setSessionCount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  <option value={3}>3 Sessions Bundle</option>
                  <option value={6}>6 Sessions Bundle</option>
                  <option value={12}>12 Sessions Bundle</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Price (₹)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Discount (%)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Validity (Days)</label>
                <input
                  type="number"
                  value={validityDays}
                  onChange={(e) => setValidityDays(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description / Focus</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Recommended for clients seeking structured CBT behavioral change..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700"
              >
                Publish Package
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Packages Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  {pkg.session_count} Sessions
                </span>
                <button
                  onClick={() => handleDeletePackage(pkg._id)}
                  className="text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Remove package"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-1">{pkg.name}</h3>
              <p className="text-xs text-slate-500 mb-4">{pkg.description}</p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-baseline justify-between mb-4">
                <span className="text-2xl font-black text-slate-900">₹{pkg.price.toLocaleString('en-IN')}</span>
                <span className="text-xs text-emerald-600 font-bold">
                  ₹{Math.round(pkg.price / pkg.session_count)} / session
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-400 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span>Valid for {pkg.validity_days || 90} days</span>
              <span className="text-emerald-600 font-bold">Live on Portal</span>
            </div>
          </div>
        ))}
      </div>

      {/* Enrolled Clients Retainers */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base">Client Package Retainers & Sessions Remaining</h3>
        <p className="text-xs text-slate-400">Auditable multi-session allocations</p>

        <div className="divide-y divide-slate-100">
          {clientPackages.map((cp) => (
            <div key={cp._id} className="py-3.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm">{cp.client_id?.name || 'Client'}</span>
                <p className="text-slate-400 mt-0.5">
                  Package: {cp.package_id?.name || 'Multi-Session'} • Expires{' '}
                  {new Date(cp.expires_at).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-extrabold">
                  {cp.sessions_remaining} / {cp.total_sessions} Sessions Left
                </span>
              </div>
            </div>
          ))}
          {clientPackages.length === 0 && (
            <p className="text-xs text-slate-400 py-6 text-center">No client packages active yet.</p>
          )}
        </div>
      </div>

      <UpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        featureKey={blockedFeature}
        onUpgradeSuccess={async (newTier) => {
          await upgradeTier(newTier);
          refreshEntitlements();
        }}
      />
    </div>
  );
};

export default Packages;
