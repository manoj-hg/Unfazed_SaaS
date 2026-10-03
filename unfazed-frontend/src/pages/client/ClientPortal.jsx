import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { CalendarDays, Globe2, Sparkles } from 'lucide-react';

const ClientPortal = () => {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
    fetchProfile();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading profile...</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-800 text-white pt-20 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-bold shadow-xl border border-white/30">
            {profile.name.charAt(0)}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{profile.name}</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">
            {profile.bio || 'Compassionate therapy for a better tomorrow.'}
          </p>
          
          <div className="mt-10 flex justify-center">
            <Link 
              to={`/${slug}/book`} 
              className="group flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-full font-semibold text-lg shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <CalendarDays className="group-hover:rotate-12 transition-transform" />
              Book a Session
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-12 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4 text-blue-600">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Sparkles size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Specializations</h2>
              </div>
              <ul className="space-y-3">
                {profile.specializations?.map((spec, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    {spec}
                  </li>
                ))}
                {(!profile.specializations || profile.specializations.length === 0) && <li className="text-gray-400 italic">No specializations listed.</li>}
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4 text-purple-600">
                <div className="p-2 bg-purple-50 rounded-xl">
                  <Globe2 size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Languages</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.languages?.length > 0 ? (
                  profile.languages.map((lang, i) => (
                    <span key={i} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-gray-700 font-medium">
                      {lang}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic">Not specified</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPortal;
