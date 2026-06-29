import * as fs from "fs";
import * as path from "path";
import { getProgressFileName, getBaseDir } from "./logger";
import { NeededImageProgress, ImageDescriptionMap } from "./types";

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

export function loadProgress(year?: number): NeededImageProgress {
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
      promptTokens: 0,
      completionTokens: 0,
      estimatedUSD: 0,
    },
    lastUpdated: new Date().toISOString(),
  };
}

export function saveProgress(state: NeededImageProgress, year?: number): void {
  const fileName = getProgressFileName(year);
  try {
    state.lastUpdated = new Date().toISOString();
    const tempFile = fileName + ".tmp";
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), "utf-8");
    fs.renameSync(tempFile, fileName);
  } catch (error) {
    console.error("Error saving progress file:", error);
  }
}

// ============================================================================
// DESCRIPTION STORAGE
// ============================================================================

function getDescriptionFileName(year?: number): string {
  // Store alongside images in public/images/needImages/year-{X}/
  // OR keep in logs?
  // User req: "description of the image is mainly to describe what is present... store images similarly"
  // "store images... in a separate folder needImages"
  // I proposed storing description in JSON for easy access.
  // Let's store it in public/images/needImages/year-{X}/descriptions.json

  const yearFolder = typeof year === "number" ? `year-${year}` : "all-years";
  const dir = path.join(
    process.cwd(),
    "public",
    "images",
    "needImages",
    yearFolder
  );

  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
      // ignore
    }
  }
  return path.join(dir, "descriptions.json");
}

export function loadDescriptions(year?: number): ImageDescriptionMap {
  const file = getDescriptionFileName(year);
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    }
  } catch (e) {
    // ignore
  }
  return {};
}

export function saveDescription(
  questionId: number,
  description: string,
  prompt: string,
  year?: number
): void {
  const file = getDescriptionFileName(year);
  const data = loadDescriptions(year);

  data[questionId] = {
    description,
    prompt,
    timestamp: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error(`Failed to save description for Q${questionId}:`, e);
  }
}
