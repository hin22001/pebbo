import { Supabase } from "@/src/app/api/lib/models/supabase";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { DefaultStudentData } from "@/src/app/api/lib/defaults/studentData";
import { StudentDAO } from "@/src/app/api/lib/DAOs/studentDAO";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapter(
      req,
      z
        .object({
          year: z.string(),
          education_level: z.string(),
        })
        .strict(),
    );
    await request.init();

    const reqBody = request.getBody();

    DefaultStudentData.assertContext(reqBody.education_level, reqBody.year);

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();
    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["student"]);
    user.assertPaying(true);

    const studentDAO = new StudentDAO(supabaseService);

    await studentDAO.setContext(
      auth.getUserId(),
      reqBody.education_level,
      reqBody.year,
    );

    return ResponseWrapper.success("Success setContext");
  } catch (err) {
    return ResponseWrapper.error("Failed setContext", 500, err?.message);
  }
}
