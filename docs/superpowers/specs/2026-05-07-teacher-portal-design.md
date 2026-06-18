# Teacher Portal — Design Spec (v1)

Engineering-grade companion to `docs/teacher-portal-flow.md`. Covers architecture, file layout, theming, per-page implementation notes, API mappings, and build sequence.

Source: brainstorm 2026-05-07. Companion docs: `DESIGN.md` (token inventory), `docs/teacher-portal-flow.md` (client-facing flow), `docs/teacher-portal-seed-plan.md` (deferred test-data seed).

---

## 1. Goal and constraints

Build a teacher-facing UI inside the existing Pebbo Next.js app, embedded at the `/teacher/*` URL prefix, consuming the already-complete `/api/protected/teacher/*` API surface (~33 endpoints). Visual style is family-resemblance with the student dashboard — same brand DNA, same chrome, but built fresh in Tailwind v4 + shadcn/ui rather than legacy SCSS+MUI.

**Hard constraints (from brainstorm):**

- No student portal code may be modified.
- Family-resemblance, not pixel-identical, with student dashboard.
- Manual PR review for visual parity (no automated parity-comparison route in v1).
- shadcn primitives at standard `src/app/components/ui/` location (single source of truth, future portals inherit).
- v1 capability scope: View + Assign + Quiz Authoring.
- Sidebar: Dashboard, Classrooms, Quizzes (3 items). Profile lives in top-right header dropdown.
- Routing: `/teacher/*` URL prefix.
- Login: shared `/login` page, role-based redirect on success.
- Use `/impeccable:impeccable` skill commands during build (`shape` before code, `craft` for build, `polish` / `critique` before merge).

---

## 2. Architecture

### 2.1 File layout

```
src/app/
├── (app)/
│   └── teacher/                         ← all teacher pages
│       ├── layout.tsx                   ← TeacherShell: sidebar + header + main slot
│       ├── dashboard/
│       │   └── page.tsx
│       ├── classrooms/
│       │   ├── page.tsx                 ← list view
│       │   └── [classroomId]/
│       │       ├── page.tsx             ← detail (3 tabs)
│       │       └── students/
│       │           └── [studentId]/
│       │               └── page.tsx     ← student drill-in
│       ├── quizzes/
│       │   ├── page.tsx                 ← list view
│       │   ├── new/
│       │   │   └── page.tsx             ← authoring (create)
│       │   └── [quizId]/
│       │       └── page.tsx             ← authoring (edit)
│       └── profile/
│           └── page.tsx
├── components/
│   ├── ui/                              ← NEW: shadcn primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   ├── table.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── tooltip.tsx
│   │   ├── popover.tsx
│   │   ├── switch.tsx
│   │   ├── slider.tsx
│   │   ├── pagination.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── form.tsx
│   │   ├── calendar.tsx
│   │   └── progress.tsx                 ← assignment completion bars
│   └── teacher/                         ← NEW: composed components
│       ├── shell/
│       │   ├── TeacherShell.tsx
│       │   ├── TeacherSidebar.tsx
│       │   └── TeacherHeader.tsx
│       ├── dashboard/
│       │   ├── WelcomeStrip.tsx
│       │   ├── MyClassroomsCard.tsx
│       │   ├── ActiveAssignmentsCard.tsx
│       │   ├── QuickActionsCard.tsx
│       │   └── StudentsNeedingSupportCard.tsx
│       ├── classroom/
│       │   ├── ClassroomTable.tsx
│       │   ├── RosterTab.tsx
│       │   ├── AssignmentsTab.tsx
│       │   ├── InsightsTab.tsx
│       │   └── AddStudentsModal.tsx
│       ├── quiz/
│       │   ├── QuizAuthoring.tsx
│       │   ├── QuestionBankSearch.tsx
│       │   └── QuizPreview.tsx
│       ├── student/
│       │   └── StudentDetailView.tsx
│       └── flows/
│           └── AssignQuizModal.tsx
├── globals.css                          ← @theme block (DESIGN.md tokens)
└── middleware.ts                        ← role-gates /teacher/* (new or extended)
```

### 2.2 Routing and middleware

