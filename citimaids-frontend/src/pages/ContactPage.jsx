import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const { settings } = useSettings();

  const addressParts = settings?.business_address ? settings.business_address.split(',') : [];
  const city = addressParts.length > 1 ? addressParts[1].trim() : 'Abu Dhabi';
  const businessName = settings?.business_name || 'CitiMaids';
  const phone = settings?.contact_number || '+971 2 650 5050';
  const email = settings?.business_email || 'info@citimaids.ae';
  const address = settings?.business_address || 'Musrif Area, Abu Dhabi, UAE';

  const set = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      {/* Header */}
      <div
        className="py-20 text-white text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0A2342 0%,#1E3A8A 100%)' }}
      >
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/15 text-xs font-semibold uppercase tracking-widest mb-4 backdrop-blur-sm">
            Get In Touch
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight">Contact {businessName}</h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Have a question or require a tailored corporate cleaning quote? Our {city} team is at your service.
          </p>
        </div>
      </div>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          {/* Contact Details */}
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Direct Channels</h2>

            <div className="space-y-4 mb-8">
              {[
                {
                  icon: (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1E3A8A" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  ),
                  label: 'Direct Phone',
                  value: phone,
                  href: `tel:${phone.replace(/\s+/g, '')}`,
                },
                {
                  icon: (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1E3A8A" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                  label: 'Inquiries Email',
                  value: email,
                  href: `mailto:${email}`,
                },
                {
                  icon: (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1E3A8A" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><circle cx="12" cy="11" r="3" />
                    </svg>
                  ),
                  label: 'Central Office',
                  value: address,
                  href: null,
                },
                {
                  icon: (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1E3A8A" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                  ),
                  label: 'Service Schedule',
                  value: 'Mon–Sat: 7AM–9PM | Sun: 8AM–6PM',
                  href: null,
                },
              ].map(({ icon, label, value, href }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 bg-white rounded-2xl p-4.5 border border-slate-100"
                  style={{ boxShadow: '0 2px 10px rgba(10,35,66,0.03)' }}
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-lg flex-shrink-0">
                    {icon}
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">{label}</div>
                    {href ? (
                      <a href={href} className="font-bold text-slate-900 hover:text-blue-800 transition-colors text-sm">
                        {value}
                      </a>
                    ) : (
                      <span className="font-bold text-slate-900 text-sm">{value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Direct WhatsApp CTA */}
            <a
              href="https://wa.me/97150000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full justify-center py-4 rounded-2xl text-white font-bold bg-emerald-500 hover:bg-emerald-600 transition-all text-sm shadow-md hover:scale-[1.02]"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.535 5.859L0 24l6.335-1.509A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.502-5.184-1.381l-.372-.22-3.762.897.944-3.658-.242-.378A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Chat on WhatsApp for Fast Quotes
            </a>
            <p className="text-center text-xs text-slate-400 mt-2">Typical response time: under 15 minutes.</p>
          </div>

          {/* Form */}
          <div
            className="bg-white rounded-2xl p-8 border border-slate-100"
            style={{ boxShadow: '0 4px 28px rgba(10,35,66,0.06)' }}
          >
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-white text-2xl shadow-lg"
                  style={{ background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' }}
                >
                  ✓
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">Message Sent Successfully</h3>
                <p className="text-slate-500 text-sm max-w-xs mb-6">
                  Thank you for reaching out. Our dispatch team will follow up with you within 2 hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: '', email: '', phone: '', message: '' });
                  }}
                  className="text-blue-800 font-bold text-sm hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-900 mb-5">Send Us an Inquiry</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      placeholder="e.g. Mohammed Al Mansoori"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      placeholder="e.g. client@email.com"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="+971 50 000 0000"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Message / Requirements</label>
                    <textarea
                      required
                      value={form.message}
                      onChange={(e) => set('message', e.target.value)}
                      placeholder="Describe your property, required services, or desired timing..."
                      rows={4}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 shadow-md"
                    style={{ background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' }}
                  >
                    Submit Inquiry
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
