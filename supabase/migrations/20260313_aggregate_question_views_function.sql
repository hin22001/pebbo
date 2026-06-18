create or replace function public.aggregate_question_views()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.question_views_daily (day, question_id, views, unique_users)
  select
    date_trunc('day', event_ts)::date as day,
    question_id,
    -- Count each question only once per session per day
    count(distinct session_id) as views,
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
$$;
