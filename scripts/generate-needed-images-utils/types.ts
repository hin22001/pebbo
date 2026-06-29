// ============================================================================
// TYPES
// ============================================================================

export interface NeededImageProgress {
  generated: number[];
  failed: Array<{
    questionId: number;
    error: string;
    timestamp: string;
  }>;
  skipped: Array<{
    questionId: number;
    reason: string;
    timestamp: string;
  }>;
  lastProcessedId: number;
  totalCost: {
    tokens: number;
    images: number; // For image generation
    promptTokens: number; // For LLM input
    completionTokens: number; // For LLM output
    estimatedUSD: number;
  };
  lastUpdated: string;
}

export interface QuestionContext {
  fullText: string;
  explanation?: string; // Additional context for reconstruction
  originalText: any; // Raw content
}

export interface PromptAndDescription {
  imagePrompt: string;
  shortDescription: string;
}

export interface ImageGenerationResult {
  success: boolean;
  b64_json?: string;
  url?: string;
  revisedPrompt?: string;
  error?: string;
}

// Ensure the structure for saving descriptions
export interface ImageDescriptionMap {
  [questionId: number]: {
    description: string;
    prompt: string;
    timestamp: string;
  };
}
