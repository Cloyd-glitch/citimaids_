import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const transparent = isHome && !scrolled;

  const links = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/maintenance', label: 'Maintenance' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? 'bg-transparent border-transparent'
          : 'bg-white/95 backdrop-blur-md border-b border-blue-100/60 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-md"
            style={{
              background: 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)',
              border: transparent ? '1px solid rgba(255,255,255,0.25)' : 'none',
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <span
              className={`block font-extrabold text-lg leading-none tracking-wide transition-colors duration-200 ${
                transparent ? 'text-white' : 'text-slate-900'
              }`}
            >
              CITIMAIDS
            </span>
            <span
              className={`block text-xs font-medium tracking-wider uppercase transition-colors duration-200 ${
                transparent ? 'text-blue-200' : 'text-blue-700'
              }`}
            >
              Cleaning Services
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive(l.to)
                  ? transparent
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'bg-blue-50 text-blue-900 font-bold'
                  : transparent
                  ? 'text-white/85 hover:bg-white/10 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-blue-900'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Header Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/admin/login"
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              transparent
                ? 'text-white/70 hover:text-white hover:bg-white/10'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Admin Dashboard Login"
          >
            Staff Login
          </Link>
          <Link
            to="/book"
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 ${
              transparent
                ? 'bg-white text-slate-900 hover:bg-blue-50 shadow-lg'
                : 'text-white shadow-md'
            }`}
            style={
              transparent
                ? {}
                : {
                    background: 'linear-gradient(135deg,#0A2342,#1E3A8A)',
                    boxShadow: '0 4px 14px rgba(10,35,66,0.25)',
                  }
            }
          >
            Book Now
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className={`md:hidden p-2 rounded-xl transition-colors ${
            transparent ? 'text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-5 flex flex-col gap-1.5 shadow-2xl">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                isActive(l.to)
                  ? 'bg-blue-50 text-blue-900'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/book"
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white text-center shadow-md"
              style={{ background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' }}
            >
              Book a Cleaning
            </Link>
            <Link
              to="/admin/login"
              className="w-full py-2.5 text-center text-xs text-slate-500 font-medium hover:text-slate-800"
            >
              Staff Admin Portal
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
