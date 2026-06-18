"use server";

import { NextResponse } from "next/server";
import { Supabase } from "../../../lib/models/supabase";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapter(
      req,
      z.object({ new_password: z.string() }).strict(),
    );
    await request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    //updateUser for metadata does not replace the whole JSON
    const { error } = await supabase.auth.updateUser({
      password: request.getBodyProperty("new_password"),
    });

    if (error) throw error;

    return NextResponse.json(
      { status: 200, message: `Success Reset Password`, data: null },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err.status ?? 500,
        message: `Failed to Reset Password: ${err.message}`,
        data: null,
      },
      { status: err.status ?? 500 },
    );
  }
}
