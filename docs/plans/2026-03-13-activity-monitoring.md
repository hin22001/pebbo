# User Activity Monitoring — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an app-wide student activity monitoring system that tracks page views, question impressions, behavioral speed, network clustering, and Web Vitals — viewable by admins.

**Architecture:** Append-only `activity_events` table as event store, batched client-side tracker that sends events to `POST /api/track`, server-side enrichment (region/network hash), pre-aggregated `question_views_daily` for fast analytics. Admin reads via dedicated API routes rendered in a new admin dashboard page.

**Tech Stack:** Next.js 14 (App Router), Supabase (Postgres + Auth), Zod, Zustand, Node `crypto` built-in, `web-vitals` npm package.

---

## Phase 1: Core Event Pipeline

### Task 1: Create Database Tables

**Files:**

- Create: `supabase/migrations/20260313_activity_events.sql`

**Step 1: Write the migration SQL**

Create the file with this exact content:

```sql
-- Activity events: append-only event store
create table if not exists public.activity_events (
  id bigserial primary key,
  event_id uuid null,
  user_id uuid not null,
  session_id text not null,
  event_type text not null,
  path text null,
  question_id bigint null,
  region text null,
  network_hash text null,
  metadata jsonb not null default '{}'::jsonb,
  event_ts timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Idempotency: prevent duplicate events from client retries
create unique index if not exists uq_activity_event_id
  on public.activity_events(event_id)
  where event_id is not null;

-- Fast lookups by user + time
create index if not exists idx_activity_user_ts
  on public.activity_events(user_id, event_ts desc);

-- Fast lookups by event type + time
create index if not exists idx_activity_event_ts
  on public.activity_events(event_type, event_ts desc);

-- Fast lookups by question + time
create index if not exists idx_activity_question_ts
  on public.activity_events(question_id, event_ts desc)
  where question_id is not null;

-- Network clustering queries
create index if not exists idx_activity_network_ts
  on public.activity_events(network_hash, event_ts desc)
  where network_hash is not null;

-- Question frequency aggregation (dashboard reads)
create table if not exists public.question_views_daily (
  day date not null,
  question_id bigint not null,
  views bigint not null default 0,
  unique_users bigint not null default 0,
  primary key (day, question_id)
);

-- RLS: only service role can insert/read (API routes use service client)
alter table public.activity_events enable row level security;
alter table public.question_views_daily enable row level security;
```

**Step 2: Apply migration via Supabase MCP**

Run: `execute_sql` with the above SQL against project `qvervegypimlrnjdsnrk`

Expected: Tables created, indexes applied, RLS enabled.

**Step 3: Verify tables exist**

Run: `list_tables` via Supabase MCP

Expected: Both `activity_events` and `question_views_daily` appear.

**Step 4: Commit**

```bash
git add supabase/migrations/20260313_activity_events.sql
git commit -m "feat(monitoring): add activity_events and question_views_daily tables"
```

---

### Task 2: Validation Schema for Track Endpoint

**Files:**

- Create: `src/app/api/lib/validation/tracking/trackEventSchema.ts`

**Step 1: Write the Zod schema**

```typescript
import { z } from "zod";

const trackEventItemSchema = z.object({
  event_id: z.string().uuid().optional(),
  event_type: z.string().min(1).max(100),
  path: z.string().max(500).optional(),
  question_id: z.number().int().positive().optional(),
  event_ts: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const trackBatchSchema = z.object({
  session_id: z.string().min(1).max(200),
  events: z.array(trackEventItemSchema).min(1).max(50),
});

export type TrackBatchInput = z.infer<typeof trackBatchSchema>;
export type TrackEventItem = z.infer<typeof trackEventItemSchema>;
```

**Step 2: Commit**

```bash
git add src/app/api/lib/validation/tracking/trackEventSchema.ts
git commit -m "feat(monitoring): add Zod validation schema for /api/track"
```

---

### Task 3: Network Fingerprint Utility

**Files:**

- Create: `src/app/api/lib/utils/networkFingerprint.ts`

**Step 1: Write the utility**

