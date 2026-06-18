import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { NextResponse } from "next/server";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { ChatHistoryDAO } from "@/src/app/api/lib/DAOs/chatHistoryDAO";
import { QuestionChatMetaData } from "@/src/app/api/lib/types/potterChat";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const request = new URLAdapter(
      req,
      z.object({
        question_id: z.string(),
      }),
    );
    request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertPaying(true);

    const metadata: QuestionChatMetaData = {
      type: "exerciseQuestion",
      question_id: parseInt(request.getURLProperty("question_id")),
    };

    const chatHistoryDAO = new ChatHistoryDAO(supabaseService);
    const chatHistory = await chatHistoryDAO.get(auth.getUserId(), metadata);

    const data = {
      chatHistory: chatHistory,
    };

    return NextResponse.json(
      { status: 200, message: `Success getHistory`, data: data },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err?.status ?? 500,
        message: `Failed getHistory: ${err?.message}`,
        data: null,
      },
      { status: err?.status ?? 500 },
    );
  }
}
