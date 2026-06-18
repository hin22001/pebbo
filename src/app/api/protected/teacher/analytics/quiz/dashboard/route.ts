import { QuizDAO } from "@/src/app/api/lib/DAOs/quizDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { z } from "zod";

export async function GET(req: Request) {
  type QuizDashboardResponse = {
    teacher_id: string;
    teacher_name: string;
    school_id: number;
    overview_stats: {
      total_quizzes: number;
      active_quizzes: number;
      completed_quizzes: number;
      total_students_participated: number;
      total_responses: number;
      average_quiz_accuracy: number;
    };
    recent_quizzes: {
      quiz_id: number;
      quiz_name: string;
      total_questions: number;
      total_responses: number;
      completion_rate: number;
      average_accuracy: number;
      status: "upcoming" | "active" | "completed";
      created_date: string;
    }[];
    top_performing_quizzes: {
      quiz_id: number;
      quiz_name: string;
      average_accuracy: number;
      completion_rate: number;
      total_responses: number;
    }[];
    category_performance: {
      category: string;
      subject: string;
      total_questions: number;
      average_accuracy: number;
      total_responses: number;
    }[];
    student_engagement: {
      total_students: number;
      active_students: number;
      completion_rate: number;
      average_accuracy: number;
    };
  };

  const schema = z.object({
    // No parameters needed for dashboard
  });

  try {
    const request = new URLAdapter(req, schema);
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

    // Get teacher details
    const teacherName = `${user.getData().first_name} ${user.getData().last_name}`;

    // Get all quizzes created by this teacher
    const { data: quizzesData, error: quizzesError } = await supabaseService
      .from("quizzes")
      .select(
        `
        id,
        quiz_name,
        date_created,
        start_date,
        end_date,
        quiz_creators!inner(user_id)
      `
      )
      .eq("school_id", schoolId)
      .eq("quiz_creators.user_id", auth.getUserId())
      .order("date_created", { ascending: false });

    if (quizzesError) {
      throw new FlexibleError(
        `Failed to fetch quizzes: ${quizzesError.message}`,
        500
      );
    }

    if (!quizzesData || quizzesData.length === 0) {
      // Return empty dashboard if no quizzes
      const emptyResponse: QuizDashboardResponse = {
        teacher_id: auth.getUserId(),
        teacher_name: teacherName,
        school_id: schoolId,
        overview_stats: {
          total_quizzes: 0,
          active_quizzes: 0,
          completed_quizzes: 0,
          total_students_participated: 0,
          total_responses: 0,
          average_quiz_accuracy: 0,
        },
        recent_quizzes: [],
        top_performing_quizzes: [],
        category_performance: [],
        student_engagement: {
          total_students: 0,
          active_students: 0,
          completion_rate: 0,
          average_accuracy: 0,
        },
      };
      return ResponseWrapper.success(
        "Quiz dashboard retrieved successfully",
        emptyResponse
      );
    }

    // Get detailed analytics for each quiz
    const quizDAO = new QuizDAO(supabaseService);
    const quizAnalytics = await Promise.all(
      quizzesData.map(async (quiz) => {
        try {
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

          const actualResponses =
            responsesData.data?.filter((r) => r.student_id !== null) || [];
          const totalQuestions = new Set(
            responsesData.data?.map((r) => r.question_id) || []
          ).size;
          const uniqueStudents = new Set(
            actualResponses.map((r) => r.student_id)
          );
          const completedStudents = Array.from(uniqueStudents).filter(
            (studentId) => {
              const studentResponses = actualResponses.filter(
                (r) => r.student_id === studentId
              );
              return studentResponses.length === totalQuestions;
            }
          ).length;

          const completionRate =
            uniqueStudents.size > 0
              ? (completedStudents / uniqueStudents.size) * 100
              : 0;
          const averageAccuracy =
            actualResponses.length > 0
              ? actualResponses.reduce((sum, r) => sum + (r.accuracy || 0), 0) /
                actualResponses.length
              : 0;

          // Determine quiz status
          let status: "upcoming" | "active" | "completed";
          const startDate = new Date(quiz.start_date);
          const endDate = new Date(quiz.end_date);
          const currentDate = new Date();

          if (currentDate < startDate) {
            status = "upcoming";
          } else if (currentDate >= startDate && currentDate <= endDate) {
            status = "active";
          } else {
            status = "completed";
          }

          return {
            quiz_id: quiz.id,
            quiz_name: quiz.quiz_name,
            total_questions: totalQuestions,
            total_responses: actualResponses.length,
            completion_rate: Math.round(completionRate * 100) / 100,
            average_accuracy: Math.round(averageAccuracy * 100) / 100,
            status: status,
            created_date: quiz.date_created,
            unique_students: uniqueStudents.size,
          };
        } catch (error) {
          return {
            quiz_id: quiz.id,
            quiz_name: quiz.quiz_name,
            total_questions: 0,
            total_responses: 0,
            completion_rate: 0,
            average_accuracy: 0,
            status: "upcoming" as const,
            created_date: quiz.date_created,
            unique_students: 0,
          };
        }
      })
    );

    // Calculate overview stats
    const totalQuizzes = quizAnalytics.length;
    const activeQuizzes = quizAnalytics.filter(
      (q) => q.status === "active"
    ).length;
    const completedQuizzes = quizAnalytics.filter(
      (q) => q.status === "completed"
    ).length;
    const totalStudentsParticipated = new Set(
      quizAnalytics.flatMap((q) =>
        Array.from(
          { length: q.unique_students },
          (_, i) => `${q.quiz_id}-student-${i}`
        )
      )
    ).size;
    const totalResponses = quizAnalytics.reduce(
      (sum, q) => sum + q.total_responses,
      0
    );
    const averageQuizAccuracy =
      quizAnalytics.length > 0
        ? quizAnalytics.reduce((sum, q) => sum + q.average_accuracy, 0) /
          quizAnalytics.length
        : 0;

    // Get recent quizzes (last 5)
    const recentQuizzes = quizAnalytics.slice(0, 5).map((q) => ({
      quiz_id: q.quiz_id,
      quiz_name: q.quiz_name,
      total_questions: q.total_questions,
      total_responses: q.total_responses,
      completion_rate: q.completion_rate,
      average_accuracy: q.average_accuracy,
      status: q.status,
      created_date: q.created_date,
    }));

    // Get top performing quizzes (by accuracy, min 5 responses)
    const topPerformingQuizzes = quizAnalytics
      .filter((q) => q.total_responses >= 5)
      .sort((a, b) => b.average_accuracy - a.average_accuracy)
      .slice(0, 5)
      .map((q) => ({
        quiz_id: q.quiz_id,
        quiz_name: q.quiz_name,
        average_accuracy: q.average_accuracy,
        completion_rate: q.completion_rate,
        total_responses: q.total_responses,
      }));

    // Calculate category performance
    const categoryStats = new Map();
    quizAnalytics.forEach((quiz) => {
      // This is a simplified version - in reality, we'd need to get category data from responses
      // For now, we'll use placeholder data
      if (!categoryStats.has("General")) {
        categoryStats.set("General", {
          category: "General",
          subject: "Mixed",
          total_questions: 0,
          average_accuracy: 0,
          total_responses: 0,
        });
      }
      const stats = categoryStats.get("General");
      stats.total_questions += quiz.total_questions;
      stats.total_responses += quiz.total_responses;
    });

    // Calculate average accuracy for categories
    categoryStats.forEach((stats, key) => {
      if (stats.total_responses > 0) {
        stats.average_accuracy =
          quizAnalytics
            .filter((q) => q.total_responses > 0)
            .reduce((sum, q) => sum + q.average_accuracy, 0) /
          quizAnalytics.filter((q) => q.total_responses > 0).length;
      }
    });

    const categoryPerformance = Array.from(categoryStats.values());

    // Calculate student engagement
    const allStudents = new Set();
    let totalAccuracySum = 0;
    let totalResponsesCount = 0;

    quizAnalytics.forEach((quiz) => {
      // This is simplified - in reality, we'd aggregate actual student data
      totalAccuracySum += quiz.average_accuracy * quiz.total_responses;
      totalResponsesCount += quiz.total_responses;
    });

    const averageAccuracy =
      totalResponsesCount > 0 ? totalAccuracySum / totalResponsesCount : 0;
    const activeStudents = totalStudentsParticipated; // Simplified
    const studentCompletionRate =
      totalStudentsParticipated > 0
        ? (activeStudents / totalStudentsParticipated) * 100
        : 0;

    const studentEngagement = {
      total_students: totalStudentsParticipated,
      active_students: activeStudents,
      completion_rate: Math.round(studentCompletionRate * 100) / 100,
      average_accuracy: Math.round(averageAccuracy * 100) / 100,
    };

    const response: QuizDashboardResponse = {
      teacher_id: auth.getUserId(),
      teacher_name: teacherName,
      school_id: schoolId,
      overview_stats: {
        total_quizzes: totalQuizzes,
        active_quizzes: activeQuizzes,
        completed_quizzes: completedQuizzes,
        total_students_participated: totalStudentsParticipated,
        total_responses: totalResponses,
        average_quiz_accuracy: Math.round(averageQuizAccuracy * 100) / 100,
      },
      recent_quizzes: recentQuizzes,
      top_performing_quizzes: topPerformingQuizzes,
      category_performance: categoryPerformance,
      student_engagement: studentEngagement,
    };

    return ResponseWrapper.success(
      "Quiz dashboard retrieved successfully",
      response
    );
  } catch (error) {
    return ResponseWrapper.error(error);
  }
}
