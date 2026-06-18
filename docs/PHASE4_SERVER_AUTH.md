# Phase 4 — Server-Readable Auth (Foundation)

## What was done

- **Dual-write session:** When the client calls `Auth.setDataUser(dataUser)`, we still write the full user to `localStorage` and now also set a cookie `_pebbo_session` with a minimal payload (role, onboarding_completed, paying, name) so the server can read it.
- **Server helper:** `getSessionFromCookies(cookies)` in `src/app/lib/auth-server.js` reads that cookie and returns `{ role, onboarding_completed, paying, name }` or `null`. Use it in Server Components or Route Handlers with `cookies()` from `next/headers`.
- **Logout:** `Auth.logout()` clears the session cookie as well as localStorage.
- **Config:** `Config.sessionCookieName` (`_pebbo_session`) is defined in `src/app/constant/Config.js` so client and server use the same name.

## Client compatibility

- All existing behavior is unchanged: `Auth.getDataUser()`, `Auth.isAuthenticated()`, and the Authentication context still use localStorage. The cookie is additive.
- No changes to (app) layout or Authentication.js were required for this phase.

## Using the server session (Phase 5 or later)

In any Server Component or layout under the app router:

```ts
import { cookies } from "next/headers";
import { getSessionFromCookies } from "@/app/lib/auth-server";
import { redirect } from "next/navigation";

export default async function SomeLayout({ children }) {
  const session = getSessionFromCookies(cookies());
  if (!session) redirect("/login");
  return <SomeClient session={session}>{children}</SomeClient>;
}
```

You can then pass `session` into client components for initial render and still let them use `Auth.getDataUser()` for full data after hydration.

## Security note

The session cookie is set from the client (same as localStorage), so it is not HTTP-only. For a stronger setup later, the backend could set an HTTP-only cookie with the same payload on login so the client never writes it.
