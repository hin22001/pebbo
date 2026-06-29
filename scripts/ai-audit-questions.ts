/**
 * AI Question Audit Script
 *
 * This script audits questions in the primary_questions table using AI models (Grok or Gemini).
 * It uses a two-step validation process:
 * 1. Quick check (CORRECT/INCORRECT) - minimal tokens
 * 2. Detailed analysis - only if question is incorrect
 *
 * Features:
 * - Parallel processing: Processes 3 questions simultaneously for ~3x speedup
 * - Resume capability: Tracks last processed question ID (thread-safe)
 * - Progress saving: Saves after each question (atomic writes, mutex-protected)
 * - Error recovery: Retries with exponential backoff
 * - Rate limit handling: Respects API rate limits
 * - Draft updates: Updates primary_questions_drafts table
 * - Multi-provider support: Grok (xAI) or Gemini (Google)
 * - Year filtering: Process questions by specific year
 * - SVG filtering: Automatically skips questions with SvgReactComponent (need_image = false)
 *
 * Usage:
 *   npm run ai-audit:questions -- --provider grok --year 1
 *   npm run ai-audit:questions -- --provider gemini --year 2
 *   npm run ai-audit:questions -- --provider grok (all years)
 *
 * Command-line Arguments:
 *   --provider, -p: AI provider to use ('grok' or 'gemini', default: 'grok')
 *   --year, -y: Filter questions by year (optional, processes all years if not specified)
 *
 * Environment Variables Required:
 *   - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
 *   - SUPABASE_SERVICE_ROLE_KEY: Supabase service role key
 *   - XAI_API_KEY: Required if using Grok provider
 *   - GOOGLE_GENERATIVE_AI_API_KEY: Required if using Gemini provider (or use GEMINI_API_KEY as alias)
 *   - GROK_MODEL (optional): Grok model name (default: 'grok-4-fast-reasoning')
 *   - GEMINI_MODEL (optional): Gemini model name (default: 'gemini-2.5-flash')
 *
 * Output Files:
 *   - ai-audit-progress-{provider}-{year}.json: Progress state (resume point)
 *   - ai-audit-{provider}-{year}.log: Detailed logs
 *
 * The script processes questions in parallel batches (3 workers) with thread-safe progress tracking.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { generateObject, generateText } from "ai";
import { xai } from "@ai-sdk/xai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import pLimit from "p-limit";
import { Mutex } from "async-mutex";

// ============================================================================
// ENVIRONMENT VARIABLES LOADING
// ============================================================================

function loadEnvFiles() {
  const envFiles = [".env.local", ".env"];
  const projectRoot = process.cwd();

  for (const envFile of envFiles) {
    const envPath = path.join(projectRoot, envFile);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const lines = content.split("\n");

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;

        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();

          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }

          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  }
}

loadEnvFiles();

// ============================================================================
// COMMAND-LINE ARGUMENT PARSING
// ============================================================================

function parseArgs(): { provider: "grok" | "gemini"; year?: number } {
  const args = process.argv.slice(2);

  // Parse provider
  let provider: "grok" | "gemini" = "grok";
  const providerIndex = args.findIndex(
    (arg) => arg === "--provider" || arg === "-p"
  );
  if (providerIndex !== -1 && args[providerIndex + 1]) {
    const providerValue = args[providerIndex + 1].toLowerCase();
    if (providerValue === "gemini" || providerValue === "grok") {
      provider = providerValue as "grok" | "gemini";
    } else {
      console.error(
        `Invalid provider: ${providerValue}. Must be 'grok' or 'gemini'`
      );
      process.exit(1);
    }
  }

  // Parse year
  let year: number | undefined;
  const yearIndex = args.findIndex((arg) => arg === "--year" || arg === "-y");
  if (yearIndex !== -1 && args[yearIndex + 1]) {
    const yearValue = parseInt(args[yearIndex + 1]);
    if (!isNaN(yearValue) && yearValue > 0) {
      year = yearValue;
    } else {
      console.error(
        `Invalid year: ${args[yearIndex + 1]}. Must be a positive number`
      );
      process.exit(1);
    }
  }

  return { provider, year };
}

const { provider, year } = parseArgs();

// ============================================================================
// CONFIGURATION
// ============================================================================

const XAI_API_KEY = process.env.XAI_API_KEY;
// @ai-sdk/google expects GOOGLE_GENERATIVE_AI_API_KEY (not GEMINI_API_KEY)
const GEMINI_API_KEY =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
// Grok 4 Fast Reasoning - optimized for cost-efficient reasoning (40% fewer tokens)
const GROK_MODEL = process.env.GROK_MODEL || "grok-4-fast-reasoning";
// Gemini model - default to flash for speed/cost
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables:");
  console.error("  NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("  SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✓" : "✗");
  process.exit(1);
}

// Validate provider-specific API key
if (provider === "grok" && !XAI_API_KEY) {
  console.error("Missing required environment variable:");
  console.error("  XAI_API_KEY:", XAI_API_KEY ? "✓" : "✗");
  console.error("\nPlease set XAI_API_KEY in your .env.local or .env file");
  process.exit(1);
}

if (provider === "gemini" && !GEMINI_API_KEY) {
  console.error("Missing required environment variable:");
  console.error("  GOOGLE_GENERATIVE_AI_API_KEY:", GEMINI_API_KEY ? "✓" : "✗");
  console.error(
    "\nPlease set GOOGLE_GENERATIVE_AI_API_KEY in your .env.local or .env file"
  );
  console.error("(Note: You can also use GEMINI_API_KEY as an alias)");
  process.exit(1);
}

const supabase: SupabaseClient<any> = createClient(
  supabaseUrl,
  supabaseServiceKey
);

// ============================================================================
// MODEL FACTORY
// ============================================================================

function getModel(provider: "grok" | "gemini") {
  if (provider === "grok") {
    return xai(GROK_MODEL);
  } else {
    return google(GEMINI_MODEL);
  }
}

const model = getModel(provider);

// ============================================================================
// TYPES
// ============================================================================

interface QuestionRow {
  id: number;
  question_object_en: any;
}

interface ValidationResult {
  isCorrect: boolean;
  issues?: string[];
  suggestedFix?: any;
  confidence?: number;
  error?: string;
}

interface Issue {
  questionId: number;
  issueType: "Wrong Answer" | "Question Sense" | "Content Issue" | "Other";
  description: string;
  suggestedFix?: string;
  confidence?: number;
}

interface ProgressState {
  lastProcessedQuestionId: number;
  totalProcessed: number;
  totalCorrect: number;
  totalWithIssues: number;
  totalErrors: number;
  lastUpdated: string;
  issues: Issue[];
  errors: Array<{
    questionId: number;
    error: string;
    timestamp: string;
  }>;
}

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

// Dynamic file naming based on provider and year
// Dynamic file naming based on provider and year
function getBaseDir(year?: number): string {
  const folder = year ? `year-${year}` : "all-years";
  const dir = path.join(process.cwd(), "logs", folder);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
      console.error(`Failed to create directory ${dir}:`, e);
    }
  }
  return dir;
}

function getProgressFileName(
  provider: "grok" | "gemini",
  year?: number
): string {
  return path.join(getBaseDir(year), `ai-audit-progress-${provider}.json`);
}

function getLogFileName(provider: "grok" | "gemini", year?: number): string {
  return path.join(getBaseDir(year), `ai-audit-${provider}.log`);
}

const PROGRESS_FILE = getProgressFileName(provider, year);
const LOG_FILE = getLogFileName(provider, year);

function loadProgress(): ProgressState | null {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const content = fs.readFileSync(PROGRESS_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error loading progress file:", error);
  }
  return null;
}

function saveProgress(state: ProgressState): void {
  try {
    // Atomic write: write to temp file first, then rename
    const tempFile = PROGRESS_FILE + ".tmp";
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), "utf-8");
    fs.renameSync(tempFile, PROGRESS_FILE);
  } catch (error) {
    console.error("Error saving progress file:", error);
    // Fallback: direct write
    try {
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(state, null, 2), "utf-8");
    } catch (fallbackError) {
      console.error("Fallback save also failed:", fallbackError);
    }
  }
}

function log(message: string): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  try {
    fs.appendFileSync(LOG_FILE, logMessage, "utf-8");
  } catch (error) {
    // Ignore log file errors, but continue
  }
}

// ============================================================================
// PARALLEL PROCESSING SUPPORT
// ============================================================================

// Mutex for thread-safe progress updates
const progressMutex = new Mutex();

// Track completed question IDs (for resume safety)
const completedIds = new Set<number>();

/**
 * Update lastProcessedQuestionId safely (only move forward, no gaps)
 * This ensures resume mechanism works correctly even with parallel processing
 */
