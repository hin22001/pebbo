"use server";

import { StudentDAO } from "@/src/app/api/lib/DAOs/studentDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";

export async function POST(req: Request) {
  try {
    const { todo_list, date } = await req.json();

    if (!todo_list || !date) {
      return ResponseWrapper.error("todo_list and date are required", 400);
    }

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();
    const studentDAO = new StudentDAO(supabaseService);

    await studentDAO.syncTodos(auth.getUserId(), todo_list, date);

    return ResponseWrapper.success(`Success syncTodos`, { todo_list, date });
  } catch (err) {
    return ResponseWrapper.error(
      "Failed syncTodos",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
