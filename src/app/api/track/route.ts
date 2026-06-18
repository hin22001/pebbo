import { NextResponse } from "next/server";

import { Auth } from "@/src/app/api/lib/middleware/auth";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { trackBatchSchema } from "@/src/app/api/lib/validation/tracking/trackEventSchema";
import {
  computeNetworkHash,
  extractIp,
  extractRegion,
} from "@/src/app/api/lib/utils/networkFingerprint";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = trackBatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payload",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { session_id: sessionId, events } = parsed.data;

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const auth = new Auth(supabase);
    await auth.init();
    const userId = auth.getUserId();

    const headers = new Headers(req.headers);
    const ip = extractIp(headers);
    const region = extractRegion(headers);
    const networkHash = computeNetworkHash(ip, headers.get("user-agent"));

    const rows = events.map((eventItem) => ({
      event_id: eventItem.event_id || null,
      user_id: userId,
      session_id: sessionId,
      event_type: eventItem.event_type,
      path: eventItem.path || null,
      question_id: eventItem.question_id || null,
      region,
      network_hash: networkHash,
      metadata: eventItem.metadata || {},
      event_ts: eventItem.event_ts || new Date().toISOString(),
    }));

    const serviceClient = _supabase.getServiceClient();

    const { data: inserted, error } = await serviceClient.rpc(
      "insert_activity_events",
      { events: JSON.stringify(rows) },
    );

    if (error) {
      console.error("[track] RPC insert_activity_events failed", error);
      return NextResponse.json(
        { success: false, message: "Failed to store tracking events" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      accepted: rows.length,
      inserted: inserted ?? rows.length,
    });
  } catch (error: any) {
    if (
      error?.status === 401 ||
      String(error?.message || "").toLowerCase().includes("unauthorized")
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    console.error("[track] Unexpected error", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
