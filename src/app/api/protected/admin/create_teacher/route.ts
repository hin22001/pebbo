"use server";

import { NextResponse } from "next/server";
import { Supabase } from "../../../lib/models/supabase";
import { Auth } from "../../../lib/middleware/auth";
import { UserDAO } from "../../../lib/DAOs/userDAO";
import { SchoolDAO } from "../../../lib/DAOs/schoolDAO";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { TeacherMetadata } from "@/src/app/api/lib/types/userData";
import { PostgresFormatter } from "@/src/app/api/lib/utils/postgresFormatter";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { z } from "zod";

export async function POST(req: Request) {
  const schema = z
    .object({
      first_name: z.string(),
      last_name: z.string(),
      teaching_subject: z.array(z.string()),
      is_subject_head: z.boolean(),
      email: z.string(),
      password: z.string(),
      referred_by: z.union([z.string(), z.null()]),
    })
    .strict();

  try {
    const request = new BodyAdapter(req, schema);
    await request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();
    const supabaseService = _supabase.getServiceClient();

    const userDAO = new UserDAO(supabaseService);
    const userData = await userDAO.getUser(auth.getUserId());
    userData.assertRole(["admin"]);

    const schoolDAO = new SchoolDAO(supabaseService);

    const requestBody = request.getBody();

    const licenseCount = await schoolDAO.getLicenseCount(
      "teacher_licenses",
      userData.getSchoolId() as number,
    );
    const teacherCount = await userDAO.getRoleCount(
      "teacher",
      userData.getSchoolId() as number,
    );
    if (teacherCount >= licenseCount.teacher_licenses)
      throw new FlexibleError("Not enough licenses", 400);

    const metadata: TeacherMetadata = {
      role: "teacher",
      first_name: requestBody.first_name,
      last_name: requestBody.last_name,
      school_id: userData.getSchoolId() as number,
      teaching_subject: PostgresFormatter.arrayToEnumArray(
        requestBody.teaching_subject,
      ),
      is_subject_head: requestBody.is_subject_head,
      referred_by: requestBody.referred_by,
      stripe_customer_id: null,
    };

    await userDAO.createUser(requestBody.email, requestBody.password, metadata);

    return NextResponse.json(
      { status: 200, message: `Success: Create Teacher`, data: null },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err.status ?? 500,
        message: `Failed: Create Teacher: ${err.message}`,
        data: null,
      },
      { status: err.status ?? 500 },
    );
  }
}
