import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import SlotPicker from '../../components/scheduling/SlotPicker';
import CheckoutForm from '../../components/payments/CheckoutForm';
import Loader from '../../components/common/Loader';
import { format, addDays, parseISO } from 'date-fns';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Video, 
  ShieldCheck, 
  Download,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const BookingPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const packageId = searchParams.get('packageId');

  const [therapist, setTherapist] = useState(null);
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Flow steps: 'slot' -> 'intake' -> 'checkout' -> 'confirmed'
  const [step, setStep] = useState('slot');
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Client Details & Intake Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [concern, setConcern] = useState('');
  const [consent, setConsent] = useState(false);

  // Confirmed Session State
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Waitlist Modal State
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [waitlistNotes, setWaitlistNotes] = useState('');

  const startDate = new Date();
  const endDate = addDays(startDate, 14);

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        const res = await axiosInstance.get(`/therapist/${slug}`);
        setTherapist(res.data);
        if (packageId && res.data.packages) {
          const matchedPkg = res.data.packages.find((p) => p._id === packageId);
          setPackageData(matchedPkg);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchTherapist();
  }, [slug, packageId]);

  const handleProceedToIntake = () => {
    if (!selectedSlot) return alert('Please select an available consultation slot.');
    setStep('intake');
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!consent) return alert('You must accept the informed clinical consent to proceed.');
    setStep('checkout');
  };

  const handlePaymentSuccess = async (paymentRecord) => {
    try {
      // Complete booking on backend
      const bookRes = await axiosInstance.post(`/scheduling/${slug}/book`, {
        client_name: name,
        client_email: email,
        client_phone: phone,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time
      });

      // Submit digital intake form & consent timestamp
      if (bookRes.data?.client?.id) {
        await axiosInstance.post(`/clients/${bookRes.data.client.id}/intake`, {
          intake_form: {
            age,
            concern,
            emergency_contact: phone
          },
          consent: true
        });
      }

      setConfirmedBooking({
        session: bookRes.data.session,
        payment: paymentRecord
      });
      setStep('confirmed');
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording session booking.');
    }
  };

  const handleDownloadCalendar = () => {
    if (!selectedSlot) return;
    const start = new Date(selectedSlot.start_time).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const end = new Date(selectedSlot.end_time).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const title = `Therapy Session with ${therapist?.name}`;
    const details = `Telehealth Consultation Session. Meeting Room: https://meet.unfazed.in/${slug}`;
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${title}\nDESCRIPTION:${details}\nDTSTART:${start}\nDTEND:${end}\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `appointment-${slug}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(`/scheduling/${slug}/waitlist`, {
        name,
        email,
        phone,
        notes: waitlistNotes
      });
      setWaitlistSuccess(true);
    } catch (err) {
      alert('Failed to join waitlist');
    }
  };

  if (loading) return <Loader text="Loading booking schedule and fee schedules..." />;

  const amountToCharge = packageData ? packageData.price : (therapist?.session_rate || 2000);

  // Screen 4: Booking Confirmed
  if (step === 'confirmed') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-200 text-center max-w-lg w-full space-y-6 animate-fadeIn">
          <div className="w-18 h-18 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
              Confirmed & Paid
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-heading">
              Your Session is Booked!
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              We have dispatched a WhatsApp & Email confirmation to <strong>{email}</strong>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2">
            <div className="flex justify-between font-bold text-slate-800">
              <span>Practitioner:</span>
              <span className="text-indigo-600">{therapist?.name}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Date:</span>
              <span>{format(new Date(selectedSlot.start_time), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Time:</span>
              <span>
                {format(new Date(selectedSlot.start_time), 'h:mm a')} - {format(new Date(selectedSlot.end_time), 'h:mm a')}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Telehealth Link:</span>
              <span className="font-mono text-indigo-600 truncate max-w-[200px]">meet.unfazed.in/{slug}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadCalendar}
              className="flex-1 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>Add to Calendar (.ics)</span>
            </button>
            <Link
              to={`/${slug}`}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-colors"
            >
              Back to Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Back Link */}
        <Link
          to={`/${slug}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to {therapist?.name}'s Profile</span>
        </Link>

        {/* Steps Progress Indicator */}
        <div className="flex items-center justify-between max-w-md mx-auto">
          {[
            { id: 'slot', label: '1. Select Time' },
            { id: 'intake', label: '2. Intake & Consent' },
            { id: 'checkout', label: '3. Advance Payment' }
          ].map((st, idx) => (
            <div key={st.id} className="flex items-center gap-2 text-xs font-bold">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                  step === st.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {idx + 1}
              </span>
              <span className={step === st.id ? 'text-indigo-600' : 'text-slate-400'}>
                {st.label}
              </span>
            </div>
          ))}
        </div>

        {/* STEP 1: Select Time */}
        {step === 'slot' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-2xs space-y-6">
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Select an Open Consultation Slot</h2>
                  <p className="text-xs text-slate-400">
                    Displaying available dates across the next 14 days in your local timezone.
                  </p>
                </div>
              </div>

              <SlotPicker
                slug={slug}
                startDate={format(startDate, 'yyyy-MM-dd')}
                endDate={format(endDate, 'yyyy-MM-dd')}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
                onWaitlistClick={() => setIsWaitlistOpen(true)}
              />
            </div>

            {/* Sidebar Summary */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6 h-fit">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                  Booking Summary
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  {packageData ? packageData.name : 'Individual Consultation'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">With {therapist?.name}</p>
              </div>

              {selectedSlot ? (
                <div className="p-4 bg-indigo-50/70 text-indigo-950 rounded-2xl border border-indigo-100 text-xs space-y-1">
                  <span className="font-bold block text-indigo-700">Selected Slot:</span>
                  <div className="font-semibold">{format(new Date(selectedSlot.start_time), 'EEEE, MMMM d, yyyy')}</div>
                  <div className="text-slate-600">
                    {format(new Date(selectedSlot.start_time), 'h:mm a')} - {format(new Date(selectedSlot.end_time), 'h:mm a')}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl border border-dashed border-slate-200 text-xs text-center">
                  Click on an open time chip on the left to select your slot.
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-semibold">Total Fee:</span>
                <span className="text-2xl font-black text-slate-900">₹{amountToCharge.toLocaleString('en-IN')}</span>
              </div>

              <button
                type="button"
                disabled={!selectedSlot}
                onClick={handleProceedToIntake}
                className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Proceed to Intake Details
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Intake Form & Digital Consent */}
        {step === 'intake' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-2xs space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                Clinical Compliance (Module 3)
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
                Intake & Informed Consent
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your medical history and disclosures are kept under strict doctor-patient confidentiality.
              </p>
            </div>

            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Patel"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya@example.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number (WhatsApp) *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 29"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Presenting Concern / Goal for Therapy
                </label>
                <textarea
                  rows={3}
                  value={concern}
                  onChange={(e) => setConcern(e.target.value)}
                  placeholder="Briefly describe what challenges or emotional patterns you wish to explore..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              {/* Digital Consent Checkbox */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent-check"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                  />
                  <label htmlFor="consent-check" className="text-slate-700 leading-relaxed cursor-pointer">
                    <strong>I consent to telehealth psychological services.</strong> I acknowledge the confidentiality limits, emergency referral terms, and the 24-hour cancellation protocol. My confirmation acts as a legally valid electronic signature.
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep('slot')}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  ← Back to Slots
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Continue to Advance Payment
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Advance Checkout with Razorpay */}
        {step === 'checkout' && (
          <div className="max-w-md mx-auto space-y-6">
            <button
              type="button"
              onClick={() => setStep('intake')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 inline-block mb-2"
            >
              ← Back to Intake Form
            </button>

            <CheckoutForm
              amount={amountToCharge}
              itemType={packageData ? 'package' : 'session'}
              referenceId={packageData ? packageData._id : null}
              therapistId={therapist?._id}
              clientDetails={{ name, email, phone }}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </div>
        )}

        {/* Stretch Goal: Priority Waitlist Modal */}
        {isWaitlistOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-base">Join Priority Waitlist</h3>
                <button onClick={() => setIsWaitlistOpen(false)} className="text-xs font-bold text-slate-400">
                  Close
                </button>
              </div>

              {waitlistSuccess ? (
                <div className="py-6 text-center text-xs space-y-2">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                  <p className="font-bold text-slate-800">You are on the priority waitlist!</p>
                  <p className="text-slate-500">We will notify you on WhatsApp as soon as an opening appears.</p>
                </div>
              ) : (
                <form onSubmit={handleJoinWaitlist} className="space-y-3 text-xs">
                  <p className="text-slate-500">
                    Dr. {therapist?.name} has limited openings. Enter your details to be first in line when a slot frees up.
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="Your Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <textarea
                    rows={2}
                    placeholder="Preferred time (e.g. Weekend mornings)..."
                    value={waitlistNotes}
                    onChange={(e) => setWaitlistNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Submit Waitlist Request
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
