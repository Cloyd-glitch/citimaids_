import { Link, useLocation } from 'react-router-dom';

export default function BookingConfirmationPage() {
  const { state } = useLocation();
  const { data, bookingId, service, estimate } = state || {};

  if (!data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">No active booking session found</h2>
        <p className="text-slate-500 text-sm mb-4">You can schedule a new cleaning appointment anytime.</p>
        <Link
          to="/book"
          className="inline-flex px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-md"
          style={{ background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' }}
        >
          Book a Cleaning
        </Link>
      </div>
    );
  }

  const waText = encodeURIComponent(
    `Hi CitiMaids! My booking reference is #${bookingId}. I have booked ${service?.title} for ${data.date} at ${data.time} at ${data.district}. Please confirm my appointment.`
  );

  return (
    <div className="min-h-[85vh] bg-slate-50 py-16 flex items-center">
      <div className="max-w-xl mx-auto px-6 w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl shadow-xl"
            style={{ background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' }}
          >
            ✓
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Booking Received!</h1>
          <p className="text-slate-500 text-sm">
            Thank you, {data.name}! We will review your appointment and confirm within 30 minutes.
          </p>
        </div>

        {/* Confirmation Summary Card */}
        <div
          className="bg-white rounded-2xl p-7 sm:p-8 mb-6 border border-slate-100"
          style={{ boxShadow: '0 4px 28px rgba(10,35,66,0.06)' }}
        >
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-100">
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Booking ID</div>
              <div className="text-2xl font-extrabold text-blue-950">#{bookingId}</div>
            </div>
            <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-lg">
              Pending Confirmation
            </span>
          </div>

          <div className="space-y-3.5 text-sm">
            {[
              ['Service', service?.title || 'Cleaning'],
              ['Date & Time', `${data.date} at ${data.time}`],
              ['Property', `${data.propertyType}, ${data.rooms} Bed, ${data.bathrooms} Bath`],
              ['Location', `${data.district}, ${data.address}`],
              ['Contact Number', data.phone],
              ['Estimated Rate', `AED ${estimate?.total || service?.basePrice} (${estimate?.hours || 'Standard'})`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-slate-500 font-medium">{label}</span>
                <span className="font-bold text-slate-900 text-right max-w-xs">{val}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-blue-50/80 border border-blue-100 text-xs text-blue-900">
              <svg className="w-4 h-4 text-blue-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Our dispatch team will send an SMS or call you to confirm cleaner dispatch.</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            to={`/track-booking?ref=${encodeURIComponent(bookingId)}`}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Track Your Booking Status</span>
          </Link>

          <a
            href={`https://wa.me/97150000000?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.535 5.859L0 24l6.335-1.509A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.502-5.184-1.381l-.372-.22-3.762.897.944-3.658-.242-.378A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            <span>Fast Track via WhatsApp</span>
          </a>

          <Link
            to="/"
            className="block text-center py-3 rounded-xl font-bold text-xs text-slate-600 hover:text-slate-900 transition-colors"
          >
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
