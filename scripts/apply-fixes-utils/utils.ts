import { log } from "./logger";

// Dynamic import to avoid circular dependency
let detectFalsePositive: any = null;

// ============================================================================
// HELPER FUNCTIONS FOR TARGETED CHANGES
// ============================================================================

/**
 * Deep clone an object to avoid mutating the original
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Set a value at a nested path in an object
 * Path format: "content[0].content[2].content[1].attrs.answer"
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  // Parse path: split on dots, then handle array indices in brackets
  const parts: (string | number)[] = [];
  const segments = path.split(".");

  for (const segment of segments) {
    // Check if segment contains array index like "content[0]"
    const arrayMatch = segment.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      parts.push(arrayMatch[1]); // property name
      parts.push(parseInt(arrayMatch[2], 10)); // array index
    } else {
      parts.push(segment); // regular property
    }
  }

  let current = obj;

  // Navigate to the parent of the target
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (typeof part === "number") {
      // Array index
      if (!Array.isArray(current) || part < 0 || part >= current.length) {
        throw new Error(
          `Path ${path} is invalid: array index ${part} out of bounds`
        );
      }
      current = current[part];
    } else {
      // Object property
      if (!(part in current)) {
        throw new Error(
          `Path ${path} is invalid: property '${part}' does not exist`
        );
      }
      current = current[part];
    }
  }

  // Set the final value
  const lastPart = parts[parts.length - 1];
  if (typeof lastPart === "number") {
    if (!Array.isArray(current) || lastPart < 0 || lastPart >= current.length) {
      throw new Error(
        `Path ${path} is invalid: array index ${lastPart} out of bounds`
      );
    }
    current[lastPart] = value;
  } else {
    current[lastPart] = value;
  }
}

/**
 * Get a value at a nested path in an object
 */
export function getNestedValue(obj: any, path: string): any {
  // Parse path: split on dots, then handle array indices in brackets
  const parts: (string | number)[] = [];
  const segments = path.split(".");

  for (const segment of segments) {
    // Check if segment contains array index like "content[0]"
    const arrayMatch = segment.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      parts.push(arrayMatch[1]); // property name
      parts.push(parseInt(arrayMatch[2], 10)); // array index
    } else {
      parts.push(segment); // regular property
    }
  }

  let current = obj;

  for (const part of parts) {
    if (typeof part === "number") {
      // Array index
      if (!Array.isArray(current) || part < 0 || part >= current.length) {
        return undefined;
      }
      current = current[part];
    } else {
      // Object property
      if (!(part in current)) {
        return undefined;
      }
      current = current[part];
    }
  }

  return current;
}

// ============================================================================
// QUESTION EXTRACTION (for false positive detection)
// ============================================================================

export function extractQuestionText(questionObject: any): string {
  try {
    if (!questionObject || !questionObject.content) return "";

    const extractText = (content: any[]): string => {
      let text = "";
      for (const item of content) {
        if (item.type === "text" && item.text) {
          text += item.text;
        } else if (item.type === "KatexReactComponent") {
          if (item.attrs?.originalString) {
            let content = item.attrs.originalString;
            // Handle mixed numbers FIRST: 3\frac{1}{12} -> (3 + 1/12)
            content = content.replace(
              /(\d+)\\frac\{([^}]+)\}\{([^}]+)\}/g,
              "($1 + $2/$3)"
            );
            // Handle LaTeX fractions
            content = content.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2");
            content = content.replace(/\\\\div/g, "÷");
            content = content.replace(/\\\\times/g, "×");
            text += content;
          }
        } else if (item.type === "heading" || item.type === "paragraph") {
          if (item.content) {
            const innerText = extractText(item.content).trim();
            if (innerText) {
              text += "\n" + innerText + "\n";
            }
          }
        } else if (item.type === "SegmentReactComponent" && item.content) {
          text += extractText(item.content);
        } else if (item.content && Array.isArray(item.content)) {
          text += extractText(item.content);
        }
      }
      return text;
    };

    return extractText(questionObject.content)
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  } catch (error) {
    return "";
  }
}

