import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

const schema = z.object({
  days: z.coerce.number().int().min(1).max(90).optional().default(7),
  limit: z.coerce.number().int().min(1).max(500).optional().default(20),
});

type AggregatedQuestion = {
  question_id: number;
  total_views: number;
  total_unique_users: number;
};

export async function GET(req: Request) {
  try {
    const request = new URLAdapter(req, schema);
    request.init();

    const days = request.getURLProperty("days");
    const limit = request.getURLProperty("limit");
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
        return ResponseWrapper.success("Success: top questions", {
          days,
          limit,
          questions: [],
        });
      }
    }

    let query = serviceClient
      .from("activity_events")
      .select("question_id,user_id,session_id")
      .eq("event_type", "question_viewed")
      .gte("event_ts", since);

    if (!isSystemAdmin) {
      query = query.in("user_id", userIds);
    }

    const { data: rows, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch top questions: ${error.message}`);
    }

    const aggregateMap = new Map<number, AggregatedQuestion & { user_ids: Set<string>; session_ids: Set<string> }>();

    for (const row of rows ?? []) {
      if (typeof row.question_id !== "number") {
        continue;
      }

      const current = aggregateMap.get(row.question_id) ?? {
        question_id: row.question_id,
        total_views: 0,
        total_unique_users: 0,
        user_ids: new Set<string>(),
        session_ids: new Set<string>(),
      };

      if (typeof row.session_id === "string") {
        current.session_ids.add(row.session_id);
      }
      if (typeof row.user_id === "string") {
        current.user_ids.add(row.user_id);
      }

      current.total_views = current.session_ids.size;
      current.total_unique_users = current.user_ids.size;
      aggregateMap.set(row.question_id, current);
    }

    const topQuestions = Array.from(aggregateMap.values())
      .map(({ user_ids: _userIds, session_ids: _sessionIds, ...entry }) => entry)
      .sort((a, b) => b.total_views - a.total_views)
      .slice(0, limit);

    return ResponseWrapper.success("Success: top questions", {
      days,
      limit,
      questions: topQuestions,
    });
  } catch (err: any) {
    console.error("top-questions route error", err);
    return ResponseWrapper.error(
      "Failed: top questions",
      err?.status ?? 500,
      "Unable to fetch top questions",
    );
  }
}
