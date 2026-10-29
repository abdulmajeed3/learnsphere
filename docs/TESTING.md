# Testing

## Test Summary

| Workspace | Test files | Tests | Framework | Status |
|-----------|-----------|-------|-----------|--------|
| `apps/api` | 3 | 8 | Jest | PASS |
| `apps/web` | 2 | 5 | Vitest | PASS |

---

## Backend Tests (`apps/api`)

Test files live alongside source files:

| File | Tests | Coverage area |
|------|-------|--------------|
| `src/auth/auth.service.spec.ts` | 3 | Register, login, token refresh logic |
| `src/enrollments/enrollments.service.spec.ts` | 3 | Enroll, duplicate check, list enrollments |
| `src/progress/progress.service.spec.ts` | 2 | Mark complete, unmark complete |

All three spec files use Jest with mocked `PrismaService` — no real database connection is required to run the unit tests.

### Running Backend Tests

```bash
# From repo root
npm run test:api

# From apps/api directory
npx jest
npx jest --coverage
npx jest --watch
```

---

## Frontend Tests (`apps/web`)

Test files are in `src/test/`:

| File | Tests | Coverage area |
|------|-------|--------------|
| `src/test/LoginPage.test.tsx` | 2 | Form rendering, submit with credentials |
| `src/test/CourseCatalog.test.tsx` | 3 | Course list rendering, filter by category, empty state |

Uses Vitest + React Testing Library.

### Running Frontend Tests

```bash
# From repo root
npm run test:web

# From apps/web directory
npx vitest
npx vitest --coverage
npx vitest --ui
```

---

## Running All Tests

```bash
# From repo root — runs both workspaces sequentially
npm test
```

---

## Test Database (CI)

The `docker-compose.yml` includes a `postgres_test` service separate from the development database:

```yaml
postgres_test:
  image: postgres:16-alpine
  environment:
    POSTGRES_USER: learnsphere
    POSTGRES_PASSWORD: learnsphere_test_password
    POSTGRES_DB: learnsphere_test
  ports:
    - '5433:5432'
```

For integration or E2E tests that require a real database, set:
```env
DATABASE_URL=postgresql://learnsphere:learnsphere_test_password@localhost:5433/learnsphere_test
```

Run `prisma migrate deploy` against the test database before running integration tests.

---

## Known Limitations

- **No E2E tests**: Playwright/Cypress integration tests are not implemented in v1.0.
- **No integration tests with real DB locally**: The unit tests mock `PrismaService`. Running against a live PostgreSQL instance requires Docker (or a local PostgreSQL install) and the `postgres_test` container to be running.
- **No coverage gates**: Code coverage is not enforced in CI at this time.
