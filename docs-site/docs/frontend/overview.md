---
sidebar_position: 1
---

# Frontend Overview

The `citimaids-frontend` is a **React 19** single-page application that serves as both the customer-facing website and the internal admin panel for CitiMaids staff.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | ^19.2 | UI library |
| Vite | ^8.2 | Build tool & dev server |
| TailwindCSS | ^4.3 | Utility-first CSS framework |
| React Router | ^7.18 | Client-side routing |
| Axios | ^1.20 | HTTP client for API calls |
| ESLint | ^10.9 | Code linting |

---

## Application Architecture

The app is split into two distinct audiences sharing the same codebase:

```
/                   ← Customer Portal (public)
/admin              ← Admin Panel (protected, requires Sanctum auth)
```

### Customer Portal (`/`)

The public-facing website where customers:
- Learn about CitiMaids services
- Browse the 16-service catalogue with category filters
- Book a cleaning service (dispatched via WhatsApp)
- Track their booking by reference number
- Contact the business

### Admin Panel (`/admin`)

A protected dashboard accessible only to authenticated staff:
- Live KPI dashboard (revenue, bookings, clients)
- Booking management (view, update status, details)
- Payment management (create payment records, track, refund)
- Client CRM (view history, manage profiles)
- Service catalogue editor (add, edit, delete, reorder)
- Analytics reports
- Business settings editor

---

## State Management

The app uses React's built-in state management:

| Pattern | Used For |
|---|---|
| `useState` / `useEffect` | Component-level local state |
| `Context API` (`AuthContext`) | Global authentication state |
| Custom hooks (`useServices`, `useSettings`) | Shared data fetching & caching |

### `AuthContext`

Wraps the entire app in `App.jsx`. Provides:
- `user` — the authenticated user object
- `token` — the Sanctum API token (stored in `localStorage`)
- `login(email, password)` — POST to `/api/auth/login`, store token
- `logout()` — POST to `/api/auth/logout`, clear token

---

## Routing Structure

All routes are defined in [`App.jsx`](file:///c:/laragon/www/system/citimaids_/citimaids-frontend/src/App.jsx):

```
/ (RootLayout)
├── /                     → HomePage
├── /services             → ServicesPage
├── /services/:serviceId  → ServiceDetailPage
├── /maintenance          → MaintenancePage
├── /about                → AboutPage
├── /contact              → ContactPage
├── /book                 → BookingPage
├── /booking-confirmation → BookingConfirmationPage
└── /track-booking        → TrackBookingPage

/admin/login              → Login (public)

/admin (AdminLayout + ProtectedRoute)
├── /admin/dashboard      → Dashboard
├── /admin/bookings       → Bookings
├── /admin/bookings/:id   → BookingDetail
├── /admin/payments       → Payments
├── /admin/billing        → Payments (billing tab)
├── /admin/transactions   → Payments (transactions tab)
├── /admin/clients        → Clients
├── /admin/clients/:id    → ClientDetail
├── /admin/services       → Services
├── /admin/reports        → Reports
└── /admin/settings       → Settings
```

---

## Key Directories

| Directory | Purpose |
|---|---|
| `src/api/` | Axios API call modules (one file per resource) |
| `src/components/` | Reusable UI components (Navbar, Footer, etc.) |
| `src/context/` | React Context providers (Auth) |
| `src/data/` | Static data (service registry `services.js`) |
| `src/hooks/` | Custom React hooks for data fetching |
| `src/layouts/` | Page layout wrappers |
| `src/pages/` | Route-level page components |
| `src/utils/` | Helper utilities (WhatsApp formatter) |
| `public/images/` | Service images, transformations, brand assets |

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL for the Laravel API | `http://localhost:8000/api` |

All `VITE_` prefixed variables are embedded into the build at compile time.

---

## Build & Dev Commands

```bash
# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint
```
