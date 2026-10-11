import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  ArrowRight, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  TrendingUp,
  Sparkles,
  Clock,
  Video
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import StatCard from '../../components/analytics/StatCard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [copied, setCopied] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [clientsCount, setClientsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const publicLink = `${window.location.origin}/${user?.slug || ''}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessRes, clientRes] = await Promise.all([
          axiosInstance.get('/scheduling/sessions'),
          axiosInstance.get('/clients')
        ]);
        setSessions(sessRes.data || []);
        setClientsCount(clientRes.data?.length || 0);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const upcomingSessions = sessions
    .filter((s) => s.status === 'booked' && new Date(s.start_time) >= new Date())
    .slice(0, 4);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-3">
              <Sparkles size={14} /> Practice Operating System
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-heading">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-indigo-200 text-sm mt-1 max-w-lg">
              Here is what is scheduled for your practice today. Your custom client portal is live and ready to take bookings.
            </p>
          </div>

          {/* Branded Link Card */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 max-w-md w-full">
            <span className="text-xs text-indigo-200 font-semibold block mb-2">
              Your Branded Public Link:
            </span>
            <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-white/10 text-xs font-mono text-white">
              <span className="truncate flex-1">{publicLink}</span>
              <button
                onClick={handleCopy}
                title="Copy link"
                className="p-1.5 hover:bg-white/10 rounded-lg text-indigo-300 hover:text-white transition-colors cursor-pointer"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
              <a
                href={publicLink}
                target="_blank"
                rel="noreferrer"
                title="Open public portal"
                className="p-1.5 hover:bg-white/10 rounded-lg text-indigo-300 hover:text-white transition-colors cursor-pointer"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Clients"
          value={clientsCount}
          subtitle="Managed in your CRM"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Upcoming Appointments"
          value={upcomingSessions.length}
          subtitle="Confirmed sessions"
          icon={Calendar}
          color="emerald"
        />
        <StatCard
          title="Practice Tier"
          value={user?.subscription_tier?.toUpperCase() || 'FREE'}
          subtitle="Feature gating active"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Upcoming Appointments & Practice Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointments List */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Upcoming Appointments</h2>
              <p className="text-xs text-slate-400">Scheduled client consultations</p>
            </div>
            <Link
              to="/dashboard/schedule"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Manage Calendar</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <div
                key={session._id}
                className="p-4 bg-slate-50 hover:bg-indigo-50/40 rounded-2xl border border-slate-200/80 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-inner">
                    {session.client_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{session.client_name}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <Clock size={12} className="text-slate-400" />
                      <span>
                        {new Date(session.start_time).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}{' '}
                        at{' '}
                        {new Date(session.start_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Confirmed
                  </span>
                  <a
                    href={`https://meet.unfazed.in/${user?.slug}-${session._id.toString().slice(-6)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
                    title="Launch Telehealth Room"
                  >
                    <Video size={16} />
                  </a>
                </div>
              </div>
            ))}

            {upcomingSessions.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                No upcoming sessions scheduled. Share your link to receive new bookings!
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Hub */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Quick Practice Tools</h2>
            <p className="text-xs text-slate-400 mb-6">Shortcuts to daily clinical workflows</p>

            <div className="space-y-3">
              <Link
                to="/dashboard/notes"
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 transition-colors group"
              >
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Document Session</h4>
                  <p className="text-[11px] text-slate-500">Create private or SOAP note</p>
                </div>
              </Link>

              <Link
                to="/dashboard/clients"
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 transition-colors group"
              >
                <div className="p-2 rounded-xl bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Users size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Open Client CRM</h4>
                  <p className="text-[11px] text-slate-500">Review digital intake & chat</p>
                </div>
              </Link>

              <Link
                to="/dashboard/packages"
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 transition-colors group"
              >
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Session Bundles</h4>
                  <p className="text-[11px] text-slate-500">Sell multi-session packages</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-100 text-xs text-indigo-900 space-y-2">
            <span className="font-extrabold uppercase text-[10px] tracking-wider text-indigo-600 block">
              Practitioner Tip
            </span>
            <p className="leading-relaxed">
              Always share your public link in WhatsApp bios and email signatures to convert client inquiries automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
