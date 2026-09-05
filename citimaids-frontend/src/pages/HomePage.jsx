import { useState } from 'react';
import { Link } from 'react-router-dom';
import { services } from '../data/services';
import { useSettings } from '../hooks/useSettings';
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
  { value: '500+', label: 'Homes Cleaned in UAE' },
  { value: '4.9 / 5', label: 'Average Client Rating' },
  { value: '9+ Yrs', label: 'Abu Dhabi Experience' },
  { value: '100%', label: 'Satisfaction Guarantee' },
];

const whyUs = [
  {
    icon: <UserCheckIcon className="w-7 h-7 text-white" />,
    title: 'Vetted & Trained Specialists',
    desc: 'Every team member undergoes police background checks, Emirates ID verification, and 40+ hours of hotel-grade cleaning training.',
  },
  {
    icon: <ShieldCheckIcon className="w-7 h-7 text-white" />,
    title: 'AED 1M Liability Insurance',
    desc: 'Comprehensive public liability insurance guarantees absolute peace of mind for your luxury furniture, fixtures, and property.',
  },
  {
    icon: <SparklesIcon className="w-7 h-7 text-white" />,
    title: 'Hospital-Grade Eco Products',
    desc: 'UAE-approved non-toxic solutions safe for young children, pets, and delicate marble flooring. Zero harsh chemical residue.',
  },
  {
    icon: <ClockIcon className="w-7 h-7 text-white" />,
    title: 'Fast Same-Day Scheduling',
    desc: 'Convenient online booking in under 60 seconds with flexible 7-day appointment slots and instant WhatsApp dispatch confirmation.',
  },
];

const trustPillars = [
  {
    icon: <UserCheckIcon className="w-6 h-6 text-sky-300" />,
    title: 'Emirates ID Verified',
    desc: 'Legal identity validated before every household assignment.',
  },
  {
    icon: <BadgeCheckIcon className="w-6 h-6 text-sky-300" />,
    title: 'Police Security Cleared',
    desc: 'Strict criminal background check on file for all personnel.',
  },
  {
    icon: <SparklesIcon className="w-6 h-6 text-sky-300" />,
    title: 'Hotel-Trained Crews',
    desc: 'Trained to 5-star hospitality hygiene and finishing standards.',
  },
  {
    icon: <ShieldCheckIcon className="w-6 h-6 text-sky-300" />,
    title: 'AED 1M Property Insurance',
    desc: 'Full coverage protecting your home and luxury interiors.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Select Service',
    desc: 'Choose from residential cleaning, luxury villa care, deep sanitation, or commercial maintenance.',
  },
  {
    num: '02',
    title: 'Choose Time & District',
    desc: 'Pick your preferred date and time slot in any Abu Dhabi district. Same-day bookings available.',
  },
  {
    num: '03',
    title: 'Enjoy Spotless Spaces',
    desc: 'Our uniformed crew arrives on time with all industrial equipment and hospital-grade eco detergents.',
  },
];

const reviews = [
  {
    name: 'Fatima Al Mansoori',
    location: 'Al Khalidiyah, Abu Dhabi',
    stars: 5,
    text: "CitiMaids completely elevated our 4-bedroom villa. The cleaners were punctual, polite, and paid incredible attention to marble polishing and kitchen degreasing. By far the best in Abu Dhabi.",
    avatar: 'FA',
  },
  {
    name: 'James Thornton',
    location: 'Corniche Towers, Abu Dhabi',
    stars: 5,
    text: "Outstanding commercial service for our regional office. They operate quietly and thoroughly after hours, and our team arrives every morning to a fresh, gleaming workspace.",
    avatar: 'JT',
  },
  {
    name: 'Sara Al Hashmi',
    location: 'Al Mushrif, Abu Dhabi',
    stars: 5,
    text: "Booked their move-out handover clean. We received our full tenancy security deposit back with zero deductions! The ovens and bathrooms looked brand new.",
    avatar: 'SH',
  },
];

