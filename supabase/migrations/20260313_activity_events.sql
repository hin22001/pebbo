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

-- RLS: API routes should use service role for writes/reads.
alter table public.activity_events enable row level security;
alter table public.question_views_daily enable row level security;
