import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import { OPENAI_API_KEY, OPENAI_MODEL } from "./config";
import { ImageGenerationResult } from "./types";
import { log } from "./logger";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Cost per image for 1024x1024 standard quality (as per user request: $0.133)
// Note: Official pricing might vary, using user provided value.
const COST_PER_IMAGE_USD = 0.04; // aprox cost for 1024x1024 medium quality (1056 tokens * price per token)

export async function generateImage(
  prompt: string
): Promise<ImageGenerationResult> {
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.images.generate({
        model: OPENAI_MODEL,
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "medium", // Changed to medium as requested
        // response_format: "url" <-- Removed, invalid for gpt-image-1.5
      });

      // According to docs, Image API returns b64_json by default or when specified,
      // but the type definition for response might vary.
      // Let's check for what we get.

      const url = response.data[0]?.url;
      const b64_json = response.data[0]?.b64_json;
      const revisedPrompt = response.data[0]?.revised_prompt;

      if (b64_json) {
        return {
          success: true,
          b64_json,
          revisedPrompt,
        };
      }

      if (url) {
        return {
          success: true,
          url,
          revisedPrompt,
        };
      }

      // If neither, that's an error
      throw new Error(
        "No image data (url or b64_json) received from OpenAI API"
      );
    } catch (error: any) {
      lastError = error;

      // Handle rate limits (429) specifically
      if (error.status === 429) {
        const backoff = Math.pow(2, attempt) * 1000;
        log(`Rate limit hit. Waiting ${backoff}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }

      // Other errors, log and retry with linear backoff (1s, 2s...)
      if (attempt < maxRetries) {
        const delay = attempt * 1000;
        log(`API Error: ${error.message}. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || "Unknown error after retries",
  };
}

export async function saveImage(
  result: ImageGenerationResult,
  questionId: number,
  year: number | "all"
): Promise<string> {
  const yearFolder = typeof year === "number" ? `year-${year}` : "all-years";
  const dir = path.join(
    process.cwd(),
    "public",
    "images",
    "questions",
    yearFolder
  );

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, `${questionId}.png`);

  try {
    // Handle Base64 (Preferred/Default for GPT-Image)
    if (result.b64_json) {
      const buffer = Buffer.from(result.b64_json, "base64");
      fs.writeFileSync(filePath, buffer);
      return filePath;
    }

    // Handle URL (Fallback)
    if (result.url) {
      const response = await axios({
        url: result.url,
        method: "GET",
        responseType: "stream",
        timeout: 30000, // 30s timeout for download
      });

      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", () => {
          // Verify file size > 0
          const stats = fs.statSync(filePath);
          if (stats.size === 0) {
            fs.unlinkSync(filePath); // Delete empty file
            reject(new Error("Downloaded image file is empty"));
          } else {
            resolve(filePath);
          }
        });
        writer.on("error", (err) => {
          fs.unlinkSync(filePath); // Delete partial file
          reject(err);
        });
      });
    }

    throw new Error("No image data (url or b64_json) to save");
  } catch (error: any) {
    throw new Error(`Failed to save image: ${error.message}`);
  }
}

export function calculateCost(imageCount: number): number {
  return imageCount * COST_PER_IMAGE_USD;
}
