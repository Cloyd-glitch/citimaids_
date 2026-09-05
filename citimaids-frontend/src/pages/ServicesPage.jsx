import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useServices } from '../hooks/useServices';
import Reveal from '../components/Reveal';
import {
  HomeIcon,
  BuildingIcon,
  VillaIcon,
  SparklesIcon,
  SofaIcon,
  WindowIcon,
} from '../components/icons/Icons';

function getIcon(iconName) {
  switch (iconName) {
    case 'home':
      return <HomeIcon className="w-5 h-5 text-sky-400" />;
    case 'building':
      return <BuildingIcon className="w-5 h-5 text-sky-400" />;
    case 'villa':
      return <VillaIcon className="w-5 h-5 text-sky-400" />;
    case 'sparkles':
      return <SparklesIcon className="w-5 h-5 text-sky-400" />;
    case 'sofa':
      return <SofaIcon className="w-5 h-5 text-sky-400" />;
    case 'window':
      return <WindowIcon className="w-5 h-5 text-sky-400" />;
    default:
      return <SparklesIcon className="w-5 h-5 text-sky-400" />;
  }
}

export default function ServicesPage() {
  const { services, loading, error, refetch } = useServices();
  const [filter, setFilter] = useState('all');

  if (loading) {
    return (
      <div className="pt-36 pb-24 text-center">
        <div className="inline-block w-10 h-10 rounded-full border-4 border-slate-200 border-t-blue-900 animate-spin mb-4" />
        <p className="text-slate-500 text-sm font-medium">Loading services...</p>
      </div>
    );
  }

  if (error || services.length === 0) {
    return (
      <div className="pt-36 pb-24 text-center px-6">
        <div className="max-w-sm mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Could not load services</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            {error ? 'There was a problem connecting to the server.' : 'No services are available right now.'}
          </p>
          <button
            onClick={refetch}
            className="px-7 py-3 rounded-xl bg-[#0A2342] text-white font-bold text-sm shadow-md hover:bg-[#1E3A8A] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }


  const filtered = filter === 'all'
    ? services
    : services?.filter((s) => s.category === filter);

  return (
    <div>
      {/* Header */}
      <div
        className="pt-36 pb-24 text-white text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #061429 0%, #0A2342 50%, #1E3A8A 100%)' }}
      >
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-sky-300 text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-md">
            Full Service Catalog
          </span>
          <h1 className="text-4xl sm:text-6xl font-black mb-4 tracking-tight">Our Cleaning Services</h1>
          <p className="text-sky-100 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            From routine residential upkeep to specialized deep cleaning and commercial facilities across Abu Dhabi.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          {/* Category Filter Tabs */}
          <div className="flex justify-center gap-3 mb-16 flex-wrap">
            {[
              { key: 'all', label: 'All Services' },
              { key: 'residential', label: 'Residential' },
              { key: 'commercial', label: 'Commercial' },
              { key: 'specialized', label: 'Specialized & Deep Care' },
              { key: 'maintenance', label: 'Outdoor Maintenance' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer ${
                  filter === tab.key
                    ? 'bg-[#0A2342] text-white shadow-xl scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((service, i) => (
              <Reveal key={service.id} delay={i * 50}>
                <div
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="h-52 bg-slate-100 overflow-hidden relative">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div
                        className="absolute top-4 left-4 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-2 backdrop-blur-md"
                        style={{ background: 'rgba(10, 35, 66, 0.85)' }}
                      >
                        {getIcon(service.iconName)}
                        <span>{service.title}</span>
                      </div>
                    </div>
                    <div className="p-7">
                      <h3 className="font-extrabold text-slate-900 text-xl mb-2.5">{service.title}</h3>
                      <p className="text-slate-600 text-sm mb-6 leading-relaxed line-clamp-2">
                        {service.description}
                      </p>
                      <ul className="space-y-2 mb-6 text-xs sm:text-sm text-slate-700">
                        {(service.included || []).slice(0, 4).map((inc) => (
                          <li key={inc} className="flex items-start gap-2.5">
                            <span className="text-emerald-600 font-bold text-base leading-none">✓</span>
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-7 pt-0 flex items-center justify-between border-t border-slate-100 pt-5">
                    <div>
                      <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Rate</span>
                      <span className="text-blue-950 font-black text-base">{service.startingPrice}</span>
                    </div>
                    <Link
                      to={`/services/${service.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold px-5 py-2.5 rounded-xl text-white transition-all duration-150 hover:scale-105 shadow-md"
                      style={{ background: 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)' }}
                    >
                      <span>Details & Book</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation Banner */}
      <section className="py-20 bg-white text-center border-t border-slate-200">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
            Looking for a Custom Contract?
          </h2>
          <p className="text-slate-600 text-sm mb-8 leading-relaxed">
            Our Abu Dhabi operations team can prepare a custom quote for luxury villas, commercial towers, or scheduled weekly contracts.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/book"
              className="px-8 py-3.5 rounded-2xl font-extrabold text-sm text-white hover:scale-105 transition-all shadow-xl"
              style={{ background: 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)' }}
            >
              Book an Appointment
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3.5 rounded-2xl font-extrabold text-sm text-slate-800 border-2 border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Contact Operations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
