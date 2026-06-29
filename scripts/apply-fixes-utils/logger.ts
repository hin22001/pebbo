import * as fs from "fs";
import * as path from "path";
import { provider, year } from "./config";

// ============================================================================
// FILE NAMING & LOGGING
// ============================================================================

// Dynamic file naming based on provider and year
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

export function getProgressFileName(
  provider: "grok" | "gemini",
  year?: number
): string {
  return path.join(getBaseDir(year), `apply-fixes-progress-${provider}.json`);
}

export function getLogFileName(
  provider: "grok" | "gemini",
  year?: number
): string {
  return path.join(getBaseDir(year), `apply-fixes-${provider}.log`);
}

export function getAuditProgressFileName(
  provider: "grok" | "gemini",
  year?: number
): string {
  return path.join(getBaseDir(year), `ai-audit-progress-${provider}.json`);
}

export const PROGRESS_FILE = getProgressFileName(provider, year);
export const LOG_FILE = getLogFileName(provider, year);
export const AUDIT_PROGRESS_FILE = getAuditProgressFileName(provider, year);

export function log(message: string): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  try {
    fs.appendFileSync(LOG_FILE, logMessage, "utf-8");
  } catch (error) {
    // Ignore log file errors
  }
}
