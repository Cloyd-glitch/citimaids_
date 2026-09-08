---
sidebar_position: 2
---

# Installation

This guide walks you through cloning the repository and running both the **API** and the **frontend** locally.

---

## 1. Clone the Repository

```bash
git clone https://github.com/Cloyd-glitch/citimaids_.git
cd citimaids_
```

---

## 2. Set Up the Backend API (`citimaids-api`)

### 2a. Install PHP Dependencies

```bash
cd citimaids-api
composer install
```

### 2b. Configure Environment

Copy the example environment file and open it for editing:

```bash
cp .env.example .env
```

Then update these key values in `.env`:

```env
APP_NAME=CitiMaids
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=citimaids
DB_USERNAME=root
DB_PASSWORD=

# CORS — allow the frontend dev server
SANCTUM_STATEFUL_DOMAINS=localhost:5173
FRONTEND_URL=http://localhost:5173
```

### 2c. Generate App Key

```bash
php artisan key:generate
```

### 2d. Create the Database

Create a new MySQL database named `citimaids` (or whatever you set in `.env`):

```sql
CREATE DATABASE citimaids CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2e. Run Migrations & Seeders

```bash
php artisan migrate
php artisan db:seed
```

This will seed:
- An admin user account
- All 16 cleaning services with Abu Dhabi market prices
- Business settings (contact info, address, socials)

### 2f. Start the API Server

```bash
php artisan serve
# → API available at http://localhost:8000
```

---

## 3. Set Up the Frontend (`citimaids-frontend`)

Open a **new terminal** and navigate to the frontend folder.

### 3a. Install Node Dependencies

```bash
cd citimaids-frontend
npm install
```

### 3b. Configure Environment

```bash
cp .env.example .env   # or create .env manually
```

Set the API base URL:

```env
VITE_API_URL=http://localhost:8000/api
```

### 3c. Start the Dev Server

```bash
npm run dev
# → App available at http://localhost:5173
```

---

## 4. (Optional) Set Up the Docs Site

```bash
cd docs-site
npm install
npm start
# → Docs available at http://localhost:3000
```

---

## 5. Default Admin Credentials

After seeding, log in at `http://localhost:5173/admin/login` with:

| Field | Value |
|---|---|
| Email | `admin@citimaids.com` |
| Password | `password` |

:::caution
Change the default admin password immediately in any staging or production environment.
:::

---

## Quick Setup Summary

```bash
# Terminal 1 — API
cd citimaids-api
composer install && cp .env.example .env
php artisan key:generate && php artisan migrate && php artisan db:seed
php artisan serve

# Terminal 2 — Frontend
cd citimaids-frontend
npm install
npm run dev
```
