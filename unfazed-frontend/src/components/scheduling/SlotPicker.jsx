import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { format, parseISO } from 'date-fns';
import { Clock, Calendar, AlertCircle } from 'lucide-react';

const SlotPicker = ({ slug, startDate, endDate, selectedSlot, onSelectSlot, onWaitlistClick }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(`/scheduling/${slug}/slots?start_date=${startDate}&end_date=${endDate}`);
        setSlots(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch available consultation slots.');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchSlots();
  }, [slug, startDate, endDate]);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin mb-3"></div>
        <p className="text-xs font-semibold">Calculating open practice slots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2">
        <AlertCircle size={16} />
        <span>{error}</span>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <Calendar size={32} className="mx-auto text-slate-300 mb-2" />
        <h4 className="font-bold text-slate-800 text-sm">No Open Slots in this Window</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          The practitioner's calendar is currently filled. You can join the priority waitlist to be auto-notified when a spot frees up.
        </p>
        {onWaitlistClick && (
          <button
            onClick={onWaitlistClick}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            Join Priority Waitlist
          </button>
        )}
      </div>
    );
  }

  const slotsByDate = slots.reduce((acc, slot) => {
    const dateStr = format(parseISO(slot.start_time), 'yyyy-MM-dd');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(slot);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.keys(slotsByDate).sort().map((dateStr) => {
        const dateObj = parseISO(dateStr);
        const dayLabel = format(dateObj, 'EEEE, MMMM d');

        return (
          <div key={dateStr} className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={14} className="text-indigo-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">{dayLabel}</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {slotsByDate[dateStr].map((slot, idx) => {
                const isSelected = selectedSlot?.start_time === slot.start_time;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectSlot(slot)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-102 ring-2 ring-indigo-500/20'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    <Clock size={12} className={isSelected ? 'text-indigo-200' : 'text-slate-400'} />
                    <span>{format(parseISO(slot.start_time), 'h:mm a')}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SlotPicker;
