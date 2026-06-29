import OpenAI from "openai";
import { OPENAI_API_KEY, TEXT_MODEL } from "./config";
import { PromptAndDescription, QuestionContext } from "./types";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/**
 * Uses GPT-4o to generate:
 * 1. An exact image prompt that DESCRIBES the problem visually (masking the answer).
 * 2. A short, crisp text description of the image.
 */
export async function generatePromptAndDescription(
  context: QuestionContext
): Promise<PromptAndDescription> {
  const systemPrompt = `You are an expert educational content creator for primary school math.
Your task is to analyze a math question text and generate two things:
1. "imagePrompt": A detailed prompt for an image generator (like DALL-E) to create an illustration that represents/completes the question.
2. "shortDescription": A short, crisp description of what is in the image, to be used as alt text or context.

CORE PRINCIPLES:
1.  **IMAGE IS ESSENTIAL**: The image is NOT decorative. It is part of the question. Verification of the correct answer depends on reading the image correctly.
2.  **USE EXPLANATION FOR CONTEXT**: You will be provided with an "Explanation". You **MUST** use this to understand the correct values/shapes/objects if the question text is vague. (e.g. if question says "Which shape is a square?", look at explanation to see which Option is the square).
3.  **STRICT DATA FIDELITY**:
    *   You MUST translate the specific numbers and conditions from the text/explanation into strict visual instructions.
    *   **Do NOT use random values.**
    *   If the question asks "Which option shows X?", then the correct option in the image MUST visually depict X, and the incorrect options MUST visually depict their respective incorrect values.
4.  **NO SPECIFIC EXAMPLES**: Do not rely on specific objects unless the text explicitly mentions them. Adapt to the objects in the question.

RULES FOR IMAGE PROMPT:
- **Visual Translation**: Describe the *exact* visual state for every element based on the text AND explanation.
- **No Answer Spoilers**: Do NOT highlight the correct answer (no checks, no circles, no "Correct" text). Just render the *facts* accurately so the student can deduce the valid option.
- **No Text**: Do not include the question text inside the image. Only labels (A, B, C, D) or critical data labels are allowed.
- **Content Focus**: Do NOT describe the artistic style (e.g. "flat vector", "white background"). A separate system handles that. Focus ONLY on the subjects, their arrangement, and the data values.

RULES FOR SHORT DESCRIPTION:
- Briefly describe the visual elements and their values.
- Keep it under 2 sentences.

Output Format: JSON object with keys "imagePrompt" and "shortDescription".`;

  const userMessage = `Here is the question text:
"${context.fullText}"

${
  context.explanation
    ? `\nHere is the explanation (CRITICAL: Use this to extract missing visual details, option values, or correct answers to depict): \n"${context.explanation}"`
    : ""
}

Please generate the JSON output.`;

  const response = await openai.chat.completions.create({
    model: TEXT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Failed to generate prompt and description from LLM.");
  }

  const result = JSON.parse(content);
  return {
    imagePrompt: result.imagePrompt,
    shortDescription: result.shortDescription,
  };
}

export function extractContext(questionObject: any): QuestionContext {
  const extractText = (content: any[]): string => {
    let text = "";
    if (!Array.isArray(content)) return text;

    for (const item of content) {
      if (item.type === "text" && item.text) {
        text += item.text + " ";
      } else if (item.content && Array.isArray(item.content)) {
        text += extractText(item.content);
      }
    }
    return text;
  };

  // Helper to verify deep explanation extraction
  const extractExplanation = (obj: any): string => {
    let explanations: string[] = [];

    // Check if obj is an object
    if (!obj || typeof obj !== "object") return "";

    // Direct explanation property
    if (obj.explanation && typeof obj.explanation === "string") {
      explanations.push(obj.explanation);
    }

    // Check attrs specific for our schema
    if (
      obj.attrs &&
      obj.attrs.explanation &&
      typeof obj.attrs.explanation === "string"
    ) {
      explanations.push(obj.attrs.explanation);
    }

    // Recursive search
    if (Array.isArray(obj)) {
      obj.forEach((child) => {
        const childExpl = extractExplanation(child);
        if (childExpl) explanations.push(childExpl);
      });
    } else {
      Object.keys(obj).forEach((key) => {
        if (key !== "explanation" && typeof obj[key] === "object") {
          const childExpl = extractExplanation(obj[key]);
          if (childExpl) explanations.push(childExpl);
        }
      });
    }

    return explanations.join(" ");
  };

  const text = extractText(questionObject.content || []).trim();
  const explanation = extractExplanation(questionObject).trim();

  return {
    fullText: text,
    explanation: explanation || undefined,
    originalText: questionObject,
  };
}
