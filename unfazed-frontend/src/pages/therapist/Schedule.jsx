import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Clock, Calendar, Save, CheckCircle, Video, XCircle, AlertCircle } from 'lucide-react';
import Loader from '../../components/common/Loader';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const Schedule = () => {
  const [availability, setAvailability] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [availRes, sessRes] = await Promise.all([
          axiosInstance.get('/scheduling/availability'),
          axiosInstance.get('/scheduling/sessions')
        ]);
        setAvailability(availRes.data);
        setSessions(sessRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDayToggle = (day) => {
    setAvailability((prev) => ({
      ...prev,
      weekly_schedule: {
        ...prev.weekly_schedule,
        [day]: {
          ...prev.weekly_schedule[day],
          isAvailable: !prev.weekly_schedule[day]?.isAvailable
        }
      }
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setAvailability((prev) => ({
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
    setSaving(true);
    setSaveSuccess(false);
    try {
      await axiosInstance.post('/scheduling/availability', availability);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update availability schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to cancel this booked session?')) return;
    try {
      await axiosInstance.put(`/scheduling/sessions/${sessionId}/cancel`);
      setSessions((prev) =>
        prev.map((s) => (s._id === sessionId ? { ...s, status: 'cancelled' } : s))
      );
    } catch (err) {
      alert('Failed to cancel session');
    }
  };

  if (loading) return <Loader text="Loading schedule and consultation hours..." />;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
          Module 2: Scheduling & Timezones
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
          Availability & Appointment Calendar
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure your working hours. The system dynamically computes open slots, respects buffers, and converts to client timezones.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Availability Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="text-indigo-600" size={20} />
              <h2 className="text-lg font-bold text-slate-900">Weekly Operating Hours</h2>
            </div>
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                <CheckCircle size={14} /> Schedule Saved!
              </span>
            )}
          </div>

          {/* Practice Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Session Length
              </label>
              <select
                value={availability.session_duration || 60}
                onChange={(e) => setAvailability({ ...availability, session_duration: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (Standard)</option>
                <option value={90}>90 Minutes (Deep Session)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Buffer Time
              </label>
              <select
                value={availability.buffer_time || 15}
                onChange={(e) => setAvailability({ ...availability, buffer_time: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value={5}>5 Minutes</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Timezone
              </label>
              <input
                type="text"
                value={availability.timezone || 'Asia/Kolkata'}
                onChange={(e) => setAvailability({ ...availability, timezone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Days Schedule */}
          <div className="space-y-3 pt-2">
            {DAYS.map((day) => {
              const dayData = availability.weekly_schedule?.[day] || {
                isAvailable: false,
                start: '09:00',
                end: '17:00'
              };

              return (
                <div
                  key={day}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    dayData.isAvailable
                      ? 'bg-white border-slate-200 shadow-2xs'
                      : 'bg-slate-50/70 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`day-${day}`}
                      checked={dayData.isAvailable}
                      onChange={() => handleDayToggle(day)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor={`day-${day}`} className="font-bold text-sm text-slate-900 capitalize cursor-pointer">
                      {day}
                    </label>
                  </div>

                  {dayData.isAvailable ? (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">From</span>
                      <input
                        type="time"
                        value={dayData.start}
                        onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none"
                      />
                      <span className="text-slate-400">to</span>
                      <input
                        type="time"
                        value={dayData.end}
                        onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none"
                      />
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">Unavailable / Off day</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Availability Changes'}</span>
            </button>
          </div>
        </form>

        {/* Sessions Stream */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Booked Consultations</h2>
            <p className="text-xs text-slate-400">Live feed from database</p>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {sessions.map((session) => (
              <div
                key={session._id}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{session.client_name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      session.status === 'booked'
                        ? 'bg-emerald-100 text-emerald-800'
                        : session.status === 'completed'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {session.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} className="text-slate-400" />
                    <span>
                      {new Date(session.start_time).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={12} className="text-slate-400" />
                    <span>
                      {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {session.status === 'booked' && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <a
                      href={`https://meet.unfazed.in/session-${session._id.toString().slice(-6)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                    >
                      <Video size={13} />
                      <span>Telehealth Room</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCancelSession(session._id)}
                      className="text-rose-600 hover:text-rose-700 font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}

            {sessions.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                No sessions booked yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
