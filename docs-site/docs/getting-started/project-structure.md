---
sidebar_position: 3
---

# Project Structure

A tour of the monorepo and what every folder and file does.

---

## Root

```
citimaids_/
├── citimaids-api/        ← Laravel 13 REST API
├── citimaids-frontend/   ← React 19 SPA
├── docs-site/            ← Docusaurus documentation
├── WALKTHROUGH.md        ← Feature branch change log
└── .git/                 ← Git metadata
```

---

## `citimaids-api/` — Laravel Backend

```
citimaids-api/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── Api/
│   │           ├── AuthController.php          ← Login / logout / me
│   │           ├── BookingController.php        ← Booking CRUD + tracking
│   │           ├── ClientController.php         ← Client CRM
│   │           ├── DashboardController.php      ← KPI stats
│   │           ├── PaymentController.php        ← Payments + refunds
│   │           ├── ReportsController.php        ← Analytics reports
│   │           ├── ServiceController.php        ← Service catalogue
│   │           ├── SettingController.php        ← Business settings
│   │           └── TransactionController.php    ← Transaction history
│   ├── Models/
│   │   ├── Booking.php          ← Core booking entity
│   │   ├── BookingDetail.php    ← Line items per booking
│   │   ├── Client.php           ← Customer records
│   │   ├── Payment.php          ← Payment records + ref# generator
│   │   ├── Service.php          ← Cleaning service catalogue
│   │   ├── Setting.php          ← Key-value business settings
│   │   ├── Transaction.php      ← Payment transaction log
│   │   └── User.php             ← Admin/staff user accounts
│   ├── Services/                ← Business logic service classes
│   └── Providers/               ← Laravel service providers
├── database/
│   ├── migrations/              ← 14 schema migration files
│   ├── seeders/
│   │   ├── DatabaseSeeder.php   ← Master seeder orchestrator
│   │   ├── ServiceSeeder.php    ← 16 cleaning services
│   │   └── SettingSeeder.php    ← Business contact info
│   └── factories/               ← Model factories (testing)
├── routes/
│   ├── api.php                  ← All REST API routes
│   ├── web.php                  ← Web (SPA fallback)
│   └── console.php              ← Artisan console routes
├── .env.example                 ← Environment variable template
├── Dockerfile                   ← Container build definition
└── composer.json                ← PHP dependencies
```

---

## `citimaids-frontend/` — React SPA

```
citimaids-frontend/
├── public/
│   ├── favicon.png                          ← Official CitiMaids favicon
│   ├── citimaid-hero.mp4                    ← Hero section video
│   └── images/
│       ├── citimaids-badge.png              ← Brand badge / logo
│       ├── services/                        ← Service card images (16)
│       └── transformations/                 ← Before/after slider images
├── src/
│   ├── api/                     ← Axios API call modules
│   ├── assets/                  ← Bundled static assets (SVG, fonts)
│   ├── components/
│   │   ├── Navbar.jsx           ← Site navigation bar
│   │   ├── Footer.jsx           ← Site footer with contact info
│   │   ├── BeforeAfterSlider.jsx← Drag-to-compare transformation slider
│   │   ├── FloatingWhatsApp.jsx ← Floating WhatsApp CTA button
│   │   ├── ProtectedRoute.jsx   ← Auth guard for admin routes
│   │   ├── Reveal.jsx           ← Scroll-triggered reveal animation
│   │   └── icons/               ← Custom SVG icon components
│   ├── context/
│   │   └── AuthContext.jsx      ← Global auth state (login/logout/token)
│   ├── data/
│   │   └── services.js          ← Static service catalogue registry (16 services)
│   ├── hooks/
│   │   ├── useServices.js       ← Fetch + enrich services from API
│   │   └── useSettings.js       ← Fetch business settings from API
│   ├── layouts/
│   │   └── RootLayout.jsx       ← Customer-facing layout wrapper
│   ├── pages/
│   │   ├── HomePage.jsx         ← Landing page (video hero, services, sliders)
│   │   ├── ServicesPage.jsx     ← All services catalogue
│   │   ├── ServiceDetailPage.jsx← Individual service detail
│   │   ├── BookingPage.jsx      ← Category-tab booking form
│   │   ├── BookingConfirmationPage.jsx ← Post-booking confirmation
│   │   ├── TrackBookingPage.jsx ← Customer booking tracker
│   │   ├── AboutPage.jsx        ← About CitiMaids
│   │   ├── ContactPage.jsx      ← Contact form & map
│   │   ├── MaintenancePage.jsx  ← Maintenance mode page
│   │   └── admin/               ← Protected admin pages
│   │       ├── AdminLayout.jsx
│   │       ├── Login.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Bookings.jsx
│   │       ├── BookingDetail.jsx
│   │       ├── Clients.jsx
│   │       ├── ClientDetail.jsx
│   │       ├── Payments.jsx
│   │       ├── Services.jsx
│   │       ├── Reports.jsx
│   │       └── Settings.jsx
│   ├── utils/
│   │   └── whatsapp.js          ← WhatsApp message formatter
│   ├── App.jsx                  ← Root router and route definitions
│   ├── main.jsx                 ← React DOM entry point
│   └── index.css                ← Global CSS (TailwindCSS directives + custom)
├── index.html                   ← Vite HTML entry point
├── vite.config.js               ← Vite build config
└── package.json                 ← JS dependencies
```

---

## `docs-site/` — Docusaurus

```
docs-site/
├── docs/
│   ├── intro.mdx                ← Platform overview (landing page)
│   ├── getting-started/         ← Introduction, installation, structure
│   ├── backend/                 ← API overview, routes, database
│   ├── frontend/                ← UI overview, pages, components
│   ├── deployment/              ← Deploy guides (API + frontend)
│   └── contributing/            ← Dev workflow & contribution guide
├── blog/                        ← Optional blog section
├── src/
│   ├── components/              ← Custom Docusaurus React components
│   ├── css/custom.css           ← Theme overrides
│   └── pages/                   ← Custom standalone pages
├── static/                      ← Static assets served at root
├── docusaurus.config.ts         ← Site configuration
└── sidebars.ts                  ← Sidebar navigation config
```
