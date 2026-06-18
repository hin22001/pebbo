import { ClassroomDAO } from "@/src/app/api/lib/DAOs/classroomDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { UserClassroomID } from "@/src/app/api/lib/types/classroomTypes";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { userClassIDSchema } from "@/src/app/api/lib/validation/classroomSchema";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapter(req, userClassIDSchema);
    await request.init();

    const users = request.getBodyProperty("users") as UserClassroomID;

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["admin", "teacher"]);

    if (users.length > 500) {
      throw new FlexibleError(
        "Cannot add more than 500 students at a time",
        400,
      );
    }

    //need to do non transactional insert and return non inserted rows

    const classroomDAO = new ClassroomDAO(supabaseService);

    const failedInserts = await classroomDAO.insertUsers(users);

    const data = {
      failedInserts: failedInserts,
    };

    return ResponseWrapper.success(
      "Success invite students to classroom",
      data,
    );
  } catch (err) {
    return ResponseWrapper.error(
      "Failed invite student to classroom",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
