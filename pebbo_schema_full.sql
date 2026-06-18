--
-- PostgreSQL database dump
--

\restrict Hj9gqk94NQmofEEaf7sD46WJqH7fxIJwhVNypYkQm1pOxy1zxgX8g3ekyeloqe4

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: pg_cron; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION pg_cron; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL';


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: management; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA management;


--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: pgsodium; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgsodium;


--
-- Name: pgsodium; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgsodium WITH SCHEMA pgsodium;


--
-- Name: EXTENSION pgsodium; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgsodium IS 'Pgsodium is a modern cryptography library for Postgres.';


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: supabase_functions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_functions;


--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: education_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.education_level AS ENUM (
    'primary'
);


--
-- Name: TYPE education_level; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TYPE public.education_level IS 'Education level of a user e.g. "primary, secondary" etc...';


--
-- Name: primary_years; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.primary_years AS ENUM (
    '1',
    '2',
    '3',
    '4',
    '5',
    '6'
);


--
-- Name: TYPE primary_years; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TYPE public.primary_years IS 'List of years for primary education level';


--
-- Name: subjects; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.subjects AS ENUM (
    'English',
    'Maths'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM pg_event_trigger_ddl_commands() AS ev
      JOIN pg_extension AS ext
      ON ev.objid = ext.oid
      WHERE ext.extname = 'pg_net'
    )
    THEN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_roles
        WHERE rolname = 'supabase_functions_admin'
      )
      THEN
        CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
      END IF;

      GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

      IF EXISTS (
        SELECT FROM pg_extension
        WHERE extname = 'pg_net'
        -- all versions in use on existing projects as of 2025-02-20
        -- version 0.12.0 onwards don't need these applied
        AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8.0', '0.10.0', '0.11.0')
      ) THEN
        ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
        ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

        ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
        ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

        REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
        REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

        GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
        GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      END IF;
    END IF;
  END;
  $$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


