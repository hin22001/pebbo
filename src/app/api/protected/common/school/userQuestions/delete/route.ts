import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { UserQuestionsDAO } from "@/src/app/api/lib/DAOs/userQuestionsDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapter(
      req,
      z.object({
        question_ids: z.array(z.number()),
      }),
    );
    await request.init();

    const question_ids = request.getBodyProperty("question_ids");

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["teacher", "admin"]);
    user.assertPaying(true);

    const userQuestionsDAO = new UserQuestionsDAO(supabaseService);
    const deletedQuestions = await userQuestionsDAO.delete(
      user.getSchoolId() as number,
      question_ids,
    );

    const data = {
      deletedQuestions: deletedQuestions,
    };

    return ResponseWrapper.success("Success delete user question", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed to delete user question",
      err?.status ?? 500,
      err?.message ?? "",
      err,
    );
  }
}
