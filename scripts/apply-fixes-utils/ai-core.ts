import { generateObject } from "ai";
import { z } from "zod";
import { model } from "./config";
import { log } from "./logger";
import {
  ChangeInstructionSchema,
  SuggestedFixSchema,
  VerificationSchema,
  FalsePositiveDetectionSchema,
} from "./types";
import {
  deepClone,
  getNestedValue,
  setNestedValue,
  simplifyStructure,
  validateStructurePreserved,
  validateStructuralChange,
  extractQuestionText,
  extractAnswer,
  extractExplanation,
} from "./utils";

// ============================================================================
// AI OPERATIONS
// ============================================================================

/**
 * Use AI to detect if an issue is a false positive
 */
export async function detectFalsePositive(
  questionId: number,
  questionObject: any,
  issueDescription: string,
  suggestedFix: string
): Promise<{ isFalsePositive: boolean; reason?: string; confidence?: number }> {
  try {
    const questionText = extractQuestionText(questionObject);
    const answer = extractAnswer(questionObject);
    const explanation = extractExplanation(questionObject);
    const structure = simplifyStructure(questionObject?.content || []);

    const prompt = `You are analyzing whether an issue identified in a math question audit is a FALSE POSITIVE.

Question ID: ${questionId}

Question Text:
${questionText}

Answer: ${answer || "Not provided"}

Explanation: ${explanation || "Not provided"}

Question Structure (simplified):
${JSON.stringify(structure, null, 2)}

Issue Description (from audit):
${issueDescription}

Suggested Fix (from audit):
${suggestedFix}

Your task:
Determine if this issue is a FALSE POSITIVE. A false positive means:
- The audit incorrectly identified a problem
- The question is actually correct/complete as-is
- The issue description misunderstands the question structure or content
- The suggested fix addresses a non-existent problem

Common false positive scenarios:
1. **Multi-part questions**: Numbers in different components are distinct, not ambiguous
2. **Dropdown answer formats**: Answers like "B.4" or "A.3" are valid (letter prefix is part of option label)
3. **Quotient...remainder format**: Answers like "3...4" are valid for division problems
4. **Complete questions with fractions/operators**: Question has all necessary values, just formatted with fractions
5. **Explanation clarifies ambiguity**: The explanation provides context that resolves any apparent ambiguity

NOT false positives (real issues):
1. **Missing values**: Question text has blanks like "After eating __ kg" with no value provided
2. **Misplaced content**: Values appear in wrong locations - this is a REAL issue, NOT a false positive
   - Example: "After eating kg of rice" (missing value) but value "5/4" appears after "how much is left? __ kg" (misplaced)
   - Example: Answer value appears in question text instead of in answer field
   - Example: Question value appears in options instead of in question text
   - Example: Value appears after question mark or in wrong component
   - **CRITICAL**: If issue description mentions "misplaced", "wrong location", "should be in", "appears after", this is likely a REAL issue
3. **Incomplete questions**: Question is genuinely missing information needed to solve it
   - Example: "After eating kg" with no value anywhere
   - Example: Question asks for calculation but missing one of the required values
4. **Mathematical errors**: Answer is mathematically incorrect
5. **Formatting issues**: Content is malformed or confusing

Analyze the issue carefully. Consider:
- Is the question actually complete and solvable?
- **Are values in the correct locations?** Check if values that should be in question text are actually there, not after question marks or in options
- **Is content misplaced?** If a value appears where it shouldn't (e.g., after "?" instead of before it), this is a REAL issue
- Does the issue description accurately identify a real problem?
- Would the suggested fix address a genuine issue?

**Special attention to misplaced content:**
- If the issue says "misplaced", "wrong location", "should be in X but is in Y", this is almost always a REAL issue
- Check the question structure: values should be in logical positions (e.g., "After eating 5/4 kg" not "After eating kg ... how much left? 5/4")
- If a value appears after a question mark or in options when it should be in question text, this is NOT a false positive

Is this a false positive?`;

    const result = await generateObject({
      model,
      schema: FalsePositiveDetectionSchema,
      prompt,
      maxTokens: 1000,
      temperature: 0.1,
    } as any);

    const detection = result.object as z.infer<
      typeof FalsePositiveDetectionSchema
    >;

    log(
      `Question ${questionId}: AI false positive detection - isFalsePositive: ${detection.isFalsePositive}, confidence: ${detection.confidence}, reason: ${detection.reason}`
    );

    return {
      isFalsePositive: detection.isFalsePositive,
      reason: detection.reason,
      confidence: detection.confidence,
    };
  } catch (error: any) {
    log(
      `Question ${questionId}: Error in AI false positive detection: ${error.message}. Falling back to heuristic detection.`
    );
    // Fall back to heuristic detection if AI fails
    return { isFalsePositive: false };
  }
}

/**
 * Generate a suggested fix from the issue description when no fix was provided
 */
