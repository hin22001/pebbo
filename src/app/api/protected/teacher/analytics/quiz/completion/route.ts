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
  type QuizCompletionResponse = {
    quizzes: {
      quiz_id: number;
      quiz_name: string;
      total_questions: number;
      total_students: number;
      completed_students: number;
      completion_rate: number;
      average_accuracy: number;
      created_date: string;
      start_date: string;
      end_date: string;
      due_date: string | null;
      target_score: number | null;
      status: "upcoming" | "active" | "completed";
    }[];
    page_context: PageContext;
    summary_stats: {
      total_quizzes: number;
      average_completion_rate: number;
      total_students_participated: number;
      active_quizzes: number;
    };
  };

  const schema = paginationSchema.merge(
    z.object({
      classroom_id: z.string().transform(Number).optional(),
      status: z.enum(["upcoming", "active", "completed", "all"]).optional(),
      search: z.union([z.string(), z.literal("")]).optional(),
    })
  );

  try {
    const request = new URLAdapter(req, schema);
    request.init();

    const classroomId = request.getURLProperty("classroom_id");
    const status = request.getURLProperty("status") || "all";
    const searchTerm = request.getURLProperty("search");

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

    // Get pagination parameters
    const pagination = new Pagination(
      request.getURLProperty("page_number").toString(),
      request.getURLProperty("rows_per_page").toString()
    );

    // Build query for quizzes created by this teacher
    let quizzesQuery = supabaseService
      .from("quizzes")
      .select(
        `
        id,
        quiz_name,
        date_created,
        start_date,
        end_date,
        quiz_creators!inner(user_id)
      `,
        { count: "exact" }
      )
      .eq("school_id", schoolId)
      .eq("quiz_creators.user_id", auth.getUserId());

    // Scope to a specific classroom's assigned quizzes when classroom_id is
    // provided. Dashboard-wide callers omit classroom_id and keep the teacher's
    // full quiz set, so this change is invisible to them.
    // Per-assignment metadata (due date / target score) lives on
    // classroom_quizzes, keyed by quiz_id within a classroom. Only populated
    // when scoped to a classroom; the dashboard-wide path has no single
    // due date per quiz (a quiz can be assigned to several classrooms).
    const assignmentMetaByQuizId = new Map<
      number,
      { due_date: string | null; target_score: number | null }
    >();

    if (
      classroomId !== undefined &&
      classroomId !== null &&
      !isNaN(classroomId)
    ) {
      const { data: cqRows, error: cqError } = await supabaseService
        .from("classroom_quizzes")
        .select("quiz_id, due_date, target_score")
        .eq("classroom_id", classroomId);

      if (cqError) {
        throw new FlexibleError(
          `Failed to fetch classroom assignments: ${cqError.message}`,
          500
        );
      }

      for (const r of cqRows ?? []) {
        // Last row wins if the same quiz was assigned to this classroom more
        // than once (duplicate classroom_quizzes rows are a pre-existing
        // possibility; they can now carry divergent due dates).
        assignmentMetaByQuizId.set((r as any).quiz_id, {
          due_date: (r as any).due_date ?? null,
          target_score: (r as any).target_score ?? null,
        });
      }

      const assignedQuizIds = (cqRows ?? []).map((r: any) => r.quiz_id);
      // Sentinel id keeps the result empty (not unfiltered) when the classroom
      // has no assigned quizzes yet.
      quizzesQuery = quizzesQuery.in(
        "id",
        assignedQuizIds.length ? assignedQuizIds : [-1]
      );
    }

    // Apply search filter
    if (searchTerm && searchTerm.trim()) {
      quizzesQuery = quizzesQuery.ilike("quiz_name", `%${searchTerm}%`);
    }

    // Apply status filter
    const now = new Date().toISOString();
    if (status === "upcoming") {
      quizzesQuery = quizzesQuery.gt("start_date", now);
    } else if (status === "active") {
      quizzesQuery = quizzesQuery.lte("start_date", now).gte("end_date", now);
    } else if (status === "completed") {
      quizzesQuery = quizzesQuery.lt("end_date", now);
    }

    // Get total count
    const { count: totalCount } = await quizzesQuery;

    // Apply pagination
    const { data: quizzesData, error: quizzesError } = await quizzesQuery
      .order("date_created", { ascending: false })
      .range(pagination.getOffsetStart(), pagination.getOffsetEnd());

    if (quizzesError) {
      throw new FlexibleError(
        `Failed to fetch quizzes: ${quizzesError.message}`,
        500
      );
    }

    if (!quizzesData) {
      throw new FlexibleError("No quizzes found", 404);
    }

    // Get completion data for each quiz
    const quizDAO = new QuizDAO(supabaseService);
    const quizzesWithCompletion = await Promise.all(
      quizzesData.map(async (quiz) => {
        try {
          // Get all responses for this quiz
          const responsesData = await quizDAO.getQuestionsWithResponse(
            schoolId,
            quiz.id,
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
            undefined // pagination
          );

          // Calculate total questions in quiz
          const totalQuestions = new Set(
            responsesData.data?.map((r) => r.question_id) || []
          ).size;

          // Filter actual responses (non-null student_id)
          const actualResponses =
            responsesData.data?.filter((r) => r.student_id !== null) || [];

          // Get unique students who attempted this quiz
          const uniqueStudents = new Set(
            actualResponses.map((r) => r.student_id)
          );

          // Calculate completion rate
          const totalStudents = uniqueStudents.size;
          const completedStudents = Array.from(uniqueStudents).filter(
            (studentId) => {
              const studentResponses = actualResponses.filter(
                (r) => r.student_id === studentId
              );
              return studentResponses.length === totalQuestions;
            }
          ).length;

          const completionRate =
            totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0;

          // Calculate average accuracy
          const averageAccuracy =
            actualResponses.length > 0
              ? actualResponses.reduce((sum, r) => sum + (r.accuracy || 0), 0) /
                actualResponses.length
              : 0;

          // Determine quiz status
          let quizStatus: "upcoming" | "active" | "completed";
          const startDate = new Date(quiz.start_date);
          const endDate = new Date(quiz.end_date);
          const currentDate = new Date();

          if (currentDate < startDate) {
            quizStatus = "upcoming";
          } else if (currentDate >= startDate && currentDate <= endDate) {
            quizStatus = "active";
          } else {
            quizStatus = "completed";
          }

          return {
            quiz_id: quiz.id,
            quiz_name: quiz.quiz_name,
            total_questions: totalQuestions,
            total_students: totalStudents,
            completed_students: completedStudents,
            completion_rate: Math.round(completionRate * 100) / 100,
            average_accuracy: Math.round(averageAccuracy * 100) / 100,
            created_date: quiz.date_created,
            start_date: quiz.start_date,
            end_date: quiz.end_date,
            due_date: assignmentMetaByQuizId.get(quiz.id)?.due_date ?? null,
            target_score:
              assignmentMetaByQuizId.get(quiz.id)?.target_score ?? null,
            status: quizStatus,
          };
        } catch (error) {
          // Return basic quiz info if analytics fail
          return {
            quiz_id: quiz.id,
            quiz_name: quiz.quiz_name,
            total_questions: 0,
            total_students: 0,
            completed_students: 0,
            completion_rate: 0,
            average_accuracy: 0,
            created_date: quiz.date_created,
            start_date: quiz.start_date,
            end_date: quiz.end_date,
            due_date: assignmentMetaByQuizId.get(quiz.id)?.due_date ?? null,
            target_score:
              assignmentMetaByQuizId.get(quiz.id)?.target_score ?? null,
            status: "upcoming" as const,
          };
        }
      })
    );

    // Calculate summary statistics
    const totalQuizzes = totalCount || 0;
    const averageCompletionRate =
      quizzesWithCompletion.length > 0
        ? quizzesWithCompletion.reduce((sum, q) => sum + q.completion_rate, 0) /
          quizzesWithCompletion.length
        : 0;
    const totalStudentsParticipated = new Set(
      quizzesWithCompletion.flatMap((q) =>
        Array.from(
          { length: q.total_students },
          (_, i) => `${q.quiz_id}-student-${i}`
        )
      )
    ).size;
    const activeQuizzes = quizzesWithCompletion.filter(
      (q) => q.status === "active"
    ).length;

    const pageContext = pagination.getPageContext(
      quizzesWithCompletion.length,
      totalQuizzes
    );

    const response: QuizCompletionResponse = {
      quizzes: quizzesWithCompletion,
      page_context: pageContext,
      summary_stats: {
        total_quizzes: totalQuizzes,
        average_completion_rate: Math.round(averageCompletionRate * 100) / 100,
        total_students_participated: totalStudentsParticipated,
        active_quizzes: activeQuizzes,
      },
    };

    return ResponseWrapper.success(
      "Quiz completion data retrieved successfully",
      response
    );
  } catch (error) {
    return ResponseWrapper.error(error);
  }
}
