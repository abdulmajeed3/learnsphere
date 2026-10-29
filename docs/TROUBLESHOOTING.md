# Troubleshooting

## Database Connection Error

**Symptom**: API fails to start with `Can't reach database server` or `Connection refused`.

**Checks**:

1. PostgreSQL is running: `docker compose ps` — `postgres` container should show `healthy`.
2. `DATABASE_URL` in `apps/api/.env` matches the Docker service credentials (`learnsphere` / `learnsphere_dev_password`, port `5432`).
3. If running PostgreSQL outside Docker, confirm the service is started and the port is open.
4. Verify the database exists: `psql -U learnsphere -h localhost -c "\l"`.

---

## Prisma Client Not Generated

**Symptom**: Import error like `Cannot find module '@prisma/client'` or Prisma types missing.

**Fix**:

```bash
cd apps/api
npx prisma generate
```

This regenerates the typed client from `prisma/schema.prisma`. Run it after any schema change or a fresh `npm install`.

---

## Prisma Migration Pending

**Symptom**: Runtime error `The table \`public.User\` does not exist`.

**Fix**:

```bash
cd apps/api
npx prisma migrate dev   # development — applies + creates migration file
# or
npx prisma migrate deploy  # production — applies only
```

---

## CORS Error in Browser

**Symptom**: Browser console shows `blocked by CORS policy`.

**Checks**:

1. `FRONTEND_URL` in `apps/api/.env` exactly matches the origin the browser uses (e.g., `http://localhost:5173`). Trailing slashes matter.
2. The Axios client in the frontend is sending requests to the correct base URL (`VITE_API_URL`).
3. Ensure `credentials: true` is set on the Axios instance — required for the refresh token cookie to be sent.

---

## JWT Invalid / 401 Unauthorized

**Symptom**: Authenticated API calls return `401` with `Unauthorized` or `invalid signature`.

**Checks**:

1. `JWT_SECRET` in `apps/api/.env` is set and has not changed since the token was issued. Changing the secret invalidates all existing tokens.
2. The access token has not expired (15-minute lifetime). The frontend Axios interceptor should automatically refresh it; check that `POST /auth/refresh` is succeeding.
3. The `Authorization` header is formatted as `Bearer <token>` (with a space, no quotes).
4. The token was issued by this API instance — tokens from a different secret or algorithm are rejected.

---

## Port Conflict

**Symptom**: `Error: listen EADDRINUSE :::3001` or similar.

**Fix**:

```bash
# Find process using port 3001 (Windows)
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS / Linux
lsof -ti:3001 | xargs kill
```

Change the port by setting `PORT=3002` (or any free port) in `apps/api/.env` and update `VITE_API_URL` in `apps/web/.env` to match.

---

## npm Workspace Issues

**Symptom**: `Cannot find module 'X'` or workspace scripts not found.

**Checks**:

1. Run `npm install` from the **repo root**, not from inside `apps/api` or `apps/web`. The root `package.json` manages workspace hoisting.
2. If `node_modules` is corrupted, clean install:
   ```bash
   rm -rf node_modules apps/api/node_modules apps/web/node_modules
   npm install
   ```
3. Workspace scripts use `--workspace=apps/api` flags; always run them from the repo root or navigate into the workspace directory.

---

## Frontend Build Fails (TypeScript Errors)

**Symptom**: `npm run build:web` exits with type errors.

**Fix**:

```bash
npm run type-check:web
```

Resolve the reported errors. Common causes: missing `VITE_API_URL` in the `.env` file, or out-of-date type definitions after a dependency update.

---

## Refresh Token Cookie Not Sent

**Symptom**: `POST /auth/refresh` returns `401 No refresh token` even after login.

**Checks**:

1. The Axios instance has `withCredentials: true`.
2. `FRONTEND_URL` exactly matches the browser origin (protocol + host + port).
3. In development, `secure` is `false` (HTTP is fine). In production over HTTPS, `secure: true` is required and the site must be served over HTTPS.
4. `sameSite: 'strict'` prevents the cookie from being sent on cross-site navigations — ensure requests go to the same origin as the cookie's domain.
