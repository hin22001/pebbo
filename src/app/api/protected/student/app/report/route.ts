import { AppReportDAO } from "@/src/app/api/lib/DAOs/appReportDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const body = await req.json();
    const { category, description } = body;

    if (!category) {
      return NextResponse.json(
        { status: 400, message: "Category is required" },
        { status: 400 },
      );
    }

    const supabaseService = _supabase.getServiceClient();
    const appReportDAO = new AppReportDAO(supabaseService);

    await appReportDAO.reportAppIssue(auth.getUserId(), category, description);

    return NextResponse.json(
      { status: 200, message: "Success log app report" },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("API Error [App Report]:", err);
    return NextResponse.json(
      {
        status: err.status ?? 500,
        message: `Failed log app report: ${err.message}`,
      },
      { status: err.status ?? 500 },
    );
  }
}