function updateLastProcessedId(
  progress: ProgressState,
  completedId: number
): void {
  // Only update if this ID is higher than current
  if (completedId > progress.lastProcessedQuestionId) {
    // Check if we have consecutive completion from lastProcessedId
    let newLastId = progress.lastProcessedQuestionId;
    for (
      let id = progress.lastProcessedQuestionId + 1;
      id <= completedId;
      id++
    ) {
      if (completedIds.has(id)) {
        newLastId = id;
      } else {
        break; // Stop at first gap
      }
    }
    if (newLastId > progress.lastProcessedQuestionId) {
      const oldId = progress.lastProcessedQuestionId;
      progress.lastProcessedQuestionId = newLastId;
      // Note: Logging removed to avoid spam, but update is happening
    }
  }
}

/**
 * Thread-safe progress update
 * All progress updates must go through this function to prevent race conditions
 */
async function updateProgressSafely(
  progress: ProgressState,
  questionId: number,
  result: { hasIssue: boolean; issue?: Issue; error?: string }
): Promise<void> {
  return progressMutex.runExclusive(async () => {
    // Mark as completed
    completedIds.add(questionId);

    // Update counters
    progress.totalProcessed++;
    progress.lastUpdated = new Date().toISOString();

    if (result.error) {
      progress.totalErrors++;
      progress.errors.push({
        questionId,
        error: result.error,
        timestamp: new Date().toISOString(),
      });
    } else {
      if (result.hasIssue && result.issue) {
        progress.totalWithIssues++;
        progress.issues.push(result.issue); // Safe: mutex protected
      } else {
        progress.totalCorrect++;
      }
    }

    // Update lastProcessedId safely (only move forward, no gaps)
    updateLastProcessedId(progress, questionId);

    // Save progress (atomic write already handles file safety)
    saveProgress(progress);
  });
}

// ============================================================================
// QUESTION EXTRACTION
// ============================================================================

function extractQuestionText(questionObject: any): string {
  try {
    if (!questionObject || !questionObject.content) return "";

    const extractText = (content: any[]): string => {
      let text = "";
      for (const item of content) {
        if (item.type === "text" && item.text) {
          text += item.text;
        } else if (item.type === "KatexReactComponent") {
          // Extract mathematical operators/symbols from KatexReactComponent
          // originalString contains the actual operator (+, -, ×, ÷, =, etc.) or LaTeX expressions
          if (item.attrs?.originalString) {
            let content = item.attrs.originalString;

            // Handle mixed numbers FIRST: 3\frac{1}{12} -> (3 + 1/12) (with brackets for clarity)
            // This prevents AI from misreading "3 1/12" as "31/12" and clarifies order of operations
            // Must come BEFORE simple fraction replacement to avoid conflicts
            content = content.replace(
              /(\d+)\\frac\{([^}]+)\}\{([^}]+)\}/g,
              "($1 + $2/$3)"
            );
            // Handle LaTeX fractions: \frac{a}{b} -> a/b (after mixed numbers are handled)
            content = content.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2");

            // Unescape LaTeX commands: \\div -> ÷, \\times -> ×
            content = content.replace(/\\\\div/g, "÷");
            content = content.replace(/\\\\times/g, "×");

            text += content;
          }
        } else if (item.type === "heading" || item.type === "paragraph") {
          // Block elements - ensure they start on a new line if needed and end with one
          if (item.content) {
            const innerText = extractText(item.content).trim();
            if (innerText) {
              text += "\n" + innerText + "\n";
            }
          }
        } else if (item.type === "SegmentReactComponent" && item.content) {
          text += extractText(item.content);
        } else if (item.content && Array.isArray(item.content)) {
          text += extractText(item.content);
        }
      }
      return text;
    };

    return extractText(questionObject.content)
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  } catch (error) {
    return "";
  }
}

function extractOptions(
  questionObject: any
): Array<{ id: string; label: string }> {
  try {
    const options: Array<{ id: string; label: string }> = [];

    const findDropdowns = (content: any[]): void => {
      for (const item of content) {
        if (item.type === "DropdownReactComponent" && item.attrs?.options) {
          try {
            const opts = JSON.parse(item.attrs.options);
            if (Array.isArray(opts)) {
              options.push(...opts);
            }
          } catch (e) {
            // Ignore parse errors
          }
        } else if (item.content && Array.isArray(item.content)) {
          findDropdowns(item.content);
        }
      }
    };

    if (questionObject?.content) {
      findDropdowns(questionObject.content);
    }

    return options;
  } catch (error) {
    return [];
  }
}

