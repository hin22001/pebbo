import { SupabaseClient } from "@supabase/supabase-js";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";

/**
 * Materialize audited questions from the EFFECTIVE view (drafts-over-primary)
 * into this school's user_questions, preserving input order, and return the new
 * user_questions ids. quiz_junction.question_id FKs to user_questions, so quiz
 * questions must live there — this is the bridge from the read-only bank to the
 * quiz engine's store. Saved content equals what students see (effective view).
 */
export async function bridgeEffectiveToUserQuestions(
  supabaseService: SupabaseClient<any, "public">,
  opts: { effectiveIds: number[]; schoolId: number; userId: string; region: "en" | "zh" }
): Promise<number[]> {
  const { effectiveIds, schoolId, userId, region } = opts;
  if (!effectiveIds.length) {
    throw new FlexibleError("At least one question is required", 400);
  }

  const { data: rows, error: selErr } = await supabaseService
    .from("exercise_questions_effective")
    .select("id, question_object_en, question_object_zh, subject, outer_category")
    .in("id", effectiveIds)
    .eq("audited", true);

  if (selErr) {
    throw new FlexibleError(`Failed to load selected questions: ${selErr.message}`, 500);
  }
  if (!rows || rows.length !== effectiveIds.length) {
    throw new FlexibleError("Some selected questions are invalid or not audited", 400);
  }

  const byId = new Map(rows.map((r: any) => [r.id, r]));
  const toInsert = effectiveIds.map((id) => {
    const r: any = byId.get(id);
    return {
      school_id: schoolId,
      created_by: userId,
      question: region === "zh" ? r.question_object_zh : r.question_object_en,
      subject: r.subject ?? null,
      category: r.outer_category != null ? String(r.outer_category) : null,
    };
  });

  const { data: inserted, error: insErr } = await supabaseService
    .from("user_questions")
    .insert(toInsert)
    .select("question_id");

  if (insErr || !inserted || inserted.length === 0) {
    throw new FlexibleError(`Failed to import selected questions: ${insErr?.message ?? ""}`, 500);
  }

  return inserted.map((r: any) => r.question_id);
}
