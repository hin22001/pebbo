"use server";

import { NextResponse } from "next/server";
import { Supabase } from "../../../../lib/models/supabase";
import { Auth } from "../../../../lib/middleware/auth";
import { UserDAO } from "../../../../lib/DAOs/userDAO";
import { ClassroomDAO } from "../../../../lib/DAOs/classroomDAO";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapter(
      req,
      z.object({
        classroom_name: z.string(),
      }),
    );
    await request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();
    const userDAO = new UserDAO(supabaseService);
    const userData = await userDAO.getUser(auth.getUserId());
    userData.assertRole(["admin"]);

    const classroomHandler = new ClassroomDAO(supabaseService);

    await classroomHandler.create(
      request.getBody().classroom_name,
      userData.getSchoolId() as number,
    );

    return NextResponse.json(
      { status: 200, message: `Success Create Classroom`, data: null },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err?.status ?? 500,
        message: `Failed Create Classrom: ${err?.message}`,
        data: null,
      },
      { status: err?.status ?? 500 },
    );
  }
}
