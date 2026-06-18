import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

const schema = z.object({
  period: z.enum(["today", "week", "month"]).optional().default("week"),
});

const PERIOD_TO_DAYS: Record<"today" | "week" | "month", number> = {
  today: 1,
  week: 7,
  month: 30,
};

export async function GET(req: Request) {
  try {
    const request = new URLAdapter(req, schema);
    request.init();

    const period = request.getURLProperty("period");
    const days = PERIOD_TO_DAYS[period];
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const serviceClient = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(serviceClient);
    const adminUser = await userDAO.getUser(auth.getUserId());
    adminUser.assertRole(["admin", "system_admin"]);

    const isSystemAdmin = adminUser.getRole() === "system_admin";
    let userIds: string[] = [];

    if (isSystemAdmin) {
      // System Admin: no user filtering
    } else {
      const schoolId = adminUser.getSchoolId();
      if (!schoolId) {
        throw new Error("Admin user has no school_id");
      }

      const { data: schoolUsers, error: usersError } = await serviceClient
        .from("users")
        .select("user_id")
        .eq("school_id", schoolId);

      if (usersError) {
        throw new Error(`Failed to fetch school users: ${usersError.message}`);
      }

      userIds = (schoolUsers ?? []).map((u) => u.user_id);
      if (userIds.length === 0) {
        return ResponseWrapper.success("Success: active users", {
          period,
          active_users: 0,
        });
      }
    }

    let query = serviceClient
      .from("activity_events")
      .select("user_id")
      .gte("event_ts", since);

    if (!isSystemAdmin) {
      query = query.in("user_id", userIds);
    }

    const { data: activityRows, error: activityError } = await query;

    if (activityError) {
      throw new Error(`Failed to fetch active users: ${activityError.message}`);
    }

    const activeUsers = new Set((activityRows ?? []).map((row) => row.user_id)).size;

    return ResponseWrapper.success("Success: active users", {
      period,
      active_users: activeUsers,
    });
  } catch (err: any) {
    console.error("active-users route error", err);
    return ResponseWrapper.error(
      "Failed: active users",
      err?.status ?? 500,
      "Unable to fetch active users",
    );
  }
}
