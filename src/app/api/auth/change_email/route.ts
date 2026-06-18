"use server";

import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { NextResponse } from "next/server";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapter(
      req,
      z.object({ new_email: z.string() }).strict(),
    );
    await request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const studentDAO = new UserDAO(_supabase.getServiceClient());
    await studentDAO.changeEmail(
      auth.getUserId(),
      request.getBodyProperty("new_email"),
    );

    return NextResponse.json(
      { status: 200, message: `Success Change Email`, data: null },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err.status ?? 500,
        message: `Failed Change Email: ${err.message}`,
        data: null,
      },
      { status: err.status ?? 500 },
    );
  }
}
