# Fix Slow Next.js Dev Mode Compilation

## Root Cause Analysis

After migrating from Pages Router to App Router, `bun dev` became extremely slow while `bun run build && bun start` remains fast. Investigation found 4 root causes:

1. **75 barrel `export *` statements** across 8 index files connecting 324 component files — every dev file change re-evaluates the entire module tree
2. **Heavy ClientProviders** eagerly loading Redux, MUI theme, AOS, Supabase client, and an 889-line MainLayout on every authenticated page
3. **Legacy Pages Router config** in `next.config.js` (`i18n` with locale detection)
4. **No `optimizePackageImports`** configured (available since Next.js 13.5, project uses 14.2.3)

### Key Stats
- 746 files, 2053 symbols in codebase
- 68 `"use client"` directives (mostly well-isolated)
- 110 internal barrel re-exports causing cascading recompilation
- MainLayout (889 lines) bundled into every authenticated route

---

## Phase 0: Config Quick Wins (30 min, ~30-50% faster)

### 0A. Add `optimizePackageImports` to next.config.js

Tells Next.js to tree-shake barrel re-exports at dev time instead of following every `export *`.

**File:** `next.config.js` — Add to `nextConfig`:
```js
experimental: {
  optimizePackageImports: [
    '@mui/material',
    '@mui/x-date-pickers',
    '@mui/icons-material',
  ],
},
```

### 0B. Remove legacy `i18n` config

**File:** `next.config.js` — Delete lines 11-15 (the entire `i18n` block).

Language is already handled client-side via `Helpers.getCurrentLanguage()` + localStorage. The `i18n` block is for Pages Router and causes unnecessary per-request locale detection overhead in dev.

### 0C. Narrow tsconfig includes

**File:** `tsconfig.json` — Change `include` from:
```json
"include": ["next-env.d.ts", ".next/types/**/*.ts", "**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", ...]
```
To:
```json
"include": ["next-env.d.ts", ".next/types/**/*.ts", "src/**/*.ts", "src/**/*.tsx", "src/**/*.js", "src/**/*.jsx"]
```

Prevents TypeScript from scanning files outside `src/`.

### Verify Phase 0
```bash
bun dev
# Navigate to /dashboard
# Measure time from command execution to page load
# Should be noticeably faster
```

---

## Phase 1: Rewrite Top-Level Page Imports (1-2 hrs, ~20-30% faster per route)

Replace barrel imports in ~9 `*Client.tsx` page entry points with direct paths.

**Pattern:**
```tsx
// Before
import { QuizExercise, TeacherCard } from "@/app/components";

// After
import QuizExercise from "@/templates/QuizExercise/QuizExercise";
import TeacherCard from "@/modules/card/TeacherCard";
```

**Files to change:**
- `src/app/(app)/quiz-exercise/QuizExerciseClient.tsx`
- `src/app/(app)/school-overview/SchoolOverviewClient.tsx`
- `src/app/(app)/admin-performance/AdminPerformanceClient.tsx`
- `src/app/(app)/quiz-report/QuizReportClient.tsx`
- `src/app/(app)/secretadmin/SecretAdminClient.tsx`
- `src/app/(app)/class-report/ClassReportClient.tsx`
- `src/app/(app)/classroom/add-quiz/AddQuizClient.tsx`
- `src/app/(app)/class-planning/ClassPlanningClient.tsx`
- `src/app/components/templates/QuestionExercisePage/QuestionExercisePage.jsx`

**How:** Trace barrel chain to find actual component file, import directly using existing `@/templates`, `@/elements`, `@/modules` aliases.

### Verify Phase 1
After each file change: `bun dev` + navigate to that route. Confirm it renders correctly.

---

## Phase 2: Lazy-Load Heavy Deps in ClientProviders (1-2 hrs, ~20-30% faster)

**File:** `src/app/ClientProviders.tsx`

### 2A. Dynamic import MainLayout

MainLayout (889 lines) only needed for non-root pages. Already conditionally rendered.

```tsx
import dynamic from "next/dynamic";
const MainLayout = dynamic(
  () => import("@/layouts/MainLayout/MainLayout"),
  { ssr: false }
);
```

### 2B. Lazy-load AOS

Move from top-level import to dynamic import inside useEffect:

```tsx
// Remove: import AOS from "aos";

useEffect(() => {
  import("aos").then((AOS) => {
    AOS.default.init({ easing: "ease-out-quad", duration: 1000 });
  });
}, []);
```

### 2C. Lazy-load MUI locale require

Replace synchronous `require("@mui/material/locale")` with dynamic import inside the theme creation effect.

### Verify Phase 2
- Navigate to `/dashboard` (authenticated) — MainLayout should render
- Navigate to `/` (root) — should render without MainLayout
- Check MUI theme colors apply correctly
- Check AOS animations still trigger on scroll

---

## Phase 3: Rewrite Internal Component Barrel Imports (2-3 hrs, ~15-20% faster)

Replace barrel imports inside component files. **Batch order:**

**Batch 1** — MainLayout hot path (loaded every authenticated page):
- `src/app/components/layouts/MainLayout/MainLayout.jsx`
- `src/app/components/layouts/MainLayout/sections/Navigation.jsx`
- `src/app/components/layouts/MainLayout/sections/TeacherNavigation.jsx`
- `src/app/components/layouts/MainLayout/navbar/*.jsx`

**Batch 2** — 23 template directories under `src/app/components/templates/`

**Batch 3** — Elements/modules importing from sibling barrels

Same pattern as Phase 1.

### Verify Phase 3
`bun dev` + navigate major routes. Run `bun run build` to catch broken imports.

---

## Phase 4: Add Dynamic Imports for Heavy Pages (1 hr, optional)

Add `next/dynamic` for chart/heavy components on:
- Report pages (ClassReport, QuizReport, AdminPerformance)
- Rich text editor components in `sections/richText/`

---

## Phase 5: Prevent Regression (30 min, optional)

Add ESLint rule to prevent future barrel imports:

```json
"no-restricted-imports": ["error", {
  "patterns": [
    { "group": ["@/app/components"], "message": "Import directly from component file." }
  ]
}]
```

---

## Critical Files

| File | Phase | Change |
|------|-------|--------|
| `next.config.js` | 0 | Add `optimizePackageImports`, remove `i18n` |
| `tsconfig.json` | 0 | Narrow `include` to `src/**` |
| `src/app/ClientProviders.tsx` | 2 | Dynamic import MainLayout, AOS, MUI locale |
| `src/app/components/layouts/MainLayout/MainLayout.jsx` | 3 | Replace barrel imports |
| 9 `*Client.tsx` files | 1 | Replace barrel imports with direct paths |

---

## Execution Order

**Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5**

Phases 0-2 deliver the most impact with lowest risk.

---

## Expected Impact

| Phase | Risk | Dev Compile Improvement |
|-------|------|------------------------|
| 0 | Very Low | 30-50% |
| 1 | Low | 20-30% per route |
| 2 | Medium | 20-30% |
| 3 | Low | 15-20% |
| 4 | Low | Per-page |
| 5 | Low | Prevents regression |

**Total expected improvement:** 60-80% faster dev compilation after all phases.
