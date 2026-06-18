import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { UserQuestionsDAO } from "@/src/app/api/lib/DAOs/userQuestionsDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { Pagination } from "@/src/app/api/lib/utils/pagination";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { tiptapSchema } from "@/src/app/api/lib/validation/question/tiptapSchema";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapter(
      req,
      z
        .object({
          question_id: z.number(),
          question: tiptapSchema,
          subject: z.string(),
          category: z.union([z.number(), z.string()]),
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
    user.assertRole(["teacher", "admin"]);
    user.assertPaying(true);

    const pagination = new Pagination("1", "1");

    const userQuestionsDAO = new UserQuestionsDAO(supabaseService);

    const questionData = await userQuestionsDAO.get(
      user.getSchoolId() as number,
      "asc",
      pagination,
      request.getBodyProperty("question_id"),
    );

    const questionCount = questionData?.count ?? 0;

    if (questionCount <= 0) {
      throw new FlexibleError("Cannot find the quesiton to edit", 400);
    }

    const updatedQuestion = await userQuestionsDAO.update(
      user.getSchoolId() as number,
      request.getBodyProperty("question_id"),
      request.getBodyProperty("question"),
      request.getBodyProperty("subject"),
      String(request.getBodyProperty("category")),
    );

    const data = {
      updatedQuestion: updatedQuestion,
    };

    return ResponseWrapper.success("Success edit user questions", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed to edit user questions",
      err?.status ?? 500,
      err?.message ?? "",
      err,
    );
  }
}
