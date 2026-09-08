---
sidebar_position: 2
---

# API Routes Reference

All endpoints are prefixed with `/api`. The base URL in development is `http://localhost:8000/api`.

---

## Public Routes

These endpoints require **no authentication** and are accessible to anyone.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Authenticate staff; returns a Sanctum token |
| `GET` | `/services` | Retrieve the full active service catalogue |
| `GET` | `/settings` | Retrieve business settings (contact info, socials) |
| `POST` | `/bookings` | Submit a new booking (customer-facing) |
| `GET` | `/bookings/track` | Track a booking by reference number |

### `POST /auth/login`

**Request body:**
```json
{
  "email": "admin@citimaids.com",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "1|abc123...",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@citimaids.com",
    "role": "admin"
  }
}
```

### `POST /bookings`

**Request body:**
```json
{
  "client_name": "Jane Doe",
  "client_phone": "+971501234567",
  "client_email": "jane@example.com",
  "service_id": 3,
  "preferred_date": "2026-09-15",
  "address": "Villa 12, Al Reef, Abu Dhabi",
  "notes": "Please bring your own cleaning supplies."
}
```

### `GET /bookings/track`

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `reference` | `string` | Booking reference number (e.g. `BK-20260908-0001`) |

---

## Protected Routes

All protected routes require the `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/logout` | Revoke the current token |
| `GET` | `/auth/me` | Get the authenticated user's profile |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/stats` | Live KPI stats (total bookings, revenue, clients) |

### Bookings (Admin)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/bookings` | List all bookings (paginated, filterable) |
| `GET` | `/bookings/{id}` | Get a single booking with details |
| `PATCH` | `/bookings/{id}/status` | Update booking status |
| `DELETE` | `/bookings/{id}` | Delete a booking |

**Booking statuses:** `pending` · `confirmed` · `in_progress` · `completed` · `cancelled`

### Clients

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/clients` | List all clients |
| `GET` | `/clients/{id}` | Get a single client with booking history |
| `POST` | `/clients` | Create a new client record |
| `PUT` | `/clients/{id}` | Update a client |
| `DELETE` | `/clients/{id}` | Delete a client |

### Services (Admin CRUD)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/services` | Create a new service |
| `PUT` | `/services/{id}` | Update a service |
| `DELETE` | `/services/{id}` | Delete a service |
| `POST` | `/services/reorder` | Reorder service display order |

### Settings

| Method | Endpoint | Description |
|---|---|---|
| `PUT` | `/settings` | Update business settings (contact, address, socials) |

### Payments

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/payments` | List all payment records |
| `GET` | `/payments/{id}` | Get a single payment record |
| `POST` | `/bookings/{id}/payment` | Create a payment record for a booking |
| `PATCH` | `/payments/{id}/status` | Update payment status |
| `POST` | `/payments/{id}/refund` | Issue a refund for a payment |

**Payment statuses:** `pending` · `paid` · `failed` · `refunded` · `partially_refunded`

### Reports

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/reports/overview` | Summary metrics (revenue, bookings, clients) |
| `GET` | `/reports/bookings` | Booking trends and status breakdown |
| `GET` | `/reports/clients` | Client acquisition and retention stats |
| `GET` | `/reports/services` | Most popular services by bookings and revenue |
| `GET` | `/reports/revenue` | Revenue over time (daily / monthly) |

### Transactions

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/transactions` | List all financial transactions |
| `GET` | `/payments/{id}/transactions` | List transactions for a specific payment |

---

## Common HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | OK — request succeeded |
| `201` | Created — resource was created |
| `204` | No Content — deleted successfully |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — insufficient permissions |
| `404` | Not Found |
| `422` | Unprocessable Entity — validation failed |
| `500` | Internal Server Error |
