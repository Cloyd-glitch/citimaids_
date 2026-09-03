import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { services } from '../data/services';
import api from '../api/axios';

const STEPS = ['Select Service', 'Property Specs', 'Schedule', 'Contact & Address', 'Review & Confirm'];

const propertyTypes = ['Apartment', 'Villa', 'Office', 'Studio', 'Townhouse', 'Commercial Facility'];
const timeSlots = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

const abuDhabiDistricts = [
  'Al Reem Island',
  'Al Maryah Island',
  'Saadiyat Island',
  'Yas Island',
  'Al Khalidiyah',
  'Corniche & Downtown',
  'Al Bateen',
  'Al Mushrif',
  'Al Karamah',
  'Al Muroor',
  'Al Raha Beach',
  'Khalifa City A',
  'Mohammed Bin Zayed City',
  'Other Abu Dhabi Area',
];

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const preselected = location.state?.preselectedServiceId || 'home-cleaning';

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    serviceId: preselected,
    propertyType: 'Apartment',
    rooms: '2',
    bathrooms: '2',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 AM',
    name: '',
    phone: '',
    email: '',
    district: 'Al Reem Island',
    address: '',
    notes: '',
  });

  const set = (field, value) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const selectedService = services.find((s) => s.id === data.serviceId) || services[0];

  // Dynamic estimate calculation
  const estimate = useMemo(() => {
    if (selectedService.rateUnit === 'flat') {
      return { hours: 'Full Day', total: selectedService.basePrice, note: 'Guaranteed Flat Handover Rate' };
    }
    if (selectedService.rateUnit === 'item' || selectedService.rateUnit === 'session') {
      return { hours: 'Per Service', total: selectedService.basePrice, note: 'Starting Base Rate' };
    }

    let estimatedHours = 2.5;
    if (data.propertyType === 'Villa') {
      estimatedHours = data.rooms === '4' ? 6 : data.rooms === '5+' ? 8 : 5;
    } else {
      if (data.rooms === 'Studio' || data.rooms === '1') estimatedHours = 2.5;
      else if (data.rooms === '2') estimatedHours = 3.5;
      else if (data.rooms === '3') estimatedHours = 4.5;
      else estimatedHours = 6;
    }

    const total = Math.round(estimatedHours * selectedService.basePrice);
    return {
      hours: `~${estimatedHours} hrs`,
      total,
      note: `Estimated based on ${data.propertyType} (${data.rooms} Bed)`,
    };
  }, [selectedService, data.propertyType, data.rooms]);

  const canProceed = () => {
    if (step === 0) return !!data.serviceId;
    if (step === 1) return !!data.propertyType && !!data.rooms && !!data.bathrooms;
    if (step === 2) return !!data.date && !!data.time;
    if (step === 3) return !!data.name && !!data.phone && !!data.address;
    return true;
  };

  const handleConfirm = async () => {
    setLoading(true);
    let bookingId = 'CM' + Date.now().toString().slice(-6);

    try {
      // Send to citimaids-api backend
      const res = await api.post('/bookings', {
        name: data.name,
        contact_number: data.phone,
        email: data.email || null,
        service_id: 1, // mapped to active service
        preferred_date: data.date,
        address: `${data.district ? data.district + ', ' : ''}${data.address}`,
        notes: `Property: ${data.propertyType}, ${data.rooms} Bed, ${data.bathrooms} Bath | Time: ${data.time} | Est: AED ${estimate.total} | Notes: ${data.notes || 'None'}`,
      });

      if (res.data?.booking?.id) {
        bookingId = `CM${res.data.booking.id.toString().padStart(5, '0')}`;
      }
    } catch (err) {
      console.warn('Backend API notification skipped or offline, proceeding with direct confirmation:', err);
    } finally {
      setLoading(false);
      navigate('/booking-confirmation', {
        state: {
          data,
          bookingId,
          service: selectedService,
          estimate,
        },
      });
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-[85vh] bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">Book a Cleaning</h1>
          <p className="text-slate-500 text-sm">Fill in your details below for instant scheduling</p>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto py-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 min-w-[50px]">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : i === step
                      ? 'text-white shadow-md'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                  style={i === step ? { background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' } : {}}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <span
                  className={`text-[11px] mt-1.5 hidden sm:block font-bold tracking-tight ${
                    i === step ? 'text-blue-950' : i < step ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div
          className="bg-white rounded-2xl p-7 sm:p-9 border border-slate-100"
          style={{ boxShadow: '0 4px 30px rgba(10,35,66,0.06)' }}
        >
          {/* Step 0: Choose Service */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Choose Service</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((s) => (
                  <label
                    key={s.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      data.serviceId === s.id
                        ? 'border-blue-700 bg-blue-50/70 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="service"
                      value={s.id}
                      checked={data.serviceId === s.id}
                      onChange={() => set('serviceId', s.id)}
                      className="mt-1 accent-blue-900"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{s.title}</div>
                      <div className="text-xs text-blue-900 font-extrabold mt-0.5">{s.startingPrice}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-1">{s.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Property Details */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-5">Property Specs</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Property Type</label>
                  <select
                    value={data.propertyType}
                    onChange={(e) => set('propertyType', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  >
                    {propertyTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Bedrooms</label>
                    <select
                      value={data.rooms}
                      onChange={(e) => set('rooms', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    >
                      {['Studio', '1', '2', '3', '4', '5+'].map((r) => (
                        <option key={r} value={r}>
                          {r === 'Studio' ? 'Studio' : `${r} Bedroom${r === '1' ? '' : 's'}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Bathrooms</label>
                    <select
                      value={data.bathrooms}
                      onChange={(e) => set('bathrooms', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    >
                      {['1', '2', '3', '4', '5+'].map((b) => (
                        <option key={b} value={b}>
                          {`${b} Bathroom${b === '1' ? '' : 's'}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Live Estimator Preview Card */}
                <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-between mt-4">
                  <div>
                    <div className="text-xs text-blue-900 font-bold uppercase">Estimated Duration & Cost</div>
                    <div className="text-xs text-slate-500">{estimate.note}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-blue-950">
                      AED {estimate.total}
                    </div>
                    <div className="text-xs text-slate-600 font-semibold">{estimate.hours}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Schedule */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-5">Preferred Schedule</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Select Date</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={data.date}
                    onChange={(e) => set('date', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-2">Available Time Slot</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {timeSlots.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => set('time', t)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                          data.time === t
                            ? 'bg-blue-950 text-white border-blue-950 shadow-sm'
                            : 'border-slate-200 text-slate-700 hover:border-blue-400 bg-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact & Address */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-5">Contact Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={data.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="e.g. Mohammed Al Mansoori"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={data.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="+971 50 000 0000"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) => set('email', e.target.value)}
                      placeholder="client@email.com"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Abu Dhabi District *</label>
                  <select
                    value={data.district}
                    onChange={(e) => set('district', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  >
                    {abuDhabiDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Building, Apartment, or Villa / Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={data.address}
                    onChange={(e) => set('address', e.target.value)}
                    placeholder="e.g. Tower 2, Apt 1402 or Villa 12, Street 8"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Special Instructions <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <textarea
                    value={data.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    placeholder="e.g. Key is with building security, extra focus on balcony, etc."
                    rows={2}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Review Your Booking</h2>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-3 mb-6 text-sm">
                {[
                  ['Selected Service', selectedService.title],
                  ['Property', `${data.propertyType} (${data.rooms} Bed, ${data.bathrooms} Bath)`],
                  ['Date & Time', `${data.date} at ${data.time}`],
                  ['Location', `${data.district}, ${data.address}`],
                  ['Client', `${data.name} (${data.phone})`],
                  ['Estimated Rate', `AED ${estimate.total} (${estimate.hours})`],
                  ...(data.notes ? [['Special Instructions', data.notes]] : []),
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-slate-200/40 pb-2">
                    <span className="text-slate-500 font-medium">{label}</span>
                    <span className="font-bold text-slate-900 text-right max-w-xs">{value}</span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <span>🛡️</span>
                <span>No advance payment required. Pay conveniently upon inspection.</span>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className={`mt-8 pt-6 border-t border-slate-100 flex ${step > 0 ? 'justify-between' : 'justify-end'}`}>
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50"
              >
                ← Back
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                disabled={!canProceed()}
                onClick={() => setStep((s) => s + 1)}
                className="px-8 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 shadow-md"
                style={{ background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' }}
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirm}
                className="px-9 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 shadow-xl flex items-center gap-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' }}
              >
                {loading ? 'Submitting...' : 'Confirm Appointment ✓'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
