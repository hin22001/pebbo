import { ClassroomQuizzesDAO } from "@/src/app/api/lib/DAOs/classroomQuizzesDAO";
import { QuizDAO } from "@/src/app/api/lib/DAOs/quizDAO";
import { QuizResponsesDAO } from "@/src/app/api/lib/DAOs/quizResponsesDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { UserQuestionProcessing } from "@/src/app/api/lib/processing/userQuestionProcessing";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { userAnswersSchema } from "@/src/app/api/lib/validation/question/userAnswerSchema";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapter(
      req,
      z
        .object({
          classroom_id: z.number(),
          quiz_id: z.number(),
          all_answers: z.array(userAnswersSchema),
        })
        .strict(),
    );
    await request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["student"]);
    user.assertPaying(true);

    const date = new Date();
    const currentTimeISO = date.toISOString();

    const classroomQuizzesDAO = new ClassroomQuizzesDAO(supabaseService);
    const classroomQuiz = await classroomQuizzesDAO.get(
      //check if valid quiz exists
      auth.getUserId(),
      request.getBodyProperty("classroom_id"),
      request.getBodyProperty("quiz_id"),
      undefined,
      undefined,
      undefined,
      undefined,
      currentTimeISO,
      currentTimeISO,
      undefined,
    );

    if (classroomQuiz.count == 0) {
      throw new FlexibleError("Quiz not found", 404);
    }

    const quizDAO = new QuizDAO(supabaseService);
    const quizQuestionData = await quizDAO.getQuestionsWithResponse(
      undefined,
      request.getBodyProperty("quiz_id"),
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      auth.getUserId(),
      true,
    );
    const quizQuestions = quizQuestionData.data;

    UserQuestionProcessing.mergeSubmittedAnswersWithQuestions(
      quizQuestions,
      request.getBodyProperty("all_answers"),
    );

    UserQuestionProcessing.fixAnsweredQuestions(quizQuestions);

    const quizResponsesDAO = new QuizResponsesDAO(supabaseService);

    const insertedResponses = await quizResponsesDAO.insert(
      UserQuestionProcessing.formatForDB(quizQuestions, auth.getUserId()),
    );

    const data = {
      completedQuizQuestions: quizQuestions,
    };

    return ResponseWrapper.success(
      "Success student quiz submit questions",
      data,
    );
  } catch (err) {
    return ResponseWrapper.error(
      "Failed student quiz submit questions",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
