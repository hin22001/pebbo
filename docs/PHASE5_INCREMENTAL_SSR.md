# Phase 5 — Incremental SSR Rollout

## What was done

**First App Router app route: `/dashboard`**

- **Server:** `app/(app)/dashboard/page.tsx`
  - Calls `getSessionFromCookies(cookies())`; redirects to `/login` if no session.
  - Renders `<DashboardClient session={session} />`.
  - `export const dynamic = "force-dynamic"` so the page is always server-rendered and session is checked on each request.
- **Client:** `app/(app)/dashboard/DashboardClient.tsx`
  - `"use client"` boundary; receives `session` prop (for future use, e.g. avoid loading flash).
  - Renders the existing `<Dashboard />` template (same as `pages/dashboard`); no change to legacy Dashboard logic.

**Routing behavior**

- `/dashboard` is now served by the App Router (`app/(app)/dashboard/page.tsx`). The `(app)` layout wraps with `ClientProviders` (Redux, Auth, MainLayout), so the dashboard still gets the full app shell.
- `pages/dashboard/index.jsx` remains in the repo but is no longer used for `/dashboard` (App Router wins when both exist). It can be removed later or kept for reference.

## Validation gates

- **Build:** `next build` completes without errors.
- **Auth:** Logged-out user opening `/dashboard` is redirected to `/login`. Logged-in user (with session cookie set after login) sees the dashboard.
- **No regression:** Dashboard UI and behavior match the previous experience (same MainLayout, Redux, Auth context, Dashboard template).

## Performance note

- Server does one cookie read and a redirect when unauthenticated; no extra API calls on the server for this route.
- Session cookie is set on login via `Auth.setDataUser()` (Phase 4), so returning users have the cookie and pass the server check.

## Next routes (optional)

- **Reports:** Add `app/(app)/reports/daily/page.tsx` (and client wrapper) and pass `searchParams` from the server into the legacy component so it can use `props.searchParams` instead of `Router.query` (per SSR plan Phase 3).
- **Other easy/medium routes:** Same pattern — server session check, optional server data, client wrapper around existing template.

## Hard routes (leave client-only for now)

- `question/exercise`, `classroom/student/detail/quiz` — keep on Pages Router or move as pure client wrappers with no server data passing until refactored.
