import { ClassroomDAO } from "@/src/app/api/lib/DAOs/classroomDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import {
  UserClassroomID,
  BulkStudentOperation,
} from "@/src/app/api/lib/types/classroomTypes";
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
          action: z.enum(["add_all", "remove_all"]),
          emails: z.array(z.string().email()).optional(),
        })
        .strict()
    );
    await request.init();

    const classroom_id = request.getBodyProperty("classroom_id");
    const action = request.getBodyProperty("action");
    const emails = request.getBodyProperty("emails") || [];

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

    if (!classroomDetail || classroomDetail.count === 0) {
      throw new FlexibleError("Teacher is not part of classroom", 401);
    }

    let userClassroomData: UserClassroomID = [];
    let result: BulkStudentOperation | undefined;

    if (action === "add_all") {
      if (emails.length === 0) {
        throw new FlexibleError("No emails provided for bulk add", 400);
      }

      if (emails.length > 500) {
        throw new FlexibleError(
          "Cannot add more than 500 students at a time",
          400
        );
      }

      userClassroomData = emails.map((email) => ({
        email: email.toLowerCase().trim(),
        classroom_id: classroom_id,
      }));

      const failedInserts = await classroomDAO.insertUsers(userClassroomData);

      result = {
        action: "add_all",
        totalEmails: emails.length,
        successfulInserts: emails.length - failedInserts.length,
        failedInserts: failedInserts,
        failedCount: failedInserts.length,
      };
    } else if (action === "remove_all") {
      if (emails.length === 0) {
        throw new FlexibleError("No emails provided for bulk remove", 400);
      }

      if (emails.length > 500) {
        throw new FlexibleError(
          "Cannot remove more than 500 students at a time",
          400
        );
      }

      userClassroomData = emails.map((email) => ({
        email: email.toLowerCase().trim(),
        classroom_id: classroom_id,
      }));

      const failedRemovals = await classroomDAO.removeUsers(userClassroomData);

      result = {
        action: "remove_all",
        totalEmails: emails.length,
        successfulRemovals: emails.length - failedRemovals.length,
        failedRemovals: failedRemovals,
        failedCount: failedRemovals.length,
      };
    }

    if (!result) {
      throw new FlexibleError("Invalid action specified", 400);
    }

    return ResponseWrapper.success(
      `Success ${action === "add_all" ? "add" : "remove"} students ${action === "add_all" ? "to" : "from"} classroom`,
      result
    );
  } catch (err) {
    return ResponseWrapper.error(
      "Failed bulk student operation",
      err?.status ?? 500,
      err?.message ?? ""
    );
  }
}
