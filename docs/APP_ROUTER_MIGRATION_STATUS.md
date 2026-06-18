# App Router Migration Status

**Last updated:** Full migration complete. **No Pages Router routes remain** — all routes are in `src/app/`.

---

## Summary

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Low-risk student routes (dashboard, classroom/student, onboarding, leaderboard, reward, math-library, shop, inbox/student, download) | ✅ Done |
| 2 | Reports (daily/weekly + detail) with query-param bridging | ✅ Done |
| 3 | High-risk interactive (classroom/student/detail/quiz, question/exercise) | ✅ Done |
| 4 | Auth guard consolidation (`@/app/config/authRoutes.js`, single boundary in `(app)/layout`) | ✅ Done |
| 5 | Docs and regression checklist | ✅ Done |
| 6 | Teacher/admin routes + remove all `src/pages` | ✅ Done |

---

## App Router routes (app — protected)

All under `src/app/(app)/` — protected by Authentication in ClientProviders.

### Student
| Route | Client |
|-------|--------|
| `/dashboard` | DashboardClient |
| `/dashboard/student-profile` | StudentProfileClient |
| `/classroom/student`, `/classroom/student/detail`, `/classroom/student/detail/quiz` | ClassroomStudentClient, ClassroomStudentDetailClient, ClassroomStudentQuizClient |
| `/onboarding/placement`, `/onboarding/results`, `/onboarding/resume-gate` | OnboardingPlacementClient, OnboardingResultsClient, ResumeGateClient |
| `/leaderboard`, `/reward`, `/math-library`, `/shop`, `/inbox/student`, `/download` | (respective clients) |
| `/reports/daily`, `/reports/daily/detail`, `/reports/weekly`, `/reports/weekly/table`, `/reports/weekly/detail` | DailyReportsClient, DailyReportDetailClient, WeeklyReportsClient, WeeklyReportDetailClient |
| `/question/exercise` | QuestionExerciseClient |

### Teacher / Admin
| Route | Client |
|-------|--------|
| `/dashboard/teacher-profile` | TeacherProfileClient |
| `/admin-performance` | AdminPerformanceClient |
| `/classroom/add-quiz` | AddQuizClient |
| `/class-planning` | ClassPlanningClient |
| `/class-report` | ClassReportClient |
| `/inbox/teacher` | TeacherInboxClient |
| `/school-overview` | SchoolOverviewClient |
| `/quiz-exercise`, `/quiz-exercise/form` | QuizExerciseClient, QuizExerciseFormClient |
| `/quiz-report` | QuizReportClient |
| `/user-questions/teacher`, `/user-questions/form` | UserQuestionsTeacherClient, UserQuestionsFormClient |

**Public routes** (no auth) under `src/app/(public)/`: landing, login, signup, forgot, reset-password, about, contact, pricing, payment-success, activate-account.

**404:** `src/app/not-found.tsx` (App Router global not-found).

---

## SSR & SEO Coverage

- **Reports (student)**  
  - `/reports/daily` and `/reports/weekly`:
    - Server-prefetch first page via `/api/protected/student/reports/getAllDailyReports` and `/getAllWeeklyReports` using `cookies()` + `cache: "no-store"`.
    - Hydrate `DailyReportsClient` / `WeeklyReportsClient` once with `initialRows` + `initialPageContext`; later interactions call `ReportAPI` directly.
  - `/reports/daily/detail` and `/reports/weekly/detail`:
    - Server-prefetch single report via `/getDailyReport` and `/getWeeklyReport` with `cookies()` + `cache: "no-store"`.
    - Pass `initialReport` into `DailyReportDetailClient` / `WeeklyReportDetailClient`; clients use it as primary and only refetch when null.
    - Report detail clients use `useUser()` for `userName` (from layout `initialUser`).
    - `generateMetadata` derives titles/descriptions from `searchParams` (date / subject / week_start / year) without extra fetches.
  - Guardrail: `getDataHead` and any function-bearing configs (e.g. column `valueFormatter`) stay entirely client-side and are **not** passed through server props.

- **Dashboard & profile**
  - `/dashboard`:
    - Server-prefetches dashboard data via `/api/protected/student/dashboard/getData` and passes `initialDashboardData` into `DashboardClient`.
  - `/dashboard/student-profile`:
    - Server-prefetches `getProfile` + `getSummary` in parallel and passes `initialProfileData` + `initialSummaryData` into `Profile` via `StudentProfileClient`.

- **Exercise & library**
  - `/question/exercise`:
    - Server-prefetches enabled categories via `/api/protected/student/user/getCategories` and passes `initialEnabledCategories` into `QuestionExerciseClient`.
  - `/math-library`:
    - Server-prefetches profile (for year) then assets via `/api/protected/student/mathLibrary/getAssets` and passes `initialAssets` + `initialYear` into `MathLibraryClient`.

- **Leaderboard, shop, reward**
  - `/leaderboard`: SSR shell with `initialLeaderboard` (null for now; ready for future API).
  - `/shop`: SSR shell with `initialItems` (null for now); `Shop` uses `useUser()` for coins.
  - `/reward`: SSR shell with `initialRewards` (null for now; ready for future API).

