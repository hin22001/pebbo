import * as fs from "fs";
import * as path from "path";

// Let's duplicate to keep it standalone as per request "new set of script and utils"

// ============================================================================
// ENVIRONMENT VARIABLES LOADING
// ============================================================================

function loadEnv() {
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

loadEnv();

// ============================================================================
// CONFIGURATION
// ============================================================================

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const TEXT_MODEL = "gpt-4o"; // For generating prompt
export const IMAGE_MODEL = "gpt-image-1.5"; // For generating the image

export const STYLE_PROMPT_PREFIX =
  "Educational illustration, flat vector art style, white background, bright colors, clean lines. "; // For generating the image

if (!OPENAI_API_KEY) {
  console.error("Missing required environment variable: OPENAI_API_KEY");
  process.exit(1);
}

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}