function extractAnswer(questionObject: any): string {
  try {
    const answers: string[] = [];

    const findAnswers = (content: any[]): void => {
      for (const item of content) {
        if (item.type === "DropdownReactComponent" && item.attrs?.answers) {
          try {
            const ans = JSON.parse(item.attrs.answers);
            if (Array.isArray(ans) && ans.length > 0) {
              // Find the checked answer(s), or fall back to first if none checked
              const checkedAnswers = ans.filter((a: any) => a.checked === true);
              if (checkedAnswers.length > 0) {
                // Use all checked answers
                checkedAnswers.forEach((a: any) => {
                  const val = a.label || a.id || "";
                  if (val) answers.push(val);
                });
              } else {
                // Fall back to first answer if no checked flag (legacy format)
                const val = ans[0].label || ans[0].id || "";
                if (val) answers.push(val);
              }
            }
          } catch (e) {
            // Ignore parse errors
          }
        } else if (
          item.type === "TextFieldReactComponent" &&
          item.attrs?.answer
        ) {
          try {
            const ans = JSON.parse(item.attrs.answer);
            const val = ans || item.attrs.answer;
            if (val) answers.push(val);
          } catch (e) {
            const val = item.attrs.answer;
            if (val) answers.push(val);
          }
        } else if (
          item.type === "FractionReactComponent" &&
          item.attrs?.answer
        ) {
          try {
            // FractionReactComponent answers can be in format:
            // "2\\frac{1}{10}" or "D\\frac{null}{null}" (mixed with dropdown choice)
            let answer = item.attrs.answer;

            // Remove escape sequences and convert to readable format
            // "2\\frac{1}{10}" -> "2 1/10"
            answer = answer.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2");
            // Handle mixed numbers: "2\\frac{1}{10}" -> "2 1/10"
            answer = answer.replace(
              /(\d+)\\frac\{([^}]+)\}\{([^}]+)\}/g,
              "$1 $2/$3"
            );
            // Handle "null\\frac{a}{b}" -> just "a/b"
            answer = answer.replace(
              /null\\frac\{([^}]+)\}\{([^}]+)\}/g,
              "$1/$2"
            );
            // Handle "D\\frac{null}{null}" -> just "D"
            answer = answer.replace(/([A-Z])\\frac\{null\}\{null\}/g, "$1");

            if (answer && answer !== "null") {
              answers.push(answer);
            }
          } catch (e) {
            // Ignore parse errors
          }
        } else if (item.content && Array.isArray(item.content)) {
          findAnswers(item.content);
        }
      }
    };

    if (questionObject?.content) {
      findAnswers(questionObject.content);
    }

    return answers.join(", ");
  } catch (error) {
    return "";
  }
}

function extractExplanation(questionObject: any): string {
  try {
    const explanations: string[] = [];

    const findExplanations = (content: any[]): void => {
      for (const item of content) {
        if (
          item.type === "TextFieldReactComponent" &&
          item.attrs?.explanation
        ) {
          try {
            const exp = JSON.parse(item.attrs.explanation);
            const val = exp || item.attrs.explanation;
            if (val) explanations.push(val);
          } catch (e) {
            const val = item.attrs.explanation;
            if (val) explanations.push(val);
          }
        } else if (
          item.type === "DropdownReactComponent" &&
          item.attrs?.explanation
        ) {
          try {
            const exp = JSON.parse(item.attrs.explanation);
            const val = exp || item.attrs.explanation;
            if (val) explanations.push(val);
          } catch (e) {
            const val = item.attrs.explanation;
            if (val) explanations.push(val);
          }
        } else if (
          item.type === "FractionReactComponent" &&
          item.attrs?.explanation
        ) {
          try {
            // FractionReactComponent explanations are nested JSON documents
            // Parse the explanation JSON and extract text from it
            const expDoc = JSON.parse(item.attrs.explanation);
            if (expDoc && expDoc.content) {
              // Extract text from the nested document structure
              const extractTextFromDoc = (docContent: any[]): string => {
                let text = "";
                for (const elem of docContent) {
                  if (elem.type === "text" && elem.text) {
                    text += elem.text + " ";
                  } else if (
                    elem.type === "KatexReactComponent" &&
                    elem.attrs?.originalString
                  ) {
                    // Convert LaTeX to readable format
                    let latex = elem.attrs.originalString;
                    latex = latex.replace(
                      /\\frac\{([^}]+)\}\{([^}]+)\}/g,
                      "$1/$2"
                    );
                    latex = latex.replace(
                      /(\d+)\\frac\{([^}]+)\}\{([^}]+)\}/g,
                      "$1 $2/$3"
                    );
                    latex = latex.replace(/\\\\div/g, "÷");
                    latex = latex.replace(/\\\\times/g, "×");
                    text += latex + " ";
                  } else if (elem.content && Array.isArray(elem.content)) {
                    text += extractTextFromDoc(elem.content);
                  }
                }
                return text.trim();
              };

              const explanationText = extractTextFromDoc(expDoc.content);
              if (explanationText) {
                explanations.push(explanationText);
              }
            }
          } catch (e) {
            // If parsing fails, try to use as plain string
            const val = item.attrs.explanation;
            if (val && typeof val === "string") {
              explanations.push(val);
            }
          }
        } else if (item.content && Array.isArray(item.content)) {
          findExplanations(item.content);
        }
      }
    };

    if (questionObject?.content) {
      findExplanations(questionObject.content);
    }

    return explanations.join(" ");
  } catch (error) {
    return "";
  }
}

function simplifyStructure(content: any[]): any[] {
  return content.map((item) => {
    if (item.type === "text") return { type: "text", text: item.text };
    if (item.type === "KatexReactComponent") {
      // Include the mathematical operator/symbol in the structure
      let operator = item.attrs?.originalString || "";
      // Handle mixed numbers FIRST: 3\frac{1}{12} -> (3 + 1/12) (with brackets for clarity)
      // Must come BEFORE simple fraction replacement to avoid conflicts
      operator = operator.replace(
        /(\d+)\\frac\{([^}]+)\}\{([^}]+)\}/g,
        "($1 + $2/$3)"
      );
      // Handle LaTeX fractions: \frac{a}{b} -> a/b (after mixed numbers are handled)
      operator = operator.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2");
      operator = operator.replace(/\\\\div/g, "÷");
      operator = operator.replace(/\\\\times/g, "×");
      return { type: "operator", symbol: operator };
    }
    if (item.type === "paragraph" || item.type === "heading") {
      return {
        type: "block",
        content: item.content ? simplifyStructure(item.content) : [],
      };
    }
    if (item.type === "TextFieldReactComponent") {
      return { type: "input", answer: item.attrs?.answer };
    }
    if (item.type === "DropdownReactComponent") {
      return {
        type: "dropdown",
        options: item.attrs?.options,
        answer: item.attrs?.answers,
      };
    }
    if (item.type === "FractionReactComponent") {
      // Convert fraction answer to readable format
      let answer = item.attrs?.answer || "";
      answer = answer.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2");
      answer = answer.replace(/(\d+)\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 $2/$3");
      answer = answer.replace(/null\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2");
      answer = answer.replace(/([A-Z])\\frac\{null\}\{null\}/g, "$1");
      return { type: "fraction", answer: answer };
    }
    if (item.type === "SegmentReactComponent") {
      return {
        type: "section",
        content: item.content ? simplifyStructure(item.content) : [],
      };
    }
    if (item.content) {
      return { type: item.type, content: simplifyStructure(item.content) };
    }
    return { type: item.type };
  });
}

