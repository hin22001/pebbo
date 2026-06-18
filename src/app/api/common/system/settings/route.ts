import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { unstable_noStore } from "next/cache";

// Explicitly disable all caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  // Explicitly opt out of Next.js caching
  unstable_noStore();

  try {
    const _supabase = new Supabase();
    const supabase = _supabase.getServiceClient();

    // Get single row - always fetch fresh from database
    const { data, error } = await (supabase as any)
      .from("system_settings")
      .select("value")
      .eq("key", "required_app_version")
      .maybeSingle();

    if (error) throw error;

    return ResponseWrapper.success(
      "Success get settings",
      {
        required_app_version: (data as any)?.value,
      },
      200,
      {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    );
  } catch (err: any) {
    return ResponseWrapper.error(
      "Failed to get settings",
      500,
      err?.message ?? "",
    );
  }
}
