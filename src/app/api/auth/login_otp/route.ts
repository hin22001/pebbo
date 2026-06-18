"use server";

import { NextResponse } from "next/server";
import { Supabase } from "../../lib/models/supabase";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapter(
      req,
      z.object({ email: z.string() }).strict(),
    );
    await request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const { data, error } = await supabase.auth.signInWithOtp(
      request.getBody(),
    );

    if (error) throw error;

    return NextResponse.json(
      { status: 200, message: `Success login`, data: null },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err.status ?? 500,
        message: `Failed to login: ${err.message}`,
        data: null,
      },
      { status: err.status ?? 500 },
    );
  }
}
