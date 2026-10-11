import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Sparkles, Shield, UserCheck } from 'lucide-react';
import GoogleLoginButton from '../../components/common/GoogleLoginButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to login with demo credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-indigo-600/30 mx-auto">
          U
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          Sign In to Unfazed
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          The all-in-one practice operating system for therapists in India.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80 space-y-5">
          {/* Google Sign In Access */}
          <div>
            <GoogleLoginButton text="Sign in with Google" />
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider relative z-10">
              Or with email
            </span>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 text-rose-700 p-3.5 rounded-xl text-xs font-semibold border border-rose-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Practitioner Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dr.sharma@unfazed.in"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/25 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <LogIn size={16} />
              <span>{loading ? 'Authenticating...' : 'Sign In to Practice Hub'}</span>
            </button>
          </form>

          {/* 1-Click Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-3">
              1-Click Demo Accounts
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('ananya@unfazed.in', 'Password123!')}
                className="p-3 bg-indigo-50/70 hover:bg-indigo-100/70 rounded-xl text-left border border-indigo-100 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs">
                  <Sparkles size={13} />
                  <span>Dr. Ananya</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Pro Tier Account</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('rohan@unfazed.in', 'Password123!')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-left border border-slate-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                  <Shield size={13} />
                  <span>Dr. Rohan</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Free Tier Account</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          New practitioner?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700">
            Create your branded practice page
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
