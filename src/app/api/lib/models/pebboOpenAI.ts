import OpenAI from "openai";

/**
 * @deprecated Use PebboGemini instead for new implementations
 * This class is kept for backward compatibility only
 */
export class PebboOpenAI {
  client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPEN_AI_SECRET_KEY,
    });
  }

  getClient() {
    return this.client;
  }
}
