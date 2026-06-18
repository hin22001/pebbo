import { ClassroomDAO } from "@/src/app/api/lib/DAOs/classroomDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { Pagination } from "@/src/app/api/lib/utils/pagination";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { z } from "zod";

// Fetch a SINGLE classroom by id, scoped to the requesting teacher's membership.
// The /classroom/list route ignores classroom_id (it returns every classroom the
// teacher owns), so the detail page needs this dedicated, membership-guarded
// lookup to resolve the real classroom name + student count for a given id.
export async function GET(req: Request) {
  const schema = z.object({
    classroom_id: z.string(),
  });

  try {
    const request = new URLAdapter(req, schema);
    request.init();

    const classroom_id = parseInt(request.getURLProperty("classroom_id"));
    if (isNaN(classroom_id)) {
      throw new FlexibleError("Invalid classroom ID", 400);
    }

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["teacher"]);
    user.assertPaying(true);

    const schoolId = user.getSchoolId() as number;
    const classroomDAO = new ClassroomDAO(supabaseService);

    // Membership guard. The teacher participant row also carries the
    // classroom name + archived flag, so this doubles as the name fetch.
    const membership = await classroomDAO.getClassroomParticipants(
      schoolId,
      classroom_id,
      "teacher",
      undefined,
      auth.getUserId()
    );

    if (!membership?.count || !membership.data?.length) {
      throw new FlexibleError("Teacher is not part of classroom", 403);
    }

    const row = membership.data[0] as any;

    // Exact student headcount (confirmed + pending) for the header subtitle.
    // rows_per_page=1 keeps the payload tiny; PostgREST count is still exact.
    const studentsRes = await classroomDAO.getClassroomParticipants(
      schoolId,
      classroom_id,
      "student",
      new Pagination("1", "1")
    );

    const data = {
      classroom: {
        classroom_id: row.classroom_id,
        classroom_name: row.classroom_name,
        archived: row.archived,
        school_id: row.school_id,
        total_students: studentsRes.count ?? 0,
      },
    };

    return ResponseWrapper.success("Success get classroom", data);
  } catch (err: any) {
    return ResponseWrapper.error(
      "Failed get classroom",
      err?.status ?? 500,
      err?.message ?? ""
    );
  }
}
