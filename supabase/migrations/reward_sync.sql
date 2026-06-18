-- Update process_completed_questions to include coin rewards
CREATE OR REPLACE FUNCTION public.process_completed_questions(_user_id uuid, new_score integer[], completed_qs jsonb, education_level public.education_level, year public.primary_years)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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

    -- Update user_coins (+10 per question)
    IF EXISTS (SELECT 1 FROM user_coins WHERE user_id = _user_id) THEN
        UPDATE user_coins
        SET question_coins = question_coins + (completed_questions_count * 10),
            total_coins = total_coins + (completed_questions_count * 10),
            last_updated = now()
        WHERE user_id = _user_id;
    ELSE
        INSERT INTO user_coins (user_id, question_coins, bonus_coins, total_coins, last_updated)
        VALUES (_user_id, completed_questions_count * 10, 0, completed_questions_count * 10, now());
    END IF;

    -- Update student_data (Scores)
    UPDATE student_data
    SET current_scores = new_score
    WHERE user_id = _user_id AND student_data.education_level = $4 AND student_data.year = $5;

END;
$function$;
