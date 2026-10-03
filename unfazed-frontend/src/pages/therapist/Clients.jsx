import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Link } from 'react-router-dom';
import { UserCircle } from 'lucide-react';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axiosInstance.get('/clients');
        setClients(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Loading clients...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">Manage your active and past clients.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
            <tr>
              <th className="p-5 font-medium">Client Info</th>
              <th className="p-5 font-medium">Status</th>
              <th className="p-5 font-medium">Joined</th>
              <th className="p-5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.map(client => (
              <tr key={client._id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <UserCircle className="w-10 h-10 text-gray-300" />
                    <div>
                      <div className="font-semibold text-gray-900">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    client.status === 'active' ? 'bg-green-100 text-green-700' : 
                    client.status === 'lead' ? 'bg-amber-100 text-amber-700' : 
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </span>
                </td>
                <td className="p-5 text-gray-500 text-sm">
                  {new Date(client.createdAt).toLocaleDateString()}
                </td>
                <td className="p-5 text-right">
                  <Link 
                    to={`/dashboard/clients/${client._id}`} 
                    className="inline-flex items-center justify-center p-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    View Profile
                  </Link>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500 bg-gray-50/30">
                  You don't have any clients yet. Once they book, they will appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clients;
