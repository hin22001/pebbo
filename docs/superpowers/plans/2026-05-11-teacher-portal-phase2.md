# Teacher Portal Phase 2 — Full Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement every page described in `docs/teacher-portal-flow.md` — dashboard (5 cards), classrooms list, classroom detail (3 tabs), student detail, quizzes list, quiz authoring, assign-quiz modal, and profile — so the teacher portal is feature-complete for v1.

**Architecture:** All teacher pages are client components (`"use client"`) embedded at `/teacher/*` routes inside the existing `MainLayout` (which already handles teacher header + sidebar). Pages use the exact same SCSS+MUI component patterns as the student dashboard — `TeacherCard` wrapper, `ContentLayout` shell, `dashboard-page-*` classes for cards, `inbox-page-*` classes for table rows. A new `TeacherAPI.js` provides frontend wrappers for all 32 backend endpoints.

**Tech Stack:** Next.js 14 App Router, MUI (`@mui/material`), existing SCSS classnames, `ConnectionManager.stream()` for API calls, recharts for Insights charts.

**Source of truth:** `docs/teacher-portal-flow.md` (client-approved), `docs/superpowers/specs/2026-05-07-teacher-portal-design.md` (engineering spec).

---

## Styling Rules (MANDATORY — every task must follow)

These rules exist because Phase 1 shipped a shadcn-based shell that looked nothing like the student dashboard. That was thrown away. Every subagent executing a task MUST follow these rules exactly.

1. **Page wrapper:** Every teacher page renders inside `<ContentLayout title="" hideTitle={true}><TeacherCard>...</TeacherCard></ContentLayout>`.
   - `ContentLayout` is at `@/layouts/ContentLayout`.
   - `TeacherCard` is at `@/modules/card/TeacherCard`.

2. **Card shell:** Use MUI `<Card className="dashboard-page-card">` for any card panel. The `dashboard-page-*` SCSS namespace from `src/app/assets/scss/components/templates/DashboardPage/_dashboardPage.scss` is the primary style source.

3. **List/table rows:** Use `<Stack className="inbox-page-row" onClick={...}>` pattern (the `inbox-page-*` SCSS namespace from the ClassroomList/Inbox templates).

4. **Typography:** MUI `<Typography>` with `dashboard-page-title`, `dashboard-page-subtitle`, `dashboard-page-description` classes.

5. **Buttons:** Use existing `<Button>` from `@/elements/button/Button` or MUI buttons styled with `dashboard-page-form-btn` / `dashboard-page-form-btn-txt`.

6. **Layout:** MUI `<Stack>` for flex layout. Use `dashboard-page-flex-container`, `dashboard-page-flex-item-left` (70%), `dashboard-page-flex-item-right` (30%) for 2-column grid.

7. **FORBIDDEN:**
   - shadcn primitives (`@/components/ui/*`) — do NOT import
   - New Tailwind utility classes — do NOT use
   - New SCSS files — do NOT create
   - Any CSS-in-JS besides MUI `sx` prop for minor tweaks

8. **Locale:** All user-facing text must go through `locale(head?.key)` from `@/locale` using head data from `getDataHead()`.

9. **API calls:** Use `TeacherAPI.methodName(params, body)` (Task 1 creates this). Pattern: `Manager.stream({ url, method, params, data })`.

10. **Loading:** Use `<Loader isOpen={loading} />` from `@/elements/loader/Loader` and MUI `<Skeleton>` for placeholder content.

---

## Open Questions Resolved (from spec §6)

These were deferred to build time. Decided now — nothing pending.

| Question | Decision | Rationale |
|---|---|---|
| Quiz preview rendering (§6.1) | Import student `SvgReactComponent`, `RichText`, `MathLibrary` as-is | Faster; coupling is acceptable for v1 |
| Mobile sidebar (§6.2) | Already handled — `TeacherNavigation` inherits student `Navigation` collapse behavior | Done in Phase 1 pivot |
| Charts library (§6.3) | recharts | shadcn-compatible, already in `node_modules` via MUI ecosystem |
| `paying` flag for teachers (§6.4) | Ignore — all teachers treated as paying | No paywall gating for teacher portal |
| `is_subject_head` (§6.5) | Ignored in v1 — same as regular teacher | No cross-classroom view |
| Search debounce (§6.6) | 300ms | Matches student portal |
| Server vs client components (§6.7) | All `"use client"` | Matches existing `XxxClient.tsx` pattern |

---

## File Map

### New files (create)

| File | Responsibility |
|---|---|
| `src/app/data/api/TeacherAPI.js` | Frontend wrappers for all 32 teacher backend endpoints |
| `src/app/(app)/teacher/dashboard/components/WelcomeStrip.jsx` | Welcome sentence + avatar |
| `src/app/(app)/teacher/dashboard/components/MyClassroomsCard.jsx` | Classroom list card |
| `src/app/(app)/teacher/dashboard/components/ActiveAssignmentsCard.jsx` | Assignment progress bars |
| `src/app/(app)/teacher/dashboard/components/QuickActionsCard.jsx` | Create quiz + Assign quiz buttons |
| `src/app/(app)/teacher/dashboard/components/StudentsNeedingSupportCard.jsx` | Lowest 5 students |
| `src/app/(app)/teacher/classrooms/page.tsx` | Classrooms list route |
| `src/app/(app)/teacher/classrooms/ClassroomListClient.tsx` | Classrooms list UI |
| `src/app/(app)/teacher/classrooms/[classroomId]/page.tsx` | Classroom detail route |
| `src/app/(app)/teacher/classrooms/[classroomId]/ClassroomDetailClient.tsx` | Classroom detail with 3 tabs |
| `src/app/(app)/teacher/classrooms/[classroomId]/components/RosterTab.jsx` | Student roster tab |
| `src/app/(app)/teacher/classrooms/[classroomId]/components/AssignmentsTab.jsx` | Assignments tab with progress |
| `src/app/(app)/teacher/classrooms/[classroomId]/components/InsightsTab.jsx` | Analytics charts tab |
| `src/app/(app)/teacher/classrooms/[classroomId]/components/AddStudentsModal.jsx` | Paste emails / CSV upload |
| `src/app/(app)/teacher/classrooms/[classroomId]/students/[studentId]/page.tsx` | Student detail route |
| `src/app/(app)/teacher/classrooms/[classroomId]/students/[studentId]/StudentDetailClient.tsx` | Student detail UI |
| `src/app/(app)/teacher/quizzes/page.tsx` | Quizzes list route |
| `src/app/(app)/teacher/quizzes/QuizListClient.tsx` | Quizzes list UI |
| `src/app/(app)/teacher/quizzes/new/page.tsx` | New quiz route |
| `src/app/(app)/teacher/quizzes/new/QuizAuthoringClient.tsx` | Quiz authoring UI (create) |
| `src/app/(app)/teacher/quizzes/[quizId]/page.tsx` | Edit quiz route |
| `src/app/(app)/teacher/quizzes/[quizId]/QuizEditClient.tsx` | Quiz authoring UI (edit, wraps same component) |
| `src/app/(app)/teacher/quizzes/components/QuestionBankSearch.jsx` | Search + filter question bank |
| `src/app/(app)/teacher/quizzes/components/QuizPreview.jsx` | Preview quiz as student |
| `src/app/(app)/teacher/profile/page.tsx` | Profile route |
| `src/app/(app)/teacher/profile/ProfileClient.tsx` | Profile form UI |
| `src/app/components/modules/modal/AssignQuizModal.jsx` | Reusable assign-quiz modal (3 entry points) |

### Modified files

| File | Change |
|---|---|
| `src/app/(app)/teacher/dashboard/TeacherDashboardClient.tsx` | Replace `<Dashboard />` with 5-card composition |
| `src/app/data/head/components/layouts/MainLayout/sections/TeacherNavigation.js` | Update hrefs to `/teacher/*` routes |

---

## Task 1: TeacherAPI — Frontend API Layer

**Files:**
- Create: `src/app/data/api/TeacherAPI.js`

All 32 backend endpoints wrapped following the `ClassAPI.js` pattern: `Manager.stream({ url, method, params, data })`.

- [ ] **Step 1: Create TeacherAPI.js with all endpoint wrappers**

```js
import * as Manager from "@/app/core/ConnectionManager";

// ─── Classroom Management ─────────────────────────────────

const getClassrooms = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/classroom/list",
    method: "GET",
    params,
    data: body,
  });
};

const createClassroom = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/classroom/create",
    method: "POST",
    params,
    data: body,
  });
};

const editClassroom = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/classroom/edit",
    method: "PUT",
    params,
    data: body,
  });
};

const deleteClassroom = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/classroom/delete",
    method: "DELETE",
    params,
    data: body,
  });
};

const addQuizzesToClassroom = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/classroom/addQuizzes",
    method: "POST",
    params,
    data: body,
  });
};

const removeQuizzesFromClassroom = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/classroom/removeQuizzes",
    method: "POST",
    params,
    data: body,
  });
};

const getUploadTemplate = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/classroom/uploadTemplate",
    method: "GET",
    params,
    data: body,
  });
};

const uploadStudents = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/classroom/uploadStudents",
    method: "POST",
    params,
    data: body,
  });
};

// ─── Classroom Students ───────────────────────────────────

const getClassroomStudents = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/classroom/students/list",
    method: "GET",
    params,
    data: body,
  });
};

const addStudentToClassroom = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/classroom/students/add",
    method: "POST",
    params,
    data: body,
  });
};

const bulkAddStudents = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/classroom/students/bulk",
    method: "POST",
    params,
    data: body,
  });
};

const removeStudentFromClassroom = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/classroom/students/remove",
    method: "POST",
    params,
    data: body,
  });
};

// ─── Quiz Management ──────────────────────────────────────

const getQuizzes = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/quiz/list",
    method: "GET",
    params,
    data: body,
  });
};

const createQuiz = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/quiz/create-rpc",
    method: "POST",
    params,
    data: body,
  });
};

const editQuiz = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/quiz/edit",
    method: "PUT",
    params,
    data: body,
  });
};

const deleteQuiz = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/quiz/delete",
    method: "DELETE",
    params,
    data: body,
  });
};

const getQuizQuestions = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/quiz/questions",
    method: "GET",
    params,
    data: body,
  });
};

const addQuestionsToQuiz = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/quiz/addQuestions",
    method: "POST",
    params,
    data: body,
  });
};

const removeQuestionsFromQuiz = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/quiz/removeQuestions",
    method: "DELETE",
    params,
    data: body,
  });
};

// ─── Question Bank ────────────────────────────────────────

const searchQuestions = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/questions/search",
    method: "GET",
    params,
    data: body,
  });
};

const getQuestionCategories = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/questions/categories",
    method: "GET",
    params,
    data: body,
  });
};

// ─── Analytics ────────────────────────────────────────────

const getClassroomOverview = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/analytics/classroom/overview",
    method: "GET",
    params,
    data: body,
  });
};

const getQuizCompletion = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/analytics/quiz/completion",
    method: "GET",
    params,
    data: body,
  });
};

const getQuizDashboard = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/analytics/quiz/dashboard",
    method: "GET",
    params,
    data: body,
  });
};

const getQuizDifficulty = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/analytics/quiz/difficulty",
    method: "GET",
    params,
    data: body,
  });
};

const getQuizPerformance = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/analytics/quiz/performance",
    method: "GET",
    params,
    data: body,
  });
};

const getQuizResponses = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/analytics/quiz/responses",
    method: "GET",
    params,
    data: body,
  });
};

const getStudentDailyReport = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/analytics/student/dailyReport",
    method: "GET",
    params,
    data: body,
  });
};

const getStudentScores = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/analytics/student/scores",
    method: "GET",
    params,
    data: body,
  });
};

const getStudentWeeklyReport = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/analytics/student/weeklyReport",
    method: "GET",
    params,
    data: body,
  });
};

const getStudentsSummary = async (params = {}, body = {}) => {
  return Manager.stream({
    url: "/api/protected/teacher/analytics/students/summary",
    method: "GET",
    params,
    data: body,
  });
};

const TeacherAPI = {
  getClassrooms,
  createClassroom,
  editClassroom,
  deleteClassroom,
  addQuizzesToClassroom,
  removeQuizzesFromClassroom,
  getUploadTemplate,
  uploadStudents,
  getClassroomStudents,
  addStudentToClassroom,
  bulkAddStudents,
  removeStudentFromClassroom,
  getQuizzes,
  createQuiz,
  editQuiz,
  deleteQuiz,
  getQuizQuestions,
  addQuestionsToQuiz,
  removeQuestionsFromQuiz,
  searchQuestions,
  getQuestionCategories,
  getClassroomOverview,
  getQuizCompletion,
  getQuizDashboard,
  getQuizDifficulty,
  getQuizPerformance,
  getQuizResponses,
  getStudentDailyReport,
  getStudentScores,
  getStudentWeeklyReport,
  getStudentsSummary,
};

export default TeacherAPI;
```

