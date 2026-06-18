import { ClassroomQuizzesDAO } from "@/src/app/api/lib/DAOs/classroomQuizzesDAO";
import { QuizDAO } from "@/src/app/api/lib/DAOs/quizDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { UserQuestionProcessing } from "@/src/app/api/lib/processing/userQuestionProcessing";
import {
  TipTapNode,
  UserAnswers,
  UserQuizQuestion,
} from "@/src/app/api/lib/types/questionTypes";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    //check start and end date of quiz
    //check they are part of classroom and quiz by clasroom_quiz_aggregate
    //remove answers from questions

    const request = new URLAdapter(
      req,
      z.object({
        quiz_id: z.string(),
        classroom_id: z.string(),
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
    user.assertRole(["student"]);
    user.assertPaying(true);

    const classroomQuizzesDAO = new ClassroomQuizzesDAO(supabaseService);
    const classroomQuiz = await classroomQuizzesDAO.get(
      auth.getUserId(),
      parseInt(request.getURLProperty("classroom_id")),
      parseInt(request.getURLProperty("quiz_id")),
    );

    if (classroomQuiz.count == 0) {
      throw new FlexibleError("Student quiz couldnt be found", 404);
    }

    const quizDAO = new QuizDAO(supabaseService);

    const quizQuestionsData = await quizDAO.getQuestionsWithResponse(
      undefined,
      parseInt(request.getURLProperty("quiz_id")),
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

    const reformattedQuizQuestions: UserQuizQuestion[] =
      quizQuestionsData.data.map((quizQuestion) => ({
        quiz_id: quizQuestion.quiz_id as number,
        question_id: quizQuestion.question_id as number,
        category: quizQuestion.category as string,
        subject: quizQuestion.subject as string,
        question_object: quizQuestion.question_object as TipTapNode,
        user_answers: quizQuestion.user_answers as UserAnswers[] | null,
        time_taken: quizQuestion.time_taken,
        accuracy: quizQuestion.accuracy,
      }));

    UserQuestionProcessing.fixUnansweredQuestions(reformattedQuizQuestions);
    UserQuestionProcessing.fixAnsweredQuestions(reformattedQuizQuestions);

    const data = {
      questions: reformattedQuizQuestions,
    };

    return ResponseWrapper.success("Success student quiz get questions", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed student quiz get questions",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
