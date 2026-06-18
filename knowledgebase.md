# Pebbo App Knowledge Base

This document explains the app from a product/features perspective only.
It covers all major routes, user roles, flows, and reward mechanics (coins, stars, streaks, todos).
Current scope priority is **student-facing product flows**. Teacher/Admin workflows are documented as archived for now.

---

## What Pebbo Is

Pebbo is a role-based learning platform with:
- Student learning journeys (onboarding, placement, adaptive exercise, reports, rewards).
- Teacher workflows (classrooms, quizzes, analytics, student reports).
- Admin workflows (school overview, performance, monitoring).
- Gamification systems (coins, stars, streaks, celebratory milestones, leaderboard/reward/shop surfaces).

---

## User Roles and What They Can Do

### Student
- Sign up/login and complete account onboarding.
- Take placement test and receive personalized placement results.
- Practice with adaptive exercise questions.
- Complete assigned classroom quizzes.
- View daily and weekly learning reports.
- Use math library content by context/year.
- Track and celebrate streaks and todo completion.
- Earn and spend rewards through coins/stars and reward/shop surfaces.
- Access inbox and download surfaces.

### Teacher
- **Archived / out of current client scope**.
- Historical capabilities include classroom setup, quiz assignment, question management, and teacher analytics/reporting.

### Admin
- **Archived / out of current client scope**.
- Historical capabilities include school overview, performance monitoring, and internal QA/monitoring tools.

---

## Public Routes (Unauthenticated)

### `/`
- Marketing/landing experience.
- Product value communication and conversion funnel entry.

### `/login`
- Account sign-in.
- Entry point to role-specific dashboard/app.

### `/signup`
- New user registration.

### `/forgot`
- Password reset request initiation.

### `/reset-password`
- Password reset completion flow.

### `/activate-account`
- Account activation flow.

### `/payment-success`
- Post-checkout success state and continuation.

### `/about`
- Company/product background page.

### `/contact`
- Contact page for support/sales.

### `/pricing`
- Plan/pricing page and purchase intent step.

---

## Protected App Routes (Authenticated)

## Student Core

### `/dashboard`
- Main student home.
- Surfaces profile summary, progress widgets, activity cards, quick actions.
- Hosts gamification summaries (streak/coins-related surfaces).
- Contains to-do and study activity prompts.

### `/dashboard/student-profile`
- Student profile and learning summary details.

### `/onboarding/placement`
- Placement test experience (question flow + submission).
- Used for initial level/ability calibration.

### `/onboarding/results`
- Placement result reveal (score, placement, next-step guidance).
- Includes motivational/celebration UX.

### `/onboarding/resume-gate`
- Gating/resume flow for users who need to complete onboarding/payment steps.

### `/question/exercise`
- Main adaptive exercise page.
- Category-driven/AI-question practice flow.
- Submission and result/review flow.

### `/math-library`
- Student math library assets and concept browsing.
- Context/year-aware content retrieval.

### `/reports/daily`
- Daily report list/history.

### `/reports/daily/detail`
- Detailed daily report for selected day.

### `/reports/weekly`
- Weekly report list/history.

### `/reports/weekly/table`
- Weekly report table presentation variant.

### `/reports/weekly/detail`
- Detailed weekly report view.

### `/leaderboard`
- Ranking/leaderboard experience surface.

### `/reward`
- Reward redemption area.

### `/shop`
- Shop area for spending coins and interacting with reward economy.

### `/inbox/student`
- Student messaging/inbox.

### `/download`
- Download area (typically app/client resources).

## Student Classroom and Quiz

### `/classroom/student`
- Student classroom list/overview.

### `/classroom/student/detail`
- Student classroom detail and assigned items.

### `/classroom/student/detail/quiz`
- Student quiz-taking interface for class assignments.

## Teacher

> Archived routes (not current focus).

### `/dashboard/teacher-profile`
- Teacher profile page.

### `/class-planning`
- Teacher class planning workflow.

### `/class-report`
- Teacher class-level reporting view.

### `/classroom/add-quiz`
- Teacher flow for assigning/adding quiz to classroom context.

### `/quiz-exercise`
- Quiz exercise management area.

### `/quiz-exercise/form`
- Quiz exercise creation/editing form.

### `/quiz-report`
- Quiz report and analytics surface.

### `/user-questions/teacher`
- Teacher question bank/user-question management list.

### `/user-questions/form`
- Add/edit user question form.

### `/inbox/teacher`
- Teacher messaging/inbox.

## Admin

> Archived routes (not current focus).

### `/school-overview`
- School-level overview (capacity/licenses and high-level school data).

### `/admin-performance`
- Admin performance dashboard.

### `/admin-monitoring`
- Admin monitoring for activity/performance telemetry.

### `/secretadmin`
- Internal admin question preview/testing tool.
- Used to validate how questions render/behave in quiz UI.

---

## Major Feature Flows

## 1) Onboarding + Placement
- User takes fixed placement set.
- Submission returns placement outcomes (score, percentile/grade-level context).
- On first completion, user receives one-time placement completion star reward.
- Correct placement answers can grant coins under placement reward rules.
- Onboarding state is updated and user is pushed toward results/resume paths.

## 2) Adaptive Exercise
- Student starts exercise from dashboard or direct route.
- Questions are generated/fetched according to user context/categories.
- Student submits answers.
- System computes accuracy and updates progress data.
- Rewards are applied (coins + stars for completed question set) via optimized reward function.
- Review/result state is displayed after submission.

## 3) Classroom Quiz
- Student can open assigned classroom quiz and submit answers.
- Teacher creation/assignment/reporting paths are currently archived in client scope.

