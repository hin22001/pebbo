import * as fs from "fs";
import * as path from "path";

// ============================================================================
// FILE NAMING & LOGGING
// ============================================================================

export function getBaseDir(year?: number): string {
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

export function getProgressFileName(year?: number): string {
  return path.join(getBaseDir(year), `needed-image-generation-progress.json`);
}

export function getLogFileName(year?: number): string {
  return path.join(getBaseDir(year), `generate-needed-images.log`);
}

let LOG_FILE: string | null = null;

export function initLogger(year?: number) {
  LOG_FILE = getLogFileName(year);
}

export function log(message: string): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);

  if (LOG_FILE) {
    try {
      fs.appendFileSync(LOG_FILE, logMessage, "utf-8");
    } catch (error) {
      // Ignore
    }
  }
}
