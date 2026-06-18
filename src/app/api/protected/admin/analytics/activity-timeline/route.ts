import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

const schema = z.object({
  user_id: z.string().uuid(),
  days: z.coerce.number().int().min(1).max(90).optional().default(7),
  limit: z.coerce.number().int().min(1).max(500).optional().default(100),
});

export async function GET(req: Request) {
  try {
    const request = new URLAdapter(req, schema);
    request.init();

    const userId = request.getURLProperty("user_id");
    const days = request.getURLProperty("days");
    const limit = request.getURLProperty("limit");

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const serviceClient = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(serviceClient);
    const adminUser = await userDAO.getUser(auth.getUserId());
    adminUser.assertRole(["admin", "system_admin"]);

    const isSystemAdmin = adminUser.getRole() === "system_admin";

    if (!isSystemAdmin) {
      const schoolId = adminUser.getSchoolId();
      if (!schoolId) {
        throw new Error("Admin user has no school_id");
      }

      const { data: targetUser, error: targetUserError } = await serviceClient
        .from("users")
        .select("user_id")
        .eq("user_id", userId)
        .eq("school_id", schoolId)
        .maybeSingle();

      if (targetUserError) {
        throw new Error(`Failed to validate user scope: ${targetUserError.message}`);
      }
      if (!targetUser) {
        return ResponseWrapper.success("Success: activity timeline", {
          user_id: userId,
          days,
          limit,
          events: [],
        });
      }
    }

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data: events, error } = await serviceClient
      .from("activity_events")
      .select(
        "id,event_id,user_id,session_id,event_type,path,question_id,region,network_hash,metadata,event_ts,created_at",
      )
      .eq("user_id", userId)
      .gte("event_ts", since)
      .order("event_ts", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch activity timeline: ${error.message}`);
    }

    return ResponseWrapper.success("Success: activity timeline", {
      user_id: userId,
      days,
      limit,
      events: events ?? [],
    });
  } catch (err: any) {
    console.error("activity-timeline route error", err);
    return ResponseWrapper.error(
      "Failed: activity timeline",
      err?.status ?? 500,
      "Unable to fetch activity timeline",
    );
  }
}
