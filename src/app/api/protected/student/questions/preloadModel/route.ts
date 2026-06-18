"server-only";

import { StudentDAO } from "@/src/app/api/lib/DAOs/studentDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { NextResponse } from "next/server";
import { ModelProcessing } from "@/src/app/api/lib/processing/modelProcessing";

/**
 * Preloads the ONNX model for the current user's education_level and year.
 * Warms the model cache so the first "Start Exercise" click is faster.
 */
export async function GET() {
  try {
    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();
    const studentDAO = new StudentDAO(supabaseService);
    const data = await studentDAO.getScoresUsingContext(auth.getUserId());

    if (!data?.education_level || !data?.year) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const modelProcessing = new ModelProcessing(
      data.education_level,
      data.year,
    );
    await modelProcessing.init();

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