All teacher URLs are `/teacher/*`. A `middleware.ts` at the project root checks the Supabase session cookie on every request matching `/teacher/(.*)`:

- No session → redirect to `/login`
- Session with `role !== 'teacher'` → redirect to `/dashboard` (student home)
- Session with `role === 'teacher'` → continue

Implementation: read role from `auth.user_metadata` (the existing source of truth — see `src/app/api/lib/types/userData.ts`) via the Supabase server client. Match config:

```ts
export const config = {
  matcher: ['/teacher/:path*'],
}
```

Middleware runs at edge; teacher pages can assume a valid teacher session and skip in-page role checks.

### 2.3 Login redirect change

The only change to existing auth code: in the post-login success handler (currently routes to `/dashboard`), add a role branch:

```ts
const target = session.user.user_metadata?.role === 'teacher'
  ? '/teacher/dashboard'
  : '/dashboard';
router.push(target);
```

Isolate as a small helper (e.g., `getPostLoginPath(session)`) so a future pivot to a separate teacher login page touches one function, not the whole login flow. (See `project_teacher-portal-login-decision.md` memory for the pivot rationale.)

### 2.4 Data flow

- Pages call `/api/protected/teacher/*` directly via `fetch` (same-origin, cookie session). No CORS gateway needed.
- Server components handle initial fetch where it's a one-shot (e.g., classroom list, dashboard composition). Client components handle interactivity (tabs, modals, search).
- No new global state library. Use:
  - Server component data for first render
  - Local React state for tabs, modal open/close, form draft
  - SWR or React Query *only* if a list needs revalidation after a mutation (e.g., assignments tab after assign-quiz). If unsure, defer; plain fetch covers most v1 needs.

### 2.5 Legacy SCSS coexistence

`src/app/layout.tsx` already imports `@/app/assets/scss/index.scss`. That continues for student pages. Teacher pages do not import any SCSS — they consume only the new Tailwind+shadcn primitives. The two styling systems coexist via CSS scope; teacher routes don't render student SCSS-styled components.

---

## 3. Theming and tokens

### 3.1 globals.css setup

Add an `@theme` block at the top of `src/app/globals.css` (or create the file if missing) with the OKLCH tokens from `DESIGN.md` section 8. Verbatim block:

```css
@theme {
  /* Brand */
  --color-brand: oklch(0.690 0.230 35);
  --color-brand-deep: oklch(0.560 0.183 36);
  --color-brand-tint: oklch(0.984 0.018 75);

  /* Secondary identity */
  --color-purple: oklch(0.590 0.220 287);
  --color-pink: oklch(0.720 0.180 1);
  --color-mint: oklch(0.740 0.130 195);
  --color-mint-tint: oklch(0.985 0.020 195);
  --color-gold: oklch(0.610 0.130 80);
  --color-yellow: oklch(0.890 0.180 95);

  /* Semantic */
  --color-success: oklch(0.700 0.220 145);
  --color-success-tint: oklch(0.960 0.060 130);
  --color-error: oklch(0.560 0.220 30);
  --color-error-loud: oklch(0.640 0.230 30);

  /* Neutrals — tinted toward brand hue (35°) */
  --color-surface-0: oklch(1 0 0);
  --color-surface-1: oklch(0.985 0.005 75);
  --color-surface-2: oklch(0.965 0.008 75);
  --color-border-subtle: oklch(0.928 0.005 75);
  --color-border-default: oklch(0.846 0.006 75);
  --color-text-strong: oklch(0.180 0.005 75);
  --color-text-default: oklch(0.420 0.005 75);
  --color-text-muted: oklch(0.620 0.005 75);

  /* Type */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-display: "Advercase", "Inter", serif;

  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;

  /* Spacing chrome — must match student portal */
  --height-header: 5rem;
  --width-nav: 15rem;
  --width-nav-collapsed: 60px;
}
```

### 3.2 shadcn semantic mapping

When initializing shadcn (`npx shadcn@latest init`), point its CSS variable mapping at our tokens:

