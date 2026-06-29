import {
  getEligibleQuestions,
  getQuestionObjectEn,
} from "./generate-images-utils/db";
import { initLogger, log } from "./generate-images-utils/logger";
import { loadProgress, saveProgress } from "./generate-images-utils/progress";
import {
  buildImagePrompt,
  extractContext,
  hasSvgComponent,
} from "./generate-images-utils/prompt-builder";
import {
  calculateCost,
  generateImage,
  saveImage,
} from "./generate-images-utils/image-generator";
import * as fs from "fs";
import * as path from "path";

async function main() {
  // 1. Argument Parsing
  const args = process.argv.slice(2);
  let year: number | undefined;
  let force = false;

  const yearIndex = args.findIndex((arg) => arg === "--year" || arg === "-y");
  if (yearIndex !== -1 && args[yearIndex + 1]) {
    year = parseInt(args[yearIndex + 1]);
    if (isNaN(year) || year <= 0) {
      console.error("Invalid year argument.");
      process.exit(1);
    }
  }

  if (args.includes("--force")) {
    force = true;
  }

  // Initialize Logger
  initLogger(year);
  log("=== Image Generation Script Started ===");
  log(`Year: ${year || "All"}`);
  log(`Force Mode: ${force}`);

  // 2. Load Progress
  const progress = loadProgress(year);
  log(`Resume context: Last processed ID: ${progress.lastProcessedId}`);
  log(`Already generated: ${progress.generated.length}`);
  log(`Skipped so far: ${progress.skipped.length}`);

  try {
    // 3. Get Eligible Questions
    // (This returns ALL IDs with need_image=false, filtered by year)
    log("Fetching eligible questions from database...");
    const allEligibleIds = await getEligibleQuestions(year);
    log(`Found ${allEligibleIds.length} eligible questions.`);

    // Filter out questions we've already successfully processed (unless force=true)
    // Also respect lastProcessedId to resume efficiently without re-checking everything if simpler
    // But since we have the full list, we can just filter.
    let questionsToProcess = allEligibleIds.filter((id) => {
      if (force) return true;
      return !progress.generated.includes(id);
    });

    // Also filter out explicitly skipped ones if we want to avoid re-evaluating them every time?
    // User didn't specify strict "resume from ID" vs "process list", but "Resume from lastProcessingId" implies order.
    // Let's filter by ID > lastProcessedId for efficiency, OR strictly check the list.
    // Given the requirement "Resume from lastProcessedId", let's use that.
    questionsToProcess = questionsToProcess.filter(
      (id) => id > progress.lastProcessedId
    );

    log(`Questions remaining to process: ${questionsToProcess.length}`);

    let processedCount = 0;
    let successCount = 0;

    // 4. Processing Loop
    for (const questionId of questionsToProcess) {
      processedCount++;
      log(
        `\n--- Processing Question ${questionId} (${processedCount}/${questionsToProcess.length}) ---`
      );

      try {
        // Step A: Check if image already exists locally (Double check)
        // If it exists and matches our expected path, and !force, we should probably skip it/mark as generated.
        // The script asks to "Skip if image already exists", so let's check file system.
        // We need to know the 'year' to check the path. Since 'year' arg is optional,
        // strictly we should probably check all year folders?
        // But the requirement says "Save as {questionId}.png (use the questionId from primary_questions.id)".
        // And "public/images/questions/year-{X}/..."
        // Use the year from the CLI if present, otherwise we might need to fetch the question year from DB.

        // Fetch question object to get context and year (if not provided)
        const { object: questionObject, source } =
          await getQuestionObjectEn(questionId);

        log(`Loaded question object from: ${source} table`);

        // Skip if SVG exists
        if (hasSvgComponent(questionObject)) {
          log(`Skipping: Contains SvgReactComponent`);
          progress.skipped.push({
            questionId,
            reason: "Contains SvgReactComponent",
            timestamp: new Date().toISOString(),
          });
          progress.lastProcessedId = questionId;
          saveProgress(progress, year);
          continue;
        }

        // Check file system existence
        // We know the year from the CLI, or we might need it from the questionObject if we want to place it in the right year folder.
        // The prompt says "Save as {questionId}.png (use the questionId from primary_questions.id)" and structure "year-{X}".
        // If CLI year is missing, we define behavior. Logic: Use CLI year if present, otherwise assume 'all-years' or check DB year?
        // Requirement 7 says "year-{X}". If we run without --year, we might need to deduce folder from DB year.
        // Since getQuestionObjectEn doesn't currently return DB metadata (only object), let's assume valid year passed OR default folder.
        // Let's assume for now if year is missing we put in 'all-years' as per logger default, OR we should rely on user passing --year.
        // Let's use the CLI year for the folder if present. If not, fallback to 'all-years'.
        // (User requirement 7 implies year structure is important).
        const targetYear = year || "all-years"; // Simplification. In production we might fetch metadata.

        const yearFolder =
          typeof targetYear === "number" ? `year-${targetYear}` : targetYear;
        const potentialPath = path.join(
          process.cwd(),
          "public",
          "images",
          "questions",
          yearFolder,
          `${questionId}.png`
        );

        if (fs.existsSync(potentialPath) && !force) {
          log(`Skipping: Image already exists at ${potentialPath}`);
          if (!progress.generated.includes(questionId)) {
            progress.generated.push(questionId);
          }
          progress.lastProcessedId = questionId;
          saveProgress(progress, year);
          continue;
        }

        // Step B: Build Prompt
        const context = extractContext(questionObject);
        const prompt = buildImagePrompt(context);
        log(`Generated Prompt: "${prompt.substring(0, 100)}..."`);

        // Step C: Call API
        log("Calling OpenAI API...");
        const result = await generateImage(prompt);

        if (!result.success || (!result.url && !result.b64_json)) {
          throw new Error(result.error || "Failed to generate image");
        }

        log("Image generated successfully.");

        // Step D: Save Image
        log(`Saving image...`);
        // Note: saveImage expects 'year' or 'all'.
        const savedPath = await saveImage(
          result,
          questionId,
          typeof targetYear === "number" ? targetYear : "all"
        );
        log(`Saved to: ${savedPath}`);

        // Step E: Update Progress & Cost
        progress.generated.push(questionId);
        progress.totalCost.images++;
        progress.totalCost.estimatedUSD = calculateCost(
          progress.totalCost.images
        );

        successCount++;
        log(`Cost so far: $${progress.totalCost.estimatedUSD.toFixed(3)}`);
      } catch (error: any) {
        log(`ERROR processing question ${questionId}: ${error.message}`);
        progress.failed.push({
          questionId,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }

      // Always update lastProcessedId and save
      progress.lastProcessedId = questionId;

      // Save periodically (every 5) to reduce IO, or every 1 for safety? Requirement says "every 10".
      if (processedCount % 10 === 0) {
        saveProgress(progress, year);
      }
    }

    // Final Save
    saveProgress(progress, year);

    // 5. Final Summary
    log("\n=== Final Summary ===");
    log(`Total processed: ${processedCount}`);
    log(`Successfully generated: ${successCount}`);
    log(`Skipped (SVG/Other): ${progress.skipped.length}`);
    log(`Failed: ${progress.failed.length}`);
    log(`Total Images Cost: $${progress.totalCost.estimatedUSD.toFixed(3)}`);
  } catch (error: any) {
    log(`Fatal Error: ${error.message}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unhandled fatal error:", err);
  process.exit(1);
});
