"use server";

import { NextResponse } from "next/server";
import { Supabase } from "../../../lib/models/supabase";
import { Auth } from "../../../lib/middleware/auth";
import { UserDAO } from "../../../lib/DAOs/userDAO";
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
          token: z.string(),
          type: z.enum([
            "signup",
            "invite",
            "magiclink",
            "recovery",
            "email_change",
            "email",
          ]),
          options: z
            .object({
              redirectTo: z.string().optional(),
              captchaToken: z.string().optional(),
            })
            .optional(),
        })
        .strict(),
    );
    await request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const { data, error } = await supabase.auth.verifyOtp(request.getBody());

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
      { status: 200, message: `Success confirm OTP`, data: _data },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err.status ?? 500,
        message: `Failed confirm OTP: ${err.message}`,
        data: null,
      },
      { status: err.status ?? 500 },
    );
  }
}
