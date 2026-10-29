# Security

## Password Hashing

Passwords are hashed with **argon2id** (the `argon2` npm package). This is the current OWASP-recommended algorithm — it is memory-hard and resistant to GPU/ASIC attacks. The raw password is never logged, stored, or returned in any response. Only `passwordHash` is persisted.

---

## JWT Strategy

### Access Token

- Algorithm: **HS256**
- Lifetime: **15 minutes** (`JWT_EXPIRATION=15m`)
- Payload: `{ sub: userId, email, role }`
- Transport: **Authorization header only** — `Authorization: Bearer <token>`
- Secret: `JWT_SECRET` environment variable (must be set in production; no default provided)

### Refresh Token

- Lifetime: **7 days**
- Transport: httpOnly cookie (`refresh_token`)
- The raw JWT is **never stored** — only its **SHA-256 hash** is persisted in the `RefreshToken` table.

---

## Refresh Token Rotation

Every call to `POST /auth/refresh`:

1. Reads the `refresh_token` cookie.
2. Hashes it with SHA-256 and looks up the hash in `RefreshToken`.
3. Rejects the request if the record does not exist, is revoked (`isRevoked = true`), or is expired (`expiresAt < now`).
4. Issues a **new** access token and a **new** refresh token.
5. Marks the **old** refresh token record as `isRevoked = true`.
6. Persists the new token hash and sets a new cookie.

This means each refresh token can only be used once. If a stolen token is reused after legitimate rotation, the attempt fails.

### Revocation on Logout

`POST /auth/logout` revokes the current refresh token immediately and clears the cookie, ending the session server-side.

---

## Cookie Configuration

| Attribute  | Value                                         |
| ---------- | --------------------------------------------- |
| `httpOnly` | `true` — inaccessible to JavaScript           |
| `secure`   | `true` in production, `false` in development  |
| `sameSite` | `strict` — not sent on cross-site navigations |
| `path`     | `/`                                           |
| `maxAge`   | `604800` (7 days in seconds)                  |

---

## CORS Configuration

Configured in `main.ts`:

- **Allowed origin**: value of `FRONTEND_URL` env variable (e.g., `http://localhost:5173`)
- **Methods**: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- **Allowed headers**: `Content-Type, Authorization`
- **Credentials**: `true` (required for the cookie to be sent cross-origin)

Only the configured frontend origin is permitted. No wildcard origin is used.

---

## Validation

NestJS `ValidationPipe` is registered globally with:

- `whitelist: true` — strips any property not declared in the DTO
- `forbidNonWhitelisted: true` — returns `400 Bad Request` if unknown properties are sent
- `transform: true` — coerces payload types to match DTO decorators

This prevents mass-assignment and unexpected field injection.

---

## Ownership Checks

Before any mutation, services verify ownership:

- **Courses**: The service confirms `course.instructorId === requestingUser.id` before PATCH, DELETE, publish, or unpublish.
- **Quizzes**: Ownership is verified through the quiz's course (`quiz.course.instructorId === requestingUser.id`).
- **Enrollments and Progress**: Verified against the authenticated user's student ID.

Attempts to mutate another user's resource return `403 Forbidden`.

---

## Quiz Answer Privacy

When a quiz is fetched by a **student**, the `isCorrect` field is removed from all `QuizOption` objects in the response. Instructors receive the full data including correct answer flags.

---

## No Plaintext Secrets in Code

- `JWT_SECRET` and `COOKIE_SECRET` are read from environment variables via `ConfigService`.
- No secrets are hardcoded in source files.
- The fallback `'fallback-secret'` used for `COOKIE_SECRET` in the Fastify cookie plugin registration is only a development convenience — it must be overridden with a strong value in production via the `COOKIE_SECRET` env variable.

---

## Swagger in Production

The Swagger UI (`/api/docs`) is available in all environments. Consider gating it behind a middleware or disabling it in production by checking `NODE_ENV`.