- `--primary` → `var(--color-brand)`
- `--primary-foreground` → `oklch(1 0 0)` (white on brand orange)
- `--background` → `var(--color-surface-0)`
- `--foreground` → `var(--color-text-strong)`
- `--card` → `var(--color-surface-1)`
- `--border` → `var(--color-border-default)`
- `--radius` → `var(--radius-md)`
- `--font-sans` → already mapped

### 3.3 Tailwind config cleanup during install

In `tailwind.config.js`:
- Remove `font-poppins` from `fontFamily` (dead weight; nothing uses it).
- Inherit only 3 of the 24+ student-side animations: `card-pop`, `final-pop`, `restore-color`. Coin-jump, streak-wiggle, character-break, etc. stay student-only.

### 3.4 Brand orange canonicalization

Use `#FF5000` (= `oklch(0.690 0.230 35)`) consistently. Do NOT introduce new uses of `#f05724`. The existing `#f05724` in legacy SCSS stays where it is for the student portal — we don't touch that code.

---

## 4. Per-page implementation

### 4.1 Dashboard — `/teacher/dashboard`

**Layout:** TeacherShell (sidebar + header) + 2-column grid main area on desktop, single column on mobile.

**Components:**
- `WelcomeStrip` — fetches teacher name + classroom count + total students
- `MyClassroomsCard` — fetches teacher's classrooms
- `ActiveAssignmentsCard` — fetches active assignments across teacher's classrooms with completion data
- `QuickActionsCard` — static buttons that open `AssignQuizModal` or navigate to `/teacher/quizzes/new`
- `StudentsNeedingSupportCard` — fetches lowest-scoring students across teacher's classrooms

**API calls:**
- `GET /api/protected/teacher/classroom/list` (for classroom names + counts)
- `GET /api/protected/teacher/analytics/classroom/overview` (per classroom, parallel)
- `GET /api/protected/teacher/analytics/students/summary` (sorted ascending by avg score, limit 5)

**Empty states:**
- No classrooms → MyClassroomsCard shows "Talk to your school admin" message.
- No assignments → ActiveAssignmentsCard shows "+ Create your first quiz" CTA.
- Insufficient data → StudentsNeedingSupportCard shows "Start assigning quizzes to surface insights."

### 4.2 Classrooms list — `/teacher/classrooms`

**Layout:** Header with "+ New classroom" button, search input, table of classrooms.

**API calls:**
- `GET /api/protected/teacher/classroom/list` (with search query if provided)
- `POST /api/protected/teacher/classroom/create` on creation

**State:** local search input, debounced. Server component for first render; client component for search/filter.

### 4.3 Classroom detail — `/teacher/classrooms/[classroomId]`

**Layout:** Header (classroom name + edit/archive controls + breadcrumb) + Tabs (Roster / Assignments / Insights). Tabs are URL-state via search param `?tab=roster|assignments|insights` (default roster) — preserves deep linking.

**Tab components:**

- `RosterTab` — uses `GET /api/protected/teacher/classroom/students/list?classroom_id={id}`. Includes `+ Add students` button → opens `AddStudentsModal` (paste emails or CSV upload via `POST /api/protected/teacher/classroom/uploadStudents`, with `GET /api/protected/teacher/classroom/uploadTemplate` for the CSV template download).
- `AssignmentsTab` — uses `GET /api/protected/teacher/classroom/getQuizzes?classroom_id={id}` (or equivalent — see classroom DAO `getQuizzes` method) + `GET /api/protected/teacher/analytics/quiz/completion` for progress bars. `+ Assign quiz` opens `AssignQuizModal` pre-filled with this classroom.
- `InsightsTab` — uses `GET /api/protected/teacher/analytics/classroom/overview?classroom_id={id}`. Charts via shadcn-compatible chart lib (recharts is fine and shadcn ships chart wrappers for it).

**Edit/archive:**
- Rename → `PUT /api/protected/teacher/classroom/edit`
- Archive → soft delete via `PUT` setting `archived=true`. Hard delete via `DELETE /api/protected/teacher/classroom/delete` only from a confirm dialog.

### 4.4 Student detail — `/teacher/classrooms/[classroomId]/students/[studentId]`

**Layout:** Header (student name + summary strip) + 3 sections (Recent activity, Progress by category, Reports).

