import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

const schema = z.object({
  days: z.coerce.number().int().min(1).max(90).optional().default(7),
});

type MetricSummary = {
  metric_name: string;
  avg_value: number;
  p50: number;
  p95: number;
  samples: number;
};

function round(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  if (sortedValues.length === 1) return sortedValues[0];
  const position = (p / 100) * (sortedValues.length - 1);
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  const lowerValue = sortedValues[lowerIndex];
  const upperValue = sortedValues[upperIndex];

  if (lowerIndex === upperIndex) {
    return lowerValue;
  }

  const weight = position - lowerIndex;
  return lowerValue + (upperValue - lowerValue) * weight;
}

export async function GET(req: Request) {
  try {
    const request = new URLAdapter(req, schema);
    request.init();

    const days = request.getURLProperty("days");
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
        return ResponseWrapper.success("Success: speed metrics", {
          days,
          metrics: [],
        });
      }
    }

    let query = serviceClient
      .from("activity_events")
      .select("metadata")
      .eq("event_type", "web_vital")
      .gte("event_ts", since);

    if (!isSystemAdmin) {
      query = query.in("user_id", userIds);
    }

    const { data: rows, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch speed metrics: ${error.message}`);
    }

    const metricMap = new Map<string, number[]>();

    for (const row of rows ?? []) {
      const metadata = row.metadata as Record<string, unknown> | null;
      const metricName =
        typeof metadata?.name === "string" ? metadata.name.toUpperCase() : null;
      const metricValue =
        typeof metadata?.value === "number"
          ? metadata.value
          : Number(metadata?.value);

      if (!metricName || Number.isNaN(metricValue)) continue;
      const values = metricMap.get(metricName) ?? [];
      values.push(metricValue);
      metricMap.set(metricName, values);
    }

    const metrics: MetricSummary[] = Array.from(metricMap.entries())
      .map(([metric, values]) => {
        const sorted = [...values].sort((a, b) => a - b);
        const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
        return {
          metric_name: metric,
          avg_value: round(avg),
          p50: round(percentile(sorted, 50)),
          p95: round(percentile(sorted, 95)),
          samples: values.length,
        };
      })
      .sort((a, b) => b.samples - a.samples);

    return ResponseWrapper.success("Success: speed metrics", {
      days,
      metrics,
    });
  } catch (err: any) {
    console.error("speed-metrics route error", err);
    return ResponseWrapper.error(
      "Failed: speed metrics",
      err?.status ?? 500,
      "Unable to fetch speed metrics",
    );
  }
}
