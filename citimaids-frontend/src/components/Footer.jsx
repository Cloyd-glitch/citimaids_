import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      className="text-slate-300 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0A2342 0%, #061429 100%)' }}
    >
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
        {/* Brand Column */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 shadow-md"
              style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <span className="block font-extrabold text-white text-lg leading-none">CITIMAIDS</span>
              <span className="block text-xs font-medium text-blue-300">Cleaning Services</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-400 mb-6">
            Abu Dhabi's trusted residential and commercial cleaning company. Dedicated to immaculate results, transparent pricing, and dependable teams.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Licensed & Insured in UAE
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-widest">Company</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              ['/', 'Home'],
              ['/services', 'Our Services'],
              ['/maintenance', 'Outdoor Maintenance'],
              ['/about', 'About CitiMaids'],
              ['/contact', 'Contact Us'],
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

        {/* Services List */}
        <div>
          <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-widest">Popular Services</h4>
          <ul className="space-y-2.5 text-sm">
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

        {/* Contact Info */}
        <div>
          <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-widest">Abu Dhabi Office</h4>
          <ul className="space-y-3.5 text-sm text-slate-400">
            <li className="flex items-start gap-2.5">
              <span className="text-blue-400 text-base mt-0.5">📍</span>
              <span>Musrif, Abu Dhabi, United Arab Emirates</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="text-blue-400 text-base">📞</span>
              <a href="tel:+97126505050" className="hover:text-white transition-colors">
                +971 2 650 5050
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="text-blue-400 text-base">✉️</span>
              <a href="mailto:info@citimaids.ae" className="hover:text-white transition-colors">
                info@citimaids.ae
              </a>
            </li>
          </ul>

          <a
            href="https://wa.me/97150000000"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md hover:scale-105"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.535 5.859L0 24l6.335-1.509A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.502-5.184-1.381l-.372-.22-3.762.897.944-3.658-.242-.378A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Quick WhatsApp Chat
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © {new Date().getFullYear()} CITIMAIDS Cleaning Services LLC. All rights reserved. Abu Dhabi, UAE.
        </div>
        <div className="flex items-center gap-4">
          <Link to="/admin/login" className="text-slate-400 hover:text-blue-300 transition-colors">
            Staff Portal
          </Link>
          <span>•</span>
          <span className="text-slate-500">Privacy & Terms</span>
        </div>
      </div>
    </footer>
  );
}
