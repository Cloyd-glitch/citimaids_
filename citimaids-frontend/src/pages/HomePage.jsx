import { useState } from 'react';
import { Link } from 'react-router-dom';
import { services } from '../data/services';
import Reveal from '../components/Reveal';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import {
  HomeIcon,
  BuildingIcon,
  VillaIcon,
  SparklesIcon,
  SofaIcon,
  WindowIcon,
  ShieldCheckIcon,
  BadgeCheckIcon,
  UserCheckIcon,
  ClockIcon,
  StarIcon,
} from '../components/icons/Icons';

const stats = [
  { value: '500+', label: 'Satisfied Clients' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '9+ Yrs', label: 'In Abu Dhabi' },
  { value: '100%', label: 'Satisfaction Guarantee' },
];

const whyUs = [
  {
    icon: <UserCheckIcon className="w-8 h-8 text-blue-600" />,
    title: 'Vetted & Trained Cleaners',
    desc: 'Every cleaner is police background-checked, trained for 40+ hours, uniformed, and ID-verified before entering your home.',
  },
  {
    icon: <ShieldCheckIcon className="w-8 h-8 text-blue-600" />,
    title: 'AED 1M Insurance Coverage',
    desc: 'Total peace of mind with comprehensive public liability insurance covering every single visit and property.',
  },
  {
    icon: <SparklesIcon className="w-8 h-8 text-blue-600" />,
    title: 'Hospital-Grade Eco Products',
    desc: 'Safe for children, pets, and delicate marble surfaces. We use UAE-approved non-toxic eco solutions.',
  },
  {
    icon: <ClockIcon className="w-8 h-8 text-blue-600" />,
    title: 'Fast Same-Day Scheduling',
    desc: 'Book in 60 seconds online. Flexible slots 7 days a week with instant confirmation via call or WhatsApp.',
  },
];

const trustPillars = [
  {
    icon: <UserCheckIcon className="w-7 h-7 text-white" />,
    title: 'Emirates ID Verified',
    desc: 'Identity validated before every assignment.',
  },
  {
    icon: <BadgeCheckIcon className="w-7 h-7 text-white" />,
    title: 'Police Clearance',
    desc: 'Full security screening on file for all staff.',
  },
  {
    icon: <SparklesIcon className="w-7 h-7 text-white" />,
    title: 'Certified Professionals',
    desc: 'Strict 40-hour hotel standard cleaning training.',
  },
  {
    icon: <ShieldCheckIcon className="w-7 h-7 text-white" />,
    title: 'Full Liability Insurance',
    desc: 'AED 1,000,000 protection for your property.',
  },
];

const steps = [
  { num: '01', title: 'Choose Your Service', desc: 'Select from home, villa, deep cleaning, or commercial services.' },
  { num: '02', title: 'Pick Date & Time', desc: 'Choose a convenient slot that suits your schedule. Flexible 7 days.' },
  { num: '03', title: 'Enjoy Spotless Spaces', desc: 'Our uniformed team arrives on time with all professional equipment.' },
];

const reviews = [
  {
    name: 'Fatima Al Mansoori',
    location: 'Khalidiyah, Abu Dhabi',
    stars: 5,
    text: "CitiMaids transformed our 4-bedroom villa. The cleaners were punctual, polite, and extremely thorough with kitchen degreasing and marble floors.",
    avatar: 'FA',
  },
  {
    name: 'James Thornton',
    location: 'Corniche, Abu Dhabi',
    stars: 5,
    text: "Reliable commercial cleaning for our regional office. They operate quietly after hours and everything is sparkling clean for our team every morning.",
    avatar: 'JT',
  },
  {
    name: 'Sara Al Hashmi',
    location: 'Mushrif, Abu Dhabi',
    stars: 5,
    text: "Booked their move-out deep cleaning service. Received our full tenancy deposit back with zero deductions. Highly recommend their team!",
    avatar: 'SH',
  },
];

