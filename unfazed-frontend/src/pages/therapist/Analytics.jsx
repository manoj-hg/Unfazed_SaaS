import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get('/analytics');
        setStats(res.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setError('Upgrade your subscription to access this feature.');
        } else {
          setError('Failed to load analytics.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center mt-20">
        <h2 className="text-3xl font-bold text-gray-700 mb-4">Advanced Analytics Locked</h2>
        <p className="text-xl text-gray-500 mb-8">{error}</p>
        <button className="bg-blue-600 text-white px-8 py-3 rounded text-lg">
          Upgrade to Pro
        </button>
      </div>
    );
  }

  const mockData = [
    { name: 'Week 1', revenue: stats.revenue * 0.2 },
    { name: 'Week 2', revenue: stats.revenue * 0.3 },
    { name: 'Week 3', revenue: stats.revenue * 0.1 },
    { name: 'Week 4', revenue: stats.revenue * 0.4 },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Active Clients</h3>
          <p className="text-4xl font-bold">{stats.activeClientsCount}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Completed Sessions (This Month)</h3>
          <p className="text-4xl font-bold">{stats.completedSessions}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Revenue (This Month)</h3>
          <p className="text-4xl font-bold">₹{stats.revenue}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow h-[400px]">
        <h3 className="text-xl font-semibold mb-6">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
