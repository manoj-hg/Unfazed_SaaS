import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  BarChart3, 
  Package,
  Settings, 
  Shield, 
  ExternalLink,
  LogOut,
  Bell,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const publicLink = `${window.location.origin}/${user?.slug || ''}`;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Schedule', path: '/dashboard/schedule', icon: Calendar },
    { name: 'Clients CRM', path: '/dashboard/clients', icon: Users },
    { name: 'Clinical Notes', path: '/dashboard/notes', icon: FileText },
    { name: 'Packages & Bundles', path: '/dashboard/packages', icon: Package },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Profile & Portal', path: '/dashboard/profile', icon: Settings },
    { name: 'Plan & Entitlements', path: '/dashboard/subscription', icon: Shield },
  ];

  const handleOpenLogs = async () => {
    setShowLogsModal(true);
    setLoadingLogs(true);
    try {
      const res = await axiosInstance.get('/notifications/logs');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const tier = user?.subscription_tier || 'free';

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-68 bg-white border-r border-slate-200 flex flex-col shadow-xs z-10 shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-indigo-600/20">
              U
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 block leading-none font-heading">
                Unfazed
              </span>
              <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase">
                Clinical Practice OS
              </span>
            </div>
          </Link>
        </div>

        {/* Plan Pill */}
        <div className="px-5 pt-4 pb-2">
          <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">
                Current Tier
              </span>
              <span className="font-extrabold text-xs text-indigo-950 uppercase tracking-wide">
                {tier} Practice
              </span>
            </div>
            <Link
              to="/dashboard/subscription"
              className="text-[11px] font-bold px-2.5 py-1 bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-lg shadow-2xs border border-indigo-200/60 transition-colors"
            >
              Manage
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Outbox / Notifications Trigger */}
        <div className="px-4 py-2">
          <button
            onClick={handleOpenLogs}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Bell size={14} className="text-indigo-600" />
              <span>Event Notifications Outbox</span>
            </span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Public Portal Link & Sign Out */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
          <a
            href={publicLink}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-between p-2.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-700 transition-all shadow-2xs group"
          >
            <span className="truncate max-w-[170px]">{user?.slug ? `/${user.slug}` : 'Public Portal'}</span>
            <ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-600" />
          </a>

          <div className="flex items-center justify-between px-2 pt-1">
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Therapist'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Outbox Modal (Demonstrates Module 6 WhatsApp/Email event stubs) */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                  Communication Engine
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Event-Driven Notifications & WhatsApp Stub Outbox
                </h3>
              </div>
              <button
                onClick={() => setShowLogsModal(false)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {loadingLogs ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading audit logs...</div>
              ) : logs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No automated notifications sent yet. Book a session or record a payment to trigger an event!
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-700 uppercase">{log.event.replace('_', ' ')}</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100 font-mono text-[11px]">
                      {log.whatsapp_message}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Recipient: {log.client_name} ({log.client_email})</span>
                      <span className="text-emerald-600 font-bold">{log.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
