import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { z } from "zod";

const deleteQuizSchema = z.object({
  quiz_id: z.coerce.number().int().positive(),
});

export async function DELETE(req: Request) {
  type DeleteQuizResponse = {
    quiz_id: number;
    deleted: boolean;
    questions_removed: number;
  };

  try {
    const request = new BodyAdapter(req, deleteQuizSchema);
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

    // Get question count before deletion
    const { count: questionCount, error: countError } = await supabaseService
      .from("quiz_junction")
      .select("*", { count: "exact", head: true })
      .eq("quiz_id", quizId);

    if (countError) {
      throw new FlexibleError(
        `Failed to get question count: ${countError.message}`,
        500
      );
    }

    // Delete quiz (this will cascade to quiz_junction and quiz_creators due to foreign key constraints)
    const { error: deleteError } = await supabaseService
      .from("quizzes")
      .delete()
      .eq("id", quizId)
      .eq("school_id", schoolId);

    if (deleteError) {
      throw new FlexibleError(
        `Failed to delete quiz: ${deleteError.message}`,
        500
      );
    }

    const response: DeleteQuizResponse = {
      quiz_id: quizId,
      deleted: true,
      questions_removed: questionCount || 0,
    };

    return ResponseWrapper.success(
      `Quiz deleted successfully. ${questionCount || 0} questions were removed.`,
      response
    );
  } catch (err) {
    return ResponseWrapper.error(
      "Failed to delete quiz",
      err?.status ?? 500,
      err?.message ?? ""
    );
  }
}