const faqs = [
  {
    q: 'How long does a standard cleaning session take?',
    a: 'Most apartment cleans take between 2 to 4 hours depending on bedrooms and condition. Deep cleans and large villas typically take 4 to 8 hours with a multi-person crew.',
  },
  {
    q: 'Do you bring your own cleaning supplies and equipment?',
    a: 'Yes! Our team arrives equipped with professional vacuum cleaners, mops, microfiber cloths, and UAE-approved eco-friendly cleaning detergents. You do not need to provide anything.',
  },
  {
    q: 'Are your cleaners legally sponsored and insured in Abu Dhabi?',
    a: 'Yes, 100%. Every CitiMaids cleaner is legally employed, sponsored, insured with AED 1,000,000 public liability, and vetted with Emirates ID and police clearance.',
  },
  {
    q: 'Can I reschedule or cancel my booking?',
    a: 'Yes, absolutely. You can reschedule or cancel at no charge up to 24 hours prior to your scheduled slot via phone or WhatsApp.',
  },
  {
    q: 'Which areas in Abu Dhabi do you cover?',
    a: 'We serve all areas of Abu Dhabi including Mushrif, Al Khalidiyah, Corniche, Al Reem Island, Saadiyat Island, Yas Island, Al Raha Beach, Khalifa City, and Mohammed Bin Zayed City.',
  },
];

