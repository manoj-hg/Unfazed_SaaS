import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Link as LinkIcon, Users, Calendar, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const publicLink = `${window.location.origin}/${user?.slug}`;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Good morning, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-gray-500 mt-2">Here's what's happening with your practice today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-3 mb-4 text-blue-600">
            <div className="p-2 bg-blue-50 rounded-lg">
              <LinkIcon size={24} />
            </div>
            <h2 className="font-semibold text-gray-900">Your Portal</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4 flex-1">Share this link with clients to let them book sessions.</p>
          <a 
            href={publicLink} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span className="truncate w-48">{publicLink}</span>
            <ArrowRight size={16} />
          </a>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-3 mb-4 text-purple-600">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users size={24} />
            </div>
            <h2 className="font-semibold text-gray-900">Clients</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4 flex-1">Manage your active clients, review intakes, and view history.</p>
          <Link 
            to="/dashboard/clients"
            className="flex items-center justify-center gap-2 p-3 bg-purple-50 text-purple-700 rounded-xl text-sm font-medium hover:bg-purple-100 transition-colors"
          >
            Go to CRM
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-3 mb-4 text-green-600">
            <div className="p-2 bg-green-50 rounded-lg">
              <Calendar size={24} />
            </div>
            <h2 className="font-semibold text-gray-900">Schedule</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4 flex-1">Update your weekly availability and buffer times.</p>
          <Link 
            to="/dashboard/schedule"
            className="flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors"
          >
            Manage Schedule
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