export function extractAnswer(questionObject: any): string {
  try {
    const answers: string[] = [];

    const findAnswers = (content: any[]): void => {
      for (const item of content) {
        if (item.type === "TextFieldReactComponent" && item.attrs?.answer) {
          let answer = item.attrs.answer;
          // Remove quotes if present
          if (answer.startsWith('"') && answer.endsWith('"')) {
            answer = answer.slice(1, -1);
          }
          if (answer) answers.push(answer);
        } else if (
          item.type === "DropdownReactComponent" &&
          item.attrs?.answers
        ) {
          try {
            const ansArray = JSON.parse(item.attrs.answers);
            if (Array.isArray(ansArray) && ansArray.length > 0) {
              ansArray.forEach((ans: any) => {
                if (ans.label) answers.push(ans.label);
              });
            }
          } catch (e) {
            // If not JSON, treat as string
            if (item.attrs.answers) answers.push(item.attrs.answers);
          }
        } else if (
          item.type === "FractionReactComponent" &&
          item.attrs?.answer
        ) {
          let answer = item.attrs.answer;
          answer = answer.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2");
          answer = answer.replace(
            /(\d+)\\frac\{([^}]+)\}\{([^}]+)\}/g,
            "$1 $2/$3"
          );
          if (answer) answers.push(answer);
        } else if (item.content && Array.isArray(item.content)) {
          findAnswers(item.content);
        }
      }
    };

    if (questionObject.content) {
      findAnswers(questionObject.content);
    }

    return answers.join(", ");
  } catch (error) {
    return "";
  }
}

export function extractExplanation(questionObject: any): string {
  try {
    const explanations: string[] = [];

    const findExplanations = (content: any[]): void => {
      for (const item of content) {
        if (
          item.type === "TextFieldReactComponent" &&
          item.attrs?.explanation
        ) {
          try {
            const exp = JSON.parse(item.attrs.explanation);
            const val = exp || item.attrs.explanation;
            if (val) explanations.push(val);
          } catch (e) {
            const val = item.attrs.explanation;
            if (val) explanations.push(val);
          }
        } else if (
          item.type === "DropdownReactComponent" &&
          item.attrs?.explanation
        ) {
          try {
            const exp = JSON.parse(item.attrs.explanation);
            const val = exp || item.attrs.explanation;
            if (val) explanations.push(val);
          } catch (e) {
            const val = item.attrs.explanation;
            if (val) explanations.push(val);
          }
        } else if (
          item.type === "FractionReactComponent" &&
          item.attrs?.explanation
        ) {
          try {
            const exp = JSON.parse(item.attrs.explanation);
            const val = exp || item.attrs.explanation;
            if (val) explanations.push(val);
          } catch (e) {
            const val = item.attrs.explanation;
            if (val) explanations.push(val);
          }
        } else if (item.content && Array.isArray(item.content)) {
          findExplanations(item.content);
        }
      }
    };

    if (questionObject.content) {
      findExplanations(questionObject.content);
    }

    return explanations.join(" ");
  } catch (error) {
    return "";
  }
}

export function extractOptions(
  questionObject: any
): Array<{ id: string; label: string }> {
  try {
    const options: Array<{ id: string; label: string }> = [];

    const findOptions = (content: any[]): void => {
      for (const item of content) {
        if (item.type === "DropdownReactComponent" && item.attrs?.options) {
          try {
            const optsArray = JSON.parse(item.attrs.options);
            if (Array.isArray(optsArray)) {
              optsArray.forEach((opt: any) => {
                if (opt.id && opt.label) {
                  options.push({ id: opt.id, label: opt.label });
                }
              });
            }
          } catch (e) {
            // If not JSON, skip
          }
        } else if (item.content && Array.isArray(item.content)) {
          findOptions(item.content);
        }
      }
    };

    if (questionObject.content) {
      findOptions(questionObject.content);
    }

    return options;
  } catch (error) {
    return [];
  }
}

// ============================================================================
// QUESTION STRUCTURE SIMPLIFICATION
// ============================================================================

/**
 * Simplify the question structure to help AI understand the layout
 */
