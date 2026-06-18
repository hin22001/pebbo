"use server";

import { StudentDAO } from "@/src/app/api/lib/DAOs/studentDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";

export async function POST(req: Request) {
  try {
    const { date } = await req.json();

    if (!date) {
      return ResponseWrapper.error("date is required", 400);
    }

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();
    const studentDAO = new StudentDAO(supabaseService);

    await studentDAO.celebrateTodos(auth.getUserId(), date);

    return ResponseWrapper.success(`Success celebrateTodos`, { date });
  } catch (err) {
    return ResponseWrapper.error(
      "Failed celebrateTodos",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
