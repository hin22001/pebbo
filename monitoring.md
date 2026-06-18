# User Activity Monitoring Architecture

This document defines a production-ready telemetry system for monitoring student activity across the app (not quiz performance dashboards for teachers). It supports:

- App-wide activity timeline per student
- "Speed" metrics (behavioral and web-performance)
- Probabilistic network/regional clustering
- Frequency of question appearance at scale

## Scope and Non-Goals

### In scope
- Track page/activity events from student app usage
- Build admin-facing analytics for behavior patterns
- Track question impressions and attempts
- Enable regional/network grouping for investigation

### Out of scope
- Teacher quiz-result analytics (existing separate flow)
- Exact household identity from IP (not technically reliable)
- Raw sensitive PII exposure in admin UI

## Architecture (Recommended)

Use a 2-layer model:

1. Append-only event log as source of truth (`activity_events`)
2. Pre-aggregated analytics tables for fast dashboard reads (e.g., `question_views_daily`)

This avoids hot-row contention and keeps analytics flexible.

## Data Model

### 1) Event Store: `public.activity_events`

```sql
create table if not exists public.activity_events (
  id bigserial primary key,
  event_id uuid null, -- idempotency key generated client-side
  user_id uuid not null,
  session_id uuid not null,
  event_type text not null, -- page_view, question_viewed, question_attempted, etc
  path text null,
  question_id bigint null,
  region text null,
  network_hash text null, -- sha256(ip_prefix + asn + ua_family + salt)
  metadata jsonb not null default '{}'::jsonb,
  event_ts timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists uq_activity_event_id
  on public.activity_events(event_id)
  where event_id is not null;

create index if not exists idx_activity_user_ts
  on public.activity_events(user_id, event_ts desc);

create index if not exists idx_activity_event_ts
  on public.activity_events(event_type, event_ts desc);

create index if not exists idx_activity_question_ts
  on public.activity_events(question_id, event_ts desc)
  where question_id is not null;

create index if not exists idx_activity_network_ts
  on public.activity_events(network_hash, event_ts desc)
  where network_hash is not null;
```

### 2) Aggregation Table: `public.question_views_daily`

```sql
create table if not exists public.question_views_daily (
  day date not null,
  question_id bigint not null,
  views bigint not null default 0,
  unique_users bigint not null default 0,
  primary key (day, question_id)
);
```

Do not store only `question_id + views` in one global table. It limits analysis and introduces high-contention updates under load.

## Event Taxonomy

Start with a minimal but useful set:

- `page_view`: route/page rendered
- `page_exit`: page lost focus/navigation away
- `app_heartbeat`: periodic alive ping while active
- `question_viewed`: question rendered to student
- `question_attempted`: student submitted answer
- `question_skipped`: student skipped/dismissed
- `auth_login_success`: login success
- `auth_logout`: logout
- `web_vital`: LCP/INP/TTFB samples

## Tracking Strategy

### Client tracker (primary)

Add a lightweight tracker in root app layout:

- Tracks route changes and visibility state
- Batches events every 5-10 seconds
- Sends on `visibilitychange` and `beforeunload`
- Includes `event_id` to deduplicate retries

### Server-side events (selective)

For critical actions (e.g., exercise assignment fetch, attempt submit), log server-side too.  
Middleware can capture fallback page views, but should not be the sole source because of prefetch/noise.

## API Design

### `POST /api/track`

Request shape:

```json
{
  "session_id": "uuid",
  "events": [
    {
      "event_id": "uuid",
      "event_type": "question_viewed",
      "path": "/exercise/123",
      "question_id": 5658,
      "event_ts": "2026-03-13T12:00:00.000Z",
      "metadata": {
        "subject": "math",
        "grade": 5
      }
    }
  ]
}
```

Behavior:

- Authenticate user
- Enrich with `region` and `network_hash` on server
- Bulk insert with conflict-safe dedupe on `event_id`
- Return accepted count

## "Speed" Metrics (What to show)

### Behavioral speed
- `time_to_first_action_ms` after page open
- `question_time_to_answer_ms`
- `actions_per_minute`
- `avg_session_duration_ms`

### Technical speed (Web Vitals)
- LCP, INP, TTFB by page and device class
- P50/P95 trend for last 24h/7d

This gives both "how fast student interacts" and "is app slow for this student."

## Regional / Network Clustering

Goal: find likely shared network groups, not exact co-location.

Recommended fingerprint:

- `ip_prefix` (`/24` for IPv4, `/56` for IPv6)
- ASN (if available)
- UA family (mobile/desktop + browser family)
- Salted hash:
  `network_hash = sha256(ip_prefix + asn + ua_family + salt)`

Admin dashboard should label this as:
- "Likely same network cluster"
- Confidence score based on repeated co-occurrence over time

## Question Frequency Tracking

Log `question_viewed` whenever question card/content is rendered for student.  
Then aggregate into `question_views_daily` using a scheduled job every 1-5 minutes.

Example aggregation (conceptual):

```sql
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
```

## Privacy, Security, and Retention

- Do not expose raw IP in UI
- Store only hashed network fingerprint
- Keep raw event log for bounded duration (e.g., 90 days)
- Keep aggregated tables longer for trends
- Restrict admin analytics endpoints via strict role checks
- Add RLS policies to prevent student access

## Dashboard Outputs

Minimum admin widgets:

1. Student activity timeline (last 24h / 7d)
2. Active students now/today/week
3. Slowest pages and impacted cohorts (P95)
4. Network cluster explorer (likely same wifi/region)
5. Top repeated questions (views, unique users, trend)

## Rollout Plan

### Phase 1 (MVP, 2-3 days)
- Create `activity_events` and `/api/track`
- Emit `page_view`, `question_viewed`, `question_attempted`
- Basic student timeline + top repeated questions

### Phase 2 (1 week)
- Add Web Vitals ingestion
- Add network clustering and region filters
- Add `question_views_daily` scheduled aggregation

### Phase 3 (hardening)
- Partition `activity_events` by month if volume grows
- Backpressure + retry strategy for tracker
- Alerting on ingestion failures

## Verification Checklist

1. Tracker batching sends events reliably on navigation/close
2. Duplicate event submissions do not double count
3. Dashboard queries return under target latency
4. High write test does not produce lock contention
5. Network clustering labels are probabilistic and clearly communicated
