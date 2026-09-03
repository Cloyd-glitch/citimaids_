import { useState } from 'react';
import { Link } from 'react-router-dom';
import { services } from '../data/services';
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
      return <HomeIcon className="w-6 h-6 text-blue-800" />;
    case 'building':
      return <BuildingIcon className="w-6 h-6 text-blue-800" />;
    case 'villa':
      return <VillaIcon className="w-6 h-6 text-blue-800" />;
    case 'sparkles':
      return <SparklesIcon className="w-6 h-6 text-blue-800" />;
    case 'sofa':
      return <SofaIcon className="w-6 h-6 text-blue-800" />;
    case 'window':
      return <WindowIcon className="w-6 h-6 text-blue-800" />;
    default:
      return <SparklesIcon className="w-6 h-6 text-blue-800" />;
  }
}

export default function ServicesPage() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? services
    : services.filter(s => s.category === filter);

  return (
    <div>
      {/* Page Header */}
      <div
        className="py-20 text-white text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0A2342 0%,#1E3A8A 100%)' }}
      >
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/15 text-xs font-semibold uppercase tracking-widest mb-4 backdrop-blur-sm">
            Service Catalog
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight">Our Cleaning Services</h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            From routine residential cleans to deep villa treatments and commercial spaces across Abu Dhabi.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Grid */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Category Filter Tabs */}
          <div className="flex justify-center gap-2 mb-12 flex-wrap">
            {[
              { key: 'all', label: 'All Services' },
              { key: 'residential', label: 'Residential' },
              { key: 'commercial', label: 'Commercial' },
              { key: 'specialized', label: 'Specialized & Deep Clean' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  filter === tab.key
                    ? 'text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
                style={filter === tab.key ? { background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((service, i) => (
              <Reveal key={service.id} delay={i * 50}>
                <div
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl h-full flex flex-col justify-between"
                  style={{ boxShadow: '0 2px 14px rgba(10,35,66,0.04)' }}
                >
                  <div>
                    <div className="h-44 bg-slate-100 overflow-hidden relative">
                      <img
                        src={`https://images.unsplash.com/photo-${service.imageId}?w=600&h=350&fit=crop&auto=format`}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-blue-950 flex items-center gap-1.5 shadow-sm">
                        {getIcon(service.iconName)}
                        <span>{service.title}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-slate-900 text-lg mb-2">{service.title}</h3>
                      <p className="text-slate-500 text-sm mb-4 leading-relaxed line-clamp-2">
                        {service.description}
                      </p>
                      <ul className="space-y-1.5 mb-6 text-xs text-slate-600">
                        {service.included.slice(0, 3).map((inc) => (
                          <li key={inc} className="flex items-center gap-2">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-slate-50">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Starting from</span>
                      <span className="text-blue-900 font-extrabold text-sm">{service.startingPrice}</span>
                    </div>
                    <Link
                      to={`/services/${service.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Need Help Banner */}
      <section className="py-16 bg-white text-center border-t border-slate-100">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Need a custom plan or large estate clean?</h2>
          <p className="text-slate-500 text-sm mb-6">Our Abu Dhabi team can build a tailor-made recurring contract.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/book"
              className="px-7 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 shadow-md"
              style={{ background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' }}
            >
              Book an Appointment
            </Link>
            <Link
              to="/contact"
              className="px-7 py-3 rounded-xl font-bold text-sm text-blue-950 border-2 border-blue-200 hover:bg-blue-50 transition-colors"
            >
              Contact Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
