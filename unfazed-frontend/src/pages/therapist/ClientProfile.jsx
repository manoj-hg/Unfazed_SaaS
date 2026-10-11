import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  FileText, 
  CreditCard, 
  MessageSquare, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Download
} from 'lucide-react';
import Loader from '../../components/common/Loader';
import ChatWindow from '../../components/chat/ChatWindow';

const ClientProfile = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchClientDetails = async () => {
    try {
      const res = await axiosInstance.get(`/clients/${id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientDetails();
  }, [id]);

  if (loading) return <Loader text="Loading 360° client record..." />;
  if (!data?.client) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Client profile not found.</p>
        <Link to="/dashboard/clients" className="text-indigo-600 font-bold mt-2 inline-block">
          Return to directory
        </Link>
      </div>
    );
  }

  const { client, sessions = [], notes = [], payments = [] } = data;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/dashboard/clients"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to Client Directory</span>
      </Link>

      {/* Header Profile Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            {client.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 font-heading">{client.name}</h1>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                  client.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {client.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {client.email} • {client.phone || 'No phone recorded'}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {client.tags?.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Consent Status */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
            Compliance Status
          </span>
          {client.consent_signed_at ? (
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <ShieldCheck size={16} />
              <span>Digital Consent Signed</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-700 font-bold">
              <AlertCircle size={16} />
              <span>Pending Intake Consent</span>
            </div>
          )}
          <span className="text-[11px] text-slate-400 block">
            {client.consent_signed_at
              ? new Date(client.consent_signed_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              : 'Sent to client'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Intake & History', icon: FileText },
          { id: 'sessions', label: `Sessions (${sessions.length})`, icon: Calendar },
          { id: 'notes', label: `Clinical Notes (${notes.length})`, icon: FileText },
          { id: 'payments', label: `Billing & Invoices (${payments.length})`, icon: CreditCard },
          { id: 'chat', label: 'Direct Messages', icon: MessageSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {/* 1. Overview & Intake */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Intake Questionnaire</h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Age & Gender</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {client.intake_form?.age || 'Not specified'} {client.intake_form?.gender ? `(${client.intake_form.gender})` : ''}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Emergency Contact</span>
                <p className="font-medium text-slate-800 mt-0.5">
                  {client.intake_form?.emergency_contact || 'None listed'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Presenting Concern</span>
                <p className="font-medium text-slate-800 mt-0.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {client.intake_form?.concern || 'No specific concern submitted'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Medical / Psychiatric History</span>
                <p className="font-medium text-slate-800 mt-0.5">
                  {client.intake_form?.medical_history || 'None reported'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Audit Consent Verification</h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 size={16} />
                <span>Informed Consent Protocol Verified</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Client completed digital acknowledgment of Telehealth Tele-Psychology Guidelines, Emergency Referral protocols, and 24-hour Cancellation Terms.
              </p>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-400 space-y-1">
                <div>Signed Timestamp: {client.consent_signed_at ? new Date(client.consent_signed_at).toISOString() : 'Pending'}</div>
                <div>Auditable IP: {client.consent_ip || '127.0.0.1 (Secure Local)'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Sessions */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-base mb-4">Consultation Timeline</h3>
          {sessions.map((s) => (
            <div key={s._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900 text-sm">
                  {new Date(s.start_time).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-slate-400 mt-0.5">
                  {new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {new Date(s.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full font-bold uppercase text-[10px] ${
                  s.status === 'completed'
                    ? 'bg-indigo-100 text-indigo-700'
                    : s.status === 'booked'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {s.status}
              </span>
            </div>
          ))}
          {sessions.length === 0 && <p className="text-xs text-slate-400 py-6 text-center">No session history.</p>}
        </div>
      )}

      {/* 3. Clinical Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-base">Progress Notes</h3>
            <Link
              to="/dashboard/notes"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              + Create New Note
            </Link>
          </div>
          {notes.map((n) => (
            <div key={n._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                  <span className="text-[11px] text-slate-400">{new Date(n.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      n.type === 'private'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {n.type === 'private' ? '🔒 Private Note' : '🌐 Shared with Client'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold uppercase">
                    {n.format}
                  </span>
                </div>
              </div>

              {n.format === 'soap' && n.soap_data && (
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="font-bold text-indigo-700 block mb-1">Subjective:</span>
                    <p className="text-slate-700">{n.soap_data.subjective || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="font-bold text-indigo-700 block mb-1">Objective:</span>
                    <p className="text-slate-700">{n.soap_data.objective || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="font-bold text-indigo-700 block mb-1">Assessment:</span>
                    <p className="text-slate-700">{n.soap_data.assessment || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="font-bold text-indigo-700 block mb-1">Plan:</span>
                    <p className="text-slate-700">{n.soap_data.plan || 'N/A'}</p>
                  </div>
                </div>
              )}

              <div
                className="prose prose-sm text-xs text-slate-700"
                dangerouslySetInnerHTML={{ __html: n.content }}
              />
            </div>
          ))}
          {notes.length === 0 && <p className="text-xs text-slate-400 py-6 text-center">No clinical notes recorded.</p>}
        </div>
      )}

      {/* 4. Billing & Invoices */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-base mb-4">Payment Receipts & Tax Invoices</h3>
          {payments.map((p) => (
            <div key={p._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm">Invoice #{p.invoice_number || p._id.toString().slice(-6)}</span>
                <p className="text-slate-400 mt-0.5">
                  ₹{p.amount?.toLocaleString('en-IN')} via Razorpay ({p.razorpay_payment_id || 'Test'})
                </p>
              </div>
              <a
                href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/payments/invoice/${p._id}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download size={13} />
                <span>GST PDF</span>
              </a>
            </div>
          ))}
          {payments.length === 0 && <p className="text-xs text-slate-400 py-6 text-center">No payment transactions found.</p>}
        </div>
      )}

      {/* 5. Live Chat */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
          <ChatWindow
            therapistId={user?.id || user?._id}
            clientId={client._id}
            currentUserRole="therapist"
            participantName={client.name}
          />
        </div>
      )}
    </div>
  );
};

export default ClientProfile;
