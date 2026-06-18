"use server";

import { StudentDAO } from "@/src/app/api/lib/DAOs/studentDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";

export async function POST(req: Request) {
  try {
    const { streak } = await req.json();

    if (streak === undefined) {
      return ResponseWrapper.error("Streak is required", 400);
    }

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();
    const studentDAO = new StudentDAO(supabaseService);

    await studentDAO.updateLastCelebratedStreak(auth.getUserId(), streak);

    return ResponseWrapper.success(`Success celebrateStreak`, { streak });
  } catch (err: any) {
    return ResponseWrapper.error(
      "Failed celebrateStreak",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