const faqs = [
  {
    q: 'How long does a standard cleaning appointment take?',
    a: 'Most standard apartment cleans take between 2 to 4 hours depending on the number of bedrooms and bathrooms. Deep cleans and luxury villas typically take 4 to 8 hours with a multi-cleaner crew.',
  },
  {
    q: 'Do your cleaners bring all supplies and equipment?',
    a: 'Yes, 100%! Our crew arrives fully equipped with high-suction vacuum cleaners, mops, microfiber cloths, and UAE-approved eco-friendly cleaning solutions. You do not need to provide anything.',
  },
  {
    q: 'Are your cleaners legally sponsored and insured in Abu Dhabi?',
    a: 'Yes. Every CitiMaids cleaner is legally employed, sponsored, vetted with Emirates ID and police clearance, and covered by AED 1,000,000 public liability insurance.',
  },
  {
    q: 'Can I reschedule or cancel my booking without penalty?',
    a: 'Yes. You can reschedule or cancel your appointment free of charge up to 24 hours before your scheduled time slot by contacting us via WhatsApp or phone.',
  },
  {
    q: 'Which areas across Abu Dhabi do you service?',
    a: 'We cover all districts of Abu Dhabi including Al Reem Island, Saadiyat Island, Yas Island, Al Khalidiyah, Corniche, Al Bateen, Al Mushrif, Khalifa City A, Al Raha Beach, and Mohammed Bin Zayed City.',
  },
];

