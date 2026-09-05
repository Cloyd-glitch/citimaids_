import { Link } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';

export default function Footer() {
  const { settings } = useSettings();

  const businessName = settings?.business_name || 'CitiMaids Cleaning Services';
  const shortName = businessName ? businessName.split(' ')[0] : 'CitiMaids';
  const phone = settings?.contact_number || '+971 52 634 9461';
  const additionalPhone = settings?.additional_number || '+971 58 175 3958';
  const email = settings?.business_email || 'info@citi-maids.com';
  const additionalEmail = settings?.additional_email || 'citimaidsuae@gmail.com';
  const address = settings?.business_address || 'Aljazeera Tower, Room 45, Hamdan St, Abu Dhabi, UAE';
  const facebookUrl = settings?.facebook_url || 'https://web.facebook.com/people/CitiMaids-Cleaning-Services/61550129471847/';
  const tiktokUrl = settings?.tiktok_url || 'https://www.tiktok.com/@citimaids?_t=8pO7VCQjaUy&_r=1';

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
              <img
                src="/images/citimaids-badge.png"
                alt="CitiMaids Logo"
                className="w-10 h-10 rounded-full object-cover shadow-lg border border-white/20 flex-shrink-0"
              />
              <div>
                <span className="block font-black text-white text-lg tracking-wider leading-none uppercase">
                  {shortName}
                </span>
                <span className="block text-[11px] font-semibold tracking-wider text-sky-300 uppercase">
                  Cleaning & Maintenance
                </span>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-slate-400 mb-6">
              Abu Dhabi's trusted residential, commercial cleaning, and outdoor maintenance company. Delivering hotel-standard hygiene, transparent pricing, and dependable teams.
            </p>

            <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/40 px-3.5 py-2 rounded-xl mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Licensed & Insured in UAE</span>
            </div>

            {/* Social Media Links */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-sky-300 mb-3">
                Follow CitiMaids
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="CitiMaids on Facebook"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#1877F2] text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md"
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="CitiMaids on TikTok"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-black text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md border border-white/5"
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 00-1-.08A6.34 6.34 0 003 15.66a6.34 6.34 0 0010.86 4.43 6.3 6.3 0 001.88-4.43v-7a8.16 8.16 0 004.85 1.59v-3.56z"/>
                  </svg>
                </a>
              </div>
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
                ['/services', 'Our Cleaning Services'],
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

          {/* Core Services */}
          <div>
            <h4 className="text-white font-black mb-5 text-xs uppercase tracking-widest text-sky-300">
              Popular Services
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                'Home Cleaning Abu Dhabi',
                'Office Cleaning',
                'Apartment Cleaning',
                'Villa Cleaning Abu Dhabi',
                'Deep Cleaning Services',
                'Move In & Move Out Cleaning',
                'Landscape & Garden Care',
                'Swimming Pool Maintenance',
              ].map((s) => (
                <li key={s}>
                  <Link to="/services" className="text-slate-400 hover:text-white transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Headquarters & Direct Contacts */}
          <div>
            <h4 className="text-white font-black mb-5 text-xs uppercase tracking-widest text-sky-300">
              Abu Dhabi Headquarters
            </h4>
            <ul className="space-y-4 text-sm text-slate-400 mb-6">
              {address && (
                <li className="flex items-start gap-3">
                  <span className="text-sky-400 mt-0.5 flex-shrink-0">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <circle cx="12" cy="11" r="3" />
                    </svg>
                  </span>
                  <span className="leading-snug text-slate-300">{address}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-3">
                  <span className="text-sky-400 flex-shrink-0">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors font-semibold text-slate-200">
                    {phone}
                  </a>
                </li>
              )}
              {additionalPhone && (
                <li className="flex items-center gap-3">
                  <span className="text-sky-400 flex-shrink-0">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <a href={`tel:${additionalPhone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors font-semibold text-slate-200">
                    {additionalPhone}
                  </a>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-3">
                  <span className="text-sky-400 flex-shrink-0">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <a href={`mailto:${email}`} className="hover:text-white transition-colors font-medium">
                    {email}
                  </a>
                </li>
              )}
              {additionalEmail && (
                <li className="flex items-center gap-3">
                  <span className="text-sky-400 flex-shrink-0">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <a href={`mailto:${additionalEmail}`} className="hover:text-white transition-colors font-medium">
                    {additionalEmail}
                  </a>
                </li>
              )}
            </ul>

            <a
              href={`https://wa.me/971526349461`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-lg hover:scale-105"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086.159.058 1.011.477 1.184.564.173.087.289.13.332.202.043.073.043.419-.101.824z" />
              </svg>
              <span>Chat on WhatsApp (+971 52 634 9461)</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} {businessName}. All rights reserved. Abu Dhabi, UAE.
          </div>
          <div className="flex items-center gap-5">
            <span className="text-slate-400">Terms of Service</span>
            <span>•</span>
            <span className="text-slate-400">Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
