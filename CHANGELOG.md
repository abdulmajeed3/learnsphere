# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2024-01-01

### Added

**Backend (NestJS + Fastify + Prisma + PostgreSQL)**

- Authentication module: register, login, logout, token refresh, current user endpoint
- argon2id password hashing
- JWT access token (15 min) + httpOnly refresh token cookie (7 days) with rotation and revocation
- SHA-256 hashing of refresh tokens before storage
- User profile module: view and update profile
- Course categories: public read endpoint
- Courses module: full CRUD, publish/unpublish, public catalog, instructor-owned listing
- Lessons module: CRUD within a course, atomic reorder endpoint
- Enrollments module: student enrollment with duplicate prevention
- Progress module: per-lesson completion tracking with course-level rollup
- Quizzes module: quiz and question management, student attempt submission and scoring, instructor stats
- Dashboard module: aggregated stats for student and instructor roles
- Global ValidationPipe with whitelist and forbidNonWhitelisted
- Swagger / OpenAPI documentation at `/api/docs`
- Docker Compose configuration for development and test PostgreSQL instances

**Frontend (React + Vite + Tailwind)**

- Authentication pages: login, register
- Public course catalog with category filtering
- Course detail page
- Lesson viewer page with completion toggle
- Student dashboard and my-learning page
- Instructor dashboard
- Course editor, lesson editor, quiz editor (instructor)
- Profile page
- React Router v6 routing with role-based guards
- Axios HTTP client with automatic JWT refresh interceptor
- Zustand auth store

**Infrastructure**

- npm workspaces monorepo (`apps/api`, `apps/web`)
- TypeScript strict mode in both workspaces
- ESLint + Prettier configuration
- Jest unit tests for API (8 tests across auth, enrollments, progress)
- Vitest unit tests for web (5 tests across LoginPage, CourseCatalog)
- Full documentation suite in `docs/`
