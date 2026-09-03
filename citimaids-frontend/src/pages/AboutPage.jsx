import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import {
  AwardIcon,
  ShieldCheckIcon,
  LeafIcon,
  UserCheckIcon,
} from '../components/icons/Icons';

const values = [
  {
    icon: <AwardIcon className="w-8 h-8 text-blue-800" />,
    title: 'Hospitality Standards',
    desc: 'Every team member is trained to 5-star hotel hygiene protocols, uniformed, and dedicated to flawless execution.',
  },
  {
    icon: <ShieldCheckIcon className="w-8 h-8 text-blue-800" />,
    title: 'Uncompromised Trust',
    desc: 'Emirates ID verified, police cleared, and covered by AED 1M liability insurance on every property visit.',
  },
  {
    icon: <UserCheckIcon className="w-8 h-8 text-blue-800" />,
    title: 'Client Commitment',
    desc: 'If any area does not meet your expectations, we re-clean within 24 hours at zero additional cost.',
  },
  {
    icon: <LeafIcon className="w-8 h-8 text-blue-800" />,
    title: 'Eco-Friendly Cleaning',
    desc: 'Safe, UAE-approved non-toxic solutions that protect your loved ones, pets, and luxury interior finishes.',
  },
];

const stats = [
  { value: '500+', label: 'Happy Clients' },
  { value: '100%', label: 'Vetted Crew' },
  { value: '4.9 / 5', label: 'Average Review' },
  { value: '7 Days', label: 'Weekly Service' },
];

export default function AboutPage() {
  return (
    <div>
      {/* Header */}
      <div
        className="py-20 text-white text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0A2342 0%,#1E3A8A 100%)' }}
      >
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/15 text-xs font-semibold uppercase tracking-widest mb-4 backdrop-blur-sm">
            Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight">About CitiMaids</h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Abu Dhabi and two other cities' trusted professional cleaning partner, delivering spotless homes and commercial spaces since 2018.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-blue-800 font-bold text-xs uppercase tracking-widest">Who We Are</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-6">
              Serving Abu Dhabi and Two Other Cities' Homes & Offices with Pride
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4 text-sm sm:text-base">
              CitiMaids was founded in Musrif, Abu Dhabi with a straightforward mission: to provide UAE residents with reliable, honest, and high-standard cleaning services they can trust with their personal homes.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4 text-sm sm:text-base">
              Over the years, we have expanded from a modest crew to a dedicated fleet of fully licensed, background-checked, and highly trained cleaning specialists serving hundreds of residences and businesses every week.
            </p>
            <p className="text-slate-600 leading-relaxed mb-8 text-sm sm:text-base">
              From everyday apartment upkeep to deep villa restoration, carpet steam extraction, and full building facility contracts, CitiMaids is committed to immaculate living spaces.
            </p>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white hover:scale-105 transition-all shadow-md"
              style={{ background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' }}
            >
              Book an Appointment
            </Link>
          </div>

          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=700&h=500&fit=crop&auto=format"
                alt="CitiMaids professional cleaning team"
                className="w-full h-80 sm:h-96 object-cover"
              />
            </div>
            <div
              className="absolute -bottom-6 -right-6 bg-white rounded-2xl px-6 py-4 shadow-xl border border-slate-100 hidden sm:block"
            >
              <div className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#1E3A8A" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><circle cx="12" cy="11" r="3" />
                </svg>
                Musrif HQ
              </div>
              <div className="text-xs text-slate-500">Abu Dhabi, United Arab Emirates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ background: 'linear-gradient(135deg,#0A2342 0%,#1E3A8A 100%)' }} className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl sm:text-4xl font-extrabold mb-1">{s.value}</div>
                <div className="text-blue-200 text-xs sm:text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-blue-800 font-bold text-xs uppercase tracking-widest">Our Foundation</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <div
                  className="bg-white rounded-2xl p-7 text-left border border-slate-100 hover:-translate-y-1 transition-all h-full"
                  style={{ boxShadow: '0 2px 14px rgba(10,35,66,0.04)' }}
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                    {v.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{v.title}</h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Location Details */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-blue-800 font-bold text-xs uppercase tracking-widest">Headquarters</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-6">Our Abu Dhabi Hub</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><circle cx="12" cy="11" r="3" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Head Office</div>
                  <div className="text-slate-600 text-xs sm:text-sm">Musrif Area, Abu Dhabi, United Arab Emirates</div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Operation Hours</div>
                  <div className="text-slate-600 text-xs sm:text-sm">Monday – Saturday: 7:00 AM – 9:00 PM</div>
                  <div className="text-slate-600 text-xs sm:text-sm">Sunday: 8:00 AM – 6:00 PM</div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Service Coverage</div>
                  <div className="text-slate-600 text-xs sm:text-sm">
                    Al Reem Island, Saadiyat, Yas Island, Al Khalidiyah, Corniche, Al Raha, Mushrif, Khalifa City A, and beyond.
                  </div>
                </div>
              </div>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-xs sm:text-sm text-white hover:scale-105 transition-all shadow-md"
              style={{ background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' }}
            >
              Contact Head Office
            </Link>
          </div>
          <div className="h-80 rounded-2xl overflow-hidden shadow-xl border border-slate-100">
            <img
              src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=500&fit=crop&auto=format"
              alt="Abu Dhabi skyline"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
