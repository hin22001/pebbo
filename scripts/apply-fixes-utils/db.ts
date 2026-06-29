import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseServiceKey } from "./config";
import { log } from "./logger";

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Get question_object_en from draft (if exists) or primary table
 * Same pattern as ai-audit-questions.ts
 */
export async function getQuestionObjectEn(questionId: number): Promise<any> {
  // First, check if draft exists
  const { data: draftData, error: draftError } = await supabase
    .from("primary_questions_drafts")
    .select("question_object_en")
    .eq("original_question_id", questionId)
    .limit(1)
    .single();

  if (draftData && !draftError) {
    log(`Question ${questionId}: Using existing draft`);
    return draftData.question_object_en;
  }

  // No draft found - fetch from primary
  if (draftError && draftError.code === "PGRST116") {
    log(`Question ${questionId}: No draft found, using primary table`);
  } else if (draftError) {
    log(
      `Question ${questionId}: Error checking draft: ${draftError.message}, falling back to primary`
    );
  }

  const { data: primaryData, error: primaryError } = await supabase
    .from("primary_questions")
    .select("question_object_en")
    .eq("id", questionId)
    .single();

  if (primaryError) throw primaryError;
  return primaryData.question_object_en;
}

export async function updateOrCreateDraft(
  questionId: number,
  fixedQuestionObject: any
): Promise<void> {
  try {
    // Check if draft exists
    const { data: existingDraft, error: checkError } = await supabase
      .from("primary_questions_drafts")
      .select("id")
      .eq("original_question_id", questionId)
      .limit(1)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    if (!existingDraft) {
      // Draft doesn't exist - create it
      const { data: primaryQuestion } = await supabase
        .from("primary_questions")
        .select("*")
        .eq("id", questionId)
        .single();

      if (!primaryQuestion) {
        throw new Error(`Primary question ${questionId} not found`);
      }

      const { error: insertError } = await supabase
        .from("primary_questions_drafts")
        .insert({
          original_question_id: questionId,
          question_object_en: fixedQuestionObject,
          question_object_zh: primaryQuestion.question_object_zh,
          outer_category: primaryQuestion.outer_category,
          inner_category: primaryQuestion.inner_category,
          difficulty: primaryQuestion.difficulty,
          type: primaryQuestion.question_type,
          year: String(primaryQuestion.year),
          audited: true, // Mark as audited after fix is applied
          need_image: primaryQuestion.need_image || false,
        });

      if (insertError) {
        throw insertError;
      }
    } else {
      // Draft exists - update it
      const { error: updateError } = await supabase
        .from("primary_questions_drafts")
        .update({
          question_object_en: fixedQuestionObject,
          audited: true, // Mark as audited after fix is applied
        })
        .eq("original_question_id", questionId);

      if (updateError) {
        throw updateError;
      }
    }
  } catch (error: any) {
    log(`Error updating draft for question ${questionId}: ${error.message}`);
    throw error;
  }
}
