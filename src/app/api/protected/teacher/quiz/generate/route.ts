import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { z } from "zod";

const generateSchema = z.object({
  year: z.coerce.number().int().min(1).max(6),
  categories: z.array(z.coerce.number().int().positive()).min(1),
  difficulties: z.array(z.coerce.number().int().min(1).max(5)).min(1),
  count: z.coerce.number().int().min(1).max(10),
});
// Region is NOT in the body — Manager.stream injects it into every request's
// query as the current UI language; the route reads it from there (below).

export async function POST(req: Request) {
  type GenerateResponse = {
    questions: {
      id: number;
      outer_category: number;
      difficulty: number;
      question_object: any;
    }[];
    requested_count: number;
    returned_count: number;
  };

  try {
    const request = new BodyAdapter(req, generateSchema);
    await request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["teacher"]);
    user.assertPaying(true);
    if (!user.getSchoolId()) {
      throw new FlexibleError("User does not have a school ID", 400);
    }

    const year = request.getBodyProperty("year");
    const categories = request.getBodyProperty("categories");
    const difficulties = request.getBodyProperty("difficulties");
    const count = request.getBodyProperty("count");
    // Region follows the current UI language, which Manager.stream injects into
    // every request's query (the same source the student getAIQuestions route
    // reads). user_questions.question is a single jsonb, so this is the language
    // frozen into the quiz at save.
    const region: "en" | "zh" =
      new URL(req.url).searchParams.get("region") === "zh" ? "zh" : "en";

    // Cast on rpc name: generate_teacher_quiz_questions is new and not yet in
    // the generated supabase types. Regenerating types (see CLAUDE.md) removes
    // the need for this cast.
    const { data, error } = await (supabaseService as any).rpc(
      "generate_teacher_quiz_questions",
      {
        p_categories: categories,
        p_difficulties: difficulties,
        p_year: year,
        p_count: count,
        p_region: region,
      }
    );

    if (error) {
      throw new FlexibleError(`Failed to generate questions: ${error.message}`, 500);
    }

    const questions = (data as any[]) || [];
    const response: GenerateResponse = {
      questions: questions.map((q) => ({
        id: q.id,
        outer_category: q.outer_category,
        difficulty: q.difficulty,
        question_object: q.question_object,
      })),
      requested_count: count,
      returned_count: questions.length,
    };

    return ResponseWrapper.success("Questions generated successfully", response);
  } catch (err: any) {
    return ResponseWrapper.error(
      "Failed to generate questions",
      err?.status ?? 500,
      err?.message ?? ""
    );
  }
}
