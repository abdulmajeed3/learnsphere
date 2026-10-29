# LearnSphere

> **Reference Only — All Rights Reserved**
>
> This repository is publicly available for portfolio presentation and technical evaluation only. Public visibility does not grant permission to deploy, operate, commercially use, modify, redistribute, or create derivative works from this software. Any additional use requires prior written authorization under the applicable license and subject to applicable law. All rights not expressly granted are reserved.
>
> See [LICENSE](LICENSE). To request permission for additional use, contact majeed.developer0@gmail.com.

A professional, full-stack Learning Management System (LMS) built with NestJS and React.

## Key Features

- **Authentication** — JWT access + refresh tokens (httpOnly cookies), argon2id hashing, token rotation
- **Course Catalog** — Browse, search, and filter published courses by category and difficulty
- **Course Management** — Instructors create, edit, publish/unpublish courses with lessons (text & video)
- **Enrollment** — Students enroll in published courses; duplicates and unpublished course enrollments are prevented
- **Lesson Progress** — Mark lessons complete/incomplete; per-enrollment progress tracking with percentage
- **Quizzes** — Multiple-choice quizzes with backend scoring; correct answers never sent to students before submission
- **Dashboards** — Real-time student and instructor dashboards from actual database data
- **Role-based Access** — STUDENT and INSTRUCTOR roles enforced server-side on every protected endpoint

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, React Hook Form + Zod, Recharts |
| Backend | NestJS 10 + Fastify adapter, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Auth | Passport JWT, argon2id, refresh-token rotation |
| Testing | Vitest + RTL (frontend), Jest (backend) |
| CI | GitHub Actions |

## Architecture

```
LearnSphere/
├── apps/
│   ├── api/          # NestJS backend — REST API at /api/v1
│   └── web/          # React frontend — Vite SPA
├── docs/             # Architecture and reference docs
├── .github/          # CI workflows and issue templates
├── docker-compose.yml
└── package.json      # npm workspaces root
```

The backend follows a modular monolith pattern: one NestJS module per domain (auth, courses, lessons, enrollments, progress, quizzes, dashboard).

## Prerequisites

- Node.js 20 or later
- npm 10 or later
- PostgreSQL 16 (via Docker or local installation)
- Docker + Docker Compose (optional, recommended)

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/learnsphere.git
cd learnsphere
npm install
```

### 2. Start PostgreSQL

**With Docker (recommended):**
```bash
docker-compose up -d postgres
```

**Without Docker:** Create a PostgreSQL database manually and update the connection string below.

### 3. Configure the API

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` and set at minimum:
```
DATABASE_URL="postgresql://learnsphere:learnsphere_dev_password@localhost:5432/learnsphere_dev"
JWT_ACCESS_SECRET="your-min-32-char-secret"
JWT_REFRESH_SECRET="your-min-32-char-refresh-secret"
COOKIE_SECRET="your-min-32-char-cookie-secret"
```

### 4. Configure the frontend

```bash
cp apps/web/.env.example apps/web/.env
```

The default `VITE_API_URL=http://localhost:3001/api/v1` works for local development.

### 5. Run database migrations and seed

```bash
npm run db:migrate        # apply migrations
npm run db:seed           # load demo data
```

### 6. Start the application

```bash
npm run dev:api           # API on http://localhost:3001
npm run dev:web           # Frontend on http://localhost:5173
```

## Environment Variables

### API (`apps/api/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | required |
| `JWT_ACCESS_SECRET` | Secret for access tokens (min 32 chars) | required |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime | `15m` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (min 32 chars) | required |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime | `7d` |
| `PORT` | API port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | CORS origin | `http://localhost:5173` |
| `COOKIE_SECRET` | Cookie signing secret (min 32 chars) | required |

### Frontend (`apps/web/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | API base URL | `http://localhost:3001/api/v1` |

## Database Setup

