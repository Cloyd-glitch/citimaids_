import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/maintenance', label: 'Maintenance' },
    { to: '/track-booking', label: 'Track Booking' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? 'bg-[#0A2342]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3.5'
          : 'bg-gradient-to-b from-black/70 via-black/30 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3.5 group">
          <img
            src="/images/citimaids-badge.png"
            alt="CitiMaids Logo"
            className="w-11 h-11 rounded-full object-cover shadow-lg border border-white/20 transition-transform duration-200 group-hover:scale-105 flex-shrink-0"
          />
          <div>
            <span className="block font-black text-white text-xl tracking-wider leading-none">
              CITIMAIDS
            </span>
            <span className="block text-[11px] font-semibold tracking-widest uppercase text-sky-300 mt-1">
              Cleaning Services • Abu Dhabi
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-semibold tracking-wide transition-all duration-200 relative py-1 ${
                isActive(l.to)
                  ? 'text-sky-300 font-bold'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {l.label}
              {isActive(l.to) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8]" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/book"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-slate-900 bg-white hover:bg-sky-50 shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <span>Book Now</span>
            <svg className="w-4 h-4 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Mobile menu hamburger */}
        <button
          className="lg:hidden p-2.5 rounded-xl text-white hover:bg-white/10 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden bg-[#0A2342] border-t border-white/10 px-6 py-6 flex flex-col gap-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                isActive(l.to)
                  ? 'bg-blue-600/30 text-sky-300 border border-blue-500/30'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <Link
              to="/book"
              className="w-full py-3.5 rounded-xl text-sm font-bold text-slate-900 bg-white text-center shadow-lg hover:bg-sky-50 transition-all"
            >
              Book an Appointment
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
