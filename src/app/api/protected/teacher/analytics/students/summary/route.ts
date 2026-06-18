import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { PageContext } from "@/src/app/api/lib/types/pagination";
import { Pagination } from "@/src/app/api/lib/utils/pagination";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

const paginationSchema = z.object({
  page_number: z.string().transform(Number).default("1"),
  rows_per_page: z.string().transform(Number).default("20"),
});

export async function GET(req: Request) {
  type StudentsSummaryResponse = {
    students: {
      student_id: string;
      student_name: string;
      student_email: string;
      current_scores: number[];
      total_questions_completed: number;
      average_accuracy: number;
      last_activity?: string;
      classroom_names: string[];
    }[];
    page_context: PageContext;
    summary_stats: {
      total_students: number;
      average_scores: number[];
      total_questions_completed: number;
      students_with_recent_activity: number;
    };
  };

  const schema = paginationSchema.merge(
    z.object({
      search: z.union([z.string(), z.literal("")]).optional(),
      classroom_id: z.string().transform(Number).optional(),
    })
  );

  try {
    const request = new URLAdapter(req, schema);
    request.init();

    const searchTerm = request.getURLProperty("search");
    const classroomId = request.getURLProperty("classroom_id");

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
      throw new Error("User does not have a school ID");
    }

    // Get pagination parameters
    const pagination = new Pagination(
      request.getURLProperty("page_number"),
      request.getURLProperty("rows_per_page")
    );

    // Build query for students in teacher's school.
    // NB: public.users PK is `user_id` (uuid), and public.users has no `email`
    // column — email lives in auth.users and is fetched separately below.
    let studentsQuery = supabaseService
      .from("users")
      .select(
        `
        user_id,
        first_name,
        last_name,
        classroom_participants!inner(
          classroom_id,
          classrooms!inner(
            classroom_id,
            classroom_name,
            school_id
          )
        )
      `,
        { count: "exact" }
      )
      .eq("role", "student")
      .eq("classroom_participants.classrooms.school_id", schoolId);

    // Apply classroom filter if specified
    if (classroomId) {
      studentsQuery = studentsQuery.eq(
        "classroom_participants.classroom_id",
        classroomId
      );
    }

    // Apply search filter if provided
    if (searchTerm && searchTerm.trim()) {
      studentsQuery = studentsQuery.or(
        `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`
      );
    }

    // Get total count
    const { count: totalCount } = await studentsQuery;

    // Apply pagination
    const { data: studentsData, error: studentsError } =
      await studentsQuery.range(
        pagination.getOffsetStart(),
        pagination.getOffsetEnd()
      );

    if (studentsError) {
      throw new Error(`Failed to fetch students: ${studentsError.message}`);
    }

    if (!studentsData) {
      throw new Error("No students found");
    }

    // Batch-fetch emails from auth.users (public.users has no email column)
    const studentIds = studentsData.map((s: { user_id: string }) => s.user_id);
    const emailMap: Record<string, string> = {};
    if (studentIds.length > 0) {
      const { data: authRows } = await supabaseService
        .schema("auth")
        .from("users")
        .select("id, email")
        .in("id", studentIds);
      (authRows ?? []).forEach((r: { id: string; email: string | null }) => {
        if (r.email) emailMap[r.id] = r.email;
      });
    }

    // Get detailed information for each student
    const studentsWithDetails = await Promise.all(
      studentsData.map(async (student) => {
        try {
          // Get student's current scores using RPC
          const { data: currentScores } = await supabaseService.rpc(
            "get_student_current_score",
            {
              user_id_param: student.user_id,
            }
          );

          // Get total questions completed
          const { count: questionsCompleted } = await supabaseService
            .from("completed_questions")
            .select("*", { count: "exact", head: true })
            .eq("user_id", student.user_id);

          // Get average accuracy
          const { data: accuracyData } = await supabaseService
            .from("completed_questions")
            .select("accuracy")
            .eq("user_id", student.user_id);

          const averageAccuracy =
            accuracyData && accuracyData.length > 0
              ? accuracyData.reduce((sum, item) => sum + item.accuracy, 0) /
                accuracyData.length
              : 0;

          // Get last activity
          const { data: lastActivity } = await supabaseService
            .from("completed_questions")
            .select("date")
            .eq("user_id", student.user_id)
            .order("date", { ascending: false })
            .limit(1)
            .single();

          // Get classroom names
          const classroomNames = student.classroom_participants
            .map((cp: any) => cp.classrooms.classroom_name)
            .filter((name: string) => name);

          return {
            student_id: student.user_id,
            student_name: `${student.first_name} ${student.last_name}`,
            student_email: emailMap[student.user_id] ?? "",
            current_scores: currentScores || [],
            total_questions_completed: questionsCompleted || 0,
            average_accuracy: Math.round(averageAccuracy * 100) / 100,
            last_activity: lastActivity?.date,
            classroom_names: classroomNames,
          };
        } catch (error) {
          // If there's an error getting details, return student with basic info
          return {
            student_id: student.user_id,
            student_name: `${student.first_name} ${student.last_name}`,
            student_email: emailMap[student.user_id] ?? "",
            current_scores: [],
            total_questions_completed: 0,
            average_accuracy: 0,
            last_activity: undefined,
            classroom_names: student.classroom_participants
              .map((cp: any) => cp.classrooms.classroom_name)
              .filter((name: string) => name),
          };
        }
      })
    );

    // Calculate summary statistics
    const totalStudents = totalCount || 0;
    const allScores = studentsWithDetails.flatMap((s) => s.current_scores);
    const averageScores =
      allScores.length > 0
        ? allScores.reduce((acc, score, _, arr) => acc + score / arr.length, 0)
        : 0;
    const totalQuestionsCompleted = studentsWithDetails.reduce(
      (sum, s) => sum + s.total_questions_completed,
      0
    );
    const studentsWithRecentActivity = studentsWithDetails.filter(
      (s) => s.last_activity
    ).length;

    const pageContext = pagination.getPageContext(
      studentsWithDetails.length,
      totalStudents
    );

    const response: StudentsSummaryResponse = {
      students: studentsWithDetails,
      page_context: pageContext,
      summary_stats: {
        total_students: totalStudents,
        average_scores: [Math.round(averageScores * 100) / 100],
        total_questions_completed: totalQuestionsCompleted,
        students_with_recent_activity: studentsWithRecentActivity,
      },
    };

    return ResponseWrapper.success(
      response,
      "Students summary retrieved successfully"
    );
  } catch (error) {
    return ResponseWrapper.error(error);
  }
}
