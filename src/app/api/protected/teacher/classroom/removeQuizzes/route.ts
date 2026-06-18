import { ClassroomDAO } from "@/src/app/api/lib/DAOs/classroomDAO";
import { ClassroomQuizzesDAO } from "@/src/app/api/lib/DAOs/classroomQuizzesDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
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
        })
        .strict(),
    );
    await request.init();

    const quiz_ids = request.getBodyProperty("quiz_ids");
    const classroom_id = request.getBodyProperty("classroom_id");

    if (quiz_ids.length > 500) {
      throw new FlexibleError("Too many deletions at the same time", 400);
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

    if (!classroomDetail?.count ?? 0)
      throw new FlexibleError("Teacher does not own classroom", 401);

    const classroomQuizzesDAO = new ClassroomQuizzesDAO(supabaseService);
    const removedQuizzes = await classroomQuizzesDAO.delete(
      classroom_id,
      quiz_ids,
    );

    const data = {
      removedQuizzes: removedQuizzes,
    };

    return ResponseWrapper.success("Success remove quiz from classroom", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed remove quiz from classroom",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
