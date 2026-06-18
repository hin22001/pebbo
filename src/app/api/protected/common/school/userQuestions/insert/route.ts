import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { UserQuestionsDAO } from "@/src/app/api/lib/DAOs/userQuestionsDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { tiptapSchema } from "@/src/app/api/lib/validation/question/tiptapSchema";
import { z } from "zod";

export async function POST(req: Request) {
  const schema = z
    .object({
      question: tiptapSchema,
      subject: z.string(),
      category: z.string(),
    })
    .strict();

  try {
    const request = new BodyAdapter(req, schema);
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

    const userQuestionsDAO = new UserQuestionsDAO(supabaseService);
    await userQuestionsDAO.insert(
      user.getSchoolId() as number,
      auth.getUserId(),
      request.getBodyProperty("question"),
      request.getBodyProperty("subject"),
      request.getBodyProperty("category"),
    );

    return ResponseWrapper.success("Success insert user question");
  } catch (err) {
    return ResponseWrapper.error(
      "Failed to insert user question",
      err?.status ?? 500,
      err?.message ?? "",
      err,
    );
  }
}