function getCategoryIcon(iconName) {
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

function FAQCard({ q, a, index }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={index * 50}>
      <div
        className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white cursor-pointer transition-all duration-300 hover:border-blue-300 hover:shadow-md"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center justify-between p-6 gap-4">
          <span className="font-bold text-slate-900 text-base sm:text-lg">{q}</span>
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
              open ? 'bg-[#0A2342] text-white rotate-180 shadow-md' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className={`faq-content ${open ? 'open' : ''}`}>
          <div>
            <p className="px-6 pb-6 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 pt-3">
              {a}
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default function HomePage() {
  const { settings } = useSettings();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', location: '', stars: 5, text: '' });
  
  // Safely extract city from the address or default to 'Abu Dhabi'
  const addressParts = settings?.business_address ? settings.business_address.split(',') : [];
  const city = addressParts.length > 1 ? addressParts[1].trim() : 'Abu Dhabi';
  
  const businessName = settings?.business_name || 'CitiMaids';
  const description = settings?.description || "From luxury villas and private apartments to corporate offices across Abu Dhabi, CitiMaids delivers hospital-grade sanitization and spotless finishing tailored to your schedule.";

  return (
    <div>
      {/* ── 1. Hero Section with Video Background ── */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden pt-36 pb-24">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105"
          poster="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop&auto=format"
        >
          <source src="https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080_24fps.mp4" type="video/mp4" />
          <source src="https://videos.pexels.com/video-files/7688163/7688163-hd_1920_1080_25fps.mp4" type="video/mp4" />
        </video>

        {/* Rich Figma Navy Gradient Overlay */}
        <div className="hero-gradient-overlay absolute inset-0" />

        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 w-full">
          <div className="max-w-3xl">
            {/* Top Eyebrow Badge */}
            <div className="inline-flex items-center gap-2.5 glass-pill px-4 py-2 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-6 shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{city}'s Premier Cleaning Service</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.08] tracking-tight mb-6">
              Immaculate Spaces.<br />
              <span className="bg-gradient-to-r from-sky-300 via-blue-200 to-white bg-clip-text text-transparent">
                Trusted Cleaners
              </span><br />
              <span className="text-xl sm:text-3xl lg:text-4xl font-semibold opacity-90">
                in UAE's biggest cities: Abu Dhabi, Dubai, and Sharjah.
              </span>
            </h1>

            {/* Subtitles */}
            <p className="text-sky-200 text-lg sm:text-xl font-semibold mb-3 tracking-wide">
              Reliable &nbsp;•&nbsp; Transparent Pricing &nbsp;•&nbsp; Vetted Professionals
            </p>
            <p className="text-slate-300 text-sm sm:text-base mb-10 max-w-xl leading-relaxed">
              {description}
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <Link
                to="/book"
                className="px-8 py-4 rounded-2xl bg-white text-[#0A2342] font-extrabold text-sm sm:text-base transition-all duration-200 hover:bg-sky-50 hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-2.5"
              >
                <span>Book a Cleaning</span>
                <svg className="w-4 h-4 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <Link
                to="/services"
                className="glass-pill px-7 py-4 rounded-2xl text-white font-bold text-sm sm:text-base transition-all duration-200 hover:bg-white/20 flex items-center gap-2"
              >
                <span>Explore Services</span>
              </Link>
            </div>

            {/* Trust Proof Badges */}
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'AED 1M Insurance', icon: (
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )},
                { label: 'Emirates ID Verified', icon: (
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )},
                { label: '4.9 / 5 Rating', icon: (
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                )},
                { label: 'Same-Day Slots Available', icon: (
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )},
              ].map((b) => (
                <div
                  key={b.label}
                  className="glass-pill text-white/95 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm"
                >
                  <span className="text-sky-300">{b.icon}</span>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Elevated Floating Stats Bar ── */}
      <section className="relative z-20 -mt-10 max-w-7xl mx-auto px-6 sm:px-8">
        <div
          className="rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8"
          style={{ background: 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)' }}
        >
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 70} direction="up">
              <div className="text-center sm:text-left border-l-0 sm:border-l sm:border-white/10 sm:pl-6 first:border-0 first:pl-0">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-1.5 tracking-tight">
                  {s.value}
                </div>
                <div className="text-sky-200 text-xs sm:text-sm font-medium leading-snug">
                  {s.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 3. Why Choose CitiMaids (Setting the Standard) ── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-900 font-extrabold text-xs uppercase tracking-widest mb-3">
                Why CitiMaids
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                Setting the Standard in UAE
              </h2>
              <p className="text-slate-500 mt-4 text-sm sm:text-base leading-relaxed">
                We combine vetted cleaners, 5-star hotel hygiene standards, and modern online booking so you never have to worry about cleaning again.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyUs.map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div
                  className="rounded-3xl p-8 bg-slate-50 border border-slate-200/80 hover:border-blue-400 hover:bg-white hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 h-full flex flex-col justify-between"
                >
                  <div>
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)' }}
                    >
                      {item.icon}
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg mb-3 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Interactive Before & After Comparison Showcase ── */}
      <section className="py-28 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-900 font-extrabold text-xs uppercase tracking-widest mb-3">
                Real Visual Proof
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                Before & After Transformations
              </h2>
              <p className="text-slate-500 mt-4 text-sm sm:text-base leading-relaxed">
                Drag the divider handle horizontally on either frame to inspect the gleaming CitiMaids transformation.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
            <Reveal direction="left">
              <BeforeAfterSlider
                label="Living Room & Marble Floor Restoration"
                beforeImage="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=900&auto=format&fit=crop&q=80"
                afterImage="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80"
              />
            </Reveal>

            <Reveal direction="right">
              <BeforeAfterSlider
                label="Kitchen Counters & Cooker Hood Degreasing"
                beforeImage="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=900&auto=format&fit=crop&q=80"
                afterImage="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=900&auto=format&fit=crop&q=80"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 5. The CitiMaids Promise (Trust Pillars) ── */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #061429 0%, #0A2342 100%)' }}
      >
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-white/10 text-sky-300 font-bold text-xs uppercase tracking-widest mb-3 backdrop-blur-md">
                Guaranteed Excellence
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                The CitiMaids Promise
              </h2>
              <p className="text-slate-300 mt-4 text-sm sm:text-base leading-relaxed">
                Four stringent security and quality standards every cleaner satisfies before entering your residence.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustPillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 80} direction="scale">
                <div className="glass-panel rounded-3xl p-7 text-center hover:-translate-y-2 transition-all duration-300 h-full flex flex-col items-center">
                  <div className="w-13 h-13 rounded-2xl bg-white/10 flex items-center justify-center mb-5 shadow-inner">
                    {p.icon}
                  </div>
                  <h3 className="font-extrabold text-white text-lg mb-2">{p.title}</h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Services Catalog Showcase ── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <Reveal>
            <div className="flex items-end justify-between mb-16 flex-wrap gap-4 border-b border-slate-100 pb-8">
              <div>
                <span className="inline-block px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-900 font-extrabold text-xs uppercase tracking-widest mb-3">
                  Tailored Cleaning
                </span>
                <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  Popular Services
                </h2>
              </div>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-blue-900 hover:text-blue-700 transition-colors"
              >
                <span>View all 7 services</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service, i) => (
              <Reveal key={service.id} delay={i * 60}>
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
                        {getCategoryIcon(service.iconName)}
                        <span>{service.title}</span>
                      </div>
                    </div>
                    <div className="p-7">
                      <h3 className="font-extrabold text-slate-900 text-xl mb-2.5">{service.title}</h3>
                      <p className="text-slate-600 text-sm mb-6 leading-relaxed line-clamp-2">
                        {service.description}
                      </p>
                      <ul className="space-y-2 mb-6 text-xs sm:text-sm text-slate-700">
                        {service.included.slice(0, 3).map((inc) => (
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
                      <span>View Details</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              to="/services"
              className="inline-flex items-center gap-2.5 px-9 py-4 rounded-2xl font-extrabold text-sm text-white transition-all hover:scale-105 shadow-xl"
              style={{ background: 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)' }}
            >
              <span>Browse Full Service Catalog</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 7. How It Works (3 Steps) ── */}
      <section className="py-28 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-20">
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-900 font-extrabold text-xs uppercase tracking-widest mb-3">
                Simple Booking
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                How It Works
              </h2>
              <p className="text-slate-500 mt-4 text-sm sm:text-base leading-relaxed">
                Book your cleaning session effortlessly in three simple steps.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 90} direction="scale">
                <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-sm relative h-full flex flex-col items-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white font-black text-2xl shadow-xl"
                    style={{ background: 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)' }}
                  >
                    {s.num}
                  </div>
                  <h3 className="font-black text-slate-900 text-xl mb-3">{s.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-black text-sm sm:text-base text-white transition-all hover:scale-105 shadow-xl"
              style={{ background: 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)' }}
            >
              <span>Book in 60 Seconds</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8. Verified Reviews ── */}
      <section className="py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-900 font-extrabold text-xs uppercase tracking-widest mb-3">
                Client Testimonials
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                Trusted Across Abu Dhabi
              </h2>
              <p className="text-slate-500 mt-4 text-sm sm:text-base">
                Read real experiences from our clients across Abu Dhabi or share your own feedback.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-sm transition-all transform hover:scale-105 shadow-lg"
                >
                  <span>⭐ Write a Review</span>
                </button>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((r, i) => (
              <Reveal key={r.name} delay={i * 80}>
                <div
                  className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 flex flex-col justify-between h-full shadow-sm hover:shadow-lg transition-all"
                >
                  <div>
                    <div className="flex gap-1 text-amber-400 mb-5">
                      {Array.from({ length: r.stars }).map((_, j) => (
                        <StarIcon key={j} className="w-5 h-5 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 text-sm sm:text-base leading-relaxed italic mb-8">
                      "{r.text}"
                    </p>
                  </div>
                  <div className="flex items-center gap-4 pt-5 border-t border-slate-200">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 shadow-md"
                      style={{ background: 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)' }}
                    >
                      {r.avatar}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-base">{r.name}</div>
                      <div className="text-slate-500 text-xs">{r.location}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── Review Submission Modal Template ── */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => setShowReviewModal(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold transition-all"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center font-black text-lg">
                  ⭐
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xl">Leave a Client Review</h3>
                  <p className="text-slate-500 text-xs">Share your experience with CitiMaids Cleaning Services</p>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                setReviewSubmitted(true);
                setTimeout(() => {
                  setReviewSubmitted(false);
                  setShowReviewModal(false);
                }, 2000);
              }} className="space-y-4">
                {reviewSubmitted ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3 font-bold text-xl">✓</div>
                    <h4 className="font-bold text-emerald-900 text-base">Thank You for Your Feedback!</h4>
                    <p className="text-emerald-700 text-xs mt-1">Review template submitted. Integration ready for landing page.</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Rating</label>
                      <div className="flex gap-2 text-2xl">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, stars: star })}
                            className={`transition-all transform hover:scale-110 ${
                              star <= reviewForm.stars ? 'text-amber-400' : 'text-slate-200'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mariam Al Zaabi"
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Location / District</label>
                      <input
                        type="text"
                        placeholder="e.g. Al Reem Island, Abu Dhabi"
                        value={reviewForm.location}
                        onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Your Review</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell us about your experience with CitiMaids cleaners..."
                        value={reviewForm.text}
                        onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowReviewModal(false)}
                        className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-sm hover:bg-slate-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 rounded-xl bg-blue-950 text-white font-extrabold text-sm hover:bg-blue-900 transition-all shadow-lg"
                      >
                        Submit Review
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        )}
      </section>

      {/* ── 9. FAQ Accordion ── */}
      <section className="py-28 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-3xl mx-auto px-6 sm:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-900 font-extrabold text-xs uppercase tracking-widest mb-3">
                Got Questions?
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                Frequently Asked
              </h2>
            </div>
          </Reveal>

          <div className="space-y-4">
            {faqs.map((f, i) => (
              <FAQCard key={f.q} q={f.q} a={f.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. Grand Call to Action ── */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #061429 0%, #0A2342 50%, #1E3A8A 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center relative z-10">
          <Reveal>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-sky-300 font-bold text-xs uppercase tracking-widest mb-4 backdrop-blur-md">
              Fast Response Guarantee
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              Ready for a Spotless Home or Office?
            </h2>
            <p className="text-sky-100 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Book your professional cleaning service today. Our dispatch team confirms all appointments within 30 minutes.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/book"
                className="px-10 py-4 rounded-2xl bg-white text-slate-900 font-black text-base hover:bg-sky-50 transition-all hover:scale-105 shadow-2xl"
              >
                Book Online Now
              </Link>
              <a
                href="https://wa.me/97150000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-9 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base transition-all hover:scale-105 shadow-xl"
              >
                <span>WhatsApp Inquiry</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