```typescript
import { createHash } from "crypto";

const SALT = process.env.NETWORK_HASH_SALT || "pebbo-net-salt-2026";

function getIpPrefix(ip: string): string {
  if (!ip) return "unknown";
  const trimmed = ip.split(",")[0].trim();
  if (trimmed.includes(":")) {
    // IPv6: use /56 prefix (first 4 groups)
    const parts = trimmed.split(":");
    return parts.slice(0, 4).join(":") + "::/56";
  }
  // IPv4: use /24 prefix
  const parts = trimmed.split(".");
  if (parts.length < 4) return trimmed;
  return parts.slice(0, 3).join(".") + ".0/24";
}

export function computeNetworkHash(
  ip: string | null,
  userAgent: string | null,
): string | null {
  if (!ip) return null;
  const prefix = getIpPrefix(ip);
  const uaFamily = (userAgent || "unknown").substring(0, 50);
  const raw = `${prefix}|${uaFamily}|${SALT}`;
  return createHash("sha256").update(raw).digest("hex").substring(0, 16);
}

export function extractRegion(headers: Headers): string | null {
  return (
    headers.get("x-vercel-ip-city") ||
    headers.get("x-vercel-ip-country") ||
    null
  );
}

export function extractIp(headers: Headers): string | null {
  return (
    headers.get("x-forwarded-for") ||
    headers.get("x-real-ip") ||
    null
  );
}
```

**Step 2: Commit**

```bash
git add src/app/api/lib/utils/networkFingerprint.ts
git commit -m "feat(monitoring): add network fingerprint hash utility"
```

---

### Task 4: POST /api/track Route

**Files:**

- Create: `src/app/api/track/route.ts`

This route authenticates the user, enriches events with server-side data (region, network hash), and bulk-inserts into `activity_events`.

**Step 1: Write the route**

```typescript
import { NextResponse } from "next/server";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { trackBatchSchema } from "@/src/app/api/lib/validation/tracking/trackEventSchema";
import {
  computeNetworkHash,
  extractIp,
  extractRegion,
} from "@/src/app/api/lib/utils/networkFingerprint";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = trackBatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid payload", errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { session_id, events } = parsed.data;

    // Auth
    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const auth = new Auth(supabase);
    await auth.init();
    const userId = auth.getUserId();

    // Server-side enrichment
    const headers = new Headers(req.headers);
    const ip = extractIp(headers);
    const region = extractRegion(headers);
    const networkHash = computeNetworkHash(ip, headers.get("user-agent"));

    // Build rows
    const rows = events.map((evt) => ({
      event_id: evt.event_id || null,
      user_id: userId,
      session_id,
      event_type: evt.event_type,
      path: evt.path || null,
      question_id: evt.question_id || null,
      region,
      network_hash: networkHash,
      metadata: evt.metadata || {},
      event_ts: evt.event_ts || new Date().toISOString(),
    }));

    // Bulk insert (service client bypasses RLS)
    const serviceClient = _supabase.getServiceClient();
    const { error } = await serviceClient
      .from("activity_events")
      .insert(rows);

    if (error) {
      console.error("[track] Insert error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to store events" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      accepted: rows.length,
    });
  } catch (err: any) {
    if (err?.status === 401 || err?.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    console.error("[track] Unexpected error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
```

**Step 2: Verify route loads**

Start dev server, `curl -X POST http://localhost:3000/api/track` with no body.

Expected: 400 with "Invalid payload" (proves route is registered and Zod validation runs).

**Step 3: Commit**

```bash
git add src/app/api/track/route.ts
git commit -m "feat(monitoring): add POST /api/track bulk event ingestion route"
```

---

### Task 5: Client-Side Activity Tracker Hook

**Files:**

- Create: `src/app/hooks/useActivityTracker.ts`

This is the core client hook. It:

- Generates a session ID
- Batches events in memory
- Flushes every 10 seconds or on page unload
- Exposes `trackEvent()` for manual calls

**Step 1: Write the hook**

