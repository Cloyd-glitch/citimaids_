import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';

const maintenanceServices = [
  {
    id: 'landscape',
    title: 'Landscape Contractor',
    description:
      'Turnkey landscaping solutions for residential villas and commercial facilities. We design, install, and care for lush outdoor environments that endure the UAE climate.',
    features: [
      'Custom garden architecture & design',
      'Artificial & natural turf installation',
      'Smart automated irrigation systems',
      'Desert-tolerant flora & date palms',
      'Outdoor paving, pergolas & lighting',
      'Seasonal plant health rejuvenation',
    ],
    imageId: '1416879595882-3373a0480b5b',
  },
  {
    id: 'garden',
    title: 'Garden Maintenance',
    description:
      'Keep your villa garden thriving and pristine throughout the year. Our skilled horticulturists handle precision trimming, edging, organic fertilization, and weed suppression.',
    features: [
      'Weekly or bi-weekly scheduled care',
      'Lawn aeration, mowing & precision edging',
      'Hedge shaping & palm frond pruning',
      'Eco-friendly pest & fungal defense',
      'Soil nutrient enrichment & mulching',
      'Irrigation system flow monitoring',
    ],
    imageId: '1585320806297-9794b3e4eeae',
  },
  {
    id: 'pool',
    title: 'Swimming Pool Maintenance',
    description:
      'Ensure your private pool is crystal-clear, sanitized, and perfectly balanced for your family. We conduct thorough chemical water testing, backwashing, and pump inspections.',
    features: [
      'Digital pH & chlorine balance checks',
      'Surface skim & underwater vacuuming',
      'Filter backwash & sand inspection',
      'Skimmer basket & lint trap cleaning',
      'Algae eradication & water clarifying',
      'Pump, timer & light safety inspection',
    ],
    imageId: '1575429198097-0414ec08e8cd',
  },
];

export default function MaintenancePage() {
  return (
    <div>
      {/* Header */}
      <div
        className="py-20 text-white text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0A2342 0%,#1E3A8A 100%)' }}
      >
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/15 text-xs font-semibold uppercase tracking-widest mb-4 backdrop-blur-sm">
            Villa & Outdoor Solutions
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight">Maintenance Services</h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Professional landscape contracting, weekly garden care, and swimming pool maintenance across Abu Dhabi.
          </p>
        </div>
      </div>

      {/* Services List */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          {maintenanceServices.map((s, i) => (
            <Reveal key={s.id} delay={i * 80} direction={i % 2 === 0 ? 'left' : 'right'}>
              <div
                className={`bg-white rounded-2xl overflow-hidden grid md:grid-cols-2 border border-slate-100 ${
                  i % 2 === 1 ? 'md:grid-flow-dense' : ''
                }`}
                style={{ boxShadow: '0 4px 24px rgba(10,35,66,0.06)' }}
              >
                <div className={`h-64 md:h-auto bg-slate-100 overflow-hidden ${i % 2 === 1 ? 'md:col-start-2' : ''}`}>
                  <img
                    src={`https://images.unsplash.com/photo-${s.imageId}?w=800&h=600&fit=crop&auto=format`}
                    alt={s.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">Outdoor Excellence</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">{s.title}</h2>
                  <p className="text-slate-600 leading-relaxed mb-6 text-sm">{s.description}</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                        <span className="text-emerald-500 font-bold">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/book"
                      className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white hover:scale-105 transition-all shadow-md"
                      style={{ background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' }}
                    >
                      Book a Visit
                    </Link>
                    <a
                      href={`https://wa.me/97150000000?text=Hi%20CitiMaids!%20I%20would%20like%20a%20quote%20for%20${encodeURIComponent(s.title)}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-800 border border-slate-300 hover:bg-slate-50 transition-colors"
                    >
                      Request WhatsApp Quote
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Contract Banner */}
      <section
        className="py-16 text-center text-white relative"
        style={{ background: 'linear-gradient(135deg,#0A2342 0%,#1E3A8A 100%)' }}
      >
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Looking for an Annual Villa Contract?</h2>
          <p className="text-blue-100 text-sm mb-7 leading-relaxed">
            We offer consolidated maintenance contracts combining home cleaning, landscape maintenance, and pool care with discounted rates.
          </p>
          <Link
            to="/contact"
            className="inline-flex px-8 py-3.5 rounded-xl bg-white text-slate-900 font-bold text-sm hover:scale-105 transition-all shadow-xl"
          >
            Inquire for Annual Contract
          </Link>
        </div>
      </section>
    </div>
  );
}
