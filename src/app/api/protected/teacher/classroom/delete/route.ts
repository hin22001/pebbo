import { ClassroomDAO } from "@/src/app/api/lib/DAOs/classroomDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { z } from "zod";

const deleteClassroomSchema = z.object({
  classroom_id: z.coerce.number().int().positive(),
});

export async function DELETE(req: Request) {
  type DeleteClassroomResponse = {
    classroom_id: number;
    archived: boolean;
    deleted: boolean;
  };

  try {
    console.log("[Classroom Delete API] Request received");

    // Log raw request body
    const rawBody = await req.clone().text();
    console.log("[Classroom Delete API] Raw request body:", rawBody);

    const request = new BodyAdapter(req, deleteClassroomSchema);
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
    console.log(
      "[Classroom Delete API] Classroom ID from request:",
      classroomId
    );

    // Verify teacher has access to this classroom
    const classroomDAO = new ClassroomDAO(supabaseService);
    const classroomDetail = await classroomDAO.getClassroomParticipants(
      user.getSchoolId() as number,
      classroomId,
      "teacher",
      undefined,
      auth.getUserId()
    );

    console.log("[Classroom Delete API] Classroom detail:", classroomDetail);

    if (!classroomDetail || classroomDetail.count === 0) {
      console.log("[Classroom Delete API] Teacher is not part of classroom");
      throw new FlexibleError("Teacher is not part of classroom", 401);
    }

    // Soft delete classroom (set archived = true)
    const schoolId = user.getSchoolId();
    console.log("[Classroom Delete API] School ID:", schoolId);

    if (!schoolId) {
      console.log("[Classroom Delete API] User does not have a school ID");
      throw new FlexibleError("User does not have a school ID", 400);
    }

    console.log(
      "[Classroom Delete API] Updating classroom with ID:",
      classroomId
    );
    const { data, error } = await supabaseService
      .from("classrooms")
      .update({ archived: true })
      .eq("classroom_id", classroomId)
      .eq("school_id", schoolId)
      .select("classroom_id, archived")
      .single();

    if (error) {
      console.log("[Classroom Delete API] Error deleting classroom:", error);
      throw new FlexibleError(
        `Failed to delete classroom: ${error.message}`,
        500
      );
    }

    console.log("[Classroom Delete API] Update result data:", data);

    if (!data) {
      console.log("[Classroom Delete API] Classroom not found");
      throw new FlexibleError("Classroom not found", 404);
    }

    const response: DeleteClassroomResponse = {
      classroom_id: data.classroom_id,
      archived: data.archived,
      deleted: true,
    };

    console.log("[Classroom Delete API] Response:", response);

    return ResponseWrapper.success("Classroom deleted successfully", response);
  } catch (err) {
    console.log("[Classroom Delete API] Error:", err);
    return ResponseWrapper.error(
      "Failed to delete classroom",
      err?.status ?? 500,
      err?.message ?? ""
    );
  }
}
