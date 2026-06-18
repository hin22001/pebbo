-- Create a specialized view for exercises that prioritizes audited draft content
CREATE OR REPLACE VIEW public.exercise_questions_effective AS
SELECT 
    p.id,
    COALESCE(d.year::smallint, p.year) AS year,
    COALESCE(d.outer_category::smallint, p.outer_category) AS outer_category,
    COALESCE(d.inner_category::smallint, p.inner_category) AS inner_category,
    p.subject,
    p.concept,
    p.question_type,
    COALESCE(d.difficulty::smallint, p.difficulty) AS difficulty,
    COALESCE(d.need_image, p.need_image) AS need_image,
    COALESCE(d.question_object_en, p.question_object_en) AS question_object_en,
    COALESCE(d.question_object_zh, p.question_object_zh) AS question_object_zh,
    COALESCE(d.image_description, p.image_description) AS image_description,
    COALESCE(d.image_approved, p.image_approved) AS image_approved,
    COALESCE(d.audited, p.audited) AS is_audited
FROM public.primary_questions p
LEFT JOIN public.primary_questions_drafts d ON d.original_question_id = p.id;

COMMENT ON VIEW public.exercise_questions_effective IS 'Specialized view for frontend exercise rendering, prioritizing audited drafts over original questions.';
