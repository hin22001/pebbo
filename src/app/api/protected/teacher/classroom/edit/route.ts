import { ClassroomDAO } from "@/src/app/api/lib/DAOs/classroomDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { z } from "zod";

const editClassroomSchema = z.object({
  classroom_id: z.coerce.number().int().positive(),
  classroom_name: z.string().min(1).max(100),
});

export async function PUT(req: Request) {
  type EditClassroomResponse = {
    classroom_id: number;
    classroom_name: string;
    updated: boolean;
  };

  try {
    const request = new BodyAdapter(req, editClassroomSchema);
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

    const classroomId = request.getBodyProperty("classroom_id");
    const classroomName = request.getBodyProperty("classroom_name");

    // Verify teacher has access to this classroom
    const classroomDAO = new ClassroomDAO(supabaseService);
    const classroomDetail = await classroomDAO.getClassroomParticipants(
      user.getSchoolId() as number,
      classroomId,
      "teacher",
      undefined,
      auth.getUserId()
    );

    if (!classroomDetail || classroomDetail.count === 0) {
      throw new FlexibleError("Teacher is not part of classroom", 401);
    }

    // Update classroom name
    const schoolId = user.getSchoolId();
    if (!schoolId) {
      throw new FlexibleError("User does not have a school ID", 400);
    }

    const { data, error } = await supabaseService
      .from("classrooms")
      .update({ classroom_name: classroomName })
      .eq("classroom_id", classroomId)
      .eq("school_id", schoolId)
      .select("classroom_id, classroom_name")
      .single();

    if (error) {
      throw new FlexibleError(
        `Failed to update classroom: ${error.message}`,
        500
      );
    }

    if (!data) {
      throw new FlexibleError("Classroom not found", 404);
    }

    const response: EditClassroomResponse = {
      classroom_id: data.classroom_id,
      classroom_name: data.classroom_name,
      updated: true,
    };

    return ResponseWrapper.success("Classroom updated successfully", response);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed to update classroom",
      err?.status ?? 500,
      err?.message ?? ""
    );
  }
}
