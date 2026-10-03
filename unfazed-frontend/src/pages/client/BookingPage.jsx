import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SlotPicker from '../../components/scheduling/SlotPicker';
import axiosInstance from '../../api/axiosInstance';
import { format, addDays } from 'date-fns';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const BookingPage = () => {
  const { slug } = useParams();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return alert('Select a slot first');
    try {
      await axiosInstance.post(`/scheduling/${slug}/book`, {
        client_name: clientName,
        client_email: clientEmail,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time
      });
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book slot');
    }
  };

  const startDate = new Date();
  const endDate = addDays(startDate, 14);

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-green-100 border border-green-50 text-center max-w-md w-full">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-8">We've sent a confirmation email to {clientEmail}.</p>
          <Link to={`/${slug}`} className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors">
            Return to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <Link to={`/${slug}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft size={20} />
          Back to Profile
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Book your session</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 border-b pb-4">Select a Time</h2>
            <SlotPicker 
              slug={slug} 
              startDate={format(startDate, 'yyyy-MM-dd')} 
              endDate={format(endDate, 'yyyy-MM-dd')} 
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
            />
          </div>
          
          <div className="w-full lg:w-96">
            <div className={`bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-8 transition-opacity duration-300 ${selectedSlot ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <h2 className="text-xl font-semibold mb-6 border-b pb-4">Confirm Details</h2>
              {selectedSlot ? (
                <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-xl font-medium border border-blue-100">
                  {format(new Date(selectedSlot.start_time), 'EEEE, MMMM d')}
                  <br />
                  {format(new Date(selectedSlot.start_time), 'h:mm a')} - {format(new Date(selectedSlot.end_time), 'h:mm a')}
                </div>
              ) : (
                <div className="mb-6 p-4 bg-gray-50 text-gray-500 rounded-xl border border-gray-100">
                  Please select a time slot first.
                </div>
              )}

              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={clientName} 
                    onChange={e => setClientName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={clientEmail} 
                    onChange={e => setClientEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="jane@example.com"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={!selectedSlot}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mt-4 shadow-md shadow-blue-500/20"
                >
                  Confirm & Book
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
