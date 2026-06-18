# Teacher Portal — Phase 1: Foundation + Shell — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the teacher portal foundation — shadcn theming aligned to DESIGN.md tokens, role-gated `/teacher/*` routing, login redirect for teachers, and a working app shell (sidebar + header) that visually feels like a sibling of the student portal. Phase 1 ends when a teacher can log in and reach an empty `/teacher/dashboard` placeholder via the sidebar/middleware path.

**Architecture:** Embed teacher pages inside the existing Next.js 14 app at `/teacher/*` URL prefix. Reuse existing shadcn install at `src/app/components/ui/`. Theme via Tailwind v3 `extend` (NOT v4 `@theme` block — repo is on v3.4) plus CSS vars added to the existing `src/app/assets/scss/index.scss`. Gate routes via a new `middleware.ts` at project root reading the Supabase session cookie. Login redirect lives in a single helper so a future pivot to a separate teacher login page touches one function.

**Tech Stack:** Next.js 14.2.3, React 18, TypeScript, Tailwind CSS 3.4 (existing), shadcn/ui (already initialized at `components.json`), Supabase Auth (cookie session), legacy SCSS+MUI coexists (untouched).

**Build verification:** No test framework exists in repo. Substitute the TDD discipline with: `bunx tsc --noEmit` (type check) + `bun run lint` + `bun run build` + manual browser smoke. Each task ends with at least one of these gates.

**Spec source:** `docs/superpowers/specs/2026-05-07-teacher-portal-design.md`. Token source: `DESIGN.md`. Memory: `project_teacher-portal-direction.md`, `project_teacher-portal-login-decision.md`.

---

## File Structure

**New files (Phase 1):**

- `middleware.ts` — project root, gates `/teacher/*` by role
- `src/app/utils/getPostLoginPath.ts` — pure helper, returns post-login URL for a given role
- `src/app/(app)/teacher/layout.tsx` — teacher app shell wrapper
- `src/app/(app)/teacher/dashboard/page.tsx` — placeholder dashboard (empty content, just confirms routing works)
- `src/app/components/teacher/shell/TeacherShell.tsx` — sidebar + header + main slot composite
- `src/app/components/teacher/shell/TeacherSidebar.tsx` — vertical nav (Dashboard, Classrooms, Quizzes)
- `src/app/components/teacher/shell/TeacherHeader.tsx` — top bar with avatar dropdown
- `src/app/components/teacher/shell/index.ts` — barrel export
- `src/app/components/ui/card.tsx`, `dropdown-menu.tsx`, `avatar.tsx` — new shadcn primitives via CLI
- `src/app/components/teacher/README.md` — short note explaining the teacher/ folder convention

**Modified files (Phase 1):**

- `tailwind.config.js` — add brand colors, drop dead `font-poppins`
- `src/app/assets/scss/index.scss` — add shadcn CSS variables to `:root` block
- `components.json` — fix `aliases.ui` and friends to match actual project paths
- `src/app/(public)/login/LoginClient.tsx` — replace hardcoded `/dashboard` redirect with `getPostLoginPath` helper at lines 100–103 and 207–219

**Untouched:** all student SCSS, all student page components, all existing student routes.

---

## Task 1: Audit & confirm baseline

**Files:** none (read-only verification)

- [ ] **Step 1: Confirm Tailwind version**

Run:
```bash
grep '"tailwindcss"' package.json
```

Expected: `"tailwindcss": "^3.4.0",`. If different, stop and inform the planner — the plan assumes v3 syntax.

- [ ] **Step 2: Confirm shadcn already initialized**

Run:
```bash
test -f components.json && echo "components.json: OK" || echo "MISSING"
test -f src/app/components/ui/button.tsx && echo "button.tsx: OK" || echo "MISSING"
```

Expected: both `OK`. If either is missing, halt and report.

- [ ] **Step 3: Confirm dev server starts cleanly**

Run:
```bash
bun run dev
```

Open `http://localhost:3000`, confirm the student app loads. Stop the dev server (Ctrl-C) before continuing.

- [ ] **Step 4: Note current behavior of `/teacher/dashboard`**

