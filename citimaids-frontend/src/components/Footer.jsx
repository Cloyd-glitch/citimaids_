import { Link } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
export default function Footer() {
  const { settings } = useSettings();
  const addressParts = settings?.business_address ? settings.business_address.split(',') : [];
  const city = addressParts.length > 1 ? addressParts[1].trim() : '';
  const businessName = settings?.business_name || '';
  const shortName = businessName ? businessName.split(' ')[0] : '';
  const phone = settings?.contact_number || '';
  const email = settings?.business_email || '';
  const address = settings?.business_address || '';

  return (
    <footer
      className="text-slate-300 relative overflow-hidden pt-20 pb-12"
      style={{ background: 'linear-gradient(180deg, #0A2342 0%, #061429 100%)' }}
    >
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 right-1/3 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3.5 mb-5 group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)' }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <span className="block font-black text-white text-lg tracking-wider leading-none uppercase">
                  {shortName}
                </span>
                <span className="block text-[11px] font-semibold tracking-wider text-sky-300 uppercase">
                  Cleaning Services
                </span>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-slate-400 mb-6">
              {city ? `${city}'s` : 'Your'} trusted residential and commercial cleaning company. Delivering hotel-standard hygiene, transparent pricing, and dependable teams.
            </p>

            <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/40 px-3.5 py-2 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Licensed & Insured in UAE</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black mb-5 text-xs uppercase tracking-widest text-sky-300">
              Quick Navigation
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                ['/', 'Home'],
                ['/services', 'Our Services'],
                ['/maintenance', 'Outdoor Maintenance'],
                ['/about', shortName ? `About ${shortName}` : 'About Us'],
                ['/contact', 'Contact Us'],
                ['/track-booking', 'Track My Booking'],
                ['/book', 'Book Appointment'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-slate-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Services */}
          <div>
            <h4 className="text-white font-black mb-5 text-xs uppercase tracking-widest text-sky-300">
              Our Services
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                'Home Cleaning',
                'Villa Cleaning',
                'Deep Cleaning',
                'Office Cleaning',
                'Carpet & Sofa Cleaning',
                'Move-in / Move-out Cleaning',
              ].map((s) => (
                <li key={s}>
                  <Link to="/services" className="text-slate-400 hover:text-white transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Headquarters */}
          <div>
            <h4 className="text-white font-black mb-5 text-xs uppercase tracking-widest text-sky-300">
              {city ? `${city} HQ` : 'HQ'}
            </h4>
            <ul className="space-y-4 text-sm text-slate-400 mb-6">
              {address && (
                <li className="flex items-start gap-3">
                  <span className="text-sky-400 mt-1">
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><circle cx="12" cy="11" r="3" />
                    </svg>
                  </span>
                  <span>{address}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-3">
                  <span className="text-sky-400">
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors font-medium">
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-3">
                  <span className="text-sky-400">
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <a href={`mailto:${email}`} className="hover:text-white transition-colors font-medium">
                    {email}
                  </a>
                </li>
              )}
            </ul>

            {phone && (
              <a
                href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md hover:scale-105"
              >
                <span>Quick WhatsApp Inquiries</span>
              </a>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} {businessName}. All rights reserved. {city ? `${city}, UAE.` : 'UAE.'}
          </div>
          <div className="flex items-center gap-5">
            <Link to="/admin/login" className="text-sky-300 hover:text-white transition-colors font-bold">
              Staff Portal Login
            </Link>
            <span>•</span>
            <span className="text-slate-400">Terms & Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
