# Question Viewer Monitoring Design

Date: 2026-03-13  
Status: Approved for spec drafting  
Owner: Agent + User

## 1) Context

The `question-viewer` app is now the admin portal for clients. It already has a `reports` dashboard for user bug reports and feedback originating from the Pebbo main app.  
We need a **new, separate monitoring route** in `question-viewer` for student activity analytics, while both apps continue to share the same database.

Key constraints confirmed:

- Shared DB between Pebbo main app and `question-viewer`
- Keep existing `reports` functionality unchanged
- Add a new dedicated monitoring route
- Reuse existing monitoring DB elements (tables/functions) where applicable
- No additional access gate in `question-viewer` for this monitoring route (current decision)

## 2) Goals and Non-Goals

### Goals

- Add a first-class `/monitoring` dashboard route in `question-viewer`
- Expose monitoring metrics via new `question-viewer` APIs under `/api/monitoring/*`
- Reuse existing shared DB monitoring data and counting semantics
- Keep architecture maintainable via service-layer separation (thin routes, reusable services)

### Non-Goals

- Replacing or refactoring existing `/reports` dashboard behavior
- Rebuilding the full monitoring ingestion pipeline in `question-viewer`
- Introducing role/session hard gates in this phase

## 3) Selected Approach

Approach: **Option 2 (Service-layer architecture)**

Why:

- Prevents route-level query sprawl
- Centralizes metric logic (dedup rules, percentile calc, windows)
- Keeps API handlers small and testable
- Eases future auth/scoping changes with minimal churn

Hard handler rule:

- Route handlers only do request parsing/validation, service invocation, and response mapping.
- Route handlers do not contain DB query logic or metric business logic.

## 4) Information Architecture

### Existing Route (unchanged)

- `/reports` -> bug reports and feedback dashboard

### New Route

- `/monitoring` -> activity monitoring dashboard

### New API Namespace

- `/api/monitoring/active-users`
- `/api/monitoring/activity-timeline`
- `/api/monitoring/top-questions`
- `/api/monitoring/network-clusters`
- `/api/monitoring/speed-metrics`

## 5) File Structure

```text
src/
  app/
    monitoring/
      page.tsx
    api/
      monitoring/
        active-users/route.ts
        activity-timeline/route.ts
        top-questions/route.ts
        network-clusters/route.ts
        speed-metrics/route.ts
  lib/
    monitoring/
      client.ts
      types.ts
      services/
        activeUsers.ts
        activityTimeline.ts
        topQuestions.ts
        networkClusters.ts
        speedMetrics.ts
        index.ts
```

## 6) API Contracts

All endpoints return:

```json
{
  "success": true,
  "data": {}
}
```

On failure:

```json
{
  "success": false,
  "error": "string"
}
```

### 6.1 `GET /api/monitoring/active-users`

Query:

- `period`: `day | week | month` (default `week`)

Response data:

- `period`
- `activeUsers` (distinct users in window)

### 6.2 `GET /api/monitoring/activity-timeline`

Query:

- `user_id` (required)
- `days` (default `7`, bounded)
- `limit` (default `100`, bounded)

Response data:

- `items[]` with `event_type`, `path`, `question_id`, `event_ts`, `region`, `metadata`

### 6.3 `GET /api/monitoring/top-questions`

Query:

- `days` (default `7`)
- `limit` (default `10`)

Response data:

- `items[]` with `question_id`, `views`, `unique_users`

Counting rule:

- Distinct `(session_id, question_id)` in the selected time window

### 6.4 `GET /api/monitoring/network-clusters`

Query:

- `days` (default `7`)
- `limit` (default `20`)

Response data:

- `items[]` with `network_hash`, `region`, `users_count`, `samples_count`, optional `user_ids`

Rule:

- Include clusters where `users_count > 1`

### 6.5 `GET /api/monitoring/speed-metrics`

Query:

- `days` (default `7`)

Response data:

- Per metric (`LCP`, `INP`, `TTFB`, `FCP`, `CLS`): `avg`, `p50`, `p95`, `samples`

## 7) UI Design for `/monitoring`

### Layout

- Header: “Monitoring Dashboard”
- Global controls: time window (`days`) and `Refresh all`
- Responsive card grid:
  - Active Users
  - Top Questions
  - Network Clusters
  - Speed Metrics
- Full-width panel:
  - Activity Timeline (`user_id`, `days`, `limit`, load button)

### UX Behavior

- Widget-level loading, error, empty, and success states
- Local retry/refresh per widget
- Page-level refresh for all widgets
- Timeline input validation and safe error messages
- Partial failure tolerance (one widget fails, others continue)

### Visual Language

- Match `question-viewer` admin dashboard style (not teacher-portal shell)
- Keep consistency with existing MUI + clean card/table patterns

## 8) Data and Logic Reuse

Shared DB objects from main app monitoring are reused (e.g., `activity_events`, `question_views_daily`, and related existing functions/views).  
`question-viewer` adds read-side APIs and UI composition only.

Strict phase-1 rule:

- No new monitoring tables/views/functions/migrations are created from `question-viewer` in this phase.
- Implementation is read-only against existing Pebbo monitoring objects.
- Before coding, implementation must confirm actual available monitoring objects in the shared DB inventory and map each endpoint to those objects.

Security scope note:

- Monitoring route inherits the current app-level access posture only.
- No additional role/school gating is introduced in this phase by design.

## 9) Error Handling and Observability

- Validate query params at route boundary; return `400` on invalid input
- Return generic `500` response messages to clients
- Log full internal DB errors server-side for diagnosis
- Normalize error payload shape across all monitoring APIs

## 10) Testing Strategy

### Unit Tests (service layer)

- Top question counting dedup (`session_id`, `question_id`)
- Percentile calculations for speed metrics
- Network cluster filtering threshold

### API Tests

- Param validation and status codes
- Response contract shape for success/failure

### Manual Smoke

- `/reports` unchanged
- `/reports` UI parity check after monitoring route addition
- `/api/reports/*` response behavior unchanged
- No regressions in any shared UI pieces used by `/reports`
- `/monitoring` loads all widgets
- Timeline handles valid/invalid input properly
- Individual + global refresh work

## 11) Rollout Plan

1. Scaffold `src/lib/monitoring/*` service layer
2. Implement `/api/monitoring/*` route handlers
3. Build `/monitoring` page with widget composition
4. Add navigation entry points to `/monitoring`
5. Run lint/typecheck/smoke verification
6. Ship

## 12) Risks and Mitigations

- **Risk:** Query cost on large event volume  
  **Mitigation:** Tight time-window defaults, limits, DB-side aggregation, pagination where needed

- **Risk:** Contract drift between widgets and APIs  
  **Mitigation:** Shared `types.ts` + stable endpoint response schema

- **Risk:** Future need for scoped visibility  
  **Mitigation:** Service boundary allows adding role/school filters later without rewriting page components

## 13) Acceptance Criteria

- New `/monitoring` route exists and is usable from `question-viewer`
- Existing `/reports` continues to function unchanged
- Monitoring APIs live under `/api/monitoring/*` and follow the defined contracts
- Top question frequency uses distinct `(session_id, question_id)` counting
- Dashboard remains usable even when one widget fails
