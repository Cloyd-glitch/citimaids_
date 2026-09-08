---
sidebar_position: 1
---

# Deploying the API

This guide covers deploying the `citimaids-api` Laravel application to a production server, including the provided Docker setup.

---

## Option A — Docker (Recommended)

The API includes a `Dockerfile` for containerized deployment.

### Build the Image

```bash
cd citimaids-api
docker build -t citimaids-api:latest .
```

### Run the Container

```bash
docker run -d \
  --name citimaids-api \
  -p 8000:8000 \
  -e APP_KEY=base64:your_key_here \
  -e APP_ENV=production \
  -e DB_HOST=your_db_host \
  -e DB_DATABASE=citimaids \
  -e DB_USERNAME=your_db_user \
  -e DB_PASSWORD=your_db_password \
  -e FRONTEND_URL=https://your-frontend-domain.com \
  citimaids-api:latest
```

### Using Docker Compose (Recommended for full stack)

Create a `docker-compose.yml` in the project root:

```yaml
version: '3.8'

services:
  api:
    build: ./citimaids-api
    ports:
      - "8000:8000"
    environment:
      APP_ENV: production
      APP_KEY: base64:your_key
      DB_HOST: db
      DB_DATABASE: citimaids
      DB_USERNAME: citimaids_user
      DB_PASSWORD: securepassword
      FRONTEND_URL: https://your-frontend-domain.com
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: citimaids
      MYSQL_USER: citimaids_user
      MYSQL_PASSWORD: securepassword
      MYSQL_ROOT_PASSWORD: rootpassword
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

```bash
docker compose up -d
```

---

## Option B — Traditional VPS / Shared Hosting

### 1. Upload Files

Clone or deploy the `citimaids-api/` directory to your server. Ensure your web server's document root points to `citimaids-api/public/`.

### 2. Install Dependencies

```bash
cd citimaids-api
composer install --optimize-autoloader --no-dev
```

### 3. Configure Environment

Copy and edit the environment file:

```bash
cp .env.example .env
php artisan key:generate
```

Key production `.env` values:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.your-domain.com

DB_HOST=your_db_host
DB_DATABASE=citimaids
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password

SANCTUM_STATEFUL_DOMAINS=your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

### 4. Run Migrations & Seeders

```bash
php artisan migrate --force
php artisan db:seed --force
```

### 5. Optimize for Production

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### 6. Set Permissions

```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

---

## CORS Configuration

The API uses Laravel's CORS package. Ensure your production `.env` has:

```env
FRONTEND_URL=https://your-frontend-domain.com
SANCTUM_STATEFUL_DOMAINS=your-frontend-domain.com
```

The CORS config in `config/cors.php` reads from `FRONTEND_URL`.

---

## Web Server Configuration

### Nginx

```nginx
server {
    listen 80;
    server_name api.your-domain.com;
    root /var/www/citimaids-api/public;

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### Apache

Ensure `mod_rewrite` is enabled. The included `.htaccess` in `public/` handles URL rewriting automatically.

---

## Health Check

After deployment, verify the API is running:

```bash
curl https://api.your-domain.com/api/settings
```

You should receive a JSON response with business settings.
