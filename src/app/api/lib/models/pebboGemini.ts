import { GoogleGenerativeAI, GenerativeModel, GenerateContentRequest } from "@google/generative-ai";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface StreamingResponse {
  content: string;
  isComplete: boolean;
}

export class PebboGemini {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    this.model = this.client.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 1.2,
        maxOutputTokens: 1000,
      }
    });
  }

  getClient() {
    return this.client;
  }

  getModel() {
    return this.model;
  }

  /**
   * Convert OpenAI-style messages to Gemini format
   */
  private convertMessagesToGeminiFormat(messages: ChatMessage[]): string {
    // For simplicity, let's create a single prompt that includes the system message
    // and conversation history as a formatted string
    let fullPrompt = "";
    
    for (const message of messages) {
      if (message.role === "system") {
        fullPrompt += `System: ${message.content}\n\n`;
      } else if (message.role === "user") {
        fullPrompt += `User: ${message.content}\n\n`;
      } else if (message.role === "assistant") {
        fullPrompt += `Assistant: ${message.content}\n\n`;
      }
    }
    
    return fullPrompt.trim();
  }

  /**
   * Create a streaming chat completion compatible with OpenAI interface
   */
  async *createChatCompletionStream(messages: ChatMessage[]): AsyncGenerator<StreamingResponse, void, unknown> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is not set");
      }

      const prompt = this.convertMessagesToGeminiFormat(messages);
      
      // Validate that we have content to send
      if (!prompt || prompt.trim().length === 0) {
        throw new Error("No valid conversation content found");
      }
      
      console.log("Sending prompt to Gemini:", prompt);
      
      // Use generateContentStream for streaming responses
      const result = await this.model.generateContentStream(prompt);
      
      let fullContent = "";
      let hasContent = false;
      
      for await (const chunk of result.stream) {
        try {
          const chunkText = chunk.text();
          if (chunkText) {
            hasContent = true;
            fullContent += chunkText;
            yield {
              content: chunkText,
              isComplete: false
            };
          }
        } catch (chunkError) {
          console.error("Error processing chunk:", chunkError);
          // Continue processing other chunks
        }
      }
      
      if (!hasContent) {
        console.warn("No content received from Gemini");
        yield {
          content: "I apologize, but I'm having trouble generating a response right now. Please try again.",
          isComplete: false
        };
      }
      
      // Final chunk to indicate completion
      yield {
        content: "",
        isComplete: true
      };
      
    } catch (error) {
      console.error("Gemini streaming error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        apiKey: process.env.GEMINI_API_KEY ? "Present" : "Missing"
      });
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Create a non-streaming chat completion
   */
  async createChatCompletion(messages: ChatMessage[]): Promise<string> {
    try {
      const prompt = this.convertMessagesToGeminiFormat(messages);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini completion error:", error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }
}
