import { QuestionContext } from "./types";

// ============================================================================
// PROMPT BUILDING
// ============================================================================

export function hasSvgComponent(questionObject: any): boolean {
  if (!questionObject) return false;

  // Recursive check for SvgReactComponent
  const checkContent = (content: any[]): boolean => {
    if (!Array.isArray(content)) return false;

    for (const item of content) {
      if (item.type === "SvgReactComponent") return true;
      if (item.content && Array.isArray(item.content)) {
        if (checkContent(item.content)) return true;
      }
    }
    return false;
  };

  return checkContent(questionObject.content || []);
}

function extractText(content: any[]): string {
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
}

export function extractContext(questionObject: any): QuestionContext {
  const fullText = extractText(questionObject.content || []).trim();

  // Basic extraction heuristics (can be improved with AI or regex)
  const numbers = (fullText.match(/\b\d+\b/g) || []).slice(0, 5); // Limit to 5 numbers

  // Simple heuristic for topics based on keywords
  const topics: string[] = [];
  const lowerText = fullText.toLowerCase();

  if (lowerText.match(/add|sum|plus|\+/)) topics.push("addition");
  if (lowerText.match(/subtract|minus|less|-/)) topics.push("subtraction");
  if (lowerText.match(/multiply|times|product|×/))
    topics.push("multiplication");
  if (lowerText.match(/divide|quotient|split|÷/)) topics.push("division");
  if (lowerText.match(/fraction|numerator|denominator/))
    topics.push("fractions");
  if (lowerText.match(/decimal|point/)) topics.push("decimals");
  if (lowerText.match(/money|dollar|cent|cost|price/)) topics.push("money");
  if (lowerText.match(/time|hour|minute|clock/)) topics.push("time");
  if (lowerText.match(/shape|triangle|square|circle|angle/))
    topics.push("geometry");

  // We don't have a reliable way to extract "objects" without NLP,
  // so we'll rely on the full text providing context to the prompt builder.
  // For the prompt construction, we'll ask the model to infer objects.

  return {
    topics,
    objects: [],
    numbers,
    operations: topics.filter((t) =>
      ["addition", "subtraction", "multiplication", "division"].includes(t)
    ),
    fullText,
  };
}

/**
 * Builds a prompt for the image generator.
 * Since we are using an LLM to generate the image (DALLE-3/GPT-Image models handle natural language well),
 * we can create a prompt that asks it to visualize the scene described in the text.
 */
export function buildImagePrompt(context: QuestionContext): string {
  // Construct a prompt that emphasizes visual elements and educational value
  let prompt =
    "Create a colorful, engaging, educational illustration for a primary school math question. ";

  prompt += "The scene should be: ";
  prompt += `Based on this text: "${context.fullText.substring(0, 300)}...". `; // Truncate if too long

  if (context.topics.length > 0) {
    prompt += `Relevant math topics: ${context.topics.join(", ")}. `;
  }

  prompt += "\n\nCRITICAL CONSTRAINTS:\n";
  prompt += "1. NO TEXT, NO NUMBERS, and NO WORDS in the image.\n";
  prompt += "2. Do not show the answer.\n";
  prompt +=
    "3. Make it suitable for children (bright colors, clear simple shapes).\n";
  prompt +=
    "4. Focus on the objects and setting described in the text (e.g. if apples are mentioned, show apples).\n";
  prompt +=
    "5. The image should provide visual context to help a student understand the specific math problem scenario.\n";

  return prompt;
}