Visit `http://localhost:3000/teacher/dashboard` in a browser while dev server runs. Expected: 404 (route doesn't exist yet). Confirms our new routes don't collide.

- [ ] **Step 5: No commit needed for Task 1.**

---

## Task 2: Fix `components.json` aliases to match actual project paths

The existing `components.json` declares `aliases.ui = "@/src/components/ui"` but the actual file lives at `src/app/components/ui/button.tsx`. Future `npx shadcn add` calls will install to the wrong path. Fix.

**Files:** Modify: `components.json`

- [ ] **Step 1: Read current `components.json`**

Run:
```bash
cat components.json
```

- [ ] **Step 2: Replace the file with corrected paths**

Write `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/assets/scss/index.scss",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/src/app/utils",
    "ui": "@/components/ui",
    "lib": "@/src/app/utils",
    "hooks": "@/src/app/utils/hooks"
  },
  "registries": {}
}
```

These aliases match the existing `tsconfig.json` paths (`@/components/*` → `src/app/components/*`). New shadcn installs will land in `src/app/components/ui/`.

- [ ] **Step 3: Smoke test alias resolution**

Run:
```bash
bunx tsc --noEmit
```

Expected: no new errors related to `@/components/ui`. If errors appear, the tsconfig may not include the alias — check `tsconfig.json` `paths` block.

- [ ] **Step 4: Commit**

```bash
git add components.json
git commit -m "fix(shadcn): align components.json aliases with project tsconfig paths"
```

---

## Task 3: Extend `tailwind.config.js` with DESIGN.md brand tokens; drop dead `font-poppins`

**Files:** Modify: `tailwind.config.js`

- [ ] **Step 1: Open and locate the `theme.extend.fontFamily` block**

Run:
```bash
grep -n 'fontFamily\|colors\|theme:' tailwind.config.js | head -20
```

Note the line numbers of `fontFamily` and `extend:`.

- [ ] **Step 2: Modify `theme.extend` to add brand colors and remove `font-poppins`**

In `tailwind.config.js`, find:

```js
fontFamily: {
  poppins: ["Poppins", "sans-serif"],
  advercase: ["Advercase", "serif"],
},
```

Replace with:

```js
fontFamily: {
  sans: ["Inter", "system-ui", "sans-serif"],
  display: ["Advercase", "Inter", "serif"],
  advercase: ["Advercase", "serif"],
},
colors: {
  brand: {
    DEFAULT: "#FF5000",
    deep: "#D14B1E",
    tint: "#FFF6EB",
  },
  pebbo: {
    purple: "#8264FF",
    pink: "#FF64A0",
    mint: "#02CDD2",
    "mint-tint": "#E4FEFF",
    gold: "#B78316",
    yellow: "#FFDA27",
  },
  success: {
    DEFAULT: "#00BE2A",
    tint: "#DEF9D0",
  },
  error: {
    DEFAULT: "#D41C02",
    loud: "#FC2C29",
  },
  surface: {
    0: "#FFFFFF",
    1: "#FAFAF8",
    2: "#F4F2EF",
  },
  border: {
    subtle: "#EAEAEA",
    DEFAULT: "#D9D9D9",
  },
  ink: {
    strong: "#1A1815",
    DEFAULT: "#565656",
    muted: "#8D8D8D",
  },
},
```

Note: `font-poppins` is removed (no current consumer in the codebase, verified during DESIGN.md extraction). `font-sans` and `font-display` are added so shadcn primitives pick up Inter/Advercase by default.

- [ ] **Step 3: Verify config still parses**

Run:
```bash
bun run lint
```

Expected: no Tailwind-related errors.

- [ ] **Step 4: Verify build succeeds**

Run:
```bash
bun run build
```

Expected: build completes. If a SCSS file references `font-poppins` directly, the build will fail — search and replace.

If the build fails on `font-poppins`:
```bash
grep -rn 'font-poppins\|poppins' src/app/assets/scss src/app 2>/dev/null | head
```

For any hits in SCSS, replace `font-poppins` with `font-sans`. Do NOT touch student-side `.tsx`/`.jsx` files (that would mutate student portal); if a student component uses `font-poppins`, restore the token in tailwind.config.js as `poppins: ["Inter", "sans-serif"]` (alias) so existing usage compiles without changing student code.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.js
git commit -m "feat(theme): add Pebbo brand colors and Inter/Advercase font stack to Tailwind"
```

---

## Task 4: Add shadcn CSS variables to `:root` of existing SCSS

shadcn primitives consume CSS variables (`--primary`, `--background`, `--foreground`, `--radius`, etc). They live in the existing SCSS file the shadcn config points at: `src/app/assets/scss/index.scss`.

**Files:** Modify: `src/app/assets/scss/index.scss`

- [ ] **Step 1: Locate the existing `:root` block in `src/app/assets/scss/index.scss`**

Run:
```bash
grep -n ':root' src/app/assets/scss/index.scss
```

There is currently one `:root { --fc-border-color: #fff; }` block (sets the FullCalendar border var). We add shadcn vars to the SAME `:root` block.

- [ ] **Step 2: Replace the `:root` block**

In `src/app/assets/scss/index.scss`, find:

```scss
:root {
  --fc-border-color: #fff;
}
```

Replace with:

```scss
:root {
  /* Existing — DO NOT REMOVE */
  --fc-border-color: #fff;

  /* shadcn semantic vars (light theme; teacher portal is light-only in v1) */
  --background: 0 0% 100%;
  --foreground: 30 10% 10%;

  --card: 30 20% 98%;
  --card-foreground: 30 10% 10%;

  --popover: 0 0% 100%;
  --popover-foreground: 30 10% 10%;

  --primary: 18 100% 50%;        /* #FF5000 — brand orange */
  --primary-foreground: 0 0% 100%;

  --secondary: 30 30% 96%;
  --secondary-foreground: 30 10% 20%;

  --muted: 30 10% 95%;
  --muted-foreground: 30 5% 40%;

  --accent: 30 80% 96%;
  --accent-foreground: 30 10% 20%;

  --destructive: 5 96% 42%;
  --destructive-foreground: 0 0% 100%;

  --border: 30 5% 85%;
  --input: 30 5% 85%;
  --ring: 18 100% 50%;

  --radius: 0.375rem;

  /* Chrome dimensions — must match student portal */
  --teacher-header-h: 5rem;
  --teacher-nav-w: 15rem;
  --teacher-nav-collapsed-w: 60px;
}
```

Notes:
- shadcn requires HSL values without commas (the format above).
- These approximate the OKLCH values from DESIGN.md. Exact OKLCH would require Tailwind v4. Tweak hue/saturation during the visual parity pass if a primitive feels off.
- `--teacher-header-h` and `--teacher-nav-w` lock the chrome dimensions; consume them in TeacherShell.

- [ ] **Step 3: Build to verify**

Run:
```bash
bun run build
```

Expected: build succeeds. If SCSS parse error, double-check the `:root` block syntax.

- [ ] **Step 4: Commit**

```bash
git add src/app/assets/scss/index.scss
git commit -m "feat(theme): add shadcn CSS variables for teacher portal primitives"
```

---

## Task 5: Install shadcn primitives needed for Phase 1

For Phase 1 we only need primitives the shell uses: `Card` (for content frames), `DropdownMenu` (avatar menu), `Avatar` (header), `Button` (already installed). Defer Dialog/Tabs/Table to Phase 2+.

**Files:** Create (via CLI):
- `src/app/components/ui/card.tsx`
- `src/app/components/ui/dropdown-menu.tsx`
- `src/app/components/ui/avatar.tsx`

- [ ] **Step 1: Install Card**

Run:
```bash
bunx shadcn@latest add card
```

When prompted "Which framework?" select Next.js. Confirm overwrites if any. Expected output: `Created src/app/components/ui/card.tsx`.

- [ ] **Step 2: Install DropdownMenu**

Run:
```bash
bunx shadcn@latest add dropdown-menu
```

Expected: `src/app/components/ui/dropdown-menu.tsx` created. Will install `@radix-ui/react-dropdown-menu` if missing.

- [ ] **Step 3: Install Avatar**

Run:
```bash
bunx shadcn@latest add avatar
```

Expected: `src/app/components/ui/avatar.tsx` created. Will install `@radix-ui/react-avatar` if missing.

- [ ] **Step 4: Verify all three render**

Create a temporary scratch file `src/app/(app)/teacher/_smoke/page.tsx`:

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ShadcnSmoke() {
  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>shadcn smoke test</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Button>Brand button</Button>
          <Avatar>
            <AvatarImage src="" alt="" />
            <AvatarFallback>MS</AvatarFallback>
          </Avatar>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Open menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    </div>
  );
}
```

Run dev:
```bash
bun run dev
```

Visit `http://localhost:3000/teacher/_smoke` (will be middleware-blocked later — for now, no middleware is in place yet so it should render).

Expected: a card with a brand-orange Button, a fallback avatar showing "MS", and a working dropdown.

- [ ] **Step 5: Visual sanity check (NOT pixel-identical)**

In the running dev session, open the student dashboard at `http://localhost:3000/dashboard` in a separate tab. Eyeball:
- Brand-orange button color matches student-side brand orange (will be `oklch`-approximate but close).
- Card border/shadow doesn't fight student-side card patterns.

Note any visible drift; tune `--primary` hue in Task 4's `:root` block if the orange feels off.

- [ ] **Step 6: Delete scratch smoke file**

```bash
rm -rf 'src/app/(app)/teacher/_smoke'
```

- [ ] **Step 7: Commit**

```bash
git add src/app/components/ui/card.tsx src/app/components/ui/dropdown-menu.tsx src/app/components/ui/avatar.tsx package.json bun.lockb
git commit -m "feat(ui): install shadcn Card, DropdownMenu, Avatar primitives"
```

---

## Task 6: Create `getPostLoginPath` helper

Pure function that returns the URL to redirect to after login. Centralizes the role-based branch so a future pivot to a separate teacher login page touches one function.

**Files:** Create: `src/app/utils/getPostLoginPath.ts`

- [ ] **Step 1: Write the helper**

Create `src/app/utils/getPostLoginPath.ts`:

```ts
type Role = "student" | "teacher" | "admin" | "system_admin" | string | null | undefined;

interface PostLoginContext {
  role: Role;
  paying?: boolean | null;
  onboardingDone?: boolean | null;
}

export function getPostLoginPath(ctx: PostLoginContext): string {
  const { role, paying, onboardingDone } = ctx;

  if (role === "teacher") {
    return "/teacher/dashboard";
  }

  if (role === "admin" || role === "system_admin") {
    return "/dashboard";
  }

  if (role === "student") {
    if (!onboardingDone) return "/onboarding/placement";
    if (paying) return "/dashboard";
    return "/activate-account";
  }

  return "/dashboard";
}
```

This mirrors the existing logic in `LoginClient.tsx:95–114` exactly, plus the new teacher branch.

- [ ] **Step 2: Type-check**

Run:
```bash
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/utils/getPostLoginPath.ts
git commit -m "feat(auth): add getPostLoginPath helper for role-based redirect"
```

---

## Task 7: Modify `LoginClient.tsx` to use `getPostLoginPath`

Two call sites in `src/app/(public)/login/LoginClient.tsx` currently hardcode `/dashboard`: `updateDataUser` (lines ~100-114) and `componentDidMount` (lines ~207-219). Replace both with the helper.

**Files:** Modify: `src/app/(public)/login/LoginClient.tsx`

- [ ] **Step 1: Add the import**

Near the top of `src/app/(public)/login/LoginClient.tsx`, after the existing imports, add:

```ts
import { getPostLoginPath } from "@/app/utils/getPostLoginPath";
```

- [ ] **Step 2: Replace the redirect block in `updateDataUser`**

Find this block (around lines 95-114):

```tsx
const isStudentRole = role === "student";
const onboardingDone = Boolean(refactorDataUser.onboarding_completed);

// Non-students go to dashboard; students must finish onboarding (placement)
// even when already paid — do not skip placement based on paying.
if (!isStudentRole) {
  window.location.replace(Helpers.hrefLocale("/dashboard"));
  return;
}

if (!onboardingDone) {
  window.location.replace(Helpers.hrefLocale("/onboarding/placement"));
  return;
}

if (paying) {
  window.location.replace(Helpers.hrefLocale("/dashboard"));
} else {
  window.location.replace(Helpers.hrefLocale("/activate-account"));
}
```

Replace with:

```tsx
const onboardingDone = Boolean(refactorDataUser.onboarding_completed);

const target = getPostLoginPath({ role, paying, onboardingDone });
window.location.replace(Helpers.hrefLocale(target));
```

- [ ] **Step 3: Replace the redirect in `componentDidMount`**

Find (around lines 207-219):

```tsx
async componentDidMount() {
  const user = Auth.getDataUser();
  if (user) {
    const isStudentRole =
      user?.role?.id === "student" || user?.role?.name === "Student";
    if (isStudentRole && !user?.onboarding_completed) {
      window.location.replace(Helpers.hrefLocale("/onboarding/placement"));
    } else {
      window.location.replace(Helpers.hrefLocale("/dashboard"));
    }
  }
  await this.closeLoader();
}
```

Replace with:

```tsx
async componentDidMount() {
  const user = Auth.getDataUser();
  if (user) {
    const target = getPostLoginPath({
      role: user?.role?.id,
      paying: user?.paying,
      onboardingDone: user?.onboarding_completed,
    });
    window.location.replace(Helpers.hrefLocale(target));
  }
  await this.closeLoader();
}
```

- [ ] **Step 4: Type-check**

Run:
```bash
bunx tsc --noEmit
```

Expected: no errors. If `Auth.getDataUser()` return type doesn't include `paying`, that's existing-code typing; no change needed for v1.

- [ ] **Step 5: Smoke test the student flow is unchanged**

Run:
```bash
bun run dev
```

Log in as an existing student account. Confirm: still lands on `/dashboard` (or `/onboarding/placement` if onboarding incomplete, or `/activate-account` if not paying). Behavior must match pre-change exactly.

- [ ] **Step 6: Commit**

```bash
git add 'src/app/(public)/login/LoginClient.tsx'
git commit -m "refactor(auth): route post-login through getPostLoginPath helper"
```

---

## Task 8: Create `middleware.ts` to gate `/teacher/*` by role

Next.js middleware runs at edge before any page render. Block non-teachers from `/teacher/*`.

**Files:** Create: `middleware.ts` (project root)

- [ ] **Step 1: Confirm no existing middleware.ts**

Run:
```bash
test -f middleware.ts && echo "EXISTS — STOP" || echo "OK to create"
```

If exists, halt and merge into the existing file rather than overwriting.

- [ ] **Step 2: Create `middleware.ts`**

Write `middleware.ts` at project root:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  // Build a response we can mutate cookies on.
  let res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
          res = NextResponse.next({ request: { headers: req.headers } });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: "", ...options });
          res = NextResponse.next({ request: { headers: req.headers } });
          res.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No session: send to login.
  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?redirect=${encodeURIComponent(req.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }

  // Has session but wrong role: send away.
  const role = (user.user_metadata as { role?: string } | undefined)?.role;
  if (role !== "teacher") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/teacher/:path*"],
};
```

- [ ] **Step 3: Verify `@supabase/ssr` is installed**

Run:
```bash
grep '"@supabase/ssr"' package.json
```

Expected: a version line (e.g. `"@supabase/ssr": "^0.5.0"`). If missing:

```bash
bun add @supabase/ssr
```

- [ ] **Step 4: Type-check**

Run:
```bash
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Smoke test middleware (anonymous)**

