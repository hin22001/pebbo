"use server";

import { NextResponse } from "next/server";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { ClassroomDAO } from "@/src/app/api/lib/DAOs/classroomDAO";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import {
  PageContext,
  PageParams,
  PageRequest,
} from "@/src/app/api/lib/types/pagination";
import { Pagination } from "@/src/app/api/lib/utils/pagination";
import { z } from "zod";

export async function GET(req: Request) {
  type GetClassroomResponse = {
    classrooms: object[];
    page_context: PageContext;
  };

  const schema = z.object({
    page_number: z.string(),
    rows_per_page: z.string(),
    classroom_name: z.union([z.string(), z.literal("")]).optional(),
    first_name: z.union([z.string(), z.literal("")]).optional(),
    last_name: z.union([z.string(), z.literal("")]).optional(),
    teaching_subjects: z.union([z.string(), z.literal("")]).optional(),
  });

  try {
    const request = new URLAdapter(req, schema);
    request.init();
    const urlObject = request.getURLObject();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();
    const userDAO = new UserDAO(supabaseService);
    const userData = await userDAO.getUser(auth.getUserId());
    userData.assertRole(["admin"]);
    userData.assertPaying(true);

    const pagination = new Pagination(
      urlObject.page_number,
      urlObject.rows_per_page,
    );

    const classroomDAO = new ClassroomDAO(supabaseService);
    const allClassrooms = await classroomDAO.getClassroomSummary(
      userData.getSchoolId() as number,
      pagination,
      urlObject.first_name,
      urlObject.last_name,
      (() => {
        try {
          return JSON.parse(urlObject.teaching_subjects as string);
        } catch {
          return undefined;
        }
      })(),
      urlObject.classroom_name,
    );

    const pageContext = pagination.getPageContext(
      allClassrooms.data.length,
      allClassrooms.count as number,
    );

    const data: GetClassroomResponse = {
      classrooms: allClassrooms.data,
      page_context: pageContext,
    };

    return NextResponse.json(
      { status: 200, message: `Success: Get Classrooms`, data: data },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err.status ?? 500,
        message: `Failed: Get Classrooms: ${err?.message}`,
        data: null,
      },
      { status: err.status ?? 500 },
    );
  }
}
