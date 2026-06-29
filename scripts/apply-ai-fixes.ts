import { provider, year } from "./apply-fixes-utils/config";
import {
  log,
  PROGRESS_FILE,
  LOG_FILE,
  AUDIT_PROGRESS_FILE,
} from "./apply-fixes-utils/logger";
import {
  loadAuditProgress,
  loadFixProgress,
  saveFixProgress,
} from "./apply-fixes-utils/progress";
import {
  getQuestionObjectEn,
  updateOrCreateDraft,
} from "./apply-fixes-utils/db";
import {
  checkFalsePositive,
  detectExcessiveChanges,
} from "./apply-fixes-utils/utils";
import {
  generateSuggestedFix,
  generateFix,
  verifyFix,
} from "./apply-fixes-utils/ai-core";
import { Issue, FixProgressState } from "./apply-fixes-utils/types";

// ============================================================================
// MAIN FIX LOGIC
// ============================================================================

/**
 * Apply fix for a single issue
 */
async function applyFix(
  issue: Issue,
  progress: FixProgressState
): Promise<{ success: boolean; error?: string }> {
  try {
    const { questionId, description, suggestedFix, issueType } = issue;

    // Load current question object
    const currentQuestionObject = await getQuestionObjectEn(questionId);
    if (!currentQuestionObject) {
      log(`Question ${questionId}: Question object not found`);
      progress.failed.push({
        questionId,
        error: "Question object not found in database",
        timestamp: new Date().toISOString(),
      });
      saveFixProgress(progress);
      return { success: false, error: "Question object not found" };
    }

    // Check for false positives first
    const falsePositiveCheck = await checkFalsePositive(
      questionId,
      currentQuestionObject,
      description,
      suggestedFix || ""
    );

    if (falsePositiveCheck.isFalsePositive) {
      log(
        `Question ${questionId}: Skipping - Identified as FALSE POSITIVE: ${falsePositiveCheck.reason}`
      );
      progress.skipped.push(questionId);
      saveFixProgress(progress);
      return {
        success: false,
        error: `False positive: ${falsePositiveCheck.reason}`,
      };
    }

    log(`Question ${questionId}: Not a false positive, proceeding with fix...`);

    // Check if suggestedFix requires adding components (structural changes not supported)
    if (
      suggestedFix &&
      suggestedFix.toLowerCase().includes("add") &&
      (suggestedFix.toLowerCase().includes("input field") ||
        suggestedFix.toLowerCase().includes("textfield") ||
        suggestedFix.toLowerCase().includes("component") ||
        suggestedFix.toLowerCase().includes("dropdown"))
    ) {
      log(
        `Question ${questionId}: ⚠ Fix requires adding new components - this requires structural changes`
      );
      log(
        `Question ${questionId}: Marking for manual review as structural additions are not yet supported`
      );
      progress.needsReview.push({
        questionId,
        reason: `Fix requires adding new components (e.g., input fields). Structural additions are not yet supported by the automated fix script. Suggested fix: ${suggestedFix.substring(
          0,
          200
        )}...`,
        timestamp: new Date().toISOString(),
      });
      saveFixProgress(progress);
      return {
        success: false,
        error: "Requires structural changes - needs manual review",
      };
    }

    // Generate suggested fix if missing
    let fixToUse = suggestedFix;
    if (!fixToUse) {
      log(
        `Question ${questionId}: No suggested fix provided. Generating one from description...`
      );
      try {
        fixToUse = await generateSuggestedFix(
          questionId,
          currentQuestionObject,
          description
        );
      } catch (error: any) {
        log(
          `Question ${questionId}: Failed to generate suggested fix: ${error.message}`
        );
        progress.failed.push({
          questionId,
          error: `Failed to generate suggested fix: ${error.message}`,
          timestamp: new Date().toISOString(),
        });
        saveFixProgress(progress);
        return { success: false, error: "No suggested fix available" };
      }
    }

    // AI Fix generation & verification loop (Evaluator-Optimizer pattern)
    const maxFixAttempts = 3;
    let fixedQuestionObject: any = null;
    let feedback: { critiques: string[]; suggestions: string[] } | undefined =
      undefined;
    const allFeedback: {
      critiques: string[];
      suggestions: string[];
      verificationNotes: string[];
    } = {
      critiques: [],
      suggestions: [],
      verificationNotes: [],
    };

    for (let attempt = 1; attempt <= maxFixAttempts; attempt++) {
      log(
        `Question ${questionId}: Fix attempt ${attempt}/${maxFixAttempts}...`
      );

      // Generate fix (Optimizer)
      fixedQuestionObject = await generateFix(
        questionId,
        currentQuestionObject,
        description,
        fixToUse!,
        feedback
      );

      // Validate fixed question object structure
      if (!fixedQuestionObject || typeof fixedQuestionObject !== "object") {
        log(
          `Question ${questionId}: Invalid fixed question_object_en structure, marking for review`
        );
        progress.needsReview.push({
          questionId,
          reason: "AI generated invalid question_object_en structure",
          timestamp: new Date().toISOString(),
        });
        saveFixProgress(progress);
        return {
          success: false,
          error: "Invalid fixed question_object_en structure",
        };
      }

      // Check for excessive changes (safety check)
      const changeAnalysis = detectExcessiveChanges(
        currentQuestionObject,
        fixedQuestionObject,
        15 // Allow up to 15 changes (increased to account for structural reorganizations)
      );

      if (!changeAnalysis.isMinimal) {
        log(
          `Question ${questionId}: ⚠ Too many changes detected (${changeAnalysis.changeCount} changes) - marking for review`
        );
        progress.needsReview.push({
          questionId,
          reason: `Too many changes detected (${changeAnalysis.changeCount} changes). Expected minimal changes only.`,
          changeCount: changeAnalysis.changeCount,
          changes: changeAnalysis.changes,
          timestamp: new Date().toISOString(),
        });
        saveFixProgress(progress);
        return {
          success: false,
          error: `Too many changes detected (${changeAnalysis.changeCount}) - needs review`,
        };
      }

      log(
        `Question ${questionId}: Change analysis: ${changeAnalysis.changeCount} changes detected (within limit)`
      );

      // Verify fix (Evaluator)
      log(`Question ${questionId}: Verifying fix (attempt ${attempt})...`);
      const verificationResult = await verifyFix(
        questionId,
        currentQuestionObject,
        fixedQuestionObject,
        description,
        fixToUse!
      );

      if (verificationResult.isFixCorrect) {
        log(`Question ${questionId}: ✓ Fix verification successful`);
        break; // Exit loop, fix is correct
      }

      // Fix is incorrect, accumulate feedback and prepare for next attempt
      if (attempt < maxFixAttempts) {
        log(
          `Question ${questionId}: ⚠ Fix attempt ${attempt} failed verification. Retrying with feedback...`
        );

        // Accumulate feedback across attempts for richer context
        if (verificationResult.verificationNotes) {
          allFeedback.verificationNotes.push(
            `Attempt ${attempt}: ${verificationResult.verificationNotes}`
          );
        }
        if (
          verificationResult.critiques &&
          verificationResult.critiques.length > 0
        ) {
          allFeedback.critiques.push(...verificationResult.critiques);
        }
        if (
          verificationResult.suggestions &&
          verificationResult.suggestions.length > 0
        ) {
          allFeedback.suggestions.push(...verificationResult.suggestions);
        }

        // Prepare feedback for next attempt (use accumulated + current)
        feedback = {
          critiques:
            allFeedback.critiques.length > 0
              ? allFeedback.critiques
              : verificationResult.critiques || [
                  "Fix did not correctly address the issue.",
                ],
          suggestions:
            allFeedback.suggestions.length > 0
              ? allFeedback.suggestions
              : verificationResult.suggestions || [
                  "Re-examine the issue description and simplified structure.",
                ],
        };

        // Log accumulated feedback summary
        if (
          allFeedback.critiques.length > 0 ||
          allFeedback.suggestions.length > 0
        ) {
          log(
            `Question ${questionId}: Accumulated feedback - ${allFeedback.critiques.length} critiques, ${allFeedback.suggestions.length} suggestions`
          );
        }
      } else {
        log(
          `Question ${questionId}: ⚠ Fix verification failed after ${maxFixAttempts} attempts - marking for review`
        );

        // Build comprehensive reason from all accumulated feedback
        const reasons: string[] = [];
        if (allFeedback.verificationNotes.length > 0) {
          reasons.push(...allFeedback.verificationNotes);
        }
        if (allFeedback.critiques.length > 0) {
          reasons.push(`Critiques: ${allFeedback.critiques.join("; ")}`);
        }
        if (
          verificationResult.critiques &&
          verificationResult.critiques.length > 0
        ) {
          reasons.push(
            `Final critiques: ${verificationResult.critiques.join("; ")}`
          );
        }

        progress.needsReview.push({
          questionId,
          reason: `Fix verification failed after ${maxFixAttempts} attempts. ${reasons.join(" | ")}`,
          timestamp: new Date().toISOString(),
        });
        saveFixProgress(progress);
        return {
          success: false,
          error: "Fix verification failed - needs review",
        };
      }
    }

    // Apply fix to draft table
    log(`Question ${questionId}: Applying fix to draft table...`);
    await updateOrCreateDraft(questionId, fixedQuestionObject);

    log(`Question ${questionId}: ✓ Fix applied successfully`);
    progress.applied.push(questionId);
    saveFixProgress(progress);

    return { success: true };
  } catch (error: any) {
    const errorMessage = error.message || "Unknown error";

    // Handle "no changes" case - likely means fix is already applied or false positive
    if (
      errorMessage.includes("No changes identified") ||
      errorMessage.includes("No actual changes were made") ||
      errorMessage.includes("already matches the desired fix")
    ) {
      log(
        `Question ${issue.questionId}: ⚠ No changes needed - fix may already be applied or issue is false positive`
      );
      log(`Question ${issue.questionId}: Marking for review to verify`);
      progress.needsReview.push({
        questionId: issue.questionId,
        reason: `No changes identified: ${errorMessage}. Current state may already match the fix, or the audit may be incorrect.`,
        timestamp: new Date().toISOString(),
      });
      saveFixProgress(progress);
      return { success: false, error: `No changes needed: ${errorMessage}` };
    }

    log(`Question ${issue.questionId}: ERROR - ${errorMessage}`);
    progress.failed.push({
      questionId: issue.questionId,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
    saveFixProgress(progress);
    return { success: false, error: errorMessage };
  }
}

async function main() {
  log("=== Apply AI Fixes Started ===");
  log(`Provider: ${provider}`);
  log(`Year: ${year || "all"}`);
  log(`Progress file: ${PROGRESS_FILE}`);
  log(`Log file: ${LOG_FILE}`);
  log(`Audit progress file: ${AUDIT_PROGRESS_FILE}`);

  // Load audit progress to get issues
  const auditProgress = loadAuditProgress();
  if (
    !auditProgress ||
    !auditProgress.issues ||
    auditProgress.issues.length === 0
  ) {
    log("ERROR: No issues found in audit progress file");
    process.exit(1);
  }

  log(`Found ${auditProgress.issues.length} issues to process`);

  // Load fix progress
  const fixProgress = loadFixProgress();
  log(`Already applied: ${fixProgress.applied.length}`);
  log(`Failed: ${fixProgress.failed.length}`);
  log(`Skipped: ${fixProgress.skipped.length}`);
  log(`Needs review: ${fixProgress.needsReview.length}`);

  // Filter out already processed issues
  const issuesToProcess = auditProgress.issues.filter(
    (issue) =>
      !fixProgress.applied.includes(issue.questionId) &&
      !fixProgress.failed.some((f) => f.questionId === issue.questionId) &&
      !fixProgress.skipped.includes(issue.questionId) &&
      !fixProgress.needsReview.some((r) => r.questionId === issue.questionId)
  );

  log(`Issues to process: ${issuesToProcess.length}`);

  if (issuesToProcess.length === 0) {
    log("No issues to process. All done!");
    return;
  }

  // Process each issue (one at a time for safety and granular progress tracking)
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;
  let reviewCount = 0;

  for (let i = 0; i < issuesToProcess.length; i++) {
    const issue = issuesToProcess[i];
    log(`\n--- Processing issue ${i + 1}/${issuesToProcess.length} ---`);
    log(`Question ID: ${issue.questionId}`);
    log(`Issue Type: ${issue.issueType}`);
    log(`Confidence: ${issue.confidence || "N/A"}`);

    const result = await applyFix(issue, fixProgress);

    if (result.success) {
      successCount++;
    } else if (result.error === "No suggested fix") {
      skipCount++;
    } else if (result.error?.includes("needs review")) {
      reviewCount++;
    } else {
      failCount++;
    }

    // Save progress after each question (atomic write for resume capability)
    saveFixProgress(fixProgress);

    // Small delay between questions to avoid rate limits
    if (i < issuesToProcess.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Final summary
  log("\n=== Final Summary ===");
  log(`Total issues: ${auditProgress.issues.length}`);
  log(`Successfully applied: ${successCount}`);
  log(`Failed: ${failCount}`);
  log(`Skipped: ${skipCount}`);
  log(`Needs review: ${reviewCount}`);
  log(`Already applied (from previous runs): ${fixProgress.applied.length}`);
  log(
    `Total applied (including previous): ${
      fixProgress.applied.length + successCount
    }`
  );
  log(`Total needs review: ${fixProgress.needsReview.length}`);

  // Log questions that need review
  if (fixProgress.needsReview.length > 0) {
    log("\n=== Questions Requiring Manual Review ===");
    for (const review of fixProgress.needsReview) {
      log(`Question ${review.questionId}: ${review.reason}`);
      if (review.changeCount) {
        log(`  - Change count: ${review.changeCount}`);
      }
      if (review.changes && review.changes.length > 0) {
        log(
          `  - Changes: ${review.changes.slice(0, 5).join(", ")}${
            review.changes.length > 5 ? "..." : ""
          }`
        );
      }
    }
  }
}

main().catch((error) => {
  log(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