## 4) Reports
- Daily and weekly report records are generated and retrievable.
- Student sees self-report history and detail.
- Teacher/admin report management paths are currently archived in client scope.

## 5) Gamification and Motivation
- Streak tracking and celebratory states.
- Todo completion syncing and celebration markers.
- Coins and stars accumulation from learning actions.
- Reward/shop/leaderboard surfaces for engagement loops.
- Audio/visual reinforcement appears in parts of onboarding/exercise UX.

---

## Reward System (Coins, Stars, Streaks, Todos)

This section reflects active reward mechanics found in API + DB migration flows.

## Coins and Stars: Exercise Submission
- On completed exercise submission, reward processing grants:
  - Coins: `+10` per completed question in that submission batch.
  - Stars: `+1` per completed question in that submission batch.
- The same operation updates:
  - Student score state.
  - Attempting question state reset.
  - User coin totals.

## Coins and Stars: Placement Submission
- Placement rewards are lifetime-aware and constrained:
  - Coins: `+1` per unique correctly answered placement question (per user/question).
  - Placement coin reward capacity is limited by placement reward slots (up to 10 total rewarded unique placement questions).
  - Stars: one-time `+5` on first placement completion.
- Returns include:
  - Coins/stars awarded for that attempt.
  - Updated total coins/total stars.

## Streak Features
- Daily streak handling exists as a dedicated student backend workflow.
- Celebration endpoint updates streak celebration marker state.
- Streak UI surfaces include streak cards/popups and celebratory states.

## Todo Features
- Student todo list sync endpoint accepts todo list + date and updates student todo state.
- Todo celebration marker endpoint records last celebrated todo date.
- Todo completion appears as a dashboard engagement mechanism.

## Level Celebration
- Level celebration endpoint updates level celebration marker state (for UX celebration control).

## Internal/Admin Preview Reward Behavior
- Secret admin question-completion preview returns non-reward behavior (`coins_awarded` remains zero), as it is a QA/testing surface rather than student progress flow.

---

## Monitoring and Analytics Features

Admin monitoring and tracking features include:
- Activity event tracking pipelines.
- Question view aggregations.
- Active user timelines.
- Speed/network cluster-oriented monitoring views.
- Dedicated admin monitoring dashboard route for operational/product analytics.

---

## Cross-App Product Features (Non-Route Specific)

- Multi-language support (English/Chinese) across key product surfaces.
- In-app sound and music system for onboarding/exercise reinforcement.
- Text-to-speech support for question content (speaker interactions in question UI).
- In-app issue reporting from question/review surfaces.
- General app feedback/report submission channel.
- Dashboard onboarding tour and guided prompts for first-time/returning users.
- Classroom invitation and classroom switching experiences in the main app shell.
- Progress-oriented micro-interactions (confetti, streak popups, celebration states).

---

## Notifications, Inbox, and Communication Surfaces

- Student inbox route for learner-facing messages/updates.
- Teacher inbox route for instructor-facing messages/updates.
- Contact route for external communication requests.

---

## Commerce and Subscription Surfaces

- Pricing page for plan comparison and conversion.
- Checkout/payment initiation for student subscriptions.
- Payment success route for post-purchase handoff.
- Resume gate to handle gated continuation scenarios.
- Subscription status updates handled through billing lifecycle integration.

---

## Feature Index by Route (Quick Lookup)

- `/` — Landing
- `/about` — About
- `/contact` — Contact
- `/pricing` — Pricing
- `/login` — Login
- `/signup` — Signup
- `/forgot` — Forgot Password
- `/reset-password` — Reset Password
- `/activate-account` — Activate Account
- `/payment-success` — Payment Success
- `/dashboard` — Student Dashboard
- `/dashboard/student-profile` — Student Profile
- `/dashboard/teacher-profile` — Teacher Profile
- `/onboarding/placement` — Placement Test
- `/onboarding/results` — Placement Results
- `/onboarding/resume-gate` — Resume Gate
- `/question/exercise` — Exercise
- `/classroom/student` — Student Classrooms
- `/classroom/student/detail` — Classroom Detail
- `/classroom/student/detail/quiz` — Classroom Quiz
- `/reports/daily` — Daily Reports
- `/reports/daily/detail` — Daily Report Detail
- `/reports/weekly` — Weekly Reports
- `/reports/weekly/table` — Weekly Reports Table
- `/reports/weekly/detail` — Weekly Report Detail
- `/leaderboard` — Leaderboard
- `/reward` — Reward
- `/shop` — Shop
- `/math-library` — Math Library
- `/inbox/student` — Student Inbox
- `/inbox/teacher` — Teacher Inbox
- `/download` — Download
- `/quiz-exercise` — Quiz Exercise
- `/quiz-exercise/form` — Quiz Exercise Form
- `/quiz-report` — Quiz Report
- `/classroom/add-quiz` — Add Quiz to Classroom
- `/class-planning` — Class Planning
- `/class-report` — Class Report
- `/user-questions/teacher` — Teacher User Questions
- `/user-questions/form` — User Question Form
- `/school-overview` — School Overview
- `/admin-performance` — Admin Performance
- `/admin-monitoring` — Admin Monitoring
- `/secretadmin` — Internal Secret Admin Preview

---

## Archived Scope (Current Client Request)

The following workflows/routes are intentionally archived for this phase and are not active product focus:
- Teacher workflows: classroom management/assignment, teacher quiz authoring/reporting, teacher inbox/profile surfaces.
- Admin workflows: school overview, admin performance, monitoring, and internal secret admin QA surface.
- Their routes remain in the codebase but are excluded from current feature-priority scope.

---

## Notes

- This document intentionally avoids code-level implementation details.
- Feature descriptions are based on route surface behavior, API capabilities, and reward/analytics data flows present in the project.
