import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseServiceKey } from "./config";
import { log } from "./logger";

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Get eligible questions where need_image = true
 * Uses pagination to ensure we get all records.
 */
export async function getEligibleQuestions(year?: number): Promise<number[]> {
  const PAGE_SIZE = 1000;
  let allIds: number[] = [];
  let from = 0;
  let hasMore = true;

  log(`Fetching questions needing images (batch size: ${PAGE_SIZE})...`);

  while (hasMore) {
    let query = supabase
      .from("primary_questions")
      .select("id")
      .eq("need_image", true); // CRITICAL DIFFERENCE: need_image = true

    if (year) {
      query = query.eq("year", year);
    }

    query = query
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch eligible questions: ${error.message}`);
    }

    if (data && data.length > 0) {
      const ids = data.map((q) => q.id);
      allIds = [...allIds, ...ids];
      log(`Fetched ${ids.length} questions (total so far: ${allIds.length})`);

      if (data.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        from += PAGE_SIZE;
      }
    } else {
      hasMore = false;
    }
  }

  return allIds;
}

/**
 * Get question object (Draft -> Primary fallback)
 */
export async function getQuestionObjectEn(
  questionId: number
): Promise<{ object: any; source: "draft" | "primary" }> {
  const { data: draftData, error: draftError } = await supabase
    .from("primary_questions_drafts")
    .select("question_object_en")
    .eq("original_question_id", questionId)
    .limit(1)
    .single();

  if (draftData && !draftError) {
    return { object: draftData.question_object_en, source: "draft" };
  }

  if (draftError && draftError.code !== "PGRST116") {
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
  return { object: primaryData.question_object_en, source: "primary" };
}
