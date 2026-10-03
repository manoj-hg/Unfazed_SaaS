import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Clock } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const Schedule = () => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await axiosInstance.get('/scheduling/availability');
        setAvailability(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, []);

  const handleChange = (day, field, value) => {
    setAvailability(prev => ({
      ...prev,
      weekly_schedule: {
        ...prev.weekly_schedule,
        [day]: {
          ...prev.weekly_schedule[day],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/scheduling/availability', availability);
      alert('Schedule updated!');
    } catch (err) {
      alert('Failed to update schedule');
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading schedule...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Availability</h1>
        <p className="text-gray-500 mt-1">Set your weekly schedule for clients to book sessions.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 shadow-sm rounded-2xl border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Duration (min)</label>
            <select 
              value={availability.session_duration || 60} 
              onChange={e => setAvailability({...availability, session_duration: Number(e.target.value)})}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value={30}>30</option>
              <option value={45}>45</option>
              <option value={60}>60</option>
              <option value={90}>90</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buffer Time (min)</label>
            <input 
              type="number" 
              value={availability.buffer_time || 15}
              onChange={e => setAvailability({...availability, buffer_time: Number(e.target.value)})}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <input 
              type="text" 
              value={availability.timezone || 'Asia/Kolkata'}
              onChange={e => setAvailability({...availability, timezone: e.target.value})}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <Clock className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Weekly Schedule</h2>
        </div>

        <div className="space-y-4">
          {DAYS.map(day => {
            const dayData = availability.weekly_schedule?.[day] || { isAvailable: false, start: '09:00', end: '17:00' };
            return (
              <div key={day} className={`flex items-center flex-wrap gap-4 p-4 rounded-xl border ${dayData.isAvailable ? 'bg-blue-50/30 border-blue-100' : 'bg-gray-50/50 border-gray-100'}`}>
                <label className="w-32 capitalize flex items-center gap-3 font-medium text-gray-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={dayData.isAvailable}
                    onChange={e => handleChange(day, 'isAvailable', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  {day}
                </label>
                {dayData.isAvailable ? (
                  <div className="flex items-center gap-3">
                    <input 
                      type="time" 
                      value={dayData.start}
                      onChange={e => handleChange(day, 'start', e.target.value)}
                      className="p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    />
                    <span className="text-gray-400 font-medium">to</span>
                    <input 
                      type="time" 
                      value={dayData.end}
                      onChange={e => handleChange(day, 'end', e.target.value)}
                      className="p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">Unavailable</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            Save Availability
          </button>
        </div>
      </form>
    </div>
  );
};

export default Schedule;
