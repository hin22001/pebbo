import { QuestionDAO } from "@/src/app/api/lib/DAOs/questionDAO";
import { QuizDAO } from "@/src/app/api/lib/DAOs/quizDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { z } from "zod";

// Schema for specific questions
const specificQuestionsSchema = z.object({
  quiz_name: z.string().min(1).max(100),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  question_type: z.literal("specific"),
  question_ids: z
    .array(z.number().int().positive())
    .refine((ids) => [5, 10, 15].includes(ids.length), {
      message: "Quiz must have exactly 5, 10, or 15 questions",
    }),
});

// Schema for AI-selected questions
const aiSelectedQuestionsSchema = z.object({
  quiz_name: z.string().min(1).max(100),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  question_type: z.literal("ai_selected"),
  question_count: z.enum([5, 10, 15]),
  categories: z.array(z.number().int().positive()).min(1),
  difficulties: z.array(z.number().int().positive()).min(1),
  year: z.number().int().positive(),
  region: z.enum(["en", "zh"]).default("en"),
});

// Combined schema using discriminated union
const createQuizSchema = z.discriminatedUnion("question_type", [
  specificQuestionsSchema,
  aiSelectedQuestionsSchema,
]);

export async function POST(req: Request) {
  type CreateQuizResponse = {
    quiz_id: number;
    quiz_name: string;
    start_date: string;
    end_date: string;
    question_count: number;
    questions_added: number;
    questions: {
      question_id: number;
      category: number;
      difficulty: number;
      subject: string;
      concept?: string;
    }[];
    created_by: string;
    created_at: string;
    question_selection_method: "specific" | "ai_selected";
  };

  try {
    const request = new BodyAdapter(req, createQuizSchema);
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

    const quizName = request.getBodyProperty("quiz_name");
    const startDate = request.getBodyProperty("start_date");
    const endDate = request.getBodyProperty("end_date");
    const questionType = request.getBodyProperty("question_type");

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      throw new FlexibleError("Start date must be before end date", 400);
    }

    // Create quiz first
    const quizDAO = new QuizDAO(supabaseService);
    const quizData = {
      quiz_name: quizName,
      school_id: schoolId,
      start_date: startDate,
      end_date: endDate,
    };

    const createdQuiz = await quizDAO.create([quizData]);
    if (!createdQuiz || createdQuiz.length === 0) {
      throw new FlexibleError("Failed to create quiz", 500);
    }

    const quizId = createdQuiz[0].id;
    let questionIds: number[] = [];
    let questions: any[] = [];

    // Handle question selection based on type
    if (questionType === "specific") {
      // Specific questions - validate and use provided question IDs
      questionIds = request.getBodyProperty("question_ids");

      // Validate that all question IDs exist and are accessible
      const { data: existingQuestions, error: questionsError } =
        await supabaseService
          .from("primary_questions")
          .select("id, outer_category, difficulty, subject, concept, audited")
          .in("id", questionIds)
          .eq("audited", true);

      if (questionsError) {
        throw new FlexibleError(
          `Failed to validate questions: ${questionsError.message}`,
          500
        );
      }

      if (
        !existingQuestions ||
        existingQuestions.length !== questionIds.length
      ) {
        throw new FlexibleError(
          "Some question IDs are invalid or not audited",
          400
        );
      }

      questions = existingQuestions;
    } else if (questionType === "ai_selected") {
      // AI-selected questions - use RPC to get random questions
      const questionCount = request.getBodyProperty("question_count");
      const categories = request.getBodyProperty("categories");
      const difficulties = request.getBodyProperty("difficulties");
      const year = request.getBodyProperty("year");
      const region = request.getBodyProperty("region");

      // Use QuestionDAO to get AI-selected questions
      const questionDAO = new QuestionDAO(supabaseService);
      const aiSelectedQuestions = await questionDAO.getQuestions(
        auth.getUserId(),
        region,
        categories,
        difficulties,
        year.toString()
      );

      if (!aiSelectedQuestions || aiSelectedQuestions.length === 0) {
        throw new FlexibleError(
          "No questions found matching the specified criteria",
          404
        );
      }

      // If we got more questions than needed, take the first N
      const selectedQuestions = aiSelectedQuestions.slice(0, questionCount);
      questionIds = selectedQuestions.map((q: any) => q.id);
      questions = selectedQuestions.map((q: any) => ({
        id: q.id,
        outer_category: q.outer_category,
        difficulty: q.difficulty,
        subject: "Maths", // Default subject from our analysis
        concept: q.concept || "",
      }));
    }

    // Add questions to quiz using existing RPC
    const quizQuestions = questionIds.map((questionId) => ({
      quiz_id: quizId,
      question_id: questionId,
    }));

    const addedQuestions = await quizDAO.insertQuestions(
      auth.getUserId(),
      quizQuestions
    );

    if (!addedQuestions || addedQuestions.length === 0) {
      throw new FlexibleError("Failed to add questions to quiz", 500);
    }

    // Get quiz creator info
    const { data: creatorInfo } = await supabaseService
      .from("users")
      .select("first_name, last_name")
      .eq("user_id", auth.getUserId())
      .single();

    const response: CreateQuizResponse = {
      quiz_id: quizId,
      quiz_name: quizName,
      start_date: startDate,
      end_date: endDate,
      question_count: questionIds.length,
      questions_added: addedQuestions.length,
      questions: questions.map((q) => ({
        question_id: q.id,
        category: q.outer_category,
        difficulty: q.difficulty,
        subject: q.subject,
        concept: q.concept,
      })),
      created_by: creatorInfo
        ? `${creatorInfo.first_name} ${creatorInfo.last_name}`
        : "Unknown",
      created_at: new Date().toISOString(),
      question_selection_method: questionType,
    };

    return ResponseWrapper.success(
      `Quiz created successfully with ${questionIds.length} questions`,
      response
    );
  } catch (err) {
    return ResponseWrapper.error(
      "Failed to create quiz",
      err?.status ?? 500,
      err?.message ?? ""
    );
  }
}
