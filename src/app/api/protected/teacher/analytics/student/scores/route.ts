import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

export async function GET(req: Request) {
  type StudentScoresResponse = {
    student_id: string;
    student_name: string;
    student_email: string;
    current_scores: number[];
    score_categories: any;
    enabled_categories: any;
    score_data: any;
  };

  const schema = z.object({
    student_id: z.string().uuid(),
  });

  try {
    const request = new URLAdapter(req, schema);
    request.init();

    const student_id = request.getURLProperty("student_id");

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

    // Verify the student exists and belongs to the teacher's school
    const student = await userDAO.getUser(student_id);
    if (!student) {
      throw new FlexibleError("Student not found", 404);
    }

    // Check if student belongs to teacher's school
    if (student.getSchoolId() !== schoolId) {
      throw new FlexibleError("Student does not belong to your school", 403);
    }

    // Verify student role
    student.assertRole(["student"]);

    // Get student's current scores using RPC
    const { data: currentScores, error: scoresError } = await supabaseService.rpc(
      "get_student_current_score",
      {
        user_id_param: student_id,
      }
    );

    if (scoresError) {
      throw new FlexibleError(`Failed to get student scores: ${scoresError.message}`, 500);
    }

    // Get student's score categories using RPC
    const { data: scoreCategories, error: categoriesError } = await supabaseService.rpc(
      "get_student_score_categories",
      {
        user_id_param: student_id,
      }
    );

    if (categoriesError) {
      throw new FlexibleError(`Failed to get student score categories: ${categoriesError.message}`, 500);
    }

    // Get student's enabled categories using RPC
    const { data: enabledCategories, error: enabledError } = await supabaseService.rpc(
      "get_user_enabled_categories",
      {
        user_id_param: student_id,
      }
    );

    if (enabledError) {
      throw new FlexibleError(`Failed to get student enabled categories: ${enabledError.message}`, 500);
    }

    // Get student's score data using RPC
    const { data: scoreData, error: scoreDataError } = await supabaseService.rpc(
      "get_user_score_data",
      {
        user_id_param: student_id,
      }
    );

    if (scoreDataError) {
      throw new FlexibleError(`Failed to get student score data: ${scoreDataError.message}`, 500);
    }

    // Get student details
    const studentDetails = await userDAO.getUser(student_id);

    const response: StudentScoresResponse = {
      student_id: student_id,
      student_name: `${studentDetails.getFirstName()} ${studentDetails.getLastName()}`,
      student_email: studentDetails.getEmail(),
      current_scores: currentScores || [],
      score_categories: scoreCategories,
      enabled_categories: enabledCategories,
      score_data: scoreData,
    };

    return ResponseWrapper.success(response, "Student scores retrieved successfully");
  } catch (error) {
    return ResponseWrapper.error(error);
  }
}
