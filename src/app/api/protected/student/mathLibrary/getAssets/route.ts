import { MathLibraryDAO } from "@/src/app/api/lib/DAOs/mathLibraryDAO";

export const dynamic = "force-dynamic";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";

export async function GET(req: Request) {
  try {
    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userId = auth.getUserId();
    if (!userId) {
      return ResponseWrapper.error("Unauthorized", 401);
    }

    // Parse query params
    const url = new URL(req.url);
    const yearParam = url.searchParams.get("year");
    const categoryIdParam = url.searchParams.get("category_id");

    const year = yearParam ? parseInt(yearParam, 10) : undefined;
    const categoryId = categoryIdParam
      ? parseInt(categoryIdParam, 10)
      : undefined;

    // Fetch assets
    const mathLibraryDAO = new MathLibraryDAO(_supabase.getServiceClient());
    const assets = await mathLibraryDAO.getAssets(year, categoryId);

    return ResponseWrapper.success("Assets fetched successfully", { assets });
  } catch (error: any) {
    console.error("GET /mathLibrary/getAssets error:", error);
    return ResponseWrapper.error(
      error?.message || "Internal Server Error",
      500,
    );
  }
}
