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
  rows_per_page: z.string().transform(Number).default("10"),
});

export async function GET(req: Request) {
  type QuizPerformanceResponse = {
    quiz_id: number;
    quiz_name: string;
    total_questions: number;
    total_responses: number;
    completion_rate: number;
    average_accuracy: number;
    average_time_per_question: number;
    performance_by_question: {
      question_id: number;
      category: string;
      subject: string;
      difficulty: number;
      total_attempts: number;
      correct_attempts: number;
      accuracy_rate: number;
      average_time: number;
    }[];
    performance_by_student: {
      student_id: string;
      student_name: string;
      student_email: string;
      questions_attempted: number;
      questions_correct: number;
      accuracy_rate: number;
      total_time: number;
      completion_status: "completed" | "partial" | "not_started";
    }[];
    page_context: PageContext;
  };

  const schema = paginationSchema.merge(
    z.object({
      quiz_id: z.string().transform(Number),
    })
  );

  try {
    const request = new URLAdapter(req, schema);
    request.init();

    const quiz_id = request.getURLProperty("quiz_id");

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

    // Use QuizDAO to get quiz responses data
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
      undefined, // question_id
      undefined, // category
      undefined, // subject
      undefined, // student_id
      undefined, // getEmptyResponse
      pagination
    );

    if (!responsesData.data || responsesData.data.length === 0) {
      // Return empty response if no data
      const emptyResponse: QuizPerformanceResponse = {
        quiz_id: quiz_id,
        quiz_name: quizData.quiz_name,
        total_questions: 0,
        total_responses: 0,
        completion_rate: 0,
        average_accuracy: 0,
        average_time_per_question: 0,
        performance_by_question: [],
        performance_by_student: [],
        page_context: pagination.getPageContext(0, 0),
      };
      return ResponseWrapper.success(
        "Quiz performance retrieved successfully",
        emptyResponse
      );
    }

    // Calculate total questions in quiz
    const totalQuestions = new Set(responsesData.data.map((r) => r.question_id))
      .size;

    // Filter out responses with null student_id (unanswered questions)
    const actualResponses = responsesData.data.filter(
      (r) => r.student_id !== null
    );

    // Calculate overall metrics
    const totalResponses = actualResponses.length;
    const completionRate =
      totalQuestions > 0
        ? (totalResponses /
            (totalQuestions *
              new Set(actualResponses.map((r) => r.student_id)).size)) *
          100
        : 0;
    const averageAccuracy =
      actualResponses.length > 0
        ? actualResponses.reduce((sum, r) => sum + (r.accuracy || 0), 0) /
          actualResponses.length
        : 0;
    const averageTimePerQuestion =
      actualResponses.length > 0
        ? actualResponses.reduce((sum, r) => sum + (r.time_taken || 0), 0) /
          actualResponses.length
        : 0;

    // Calculate performance by question
    const questionStats = new Map();
    actualResponses.forEach((response) => {
      const key = response.question_id;
      if (!questionStats.has(key)) {
        questionStats.set(key, {
          question_id: response.question_id,
          category: response.category,
          subject: response.subject,
          difficulty: 1, // Default difficulty, could be enhanced
          total_attempts: 0,
          correct_attempts: 0,
          total_time: 0,
        });
      }
      const stats = questionStats.get(key);
      stats.total_attempts++;
      if (response.accuracy && response.accuracy > 0) {
        stats.correct_attempts++;
      }
      stats.total_time += response.time_taken || 0;
    });

    const performanceByQuestion = Array.from(questionStats.values()).map(
      (stats) => ({
        question_id: stats.question_id,
        category: stats.category,
        subject: stats.subject,
        difficulty: stats.difficulty,
        total_attempts: stats.total_attempts,
        correct_attempts: stats.correct_attempts,
        accuracy_rate:
          stats.total_attempts > 0
            ? (stats.correct_attempts / stats.total_attempts) * 100
            : 0,
        average_time:
          stats.total_attempts > 0
            ? stats.total_time / stats.total_attempts
            : 0,
      })
    );

    // Calculate performance by student
    const studentStats = new Map();
    actualResponses.forEach((response) => {
      const key = response.student_id;
      if (!studentStats.has(key)) {
        studentStats.set(key, {
          student_id: response.student_id,
          questions_attempted: 0,
          questions_correct: 0,
          total_time: 0,
        });
      }
      const stats = studentStats.get(key);
      stats.questions_attempted++;
      if (response.accuracy && response.accuracy > 0) {
        stats.questions_correct++;
      }
      stats.total_time += response.time_taken || 0;
    });

    // Get student details and calculate completion status
    const performanceByStudent = await Promise.all(
      Array.from(studentStats.entries()).map(async ([studentId, stats]) => {
        try {
          const student = await userDAO.getUser(studentId);
          const completionStatus =
            stats.questions_attempted === totalQuestions
              ? "completed"
              : stats.questions_attempted > 0
                ? "partial"
                : "not_started";

          return {
            student_id: studentId,
            student_name: `${student.getData().first_name} ${student.getData().last_name}`,
            student_email: "student@example.com", // Email not available in user data
            questions_attempted: stats.questions_attempted,
            questions_correct: stats.questions_correct,
            accuracy_rate:
              stats.questions_attempted > 0
                ? (stats.questions_correct / stats.questions_attempted) * 100
                : 0,
            total_time: stats.total_time,
            completion_status: completionStatus as
              | "completed"
              | "partial"
              | "not_started",
          };
        } catch (error) {
          return {
            student_id: studentId,
            student_name: "Unknown Student",
            student_email: "unknown@example.com",
            questions_attempted: stats.questions_attempted,
            questions_correct: stats.questions_correct,
            accuracy_rate:
              stats.questions_attempted > 0
                ? (stats.questions_correct / stats.questions_attempted) * 100
                : 0,
            total_time: stats.total_time,
            completion_status:
              stats.questions_attempted === totalQuestions
                ? "completed"
                : stats.questions_attempted > 0
                  ? "partial"
                  : "not_started",
          } as const;
        }
      })
    );

    const pageContext = pagination.getPageContext(
      performanceByStudent.length,
      responsesData.count || 0
    );

    const response: QuizPerformanceResponse = {
      quiz_id: quiz_id,
      quiz_name: quizData.quiz_name,
      total_questions: totalQuestions,
      total_responses: totalResponses,
      completion_rate: Math.round(completionRate * 100) / 100,
      average_accuracy: Math.round(averageAccuracy * 100) / 100,
      average_time_per_question: Math.round(averageTimePerQuestion * 100) / 100,
      performance_by_question: performanceByQuestion,
      performance_by_student: performanceByStudent,
      page_context: pageContext,
    };

    return ResponseWrapper.success(
      "Quiz performance retrieved successfully",
      response
    );
  } catch (error) {
    return ResponseWrapper.error(error);
  }
}
