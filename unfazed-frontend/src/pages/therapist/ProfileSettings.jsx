import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { Save, CheckCircle, ExternalLink, User, Award, DollarSign } from 'lucide-react';
import Loader from '../../components/common/Loader';

const ProfileSettings = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/auth/me');
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const specializations = typeof profile.specializations === 'string'
        ? profile.specializations.split(',').map((s) => s.trim()).filter(Boolean)
        : profile.specializations;

      const languages = typeof profile.languages === 'string'
        ? profile.languages.split(',').map((l) => l.trim()).filter(Boolean)
        : profile.languages;

      const res = await axiosInstance.put('/therapist/profile', {
        ...profile,
        specializations,
        languages
      });
      setProfile(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading practitioner profile..." />;

  const publicLink = `${window.location.origin}/${profile?.slug || ''}`;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
            Module 1: Foundations & Branded Link
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
            Practitioner Profile & Branding
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Customize your public landing page credentials, consulting fees, and branded slug.
          </p>
        </div>

        <a
          href={publicLink}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <span>Preview Portal</span>
          <ExternalLink size={14} />
        </a>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xs space-y-6">
        {saved && (
          <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 border border-emerald-100 font-bold">
            <CheckCircle size={16} />
            <span>Profile settings saved! Your public page is live with the updated information.</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 text-rose-800 text-xs rounded-2xl border border-rose-100 font-bold">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Legal / Professional Name
            </label>
            <input
              type="text"
              required
              value={profile?.name || ''}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Branded URL Slug (unfazed.in/slug)
            </label>
            <input
              type="text"
              required
              value={profile?.slug || ''}
              onChange={(e) => setProfile({ ...profile, slug: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-indigo-700 font-bold"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Professional Title
            </label>
            <input
              type="text"
              value={profile?.title || ''}
              onChange={(e) => setProfile({ ...profile, title: e.target.value })}
              placeholder="e.g. Senior Clinical Psychologist"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Academic Qualifications & Accreditations
            </label>
            <input
              type="text"
              value={profile?.qualifications || ''}
              onChange={(e) => setProfile({ ...profile, qualifications: e.target.value })}
              placeholder="e.g. M.Phil Clinical Psychology (NIMHANS), RCI Regd."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Session Fee (INR ₹)
            </label>
            <input
              type="number"
              value={profile?.session_rate || 2000}
              onChange={(e) => setProfile({ ...profile, session_rate: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Years of Experience
            </label>
            <input
              type="number"
              value={profile?.experience_years || 8}
              onChange={(e) => setProfile({ ...profile, experience_years: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Practice City / Region
            </label>
            <input
              type="text"
              value={profile?.city || 'Bengaluru, India'}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Clinical Bio & Philosophy
          </label>
          <textarea
            rows={4}
            value={profile?.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Share your therapeutic framework, modalities, and care philosophy..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Specializations (comma-separated)
            </label>
            <input
              type="text"
              value={Array.isArray(profile?.specializations) ? profile.specializations.join(', ') : profile?.specializations || ''}
              onChange={(e) => setProfile({ ...profile, specializations: e.target.value })}
              placeholder="Anxiety, CBT, Depression, Burnout"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Languages Spoken (comma-separated)
            </label>
            <input
              type="text"
              value={Array.isArray(profile?.languages) ? profile.languages.join(', ') : profile?.languages || ''}
              onChange={(e) => setProfile({ ...profile, languages: e.target.value })}
              placeholder="English, Hindi, Kannada"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Save size={16} />
            <span>{saving ? 'Updating...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
