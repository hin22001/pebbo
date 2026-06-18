import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

const schema = z.object({
  days: z.coerce.number().int().min(1).max(90).optional().default(7),
  limit: z.coerce.number().int().min(1).max(500).optional().default(50),
});

type ClusterSummary = {
  network_hash: string;
  region: string | null;
  user_count: number;
  user_ids: string[];
  samples: number;
};

type ClusterAccumulator = {
  network_hash: string;
  region: string | null;
  samples: number;
  user_ids_set: Set<string>;
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
        return ResponseWrapper.success("Success: network clusters", {
          days,
          limit,
          clusters: [],
        });
      }
    }

    let query = serviceClient
      .from("activity_events")
      .select("network_hash,region,user_id")
      .gte("event_ts", since)
      .not("network_hash", "is", null);

    if (!isSystemAdmin) {
      query = query.in("user_id", userIds);
    }

    const { data: rows, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch network clusters: ${error.message}`);
    }

    const clusterMap = new Map<string, ClusterAccumulator>();

    for (const row of rows ?? []) {
      if (!row.network_hash) continue;
      const region = row.region ?? null;
      const key = `${row.network_hash}::${region ?? "unknown"}`;
      const current = clusterMap.get(key) ?? {
        network_hash: row.network_hash,
        region,
        samples: 0,
        user_ids_set: new Set<string>(),
      };
      current.samples += 1;
      if (typeof row.user_id === "string") {
        current.user_ids_set.add(row.user_id);
      }
      clusterMap.set(key, current);
    }

    const clusters = Array.from(clusterMap.values())
      .map((entry) => ({
        network_hash: entry.network_hash,
        region: entry.region,
        user_count: entry.user_ids_set.size,
        user_ids: Array.from(entry.user_ids_set),
        samples: entry.samples,
      }))
      .filter((entry) => entry.user_count > 1)
      .sort((a, b) => {
        if (b.user_count !== a.user_count) {
          return b.user_count - a.user_count;
        }
        return b.samples - a.samples;
      })
      .slice(0, limit);

    return ResponseWrapper.success("Success: network clusters", {
      days,
      limit,
      clusters,
    });
  } catch (err: any) {
    console.error("network-clusters route error", err);
    return ResponseWrapper.error(
      "Failed: network clusters",
      err?.status ?? 500,
      "Unable to fetch network clusters",
    );
  }
}
