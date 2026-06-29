// ============================================================================
// TYPES
// ============================================================================

export interface ImageGenerationProgress {
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
    images: number;
    estimatedUSD: number;
  };
  lastUpdated: string;
}

export interface QuestionContext {
  topics: string[];
  objects: string[];
  numbers: string[];
  operations: string[];
  fullText: string;
}

export interface ImageGenerationResult {
  success: boolean;
  url?: string;
  b64_json?: string; // Added to support base64 response
  revisedPrompt?: string;
  error?: string;
}
