import { ClassroomDAO } from "@/src/app/api/lib/DAOs/classroomDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapter(
      req,
      z
        .object({
          id: z.number(),
          classroom_id: z.number(),
        })
        .strict(),
    );
    await request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["student", "teacher"]);
    user.assertPaying(true);

    const classroomDAO = new ClassroomDAO(supabaseService);
    await classroomDAO.acceptInvitation(
      auth.getUserId(),
      request.getBodyProperty("classroom_id"),
      request.getBodyProperty("id"),
    );
    return ResponseWrapper.success("Success accept invitation");
  } catch (err) {
    return ResponseWrapper.error(
      "Failed accept invitation",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
