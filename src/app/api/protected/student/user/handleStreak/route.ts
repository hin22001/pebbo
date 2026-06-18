"use server";

import { StudentDAO } from "@/src/app/api/lib/DAOs/studentDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";

export async function POST(req: Request) {
  try {
    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();
    const studentDAO = new StudentDAO(supabaseService);

    const result = await studentDAO.handleStreak(auth.getUserId());

    return ResponseWrapper.success(`Success handleStreak`, result);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed handleStreak",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