```typescript
"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type EventPayload = {
  event_id?: string;
  event_type: string;
  path?: string;
  question_id?: number;
  event_ts?: string;
  metadata?: Record<string, unknown>;
};

const FLUSH_INTERVAL_MS = 10_000;
const MAX_BATCH_SIZE = 50;
const TRACK_ENDPOINT = "/api/track";

function generateId(): string {
  return crypto.randomUUID();
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem("_pebbo_activity_sid");
  if (!sid) {
    sid = generateId();
    sessionStorage.setItem("_pebbo_activity_sid", sid);
  }
  return sid;
}

let eventQueue: EventPayload[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let sessionId = "";

async function flush() {
  if (eventQueue.length === 0) return;
  const batch = eventQueue.splice(0, MAX_BATCH_SIZE);
  try {
    await fetch(TRACK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, events: batch }),
      keepalive: true,
    });
  } catch {
    // Re-queue on failure (best-effort)
    eventQueue.unshift(...batch);
  }
}

export function trackEvent(
  eventType: string,
  extra?: Partial<Omit<EventPayload, "event_type" | "event_id" | "event_ts">>,
) {
  eventQueue.push({
    event_id: generateId(),
    event_type: eventType,
    path: typeof window !== "undefined" ? window.location.pathname : undefined,
    event_ts: new Date().toISOString(),
    ...extra,
  });

  if (eventQueue.length >= MAX_BATCH_SIZE) {
    flush();
  }
}

export function useActivityTracker() {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    sessionId = getSessionId();

    flushTimer = setInterval(flush, FLUSH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush();
    };
    const handleBeforeUnload = () => flush();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (flushTimer) clearInterval(flushTimer);
      flush();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (pathname && pathname !== prevPathRef.current) {
      if (prevPathRef.current) {
        trackEvent("page_exit", { path: prevPathRef.current });
      }
      trackEvent("page_view", { path: pathname });
      prevPathRef.current = pathname;
    }
  }, [pathname]);

  return { trackEvent };
}
```

**Step 2: Commit**

```bash
git add src/app/hooks/useActivityTracker.ts
git commit -m "feat(monitoring): add useActivityTracker hook with batched event flushing"
```

---

### Task 6: Integrate Tracker into App Layout

**Files:**

- Create: `src/app/components/ActivityTrackerProvider.tsx`
- Modify: `src/app/ClientProviders.tsx`

**Step 1: Create the provider component**

```typescript
"use client";

import { useActivityTracker } from "@/app/hooks/useActivityTracker";

export default function ActivityTrackerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useActivityTracker();
  return <>{children}</>;
}
```

**Step 2: Add the provider to `ClientProviders.tsx`**

Import `ActivityTrackerProvider` and wrap it inside the existing provider tree, after `Authentication` (so tracking only fires for authenticated users).

Find the `Authentication` wrapper in `ClientProviders.tsx` and wrap its children with `<ActivityTrackerProvider>`.

The exact edit depends on the current file structure. The tracker should sit **inside** `Authentication` so it only runs for logged-in users.

**Step 3: Verify tracking fires**

1. Start dev server
2. Open browser console, navigate to `/dashboard`
3. Check Network tab: after 10s, a `POST /api/track` request should fire with `page_view` events
4. Check Supabase: `select * from activity_events order by id desc limit 5` should show the events

**Step 4: Commit**

```bash
git add src/app/components/ActivityTrackerProvider.tsx src/app/ClientProviders.tsx
git commit -m "feat(monitoring): integrate activity tracker into app provider tree"
```

---

### Task 7: Emit Question Events from Exercise Flow

**Files:**

- Modify: `src/app/components/templates/QuestionPage/QuestionPage.jsx`

**Step 1: Import `trackEvent` at top of file**

```javascript
import { trackEvent } from "@/app/hooks/useActivityTracker";
```

**Step 2: Emit `question_viewed` when `activeTab` changes**

In the `componentDidUpdate` method (around line ~1466), after `activeTab` state change is detected:

```javascript
if (prevState.activeTab !== this.state.activeTab && this.state.activeTab) {
  const currentQuestion = this.state.dataQuestions?.find(
    (q) => q.id === this.state.activeTab,
  );
  if (currentQuestion) {
    trackEvent("question_viewed", {
      question_id: currentQuestion.id,
      metadata: {
        grade: currentQuestion.grade,
        category: currentQuestion.category_name,
      },
    });
  }
}
```

**Step 3: Emit `question_attempted` when answer is submitted**

In the `handleEvent("complete-question")` handler (the section that calls `postCompleteQuestion`), add right before the API call:

```javascript
trackEvent("question_attempted", {
  question_id: item.id,
  metadata: {
    time_taken: timeTaken,
    grade: item.grade,
  },
});
```

**Step 4: Verify events emit**

