---
sidebar_position: 1
---

# Introduction

**CitiMaids** is a professional cleaning services platform built for **Abu Dhabi, UAE**. It provides an end-to-end solution for customers to discover, book, and track cleaning services, while giving the business a powerful admin panel to manage bookings, payments, clients, and analytics.

---

## The Monorepo

The project lives in a single Git repository (`citimaids_`) divided into three sub-projects:

```
citimaids_/
├── citimaids-api/        ← Back-end REST API (Laravel 13)
├── citimaids-frontend/   ← Customer + Admin SPA (React 19 / Vite)
└── docs-site/            ← Developer documentation (Docusaurus)
```

---

## What Each Part Does

### `citimaids-api` — Laravel REST API

The backend is a **Laravel 13** application that exposes a JSON REST API. It handles:

- Staff authentication via **Laravel Sanctum** (token-based)
- Booking creation, status management, and tracking
- Client CRM (create, read, update, delete)
- Service catalogue management (16 services with display ordering)
- Payment record tracking with reference numbers and expiry links
- Transaction history per payment
- Live dashboard statistics and reports
- Business settings (contact info, social links)

### `citimaids-frontend` — React SPA

The frontend is a **React 19** single-page application bundled with **Vite**. It serves two audiences on the same domain:

| Audience | URL Prefix | Description |
|---|---|---|
| Customers | `/` | Book services, track bookings, browse the service catalogue |
| Staff / Admin | `/admin` | Dashboard, booking management, payments, reports, settings |

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

| Tool | Minimum Version | Purpose |
|---|---|---|
| PHP | 8.3 | Laravel API runtime |
| Composer | 2.x | PHP dependency manager |
| Node.js | 20.x | Frontend + Docusaurus build |
| npm | 10.x | JS package manager |
| MySQL / MariaDB | 8.x | Database |

> **Optional:** Docker is supported for containerized API deployment (see [Deployment](/docs/deployment/api-deploy)).

---

## Tech Stack at a Glance

### Backend
- **Framework:** Laravel 13
- **Auth:** Laravel Sanctum (SPA token auth)
- **Database:** MySQL (with Eloquent ORM)
- **PHP:** 8.3+

### Frontend
- **Framework:** React 19
- **Bundler:** Vite 8
- **Styling:** TailwindCSS 4
- **Routing:** React Router 7
- **HTTP Client:** Axios

### DevOps
- **Containerization:** Docker (API)
- **Documentation:** Docusaurus 3

---

## Next Steps

- 👉 [Installation Guide](/docs/getting-started/installation) — clone and run the project locally
- 👉 [Project Structure](/docs/getting-started/project-structure) — understand every folder and file
