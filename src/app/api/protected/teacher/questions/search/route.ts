import { QuestionDAO } from "@/src/app/api/lib/DAOs/questionDAO";
import { UserQuestionsDAO } from "@/src/app/api/lib/DAOs/userQuestionsDAO";
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

const questionSearchSchema = paginationSchema.merge(
  z.object({
    search: z.union([z.string(), z.literal("")]).optional(),
    categories: z.union([z.string(), z.literal("")]).optional(),
    difficulties: z.union([z.string(), z.literal("")]).optional(),
    subjects: z.union([z.string(), z.literal("")]).optional(),
    year: z.union([z.string(), z.literal("")]).optional(),
    region: z.enum(["en", "zh"]).optional().default("en"),
    question_type: z
      .enum(["primary", "custom", "both"])
      .optional()
      .default("both"),
    audited_only: z.union([z.string(), z.literal("")]).optional(),
    mutable_only: z.union([z.string(), z.literal("")]).optional(),
  })
);

export async function GET(req: Request) {
  type QuestionSearchResponse = {
    primary_questions: any[];
    custom_questions: any[];
    page_context: PageContext;
    total_primary: number;
    total_custom: number;
  };

  try {
    const request = new URLAdapter(req, questionSearchSchema);
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

    const searchTerm = request.getURLProperty("search");
    const categories = request.getURLProperty("categories");
    const difficulties = request.getURLProperty("difficulties");
    const subjects = request.getURLProperty("subjects");
    const year = request.getURLProperty("year");
    const region = request.getURLProperty("region");
    const questionType = request.getURLProperty("question_type");
    const auditedOnly = request.getURLProperty("audited_only");
    const mutableOnly = request.getURLProperty("mutable_only");

    let primaryQuestions: any[] = [];
    let customQuestions: any[] = [];
    let totalPrimary = 0;
    let totalCustom = 0;

    // Parse filter arrays
    const categoryArray = categories
      ? categories
          .split(",")
          .map(Number)
          .filter((n) => !isNaN(n))
      : [];
    const difficultyArray = difficulties
      ? difficulties
          .split(",")
          .map(Number)
          .filter((n) => !isNaN(n))
      : [];
    const subjectArray = subjects
      ? subjects.split(",").filter((s) => s.trim())
      : [];
    const yearValue = year ? parseInt(year) : undefined;

    // Search Primary Questions
    if (questionType === "primary" || questionType === "both") {
      try {
        // Use RPC for category-based search if categories are provided
        if (
          categoryArray.length > 0 &&
          difficultyArray.length > 0 &&
          yearValue
        ) {
          const questionDAO = new QuestionDAO(supabaseService);
          primaryQuestions = await questionDAO.getQuestions(
            auth.getUserId(),
            region,
            categoryArray,
            difficultyArray,
            yearValue.toString()
          );
          totalPrimary = primaryQuestions.length;
        } else {
          // Use direct query for advanced search
          let query = supabaseService
            .from("primary_questions")
            .select("*", { count: "exact" })
            .eq("audited", true);

          // Apply filters
          if (subjectArray.length > 0) {
            query = query.in("subject", subjectArray);
          }
          if (categoryArray.length > 0) {
            query = query.in("outer_category", categoryArray);
          }
          if (difficultyArray.length > 0) {
            query = query.in("difficulty", difficultyArray);
          }
          if (yearValue) {
            query = query.eq("year", yearValue);
          }

          // Apply search term
          if (searchTerm && searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            query = query.or(
              `concept.ilike.%${search}%,subject.ilike.%${search}%`
            );
          }

          // Apply pagination
          query = query
            .order("id", { ascending: false })
            .limit(pagination.getRowsPerPage())
            .range(pagination.getOffsetStart(), pagination.getOffsetEnd());

          const { data, count, error } = await query;
          if (error) throw error;

          primaryQuestions = data || [];
          totalPrimary = count || 0;
        }
      } catch (error) {
        console.error("Error searching primary questions:", error);
        primaryQuestions = [];
        totalPrimary = 0;
      }
    }

    // Search Custom Questions
    if (questionType === "custom" || questionType === "both") {
      try {
        const userQuestionsDAO = new UserQuestionsDAO(supabaseService);

        // Parse mutable filter
        let mutableFilter: boolean | undefined;
        if (mutableOnly === "true") {
          mutableFilter = true;
        } else if (mutableOnly === "false") {
          mutableFilter = false;
        }

        const customResult = await userQuestionsDAO.get(
          schoolId,
          "desc",
          pagination,
          undefined, // question_id
          subjects || undefined, // category
          subjectArray.length > 0 ? subjectArray[0] : undefined, // subject
          undefined, // created_by
          undefined, // created_at_start
          undefined, // created_at_end
          mutableFilter
        );

        customQuestions = customResult.data || [];
        totalCustom = customResult.count || 0;

        // Apply search term to custom questions
        if (searchTerm && searchTerm.trim()) {
          const search = searchTerm.toLowerCase();
          customQuestions = customQuestions.filter((q: any) => {
            const questionText = JSON.stringify(q.question || {}).toLowerCase();
            const concept = (q.category || "").toLowerCase();
            const subject = (q.subject || "").toLowerCase();
            return (
              questionText.includes(search) ||
              concept.includes(search) ||
              subject.includes(search)
            );
          });
        }
      } catch (error) {
        console.error("Error searching custom questions:", error);
        customQuestions = [];
        totalCustom = 0;
      }
    }

    // Calculate combined pagination context
    const totalResults = totalPrimary + totalCustom;
    const pageContext = pagination.getPageContext(
      primaryQuestions.length + customQuestions.length,
      totalResults
    );

    const data: QuestionSearchResponse = {
      primary_questions: primaryQuestions,
      custom_questions: customQuestions,
      page_context: pageContext,
      total_primary: totalPrimary,
      total_custom: totalCustom,
    };

    return ResponseWrapper.success("Question search completed", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed to search questions",
      err?.status ?? 500,
      err?.message ?? ""
    );
  }
}
