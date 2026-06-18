-- Placement rewards:
-- - Coins: +1 per unique correctly answered placement question (per user, lifetime)
-- - Stars: +5 only on first placement completion (per user, lifetime)

CREATE TABLE IF NOT EXISTS public.placement_question_rewards (
    user_id uuid NOT NULL,
    question_id bigint NOT NULL,
    placement_result_id bigint NULL,
    first_correct_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT placement_question_rewards_pkey PRIMARY KEY (user_id, question_id),
    CONSTRAINT placement_question_rewards_question_id_fkey
        FOREIGN KEY (question_id) REFERENCES public.primary_questions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_placement_question_rewards_user_id
    ON public.placement_question_rewards (user_id);

CREATE INDEX IF NOT EXISTS idx_placement_question_rewards_result_id
    ON public.placement_question_rewards (placement_result_id);

CREATE TABLE IF NOT EXISTS public.placement_completion_rewards (
    user_id uuid PRIMARY KEY,
    placement_result_id bigint NULL,
    first_completed_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.process_placement_rewards(
    p_user_id uuid,
    p_correct_question_ids bigint[],
    p_placement_result_id bigint
)
RETURNS TABLE(coins_awarded integer, stars_awarded integer, total_coins integer, total_stars integer)
LANGUAGE plpgsql
AS $function$
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
$function$;