Run dev server, in incognito window visit `http://localhost:3000/teacher/dashboard`. Expected: 308/307 redirect to `/login?redirect=%2Fteacher%2Fdashboard`. (The dashboard page doesn't exist yet — middleware fires before route resolution and redirects on no session.)

- [ ] **Step 6: Smoke test middleware (student)**

Log in as a student. Visit `http://localhost:3000/teacher/dashboard`. Expected: redirect to `/dashboard` (the student home).

(Teacher session smoke test happens after Task 13 when the dashboard page exists.)

- [ ] **Step 7: Commit**

```bash
git add middleware.ts package.json bun.lockb
git commit -m "feat(auth): gate /teacher/* via middleware reading Supabase session role"
```

---

## Task 9: Create teacher route folder and layout

Establishes the `(app)/teacher/` namespace and the layout component slot.

**Files:** Create:
- `src/app/(app)/teacher/layout.tsx`

- [ ] **Step 1: Create the layout file**

Write `src/app/(app)/teacher/layout.tsx`:

```tsx
import { ReactNode } from "react";
import { TeacherShell } from "@/components/teacher/shell";

export const metadata = {
  title: "Pebbo · Teacher",
  description: "Pebbo Teacher Portal",
};

export default function TeacherAppLayout({ children }: { children: ReactNode }) {
  return <TeacherShell>{children}</TeacherShell>;
}
```

The layout imports the shell from a barrel that we'll create in Task 12. Build will fail until then — expected.

- [ ] **Step 2: Skip type-check this step**

Type-check will fail because `TeacherShell` isn't created yet. Continue to Task 10.

- [ ] **Step 3: No commit yet** — wait until shell exists.

---

## Task 10: Create the placeholder dashboard page

A trivial page that just renders some text. Confirms the route resolves once the shell is in place.

**Files:** Create: `src/app/(app)/teacher/dashboard/page.tsx`

- [ ] **Step 1: Write the placeholder page**

```tsx
export const metadata = {
  title: "Dashboard · Pebbo Teacher",
};

export default function TeacherDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-display">Teacher Dashboard</h1>
      <p className="text-ink-muted mt-2">
        Phase 1 placeholder. Real content lands in Phase 2.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: No commit yet** — needs the shell.

---

## Task 11: Build TeacherSidebar

Vertical nav with three items (Dashboard, Classrooms, Quizzes). Highlights the active item by matching `pathname`.

**Files:** Create: `src/app/components/teacher/shell/TeacherSidebar.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ClipboardList } from "lucide-react";
import { cn } from "@/src/app/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/teacher/dashboard", Icon: LayoutDashboard },
  { label: "Classrooms", href: "/teacher/classrooms", Icon: Users },
  { label: "Quizzes", href: "/teacher/quizzes", Icon: ClipboardList },
] as const;