// ============================================================================
// AI VALIDATION (Two-Step with Structured Outputs)
// ============================================================================

/**
 * Safely extract retry-after delay from error response headers.
 * Handles both Headers object (with .get() method) and plain object formats.
 */
function getRetryAfterDelay(error: any, defaultDelay: number): number {
  try {
    const headers = error?.response?.headers;
    if (!headers) return defaultDelay;

    // Check if it's a Headers object with .get() method
    if (typeof headers.get === "function") {
      const retryAfter = headers.get("retry-after");
      if (retryAfter) {
        const delay = parseInt(retryAfter) * 1000;
        return isNaN(delay) ? defaultDelay : delay;
      }
    }

    // Check if it's a plain object (Node.js http module format)
    if (typeof headers === "object" && headers !== null) {
      const retryAfter = headers["retry-after"] || headers["Retry-After"];
      if (retryAfter) {
        const delay = parseInt(retryAfter) * 1000;
        return isNaN(delay) ? defaultDelay : delay;
      }
    }
  } catch (e) {
    // Ignore errors when accessing headers
  }

  return defaultDelay;
}

// Quick Validation Schema (minimal, just boolean)
const QuickValidationSchema = z.object({
  isCorrect: z.boolean(),
});

// Detailed Validation Schema
const ValidationSchema = z.object({
  isCorrect: z.boolean(),
  issues: z.array(z.string()).optional(),
  suggestedFix: z.string().optional(),
  confidence: z.preprocess((val) => {
    if (val === undefined || val === null) return undefined;
    const num = typeof val === "number" ? val : Number(val);
    if (isNaN(num)) return undefined;
    // Normalize confidence: if > 1, treat as 1-10 scale and divide by 10
    if (num > 1) {
      return num <= 10 ? num / 10 : 1.0;
    }
    // Clamp to 0-1 range
    return Math.max(0, Math.min(1, num));
  }, z.number().min(0).max(1).optional()),
});

/**
 * Heuristic check for repetitive content in question text
 * Returns true if repetitive content is detected
 */
function detectRepetitiveContent(questionText: string): {
  hasRepetition: boolean;
  details?: string;
} {
  if (!questionText || questionText.trim().length === 0) {
    return { hasRepetition: false };
  }

  // Normalize text: remove extra whitespace, convert to lowercase for comparison
  const normalized = questionText.replace(/\s+/g, " ").trim().toLowerCase();

  // Split into sentences (simple heuristic: split by periods, question marks, exclamation marks)
  const sentences = normalized
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10); // Only check sentences longer than 10 chars

  // Check for duplicate sentences
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const sentence of sentences) {
    if (sentence.length > 20) {
      // Only check longer sentences (likely to be meaningful repetition)
      if (seen.has(sentence)) {
        duplicates.push(sentence);
      } else {
        seen.add(sentence);
      }
    }
  }

  // Also check for repeated phrases (3+ words) that appear multiple times
  const words = normalized.split(/\s+/);
  const phraseLength = 5; // Check 5-word phrases
  const phraseCounts = new Map<string, number>();

  for (let i = 0; i <= words.length - phraseLength; i++) {
    const phrase = words.slice(i, i + phraseLength).join(" ");
    if (phrase.length > 30) {
      // Only check longer phrases
      phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1);
    }
  }

  const repeatedPhrases = Array.from(phraseCounts.entries())
    .filter(([_, count]) => count >= 2)
    .map(([phrase, _]) => phrase);

  if (duplicates.length > 0 || repeatedPhrases.length > 0) {
    return {
      hasRepetition: true,
      details:
        duplicates.length > 0
          ? `Duplicate sentences found: ${duplicates.slice(0, 2).join("; ")}`
          : `Repeated phrases found: ${repeatedPhrases.slice(0, 2).join("; ")}`,
    };
  }

  return { hasRepetition: false };
}

/**
 * Heuristic check for Chinese characters in any text
 * Returns true if Chinese characters are detected
 */
function detectChineseText(
  text: string,
  location?: string
): {
  hasChinese: boolean;
  details?: string;
} {
  if (!text || text.trim().length === 0) {
    return { hasChinese: false };
  }

  // Check for Chinese characters (Unicode range: \u4e00-\u9fff)
  const chineseRegex = /[\u4e00-\u9fff]/;
  const matches = text.match(/[\u4e00-\u9fff]+/g);

  if (matches && matches.length > 0) {
    // Extract sample Chinese text (first 50 chars)
    const sampleText = matches.join("").substring(0, 50);
    const locationText = location ? ` in ${location}` : "";
    return {
      hasChinese: true,
      details: `Chinese characters detected${locationText}: ${sampleText}${matches.length > 1 ? ` (${matches.length} occurrences)` : ""}`,
    };
  }

  return { hasChinese: false };
}