1. Start exercise, navigate between questions
2. Check Network tab for `/api/track` payloads containing `question_viewed` events
3. Submit an answer, verify `question_attempted` appears

**Step 5: Commit**

```bash
git add src/app/components/templates/QuestionPage/QuestionPage.jsx
git commit -m "feat(monitoring): emit question_viewed and question_attempted events from exercise"
```

---

## Phase 2: Advanced Telemetry

### Task 8: Web Vitals Reporting

**Files:**

- Create: `src/app/components/WebVitalsReporter.tsx`
- Modify: `src/app/ClientProviders.tsx`

**Step 1: Install web-vitals**

```bash
npm install web-vitals
```

**Step 2: Write the reporter component**

```typescript
"use client";

import { useReportWebVitals } from "next/web-vitals";
import { trackEvent } from "@/app/hooks/useActivityTracker";

export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const validMetrics = ["LCP", "INP", "TTFB", "FCP", "CLS"];
    if (!validMetrics.includes(metric.name)) return;

    trackEvent("web_vital", {
      metadata: {
        name: metric.name,
        value: Math.round(metric.value),
        rating: metric.rating,
        navigationType: metric.navigationType,
      },
    });
  });

  return null;
}
```

> **Note:** Next.js 14 exports `useReportWebVitals` from `next/web-vitals`. If not available, use the `web-vitals` package directly with `onLCP`, `onINP`, `onTTFB` etc.

**Step 3: Add to ClientProviders**

Import and render `<WebVitalsReporter />` alongside `<ActivityTrackerProvider>`.

**Step 4: Commit**

```bash
git add src/app/components/WebVitalsReporter.tsx src/app/ClientProviders.tsx package.json package-lock.json
git commit -m "feat(monitoring): add Web Vitals reporting (LCP, INP, TTFB)"
```

---

### Task 9: Admin Analytics API Endpoints

**Files:**

- Create: `src/app/api/protected/admin/analytics/activity-timeline/route.ts`
- Create: `src/app/api/protected/admin/analytics/active-users/route.ts`
- Create: `src/app/api/protected/admin/analytics/top-questions/route.ts`
- Create: `src/app/api/protected/admin/analytics/network-clusters/route.ts`
- Create: `src/app/api/protected/admin/analytics/speed-metrics/route.ts`

All routes follow the same auth pattern: `Supabase` → `Auth` → `UserDAO` → `assertRole(["admin"])`.

**Step 1: Activity Timeline (`GET`)**

Query params: `user_id` (required), `days` (default 7), `limit` (default 100)

```typescript
// Core query
const { data } = await serviceClient
  .from("activity_events")
  .select("event_type, path, question_id, metadata, event_ts")
  .eq("user_id", userId)
  .gte("event_ts", sinceDate.toISOString())
  .order("event_ts", { ascending: false })
  .limit(limit);
```

**Step 2: Active Users (`GET`)**

Query params: `period` ("today" | "week" | "month")

```sql
-- Distinct active users in period
select count(distinct user_id) as active_users
from activity_events
where event_ts >= $since;
```

**Step 3: Top Questions (`GET`)**

Query params: `days` (default 7), `limit` (default 20)

```sql
select question_id,
       sum(views) as total_views,
       sum(unique_users) as total_unique_users
from question_views_daily
where day >= current_date - $days
group by question_id
order by total_views desc
limit $limit;
```

**Step 4: Network Clusters (`GET`)**

```sql
select network_hash, region,
       count(distinct user_id) as user_count,
       array_agg(distinct user_id) as user_ids
from activity_events
where network_hash is not null
  and event_ts >= now() - interval '7 days'
group by network_hash, region
having count(distinct user_id) > 1
order by user_count desc
limit 50;
```

**Step 5: Speed Metrics (`GET`)**

```sql
select
  metadata->>'name' as metric_name,
  avg((metadata->>'value')::numeric) as avg_value,
  percentile_cont(0.5) within group (order by (metadata->>'value')::numeric) as p50,
  percentile_cont(0.95) within group (order by (metadata->>'value')::numeric) as p95,
  count(*) as samples
from activity_events
where event_type = 'web_vital'
  and event_ts >= now() - interval '7 days'
group by metadata->>'name';
```

**Step 6: Commit**

