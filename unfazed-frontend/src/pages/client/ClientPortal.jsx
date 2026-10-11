import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Navbar from '../../components/common/Navbar';
import Hero from '../../components/profile/Hero';
import About from '../../components/profile/About';
import ServiceCard from '../../components/profile/ServiceCard';
import PackageCard from '../../components/profile/PackageCard';
import ChatWindow from '../../components/chat/ChatWindow';
import Loader from '../../components/common/Loader';
import { 
  Calendar, 
  Sparkles, 
  FileText, 
  MessageSquare, 
  Lock, 
  Download, 
  ShieldCheck, 
  CheckCircle2,
  Clock
} from 'lucide-react';

const ClientPortal = () => {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Client Portal Login / Shared Notes State
  const [clientEmail, setClientEmail] = useState('');
  const [clientLoggedIn, setClientLoggedIn] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [portalTab, setPortalTab] = useState('notes');
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(`/therapist/${slug}`);
        setProfile(res.data);
      } catch (err) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProfile();
  }, [slug]);

  const handleClientLogin = async (e) => {
    e.preventDefault();
    setPortalLoading(true);
    setPortalError(null);

    try {
      const res = await axiosInstance.get(`/notes/shared/${slug}/${encodeURIComponent(clientEmail)}`);
      setClientData(res.data);
      setClientLoggedIn(true);
    } catch (err) {
      setPortalError('No client record found with this email address under Dr. ' + (profile?.name || 'this practice') + '. Please use the email provided during booking.');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) return <Loader text="Connecting to practitioner's clinical portal..." />;
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Practice Profile Not Found</h2>
        <p className="text-sm">The branded link you followed does not correspond to an active practitioner.</p>
        <Link to="/login" className="mt-4 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm">
          Therapist Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Branded Header */}
      <Navbar therapistSlug={slug} therapistName={profile.name} />

      {/* Hero Section */}
      <Hero therapist={profile} />

      {/* About Section */}
      <About therapist={profile} />

      {/* Services Offered */}
      <section className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
              Care Modalities
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-heading">
              Available Clinical Services
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Choose the format that best fits your therapeutic goals. All appointments conducted via secure HD telehealth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <ServiceCard
              title="Individual Psychotherapy"
              duration={60}
              price={profile.session_rate || 2000}
              description="One-on-one evidence-based therapy focusing on anxiety, depression, emotional regulation, and personal resilience."
              therapistSlug={slug}
            />
            <ServiceCard
              title="Couples & Relationship Care"
              duration={90}
              price={Math.round((profile.session_rate || 2000) * 1.5)}
              description="Facilitated dyadic dialogue targeting attachment patterns, conflict resolution, and intimacy building."
              therapistSlug={slug}
            />
            <ServiceCard
              title="Initial Clinical Consultation"
              duration={45}
              price={Math.round((profile.session_rate || 2000) * 0.8)}
              description="A thorough diagnostic baseline evaluation to discuss history, formulate goals, and co-design a care plan."
              therapistSlug={slug}
            />
          </div>
        </div>
      </section>

      {/* Session Packages Bundles */}
      {profile.packages && profile.packages.length > 0 && (
        <section id="packages" className="py-16 bg-white border-b border-slate-200/80">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                Multi-Session Retainers
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-heading">
                Discounted Therapy Bundles
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Commit to your personal growth with structured multi-session packages offering up to 20% savings.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {profile.packages.map((pkg) => (
                <PackageCard key={pkg._id} pkg={pkg} therapistSlug={slug} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Client Portal Tab — Shared Notes & Direct Chat */}
      <section className="py-16 bg-slate-100/70">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                  Existing Client Portal
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 font-heading">
                  Access Your Shared Clinical Notes & Live Chat
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review homework assignments, therapist exercises, and message Dr. {profile.name.split(' ')[0]}.
                </p>
              </div>

              {clientLoggedIn && (
                <button
                  onClick={() => setClientLoggedIn(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Sign Out of Portal
                </button>
              )}
            </div>

            {!clientLoggedIn ? (
              <form onSubmit={handleClientLogin} className="max-w-md mx-auto py-6 space-y-4">
                <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs text-indigo-900 flex items-center gap-3">
                  <ShieldCheck size={20} className="text-indigo-600 shrink-0" />
                  <span>
                    Role-Restricted Security: Enter the email you booked with to view exclusively shared resources. Private therapist notes are never exposed.
                  </span>
                </div>

                {portalError && (
                  <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-100">
                    {portalError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Registered Client Email
                  </label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="e.g. priya.patel@gmail.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={portalLoading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {portalLoading ? 'Verifying Identity...' : 'Access Shared Notes & Chat'}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Client Welcome */}
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                      {clientData?.client?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{clientData?.client?.name}</h4>
                      <span className="text-xs text-slate-400">{clientData?.client?.email}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                    Authenticated Client
                  </span>
                </div>

                {/* Sub-tabs */}
                <div className="flex gap-2 border-b border-slate-200">
                  <button
                    onClick={() => setPortalTab('notes')}
                    className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                      portalTab === 'notes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
                    }`}
                  >
                    Shared Clinical Notes & Resources ({clientData?.notes?.length || 0})
                  </button>
                  <button
                    onClick={() => setPortalTab('chat')}
                    className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                      portalTab === 'chat' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
                    }`}
                  >
                    Direct Message Therapist
                  </button>
                </div>

                {portalTab === 'notes' ? (
                  <div className="space-y-4">
                    {clientData?.notes?.map((n) => (
                      <div key={n._id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                          <span className="text-[11px] text-slate-400">
                            {new Date(n.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div
                          className="prose prose-sm text-xs text-slate-700"
                          dangerouslySetInnerHTML={{ __html: n.content }}
                        />
                      </div>
                    ))}
                    {(!clientData?.notes || clientData.notes.length === 0) && (
                      <p className="text-xs text-slate-400 py-8 text-center">
                        No shared notes or homework posted by your therapist yet.
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <ChatWindow
                      therapistId={profile._id}
                      clientId={clientData?.client?._id || clientData?.client?.id || 'client_sandbox'}
                      currentUserRole="client"
                      participantName={profile.name}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-200 text-center text-xs text-slate-400 space-y-2">
        <p className="font-semibold text-slate-600">
          {profile.name} • Licensed Clinical Practice Suite
        </p>
        <p>
          Powered by <strong className="text-indigo-600">Unfazed SaaS OS</strong> — Clinical Telehealth for India.
        </p>
      </footer>
    </div>
  );
};

export default ClientPortal;
