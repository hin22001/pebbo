# SSR Migration Plan — The "Wrapper" Strategy

**Objective:** Safely migrate all existing student portal pages from the Next.js Pages Router (`src/pages`) to the modern App Router (`src/app`) with **zero broken functionality**.
**Constraint:** The vast majority of the app uses React Class Components and relies on client-side APIs (`localStorage`, `window`, DOM querying). They will break if executed on the server.

**Status:** Student portal migration complete. See **`docs/APP_ROUTER_MIGRATION_STATUS.md`** for current route list, remaining pages, and regression checklist.

---

## The Core Strategy

Do **not** attempt to refactor complex Class Components into Functional Components for SSR immediately. Instead, use an **"Outside-In" Wrapper Pattern**.

1. Move existing `src/pages` to a new isolated `src/components/legacy_pages` directory. Ensure they have `"use client"` at the top.
2. Build new Server Components in `src/app` (e.g., `src/app/page.tsx`).
3. These Server Components will handle initial routing, metadata, and (eventually) generic server-side data fetching. They will import and return the respective "client" class-component wrappers to handle the heavy logic.

---

## 🛠 Phase 1: Preparation & Setup (Immediate Next Steps)

**Goal:** Establish the foundation without touching existing complex logic.

- [x] Ensure the Next.js config supports the `app/` directory (if not already enabled).
- [x] Set up the root layout in `src/app/layout.tsx`. Move global styles, fonts, and base HTML structure here from `src/pages/_app.js` and `_document.js`.
- [x] Create a `src/components/legacy_pages` directory to house the old routed components temporarily.
- [x] Wrap any global Redux providers and Contexts (currently in `_app.js`) into a dedicated `"use client"` provider component (`ClientProviders.tsx`) and mount it inside `src/app/layout.tsx`. This avoids breaking Redux for all child client components.

---

## 🚀 Phase 2: Migrating the "Easy" Static / UI-only Pages

**Goal:** Migrate template-heavy pages with simple data needs. This validates the Wrapper Strategy structure.

**Pages to migrate:** ✅ Done (wrappers under `app/(app)/`; conflicting `pages/` removed.)

- `dashboard`, `dashboard/student-profile`
- `shop`, `leaderboard`, `math-library`, `reward`, `download`
- `classroom/student`, `classroom/student/detail`
- `inbox/student`
- `onboarding/placement`, `onboarding/results`, `onboarding/resume-gate`

**Steps for each page:**

1. Move `src/pages/[route]/index.jsx` to `src/components/legacy_pages/[route]Client.jsx`. Add `"use client"` at the top.
2. Create `src/app/[route]/page.tsx` as a Server component.
3. Add `export const metadata = { title: "..." }` to the Server component.
4. Import and render the `[route]Client` component.
5. Delete the file from `src/pages`.

---

## ⚖️ Phase 3: Migrating the "Medium" Data-fetching Pages

**Goal:** Handle pages that rely on simpler APIs or URL parameters.

**Pages to migrate:** ✅ Done.

- `reports/daily`, `reports/daily/detail`
- `reports/weekly`, `reports/weekly/detail`
- `payment-success` — still in `pages/`; add `(public)/payment-success` to fully migrate.

**Steps for each page:**

1. Apply the same wrapper strategy as Phase 2.
2. _Caveat for query parameters:_ If the existing component relies heavily on `next/router` (`Router.query`) inside `componentDidMount`, it will break because `next/router` is incompatible with the App Router.
3. Instead of refactoring the whole class, pass the search parameters down from the Server Component to the Client Component as props:
   - In `app/[route]/page.tsx`: Get search params (e.g., `export default function Page({ searchParams })`)
   - Pass them to the wrapper: `<ReportsDetailClient searchParams={searchParams} />`
   - Adjust the Class Component slightly to read from `this.props.searchParams` instead of `Router.query`.

---

## 🚧 Phase 4: Migrating the "Hard" Interactive Pages (The Danger Zone)

**Goal:** Isolate complex state interactions, heavy DOM manipulation, and intricate AI interactions.

**Pages to migrate:** ✅ Done.

- `question/exercise` — App route + shared template; `pages/question/exercise` removed.
- `classroom/student/detail/quiz` — App route + shared template; `pages/classroom/student/detail/quiz` removed.

**Steps:**

1. Apply the strict wrapper strategy. Move the massive React Class Components to `legacy_pages`.
2. Do **not** attempt to pass data down from the Server Component yet. Just let the client components mount and run their existing `componentDidMount` logic identically to how they work today.
3. Test rigorously. The quiz and AI generation rely on `window`, `document.querySelector`, and complex Redux states. Ensure they behave identically in the new App Router shell.

---

## ✅ Phase 5: Cleanup & Docs

- [x] Central migration status and regression checklist: **`docs/APP_ROUTER_MIGRATION_STATUS.md`**.
- [x] Auth path config consolidated in **`src/app/config/authRoutes.js`**; single guard in `(app)/layout`.
- Remaining `src/pages` are teacher/admin or public (payment-success, activate-account, 404); remove when app routes are added for them.

---

## 🔮 Future Maintenance (Post-Migration)

Once the entire application is fully running on the App Router `src/app`:

- **Auth Migration:** Consider moving `Auth.getDataUser()` (`localStorage`) logic to secure HTTP-only cookies. This will unlock the true power of Server Components by letting you fetch authenticated data on the server before passing it down.
- **Component Modernization:** As new features are requested for specific pages, refactor those specific Class Components into Functional Components one-by-one so you can leverage modern Next.js features (e.g., `useRouter` from `next/navigation`). Do not rewrite them just for the sake of rewriting them.
