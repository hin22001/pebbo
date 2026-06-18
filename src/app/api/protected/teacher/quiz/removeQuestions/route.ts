import { QuizDAO } from "@/src/app/api/lib/DAOs/quizDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { z } from "zod";

const removeQuestionsSchema = z.object({
  quiz_id: z.coerce.number().int().positive(),
  question_ids: z.array(z.coerce.number().int().positive()).min(1),
});

export async function DELETE(req: Request) {
  type RemoveQuestionsResponse = {
    quiz_id: number;
    questions_removed: number;
    total_questions: number;
    removed_questions: number[];
  };

  try {
    const request = new BodyAdapter(req, removeQuestionsSchema);
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

    // Validate that we're not removing all questions (quiz must have at least 1 question)
    if (currentQuestionCount <= questionIds.length) {
      throw new FlexibleError(
        "Cannot remove all questions from quiz. Quiz must have at least 1 question",
        400
      );
    }

    // Verify that all question IDs exist in this quiz
    const { data: existingQuizQuestions, error: verifyError } =
      await supabaseService
        .from("quiz_junction")
        .select("question_id")
        .eq("quiz_id", quizId)
        .in("question_id", questionIds);

    if (verifyError) {
      throw new FlexibleError(
        `Failed to verify questions: ${verifyError.message}`,
        500
      );
    }

    if (
      !existingQuizQuestions ||
      existingQuizQuestions.length !== questionIds.length
    ) {
      const existingIds =
        existingQuizQuestions?.map((q) => q.question_id) || [];
      const missingIds = questionIds.filter((id) => !existingIds.includes(id));
      throw new FlexibleError(
        `Questions with IDs ${missingIds.join(", ")} are not in this quiz`,
        400
      );
    }

    // Remove questions from quiz using existing RPC
    const quizDAO = new QuizDAO(supabaseService);
    const removedQuestions = await quizDAO.removeQuestions(quizId, questionIds);

    if (!removedQuestions || removedQuestions.length === 0) {
      throw new FlexibleError("Failed to remove questions from quiz", 500);
    }

    const newTotalCount = currentQuestionCount - removedQuestions.length;

    const response: RemoveQuestionsResponse = {
      quiz_id: quizId,
      questions_removed: removedQuestions.length,
      total_questions: newTotalCount,
      removed_questions: questionIds,
    };

    return ResponseWrapper.success(
      `Successfully removed ${removedQuestions.length} questions from quiz`,
      response
    );
  } catch (err) {
    return ResponseWrapper.error(
      "Failed to remove questions from quiz",
      err?.status ?? 500,
      err?.message ?? ""
    );
  }
}