export function TeacherSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col gap-1 border-r border-border bg-surface-1 px-3 py-6"
      style={{ width: "var(--teacher-nav-w)" }}
      aria-label="Teacher navigation"
    >
      {/* Logo lockup — match student-side. Replace src after design hands off the asset. */}
      <Link href="/teacher/dashboard" className="mb-6 px-3">
        <span className="text-2xl font-display text-brand">Pebbo</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, href, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-tint text-brand"
                  : "text-ink hover:bg-surface-2 hover:text-ink-strong",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: Verify `cn` utility exists**

Run:
```bash
grep -rn 'export.*cn\s*=\|export function cn' src/app/utils 2>/dev/null | head
```

If `cn` is not exported from `src/app/utils`, shadcn's default `lib/utils.ts` will have it. Adjust the import to wherever it lives:
```bash
grep -rn 'export.*cn' src 2>/dev/null | grep -v node_modules | head
```

If found at e.g. `src/lib/utils.ts`, change the import in `TeacherSidebar.tsx` to `import { cn } from "@/src/lib/utils";`. If absent, create:

`src/app/utils/cn.ts`:
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

And add `export { cn } from "./cn";` to `src/app/utils/index.ts` (or the barrel — check what exists).

`clsx` and `tailwind-merge` are already dependencies (verified in `package.json`).

