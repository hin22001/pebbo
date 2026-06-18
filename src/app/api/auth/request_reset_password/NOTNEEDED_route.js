"use server";

import { createSupabaseAuth } from "../../supabase/supabaseAuth";
import { NextResponse } from "next/server";
import { authMiddlewareSession } from "../../middleware/authMiddlewareSession";
import parseSupaSession from "../../supabase/parseSupabaseSession";

export async function POST(req) {
  try {
    const supabase = createSupabaseAuth();
    const _data = await authMiddlewareSession(req, supabase);
    const { email } = parseSupaSession(_data);

    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;

    return NextResponse.json(
      { status: 200, message: `Success Request Reset Password`, data: null },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err.status ?? 500,
        message: `Failed to Request Reset Password: ${err.message}`,
        data: null,
      },
      { status: err.status ?? 500 },
    );
  }
}
