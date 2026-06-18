import { QuizDAO } from "@/src/app/api/lib/DAOs/quizDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { z } from "zod";

export async function GET(req: Request) {
  type QuizDifficultyResponse = {
    quiz_id: number;
    quiz_name: string;
    difficulty_analysis: {
      difficulty_level: number;
      total_questions: number;
      total_attempts: number;
      correct_attempts: number;
      accuracy_rate: number;
      average_time: number;
      students_attempted: number;
    }[];
    category_analysis: {
      category: string;
      subject: string;
      total_questions: number;
      average_accuracy: number;
      average_time: number;
      difficulty_breakdown: {
        difficulty: number;
        questions: number;
        accuracy: number;
      }[];
    }[];
    overall_stats: {
      total_questions: number;
      total_attempts: number;
      overall_accuracy: number;
      average_time_per_question: number;
      most_difficult_category: string;
      easiest_category: string;
    };
  };

  const schema = z.object({
    quiz_id: z.string().transform(Number),
  });

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
      undefined // pagination
    );

    if (!responsesData.data || responsesData.data.length === 0) {
      // Return empty response if no data
      const emptyResponse: QuizDifficultyResponse = {
        quiz_id: quiz_id,
        quiz_name: quizData.quiz_name,
        difficulty_analysis: [],
        category_analysis: [],
        overall_stats: {
          total_questions: 0,
          total_attempts: 0,
          overall_accuracy: 0,
          average_time_per_question: 0,
          most_difficult_category: "N/A",
          easiest_category: "N/A",
        },
      };
      return ResponseWrapper.success(
        "Quiz difficulty analysis retrieved successfully",
        emptyResponse
      );
    }

    // Filter out responses with null student_id (unanswered questions)
    const actualResponses = responsesData.data.filter(
      (r) => r.student_id !== null
    );

    // Calculate difficulty analysis
    const difficultyStats = new Map();
    actualResponses.forEach((response) => {
      const difficulty = (response as any).difficulty || 1; // Default to difficulty 1 if not available
      if (!difficultyStats.has(difficulty)) {
        difficultyStats.set(difficulty, {
          difficulty_level: difficulty,
          total_questions: 0,
          total_attempts: 0,
          correct_attempts: 0,
          total_time: 0,
          students_attempted: new Set(),
        });
      }
      const stats = difficultyStats.get(difficulty);
      stats.total_attempts++;
      if (response.accuracy && response.accuracy > 0) {
        stats.correct_attempts++;
      }
      stats.total_time += response.time_taken || 0;
      stats.students_attempted.add(response.student_id);
    });

    // Count unique questions per difficulty level
    const questionsByDifficulty = new Map();
    responsesData.data.forEach((response) => {
      const difficulty = (response as any).difficulty || 1;
      if (!questionsByDifficulty.has(difficulty)) {
        questionsByDifficulty.set(difficulty, new Set());
      }
      questionsByDifficulty.get(difficulty).add(response.question_id);
    });

    // Update total questions count for each difficulty
    questionsByDifficulty.forEach((questionSet, difficulty) => {
      if (difficultyStats.has(difficulty)) {
        difficultyStats.get(difficulty).total_questions = questionSet.size;
      }
    });

    const difficultyAnalysis = Array.from(difficultyStats.values())
      .map((stats) => ({
        difficulty_level: stats.difficulty_level,
        total_questions: stats.total_questions,
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
        students_attempted: stats.students_attempted.size,
      }))
      .sort((a, b) => a.difficulty_level - b.difficulty_level);

    // Calculate category analysis
    const categoryStats = new Map();
    actualResponses.forEach((response) => {
      const categoryKey = `${response.category}-${response.subject}`;
      if (!categoryStats.has(categoryKey)) {
        categoryStats.set(categoryKey, {
          category: response.category,
          subject: response.subject,
          total_questions: 0,
          total_attempts: 0,
          correct_attempts: 0,
          total_time: 0,
          difficulty_breakdown: new Map(),
        });
      }
      const stats = categoryStats.get(categoryKey);
      stats.total_attempts++;
      if (response.accuracy && response.accuracy > 0) {
        stats.correct_attempts++;
      }
      stats.total_time += response.time_taken || 0;

      // Track difficulty breakdown within category
      const difficulty = (response as any).difficulty || 1;
      if (!stats.difficulty_breakdown.has(difficulty)) {
        stats.difficulty_breakdown.set(difficulty, {
          difficulty: difficulty,
          questions: 0,
          correct_attempts: 0,
          total_attempts: 0,
        });
      }
      const diffStats = stats.difficulty_breakdown.get(difficulty);
      diffStats.total_attempts++;
      if (response.accuracy && response.accuracy > 0) {
        diffStats.correct_attempts++;
      }
    });

    // Count unique questions per category
    const questionsByCategory = new Map();
    responsesData.data.forEach((response) => {
      const categoryKey = `${response.category}-${response.subject}`;
      if (!questionsByCategory.has(categoryKey)) {
        questionsByCategory.set(categoryKey, new Set());
      }
      questionsByCategory.get(categoryKey).add(response.question_id);
    });

    // Update total questions count for each category
    questionsByCategory.forEach((questionSet, categoryKey) => {
      if (categoryStats.has(categoryKey)) {
        categoryStats.get(categoryKey).total_questions = questionSet.size;
      }
    });

    const categoryAnalysis = Array.from(categoryStats.entries()).map(
      ([categoryKey, stats]) => ({
        category: stats.category,
        subject: stats.subject,
        total_questions: stats.total_questions,
        average_accuracy:
          stats.total_attempts > 0
            ? (stats.correct_attempts / stats.total_attempts) * 100
            : 0,
        average_time:
          stats.total_attempts > 0
            ? stats.total_time / stats.total_attempts
            : 0,
        difficulty_breakdown: Array.from(stats.difficulty_breakdown.values())
          .map((diff: any) => ({
            difficulty: diff.difficulty,
            questions: diff.total_attempts, // This represents attempts, not unique questions
            accuracy:
              diff.total_attempts > 0
                ? (diff.correct_attempts / diff.total_attempts) * 100
                : 0,
          }))
          .sort((a, b) => a.difficulty - b.difficulty),
      })
    );

    // Calculate overall stats
    const totalQuestions = new Set(responsesData.data.map((r) => r.question_id))
      .size;
    const totalAttempts = actualResponses.length;
    const overallAccuracy =
      totalAttempts > 0
        ? actualResponses.reduce((sum, r) => sum + (r.accuracy || 0), 0) /
          totalAttempts
        : 0;
    const averageTimePerQuestion =
      totalAttempts > 0
        ? actualResponses.reduce((sum, r) => sum + (r.time_taken || 0), 0) /
          totalAttempts
        : 0;

    // Find most difficult and easiest categories
    let mostDifficultCategory = "N/A";
    let easiestCategory = "N/A";
    if (categoryAnalysis.length > 0) {
      const sortedByAccuracy = categoryAnalysis.sort(
        (a, b) => a.average_accuracy - b.average_accuracy
      );
      mostDifficultCategory = sortedByAccuracy[0].category;
      easiestCategory = sortedByAccuracy[sortedByAccuracy.length - 1].category;
    }

    const overallStats = {
      total_questions: totalQuestions,
      total_attempts: totalAttempts,
      overall_accuracy: Math.round(overallAccuracy * 100) / 100,
      average_time_per_question: Math.round(averageTimePerQuestion * 100) / 100,
      most_difficult_category: mostDifficultCategory,
      easiest_category: easiestCategory,
    };

    const response: QuizDifficultyResponse = {
      quiz_id: quiz_id,
      quiz_name: quizData.quiz_name,
      difficulty_analysis: difficultyAnalysis,
      category_analysis: categoryAnalysis,
      overall_stats: overallStats,
    };

    return ResponseWrapper.success(
      "Quiz difficulty analysis retrieved successfully",
      response
    );
  } catch (error) {
    return ResponseWrapper.error(error);
  }
}
