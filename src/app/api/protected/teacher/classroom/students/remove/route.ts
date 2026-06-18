import { ClassroomDAO } from "@/src/app/api/lib/DAOs/classroomDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { UserClassroomID } from "@/src/app/api/lib/types/classroomTypes";
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
          email: z.string().email(),
        })
        .strict()
    );
    await request.init();

    const classroom_id = request.getBodyProperty("classroom_id");
    const email = request.getBodyProperty("email");

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["teacher"]);
    user.assertPaying(true);

    // Verify teacher has access to this classroom
    const classroomDAO = new ClassroomDAO(supabaseService);
    const classroomDetail = await classroomDAO.getClassroomParticipants(
      user.getSchoolId() as number,
      classroom_id,
      "teacher",
      undefined,
      auth.getUserId()
    );

    if (!classroomDetail?.count) {
      throw new FlexibleError("Teacher is not part of classroom", 401);
    }

    // Prepare data for single student removal
    const userClassroomData: UserClassroomID = [
      {
        email: email.toLowerCase().trim(),
        classroom_id: classroom_id,
      },
    ];

    // Use existing RPC function to remove student
    const failedRemovals = await classroomDAO.removeUsers(userClassroomData);

    if (failedRemovals.length > 0) {
      throw new FlexibleError(
        `Failed to remove student: ${failedRemovals[0]}`,
        400
      );
    }

    const data = {
      email: email,
      classroom_id: classroom_id,
      message: "Student removed successfully",
    };

    return ResponseWrapper.success(
      "Success remove student from classroom",
      data
    );
  } catch (err) {
    return ResponseWrapper.error(
      "Failed remove student from classroom",
      err?.status ?? 500,
      err?.message ?? ""
    );
  }
}
