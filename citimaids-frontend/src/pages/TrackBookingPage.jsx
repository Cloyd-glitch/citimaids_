import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Reveal from '../components/Reveal';
import { getCustomerBookingWALink, getCustomerRescheduleWALink } from '../utils/whatsapp';

/**
 * TrackBookingPage Component
 *
 * Dedicated public self-service tracking portal for CitiMaids clients.
 *
 * Features:
 *   - Auto-fetches booking data if 'ref', 'reference', or 'phone' is present in URL search parameters.
 *   - Interactive tabbed search: By Reference ID (e.g. "CM-00001") or Phone Number (e.g. "0501234567").
 *   - Visual 4-Stage Stepper with animated pulse effects indicating current dispatch progress:
 *       1. Inquiry Received -> 2. Confirmed & Scheduled -> 3. Crew En Route -> 4. Service Completed.
 *   - Appointment overview card showing scheduled date, service type, location, client name, and payment status.
 *   - Direct WhatsApp action buttons for booking inquiries and reschedule requests.
 *
 * @returns {JSX.Element}
 */
export default function TrackBookingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || searchParams.get('reference') || '';
  const initialPhone = searchParams.get('phone') || '';

  const [queryType, setQueryType] = useState(initialPhone ? 'phone' : 'ref');
  const [searchValue, setSearchValue] = useState(initialPhone || initialRef);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const fetchBooking = async (type, val) => {
    if (!val || !val.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const paramName = type === 'phone' ? 'phone' : 'ref';
      const res = await api.get(`/bookings/track?${paramName}=${encodeURIComponent(val.trim())}`);
      setBooking(res.data);
    } catch (err) {
      setBooking(null);
      setError(
        err.response?.data?.message ||
          'No booking found matching your search. Please check your reference code or contact our dispatch team.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      setQueryType('ref');
      setSearchValue(initialRef);
      fetchBooking('ref', initialRef);
    } else if (initialPhone) {
      setQueryType('phone');
      setSearchValue(initialPhone);
      fetchBooking('phone', initialPhone);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    if (queryType === 'ref') {
      setSearchParams({ ref: searchValue.trim() });
    } else {
      setSearchParams({ phone: searchValue.trim() });
    }
    fetchBooking(queryType, searchValue);
  };

  const getStatusBadge = (status, isCancelled) => {
    if (isCancelled || status === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          Cancelled
        </span>
      );
    }
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Completed
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Confirmed & Scheduled
          </span>
        );
      case 'en_route':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            Crew En Route
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Banner */}
      <section
        className="relative pt-32 pb-24 text-white overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #061429 0%, #0A2342 50%, #1E3A8A 100%)',
        }}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, #38bdf8 0%, transparent 40%), radial-gradient(circle at 80% 70%, #60a5fa 0%, transparent 40%)',
          }}
        />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 text-sky-200 border border-white/15 backdrop-blur-md mb-4 uppercase tracking-wider">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Live Service Tracking
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">
            Track Your Booking
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed">
            Stay updated in real-time on your CitiMaids cleaning team, scheduled time window, and dispatch status across Abu Dhabi.
          </p>

          {/* Search Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-100 max-w-2xl mx-auto text-left text-slate-800">
            {/* Toggle tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setQueryType('ref');
                  setSearchValue('');
                }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  queryType === 'ref'
                    ? 'bg-white text-[#0A2342] shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                By Reference Number
              </button>
              <button
                type="button"
                onClick={() => {
                  setQueryType('phone');
                  setSearchValue('');
                }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  queryType === 'phone'
                    ? 'bg-white text-[#0A2342] shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                By Phone Number
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  {queryType === 'ref' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  )}
                </div>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={queryType === 'ref' ? 'e.g. CM-00001 or 1' : 'e.g. 0501234567'}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A2342] focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-7 py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-md transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)' }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>Track Order</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-4xl mx-auto px-6 py-12 -mt-6">
        {/* Error notification */}
        {error && (
          <Reveal>
            <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-sm text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Booking Not Found</h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">{error}</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href={`https://wa.me/97150000000?text=${encodeURIComponent(
                    `Hello CitiMaids dispatch! I need assistance locating my booking: ${searchValue}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z" />
                  </svg>
                  <span>Chat with Dispatch Team</span>
                </a>
                <Link
                  to="/book"
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  Book New Appointment
                </Link>
              </div>
            </div>
          </Reveal>
        )}

        {/* Found Booking Card */}
        {booking && (
          <Reveal>
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden mb-12">
              {/* Card Header */}
              <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-[#0A2342] text-white flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                      Booking Reference
                    </span>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-white font-mono font-bold">
                      {booking.reference}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {booking.service?.name || 'Cleaning Service'}
                  </h2>
                </div>
                <div>{getStatusBadge(booking.status, booking.is_cancelled)}</div>
              </div>

              {/* Live Timeline Stepper */}
              <div className="p-6 sm:p-10 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-8">
                  Live Dispatch Status
                </h3>

                <div className="relative">
                  {/* Progress Line */}
                  <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-slate-200 -z-0">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-700"
                      style={{
                        width: booking.is_cancelled
                          ? '0%'
                          : booking.status === 'completed'
                          ? '100%'
                          : booking.status === 'en_route'
                          ? '66%'
                          : booking.status === 'confirmed'
                          ? '33%'
                          : '10%',
                      }}
                    />
                  </div>

                  {/* Steps Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-4 relative z-10">
                    {booking.timeline?.map((step, idx) => (
                      <div key={step.key} className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-4 sm:gap-2">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 transition-all duration-300 ${
                            step.done
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 ring-4 ring-emerald-100'
                              : step.current
                              ? 'bg-[#0A2342] text-white ring-4 ring-blue-100 animate-pulse'
                              : 'bg-white border-2 border-slate-200 text-slate-400'
                          }`}
                        >
                          {step.done ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 leading-snug">
                            {step.title}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed hidden sm:block">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Service & Appointment Details Grid */}
              <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Col: Appointment Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Appointment Details
                  </h4>

                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3.5 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-semibold">Scheduled Date</div>
                        <div className="font-extrabold text-slate-900">
                          {booking.preferred_date
                            ? new Date(booking.preferred_date).toLocaleDateString('en-GB', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })
                            : 'To be confirmed'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-semibold">Service Location</div>
                        <div className="font-bold text-slate-900 leading-snug">
                          {booking.address || 'Abu Dhabi address on file'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-semibold">Client Name</div>
                        <div className="font-bold text-slate-900">
                          {booking.client_name}
                        </div>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                        <span className="font-bold text-slate-700">Special Instructions:</span> {booking.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Col: Payment & Actions */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Payment & Dispatch Assistance
                  </h4>

                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                      <span className="text-xs font-bold text-slate-500">Payment Status</span>
                      <span
                        className={`text-xs font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                          booking.payment_status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {booking.payment_status || 'Unpaid'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Payment Method</span>
                      <span className="text-xs font-semibold text-slate-800">
                        {booking.payment_method?.replace(/_/g, ' ') || 'Cash on Completion'}
                      </span>
                    </div>

                    {booking.total_amount && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <span className="text-sm font-black text-slate-900">Estimated Total</span>
                        <span className="text-lg font-black text-[#0A2342]">
                          AED {parseFloat(booking.total_amount).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* WhatsApp Quick Link */}
                    <a
                      href={getCustomerBookingWALink(booking)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z" />
                      </svg>
                      <span>Inquire on WhatsApp</span>
                    </a>

                    {/* Reschedule WhatsApp Link */}
                    <a
                      href={getCustomerRescheduleWALink(booking)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Request Reschedule</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* Initial Empty State / Helpful Tips */}
        {!booking && !error && !loading && !searched && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-slate-600 py-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-1">Instant Updates</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Check whether our cleaners are assigned or on the way to your door.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z" />
                </svg>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-1">WhatsApp Direct</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect directly with CitiMaids dispatch with your order details pre-tagged.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-1">Flexible Scheduling</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Need to change your time? One-tap request to reschedule your cleaner slot.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
