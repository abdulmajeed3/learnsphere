# Deployment

> **Reference only:** this guide documents how the system is designed to run. Deploying or operating this software requires prior written authorization under the [LICENSE](../LICENSE).

## Prerequisites

| Requirement | Version |
| ----------- | ------- |
| Node.js     | 20+     |
| npm         | 10+     |
| PostgreSQL  | 16      |

---

## Environment Variables

### `apps/api/.env`

```env
# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/learnsphere_prod

# JWT
JWT_SECRET=<strong-random-secret-min-32-chars>
JWT_EXPIRATION=15m

# Cookies
COOKIE_SECRET=<strong-random-secret-min-32-chars>

# Server
PORT=3001
NODE_ENV=production

# CORS
FRONTEND_URL=https://your-domain.com
```

### `apps/web/.env`

```env
VITE_API_URL=https://your-domain.com/api/v1
```

---

## Build

```bash
# Install all workspace dependencies
npm install

# Build the API (outputs to apps/api/dist)
npm run build:api

# Build the web app (outputs to apps/web/dist)
npm run build:web
```

---

## Database Migration

Run migrations against the production database before starting the API:

```bash
cd apps/api
npx prisma migrate deploy
```

`migrate deploy` applies all pending migrations without interactive prompts, safe for CI/CD.

To generate the Prisma client after a schema change (usually done during build):

```bash
cd apps/api
npx prisma generate
```

---

## Starting the API

```bash
cd apps/api
NODE_ENV=production node dist/main.js
```

The API listens on `0.0.0.0:$PORT` (default 3001).

Using a process manager (recommended):

```bash
npm install -g pm2
pm2 start apps/api/dist/main.js --name learnsphere-api --env production
pm2 save
pm2 startup
```

---

## Serving the Frontend

The Vite build outputs static files to `apps/web/dist`. Serve them with any static file server or your reverse proxy.

With `serve`:

```bash
npm install -g serve
serve -s apps/web/dist -l 3000
```

---

## Reverse Proxy (nginx)

Route `/api` to the NestJS process and everything else to the static frontend build:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate     /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;

    # API — proxy to NestJS
    location /api/ {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    # Frontend — static files
    location / {
        root   /var/www/learnsphere/web/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

> **Note**: Set `FRONTEND_URL` and `COOKIE_SECRET` appropriately. With a reverse proxy terminating TLS, `secure: true` on the cookie requires the proxy to forward the `X-Forwarded-Proto` header and NestJS to trust the proxy.

---

## Docker Compose (Development)

A `docker-compose.yml` is provided at the repo root for local PostgreSQL:

```bash
# Start development database
docker compose up -d postgres

# Start test database
docker compose up -d postgres_test

# Stop all
docker compose down
```

Development connection string:

```
postgresql://learnsphere:learnsphere_dev_password@localhost:5432/learnsphere_dev
```

---

## Health Check

Once running, verify:

- API: `curl http://localhost:3001/api/v1/categories` → should return a JSON array
- Swagger: open `http://localhost:3001/api/docs`
