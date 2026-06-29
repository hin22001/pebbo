import {
  getEligibleQuestions,
  getQuestionObjectEn,
} from "./generate-needed-images-utils/db";
import { initLogger, log } from "./generate-needed-images-utils/logger";
import {
  loadProgress,
  saveProgress,
  saveDescription,
  loadDescriptions,
} from "./generate-needed-images-utils/progress";
import {
  extractContext,
  generatePromptAndDescription,
} from "./generate-needed-images-utils/prompt-generator";
import {
  generateImage,
  saveNeededImage,
  calculateImageCost,
} from "./generate-needed-images-utils/image-generator";
import * as fs from "fs";
import * as path from "path";

async function main() {
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

  initLogger(year);
  log("=== Needed-Image Generation Script Started ===");
  log(`Year: ${year || "All"}`);
  log(`Force Mode: ${force}`);
  log(`Mode: Questions with need_image = true`);

  const progress = loadProgress(year);
  // Also load existing descriptions to check if we already have one
  const existingDescriptions = loadDescriptions(year);

  log(`Resume context: Last processed ID: ${progress.lastProcessedId}`);
  log(`Already generated: ${progress.generated.length}`);

  try {
    log("Fetching eligible questions...");
    const allEligibleIds = await getEligibleQuestions(year);
    log(`Found ${allEligibleIds.length} questions matching criteria.`);

    let questionsToProcess = allEligibleIds.filter((id) => {
      if (force) return true;
      // Check both progress AND file existence?
      // Let's stick to progress + file existence logic
      return !progress.generated.includes(id);
    });

    questionsToProcess = questionsToProcess.filter(
      (id) => id > progress.lastProcessedId
    );

    log(`Questions remaining to process: ${questionsToProcess.length}`);

    let processedCount = 0;
    let successCount = 0;

    for (const questionId of questionsToProcess) {
      processedCount++;
      log(
        `\n--- Processing Question ${questionId} (${processedCount}/${questionsToProcess.length}) ---`
      );

      try {
        // Step A: Check existence
        const targetYear = year || "all-years";
        const yearFolder =
          typeof targetYear === "number" ? `year-${targetYear}` : targetYear;
        const potentialPath = path.join(
          process.cwd(),
          "public",
          "images",
          "needImages", // Correct folder
          yearFolder,
          `${questionId}.png`
        );

        if (fs.existsSync(potentialPath) && !force) {
          log(`Skipping: Image already exists at ${potentialPath}`);
          if (!progress.generated.includes(questionId)) {
            progress.generated.push(questionId);
          }
          // Ensure description exists?
          if (!existingDescriptions[questionId]) {
            log(
              "Warning: Image exists but description missing. Consider --force to regenerate both."
            );
          }

          progress.lastProcessedId = questionId;
          saveProgress(progress, year);
          continue;
        }

        // Step B: Get Data
        const { object: questionObject, source } =
          await getQuestionObjectEn(questionId);
        log(`Loaded question from: ${source}`);

        // Step C: Generate Prompt & Description (GPT-4o)
        log("Generating prompt and description (Step 1)...");
        const context = extractContext(questionObject);
        // Cost: Input tokens + Output tokens (approx)
        // We aren't tracking exact tokens here unless we get them from response headers.
        // Assuming average cost.

        const promptData = await generatePromptAndDescription(context);
        log(`Description: "${promptData.shortDescription}"`);
        log(`Image Prompt: "${promptData.imagePrompt.substring(0, 80)}..."`);

        // Step D: Generate Image (GPT-Image)
        log("Generating image (Step 2)...");
        const result = await generateImage(promptData);

        if (!result.success || (!result.url && !result.b64_json)) {
          throw new Error(result.error || "Failed to generate image");
        }

        // Step E: Save Image
        log("Saving image...");
        const savedPath = await saveNeededImage(
          result,
          questionId,
          typeof targetYear === "number" ? targetYear : "all"
        );
        log(`Saved to: ${savedPath}`);

        // Step F: Save Description
        saveDescription(
          questionId,
          promptData.shortDescription,
          promptData.imagePrompt,
          year
        );
        log("Saved description.");

        // Update Stats
        progress.generated.push(questionId);
        progress.totalCost.images++;
        progress.totalCost.estimatedUSD = calculateImageCost(
          progress.totalCost.images
        );
        // Note: We are not adding LLM cost to estimatedUSD yet, only image cost.
        // LLM cost is negligible compared to image ($0.04 vs $0.001) but technically exists.

        successCount++;
        log(
          `Image Cost so far: $${progress.totalCost.estimatedUSD.toFixed(3)}`
        );
      } catch (error: any) {
        log(`ERROR: ${error.message}`);
        progress.failed.push({
          questionId,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }

      progress.lastProcessedId = questionId;

      if (processedCount % 5 === 0) {
        saveProgress(progress, year);
      }
    }

    saveProgress(progress, year);

    log("\n=== Final Summary ===");
    log(`Total processed: ${processedCount}`);
    log(`Successfully generated: ${successCount}`);
    log(`Failed: ${progress.failed.length}`);
    log(`Total Image Cost: $${progress.totalCost.estimatedUSD.toFixed(3)}`);
  } catch (error: any) {
    log(`Fatal Error: ${error.message}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unhandled fatal error:", err);
  process.exit(1);
});
