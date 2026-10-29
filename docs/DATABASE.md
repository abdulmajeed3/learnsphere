# Database

## Overview

- **Engine**: PostgreSQL 16
- **ORM**: Prisma 5 (`apps/api/prisma/schema.prisma`)
- **Primary keys**: UUID (`@default(uuid())`) on every model — avoids sequential ID enumeration and simplifies distributed inserts.
- **Timestamps**: `createdAt @default(now())` and `updatedAt @updatedAt` on mutable models.

---

## Enums

| Enum | Values |
|------|--------|
| `Role` | `STUDENT`, `INSTRUCTOR` |
| `CourseStatus` | `DRAFT`, `PUBLISHED` |
| `Difficulty` | `BEGINNER`, `INTERMEDIATE`, `ADVANCED` |
| `LessonType` | `TEXT`, `VIDEO` |

---

## Models

### `User`

Represents any platform account. Role defaults to `STUDENT`; instructors are registered with `role: INSTRUCTOR`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `email` | String | `@unique`, indexed |
| `name` | String | |
| `passwordHash` | String | argon2id hash, never exposed in responses |
| `role` | Role | default `STUDENT` |
| `bio` | String? | optional |
| `avatarUrl` | String? | optional |

Relations: has many `Course` (as instructor), `Enrollment`, `QuizAttempt`, `RefreshToken`.

---

### `CourseCategory`

Taxonomy for courses.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `name` | String | `@unique` |
| `slug` | String | `@unique`, URL-safe |
| `description` | String? | |

Relations: has many `Course`.

---

### `Course`

The main learning unit created by an instructor.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `title` | String | |
| `slug` | String | `@unique` |
| `description` | String | full description |
| `shortDescription` | String? | card preview text |
| `thumbnailUrl` | String? | |
| `status` | CourseStatus | default `DRAFT`; only `PUBLISHED` courses visible in catalog |
| `difficulty` | Difficulty | default `BEGINNER` |
| `objectives` | String[] | PostgreSQL text array |
| `instructorId` | String FK | → `User.id` |
| `categoryId` | String? FK | → `CourseCategory.id` (nullable) |

Indexes: `status`, `instructorId`, `categoryId`.

Relations: has many `Lesson`, `Enrollment`, `Quiz`.

---

### `Lesson`

A single content unit inside a course.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `title` | String | |
| `content` | String? | Markdown text for TEXT type |
| `videoUrl` | String? | for VIDEO type |
| `type` | LessonType | default `TEXT` |
| `order` | Int | position within course |
| `duration` | Int? | seconds |
| `courseId` | String FK | → `Course.id` with `onDelete: Cascade` |

Constraints: `@@unique([courseId, order])` — no two lessons share the same order position within a course.

Deletion behavior: deleting a `Course` cascades to all its `Lesson` rows.

Relations: has many `LessonProgress`, `Quiz`.

---

### `Enrollment`

Links a student to a course.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `enrolledAt` | DateTime | default `now()` |
| `studentId` | String FK | → `User.id` |
| `courseId` | String FK | → `Course.id` |

Constraints: `@@unique([studentId, courseId])` — a student can only enroll in a course once; duplicate attempts return a conflict error.

Indexes: `studentId`, `courseId`.

Relations: has many `LessonProgress`.

---

### `LessonProgress`

Records that a student has completed a specific lesson within their enrollment.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `completedAt` | DateTime | default `now()` |
| `enrollmentId` | String FK | → `Enrollment.id` with `onDelete: Cascade` |
| `lessonId` | String FK | → `Lesson.id` with `onDelete: Cascade` |

Constraints: `@@unique([enrollmentId, lessonId])` — one completion record per lesson per enrollment.

Deletion behavior: deleting an `Enrollment` cascades to all its `LessonProgress` rows. Deleting a `Lesson` also cascades.

---

### `RefreshToken`

Stores hashed refresh tokens for rotation and revocation.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `tokenHash` | String | `@unique`; SHA-256 of the raw JWT |
| `expiresAt` | DateTime | 7 days from issuance |
| `isRevoked` | Boolean | default `false`; set `true` on logout or rotation |
| `userId` | String FK | → `User.id` with `onDelete: Cascade` |

Only the hash is stored — the raw token is never persisted. Deleting a `User` cascades to all their refresh tokens.

---

### `Quiz`

A quiz associated with a course (and optionally with a specific lesson).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `title` | String | |
| `description` | String? | |
| `courseId` | String FK | → `Course.id` with `onDelete: Cascade` |
| `lessonId` | String? FK | → `Lesson.id` (optional lesson link) |

Relations: has many `QuizQuestion`, `QuizAttempt`.

---

### `QuizQuestion`

A single question within a quiz.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `text` | String | question body |
| `order` | Int | display position |
| `quizId` | String FK | → `Quiz.id` with `onDelete: Cascade` |

Constraints: `@@unique([quizId, order])`.

Relations: has many `QuizOption`, `QuizAttemptAnswer`.

---

### `QuizOption`

One answer choice for a `QuizQuestion`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `text` | String | answer text |
| `isCorrect` | Boolean | default `false` |
| `questionId` | String FK | → `QuizQuestion.id` with `onDelete: Cascade` |

The `isCorrect` flag is **never sent to students** — the API strips it from quiz-fetch responses.

---

### `QuizAttempt`

A student's submission for a quiz.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `score` | Int | points earned |
| `totalPoints` | Int | maximum possible points |
| `submittedAt` | DateTime | |
| `studentId` | String FK | → `User.id` |
| `quizId` | String FK | → `Quiz.id` |

Relations: has many `QuizAttemptAnswer`.

---

### `QuizAttemptAnswer`

Records which option a student selected for each question in an attempt.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `isCorrect` | Boolean | evaluated at submission time |
| `attemptId` | String FK | → `QuizAttempt.id` with `onDelete: Cascade` |
| `questionId` | String FK | → `QuizQuestion.id` |
| `selectedOptionId` | String? FK | → `QuizOption.id` (null if question skipped) |

---

## Relationship Diagram (simplified)

```
User ──< Course ──< Lesson ──< LessonProgress
 |              ──< Quiz   ──< QuizQuestion ──< QuizOption
 |
 ├──< Enrollment ──< LessonProgress
 ├──< QuizAttempt ──< QuizAttemptAnswer
 └──< RefreshToken

CourseCategory ──< Course
```

---

## Key Cascade Summary

| Parent deleted | Child cascade |
|----------------|--------------|
| `Course` | `Lesson` |
| `Lesson` | `LessonProgress` |
| `Enrollment` | `LessonProgress` |
| `Quiz` | `QuizQuestion` |
| `QuizQuestion` | `QuizOption`, `QuizAttemptAnswer` |
| `QuizAttempt` | `QuizAttemptAnswer` |
| `User` | `RefreshToken` |