export function simplifyStructure(content: any[]): any[] {
  return content.map((item, index) => {
    // Add index to every item to help AI identifying positions
    const base: any = { index, type: item.type };

    if (item.type === "text") {
      base.text = item.text;
      return base;
    }
    if (item.type === "KatexReactComponent") {
      // Include the mathematical operator/symbol in the structure
      let operator = item.attrs?.originalString || "";
      // Handle mixed numbers FIRST: 3\frac{1}{12} -> (3 + 1/12)
      operator = operator.replace(
        /(\d+)\\frac\{([^}]+)\}\{([^}]+)\}/g,
        "($1 + $2/$3)"
      );
      // Handle LaTeX fractions (after mixed numbers)
      operator = operator.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2");
      operator = operator.replace(/\\\\div/g, "÷");
      operator = operator.replace(/\\\\times/g, "×");
      base.type = "operator";
      base.symbol = operator;
      return base;
    }
    if (item.type === "paragraph" || item.type === "heading") {
      base.type = "block";
      base.content = item.content ? simplifyStructure(item.content) : [];
      return base;
    }
    if (item.type === "TextFieldReactComponent") {
      base.type = "input";
      base.answer = item.attrs?.answer;
      return base;
    }
    if (item.type === "DropdownReactComponent") {
      base.type = "dropdown";
      base.options = item.attrs?.options;
      base.answer = item.attrs?.answers;
      return base;
    }
    if (item.type === "FractionReactComponent") {
      // Convert fraction answer to readable format
      let answer = item.attrs?.answer || "";
      answer = answer.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2");
      answer = answer.replace(/(\d+)\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 $2/$3");
      answer = answer.replace(/null\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2");
      answer = answer.replace(/([A-Z])\\frac\{null\}\{null\}/g, "$1");
      base.type = "fraction";
      base.answer = answer;
      return base;
    }
    if (item.type === "SegmentReactComponent") {
      base.type = "section";
      base.content = item.content ? simplifyStructure(item.content) : [];
      return base;
    }
    if (item.content) {
      base.content = simplifyStructure(item.content);
      return base;
    }
    return base;
  });
}

// ============================================================================
// FALSE POSITIVE DETECTION
// ============================================================================

/**
 * Check if an issue is likely a false positive based on known patterns
 * Returns { isFalsePositive: boolean, reason?: string }
 */
