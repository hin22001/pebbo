import { QuizDAO } from "@/src/app/api/lib/DAOs/quizDAO";
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

const quizListSchema = paginationSchema.merge(
  z.object({
    search: z.union([z.string(), z.literal("")]).optional(),
    status: z.union([z.string(), z.literal("")]).optional(),
    date_created_start: z.union([z.string(), z.literal("")]).optional(),
    date_created_end: z.union([z.string(), z.literal("")]).optional(),
    start_date_start: z.union([z.string(), z.literal("")]).optional(),
    start_date_end: z.union([z.string(), z.literal("")]).optional(),
    end_date_start: z.union([z.string(), z.literal("")]).optional(),
    end_date_end: z.union([z.string(), z.literal("")]).optional(),
  })
);

export async function GET(req: Request) {
  type QuizListResponse = {
    quizzes: {
      id: number;
      quiz_name: string;
      date_created: string;
      start_date: string;
      end_date: string;
      question_count: number;
      status: "upcoming" | "active" | "completed";
      created_by: string;
    }[];
    page_context: PageContext;
  };

  try {
    const request = new URLAdapter(req, quizListSchema);
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

    // Get pagination parameters
    const pagination = new Pagination(
      request.getURLProperty("page_number"),
      request.getURLProperty("rows_per_page")
    );

    // Get filter parameters
    const searchTerm = request.getURLProperty("search");
    const status = request.getURLProperty("status");
    const dateCreatedStart = request.getURLProperty("date_created_start");
    const dateCreatedEnd = request.getURLProperty("date_created_end");
    const startDateStart = request.getURLProperty("start_date_start");
    const startDateEnd = request.getURLProperty("start_date_end");
    const endDateStart = request.getURLProperty("end_date_start");
    const endDateEnd = request.getURLProperty("end_date_end");

    // Get quizzes with question counts
    const {
      data: quizzesData,
      count,
      error,
    } = await supabaseService
      .from("quizzes")
      .select(
        `
        id,
        quiz_name,
        date_created,
        start_date,
        end_date
      `,
        { count: "exact" }
      )
      .eq("school_id", schoolId)
      .order("date_created", { ascending: false })
      .limit(pagination.getRowsPerPage())
      .range(pagination.getOffsetStart(), pagination.getOffsetEnd());

    // Filter quizzes by creator
    const userId = auth.getUserId();
    const { data: creatorQuizzes } = await supabaseService
      .from("quiz_creators")
      .select("quiz_id")
      .eq("user_id", userId);

    const creatorQuizIds = creatorQuizzes?.map((q) => q.quiz_id) || [];
    const filteredQuizzes =
      quizzesData?.filter((quiz) => creatorQuizIds.includes(quiz.id)) || [];

    if (error) {
      throw new FlexibleError(`Failed to fetch quizzes: ${error.message}`, 500);
    }

    // Get question counts for each quiz
    const quizIds = filteredQuizzes?.map((q) => q.id) || [];
    let questionCounts: { [key: number]: number } = {};

    if (quizIds.length > 0) {
      const { data: questionCountData, error: countError } =
        await supabaseService
          .from("quiz_junction")
          .select("quiz_id")
          .in("quiz_id", quizIds);

      if (countError) {
        throw new FlexibleError(
          `Failed to fetch question counts: ${countError.message}`,
          500
        );
      }

      // Count questions per quiz
      questionCounts =
        questionCountData?.reduce(
          (acc, item) => {
            acc[item.quiz_id] = (acc[item.quiz_id] || 0) + 1;
            return acc;
          },
          {} as { [key: number]: number }
        ) || {};
    }

    // Process quizzes and apply filters
    let processedQuizzes =
      filteredQuizzes?.map((quiz) => {
        const now = new Date();
        const startDate = new Date(quiz.start_date);
        const endDate = new Date(quiz.end_date);

        let quizStatus: "upcoming" | "active" | "completed";
        if (now < startDate) {
          quizStatus = "upcoming";
        } else if (now >= startDate && now <= endDate) {
          quizStatus = "active";
        } else {
          quizStatus = "completed";
        }

        return {
          id: quiz.id,
          quiz_name: quiz.quiz_name,
          date_created: quiz.date_created,
          start_date: quiz.start_date,
          end_date: quiz.end_date,
          question_count: questionCounts[quiz.id] || 0,
          status: quizStatus,
          created_by: "Teacher", // Simplified for now
        };
      }) || [];

    // Apply search filter
    if (searchTerm && searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      processedQuizzes = processedQuizzes.filter((quiz) =>
        quiz.quiz_name.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (status && status !== "") {
      processedQuizzes = processedQuizzes.filter(
        (quiz) => quiz.status === status
      );
    }

    // Apply date filters
    if (dateCreatedStart) {
      const startDate = new Date(dateCreatedStart);
      processedQuizzes = processedQuizzes.filter(
        (quiz) => new Date(quiz.date_created) >= startDate
      );
    }

    if (dateCreatedEnd) {
      const endDate = new Date(dateCreatedEnd);
      processedQuizzes = processedQuizzes.filter(
        (quiz) => new Date(quiz.date_created) <= endDate
      );
    }

    if (startDateStart) {
      const startDate = new Date(startDateStart);
      processedQuizzes = processedQuizzes.filter(
        (quiz) => new Date(quiz.start_date) >= startDate
      );
    }

    if (startDateEnd) {
      const endDate = new Date(startDateEnd);
      processedQuizzes = processedQuizzes.filter(
        (quiz) => new Date(quiz.start_date) <= endDate
      );
    }

    if (endDateStart) {
      const startDate = new Date(endDateStart);
      processedQuizzes = processedQuizzes.filter(
        (quiz) => new Date(quiz.end_date) >= startDate
      );
    }

    if (endDateEnd) {
      const endDate = new Date(endDateEnd);
      processedQuizzes = processedQuizzes.filter(
        (quiz) => new Date(quiz.end_date) <= endDate
      );
    }

    const pageContext = pagination.getPageContext(
      processedQuizzes.length,
      count || 0
    );

    const data: QuizListResponse = {
      quizzes: processedQuizzes,
      page_context: pageContext,
    };

    return ResponseWrapper.success(
      "Teacher quizzes retrieved successfully",
      data
    );
  } catch (err) {
    return ResponseWrapper.error(
      "Failed to get teacher quizzes",
      err?.status ?? 500,
      err?.message ?? ""
    );
  }
}