- [ ] **Step 3: Type-check**

Run:
```bash
bunx tsc --noEmit
```

Expected: no errors. Build will still fail because `TeacherShell` doesn't exist — that's the next task.

- [ ] **Step 4: No commit yet.**

---

## Task 12: Build TeacherHeader

Top bar with the avatar dropdown (Profile / Log out).

**Files:** Create: `src/app/components/teacher/shell/TeacherHeader.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface TeacherHeaderProps {
  userInitials?: string;
  userName?: string;
}

export function TeacherHeader({
  userInitials = "T",
  userName = "Teacher",
}: TeacherHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    // Phase 1: minimal logout — clear local session and bounce to login.
    // Phase 2 may upgrade this to call /api/auth/logout for cookie cleanup.
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* fall through */
    }
    router.push("/login");
  };

  return (
    <header
      className="flex items-center justify-between border-b border-border bg-surface-0 px-6"
      style={{ height: "var(--teacher-header-h)" }}
    >
      <div className="text-sm text-ink-muted">{/* breadcrumbs slot — Phase 2+ */}</div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2"
            aria-label="Open user menu"
          >
            <span className="hidden text-sm text-ink-strong md:inline">{userName}</span>
            <Avatar className="h-9 w-9">
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[180px]">
          <DropdownMenuItem onSelect={() => router.push("/teacher/profile")}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
```