```bash
npm run db:generate   # Generate Prisma Client from schema (no DB needed)
npm run db:migrate    # Apply all pending migrations
npm run db:seed       # Load demo data
npm run db:studio     # Open Prisma Studio at http://localhost:5555
npm run db:reset      # Drop and recreate (destructive — dev only)
```

## Commands

```bash
# Development
npm run dev:api       # Start API in watch mode
npm run dev:web       # Start frontend dev server

# Build
npm run build:api
npm run build:web

# Tests
npm run test:api      # Jest unit tests
npm run test:web      # Vitest unit tests

# Lint & format
npm run lint
npm run format
npm run format:check

# Type check
npm run type-check
```

## Swagger / OpenAPI

When the API is running: **http://localhost:3001/api/docs**

## Demo Accounts

After running `npm run db:seed`:

| Role | Email | Password |
|------|-------|----------|
| Student | `student@learnsphere.dev` | `password123` |
| Student | `bob@learnsphere.dev` | `password123` |
| Instructor | `instructor@learnsphere.dev` | `password123` |
| Instructor | `jane@learnsphere.dev` | `password123` |

## Roles and Authorization

- **STUDENT** — browse catalog, enroll in published courses, track progress, attempt quizzes
- **INSTRUCTOR** — create and manage their own courses, lessons, and quizzes; view enrollment stats

All authorization is enforced on the backend. Frontend role checks are UX only.

## Quiz Scoring

- Multiple choice, one correct answer per question
- Backend calculates score; client-submitted scores are not trusted
- Unlimited attempts permitted
- Score is number of correct answers / total questions × 100%
- Correct answers are never included in the quiz response to students; only returned in attempt results

## Enrollment Rules

- Only published courses can be enrolled in
- Duplicate enrollments are prevented at the database level (`UNIQUE(studentId, courseId)`)
- Unpublishing a course with existing enrollments retains enrollment records; enrolled students lose catalog access but progress is preserved

## Progress Calculation

`progressPercentage = (completedLessons / totalLessons) * 100`, rounded to the nearest integer. Courses with zero lessons return 0% — no division by zero.

## Security Notes

- Passwords hashed with argon2id
- Refresh tokens are hashed (SHA-256) before storage; raw tokens are never persisted
- Refresh tokens are rotated on every use (old token revoked)
- CORS restricted to `FRONTEND_URL`
- Refresh token stored in httpOnly, SameSite=strict cookie
- All protected endpoints require a valid JWT; ownership is verified server-side
- Quiz correct answers are excluded from student-facing responses

## Production Build

```bash
npm run build:api     # outputs to apps/api/dist/
npm run build:web     # outputs to apps/web/dist/
```

Set `NODE_ENV=production` and use `prisma migrate deploy` (not `dev`) in production.

## Known Limitations

- No Docker installed in the dev environment — Docker Compose config is included but untested locally
- PostgreSQL is not available in the current dev environment; migrations and seed not executed locally
- No video hosting — VIDEO lessons store external URLs only
- No email verification, password reset, or 2FA
- No file upload for thumbnails or avatars — URL strings only
- Playwright E2E tests included in config but require a running stack and are not yet implemented
- No rate limiting beyond `@nestjs/throttler` defaults on all routes (auth routes should have stricter limits in production)

## Deployment

> **Reference only:** the guidance below documents how the system is designed to run. Deploying or operating this software requires prior written authorization under the [LICENSE](LICENSE).

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment guidance.

## Contributing

This project is published for reference and portfolio evaluation and is not open to outside contributions or pull requests. See [LICENSE](LICENSE) for the use that is permitted, and contact me to request any additional permission.

## License

Copyright (c) 2026 Abdul Majeed. All rights reserved.

This project is published under a custom **Reference-Only Source-Available License**. It is **not** an open-source license. See [LICENSE](LICENSE). Deployment, commercial use, modification and redistribution require prior written authorization. Permission requests: majeed.developer0@gmail.com

