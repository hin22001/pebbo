"use server";

import { StudentDAO } from "@/src/app/api/lib/DAOs/studentDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { SetStudentContext } from "@/src/app/api/lib/types/studentTypes";
import { NextResponse } from "next/server";
import { TypeGuard } from "@/src/app/api/lib/utils/typeGuard";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapter(
      req,
      z
        .object({
          enabled_categories: z.array(z.number()),
          year: z.string(),
          education_level: z.string(),
        })
        .strict()
    );
    await request.init();

    const requestBody = request.getBody();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();
    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["student"]);
    user.assertPaying(true);

    const studentDAO = new StudentDAO(supabaseService);
    await studentDAO.setCategories(
      auth.getUserId(),
      requestBody.education_level,
      requestBody.year,
      requestBody.enabled_categories
    );

    return NextResponse.json(
      { status: 200, message: `Success setCategories`, data: null },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err.status ?? 500,
        message: `Failed setCategories: ${err.message}`,
        data: null,
      },
      { status: err.status ?? 500 }
    );
  }
}