async function quickValidation(
  questionText: string,
  options: any[],
  answer: string,
  explanation?: string
): Promise<boolean> {
  const maxRetries = 5;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const explanationText = explanation
        ? `\nExplanation (provided by question author): ${explanation}\n\nCRITICAL: The explanation shows the intended answer logic and calculation. If the question text contains ambiguous phrasing (e.g., "between them"), but the explanation provides a clear calculation that resolves the ambiguity, TRUST THE EXPLANATION. The explanation takes precedence over your interpretation of ambiguous wording.`
        : "";

      const prompt = `You are validating a math question. Determine if the question is correct.

Question: ${questionText}
Options: ${JSON.stringify(options)}
Answer: ${answer}${explanationText}

IMPORTANT: 
- Questions may have multiple sub-questions with separate answer fields. Numbers in different components are distinct, not ambiguous.
- If mathematical operators (+, -, ×, ÷, =) or fractions (e.g., "1/2", "3/4", "1 2/3") are visible in the question text, the question is COMPLETE, not incomplete.
- Answer format "quotient...remainder" (e.g., "3...4") means "3 remainder 4" and is a valid format for division problems.
- Fraction answers may be in format "a/b" or "whole a/b" (e.g., "2 1/10" means 2 and 1/10). These are properly extracted and should be understood.
- **CRITICAL: Mixed fractions in question text**: When you see "(3 + 1/12)" or "3 1/12" in the question, this means "(3 + 1/12)" = "(3×12 + 1)/12" = "37/12", NOT "31/12". Mixed fractions like "(3 + 1/12)" represent a whole number plus a fraction, not a single fraction with numerator 31. The parentheses make it clear it's a single unit. **ALWAYS convert mixed fractions to improper fractions**: "(whole + numerator/denominator)" = "(whole×denominator + numerator)/denominator". For example: "(9 + 4/15)" = "139/15", NOT "94/15".
- Dropdown answer formats like "B.4" or "A.3" are valid - the letter prefix is part of the option label, not an error.
- Ambiguous phrasing: "between them" could mean difference, total, or range - trust the explanation if it shows a calculation that clarifies the intended meaning.
- Only mark as incorrect if there is a genuine error (wrong answer, unclear question).${explanation ? " If an explanation is provided with a clear calculation, it resolves any ambiguity in the question wording - trust it." : ""}

Is this question correct?`;

      const result = await generateObject({
        model,
        schema: QuickValidationSchema,
        prompt,
        maxTokens: 100,
        temperature: 0.1,
      } as any);

      const object = result.object as z.infer<typeof QuickValidationSchema>;
      return object.isCorrect;
    } catch (error: any) {
      if (attempt < maxRetries) {
        // Handle rate limiting and transient errors
        const waitTime = getRetryAfterDelay(error, attempt * 2000);
        log(
          `Quick validation retry (${attempt}/${maxRetries}): ${error.message}. Waiting ${waitTime}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } else {
        log(`Quick validation error: ${error.message}`);
        return false; // Fail safe to detailed analysis
      }
    }
  }
  return false;
}

async function detailedAnalysis(
  questionId: number,
  questionText: string,
  options: any[],
  answer: string,
  questionObject: any,
  explanation?: string
): Promise<ValidationResult> {
  const maxRetries = 5;
  const structure = simplifyStructure(questionObject?.content || []);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const explanationText = explanation
        ? `\nExplanation (provided by question author): ${explanation}\n\nCRITICAL: The explanation shows the intended answer logic and calculation. If the question text contains ambiguous phrasing, but the explanation provides a clear calculation that resolves the ambiguity, TRUST THE EXPLANATION COMPLETELY. The explanation takes precedence over your interpretation of ambiguous wording. Examples:
- If explanation shows "38 - 29 = 9" for "between them", it means difference, not total or range
- If explanation shows "72 - 27 - 27 = 18", it means 27 was sold on two separate occasions (54 total), not just 27 total`
        : "";

      const prompt = `You are an expert at validating educational math questions. Analyze this question thoroughly.

Question ID: ${questionId}
Question Text: ${questionText}
Question Structure (Layout): ${JSON.stringify(structure, null, 2)}
Options: ${JSON.stringify(options)}
Current Answer(s): ${answer}${explanationText}

IMPORTANT CONTEXT:
- Questions may have multiple sub-questions or parts, each with separate answer fields
- The "Question Structure" shows the visual layout. 'block' means a paragraph/heading, 'input' means a text field, 'dropdown' means a dropdown, 'operator' means a mathematical operator (+, -, ×, ÷, =), 'fraction' means a fraction input component.
- Mathematical operators and fractions from KatexReactComponent are now included in the "Question Text" - if you see operators like +, -, ×, ÷, = or fractions like 1/2, 3/4, 1 2/3 in the text, the question is COMPLETE, not incomplete.
- Answer format: Answers in the format "quotient...remainder" (e.g., "3...4") mean "3 remainder 4" for division problems. For example, "22 ÷ 6 = 3...4" means 22 divided by 6 equals 3 with a remainder of 4, which is CORRECT.
- Fraction answers may be in format "a/b" or "whole a/b" (e.g., "2 1/10" means 2 and 1/10, "1/2" means one-half). These are properly extracted from FractionReactComponent.
- **CRITICAL: Mixed fractions in question text**: When you see "(3 + 1/12)" or "3 1/12" in the question text, this means "(3 + 1/12)" = "(3×12 + 1)/12" = "37/12", NOT "31/12". Mixed fractions like "(3 + 1/12)" represent a whole number plus a fraction. The parentheses make it clear it's a single unit in expressions. For example:
  * "10 × (3 + 1/12)" = "10 × 37/12" = "370/12" = "30 10/12" = "30 5/6"
  * "(2 + 2/15) × 3" = "(32/15) × 3" = "96/15" = "6 6/15" = "6 2/5"
  * "(9 + 4/15)" = "(9×15 + 4)/15" = "139/15", NOT "94/15"
  * "(9 + 13/60)" = "(9×60 + 13)/60" = "553/60", NOT "913/60"
  * **ALWAYS convert mixed fractions to improper fractions before calculating**: "(whole + numerator/denominator)" = "(whole×denominator + numerator)/denominator"
  * Do NOT interpret "(3 + 1/12)" as "31/12" or "(9 + 4/15)" as "94/15" - that is incorrect.
- Dropdown answer formats like "B.4" or "A.3" are valid - the letter prefix (A, B, C, D) is part of the option label format, not an error.
- Items in different blocks or inputs are VISUALLY SEPARATE. Do NOT flag them as ambiguous text merging.
- If the question asks to "List out...", expect multiple answers. The "Current Answer(s)" field contains all valid answers found in the question.
- Ambiguous phrasing: "between them" could mean difference, total, or range - if explanation shows calculation (e.g., "38 - 29 = 9"), trust it means difference. Do NOT flag as error if explanation clarifies.
- Number word format: "Five thousand eight hundred and seven" is correct. "Five thousand eight hundred seven" (without "and") is incorrect.
- Only flag issues if there is a genuine error (wrong answer, unclear question, etc.)${explanation ? "\n- If an explanation is provided with a clear calculation, it resolves any ambiguity in the question wording - trust it completely. Do NOT flag the question as ambiguous if the explanation clarifies it." : ""}

**BEFORE CALCULATING WITH MIXED FRACTIONS:**
- Mixed fractions are shown with parentheses: "(9 + 4/15)" or "(9 4/15)" - the parentheses indicate it's a single unit
- If you see "(9 + 4/15)" in the question, convert it to improper fraction FIRST: (9×15 + 4)/15 = 139/15
- If you see "(9 + 13/60)" in the question, convert it to improper fraction FIRST: (9×60 + 13)/60 = 553/60
- NEVER read "(9 + 4/15)" as "94/15" - that is mathematically incorrect
- ALWAYS convert: "(whole + num/den)" = "(whole×den + num)/den"
- When you see "(2 + 2/15) × 3", treat "(2 + 2/15)" as a single unit: (32/15) × 3 = 96/15 = 6 2/5

Please analyze:
1. Does the question make sense? (If mathematical operators or fractions are present in the question text, the question is complete. If explanation clarifies ambiguous wording, trust the explanation.)
2. Is the answer correct? (Check each sub-question/part separately against the provided answers. **When comparing mixed fractions, convert them to improper fractions first.** Remember "quotient...remainder" format and fraction formats like "a/b" or "whole a/b" are valid. Accept dropdown formats like "B.4" as valid.)
3. Are there any content issues?

**IMPORTANT: Response Format:**
- Return a JSON object with: isCorrect (boolean), issues (array of strings, optional), suggestedFix (string, optional), confidence (number between 0.0 and 1.0, optional)
- **confidence must be a decimal between 0.0 and 1.0** (e.g., 0.5 for 50% confidence, 0.9 for 90% confidence). Do NOT use a 1-10 scale.

Be careful not to flag formatting differences or structural elements as errors if the question is logically correct. Do NOT flag questions as incomplete if mathematical operators or fractions are visible in the question text. Do NOT flag questions as ambiguous if an explanation provides a clear calculation that resolves the ambiguity.`;

      const result = await generateObject({
        model,
        schema: ValidationSchema,
        prompt,
        maxTokens: 8000,
        temperature: 0.3,
      } as any);

      const object = result.object as z.infer<typeof ValidationSchema>;

      return {
        isCorrect: object.isCorrect,
        issues: object.issues || [],
        suggestedFix: object.suggestedFix || "",
        confidence: object.confidence ?? 0.5,
      };
    } catch (error: any) {
      // Enhanced error logging for schema validation failures
      const errorDetails: string[] = [error.message];

      // Try to extract more details from the error
      if (error.cause) {
        errorDetails.push(`Cause: ${JSON.stringify(error.cause)}`);
      }
      if (error.response) {
        errorDetails.push(`Response: ${JSON.stringify(error.response)}`);
      }
      if (error.text) {
        errorDetails.push(`Raw text: ${error.text.substring(0, 500)}`);
      }
      if (error.issues) {
        errorDetails.push(`Schema issues: ${JSON.stringify(error.issues)}`);
      }
      if (error.partialObject) {
        errorDetails.push(
          `Partial object: ${JSON.stringify(error.partialObject)}`
        );
      }

      const fullErrorMsg = errorDetails.join(" | ");

      if (attempt < maxRetries) {
        // Handle rate limiting and transient errors
        const waitTime = getRetryAfterDelay(error, attempt * 2000);
        log(
          `Detailed analysis retry (${attempt}/${maxRetries}): ${fullErrorMsg}. Waiting ${waitTime}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } else {
        log(
          `Detailed analysis error for question ${questionId}: ${fullErrorMsg}`
        );
        // Log the full error details to help debug
        log(
          `Full error object: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`
        );
        return {
          isCorrect: false,
          issues: ["Analysis Error"],
          error: error.message,
        };
      }
    }
  }

  return {
    isCorrect: false,
    issues: ["Analysis Error"],
    error: "Max retries exceeded",
  };
}

