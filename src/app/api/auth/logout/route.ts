"use server";

import { Supabase } from "../../lib/models/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    return NextResponse.json(
      { status: 200, message: `Success logout`, data: null },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { status: 500, message: `Failed to logout: ${err.message}`, data: null },
      { status: 500 },
    );
  }
}
