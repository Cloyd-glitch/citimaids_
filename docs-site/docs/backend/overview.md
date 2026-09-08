---
sidebar_position: 1
---

# Backend Overview

The `citimaids-api` is a **Laravel 13** REST API that serves as the data and business logic layer for the entire CitiMaids platform.

---

## Framework & Versions

| Technology | Version |
|---|---|
| PHP | ^8.3 |
| Laravel | ^13.17 |
| Laravel Sanctum | ^4.3 |
| MySQL / MariaDB | 8.x |

---

## Authentication

The API uses **Laravel Sanctum** for token-based authentication.

- Staff/admin log in via `POST /api/auth/login` with email + password
- A Sanctum **personal access token** is returned
- All protected routes require the token in the `Authorization: Bearer <token>` header
- Tokens are invalidated on `POST /api/auth/logout`

Public routes (bookings, tracking, services list, settings) require **no authentication**.

---

## Architecture

```
Request → Route (routes/api.php)
        → Controller (app/Http/Controllers/Api/)
        → Model / Service (app/Models/, app/Services/)
        → JSON Response
```

### Controllers

| Controller | Responsibilities |
|---|---|
| `AuthController` | Login, logout, fetch authenticated user |
| `BookingController` | Submit bookings, track by reference, admin CRUD |
| `ClientController` | Client CRM — list, create, update, delete |
| `DashboardController` | Live KPI statistics for the admin dashboard |
| `PaymentController` | Create payment records, update status, issue refunds |
| `ReportsController` | Revenue, booking, client, and service reports |
| `ServiceController` | Service catalogue — list, create, update, delete, reorder |
| `SettingController` | Read and update business settings (contact, socials) |
| `TransactionController` | Payment transaction history |

### Models

| Model | Table | Description |
|---|---|---|
| `User` | `users` | Admin and staff accounts |
| `Client` | `clients` | Customer records |
| `Service` | `services` | Cleaning service catalogue |
| `Booking` | `bookings` | Booking requests from customers |
| `BookingDetail` | `booking_details` | Line items / extra details per booking |
| `Payment` | `payments` | Payment records with status and reference |
| `Transaction` | `transactions` | Immutable transaction log per payment |
| `Setting` | `settings` | Key-value store for business configuration |

---

## Response Format

All API responses return JSON. Successful responses follow this shape:

```json
{
  "data": { ... },
  "message": "Success"
}
```

Error responses:

```json
{
  "message": "Unauthenticated."
}
```

Validation errors return HTTP `422` with:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field": ["Error message."]
  }
}
```

---

## Key Environment Variables

```env
APP_KEY=              # Generated via php artisan key:generate
APP_URL=              # Full URL of the API server

DB_HOST=              # MySQL host
DB_PORT=3306
DB_DATABASE=citimaids
DB_USERNAME=
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5173   # Frontend origin for Sanctum
FRONTEND_URL=http://localhost:5173
```

---

## Useful Artisan Commands

```bash
# Run all migrations
php artisan migrate

# Seed database with services, settings, and admin user
php artisan db:seed

# Reset and re-seed (development only)
php artisan migrate:fresh --seed

# Start local dev server
php artisan serve

# Clear all caches
php artisan optimize:clear
```