**API calls:**
- `GET /api/protected/teacher/analytics/student/scores?student_id={id}` (recent activity)
- `GET /api/protected/teacher/analytics/student/dailyReport?student_id={id}` (daily summary expand)
- `GET /api/protected/teacher/analytics/student/weeklyReport?student_id={id}` (weekly summary expand)

**Notes:** read-only in v1. No grade overrides, no messaging.

### 4.5 Quizzes list — `/teacher/quizzes`

**API:** `GET /api/protected/teacher/quiz/list`. Search/filter client-side if list is small (<200), server-side if larger.

### 4.6 Quiz authoring — `/teacher/quizzes/new` and `/teacher/quizzes/[quizId]`

**Layout:** Single-screen with three labeled sections (no wizard). Top: title/description/year/subject form. Middle: two-column question bank picker (search/filter on left, "added to this quiz" on right). Bottom: action bar (Preview / Save draft / Publish).

**State:** local React state for the working draft. Persisted on save, NOT autosaved on every keystroke (autosave creates server churn for nothing during early authoring).

**API calls:**
- New quiz: `POST /api/protected/teacher/quiz/create-rpc` (newer, preferred over the older `create`)
- Edit quiz: `PUT /api/protected/teacher/quiz/edit`
- Add/remove questions: `POST /api/protected/teacher/quiz/addQuestions`, `POST /api/protected/teacher/quiz/removeQuestions`
- Question bank search: `GET /api/protected/teacher/questions/search` (debounced)
- Categories: `GET /api/protected/teacher/questions/categories` (for filter dropdown)
- Delete: `DELETE /api/protected/teacher/quiz/delete` (confirm dialog)

**Preview:** "Preview as student would see" reuses existing student-side question rendering components (`SvgReactComponent`, `RichText`, `MathLibrary`). Does NOT reimplement them. Build-time decision on whether to import as-is or extract a shared rendering layer.

### 4.7 Profile — `/teacher/profile`

Simple form with first name, last name, teaching subject(s), email (read-only), and a "Change password" section.

**API:** Profile read/update routes for teachers do not currently exist under `/api/protected/teacher/*`. Two options at build time, decide in step 9 of build sequence:
1. Read profile data directly from the Supabase session (`auth.user_metadata`); update via `supabase.auth.updateUser({ data: { ...metadata } })`. No new endpoints needed.
2. Add `GET /api/protected/teacher/profile` and `PUT /api/protected/teacher/profile` mirroring the student equivalents.

Option 1 is simpler and uses only existing infrastructure. Default to option 1 unless build reveals friction.

Password change uses Supabase Auth directly: `supabase.auth.updateUser({ password })`.

### 4.8 Assign-quiz modal — `AssignQuizModal`

Reusable component, opened from 3 places (dashboard quick actions, classroom-detail assignments tab, dashboard active-assignments inline button). Props determine which fields are pre-filled.

