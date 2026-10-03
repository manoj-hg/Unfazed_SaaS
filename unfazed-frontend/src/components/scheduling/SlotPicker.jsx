import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { format, parseISO } from 'date-fns';

const SlotPicker = ({ slug, startDate, endDate, selectedSlot, onSelectSlot }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await axiosInstance.get(`/scheduling/${slug}/slots?start_date=${startDate}&end_date=${endDate}`);
        setSlots(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [slug, startDate, endDate]);

  if (loading) return <div>Loading slots...</div>;
  if (slots.length === 0) return <div>No slots available for this period.</div>;

  const slotsByDate = slots.reduce((acc, slot) => {
    const dateStr = format(parseISO(slot.start_time), 'yyyy-MM-dd');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(slot);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.keys(slotsByDate).sort().map(dateStr => (
        <div key={dateStr}>
          <h3 className="font-semibold text-lg mb-2">{format(parseISO(dateStr), 'EEEE, MMMM d, yyyy')}</h3>
          <div className="flex flex-wrap gap-2">
            {slotsByDate[dateStr].map((slot, idx) => {
              const isSelected = selectedSlot?.start_time === slot.start_time;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectSlot(slot)}
                  className={`px-4 py-2 rounded border ${
                    isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {format(parseISO(slot.start_time), 'h:mm a')}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SlotPicker;
