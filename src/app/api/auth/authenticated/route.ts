import { Auth } from "../../lib/middleware/auth";
import { Supabase } from "../../lib/models/supabase";
import { UserDAO } from "../../lib/DAOs/userDAO";
import { RoleResponse } from "@/src/app/api/lib/types/authResponse";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";

export async function GET() {
  try {
    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();
    const userDAO = new UserDAO(supabaseService);
    const userData = await userDAO.getUser(auth.getUserId());

    const data: RoleResponse = {
      role: userData.getRole(),
      paying: userData.getPaymentStatus(),
    };

    return ResponseWrapper.success("User Logged In", data);
  } catch (err) {
    return ResponseWrapper.error("User not logged in", 401);
  }
}
