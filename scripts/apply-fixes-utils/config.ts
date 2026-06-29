import * as fs from "fs";
import * as path from "path";
import { xai } from "@ai-sdk/xai";
import { google } from "@ai-sdk/google";

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
  let provider: "grok" | "gemini" = "gemini";
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

export const { provider, year } = parseArgs();

// ============================================================================
// CONFIGURATION
// ============================================================================

export const XAI_API_KEY = process.env.XAI_API_KEY;
export const GEMINI_API_KEY =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
export const GROK_MODEL = process.env.GROK_MODEL || "grok-4-fast-reasoning";
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

if (provider === "grok" && !XAI_API_KEY) {
  console.error("Missing required environment variable: XAI_API_KEY");
  process.exit(1);
}

if (provider === "gemini" && !GEMINI_API_KEY) {
  console.error(
    "Missing required environment variable: GOOGLE_GENERATIVE_AI_API_KEY (or GEMINI_API_KEY)"
  );
  process.exit(1);
}

export function getModel(provider: "grok" | "gemini") {
  if (provider === "grok") {
    if (!XAI_API_KEY) {
      throw new Error("XAI_API_KEY is required for Grok provider");
    }
    return xai(GROK_MODEL);
  } else {
    if (!GEMINI_API_KEY) {
      throw new Error(
        "GOOGLE_GENERATIVE_AI_API_KEY is required for Gemini provider"
      );
    }
    return google(GEMINI_MODEL);
  }
}

export const model = getModel(provider);
