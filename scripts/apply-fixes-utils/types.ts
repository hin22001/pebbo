import { z } from "zod";

// ============================================================================
// INTERFACES
// ============================================================================

export interface Issue {
  questionId: number;
  issueType: "Wrong Answer" | "Question Sense" | "Content Issue" | "Other";
  description: string;
  suggestedFix?: string;
  confidence?: number;
}

export interface AuditProgressState {
  issues: Issue[];
}

export interface FixProgressState {
  applied: number[];
  failed: Array<{
    questionId: number;
    error: string;
    timestamp: string;
  }>;
  skipped: number[];
  needsReview: Array<{
    questionId: number;
    reason: string;
    changeCount?: number;
    changes?: string[];
    timestamp: string;
  }>;
  lastUpdated: string;
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const ChangeInstructionSchema = z.object({
  changes: z
    .array(
      z.object({
        path: z
          .string()
          .describe(
            "JSON path to the field to change (e.g., 'content[0].content[2].content[1].attrs.answer')"
          ),
        oldValue: z.any().describe("Current value at this path"),
        newValue: z.any().describe("New value to set at this path"),
        reason: z.string().describe("Why this change is needed"),
      })
    )
    .describe(
      "List of specific changes to make - ONLY the fields mentioned in the fix"
    ),
  changesMade: z
    .array(z.string())
    .describe("Human-readable description of changes made"),
});

export const FixedQuestionSchema = z.object({
  fixedQuestionObject: z
    .any()
    .describe("The complete fixed question_object_en JSON"),
  changesMade: z
    .array(z.string())
    .describe("List of specific changes made to fix the issue"),
});

export const VerificationSchema = z.object({
  isFixCorrect: z
    .boolean()
    .describe("Whether the fix correctly addresses the issue"),
  verificationNotes: z
    .string()
    .optional()
    .describe(
      "Notes about the verification (if fix is incorrect, explain why)"
    ),
  critiques: z
    .array(z.string())
    .optional()
    .describe("Specific negative feedback if the fix is incorrect"),
  suggestions: z
    .array(z.string())
    .optional()
    .describe("Actionable suggestions for how to get the fix right"),
});

export const SuggestedFixSchema = z.object({
  suggestedFix: z
    .string()
    .describe(
      "A clear, actionable fix description explaining what needs to be changed"
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "Confidence level (0.0 to 1.0) that this fix will resolve the issue"
    ),
});

export const FalsePositiveDetectionSchema = z.object({
  isFalsePositive: z
    .boolean()
    .describe(
      "Whether this issue is a false positive (the audit incorrectly identified a problem)"
    ),
  reason: z
    .string()
    .optional()
    .describe(
      "Explanation of why this is or isn't a false positive. If false positive, explain what the audit misunderstood."
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence level (0.0 to 1.0) in this determination"),
});
