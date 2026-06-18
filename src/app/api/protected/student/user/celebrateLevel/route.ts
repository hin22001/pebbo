"use server";

import { StudentDAO } from "@/src/app/api/lib/DAOs/studentDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";

export async function POST(req: Request) {
  try {
    const { level } = await req.json();

    if (level === undefined) {
      return ResponseWrapper.error("Level is required", 400);
    }

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();
    const studentDAO = new StudentDAO(supabaseService);

    await studentDAO.updateLastCelebratedLevel(auth.getUserId(), level);

    return ResponseWrapper.success(`Success celebrateLevel`, { level });
  } catch (err) {
    return ResponseWrapper.error(
      "Failed celebrateLevel",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
