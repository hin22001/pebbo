import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { PageContext } from "@/src/app/api/lib/types/pagination";
import { Pagination } from "@/src/app/api/lib/utils/pagination";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { paginationSchema } from "@/src/app/api/lib/validation/paginationSchema";
import { z } from "zod";

const quizQuestionsSchema = paginationSchema.merge(
  z.object({
    quiz_id: z.string().transform((val) => parseInt(val)),
  })
);

export async function GET(req: Request) {
  type QuizQuestionsResponse = {
    quiz_id: number;
    quiz_name: string;
    total_questions: number;
    questions: {
      question_id: number;
      subject: string | null;
      category: string | null;
      question_object: any;
    }[];
    page_context: PageContext;
  };

  try {
    const request = new URLAdapter(req, quizQuestionsSchema);
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

    const quizId = request.getURLProperty("quiz_id");

    // Get pagination parameters
    const pagination = new Pagination(
      request.getURLProperty("page_number"),
      request.getURLProperty("rows_per_page")
    );

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

    // Get quiz details
    const { data: quizData, error: quizError } = await supabaseService
      .from("quizzes")
      .select("id, quiz_name")
      .eq("id", quizId)
      .eq("school_id", schoolId)
      .single();

    if (quizError || !quizData) {
      throw new FlexibleError("Quiz not found", 404);
    }

    // Get questions in this quiz with pagination.
    // quiz_junction.question_id FKs to user_questions (the quiz engine's
    // question store), so join there — NOT primary_questions. Scope the
    // embedded rows to this school.
    const {
      data: questionsData,
      count,
      error: questionsError,
    } = await supabaseService
      .from("quiz_junction")
      .select(
        `
        question_id,
        user_questions!inner(
          question_id,
          subject,
          category,
          school_id,
          question
        )
      `,
        { count: "exact" }
      )
      .eq("quiz_id", quizId)
      .eq("user_questions.school_id", schoolId)
      .order("question_id", { ascending: true })
      .limit(pagination.getRowsPerPage())
      .range(pagination.getOffsetStart(), pagination.getOffsetEnd());

    if (questionsError) {
      throw new FlexibleError(
        `Failed to fetch quiz questions: ${questionsError.message}`,
        500
      );
    }

    // Process questions data
    const questions =
      questionsData?.map((item: any) => ({
        question_id: item.question_id,
        subject: item.user_questions?.subject ?? null,
        category: item.user_questions?.category ?? null,
        question_object: item.user_questions?.question ?? null,
      })) || [];

    const pageContext = pagination.getPageContext(questions.length, count || 0);

    const data: QuizQuestionsResponse = {
      quiz_id: quizId,
      quiz_name: quizData.quiz_name,
      total_questions: count || 0,
      questions,
      page_context: pageContext,
    };

    return ResponseWrapper.success(
      "Quiz questions retrieved successfully",
      data
    );
  } catch (err) {
    return ResponseWrapper.error(
      "Failed to get quiz questions",
      err?.status ?? 500,
      err?.message ?? ""
    );
  }
}
