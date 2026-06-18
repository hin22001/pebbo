import { ClassroomDAO } from "@/src/app/api/lib/DAOs/classroomDAO";
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
  rows_per_page: z.string().transform(Number).default("10"),
});

export async function GET(req: Request) {
  type ClassroomOverviewResponse = {
    classroom_id: number;
    classroom_name: string;
    total_students: number;
    students: {
      student_id: string;
      student_name: string;
      student_email: string;
      current_scores: number[];
      last_activity?: string;
    }[];
    page_context: PageContext;
  };

  const schema = paginationSchema.merge(
    z.object({
      classroom_id: z.string().transform(Number),
    })
  );

  try {
    const request = new URLAdapter(req, schema);
    request.init();

    const classroom_id = request.getURLProperty("classroom_id");

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

    // Verify teacher has access to this classroom
    const classroomDAO = new ClassroomDAO(supabaseService);
    const classroomDetail = await classroomDAO.getClassroomParticipants(
      schoolId,
      classroom_id,
      "teacher",
      undefined,
      auth.getUserId()
    );

    if (!classroomDetail || classroomDetail.count === 0) {
      throw new Error("Teacher is not part of classroom");
    }

    // Get pagination parameters
    const pagination = new Pagination(
      request.getURLProperty("page_number").toString(),
      request.getURLProperty("rows_per_page").toString()
    );

    // Get classroom information
    const { data: classroomData, error: classroomError } = await supabaseService
      .from("classrooms")
      .select("classroom_id, classroom_name")
      .eq("classroom_id", classroom_id)
      .eq("school_id", schoolId)
      .single();

    if (classroomError || !classroomData) {
      throw new Error("Classroom not found");
    }

    // Get students in classroom with pagination
    const studentsData = await classroomDAO.getClassroomParticipants(
      schoolId,
      classroom_id,
      "student",
      pagination
    );

    // Get student scores for each student
    const studentsWithScores = await Promise.all(
      studentsData.data.map(async (student) => {
        try {
          // Get student's current scores using RPC
          const { data: currentScores } = await supabaseService.rpc(
            "get_student_current_score",
            {
              user_id_param: student.user_id!,
            }
          );

          // Get last activity from completed questions
          const { data: lastActivity } = await supabaseService
            .from("completed_questions")
            .select("completed_at")
            .eq("user_id", student.user_id!)
            .order("completed_at", { ascending: false })
            .limit(1)
            .single();

          return {
            student_id: student.user_id!,
            student_name: `${student.first_name} ${student.last_name}`,
            student_email: student.email!,
            current_scores: currentScores || [],
            last_activity: lastActivity?.completed_at,
          };
        } catch (error) {
          // If there's an error getting scores, return student without scores
          return {
            student_id: student.user_id!,
            student_name: `${student.first_name} ${student.last_name}`,
            student_email: student.email!,
            current_scores: [],
            last_activity: undefined,
          };
        }
      })
    );

    const pageContext = pagination.getPageContext(
      studentsWithScores.length,
      studentsData.count as number
    );

    const response: ClassroomOverviewResponse = {
      classroom_id: classroomData.classroom_id,
      classroom_name: classroomData.classroom_name,
      total_students: studentsData.count as number,
      students: studentsWithScores,
      page_context: pageContext,
    };

    return ResponseWrapper.success(
      "Classroom overview retrieved successfully",
      response
    );
  } catch (error) {
    return ResponseWrapper.error(error);
  }
}
