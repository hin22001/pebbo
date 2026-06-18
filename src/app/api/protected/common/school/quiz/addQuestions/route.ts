import { QuizDAO } from "@/src/app/api/lib/DAOs/quizDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapter(
      req,
      z.object({
        quiz_questions: z.array(
          z.object({
            quiz_id: z.number(),
            question_id: z.number(),
          }),
        ),
      }),
    );
    await request.init();

    const quizQuestions = request.getBody().quiz_questions;

    if (quizQuestions.length > 500) {
      throw new FlexibleError(
        "Cannot insert more than 500 questions at a time",
        400,
      );
    }

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["admin", "teacher"]);
    user.assertPaying(true);

    const quizDAO = new QuizDAO(supabaseService);

    const insertedQuestions = await quizDAO.insertQuestions(
      auth.getUserId(),
      quizQuestions,
    );

    const data = {
      insertedQuestions: insertedQuestions,
    };

    return ResponseWrapper.success("Success add questions to quiz", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed add questions to quiz",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
