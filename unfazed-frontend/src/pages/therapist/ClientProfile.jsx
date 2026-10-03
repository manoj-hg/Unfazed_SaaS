import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useForm } from 'react-hook-form';
import { ArrowLeft, UserCircle, CheckCircle2, FileText } from 'lucide-react';

const ClientProfile = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await axiosInstance.get(`/clients/${id}`);
        setClient(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  const onSubmit = async (data) => {
    try {
      const res = await axiosInstance.post(`/clients/${id}/intake`, { intake_form: data, consent: data.consent });
      setClient(res.data);
      alert('Intake form saved');
    } catch (err) {
      alert('Failed to save intake');
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading client data...</div>;
  if (!client) return <div className="p-8 text-gray-500">Client not found</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/dashboard/clients" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors">
        <ArrowLeft size={18} />
        Back to Clients
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 flex items-center gap-6">
        <UserCircle className="w-20 h-20 text-gray-200" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{client.name}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{client.email}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className={`px-2 py-0.5 rounded-full font-medium ${client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {client.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <FileText size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Intake & Consent</h2>
        </div>
        
        <div className="p-8">
          {client.consent_signed_at ? (
            <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-xl border border-green-100 mb-8">
              <CheckCircle2 size={24} />
              <div>
                <p className="font-semibold">Digital Consent Signed</p>
                <p className="text-sm opacity-90">{new Date(client.consent_signed_at).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-100 mb-8">
              Consent has not yet been signed.
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input 
                type="number" 
                {...register('age')} 
                defaultValue={client.intake_form?.age || ''} 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Presenting Concern</label>
              <textarea 
                {...register('concern')} 
                defaultValue={client.intake_form?.concern || ''} 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none" 
                rows="4"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
              <textarea 
                {...register('history')} 
                defaultValue={client.intake_form?.history || ''} 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none" 
                rows="4"
              ></textarea>
            </div>
            
            {!client.consent_signed_at && (
              <div className="flex items-start gap-3 mt-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <input 
                  type="checkbox" 
                  {...register('consent')} 
                  required 
                  className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700">
                  <span className="font-medium block mb-1">Digital Consent</span>
                  I consent to therapy services and have reviewed the privacy and confidentiality policies.
                </label>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
              >
                Save Intake Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
