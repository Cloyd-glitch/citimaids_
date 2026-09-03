import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { services } from '../data/services';
import api from '../api/axios';

const STEPS = [
  { key: 'service',  label: 'Service',     icon: StepServiceIcon },
  { key: 'datetime', label: 'Date & Time', icon: StepDateIcon },
  { key: 'address',  label: 'Address',     icon: StepAddressIcon },
  { key: 'contact',  label: 'Contact',     icon: StepContactIcon },
  { key: 'review',   label: 'Review',      icon: StepReviewIcon },
];

const timeSlots = [
  '7:00 AM', '9:00 AM', '11:00 AM',
  '1:00 PM', '3:00 PM', '5:00 PM',
];

const propertyTypes = ['Apartment', 'Villa', 'Office', 'Studio', 'Townhouse', 'Commercial Facility'];

export const uaeDistricts = {
  'Abu Dhabi': [
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
  ],
  'Dubai': [
    'Downtown Dubai',
    'Dubai Marina',
    'Jumeirah Beach Residence (JBR)',
    'Palm Jumeirah',
    'Business Bay',
    'Jumeirah Lakes Towers (JLT)',
    'Dubai Hills Estate',
    'Arabian Ranches',
    'Damac Hills',
    'Al Barsha',
    'Jumeirah Village Circle (JVC)',
    'Jumeirah Village Triangle (JVT)',
    'Dubai Creek Harbour',
    'Mirdif',
    'Deira / Bur Dubai',
    'Other Dubai Area',
  ],
  'Sharjah': [
    'Al Majaz',
    'Al Nahda',
    'Al Qasimia',
    'Al Taawun',
    'Al Khan',
    'Al Mamzar',
    'Muwaileh Commercial',
    'University City',
    'Al Zahia (Uptown)',
    'Al Heerah Suburb',
    'Al Suyoh',
    'Al Rahmaniya',
    'Other Sharjah Area',
  ],
};

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
    time: '9:00 AM',
    name: '',
    phone: '',
    email: '',
    city: 'Abu Dhabi',
    district: 'Al Reem Island',
    streetAddress: '',
    zipCode: '',
    notes: '',
  });

  const set = (field, value) => setData((prev) => ({ ...prev, [field]: value }));

  const handleCityChange = (newCity) => {
    setData((prev) => ({
      ...prev,
      city: newCity,
      district: uaeDistricts[newCity]?.[0] || '',
    }));
  };

  const selectedService = services.find((s) => s.id === data.serviceId) || services[0];

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
    return { hours: `~${estimatedHours} hrs`, total, note: `Estimated based on ${data.propertyType} (${data.rooms} Bed)` };
  }, [selectedService, data.propertyType, data.rooms]);

  const canProceed = () => {
    if (step === 0) return !!data.serviceId;
    if (step === 1) return !!data.date && !!data.time;
    if (step === 2) return !!data.streetAddress && !!data.district && !!data.city;
    if (step === 3) return !!data.name && !!data.phone;
    return true;
  };

  const handleConfirm = async () => {
    setLoading(true);
    let bookingId = 'CM' + Date.now().toString().slice(-6);
    try {
      const res = await api.post('/bookings', {
        name: data.name,
        contact_number: data.phone,
        email: data.email || null,
        service_id: 1,
        preferred_date: data.date,
        address: `${data.district ? data.district + ', ' : ''}${data.streetAddress}${data.city ? ', ' + data.city : ''}${data.zipCode ? ' ' + data.zipCode : ''}`,
        notes: `Property: ${data.propertyType}, ${data.rooms} Bed, ${data.bathrooms} Bath | Time: ${data.time} | Est: AED ${estimate.total} | Notes: ${data.notes || 'None'}`,
      });
      if (res.data?.booking?.id) {
        bookingId = `CM${res.data.booking.id.toString().padStart(5, '0')}`;
      }
    } catch (err) {
      console.warn('Backend API notification skipped or offline:', err);
    } finally {
      setLoading(false);
      navigate('/booking-confirmation', {
        state: { data, bookingId, service: selectedService, estimate },
      });
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const freshnessIndex = useMemo(() => {
    const base = selectedService.basePrice;
    if (base >= 300) return 'S+';
    if (base >= 60)  return 'S4';
    if (base >= 45)  return 'S3';
    return 'S4';
  }, [selectedService]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* ═══ Hero Banner ═══ */}
      <div style={{
        background: 'linear-gradient(135deg, #061429 0%, #0A2342 50%, #1E3A8A 100%)',
        padding: '120px 24px 48px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#60a5fa" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 800, margin: '0 0 6px', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.5px' }}>
            Book a Cleaning
          </h1>
          <p style={{ color: '#93c5fd', fontSize: 14, fontWeight: 500, margin: 0 }}>
            Fill in your details below for instant scheduling
          </p>
        </div>
      </div>

      {/* ═══ Step Progress Bar ═══ */}
      <div style={{ maxWidth: 720, margin: '-24px auto 0', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#fff', borderRadius: 20, padding: '20px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(10,35,66,0.08)',
          border: '1px solid #e2e8f0',
          gap: 0,
        }}>
          {STEPS.map((s, i) => {
            const isDone = i < step;
            const isCurrent = i === step;
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 56 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDone ? '#0A2342' : isCurrent ? '#0A2342' : '#e2e8f0',
                    color: isDone || isCurrent ? '#fff' : '#94a3b8',
                    transition: 'all 0.3s',
                    boxShadow: isCurrent ? '0 4px 12px rgba(10,35,66,0.25)' : 'none',
                  }}>
                    {isDone ? (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <s.icon />
                    )}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, marginTop: 6, textAlign: 'center',
                    color: isDone ? '#0A2342' : isCurrent ? '#0A2342' : '#94a3b8',
                    letterSpacing: 0.2,
                  }}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: 2, margin: '0 6px',
                    background: isDone ? '#0A2342' : '#e2e8f0',
                    borderRadius: 1, transition: 'background 0.3s',
                    marginBottom: 20,
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ Main Content (Form + Order Reflection Sidebar) ═══ */}
      <div className="booking-grid" style={{
        maxWidth: 1080, margin: '32px auto 64px', padding: '0 24px',
        display: 'grid', gap: 28,
        alignItems: 'start',
      }}>
        {/* ── Left: Form Card ── */}
        <div style={{
          background: '#fff', borderRadius: 20, padding: '36px 32px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 24px rgba(10,35,66,0.04)',
        }}>
          {/* Step Label */}
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: 1.2 }}>
              Step {step + 1}
            </span>
          </div>

          {/* ── STEP 0: Choose Service ── */}
          {step === 0 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0A2342', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                What do you need cleaned?
              </h2>
              <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 24px' }}>
                Select the service that best fits your property.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {services.map((s) => {
                  const isSelected = data.serviceId === s.id;
                  return (
                    <label key={s.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '16px 16px', borderRadius: 14,
                      border: isSelected ? '2px solid #0A2342' : '1.5px solid #e2e8f0',
                      background: isSelected ? '#eff6ff' : '#fff',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                      <input
                        type="radio" name="service" value={s.id}
                        checked={isSelected}
                        onChange={() => set('serviceId', s.id)}
                        style={{ marginTop: 3, accentColor: '#0A2342' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#0A2342' }}>{s.title}</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', marginTop: 2 }}>{s.startingPrice}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 3, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {s.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 1: Date & Time ── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0A2342', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                When works for you?
              </h2>
              <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 28px' }}>
                Pick a date and a time that fits your rhythm.
              </p>

              <span style={labelStyle}>Choose a Date</span>
              <input
                type="date" min={todayStr} value={data.date}
                onChange={(e) => set('date', e.target.value)}
                style={inputStyle}
              />

              <div style={{ marginTop: 24 }}>
                <span style={labelStyle}>Choose a Time</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {timeSlots.map((t) => {
                    const isActive = data.time === t;
                    return (
                      <button
                        key={t} type="button"
                        onClick={() => set('time', t)}
                        style={{
                          padding: '12px 8px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                          border: isActive ? '2px solid #0A2342' : '1.5px solid #e2e8f0',
                          background: isActive ? '#0A2342' : '#fff',
                          color: isActive ? '#fff' : '#334155',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Address ── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0A2342', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Where shall we clean?
              </h2>
              <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 28px' }}>
                Your address stays private — shared only with your assigned specialist.
              </p>

              {/* City and District Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span style={labelStyle}>City</span>
                  <select
                    value={data.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    style={selectStyle}
                  >
                    {Object.keys(uaeDistricts).map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span style={labelStyle}>{data.city || 'UAE'} District</span>
                  <select
                    value={data.district}
                    onChange={(e) => set('district', e.target.value)}
                    style={selectStyle}
                  >
                    {(uaeDistricts[data.city] || []).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Street Address */}
              <div style={{ marginTop: 16 }}>
                <span style={labelStyle}>Street Address</span>
                <input
                  type="text"
                  value={data.streetAddress}
                  onChange={(e) => set('streetAddress', e.target.value)}
                  placeholder="e.g. Tower 2, Apt 1402 or Villa 12, Street 8"
                  style={inputStyle}
                />
              </div>

              {/* Zip Code / Makani */}
              <div style={{ marginTop: 16 }}>
                <span style={labelStyle}>
                  Zip Code / Makani <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional)</span>
                </span>
                <input
                  type="text"
                  value={data.zipCode}
                  onChange={(e) => set('zipCode', e.target.value)}
                  placeholder="e.g. 6967"
                  style={inputStyle}
                />
              </div>

              {/* Access Notes */}
              <div style={{ marginTop: 16 }}>
                <span style={labelStyle}>
                  Access Notes <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional)</span>
                </span>
                <textarea
                  value={data.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="e.g. Key is with building security, extra focus on balcony..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          )}

          {/* ── STEP 3: Contact ── */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0A2342', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                How do we reach you?
              </h2>
              <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 28px' }}>
                We'll send your confirmation and a reminder before the clean.
              </p>

              <span style={labelStyle}>Full Name</span>
              <input
                type="text" value={data.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Mohammed Al Mansoori"
                style={inputStyle}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                <div>
                  <span style={labelStyle}>Email</span>
                  <input
                    type="email" value={data.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="client@email.com"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <span style={labelStyle}>Phone</span>
                  <input
                    type="tel" value={data.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    placeholder="+971 50 000 0000"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Review & Confirm ── */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0A2342', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Review & confirm
              </h2>
              <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 28px' }}>
                One last look before your sanctuary is restored.
              </p>

              <div style={{ borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 24 }}>
                {[
                  {
                    icon: (
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    ),
                    label: 'SERVICE',
                    value: selectedService.title,
                  },
                  {
                    icon: (
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                    ),
                    label: 'DATE',
                    value: formatDate(data.date),
                  },
                  {
                    icon: (
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                      </svg>
                    ),
                    label: 'TIME',
                    value: data.time,
                  },
                  {
                    icon: (
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><circle cx="12" cy="11" r="3" />
                      </svg>
                    ),
                    label: 'ADDRESS',
                    value: `${data.district}${data.streetAddress ? ', ' + data.streetAddress : ''}${data.city ? ', ' + data.city : ''}${data.zipCode ? ' ' + data.zipCode : ''}`,
                  },
                  {
                    icon: (
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ),
                    label: 'CONTACT',
                    value: `${data.name}${data.phone ? ' · ' + data.phone : ''}`,
                  },
                ].map((row, i) => (
                  <div key={row.label} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 20px',
                    background: i % 2 === 0 ? '#f8fafc' : '#fff',
                    borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none',
                  }}>
                    <span style={{ fontSize: 14 }}>{row.icon}</span>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 }}>{row.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0A2342', marginTop: 1 }}>{row.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Info */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 20px', borderRadius: 14,
                background: '#ecfdf5', border: '1px solid #bbf7d0',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#064e3b' }}>Pay after your clean</div>
                  <div style={{ fontSize: 12, color: '#065f46' }}>No charge today. Secure payment collected on completion.</div>
                </div>
              </div>

              {/* Grand Total */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: 20, paddingTop: 20, borderTop: '2px solid #e2e8f0',
              }}>
                <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>Total due on completion</span>
                <span style={{ fontSize: 28, fontWeight: 900, color: '#0A2342', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  AED {estimate.total}
                </span>
              </div>
            </div>
          )}

          {/* ── Navigation Buttons ── */}
          <div style={{
            display: 'flex',
            justifyContent: step > 0 ? 'space-between' : 'flex-end',
            alignItems: 'center',
            marginTop: 32, paddingTop: 24, borderTop: '1px solid #f1f5f9',
          }}>
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '12px 20px', borderRadius: 12,
                  border: '1.5px solid #e2e8f0', background: '#fff',
                  color: '#334155', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                disabled={!canProceed()}
                onClick={() => setStep((s) => s + 1)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '12px 28px', borderRadius: 12,
                  background: canProceed() ? 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)' : '#e2e8f0',
                  color: canProceed() ? '#fff' : '#94a3b8',
                  border: 'none', fontSize: 13, fontWeight: 700,
                  cursor: canProceed() ? 'pointer' : 'not-allowed',
                  boxShadow: canProceed() ? '0 4px 14px rgba(10,35,66,0.25)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                Continue
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirm}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '14px 32px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)',
                  color: '#fff', border: 'none', fontSize: 14, fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 6px 20px rgba(10,35,66,0.3)',
                  transition: 'all 0.15s',
                }}
              >
                {loading ? 'Submitting...' : 'Confirm Appointment'}
                {!loading && (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── Right: Order Reflection Sidebar ── */}
        <div style={{ position: 'sticky', top: 100 }}>
          <div style={{
            background: '#fff', borderRadius: 20, overflow: 'hidden',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 24px rgba(10,35,66,0.04)',
          }}>
            {/* Sidebar header */}
            <div style={{
              padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10,
              borderBottom: '1px solid #f1f5f9', background: '#f8fafc',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: '#0A2342',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#60a5fa" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#0A2342' }}>Order Reflection</span>
            </div>

            {/* Service Image */}
            <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
              <img
                src={selectedService.image}
                alt={selectedService.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                padding: '24px 16px 12px',
              }}>
                <div style={{ color: '#fff', fontSize: 15, fontWeight: 800 }}>{selectedService.title}</div>
                <div style={{ color: '#93c5fd', fontSize: 11, fontWeight: 600 }}>Freshness Index {freshnessIndex}</div>
              </div>
            </div>

            {/* Summary details */}
            <div style={{ padding: '16px 20px' }}>
              {[
                { icon: CalendarSmallIcon, label: 'Date', value: data.date ? new Date(data.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                { icon: ClockSmallIcon, label: 'Time', value: data.time || '—' },
                { icon: PinSmallIcon, label: 'Address', value: data.streetAddress ? `${data.district}, ${data.city}` : '—' },
              ].map((row) => (
                <div key={row.label} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: '1px solid #f8fafc',
                }}>
                  <row.icon />
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6 }}>{row.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0A2342' }}>{row.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price */}
            <div style={{
              padding: '16px 20px', borderTop: '1px solid #f1f5f9',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 }}>Service base</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{estimate.hours}</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#0A2342', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                AED {estimate.total}
              </div>
            </div>
          </div>

          {/* Trust badge below sidebar */}
          <div style={{
            marginTop: 12, padding: '12px 16px', borderRadius: 12,
            background: '#eff6ff', border: '1px solid #dbeafe',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#1e40af' }}>
              Built with CitiMaids 🇦🇪
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .booking-grid {
          grid-template-columns: 1fr 340px;
        }
        @media (max-width: 768px) {
          .booking-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Shared Styles
   ═══════════════════════════════════════════════════════ */

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: 0.6,
  marginBottom: 8,
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1.5px solid #e2e8f0',
  fontSize: 14,
  color: '#0A2342',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#f8fafc',
  transition: 'border 0.2s',
  fontFamily: 'inherit',
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'auto',
};

/* ═══════════════════════════════════════════════════════
   Step Icons (inside progress circles)
   ═══════════════════════════════════════════════════════ */

function StepServiceIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function StepDateIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function StepAddressIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function StepContactIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function StepReviewIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   Small Sidebar Icons
   ═══════════════════════════════════════════════════════ */

function CalendarSmallIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function ClockSmallIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  );
}

function PinSmallIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}