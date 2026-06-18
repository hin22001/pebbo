-- Teacher quiz generation.
-- Selects audited questions from the EFFECTIVE view (drafts-over-primary, the
-- same source the student exercise reads) by category + difficulty + year, in
-- random order, capped to 1-10 total. Read-only / STABLE; the route enforces
-- auth and the service client invokes it. Set-membership (= ANY) + total LIMIT
-- is the teacher shape (multi-select levels, choose N total) — intentionally
-- different from the student get_questionobj_* family, which zips one difficulty
-- per category positionally and caps 3 per category.
--
-- Spec: docs/superpowers/specs/2026-06-01-teacher-quiz-generation-design.md
CREATE OR REPLACE FUNCTION public.generate_teacher_quiz_questions(
  p_categories   integer[],
  p_difficulties integer[],
  p_year         integer,
  p_count        integer,
  p_region       text DEFAULT 'en'
)
RETURNS TABLE(id bigint, outer_category smallint, difficulty smallint, question_object jsonb)
LANGUAGE sql
STABLE
AS $function$
  SELECT
    q.id,
    q.outer_category,
    q.difficulty,
    CASE WHEN p_region = 'zh' THEN q.question_object_zh ELSE q.question_object_en END
  FROM exercise_questions_effective q
  WHERE q.audited = TRUE
    AND q.year = p_year
    AND q.outer_category = ANY(p_categories)
    AND q.difficulty     = ANY(p_difficulties)
  ORDER BY random()
  LIMIT GREATEST(LEAST(p_count, 10), 1);
$function$;
