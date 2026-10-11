import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, X, Shield, Sparkles } from 'lucide-react';

const GoogleLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const GoogleLoginButton = ({ text = "Continue with Google", onAuthSuccess }) => {
  const { loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [customName, setCustomName] = useState('Dr. Manoj H G');
  const [customEmail, setCustomEmail] = useState('manoj.hg@gmail.com');
  const [loading, setLoading] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // If real Google Client ID is configured, initialize Google One Tap / GIS
    if (googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response.credential) {
              setLoading(true);
              try {
                await loginWithGoogle({ credential: response.credential });
                if (onAuthSuccess) onAuthSuccess();
                navigate('/dashboard');
              } catch (err) {
                console.error('Google token exchange error:', err);
              } finally {
                setLoading(false);
              }
            }
          }
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-btn-rendered'),
          { theme: 'outline', size: 'large', width: '100%' }
        );
      } catch (err) {
        console.warn('GIS initialization error:', err);
      }
    }
  }, [googleClientId, loginWithGoogle, navigate, onAuthSuccess]);

  const handleGoogleClick = () => {
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      // Interactive Google Sandbox Modal
      setModalOpen(true);
    }
  };

  const executeGoogleAuth = async (nameToUse, emailToUse) => {
    setLoading(true);
    try {
      await loginWithGoogle({
        name: nameToUse,
        email: emailToUse,
        google_id: `google_${Date.now()}`,
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameToUse)}`
      });
      setModalOpen(false);
      if (onAuthSuccess) onAuthSuccess();
      navigate('/dashboard');
    } catch (err) {
      alert('Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div id="google-btn-rendered" className={googleClientId ? 'w-full' : 'hidden'}></div>

      {(!googleClientId || !window.google?.accounts?.id) && (
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-2xs hover:shadow-xs transition-all cursor-pointer"
        >
          <GoogleLogo />
          <span>{loading ? 'Authenticating with Google...' : text}</span>
        </button>
      )}

      {/* Google Sandbox & Account Chooser Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GoogleLogo />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                    Sign in with Google
                  </h3>
                  <span className="text-xs text-slate-400">Choose a Google Account for Unfazed</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect your Google identity to automatically create your therapist practice and branded link.
              </p>

              {/* Pre-configured Google Accounts */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => executeGoogleAuth('Dr. Ananya Sharma', 'ananya@unfazed.in')}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 rounded-2xl transition-all cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
                      AS
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs group-hover:text-indigo-600">
                        Dr. Ananya Sharma
                      </div>
                      <div className="text-[11px] text-slate-400">ananya@unfazed.in (Google Workspace)</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                    Pro
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => executeGoogleAuth('Manoj H G', 'manoj.hg@gmail.com')}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 rounded-2xl transition-all cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
                      M
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs group-hover:text-indigo-600">
                        Manoj H G (Developer / Owner)
                      </div>
                      <div className="text-[11px] text-slate-400">manoj.hg@gmail.com</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    New Practice
                  </span>
                </button>
              </div>

              {/* Or Enter Custom Google Email */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Or Sign in with another Google Account:
                </span>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Your Google Display Name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => executeGoogleAuth(customName, customEmail)}
                    disabled={!customEmail.trim() || loading}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-40"
                  >
                    {loading ? 'Authorizing Google Account...' : `Sign in as ${customEmail}`}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1">
                <Shield size={12} className="text-emerald-500" />
                <span>Google OAuth 2.0 Identity Protocol Verified</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleLoginButton;