export async function checkFalsePositive(
  questionId: number,
  questionObject: any,
  issueDescription: string,
  suggestedFix: string
): Promise<{ isFalsePositive: boolean; reason?: string }> {
  try {
    // Step 1: Use heuristic patterns first (fast, no tokens)
    const questionText = extractQuestionText(questionObject);
    const answer = extractAnswer(questionObject);
    const explanation = extractExplanation(questionObject);
    const options = extractOptions(questionObject);
    const structure = simplifyStructure(questionObject?.content || []);

    // Step 1: Run all heuristic patterns first (fast, no tokens)
    let heuristicResult: { isFalsePositive: boolean; reason?: string } | null =
      null;

    // Pattern 1: Multi-part questions with separate answer fields
    // If issue mentions "ambiguous" but question has clear separate components
    if (
      issueDescription.toLowerCase().includes("ambiguous") &&
      structure.filter((s: any) => s.type === "input" || s.type === "dropdown")
        .length > 1
    ) {
      // Check if numbers are in different components (not ambiguous)
      const inputCount = structure.filter(
        (s: any) => s.type === "input" || s.type === "dropdown"
      ).length;
      if (inputCount > 1) {
        heuristicResult = {
          isFalsePositive: true,
          reason:
            "Multi-part question with separate answer fields - numbers in different components are distinct, not ambiguous",
        };
      }
    }

    // Pattern 2: Explanation clarifies ambiguity
    if (
      !heuristicResult &&
      explanation &&
      (issueDescription.toLowerCase().includes("ambiguous") ||
        issueDescription.toLowerCase().includes("unclear"))
    ) {
      // If explanation contains calculations, it likely clarifies the question
      if (
        explanation.match(/\d+\s*[+\-×÷=]\s*\d+/g) ||
        explanation.match(/=\s*\d+/g)
      ) {
        heuristicResult = {
          isFalsePositive: true,
          reason:
            "Explanation contains clear calculations that resolve any ambiguity in the question wording",
        };
      }
    }

    // Pattern 3: Dropdown answer formats (B.4, A.3 are valid)
    if (
      !heuristicResult &&
      issueDescription.toLowerCase().includes("incorrect") &&
      answer.match(/^[A-D]\.\d+$/i)
    ) {
      heuristicResult = {
        isFalsePositive: true,
        reason:
          "Dropdown answer format (e.g., 'B.4', 'A.3') is valid - the letter prefix is part of the option label format",
      };
    }

    // Pattern 4: "quotient...remainder" format (valid for division)
    if (
      !heuristicResult &&
      issueDescription.toLowerCase().includes("incorrect") &&
      answer.match(/\d+\.\.\.\d+/)
    ) {
      heuristicResult = {
        isFalsePositive: true,
        reason:
          "Answer format 'quotient...remainder' (e.g., '3...4') is valid for division problems",
      };
    }

    // Pattern 5: Questions with mathematical operators/fractions visible (not incomplete)
    if (
      !heuristicResult &&
      issueDescription.toLowerCase().includes("incomplete")
    ) {
      const hasOperators = questionText.match(/[+\-×÷=]/);
      const hasFractions = questionText.match(/\d+\/\d+/);
      if (hasOperators || hasFractions) {
        heuristicResult = {
          isFalsePositive: true,
          reason:
            "Question contains mathematical operators or fractions - it is complete, not incomplete",
        };
      }
    }

    // Pattern 6: Number word format issues (but "Five thousand eight hundred and seven" is correct)
    if (
      issueDescription.toLowerCase().includes("number word") ||
      issueDescription.toLowerCase().includes("number format")
    ) {
      // Check if the issue is about missing "and" - but "and" is only required in certain contexts
      // This is tricky, so we'll be conservative and only flag if it's clearly about format
      if (
        issueDescription.includes("Five thousand eight hundred seven") &&
        !issueDescription.includes("and")
      ) {
        // This might be a false positive
      }
    }

    // Pattern 7: Mixed fractions - check if issue is about misinterpretation
    if (
      !heuristicResult &&
      (issueDescription.toLowerCase().includes("mixed fraction") ||
        issueDescription.toLowerCase().includes("31/12") ||
        issueDescription.toLowerCase().includes("94/15"))
    ) {
      // Check if question text has mixed fractions that were correctly converted
      if (
        questionText.includes("(3 + 1/12)") ||
        questionText.includes("(9 + 4/15)")
      ) {
        // The question text already has the correct format, so this might be a false positive
        heuristicResult = {
          isFalsePositive: true,
          reason:
            "Mixed fractions are correctly formatted in question text (e.g., '(3 + 1/12)') - issue may be about misinterpretation",
        };
      }
    }

    // Pattern 8: Questions with clear JSON structure that AI misread
    // If issue mentions structure problems but structure is actually clear
    if (
      issueDescription.toLowerCase().includes("structure") ||
      issueDescription.toLowerCase().includes("formatting")
    ) {
      // Check if structure is actually clear (has proper nesting, clear components)
      const hasClearStructure =
        structure.length > 0 &&
        structure.some(
          (s: any) =>
            s.type === "block" ||
            s.type === "input" ||
            s.type === "dropdown" ||
            s.type === "operator"
        );
      if (hasClearStructure && questionText.length > 10) {
        // Structure seems clear, might be false positive
      }
    }

    // Pattern 9: Questions where answer matches explanation calculation
    if (explanation && answer) {
      // Try to extract numbers from explanation
      const explanationNumbers = explanation.match(/\d+/g) || [];
      const answerNumbers = answer.match(/\d+/g) || [];

      // If explanation shows a calculation that results in the answer
      if (
        explanation.match(/=\s*\d+/g) &&
        answerNumbers.some((ansNum) =>
          explanationNumbers.some((expNum) => expNum === ansNum)
        )
      ) {
        // Answer appears in explanation calculation - might be correct
      }
    }

    // Pattern 10: Ill-posed questions that are actually solvable
    if (
      !heuristicResult &&
      (issueDescription.toLowerCase().includes("ill-posed") ||
        issueDescription.toLowerCase().includes("unanswerable"))
    ) {
      // Check if question has an equation or solvable structure
      if (
        questionText.match(/[=]/) ||
        questionText.match(/\w+\s*=\s*__/) ||
        questionText.match(/solve|find|calculate/i)
      ) {
        // Question appears to be solvable - might be false positive
        heuristicResult = {
          isFalsePositive: true,
          reason:
            "Question contains equation or solvable structure - may not be ill-posed",
        };
      }
    }

    // Step 2: If heuristics detected a false positive, verify with AI
    if (heuristicResult && heuristicResult.isFalsePositive) {
      try {
        if (!detectFalsePositive) {
          const aiCore = await import("./ai-core");
          detectFalsePositive = aiCore.detectFalsePositive;
        }

        const aiResult = await detectFalsePositive(
          questionId,
          questionObject,
          issueDescription,
          suggestedFix
        );

        // Use AI result if confidence is high enough (>= 0.7)
        if (aiResult.confidence !== undefined && aiResult.confidence >= 0.7) {
          log(
            `Question ${questionId}: Heuristics detected false positive, AI verified with confidence ${aiResult.confidence}`
          );
          return {
            isFalsePositive: aiResult.isFalsePositive,
            reason: aiResult.reason,
          };
        }
        // If AI confidence is low, use heuristic result
        log(
          `Question ${questionId}: Heuristics detected false positive, AI confidence too low (${aiResult.confidence}), using heuristic result`
        );
      } catch (aiError: any) {
        log(
          `Question ${questionId}: Heuristics detected false positive, AI verification failed: ${aiError.message}. Using heuristic result.`
        );
      }

      return heuristicResult;
    }

    // No heuristic pattern matched - not a false positive (don't call AI to save tokens)
    return { isFalsePositive: false };
  } catch (error: any) {
    log(
      `Question ${questionId}: Error checking false positive: ${error.message}`
    );
    // On error, assume not a false positive (conservative approach)
    return { isFalsePositive: false };
  }
}