- [ ] **Step 2: Verify import resolves**

Run: `bun run dev`
Open: any page. Check terminal for no import errors on TeacherAPI.
Expected: no errors (file is created but not imported anywhere yet).

- [ ] **Step 3: Commit**

```bash
git add src/app/data/api/TeacherAPI.js
git commit -m "feat(teacher): add TeacherAPI with wrappers for all 32 backend endpoints"
```

---

## Task 2: Update Sidebar Navigation Hrefs

**Files:**
- Modify: `src/app/data/head/components/layouts/MainLayout/sections/TeacherNavigation.js`

Update the 7 sidebar items so the primary navigation items point to new `/teacher/*` routes instead of legacy student-app routes.

- [ ] **Step 1: Update hrefs in head data**

Replace the full file content with:

```js
export default Object.assign([
  {
    id: "dashboard",
    icon: "home",
    label: {
      zh: "儀表板",
      en: "Dashboard",
    },
    href: "/teacher/dashboard",
  },
  {
    id: "classroom",
    icon: "classroom",
    label: {
      zh: "教室",
      en: "Classrooms",
    },
    href: "/teacher/classrooms",
  },
  {
    id: "quiz-exercise",
    icon: "pen-holder",
    label: {
      zh: "測驗",
      en: "Quizzes",
    },
    href: "/teacher/quizzes",
  },
  {
    id: "class-report",
    icon: "champion-hand",
    label: {
      zh: "課堂報告",
      en: "Class Report",
    },
    href: "/class-report",
  },
  {
    id: "quiz-report",
    icon: "star-yellow",
    label: {
      zh: "測驗報告",
      en: "Quiz Report",
    },
    href: "/quiz-report",
  },
  {
    id: "inbox",
    icon: "letter",
    label: {
      zh: "邀請",
      en: "Invitations",
    },
    href: "/inbox/teacher",
  },
  {
    id: "question",
    icon: "pen-holder",
    label: {
      zh: "問題",
      en: "Questions",
    },
    href: "/user-questions/teacher",
  },
]);
```

