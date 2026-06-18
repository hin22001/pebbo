"use server";

import { NextResponse } from "next/server";
import { Supabase } from "../../../../lib/models/supabase";
import { Auth } from "../../../../lib/middleware/auth";
import { UserDAO } from "../../../../lib/DAOs/userDAO";
import { ClassroomDAO } from "../../../../lib/DAOs/classroomDAO";
import { Classroom } from "../../../../lib/models/classroom";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapter(
      req,
      z
        .object({
          classroom_name: z.string(),
        })
        .strict()
    );
    await request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();
    const supabaseService = _supabase.getServiceClient();

    const userDAO = new UserDAO(supabaseService);
    const userData = await userDAO.getUser(auth.getUserId());
    userData.assertRole(["teacher"]);

    const classroomDAO = new ClassroomDAO(supabaseService);

    const newClassroomData = await classroomDAO.create(
      request.getBody().classroom_name,
      userData.getSchoolId() as number
    );

    const newClassroom = new Classroom(newClassroomData);

    await classroomDAO.join(auth.getUserId(), newClassroom.getClassroomId());

    return NextResponse.json(
      { status: 200, message: `Success Create Classroom`, data: null },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err?.status ?? 500,
        message: `Failed Create Classrom: ${err?.message}`,
        data: null,
      },
      { status: err?.status ?? 500 }
    );
  }
}