// ============================================================================
// DRAFT UPDATES
// ============================================================================

async function updateOrCreateDraft(
  questionId: number,
  fixedQuestionObject: any,
  audited: boolean
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
          question_object_en:
            fixedQuestionObject || primaryQuestion.question_object_en,
          question_object_zh: primaryQuestion.question_object_zh,
          outer_category: primaryQuestion.outer_category,
          inner_category: primaryQuestion.inner_category,
          difficulty: primaryQuestion.difficulty,
          // Note: 'concept', 'subject', and 'question_type' columns don't exist in primary_questions_drafts
          // Use 'type' instead of 'question_type', and 'year' as text
          type: primaryQuestion.question_type,
          year: String(primaryQuestion.year),
          audited: audited,
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
          audited: audited,
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

// ============================================================================
// MAIN PROCESSING
// ============================================================================

/**
 * Get the best version of question_object_en:
 * - If draft exists (has non-AI fixes), use draft's version
 * - Otherwise, use primary's version
 */
async function getQuestionObjectEn(questionId: number): Promise<any> {
  // First, check if draft exists (which has non-AI fixes)
  const { data: draftData, error: draftError } = await supabase
    .from("primary_questions_drafts")
    .select("question_object_en")
    .eq("original_question_id", questionId)
    .limit(1)
    .single();

  // If draft exists (has data and no error, or error is just "no rows" which means no draft)
  if (draftData && !draftError) {
    // Draft exists - use it (preserves non-AI fixes)
    log(`Question ${questionId}: Using existing draft (has non-AI fixes)`);
    return draftData.question_object_en;
  }

  // No draft found (PGRST116 = no rows) or other error - fetch from primary
  if (draftError) {
    if (draftError.code === "PGRST116") {
      log(`Question ${questionId}: No draft found, using primary table`);
    } else {
      log(
        `Question ${questionId}: Error checking draft: ${draftError.message}, falling back to primary`
      );
    }
  }

  const { data: primaryData, error: primaryError } = await supabase
    .from("primary_questions")
    .select("question_object_en")
    .eq("id", questionId)
    .single();

  if (primaryError) throw primaryError;
  return primaryData.question_object_en;
}

/**
 * Check if question object contains SvgReactComponent
 */
function hasSvgComponent(questionObject: any): boolean {
  try {
    if (!questionObject) return false;

    const checkContent = (content: any[]): boolean => {
      for (const item of content) {
        if (item.type === "SvgReactComponent") {
          return true;
        }
        if (item.content && Array.isArray(item.content)) {
          if (checkContent(item.content)) return true;
        }
      }
      return false;
    };

    if (questionObject.content && Array.isArray(questionObject.content)) {
      return checkContent(questionObject.content);
    }
    return false;
  } catch (error) {
    return false;
  }
}

async function fetchNextQuestion(
  lastProcessedId: number,
  year?: number
): Promise<QuestionRow | null> {
  try {
    let currentLastId = lastProcessedId;
    const maxAttempts = 1000; // Safety limit to avoid infinite loops
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;

      // First, get the question ID from primary_questions
      let query = supabase
        .from("primary_questions")
        .select("id")
        .eq("need_image", false)
        .gt("id", currentLastId);

      // Filter by year if provided
      if (year !== undefined) {
        query = query.eq("year", year);
      }

      const { data: primaryData, error: primaryError } = await query
        .order("id", { ascending: true })
        .limit(1)
        .single();

      if (primaryError) {
        if (primaryError.code === "PGRST116") {
          // No more rows
          return null;
        }
        throw primaryError;
      }

      if (!primaryData) return null;

      const questionId = primaryData.id;

      // Skip if already completed (handles parallel processing out-of-order completion)
      if (completedIds.has(questionId)) {
        currentLastId = questionId;
        continue; // Skip this question and fetch the next one
      }

      // Get the best version (draft if exists, else primary)
      const question_object_en = await getQuestionObjectEn(questionId);

      // Skip questions with SvgReactComponent (filter them out)
      if (hasSvgComponent(question_object_en)) {
        log(`Question ${questionId}: Skipping (contains SvgReactComponent)`);
        currentLastId = questionId;
        continue; // Skip this question and fetch the next one
      }

      return {
        id: questionId,
        question_object_en: question_object_en,
      } as QuestionRow;
    }

    // If we've tried too many times, return null
    log(
      `Reached max attempts (${maxAttempts}) while filtering SvgReactComponent questions`
    );
    return null;
  } catch (error: any) {
    log(`Error fetching question: ${error.message}`);
    throw error;
  }
}