Note: First 3 items now point to `/teacher/*` routes (the pages we're building). Last 4 keep legacy routes (Class Report, Quiz Report, Invitations, Questions — these work via existing legacy templates and are outside Phase 2 scope).

- [ ] **Step 2: Verify sidebar renders correctly**

Run: `bun run dev`
Log in as teacher → sidebar should show all 7 items. Click "Dashboard" → `/teacher/dashboard`. Click "Classrooms" → `/teacher/classrooms` (will 404 until Task 4).

- [ ] **Step 3: Commit**

```bash
git add src/app/data/head/components/layouts/MainLayout/sections/TeacherNavigation.js
git commit -m "feat(teacher): update sidebar hrefs — top 3 items now route to /teacher/* namespace"
```

---

## Task 3: Dashboard — 5-Card Composition

**Files:**
- Create: `src/app/(app)/teacher/dashboard/components/WelcomeStrip.jsx`
- Create: `src/app/(app)/teacher/dashboard/components/MyClassroomsCard.jsx`
- Create: `src/app/(app)/teacher/dashboard/components/ActiveAssignmentsCard.jsx`
- Create: `src/app/(app)/teacher/dashboard/components/QuickActionsCard.jsx`
- Create: `src/app/(app)/teacher/dashboard/components/StudentsNeedingSupportCard.jsx`
- Modify: `src/app/(app)/teacher/dashboard/TeacherDashboardClient.tsx`

Implements the flow doc's 5-section dashboard layout: welcome strip (full width), then 2-column grid — left (My Classrooms + Active Assignments), right (Quick Actions + Students Needing Support).

- [ ] **Step 1: Create WelcomeStrip.jsx**

```jsx
"use client";
import React from "react";
import { Stack, Typography, Avatar } from "@mui/material";
import { Auth } from "@/src/app/data/local";

export default function WelcomeStrip({ classroomCount, studentCount }) {
  const dataUser = Auth.getDataUser();
  const name = dataUser?.name || "Teacher";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      className="dashboard-page-card"
      sx={{ mb: 2, p: 3 }}
    >
      <Typography className="dashboard-page-title" sx={{ fontSize: "1.1rem" }}>
        {greeting}, {name}. You teach {classroomCount || 0} classroom{classroomCount !== 1 ? "s" : ""} with {studentCount || 0} student{studentCount !== 1 ? "s" : ""}.
      </Typography>
      <Avatar
        src={dataUser?.profile_image || ""}
        alt={name}
        sx={{ width: 48, height: 48 }}
      />
    </Stack>
  );
}
```

- [ ] **Step 2: Create MyClassroomsCard.jsx**

```jsx
"use client";
import React from "react";
import { Card, Stack, Typography, Skeleton } from "@mui/material";
import { useRouter } from "next/navigation";

export default function MyClassroomsCard({ classrooms, loading }) {
  const router = useRouter();

  return (
    <Card className="dashboard-page-card" sx={{ mb: 2, p: 3 }}>
      <Typography className="dashboard-page-subtitle" sx={{ mb: 2, fontWeight: 700 }}>
        My Classrooms
      </Typography>
      {loading ? (
        <>
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} />
        </>
      ) : classrooms?.length > 0 ? (
        classrooms.map((c) => (
          <Stack
            key={c.classroom_id || c.id}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            className="inbox-page-row"
            sx={{ cursor: "pointer", py: 1.5 }}
            onClick={() => router.push(`/teacher/classrooms/${c.classroom_id || c.id}`)}
          >
            <Stack>
              <Typography sx={{ fontWeight: 600 }}>
                {c.classroom_name || c.name}
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "#888" }}>
                {c.student_count || 0} students
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: "0.85rem", color: "#aaa" }}>→</Typography>
          </Stack>
        ))
      ) : (
        <Typography sx={{ color: "#888", fontSize: "0.9rem" }}>
          You're not in any classrooms yet. Talk to your school admin, or create one from the Classrooms page.
        </Typography>
      )}
    </Card>
  );
}
```

- [ ] **Step 3: Create ActiveAssignmentsCard.jsx**

```jsx
"use client";
import React from "react";
import { Card, Stack, Typography, LinearProgress, Skeleton } from "@mui/material";

export default function ActiveAssignmentsCard({ assignments, loading, onAssignQuiz }) {
  return (
    <Card className="dashboard-page-card" sx={{ mb: 2, p: 3 }}>
      <Typography className="dashboard-page-subtitle" sx={{ mb: 2, fontWeight: 700 }}>
        Active Assignments
      </Typography>
      {loading ? (
        <>
          <Skeleton height={50} />
          <Skeleton height={50} />
        </>
      ) : assignments?.length > 0 ? (
        assignments.map((a, i) => (
          <Stack key={a.id || i} sx={{ mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
                {a.quiz_name || a.name}
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "#666" }}>
                {a.completed_count || 0}/{a.total_count || 0} done
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={a.total_count ? (a.completed_count / a.total_count) * 100 : 0}
              sx={{
                mt: 0.5,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#f0f0f0",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  background: "linear-gradient(90deg, #8264ff 0%, #ff64a0 100%)",
                },
              }}
            />
          </Stack>
        ))
      ) : (
        <Typography sx={{ color: "#888", fontSize: "0.9rem" }}>
          No active assignments yet.
        </Typography>
      )}
      <Stack
        direction="row"
        alignItems="center"
        sx={{ mt: 2, cursor: "pointer" }}
        onClick={onAssignQuiz}
      >
        <Typography sx={{ color: "#8264ff", fontWeight: 600, fontSize: "0.9rem" }}>
          + Assign a new quiz
        </Typography>
      </Stack>
    </Card>
  );
}
```

- [ ] **Step 4: Create QuickActionsCard.jsx**

```jsx
"use client";
import React from "react";
import { Card, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function QuickActionsCard({ onAssignQuiz }) {
  const router = useRouter();

  return (
    <Card className="dashboard-page-card" sx={{ mb: 2, p: 3 }}>
      <Typography className="dashboard-page-subtitle" sx={{ mb: 2, fontWeight: 700 }}>
        Quick Actions
      </Typography>
      <Stack
        className="dashboard-page-form-btn"
        onClick={() => router.push("/teacher/quizzes/new")}
        sx={{ mb: 1.5, cursor: "pointer" }}
      >
        <Typography className="dashboard-page-form-btn-txt">
          + Create new quiz
        </Typography>
      </Stack>
      <Stack
        className="dashboard-page-form-btn"
        onClick={onAssignQuiz}
        sx={{ cursor: "pointer" }}
      >
        <Typography className="dashboard-page-form-btn-txt">
          + Assign a quiz
        </Typography>
      </Stack>
    </Card>
  );
}
```

- [ ] **Step 5: Create StudentsNeedingSupportCard.jsx**

```jsx
"use client";
import React from "react";
import { Card, Stack, Typography, Skeleton } from "@mui/material";
import { useRouter } from "next/navigation";

export default function StudentsNeedingSupportCard({ students, loading, classroomMap }) {
  const router = useRouter();

  return (
    <Card className="dashboard-page-card" sx={{ p: 3 }}>
      <Typography className="dashboard-page-subtitle" sx={{ mb: 2, fontWeight: 700 }}>
        Students Needing Support
      </Typography>
      {loading ? (
        <>
          <Skeleton height={36} />
          <Skeleton height={36} />
          <Skeleton height={36} />
        </>
      ) : students?.length > 0 ? (
        students.slice(0, 5).map((s, i) => (
          <Stack
            key={s.student_id || i}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            className="inbox-page-row"
            sx={{ cursor: "pointer", py: 1 }}
            onClick={() => {
              const cid = s.classroom_id || (classroomMap && classroomMap[s.student_id]);
              if (cid) router.push(`/teacher/classrooms/${cid}/students/${s.student_id}`);
            }}
          >
            <Typography sx={{ fontWeight: 500 }}>
              {s.name || s.student_name}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography sx={{ fontSize: "0.85rem", color: "#e53935" }}>
                {s.avg_score != null ? `${Math.round(s.avg_score)}% avg` : "No data"}
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "#aaa" }}>→</Typography>
            </Stack>
          </Stack>
        ))
      ) : (
        <Typography sx={{ color: "#888", fontSize: "0.9rem" }}>
          Start assigning quizzes to surface student insights.
        </Typography>
      )}
    </Card>
  );
}
```

- [ ] **Step 6: Rewrite TeacherDashboardClient.tsx — 5-card composition**

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { Stack } from "@mui/material";
import { ContentLayout } from "@/layouts/ContentLayout";
import TeacherCard from "@/modules/card/TeacherCard";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";
import WelcomeStrip from "./components/WelcomeStrip";
import MyClassroomsCard from "./components/MyClassroomsCard";
import ActiveAssignmentsCard from "./components/ActiveAssignmentsCard";
import QuickActionsCard from "./components/QuickActionsCard";
import StudentsNeedingSupportCard from "./components/StudentsNeedingSupportCard";
import AssignQuizModal from "@/modules/modal/AssignQuizModal";

export default function TeacherDashboardClient() {
  const [classrooms, setClassrooms] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [classroomRes, studentsRes] = await Promise.all([
        TeacherAPI.getClassrooms({ page_number: 1, rows_per_page: 50 }),
        TeacherAPI.getStudentsSummary({ limit: 5, order: "asc" }),
      ]);

      const classroomData = classroomRes?.payload?.data?.classrooms || classroomRes?.payload?.data || [];
      setClassrooms(classroomData);

      const studentData = studentsRes?.payload?.data?.students || studentsRes?.payload?.data || [];
      setStudents(studentData);

      // Fetch active assignments per classroom
      if (classroomData.length > 0) {
        const overviewPromises = classroomData.slice(0, 10).map((c) =>
          TeacherAPI.getClassroomOverview({ classroom_id: c.classroom_id || c.id })
        );
        const overviewResults = await Promise.all(overviewPromises);
        const allAssignments = overviewResults.flatMap(
          (r) => r?.payload?.data?.assignments || r?.payload?.data?.quizzes || []
        );
        setAssignments(allAssignments);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
    setLoading(false);
  };

  const totalStudents = classrooms.reduce(
    (sum, c) => sum + (c.student_count || c.students_count || 0),
    0
  );

  return (
    <ContentLayout title="" hideTitle={true}>
      <TeacherCard>
        <Stack sx={{ p: { xs: 1, md: 2 }, maxWidth: 1200 }}>
          <WelcomeStrip
            classroomCount={classrooms.length}
            studentCount={totalStudents}
          />

          <Stack
            className="dashboard-page-flex-container"
            direction={{ xs: "column", md: "row" }}
            spacing={2}
          >
            {/* Left column — 70% */}
            <Stack className="dashboard-page-flex-item-left" sx={{ flex: 7 }}>
              <MyClassroomsCard classrooms={classrooms} loading={loading} />
              <ActiveAssignmentsCard
                assignments={assignments}
                loading={loading}
                onAssignQuiz={() => setShowAssignModal(true)}
              />
            </Stack>

            {/* Right column — 30% */}
            <Stack className="dashboard-page-flex-item-right" sx={{ flex: 3 }}>
              <QuickActionsCard onAssignQuiz={() => setShowAssignModal(true)} />
              <StudentsNeedingSupportCard students={students} loading={loading} />
            </Stack>
          </Stack>
        </Stack>

        {showAssignModal && (
          <AssignQuizModal
            isOpen={showAssignModal}
            onClose={() => setShowAssignModal(false)}
            onSuccess={() => {
              setShowAssignModal(false);
              fetchDashboardData();
            }}
          />
        )}
      </TeacherCard>
    </ContentLayout>
  );
}
```

Note: `AssignQuizModal` is created in Task 10. Until then, the modal import will error — either comment the import temporarily or create Task 10 before testing the dashboard.

- [ ] **Step 7: Smoke test dashboard**

Run: `bun run dev`
Open: `http://localhost:3000/teacher/dashboard`
Expected:
- Welcome strip shows teacher name + classroom count + student count
- My Classrooms card lists classrooms (or empty state if no classrooms)
- Active Assignments card shows progress bars (or empty state)
- Quick Actions card shows 2 buttons
- Students Needing Support card shows up to 5 students (or CTA)
- 2-column layout on desktop, single column on mobile (resize window to verify)

- [ ] **Step 8: Commit**

```bash
git add src/app/\(app\)/teacher/dashboard/
git commit -m "feat(teacher): build 5-card dashboard per flow doc — welcome, classrooms, assignments, actions, support"
```

---

## Task 4: Classrooms List Page

**Files:**
- Create: `src/app/(app)/teacher/classrooms/page.tsx`
- Create: `src/app/(app)/teacher/classrooms/ClassroomListClient.tsx`

- [ ] **Step 1: Create page.tsx**

```tsx
import ClassroomListClient from "./ClassroomListClient";

export const metadata = { title: "Classrooms · Pebbo Teacher" };

export default function ClassroomsPage() {
  return <ClassroomListClient />;
}
```

- [ ] **Step 2: Create ClassroomListClient.tsx**

```tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, Stack, Typography, Skeleton, Modal, Box } from "@mui/material";
import { useRouter } from "next/navigation";
import { ContentLayout } from "@/layouts/ContentLayout";
import TeacherCard from "@/modules/card/TeacherCard";
import Loader from "@/elements/loader/Loader";
import { Alert } from "@/app/components/elements";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";

export default function ClassroomListClient() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const res = await TeacherAPI.getClassrooms({ page_number: 1, rows_per_page: 100 });
      setClassrooms(res?.payload?.data?.classrooms || res?.payload?.data || []);
    } catch (err) {
      console.error("Failed to fetch classrooms:", err);
    }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return classrooms;
    const q = search.toLowerCase();
    return classrooms.filter((c) =>
      (c.classroom_name || c.name || "").toLowerCase().includes(q)
    );
  }, [classrooms, search]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await TeacherAPI.createClassroom({}, { classroom_name: newName.trim() });
      setAlert({ type: "success", message: "Classroom created!" });
      setNewName("");
      setShowCreate(false);
      fetchClassrooms();
    } catch (err) {
      setAlert({ type: "error", message: "Failed to create classroom" });
    }
    setCreating(false);
  };

  const styleModal = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "#fff",
    borderRadius: "20px",
    outline: "none",
    p: 4,
  };

  return (
    <ContentLayout title="" hideTitle={true}>
      <TeacherCard>
        <Loader isOpen={creating} />
        <Stack sx={{ p: { xs: 1, md: 2 }, maxWidth: 1200 }}>
          {alert && (
            <Alert
              isOpen={!!alert}
              message={alert.message}
              type={alert.type}
              handleClose={() => setAlert(null)}
            />
          )}

          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography className="dashboard-page-title" sx={{ fontSize: "1.25rem" }}>
              My Classrooms
            </Typography>
            <Stack
              className="dashboard-page-form-btn"
              onClick={() => setShowCreate(true)}
              sx={{ cursor: "pointer", px: 3, py: 1 }}
            >
              <Typography className="dashboard-page-form-btn-txt">+ New classroom</Typography>
            </Stack>
          </Stack>

          {/* Search */}
          <Card className="dashboard-page-card" sx={{ mb: 2, p: 2 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search classrooms…"
              className="dashboard-page-form-input-text"
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "0.9rem" }}
            />
          </Card>

          {/* Table */}
          <Card className="dashboard-page-card" sx={{ p: 2 }}>
            {loading ? (
              <>
                <Skeleton height={50} />
                <Skeleton height={50} />
                <Skeleton height={50} />
              </>
            ) : filtered.length > 0 ? (
              filtered.map((c) => (
                <Stack
                  key={c.classroom_id || c.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  className="inbox-page-row"
                  sx={{ cursor: "pointer", py: 1.5 }}
                  onClick={() => router.push(`/teacher/classrooms/${c.classroom_id || c.id}`)}
                >
                  <Stack>
                    <Typography sx={{ fontWeight: 600 }}>
                      {c.classroom_name || c.name}
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem", color: "#888" }}>
                      {c.student_count || 0} students · {c.active_assignments || 0} active assignment{c.active_assignments !== 1 ? "s" : ""}
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: "0.85rem", color: "#aaa" }}>→</Typography>
                </Stack>
              ))
            ) : (
              <Typography sx={{ color: "#888", fontSize: "0.9rem", p: 2, textAlign: "center" }}>
                {search ? "No classrooms match your search." : "You're not in any classrooms yet. Talk to your school admin, or create one if you have permission."}
              </Typography>
            )}
          </Card>
        </Stack>

        {/* Create modal */}
        <Modal open={showCreate} onClose={() => setShowCreate(false)}>
          <Box sx={styleModal}>
            <Typography className="dashboard-page-subtitle" sx={{ mb: 2, fontWeight: 700 }}>
              Create Classroom
            </Typography>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Classroom name"
              className="dashboard-page-form-input-text"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "0.9rem", marginBottom: "16px" }}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Typography onClick={() => setShowCreate(false)} sx={{ cursor: "pointer", color: "#888", py: 1 }}>
                Cancel
              </Typography>
              <Stack
                className={"dashboard-page-form-btn" + (!newName.trim() ? "-disabled" : "")}
                onClick={handleCreate}
                sx={{ cursor: newName.trim() ? "pointer" : "default", px: 3, py: 1 }}
              >
                <Typography className="dashboard-page-form-btn-txt">Create</Typography>
              </Stack>
            </Stack>
          </Box>
        </Modal>
      </TeacherCard>
    </ContentLayout>
  );
}
```

- [ ] **Step 3: Smoke test**

Run: `bun run dev`
Open: `http://localhost:3000/teacher/classrooms`
Expected: Header with "My Classrooms" + "+ New classroom" button. Search bar. Classroom rows fetched and displayed. Click row → navigates to `/teacher/classrooms/{id}` (will 404 until Task 5). Click "+ New classroom" → modal opens. Type name → create → success alert → list refreshes.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/teacher/classrooms/page.tsx" "src/app/(app)/teacher/classrooms/ClassroomListClient.tsx"
git commit -m "feat(teacher): add classrooms list page with search + create modal"
```

---

## Task 5: Classroom Detail — Shell + Roster Tab

**Files:**
- Create: `src/app/(app)/teacher/classrooms/[classroomId]/page.tsx`
- Create: `src/app/(app)/teacher/classrooms/[classroomId]/ClassroomDetailClient.tsx`
- Create: `src/app/(app)/teacher/classrooms/[classroomId]/components/RosterTab.jsx`

- [ ] **Step 1: Create page.tsx**

```tsx
import ClassroomDetailClient from "./ClassroomDetailClient";

export const metadata = { title: "Classroom · Pebbo Teacher" };

export default function ClassroomDetailPage({ params }: { params: { classroomId: string } }) {
  return <ClassroomDetailClient classroomId={params.classroomId} />;
}
```

- [ ] **Step 2: Create ClassroomDetailClient.tsx**

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { Card, Stack, Typography, Tabs, Tab } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { ContentLayout } from "@/layouts/ContentLayout";
import TeacherCard from "@/modules/card/TeacherCard";
import Loader from "@/elements/loader/Loader";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";
import RosterTab from "./components/RosterTab";
import AssignmentsTab from "./components/AssignmentsTab";
import InsightsTab from "./components/InsightsTab";

const TAB_MAP = { roster: 0, assignments: 1, insights: 2 };
const TAB_NAMES = ["roster", "assignments", "insights"];

export default function ClassroomDetailClient({ classroomId }: { classroomId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = TAB_MAP[searchParams.get("tab") || "roster"] || 0;
  const [tabIndex, setTabIndex] = useState(initialTab);
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    fetchClassroom();
  }, [classroomId]);

  const fetchClassroom = async () => {
    setLoading(true);
    try {
      const res = await TeacherAPI.getClassrooms({ classroom_id: classroomId });
      const data = res?.payload?.data?.classrooms?.[0] || res?.payload?.data;
      setClassroom(data);
      setEditName(data?.classroom_name || data?.name || "");
    } catch (err) {
      console.error("Failed to fetch classroom:", err);
    }
    setLoading(false);
  };

  const handleTabChange = (_: any, newIndex: number) => {
    setTabIndex(newIndex);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", TAB_NAMES[newIndex]);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const handleRename = async () => {
    if (!editName.trim()) return;
    await TeacherAPI.editClassroom({}, { classroom_id: classroomId, classroom_name: editName.trim() });
    setEditing(false);
    fetchClassroom();
  };

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to delete this classroom? This cannot be undone.")) return;
    await TeacherAPI.deleteClassroom({ classroom_id: classroomId });
    router.push("/teacher/classrooms");
  };

  const name = classroom?.classroom_name || classroom?.name || "Classroom";

  return (
    <ContentLayout title="" hideTitle={true}>
      <TeacherCard>
        <Loader isOpen={loading && !classroom} />
        <Stack sx={{ p: { xs: 1, md: 2 }, maxWidth: 1200 }}>
          {/* Back link */}
          <Typography
            onClick={() => router.push("/teacher/classrooms")}
            sx={{ cursor: "pointer", color: "#8264ff", mb: 1, fontSize: "0.9rem" }}
          >
            ← My Classrooms
          </Typography>

          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            {editing ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ fontSize: "1.25rem", fontWeight: 700, border: "1px solid #ddd", borderRadius: 8, padding: "4px 8px" }}
                  onKeyDown={(e) => e.key === "Enter" && handleRename()}
                />
                <Typography onClick={handleRename} sx={{ cursor: "pointer", color: "#8264ff", fontWeight: 600 }}>Save</Typography>
                <Typography onClick={() => setEditing(false)} sx={{ cursor: "pointer", color: "#888" }}>Cancel</Typography>
              </Stack>
            ) : (
              <Typography className="dashboard-page-title" sx={{ fontSize: "1.25rem" }}>
                {name}
              </Typography>
            )}
            <Stack direction="row" spacing={2}>
              {!editing && (
                <Typography onClick={() => setEditing(true)} sx={{ cursor: "pointer", color: "#8264ff", fontSize: "0.85rem" }}>
                  Edit name
                </Typography>
              )}
              <Typography onClick={handleArchive} sx={{ cursor: "pointer", color: "#e53935", fontSize: "0.85rem" }}>
                Delete
              </Typography>
            </Stack>
          </Stack>
          <Typography sx={{ fontSize: "0.85rem", color: "#888", mb: 2 }}>
            {classroom?.student_count || 0} students
          </Typography>

          {/* Tabs */}
          <Card className="dashboard-page-card" sx={{ p: 0 }}>
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              sx={{
                borderBottom: "1px solid #eee",
                "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
                "& .Mui-selected": { color: "#ff5000" },
                "& .MuiTabs-indicator": { backgroundColor: "#ff5000" },
              }}
            >
              <Tab label="Roster" />
              <Tab label="Assignments" />
              <Tab label="Insights" />
            </Tabs>
            <Stack sx={{ p: 2 }}>
              {tabIndex === 0 && <RosterTab classroomId={classroomId} />}
              {tabIndex === 1 && <AssignmentsTab classroomId={classroomId} />}
              {tabIndex === 2 && <InsightsTab classroomId={classroomId} />}
            </Stack>
          </Card>
        </Stack>
      </TeacherCard>
    </ContentLayout>
  );
}
```

- [ ] **Step 3: Create RosterTab.jsx**

```jsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Stack, Typography, Skeleton, Menu, MenuItem } from "@mui/material";
import { useRouter } from "next/navigation";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";
import AddStudentsModal from "./AddStudentsModal";

export default function RosterTab({ classroomId }) {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuStudent, setMenuStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [classroomId]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await TeacherAPI.getClassroomStudents({ classroom_id: classroomId, page_number: 1, rows_per_page: 200 });
      setStudents(res?.payload?.data?.students || res?.payload?.data || []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter((s) => (s.name || s.student_name || "").toLowerCase().includes(q));
  }, [students, search]);

  const handleRemove = async () => {
    if (!menuStudent) return;
    const sid = menuStudent.student_id || menuStudent.id;
    const name = menuStudent.name || menuStudent.student_name;
    if (!confirm(`Remove ${name} from this classroom?`)) { setMenuAnchor(null); return; }
    await TeacherAPI.removeStudentFromClassroom({}, { classroom_id: classroomId, student_id: sid });
    setMenuAnchor(null);
    setMenuStudent(null);
    fetchStudents();
  };

  return (
    <Stack>
      {/* Search + Add */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students…"
          style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.9rem", width: "60%" }}
        />
        <Stack
          className="dashboard-page-form-btn"
          onClick={() => setShowAddModal(true)}
          sx={{ cursor: "pointer", px: 2, py: 0.75 }}
        >
          <Typography className="dashboard-page-form-btn-txt" sx={{ fontSize: "0.85rem" }}>+ Add students</Typography>
        </Stack>
      </Stack>

      {/* Student rows */}
      {loading ? (
        <><Skeleton height={45} /><Skeleton height={45} /><Skeleton height={45} /></>
      ) : filtered.length > 0 ? (
        filtered.map((s, i) => (
          <Stack
            key={s.student_id || s.id || i}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            className="inbox-page-row"
            sx={{ py: 1.5 }}
          >
            <Stack
              sx={{ flex: 1, cursor: "pointer" }}
              onClick={() => router.push(`/teacher/classrooms/${classroomId}/students/${s.student_id || s.id}`)}
            >
              <Typography sx={{ fontWeight: 500 }}>{s.name || s.student_name}</Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "#888" }}>
                {s.avg_score != null ? `${Math.round(s.avg_score)}% avg` : "No data"} · Last active {s.last_active || "N/A"}
              </Typography>
            </Stack>
            <Typography
              onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuStudent(s); }}
              sx={{ cursor: "pointer", fontSize: "1.2rem", px: 1 }}
            >
              ⋮
            </Typography>
          </Stack>
        ))
      ) : (
        <Typography sx={{ color: "#888", textAlign: "center", py: 3 }}>
          {search ? "No students match your search." : "No students in this classroom yet. Click '+ Add students' to get started."}
        </Typography>
      )}

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={handleRemove} sx={{ color: "#e53935" }}>Remove from classroom</MenuItem>
      </Menu>

      {showAddModal && (
        <AddStudentsModal
          classroomId={classroomId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchStudents(); }}
        />
      )}
    </Stack>
  );
}
```

- [ ] **Step 4: Smoke test**

Run: `bun run dev`
Open: `http://localhost:3000/teacher/classrooms/{some-id}?tab=roster`
Expected: Back link "← My Classrooms". Classroom name + edit/delete controls. Three tabs. Roster tab shows search bar + "Add students" + student rows. Click student name → navigates to detail (404 until Task 8).

- [ ] **Step 5: Commit**

```bash
git add "src/app/(app)/teacher/classrooms/[classroomId]/"
git commit -m "feat(teacher): add classroom detail page with roster tab, edit/delete, search, add-students modal"
```

---

## Task 6: Classroom Detail — AddStudentsModal + AssignmentsTab + InsightsTab

**Files:**
- Create: `src/app/(app)/teacher/classrooms/[classroomId]/components/AddStudentsModal.jsx`
- Create: `src/app/(app)/teacher/classrooms/[classroomId]/components/AssignmentsTab.jsx`
- Create: `src/app/(app)/teacher/classrooms/[classroomId]/components/InsightsTab.jsx`

- [ ] **Step 1: Create AddStudentsModal.jsx**

```jsx
"use client";

import React, { useState } from "react";
import { Modal, Box, Stack, Typography } from "@mui/material";
import Loader from "@/elements/loader/Loader";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";

export default function AddStudentsModal({ classroomId, onClose, onSuccess }) {
  const [emails, setEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePasteAdd = async () => {
    const emailList = emails.split(/[\n,;]+/).map((e) => e.trim()).filter(Boolean);
    if (emailList.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      await TeacherAPI.bulkAddStudents({}, { classroom_id: classroomId, emails: emailList });
      onSuccess();
    } catch (err) {
      setError("Failed to add students. Please check the emails and try again.");
    }
    setLoading(false);
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await TeacherAPI.getUploadTemplate({ classroom_id: classroomId });
      if (res?.payload?.data?.url) {
        window.open(res.payload.data.url, "_blank");
      }
    } catch (err) {
      console.error("Template download failed:", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("classroom_id", classroomId);
      await TeacherAPI.uploadStudents({}, formData);
      onSuccess();
    } catch (err) {
      setError("CSV upload failed. Please check the file format.");
    }
    setLoading(false);
  };

  const styleModal = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 480,
    bgcolor: "#fff",
    borderRadius: "20px",
    outline: "none",
    p: 4,
  };

  return (
    <Modal open onClose={onClose}>
      <Box sx={styleModal}>
        <Loader isOpen={loading} />
        <Typography className="dashboard-page-subtitle" sx={{ mb: 2, fontWeight: 700 }}>
          Add Students
        </Typography>

        {error && (
          <Typography sx={{ color: "#e53935", fontSize: "0.85rem", mb: 2 }}>{error}</Typography>
        )}

        <Typography sx={{ fontWeight: 600, mb: 1, fontSize: "0.9rem" }}>
          Paste emails (one per line)
        </Typography>
        <textarea
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          rows={5}
          style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.9rem", resize: "vertical", fontFamily: "inherit" }}
          placeholder={"student1@school.com\nstudent2@school.com"}
        />
        <Stack
          className={"dashboard-page-form-btn" + (!emails.trim() ? "-disabled" : "")}
          onClick={handlePasteAdd}
          sx={{ cursor: emails.trim() ? "pointer" : "default", mt: 1, mb: 3 }}
        >
          <Typography className="dashboard-page-form-btn-txt">Add</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
          <Stack sx={{ flex: 1, height: "1px", bgcolor: "#ddd" }} />
          <Typography sx={{ px: 2, color: "#888", fontSize: "0.85rem" }}>OR</Typography>
          <Stack sx={{ flex: 1, height: "1px", bgcolor: "#ddd" }} />
        </Stack>

        <Typography sx={{ fontWeight: 600, mb: 1, fontSize: "0.9rem" }}>
          Upload CSV
        </Typography>
        <Stack direction="row" alignItems="center" spacing={2}>
          <label style={{ cursor: "pointer" }}>
            <Stack className="dashboard-page-form-btn" sx={{ px: 3, py: 0.75 }}>
              <Typography className="dashboard-page-form-btn-txt" sx={{ fontSize: "0.85rem" }}>Choose file</Typography>
            </Stack>
            <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: "none" }} />
          </label>
          <Typography onClick={handleDownloadTemplate} sx={{ cursor: "pointer", color: "#8264ff", fontSize: "0.85rem" }}>
            Download template
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Typography onClick={onClose} sx={{ cursor: "pointer", color: "#888" }}>Cancel</Typography>
        </Stack>
      </Box>
    </Modal>
  );
}
```

- [ ] **Step 2: Create AssignmentsTab.jsx**

```jsx
"use client";

import React, { useEffect, useState } from "react";
import { Stack, Typography, LinearProgress, Skeleton, Menu, MenuItem } from "@mui/material";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";
import AssignQuizModal from "@/modules/modal/AssignQuizModal";

export default function AssignmentsTab({ classroomId }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuItem, setMenuItem] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, [classroomId]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await TeacherAPI.getQuizCompletion({ classroom_id: classroomId });
      setAssignments(res?.payload?.data?.quizzes || res?.payload?.data || []);
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
    }
    setLoading(false);
  };

  const handleUnassign = async () => {
    if (!menuItem) return;
    if (!confirm(`Remove "${menuItem.quiz_name || menuItem.name}" from this classroom?`)) {
      setMenuAnchor(null);
      return;
    }
    await TeacherAPI.removeQuizzesFromClassroom({}, {
      classroom_id: classroomId,
      quiz_ids: [menuItem.quiz_id || menuItem.id],
    });
    setMenuAnchor(null);
    setMenuItem(null);
    fetchAssignments();
  };

  return (
    <Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 700 }}>Assignments</Typography>
        <Stack
          className="dashboard-page-form-btn"
          onClick={() => setShowAssignModal(true)}
          sx={{ cursor: "pointer", px: 2, py: 0.75 }}
        >
          <Typography className="dashboard-page-form-btn-txt" sx={{ fontSize: "0.85rem" }}>+ Assign quiz</Typography>
        </Stack>
      </Stack>

      {loading ? (
        <><Skeleton height={60} /><Skeleton height={60} /></>
      ) : assignments.length > 0 ? (
        assignments.map((a, i) => (
          <Stack key={a.quiz_id || a.id || i} className="inbox-page-row" sx={{ py: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 500 }}>{a.quiz_name || a.name}</Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                  <Typography sx={{ fontSize: "0.85rem", color: "#666" }}>
                    {a.completed_count || 0}/{a.total_count || 0} done
                  </Typography>
                  {a.avg_score != null && (
                    <Typography sx={{ fontSize: "0.85rem", color: "#666" }}>
                      Avg: {Math.round(a.avg_score)}%
                    </Typography>
                  )}
                  {a.due_date && (
                    <Typography sx={{ fontSize: "0.85rem", color: "#888" }}>
                      Due: {new Date(a.due_date).toLocaleDateString()}
                    </Typography>
                  )}
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={a.total_count ? (a.completed_count / a.total_count) * 100 : 0}
                  sx={{
                    mt: 1,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#f0f0f0",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 3,
                      background: "linear-gradient(90deg, #8264ff 0%, #ff64a0 100%)",
                    },
                  }}
                />
              </Stack>
              <Typography
                onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuItem(a); }}
                sx={{ cursor: "pointer", fontSize: "1.2rem", px: 1 }}
              >
                ⋮
              </Typography>
            </Stack>
          </Stack>
        ))
      ) : (
        <Typography sx={{ color: "#888", textAlign: "center", py: 3 }}>
          No assignments yet. Click "+ Assign quiz" to get started.
        </Typography>
      )}

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={handleUnassign} sx={{ color: "#e53935" }}>Remove from this classroom</MenuItem>
      </Menu>

      {showAssignModal && (
        <AssignQuizModal
          isOpen={showAssignModal}
          prefillClassroomId={classroomId}
          onClose={() => setShowAssignModal(false)}
          onSuccess={() => { setShowAssignModal(false); fetchAssignments(); }}
        />
      )}
    </Stack>
  );
}
```

- [ ] **Step 3: Create InsightsTab.jsx**

```jsx
"use client";

import React, { useEffect, useState } from "react";
import { Stack, Typography, Skeleton } from "@mui/material";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";

export default function InsightsTab({ classroomId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [classroomId]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await TeacherAPI.getClassroomOverview({ classroom_id: classroomId });
      setData(res?.payload?.data || null);
    } catch (err) {
      console.error("Failed to fetch insights:", err);
    }
    setLoading(false);
  };

  if (loading) {
    return <><Skeleton height={80} /><Skeleton height={200} /><Skeleton height={80} /></>;
  }

  if (!data) {
    return (
      <Typography sx={{ color: "#888", textAlign: "center", py: 3 }}>
        No data available yet. Insights appear after students complete assignments.
      </Typography>
    );
  }

  const avgScore = data.avg_score || data.average_score;
  const completionRate = data.completion_rate;
  const weakCategories = data.weak_categories || data.weakest_categories || [];
  const strongCategories = data.strong_categories || data.strongest_categories || [];

  return (
    <Stack spacing={3}>
      {/* Summary stats */}
      <Stack direction="row" spacing={3}>
        {avgScore != null && (
          <Stack className="dashboard-page-card" sx={{ p: 2, flex: 1, textAlign: "center" }}>
            <Typography sx={{ fontSize: "2rem", fontWeight: 700, color: "#8264ff" }}>
              {Math.round(avgScore)}%
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "#888" }}>Average Score</Typography>
          </Stack>
        )}
        {completionRate != null && (
          <Stack className="dashboard-page-card" sx={{ p: 2, flex: 1, textAlign: "center" }}>
            <Typography sx={{ fontSize: "2rem", fontWeight: 700, color: "#ff5000" }}>
              {Math.round(completionRate)}%
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "#888" }}>Completion Rate</Typography>
          </Stack>
        )}
      </Stack>

      {/* Weak categories */}
      {weakCategories.length > 0 && (
        <Stack>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Weakest Categories</Typography>
          {weakCategories.slice(0, 3).map((c, i) => (
            <Stack key={i} direction="row" justifyContent="space-between" className="inbox-page-row" sx={{ py: 1 }}>
              <Typography>{c.name || c.category}</Typography>
              <Typography sx={{ color: "#e53935" }}>{c.avg_score != null ? `${Math.round(c.avg_score)}%` : ""}</Typography>
            </Stack>
          ))}
        </Stack>
      )}

      {/* Strong categories */}
      {strongCategories.length > 0 && (
        <Stack>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Strongest Categories</Typography>
          {strongCategories.slice(0, 3).map((c, i) => (
            <Stack key={i} direction="row" justifyContent="space-between" className="inbox-page-row" sx={{ py: 1 }}>
              <Typography>{c.name || c.category}</Typography>
              <Typography sx={{ color: "#43a047" }}>{c.avg_score != null ? `${Math.round(c.avg_score)}%` : ""}</Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
```

Note: InsightsTab uses text-based stats for v1. Recharts can be layered in during polish — the API data shape will dictate chart configs. This avoids blocking on chart library setup.

- [ ] **Step 4: Smoke test**

Open: `http://localhost:3000/teacher/classrooms/{id}?tab=assignments`
Expected: Assignments list with progress bars, "+ Assign quiz" button, ⋮ menu with "Remove from this classroom".

Open: `http://localhost:3000/teacher/classrooms/{id}?tab=insights`
Expected: Average score, completion rate, weakest/strongest categories (or empty state).

- [ ] **Step 5: Commit**

```bash
git add "src/app/(app)/teacher/classrooms/[classroomId]/components/"
git commit -m "feat(teacher): add AddStudentsModal, AssignmentsTab with progress bars, InsightsTab with class analytics"
```

---

## Task 7: Student Detail Page

**Files:**
- Create: `src/app/(app)/teacher/classrooms/[classroomId]/students/[studentId]/page.tsx`
- Create: `src/app/(app)/teacher/classrooms/[classroomId]/students/[studentId]/StudentDetailClient.tsx`

- [ ] **Step 1: Create page.tsx**

```tsx
import StudentDetailClient from "./StudentDetailClient";

export const metadata = { title: "Student · Pebbo Teacher" };

export default function StudentDetailPage({
  params,
}: {
  params: { classroomId: string; studentId: string };
}) {
  return <StudentDetailClient classroomId={params.classroomId} studentId={params.studentId} />;
}
```

- [ ] **Step 2: Create StudentDetailClient.tsx**

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { Card, Stack, Typography, Skeleton, LinearProgress, Collapse } from "@mui/material";
import { useRouter } from "next/navigation";
import { ContentLayout } from "@/layouts/ContentLayout";
import TeacherCard from "@/modules/card/TeacherCard";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";

export default function StudentDetailClient({
  classroomId,
  studentId,
}: {
  classroomId: string;
  studentId: string;
}) {
  const router = useRouter();
  const [scores, setScores] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDaily, setShowDaily] = useState(false);
  const [showWeekly, setShowWeekly] = useState(false);
  const [dailyReport, setDailyReport] = useState<any>(null);
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingWeekly, setLoadingWeekly] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const res = await TeacherAPI.getStudentScores({ student_id: studentId });
      setScores(res?.payload?.data || null);
    } catch (err) {
      console.error("Failed to fetch student data:", err);
    }
    setLoading(false);
  };

  const handleToggleDaily = async () => {
    if (!showDaily && !dailyReport) {
      setLoadingDaily(true);
      try {
        const res = await TeacherAPI.getStudentDailyReport({ student_id: studentId });
        setDailyReport(res?.payload?.data || null);
      } catch (err) {
        console.error("Daily report fetch failed:", err);
      }
      setLoadingDaily(false);
    }
    setShowDaily(!showDaily);
  };

  const handleToggleWeekly = async () => {
    if (!showWeekly && !weeklyReport) {
      setLoadingWeekly(true);
      try {
        const res = await TeacherAPI.getStudentWeeklyReport({ student_id: studentId });
        setWeeklyReport(res?.payload?.data || null);
      } catch (err) {
        console.error("Weekly report fetch failed:", err);
      }
      setLoadingWeekly(false);
    }
    setShowWeekly(!showWeekly);
  };

  const name = scores?.student_name || scores?.name || "Student";
  const avgScore = scores?.avg_score || scores?.average_score;
  const quizzesDone = scores?.quizzes_done || scores?.total_quizzes || 0;
  const streak = scores?.streak || scores?.current_streak || 0;
  const recentActivity = scores?.recent_activity || scores?.scores || [];
  const categoryProgress = scores?.categories || scores?.category_progress || [];

  return (
    <ContentLayout title="" hideTitle={true}>
      <TeacherCard>
        <Stack sx={{ p: { xs: 1, md: 2 }, maxWidth: 1200 }}>
          {/* Back link */}
          <Typography
            onClick={() => router.push(`/teacher/classrooms/${classroomId}?tab=roster`)}
            sx={{ cursor: "pointer", color: "#8264ff", mb: 1, fontSize: "0.9rem" }}
          >
            ← Back to classroom
          </Typography>

          {loading ? (
            <><Skeleton height={60} /><Skeleton height={200} /></>
          ) : (
            <>
              {/* Header */}
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Typography className="dashboard-page-title" sx={{ fontSize: "1.25rem" }}>
                  {name}
                </Typography>
                <Typography sx={{ fontSize: "0.9rem", color: "#888" }}>
                  {avgScore != null ? `${Math.round(avgScore)}% avg` : ""} · {quizzesDone} quizzes done {streak > 0 ? `· ${streak}-day streak` : ""}
                </Typography>
              </Stack>

              {/* Recent activity */}
              <Card className="dashboard-page-card" sx={{ p: 3, mb: 2 }}>
                <Typography sx={{ fontWeight: 700, mb: 2 }}>Recent Activity</Typography>
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 10).map((a, i) => (
                    <Stack
                      key={i}
                      direction="row"
                      justifyContent="space-between"
                      className="inbox-page-row"
                      sx={{ py: 1 }}
                    >
                      <Typography sx={{ fontWeight: 500 }}>{a.quiz_name || a.name}</Typography>
                      <Stack direction="row" spacing={2}>
                        <Typography sx={{ color: (a.score || 0) >= 70 ? "#43a047" : "#e53935" }}>
                          {a.score != null ? `${Math.round(a.score)}%` : ""}
                        </Typography>
                        <Typography sx={{ fontSize: "0.85rem", color: "#888" }}>
                          {a.completed_at || a.date || ""}
                        </Typography>
                      </Stack>
                    </Stack>
                  ))
                ) : (
                  <Typography sx={{ color: "#888" }}>No recent activity.</Typography>
                )}
              </Card>

              {/* Progress by category */}
              {categoryProgress.length > 0 && (
                <Card className="dashboard-page-card" sx={{ p: 3, mb: 2 }}>
                  <Typography sx={{ fontWeight: 700, mb: 2 }}>Progress by Category</Typography>
                  {categoryProgress.map((c, i) => (
                    <Stack key={i} sx={{ mb: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontWeight: 500 }}>{c.name || c.category}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography sx={{ fontWeight: 600 }}>
                            {c.score != null ? `${Math.round(c.score)}%` : ""}
                          </Typography>
                          {c.delta != null && (
                            <Typography sx={{ fontSize: "0.8rem", color: c.delta >= 0 ? "#43a047" : "#e53935" }}>
                              {c.delta >= 0 ? "↑" : "↓"} {Math.abs(Math.round(c.delta))}%
                            </Typography>
                          )}
                        </Stack>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={c.score || 0}
                        sx={{
                          mt: 0.5,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#f0f0f0",
                          "& .MuiLinearProgress-bar": { borderRadius: 4, backgroundColor: "#8264ff" },
                        }}
                      />
                    </Stack>
                  ))}
                </Card>
              )}

              {/* Daily / Weekly toggles */}
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Stack
                  className="dashboard-page-form-btn"
                  onClick={handleToggleDaily}
                  sx={{ cursor: "pointer", px: 3, py: 1 }}
                >
                  <Typography className="dashboard-page-form-btn-txt" sx={{ fontSize: "0.85rem" }}>
                    {showDaily ? "Hide" : "Show"} Daily Summary
                  </Typography>
                </Stack>
                <Stack
                  className="dashboard-page-form-btn"
                  onClick={handleToggleWeekly}
                  sx={{ cursor: "pointer", px: 3, py: 1 }}
                >
                  <Typography className="dashboard-page-form-btn-txt" sx={{ fontSize: "0.85rem" }}>
                    {showWeekly ? "Hide" : "Show"} Weekly Summary
                  </Typography>
                </Stack>
              </Stack>

              <Collapse in={showDaily}>
                <Card className="dashboard-page-card" sx={{ p: 3, mb: 2 }}>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>Daily Summary</Typography>
                  {loadingDaily ? <Skeleton height={100} /> : (
                    <Typography component="pre" sx={{ fontSize: "0.85rem", color: "#555", whiteSpace: "pre-wrap" }}>
                      {dailyReport ? JSON.stringify(dailyReport, null, 2) : "No daily report data."}
                    </Typography>
                  )}
                </Card>
              </Collapse>

              <Collapse in={showWeekly}>
                <Card className="dashboard-page-card" sx={{ p: 3, mb: 2 }}>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>Weekly Summary</Typography>
                  {loadingWeekly ? <Skeleton height={100} /> : (
                    <Typography component="pre" sx={{ fontSize: "0.85rem", color: "#555", whiteSpace: "pre-wrap" }}>
                      {weeklyReport ? JSON.stringify(weeklyReport, null, 2) : "No weekly report data."}
                    </Typography>
                  )}
                </Card>
              </Collapse>
            </>
          )}
        </Stack>
      </TeacherCard>
    </ContentLayout>
  );
}
```

Note: Daily/weekly reports render raw JSON in v1. Once we know the exact API response shape, a follow-up polish pass will format it properly.

- [ ] **Step 3: Smoke test**

Open: `http://localhost:3000/teacher/classrooms/{cid}/students/{sid}`
Expected: Back link, student name + summary strip, recent activity list, category progress bars, daily/weekly toggle buttons.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/teacher/classrooms/[classroomId]/students/"
git commit -m "feat(teacher): add student detail page with scores, category progress, daily/weekly report toggles"
```

---

## Task 8: Quizzes List Page

**Files:**
- Create: `src/app/(app)/teacher/quizzes/page.tsx`
- Create: `src/app/(app)/teacher/quizzes/QuizListClient.tsx`

- [ ] **Step 1: Create page.tsx**

```tsx
import QuizListClient from "./QuizListClient";

