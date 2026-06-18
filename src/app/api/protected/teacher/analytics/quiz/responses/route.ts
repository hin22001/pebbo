import { QuizDAO } from "@/src/app/api/lib/DAOs/quizDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { PageContext } from "@/src/app/api/lib/types/pagination";
import { Pagination } from "@/src/app/api/lib/utils/pagination";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { z } from "zod";

const paginationSchema = z.object({
  page_number: z.string().transform(Number).default("1"),
  rows_per_page: z.string().transform(Number).default("20"),
});

export async function GET(req: Request) {
  type QuizResponsesResponse = {
    quiz_id: number;
    quiz_name: string;
    responses: {
      student_id: string;
      student_name: string;
      student_email: string;
      question_id: number;
      question_object: any;
      category: string;
      subject: string;
      user_answers: any;
      accuracy: number;
      time_taken: number;
      is_correct: boolean;
      submitted_at: string;
    }[];
    page_context: PageContext;
    response_summary: {
      total_responses: number;
      correct_responses: number;
      accuracy_rate: number;
      average_time: number;
      fastest_response: number;
      slowest_response: number;
    };
  };

  const schema = paginationSchema.merge(
    z.object({
      quiz_id: z.string().transform(Number),
      student_id: z.string().uuid().optional(),
      question_id: z.string().transform(Number).optional(),
      category: z.string().optional(),
      subject: z.string().optional(),
      accuracy_min: z.string().transform(Number).optional(),
      accuracy_max: z.string().transform(Number).optional(),
    })
  );

  try {
    const request = new URLAdapter(req, schema);
    request.init();

    const quiz_id = request.getURLProperty("quiz_id");
    const student_id = request.getURLProperty("student_id");
    const question_id = request.getURLProperty("question_id");
    const category = request.getURLProperty("category");
    const subject = request.getURLProperty("subject");
    const accuracy_min = request.getURLProperty("accuracy_min");
    const accuracy_max = request.getURLProperty("accuracy_max");

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

    // Verify teacher is the creator of this quiz
    const { data: quizCreator, error: creatorError } = await supabaseService
      .from("quiz_creators")
      .select("user_id")
      .eq("quiz_id", quiz_id)
      .eq("user_id", auth.getUserId())
      .single();

    if (creatorError || !quizCreator) {
      throw new FlexibleError("Teacher is not the creator of this quiz", 401);
    }

    // Get quiz details
    const { data: quizData, error: quizError } = await supabaseService
      .from("quizzes")
      .select("id, quiz_name, school_id")
      .eq("id", quiz_id)
      .eq("school_id", schoolId)
      .single();

    if (quizError || !quizData) {
      throw new FlexibleError("Quiz not found", 404);
    }

    // Get pagination parameters
    const pagination = new Pagination(
      request.getURLProperty("page_number").toString(),
      request.getURLProperty("rows_per_page").toString()
    );

    // Use QuizDAO to get quiz responses data with filters
    const quizDAO = new QuizDAO(supabaseService);
    const responsesData = await quizDAO.getQuestionsWithResponse(
      schoolId,
      quiz_id,
      undefined, // quiz_name
      undefined, // date_created_start
      undefined, // date_created_end
      undefined, // start_date_start
      undefined, // start_date_end
      undefined, // end_date_start
      undefined, // end_date_end
      question_id,
      category,
      subject,
      student_id,
      undefined, // getEmptyResponse
      pagination
    );

    if (!responsesData.data || responsesData.data.length === 0) {
      // Return empty response if no data
      const emptyResponse: QuizResponsesResponse = {
        quiz_id: quiz_id,
        quiz_name: quizData.quiz_name,
        responses: [],
        page_context: pagination.getPageContext(0, 0),
        response_summary: {
          total_responses: 0,
          correct_responses: 0,
          accuracy_rate: 0,
          average_time: 0,
          fastest_response: 0,
          slowest_response: 0,
        },
      };
      return ResponseWrapper.success(
        "Quiz responses retrieved successfully",
        emptyResponse
      );
    }

    // Filter out responses with null student_id (unanswered questions)
    const actualResponses = responsesData.data.filter(
      (r) => r.student_id !== null
    );

    // Apply additional filters
    let filteredResponses = actualResponses;

    if (accuracy_min !== undefined) {
      filteredResponses = filteredResponses.filter(
        (r) => (r.accuracy || 0) >= accuracy_min
      );
    }

    if (accuracy_max !== undefined) {
      filteredResponses = filteredResponses.filter(
        (r) => (r.accuracy || 0) <= accuracy_max
      );
    }

    // Get student details for each response
    const responsesWithDetails = await Promise.all(
      filteredResponses.map(async (response) => {
        try {
          const student = await userDAO.getUser(response.student_id!);
          return {
            student_id: response.student_id!,
            student_name: `${student.getData().first_name} ${student.getData().last_name}`,
            student_email: "student@example.com", // Email not available in user data
            question_id: response.question_id,
            question_object: response.question_object,
            category: response.category,
            subject: response.subject,
            user_answers: response.user_answers,
            accuracy: response.accuracy || 0,
            time_taken: response.time_taken || 0,
            is_correct: (response.accuracy || 0) > 0,
            submitted_at: new Date().toISOString(), // This would ideally come from the database
          };
        } catch (error) {
          return {
            student_id: response.student_id!,
            student_name: "Unknown Student",
            student_email: "unknown@example.com",
            question_id: response.question_id,
            question_object: response.question_object,
            category: response.category,
            subject: response.subject,
            user_answers: response.user_answers,
            accuracy: response.accuracy || 0,
            time_taken: response.time_taken || 0,
            is_correct: (response.accuracy || 0) > 0,
            submitted_at: new Date().toISOString(),
          };
        }
      })
    );

    // Calculate response summary
    const totalResponses = filteredResponses.length;
    const correctResponses = filteredResponses.filter(
      (r) => (r.accuracy || 0) > 0
    ).length;
    const accuracyRate =
      totalResponses > 0 ? (correctResponses / totalResponses) * 100 : 0;
    const times = filteredResponses
      .map((r) => r.time_taken || 0)
      .filter((t) => t > 0);
    const averageTime =
      times.length > 0
        ? times.reduce((sum, t) => sum + t, 0) / times.length
        : 0;
    const fastestResponse = times.length > 0 ? Math.min(...times) : 0;
    const slowestResponse = times.length > 0 ? Math.max(...times) : 0;

    const pageContext = pagination.getPageContext(
      responsesWithDetails.length,
      responsesData.count || 0
    );

    const response: QuizResponsesResponse = {
      quiz_id: quiz_id,
      quiz_name: quizData.quiz_name,
      responses: responsesWithDetails,
      page_context: pageContext,
      response_summary: {
        total_responses: totalResponses,
        correct_responses: correctResponses,
        accuracy_rate: Math.round(accuracyRate * 100) / 100,
        average_time: Math.round(averageTime * 100) / 100,
        fastest_response: fastestResponse,
        slowest_response: slowestResponse,
      },
    };

    return ResponseWrapper.success(
      "Quiz responses retrieved successfully",
      response
    );
  } catch (error) {
    return ResponseWrapper.error(error);
  }
}