async function processQuestion(
  question: QuestionRow,
  progress: ProgressState
): Promise<{ hasIssue: boolean; issue?: Issue; error?: string }> {
  try {
    const questionText = extractQuestionText(question.question_object_en);
    const options = extractOptions(question.question_object_en);
    const answer = extractAnswer(question.question_object_en);
    const explanation = extractExplanation(question.question_object_en);

    if (!questionText) {
      log(`Question ${question.id}: No question text found, skipping`);
      return { hasIssue: false };
    }

    // Step 0a: Heuristic check for Chinese text in all parts
    const chineseChecks: Array<{
      location: string;
      check: { hasChinese: boolean; details?: string };
    }> = [
      {
        location: "question text",
        check: detectChineseText(questionText, "question text"),
      },
      { location: "answer", check: detectChineseText(answer, "answer") },
      {
        location: "options",
        check: detectChineseText(
          options.map((opt) => opt.label).join(" "),
          "options"
        ),
      },
    ];

    if (explanation) {
      log(
        `Question ${question.id}: Found explanation - will use it for validation`
      );
      chineseChecks.push({
        location: "explanation",
        check: detectChineseText(explanation, "explanation"),
      });
    }

    // Check all locations
    for (const { location, check } of chineseChecks) {
      if (check.hasChinese) {
        log(
          `Question ${question.id}: ⚠ CHINESE TEXT DETECTED IN ${location.toUpperCase()} - ${check.details}`
        );
        const issue: Issue = {
          questionId: question.id,
          issueType: "Content Issue",
          description: `Chinese text detected in ${location}: ${check.details}`,
          suggestedFix: `Remove or translate Chinese text from the ${location}. All content in question_object_en should be in English only.`,
        };
        await updateOrCreateDraft(
          question.id,
          question.question_object_en,
          false
        );
        return { hasIssue: true, issue };
      }
    }

    // Step 0: Heuristic check for repetitive content
    const repetitionCheck = detectRepetitiveContent(questionText);
    if (repetitionCheck.hasRepetition) {
      log(
        `Question ${question.id}: ⚠ REPETITIVE CONTENT DETECTED - ${repetitionCheck.details}`
      );
      const issue: Issue = {
        questionId: question.id,
        issueType: "Content Issue",
        description: `Repetitive content detected: ${repetitionCheck.details}`,
        suggestedFix:
          "Remove duplicate sentences or repeated phrases from the question text. Each sentence should appear only once.",
      };
      await updateOrCreateDraft(
        question.id,
        question.question_object_en,
        false
      );
      return { hasIssue: true, issue };
    }

    // Step 1: Quick validation
    log(`Question ${question.id}: Quick validation...`);
    const isCorrect = await quickValidation(
      questionText,
      options,
      answer,
      explanation
    );

    if (isCorrect) {
      log(`Question ${question.id}: ✓ CORRECT (skipping detailed analysis)`);
      // Update draft to mark as audited (even if correct)
      await updateOrCreateDraft(question.id, question.question_object_en, true);
      return { hasIssue: false };
    }

    // Step 2: Detailed analysis (only if incorrect)
    log(`Question ${question.id}: ✗ INCORRECT - Running detailed analysis...`);
    const analysis = await detailedAnalysis(
      question.id,
      questionText,
      options,
      answer,
      question.question_object_en,
      explanation
    );

    if (analysis.isCorrect) {
      // Quick check was wrong, but detailed says correct
      log(`Question ${question.id}: ✓ CORRECT (detailed analysis)`);
      await updateOrCreateDraft(question.id, question.question_object_en, true);
      return { hasIssue: false };
    }

    // Question has issues
    const issue: Issue = {
      questionId: question.id,
      issueType: analysis.issues?.[0]?.includes("Answer")
        ? "Wrong Answer"
        : analysis.issues?.[0]?.includes("Sense")
          ? "Question Sense"
          : analysis.issues?.[0]?.includes("Content")
            ? "Content Issue"
            : "Other",
      description: analysis.issues?.join("; ") || "Unknown issue",
      suggestedFix: analysis.suggestedFix,
      confidence: analysis.confidence,
    };

    log(
      `Question ${question.id}: ✗ ISSUE FOUND - ${issue.issueType}: ${issue.description}`
    );

    // Update draft with current state (fixes can be applied later)
    await updateOrCreateDraft(question.id, question.question_object_en, false);

    return { hasIssue: true, issue };
  } catch (error: any) {
    const errorMessage = error.message || "Unknown error";
    log(`Question ${question.id}: ERROR - ${errorMessage}`);
    return { hasIssue: false, error: errorMessage };
  }
}

