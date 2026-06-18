import { QuizDAO } from "@/src/app/api/lib/DAOs/quizDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { bridgeEffectiveToUserQuestions } from "@/src/app/api/lib/utils/bridgeQuizQuestions";
import { z } from "zod";

const addQuestionsSchema = z.object({
  quiz_id: z.coerce.number().int().positive(),
  question_ids: z.array(z.coerce.number().int().positive()).min(1).max(15),
});
// Region comes from the request query (Manager.stream injects the current UI
// language), not the body — read it in the handler below.

export async function POST(req: Request) {
  type AddQuestionsResponse = {
    quiz_id: number;
    questions_added: number;
    total_questions: number;
  };

  try {
    const request = new BodyAdapter(req, addQuestionsSchema);
    request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["teacher"]);
    user.assertPaying(true);

    const schoolId = user.getSchoolId();
    if (!schoolId) {
      throw new FlexibleError("User does not have a school ID", 400);
    }

    const quizId = request.getBodyProperty("quiz_id");
    const questionIds = request.getBodyProperty("question_ids");

    // Verify teacher is the creator of this quiz
    const { data: quizCreator, error: creatorError } = await supabaseService
      .from("quiz_creators")
      .select("user_id")
      .eq("quiz_id", quizId)
      .eq("user_id", auth.getUserId())
      .single();

    if (creatorError || !quizCreator) {
      throw new FlexibleError("Teacher is not the creator of this quiz", 401);
    }

    // Get current question count
    const { count: currentCount, error: countError } = await supabaseService
      .from("quiz_junction")
      .select("*", { count: "exact", head: true })
      .eq("quiz_id", quizId);

    if (countError) {
      throw new FlexibleError(
        `Failed to get current question count: ${countError.message}`,
        500
      );
    }

    const currentQuestionCount = currentCount || 0;
    const newTotalCount = currentQuestionCount + questionIds.length;

    // Validate total question count
    if (newTotalCount > 15) {
      throw new FlexibleError(
        `Cannot add ${questionIds.length} questions. Quiz would have ${newTotalCount} questions (maximum 15 allowed)`,
        400
      );
    }

    // Materialize the selected effective questions into this school's
    // user_questions (drafts-over-primary), then link the NEW user_questions
    // ids into quiz_junction (its FK points at user_questions, not primary).
    // Region = current UI language from the request query (Manager.stream),
    // matching the student question flow.
    const region: "en" | "zh" =
      new URL(req.url).searchParams.get("region") === "zh" ? "zh" : "en";
    const newUserQuestionIds = await bridgeEffectiveToUserQuestions(supabaseService, {
      effectiveIds: questionIds,
      schoolId,
      userId: auth.getUserId(),
      region,
    });

    const quizDAO = new QuizDAO(supabaseService);
    const quizQuestions = newUserQuestionIds.map((uqId) => ({
      quiz_id: quizId,
      question_id: uqId,
    }));

    const addedQuestions = await quizDAO.insertQuestions(
      auth.getUserId(),
      quizQuestions
    );

    if (!addedQuestions || addedQuestions.length === 0) {
      throw new FlexibleError("Failed to add questions to quiz", 500);
    }

    const response: AddQuestionsResponse = {
      quiz_id: quizId,
      questions_added: newUserQuestionIds.length,
      total_questions: newTotalCount,
    };

    return ResponseWrapper.success(
      `Successfully added ${addedQuestions.length} questions to quiz`,
      response
    );
  } catch (err) {
    return ResponseWrapper.error(
      "Failed to add questions to quiz",
      err?.status ?? 500,
      err?.message ?? ""
    );
  }
}
