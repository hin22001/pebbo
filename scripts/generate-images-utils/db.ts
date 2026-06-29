import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseServiceKey } from "./config";
import { log } from "./logger";

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Get eligible questions from primary_questions table
 * Criteria: need_image = false (we only want to generate for those who don't have it yet?
 * Actually user requirement says: "Query primary_questions table where need_image = false")
 */
export async function getEligibleQuestions(year?: number): Promise<number[]> {
  // Supabase limit is 1000 by default. We need to paginate to get all records.
  const PAGE_SIZE = 1000;
  let allIds: number[] = [];
  let from = 0;
  let hasMore = true;

  log(`Fetching eligible questions (batch size: ${PAGE_SIZE})...`);

  while (hasMore) {
    let query = supabase
      .from("primary_questions")
      .select("id")
      .eq("need_image", false);

    if (year) {
      query = query.eq("year", year);
    }

    // Order by ID is crucial for pagination consistency
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
        hasMore = false; // Reached end
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
 * Get question_object_en following strict fallback logic:
 * 1. Check primary_questions_drafts using original_question_id
 * 2. Fallback to primary_questions using id
 */
export async function getQuestionObjectEn(
  questionId: number
): Promise<{ object: any; source: "draft" | "primary" }> {
  // First, check if draft exists
  const { data: draftData, error: draftError } = await supabase
    .from("primary_questions_drafts")
    .select("question_object_en")
    .eq("original_question_id", questionId) // CRITICAL: using original_question_id
    .limit(1)
    .single();

  if (draftData && !draftError) {
    return { object: draftData.question_object_en, source: "draft" };
  }

  // Handle errors other than "not found"
  if (draftError && draftError.code !== "PGRST116") {
    log(
      `Question ${questionId}: Error checking draft: ${draftError.message}, falling back to primary`
    );
  }

  // No draft found (or error) - fetch from primary
  const { data: primaryData, error: primaryError } = await supabase
    .from("primary_questions")
    .select("question_object_en")
    .eq("id", questionId)
    .single();

  if (primaryError) throw primaryError;
  return { object: primaryData.question_object_en, source: "primary" };
}
