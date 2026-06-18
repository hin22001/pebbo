import { ClassroomDAO } from "@/src/app/api/lib/DAOs/classroomDAO";
import { QuizCreatorDAO } from "@/src/app/api/lib/DAOs/quizCreatorDAO";
import { QuizDAO } from "@/src/app/api/lib/DAOs/quizDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { QuizBase } from "@/src/app/api/lib/types/quizTypes";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

export async function POST(req: Request) {
  const schema = z.object({
    quiz_data: z.array(
      z.object({
        quiz_name: z.string(),
        start_date: z.string(),
        end_date: z.string(),
      }),
    ),
  });

  try {
    const request = new BodyAdapter(req, schema);
    await request.init();

    const _quizData = request.getBody().quiz_data;

    if (_quizData.length > 500) {
      throw new FlexibleError(
        "Cannot insert more than 500 quizzes at a time",
        400,
      );
    }

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["admin", "teacher"]);
    user.assertPaying(true);

    const quizData: QuizBase[] = _quizData.map((quiz) => ({
      ...quiz,
      school_id: user.getSchoolId() as number,
    }));

    const quizDAO = new QuizDAO(supabaseService);
    const insertedQuizzes = await quizDAO.create(quizData);

    const data = {
      insertedQuizzes: insertedQuizzes,
    };

    return ResponseWrapper.success("Success create quiz", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed create quiz",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
