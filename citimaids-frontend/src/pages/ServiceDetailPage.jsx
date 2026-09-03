import { Link, useParams } from 'react-router-dom';
import { services } from '../data/services';

export default function ServiceDetailPage() {
  const { serviceId } = useParams();
  const service = services.find((s) => s.id === serviceId);

  if (!service) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Service not found</h2>
        <p className="text-slate-500 text-sm mb-4">The service you are looking for does not exist or has been updated.</p>
        <Link to="/services" className="text-blue-800 font-bold hover:underline text-sm">
          ← Back to All Services
        </Link>
      </div>
    );
  }

  const related = services.filter((s) => s.id !== service.id).slice(0, 3);

  return (
    <div>
      {/* Banner */}
      <div className="relative h-72 md:h-96 bg-slate-900 overflow-hidden">
        <img
          src={`https://images.unsplash.com/photo-${service.imageId}?w=1400&h=500&fit=crop&auto=format`}
          alt={service.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 max-w-7xl mx-auto">
          <Link to="/services" className="text-blue-200 text-xs font-semibold hover:text-white mb-2 inline-flex items-center gap-1">
            ← Back to Services
          </Link>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">{service.title}</h1>
          <p className="text-blue-100 text-sm mt-1">Professional residential and commercial service in Abu Dhabi</p>
        </div>
      </div>

      {/* Content Body */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          {/* Main Details */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Overview</h2>
            <p className="text-slate-600 leading-relaxed mb-10 text-base">
              {service.description} Our professional team brings hotel-standard techniques, hospital-grade eco-friendly cleaning detergents, and industrial equipment to ensure your space is spotless. Whether for a one-off visit or regular maintenance, CitiMaids guarantees your complete satisfaction.
            </p>

            {/* Inclusions */}
            <h3 className="text-xl font-bold text-slate-900 mb-5">What's Included</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
              {service.included.map((item) => (
                <div key={item} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                    ✓
                  </div>
                  <span className="text-slate-700 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>

            {/* Our Process */}
            <h3 className="text-xl font-bold text-slate-900 mb-5">Our 4-Step Standard</h3>
            <div className="space-y-4">
              {[
                'Prompt arrival with all equipment and vetted team members',
                'Initial walk-through and customized area assessment',
                'Methodical deep cleaning and surface sanitization',
                'Final supervisor inspection and customer sign-off',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' }}
                  >
                    0{i + 1}
                  </div>
                  <p className="text-slate-700 text-sm pt-1 font-medium">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Booking Sidebar */}
          <div className="md:col-span-1">
            <div
              className="rounded-2xl p-7 sticky top-24 border border-blue-100 bg-slate-50"
              style={{ boxShadow: '0 4px 24px rgba(10,35,66,0.06)' }}
            >
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Standard Rate</div>
              <div className="text-3xl font-extrabold text-blue-950 mb-1">
                {service.startingPrice}
              </div>
              <p className="text-slate-500 text-xs mb-6">Transparent pricing with zero hidden booking fees</p>

              <div className="space-y-3">
                <Link
                  to="/book"
                  state={{ preselectedServiceId: service.id }}
                  className="block w-full text-center py-3.5 rounded-xl font-bold text-white transition-all hover:scale-105 shadow-md text-sm"
                  style={{ background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' }}
                >
                  Book This Service
                </Link>
                <a
                  href={`https://wa.me/97150000000?text=Hi%20CitiMaids!%20I%20am%20interested%20in%20${encodeURIComponent(service.title)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors text-sm shadow-sm"
                >
                  WhatsApp Quote
                </a>
              </div>

              {/* Guarantees */}
              <div className="mt-8 pt-6 border-t border-slate-200 space-y-2.5">
                {[
                  'Insured & ID-verified cleaners',
                  '100% Satisfaction guarantee',
                  'Eco-friendly UAE-approved products',
                  'Flexible cancellation policy',
                ].map((badge) => (
                  <div key={badge} className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Services */}
      {related.length > 0 && (
        <section className="py-16 bg-slate-50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8">Other Cleaning Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((s) => (
                <Link
                  key={s.id}
                  to={`/services/${s.id}`}
                  className="bg-white rounded-2xl overflow-hidden group transition-all duration-200 hover:-translate-y-1 hover:shadow-lg border border-slate-100"
                >
                  <div className="h-36 bg-slate-100 overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-${s.imageId}?w=400&h=200&fit=crop&auto=format`}
                      alt={s.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 text-base mb-1">{s.title}</h3>
                    <p className="text-blue-900 font-bold text-xs">{s.startingPrice}</p>
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
