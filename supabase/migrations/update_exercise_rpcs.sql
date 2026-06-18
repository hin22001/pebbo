-- 1. Optimized Question Fetching (Set-based, index-friendly)
-- Target: Reduce fetch time from 9s to <1s
CREATE OR REPLACE FUNCTION public.get_questionobj_bycategoryregion_optimized(categories integer[], difficulties integer[], region text, _user_id uuid, year integer)
 RETURNS TABLE(id bigint, outer_category smallint, difficulty smallint, question_object jsonb)
 LANGUAGE sql STABLE
AS $function$
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
$function$;

-- 2. Atomic Submission (Atomic updates + data return)
-- Target: Reduce submit delay from 3.4s to <1s
CREATE OR REPLACE FUNCTION public.process_completed_questions_optimized(_user_id uuid, new_score integer[], completed_qs jsonb, education_level public.education_level, year public.primary_years)
 RETURNS TABLE(coins_awarded int, total_coins int)
 LANGUAGE plpgsql
AS $function$
DECLARE
    item JSONB;
    completed_questions_count INTEGER;
    awarded INTEGER;
    new_balance INTEGER;
BEGIN
    completed_questions_count := jsonb_array_length(completed_qs);
    awarded := completed_questions_count * 10;

    -- Insert into completed_questions
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

    -- Atomic Coin Upsert and Balance Retrieval
    INSERT INTO user_coins (user_id, question_coins, bonus_coins, total_coins, last_updated)
    VALUES (_user_id, awarded, 0, awarded, now())
    ON CONFLICT (user_id) DO UPDATE
    SET question_coins = user_coins.question_coins + EXCLUDED.question_coins,
        total_coins = user_coins.total_coins + EXCLUDED.question_coins,
        last_updated = now()
    RETURNING user_coins.total_coins INTO new_balance;

    -- Update scores
    UPDATE student_data
    SET current_scores = new_score
    WHERE user_id = _user_id AND student_data.education_level = $4 AND student_data.year = $5;

    RETURN QUERY SELECT awarded, new_balance;
END;
$function$;