async function main() {
  log("=== AI Question Audit Started ===");
  log(`Provider: ${provider.toUpperCase()}`);
  log(`Model: ${provider === "grok" ? GROK_MODEL : GEMINI_MODEL}`);
  if (year !== undefined) {
    log(`Year Filter: ${year}`);
  } else {
    log(`Year Filter: All years`);
  }
  log(`Progress File: ${PROGRESS_FILE}`);
  log(`Log File: ${LOG_FILE}`);

  // Load or initialize progress
  let progress = loadProgress();
  if (!progress) {
    progress = {
      lastProcessedQuestionId: 0,
      totalProcessed: 0,
      totalCorrect: 0,
      totalWithIssues: 0,
      totalErrors: 0,
      lastUpdated: new Date().toISOString(),
      issues: [],
      errors: [],
    };
    log("Starting fresh audit");
    // Initialize completedIds: mark all IDs up to lastProcessedQuestionId as completed
    for (let id = 1; id <= progress.lastProcessedQuestionId; id++) {
      completedIds.add(id);
    }
  } else {
    log(`Resuming from question ID: ${progress.lastProcessedQuestionId}`);
    log(`Already processed: ${progress.totalProcessed} questions`);
    // Initialize completedIds: mark all IDs up to lastProcessedQuestionId as completed
    // This ensures resume works correctly - we know all IDs <= lastProcessedQuestionId are done
    for (let id = 1; id <= progress.lastProcessedQuestionId; id++) {
      completedIds.add(id);
    }
  }

  // Parallel processing configuration
  const PARALLEL_WORKERS = 3; // Process 3 questions simultaneously
  const BATCH_SIZE = 10; // Fetch 10 questions at a time
  const limit = pLimit(PARALLEL_WORKERS);

  let consecutiveErrors = 0;
  const MAX_CONSECUTIVE_ERRORS = 10;

  log(
    `Parallel Processing: ${PARALLEL_WORKERS} workers, batch size: ${BATCH_SIZE}`
  );

  while (true) {
    try {
      // Fetch a batch of questions
      const questionBatch: QuestionRow[] = [];
      let currentLastId = progress.lastProcessedQuestionId;

      for (let i = 0; i < BATCH_SIZE; i++) {
        const question = await fetchNextQuestion(currentLastId, year);
        if (!question) break;
        questionBatch.push(question);
        currentLastId = question.id;
      }

      if (questionBatch.length === 0) {
        log("=== No more questions to process ===");
        break;
      }

      log(`\n=== Processing batch of ${questionBatch.length} questions ===`);

      // Process batch in parallel
      // Note: progress is guaranteed to be non-null here (initialized above)
      const tasks = questionBatch.map((question) =>
        limit(async () => {
          try {
            log(`Processing question ${question.id}...`);
            const result = await processQuestion(question, progress!);
            await updateProgressSafely(progress!, question.id, result);

            if (result.error) {
              return { questionId: question.id, error: true };
            } else {
              return { questionId: question.id, error: false };
            }
          } catch (error: any) {
            log(
              `Fatal error processing question ${question.id}: ${error.message}`
            );
            await updateProgressSafely(progress!, question.id, {
              hasIssue: false,
              error: error.message,
            });
            return { questionId: question.id, error: true };
          }
        })
      );

      const results = await Promise.all(tasks);

      // After batch completes, try to advance lastProcessedQuestionId
      // This handles cases where questions complete out of order
      await progressMutex.runExclusive(async () => {
        // Find the minimum uncompleted ID in the batch
        const batchIds = questionBatch.map((q) => q.id).sort((a, b) => a - b);
        const minUncompletedId = batchIds.find((id) => !completedIds.has(id));

        // If all batch questions are completed, find the next uncompleted question
        if (!minUncompletedId) {
          // All questions in batch are completed
          // Find the highest completed ID in the batch
          const maxCompletedInBatch = Math.max(...batchIds);

          // Check if we can advance: look for the next uncompleted question
          // Query database to find the next question after maxCompletedInBatch
          try {
            let query = supabase
              .from("primary_questions")
              .select("id")
              .eq("need_image", false)
              .gt("id", maxCompletedInBatch)
              .order("id", { ascending: true })
              .limit(1);

            if (year !== undefined) {
              query = query.eq("year", year);
            }

            const { data: nextQuestion } = await query.single();

            if (nextQuestion) {
              // There's a next question - advance to one before it
              // This handles gaps in question IDs
              const newLastId = nextQuestion.id - 1;
              if (newLastId > progress!.lastProcessedQuestionId) {
                const oldId = progress!.lastProcessedQuestionId;
                progress!.lastProcessedQuestionId = newLastId;
                log(
                  `Advanced lastProcessedQuestionId from ${oldId} to ${newLastId} (all questions up to ${maxCompletedInBatch} completed)`
                );
                saveProgress(progress!);
              }
            } else {
              // No more questions - advance to max completed ID
              if (maxCompletedInBatch > progress!.lastProcessedQuestionId) {
                const oldId = progress!.lastProcessedQuestionId;
                progress!.lastProcessedQuestionId = maxCompletedInBatch;
                log(
                  `Advanced lastProcessedQuestionId from ${oldId} to ${maxCompletedInBatch} (no more questions)`
                );
                saveProgress(progress!);
              }
            }
          } catch (error) {
            // If query fails, fall back to checking consecutive IDs
            const maxIdToCheck = Math.max(
              progress!.lastProcessedQuestionId + 1000,
              ...batchIds
            );
            let maxConsecutiveId = progress!.lastProcessedQuestionId;

            for (
              let id = progress!.lastProcessedQuestionId + 1;
              id <= maxIdToCheck;
              id++
            ) {
              if (completedIds.has(id)) {
                maxConsecutiveId = id;
              } else {
                break;
              }
            }

            if (maxConsecutiveId > progress!.lastProcessedQuestionId) {
              const oldId = progress!.lastProcessedQuestionId;
              progress!.lastProcessedQuestionId = maxConsecutiveId;
              log(
                `Advanced lastProcessedQuestionId from ${oldId} to ${maxConsecutiveId} (fallback)`
              );
              saveProgress(progress!);
            }
          }
        }
      });

      // Count consecutive errors
      const batchErrors = results.filter((r) => r.error).length;
      if (batchErrors > 0) {
        consecutiveErrors += batchErrors;
      } else {
        consecutiveErrors = 0; // Reset on successful batch
      }

      // Log summary after each batch
      log(`\n=== Progress Summary ===`);
      log(`Total Processed: ${progress.totalProcessed}`);
      log(`Correct: ${progress.totalCorrect}`);
      log(`With Issues: ${progress.totalWithIssues}`);
      log(`Errors: ${progress.totalErrors}`);
      log(`Last Question ID: ${progress.lastProcessedQuestionId}`);

      // Safety: Stop if too many consecutive errors
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        log(
          `\n⚠️  Too many consecutive errors (${consecutiveErrors}). Stopping for safety.`
        );
        log("Please check the errors and resume manually.");
        break;
      }

      // Small delay between batches to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error: any) {
      log(`Fatal error: ${error.message}`);
      consecutiveErrors++;

      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        log(`\n⚠️  Too many consecutive errors. Stopping.`);
        break;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  // Final summary
  const successRate =
    progress.totalProcessed > 0
      ? (
          ((progress.totalProcessed - progress.totalErrors) /
            progress.totalProcessed) *
          100
        ).toFixed(2)
      : "0.00";

  log(`\n=== Audit Complete ===`);
  log(`Total Processed: ${progress.totalProcessed}`);
  log(
    `Correct: ${progress.totalCorrect} (${((progress.totalCorrect / progress.totalProcessed) * 100).toFixed(2)}%)`
  );
  log(
    `With Issues: ${progress.totalWithIssues} (${((progress.totalWithIssues / progress.totalProcessed) * 100).toFixed(2)}%)`
  );
  log(
    `Errors: ${progress.totalErrors} (${((progress.totalErrors / progress.totalProcessed) * 100).toFixed(2)}%)`
  );
  log(`Success Rate: ${successRate}%`);
  log(`Last Processed Question ID: ${progress.lastProcessedQuestionId}`);
  log(`Progress saved to: ${PROGRESS_FILE}`);
  log(`Logs saved to: ${LOG_FILE}`);

  if (progress.issues.length > 0) {
    log(`\n=== Issues Summary ===`);
    const issueTypes = progress.issues.reduce(
      (acc, issue) => {
        acc[issue.issueType] = (acc[issue.issueType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    for (const [type, count] of Object.entries(issueTypes)) {
      log(`${type}: ${count}`);
    }
  }
}

// Run script
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