function getCategoryIcon(iconName) {
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

function FAQItem({ q, a, index }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={index * 50}>
      <div
        className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white cursor-pointer transition-all duration-200"
        style={{ boxShadow: open ? '0 4px 20px rgba(10,35,66,0.08)' : '0 1px 3px rgba(0,0,0,0.02)' }}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center justify-between px-6 py-4.5 gap-4">
          <span className="font-bold text-slate-900 text-sm md:text-base">{q}</span>
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
            style={{
              background: open ? 'linear-gradient(135deg,#0A2342,#1E3A8A)' : '#f1f5f9',
              color: open ? '#ffffff' : '#64748b',
            }}
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </span>
        </div>
        <div className={`faq-body ${open ? 'open' : ''}`}>
          <div>
            <p className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-50 pt-2">{a}</p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* ── Hero Section with Video Background ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop&auto=format"
        >
          <source src="https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080_24fps.mp4" type="video/mp4" />
          <source src="https://videos.pexels.com/video-files/7688163/7688163-hd_1920_1080_25fps.mp4" type="video/mp4" />
        </video>

        {/* Figma Navy Gradient Overlay */}
        <div className="hero-overlay absolute inset-0" />

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 w-full">
          <div className="max-w-2xl">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2.5 glass-card text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6 shadow-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Abu Dhabi's Trusted Cleaning Company
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-5">
              Immaculate Spaces.<br />
              <span style={{ color: '#93C5FD' }}>Trusted Cleaners</span><br />
              in Abu Dhabi.
            </h1>

            <p className="text-blue-100/90 text-lg font-medium mb-3">
              Reliable &nbsp;•&nbsp; Transparent Pricing &nbsp;•&nbsp; Background-Checked
            </p>
            <p className="text-blue-100/75 text-sm sm:text-base mb-8 max-w-lg leading-relaxed">
              From apartments and luxury villas to offices across Abu Dhabi, CitiMaids delivers spotless, consistent results on your schedule.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                to="/book"
                className="px-8 py-3.5 rounded-xl bg-white font-bold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2"
                style={{ color: '#0A2342' }}
              >
                Book a Cleaning
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                to="/services"
                className="glass-card px-7 py-3.5 rounded-xl text-white font-semibold text-sm sm:text-base transition-all duration-200 hover:bg-white/20 flex items-center gap-2"
              >
                Explore Services
              </Link>
            </div>

            {/* Micro badges */}
            <div className="flex flex-wrap gap-2.5">
              {[
                '🔒 AED 1M Insured',
                '✅ Emirates ID Verified',
                '⭐ 4.9 Average Rating',
                '⚡ Same-Day Slots',
              ].map((badge) => (
                <span
                  key={badge}
                  className="glass-card text-white/90 text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-md"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section style={{ background: 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 py-9 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80} direction="up">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1 tracking-tight">{s.value}</div>
                <div className="text-blue-200 text-xs sm:text-sm font-medium">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Why CitiMaids ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-14">
              <span className="text-blue-800 font-bold text-xs uppercase tracking-widest">Why Choose CitiMaids</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">Setting the Standard in UAE</h2>
              <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm sm:text-base">
                We combine vetted cleaners, hotel-grade cleaning standards, and modern online booking so you never have to worry about cleaning again.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUs.map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div
                  className="rounded-2xl p-7 text-left bg-slate-50 border border-slate-100 hover:border-blue-200 hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col justify-between"
                  style={{ boxShadow: '0 2px 14px rgba(10,35,66,0.04)' }}
                >
                  <div>
                    <div className="w-13 h-13 rounded-xl bg-blue-100/60 flex items-center justify-center mb-5">
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive Before & After Comparison Showcase ── */}
      <section className="py-20 bg-slate-50 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-14">
              <span className="text-blue-800 font-bold text-xs uppercase tracking-widest">Real Visual Proof</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">Before & After Results</h2>
              <p className="text-slate-500 mt-3 max-w-md mx-auto text-sm">
                Drag the divider left and right to inspect the CitiMaids transformation.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Reveal direction="left">
              <BeforeAfterSlider
                label="Living Room & Floor Polish"
                beforeImage="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format"
                afterImage="https://images.unsplash.com/photo-1584820927498-cad076eece54?w=800&h=600&fit=crop&auto=format"
              />
            </Reveal>

            <Reveal direction="right">
              <BeforeAfterSlider
                label="Kitchen Counters & Degreasing"
                beforeImage="https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&h=600&fit=crop&auto=format"
                afterImage="https://images.unsplash.com/photo-1617791160536-598cf32026fb?w=800&h=600&fit=crop&auto=format"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Trust Pillars (The CitiMaids Promise) ── */}
      <section style={{ background: 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)' }} className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-14">
              <span className="text-blue-300 font-semibold text-xs uppercase tracking-widest">Our Strict Verification</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">The CitiMaids Promise</h2>
              <p className="text-blue-200 mt-3 max-w-xl mx-auto text-sm">
                Four rigorous standards every staff member satisfies before entering your home.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trustPillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 80} direction="scale">
                <div className="glass-card rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform duration-300 h-full">
                  <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mx-auto mb-4">
                    {p.icon}
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">{p.title}</h3>
                  <p className="text-blue-200 text-xs leading-relaxed">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Showcase ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <span className="text-blue-800 font-bold text-xs uppercase tracking-widest">Comprehensive Solutions</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">Our Cleaning Services</h2>
              </div>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-900 hover:text-blue-700 transition-colors"
              >
                View all services
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service, i) => (
              <Reveal key={service.id} delay={i * 60}>
                <div
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl h-full flex flex-col justify-between"
                  style={{ boxShadow: '0 2px 14px rgba(10,35,66,0.05)' }}
                >
                  <div>
                    <div className="h-44 bg-slate-100 overflow-hidden relative">
                      <img
                        src={`https://images.unsplash.com/photo-${service.imageId}?w=600&h=350&fit=crop&auto=format`}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-blue-950 flex items-center gap-1.5 shadow-sm">
                        {getCategoryIcon(service.iconName)}
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
                      Details
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 shadow-md"
              style={{ background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' }}
            >
              Browse Complete Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-14">
              <span className="text-blue-800 font-bold text-xs uppercase tracking-widest">Effortless Process</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">How It Works</h2>
              <p className="text-slate-500 mt-3 max-w-sm mx-auto text-sm">
                Book your professional cleaner in three simple steps.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 100} direction="scale">
                <div className="text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white font-extrabold text-xl shadow-lg"
                    style={{ background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' }}
                  >
                    {s.num}
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 px-9 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 shadow-lg"
              style={{ background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' }}
            >
              Book in 60 Seconds
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-14">
              <span className="text-blue-800 font-bold text-xs uppercase tracking-widest">Client Feedback</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">Trusted Across Abu Dhabi</h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <Reveal key={r.name} delay={i * 80}>
                <div
                  className="bg-slate-50 rounded-2xl p-7 border border-slate-100 flex flex-col justify-between h-full"
                  style={{ boxShadow: '0 2px 12px rgba(10,35,66,0.03)' }}
                >
                  <div>
                    <div className="flex gap-1 text-amber-400 mb-4">
                      {Array.from({ length: r.stars }).map((_, j) => (
                        <StarIcon key={j} className="w-4 h-4 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed italic mb-6">"{r.text}"</p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200/50">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
                      style={{ background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' }}
                    >
                      {r.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{r.name}</div>
                      <div className="text-slate-400 text-xs">{r.location}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/60">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-12">
              <span className="text-blue-800 font-bold text-xs uppercase tracking-widest">Got Questions?</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">Frequently Asked</h2>
            </div>
          </Reveal>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <FAQItem key={f.q} q={f.q} a={f.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final Call to Action ── */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
              Ready for a Spotless Home or Office?
            </h2>
            <p className="text-blue-200 mb-8 text-base sm:text-lg max-w-xl mx-auto">
              Book your professional cleaning today. We confirm appointments within 30 minutes.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/book"
                className="px-9 py-3.5 rounded-xl bg-white font-bold text-sm sm:text-base hover:bg-blue-50 transition-all hover:scale-105 shadow-xl"
                style={{ color: '#0A2342' }}
              >
                Book Online Now
              </Link>
              <a
                href="https://wa.me/97150000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm sm:text-base transition-all hover:scale-105 shadow-lg"
              >
                WhatsApp Inquiry
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
