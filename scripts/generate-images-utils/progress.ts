import * as fs from "fs";
import { getProgressFileName } from "./logger";
import { ImageGenerationProgress } from "./types";

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

export function loadProgress(year?: number): ImageGenerationProgress {
  const fileName = getProgressFileName(year);
  try {
    if (fs.existsSync(fileName)) {
      const content = fs.readFileSync(fileName, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error loading progress file:", error);
  }
  return {
    generated: [],
    failed: [],
    skipped: [],
    lastProcessedId: 0,
    totalCost: {
      tokens: 0,
      images: 0,
      estimatedUSD: 0,
    },
    lastUpdated: new Date().toISOString(),
  };
}

export function saveProgress(
  state: ImageGenerationProgress,
  year?: number
): void {
  const fileName = getProgressFileName(year);
  try {
    state.lastUpdated = new Date().toISOString();
    const tempFile = fileName + ".tmp";
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), "utf-8");
    fs.renameSync(tempFile, fileName);
  } catch (error) {
    console.error("Error saving progress file:", error);
    try {
      fs.writeFileSync(fileName, JSON.stringify(state, null, 2), "utf-8");
    } catch (fallbackError) {
      console.error("Fallback save also failed:", fallbackError);
    }
  }
}
