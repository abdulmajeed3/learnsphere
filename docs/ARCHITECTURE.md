# Architecture

## Overview

LearnSphere is an npm workspaces monorepo containing two packages:

| Package | Path | Description |
|---------|------|-------------|
| `api` | `apps/api` | NestJS + Fastify REST API |
| `web` | `apps/web` | React + Vite SPA |

---

## Backend (`apps/api`)

### Technology Stack

- **Framework**: NestJS on Fastify adapter (not Express)
- **ORM**: Prisma 5 with PostgreSQL 16
- **Authentication**: Passport JWT + refresh token rotation
- **Validation**: class-validator + class-transformer via NestJS `ValidationPipe`
- **Documentation**: Swagger / OpenAPI at `/api/docs`
- **Global prefix**: `/api/v1`

### Module Structure

The API follows a **modular monolith** pattern. Each domain concern is its own NestJS module with its own controller, service, and DTOs.

```
src/
├── app.module.ts          # Root module — imports all feature modules
├── main.ts                # Bootstrap: Fastify, cookies, CORS, Swagger, ValidationPipe
├── auth/                  # JWT authentication & token management
├── users/                 # User profile CRUD
├── categories/            # Course category read-only access
├── courses/               # Course lifecycle (CRUD, publish/unpublish)
├── lessons/               # Lesson CRUD + reorder within a course
├── enrollments/           # Student enrollment in courses
├── progress/              # Per-lesson completion tracking
├── quizzes/               # Quiz, question, option management + attempts
├── dashboard/             # Aggregated stats for student and instructor
└── prisma/                # PrismaService (database singleton)
```

### Module Responsibilities

| Module | Responsibility |
|--------|---------------|
| `auth` | Register, login, logout, token refresh, `GET /auth/me`. Issues JWTs and manages httpOnly refresh cookies. |
| `users` | `GET /users/profile`, `PATCH /users/profile`. Authenticated profile view/update. |
| `categories` | `GET /categories`. Public read of all course categories. |
| `courses` | Full CRUD for INSTRUCTOR-owned courses plus publish/unpublish toggles. Public catalog listing for STUDENT. |
| `lessons` | CRUD for lessons scoped to a course. Ownership enforced through the course. Supports atomic reorder. |
| `enrollments` | Students enroll in published courses. Duplicate enrollment blocked at DB level. |
| `progress` | Mark/unmark a lesson complete. Rolls up progress percentage for a course. |
| `quizzes` | INSTRUCTOR creates quizzes with questions and options. Students submit attempts. Stats endpoint for instructors. |
| `dashboard` | Returns aggregate stats (enrolled courses + progress, or published courses + enrollment counts) in one query. |
| `prisma` | Wraps `PrismaClient`, exported globally, handles `onModuleInit` / `onModuleDestroy`. |

---

## Frontend (`apps/web`)

### Technology Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State**: Zustand for auth store; React Query (or plain fetch) for server state
- **HTTP**: Axios client in `src/api/`

### Directory Structure

```
src/
├── api/                   # Axios instance + per-feature API functions
├── components/            # Shared UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility helpers
├── pages/
│   ├── HomePage.tsx
│   ├── NotFoundPage.tsx
│   ├── ProfilePage.tsx
│   ├── auth/              # LoginPage, RegisterPage
│   ├── courses/           # CourseCatalog, CourseDetail, CourseLesson
│   ├── instructor/        # InstructorDashboard, CourseEditor, LessonEditor, QuizEditor
│   └── student/           # StudentDashboard, MyLearning
├── stores/                # Zustand stores (authStore)
├── test/                  # Vitest test files
└── types/                 # TypeScript type declarations
```

### Routing

| Route | Page | Guard |
|-------|------|-------|
| `/` | HomePage | Public |
| `/login` | LoginPage | Redirect if authed |
| `/register` | RegisterPage | Redirect if authed |
| `/courses` | CourseCatalog | Public |
| `/courses/:id` | CourseDetail | Public |
| `/courses/:courseId/lessons/:lessonId` | CourseLesson | Student enrolled |
| `/profile` | ProfilePage | Authenticated |
| `/student/dashboard` | StudentDashboard | STUDENT |
| `/student/my-learning` | MyLearning | STUDENT |
| `/instructor/dashboard` | InstructorDashboard | INSTRUCTOR |
| `/instructor/courses/:id/edit` | CourseEditor | INSTRUCTOR owns course |
| `/instructor/courses/:id/lessons/:lid/edit` | LessonEditor | INSTRUCTOR owns course |
| `/instructor/courses/:id/quizzes` | QuizEditor | INSTRUCTOR owns course |

---

## Authentication Flow

1. **Register / Login**: Client POSTs credentials → API returns `{ user, accessToken }` in JSON body + sets `refresh_token` httpOnly cookie.
2. **Authenticated requests**: Client sends `Authorization: Bearer <accessToken>` header. Access token expires in **15 minutes**.
3. **Token refresh**: When a 401 is received, the Axios interceptor calls `POST /auth/refresh`. The browser sends the cookie automatically. API verifies the token hash in the database, issues a new access token AND a new refresh token (rotation), and revokes the old one. New refresh token is set in the cookie.
4. **Logout**: Client calls `POST /auth/logout` with the bearer token. API revokes the refresh token from the database and clears the cookie.
5. **Revocation check**: Every refresh validates that `isRevoked = false` and `expiresAt > now`. Revoked or expired tokens are rejected.

---

## Data Flow Pattern

```
Browser
  └─ Axios (Authorization header) ──▶ Fastify
                                         └─ NestJS Controller
                                               └─ NestJS Service
                                                     └─ PrismaService
                                                           └─ PostgreSQL
```

- DTOs validate and transform inbound payloads.
- Services contain all business logic and own Prisma queries.
- Controllers are thin: call one service method, return the result.
- Ownership checks (e.g., course belongs to instructor) are performed in the service layer before any mutation.