**Fields:**
- Classroom picker (pre-fillable)
- Quiz picker (lists teacher's published quizzes)
- Due date (optional)
- Target score (optional)

**API:** `POST /api/protected/teacher/classroom/addQuizzes` with classroom_id + quiz_ids[] + due_date + target_score. Existing endpoint takes batched quizzes; we send a single-element array.

---

## 5. Build sequence

Implement in this order — each step is independently demoable and de-risks the next:

1. **Foundation (Day 1–2)**
   - Install Tailwind v4 + shadcn CLI, init at `src/app/components/ui/`
   - Add `@theme` block to `globals.css`
   - Configure shadcn semantic mapping
   - Drop `font-poppins`, prune animations
   - Smoke test: render a single shadcn `Button` next to a student-portal button. Confirm visual sibling.

2. **Shell (Day 3)**
   - `TeacherShell`, `TeacherSidebar`, `TeacherHeader` with avatar dropdown
   - `middleware.ts` role gating
   - Login redirect helper (`getPostLoginPath`)
   - Smoke test: log in as a (manually-created) teacher, land on a placeholder `/teacher/dashboard`, navigate the sidebar, log out.

3. **Dashboard (Day 4–5)**
   - All 5 dashboard cards
   - Empty-state copy and behavior
   - Smoke test: dashboard renders against an empty test classroom (acceptable to use the seed plan's deferred test data here, OR use one of the 3 existing teachers in school 1 if their session can be obtained).

4. **Classrooms list + detail Roster tab (Day 6–7)**
   - List page with search, "+ New classroom"
   - Classroom detail shell with tabs
   - Roster tab + AddStudentsModal (paste emails first; CSV upload second pass)

5. **Classroom Assignments tab + AssignQuizModal (Day 8–9)**
   - Modal usable from 3 entry points
   - Assignments tab with progress bars

6. **Quiz list + authoring (Day 10–13)**
   - Quizzes list page
   - Authoring page with question bank search, add/remove/reorder
   - Preview integration (deferred decision: import student-side renderers as-is or extract shared layer)

7. **Insights tab (Day 14)**
   - Class-level charts. Uses recharts via shadcn chart wrappers.

8. **Student detail page (Day 15)**
   - Read-only deep view with daily/weekly report expansion.

9. **Profile page (Day 16)**
   - Form + password change.

10. **Polish pass (Day 17–18)**
    - `/impeccable:impeccable polish` against each screen
    - Side-by-side visual review against student equivalents
    - Mobile responsive sweep
    - Empty-state copy review

11. **Test data seed (Day 19)**
    - Execute `docs/teacher-portal-seed-plan.md` (3 phases)
    - Smoke-test-with-real-data on dashboard, classroom detail, student detail.

12. **Client UAT (Day 20)**
    - Hand off to client tester(s) with credentials.

Estimate: ~3–4 weeks for one engineer. Ranges depend on shadcn theming friction and whether quiz preview reuses or rewrites student-side renderers.

---

## 6. Open implementation questions deferred to build time

These do not block client review of the flow, but need answers when implementation starts:

1. **Quiz preview rendering** — import student-side `SvgReactComponent` / `RichText` / `MathLibrary` directly, or extract them into a shared package? Direct import is faster but couples teacher portal to student SCSS bundle. Decide when reaching step 6 of build sequence.

2. **Mobile sidebar pattern** — student portal collapses to a hamburger drawer (assumed; verify during step 2 of build sequence). Match exactly.

3. **Charts library inside Insights tab** — recharts via shadcn chart wrappers is the default. Evaluate during step 7; switch to Visx or similar only if recharts hits a wall.

4. **`paying` flag relevance for teachers** — the `users.paying` field is a boolean used by the student app. Teachers have it nullable. Confirm with Pebbo product whether teacher portal access should respect a teacher-side paying flag or always allow.

5. **Subject-head behavior** — `users.is_subject_head` is true for some teachers. Does v1 give subject heads any cross-classroom view? Default: no (treated identically to regular teachers). Revisit in v1.1.

6. **Search debounce values** — student portal uses 300ms; match it for question bank search.

7. **Server-component vs client-component split per page** — listed defaults in §2.4 are guidelines. Specific pages may need to flip if data fetching needs auth headers or interactivity needs server data. Decide per page.

---

## 7. Definition of done

v1 is shippable when:

- A teacher can log in and reach `/teacher/dashboard` from the existing `/login` page.
- All 5 dashboard cards render with real or test data.
- Classrooms list works; teacher can create a new classroom.
- Classroom detail's three tabs all render; roster supports add (single + CSV); assign-quiz modal works from all 3 entry points.
- Student detail page renders read-only with recent activity, category progress, daily/weekly reports.
- Quiz list works; quiz authoring supports create, edit, delete, publish, save-draft.
- Profile renders with editable name/subject/password change.
- Middleware blocks non-teachers from `/teacher/*`.
- Visual review confirms family-resemblance with student dashboard chrome (header, sidebar, fonts, brand color).
- No regressions on student portal (quick smoke test of existing routes).

---

## 8. Out-of-scope (v1) — pinned to memory, not duplicated here

See `project_teacher-portal-direction.md` and the brainstorm transcript for explicit exclusions (no messaging, no parent accounts, no manual grade overrides, no question authoring by teachers, etc). The client-facing flow doc deliberately does not enumerate exclusions per user request; the implication is "anything not described in the flow doc is out of v1 scope."