- [ ] **Step 2: Type-check**

Run:
```bash
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: No commit yet.**

---

## Task 13: Build TeacherShell composite + barrel

Glues sidebar + header + main slot. The shell is what the route layout renders.

**Files:** Create:
- `src/app/components/teacher/shell/TeacherShell.tsx`
- `src/app/components/teacher/shell/index.ts`
- `src/app/components/teacher/README.md`

- [ ] **Step 1: Write the shell**

`src/app/components/teacher/shell/TeacherShell.tsx`:

```tsx
import { ReactNode } from "react";
import { TeacherSidebar } from "./TeacherSidebar";
import { TeacherHeader } from "./TeacherHeader";

export interface TeacherShellProps {
  children: ReactNode;
}

export function TeacherShell({ children }: TeacherShellProps) {
  return (
    <div className="flex min-h-screen bg-surface-0">
      <TeacherSidebar />
      <div className="flex flex-1 flex-col">
        <TeacherHeader />
        <main className="flex-1 overflow-y-auto bg-surface-1">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write the barrel export**

`src/app/components/teacher/shell/index.ts`:

```ts
export { TeacherShell, type TeacherShellProps } from "./TeacherShell";
export { TeacherSidebar } from "./TeacherSidebar";
export { TeacherHeader, type TeacherHeaderProps } from "./TeacherHeader";
```

- [ ] **Step 3: Write the folder README**

`src/app/components/teacher/README.md`:

```markdown
# Teacher portal components

Composed components specific to the teacher portal. Follows the family-resemblance contract with the student dashboard (see `DESIGN.md` and memory note `project_teacher-portal-direction.md`).

- `shell/` — TeacherShell, TeacherSidebar, TeacherHeader (Phase 1)
- `dashboard/` — dashboard cards (Phase 2)
- `classroom/` — list + detail tabs (Phase 3)
- `quiz/` — list + authoring (Phase 4)
- `student/` — student detail (Phase 5)
- `flows/` — cross-cutting modals like AssignQuizModal (Phase 4)

Primitives (`Button`, `Card`, `Dialog`, etc.) live in `src/app/components/ui/` (shadcn). Don't fork primitives here — extend them via composition.

Visual parity is enforced by manual PR review. When in doubt, open the student-side equivalent in another browser tab and eyeball.
```

- [ ] **Step 4: Type-check**

Run:
```bash
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Build**

Run:
```bash
bun run build
```

Expected: build succeeds. The teacher portal layout, dashboard placeholder, sidebar, and header all compile.

- [ ] **Step 6: Commit (covers Tasks 9, 10, 11, 12, 13)**

```bash
git add 'src/app/(app)/teacher/' src/app/components/teacher/
git commit -m "feat(teacher): add shell, sidebar, header, layout, dashboard placeholder"
```

(Run a `git status` first to verify nothing unintended got staged.)

---

## Task 14: End-to-end smoke test with a real teacher account

**Files:** none (verification)

- [ ] **Step 1: Identify a teacher login**

Three teacher accounts already exist in school 1 (verified during brainstorm). To get usable credentials:

Option A — reset password for an existing teacher via Supabase admin SDK (one-off script).
Option B — manually create a single teacher account via the existing `/api/protected/admin/create_teacher` endpoint, requires logging in as an existing admin in school 1.
Option C — wait until the deferred seed plan (`docs/teacher-portal-seed-plan.md`) is executed.

Recommended for Phase 1 verification: Option A. Pick one existing teacher's email, run a short ad-hoc reset:

```bash
bun exec -- tsx -e '
  import("@supabase/supabase-js").then(({ createClient }) => {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    sb.auth.admin.listUsers().then(({ data }) => {
      const teacher = data.users.find(u => u.user_metadata?.role === "teacher" && u.user_metadata?.school_id === 1);
      if (!teacher) { console.error("no teacher in school 1"); return; }
      console.log("Resetting password for", teacher.email);
      sb.auth.admin.updateUserById(teacher.id, { password: "phase1test123" })
        .then(() => console.log("OK. Login with", teacher.email, "/ phase1test123"));
    });
  });
'
```

(Alternative: write `scripts/reset-teacher-password.ts` properly if `bun exec -- tsx -e` syntax misbehaves.)

- [ ] **Step 2: Log in as the teacher**

Run dev server, visit `http://localhost:3000/login`, sign in with the credentials. Expected: redirected to `/teacher/dashboard`. Page renders TeacherShell with sidebar (Dashboard active) + header (avatar fallback) + placeholder main content.

- [ ] **Step 3: Sidebar nav smoke**

Click "Classrooms" in the sidebar. Expected: 404 page (or nearest Next.js fallback) — that route doesn't exist yet, by design. The middleware should NOT redirect away — confirms middleware allows teacher into `/teacher/*` even when the page is missing.

Click "Dashboard" — back to the placeholder. Confirms active-state highlight switches.

- [ ] **Step 4: Header avatar dropdown smoke**

Click avatar in top-right. Dropdown opens with "Profile" and "Log out". Click "Log out". Expected: `/api/auth/logout` is called, browser ends up on `/login`. Refreshing the browser should NOT auto-login (cookie cleared).

- [ ] **Step 5: Cross-role smoke**

Log in as a student account. Visit `http://localhost:3000/teacher/dashboard`. Expected: redirected to `/dashboard` (student home) by middleware.

- [ ] **Step 6: No commit needed for Task 14.**

---

## Task 15: Visual parity sanity check (manual review)

**Files:** none (manual)

- [ ] **Step 1: Open student and teacher portals side-by-side**

In one browser tab: `http://localhost:3000/dashboard` (student, logged in).
In another: `http://localhost:3000/teacher/dashboard` (teacher, logged in).

- [ ] **Step 2: Eyeball the chrome**

Compare:
- Sidebar width — should be `15rem` on both. If the student sidebar uses something else, check `_variable.scss` and adjust the `--teacher-nav-w` CSS var to match the student-side computed value.
- Header height — both should be `5rem`.
- Brand orange — student-side accents and teacher-side active-nav highlight should be visually identical (or close enough that they read as the same orange).
- Font — body text on both should be Inter; headings on teacher-side use Advercase if available.

- [ ] **Step 3: Note any drift in DESIGN.md**

If you find a clear miss (e.g., student-side uses `1rem` padding and teacher-side uses `0.5rem`), record the gap in `DESIGN.md` Section 9 ("Open inconsistencies") rather than fixing on the fly. The teacher portal can absorb the fix in a Phase 1.5 polish pass without rebuilding.

- [ ] **Step 4: Capture before/after screenshots (optional but recommended)**

Drop screenshots of both portals into `docs/visual-parity-snapshots/2026-05-07-phase1.png` (or similar). Useful evidence for client review and a baseline for future drift detection.

- [ ] **Step 5: Commit (if anything changed)**

If you adjusted CSS vars or DESIGN.md, commit those tweaks:
```bash
git add src/app/assets/scss/index.scss DESIGN.md docs/visual-parity-snapshots/ 2>/dev/null
git commit -m "chore(theme): align teacher chrome dimensions with student portal"
```

If nothing changed, no commit.

---

## Phase 1 done-criteria

Phase 1 is complete when ALL of the following hold:

- [ ] `bunx tsc --noEmit` returns no errors.
- [ ] `bun run lint` passes.
- [ ] `bun run build` succeeds.
- [ ] Anonymous user visiting `/teacher/dashboard` is redirected to `/login`.
- [ ] Student user visiting `/teacher/dashboard` is redirected to `/dashboard`.
- [ ] Teacher user visiting `/teacher/dashboard` sees the placeholder page inside TeacherShell.
- [ ] Sidebar shows Dashboard / Classrooms / Quizzes; active item is highlighted.
- [ ] Avatar dropdown opens and "Log out" works.
- [ ] Visual parity check completed (Task 15).
- [ ] All commits land cleanly with no stray files.

---

## Phase 2+ — to be planned separately

When Phase 1 ships, draft Phase 2 (Dashboard cards) as a separate plan:
`docs/superpowers/plans/<DATE>-teacher-portal-phase2-dashboard.md`

Phase 2 covers: WelcomeStrip, MyClassroomsCard, ActiveAssignmentsCard (with shadcn Progress), QuickActionsCard, StudentsNeedingSupportCard. Wires up the analytics endpoints. ~3-4 days.

Phase 3+ continues per `docs/superpowers/specs/2026-05-07-teacher-portal-design.md` Section 5 build sequence.

---

## Self-review notes

Skim of the spec against this plan:

- §1 architecture (file layout, middleware, login redirect, data flow) → covered Tasks 8, 6, 7, 9-13. ✓
- §2.1 file layout for Phase 1 surfaces → covered. ✓
- §2.2 middleware → Task 8. ✓
- §2.3 login redirect → Tasks 6, 7. ✓
- §3 theming → Tasks 3, 4, 5. ✓ (using v3 syntax instead of v4 `@theme`; documented in Goal section)
- §3.4 brand orange canonicalization → Task 3 uses `#FF5000` exclusively. ✓
- §4 per-page implementation — Phase 1 only covers shell + placeholder dashboard. Other pages defer. ✓
- §5 build sequence steps 1–2 (Foundation, Shell) → fully covered. ✓
- §7 Definition of done — partial (Phase 1 subset). The wider DoD applies to v1 as a whole.

Placeholder scan: no TBDs, no "fill in details", no abstract test references. Code blocks inline for every code change. ✓

Type consistency: `getPostLoginPath` signature matches usage in LoginClient. `TeacherShellProps` / `TeacherHeaderProps` exported and consumed correctly. Sidebar `cn` import has a fallback path documented. ✓

One known divergence from spec: spec says "Tailwind v4 + `@theme` block." Repo has v3.4. Plan uses v3 syntax. This is a deliberate downgrade — upgrading Tailwind during a feature build is high-risk; the v3 path is functionally equivalent for our token shape. Note exposed in plan's Goal section.
