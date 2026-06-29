import { createClient } from "@supabase/supabase-js";
import {
  extractExplanation,
  extractQuestionText,
  extractAnswer,
  extractOptions,
} from "./apply-fixes-utils/utils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
  console.error("Please ensure these are set in your environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Check for Chinese characters in text
 */
function hasChineseText(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false;
  }
  const chineseRegex = /[\u4e00-\u9fff]/;
  return chineseRegex.test(text);
}

/**
 * Extract sample Chinese text for reporting
 */
function extractChineseSample(text: string, maxLength: number = 50): string {
  const matches = text.match(/[\u4e00-\u9fff]+/g);
  if (matches && matches.length > 0) {
    return matches.join("").substring(0, maxLength);
  }
  return "";
}

interface QuestionWithChinese {
  id: number;
  location: "question" | "answer" | "options" | "explanation" | "other";
  text: string;
  chineseSample: string;
}

/**
 * Get the best version of question_object_en:
 * - If draft exists (has fixes), use draft's version
 * - Otherwise, use primary's version
 */
async function getQuestionObjectEn(questionId: number): Promise<any> {
  // First, check if draft exists
  const { data: draftData, error: draftError } = await supabase
    .from("primary_questions_drafts")
    .select("question_object_en")
    .eq("original_question_id", questionId)
    .limit(1)
    .single();

  // If draft exists, use it (it may have fixes already applied)
  if (draftData && !draftError) {
    return draftData.question_object_en;
  }

  // No draft found - fetch from primary
  if (draftError && draftError.code === "PGRST116") {
    // No draft exists, fetch from primary
  } else if (draftError) {
    console.error(
      `Question ${questionId}: Error checking draft: ${draftError.message}, falling back to primary`,
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

async function scanQuestions(year?: number): Promise<QuestionWithChinese[]> {
  const questionsWithChinese: QuestionWithChinese[] = [];
  const pageSize = 1000;
  let offset = 0;
  let hasMore = true;
  let totalScanned = 0;
  let totalCount: number | null = null;

  console.log("Fetching questions with pagination...");

  // First, get the total count
  let countQuery = supabase
    .from("primary_questions")
    .select("*", { count: "exact", head: true })
    .eq("need_image", false);

  if (year) {
    countQuery = countQuery.eq("year", year);
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    console.error("Error getting count:", countError);
  } else {
    totalCount = count;
    console.log(`Total questions to scan (need_image=false): ${totalCount}`);
  }

  while (hasMore) {
    let query = supabase
      .from("primary_questions")
      .select("id")
      .eq("need_image", false)
      .range(offset, offset + pageSize - 1)
      .order("id", { ascending: true });

    if (year) {
      query = query.eq("year", year);
    }

    // Add retry logic for timeouts
    let retries = 3;
    let questions: any[] | null = null;
    let error: any = null;

    while (retries > 0) {
      const result = await query;
      if (result.error) {
        error = result.error;
        if (result.error.code === "57014" && retries > 1) {
          // Statement timeout - wait and retry
          console.log(
            `  Timeout occurred, retrying... (${retries - 1} retries left)`,
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
          retries--;
          continue;
        }
        break;
      }
      questions = result.data;
      break;
    }

    if (error) {
      console.error("Error fetching questions:", error);
      break;
    }

    if (!questions || questions.length === 0) {
      hasMore = false;
      break;
    }

    const batchEnd = offset + questions.length;
    console.log(
      `Processing batch: ${offset + 1} to ${batchEnd}${totalCount ? ` / ${totalCount}` : ""}...`,
    );

    // Batch fetch drafts for all questions in this batch
    const questionIds = questions.map((q) => q.id);
    const { data: draftsData } = await supabase
      .from("primary_questions_drafts")
      .select("original_question_id, question_object_en")
      .in("original_question_id", questionIds);

    const draftsMap = new Map<number, any>();
    if (draftsData) {
      for (const draft of draftsData) {
        draftsMap.set(draft.original_question_id, draft.question_object_en);
      }
    }

    // Batch fetch primary question_object_en for questions without drafts
    const idsWithoutDrafts = questionIds.filter((id) => !draftsMap.has(id));
    const primaryMap = new Map<number, any>();

    if (idsWithoutDrafts.length > 0) {
      const { data: primaryData } = await supabase
        .from("primary_questions")
        .select("id, question_object_en")
        .in("id", idsWithoutDrafts);

      if (primaryData) {
        for (const primary of primaryData) {
          primaryMap.set(primary.id, primary.question_object_en);
        }
      }
    }

    for (const question of questions) {
      try {
        // Get the best version (draft if exists, else primary) - from batch maps
        const questionObjectEn =
          draftsMap.get(question.id) || primaryMap.get(question.id);

        if (!questionObjectEn) {
          console.error(
            `Question ${question.id}: Could not fetch question_object_en`,
          );
          continue;
        }

        // Check all parts of the question
        const questionText = extractQuestionText(questionObjectEn);
        const answer = extractAnswer(questionObjectEn);
        const options = extractOptions(questionObjectEn);
        const explanation = extractExplanation(questionObjectEn);

        // Check question text
        if (questionText && hasChineseText(questionText)) {
          const chineseSample = extractChineseSample(questionText);
          questionsWithChinese.push({
            id: question.id,
            location: "question",
            text: questionText.substring(0, 200),
            chineseSample,
          });
        }

        // Check answer
        if (answer && hasChineseText(answer)) {
          const chineseSample = extractChineseSample(answer);
          questionsWithChinese.push({
            id: question.id,
            location: "answer",
            text: answer.substring(0, 200),
            chineseSample,
          });
        }

        // Check options
        const optionsText = options.map((opt) => opt.label).join(" ");
        if (optionsText && hasChineseText(optionsText)) {
          const chineseSample = extractChineseSample(optionsText);
          questionsWithChinese.push({
            id: question.id,
            location: "options",
            text: optionsText.substring(0, 200),
            chineseSample,
          });
        }

        // Check explanation
        if (explanation && hasChineseText(explanation)) {
          const chineseSample = extractChineseSample(explanation);
          questionsWithChinese.push({
            id: question.id,
            location: "explanation",
            text: explanation.substring(0, 200),
            chineseSample,
          });
        }
      } catch (error: any) {
        console.error(
          `Error processing question ${question.id}:`,
          error.message,
        );
      }
    }

    totalScanned += questions.length;
    offset += pageSize;

    // Small delay between batches to avoid overwhelming the database
    if (hasMore) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Check if we've reached the end
    if (questions.length < pageSize) {
      hasMore = false;
    }

    // If we have a count and we've scanned all, stop
    if (totalCount && totalScanned >= totalCount) {
      hasMore = false;
    }
  }

  console.log(`\nTotal questions scanned: ${totalScanned}`);
  return questionsWithChinese;
}

async function main() {
  const args = process.argv.slice(2);
  const year = args[0] ? parseInt(args[0]) : undefined;

  if (year && isNaN(year)) {
    console.error(
      "Invalid year. Usage: npx tsx scripts/scan-chinese-explanations.ts [year]",
    );
    process.exit(1);
  }

  console.log("=== Scanning for Chinese Text in Question Object (EN) ===");
  if (year) {
    console.log(`Filtering by year: ${year}`);
  }
  console.log("");

  const questionsWithChinese = await scanQuestions(year);

  console.log(`\n=== Results ===`);
  console.log(`Total issues found: ${questionsWithChinese.length}`);

  // Group by location
  const byLocation = questionsWithChinese.reduce(
    (acc, q) => {
      acc[q.location] = (acc[q.location] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log("\nBreakdown by location:");
  Object.entries(byLocation).forEach(([location, count]) => {
    console.log(`  ${location}: ${count}`);
  });

  // Unique question IDs
  const uniqueIds = new Set(questionsWithChinese.map((q) => q.id));
  console.log(`\nUnique questions affected: ${uniqueIds.size}`);

  if (questionsWithChinese.length > 0) {
    console.log("\n=== Affected Questions ===");
    questionsWithChinese.forEach((q) => {
      console.log(`\nQuestion ID: ${q.id}`);
      console.log(`Location: ${q.location}`);
      console.log(`Chinese sample: ${q.chineseSample}`);
      console.log(`Text preview: ${q.text}...`);
    });

    // Save to JSON file
    const fs = require("fs");
    const path = require("path");
    const outputDir = path.join(__dirname, "../logs");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const yearSuffix = year ? `-year-${year}` : "-all-years";
    const outputFile = path.join(outputDir, `chinese-text${yearSuffix}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(questionsWithChinese, null, 2));
    console.log(`\nResults saved to: ${outputFile}`);
  } else {
    console.log("\n✓ No Chinese text found in question_object_en!");
  }
}

main().catch(console.error);
