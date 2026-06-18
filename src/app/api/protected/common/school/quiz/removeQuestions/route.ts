import { QuizDAO } from "@/src/app/api/lib/DAOs/quizDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { Pagination } from "@/src/app/api/lib/utils/pagination";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapter(
      req,
      z
        .object({
          quiz_id: z.number(),
          question_ids: z.array(z.number()),
        })
        .strict(),
    );
    await request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["admin", "teacher"]);
    user.assertPaying(true);

    const pagination = new Pagination("1", "1");

    const quizDAO = new QuizDAO(supabaseService);
    const quiz = await quizDAO.get(
      //check if they own the quiz
      user.getSchoolId() as number,
      pagination,
      request.getBodyProperty("quiz_id"),
    );

    const quizCount = quiz?.count ?? 0;

    if (quizCount <= 0) throw new FlexibleError("Quiz not found", 400);

    const removedQuestions = await quizDAO.removeQuestions(
      //automatically makes question mutable if not in any other quiz
      request.getBodyProperty("quiz_id"),
      request.getBodyProperty("question_ids"),
    );

    const data = {
      removedQuestions: removedQuestions,
    };

    return ResponseWrapper.success("Success removeQuestions from quiz", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed removeQuestions from quiz",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
