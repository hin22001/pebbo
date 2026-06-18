"use server";

import { Supabase } from "../../lib/models/supabase";
import { NextResponse } from "next/server";
import { Auth } from "../../lib/middleware/auth";
import { UserDAO } from "../../lib/DAOs/userDAO";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { RoleResponse } from "@/src/app/api/lib/types/authResponse";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapter(
      req,
      z
        .object({
          email: z.string(),
          password: z.string(),
        })
        .strict(),
    );
    await request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const { data, error } = await supabase.auth.signInWithPassword(
      request.getBody(),
    );

    if (error) throw error;

    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();
    const userDAO = new UserDAO(supabaseService);
    const userData = await userDAO.getUser(auth.getUserId());

    const _data: RoleResponse = {
      role: userData.getRole(),
      paying: userData.getPaymentStatus(),
    };

    return NextResponse.json(
      { status: 200, message: `Success login password`, data: _data },
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