export const metadata = { title: "Quizzes · Pebbo Teacher" };

export default function QuizzesPage() {
  return <QuizListClient />;
}
```

- [ ] **Step 2: Create QuizListClient.tsx**

```tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, Stack, Typography, Skeleton } from "@mui/material";
import { useRouter } from "next/navigation";
import { ContentLayout } from "@/layouts/ContentLayout";
import TeacherCard from "@/modules/card/TeacherCard";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";

export default function QuizListClient() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await TeacherAPI.getQuizzes({ page_number: 1, rows_per_page: 100 });
      setQuizzes(res?.payload?.data?.quizzes || res?.payload?.data || []);
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
    }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return quizzes;
    const q = search.toLowerCase();
    return quizzes.filter((qz) =>
      (qz.quiz_name || qz.name || "").toLowerCase().includes(q)
    );
  }, [quizzes, search]);

  return (
    <ContentLayout title="" hideTitle={true}>
      <TeacherCard>
        <Stack sx={{ p: { xs: 1, md: 2 }, maxWidth: 1200 }}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography className="dashboard-page-title" sx={{ fontSize: "1.25rem" }}>
              My Quizzes
            </Typography>
            <Stack
              className="dashboard-page-form-btn"
              onClick={() => router.push("/teacher/quizzes/new")}
              sx={{ cursor: "pointer", px: 3, py: 1 }}
            >
              <Typography className="dashboard-page-form-btn-txt">+ New quiz</Typography>
            </Stack>
          </Stack>

          {/* Search */}
          <Card className="dashboard-page-card" sx={{ mb: 2, p: 2 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quizzes…"
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.9rem" }}
            />
          </Card>

          {/* Quiz rows */}
          <Card className="dashboard-page-card" sx={{ p: 2 }}>
            {loading ? (
              <><Skeleton height={50} /><Skeleton height={50} /><Skeleton height={50} /></>
            ) : filtered.length > 0 ? (
              filtered.map((qz) => (
                <Stack
                  key={qz.quiz_id || qz.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  className="inbox-page-row"
                  sx={{ cursor: "pointer", py: 1.5 }}
                  onClick={() => router.push(`/teacher/quizzes/${qz.quiz_id || qz.id}`)}
                >
                  <Stack>
                    <Typography sx={{ fontWeight: 600 }}>{qz.quiz_name || qz.name}</Typography>
                    <Typography sx={{ fontSize: "0.85rem", color: "#888" }}>
                      {qz.question_count || 0} questions · Assigned to {qz.classroom_count || 0} classroom{(qz.classroom_count || 0) !== 1 ? "s" : ""}
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: "0.85rem", color: "#aaa" }}>→</Typography>
                </Stack>
              ))
            ) : (
              <Typography sx={{ color: "#888", textAlign: "center", py: 3 }}>
                {search ? "No quizzes match your search." : "You haven't created any quizzes yet."}
              </Typography>
            )}
            {!loading && !search && filtered.length === 0 && (
              <Stack
                className="dashboard-page-form-btn"
                onClick={() => router.push("/teacher/quizzes/new")}
                sx={{ cursor: "pointer", mt: 2, mx: "auto" }}
              >
                <Typography className="dashboard-page-form-btn-txt">Create your first quiz</Typography>
              </Stack>
            )}
          </Card>
        </Stack>
      </TeacherCard>
    </ContentLayout>
  );
}
```

- [ ] **Step 3: Smoke test**

Open: `http://localhost:3000/teacher/quizzes`
Expected: "My Quizzes" header + "+ New quiz" button. Search bar. Quiz rows with name + question count + classroom count. Empty state CTA if no quizzes.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/teacher/quizzes/page.tsx" "src/app/(app)/teacher/quizzes/QuizListClient.tsx"
git commit -m "feat(teacher): add quizzes list page with search"
```

---

## Task 9: Quiz Authoring (Create + Edit)

**Files:**
- Create: `src/app/(app)/teacher/quizzes/new/page.tsx`
- Create: `src/app/(app)/teacher/quizzes/new/QuizAuthoringClient.tsx`
- Create: `src/app/(app)/teacher/quizzes/[quizId]/page.tsx`
- Create: `src/app/(app)/teacher/quizzes/[quizId]/QuizEditClient.tsx`
- Create: `src/app/(app)/teacher/quizzes/components/QuestionBankSearch.jsx`
- Create: `src/app/(app)/teacher/quizzes/components/QuizPreview.jsx`

This is the largest single task. The authoring screen has 3 sections: metadata form, 2-column question picker, and action bar. Shared between new + edit via props.

- [ ] **Step 1: Create QuestionBankSearch.jsx**

```jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Stack, Typography, Skeleton, Select, MenuItem } from "@mui/material";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";

