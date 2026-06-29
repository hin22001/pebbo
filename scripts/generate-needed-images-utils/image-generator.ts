import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import { OPENAI_API_KEY, IMAGE_MODEL, STYLE_PROMPT_PREFIX } from "./config";
import { ImageGenerationResult, PromptAndDescription } from "./types";
import { log } from "./logger";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Cost per image for 1024x1024 medium quality ~ $0.04
const COST_PER_IMAGE_USD = 0.04;

export async function generateImage(
  promptData: PromptAndDescription
): Promise<ImageGenerationResult> {
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.images.generate({
        model: IMAGE_MODEL,
        prompt: `${STYLE_PROMPT_PREFIX} ${promptData.imagePrompt}`,
        n: 1,
        size: "1536x1024", // Landscape (Supported: 1024x1024, 1024x1536, 1536x1024)
        quality: "medium",
      });

      const image = response.data?.[0];
      const url = image?.url;
      const b64_json = image?.b64_json;
      const revisedPrompt = image?.revised_prompt;

      if (b64_json) {
        return { success: true, b64_json, revisedPrompt };
      }
      if (url) {
        return { success: true, url, revisedPrompt };
      }

      throw new Error("No image data received from OpenAI API");
    } catch (error: any) {
      lastError = error;
      if (error.status === 429) {
        const backoff = Math.pow(2, attempt) * 1000;
        log(`Rate limit hit. Waiting ${backoff}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }
      if (attempt < maxRetries) {
        const delay = attempt * 1000;
        log(`API Error: ${error.message}. Retrying...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || "Unknown error after retries",
  };
}

export async function saveNeededImage(
  result: ImageGenerationResult,
  questionId: number,
  year: number | "all"
): Promise<string> {
  const yearFolder = typeof year === "number" ? `year-${year}` : "all-years";
  // CRITICAL: Separate folder 'needImages'
  const dir = path.join(
    process.cwd(),
    "public",
    "images",
    "needImages",
    yearFolder
  );

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, `${questionId}.png`);

  try {
    if (result.b64_json) {
      const buffer = Buffer.from(result.b64_json, "base64");
      fs.writeFileSync(filePath, buffer as any);
      return filePath;
    }

    if (result.url) {
      const response = await axios({
        url: result.url,
        method: "GET",
        responseType: "stream",
        timeout: 30000,
      });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on("finish", () => {
          if (fs.statSync(filePath).size === 0) {
            fs.unlinkSync(filePath);
            reject(new Error("Empty file"));
          } else {
            resolve(filePath);
          }
        });
        writer.on("error", (err) => {
          fs.unlinkSync(filePath);
          reject(err);
        });
      });
    }
    throw new Error("No content to save");
  } catch (error: any) {
    throw new Error(`Failed to save image: ${error.message}`);
  }
}

export function calculateImageCost(count: number): number {
  return count * COST_PER_IMAGE_USD;
}
