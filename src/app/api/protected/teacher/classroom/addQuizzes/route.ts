import { ClassroomDAO } from "@/src/app/api/lib/DAOs/classroomDAO";
import { ClassroomQuizzesDAO } from "@/src/app/api/lib/DAOs/classroomQuizzesDAO";
import { QuizDAO } from "@/src/app/api/lib/DAOs/quizDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ClassroomQuiz } from "@/src/app/api/lib/types/classroomTypes";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapter(
      req,
      z
        .object({
          classroom_id: z.coerce.number(),
          quiz_ids: z.array(z.coerce.number()),
          // Optional per-assignment metadata. Kept inside .strict() so only
          // these two extra keys are allowed (the modal sends an ISO timestamp
          // and a 0-100 int). Without these, picking a due date / target score
          // made the body fail .strict() parsing → 400.
          due_date: z.string().datetime().optional(),
          target_score: z.coerce.number().int().min(0).max(100).optional(),
        })
        .strict(),
    );
    await request.init();

    const quiz_ids = request.getBodyProperty("quiz_ids");
    const classroom_id = request.getBodyProperty("classroom_id");

    if (quiz_ids.length > 500) {
      throw new FlexibleError("Too many insertions at the same time", 400);
    }

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["teacher"]);
    user.assertPaying(true);

    const classroomDAO = new ClassroomDAO(supabaseService);
    const classroomDetail = await classroomDAO.getClassroomParticipants(
      user.getSchoolId() as number,
      classroom_id,
      "teacher",
      undefined,
      auth.getUserId(),
    );

    if (!classroomDetail?.count ?? 0) {
      throw new FlexibleError("Teacher is not part of classroom", 401);
    }

    const quizDAO = new QuizDAO(supabaseService);
    const quizData = await quizDAO.getByIds(
      user.getSchoolId() as number, //make sure teacher is part of school
      quiz_ids,
    );

    if (quizData.length != request.getBodyProperty("quiz_ids").length) {
      throw new FlexibleError("Quiz IDs are invalid", 400);
    }

    const due_date = request.getBodyProperty("due_date") ?? null;
    const target_score = request.getBodyProperty("target_score") ?? null;

    const classroomQuizData: ClassroomQuiz[] = request
      .getBodyProperty("quiz_ids")
      .map((quiz_id) => ({
        quiz_id,
        classroom_id,
        due_date,
        target_score,
      }));

    const classroomQuizzesDAO = new ClassroomQuizzesDAO(supabaseService);
    const addedClassroomQuizzes =
      await classroomQuizzesDAO.insert(classroomQuizData);

    const data = {
      addedClassroomQuizzes: addedClassroomQuizzes,
    };

    return ResponseWrapper.success("Success add quiz to classroom", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed add quiz to classroom",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
