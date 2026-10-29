# API Reference

**Base URL**: `http://localhost:3001/api/v1`  
**Swagger UI**: `http://localhost:3001/api/docs`

All authenticated endpoints require the header:
```
Authorization: Bearer <accessToken>
```

---

## Auth

### `POST /auth/register`
**Auth**: Public

Register a new account.

**Body**
```json
{ "email": "user@example.com", "name": "Alice", "password": "Str0ng!", "role": "STUDENT" }
```

**Response** `201`
```json
{ "user": { "id": "...", "email": "...", "name": "...", "role": "STUDENT" }, "accessToken": "..." }
```
Sets `refresh_token` httpOnly cookie.

---

### `POST /auth/login`
**Auth**: Public

**Body**
```json
{ "email": "user@example.com", "password": "Str0ng!" }
```

**Response** `200` — same shape as register. Sets `refresh_token` httpOnly cookie.

---

### `POST /auth/logout`
**Auth**: Authenticated (Bearer)

Revokes the current refresh token and clears the cookie.

**Response** `200`
```json
{ "message": "Logged out successfully" }
```

---

### `POST /auth/refresh`
**Auth**: Public (uses httpOnly `refresh_token` cookie)

Issues a new access token and rotates the refresh token.

**Response** `200`
```json
{ "accessToken": "..." }
```
Sets new `refresh_token` cookie.

---

### `GET /auth/me`
**Auth**: Authenticated (Bearer)

Returns the current user's profile.

**Response** `200` — user object without `passwordHash`.

---

## Users

### `GET /users/profile`
**Auth**: Authenticated (Bearer)

Returns the authenticated user's full profile.

---

### `PATCH /users/profile`
**Auth**: Authenticated (Bearer)

Update name, bio, or avatarUrl.

**Body** (all optional)
```json
{ "name": "...", "bio": "...", "avatarUrl": "https://..." }
```

---

## Categories

### `GET /categories`
**Auth**: Public

Returns all course categories.

**Response** `200`
```json
[{ "id": "...", "name": "Web Development", "slug": "web-development", "description": "..." }]
```

---

## Courses

### `GET /courses`
**Auth**: Public

Returns all **published** courses with instructor and category info. Supports query params for filtering.

---

### `GET /courses/my`
**Auth**: INSTRUCTOR only

Returns all courses owned by the authenticated instructor (any status).

---

### `GET /courses/:id`
**Auth**: Public

Returns a single course with its lessons (published courses) or full detail for the owning instructor.

---

### `POST /courses`
**Auth**: INSTRUCTOR only

Create a new course (created as `DRAFT`).

**Body**
```json
{
  "title": "...", "description": "...", "shortDescription": "...",
  "difficulty": "BEGINNER", "categoryId": "...", "objectives": ["..."]
}
```

---

### `PATCH /courses/:id`
**Auth**: INSTRUCTOR (must own course)

Update any course fields.

---

### `DELETE /courses/:id`
**Auth**: INSTRUCTOR (must own course)

Permanently deletes the course and cascades to lessons, quizzes, and enrollments.

---

### `POST /courses/:id/publish`
**Auth**: INSTRUCTOR (must own course)

Sets course status to `PUBLISHED`. Requires at least one lesson.

---

### `POST /courses/:id/unpublish`
**Auth**: INSTRUCTOR (must own course)

Sets course status back to `DRAFT`.

---

## Lessons

### `GET /courses/:courseId/lessons`
**Auth**: Authenticated (enrolled students or owning instructor)

Returns all lessons for a course ordered by `order`.

---

### `GET /courses/:courseId/lessons/:id`
**Auth**: Authenticated (enrolled student or owning instructor)

Returns a single lesson with full content.

---

### `POST /courses/:courseId/lessons`
**Auth**: INSTRUCTOR (must own course)

**Body**
```json
{ "title": "...", "type": "TEXT", "content": "...", "order": 1, "duration": 300 }
```

---

### `PATCH /courses/:courseId/lessons/:id`
**Auth**: INSTRUCTOR (must own course)

Update lesson fields.

---

### `DELETE /courses/:courseId/lessons/:id`
**Auth**: INSTRUCTOR (must own course)

Delete a lesson. Cascades to `LessonProgress`.

---

### `PATCH /courses/:courseId/lessons/reorder`
**Auth**: INSTRUCTOR (must own course)