```bash
git add src/app/api/protected/admin/analytics/
git commit -m "feat(monitoring): add admin analytics API endpoints (timeline, active users, top questions, clusters, speed)"
```

---

### Task 10: Question Views Daily Aggregation

**Files:**

- Create: `src/app/api/cron/aggregate-question-views/route.ts`

This is a cron-safe endpoint that aggregates `question_viewed` events into `question_views_daily`. Call it via Vercel Cron or a simple `setInterval` on the server.

**Step 1: Write the aggregation route**

```typescript
import { NextResponse } from "next/server";
import { Supabase } from "@/src/app/api/lib/models/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const _supabase = new Supabase();
  const serviceClient = _supabase.getServiceClient();

  const { error } = await serviceClient.rpc("aggregate_question_views");

  if (error) {
    console.error("[cron] Aggregation error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

**Step 2: Create the Postgres function**

Apply via `execute_sql`:

```sql
create or replace function public.aggregate_question_views()
returns void as $$
begin
  insert into public.question_views_daily (day, question_id, views, unique_users)
  select
    date_trunc('day', event_ts)::date as day,
    question_id,
    count(*) as views,
    count(distinct user_id) as unique_users
  from public.activity_events
  where event_type = 'question_viewed'
    and question_id is not null
    and event_ts >= now() - interval '2 days'
  group by 1, 2
  on conflict (day, question_id)
  do update set
    views = excluded.views,
    unique_users = excluded.unique_users;
end;
$$ language plpgsql security definer;
```

**Step 3: Add Vercel cron config**

Add to `vercel.json` (create if not exists):

```json
{
  "crons": [
    {
      "path": "/api/cron/aggregate-question-views",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Step 4: Commit**

```bash
git add src/app/api/cron/aggregate-question-views/route.ts vercel.json
git commit -m "feat(monitoring): add question views aggregation cron job"
```

---

## Phase 3: Admin Dashboard UI

### Task 11: Admin Monitoring Dashboard Page

**Files:**

- Create: `src/app/(app)/admin-monitoring/page.tsx`
- Create: `src/app/(app)/admin-monitoring/AdminMonitoringClient.tsx`

**Step 1: Server page (minimal)**

```typescript
import AdminMonitoringClient from "./AdminMonitoringClient";

export default function AdminMonitoringPage() {
  return <AdminMonitoringClient />;
}
```

**Step 2: Client component**

Build the dashboard with 5 widgets:

1. **Active Users** — calls `/api/protected/admin/analytics/active-users`
2. **Student Activity Timeline** — search by user, calls `/api/protected/admin/analytics/activity-timeline`
3. **Top Questions** — calls `/api/protected/admin/analytics/top-questions`
4. **Network Clusters** — calls `/api/protected/admin/analytics/network-clusters`
5. **Speed Metrics** — calls `/api/protected/admin/analytics/speed-metrics`

Each widget: fetch on mount, display in card/table layout. Use existing MUI components from the project (ThemeProvider is already in the tree).

**Step 3: Add navigation link**

Add a link to the admin monitoring page in the sidebar/nav for admin role users. Find the sidebar configuration in `MainLayout.jsx` and add the entry.

**Step 4: Commit**

```bash
git add src/app/(app)/admin-monitoring/
git commit -m "feat(monitoring): add admin monitoring dashboard page with 5 analytics widgets"
```

---

## Environment Variables Required

Add to `.env` (and Vercel dashboard):

```
NETWORK_HASH_SALT=<generate-random-string>
CRON_SECRET=<generate-random-string>
```

---

## Summary: Task Dependency Graph

```
Task 1 (DB tables) ──────────────────────────┐
Task 2 (Zod schema)  ──────┐                 │
Task 3 (Network util) ─────┤                 │
                            ├──▶ Task 4 (API route) ──▶ Task 5 (Client hook) ──▶ Task 6 (Layout integration)
                            │                                    │
                            │                          Task 7 (Question events)
                            │                          Task 8 (Web Vitals)
                            │
                            └──▶ Task 9 (Admin API) ──▶ Task 10 (Cron aggregation)
                                                       Task 11 (Dashboard UI)
```

Tasks 1-3 can run in parallel. Task 4 depends on 1-3. Tasks 5-8 depend on 4. Tasks 9-11 depend on 1.