// ============================================================================
// STRUCTURAL VALIDATION
// ============================================================================

/**
 * Validate that the structure (types, arrays, nesting) is preserved
 * Returns error message if structural changes detected, null if OK
 */
export function validateStructurePreserved(
  original: any,
  fixed: any,
  path: string = "root"
): string | null {
  // Type mismatch
  if (typeof original !== typeof fixed) {
    return `Type mismatch at ${path}: ${typeof original} vs ${typeof fixed}`;
  }

  // Array structure
  if (Array.isArray(original)) {
    if (!Array.isArray(fixed)) {
      return `Array structure lost at ${path}`;
    }

    // Check if array contains objects that were stringified
    if (
      fixed.length > 0 &&
      typeof fixed[0] === "string" &&
      typeof original[0] === "object"
    ) {
      return `Array elements converted to strings at ${path} - this changes structure`;
    }

    // Allow array length differences ONLY if it's reasonable (±2 items max for minor edits)
    const lengthDiff = Math.abs(original.length - fixed.length);
    if (lengthDiff > 2) {
      return `Array length changed significantly at ${path}: ${original.length} vs ${fixed.length}`;
    }

    // Check each element's type
    for (let i = 0; i < Math.min(original.length, fixed.length); i++) {
      const error = validateStructurePreserved(
        original[i],
        fixed[i],
        `${path}[${i}]`
      );
      if (error) return error;
    }

    return null;
  }

  // Object structure
  if (original !== null && typeof original === "object") {
    if (fixed === null || typeof fixed !== "object") {
      return `Object structure lost at ${path}`;
    }

    // Check for critical structural keys
    const criticalKeys = ["type", "content", "attrs"];
    for (const key of criticalKeys) {
      if (key in original && !(key in fixed)) {
        return `Critical key '${key}' removed at ${path}`;
      }
      if (key in original && key in fixed) {
        // Check if type changed
        if (typeof original[key] !== typeof fixed[key]) {
          return `Type of '${key}' changed at ${path}: ${typeof original[key]} vs ${typeof fixed[key]}`;
        }
      }
    }

    // For nested objects/arrays, recurse
    for (const key in original) {
      if (key in fixed && typeof original[key] === "object") {
        const error = validateStructurePreserved(
          original[key],
          fixed[key],
          `${path}.${key}`
        );
        if (error) return error;
      }
    }

    return null;
  }

  // Primitives are fine
  return null;
}

/**
 * Check if a path is within an input component (TextFieldReactComponent or DropdownReactComponent)
 * Input components have strict structure requirements - no structural changes allowed
 */
function isWithinInputComponent(path: string, obj: any): boolean {
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
}

