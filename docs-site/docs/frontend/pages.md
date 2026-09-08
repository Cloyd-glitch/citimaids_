---
sidebar_position: 2
---

# Pages

All pages live in `citimaids-frontend/src/pages/`. Customer pages are wrapped by `RootLayout`; admin pages are wrapped by `AdminLayout` and guarded by `ProtectedRoute`.

---

## Customer Pages

### `HomePage.jsx` — `/`

The main landing page. Key sections:

- **Hero section** — autoplay video background (`citimaid-hero.mp4`) with gradient overlay, headline, and CTA buttons ("Book Now" → `/book`, "Our Services" → `/services`)
- **Services preview** — dynamic grid of top services fetched from the API
- **Before & After sliders** — two drag-to-compare transformation sliders (Living Room and Kitchen)
- **Stats bar** — customer count, experience years, service count
- **Contact section** — quick contact form with WhatsApp CTA

---

### `ServicesPage.jsx` — `/services`

Displays the full CitiMaids service catalogue (16 services). Features:
- Dynamic service count from API
- Service cards with image, name, price, and "Book" CTA

---

### `ServiceDetailPage.jsx` — `/services/:serviceId`

Individual service detail view. Resolves service by `serviceId` from the static registry. Shows:
- Full description
- Pricing details with unit (e.g. `AED 70 / hr`)
- Included tasks checklist
- "Book Now" CTA

---

### `BookingPage.jsx` — `/book`

The primary booking interface. Features:

- **4-category tab filter:**
  - 🏠 Residential Cleaning (Home Cleaning, Apartment, Villa, General, Ironing & Baby Sitting, Baby & Pet Sitting)
  - 🏢 Commercial Cleaning (Office Cleaning, Building Cleaning)
  - 🧪 Specialized Cleaning (Deep Cleaning, Move In/Out, Carpet, Sofa, Window Cleaning, Glass Cleaning)
  - 🌿 Outdoor Maintenance (Landscape Contractor, Garden Maintenance, Swimming Pool Maintenance)
- Filterable service cards with rate units, duration, and checklist
- Customer info form (name, phone, email, address, date, notes)
- **WhatsApp dispatch** — formats a booking message and opens `wa.me` with the business number

---

### `BookingConfirmationPage.jsx` — `/booking-confirmation`

Post-submission confirmation page shown after a booking is placed. Displays a summary of the submitted booking and encourages the customer to save the reference number.

---

### `TrackBookingPage.jsx` — `/track-booking`

Customer self-service tracking. Allows customers to:
- Enter their booking reference number
- View current booking status, service details, date, and address
- See payment status

Queries `GET /api/bookings/track?reference=...` on submission.

---

### `AboutPage.jsx` — `/about`

Company overview page. Includes:
- CitiMaids brand story and mission
- Team highlights
- Why choose CitiMaids (trust badges)

---

### `ContactPage.jsx` — `/contact`

Contact information and form page. Displays:
- Clickable phone numbers (`tel:` links)
- Email links (`mailto:`)
- Physical address (Aljazeera Tower, Hamdan St, Abu Dhabi)
- WhatsApp quick-connect button
- Social media links (Facebook, TikTok)

---

### `MaintenancePage.jsx` — `/maintenance`

A maintenance / coming soon page for when the site is temporarily down. Displays the brand logo and a message with contact info.

---

## Admin Pages

All admin pages are located in `src/pages/admin/` and require authentication.

---

### `Login.jsx` — `/admin/login`

The staff login screen. Features:
- Email + password form
- Submits to `POST /api/auth/login`
- Stores returned token in `AuthContext`
- Redirects to `/admin/dashboard` on success
- Displays the official CitiMaids badge

---

### `Dashboard.jsx` — `/admin/dashboard`

Live KPI overview. Fetches `GET /api/dashboard/stats`. Shows:
- Total bookings (with status breakdown)
- Total revenue (AED)
- New clients this month
- Pending bookings requiring attention
- Recent bookings quick table

---

### `Bookings.jsx` — `/admin/bookings`

Full booking management. Features:
- Searchable, filterable booking list
- Status badge indicators
- Inline status update dropdown
- Link to individual booking detail

---

### `BookingDetail.jsx` — `/admin/bookings/:id`

Detailed single-booking view. Shows:
- Client info
- Service details
- Booking notes and address
- Status controls
- Payment records attached to the booking

---

### `Payments.jsx` — `/admin/payments`

Tabbed payments interface with three tabs (accessible via `/admin/payments`, `/admin/billing`, `/admin/transactions`):

1. **Payments tab** — all payment records with status, amount, reference
2. **Billing tab** — create new payment record for a booking
3. **Transactions tab** — full transaction history log

---

### `Clients.jsx` — `/admin/clients`

Client CRM list view. Searchable table with name, phone, email, and booking count. Links to client detail.

---

### `ClientDetail.jsx` — `/admin/clients/:id`

Individual client profile. Shows contact info and full booking history for that client.

---

### `Services.jsx` — `/admin/services`

Service catalogue management. Features:
- Drag-to-reorder service display order
- Toggle service active/inactive
- Create, edit, and delete services
- Colored category badges and SVG icons per service type

---

### `Reports.jsx` — `/admin/reports`

Analytics and reporting dashboard. Sections:
- Revenue over time (chart)
- Bookings by status (chart)
- Top services by bookings and revenue
- Client acquisition trends

---

### `Settings.jsx` — `/admin/settings` or `/admin/settings/:tab`

Business settings editor. Tabs include:
- Business info (name, address, phone, email)
- Social media links (Facebook, TikTok)
- Admin account settings (change password)
