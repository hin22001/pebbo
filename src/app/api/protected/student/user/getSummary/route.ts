"use server";

import { CompletedQuestionsDAO } from "@/src/app/api/lib/DAOs/completedQuestionsDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";

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

    const completedQuestionsDAO = new CompletedQuestionsDAO(supabaseService);
    const startTime = performance.now();
    const summaryData = await completedQuestionsDAO.getSummary(
      auth.getUserId(),
    );
    const duration = performance.now() - startTime;

    return ResponseWrapper.success(
      `Success student getSummary`,
      summaryData,
      200,
      {
        "Server-Timing": `db;dur=${duration.toFixed(2)};desc="Database Summary Fetch"`,
      },
    );
  } catch (err) {
    return ResponseWrapper.error(
      "Failed student getSummary",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
