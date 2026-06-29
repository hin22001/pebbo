import * as fs from "fs";
import { AUDIT_PROGRESS_FILE, PROGRESS_FILE } from "./logger";
import { AuditProgressState, FixProgressState } from "./types";

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

export function loadAuditProgress(): AuditProgressState | null {
  try {
    if (fs.existsSync(AUDIT_PROGRESS_FILE)) {
      const content = fs.readFileSync(AUDIT_PROGRESS_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error loading audit progress file:", error);
  }
  return null;
}

export function loadFixProgress(): FixProgressState {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const content = fs.readFileSync(PROGRESS_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error loading fix progress file:", error);
  }
  return {
    applied: [],
    failed: [],
    skipped: [],
    needsReview: [],
    lastUpdated: new Date().toISOString(),
  };
}

export function saveFixProgress(state: FixProgressState): void {
  try {
    state.lastUpdated = new Date().toISOString();
    const tempFile = PROGRESS_FILE + ".tmp";
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), "utf-8");
    fs.renameSync(tempFile, PROGRESS_FILE);
  } catch (error) {
    console.error("Error saving fix progress file:", error);
    try {
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(state, null, 2), "utf-8");
    } catch (fallbackError) {
      console.error("Fallback save also failed:", fallbackError);
    }
  }
}
