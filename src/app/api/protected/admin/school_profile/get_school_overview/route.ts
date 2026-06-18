import { SchoolDAO } from "@/src/app/api/lib/DAOs/schoolDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";

export async function GET(req: Request) {
  try {
    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const userData = await userDAO.getUser(auth.getUserId());
    userData.assertRole(["admin"]);

    const schoolDAO = new SchoolDAO(supabaseService);
    const roleCounts = await schoolDAO.getOverview(
      userData.getSchoolId() as number,
    );

    return ResponseWrapper.success("Success: get school overview", roleCounts);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed get school overview",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