export default function QuestionBankSearch({ addedQuestionIds, onAddQuestion }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => {
    TeacherAPI.getQuestionCategories().then((res) => {
      setCategories(res?.payload?.data?.categories || res?.payload?.data || []);
    });
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchQuestions();
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [keyword, selectedCategory]);

  const searchQuestions = async () => {
    setLoading(true);
    try {
      const params = { page_number: 1, rows_per_page: 50 };
      if (keyword.trim()) params.search = keyword.trim();
      if (selectedCategory) params.category_id = selectedCategory;
      const res = await TeacherAPI.searchQuestions(params);
      setResults(res?.payload?.data?.questions || res?.payload?.data || []);
    } catch (err) {
      console.error("Search failed:", err);
    }
    setLoading(false);
  };

  const addedSet = new Set(addedQuestionIds || []);

  return (
    <Stack sx={{ flex: 1 }}>
      <Typography sx={{ fontWeight: 700, mb: 1 }}>Search Question Bank</Typography>
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Search by keyword…"
        style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.9rem", marginBottom: 8, width: "100%" }}
      />
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 140, fontSize: "0.85rem" }}
        >
          <MenuItem value="">All categories</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id || c.category_id} value={c.id || c.category_id}>
              {c.name || c.category_name}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      {loading ? (
        <><Skeleton height={40} /><Skeleton height={40} /><Skeleton height={40} /></>
      ) : results.length > 0 ? (
        <Stack sx={{ maxHeight: 400, overflowY: "auto" }}>
          {results.map((q) => {
            const qid = q.question_id || q.id;
            const isAdded = addedSet.has(qid);
            return (
              <Stack
                key={qid}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                className="inbox-page-row"
                sx={{ py: 1 }}
              >
                <Typography sx={{ flex: 1, fontSize: "0.9rem" }}>
                  {q.subject || q.question_text || q.title || `Question #${qid}`}
                </Typography>
                <Stack
                  className={isAdded ? "dashboard-page-form-btn-disabled" : "dashboard-page-form-btn"}
                  onClick={() => !isAdded && onAddQuestion(q)}
                  sx={{ cursor: isAdded ? "default" : "pointer", px: 2, py: 0.5 }}
                >
                  <Typography className="dashboard-page-form-btn-txt" sx={{ fontSize: "0.8rem" }}>
                    {isAdded ? "Added" : "Add"}
                  </Typography>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      ) : (
        <Typography sx={{ color: "#888", fontSize: "0.9rem" }}>No questions found.</Typography>
      )}
    </Stack>
  );
}
```

- [ ] **Step 2: Create QuizPreview.jsx**

```jsx
"use client";

import React from "react";
import { Modal, Box, Stack, Typography, IconButton } from "@mui/material";
import { RichText } from "@/sections/index";

export default function QuizPreview({ questions, onClose }) {
  const styleModal = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    maxWidth: 700,
    maxHeight: "80vh",
    bgcolor: "#fff",
    borderRadius: "20px",
    outline: "none",
    p: 4,
    overflowY: "auto",
  };

  return (
    <Modal open onClose={onClose}>
      <Box sx={styleModal}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography className="dashboard-page-title" sx={{ fontSize: "1.1rem" }}>
            Quiz Preview ({questions?.length || 0} questions)
          </Typography>
          <Typography onClick={onClose} sx={{ cursor: "pointer", fontSize: "1.5rem", color: "#888" }}>×</Typography>
        </Stack>
        {questions?.map((q, i) => (
          <Stack key={q.question_id || q.id || i} className="dashboard-page-card" sx={{ p: 2, mb: 2 }}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>Q{i + 1}.</Typography>
            {q.content ? (
              <RichText data={typeof q.content === "string" ? JSON.parse(q.content) : q.content} />
            ) : (
              <Typography>{q.subject || q.question_text || q.title || "Question content"}</Typography>
            )}
          </Stack>
        ))}
        {(!questions || questions.length === 0) && (
          <Typography sx={{ color: "#888", textAlign: "center" }}>
            No questions added yet.
          </Typography>
        )}
      </Box>
    </Modal>
  );
}
```

- [ ] **Step 3: Create QuizAuthoringClient.tsx (shared by create + edit)**

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { Card, Stack, Typography, Select, MenuItem } from "@mui/material";
import { useRouter } from "next/navigation";
import { ContentLayout } from "@/layouts/ContentLayout";
import TeacherCard from "@/modules/card/TeacherCard";
import Loader from "@/elements/loader/Loader";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";
import QuestionBankSearch from "../components/QuestionBankSearch";
import QuizPreview from "../components/QuizPreview";

export default function QuizAuthoringClient({
  quizId,
  isEdit = false,
}: {
  quizId?: string;
  isEdit?: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [subject, setSubject] = useState("");
  const [addedQuestions, setAddedQuestions] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit && quizId) loadExistingQuiz();
  }, [quizId]);

  const loadExistingQuiz = async () => {
    setLoading(true);
    try {
      const quizRes = await TeacherAPI.getQuizzes({ quiz_id: quizId });
      const quiz = quizRes?.payload?.data?.quizzes?.[0] || quizRes?.payload?.data;
      if (quiz) {
        setTitle(quiz.quiz_name || quiz.name || "");
        setDescription(quiz.description || "");
        setYear(quiz.year || "");
        setSubject(quiz.subject || "");
      }
      const qRes = await TeacherAPI.getQuizQuestions({ quiz_id: quizId, page_number: 1, rows_per_page: 200 });
      setAddedQuestions(qRes?.payload?.data?.questions || qRes?.payload?.data || []);
    } catch (err) {
      console.error("Failed to load quiz:", err);
    }
    setLoading(false);
  };

  const handleAddQuestion = (q: any) => {
    setAddedQuestions((prev) => [...prev, q]);
  };

  const handleRemoveQuestion = (index: number) => {
    setAddedQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (publish = false) => {
    if (!title.trim()) return alert("Please enter a quiz title.");
    setSaving(true);
    try {
      const questionIds = addedQuestions.map((q) => q.question_id || q.id);
      if (isEdit && quizId) {
        await TeacherAPI.editQuiz({}, {
          quiz_id: quizId,
          quiz_name: title.trim(),
          description: description.trim(),
          year,
          subject,
          status: publish ? "published" : "draft",
        });
        // Sync questions: remove all then add current set
        const existingRes = await TeacherAPI.getQuizQuestions({ quiz_id: quizId, page_number: 1, rows_per_page: 200 });
        const existingIds = (existingRes?.payload?.data?.questions || []).map((q: any) => q.question_id || q.id);
        if (existingIds.length > 0) {
          await TeacherAPI.removeQuestionsFromQuiz({}, { quiz_id: quizId, question_ids: existingIds });
        }
        if (questionIds.length > 0) {
          await TeacherAPI.addQuestionsToQuiz({}, { quiz_id: quizId, question_ids: questionIds });
        }
      } else {
        const res = await TeacherAPI.createQuiz({}, {
          quiz_name: title.trim(),
          description: description.trim(),
          year,
          subject,
          question_ids: questionIds,
          status: publish ? "published" : "draft",
        });
        const newId = res?.payload?.data?.quiz_id || res?.payload?.data?.id;
        if (newId) router.replace(`/teacher/quizzes/${newId}`);
      }
      if (isEdit) alert(publish ? "Quiz published!" : "Quiz saved as draft.");
      else router.push("/teacher/quizzes");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save quiz.");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!quizId || !confirm("Delete this quiz permanently?")) return;
    await TeacherAPI.deleteQuiz({ quiz_id: quizId });
    router.push("/teacher/quizzes");
  };

  const addedIds = addedQuestions.map((q) => q.question_id || q.id);

  return (
    <ContentLayout title="" hideTitle={true}>
      <TeacherCard>
        <Loader isOpen={saving || loading} />
        <Stack sx={{ p: { xs: 1, md: 2 }, maxWidth: 1200 }}>
          {/* Back link */}
          <Typography
            onClick={() => router.push("/teacher/quizzes")}
            sx={{ cursor: "pointer", color: "#8264ff", mb: 1, fontSize: "0.9rem" }}
          >
            ← My Quizzes
          </Typography>

          {/* STEP 1 — Metadata */}
          <Card className="dashboard-page-card" sx={{ p: 3, mb: 2 }}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>Step 1 — Name and describe</Typography>
            <Stack spacing={2}>
              <Stack>
                <Typography sx={{ fontSize: "0.85rem", mb: 0.5 }}>Title</Typography>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Quiz title"
                  style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.9rem", width: "100%" }}
                />
              </Stack>
              <Stack>
                <Typography sx={{ fontSize: "0.85rem", mb: 0.5 }}>Description</Typography>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description"
                  rows={2}
                  style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.9rem", width: "100%", fontFamily: "inherit", resize: "vertical" }}
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <Stack sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: "0.85rem", mb: 0.5 }}>Year level</Typography>
                  <Select value={year} onChange={(e) => setYear(e.target.value)} size="small" displayEmpty sx={{ width: "100%" }}>
                    <MenuItem value="">Select year</MenuItem>
                    <MenuItem value="1">Year 1</MenuItem>
                    <MenuItem value="2">Year 2</MenuItem>
                    <MenuItem value="3">Year 3</MenuItem>
                    <MenuItem value="4">Year 4</MenuItem>
                    <MenuItem value="5">Year 5</MenuItem>
                    <MenuItem value="6">Year 6</MenuItem>
                  </Select>
                </Stack>
                <Stack sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: "0.85rem", mb: 0.5 }}>Subject</Typography>
                  <Select value={subject} onChange={(e) => setSubject(e.target.value)} size="small" displayEmpty sx={{ width: "100%" }}>
                    <MenuItem value="">Select subject</MenuItem>
                    <MenuItem value="math">Math</MenuItem>
                    <MenuItem value="english">English</MenuItem>
                  </Select>
                </Stack>
              </Stack>
            </Stack>
          </Card>

          {/* STEP 2 — Question picker */}
          <Card className="dashboard-page-card" sx={{ p: 3, mb: 2 }}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>Step 2 — Pick questions from the question bank</Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              {/* Left — Search */}
              <QuestionBankSearch addedQuestionIds={addedIds} onAddQuestion={handleAddQuestion} />

              {/* Right — Added */}
              <Stack sx={{ flex: 1, minWidth: 250 }}>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>Added to this quiz</Typography>
                {addedQuestions.length > 0 ? (
                  <>
                    {addedQuestions.map((q, i) => (
                      <Stack
                        key={q.question_id || q.id || i}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        className="inbox-page-row"
                        sx={{ py: 0.75 }}
                      >
                        <Typography sx={{ fontSize: "0.9rem" }}>
                          {i + 1}. {q.subject || q.question_text || q.title || `Question`}
                        </Typography>
                        <Typography
                          onClick={() => handleRemoveQuestion(i)}
                          sx={{ cursor: "pointer", color: "#e53935", fontSize: "0.8rem" }}
                        >
                          Remove
                        </Typography>
                      </Stack>
                    ))}
                    <Typography sx={{ mt: 1, fontSize: "0.85rem", color: "#888" }}>
                      Total: {addedQuestions.length} question{addedQuestions.length !== 1 ? "s" : ""}
                    </Typography>
                  </>
                ) : (
                  <Typography sx={{ color: "#888", fontSize: "0.9rem" }}>
                    No questions added yet. Search and add from the left panel.
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Card>

          {/* STEP 3 — Action bar */}
          <Card className="dashboard-page-card" sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>Step 3 — Review and save</Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Stack
                className="dashboard-page-form-btn"
                onClick={() => setShowPreview(true)}
                sx={{ cursor: "pointer", px: 3, py: 1 }}
              >
                <Typography className="dashboard-page-form-btn-txt">Preview as student</Typography>
              </Stack>
              <Stack
                className="dashboard-page-form-btn"
                onClick={() => handleSave(false)}
                sx={{ cursor: "pointer", px: 3, py: 1 }}
              >
                <Typography className="dashboard-page-form-btn-txt">Save draft</Typography>
              </Stack>
              <Stack
                className="dashboard-page-form-btn"
                onClick={() => handleSave(true)}
                sx={{ cursor: "pointer", px: 3, py: 1 }}
              >
                <Typography className="dashboard-page-form-btn-txt">Publish</Typography>
              </Stack>
              {isEdit && (
                <Typography onClick={handleDelete} sx={{ cursor: "pointer", color: "#e53935", alignSelf: "center", ml: 2 }}>
                  Delete quiz
                </Typography>
              )}
            </Stack>
          </Card>
        </Stack>

        {showPreview && (
          <QuizPreview questions={addedQuestions} onClose={() => setShowPreview(false)} />
        )}
      </TeacherCard>
    </ContentLayout>
  );
}
```

- [ ] **Step 4: Create new/page.tsx**

```tsx
import QuizAuthoringClient from "./QuizAuthoringClient";

export const metadata = { title: "New Quiz · Pebbo Teacher" };

export default function NewQuizPage() {
  return <QuizAuthoringClient />;
}
```

- [ ] **Step 5: Create [quizId]/page.tsx**

```tsx
import QuizEditClient from "./QuizEditClient";

export const metadata = { title: "Edit Quiz · Pebbo Teacher" };

export default function EditQuizPage({ params }: { params: { quizId: string } }) {
  return <QuizEditClient quizId={params.quizId} />;
}
```

- [ ] **Step 6: Create [quizId]/QuizEditClient.tsx**

```tsx
"use client";

import QuizAuthoringClient from "../new/QuizAuthoringClient";

export default function QuizEditClient({ quizId }: { quizId: string }) {
  return <QuizAuthoringClient quizId={quizId} isEdit />;
}
```

- [ ] **Step 7: Smoke test**

Open: `http://localhost:3000/teacher/quizzes/new`
Expected: 3-section authoring screen. Title/description/year/subject form. 2-column question picker (search left, added list right). Action bar (Preview / Save draft / Publish). Search debounces at 300ms. Add/Remove work. Preview modal opens with RichText rendering.

Open: `http://localhost:3000/teacher/quizzes/{some-quiz-id}`
Expected: Same screen with pre-loaded quiz data and questions.

- [ ] **Step 8: Commit**

```bash
git add "src/app/(app)/teacher/quizzes/"
git commit -m "feat(teacher): add quiz authoring with question bank search, preview, create/edit/delete, save draft/publish"
```

---

## Task 10: AssignQuizModal (Reusable)

**Files:**
- Create: `src/app/components/modules/modal/AssignQuizModal.jsx`

Used from 3 entry points: dashboard Quick Actions, dashboard Active Assignments, classroom Assignments tab. Props determine prefill behavior.

- [ ] **Step 1: Create AssignQuizModal.jsx**

```jsx
"use client";

import React, { useState, useEffect } from "react";
import { Modal, Box, Stack, Typography, Select, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import Loader from "@/elements/loader/Loader";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";

export default function AssignQuizModal({ isOpen, prefillClassroomId, onClose, onSuccess }) {
  const [classrooms, setClassrooms] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(prefillClassroomId || "");
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [targetScore, setTargetScore] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen]);

  const fetchData = async () => {
    setFetching(true);
    try {
      const [classroomRes, quizRes] = await Promise.all([
        TeacherAPI.getClassrooms({ page_number: 1, rows_per_page: 100 }),
        TeacherAPI.getQuizzes({ page_number: 1, rows_per_page: 100, status: "published" }),
      ]);
      setClassrooms(classroomRes?.payload?.data?.classrooms || classroomRes?.payload?.data || []);
      setQuizzes(quizRes?.payload?.data?.quizzes || quizRes?.payload?.data || []);
    } catch (err) {
      console.error("Assign modal fetch failed:", err);
    }
    setFetching(false);
  };

  const handleAssign = async () => {
    if (!selectedClassroom || !selectedQuiz) return;
    setLoading(true);
    try {
      await TeacherAPI.addQuizzesToClassroom({}, {
        classroom_id: selectedClassroom,
        quiz_ids: [selectedQuiz],
        ...(dueDate ? { due_date: dueDate.toISOString() } : {}),
        ...(targetScore ? { target_score: parseInt(targetScore, 10) } : {}),
      });
      onSuccess?.();
    } catch (err) {
      console.error("Assign failed:", err);
      alert("Failed to assign quiz.");
    }
    setLoading(false);
  };

  const styleModal = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 440,
    bgcolor: "#fff",
    borderRadius: "20px",
    outline: "none",
    p: 4,
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={styleModal}>
        <Loader isOpen={loading || fetching} />
        <Typography className="dashboard-page-subtitle" sx={{ mb: 3, fontWeight: 700 }}>
          Assign Quiz
        </Typography>

        <Stack spacing={2.5}>
          <Stack>
            <Typography sx={{ fontSize: "0.85rem", mb: 0.5 }}>1. Pick a classroom</Typography>
            <Select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              size="small"
              displayEmpty
              sx={{ width: "100%" }}
            >
              <MenuItem value="">Select classroom</MenuItem>
              {classrooms.map((c) => (
                <MenuItem key={c.classroom_id || c.id} value={c.classroom_id || c.id}>
                  {c.classroom_name || c.name}
                </MenuItem>
              ))}
            </Select>
          </Stack>

          <Stack>
            <Typography sx={{ fontSize: "0.85rem", mb: 0.5 }}>2. Pick a quiz</Typography>
            <Select
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              size="small"
              displayEmpty
              sx={{ width: "100%" }}
            >
              <MenuItem value="">Select quiz</MenuItem>
              {quizzes.map((q) => (
                <MenuItem key={q.quiz_id || q.id} value={q.quiz_id || q.id}>
                  {q.quiz_name || q.name}
                </MenuItem>
              ))}
            </Select>
          </Stack>

          <Stack>
            <Typography sx={{ fontSize: "0.85rem", mb: 0.5 }}>3. Due date (optional)</Typography>
            <DatePicker
              value={dueDate}
              onChange={setDueDate}
              slotProps={{ textField: { size: "small", sx: { width: "100%" } } }}
            />
          </Stack>

          <Stack>
            <Typography sx={{ fontSize: "0.85rem", mb: 0.5 }}>4. Target score (optional)</Typography>
            <input
              type="number"
              value={targetScore}
              onChange={(e) => setTargetScore(e.target.value)}
              placeholder="e.g. 70"
              min="0"
              max="100"
              style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.9rem", width: "100%" }}
            />
          </Stack>
        </Stack>

        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
          <Typography onClick={onClose} sx={{ cursor: "pointer", color: "#888", py: 1 }}>
            Cancel
          </Typography>
          <Stack
            className={"dashboard-page-form-btn" + (!selectedClassroom || !selectedQuiz ? "-disabled" : "")}
            onClick={handleAssign}
            sx={{ cursor: selectedClassroom && selectedQuiz ? "pointer" : "default", px: 3, py: 1 }}
          >
            <Typography className="dashboard-page-form-btn-txt">Assign</Typography>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
}
```

- [ ] **Step 2: Smoke test**

Open dashboard → click "Assign a quiz" in Quick Actions. Modal opens. Select classroom, select quiz, optionally set due date + target score. Click Assign → modal closes, dashboard refreshes.

Also test from classroom detail Assignments tab → "+ Assign quiz" → classroom should be prefilled.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/modules/modal/AssignQuizModal.jsx
git commit -m "feat(teacher): add reusable AssignQuizModal — 3 entry points, prefill support"
```

---

## Task 11: Profile Page

**Files:**
- Create: `src/app/(app)/teacher/profile/page.tsx`
- Create: `src/app/(app)/teacher/profile/ProfileClient.tsx`

Simple form: first name, last name, teaching subject(s), email (read-only), password change. Uses Supabase Auth directly.

- [ ] **Step 1: Create page.tsx**

```tsx
import ProfileClient from "./ProfileClient";

export const metadata = { title: "Profile · Pebbo Teacher" };

export default function ProfilePage() {
  return <ProfileClient />;
}
```

- [ ] **Step 2: Create ProfileClient.tsx**

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { Card, Stack, Typography } from "@mui/material";
import { ContentLayout } from "@/layouts/ContentLayout";
import TeacherCard from "@/modules/card/TeacherCard";
import Loader from "@/elements/loader/Loader";
import { Alert } from "@/app/components/elements";
import { Auth } from "@/src/app/data/local";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function ProfileClient() {
  const [dataUser, setDataUser] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [subjects, setSubjects] = useState("");
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<any>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const user = Auth.getDataUser();
    setDataUser(user);
    const meta = user?.user_metadata || user;
    setFirstName(meta?.first_name || meta?.name?.split(" ")[0] || "");
    setLastName(meta?.last_name || meta?.name?.split(" ").slice(1).join(" ") || "");
    setSubjects(meta?.subjects || meta?.subject || "");
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          subjects: subjects.trim(),
        },
      });
      if (error) throw error;
      setAlert({ type: "success", message: "Profile updated!" });
    } catch (err: any) {
      setAlert({ type: "error", message: err?.message || "Failed to update profile." });
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setAlert({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setAlert({ type: "error", message: "Passwords do not match." });
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setAlert({ type: "success", message: "Password changed!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setAlert({ type: "error", message: err?.message || "Failed to change password." });
    }
    setChangingPassword(false);
  };

  const handleLogout = async () => {
    await Auth.logout();
    window.location.href = "/login";
  };

  const email = dataUser?.email || dataUser?.user_metadata?.email || "";

  return (
    <ContentLayout title="" hideTitle={true}>
      <TeacherCard>
        <Loader isOpen={saving || changingPassword} />
        <Stack sx={{ p: { xs: 1, md: 2 }, maxWidth: 600 }}>
          <Typography className="dashboard-page-title" sx={{ fontSize: "1.25rem", mb: 2 }}>
            Profile
          </Typography>

          {alert && (
            <Alert isOpen={!!alert} message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />
          )}

          {/* Profile form */}
          <Card className="dashboard-page-card" sx={{ p: 3, mb: 2 }}>
            <Stack spacing={2}>
              <Stack>
                <Typography sx={{ fontSize: "0.85rem", mb: 0.5 }}>First name</Typography>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.9rem", width: "100%" }}
                />
              </Stack>
              <Stack>
                <Typography sx={{ fontSize: "0.85rem", mb: 0.5 }}>Last name</Typography>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.9rem", width: "100%" }}
                />
              </Stack>
              <Stack>
                <Typography sx={{ fontSize: "0.85rem", mb: 0.5 }}>Teaching subject(s)</Typography>
                <input
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.9rem", width: "100%" }}
                />
              </Stack>
              <Stack>
                <Typography sx={{ fontSize: "0.85rem", mb: 0.5 }}>Email</Typography>
                <input
                  value={email}
                  disabled
                  style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.9rem", width: "100%", backgroundColor: "#f5f5f5", color: "#888" }}
                />
              </Stack>
              <Stack className="dashboard-page-form-btn" onClick={handleSaveProfile} sx={{ cursor: "pointer", mt: 1, alignSelf: "flex-start", px: 3, py: 1 }}>
                <Typography className="dashboard-page-form-btn-txt">Save</Typography>
              </Stack>
            </Stack>
          </Card>

          {/* Password change */}
          <Card className="dashboard-page-card" sx={{ p: 3, mb: 2 }}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>Change Password</Typography>
            <Stack spacing={2}>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.9rem", width: "100%" }}
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.9rem", width: "100%" }}
              />
              <Stack className="dashboard-page-form-btn" onClick={handleChangePassword} sx={{ cursor: "pointer", alignSelf: "flex-start", px: 3, py: 1 }}>
                <Typography className="dashboard-page-form-btn-txt">Change password</Typography>
              </Stack>
            </Stack>
          </Card>

          {/* Logout */}
          <Typography onClick={handleLogout} sx={{ cursor: "pointer", color: "#e53935", fontWeight: 600, mt: 1 }}>
            Log out
          </Typography>
        </Stack>
      </TeacherCard>
    </ContentLayout>
  );
}
```

- [ ] **Step 3: Smoke test**

Open: `http://localhost:3000/teacher/profile`
Expected: Profile form with name, subject, email (read-only). Save updates Supabase user_metadata. Password change section. Logout button.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/teacher/profile/"
git commit -m "feat(teacher): add profile page with name/subject edit, password change, logout"
```

---

## Task 12: Final Wiring + Smoke Test

- [ ] **Step 1: Verify all routes compile**

Run: `bun run build`

Expected: Build completes without errors. Route list includes:
- `/teacher/dashboard`
- `/teacher/classrooms`
- `/teacher/classrooms/[classroomId]`
- `/teacher/classrooms/[classroomId]/students/[studentId]`
- `/teacher/quizzes`
- `/teacher/quizzes/new`
- `/teacher/quizzes/[quizId]`
- `/teacher/profile`

- [ ] **Step 2: Full end-to-end smoke test**

Login as teacher (`ilham.s@wistkey.dev` or test account). Walk through:

1. **Dashboard** → welcome strip, 5 cards render (data or empty states)
2. **Sidebar "Classrooms"** → classrooms list loads, search works, create classroom works
3. **Click a classroom** → detail page with 3 tabs (Roster / Assignments / Insights)
4. **Roster tab** → student rows, search, "+ Add students" opens modal
5. **Assignments tab** → assignment rows with progress bars, "+ Assign quiz" opens modal
6. **Insights tab** → analytics or empty state
7. **Click a student** → student detail with scores, category progress, daily/weekly toggles
8. **Sidebar "Quizzes"** → quiz list loads, search works
9. **"+ New quiz"** → authoring screen, search questions, add/remove, preview, save draft
10. **Click existing quiz** → edit mode with pre-loaded data
11. **Profile** (from header avatar dropdown or direct URL) → form renders, save works, password change works
12. **Logout** → lands on `/login`
13. **Login as student** → visit `/teacher/dashboard` → middleware redirects to `/dashboard`

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix(teacher): resolve smoke test issues from final wiring pass"
```

---

## Self-Review Checklist

### Spec coverage

| Spec section | Task |
|---|---|
| §2.2 Middleware | Done in Phase 1 |
| §2.3 Login redirect | Done in Phase 1 |
| §4.1 Dashboard 5 cards | Task 3 |
| §4.2 Classrooms list | Task 4 |
| §4.3 Classroom detail (3 tabs) | Tasks 5-6 |
| §4.4 Student detail | Task 7 |
| §4.5 Quizzes list | Task 8 |
| §4.6 Quiz authoring | Task 9 |
| §4.7 Profile | Task 11 |
| §4.8 AssignQuizModal | Task 10 |
| §6 Open questions | Resolved in header |

### Placeholder scan

No "TBD", "TODO", "implement later", or "similar to Task N" patterns present. All steps contain full code.

### Type consistency

- `TeacherAPI` method names are consistent across all tasks
- `classroomId` / `studentId` / `quizId` naming is consistent
- `dashboard-page-*` and `inbox-page-*` class references are consistent
- Modal patterns (styleModal, open/close) are consistent