export async function generateSuggestedFix(
  questionId: number,
  currentQuestionObject: any,
  issueDescription: string
): Promise<string> {
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      log(
        `Question ${questionId}: Generating suggested fix from description (attempt ${attempt}/${maxRetries})...`
      );

      // Generate simplified structure for better AI understanding
      const simplifiedStructure = simplifyStructure(
        currentQuestionObject?.content || []
      );

      const prompt = `You are analyzing a math question that has an issue.

Question ID: ${questionId}

Current Question Object (JSON):
${JSON.stringify(currentQuestionObject, null, 2)}

Question Structure (Layout) - Simplified view:
${JSON.stringify(simplifiedStructure, null, 2)}

Issue Description:
${issueDescription}

Your task:
Based on the issue description, generate a clear, actionable fix that explains:
1. WHAT needs to be changed (specific fields, values, text, etc.)
2. HOW to change it (what the new value should be)
3. WHERE to change it (which component/field)

The fix should be specific enough that another AI can apply it programmatically.
Be concrete - mention specific paths, values, and changes needed.

Examples of good fixes:
- "Change the answer field in the second TextFieldReactComponent from '9' to '90'"
- "Update the explanation to say '36 dollars and 90 cents' instead of '36 dollars and 9 cents'"
- "Fix the typo 'anwser' to 'answer' in the question text"
- "Swap the two answer values - first blank should be '1' (day) and second blank should be '12' (month)"
- "Change the dropdown answer from option A to option B"
- "Fix the options array to use 'thousand' (singular) instead of 'thousands' (plural) in options A and C"

Generate a suggested fix:`;

      const result = await generateObject({
        model,
        schema: SuggestedFixSchema,
        prompt,
        maxTokens: 2000,
        temperature: 0.3,
      } as any);

      const object = result.object as z.infer<typeof SuggestedFixSchema>;

      log(
        `Question ${questionId}: Generated suggested fix (confidence: ${object.confidence}): ${object.suggestedFix}`
      );

      // If confidence is very low, we might want to mark for review
      if (object.confidence < 0.3) {
        log(
          `Question ${questionId}: Low confidence fix generated (${object.confidence}) - may need review`
        );
      }

      return object.suggestedFix;
    } catch (error: any) {
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        log(
          `Question ${questionId}: Suggested fix generation retry (${attempt}/${maxRetries}): ${error.message}. Waiting ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded for suggested fix generation");
}

export async function generateFix(
  questionId: number,
  currentQuestionObject: any,
  issueDescription: string,
  suggestedFix: string,
  feedback?: { critiques: string[]; suggestions: string[] }
): Promise<any> {
  const maxRetries = 3;
  let previousError: string | undefined;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      log(
        `Question ${questionId}: Generating fix (attempt ${attempt}/${maxRetries})...`
      );

      // Generate simplified structure for better AI understanding
      const simplifiedStructure = simplifyStructure(
        currentQuestionObject?.content || []
      );

      // Feedback integration for Evaluator-Optimizer pattern
      const feedbackContext =
        feedback && feedback.critiques.length > 0
          ? `\n\nFEEDBACK FROM PREVIOUS FAILED FIX ATTEMPT(S):
CRITIQUES (what was wrong):
${feedback.critiques.map((c, i) => `${i + 1}. ${c}`).join("\n")}

SUGGESTIONS FOR IMPROVEMENT (how to fix it):
${feedback.suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")}

IMPORTANT: A previous fix was rejected. Please address ALL critiques above carefully.
Focus especially on the most critical issues mentioned in the critiques.
If suggestions are provided, follow them to improve your fix.`
          : "";

      // STEP 1: Ask AI to identify the exact changes needed (paths + values)
      const errorContext = previousError
        ? `\n\nPREVIOUS ATTEMPT ERROR (learn from this):
${previousError}

IMPORTANT: The previous attempt failed. Please learn from this error:
${
  previousError.includes("verification") ||
  previousError.includes("incomplete") ||
  previousError.includes("not fully")
    ? `1. The previous fix was INCOMPLETE or failed verification
2. Read the error message carefully - it tells you what was missing or wrong
3. Address ALL parts of the suggested fix, not just some parts
4. If the error mentions missing values (e.g., "absolute distance for Tim"), you MUST provide those values
5. Ensure your fix is COMPLETE and addresses all requirements mentioned in the suggested fix
6. Don't just rephrase relationships - provide actual values when the fix asks for them`
    : `1. The previous attempt failed because the path was incorrect
2. Carefully trace through the JSON structure above
3. Find the component you need to modify
4. Count ALL nesting levels (paragraphs, segments, headings)
5. Verify the path exists before identifying it
6. If the error mentioned a missing parent path, that means you skipped a nesting level
7. Remember: components inside paragraphs need the paragraph level in the path (e.g., content[0].content[2].content[0].content[1] not content[0].content[2].content[1])`
}`
        : "";

      const changePrompt = `You are analyzing a math question that needs to be fixed.
${feedbackContext}
${errorContext}

Question ID: ${questionId}

Current Question Object (JSON) - THIS IS THE ACTUAL CURRENT STATE:
${JSON.stringify(currentQuestionObject, null, 2)}

Question Structure (Layout) - Simplified view to help understand the structure:
${JSON.stringify(simplifiedStructure, null, 2)}

Issue Description (READ THIS FIRST - explains WHAT is wrong and WHY):
${issueDescription}

Suggested Fix (WHAT to change - but use the description above to understand the full context):
${suggestedFix}

CRITICAL INSTRUCTIONS:
1. **READ THE ISSUE DESCRIPTION FIRST** - it explains the problem in detail and provides context.
2. **USE THE INDICES** in the "Question Structure" to locate components. The structure now provides explicit indices (e.g., "index": 5). Use these indices in your paths.
3. **VERIFY the ACTUAL current state** by reading the "Current Question Object (JSON)" above.
4. **DO NOT assume** the current state matches what the "Issue Description" says - the issue may have already been fixed.
5. **ONLY identify changes** if the current state does NOT match what needs to be fixed.

COMPLETENESS CHECK - CRITICAL:
Before finalizing your changes, verify:
1. **Read the ENTIRE suggested fix**.
2. **Address ALL parts** - don't stop after fixing just one part.
3. **If the fix mentions "add" or "provide" absolute values** - you MUST include those values.
4. **If the fix mentions "add an input field"** - note that adding components requires structural changes (mark for review if needed).

PATH IDENTIFICATION TIPS:
- **USE INDICES**: The "Question Structure" view shows the explicit index for every item. Use these indices!
  - Example: If structure shows {"index": 5, "type": "DropdownReactComponent"}, the path is content[0]...content[5].
- **Trace the path**: Start from content[0] (usually SegmentReactComponent).
- **Check component type**: Ensure the component at your path matches the type you expect.
- **CRITICAL - ALWAYS MODIFY NESTED PROPERTIES, NEVER REPLACE ENTIRE OBJECTS**:
  - ❌ WRONG: To update a fraction, path: "content[0].content[1]", newValue: {"type":"KatexReactComponent","attrs":{"originalString":"\\\\frac{5}{12}"}} (replacing entire object - BLOCKED)
  - ✅ CORRECT: To update a fraction, path: "content[0].content[1].attrs.originalString", newValue: "\\\\frac{5}{12}" (modifying nested property)
  - ❌ WRONG: To update an answer, path: "content[0].content[2]", newValue: {"type":"TextFieldReactComponent","attrs":{"answer":"18"}} (replacing entire object - BLOCKED)
  - ✅ CORRECT: To update an answer, path: "content[0].content[2].attrs.answer", newValue: "\\"18\\"" (modifying nested property)
  - **Always identify the specific property you want to change and use that as the path, not the entire component object**

COMPONENT FIELD REFERENCE - CRITICAL:
Each component type has specific fields. Use ONLY these fields - do NOT create new ones:

**TextFieldReactComponent** attrs fields:
- answer (string): The answer value, e.g., "\\"36\\"" (NOTE: often a JSON-encoded string with extra quotes)
  - **CRITICAL**: This field MUST always be a STRING, never a number
  - If you want to change "180" to "18", provide: "\\"18\\"" (string), NOT 18 (number)
- explanation (string): Explanation text
- unit (string): Unit label
- label (string): Field label
- placeholder (string): Placeholder text

**DropdownReactComponent** attrs fields:
- answers (string, JSON array): Selected answer(s) as JSON string, e.g., "[{\\"label\\":\\"A. Option\\",\\"id\\":\\"1\\",\\"checked\\":true}]"
- options (string, JSON array): Available options as JSON string
- explanation (string): Explanation text
- unit (string): Unit label
- label (string): Field label
- placeholder (string): Placeholder text

**IMPORTANT - STRUCTURAL INTEGRITY:**
- **NEVER replace entire objects or the 'attrs' object itself**. Always modify properties INSIDE them.
  - ❌ WRONG: path: "content[0]...attrs", newValue: "some string" (This breaks structure!)
  - ✅ CORRECT: path: "content[0]...attrs.answer", newValue: "some string"
  - ❌ WRONG: path: "content[0].content[1]", newValue: {"type":"KatexReactComponent","attrs":{"originalString":"\\frac{5}{12}"}} (replacing entire object)
  - ✅ CORRECT: path: "content[0].content[1].attrs.originalString", newValue: "\\frac{5}{12}" (modifying nested property)
- **NEVER stringify entire arrays/objects**. Modify individual fields within them.
  - ❌ WRONG: path: "content[0].content[7].content", newValue: "[{...}]" (stringified array)
  - ✅ CORRECT: path: "content[0].content[7].content[0].text", newValue: "new text"
- **CRITICAL - MODIFY NESTED PROPERTIES, NOT ENTIRE OBJECTS**:
  - If you need to update attrs.originalString in a KatexReactComponent, use path: "content[0].content[1].attrs.originalString", NOT "content[0].content[1]"
  - If you need to update attrs.answer in a TextFieldReactComponent, use path: "content[0].content[1].attrs.answer", NOT "content[0].content[1]"
  - Always drill down to the specific property you want to change, don't replace the entire component object
  - The validation will BLOCK attempts to replace entire objects - you MUST modify individual properties instead
- **Do NOT set critical fields to empty or whitespace-only strings**.
  - ❌ WRONG: text: " " or originalString: " " (whitespace-only) - EXCEPT for fractions (see below)
  - ✅ CORRECT: Keep original value or provide meaningful content
- **EXCEPTION for Fraction Components**: You CAN set originalString to empty for KatexReactComponent if it contains a fraction. Fractions can be safely removed.
  - ✅ ALLOWED: originalString containing a fraction (e.g., "\\\\frac{S}{4}") -> "" (if the fraction is ambiguous/extraneous)
  - ✅ ALSO ALLOWED: originalString: "\\\\frac{S}{4}" -> "\\\\frac{4}{1}" (replace with correct fraction)
  - When replacing fractions, ensure they follow LaTeX format: "\\\\frac{numerator}{denominator}"

**HANDLING "REMOVE" OR "ELIMINATE" INSTRUCTIONS:**
- If the fix says to "remove", "delete", or "eliminate" ambiguous/extraneous content:
  - **For Fraction Components (KatexReactComponent with fractions)**: You CAN set originalString to empty "" to remove the fraction
    - ✅ ALLOWED: originalString: "\\\\frac{S}{4}" -> "" (if the fraction is ambiguous/extraneous)
  - **For Other Content**: You CANNOT set it to empty (this breaks rendering). Instead, **REPLACE it with a meaningful value**:
    - Example: If text is extraneous:
      - ❌ WRONG: Set text to "" or " " (empty/whitespace - breaks rendering)
      - ✅ CORRECT: Replace with clarifying text or merge into adjacent text components
    - For ambiguous KatexReactComponent (non-fraction): Replace originalString with a value that resolves the ambiguity (e.g., if it's a typo, replace with the correct value)
- **When replacing fractions**, ensure they follow LaTeX format: "\\\\frac{numerator}{denominator}"
- **Always provide a replacement value** (except for fractions which can be set to empty)
- If you cannot determine an appropriate replacement value, consider modifying adjacent text/components to clarify the meaning

**STRUCTURAL CHANGES - FULLY ALLOWED IN QUESTION TEXT:**
- **QUESTION TEXT (everything above input components)**: You have FULL FREEDOM to make structural changes
  - ✅ ALLOWED: Add new components (paragraphs, headings, text nodes, fractions, etc.)
  - ✅ ALLOWED: Remove duplicate/extraneous components
  - ✅ ALLOWED: Reorganize components (move between paragraphs, separate merged options, etc.)
  - ✅ ALLOWED: Replace entire content arrays to restructure question text
  - ✅ ALLOWED: Any structural changes needed to fix the question
  - **CRITICAL - PRESERVE FRACTION COMPONENTS**: When reorganizing text that contains fractions:
    - ✅ CORRECT: Keep fractions as separate KatexReactComponent objects: [{"text":"...","type":"text"},{"type":"KatexReactComponent","attrs":{"originalString":"\\frac{5}{12}"}},{"text":"...","type":"text"}]
    - ❌ WRONG: Never merge fractions into text nodes: {"text":"...\\frac{5}{12}..."} (this will show as raw LaTeX, not render as fraction)
    - **If the original had a KatexReactComponent, you MUST preserve it as a KatexReactComponent in your replacement**
  - **CRITICAL - KatexReactComponent STRUCTURE**:
    - ✅ CORRECT: {"type":"KatexReactComponent","attrs":{"originalString":"\\frac{5}{12}"}}
    - ❌ WRONG: {"type":"KatexReactComponent","attrs":null,"originalString":"\\frac{5}{12}"} (originalString must be INSIDE attrs, not at top level)
    - ❌ WRONG: {"type":"KatexReactComponent","attrs":null} (attrs cannot be null - must be an object with originalString)
    - ❌ WRONG: {"type":"KatexReactComponent","attrs":{"originalString":"\\frac{5}{12}"},"originalString":"\\frac{5}{12}"} (duplicate originalString - only keep it in attrs)
    - **NEVER set attrs to null for KatexReactComponent** - it must always be: attrs: {originalString: "..."}
    - **NEVER put originalString at the top level** - it must always be inside attrs: attrs.originalString
- **INPUT COMPONENTS (TextFieldReactComponent, DropdownReactComponent)**:
  - ✅ ALLOWED: Value changes in attrs fields (answers, options, answer, explanation, etc.)
    - Example: Change attrs.answers from "[{\"label\":\"B\",...}]" to "[{\"label\":\"A\",...}]" (fixing selected answer)
    - Example: Update attrs.options to correct option labels
  - ❌ BLOCKED: Structural changes (adding/removing components in content arrays)
- **CRITICAL RULES**:
  - ✅ ALLOWED: Any structural changes in question text (paragraphs, headings, text nodes, fractions)
  - ✅ ALLOWED: Remove duplicate option blocks in question text
  - ✅ ALLOWED: Separate merged options in question text
  - ✅ ALLOWED: Add new paragraphs/headings to reorganize question structure
  - ✅ ALLOWED: Move components between paragraphs (e.g., move DropdownReactComponent from one paragraph to another)
  - ✅ ALLOWED: Value changes in input component attrs (answers, options, answer, etc.)
  - ❌ BLOCKED: Structural changes within TextFieldReactComponent or DropdownReactComponent content arrays
  - ❌ BLOCKED: Changing component types (e.g., text -> KatexReactComponent) - but you can add new components
  - ❌ BLOCKED: Removing critical keys ("type", "content", "attrs")
- **Examples**:
  - ✅ ALLOWED: content[0].content: [heading, para1, para2, para3, para4] -> [heading, para1_with_dropdown] (reorganize, move dropdown)
  - ✅ ALLOWED: content[0].content[3].content: [A, B, C, duplicate_B] -> [A, B, C] (remove duplicate in question text)
  - ✅ ALLOWED: content[0].content[5].content: [text1] -> [text1, new_fraction] (add component in question text)
  - ✅ ALLOWED: content[0].content[7].attrs.answers: "[{\"label\":\"B\",...}]" -> "[{\"label\":\"A\",...}]" (change selected answer)
  - ❌ BLOCKED: content[0].content[7].content: [...] -> [...] (if content[7] is TextFieldReactComponent or DropdownReactComponent - structural change)
  - ❌ BLOCKED: Replacing entire objects (modify properties instead)
- **When replacing content arrays in question text**: You can freely reorganize, add, or remove components. Ensure all remaining elements have valid "type" and required fields.

**CRITICAL - WHEN REPLACING CONTENT ARRAYS (STRUCTURAL CHANGES):**
When you replace an entire content array (e.g., content[0].content), you MUST preserve the EXACT structure of all remaining elements:

1. **PRESERVE ALL "attrs" OBJECTS** - Never set them to null or remove them
   - ❌ WRONG: {"type":"heading","attrs":null,"content":[...]}
   - ✅ CORRECT: {"type":"heading","attrs":{"level":3},"content":[...]} (preserve original attrs)
   - If original has {"attrs":{"level":3}}, your replacement MUST also have {"attrs":{"level":3}}

2. **PRESERVE NESTED CONTENT ARRAY STRUCTURE** - Keep them as arrays of objects, not strings
   - ❌ WRONG: {"type":"heading","content":["A. y=28, 12"]} (content is array of strings)
   - ✅ CORRECT: {"type":"heading","content":[{"text":"A. y=28, 12","type":"text"}]} (content is array of objects)
   - If original has [{"text":"...","type":"text"}], your replacement MUST also have [{"text":"...","type":"text"}]

3. **PRESERVE ALL CRITICAL KEYS** - "type", "content", "attrs" must be preserved
   - ❌ WRONG: Removing "attrs" or "content" keys
   - ❌ WRONG: Removing "type" field from ANY component (this breaks rendering completely)
   - ✅ CORRECT: Keep all keys that exist in the original
   - **CRITICAL**: The "type" field is MANDATORY for ALL components - if a component has "type" in the original, it MUST have "type" in your replacement
   - **CRITICAL**: If you're including a DropdownReactComponent, it MUST have {"type":"DropdownReactComponent",...}, not just {...}

4. **PRESERVE COMPONENT TYPES** - Don't change component types
   - ❌ WRONG: Changing {"type":"heading"} to {"type":"paragraph"}
   - ✅ CORRECT: Keep the same type

5. **STRICTLY PRESERVE KatexReactComponent OBJECTS** - Fractions MUST remain as separate KatexReactComponent objects, NEVER merge them into text
   - ❌ WRONG: {"text":"To make one pudding, you need \\frac{5}{12} cup of milk..."} (fraction merged into text - will show as raw LaTeX code, NOT render as fraction)
   - ✅ CORRECT: [{"text":"To make one pudding, you need ","type":"text"},{"type":"KatexReactComponent","attrs":{"originalString":"\\frac{5}{12}"}},{"text":" cup of milk...","type":"text"}] (fraction as separate component - will render properly as fraction)
   - **CRITICAL**: When reorganizing text, if the original had fractions as KatexReactComponent, you MUST keep them as separate KatexReactComponent objects in your replacement
   - **CRITICAL**: Never put LaTeX code (like \\frac{5}{12}) directly in text nodes - it will NOT render as a fraction, it will show as raw text
   - **CRITICAL**: If you need to move text around fractions, keep the KatexReactComponent separate and place text nodes before/after it
   - **CRITICAL**: When replacing content arrays, scan the original for all KatexReactComponent objects and preserve them exactly as they are (don't convert to text)

**Example of CORRECT array replacement:**
- Original element: {"type":"heading","attrs":{"level":3},"content":[{"text":"A. y=28, 12","type":"text"}]}
- If you want to keep this element in the replacement array, provide:
  {"type":"heading","attrs":{"level":3},"content":[{"text":"A. y=28, 12","type":"text"}]}
- DO NOT simplify to: {"type":"heading","attrs":null,"content":["A. y=28, 12"]}

**When removing elements from arrays:**
- Only remove the elements you want to eliminate
- Keep ALL other elements with their EXACT original structure (attrs, nested content, etc.)

Your task:
Identify the EXACT JSON paths and values that need to be changed.
- Use dot notation for object properties and [index] for arrays.
- **VERIFY the field exists** in the JSON before identifying it as a change.
- **Provide the EXACT new value**.
- **If the current state already matches the fix, return empty changes array**.

Return ONLY the specific fields that need to change, with their exact paths and values.`;

      const changeResult = await generateObject({
        model,
        schema: ChangeInstructionSchema,
        prompt: changePrompt,
        maxTokens: 4000,
        temperature: 0.1,
      } as any);

      const changeInstructions = changeResult.object as z.infer<
        typeof ChangeInstructionSchema
      >;

      log(
        `Question ${questionId}: Identified ${changeInstructions.changes.length} change(s) to apply`
      );

      // If no changes identified, check if it's because the fix is already applied
      if (changeInstructions.changes.length === 0) {
        log(
          `Question ${questionId}: No changes identified - current state may already match the fix, or the issue may be a false positive`
        );
        // Check if current state already matches the desired fix
        // This could mean: 1) Already fixed, 2) Audit was incorrect, 3) AI couldn't identify the path
        // Don't retry - this is a valid outcome, not an error
        const noChangesError = new Error(
          "No changes identified - current state may already match the fix, or the issue may be a false positive. Marking for review."
        ) as Error & { skipRetry?: boolean };
        noChangesError.skipRetry = true; // Mark this error to skip retries
        throw noChangesError;
      }

      // STEP 2: Apply changes programmatically to a deep clone (preserves structure 100%)
      const fixedObject = deepClone(currentQuestionObject);
      let actualChangesMade = 0;

      // Helper function to check if a path is within an input component
      // Blocks structural changes in TextFieldReactComponent and DropdownReactComponent
      // Allows structural changes in FractionReactComponent
      const isWithinInputComponent = (path: string, obj: any): boolean => {
        const blockedInputComponentTypes = [
          "TextFieldReactComponent",
          "DropdownReactComponent",
        ];

        // Parse the path and check each level to see if we're inside an input component
        const pathParts = path.split(".");

        // Check each segment of the path to see if any parent is an input component
        for (let i = 0; i < pathParts.length; i++) {
          // Build path up to this point
          const currentPathParts = pathParts.slice(0, i + 1);
          let currentPath = currentPathParts.join(".");

          // Handle array indices - check the object at that index
          if (currentPathParts[i] && currentPathParts[i].includes("[")) {
            const match = currentPathParts[i].match(/(\w+)\[(\d+)\]/);
            if (match) {
              const fieldName = match[1];
              const index = parseInt(match[2]);

              // Build path to the array element
              const parentPath = currentPathParts.slice(0, i).join(".");
              currentPath = parentPath
                ? `${parentPath}.${fieldName}[${index}]`
                : `${fieldName}[${index}]`;

              try {
                const currentObj = getNestedValue(obj, currentPath);
                if (
                  currentObj &&
                  typeof currentObj === "object" &&
                  !Array.isArray(currentObj) &&
                  currentObj.type &&
                  blockedInputComponentTypes.includes(currentObj.type)
                ) {
                  return true; // We're inside a blocked input component
                }
              } catch (e) {
                // If we can't check, continue
              }
            }
          } else {
            // Not an array index, check if this path points to an input component
            try {
              const currentObj = getNestedValue(obj, currentPath);
              if (
                currentObj &&
                typeof currentObj === "object" &&
                !Array.isArray(currentObj) &&
                currentObj.type &&
                blockedInputComponentTypes.includes(currentObj.type)
              ) {
                return true; // We're inside a blocked input component
              }
            } catch (e) {
              // If we can't check, continue
            }
          }
        }
        return false;
      };

      // Separate structural changes (array replacements) from field modifications
      // Apply structural changes first, then process field modifications
      const structuralChanges: typeof changeInstructions.changes = [];
      const fieldChanges: typeof changeInstructions.changes = [];

      for (const change of changeInstructions.changes) {
        const pathParts = change.path.split(".");
        const lastField = pathParts[pathParts.length - 1];
        const isContentArray =
          lastField === "content" && !change.path.match(/\[(\d+)\]$/);

        if (isContentArray && Array.isArray(change.newValue)) {
          // This is a structural change - apply it first
          structuralChanges.push(change);
        } else {
          // This is a field modification - process after structural changes
          fieldChanges.push(change);
        }
      }

      // Track paths affected by structural changes
      const structuralChangePaths = new Set<string>();
      for (const change of structuralChanges) {
        structuralChangePaths.add(change.path);
      }

      // Combine changes: structural changes first, then field changes
      const orderedChanges = [...structuralChanges, ...fieldChanges];

      for (const change of orderedChanges) {
        try {
          // Check if this field change targets a component that was removed
          // by a previous structural change
          if (fieldChanges.includes(change)) {
            for (const structuralPath of structuralChangePaths) {
              // Check if this change path is within a structurally changed array
              if (
                change.path.startsWith(structuralPath + ".") ||
                change.path.startsWith(structuralPath + "[")
              ) {
                // This change is within a structurally changed array
                // Check if the path exists in the current object (after structural changes)
                const currentValueCheck = getNestedValue(
                  fixedObject,
                  change.path
                );
                if (currentValueCheck === undefined) {
                  // Path doesn't exist - might have been removed in structural change
                  // Get the original value before structural changes to confirm
                  const originalValue = getNestedValue(
                    currentQuestionObject,
                    change.path
                  );
                  if (originalValue !== undefined) {
                    // Component existed before but doesn't exist now - it was removed
                    log(
                      `Question ${questionId}: Skipping change at ${change.path} - component was removed in structural change at ${structuralPath}. This change targets a component that no longer exists.`
                    );
                    continue; // Skip this change
                  }
                }
              }
            }
          }

          // Get the actual current value
          const currentValue = getNestedValue(fixedObject, change.path);

          // CRITICAL: Validate that the field exists and is correct
          if (currentValue === undefined) {
            // Extract the last field name from the path
            const pathMatch = change.path.match(/\.([^.\[\]]+)$/);
            const lastField = pathMatch
              ? pathMatch[1]
              : change.path
                  .split(/[\.\[\]]+/)
                  .filter((p) => p !== "")
                  .pop();

            // Special case: if trying to add "answer" (singular) to attrs that has "answers" (plural), reject it
            if (lastField === "answer" && change.path.includes(".attrs.")) {
              const attrsPath = change.path.replace(/\.[^.]*$/, ""); // Get path to attrs
              const attrsValue = getNestedValue(fixedObject, attrsPath);
              // Check if attrsValue is null/undefined before using 'in' operator
              if (
                attrsValue !== null &&
                attrsValue !== undefined &&
                typeof attrsValue === "object" &&
                !Array.isArray(attrsValue) &&
                "answers" in attrsValue
              ) {
                throw new Error(
                  `Invalid field: Component uses "answers" (plural), not "answer" (singular). Path: ${change.path}. Use "answers" instead.`
                );
              }
            }

            // For other cases, check if parent exists and is not null
            const segments = change.path.split(".");
            const parentPath = segments.slice(0, -1).join(".");
            if (parentPath) {
              const parentValue = getNestedValue(fixedObject, parentPath);
              if (parentValue === undefined) {
                throw new Error(
                  `Field does not exist at path ${change.path}. Parent path ${parentPath} does not exist. Cannot add new fields - only modify existing ones.`
                );
              }
              if (parentValue === null) {
                throw new Error(
                  `Field does not exist at path ${change.path}. Parent path ${parentPath} is null (component was removed). Cannot modify removed components.`
                );
              }
            }

            // Parent exists but field doesn't - this might be okay for some cases, but log it
            log(
              `Question ${questionId}: Warning - field ${lastField} does not exist at ${change.path}, but parent exists. Proceeding with caution.`
            );
          }

          // Check if the change would actually modify anything
          if (
            JSON.stringify(currentValue) === JSON.stringify(change.newValue)
          ) {
            log(
              `Question ${questionId}: Skipping change at ${change.path} - new value matches current value (already correct)`
            );
            continue; // Skip this change - already correct
          }

          // Verify the old value matches what AI expected (with tolerance for formatting)
          if (
            currentValue !== undefined &&
            JSON.stringify(currentValue) !== JSON.stringify(change.oldValue)
          ) {
            log(
              `Question ${questionId}: Warning - oldValue mismatch at ${change.path}. Expected: ${JSON.stringify(change.oldValue)}, Found: ${JSON.stringify(currentValue)}`
            );
            // Continue anyway - might be a formatting difference, or AI misread the state
          }

          // Strict type enforcement: If original is string and new is number, auto-convert
          if (
            typeof currentValue === "string" &&
            typeof change.newValue === "number"
          ) {
            log(
              `Question ${questionId}: Warning - type mismatch at ${change.path}. Auto-converting number ${change.newValue} to string.`
            );
            change.newValue = String(change.newValue);

            // Check if original was double-quoted JSON string (e.g. "\"180\"")
            if (
              currentValue.startsWith('"') &&
              currentValue.endsWith('"') &&
              !change.newValue.startsWith('"')
            ) {
              change.newValue = JSON.stringify(change.newValue);
              log(
                `Question ${questionId}: Auto-formatted to JSON string: ${change.newValue}`
              );
            }
          }

          // CRITICAL: Reject attempts to "remove" components by setting critical fields to empty/whitespace strings
          // This breaks UI rendering. Components should be removed from arrays, not set to empty.
          // EXCEPTION: Allow empty originalString for KatexReactComponent containing fractions (can be safely removed)
          if (typeof change.newValue === "string") {
            const pathParts = change.path.split(".");
            const fieldName = pathParts[pathParts.length - 1];

            // Critical fields that should never be set to empty or whitespace-only (breaks rendering)
            const criticalFields = [
              "originalString", // KatexReactComponent - empty breaks rendering (except for fractions)
              "text", // Text nodes - empty breaks structure
              "answer", // Answer fields - empty is invalid
              "answers", // Dropdown answers - empty is invalid
            ];

            if (criticalFields.includes(fieldName)) {
              // Check for empty string or whitespace-only strings
              const trimmedValue = change.newValue.trim();
              if (trimmedValue === "" || change.newValue === '""') {
                // EXCEPTION: Allow empty originalString for KatexReactComponent if it contains a fraction
                // Fractions can be safely removed without breaking structure
                if (
                  fieldName === "originalString" &&
                  currentValue !== undefined
                ) {
                  const currentValueStr =
                    typeof currentValue === "string"
                      ? currentValue
                      : String(currentValue);
                  // Check if current value contains a fraction pattern: \frac{...}{...}
                  const fractionPattern = /\\frac\{[^}]+\}\{[^}]+\}/;
                  if (fractionPattern.test(currentValueStr)) {
                    log(
                      `Question ${questionId}: Allowing empty originalString for fraction component at ${change.path} (fractions can be safely removed)`
                    );
                    // Allow this - skip the error
                  } else {
              throw new Error(
                      `Cannot set critical field '${fieldName}' to empty or whitespace-only string at ${change.path}. Setting critical component fields to empty/whitespace breaks UI rendering. If you need to remove a component, it must be done through structural changes (not supported). Mark this fix for manual review.`
                    );
                  }
                } else {
                  throw new Error(
                    `Cannot set critical field '${fieldName}' to empty or whitespace-only string at ${change.path}. Setting critical component fields to empty/whitespace breaks UI rendering. If you need to remove a component, it must be done through structural changes (not supported). Mark this fix for manual review.`
                  );
                }
              } else if (
                fieldName === "originalString" &&
                trimmedValue !== ""
              ) {
                // Validate fraction format if the new value contains fractions
                const fractionPattern = /\\frac\{[^}]+\}\{[^}]+\}/;
                if (fractionPattern.test(change.newValue)) {
                  // Validate LaTeX fraction format: \frac{numerator}{denominator}
                  // Check for properly escaped braces and valid structure
                  const validFractionPattern = /\\frac\{[^}]+\}\{[^}]+\}/;
                  const matches = change.newValue.match(
                    new RegExp(validFractionPattern.source, "g")
                  );
                  if (matches) {
                    for (const match of matches) {
                      // Verify the fraction has both numerator and denominator
                      const fractionMatch = match.match(
                        /\\frac\{([^}]+)\}\{([^}]+)\}/
                      );
                      if (
                        !fractionMatch ||
                        !fractionMatch[1] ||
                        !fractionMatch[2]
                      ) {
                        log(
                          `Question ${questionId}: Warning - Invalid fraction format at ${change.path}: ${match}. Expected format: \\frac{numerator}{denominator}`
                        );
                      }
                    }
                  }
                }
              }
            }
          }

          // Validate that newValue is not undefined before processing
          if (change.newValue === undefined) {
            throw new Error(
              `Invalid change instruction at path ${change.path}: newValue is undefined. The AI must provide a valid value for this change. This is likely an AI error in generating the fix.`
            );
          }

          // ALLOW structural changes (removing components, replacing arrays) but validate them
          // The AI can now remove duplicate/extraneous components or replace content arrays
          if (currentValue !== undefined) {
            const isCurrentArray = Array.isArray(currentValue);
            const isCurrentObject =
              typeof currentValue === "object" &&
              currentValue !== null &&
              !Array.isArray(currentValue);
            const isNewArray = Array.isArray(change.newValue);
            const isNewObject =
              typeof change.newValue === "object" &&
              change.newValue !== null &&
              !Array.isArray(change.newValue);
            const isNewString = typeof change.newValue === "string";

            // Allow replacing arrays/objects (structural changes) - will be validated later
            if (
              (isCurrentArray || isCurrentObject) &&
              (isNewArray || isNewObject)
            ) {
              const pathParts = change.path.split(".");
              const lastField = pathParts[pathParts.length - 1];

              // Block adding components to empty arrays ONLY in input components
              // Allow adding to empty arrays in question text (e.g., filling empty paragraphs/headings)
              if (
                isCurrentArray &&
                isNewArray &&
                currentValue.length === 0 &&
                change.newValue.length > 0
              ) {
                // Check if this path is within an input component
                const inInputComponent = isWithinInputComponent(
                  change.path,
                  fixedObject
                );

                if (inInputComponent) {
                  // Block adding to empty arrays in input components
                  throw new Error(
                    `Cannot add components to empty array at ${change.path}. This is a structural change (adding components) in an input component. Modify existing components instead, or mark for manual review.`
                  );
                }
                // Allow adding to empty arrays in question text - this is a valid fix (filling empty blocks)
              }

              // Allow replacing content arrays ONLY within question text (paragraphs, headings)
              // STRICTLY BLOCK structural changes within input components
              const jsonStringFields = ["answers", "options"];
              if (!jsonStringFields.includes(lastField)) {
                // Check if this is replacing an entire structural array (like 'content' arrays)
                // Paths ending with 'content' (not indexed) indicate structural array replacement
                const isContentArray =
                  lastField === "content" && !change.path.match(/\[(\d+)\]$/);

                if (isContentArray) {
                  // Check if this path is within an input component
                  // Structural changes are ONLY allowed in question text (paragraphs, headings)
                  // NOT allowed in input components (TextFieldReactComponent, DropdownReactComponent, FractionReactComponent)
                  if (isWithinInputComponent(change.path, fixedObject)) {
                    throw new Error(
                      `Cannot make structural changes (replace content array) within input components (TextFieldReactComponent, DropdownReactComponent) at ${change.path}. Structural changes are allowed in question text (paragraphs, headings) and FractionReactComponent. Mark this fix for manual review.`
                    );
                  }

                  // PRE-VALIDATION: Check structure before applying
                  // Auto-parse stringified JSON if detected
                  let newValueArray = change.newValue;
                  if (Array.isArray(newValueArray)) {
                    // Filter out null/undefined values first - they break structure
                    const filteredArray = newValueArray.filter(
                      (item: any) => item !== null && item !== undefined
                    );
                    if (filteredArray.length !== newValueArray.length) {
                      log(
                        `Question ${questionId}: Filtered out ${newValueArray.length - filteredArray.length} null/undefined value(s) from content array at ${change.path}`
                      );
                    }
                    newValueArray = filteredArray;

                    // Check and auto-parse stringified objects in the array
                    newValueArray = newValueArray.map((item: any) => {
                      if (typeof item === "string") {
                        try {
                          // Try to parse if it looks like JSON
                          const parsed = JSON.parse(item);
                          if (typeof parsed === "object" && parsed !== null) {
                            log(
                              `Question ${questionId}: Auto-parsed stringified JSON object in content array at ${change.path}`
                            );
                            return parsed;
                          }
                        } catch (e) {
                          // Not JSON, keep as string
                        }
                      }
                      // Check if attrs is stringified
                      if (
                        item &&
                        typeof item === "object" &&
                        typeof item.attrs === "string"
                      ) {
                        try {
                          item.attrs = JSON.parse(item.attrs);
                          log(
                            `Question ${questionId}: Auto-parsed stringified attrs in content array element at ${change.path}`
                          );
                        } catch (e) {
                          // Keep as string if parsing fails
                        }
                      }
                      // Check if content array elements are stringified
                      if (
                        item &&
                        Array.isArray(item.content) &&
                        item.content.length > 0
                      ) {
                        item.content = item.content.map((contentItem: any) => {
                          if (typeof contentItem === "string") {
                            try {
                              const parsed = JSON.parse(contentItem);
                              if (
                                typeof parsed === "object" &&
                                parsed !== null
                              ) {
                                log(
                                  `Question ${questionId}: Auto-parsed stringified content element at ${change.path}`
                                );
                                return parsed;
                              }
                            } catch (e) {
                              // Not JSON, keep as string
                            }
                          }
                          return contentItem;
                        });
                      }
                      return item;
                    });

                    // Auto-fix all KatexReactComponent structure issues in the array
                    const fixKatexComponents = (arr: any[]): void => {
                      for (const item of arr) {
                        if (
                          item &&
                          typeof item === "object" &&
                          item.type === "KatexReactComponent"
                        ) {
                          // Fix: If attrs is null but originalString exists at top level, move it to attrs
                          if (
                            (item.attrs === null || item.attrs === undefined) &&
                            item.originalString
                          ) {
                            item.attrs = {
                              originalString: item.originalString,
                            };
                            delete item.originalString;
                            log(
                              `Question ${questionId}: Auto-fixed KatexReactComponent in array at ${change.path} - moved originalString from top level to attrs`
                            );
                          }
                          // Fix: If originalString is duplicated, remove top level
                          if (
                            item.attrs?.originalString &&
                            item.originalString
                          ) {
                            delete item.originalString;
                            log(
                              `Question ${questionId}: Auto-fixed KatexReactComponent in array at ${change.path} - removed duplicate originalString from top level`
                            );
                          }
                          // Fix: If attrs is null and no originalString, try to get from currentValue
                          if (
                            (item.attrs === null || item.attrs === undefined) &&
                            !item.originalString
                          ) {
                            // Try to find matching original element
                            const originalKatex = Array.isArray(currentValue)
                              ? currentValue.find(
                                  (orig: any) =>
                                    orig !== null &&
                                    orig !== undefined &&
                                    typeof orig === "object" &&
                                    orig.type === "KatexReactComponent" &&
                                    orig.attrs?.originalString
                                )
                              : null;
                            if (originalKatex?.attrs?.originalString) {
                              item.attrs = {
                                originalString:
                                  originalKatex.attrs.originalString,
                              };
                              log(
                                `Question ${questionId}: Auto-fixed KatexReactComponent in array at ${change.path} - created attrs from original`
                              );
                            }
                          }
                        }
                        // Recursively fix nested content arrays
                        if (
                          item &&
                          typeof item === "object" &&
                          Array.isArray(item.content)
                        ) {
                          fixKatexComponents(item.content);
                        }
                      }
                    };

                    fixKatexComponents(newValueArray);

                    // Update the change with parsed values
                    change.newValue = newValueArray;
                  }

                  // Validate structure preservation for each element
                  if (
                    Array.isArray(newValueArray) &&
                    Array.isArray(currentValue)
                  ) {
                    for (let i = 0; i < newValueArray.length; i++) {
                      const newElement = newValueArray[i];
                      if (!newElement || typeof newElement !== "object") {
                        continue; // Skip validation for non-objects
                      }

                      // Find corresponding original element by type and position
                      let originalElement: any = null;
                      if (i < currentValue.length) {
                        // Check if currentValue[i] is null (removed by previous structural change)
                        if (
                          currentValue[i] === null ||
                          currentValue[i] === undefined
                        ) {
                          // Element was removed - skip validation for this element
                          // The AI is trying to modify a removed component, which is invalid
                          throw new Error(
                            `Cannot modify element at ${change.path}[${i}] - this element was removed (set to null) by a previous structural change. If you need to modify this component, ensure it exists in the replacement array.`
                          );
                        }
                        // Try to match by position first
                        if (
                          currentValue[i] &&
                          typeof currentValue[i] === "object" &&
                          currentValue[i].type === newElement.type
                        ) {
                          originalElement = currentValue[i];
                        } else {
                          // Try to find by type elsewhere (skip null values)
                          originalElement = currentValue.find(
                            (orig: any) =>
                              orig !== null &&
                              orig !== undefined &&
                              typeof orig === "object" &&
                              orig.type === newElement.type
                          );
                        }
                      }

                      if (originalElement) {
                        // Auto-fix attrs if missing/null but original has it
                        if (
                          originalElement.attrs !== undefined &&
                          originalElement.attrs !== null &&
                          typeof originalElement.attrs === "object"
                        ) {
                          // Original has object attrs
                          if (typeof newElement.attrs === "string") {
                            // Try to parse stringified attrs
                            try {
                              newElement.attrs = JSON.parse(newElement.attrs);
                              log(
                                `Question ${questionId}: Auto-parsed stringified attrs at ${change.path}[${i}]`
                              );
                            } catch (e) {
                              throw new Error(
                                `Invalid structure at ${change.path}[${i}]: 'attrs' is stringified (provided as JSON string). Original has object attrs (e.g., {"level":3}), but new value has string attrs. Preserve the exact structure - attrs must remain an object, not a JSON string. Provide: {"attrs":{"level":3}} not {"attrs":"{\\"level\\":3}"}.`
                              );
                            }
                          }
                          if (
                            newElement.attrs === null ||
                            newElement.attrs === undefined
                          ) {
                            // Auto-fix: Copy attrs from original
                            newElement.attrs = deepClone(originalElement.attrs);
                            log(
                              `Question ${questionId}: Auto-fixed missing attrs at ${change.path}[${i}] by copying from original (${JSON.stringify(originalElement.attrs)})`
                            );
                          } else if (typeof newElement.attrs !== "object") {
                            throw new Error(
                              `Invalid structure at ${change.path}[${i}]: 'attrs' type mismatch. Original has object attrs, but new has ${typeof newElement.attrs}. Preserve the exact structure.`
                            );
                          }
                        }

                        // Validate content array structure preservation
                        if (
                          originalElement.content &&
                          Array.isArray(originalElement.content)
                        ) {
                          if (
                            newElement.content &&
                            Array.isArray(newElement.content)
                          ) {
                            // Check if content elements are strings (need to convert to objects)
                            if (
                              newElement.content.length > 0 &&
                              typeof newElement.content[0] === "string"
                            ) {
                              // Auto-fix: Convert strings to objects by matching with original structure
                              const fixedContent: any[] = [];
                              for (
                                let j = 0;
                                j < newElement.content.length;
                                j++
                              ) {
                                const contentItem: any = newElement.content[j];

                                // Skip null values - they break structure
                                if (
                                  contentItem === null ||
                                  contentItem === undefined
                                ) {
                                  log(
                                    `Question ${questionId}: Skipping null/undefined value in content array at ${change.path}[${i}].content[${j}]`
                                  );
                                  continue;
                                }

                                if (typeof contentItem === "string") {
                                  // Check if it looks like a fraction (LaTeX format or simple fraction)
                                  const isFraction =
                                    /\\frac\{[^}]+\}\{[^}]+\}/.test(
                                      contentItem
                                    ) || /^\d+\/\d+$/.test(contentItem);

                                  // Try to find matching original content element
                                  let originalContentItem: any = null;
                                  if (j < originalElement.content.length) {
                                    originalContentItem =
                                      originalElement.content[j];
                                    // If types don't match but it's a fraction, look for KatexReactComponent
                                    if (
                                      isFraction &&
                                      originalContentItem &&
                                      originalContentItem.type !==
                                        "KatexReactComponent"
                                    ) {
                                      const fractionComponent =
                                        originalElement.content.find(
                                          (orig: any) =>
                                            orig !== null &&
                                            orig !== undefined &&
                                            typeof orig === "object" &&
                                            orig.type ===
                                              "KatexReactComponent" &&
                                            orig.attrs?.originalString ===
                                              contentItem
                                        );
                                      if (fractionComponent) {
                                        originalContentItem = fractionComponent;
                                      }
                                    }
                                  } else {
                                    // Try to find by matching text, originalString, or fraction pattern
                                    originalContentItem =
                                      originalElement.content.find(
                                        (orig: any) =>
                                          orig !== null &&
                                          orig !== undefined &&
                                          typeof orig === "object" &&
                                          (orig.text === contentItem ||
                                            orig.attrs?.originalString ===
                                              contentItem ||
                                            (isFraction &&
                                              orig.type ===
                                                "KatexReactComponent" &&
                                              orig.attrs?.originalString?.includes(
                                                contentItem
                                              )))
                                      );
                                  }

                                  // If it's a fraction and no match found, create KatexReactComponent
                                  if (
                                    isFraction &&
                                    (!originalContentItem ||
                                      originalContentItem.type !==
                                        "KatexReactComponent")
                                  ) {
                                    fixedContent.push({
                                      type: "KatexReactComponent",
                                      attrs: {
                                        originalString: contentItem,
                                      },
                                    });
                                    log(
                                      `Question ${questionId}: Auto-created KatexReactComponent for fraction string "${contentItem}" at ${change.path}[${i}].content[${j}]`
                                    );
                                  } else if (
                                    originalContentItem &&
                                    typeof originalContentItem === "object"
                                  ) {
                                    // Copy structure from original, update text/originalString
                                    const fixedItem: any =
                                      deepClone(originalContentItem);
                                    if (fixedItem.type === "text") {
                                      fixedItem.text = contentItem;
                                    } else if (
                                      fixedItem.type ===
                                        "KatexReactComponent" &&
                                      fixedItem.attrs
                                    ) {
                                      fixedItem.attrs.originalString =
                                        contentItem;
                                    }
                                    fixedContent.push(fixedItem);
                                  } else {
                                    // Fallback: Create text object
                                    fixedContent.push({
                                      type: "text",
                                      text: contentItem,
                                    });
                                  }
                                } else if (
                                  typeof contentItem === "object" &&
                                  contentItem !== null
                                ) {
                                  // Auto-fix KatexReactComponent structure issues
                                  if (
                                    contentItem.type === "KatexReactComponent"
                                  ) {
                                    // Fix: If attrs is null but originalString exists at top level, move it to attrs
                                    if (
                                      (contentItem.attrs === null ||
                                        contentItem.attrs === undefined) &&
                                      contentItem.originalString
                                    ) {
                                      contentItem.attrs = {
                                        originalString:
                                          contentItem.originalString,
                                      };
                                      delete contentItem.originalString;
                                      log(
                                        `Question ${questionId}: Auto-fixed KatexReactComponent at ${change.path}[${i}].content[${j}] - moved originalString from top level to attrs`
                                      );
                                    }
                                    // Fix: If originalString is duplicated (both in attrs and top level), remove top level
                                    if (
                                      contentItem.attrs?.originalString &&
                                      contentItem.originalString
                                    ) {
                                      delete contentItem.originalString;
                                      log(
                                        `Question ${questionId}: Auto-fixed KatexReactComponent at ${change.path}[${i}].content[${j}] - removed duplicate originalString from top level`
                                      );
                                    }
                                    // Fix: If attrs is null and no originalString, create proper attrs structure
                                    if (
                                      (contentItem.attrs === null ||
                                        contentItem.attrs === undefined) &&
                                      !contentItem.originalString
                                    ) {
                                      // Try to find originalString from original element
                                      const originalKatex =
                                        originalElement.content.find(
                                          (orig: any) =>
                                            orig !== null &&
                                            orig !== undefined &&
                                            typeof orig === "object" &&
                                            orig.type === "KatexReactComponent"
                                        );
                                      if (
                                        originalKatex?.attrs?.originalString
                                      ) {
                                        contentItem.attrs = {
                                          originalString:
                                            originalKatex.attrs.originalString,
                                        };
                                        log(
                                          `Question ${questionId}: Auto-fixed KatexReactComponent at ${change.path}[${i}].content[${j}] - created attrs from original`
                                        );
                                      } else {
                                        // Can't fix - reject it
                                        throw new Error(
                                          `Invalid KatexReactComponent at ${change.path}[${i}].content[${j}]: attrs is null and no originalString provided. KatexReactComponent must have attrs: {originalString: "..."}.`
                                        );
                                      }
                                    }
                                  }
                                  // Already an object, keep it (but validate it's not null)
                                  fixedContent.push(contentItem);
                                }
                                // Skip null/undefined (already handled above)
                              }
                              newElement.content = fixedContent;
                              log(
                                `Question ${questionId}: Auto-fixed content array at ${change.path}[${i}].content by converting strings to objects`
                              );
                            }
                          }
                        }

                        // Auto-fix KatexReactComponent structure issues at element level
                        if (newElement.type === "KatexReactComponent") {
                          // Fix: If attrs is null but originalString exists at top level, move it to attrs
                          if (
                            (newElement.attrs === null ||
                              newElement.attrs === undefined) &&
                            newElement.originalString
                          ) {
                            newElement.attrs = {
                              originalString: newElement.originalString,
                            };
                            delete newElement.originalString;
                            log(
                              `Question ${questionId}: Auto-fixed KatexReactComponent at ${change.path}[${i}] - moved originalString from top level to attrs`
                            );
                          }
                          // Fix: If originalString is duplicated (both in attrs and top level), remove top level
                          if (
                            newElement.attrs?.originalString &&
                            newElement.originalString
                          ) {
                            delete newElement.originalString;
                            log(
                              `Question ${questionId}: Auto-fixed KatexReactComponent at ${change.path}[${i}] - removed duplicate originalString from top level`
                            );
                          }
                          // Validate: KatexReactComponent must have proper attrs structure
                          if (
                            newElement.attrs === null ||
                            newElement.attrs === undefined
                          ) {
                            // Try to get from original element
                            if (
                              originalElement &&
                              originalElement.type === "KatexReactComponent" &&
                              originalElement.attrs?.originalString
                            ) {
                              newElement.attrs = {
                                originalString:
                                  originalElement.attrs.originalString,
                              };
                              log(
                                `Question ${questionId}: Auto-fixed KatexReactComponent at ${change.path}[${i}] - created attrs from original element`
                              );
                            } else {
                              throw new Error(
                                `Invalid KatexReactComponent at ${change.path}[${i}]: attrs is null. KatexReactComponent must have attrs: {originalString: "..."}. Never set attrs to null.`
                              );
                            }
                          }
                        }

                        // Validate component type preservation
                        // Check for null values before accessing properties
                        if (
                          originalElement &&
                          newElement &&
                          originalElement.type !== newElement.type
                        ) {
                          throw new Error(
                            `Invalid structure at ${change.path}[${i}]: Component type changed from "${originalElement.type}" to "${newElement.type}". Preserve the exact component type.`
                          );
                        }
                      }
                    }
                  }

                  // Allow replacing content arrays in question text - structure validated above
                  log(
                    `Question ${questionId}: Allowing structural change - replacing content array at ${change.path} (within question text, structure validated)`
                  );
                  // Continue - validation will happen after all changes are applied
                }

                // Block replacing entire objects (too risky - could break structure)
                if (isCurrentObject && isNewObject) {
                  throw new Error(
                    `Cannot replace entire object at ${change.path}. This is a structural change. Modify individual properties instead. Mark this fix for manual review.`
                  );
                }
              }
            }

            // Prevent stringifying entire arrays/objects (structural change)
            // Exception: Some fields like 'answers' and 'options' are legitimately stored as JSON strings
            if ((isCurrentArray || isCurrentObject) && isNewString) {
              // Check if this is a field that's expected to be a JSON string (like 'answers', 'options')
              const pathParts = change.path.split(".");
              const lastField = pathParts[pathParts.length - 1];
              const jsonStringFields = ["answers", "options"]; // Fields that are legitimately JSON strings

              // If it's not a known JSON string field, check if it's trying to stringify a structure
              if (!jsonStringFields.includes(lastField)) {
                try {
                  const parsed = JSON.parse(change.newValue);
                  // If parsed value is still an object/array, this is stringification of structure
                  if (typeof parsed === "object" && parsed !== null) {
                    throw new Error(
                      `Cannot stringify entire ${isCurrentArray ? "array" : "object"} at ${change.path}. This is a structural change. Modify individual fields within the ${isCurrentArray ? "array" : "object"} instead, not the entire structure. Mark this fix for manual review.`
                    );
                  }
                } catch (parseError) {
                  // If it's not valid JSON, it might be a regular string - but if current is array/object, this is still wrong
                  throw new Error(
                    `Type mismatch at ${change.path}: Cannot replace ${isCurrentArray ? "array" : "object"} with string "${change.newValue.substring(0, 50)}${change.newValue.length > 50 ? "..." : ""}". This is a structural change. Modify individual fields instead. Mark this fix for manual review.`
                  );
                }
              }
            }
          }

          // Final validation: Check if the target path exists and is not null before applying
          // This prevents errors when trying to modify components that were removed (set to null)
          if (currentValue === null) {
            throw new Error(
              `Cannot modify field at path ${change.path} - the component at this path is null (was removed). If you need to modify this component, ensure it exists in the replacement array.`
            );
          }

          // Validate that newValue is not undefined
          if (change.newValue === undefined) {
            throw new Error(
              `Cannot apply change at path ${change.path} - newValue is undefined. The AI must provide a valid value for this change. This is likely an AI error in generating the fix.`
            );
          }

          // Apply the change
          setNestedValue(fixedObject, change.path, change.newValue);
          actualChangesMade++;
          log(
            `Question ${questionId}: Applied change at ${change.path}: ${JSON.stringify(currentValue)} -> ${JSON.stringify(change.newValue)}`
          );
        } catch (error: any) {
          throw new Error(
            `Failed to apply change at path ${change.path}: ${error.message}`
          );
        }
      }

      // Check if any actual changes were made
      if (actualChangesMade === 0) {
        log(
          `Question ${questionId}: No actual changes made - all identified changes were already applied`
        );
        const noChangesError = new Error(
          "No actual changes were made - the current state already matches the desired fix. This may indicate the issue was already resolved or is a false positive."
        ) as Error & { skipRetry?: boolean };
        noChangesError.skipRetry = true; // Don't retry - this is a valid outcome
        throw noChangesError;
      }

      log(
        `Question ${questionId}: Fix applied. ${actualChangesMade} actual change(s) made. Changes: ${changeInstructions.changesMade.join(", ")}`
      );

      // STEP 2.5: Post-generation validation - check if all parts of suggestedFix were addressed
      const fixParts = suggestedFix
        .split(/\d+\./)
        .filter((p) => p.trim())
        .map((p) => p.trim().toLowerCase());
      const changesMadeLower = changeInstructions.changesMade
        .join(" ")
        .toLowerCase();

      for (const part of fixParts) {
        // Check if this part mentions "add" or "provide" absolute values
        const addMatch = part.match(
          /\b(add|provide)\s+(?:the\s+)?(?:absolute\s+)?(?:distance|value|amount|number)\s+(?:for|of)\s+(\w+)/i
        );
        if (addMatch) {
          const target = addMatch[2];
          // Check if we actually added/provided this value
          if (!changesMadeLower.includes(target.toLowerCase())) {
            log(
              `Question ${questionId}: Warning - Fix part "${part}" may not be fully addressed. Target "${target}" not found in changes made.`
            );
          }
        }

        // Check if part mentions "add" with "input field" or "component"
        const addComponentMatch = part.match(
          /\badd\s+(?:an?\s+)?(?:input\s+field|textfield|component)/i
        );
        if (addComponentMatch) {
          log(
            `Question ${questionId}: Warning - Fix part "${part}" requires adding components, which requires structural changes. This may not be fully addressed.`
          );
        }
      }

      // STEP 3: Validate structural changes (allows removals and array replacements but ensures integrity)
      const structureValidation = validateStructuralChange(
        currentQuestionObject,
        fixedObject
      );
      if (!structureValidation.isValid) {
        throw new Error(
          `Invalid structural change: ${structureValidation.error}. Structural changes must preserve critical keys and types.`
        );
      }
      if (
        structureValidation.warnings &&
        structureValidation.warnings.length > 0
      ) {
        log(
          `Question ${questionId}: ⚠ Structural change warnings: ${structureValidation.warnings.join("; ")}`
        );
      }

      return fixedObject;
    } catch (error: any) {
      // Don't retry if error is marked to skip retries (e.g., "no changes needed")
      if (error.skipRetry) {
        throw error;
      }

      if (attempt < maxRetries) {
        previousError = error.message; // Store error for next attempt
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        log(
          `Question ${questionId}: Fix generation retry (${attempt}/${maxRetries}): ${error.message}. Waiting ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        // Continue loop with error context
        continue;
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded for fix generation");
}

export async function verifyFix(
  questionId: number,
  originalQuestionObject: any,
  fixedQuestionObject: any,
  issueDescription: string,
  suggestedFix: string
): Promise<{
  isFixCorrect: boolean;
  verificationNotes?: string;
  critiques?: string[];
  suggestions?: string[];
}> {
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      log(
        `Question ${questionId}: Verifying fix (attempt ${attempt}/${maxRetries})...`
      );

      // Generate simplified structures for comparison
      const originalSimplified = simplifyStructure(
        originalQuestionObject?.content || []
      );
      const fixedSimplified = simplifyStructure(
        fixedQuestionObject?.content || []
      );

      const prompt = `You are verifying a fix applied to a math question.

Question ID: ${questionId}

Original Question Object (with issue):
${JSON.stringify(originalQuestionObject, null, 2)}

Original Question Structure (Layout):
${JSON.stringify(originalSimplified, null, 2)}

Fixed Question Object:
${JSON.stringify(fixedQuestionObject, null, 2)}

Fixed Question Structure (Layout):
${JSON.stringify(fixedSimplified, null, 2)}

Issue Description (READ THIS FIRST - explains WHAT was wrong and WHY):
${issueDescription}

Suggested Fix (WHAT should be changed - use description above for full context):
${suggestedFix}

IMPORTANT CONTEXT:
- The "Question Structure" shows the visual layout. 'block' means a paragraph/heading, 'input' means a text field, 'dropdown' means a dropdown, 'operator' means a mathematical operator (+, -, ×, ÷, =), 'fraction' means a fraction input component, 'section' means a SegmentReactComponent.
- Questions may have multiple sub-questions or parts, each with separate answer fields.
- Items in different blocks or inputs are VISUALLY SEPARATE.

VERIFICATION CRITERIA - Check for CORRECT FIXES:
1. **Issue is fixed** - verify that the specific issue described is addressed
2. **Structure integrity** - verify that critical keys ("type", "content", "attrs") and types are preserved
3. **No breaking changes** - ensure the question is still renderable and valid
4. **Removals are justified** - if components were removed, verify they were duplicates/extraneous as described in the fix
5. **No additions** - ensure no new components were added (unless explicitly required by the fix)
6. **Separations are correct** - if merged content was separated, verify it's properly split into distinct blocks
7. **Minimal unrelated changes** - verify that unrelated text, options, or fields were not unnecessarily modified

Your task:
1. **Read the Issue Description** to understand what was wrong and why
2. **Read the Suggested Fix** to understand what should be changed
3. Verify that the fix correctly addresses the issue described in the description
4. Check that the fix aligns with both the description and suggested fix
5. Ensure no new issues were introduced
6. Verify that critical structure (types, keys) is preserved and the question is still renderable
7. **If components were removed**: Verify they were duplicates/extraneous as described
8. **If content was separated**: Verify merged options/text are now in distinct blocks
9. **If structural changes were made**: Verify they were necessary and don't break the question
10. If you find unrelated changes that don't address the issue, mark the fix as incorrect

Is the fix correct?`;

      const result = await generateObject({
        model,
        schema: VerificationSchema,
        prompt,
        maxTokens: 2500,
        temperature: 0.1,
      } as any);

      const object = result.object as z.infer<typeof VerificationSchema>;

      if (object.isFixCorrect) {
        log(`Question ${questionId}: ✓ Fix verified as correct`);
        return { isFixCorrect: true };
      } else {
        // Log verification failure with notes
        const notes = object.verificationNotes || "No notes provided";
        log(`Question ${questionId}: ✗ Fix verification failed: ${notes}`);

        // Check if AI provided empty feedback arrays
        if (object.critiques && object.critiques.length === 0) {
          log(
            `Question ${questionId}: Warning - AI provided empty critiques array`
          );
        }
        if (object.suggestions && object.suggestions.length === 0) {
          log(
            `Question ${questionId}: Warning - AI provided empty suggestions array`
          );
        }

        return {
          isFixCorrect: false,
          verificationNotes: object.verificationNotes,
          critiques: object.critiques,
          suggestions: object.suggestions,
        };
      }
    } catch (error: any) {
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        log(
          `Question ${questionId}: Verification retry (${attempt}/${maxRetries}): ${error.message}. Waiting ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded for verification");
}
