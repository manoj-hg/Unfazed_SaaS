import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import ClientTable from '../../components/crm/ClientTable';
import AddClientModal from '../../components/crm/AddClientModal';
import UpgradeModal from '../../components/common/UpgradeModal';
import Loader from '../../components/common/Loader';
import useEntitlement from '../../hooks/useEntitlement';
import { Users, Search, UserPlus, Filter, ShieldAlert } from 'lucide-react';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    entitlements,
    canAccess,
    gateAction,
    modalOpen,
    setModalOpen,
    blockedFeature,
    setBlockedFeature,
    upgradeTier,
    refreshEntitlements
  } = useEntitlement();

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await axiosInstance.get('/clients', { params });
      setClients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [searchTerm, statusFilter]);

  const handleOpenAdd = () => {
    gateAction('max_active_clients', () => {
      setIsAddModalOpen(true);
    });
  };

  const handleClientAdded = (newClient) => {
    setClients((prev) => [newClient, ...prev]);
    refreshEntitlements();
  };

  const handleBlockedByCap = (feat) => {
    setBlockedFeature(feat);
    setModalOpen(true);
  };

  const activeCount = clients.filter((c) => c.status === 'active').length;
  const maxCap = entitlements?.caps?.max_active_clients || 5;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
            Module 3: Client CRM & Compliance
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">Clients Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Sortable client registry with digital intake forms, audit trail consent, and note history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Client Cap Badge */}
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-2">
            <span>Capacity:</span>
            <span className={activeCount >= maxCap ? 'text-amber-600' : 'text-indigo-600'}>
              {activeCount} / {maxCap >= 9999 ? '∞' : maxCap}
            </span>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus size={16} />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold w-full sm:w-auto">
          {['all', 'active', 'lead', 'inactive'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      {loading ? <Loader text="Retrieving practice clients..." /> : <ClientTable clients={clients} />}

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onClientAdded={handleClientAdded}
        onBlockedByCap={handleBlockedByCap}
      />

      {/* Entitlement Upgrade Modal */}
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

export default Clients;
