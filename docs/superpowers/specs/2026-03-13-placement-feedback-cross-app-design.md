# Placement Feedback Cross-App Design

Date: 2026-03-13  
Status: Drafted and reviewed  
Scope: `pebbo_mvp-oct` + `question-viewer`

## 1) Context

Client asked for three tracks:

1. `pebbo.io` placement-test completion detection behavior must be correct:
   - If placement is not done, placement test should keep reappearing on login until completed, even for paid users.
2. `pebbo.io` top-nav mute icon next to language switch.
3. `question-viewer` placement-focused feedback portal:
   - Separate route for placement feedback/insights
   - Placement ranking
   - Best category
   - User pattern insight (reuse monitoring where already available)

Confirmed decisions:

- Ranking metric: `score / total_questions` (raw placement ratio).
- "Subject" means category.
- Best category view: show both placement best category and live best category.
- `question-viewer` placement feedback should be a separate route.

## 2) Goals and Non-Goals

### Goals

- Ensure onboarding/placement gate behavior is deterministic and resilient to stale session data.
- Add user-facing global mute toggle in Pebbo top nav near language switch.
- Add a dedicated placement-feedback dashboard route in question-viewer.
- Reuse existing monitoring/user-pattern capabilities where available instead of duplicating.

### Non-Goals

- Replacing existing `question-viewer` `/reports` bug/feedback dashboard.
- Reworking the entire onboarding flow UX.
- Large schema redesign of analytics domain.

## 3) Work Decomposition

This request is implemented as three sub-projects:

### Track A: Pebbo placement completion behavior hardening

- Verify current gate logic and close stale-data edge cases.

### Track B: Pebbo top-nav mute icon

- Add mute toggle and persistence.

### Track C: Question-viewer placement feedback portal

- Add new route and APIs for placement-specific insights.

## 4) Track A Design (`pebbo_mvp-oct`)

### A.1 Current behavior summary

- `students.onboarding_completed` is set to true in placement submit route.
- Auth flow redirects students with `onboarding_completed=false` to `/onboarding/placement`.

### A.2 Gap and fix strategy

Potential issue: stale local/session user data can cause incorrect gate decision.

Design:

- In authentication flow, before gate decision for student users:
  - always fetch authoritative `onboarding_completed` from server (DB-backed source), then branch.
  - client/session cached values can be used for optimistic UI only, never for final gate authority.
  - gate check must call a non-cacheable endpoint (`Cache-Control: no-store`) on every post-login bootstrap and after auth token refresh.
  - do not use SWR/RTK cached values for gate decisions; cache can hydrate placeholders only.
  - if authoritative gate check fails (network/system error), fail closed for student users and route to `/onboarding/placement` until a successful authoritative check is completed.
- Keep gating rule explicit:
  - if `onboarding_completed=false` -> force `/onboarding/placement`
  - paid status must not bypass this.

### A.3 Acceptance criteria

- Paid + incomplete user always lands in placement flow.
- Complete user never gets forced back to placement.
- Behavior remains correct across reload/login/session refresh.

## 5) Track B Design (`pebbo_mvp-oct`)

### B.1 UX placement

- Add mute icon/button in navbar right next to language switch control.

### B.2 Audio state model

- Global mute preference:
  - persisted in `localStorage` (`pebbo_audio_muted=true|false`)
  - default unmuted for first-time users.

### B.3 Integration points

- Existing sound producers (dashboard sounds, exercise sounds) must read a single mute source of truth.
- Toggle updates should immediately apply without page reload.
- Mute must govern all app audio channels:
  - UI SFX
  - background music
  - TTS playback
- For TTS, mute prevents auto-play and pauses active playback immediately when toggled on.

### B.4 Acceptance criteria

- Mute state persists across reload/login.
- Audio-triggering UI respects mute consistently.
- Navbar control appears in correct position and style.

## 6) Track C Design (`question-viewer`)

### C.1 Route and IA

- New route: `/placement-feedback`
- Existing `/reports` remains for app bug/feedback reports.
- Existing `/monitoring` remains for behavior analytics; placement route consumes or reuses where relevant.

### C.2 API surface

Add placement-feedback APIs:

- Authorization:
  - all `/api/placement-feedback/*` routes require admin/teacher auth parity with existing monitoring routes.

- `GET /api/placement-feedback/summary`
  - total users, completed placement count, incomplete count.
- `GET /api/placement-feedback/rankings`
  - list ordered by `score / total_questions` desc.
  - supports pagination with `limit` and `offset`:
    - default limit: 50
    - max limit: 200
  - includes `total_count` in response.
  - never returns an unbounded full dataset.
