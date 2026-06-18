import { QuestionDAO } from "@/src/app/api/lib/DAOs/questionDAO";
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
    const { question_id, reason, description } = body;

    if (!question_id || !reason) {
      return NextResponse.json(
        { status: 400, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabaseService = _supabase.getServiceClient();
    const questionDAO = new QuestionDAO(supabaseService);

    await questionDAO.reportIssue(
      auth.getUserId(),
      parseInt(question_id),
      reason,
      description,
    );

    return NextResponse.json(
      { status: 200, message: "Success log question issue" },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err.status ?? 500,
        message: `Failed log question issue: ${err.message}`,
      },
      { status: err.status ?? 500 },
    );
  }
}
