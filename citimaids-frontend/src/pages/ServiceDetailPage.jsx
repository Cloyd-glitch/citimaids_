import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useServices } from '../hooks/useServices';

export default function ServiceDetailPage() {
  const { serviceId } = useParams();
  const { services, loading } = useServices();

  // serviceId in the URL is the DB integer id (as a string)
  const service = services.find((s) => String(s.id) === serviceId);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-32">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-900 animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Loading service...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-32">
        <h2 className="text-3xl font-black text-slate-900 mb-3">Service Not Found</h2>
        <p className="text-slate-500 text-base mb-6">The requested cleaning service could not be located.</p>
        <Link
          to="/services"
          className="px-7 py-3 rounded-xl bg-[#0A2342] text-white font-bold text-sm shadow-md"
        >
          ← Return to All Services
        </Link>
      </div>
    );
  }

  const related = services.filter((s) => s.id !== service.id).slice(0, 3);

  return (
    <div>
      {/* Banner */}
      <div className="relative h-96 sm:h-[450px] bg-slate-950 overflow-hidden pt-20">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80';
          }}
        />
        <div className="hero-gradient-overlay absolute inset-0" />
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-14 max-w-7xl mx-auto z-10">
          <Link
            to="/services"
            className="text-sky-300 text-xs font-bold hover:text-white mb-4 inline-flex items-center gap-1.5 transition-colors"
          >
            ← Back to Services
          </Link>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-2">
            {service.title}
          </h1>
          <p className="text-sky-100 text-sm sm:text-base font-medium">
            Professional residential and commercial services across Abu Dhabi
          </p>
        </div>
      </div>

      {/* Main Content & Sidebar */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Details */}
          <div className="lg:col-span-2">
            <span className="text-blue-900 font-extrabold text-xs uppercase tracking-widest block mb-2">
              Service Specs
            </span>
            <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Overview & Scope</h2>
            <p className="text-slate-600 leading-relaxed mb-12 text-base sm:text-lg">
              {service.description} Our trained and police-vetted specialists bring 5-star hotel cleaning standards, UAE-approved eco-friendly products, and high-performance industrial equipment to ensure your living space is pristine and sanitized.
            </p>

            {/* Process */}
            <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Our 4-Step Standard</h3>
            <div className="space-y-4">
              {[
                { title: 'Prompt Arrival', desc: 'Uniformed crew arrives on time with all vacuums, mops, and eco detergents.' },
                { title: 'Property Inspection', desc: 'Customized assessment of key priority zones and high-touch areas.' },
                { title: 'Methodical Deep Clean', desc: 'Systematic room-by-room degreasing, scrubbing, sanitization, and dust removal.' },
                { title: 'Supervisor Sign-Off', desc: 'Final checklist walkthrough to guarantee your 100% satisfaction.' },
              ].map((step, i) => (
                <div
                  key={step.title}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/70"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md"
                    style={{ background: 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)' }}
                  >
                    0{i + 1}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base mb-1">{step.title}</h4>
                    <p className="text-slate-600 text-xs sm:text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl p-8 sticky top-28 border border-slate-200 bg-slate-50 shadow-xl">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-2">
                Standard Pricing
              </span>
              <div className="text-3xl sm:text-4xl font-black text-blue-950 mb-2">
                {service.startingPrice}
              </div>
              <p className="text-slate-500 text-xs mb-8 leading-relaxed">
                Flat rates & hourly rates with zero hidden fees. Payment upon inspection.
              </p>

              <div className="space-y-3.5">
                <Link
                  to="/book"
                  state={{ preselectedServiceId: service.id }}
                  className="block w-full text-center py-4 rounded-2xl font-black text-white transition-all hover:scale-105 shadow-xl text-sm"
                  style={{ background: 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)' }}
                >
                  Book This Service
                </Link>

                <a
                  href={`https://wa.me/97150000000?text=Hi%20CitiMaids!%20I%20am%20interested%20in%20${encodeURIComponent(service.title)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-all text-sm shadow-md hover:scale-105"
                >
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              {/* Badges */}
              <div className="mt-8 pt-6 border-t border-slate-200 space-y-3">
                {[
                  'Insured & Emirates ID verified staff',
                  '100% Satisfaction guarantee',
                  'Hospital-grade eco detergents',
                  'Free cancellation up to 24 hours',
                ].map((b) => (
                  <div key={b} className="text-xs text-slate-600 font-semibold flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Services */}
      {related.length > 0 && (
        <section className="py-24 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-10">You Might Also Need</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {related.map((s) => (
                <Link
                  key={s.id}
                  to={`/services/${s.id}`}
                  className="bg-white rounded-3xl overflow-hidden group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border border-slate-200/80"
                >
                  <div className="h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={s.image}
                      alt={s.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-extrabold text-slate-900 text-lg mb-1">{s.title}</h3>
                    <p className="text-blue-900 font-black text-sm">{s.startingPrice}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
