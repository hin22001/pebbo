import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { PebboGemini, ChatMessage } from "@/src/app/api/lib/models/pebboGemini";
import {
  QuestionChatHistory,
  QuestionChatMetaData,
} from "@/src/app/api/lib/types/potterChat";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { ChatHistoryDAO } from "@/src/app/api/lib/DAOs/chatHistoryDAO";
import { CompletedQuestionsDAO } from "@/src/app/api/lib/DAOs/completedQuestionsDAO";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapter(
      req,
      z
        .object({
          question_id: z.number(),
          question: z.string(),
          region: z.enum(["en", "zh"]),
        })
        .strict(),
    );
    await request.init();

    const questionID = request.getBodyProperty("question_id");
    const userQuestion = request.getBodyProperty("question");
    const region = request.getBodyProperty("region");

    if (userQuestion.length > 250)
      throw new FlexibleError("Character limit reached", 400);

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();
    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["student"]);
    user.assertPaying(true);

    const completedQuestionsDAO = new CompletedQuestionsDAO(supabaseService);
    const completedQuestion = await completedQuestionsDAO.getSingle(
      auth.getUserId(),
      questionID,
    );

    const question: any = completedQuestion.question;

    if (!question) throw new FlexibleError("Question not completed", 400);

    const questionObject =
      region == "zh"
        ? question.question_object_zh
        : question.question_object_en;

    const chatHistoryDAO = new ChatHistoryDAO(supabaseService);
    const chatHistory = await chatHistoryDAO.get(auth.getUserId(), {
      type: "exerciseQuestion",
      question_id: questionID,
    });

    if (!(chatHistory.length < 40))
      throw new FlexibleError("You have reached the chat limit", 400);

    const targetLanguage = region === "zh" ? "Traditional Chinese" : "English";

    const prompt: ChatMessage = {
      role: "system",
      content: `You are a primary teacher helping a student/child, use a friendly tone, answer ONLY in
            ${targetLanguage}. Ask interactive questions where appropriate. This is the original question:
            ${JSON.stringify(questionObject)}
            Do not answer questions that are irrelevant to the original question. Answer within 100 words in ${targetLanguage}. Do NOT speak in any other language unless explicitly asked.`,
    };

    const messages: ChatMessage[] = chatHistory.map((chat) => ({
      role: chat.role as "user" | "assistant",
      content: chat.message,
    }));
    messages.unshift(prompt);
    messages.push({
      role: "user",
      content: userQuestion,
    });

    const gemini = new PebboGemini();
    const stream = gemini.createChatCompletionStream(messages);

    const text: string[] = [];
    for await (const chunk of stream) {
      if (chunk.content !== "") {
        text.push(chunk.content);
      }
    }

    const assistantMessage = text.join("");

    const newChatHistory: QuestionChatHistory[] = [
      {
        user_id: auth.getUserId(),
        role: "user",
        message: userQuestion,
        metadata: {
          type: "exerciseQuestion",
          question_id: questionID,
        } as QuestionChatMetaData,
      },
      {
        user_id: auth.getUserId(),
        role: "assistant",
        message: assistantMessage,
        metadata: {
          type: "exerciseQuestion",
          question_id: questionID,
        } as QuestionChatMetaData,
      },
    ];

    chatHistoryDAO.insert(newChatHistory);

    return Response.json({
      status: 200,
      message: "Success getStream",
      data: {
        assistant_response: assistantMessage,
      },
    });
  } catch (err) {
    return Response.json(
      {
        status: err?.status ?? 500,
        message: `Failed getStream: ${err?.message ? err.message : ""}`,
        data: null,
      },
      { status: err?.status ?? 500 },
    );
  }
}
