import { Auth } from "@/src/app/api/lib/middleware/auth";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();
    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertPaying(true);

    const userId = auth.getUserId();
    const year = new URL(req.url).searchParams.get("year") || undefined;

    const { data, error } = await (supabaseService as any).rpc(
      "get_student_dashboard_combined",
      {
        _user_id: userId,
        _year: year ? String(year) : null,
      },
    );

    if (error) throw error;

    return ResponseWrapper.success("Success dashboard getData", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed dashboard getData",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
