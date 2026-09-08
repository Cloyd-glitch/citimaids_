---
sidebar_position: 2
---

# Deploying the Frontend

The `citimaids-frontend` is a **React + Vite** SPA. It compiles to static files that can be served from any static hosting provider or web server.

---

## Build for Production

### 1. Configure Environment

Create a `.env` file in `citimaids-frontend/`:

```env
VITE_API_URL=https://api.your-domain.com/api
```

:::important
The `VITE_API_URL` must point to your **live production API URL**, not `localhost`. This value is baked into the build at compile time.
:::

### 2. Install Dependencies

```bash
cd citimaids-frontend
npm install
```

### 3. Build

```bash
npm run build
```

This outputs the production bundle to `citimaids-frontend/dist/`.

### 4. Preview Locally (Optional)

```bash
npm run preview
# → http://localhost:4173
```

---

## Deployment Options

### Option A — Vercel (Recommended for simplicity)

1. Push your repository to GitHub.
2. Import the project at [vercel.com](https://vercel.com).
3. Set **Root Directory** to `citimaids-frontend`.
4. Add environment variable: `VITE_API_URL=https://api.your-domain.com/api`
5. Vercel auto-deploys on every push to `main`.

**Add a `vercel.json`** in `citimaids-frontend/` to handle SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

### Option B — Netlify

1. Connect your GitHub repo at [netlify.com](https://netlify.com).
2. Set **Base directory** to `citimaids-frontend`.
3. Set **Build command** to `npm run build`.
4. Set **Publish directory** to `dist`.
5. Add environment variable: `VITE_API_URL`.

**Add a `_redirects` file** to `citimaids-frontend/public/`:

```
/*  /index.html  200
```

---

### Option C — Nginx (Self-hosted VPS)

Upload the contents of `dist/` to your server and configure Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/citimaids-frontend/dist;

    index index.html;

    # SPA fallback — all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|mp4|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

:::warning
The `try_files ... /index.html` fallback is **critical** for React Router to work correctly on page refresh.
:::

---

### Option D — Apache (Shared Hosting)

Upload `dist/` to your `public_html` folder and add a `.htaccess` file:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

---

## Environment Variables Summary

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL for the backend API | `https://api.citimaids.com/api` |

---

## CI/CD with GitHub Actions (Optional)

Create `.github/workflows/frontend-deploy.yml` in the repo root:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'citimaids-frontend/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install & Build
        working-directory: citimaids-frontend
        run: |
          npm install
          npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

      - name: Deploy to server
        # Add your deploy step here (rsync, FTP, S3 sync, etc.)
        run: echo "Deploy dist/ to your server"
```