/**
 * Validate structural changes - more permissive than validateStructurePreserved
 * Allows removals and array replacements but ensures critical structure integrity
 * Returns validation result with warnings for significant changes
 */
export function validateStructuralChange(
  original: any,
  fixed: any,
  path: string = "root"
): { isValid: boolean; error?: string; warnings?: string[] } {
  const warnings: string[] = [];

  // Type mismatch - still block this
  if (typeof original !== typeof fixed) {
    return {
      isValid: false,
      error: `Type mismatch at ${path}: ${typeof original} vs ${typeof fixed}`,
    };
  }

  // Array structure - allow length changes but validate element types
  if (Array.isArray(original)) {
    if (!Array.isArray(fixed)) {
      return {
        isValid: false,
        error: `Array structure lost at ${path}`,
      };
    }

    // Check if array contains objects that were stringified
    if (
      fixed.length > 0 &&
      typeof fixed[0] === "string" &&
      typeof original[0] === "object"
    ) {
      return {
        isValid: false,
        error: `Array elements converted to strings at ${path} - this changes structure`,
      };
    }

    // Allow removals (length decrease) - but warn if significant
    const lengthDiff = original.length - fixed.length;
    if (lengthDiff > 0) {
      if (lengthDiff > 3) {
        warnings.push(
          `Removed ${lengthDiff} items from array at ${path} - verify this is correct`
        );
      }
    }

    // Handle additions (length increase)
    // Allow ALL additions in question text (not in input components)
    // Block STRUCTURAL additions in input components, but allow VALUE changes
    if (lengthDiff < 0) {
      const additionCount = Math.abs(lengthDiff);

      // Check if this path is within an input component
      const inInputComponent = isWithinInputComponent(path, original);

      if (inInputComponent) {
        // Check if this is a VALUE change (modifying attrs.answers, attrs.options, etc.)
        // vs a STRUCTURAL change (adding new components to content arrays)
        const isValueChange =
          path.includes(".attrs.") || // Changing attrs fields (answers, options, answer, etc.)
          path.includes(".attrs[") || // Array access in attrs
          (!path.includes(".content[") && !path.includes(".content.")); // Not modifying content structure

        if (isValueChange) {
          // Allow value changes in input components (e.g., changing selected answer from B to A)
          // This is safe - we're just updating field values, not structure
          if (additionCount > 3) {
            warnings.push(
              `Added ${additionCount} items to array at ${path} within input component - verify this is correct`
            );
          }
          // Allow the value change
        } else {
          // Block structural additions in input components (adding new components to content arrays)
          return {
            isValid: false,
            error: `Cannot add ${additionCount} items to array at ${path}. Adding components to input components (TextFieldReactComponent, DropdownReactComponent) requires manual review.`,
          };
        }
      } else {
        // Allow additions in question text (paragraphs, headings, etc.)
        // This covers moves, reorganizations, and legitimate structural changes
        if (additionCount > 5) {
          warnings.push(
            `Added ${additionCount} items to array at ${path} - verify this is correct (large addition)`
          );
        }
        // Allow the addition - it's in question text, not an input component
      }
    }

    // Validate remaining elements have correct types
    // Check if we're in question text (not in input components)
    const inInputComponent = isWithinInputComponent(path, original);

    for (let i = 0; i < fixed.length; i++) {
      const originalIndex = i < original.length ? i : -1;
      if (originalIndex >= 0) {
        // Element exists in original - validate type matches
        if (typeof original[originalIndex] !== typeof fixed[i]) {
          return {
            isValid: false,
            error: `Element type mismatch at ${path}[${i}]: ${typeof original[originalIndex]} vs ${typeof fixed[i]}`,
          };
        }

        // If it's an object, validate critical keys
        // ALWAYS check for "type" field (mandatory for all components)
        // Other keys (attrs, content) only checked in input components
        if (
          typeof original[originalIndex] === "object" &&
          original[originalIndex] !== null
        ) {
          // Check if fixed[i] is null/undefined - if so, it's a removal (allowed in question text)
          if (fixed[i] === null || fixed[i] === undefined) {
            // Null values are allowed in question text (for removals), but not in input components
            if (inInputComponent) {
              return {
                isValid: false,
                error: `Element removed at ${path}[${i}] - removals are not allowed in input components.`,
              };
            }
            // In question text, null is allowed (represents removal)
            continue;
          }

          // "type" field is ALWAYS mandatory - check in both question text and input components
          // Only check if fixed[i] is an object (not null/undefined)
          if (
            typeof fixed[i] === "object" &&
            fixed[i] !== null &&
            "type" in original[originalIndex] &&
            !("type" in fixed[i])
          ) {
            return {
              isValid: false,
              error: `Critical key 'type' removed from element at ${path}[${i}]. The 'type' field is MANDATORY for all components - removing it breaks rendering completely.`,
            };
          }

          // Other critical keys (attrs, content) only checked in input components
          if (
            inInputComponent &&
            typeof fixed[i] === "object" &&
            fixed[i] !== null
          ) {
            const criticalKeys = ["content", "attrs"];
            for (const key of criticalKeys) {
              if (key in original[originalIndex] && !(key in fixed[i])) {
                return {
                  isValid: false,
                  error: `Critical key '${key}' removed from element at ${path}[${i}]`,
                };
              }
            }
          }
        }
      }
    }

    // Recurse for remaining elements
    for (let i = 0; i < Math.min(original.length, fixed.length); i++) {
      const result = validateStructuralChange(
        original[i],
        fixed[i],
        `${path}[${i}]`
      );
      if (!result.isValid) return result;
      if (result.warnings) warnings.push(...result.warnings);
    }

    return { isValid: true, warnings };
  }

  // Object structure - validate critical keys are preserved ONLY in input components
  if (original !== null && typeof original === "object") {
    // Check if we're in question text (not in input components)
    const inInputComponent = isWithinInputComponent(path, original);

    if (fixed === null || typeof fixed !== "object") {
      // In question text, allow null (element removal - will be filtered out before applying)
      // In input components, block null (structure must be preserved)
      if (inInputComponent) {
        return {
          isValid: false,
          error: `Object structure lost at ${path}`,
        };
      }
      // In question text, null is allowed (will be filtered out)
      return { isValid: true };
    }

    // Critical keys must be preserved ONLY in input components
    // In question text, allow full structural freedom (can change component types, remove attrs, etc.)
    if (inInputComponent) {
      const criticalKeys = ["type", "content", "attrs"];
      for (const key of criticalKeys) {
        if (key in original && !(key in fixed)) {
          return {
            isValid: false,
            error: `Critical key '${key}' removed at ${path}`,
          };
        }
        if (key in original && key in fixed) {
          // Type must match
          if (typeof original[key] !== typeof fixed[key]) {
            return {
              isValid: false,
              error: `Type of '${key}' changed at ${path}: ${typeof original[key]} vs ${typeof fixed[key]}`,
            };
          }
        }
      }
    }
    // In question text, skip critical keys check - allow component type changes, attrs removal, etc.

    // Recurse for nested structures
    for (const key in original) {
      if (key in fixed && typeof original[key] === "object") {
        const result = validateStructuralChange(
          original[key],
          fixed[key],
          `${path}.${key}`
        );
        if (!result.isValid) return result;
        if (result.warnings) warnings.push(...result.warnings);
      }
    }

    return { isValid: true, warnings };
  }

  // Primitives are fine
  return { isValid: true };
}