- `GET /api/placement-feedback/best-categories`
  - returns per-user rows only:
    - `user_id`
    - `placement_best_category`
    - `live_best_category`
    - optional `placement_best_ratio`
    - optional `live_best_ratio`
  - aggregation, if required later, is a separate endpoint and out of scope.
- `GET /api/placement-feedback/user-patterns`
  - must call the same monitoring service layer used by `/monitoring` (no duplicated query logic in placement-feedback routes).
  - fixed response schema:
    - `source: "monitoring"`
    - `window: { start, end }`
    - `metrics: { usageDurationSec: number | null, frequentQuestions: array, activityIntensity: number | null }`
    - `status: "ok" | "partial" | "empty"`
  - if monitoring data is unavailable for user/window, return `status="empty"` with empty metrics and HTTP 200.
  - reserve HTTP 5xx for true system errors only.

### C.3 UI widgets

- Placement completion KPI cards
- Ranking table (`score`, `total_questions`, ratio)
- Best category cards/tables:
  - placement best category
  - live best category
- User patterns section:
  - usage duration proxy
  - frequently appearing questions
  - activity intensity

### C.4 Data rules

- Ranking formula:
  - `placement_ratio = score / total_questions`
  - normalize score to count-correct domain before ratio: `0 <= score <= total_questions`
  - rows violating this domain are excluded and logged with structured warning metadata.
  - service-layer numeric precision for ratio: decimal-equivalent precision (`scale=6`) to avoid float ordering drift.
  - eligibility: include only rows where `total_questions > 0` and `score IS NOT NULL`
  - ordering: `placement_ratio DESC`, `total_questions DESC`, `user_id ASC` (stable tie-break)
  - display: round ratio only for UI; sorting uses full-precision numeric value.
- Placement best category:
  - derived from placement result detail and question->category mapping.
- Live best category:
  - derived from ongoing category performance source (existing student/category score source).
- Best category deterministic tie-break:
  - if multiple categories share max ratio, tie-break by:
    - `attempt_count DESC`
    - then `correct_count DESC`
    - then `category_name ASC`
  - if no category has attempts, return `null` with reason `NO_ATTEMPTS`.
- Usage duration:
  - estimated using event spans (first->last event in window), labeled as estimate.

## 7) Architecture Principles

- Thin route handlers; business logic in service layer.
- Reuse existing shared DB objects and monitoring services before adding new logic.
- Avoid duplicate analytics logic between `/monitoring` and `/placement-feedback`.

## 8) Error Handling

- Validate params at route boundary.
- Return stable error payloads to client.
- Log detailed internal errors server-side only.
- Graceful partial-render behavior on dashboard (one widget fail != page fail).

## 9) Testing Strategy

### Pebbo

- Placement gate matrix:
  - paid + incomplete
  - unpaid + incomplete
  - complete
- Mute persistence and immediate effect tests.

### Question-viewer

- Placement feedback route load with data and empty states.
- Ranking order correctness.
- Ranking output is deterministic across repeated calls for same dataset (stable tie-break applied).
- Best category derivation sanity.
- User patterns alignment with monitoring source data.
- API contract tests for `/user-patterns`:
  - full payload shape
  - partial payload shape
  - empty payload shape
- Tie-case tests:
  - ranking deterministic ordering under equal ratios
  - best-category deterministic tie-break under equal ratios

### Regression

- `/reports` unchanged.
- `/monitoring` unchanged.

## 10) Rollout Sequence

1. Track A (`pebbo`) gate hardening.
2. Track B (`pebbo`) mute icon + mute state integration.
3. Track C (`question-viewer`) placement-feedback APIs and route.
4. Cross-app verification with shared DB data.
5. Add temporary observability gates:
   - gate-decision log traces
   - invalid ranking-row exclusion counter
   - user-pattern empty/partial fallback-rate counter
6. Rollback criteria:
   - if error/fallback-rate exceeds baseline threshold, disable placement-feedback route and revert to previous stable state.

## 11) Risks and Mitigations

- Risk: ambiguous mapping for best category from placement details.
  - Mitigation: explicit mapping utility with fallback label handling.
- Risk: stale auth/session data causing false gate behavior.
  - Mitigation: server refresh before gate branch.
- Risk: duplicated patterns metrics across routes.
  - Mitigation: shared service functions in question-viewer.

## 12) Done Criteria

- Placement completion gating behaves as specified for paid and unpaid users.
- Mute icon exists next to language switch and controls app audio globally.
- `/placement-feedback` exists and surfaces:
  - completion status,
  - ranking by raw score ratio,
  - both best category variants,
  - user patterns (reused from monitoring where applicable).