- **Onboarding**
  - `/onboarding/placement`:
    - Server-prefetches placement questions via `/api/protected/student/placement/getQuestions` and passes `initialQuestions` into `PlacementTestPage`.

- **Classroom**
  - `/classroom/student`:
    - Currently a “coming soon” placeholder with illustration + copy; no SSR data prefetch by design.

- **Other analytic pages**
  - `/quiz-report` and `/class-report`:
    - Kept as fully client-driven teacher analytics views for now; templates use static/dummy data plus `getDataHead`.
    - SEO uses static `metadata` with clear titles and descriptions describing quiz/class analytics.

- **Public & auth/onboarding SEO**
  - Public marketing pages (`(public)/page.tsx`, `/pricing`, `/about`, `/contact`) have:
    - Unique, keyword-rich `title` + `description` mentioning Pebbo, AI math, and ages 6–12 where relevant.
    - `openGraph` blocks mirroring main metadata and setting `siteName: "Pebbo"`.
  - Auth/onboarding (`/login`, `/signup`, `/forgot`, `/reset-password`, `/activate-account`, `/onboarding/placement`, `/onboarding/results`, `/onboarding/resume-gate`) have:
    - Action-specific titles (e.g. “Login — Pebbo Student Portal”, “Pebbo Placement Test”).
    - Descriptions focused on regaining access, starting placement, or continuing onboarding.
    - `openGraph` where needed for richer link previews.

---

## Regression checklist (student flows)

Use this before releases after migration changes.

### Auth & gates
- [ ] Logged-out user visiting `/dashboard` (or any app route) redirects to `/login`.
- [ ] Logged-in student who has not completed onboarding is sent to `/onboarding/placement`.
- [ ] Logged-in unpaid student (onboarding done, not paying) can only access onboarding, payment-success, pricing; otherwise redirected to `/onboarding/resume-gate`.
- [ ] Logged-in paying student can access all app routes above.

### Core flows
- [ ] **Dashboard:** Loads, summary/todos correct, links to classroom/reports/question exercise work.
- [ ] **Classroom list:** Classrooms load; "View" goes to detail with correct `id`.
- [ ] **Classroom detail:** Quizzes list loads; "Start quiz" goes to `/classroom/student/detail/quiz?id=...&quiz_id=...`.
- [ ] **Quiz:** Quiz loads, submit works, back returns to classroom detail; scroll lock in main content during quiz.
- [ ] **Question / exercise:** Categories load, get question works, submit answer works, loader shows.
- [ ] **Reports:** Daily/weekly list load; "View" keeps `week_start`/`subject`/`year` (or equivalent) in URL; detail loads with correct params and does not show "params trimmed" or validation errors.
- [ ] **Onboarding:** Placement test, results, resume-gate behave as before; redirects after completion correct.

### Public
- [ ] Landing, login, signup, forgot, reset-password, about, contact, pricing, **payment-success**, **activate-account** load without auth.
- [ ] **Payment-success:** Shows success UI; button redirects to `/dashboard` if authenticated, else `/login`.
- [ ] **Activate-account:** Subscribe / “Use activation key” flow works; key activation redirects to dashboard.
- [ ] 404: Unknown app route shows App Router not-found (or consistent 404 UI).

### Teacher / Admin (smoke)
- [ ] Teacher profile, class-planning, class-report, classroom/add-quiz, inbox/teacher load.
- [ ] Admin: admin-performance, school-overview load.
- [ ] user-questions/teacher (table), user-questions/form (add/edit with `?question_id=`), quiz-exercise, quiz-exercise/form (with `?id=`), quiz-report work as before.

### Performance (post–Phase 5)
- [x] **QuestionPage modularisation (2025-02):** Split into `CategoryScreen`, `LoadingScreen`, `QuestionScreen`, `questionPageUtils.js`, `questionPageConstants.js`. Backup at `QuestionPage.backup.jsx`.
- [ ] When implementing route-level code-split: each `*Client` lazy-loads its template via `next/dynamic`; sub-components stay in the same chunk as the template.
- [ ] For reports, confirm server-prefetch is wired:
  - `/reports/daily` and `/reports/weekly` prefetch first pages via `/api/protected/student/reports/getAllDailyReports` and `/getAllWeeklyReports`, then hydrate `DailyReportsClient` / `WeeklyReportsClient` with `initialRows` + `initialPageContext`.
  - `/reports/daily/detail` and `/reports/weekly/detail` prefetch single reports via `/getDailyReport` and `/getWeeklyReport` using cookies, passing `initialReport` into their clients while keeping `getDataHead` client-side.

---

## Auth config (single source of truth)

- **Path lists:** `src/app/config/authRoutes.js`  
  - `PUBLIC_PATHS` — no auth required  
  - `UNPAID_STUDENT_ALLOWED_PATHS` — allowed for unpaid students  
- **Guard:** `src/app/contexts/Authentication.js` (used only inside `ClientProviders` for `(app)` routes).
- **Boundary:** `src/app/(app)/layout.tsx` — all app routes go through ClientProviders → Authentication.

To add a new public or unpaid-allowed path: update `authRoutes.js` only.