// ============================================================================
// CHANGE DETECTION
// ============================================================================

/**
 * Deep comparison to detect if too many changes were made
 * Returns true if changes are minimal (only specific fields modified)
 */
export function detectExcessiveChanges(
  original: any,
  fixed: any,
  maxAllowedChanges: number = 5
): { isMinimal: boolean; changeCount: number; changes: string[] } {
  const changes: string[] = [];
  let changeCount = 0;

  // Helper to check if a path is in question text (not in input components)
  const isInQuestionText = (path: string): boolean => {
    // Check if path is within an input component
    const blockedInputComponentTypes = [
      "TextFieldReactComponent",
      "DropdownReactComponent",
    ];

    // Simple heuristic: if path doesn't contain these component types in a way that suggests
    // we're modifying their structure, it's likely question text
    // We'll use the isWithinInputComponent function logic
    try {
      // Check if we can find an input component in the path by checking the object structure
      const pathParts = path.split(".");
      for (let i = 0; i < pathParts.length; i++) {
        const currentPath = pathParts.slice(0, i + 1).join(".");
        try {
          const currentObj = getNestedValue(original, currentPath);
          if (
            currentObj &&
            typeof currentObj === "object" &&
            !Array.isArray(currentObj) &&
            currentObj.type &&
            blockedInputComponentTypes.includes(currentObj.type)
          ) {
            // We're inside an input component - check if it's a structural change
            // Structural changes in input components should be counted
            // Value changes (attrs.*) in input components should be counted
            // But if we're modifying content arrays in input components, that's structural
            if (path.includes(".content[") || path.includes(".content.")) {
              return false; // Structural change in input component - count it
            }
            // Value changes in attrs are fine, but we still count them
            return false; // In input component - count changes
          }
        } catch (e) {
          // Continue checking
        }
      }
    } catch (e) {
      // If we can't determine, assume it's question text (more lenient)
    }
    return true; // Assume question text if we can't determine otherwise
  };

  function compareObjects(obj1: any, obj2: any, path: string = ""): void {
    if (changeCount > maxAllowedChanges) return; // Early exit if too many changes

    const inQuestionText = isInQuestionText(path);

    // Handle null/undefined
    if (obj1 === null || obj1 === undefined) {
      if (obj2 !== null && obj2 !== undefined) {
        // In question text, don't count additions as excessive (structural reorganization)
        if (!inQuestionText) {
          changes.push(`${path}: added`);
          changeCount++;
        }
      }
      return;
    }
    if (obj2 === null || obj2 === undefined) {
      if (obj1 !== null && obj1 !== undefined) {
        // In question text, don't count removals as excessive (structural reorganization)
        if (!inQuestionText) {
          changes.push(`${path}: removed`);
          changeCount++;
        }
      }
      return;
    }

    // Handle arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) {
        // In question text, don't count array length changes as excessive (structural reorganization)
        if (!inQuestionText) {
          changes.push(
            `${path}: array length changed (${obj1.length} -> ${obj2.length})`
          );
          changeCount++;
        }
      }
      const maxLen = Math.max(obj1.length, obj2.length);
      for (let i = 0; i < maxLen && changeCount <= maxAllowedChanges; i++) {
        if (i < obj1.length && i < obj2.length) {
          compareObjects(obj1[i], obj2[i], `${path}[${i}]`);
        } else if (i < obj1.length) {
          // Removed element
          if (!inQuestionText) {
            changes.push(`${path}[${i}]: removed`);
            changeCount++;
          }
        } else {
          // Added element
          if (!inQuestionText) {
            changes.push(`${path}[${i}]: added`);
            changeCount++;
          }
        }
      }
      return;
    }

    // Handle objects
    if (typeof obj1 === "object" && typeof obj2 === "object") {
      const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
      for (const key of allKeys) {
        if (changeCount > maxAllowedChanges) return;
        const newPath = path ? `${path}.${key}` : key;
        if (!(key in obj1)) {
          // Added key
          // In question text, don't count component type changes or attrs removal as excessive
          if (!inQuestionText || (key !== "type" && key !== "attrs")) {
            changes.push(`${newPath}: added`);
            changeCount++;
          }
        } else if (!(key in obj2)) {
          // Removed key
          // In question text, don't count attrs removal as excessive (component type changes)
          if (!inQuestionText || key !== "attrs") {
            changes.push(`${newPath}: removed`);
            changeCount++;
          }
        } else if (obj1[key] !== obj2[key]) {
          // Deep comparison for nested objects
          if (
            typeof obj1[key] === "object" &&
            typeof obj2[key] === "object" &&
            obj1[key] !== null &&
            obj2[key] !== null
          ) {
            compareObjects(obj1[key], obj2[key], newPath);
          } else {
            // Value changed
            // In question text, don't count component type changes as excessive
            if (!inQuestionText || key !== "type") {
              changes.push(`${newPath}: changed`);
              changeCount++;
            }
          }
        }
      }
      return;
    }

    // Handle primitives
    if (obj1 !== obj2) {
      changes.push(`${path}: changed (${obj1} -> ${obj2})`);
      changeCount++;
    }
  }

  compareObjects(original, fixed);
  return {
    isMinimal: changeCount <= maxAllowedChanges,
    changeCount,
    changes: changes.slice(0, 10), // Limit to first 10 changes for reporting
  };
}