--
-- Name: aggregate_question_views(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.aggregate_question_views() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
begin
  -- Update question_views_daily using distinct session+question pairs
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


--
-- Name: calculate_placement_percentile(numeric, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_placement_percentile(p_score numeric, p_grade_level text) RETURNS numeric
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    total_count integer;
    lower_count integer;
BEGIN
    SELECT count(*) INTO total_count
    FROM public.placement_test_results
    WHERE grade_level = p_grade_level;

    IF total_count = 0 THEN
        RETURN 99.0;
    END IF;

    SELECT count(*) INTO lower_count
    FROM public.placement_test_results
    WHERE grade_level = p_grade_level AND score < p_score;
    
    RETURN round((lower_count::numeric / total_count::numeric) * 100, 1);
END;
$$;


--
-- Name: create_classroom(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_classroom(user_id_param uuid, classroom_name text) RETURNS bigint
    LANGUAGE plpgsql
    AS $$  -- Adjusted return type to BIGINT to match the type of classroom_id
DECLARE
    school_id_val BIGINT;  -- Assuming school_id is of type BIGINT
    new_classroom_id BIGINT;  -- Variable to hold the newly created classroom_id
BEGIN
    -- Attempt to retrieve the school_id from the users table for users who are either admin or teacher
    SELECT school_id INTO school_id_val FROM users WHERE user_id = user_id_param AND role IN ('admin', 'teacher');

    -- Check if the school_id was found
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User does not have school_id or is not admin or teacher';
    END IF;

    -- Proceed with the insertion using the retrieved school_id and capture the new classroom_id
    INSERT INTO classrooms (school_id, classroom_name)
    VALUES (school_id_val, classroom_name)
    RETURNING classroom_id INTO new_classroom_id;

    -- Return the new classroom_id
    RETURN new_classroom_id;

END;
$$;


--
-- Name: create_quiz(text, timestamp with time zone, timestamp with time zone, bigint, uuid, bigint[], integer, bigint[], bigint[], integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_quiz(p_quiz_name text, p_start_date timestamp with time zone, p_end_date timestamp with time zone, p_school_id bigint, p_user_id uuid, p_question_ids bigint[] DEFAULT NULL::bigint[], p_question_count integer DEFAULT 5, p_categories bigint[] DEFAULT NULL::bigint[], p_difficulties bigint[] DEFAULT NULL::bigint[], p_year integer DEFAULT NULL::integer, p_region text DEFAULT 'en'::text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_quiz_id BIGINT;
  v_selected_questions BIGINT[];
  v_result JSONB;
BEGIN
  -- Input validation
  IF p_quiz_name IS NULL OR p_quiz_name = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Quiz name is required',
      'status', 400
    );
  END IF;
  
  IF p_start_date IS NULL OR p_end_date IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Start and end dates are required',
      'status', 400
    );
  END IF;
  
  IF p_start_date >= p_end_date THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Start date must be before end date',
      'status', 400
    );
  END IF;
  
  -- Create the quiz
  INSERT INTO quizzes (quiz_name, date_created, start_date, end_date, school_id)
  VALUES (p_quiz_name, now(), p_start_date, p_end_date, p_school_id)
  RETURNING id INTO v_quiz_id;
  
  -- Add the creator
  INSERT INTO quiz_creators (user_id, quiz_id)
  VALUES (p_user_id, v_quiz_id);
  
  -- Handle question selection
  IF p_question_ids IS NOT NULL AND array_length(p_question_ids, 1) > 0 THEN
    -- Specific questions mode
    v_selected_questions := p_question_ids;
  ELSE
    -- AI selected mode - select questions based on criteria
    WITH filtered_questions AS (
      SELECT id 
      FROM primary_questions
      WHERE 
        (p_categories IS NULL OR outer_category = ANY(p_categories))
        AND (p_difficulties IS NULL OR difficulty = ANY(p_difficulties))
        AND (p_year IS NULL OR year = p_year)
        AND audited = true
      ORDER BY random()
      LIMIT p_question_count
    )
    SELECT array_agg(id) INTO v_selected_questions FROM filtered_questions;
  END IF;
  
  -- Add questions to quiz
  IF v_selected_questions IS NOT NULL AND array_length(v_selected_questions, 1) > 0 THEN
    INSERT INTO quiz_junction (quiz_id, question_id)
    SELECT v_quiz_id, q_id
    FROM unnest(v_selected_questions) AS q_id;
  END IF;
  
  -- Return success response
  v_result := jsonb_build_object(
    'success', true,
    'message', 'Quiz created successfully',
    'status', 200,
    'data', jsonb_build_object(
      'quiz_id', v_quiz_id,
      'quiz_name', p_quiz_name,
      'question_count', array_length(v_selected_questions, 1),
      'created_at', now()
    )
  );
  
  RETURN v_result;
END;
$$;


--
-- Name: create_student_data(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_student_data() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    INSERT INTO public.student_data (user_id, year)
    VALUES (NEW.user_id, NEW.year);

  RETURN NEW;
END;
$$;


--
-- Name: delete_classroom_users(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_classroom_users(_datas jsonb) RETURNS text[]
    LANGUAGE plpgsql
    AS $$

DECLARE
    _data jsonb;
    _user_id uuid;
    user_role text;
    failed_emails text[] := '{}';
BEGIN
    -- Loop through each item in the JSONB array
    FOR _data IN SELECT * FROM jsonb_array_elements(_datas)
    LOOP
        BEGIN
            -- Retrieve the user ID from the auth.users table based on the email
            SELECT user_id INTO _user_id FROM public.get_user_by_email(_data->>'email');

            -- If a user ID was found, fetch the role from the separate users table
            IF _user_id IS NOT NULL THEN
                SELECT role INTO user_role FROM public.users WHERE user_id = _user_id;

                -- Delete only if the user's role is 'student' or 'teacher'
                IF user_role = 'student' OR user_role = 'teacher' THEN
                    DELETE FROM classroom_participants
                    WHERE classroom_id = (_data->>'classroom_id')::bigint
                    AND user_id = _user_id;
                ELSE
                    -- Add to failed_emails if the role is not 'student' or 'teacher'
                    failed_emails := array_append(failed_emails, _data->>'email');
                END IF;
            ELSE
                -- Add to failed_emails if no user ID was found
                failed_emails := array_append(failed_emails, _data->>'email');
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Append the email to the failed_emails array if any exception occurs during processing
            RAISE LOG 'Failed to delete email % due to error: %, SQLSTATE: %', 
    _data->>'email', SQLERRM, SQLSTATE;

            failed_emails := array_append(failed_emails, _data->>'email');
        END;
    END LOOP;
    RETURN failed_emails;
END;
$$;


--
-- Name: delete_quiz_questions(bigint, bigint[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_quiz_questions(_quiz_id bigint, _question_ids bigint[]) RETURNS TABLE(id bigint, quiz_id bigint, question_id bigint)
    LANGUAGE plpgsql
    AS $_$DECLARE
    _question_id bigint;
BEGIN
    -- Delete rows from quiz_junction table and return the deleted rows
    RETURN QUERY
    DELETE FROM quiz_junction
    WHERE quiz_junction.quiz_id = $1
      AND quiz_junction.question_id = ANY($2)
    RETURNING quiz_junction.*;

    -- Delete rows from quiz_responses table
    DELETE FROM quiz_responses
    WHERE quiz_responses.question_id = ANY($2);

    -- Loop through each question_id in the array
    FOREACH _question_id IN ARRAY $2
    LOOP
        -- If no rows exist for this question_id in quiz_junction, set a value in user_questions
        IF NOT EXISTS (SELECT 1 FROM quiz_junction WHERE quiz_junction.question_id = _question_id) THEN
            -- Update or set a value in user_questions for the question_id
            UPDATE user_questions
            SET mutable = true -- Set the desired column and value here
            WHERE user_questions.question_id = _question_id;
        END IF;
    END LOOP;
END;$_$;


--
-- Name: generate_referral_code(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_referral_code() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    code TEXT;
BEGIN
    LOOP
        code := substr(md5(random()::text), 0, 9);
        EXIT WHEN NOT EXISTS (SELECT 1 FROM users WHERE referral_code = code);
    END LOOP;
    RETURN code;
END;
$$;


--
-- Name: get_attempting_questions(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_attempting_questions(user_id uuid, region text) RETURNS TABLE(question_id bigint, question_object jsonb)
    LANGUAGE plpgsql
    AS $$BEGIN
    -- Define the table name based on the region parameter
    IF region = 'en' THEN
        RETURN QUERY SELECT q.id, q.outer_category, q.difficulty, q.question_object_en
                     FROM primary_questions AS q
                     JOIN students AS u ON q.id = ANY(u.attempting_questions)
                     WHERE u.user_id = get_attempting_questions.user_id;
    ELSIF region = 'zh' THEN
        RETURN QUERY SELECT q.id, q.outer_category, q.difficulty, q.question_object_zh
                     FROM primary_questions AS q
                     JOIN students AS u ON q.id = ANY(u.attempting_questions)
                     WHERE u.user_id = get_attempting_questions.user_id;
    ELSE
        RAISE EXCEPTION 'Invalid region specified';
    END IF;
END;$$;


--
-- Name: get_email_by_user(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_email_by_user(_user_id uuid) RETURNS TABLE(user_id uuid, user_email character varying)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
BEGIN
    RETURN QUERY
    SELECT id AS user_id, email AS user_email FROM auth.users WHERE auth.users.id = $1;
END; $_$;


--
-- Name: get_paginated_user_daily_reports(uuid, integer, integer, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_paginated_user_daily_reports(_user_id uuid, requested_rows integer, page_number integer, specific_date date) RETURNS TABLE(date date, subject text)
    LANGUAGE plpgsql STABLE
    AS $$

BEGIN
    RETURN QUERY
SELECT 
    DATE(cq.completed_at AT TIME ZONE 'HKT') as date_hkt,
    pq.subject
FROM 
    completed_questions cq
JOIN 
    primary_questions pq ON cq.question_id = pq.id
WHERE 
    cq.user_id = _user_id
    AND (specific_date IS NULL OR DATE(cq.completed_at AT TIME ZONE 'HKT') = specific_date)

GROUP BY 
    date_hkt, pq.subject
ORDER BY 
    date_hkt, pq.subject
LIMIT requested_rows
OFFSET requested_rows * (page_number - 1);
END;
$$;


--
-- Name: FUNCTION get_paginated_user_daily_reports(_user_id uuid, requested_rows integer, page_number integer, specific_date date); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_paginated_user_daily_reports(_user_id uuid, requested_rows integer, page_number integer, specific_date date) IS 'Deprecate ASAP';


--
-- Name: get_paginated_user_weekly_reports(uuid, integer, integer, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_paginated_user_weekly_reports(_user_id uuid, requested_rows integer, page_number integer, start_date date) RETURNS TABLE(week_start date, subject text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(DATE_TRUNC('week', cq.completed_at AT TIME ZONE 'HKT')) as week_start,
        pq.subject
    FROM 
        completed_questions cq
    JOIN 
        primary_questions pq ON cq.question_id = pq.id
    WHERE 
        cq.user_id = _user_id
        AND (start_date IS NULL OR DATE(DATE_TRUNC('week', cq.completed_at AT TIME ZONE 'HKT')) = DATE(DATE_TRUNC('week', start_date AT TIME ZONE 'HKT')))

    GROUP BY 
        week_start, pq.subject
    ORDER BY 
        week_start, pq.subject
    LIMIT requested_rows
    OFFSET requested_rows * (page_number - 1);
END;
$$;


--
-- Name: FUNCTION get_paginated_user_weekly_reports(_user_id uuid, requested_rows integer, page_number integer, start_date date); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_paginated_user_weekly_reports(_user_id uuid, requested_rows integer, page_number integer, start_date date) IS 'Deprecate ASAP';


--
-- Name: get_placement_questions(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_placement_questions(p_year integer, p_limit integer DEFAULT 20) RETURNS TABLE(id bigint, outer_category smallint, difficulty smallint, question_object jsonb)
    LANGUAGE sql STABLE
    AS $$
  SELECT
    sub.id,
    sub.outer_category,
    sub.difficulty,
    sub.question_object_en AS question_object
  FROM (
    -- Priority 1: Audited drafts
    SELECT
      d.original_question_id AS id,
      d.outer_category::smallint,
      d.difficulty::smallint,
      d.question_object_en,
      d.need_image,
      d.image_approved
    FROM primary_questions_drafts d
    WHERE
      d.audited = TRUE
      AND d.year::smallint = p_year
      AND (d.is_flagged IS NULL OR d.is_flagged = FALSE)
      AND (
          (p_year = 2 AND (
              (d.need_image = TRUE AND d.image_approved = TRUE)
              OR
              (d.need_image = FALSE)
          ))
          OR
          (p_year = 5 AND (
              (d.need_image = TRUE AND d.image_approved = TRUE)
              OR
              (d.need_image = FALSE AND d.original_question_id < 9700)
          ))
          OR
          (p_year NOT IN (2, 5) AND (
              (d.need_image = TRUE AND d.image_approved = TRUE)
              OR
              (d.need_image = FALSE)
          ))
      )

    UNION ALL

    -- Priority 2: Audited primary questions (only if no draft exists)
    SELECT
      p.id,
      p.outer_category,
      p.difficulty,
      p.question_object_en,
      p.need_image,
      p.image_approved
    FROM primary_questions p
    WHERE
      p.audited = TRUE
      AND p.year = p_year
      AND (p.is_flagged IS NULL OR p.is_flagged = FALSE)
      AND NOT EXISTS (
        SELECT 1 FROM primary_questions_drafts d
        WHERE d.original_question_id = p.id
      )
      AND (
          (p_year = 2 AND (
              (p.need_image = TRUE AND p.image_approved = TRUE)
              OR
              (p.need_image = FALSE)
          ))
          OR
          (p_year = 5 AND (
              (p.need_image = TRUE AND p.image_approved = TRUE)
              OR
              (p.need_image = FALSE AND p.id < 9700)
          ))
          OR
          (p_year NOT IN (2, 5) AND (
              (p.need_image = TRUE AND p.image_approved = TRUE)
              OR
              (p.need_image = FALSE)
          ))
      )
  ) sub
  ORDER BY random()
  LIMIT p_limit;
$$;


--
-- Name: get_questionobj_bycategoryregion(integer[], integer[], text, uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_questionobj_bycategoryregion(categories integer[], difficulties integer[], region text, _user_id uuid, year integer) RETURNS TABLE(id bigint, outer_category smallint, difficulty smallint, question_object jsonb)
    LANGUAGE plpgsql
    AS $_$
DECLARE
    i int;
BEGIN
    FOR i IN 1 .. array_length(categories, 1) LOOP
        IF region = 'en' THEN
            RETURN QUERY 
            SELECT 
                q.id, 
                q.outer_category, 
                q.difficulty, 
                q.question_object_en AS question_object
            FROM 
                public.exercise_questions_effective q
            WHERE 
                q.outer_category = categories[i] 
                AND q.difficulty = difficulties[i] 
                AND q.year::integer = $5 
                AND q.audited = TRUE
            ORDER BY random() 
            LIMIT 3;
        ELSIF region = 'zh' THEN
            RETURN QUERY 
            SELECT 
                q.id, 
                q.outer_category, 
                q.difficulty, 
                q.question_object_zh AS question_object
            FROM 
                public.exercise_questions_effective q
            WHERE 
                q.outer_category = categories[i] 
                AND q.difficulty = difficulties[i] 
                AND q.year::integer = $5 
                AND q.audited = TRUE
            ORDER BY random()
            LIMIT 3;
        ELSE
            RAISE EXCEPTION 'Region not supported: %', region;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: get_questionobj_bycategoryregion_optimized(integer[], integer[], text, uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_questionobj_bycategoryregion_optimized(categories integer[], difficulties integer[], region text, _user_id uuid, year integer) RETURNS TABLE(id bigint, outer_category smallint, difficulty smallint, question_object jsonb)
    LANGUAGE sql STABLE
    AS $_$
    SELECT 
        q.id, 
        q.outer_category, 
        q.difficulty, 
        CASE 
            WHEN region = 'en' THEN q.question_object_en 
            WHEN region = 'zh' THEN q.question_object_zh 
            ELSE NULL 
        END AS question_object
    FROM unnest(categories) WITH ORDINALITY AS c(cat_id, ord)
    CROSS JOIN LATERAL (
        SELECT * FROM (
            -- Audited Drafts (Priority 1)
            SELECT 
                d.original_question_id as id, 
                d.outer_category::smallint, 
                d.difficulty::smallint, 
                d.year::smallint as year, 
                d.audited, 
                d.question_object_en, 
                d.question_object_zh
            FROM primary_questions_drafts d
            WHERE d.audited = TRUE 
              AND d.outer_category = c.cat_id 
              AND d.difficulty = difficulties[ord] 
              AND d.year::smallint = $5
            
            UNION ALL
            
            -- Audited Primary Questions (Priority 2, only if no draft exists)
            SELECT 
                p.id, 
                p.outer_category, 
                p.difficulty, 
                p.year, 
                p.audited, 
                p.question_object_en, 
                p.question_object_zh
            FROM primary_questions p
            WHERE p.audited = TRUE 
              AND p.outer_category = c.cat_id 
              AND p.difficulty = difficulties[ord] 
              AND p.year = $5
              AND NOT EXISTS (
                  SELECT 1 FROM primary_questions_drafts d 
                  WHERE d.original_question_id = p.id
              )
        ) sub
        ORDER BY random()
        LIMIT 3
    ) q;
$_$;


--
-- Name: get_questionobj_bypredictionregion(integer[], integer[], text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_questionobj_bypredictionregion(categories integer[], difficulties integer[], region text, _user_id uuid) RETURNS TABLE(id bigint, outer_category smallint, difficulty smallint, question_object jsonb)
    LANGUAGE plpgsql
    AS $$DECLARE
    i int;
    _year int;
BEGIN
    --RAISE LOG 'getAIQuestions categories (%) difficulties (%)', categories, difficulties;
    -- Fetch the year from students table
    SELECT students.year INTO _year FROM students WHERE students.user_id = _user_id;

    -- Check if year was successfully retrieved
    IF _year IS NULL THEN
        RAISE EXCEPTION 'No year found for user_id: %', _user_id;
    END IF;

    FOR i IN 1 .. array_length(categories, 1) LOOP
        IF region = 'en' THEN
            RETURN QUERY SELECT primary_questions.id, primary_questions.outer_category, primary_questions.difficulty, primary_questions.question_object_en
            FROM primary_questions
            WHERE primary_questions.outer_category = categories[i] AND primary_questions.difficulty = difficulties[i] AND primary_questions.year = _year AND
            primary_questions.audited = TRUE
            ORDER BY random() LIMIT 1;
        ELSIF region = 'zh' THEN
            RETURN QUERY SELECT primary_questions.id, primary_questions.outer_category, primary_questions.difficulty, primary_questions.question_object_zh
            FROM primary_questions
            WHERE primary_questions.outer_category = categories[i] AND primary_questions.difficulty = difficulties[i] AND primary_questions.year = _year AND
            primary_questions.audited = TRUE
            ORDER BY random() LIMIT 1;
        ELSE
            RAISE EXCEPTION 'Region not supported: %', region;
        END IF;
    END LOOP;
END;$$;


--
-- Name: FUNCTION get_questionobj_bypredictionregion(categories integer[], difficulties integer[], region text, _user_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_questionobj_bypredictionregion(categories integer[], difficulties integer[], region text, _user_id uuid) IS 'Deprecating soon';


--
-- Name: get_questionobj_for_investor_demo(integer[], integer[], text, uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_questionobj_for_investor_demo(categories integer[], difficulties integer[], region text, _user_id uuid, year integer) RETURNS TABLE(id bigint, outer_category smallint, difficulty smallint, question_object jsonb)
    LANGUAGE sql STABLE
    AS $_$
    SELECT 
        q.id, 
        q.outer_category, 
        q.difficulty, 
        CASE 
            WHEN region = 'en' THEN q.question_object_en 
            WHEN region = 'zh' THEN q.question_object_zh 
            ELSE NULL 
        END AS question_object
    FROM unnest(categories) WITH ORDINALITY AS c(cat_id, ord)
    CROSS JOIN LATERAL (
        SELECT * FROM (
            -- Audited Drafts (Priority 1)
            SELECT 
                d.original_question_id as id, 
                d.outer_category::smallint, 
                d.difficulty::smallint, 
                d.year::smallint as year, 
                d.audited, 
                d.question_object_en, 
                d.question_object_zh
            FROM primary_questions_drafts d
            WHERE d.audited = TRUE 
              AND d.outer_category = c.cat_id 
              AND d.difficulty = difficulties[ord] 
              AND d.year::smallint = $5
              -- INVESTOR DEMO FILTERS
              AND (
                  ($5 = 2 AND (
                      (d.need_image = TRUE AND d.image_approved = TRUE)
                      OR
                      (d.need_image = FALSE)
                  ))
                  OR
                  ($5 = 5 AND (
                      (d.need_image = TRUE AND d.image_approved = TRUE)
                      OR
                      (d.need_image = FALSE AND d.original_question_id < 9700)
                  ))
                  OR
                  ($5 NOT IN (2, 5))
              )
            
            UNION ALL
            
            -- Audited Primary Questions (Priority 2, only if no draft exists)
            SELECT 
                p.id, 
                p.outer_category, 
                p.difficulty, 
                p.year, 
                p.audited, 
                p.question_object_en, 
                p.question_object_zh
            FROM primary_questions p
            WHERE p.audited = TRUE 
              AND p.outer_category = c.cat_id 
              AND p.difficulty = difficulties[ord] 
              AND p.year = $5
              AND NOT EXISTS (
                  SELECT 1 FROM primary_questions_drafts d 
                  WHERE d.original_question_id = p.id
              )
              -- INVESTOR DEMO FILTERS
              AND (
                  ($5 = 2 AND (
                      (p.need_image = TRUE AND p.image_approved = TRUE)
                      OR
                      (p.need_image = FALSE)
                  ))
                  OR
                  ($5 = 5 AND (
                      (p.need_image = TRUE AND p.image_approved = TRUE)
                      OR
                      (p.need_image = FALSE AND p.id < 9700)
                  ))
                  OR
                  ($5 NOT IN (2, 5))
              )
        ) sub
        ORDER BY random()
        LIMIT 3
    ) q;
$_$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: primary_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.primary_questions (
    id bigint NOT NULL,
    year smallint NOT NULL,
    outer_category smallint NOT NULL,
    inner_category smallint NOT NULL,
    subject text NOT NULL,
    concept text NOT NULL,
    question_type text NOT NULL,
    difficulty smallint NOT NULL,
    need_image boolean NOT NULL,
    question_object_en jsonb,
    book_ref text NOT NULL,
    question_object_zh jsonb,
    audited boolean DEFAULT false NOT NULL,
    image_description text,
    image_approved boolean DEFAULT false,
    image_url text,
    is_flagged boolean DEFAULT false,
    status text DEFAULT 'draft'::text,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: get_random_questions_by_year(text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_random_questions_by_year(year_input text, limit_count integer) RETURNS SETOF public.primary_questions
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.primary_questions
  WHERE year::text = year_input
  ORDER BY random()
  LIMIT limit_count;
END;
$$;


--
-- Name: get_student_attempting_questions(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_student_attempting_questions(user_id uuid, region text) RETURNS TABLE(id bigint, outer_category smallint, difficulty smallint, question_object jsonb)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    -- Define the table name based on the region parameter
    IF $2 = 'en' THEN
        RETURN QUERY SELECT q.id, q.outer_category, q.difficulty, q.question_object_en
                     FROM public.exercise_questions_effective AS q
                     JOIN students AS u ON q.id = ANY(u.attempting_questions)
                     JOIN unnest(u.attempting_questions) WITH ORDINALITY as ord(id, ord) ON q.id = ord.id
                     WHERE u.user_id = $1 AND q.audited = true
                     ORDER BY ord.ord;
    ELSIF $2 = 'zh' THEN
        RETURN QUERY SELECT q.id, q.outer_category, q.difficulty, q.question_object_zh
                     FROM public.exercise_questions_effective AS q
                     JOIN students AS u ON q.id = ANY(u.attempting_questions)
                     JOIN unnest(u.attempting_questions) WITH ORDINALITY as ord(id, ord) ON q.id = ord.id
                     WHERE u.user_id = $1 AND q.audited = true
                     ORDER BY ord.ord;
    ELSE
        RAISE EXCEPTION 'Invalid region specified';
    END IF;
END;
$_$;


--
-- Name: get_student_current_score(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_student_current_score(user_id_param uuid) RETURNS real[]
    LANGUAGE plpgsql
    AS $$DECLARE
    user_record RECORD;
    scores float4[];
BEGIN
    -- Fetch the user's education_level and year
    SELECT education_level, year INTO user_record
    FROM students
    WHERE user_id = user_id_param;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found.';
    END IF;

    SELECT ARRAY(
    SELECT current_scores FROM student_data WHERE user_id = user_id_param AND education_level = user_record.education_level AND year = user_record.year)
    INTO scores;

  RETURN scores;
END;$$;


--
-- Name: get_student_dashboard_classroom(uuid, text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_student_dashboard_classroom(_user_id uuid, _year text DEFAULT NULL::text, _report_limit integer DEFAULT 31) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  result jsonb;
  classroom_id_val bigint;
  classroom_data jsonb;
  quizzes_data jsonb;
  reports_data jsonb;
BEGIN
  -- 1. Get confirmed classroom (first one)
  SELECT cd.c_classroom_id INTO classroom_id_val
  FROM classroom_details cd
  WHERE cd.cp_user_id = _user_id AND cd.cp_confirmed = true
  LIMIT 1;

  IF classroom_id_val IS NOT NULL THEN
    classroom_data := jsonb_build_object('classrooms_id', classroom_id_val);

    -- 2. Get quizzes for that classroom (top 3, desc)
    SELECT COALESCE(jsonb_agg(q ORDER BY q.quiz_id DESC), '[]'::jsonb)
    INTO quizzes_data
    FROM (
      SELECT cq2.quiz_id, q2.quiz_name, q2.date_created, q2.start_date, q2.end_date,
             cp2.classroom_id
      FROM classroom_participants cp2
      JOIN classroom_quizzes cq2 ON cp2.classroom_id = cq2.classroom_id
      JOIN quizzes q2 ON cq2.quiz_id = q2.id
      WHERE cp2.user_id = _user_id
        AND cp2.confirmed = true
        AND cp2.classroom_id = classroom_id_val
      ORDER BY q2.id DESC
      LIMIT 3
    ) q;
  ELSE
    classroom_data := 'null'::jsonb;
    quizzes_data := '[]'::jsonb;
  END IF;

  -- 3. Get recent daily reports for calendar
  SELECT COALESCE(jsonb_agg(r ORDER BY r.date DESC), '[]'::jsonb)
  INTO reports_data
  FROM (
    SELECT udr.date, udr.year, udr.subject
    FROM user_daily_reports udr
    WHERE udr.user_id = _user_id
      AND (_year IS NULL OR udr.year::text = _year)
      AND udr.date >= date_trunc('year', CURRENT_DATE)::date
    ORDER BY udr.date DESC
    LIMIT _report_limit
  ) r;

  result := jsonb_build_object(
    'classroom', classroom_data,
    'quizzes', quizzes_data,
    'reports', reports_data
  );

  RETURN result;
END;
$$;


--
-- Name: get_student_dashboard_combined(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_student_dashboard_combined(_user_id uuid, _year text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
  init_data json;
  class_data json;
BEGIN
  init_data := get_student_dashboard_init(_user_id);
  -- Defaulting report_limit to 31 as per original frontend logic
  class_data := get_student_dashboard_classroom(_user_id, _year, 31);
  RETURN init_data::jsonb || class_data::jsonb;
END;
$$;


--
-- Name: get_student_dashboard_init(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_student_dashboard_init(_user_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  result jsonb;
  student_row record;
  summary_row record;
  streak_row record;
  coins_val integer;
  user_row record;
  days_joined integer;
BEGIN
  -- 1. Get user data (first_name, last_name, paying, profile_image)
  SELECT first_name, last_name, paying, profile_image
  INTO user_row FROM users WHERE user_id = _user_id;

  -- 2. Get student profile (stars, streaks, todos, etc.)
  SELECT stars, education_level, year, streak_count, total_streak,
         last_celebrated_level, last_celebrated_streak,
         todo_list, last_todo_date, last_celebrated_todo_date
  INTO student_row FROM students WHERE user_id = _user_id;

  -- 3. Get summary (total_completed, average_accuracy, total_fully_accurate)
  SELECT count(*)::bigint AS total_completed,
         avg(accuracy)::double precision AS average_accuracy,
         count(*) FILTER (WHERE accuracy = 1.0)::bigint AS total_fully_accurate
  INTO summary_row FROM completed_questions WHERE user_id = _user_id;

  -- 4. Handle daily streak (calls existing logic inline, has side effects)
  SELECT * INTO streak_row FROM handle_daily_streak(_user_id) LIMIT 1;

  -- 5. Get coins
  SELECT get_user_total_coins(_user_id) INTO coins_val;

  -- 6. Calculate days since joined (full days between created_at and now)
  SELECT GREATEST(1, (CURRENT_DATE - (au.created_at AT TIME ZONE 'UTC')::date))
  INTO days_joined FROM auth.users au WHERE au.id = _user_id;

  -- Assemble result (handle NULL user/student for new users)
  result := jsonb_build_object(
    'profile', jsonb_build_object(
      'first_name', user_row.first_name,
      'last_name', user_row.last_name,
      'paying', COALESCE(user_row.paying, false),
      'profile_image', user_row.profile_image,
      'stars', student_row.stars,
      'education_level', student_row.education_level,
      'year', student_row.year,
      'streak_count', streak_row.new_streak,
      'total_streak', streak_row.total_streak,
      'last_celebrated_level', student_row.last_celebrated_level,
      'last_celebrated_streak', student_row.last_celebrated_streak,
      'todo_list', student_row.todo_list,
      'last_todo_date', student_row.last_todo_date,
      'last_celebrated_todo_date', student_row.last_celebrated_todo_date,
      'total_coins', COALESCE(coins_val, 0),
      'days_since_joined', COALESCE(days_joined, 1)
    ),
    'summary', jsonb_build_object(
      'total_completed', COALESCE(summary_row.total_completed, 0),
      'average_accuracy', COALESCE(summary_row.average_accuracy, 0),
      'total_fully_accurate', COALESCE(summary_row.total_fully_accurate, 0)
    ),
    'streak', jsonb_build_object(
      'new_streak', streak_row.new_streak,
      'total_streak', streak_row.total_streak,
      'is_new_checkin', streak_row.is_new_checkin,
      'coins_awarded', streak_row.coins_awarded
    )
  );

  RETURN result;
END;
$$;


--
-- Name: get_student_score_categories(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_student_score_categories(user_id_param uuid) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$DECLARE
    result_jsonb JSONB;
BEGIN
    -- Fetch the user's education_level and year, and build the JSON object
    SELECT jsonb_build_object(
        'enabled_categories', sd.enabled_categories,
        'current_scores', sd.current_scores
    ) INTO result_jsonb
    FROM student_data sd
    JOIN students s ON sd.user_id = s.user_id AND sd.education_level = s.education_level AND sd.year = s.year
    WHERE s.user_id = user_id_param;

    IF result_jsonb IS NULL THEN
        RAISE EXCEPTION 'User not found or no data available.';
    END IF;

    RETURN result_jsonb;
END;$$;


--
-- Name: get_totalcount_all_user_daily_reports(uuid, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_totalcount_all_user_daily_reports(_user_id uuid, specific_date date) RETURNS bigint
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total_count bigint;
BEGIN
    SELECT COUNT(*)
    INTO total_count
    FROM (
        SELECT 1
        FROM completed_questions cq
        JOIN primary_questions pq ON cq.question_id = pq.id
        WHERE cq.user_id = _user_id
          AND (specific_date IS NULL OR DATE(cq.completed_at AT TIME ZONE 'HKT') = specific_date)
        GROUP BY DATE(cq.completed_at AT TIME ZONE 'HKT'), pq.subject
    ) AS unique_pairs;
    
    RETURN total_count;
END;
$$;


--
-- Name: FUNCTION get_totalcount_all_user_daily_reports(_user_id uuid, specific_date date); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_totalcount_all_user_daily_reports(_user_id uuid, specific_date date) IS 'Deprecate ASAP';


--
-- Name: get_totalcount_all_user_weekly_reports(uuid, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_totalcount_all_user_weekly_reports(_user_id uuid, start_date date) RETURNS bigint
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total_count bigint;
BEGIN
    SELECT COUNT(*)
    INTO total_count
    FROM (
        SELECT 1
        FROM completed_questions cq
        JOIN primary_questions pq ON cq.question_id = pq.id
        WHERE cq.user_id = _user_id
          AND (start_date IS NULL OR DATE(DATE_TRUNC('week', cq.completed_at AT TIME ZONE 'HKT')) = DATE(DATE_TRUNC('week', start_date AT TIME ZONE 'HKT')))

        GROUP BY DATE(DATE_TRUNC('week', cq.completed_at AT TIME ZONE 'HKT')), pq.subject
    ) AS unique_pairs;
    
    RETURN total_count;
END;
$$;


--
-- Name: FUNCTION get_totalcount_all_user_weekly_reports(_user_id uuid, start_date date); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_totalcount_all_user_weekly_reports(_user_id uuid, start_date date) IS 'Deprecate ASAP';


--
-- Name: get_unique_correct_questions_count(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_unique_correct_questions_count(p_user_id uuid) RETURNS integer
    LANGUAGE plpgsql
    AS $$-- Create function to get count of unique questions answered correctly by a user
-- This function counts distinct question_id records where accuracy = 1

DECLARE
  v_count INTEGER;
BEGIN
  -- Count unique question_ids where user answered correctly (accuracy = 1)
  SELECT COUNT(DISTINCT question_id)
  INTO v_count
  FROM completed_questions
  WHERE user_id = p_user_id
    AND accuracy = 1;
  
  -- Return the count (will be 0 if no matches found)
  RETURN COALESCE(v_count, 0);
END;$$;


--
-- Name: get_user_by_email(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_by_email(_user_email text) RETURNS TABLE(user_id uuid, user_email character varying)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
BEGIN
    RETURN QUERY
    SELECT id AS user_id, email AS user_email FROM auth.users WHERE auth.users.email = $1;
END;
$_$;


--
-- Name: get_user_categories(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_categories(_user_id uuid, _education_level text, _year text) RETURNS TABLE(enabled_categories jsonb, is_paying boolean)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        to_jsonb(sd.enabled_categories),
        u.paying
    FROM student_data sd
    JOIN users u ON sd.user_id = u.user_id
    WHERE sd.user_id = _user_id
      AND sd.education_level = _education_level::education_level
      AND sd.year = _year::primary_years;
END;
$$;


--
-- Name: get_user_classroom_quizzes(uuid, bigint, bigint, text, boolean, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_classroom_quizzes(_user_id uuid, _classroom_id bigint DEFAULT NULL::bigint, _quiz_id bigint DEFAULT NULL::bigint, _quiz_name text DEFAULT NULL::text, _order_asc boolean DEFAULT false, _limit integer DEFAULT 10, _offset integer DEFAULT 0) RETURNS TABLE(classroom_id bigint, confirmed boolean, quiz_id bigint, school_id bigint, quiz_name text, date_created timestamp with time zone, start_date timestamp with time zone, end_date timestamp with time zone, total_count bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    WITH filtered_quizzes AS (
        SELECT 
            cp.classroom_id AS res_classroom_id,
            cp.confirmed AS res_confirmed,
            cq.quiz_id AS res_quiz_id,
            q.school_id AS res_school_id,
            q.quiz_name AS res_quiz_name,
            q.date_created AS res_date_created,
            q.start_date AS res_start_date,
            q.end_date AS res_end_date
        FROM classroom_participants cp
        JOIN classroom_quizzes cq ON cp.classroom_id = cq.classroom_id
        JOIN quizzes q ON cq.quiz_id = q.id
        WHERE cp.user_id = _user_id
          AND cp.confirmed = TRUE
          AND (_classroom_id IS NULL OR cp.classroom_id = _classroom_id)
          AND (_quiz_id IS NULL OR cq.quiz_id = _quiz_id)
          AND (_quiz_name IS NULL OR q.quiz_name ILIKE '%' || _quiz_name || '%')
    ),
    total AS (
        SELECT COUNT(*) as full_count FROM filtered_quizzes
    )
    SELECT 
        res_classroom_id,
        res_confirmed,
        res_quiz_id,
        res_school_id,
        res_quiz_name,
        res_date_created,
        res_start_date,
        res_end_date,
        full_count
    FROM filtered_quizzes, total
    ORDER BY 
        CASE WHEN _order_asc THEN res_quiz_id END ASC,
        CASE WHEN NOT _order_asc THEN res_quiz_id END DESC
    LIMIT _limit
    OFFSET _offset;
END;
$$;


--
-- Name: get_user_completed_questions_summary(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_completed_questions_summary(_user_id uuid) RETURNS TABLE(user_id uuid, total_completed bigint, average_accuracy double precision, total_fully_accurate bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cq.user_id,
        count(*) AS total_completed,
        avg(cq.accuracy)::DOUBLE PRECISION AS average_accuracy,
        count(*) FILTER (WHERE (cq.accuracy = 1.0)) AS total_fully_accurate
    FROM completed_questions cq
    WHERE cq.user_id = _user_id
    GROUP BY cq.user_id;
END;
$$;


--
-- Name: get_user_daily_completed_questions(uuid, date, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_daily_completed_questions(_user_id uuid, _date date, _subject text) RETURNS TABLE(id bigint, user_id uuid, question_id bigint, subject text, time_taken smallint, accuracy numeric, completed_at_hkt timestamp with time zone, outer_category smallint, inner_category smallint, difficulty smallint)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cq.id, 
        cq.user_id,
        cq.question_id,
        pq.subject,
        cq.time_taken,
        cq.accuracy,
        (cq.completed_at AT TIME ZONE 'HKT')::TIMESTAMP WITH TIME ZONE as completed_at_hkt, -- Corrected cast
        pq.outer_category,
        pq.inner_category, 
        pq.difficulty
    FROM 
        completed_questions cq
    JOIN 
        primary_questions pq ON cq.question_id = pq.id
    WHERE 
        cq.user_id = _user_id AND
        DATE(cq.completed_at AT TIME ZONE 'HKT') = _date AND 
        pq.subject = _subject
    ORDER BY 
        cq.completed_at AT TIME ZONE 'HKT';
END;
$$;


--
-- Name: get_user_enabled_categories(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_enabled_categories(user_id_param uuid) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$DECLARE
    user_record RECORD;
    jsonb_data JSONB;
BEGIN
    -- Fetch the user's education_level and year
    SELECT education_level, year INTO user_record
    FROM students
    WHERE user_id = user_id_param;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found.';
    END IF;

    -- Build the JSONB query path
    EXECUTE format('SELECT data->%L->%L->''enabled_categories'' FROM students WHERE user_id = %L', 
                   user_record.education_level, user_record.year, user_id_param)
    INTO jsonb_data;

    RETURN jsonb_data;
END;$$;


--
-- Name: FUNCTION get_user_enabled_categories(user_id_param uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_user_enabled_categories(user_id_param uuid) IS 'Deprecated soon';


--
-- Name: get_user_score_data(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_score_data(user_id_param uuid) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$DECLARE
    user_record RECORD;
    jsonb_data JSONB;
BEGIN
    -- Fetch the user's education_level and year
    SELECT education_level, year INTO user_record
    FROM students
    WHERE user_id = user_id_param;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found.';
    END IF;

    -- Build the JSONB query path
    EXECUTE format('SELECT data->%L->%L FROM students WHERE user_id = %L', 
                   user_record.education_level, user_record.year, user_id_param)
    INTO jsonb_data;

    RETURN jsonb_data;
END;$$;


--
-- Name: FUNCTION get_user_score_data(user_id_param uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_user_score_data(user_id_param uuid) IS 'Deprecated soon';


--
-- Name: get_user_total_coins(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_total_coins(_user_id uuid) RETURNS integer
    LANGUAGE sql STABLE
    AS $$
  SELECT total_coins FROM public.user_coins WHERE user_id = _user_id;
$$;


--
-- Name: get_user_weekly_completed_questions(uuid, date, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_weekly_completed_questions(_user_id uuid, _start_date date, _subject text) RETURNS TABLE(id bigint, user_id uuid, question_id bigint, subject text, time_taken smallint, accuracy numeric, completed_at_hkt timestamp with time zone, outer_category smallint, inner_category smallint, difficulty smallint)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cq.id, 
        cq.user_id,
        cq.question_id,
        pq.subject,
        cq.time_taken,
        cq.accuracy,
        (cq.completed_at AT TIME ZONE 'HKT')::TIMESTAMP WITH TIME ZONE as completed_at_hkt, -- Corrected cast
        pq.outer_category,
        pq.inner_category, 
        pq.difficulty
    FROM 
        completed_questions cq
    JOIN 
        primary_questions pq ON cq.question_id = pq.id
    WHERE 
        cq.user_id = _user_id AND
        DATE(cq.completed_at AT TIME ZONE 'HKT') >= _start_date AND 
        DATE(cq.completed_at AT TIME ZONE 'HKT') < _start_date + INTERVAL '7 days' AND
        pq.subject = _subject
    ORDER BY 
        cq.completed_at AT TIME ZONE 'HKT';
END;
$$;


--
-- Name: handle_daily_streak(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_daily_streak(_user_id uuid) RETURNS TABLE(new_streak integer, total_streak integer, is_new_checkin boolean, coins_awarded integer)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    curr_date DATE := CURRENT_DATE;
    last_date DATE;
    curr_streak INTEGER;
    max_streak INTEGER;
    reward_coins INTEGER := 0;
BEGIN
    -- Fetch current streak data
    SELECT s.last_checkin_date, s.streak_count, s.total_streak
    INTO last_date, curr_streak, max_streak
    FROM students s
    WHERE s.user_id = _user_id;

    -- Determine logic based on last checkin
    IF last_date IS NULL THEN
        -- First time checkin ever
        curr_streak := 1;
        is_new_checkin := TRUE;
    ELSIF last_date = curr_date THEN
        -- Already checked in today, do nothing
        is_new_checkin := FALSE;
        reward_coins := 0;
    ELSIF last_date = curr_date - INTERVAL '1 day' THEN
        -- Consecutive day checkin
        curr_streak := curr_streak + 1;
        is_new_checkin := TRUE;
    ELSE
        -- Missed a day (or more), reset to 1
        curr_streak := 1;
        is_new_checkin := TRUE;
    END IF;

    -- If it's a new checkin, update the database and reward coins
    IF is_new_checkin THEN
        -- Reward Logic: Day 7 = 50 coins, others = streak * 5
        IF curr_streak >= 7 THEN
            reward_coins := 50;
        ELSE
            reward_coins := curr_streak * 5;
        END IF;

        -- Update total streak record
        IF curr_streak > max_streak THEN
            max_streak := curr_streak;
        END IF;

        -- Perform updates
        UPDATE students
        SET last_checkin_date = curr_date,
            streak_count = curr_streak,
            total_streak = max_streak
        WHERE user_id = _user_id;

        -- Record the coin transaction
        IF reward_coins > 0 THEN
            INSERT INTO coin_transactions (user_id, amount, type, created_at)
            VALUES (_user_id, reward_coins, 'streak_reward', now());
        END IF;
    END IF;

    RETURN QUERY SELECT curr_streak, max_streak, is_new_checkin, reward_coins;
END;
$$;


--
-- Name: handle_student_todos(uuid, text[], date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_student_todos(p_user_id uuid, p_new_todos text[], p_todo_date date) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_current_todos TEXT[];
    v_last_todo_date DATE;
    v_final_todos TEXT[];
BEGIN
    -- Get current status
    SELECT todo_list, last_todo_date 
    INTO v_current_todos, v_last_todo_date
    FROM students
    WHERE user_id = p_user_id;

    -- If it's a new day, reset the list
    IF v_last_todo_date IS NULL OR v_last_todo_date < p_todo_date THEN
        v_final_todos := p_new_todos;
    ELSE
        -- Merge lists removing duplicates
        -- Ensure we handle NULL current_todos
        IF v_current_todos IS NULL THEN
            v_final_todos := p_new_todos;
        ELSE
            v_final_todos := ARRAY(
                SELECT DISTINCT unnest(v_current_todos || p_new_todos)
            );
        END IF;
    END IF;

    -- Update the table
    UPDATE students
    SET 
        todo_list = v_final_todos,
        last_todo_date = p_todo_date
    WHERE user_id = p_user_id;

    RETURN json_build_object(
        'todo_list', v_final_todos,
        'date', p_todo_date
    );
END;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: insert_activity_events(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_activity_events(events jsonb) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
  inserted_count integer;
BEGIN
  WITH ins AS (
    INSERT INTO public.activity_events (
      event_id, user_id, session_id, event_type, path,
      question_id, region, network_hash, metadata, event_ts
    )
    SELECT
      (e->>'event_id')::uuid,
      (e->>'user_id')::uuid,
      e->>'session_id',
      e->>'event_type',
      e->>'path',
      (e->>'question_id')::bigint,
      e->>'region',
      e->>'network_hash',
      COALESCE((e->'metadata')::jsonb, '{}'::jsonb),
      COALESCE((e->>'event_ts')::timestamptz, now())
    FROM jsonb_array_elements(events) AS e
    ON CONFLICT (event_id) WHERE event_id IS NOT NULL DO NOTHING
    RETURNING 1
  )
  SELECT count(*) INTO inserted_count FROM ins;

  RETURN inserted_count;
END;
$$;


--
-- Name: insert_classroom_students(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_classroom_students(_student_datas jsonb) RETURNS text[]
    LANGUAGE plpgsql
    AS $$DECLARE
    _student_data jsonb;
    _user_id uuid;
    user_role text;
    failed_emails text[] := '{}';
BEGIN
    -- Loop through each item in the JSONB array
    FOR _student_data IN SELECT * FROM jsonb_array_elements(_student_datas)
    LOOP
        BEGIN
            -- Retrieve the user ID from the auth.users table based on the email
            SELECT user_id INTO _user_id FROM public.get_user_by_email(_student_data->>'student_email');

            -- If a user ID was found, fetch the role from the separate users table
            IF _user_id IS NOT NULL THEN
                SELECT role INTO user_role FROM public.users WHERE user_id = _user_id;

                -- Insert only if the user's role is 'student'
                IF user_role = 'student' THEN
                    INSERT INTO classroom_participants (classroom_id, user_id)
                    VALUES ((_student_data->>'classroom_id')::bigint, _user_id);
                ELSE
                    -- Add to failed_emails if the role is not 'student'
                    failed_emails := array_append(failed_emails, _student_data->>'student_email');
                END IF;
            ELSE
                -- Add to failed_emails if no user ID was found
                failed_emails := array_append(failed_emails, _student_data->>'student_email');
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Append the email to the failed_emails array if any exception occurs during processing
            RAISE LOG 'Failed to process email % due to error: %, SQLSTATE: %', 
    _student_data->>'student_email', SQLERRM, SQLSTATE;

            
            failed_emails := array_append(failed_emails, _student_data->>'student_email');
        END;
    END LOOP;
    RETURN failed_emails;
END;$$;


--
-- Name: FUNCTION insert_classroom_students(_student_datas jsonb); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.insert_classroom_students(_student_datas jsonb) IS 'Deprecate';


--
-- Name: insert_classroom_users(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_classroom_users(_datas jsonb) RETURNS text[]
    LANGUAGE plpgsql
    AS $$

DECLARE
    _data jsonb;
    _user_id uuid;
    user_role text;
    failed_emails text[] := '{}';
BEGIN
    -- Loop through each item in the JSONB array
    FOR _data IN SELECT * FROM jsonb_array_elements(_datas)
    LOOP
        BEGIN
            -- Retrieve the user ID from the auth.users table based on the email
            SELECT user_id INTO _user_id FROM public.get_user_by_email(_data->>'email');

            -- If a user ID was found, fetch the role from the separate users table
            IF _user_id IS NOT NULL THEN
                SELECT role INTO user_role FROM public.users WHERE user_id = _user_id;

                -- Insert only if the user's role is 'student'
                IF user_role = 'student' OR user_role = 'teacher' THEN
                    INSERT INTO classroom_participants (classroom_id, user_id)
                    VALUES ((_data->>'classroom_id')::bigint, _user_id);
                ELSE
                    -- Add to failed_emails if the role is not 'student'
                    failed_emails := array_append(failed_emails, _data->>'email');
                END IF;
            ELSE
                -- Add to failed_emails if no user ID was found
                failed_emails := array_append(failed_emails, _data->>'email');
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Append the email to the failed_emails array if any exception occurs during processing
            RAISE LOG 'Failed to process email % due to error: %, SQLSTATE: %', 
    _data->>'email', SQLERRM, SQLSTATE;

            
            failed_emails := array_append(failed_emails, _data->>'email');
        END;
    END LOOP;
    RETURN failed_emails;
END;
$$;


--
-- Name: insert_quiz_questions(uuid, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_quiz_questions(_user_id uuid, quiz_questions jsonb) RETURNS TABLE(id bigint, quiz_id bigint, question_id bigint)
    LANGUAGE plpgsql
    AS $_$DECLARE
    ud RECORD;
    _quiz_questions RECORD;
    inserted_quiz RECORD;
    temp_question_id bigint;
    temp_quiz_id bigint;
    temp_quiz_junction_id bigint;
    temp_quiz_creator_id bigint;

BEGIN
    -- Fetch user data
    SELECT users.user_id, users.school_id INTO ud
    FROM users
    WHERE user_id = $1;

    -- Check if the user exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with ID % not found', $1;
    END IF;

    CREATE TEMP TABLE temp_inserted_quiz_questions (
        id BIGINT,
        quiz_id BIGINT,
        question_id BIGINT
    ) ON COMMIT DROP;



    FOR _quiz_questions IN SELECT (quiz_question->>'quiz_id')::bigint as quiz_id, (quiz_question->>'question_id')::bigint as question_id FROM jsonb_array_elements($2) AS quiz_question
    LOOP
        BEGIN
            SELECT uq.question_id INTO temp_question_id FROM user_questions uq WHERE uq.school_id = ud.school_id AND uq.question_id = _quiz_questions.question_id;

            SELECT q.id INTO temp_quiz_id FROM quizzes q WHERE q.school_id = ud.school_id AND q.id = _quiz_questions.quiz_id;
            
            IF temp_question_id is not null AND temp_quiz_id is not null then

                INSERT INTO quiz_junction(quiz_id, question_id)
                VALUES(temp_quiz_id, temp_question_id)
                RETURNING quiz_junction.id INTO temp_quiz_junction_id;

                SELECT qc.id into temp_quiz_creator_id FROM quiz_creators qc WHERE qc.quiz_id = temp_quiz_id AND qc.user_id = $1;

                IF temp_quiz_creator_id is null then
                    INSERT INTO quiz_creators(quiz_id, user_id)
                    VALUES(temp_quiz_id, $1);
                end if;

                UPDATE user_questions uq
                SET mutable = false
                WHERE uq.question_id = temp_question_id;

                INSERT INTO temp_inserted_quiz_questions(id, quiz_id, question_id)
                VALUES(temp_quiz_junction_id, temp_quiz_id, temp_question_id);

            END IF;
        
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Failed to process user_id % due to error: %, SQLSTATE: %', $1, SQLERRM, SQLSTATE;
        
        END;

    END LOOP;

    RETURN QUERY SELECT * FROM temp_inserted_quiz_questions;

END;$_$;


--
-- Name: process_complete_questions(jsonb, numeric[], uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_complete_questions(completed_qs jsonb, new_score numeric[], _user_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$DECLARE
    item JSONB;
    user_record RECORD;
    jsonb_path TEXT[];
    completed_questions_count INTEGER;
BEGIN
    completed_questions_count := jsonb_array_length(completed_qs);

    -- Insert into completed_questions
    FOR item IN SELECT * FROM jsonb_array_elements(completed_qs)
    LOOP
        INSERT INTO completed_questions (user_id, question_id, accuracy, time_taken)
        VALUES (_user_id, (item->'question_id')::bigint, (item->'accuracy')::numeric, (item->'time_taken')::smallint);
    END LOOP;

    SELECT education_level, year INTO user_record
    FROM students
    WHERE user_id = _user_id;

    --RAISE LOG 'user_record: (%)', user_record;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Update students column
    UPDATE students
    SET attempting_questions=NULL,
    stars = stars+completed_questions_count
    WHERE user_id = _user_id;

    UPDATE student_data
    SET current_scores = new_score
    WHERE user_id = _user_id AND education_level = user_record.education_level AND year = user_record.year;

END;$$;


--
-- Name: FUNCTION process_complete_questions(completed_qs jsonb, new_score numeric[], _user_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.process_complete_questions(completed_qs jsonb, new_score numeric[], _user_id uuid) IS 'Deprecate ASAP';


--
-- Name: process_completed_questions(uuid, numeric[], jsonb, public.education_level, public.primary_years); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_completed_questions(_user_id uuid, new_score numeric[], completed_qs jsonb, education_level public.education_level, year public.primary_years) RETURNS void
    LANGUAGE plpgsql
    AS $_$
DECLARE
    item JSONB;
    completed_questions_count INTEGER;
BEGIN
    completed_questions_count := jsonb_array_length(completed_qs);

    -- Insert into completed_questions
    FOR item IN SELECT * FROM jsonb_array_elements(completed_qs)
    LOOP
        INSERT INTO completed_questions (user_id, question_id, accuracy, time_taken)
        VALUES (_user_id, (item->'question_id')::bigint, (item->'accuracy')::numeric, (item->'time_taken')::smallint);
    END LOOP;

    -- Update students column (Stars)
    UPDATE students
    SET attempting_questions = NULL,
        stars = stars + completed_questions_count
    WHERE user_id = _user_id;

    -- Update student_data (Scores)
    UPDATE student_data
    SET current_scores = new_score
    WHERE user_id = _user_id AND student_data.education_level = $4 AND student_data.year = $5;

END;
$_$;


--
-- Name: process_completed_questions_optimized(uuid, numeric[], jsonb, public.education_level, public.primary_years); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_completed_questions_optimized(_user_id uuid, new_score numeric[], completed_qs jsonb, education_level public.education_level, year public.primary_years) RETURNS TABLE(coins_awarded integer, total_coins integer)
    LANGUAGE plpgsql
    AS $_$
DECLARE
    item JSONB;
    completed_questions_count INTEGER;
    coins_before INTEGER;
    coins_after INTEGER;
BEGIN
    completed_questions_count := jsonb_array_length(completed_qs);

    -- Capture coin balance BEFORE inserting new questions
    SELECT COALESCE(uc.total_coins, 0) INTO coins_before
    FROM user_coins uc WHERE uc.user_id = _user_id;
    
    IF coins_before IS NULL THEN
        coins_before := 0;
    END IF;

    -- Insert into completed_questions (this triggers the view to update)
    FOR item IN SELECT * FROM jsonb_array_elements(completed_qs)
    LOOP
        INSERT INTO completed_questions (user_id, question_id, accuracy, time_taken)
        VALUES (_user_id, (item->'question_id')::bigint, (item->'accuracy')::numeric, (item->'time_taken')::smallint);
    END LOOP;

    -- Update stars & clear attempting questions
    UPDATE students
    SET attempting_questions = NULL,
        stars = stars + completed_questions_count
    WHERE user_id = _user_id;

    -- Update scores
    UPDATE student_data
    SET current_scores = new_score
    WHERE user_id = _user_id AND student_data.education_level = $4 AND student_data.year = $5;

    -- Capture coin balance AFTER inserting (view auto-recalculates)
    SELECT COALESCE(uc.total_coins, 0) INTO coins_after
    FROM user_coins uc WHERE uc.user_id = _user_id;

    RETURN QUERY SELECT (coins_after - coins_before)::int, coins_after::int;
END;
$_$;


--
-- Name: process_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$BEGIN
  -- Conditional insertion based on the role
  INSERT INTO public.users (
    user_id, 
    role, 
    school_id, 
    first_name, 
    last_name, 
    referred_by, 
    stripe_customer_id, 
    paying
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'), 
    COALESCE(CAST(NEW.raw_user_meta_data->>'school_id' AS bigint), NULL), 
    NEW.raw_user_meta_data->>'first_name', 
    NEW.raw_user_meta_data->>'last_name', 
    NEW.raw_user_meta_data->>'referred_by', 
    NEW.raw_user_meta_data->>'stripe_customer_id',
    COALESCE(NEW.raw_user_meta_data->>'role', 'student') <> 'student' 
  );

  -- Determine the role for conditional insertion into other tables
  CASE COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    WHEN 'admin' THEN
      INSERT INTO public.admins (admin_id)
      VALUES (NEW.id);
    WHEN 'teacher' THEN
      INSERT INTO public.teachers (teacher_id, teaching_subject, is_subject_head)
      VALUES (
        NEW.id, 
        (NEW.raw_user_meta_data->>'teaching_subject')::subjects[], 
        (NEW.raw_user_meta_data->>'is_subject_head')::boolean
      );
    WHEN 'student' THEN
      INSERT INTO public.students (user_id, year)
      VALUES (
        NEW.id, 
        COALESCE((NEW.raw_user_meta_data->>'year')::primary_years, '2'::primary_years)
      );
  END CASE;

  -- Return the new record
  RETURN NEW;
END;$$;


--
-- Name: process_placement_rewards(uuid, bigint[], bigint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_placement_rewards(p_user_id uuid, p_correct_question_ids bigint[], p_placement_result_id bigint) RETURNS TABLE(coins_awarded integer, stars_awarded integer, total_coins integer, total_stars integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_existing_count integer := 0;
    v_remaining_slots integer := 0;
    v_coins_awarded integer := 0;
    v_completion_inserted integer := 0;
    v_stars_awarded integer := 0;
    v_total_coins integer := 0;
    v_total_stars integer := 0;
BEGIN
    SELECT count(*)::integer
    INTO v_existing_count
    FROM public.placement_question_rewards
    WHERE user_id = p_user_id;

    v_remaining_slots := GREATEST(0, 10 - v_existing_count);

    IF v_remaining_slots > 0 AND array_length(p_correct_question_ids, 1) IS NOT NULL THEN
        WITH distinct_ids AS (
            SELECT DISTINCT unnest(p_correct_question_ids) AS question_id
        ),
        unrewarded_ids AS (
            SELECT d.question_id
            FROM distinct_ids d
            LEFT JOIN public.placement_question_rewards pqr
              ON pqr.user_id = p_user_id
             AND pqr.question_id = d.question_id
            WHERE pqr.question_id IS NULL
            ORDER BY d.question_id
            LIMIT v_remaining_slots
        ),
        inserted AS (
            INSERT INTO public.placement_question_rewards (user_id, question_id, placement_result_id)
            SELECT p_user_id, u.question_id, p_placement_result_id
            FROM unrewarded_ids u
            ON CONFLICT (user_id, question_id) DO NOTHING
            RETURNING question_id
        )
        SELECT count(*)::integer INTO v_coins_awarded FROM inserted;
    END IF;

    IF v_coins_awarded > 0 THEN
        INSERT INTO public.user_coins (user_id, question_coins, bonus_coins, total_coins, last_updated)
        VALUES (p_user_id, v_coins_awarded, 0, v_coins_awarded, now())
        ON CONFLICT (user_id) DO UPDATE
        SET question_coins = public.user_coins.question_coins + EXCLUDED.question_coins,
            total_coins = public.user_coins.total_coins + EXCLUDED.total_coins,
            last_updated = now();
    END IF;

    INSERT INTO public.placement_completion_rewards (user_id, placement_result_id)
    VALUES (p_user_id, p_placement_result_id)
    ON CONFLICT (user_id) DO NOTHING;

    GET DIAGNOSTICS v_completion_inserted = ROW_COUNT;
    v_stars_awarded := CASE WHEN v_completion_inserted > 0 THEN 5 ELSE 0 END;

    IF v_stars_awarded > 0 THEN
        UPDATE public.students
        SET stars = stars + v_stars_awarded
        WHERE user_id = p_user_id;
    END IF;

    SELECT COALESCE(uc.total_coins, 0)::integer
    INTO v_total_coins
    FROM public.user_coins uc
    WHERE uc.user_id = p_user_id;

    SELECT COALESCE(s.stars, 0)::integer
    INTO v_total_stars
    FROM public.students s
    WHERE s.user_id = p_user_id;

    RETURN QUERY SELECT v_coins_awarded, v_stars_awarded, v_total_coins, v_total_stars;
END;
$$;


--
-- Name: set_student_context(uuid, public.education_level, public.primary_years, real[], real[], smallint[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_student_context(_user_id uuid, _education_level public.education_level, _year public.primary_years, _initial_scores real[], _current_scores real[], _enabled_categories smallint[]) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Upsert into student_data table
    INSERT INTO student_data (user_id, education_level, year, initial_scores, current_scores, enabled_categories)
    VALUES (_user_id, _education_level, _year, _initial_scores, _current_scores, _enabled_categories)
    ON CONFLICT (user_id, education_level, year) DO NOTHING;

    -- Update students table with new education_level and year
    UPDATE students
    SET education_level = _education_level, year = _year
    WHERE user_id = _user_id;
END;
$$;


--
-- Name: set_user_enabled_categories(uuid, integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_user_enabled_categories(user_id_param uuid, new_enabled_categories integer[]) RETURNS void
    LANGUAGE plpgsql
    AS $$DECLARE
    user_record RECORD;
    jsonb_path TEXT[];
BEGIN
    -- Fetch the user's education_level and year
    SELECT education_level, year INTO user_record
    FROM students
    WHERE user_id = user_id_param;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found.';
    END IF;

    -- Construct the JSONB update path as an array, casting each element to text
    jsonb_path := ARRAY[user_record.education_level::text, user_record.year::text, 'enabled_categories'];

    -- Update the specific part of the JSONB column
    EXECUTE format('UPDATE students SET data = jsonb_set(data, %L, %L) WHERE user_id = %L', 
                   jsonb_path, to_jsonb(new_enabled_categories), user_id_param);

END;$$;


--
-- Name: update_drafts_timestamps(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_drafts_timestamps() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    NEW.edited_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
      NEW.updated_at = now();
      RETURN NEW;
  END;
  $$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_
        -- Filter by action early - only get subscriptions interested in this action
        -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
        and (subs.action_filter = '*' or subs.action_filter = action::text);

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL AND ppt.tablename NOT LIKE '% %'),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  -- Count raw slot entries before apply_rls/subscription filter
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  -- Apply RLS and filter as before
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  -- Real rows with slot count attached
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  -- Sentinel row: always returned when no real rows exist so Elixir can
  -- always read slot_changes_count. Identified by wal IS NULL.
  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
    select string_to_array(name, '/') into _parts;
    return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


--
-- Name: http_request(); Type: FUNCTION; Schema: supabase_functions; Owner: -
--

CREATE FUNCTION supabase_functions.http_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'supabase_functions'
    AS $$
    DECLARE
      request_id bigint;
      payload jsonb;
      url text := TG_ARGV[0]::text;
      method text := TG_ARGV[1]::text;
      headers jsonb DEFAULT '{}'::jsonb;
      params jsonb DEFAULT '{}'::jsonb;
      timeout_ms integer DEFAULT 1000;
    BEGIN
      IF url IS NULL OR url = 'null' THEN
        RAISE EXCEPTION 'url argument is missing';
      END IF;

      IF method IS NULL OR method = 'null' THEN
        RAISE EXCEPTION 'method argument is missing';
      END IF;

      IF TG_ARGV[2] IS NULL OR TG_ARGV[2] = 'null' THEN
        headers = '{"Content-Type": "application/json"}'::jsonb;
      ELSE
        headers = TG_ARGV[2]::jsonb;
      END IF;

      IF TG_ARGV[3] IS NULL OR TG_ARGV[3] = 'null' THEN
        params = '{}'::jsonb;
      ELSE
        params = TG_ARGV[3]::jsonb;
      END IF;

      IF TG_ARGV[4] IS NULL OR TG_ARGV[4] = 'null' THEN
        timeout_ms = 1000;
      ELSE
        timeout_ms = TG_ARGV[4]::integer;
      END IF;

      CASE
        WHEN method = 'GET' THEN
          SELECT http_get INTO request_id FROM net.http_get(
            url,
            params,
            headers,
            timeout_ms
          );
        WHEN method = 'POST' THEN
          payload = jsonb_build_object(
            'old_record', OLD,
            'record', NEW,
            'type', TG_OP,
            'table', TG_TABLE_NAME,
            'schema', TG_TABLE_SCHEMA
          );

          SELECT http_post INTO request_id FROM net.http_post(
            url,
            payload,
            params,
            headers,
            timeout_ms
          );
        ELSE
          RAISE EXCEPTION 'method argument % is invalid', method;
      END CASE;

      INSERT INTO supabase_functions.hooks
        (hook_table_id, hook_name, request_id)
      VALUES
        (TG_RELID, TG_NAME, request_id);

      RETURN NEW;
    END
  $$;


--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


--
-- Name: inputters; Type: TABLE; Schema: management; Owner: -
--

CREATE TABLE management.inputters (
    year text,
    username text NOT NULL,
    password text NOT NULL,
    role text NOT NULL,
    id bigint NOT NULL,
    name text
);


--
-- Name: inputters_id_seq; Type: SEQUENCE; Schema: management; Owner: -
--

ALTER TABLE management.inputters ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME management.inputters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: labels; Type: TABLE; Schema: management; Owner: -
--

CREATE TABLE management.labels (
    id bigint NOT NULL,
    comment text NOT NULL,
    hex_code text NOT NULL
);


--
-- Name: labels_id_seq; Type: SEQUENCE; Schema: management; Owner: -
--

ALTER TABLE management.labels ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME management.labels_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: question_labels; Type: TABLE; Schema: management; Owner: -
--

CREATE TABLE management.question_labels (
    id bigint NOT NULL,
    question_id bigint NOT NULL,
    label_id bigint NOT NULL
);


--
-- Name: question_labels_id_seq; Type: SEQUENCE; Schema: management; Owner: -
--

ALTER TABLE management.question_labels ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME management.question_labels_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: question_management; Type: TABLE; Schema: management; Owner: -
--

CREATE TABLE management.question_management (
    id bigint NOT NULL,
    question_id bigint NOT NULL,
    assigned_to bigint,
    done_by bigint
);


--
-- Name: question_management_id_seq; Type: SEQUENCE; Schema: management; Owner: -
--

ALTER TABLE management.question_management ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME management.question_management_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: question_patches; Type: TABLE; Schema: management; Owner: -
--

CREATE TABLE management.question_patches (
    id bigint NOT NULL,
    question_id bigint NOT NULL,
    patch jsonb,
    created_by bigint,
    previous_patch_id bigint
);


--
-- Name: question_patches_id_seq; Type: SEQUENCE; Schema: management; Owner: -
--

ALTER TABLE management.question_patches ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME management.question_patches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: question_snapshots; Type: TABLE; Schema: management; Owner: -
--

CREATE TABLE management.question_snapshots (
    id bigint NOT NULL,
    question_buffer text NOT NULL,
    sha_hash text NOT NULL,
    question_id bigint NOT NULL,
    created_by bigint
);


--
-- Name: COLUMN question_snapshots.question_buffer; Type: COMMENT; Schema: management; Owner: -
--

COMMENT ON COLUMN management.question_snapshots.question_buffer IS 'base64 string of a buffer';


--
-- Name: question_snapshots_id_seq; Type: SEQUENCE; Schema: management; Owner: -
--

ALTER TABLE management.question_snapshots ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME management.question_snapshots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: question_versions; Type: TABLE; Schema: management; Owner: -
--

CREATE TABLE management.question_versions (
    id bigint NOT NULL,
    question_id bigint NOT NULL,
    current_patch_id bigint
);


--
-- Name: question_versions_id_seq; Type: SEQUENCE; Schema: management; Owner: -
--

ALTER TABLE management.question_versions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME management.question_versions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: question_with_version; Type: VIEW; Schema: management; Owner: -
--

CREATE VIEW management.question_with_version WITH (security_invoker='true') AS
 SELECT qv.id AS version_id,
    pq.id AS question_id,
    qv.current_patch_id,
    qp.patch,
    qp.created_by,
    pq.year,
    pq.outer_category,
    pq.inner_category,
    pq.subject,
    pq.concept,
    pq.question_type,
    pq.difficulty,
    pq.need_image,
    pq.question_object_en,
    pq.book_ref,
    pq.question_object_zh,
    pq.audited
   FROM ((public.primary_questions pq
     LEFT JOIN management.question_versions qv ON ((pq.id = qv.question_id)))
     LEFT JOIN management.question_patches qp ON ((qv.current_patch_id = qp.id)));


--
-- Name: questions_with_labels; Type: VIEW; Schema: management; Owner: -
--

CREATE VIEW management.questions_with_labels AS
SELECT
    NULL::bigint AS id,
    NULL::smallint AS year,
    NULL::smallint AS outer_category,
    NULL::smallint AS inner_category,
    NULL::text AS subject,
    NULL::text AS concept,
    NULL::text AS question_type,
    NULL::smallint AS difficulty,
    NULL::boolean AS need_image,
    NULL::jsonb AS question_object_en,
    NULL::text AS book_ref,
    NULL::jsonb AS question_object_zh,
    NULL::boolean AS audited,
    NULL::bigint[] AS label_ids,
    NULL::jsonb[] AS label_details;


--
-- Name: questions_with_management; Type: VIEW; Schema: management; Owner: -
--

CREATE VIEW management.questions_with_management AS
SELECT
    NULL::bigint AS id,
    NULL::smallint AS year,
    NULL::smallint AS outer_category,
    NULL::smallint AS inner_category,
    NULL::text AS subject,
    NULL::text AS concept,
    NULL::text AS question_type,
    NULL::smallint AS difficulty,
    NULL::boolean AS need_image,
    NULL::jsonb AS question_object_en,
    NULL::jsonb AS question_object_zh,
    NULL::text AS book_ref,
    NULL::boolean AS audited,
    NULL::boolean AS en_empty,
    NULL::boolean AS zh_empty;


--
-- Name: activity_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_events (
    id bigint NOT NULL,
    event_id uuid,
    user_id uuid NOT NULL,
    session_id text NOT NULL,
    event_type text NOT NULL,
    path text,
    question_id bigint,
    region text,
    network_hash text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    event_ts timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: activity_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_events_id_seq OWNED BY public.activity_events.id;


--
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    admin_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: app_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_reports (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    category text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_resolved boolean DEFAULT false,
    resolved_at timestamp with time zone,
    resolved_by uuid,
    CONSTRAINT valid_app_report_category CHECK ((category = ANY (ARRAY['audio_loud'::text, 'rewards_not_given'::text, 'page_slow'::text, 'something_else'::text])))
);


--
-- Name: app_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.app_reports ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.app_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: category_flagged_prompts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.category_flagged_prompts (
    category_name text NOT NULL,
    prompt text NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: chat_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_history (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL,
    message text NOT NULL,
    metadata jsonb NOT NULL,
    role text NOT NULL
);


--
-- Name: chat_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.chat_history ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.chat_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: classroom_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classroom_participants (
    user_id uuid NOT NULL,
    classroom_id bigint NOT NULL,
    confirmed boolean DEFAULT false NOT NULL,
    id bigint NOT NULL
);


--
-- Name: classrooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classrooms (
    classroom_id bigint NOT NULL,
    school_id bigint NOT NULL,
    classroom_name text NOT NULL,
    archived boolean DEFAULT false NOT NULL
);


--
-- Name: students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.students (
    user_id uuid NOT NULL,
    stars bigint DEFAULT '0'::bigint NOT NULL,
    attempting_questions bigint[],
    education_level public.education_level DEFAULT 'primary'::public.education_level NOT NULL,
    year public.primary_years DEFAULT '2'::public.primary_years NOT NULL,
    last_checkin_date date DEFAULT CURRENT_DATE,
    daily_study_seconds integer DEFAULT 0,
    streak_count integer DEFAULT 0,
    total_streak integer DEFAULT 0,
    last_celebrated_level integer DEFAULT 1,
    last_todo_date date,
    last_celebrated_todo_date date,
    todo_list text[] DEFAULT '{}'::text[],
    last_celebrated_streak integer DEFAULT 0,
    onboarding_completed boolean DEFAULT false
);


--
-- Name: COLUMN students.attempting_questions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.students.attempting_questions IS 'list of questionIDs that the user is currently attempting';


--
-- Name: COLUMN students.last_checkin_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.students.last_checkin_date IS 'Date when student last checked in (resets timer at midnight)';


--
-- Name: COLUMN students.daily_study_seconds; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.students.daily_study_seconds IS 'Cumulative study time in seconds for current day (target: 1200s = 20 min)';


--
-- Name: teachers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teachers (
    teacher_id uuid DEFAULT auth.uid() NOT NULL,
    teaching_subject public.subjects[] NOT NULL,
    is_subject_head boolean DEFAULT false NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id uuid NOT NULL,
    role text DEFAULT 'student'::text NOT NULL,
    school_id bigint,
    first_name text,
    last_name text,
    referral_code text DEFAULT public.generate_referral_code(),
    referred_by text,
    paying boolean DEFAULT false NOT NULL,
    stripe_customer_id text,
    profile_image bigint DEFAULT '1'::bigint NOT NULL
);


--
-- Name: classroom_details; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.classroom_details WITH (security_invoker='true') AS
 SELECT c.classroom_id AS c_classroom_id,
    c.classroom_name AS c_classroom_name,
    c.archived AS c_archived,
    c.school_id AS c_school_id,
    cp.user_id AS cp_user_id,
    cp.confirmed AS cp_confirmed,
    u.role AS u_role,
    u.school_id AS u_school_id,
    u.first_name AS u_first_name,
    u.last_name AS u_last_name,
    t.teaching_subject AS t_teaching_subject,
    t.is_subject_head AS t_is_subject_head,
    s.stars AS s_stars,
    s.education_level AS s_education_level,
    s.year AS s_year,
    ( SELECT get_email_by_user.user_email
           FROM public.get_email_by_user(u.user_id) get_email_by_user(user_id, user_email)) AS u_email
   FROM ((((public.classrooms c
     LEFT JOIN public.classroom_participants cp ON ((c.classroom_id = cp.classroom_id)))
     LEFT JOIN public.users u ON ((cp.user_id = u.user_id)))
     LEFT JOIN public.teachers t ON (((u.user_id = t.teacher_id) AND (u.role = 'teacher'::text))))
     LEFT JOIN public.students s ON (((u.user_id = s.user_id) AND (u.role = 'student'::text))));


--
-- Name: classroom_participants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.classroom_participants ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.classroom_participants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: classroom_quizzes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classroom_quizzes (
    id bigint NOT NULL,
    classroom_id bigint NOT NULL,
    quiz_id bigint NOT NULL
);


--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quizzes (
    id bigint NOT NULL,
    quiz_name text NOT NULL,
    date_created timestamp with time zone DEFAULT now() NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    school_id bigint NOT NULL
);


--
-- Name: classroom_quizzes_aggregate; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.classroom_quizzes_aggregate WITH (security_invoker='true') AS
 SELECT cp.id AS cp_id,
    cp.user_id AS cp_user_id,
    cp.classroom_id AS cp_classroom_id,
    cp.confirmed AS cp_confirmed,
    cq.id AS cq_id,
    cq.quiz_id AS cq_quiz_id,
    q.school_id AS q_school_id,
    q.quiz_name AS q_quiz_name,
    q.date_created AS q_date_created,
    q.start_date AS q_start_date,
    q.end_date AS q_end_date
   FROM ((public.classroom_participants cp
     JOIN public.classroom_quizzes cq ON ((cp.classroom_id = cq.classroom_id)))
     JOIN public.quizzes q ON ((q.id = cq.quiz_id)));


--
-- Name: classroom_quizzes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.classroom_quizzes ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.classroom_quizzes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: classroom_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.classroom_summary WITH (security_invoker='true') AS
 SELECT cd.c_classroom_id,
    cd.c_classroom_name,
    cd.c_school_id,
    array_agg(DISTINCT cd.u_first_name) FILTER (WHERE (cd.u_first_name IS NOT NULL)) AS first_names,
    array_agg(DISTINCT cd.u_last_name) FILTER (WHERE (cd.u_last_name IS NOT NULL)) AS last_names,
    array_agg(DISTINCT subject.subject) FILTER (WHERE (cd.u_role = 'teacher'::text)) AS all_teaching_subjects,
    count(DISTINCT
        CASE
            WHEN (cd.u_role = 'student'::text) THEN cd.cp_user_id
            ELSE NULL::uuid
        END) AS total_students,
    count(DISTINCT
        CASE
            WHEN (cd.u_role = 'teacher'::text) THEN cd.cp_user_id
            ELSE NULL::uuid
        END) FILTER (WHERE (cd.u_role = 'teacher'::text)) AS total_teachers
   FROM (public.classroom_details cd
     LEFT JOIN LATERAL unnest(cd.t_teaching_subject) subject(subject) ON (true))
  GROUP BY cd.c_classroom_id, cd.c_classroom_name, cd.c_school_id;


--
-- Name: classrooms_classroom_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.classrooms ALTER COLUMN classroom_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.classrooms_classroom_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: coin_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coin_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
    user_id uuid NOT NULL,
    amount integer NOT NULL,
    type text NOT NULL
);


--
-- Name: completed_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.completed_questions (
    question_id bigint NOT NULL,
    user_id uuid NOT NULL,
    id bigint NOT NULL,
    accuracy numeric NOT NULL,
    time_taken smallint NOT NULL,
    completed_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL
);


--
-- Name: completed_questions_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.completed_questions_summary WITH (security_invoker='true') AS
 SELECT user_id,
    count(*) AS total_completed,
    avg(accuracy) AS average_accuracy,
    count(*) FILTER (WHERE (accuracy = 1.0)) AS total_fully_accurate
   FROM public.completed_questions
  GROUP BY user_id;


--
-- Name: completed_questions_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.completed_questions_view WITH (security_invoker='true') AS
 SELECT cq.id,
    cq.user_id,
    cq.time_taken,
    cq.question_id,
    cq.accuracy,
    date((cq.completed_at AT TIME ZONE 'HKT'::text)) AS date,
    q.year,
    q.subject,
    q.concept,
    q.outer_category,
    q.inner_category,
    q.difficulty,
    q.need_image,
    q.question_type
   FROM (public.completed_questions cq
     JOIN public.primary_questions q ON ((cq.question_id = q.id)));


--
-- Name: quiz_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_responses (
    student_id uuid NOT NULL,
    quiz_id bigint NOT NULL,
    id bigint NOT NULL,
    question_id bigint NOT NULL,
    user_answers jsonb NOT NULL,
    accuracy numeric NOT NULL,
    time_taken smallint NOT NULL
);


--
-- Name: completed_quizzes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.quiz_responses ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.completed_quizzes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: primary_questions_drafts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.primary_questions_drafts (
    id integer NOT NULL,
    original_question_id integer NOT NULL,
    title text,
    question_object_en jsonb,
    question_object_zh jsonb,
    outer_category integer NOT NULL,
    inner_category integer,
    difficulty integer NOT NULL,
    education_level text,
    year text,
    region text DEFAULT 'en'::text,
    type text,
    audited boolean DEFAULT false,
    need_image boolean DEFAULT false,
    edited_at timestamp without time zone DEFAULT now(),
    edited_by text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    image_description text,
    image_approved boolean DEFAULT false,
    image_url text,
    is_flagged boolean DEFAULT false,
    status text DEFAULT 'draft'::text
);


--
-- Name: TABLE primary_questions_drafts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.primary_questions_drafts IS 'Stores draft versions of questions being edited. Only one draft per original question allowed.';


--
-- Name: exercise_questions_effective; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.exercise_questions_effective AS
 SELECT p.id,
    COALESCE((d.year)::smallint, p.year) AS year,
    COALESCE((d.outer_category)::smallint, p.outer_category) AS outer_category,
    COALESCE((d.inner_category)::smallint, p.inner_category) AS inner_category,
    p.subject,
    p.concept,
    p.question_type,
    COALESCE((d.difficulty)::smallint, p.difficulty) AS difficulty,
    COALESCE(d.need_image, p.need_image) AS need_image,
    COALESCE(d.question_object_en, p.question_object_en) AS question_object_en,
    COALESCE(d.question_object_zh, p.question_object_zh) AS question_object_zh,
    COALESCE(d.image_description, p.image_description) AS image_description,
    COALESCE(d.image_approved, p.image_approved) AS image_approved,
    COALESCE(d.audited, p.audited) AS audited
   FROM (public.primary_questions p
     LEFT JOIN public.primary_questions_drafts d ON ((d.original_question_id = p.id)));


--
-- Name: VIEW exercise_questions_effective; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.exercise_questions_effective IS 'Specialized view for frontend exercise rendering, prioritizing audited drafts over original questions.';


--
-- Name: inputters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inputters (
    year text,
    username text NOT NULL,
    password text,
    role text DEFAULT 'editor'::text NOT NULL
);


--
-- Name: TABLE inputters; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.inputters IS 'User data for inputters into ''primary_questions'' table';


--
-- Name: COLUMN inputters.role; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inputters.role IS 'illustrator or question editor';


--
-- Name: math_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.math_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    year integer,
    category_id integer,
    category_name text,
    asset_url text,
    asset_type text,
    status text DEFAULT 'Active'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT math_assets_asset_type_check CHECK ((asset_type = ANY (ARRAY['2D Illustration'::text, '3D Shape'::text, 'Diagram'::text]))),
    CONSTRAINT math_assets_status_check CHECK ((status = ANY (ARRAY['Active'::text, 'Archived'::text]))),
    CONSTRAINT math_assets_year_check CHECK (((year >= 1) AND (year <= 6)))
);


--
-- Name: placement_completion_rewards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.placement_completion_rewards (
    user_id uuid NOT NULL,
    placement_result_id bigint,
    first_completed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: placement_question_rewards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.placement_question_rewards (
    user_id uuid NOT NULL,
    question_id bigint NOT NULL,
    placement_result_id bigint,
    first_correct_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: placement_test_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.placement_test_results (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    grade_level text NOT NULL,
    score numeric NOT NULL,
    total_questions integer NOT NULL,
    percentile numeric,
    completed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    details jsonb
);


--
-- Name: placement_test_results_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.placement_test_results ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.placement_test_results_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: primary_questions_backup; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.primary_questions_backup (
    id bigint NOT NULL,
    year smallint NOT NULL,
    outer_category smallint NOT NULL,
    inner_category smallint NOT NULL,
    subject text NOT NULL,
    concept text NOT NULL,
    question_type text NOT NULL,
    difficulty smallint NOT NULL,
    need_image boolean NOT NULL,
    question_object_en jsonb,
    book_ref text NOT NULL,
    question_object_zh jsonb,
    audited boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE primary_questions_backup; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.primary_questions_backup IS 'This is a backup of primary_questions';


--
-- Name: primary_questions_backup_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.primary_questions_backup ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.primary_questions_backup_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: primary_questions_drafts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.primary_questions_drafts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: primary_questions_drafts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.primary_questions_drafts_id_seq OWNED BY public.primary_questions_drafts.id;


--
-- Name: primary_questions_en_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.primary_questions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.primary_questions_en_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: product_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_keys (
    id bigint NOT NULL,
    key uuid DEFAULT gen_random_uuid() NOT NULL,
    spender uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    valid_until timestamp with time zone DEFAULT (now() + '1 year'::interval) NOT NULL
);


--
-- Name: product_keys_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.product_keys ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.product_keys_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: question_issues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_issues (
    id bigint NOT NULL,
    question_id bigint NOT NULL,
    user_id uuid NOT NULL,
    reason text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_resolved boolean DEFAULT false,
    resolved_at timestamp with time zone,
    resolved_by uuid,
    CONSTRAINT valid_issue_reason CHECK ((reason = ANY (ARRAY['question_wrong'::text, 'correct_answer_wrong'::text, 'my_answer_wrong'::text, 'explanation_incorrect'::text, 'image_mismatch'::text, 'audio_incorrect'::text, 'something_else'::text])))
);


--
-- Name: question_issues_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.question_issues ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.question_issues_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: question_views_daily; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_views_daily (
    day date NOT NULL,
    question_id bigint NOT NULL,
    views bigint DEFAULT 0 NOT NULL,
    unique_users bigint DEFAULT 0 NOT NULL
);


--
-- Name: questions_with_effective_status; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.questions_with_effective_status AS
 SELECT p.id,
    p.year,
    p.outer_category,
    p.inner_category,
    p.subject,
    p.concept,
    p.question_type,
    p.difficulty,
    p.need_image,
    p.question_object_en,
    p.book_ref,
    p.question_object_zh,
    p.audited,
    COALESCE(d.image_description, p.image_description) AS image_description,
    COALESCE(d.image_approved, p.image_approved) AS image_approved,
    COALESCE(d.is_flagged, p.is_flagged) AS is_flagged,
    (d.id IS NOT NULL) AS has_draft,
    COALESCE(d.audited, p.audited) AS effective_audited,
    COALESCE(d.image_url, p.image_url) AS image_url,
    COALESCE(d.status, p.status) AS status
   FROM (public.primary_questions p
     LEFT JOIN public.primary_questions_drafts d ON ((d.original_question_id = p.id)));


--
-- Name: quiz_creators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_creators (
    user_id uuid NOT NULL,
    quiz_id bigint NOT NULL,
    id bigint NOT NULL
);


--
-- Name: quiz_creators_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.quiz_creators ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.quiz_creators_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: quiz_junction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_junction (
    id bigint NOT NULL,
    quiz_id bigint NOT NULL,
    question_id bigint NOT NULL
);


--
-- Name: quiz_junction_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.quiz_junction ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.quiz_junction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_questions (
    question_id bigint NOT NULL,
    created_by uuid NOT NULL,
    question jsonb NOT NULL,
    access text DEFAULT 'public'::text NOT NULL,
    school_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    subject text,
    category text,
    mutable boolean DEFAULT true NOT NULL
);


--
-- Name: COLUMN user_questions.access; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_questions.access IS '''private'' or ''public''';


--
-- Name: COLUMN user_questions.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_questions.created_at IS 'UTC creation date';


--
-- Name: COLUMN user_questions.subject; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_questions.subject IS 'could be any value, for use reference only';


--
-- Name: quiz_questions_responses; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.quiz_questions_responses WITH (security_invoker='true') AS
 SELECT q.id AS q_quiz_id,
    q.school_id AS q_school_id,
    q.quiz_name AS q_quiz_name,
    q.date_created AS q_date_created,
    q.start_date AS q_start_date,
    q.end_date AS q_end_date,
    uq.question_id AS uq_question_id,
    uq.category AS uq_category,
    uq.subject AS uq_subject,
    uq.question AS uq_question,
    qr.student_id AS qr_student_id,
    qr.user_answers AS qr_user_answers,
    qr.accuracy AS qr_accuracy,
    qr.time_taken AS qr_time_taken
   FROM (((public.quizzes q
     JOIN public.quiz_junction qj ON ((q.id = qj.quiz_id)))
     JOIN public.user_questions uq ON ((qj.question_id = uq.question_id)))
     LEFT JOIN public.quiz_responses qr ON (((uq.question_id = qr.question_id) AND (q.id = qr.quiz_id))));


--
-- Name: quizzes_quiz_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.quizzes ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.quizzes_quiz_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: role_counts_by_school; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.role_counts_by_school WITH (security_invoker='true') AS
 SELECT school_id,
    role,
    count(*) AS role_count
   FROM public.users
  GROUP BY school_id, role;


--
-- Name: schools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schools (
    school_id bigint NOT NULL,
    school_name text NOT NULL,
    teacher_licenses smallint NOT NULL,
    admin_licenses smallint NOT NULL,
    payment_notes text
);


--
-- Name: school_user_licenses; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.school_user_licenses WITH (security_invoker='true') AS
 SELECT s.school_id,
    s.teacher_licenses,
    COALESCE(teacher_counts.teacher_count, (0)::bigint) AS teacher_count,
    s.admin_licenses,
    COALESCE(admin_counts.admin_count, (0)::bigint) AS admin_count
   FROM ((public.schools s
     LEFT JOIN ( SELECT u.school_id,
            count(*) AS teacher_count
           FROM public.users u
          WHERE (u.role = 'teacher'::text)
          GROUP BY u.school_id) teacher_counts ON ((s.school_id = teacher_counts.school_id)))
     LEFT JOIN ( SELECT u.school_id,
            count(*) AS admin_count
           FROM public.users u
          WHERE (u.role = 'admin'::text)
          GROUP BY u.school_id) admin_counts ON ((s.school_id = admin_counts.school_id)));


--
-- Name: schools_school_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.schools ALTER COLUMN school_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.schools_school_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: student_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_data (
    user_id uuid NOT NULL,
    education_level public.education_level DEFAULT 'primary'::public.education_level NOT NULL,
    year public.primary_years DEFAULT '2'::public.primary_years NOT NULL,
    initial_scores real[] DEFAULT '{0.5,0.43,0.41,0.4,0.38,0.35,0.33,0.31,0.3,0.28,0.26,0.24,0.22,0.2,0.18,0.15,0.12,0.1,0.08}'::real[] NOT NULL,
    current_scores real[] DEFAULT '{0.5,0.43,0.41,0.4,0.38,0.35,0.33,0.31,0.3,0.28,0.26,0.24,0.22,0.2,0.18,0.15,0.12,0.1,0.08}'::real[] NOT NULL,
    enabled_categories smallint[] DEFAULT '{1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1}'::smallint[] NOT NULL,
    id bigint NOT NULL
);


--
-- Name: student_data_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.student_data ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.student_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: student_scores_categories; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.student_scores_categories WITH (security_invoker='true') AS
 SELECT sd.current_scores,
    sd.enabled_categories,
    sd.education_level,
    sd.year,
    s.user_id
   FROM (public.student_data sd
     JOIN public.students s ON (((sd.education_level = s.education_level) AND (sd.year = s.year))))
  WHERE (s.user_id = sd.user_id);


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    key text NOT NULL,
    value text NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_coins; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.user_coins AS
 SELECT user_id,
    public.get_unique_correct_questions_count(user_id) AS question_coins,
    (COALESCE(( SELECT sum(coin_transactions.amount) AS sum
           FROM public.coin_transactions
          WHERE (coin_transactions.user_id = u.user_id)), (0)::bigint))::integer AS bonus_coins,
    ((COALESCE(( SELECT sum(coin_transactions.amount) AS sum
           FROM public.coin_transactions
          WHERE (coin_transactions.user_id = u.user_id)), (0)::bigint) + public.get_unique_correct_questions_count(user_id)))::integer AS total_coins,
    GREATEST(( SELECT max(coin_transactions.created_at) AS max
           FROM public.coin_transactions
          WHERE (coin_transactions.user_id = u.user_id)), ( SELECT max(completed_questions.completed_at) AS max
           FROM public.completed_questions
          WHERE (completed_questions.user_id = u.user_id))) AS last_updated
   FROM public.users u;


--
-- Name: user_created_questions_question_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.user_questions ALTER COLUMN question_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_created_questions_question_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_daily_reports; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.user_daily_reports WITH (security_invoker='true') AS
 SELECT date((cq.completed_at AT TIME ZONE 'HKT'::text)) AS date,
    pq.year,
    pq.subject,
    cq.user_id
   FROM (public.completed_questions cq
     JOIN public.primary_questions pq ON ((cq.question_id = pq.id)))
  GROUP BY (date((cq.completed_at AT TIME ZONE 'HKT'::text))), pq.year, pq.subject, cq.user_id;


--
-- Name: user_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.completed_questions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_weekly_reports; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.user_weekly_reports WITH (security_invoker='true') AS
 SELECT date(date_trunc('week'::text, (cq.completed_at AT TIME ZONE 'HKT'::text))) AS week_start,
    pq.year,
    pq.subject,
    cq.user_id
   FROM (public.completed_questions cq
     JOIN public.primary_questions pq ON ((cq.question_id = pq.id)))
  GROUP BY (date(date_trunc('week'::text, (cq.completed_at AT TIME ZONE 'HKT'::text)))), pq.year, pq.subject, cq.user_id;


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: hooks; Type: TABLE; Schema: supabase_functions; Owner: -
--

CREATE TABLE supabase_functions.hooks (
    id bigint NOT NULL,
    hook_table_id integer NOT NULL,
    hook_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    request_id bigint
);


--
-- Name: TABLE hooks; Type: COMMENT; Schema: supabase_functions; Owner: -
--

COMMENT ON TABLE supabase_functions.hooks IS 'Supabase Functions Hooks: Audit trail for triggered hooks.';


--
-- Name: hooks_id_seq; Type: SEQUENCE; Schema: supabase_functions; Owner: -
--

CREATE SEQUENCE supabase_functions.hooks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hooks_id_seq; Type: SEQUENCE OWNED BY; Schema: supabase_functions; Owner: -
--

ALTER SEQUENCE supabase_functions.hooks_id_seq OWNED BY supabase_functions.hooks.id;


--
-- Name: migrations; Type: TABLE; Schema: supabase_functions; Owner: -
--

CREATE TABLE supabase_functions.migrations (
    version text NOT NULL,
    inserted_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text,
    created_by text,
    idempotency_key text,
    rollback text[]
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: activity_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_events ALTER COLUMN id SET DEFAULT nextval('public.activity_events_id_seq'::regclass);


--
-- Name: primary_questions_drafts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.primary_questions_drafts ALTER COLUMN id SET DEFAULT nextval('public.primary_questions_drafts_id_seq'::regclass);


--
-- Name: hooks id; Type: DEFAULT; Schema: supabase_functions; Owner: -
--

ALTER TABLE ONLY supabase_functions.hooks ALTER COLUMN id SET DEFAULT nextval('supabase_functions.hooks_id_seq'::regclass);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: inputters inputters_id_key; Type: CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.inputters
    ADD CONSTRAINT inputters_id_key UNIQUE (id);


--
-- Name: inputters inputters_name_key; Type: CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.inputters
    ADD CONSTRAINT inputters_name_key UNIQUE (name);


--
-- Name: inputters inputters_pkey; Type: CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.inputters
    ADD CONSTRAINT inputters_pkey PRIMARY KEY (id);


--
-- Name: inputters inputters_username_key; Type: CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.inputters
    ADD CONSTRAINT inputters_username_key UNIQUE (username);


--
-- Name: labels labels_pkey; Type: CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.labels
    ADD CONSTRAINT labels_pkey PRIMARY KEY (id);


--
-- Name: question_labels question_labels_id_key; Type: CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_labels
    ADD CONSTRAINT question_labels_id_key UNIQUE (id);


--
-- Name: question_labels question_labels_pkey; Type: CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_labels
    ADD CONSTRAINT question_labels_pkey PRIMARY KEY (id);


--
-- Name: question_management question_management_pkey; Type: CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_management
    ADD CONSTRAINT question_management_pkey PRIMARY KEY (id);


--
-- Name: question_patches question_patches_pkey; Type: CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_patches
    ADD CONSTRAINT question_patches_pkey PRIMARY KEY (id);


--
-- Name: question_snapshots question_snapshots_pkey; Type: CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_snapshots
    ADD CONSTRAINT question_snapshots_pkey PRIMARY KEY (id);


--
-- Name: question_versions question_versions_pkey; Type: CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_versions
    ADD CONSTRAINT question_versions_pkey PRIMARY KEY (id);


--
-- Name: question_versions question_versions_question_id_key; Type: CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_versions
    ADD CONSTRAINT question_versions_question_id_key UNIQUE (question_id);


--
-- Name: question_labels unique_question_id_label_id; Type: CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_labels
    ADD CONSTRAINT unique_question_id_label_id UNIQUE (question_id, label_id);


--
-- Name: question_snapshots unique_question_id_sha_hash; Type: CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_snapshots
    ADD CONSTRAINT unique_question_id_sha_hash UNIQUE (question_id, sha_hash);


--
-- Name: activity_events activity_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_events
    ADD CONSTRAINT activity_events_pkey PRIMARY KEY (id);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (admin_id);


--
-- Name: app_reports app_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_reports
    ADD CONSTRAINT app_reports_pkey PRIMARY KEY (id);


--
-- Name: category_flagged_prompts category_flagged_prompts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category_flagged_prompts
    ADD CONSTRAINT category_flagged_prompts_pkey PRIMARY KEY (category_name);


--
-- Name: chat_history chat_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_history
    ADD CONSTRAINT chat_history_pkey PRIMARY KEY (id);


--
-- Name: classroom_participants classroom_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classroom_participants
    ADD CONSTRAINT classroom_participants_pkey PRIMARY KEY (id);


--
-- Name: classroom_quizzes classroom_quizzes_classroom_id_quiz_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classroom_quizzes
    ADD CONSTRAINT classroom_quizzes_classroom_id_quiz_id_key UNIQUE (classroom_id, quiz_id);


--
-- Name: classroom_quizzes classroom_quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classroom_quizzes
    ADD CONSTRAINT classroom_quizzes_pkey PRIMARY KEY (id);


--
-- Name: classrooms classrooms_classroom_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classrooms
    ADD CONSTRAINT classrooms_classroom_id_key UNIQUE (classroom_id);


--
-- Name: classrooms classrooms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classrooms
    ADD CONSTRAINT classrooms_pkey PRIMARY KEY (classroom_id);


--
-- Name: coin_transactions coin_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coin_transactions
    ADD CONSTRAINT coin_transactions_pkey PRIMARY KEY (id);


--
-- Name: quiz_responses completed_quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_responses
    ADD CONSTRAINT completed_quizzes_pkey PRIMARY KEY (id);


--
-- Name: inputters inputters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inputters
    ADD CONSTRAINT inputters_pkey PRIMARY KEY (username);


--
-- Name: math_assets math_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.math_assets
    ADD CONSTRAINT math_assets_pkey PRIMARY KEY (id);


--
-- Name: placement_completion_rewards placement_completion_rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_completion_rewards
    ADD CONSTRAINT placement_completion_rewards_pkey PRIMARY KEY (user_id);


--
-- Name: placement_question_rewards placement_question_rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_question_rewards
    ADD CONSTRAINT placement_question_rewards_pkey PRIMARY KEY (user_id, question_id);


--
-- Name: placement_test_results placement_test_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_test_results
    ADD CONSTRAINT placement_test_results_pkey PRIMARY KEY (id);


--
-- Name: primary_questions_backup primary_questions_backup_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.primary_questions_backup
    ADD CONSTRAINT primary_questions_backup_id_key UNIQUE (id);


--
-- Name: primary_questions_backup primary_questions_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.primary_questions_backup
    ADD CONSTRAINT primary_questions_backup_pkey PRIMARY KEY (id);


--
-- Name: primary_questions_drafts primary_questions_drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.primary_questions_drafts
    ADD CONSTRAINT primary_questions_drafts_pkey PRIMARY KEY (id);


--
-- Name: primary_questions primary_questions_en_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.primary_questions
    ADD CONSTRAINT primary_questions_en_id_key UNIQUE (id);


--
-- Name: primary_questions primary_questions_en_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.primary_questions
    ADD CONSTRAINT primary_questions_en_pkey PRIMARY KEY (id);


--
-- Name: product_keys product_keys_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_keys
    ADD CONSTRAINT product_keys_id_key UNIQUE (id);


--
-- Name: product_keys product_keys_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_keys
    ADD CONSTRAINT product_keys_key_key UNIQUE (key);


--
-- Name: product_keys product_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_keys
    ADD CONSTRAINT product_keys_pkey PRIMARY KEY (id);


--
-- Name: product_keys product_keys_spender_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_keys
    ADD CONSTRAINT product_keys_spender_key UNIQUE (spender);


--
-- Name: question_issues question_issues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_issues
    ADD CONSTRAINT question_issues_pkey PRIMARY KEY (id);


--
-- Name: question_views_daily question_views_daily_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_views_daily
    ADD CONSTRAINT question_views_daily_pkey PRIMARY KEY (day, question_id);


--
-- Name: quiz_creators quiz_creator_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_creators
    ADD CONSTRAINT quiz_creator_pkey PRIMARY KEY (id);


--
-- Name: quiz_junction quiz_junction_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_junction
    ADD CONSTRAINT quiz_junction_id_key UNIQUE (id);


--
-- Name: quiz_junction quiz_junction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_junction
    ADD CONSTRAINT quiz_junction_pkey PRIMARY KEY (id);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: schools schools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_pkey PRIMARY KEY (school_id);


--
-- Name: schools schools_school_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_school_id_key UNIQUE (school_id);


--
-- Name: schools schools_school_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_school_name_key UNIQUE (school_name);


--
-- Name: student_data student_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_data
    ADD CONSTRAINT student_data_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (key);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (teacher_id);


--
-- Name: students temp_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT temp_users_pkey PRIMARY KEY (user_id);


--
-- Name: primary_questions_drafts unique_draft_per_question; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.primary_questions_drafts
    ADD CONSTRAINT unique_draft_per_question UNIQUE (original_question_id);


--
-- Name: product_keys unique_key_spender; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_keys
    ADD CONSTRAINT unique_key_spender UNIQUE (key, spender);


--
-- Name: quiz_junction unique_quiz_question_pair; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_junction
    ADD CONSTRAINT unique_quiz_question_pair UNIQUE (quiz_id, question_id);


--
-- Name: quiz_responses unique_student_quiz_question; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_responses
    ADD CONSTRAINT unique_student_quiz_question UNIQUE (student_id, quiz_id, question_id);


--
-- Name: student_data unique_user_education_year; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_data
    ADD CONSTRAINT unique_user_education_year UNIQUE (user_id, education_level, year);


--
-- Name: classroom_participants unique_userid_classroomid; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classroom_participants
    ADD CONSTRAINT unique_userid_classroomid UNIQUE (user_id, classroom_id);


--
-- Name: quiz_creators unique_userid_quizid_pair; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_creators
    ADD CONSTRAINT unique_userid_quizid_pair UNIQUE (user_id, quiz_id);


--
-- Name: user_questions user_created_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_questions
    ADD CONSTRAINT user_created_questions_pkey PRIMARY KEY (question_id);


--
-- Name: user_questions user_created_questions_question_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_questions
    ADD CONSTRAINT user_created_questions_question_id_key UNIQUE (question_id);


--
-- Name: completed_questions user_questions_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.completed_questions
    ADD CONSTRAINT user_questions_id_key UNIQUE (id);


--
-- Name: completed_questions user_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.completed_questions
    ADD CONSTRAINT user_questions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_referral_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_referral_code_key UNIQUE (referral_code);


--
-- Name: users users_stripe_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_stripe_customer_id_key UNIQUE (stripe_customer_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: hooks hooks_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: -
--

ALTER TABLE ONLY supabase_functions.hooks
    ADD CONSTRAINT hooks_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: -
--

ALTER TABLE ONLY supabase_functions.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (version);


--
-- Name: schema_migrations schema_migrations_idempotency_key_key; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: idx_activity_event_ts; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_event_ts ON public.activity_events USING btree (event_type, event_ts DESC);


--
-- Name: idx_activity_network_ts; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_network_ts ON public.activity_events USING btree (network_hash, event_ts DESC) WHERE (network_hash IS NOT NULL);


--
-- Name: idx_activity_question_ts; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_question_ts ON public.activity_events USING btree (question_id, event_ts DESC) WHERE (question_id IS NOT NULL);


--
-- Name: idx_activity_user_ts; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_user_ts ON public.activity_events USING btree (user_id, event_ts DESC);


--
-- Name: idx_completed_questions_user_question; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_completed_questions_user_question ON public.completed_questions USING btree (user_id, question_id);


--
-- Name: idx_completed_questions_user_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_completed_questions_user_time ON public.completed_questions USING btree (user_id, completed_at DESC);


--
-- Name: idx_drafts_original_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_drafts_original_id ON public.primary_questions_drafts USING btree (original_question_id);


--
-- Name: idx_placement_question_rewards_result_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_placement_question_rewards_result_id ON public.placement_question_rewards USING btree (placement_result_id);


--
-- Name: idx_placement_question_rewards_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_placement_question_rewards_user_id ON public.placement_question_rewards USING btree (user_id);


--
-- Name: idx_primary_questions_drafts_original_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_primary_questions_drafts_original_id ON public.primary_questions_drafts USING btree (original_question_id);


--
-- Name: idx_primary_questions_fetch; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_primary_questions_fetch ON public.primary_questions USING btree (outer_category, difficulty, year, audited);


--
-- Name: idx_students_last_checkin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_students_last_checkin ON public.students USING btree (last_checkin_date);


--
-- Name: unique_user_type_per_day; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_user_type_per_day ON public.coin_transactions USING btree (user_id, type, (((created_at AT TIME ZONE 'UTC'::text))::date));


--
-- Name: uq_activity_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_activity_event_id ON public.activity_events USING btree (event_id) WHERE (event_id IS NOT NULL);


--
-- Name: user_id_and_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_id_and_type ON public.coin_transactions USING btree (user_id, type);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_key ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: supabase_functions_hooks_h_table_id_h_name_idx; Type: INDEX; Schema: supabase_functions; Owner: -
--

CREATE INDEX supabase_functions_hooks_h_table_id_h_name_idx ON supabase_functions.hooks USING btree (hook_table_id, hook_name);


--
-- Name: supabase_functions_hooks_request_id_idx; Type: INDEX; Schema: supabase_functions; Owner: -
--

CREATE INDEX supabase_functions_hooks_request_id_idx ON supabase_functions.hooks USING btree (request_id);


--
-- Name: questions_with_labels _RETURN; Type: RULE; Schema: management; Owner: -
--

CREATE OR REPLACE VIEW management.questions_with_labels WITH (security_invoker='true') AS
 SELECT pq.id,
    pq.year,
    pq.outer_category,
    pq.inner_category,
    pq.subject,
    pq.concept,
    pq.question_type,
    pq.difficulty,
    pq.need_image,
    pq.question_object_en,
    pq.book_ref,
    pq.question_object_zh,
    pq.audited,
    array_agg(l.id) AS label_ids,
    array_agg(jsonb_build_object('id', l.id, 'comment', l.comment, 'hex_code', l.hex_code)) AS label_details
   FROM ((public.primary_questions pq
     LEFT JOIN management.question_labels ql ON ((pq.id = ql.question_id)))
     LEFT JOIN management.labels l ON ((ql.label_id = l.id)))
  GROUP BY pq.id
  ORDER BY pq.id;


--
-- Name: questions_with_management _RETURN; Type: RULE; Schema: management; Owner: -
--

CREATE OR REPLACE VIEW management.questions_with_management WITH (security_invoker='true') AS
 SELECT pq.id,
    pq.year,
    pq.outer_category,
    pq.inner_category,
    pq.subject,
    pq.concept,
    pq.question_type,
    pq.difficulty,
    pq.need_image,
    pq.question_object_en,
    pq.question_object_zh,
    pq.book_ref,
    pq.audited,
        CASE
            WHEN ((pq.question_object_en IS NULL) OR (pq.question_object_en = '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb)) THEN true
            ELSE false
        END AS en_empty,
        CASE
            WHEN ((pq.question_object_zh IS NULL) OR (pq.question_object_zh = '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb)) THEN true
            ELSE false
        END AS zh_empty
   FROM (public.primary_questions pq
     LEFT JOIN management.question_management qm ON ((pq.id = qm.question_id)))
  GROUP BY pq.id
  ORDER BY pq.id;


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.process_new_user();


--
-- Name: math_assets on_math_assets_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_math_assets_updated BEFORE UPDATE ON public.math_assets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: students on_student_created; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_student_created AFTER INSERT ON public.students FOR EACH ROW EXECUTE FUNCTION public.create_student_data();


--
-- Name: primary_questions_drafts tr_update_drafts_timestamps; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_update_drafts_timestamps BEFORE UPDATE ON public.primary_questions_drafts FOR EACH ROW EXECUTE FUNCTION public.update_drafts_timestamps();


--
-- Name: primary_questions tr_update_primary_questions_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_update_primary_questions_timestamp BEFORE UPDATE ON public.primary_questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: question_labels question_labels_label_id_fkey; Type: FK CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_labels
    ADD CONSTRAINT question_labels_label_id_fkey FOREIGN KEY (label_id) REFERENCES management.labels(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: question_labels question_labels_question_id_fkey; Type: FK CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_labels
    ADD CONSTRAINT question_labels_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.primary_questions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: question_management question_management_assigned_to_fkey; Type: FK CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_management
    ADD CONSTRAINT question_management_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES management.inputters(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: question_management question_management_done_by_fkey; Type: FK CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_management
    ADD CONSTRAINT question_management_done_by_fkey FOREIGN KEY (done_by) REFERENCES management.inputters(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: question_management question_management_question_id_fkey; Type: FK CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_management
    ADD CONSTRAINT question_management_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.primary_questions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: question_patches question_patches_created_by_fkey; Type: FK CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_patches
    ADD CONSTRAINT question_patches_created_by_fkey FOREIGN KEY (created_by) REFERENCES management.inputters(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: question_patches question_patches_previous_patch_id_fkey; Type: FK CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_patches
    ADD CONSTRAINT question_patches_previous_patch_id_fkey FOREIGN KEY (previous_patch_id) REFERENCES management.question_patches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: question_patches question_patches_question_id_fkey; Type: FK CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_patches
    ADD CONSTRAINT question_patches_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.primary_questions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: question_snapshots question_snapshots_created_by_fkey; Type: FK CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_snapshots
    ADD CONSTRAINT question_snapshots_created_by_fkey FOREIGN KEY (created_by) REFERENCES management.inputters(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: question_snapshots question_snapshots_question_id_fkey; Type: FK CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_snapshots
    ADD CONSTRAINT question_snapshots_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.primary_questions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: question_versions question_versions_current_patch_id_fkey1; Type: FK CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_versions
    ADD CONSTRAINT question_versions_current_patch_id_fkey1 FOREIGN KEY (current_patch_id) REFERENCES management.question_patches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: question_versions question_versions_question_id_fkey; Type: FK CONSTRAINT; Schema: management; Owner: -
--

ALTER TABLE ONLY management.question_versions
    ADD CONSTRAINT question_versions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.primary_questions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: app_reports app_reports_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_reports
    ADD CONSTRAINT app_reports_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: app_reports app_reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_reports
    ADD CONSTRAINT app_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: chat_history chat_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_history
    ADD CONSTRAINT chat_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: classroom_quizzes classroom_quizzes_classroom_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classroom_quizzes
    ADD CONSTRAINT classroom_quizzes_classroom_id_fkey FOREIGN KEY (classroom_id) REFERENCES public.classrooms(classroom_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: classroom_quizzes classroom_quizzes_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classroom_quizzes
    ADD CONSTRAINT classroom_quizzes_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: coin_transactions coin_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coin_transactions
    ADD CONSTRAINT coin_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE;


--
-- Name: completed_questions completed_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.completed_questions
    ADD CONSTRAINT completed_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.primary_questions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: completed_questions completed_questions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.completed_questions
    ADD CONSTRAINT completed_questions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.students(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quiz_responses completed_quizzes_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_responses
    ADD CONSTRAINT completed_quizzes_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.user_questions(question_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: primary_questions_drafts fk_primary_questions_drafts_original; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.primary_questions_drafts
    ADD CONSTRAINT fk_primary_questions_drafts_original FOREIGN KEY (original_question_id) REFERENCES public.primary_questions(id) ON DELETE CASCADE;


--
-- Name: placement_question_rewards placement_question_rewards_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_question_rewards
    ADD CONSTRAINT placement_question_rewards_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.primary_questions(id) ON DELETE CASCADE;


--
-- Name: placement_test_results placement_test_results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_test_results
    ADD CONSTRAINT placement_test_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.students(user_id);


--
-- Name: primary_questions_drafts primary_questions_drafts_original_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.primary_questions_drafts
    ADD CONSTRAINT primary_questions_drafts_original_question_id_fkey FOREIGN KEY (original_question_id) REFERENCES public.primary_questions(id) ON DELETE CASCADE;


--
-- Name: product_keys product_keys_spender_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_keys
    ADD CONSTRAINT product_keys_spender_fkey FOREIGN KEY (spender) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: admins public_admins_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT public_admins_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: classroom_participants public_classroom_students_classroom_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classroom_participants
    ADD CONSTRAINT public_classroom_students_classroom_id_fkey FOREIGN KEY (classroom_id) REFERENCES public.classrooms(classroom_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: classroom_participants public_classroom_students_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classroom_participants
    ADD CONSTRAINT public_classroom_students_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: classrooms public_classrooms_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classrooms
    ADD CONSTRAINT public_classrooms_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(school_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quiz_responses public_completed_quizzes_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_responses
    ADD CONSTRAINT public_completed_quizzes_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON UPDATE CASCADE;


--
-- Name: quiz_responses public_completed_quizzes_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_responses
    ADD CONSTRAINT public_completed_quizzes_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(user_id) ON UPDATE CASCADE;


--
-- Name: quiz_creators public_quiz_creator_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_creators
    ADD CONSTRAINT public_quiz_creator_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_data public_student_data_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_data
    ADD CONSTRAINT public_student_data_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teachers public_teachers_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT public_teachers_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_questions public_user_created_questions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_questions
    ADD CONSTRAINT public_user_created_questions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON UPDATE CASCADE;


--
-- Name: user_questions public_user_created_questions_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_questions
    ADD CONSTRAINT public_user_created_questions_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(school_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users public_users_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT public_users_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(school_id) ON UPDATE CASCADE;


--
-- Name: users public_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT public_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: question_issues question_issues_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_issues
    ADD CONSTRAINT question_issues_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.primary_questions(id) ON DELETE CASCADE;


--
-- Name: question_issues question_issues_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_issues
    ADD CONSTRAINT question_issues_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: question_issues question_issues_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_issues
    ADD CONSTRAINT question_issues_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: quiz_creators quiz_creators_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_creators
    ADD CONSTRAINT quiz_creators_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quiz_junction quiz_junction_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_junction
    ADD CONSTRAINT quiz_junction_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.user_questions(question_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quiz_junction quiz_junction_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_junction
    ADD CONSTRAINT quiz_junction_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quizzes quizzes_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(school_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: students temp_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT temp_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_questions user_questions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_questions
    ADD CONSTRAINT user_questions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_referred_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_referred_by_fkey FOREIGN KEY (referred_by) REFERENCES public.users(referral_code) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: inputters; Type: ROW SECURITY; Schema: management; Owner: -
--

ALTER TABLE management.inputters ENABLE ROW LEVEL SECURITY;

--
-- Name: labels; Type: ROW SECURITY; Schema: management; Owner: -
--

ALTER TABLE management.labels ENABLE ROW LEVEL SECURITY;

--
-- Name: question_labels; Type: ROW SECURITY; Schema: management; Owner: -
--

ALTER TABLE management.question_labels ENABLE ROW LEVEL SECURITY;

--
-- Name: question_management; Type: ROW SECURITY; Schema: management; Owner: -
--

ALTER TABLE management.question_management ENABLE ROW LEVEL SECURITY;

--
-- Name: question_patches; Type: ROW SECURITY; Schema: management; Owner: -
--

ALTER TABLE management.question_patches ENABLE ROW LEVEL SECURITY;

--
-- Name: question_snapshots; Type: ROW SECURITY; Schema: management; Owner: -
--

ALTER TABLE management.question_snapshots ENABLE ROW LEVEL SECURITY;

--
-- Name: question_versions; Type: ROW SECURITY; Schema: management; Owner: -
--

ALTER TABLE management.question_versions ENABLE ROW LEVEL SECURITY;

--
-- Name: primary_questions Allow Service Role to view; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow Service Role to view" ON public.primary_questions FOR SELECT TO service_role USING (true);


--
-- Name: primary_questions_drafts Allow all operations on drafts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on drafts" ON public.primary_questions_drafts USING (true) WITH CHECK (true);


--
-- Name: math_assets Allow public delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public delete" ON public.math_assets FOR DELETE USING (true);


--
-- Name: math_assets Allow public insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert" ON public.math_assets FOR INSERT WITH CHECK (true);


--
-- Name: math_assets Allow public read access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access" ON public.math_assets FOR SELECT USING (true);


--
-- Name: math_assets Allow public update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update" ON public.math_assets FOR UPDATE USING (true);


--
-- Name: students Allow service role to VIEW ALL; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow service role to VIEW ALL" ON public.students FOR SELECT TO service_role USING (true);


--
-- Name: students Authenticated can view their rows; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can view their rows" ON public.students FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: question_issues Users can insert own issues; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own issues" ON public.question_issues FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: app_reports Users can insert their own app reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own app reports" ON public.app_reports FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: placement_test_results Users can insert their own placement results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own placement results" ON public.placement_test_results FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: question_issues Users can view own issues; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own issues" ON public.question_issues FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: app_reports Users can view their own app reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own app reports" ON public.app_reports FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: placement_test_results Users can view their own placement results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own placement results" ON public.placement_test_results FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: activity_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

--
-- Name: admins; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

--
-- Name: app_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.app_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: category_flagged_prompts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.category_flagged_prompts ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

--
-- Name: classroom_participants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.classroom_participants ENABLE ROW LEVEL SECURITY;

--
-- Name: classroom_quizzes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.classroom_quizzes ENABLE ROW LEVEL SECURITY;

--
-- Name: classrooms; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;

--
-- Name: coin_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: completed_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.completed_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: inputters; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.inputters ENABLE ROW LEVEL SECURITY;

--
-- Name: math_assets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.math_assets ENABLE ROW LEVEL SECURITY;

--
-- Name: placement_test_results; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.placement_test_results ENABLE ROW LEVEL SECURITY;

--
-- Name: primary_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.primary_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: primary_questions_backup; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.primary_questions_backup ENABLE ROW LEVEL SECURITY;

--
-- Name: primary_questions_drafts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.primary_questions_drafts ENABLE ROW LEVEL SECURITY;

--
-- Name: product_keys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: question_issues; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_issues ENABLE ROW LEVEL SECURITY;

--
-- Name: question_views_daily; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_views_daily ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_creators; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz_creators ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_junction; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz_junction ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_responses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: quizzes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

--
-- Name: schools; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

--
-- Name: student_data; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.student_data ENABLE ROW LEVEL SECURITY;

--
-- Name: students; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

--
-- Name: teachers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

--
-- Name: user_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Public Delete in math-assets; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Public Delete in math-assets" ON storage.objects FOR DELETE USING ((bucket_id = 'math-assets'::text));


--
-- Name: objects Public Read Access; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING ((bucket_id = 'question-images'::text));


--
-- Name: objects Public Read Access for math-assets; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Public Read Access for math-assets" ON storage.objects FOR SELECT USING ((bucket_id = 'math-assets'::text));


--
-- Name: objects Public Update in math-assets; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Public Update in math-assets" ON storage.objects FOR UPDATE USING ((bucket_id = 'math-assets'::text));


--
-- Name: objects Public Upload to math-assets; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Public Upload to math-assets" ON storage.objects FOR INSERT WITH CHECK ((bucket_id = 'math-assets'::text));


--
-- Name: objects Service Role Upload; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Service Role Upload" ON storage.objects FOR INSERT WITH CHECK ((bucket_id = 'question-images'::text));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict Hj9gqk94NQmofEEaf7sD46WJqH7fxIJwhVNypYkQm1pOxy1zxgX8g3ekyeloqe4