Atomically reassigns `order` values for all lessons.

**Body**
```json
{ "lessons": [{ "id": "...", "order": 1 }, { "id": "...", "order": 2 }] }
```

---

## Enrollments

### `POST /enrollments`
**Auth**: STUDENT only

Enroll in a published course. Returns `409 Conflict` if already enrolled.

**Body**
```json
{ "courseId": "..." }
```

---

### `GET /enrollments`
**Auth**: STUDENT only

Returns all of the student's enrollments with course info and progress percentage.

---

### `GET /enrollments/:id`
**Auth**: STUDENT (must own enrollment)

Returns a single enrollment with detailed progress.

---

### `GET /enrollments/check/:courseId`
**Auth**: STUDENT only

Returns `{ enrolled: boolean, enrollmentId?: string }` for the given course.

---

## Progress

### `POST /progress/:lessonId/complete`
**Auth**: STUDENT only (must be enrolled in the lesson's course)

Marks a lesson as complete. Idempotent — marking an already-completed lesson returns `200` without error.

---

### `DELETE /progress/:lessonId/complete`
**Auth**: STUDENT only (must own progress record)

Unmarks a lesson as complete.

---

### `GET /progress/courses/:courseId`
**Auth**: STUDENT only (must be enrolled)

Returns progress summary for a course:
```json
{
  "totalLessons": 10,
  "completedLessons": 4,
  "percentComplete": 40,
  "completedLessonIds": ["..."]
}
```

---

## Quizzes

### `GET /quizzes/course/:courseId`
**Auth**: Authenticated (enrolled student or owning instructor)

Returns all quizzes for a course. `isCorrect` is **stripped from options** for students.

---

### `GET /quizzes/:id`
**Auth**: Authenticated (enrolled student or owning instructor)

Returns a single quiz with questions and options. `isCorrect` stripped for students.

---

### `POST /quizzes/course/:courseId`
**Auth**: INSTRUCTOR (must own course)

Create a quiz.

**Body**
```json
{ "title": "...", "description": "...", "lessonId": "..." }
```

---

### `PATCH /quizzes/:id`
**Auth**: INSTRUCTOR (must own quiz's course)

Update quiz title/description.

---

### `DELETE /quizzes/:id`
**Auth**: INSTRUCTOR (must own quiz's course)

Delete quiz and cascade to questions, options, attempts.

---

### `POST /quizzes/:id/questions`
**Auth**: INSTRUCTOR (must own quiz's course)

Add a question with its options.

**Body**
```json
{
  "text": "What is X?",
  "order": 1,
  "options": [
    { "text": "A", "isCorrect": false },
    { "text": "B", "isCorrect": true }
  ]
}
```

---

### `PATCH /quizzes/:id/questions/:questionId`
**Auth**: INSTRUCTOR (must own quiz's course)

Update question text or order.

---

### `DELETE /quizzes/:id/questions/:questionId`
**Auth**: INSTRUCTOR (must own quiz's course)

Delete a question and its options.

---

### `POST /quizzes/:id/attempt`
**Auth**: STUDENT only (must be enrolled in quiz's course)

Submit a quiz attempt.

**Body**
```json
{
  "answers": [
    { "questionId": "...", "selectedOptionId": "..." }
  ]
}
```

**Response** `201`
```json
{ "score": 8, "totalPoints": 10, "percentage": 80, "answers": [...] }
```

---

### `GET /quizzes/:id/attempts`
**Auth**: STUDENT only

Returns all attempts for the authenticated student on this quiz.

---

### `GET /quizzes/:id/stats`
**Auth**: INSTRUCTOR (must own quiz's course)

Returns aggregate attempt statistics: attempt count, average score, score distribution.

---

## Dashboard

### `GET /dashboard/student`
**Auth**: STUDENT only

Returns:
```json
{
  "enrolledCourses": 5,
  "completedCourses": 2,
  "inProgressCourses": 3,
  "recentEnrollments": [...],
  "overallProgress": 48
}
```

---

### `GET /dashboard/instructor`
**Auth**: INSTRUCTOR only

Returns:
```json
{
  "totalCourses": 4,
  "publishedCourses": 3,
  "draftCourses": 1,
  "totalStudents": 120,
  "courses": [{ "id": "...", "title": "...", "enrollmentCount": 45, "status": "PUBLISHED" }]
}
```
