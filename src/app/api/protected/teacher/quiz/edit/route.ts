import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { z } from "zod";

const editQuizSchema = z.object({
  quiz_id: z.coerce.number().int().positive(),
  quiz_name: z.string().min(1).max(100).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

export async function PUT(req: Request) {
  type EditQuizResponse = {
    quiz_id: number;
    quiz_name: string;
    start_date: string;
    end_date: string;
    updated: boolean;
  };

  try {
    const request = new BodyAdapter(req, editQuizSchema);
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

    const quizId = request.getBodyProperty("quiz_id");
    const quizName = request.getBodyProperty("quiz_name");
    const startDate = request.getBodyProperty("start_date");
    const endDate = request.getBodyProperty("end_date");

    // Verify teacher is the creator of this quiz
    const { data: quizCreator, error: creatorError } = await supabaseService
      .from("quiz_creators")
      .select("user_id")
      .eq("quiz_id", quizId)
      .eq("user_id", auth.getUserId())
      .single();

    if (creatorError || !quizCreator) {
      throw new FlexibleError("Teacher is not the creator of this quiz", 401);
    }

    // Validate dates if both are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        throw new FlexibleError("Start date must be before end date", 400);
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (quizName !== undefined) updateData.quiz_name = quizName;
    if (startDate !== undefined) updateData.start_date = startDate;
    if (endDate !== undefined) updateData.end_date = endDate;

    if (Object.keys(updateData).length === 0) {
      throw new FlexibleError("No fields to update", 400);
    }

    // Update quiz
    const { data, error } = await supabaseService
      .from("quizzes")
      .update(updateData)
      .eq("id", quizId)
      .eq("school_id", schoolId)
      .select("id, quiz_name, start_date, end_date")
      .single();

    if (error) {
      throw new FlexibleError(`Failed to update quiz: ${error.message}`, 500);
    }

    if (!data) {
      throw new FlexibleError("Quiz not found", 404);
    }

    const response: EditQuizResponse = {
      quiz_id: data.id,
      quiz_name: data.quiz_name,
      start_date: data.start_date,
      end_date: data.end_date,
      updated: true,
    };

    return ResponseWrapper.success("Quiz updated successfully", response);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed to update quiz",
      err?.status ?? 500,
      err?.message ?? ""
    );
  }
}
