# CitiMaids 🧹

> **Professional Cleaning Services Platform — Abu Dhabi, UAE**

A full-stack web platform for CitiMaids, a premium cleaning service company. It includes a customer-facing website, an internal admin panel, and a RESTful API — all in one monorepo.

---

## ✨ Features

### Customer Portal
-  Browse **16 cleaning & maintenance services** across 4 categories
-  **Smart booking system** with category tab filters, rate units, and task checklists
-  **WhatsApp dispatch** — booking details sent directly to the business WhatsApp
-  **Booking tracker** — look up your booking by reference number
-  **Video hero section** featuring authentic CitiMaids footage
-  **Before & After sliders** — 1-to-1 matched transformation comparisons
-  Fully responsive, mobile-first design

### Admin Panel
- **Live dashboard** — revenue, bookings, and client KPIs at a glance
- **Booking management** — view, update status, assign staff
- **Payment tracking** — create payment records, update status, issue refunds
- **Client CRM** — full booking history per client
- **Service catalogue editor** — drag-to-reorder, toggle active/inactive
- **Analytics reports** — revenue trends, top services, client acquisition
- **Business settings** — update contact info, social links, and more

---

## 🏗️ Architecture

```
citimaids_/
├── citimaids-api/        ← Laravel 13 REST API
├── citimaids-frontend/   ← React 19 SPA (Customer + Admin)
└── docs-site/            ← Docusaurus Developer Documentation
```

The frontend communicates with the API over HTTP (Axios). Authentication uses Laravel Sanctum with token-based auth for admin routes.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Laravel 13 (PHP 8.3) |
| **Auth** | Laravel Sanctum |
| **Database** | MySQL 8 with Eloquent ORM |
| **Frontend** | React 19 + Vite 8 |
| **Styling** | TailwindCSS 4 |
| **Routing** | React Router 7 |
| **HTTP Client** | Axios |
| **Containerization** | Docker |
| **Docs** | Docusaurus 3 |

---

## 🚀 Quick Start

### Prerequisites

- PHP 8.3+, Composer 2.x
- Node.js 20+, npm 10+
- MySQL 8+

### 1. Clone

```bash
git clone https://github.com/Cloyd-glitch/citimaids_.git
cd citimaids_
```

### 2. Backend (API)

```bash
cd citimaids-api
composer install
cp .env.example .env
php artisan key:generate
# Configure DB credentials in .env, then:
php artisan migrate
php artisan db:seed
php artisan serve
# → http://localhost:8000
```

### 3. Frontend

```bash
cd citimaids-frontend
npm install
# Set VITE_API_URL=http://localhost:8000/api in .env
npm run dev
# → http://localhost:5173
```

## 📚 Documentation

Full developer documentation is available in the `docs-site/` Docusaurus site:

```bash
cd docs-site
npm install
npm start
# → http://localhost:3000
```

| Section | Description |
|---|---|
| [Getting Started](docs-site/docs/getting-started/introduction.md) | Installation, prerequisites, project structure |
| [Backend API](docs-site/docs/backend/overview.md) | Laravel architecture, models, API routes reference |
| [Database Schema](docs-site/docs/backend/database.md) | All tables, columns, and ER diagram |
| [Frontend](docs-site/docs/frontend/overview.md) | React architecture, pages, and components |
| [Deployment](docs-site/docs/deployment/api-deploy.md) | Production deployment guides (Docker, VPS, static hosting) |
| [Contributing](docs-site/docs/contributing/guide.md) | Branching, commit conventions, code style |

---

## 📁 Project Structure (Overview)

<details>
<summary>citimaids-api (Laravel)</summary>

```
citimaids-api/
├── app/
│   ├── Http/Controllers/Api/   ← 9 controllers (Auth, Booking, Client, Payment, etc.)
│   └── Models/                 ← 8 models (Booking, Client, Payment, Service, etc.)
├── database/
│   ├── migrations/             ← 14 migrations
│   └── seeders/                ← Services, Settings, Users
└── routes/api.php              ← All REST endpoints
```

</details>

<details>
<summary>citimaids-frontend (React)</summary>

```
citimaids-frontend/
├── src/
│   ├── pages/                  ← 9 customer pages + 10 admin pages
│   ├── components/             ← Navbar, Footer, BeforeAfterSlider, etc.
│   ├── hooks/                  ← useServices, useSettings
│   ├── context/                ← AuthContext
│   └── utils/                  ← WhatsApp message formatter
└── public/                     ← Video, images, favicon, brand badge
```

</details>

---

## 📡 API Quick Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | ❌ | Staff login |
| `GET` | `/api/services` | ❌ | List all services |
| `GET` | `/api/settings` | ❌ | Business settings |
| `POST` | `/api/bookings` | ❌ | Submit a booking |
| `GET` | `/api/bookings/track` | ❌ | Track booking by reference |
| `GET` | `/api/dashboard/stats` | ✅ | Admin KPI stats |
| `GET` | `/api/bookings` | ✅ | All bookings (admin) |
| `GET` | `/api/reports/revenue` | ✅ | Revenue report |
| `POST` | `/api/bookings/{id}/payment` | ✅ | Create payment record |

Full API reference → [docs/backend/routes.md](docs-site/docs/backend/routes.md)

---

## 🤝 Contributing

Contributions are welcome! Please read the [Contributing Guide](docs-site/docs/contributing/guide.md) before submitting a pull request.

1. Fork the repository
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
4. Push and open a Pull Request against `main`

---

## 📄 License

This project is proprietary software owned by CitiMaids. All rights reserved.

---

## 📞 Contact

**CitiMaids — Professional Cleaning Services**
- 📍 Aljazeera Tower, Room 45, Hamdan St, Abu Dhabi, UAE
- 📞 +971 52 634 9461 / +971 58 175 3958
- 📧 info@citi-maids.com
- 💬 [WhatsApp](https://wa.me/971526349461)
- 🌐 [citi-maids.com](https://citi-maids.com)
