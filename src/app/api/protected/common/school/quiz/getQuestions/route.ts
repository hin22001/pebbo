import { QuizDAO } from "@/src/app/api/lib/DAOs/quizDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const request = new URLAdapter(
      req,
      z.object({
        quiz_id: z.string(),
      }),
    );
    request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["teacher", "admin"]);
    user.assertPaying(true);

    const quizDAO = new QuizDAO(supabaseService);
    const quizQuestions = await quizDAO.getQuestions(
      user.getSchoolId() as number,
      parseInt(request.getURLProperty("quiz_id")),
    );

    const data = {
      quizQuestions: quizQuestions,
    };

    return ResponseWrapper.success("Success get quiz questions", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed get quiz questions",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
