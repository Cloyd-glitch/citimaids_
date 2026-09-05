/**
 * WhatsApp Dispatch & Communication Utility
 *
 * Provides phone number normalization tailored to UAE formats (+971, 05x),
 * along with pre-formatted WhatsApp Web/App deep-link generators for both
 * customer-facing tracking and admin-facing dispatch communications.
 */

// Default CitiMaids customer service and dispatch WhatsApp number
export const CITIMAIDS_WA_NUMBER = '971526349461';

/**
 * Clean and format any UAE phone number to international wa.me format.
 * Strips special characters, spaces, and resolves local prefixes.
 * Examples:
 *   - "050 123 4567"     -> "971501234567"
 *   - "+971 50 123 4567" -> "971501234567"
 *   - "501234567"        -> "971501234567"
 *
 * @param {string} phone - Raw input phone number
 * @returns {string} Clean numeric digits for wa.me links
 */
export function formatWhatsAppPhone(phone) {
  if (!phone) return CITIMAIDS_WA_NUMBER;
  const digits = String(phone).replace(/[^0-9]/g, '');
  if (digits.startsWith('971')) return digits;
  if (digits.startsWith('05')) return '971' + digits.substring(1);
  if (digits.startsWith('5')) return '971' + digits;
  return digits || CITIMAIDS_WA_NUMBER;
}

/**
 * Customer-Facing: Generates a deep link to CitiMaids WhatsApp dispatch.
 * Pre-populates the message with the customer's booking reference, service, and scheduled date.
 *
 * @param {object} booking - Booking object with reference, service, and preferred_date
 * @returns {string} WhatsApp URL (https://wa.me/...)
 */
export function getCustomerBookingWALink(booking) {
  const ref = booking?.reference || (booking?.id ? `CM-${String(booking.id).padStart(5, '0')}` : 'Inquiry');
  const service = booking?.service?.name || booking?.service?.title || 'Cleaning Service';
  const date = booking?.preferred_date ? new Date(booking.preferred_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  
  const text = `Hello CitiMaids! 🧹
I am inquiring about my booking *${ref}* (${service}${date ? ` on ${date}` : ''}).
Could you please provide an update on dispatch status?`;

  return `https://wa.me/${CITIMAIDS_WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * Customer-Facing: Generates a WhatsApp deep link requesting a booking reschedule.
 *
 * @param {object} booking - Booking object with reference
 * @returns {string} WhatsApp URL (https://wa.me/...)
 */
export function getCustomerRescheduleWALink(booking) {
  const ref = booking?.reference || (booking?.id ? `CM-${String(booking.id).padStart(5, '0')}` : 'Booking');
  const text = `Hello CitiMaids! 📅
I would like to request a reschedule for my booking *${ref}*.
Please let me know available slots for an alternative date.`;

  return `https://wa.me/${CITIMAIDS_WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * Admin-Facing: Generates a formatted WhatsApp message link addressed to the client.
 * Includes the customer's live tracking URL (`/track-booking?ref=...`) and tailored dispatch copy.
 *
 * Templates supported:
 *   - 'confirmed' : Booking confirmed, team and supplies allocated.
 *   - 'en_route'  : Cleaning crew is currently en route to the location.
 *   - 'completed' : Job finished, requesting review / feedback.
 *
 * @param {object} booking - Booking data record
 * @param {'confirmed'|'en_route'|'completed'} template - Message template variant
 * @returns {string} WhatsApp URL (https://wa.me/...)
 */
export function getAdminDispatchWALink(booking, template = 'confirmed') {
  const phone = formatWhatsAppPhone(booking?.client?.contact_number || booking?.contact_number);
  const clientName = booking?.client?.name || booking?.client_name || 'Valued Client';
  const ref = booking?.reference || `CM-${String(booking?.id || '').padStart(5, '0')}`;
  const service = booking?.service?.name || booking?.service?.title || 'Cleaning Service';
  const trackingUrl = `${window.location.origin}/track-booking?ref=${encodeURIComponent(ref)}`;
  
  let text = '';
  switch (template) {
    case 'confirmed':
      text = `Hello ${clientName}! 🧹✨
Your CitiMaids booking *${ref}* for *${service}* has been *Confirmed & Scheduled*!

📅 Scheduled Date: ${booking?.preferred_date ? new Date(booking.preferred_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Scheduled slot'}
📍 Location: ${booking?.address || 'Your specified address'}

You can track your live service status anytime on our client portal:
👉 ${trackingUrl}

Thank you for choosing CitiMaids Abu Dhabi!`;
      break;

    case 'en_route':
      text = `Good day ${clientName}! 🚚
Our CitiMaids specialized cleaning crew is currently *En Route* to your location for booking *${ref}*.

📍 Destination: ${booking?.address || 'Your address'}
👉 Live Tracker: ${trackingUrl}

Please ensure gate or door access is ready. See you shortly!`;
      break;

    case 'completed':
      text = `Hello ${clientName}! ⭐
Your CitiMaids service for booking *${ref}* has been *Completed*!

We hope your space is sparkling clean and fresh. If you have any feedback or would like to schedule your next visit, please let us know right here on WhatsApp.

Have a wonderful day!`;
      break;

    default:
      text = `Hello ${clientName}, this is CitiMaids regarding your booking *${ref}*. Live tracking link: ${trackingUrl}`;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
