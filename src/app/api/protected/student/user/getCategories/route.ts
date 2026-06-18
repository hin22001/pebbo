import { StudentDAO } from "@/src/app/api/lib/DAOs/studentDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { NextResponse } from "next/server";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const request = new URLAdapter(
      req,
      z.object({
        education_level: z.string(),
        year: z.string(),
      }),
    );
    request.init();
    const requestObject = request.getURLObject();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const studentDAO = new StudentDAO(supabaseService);

    const categories = await studentDAO.getCategories(
      auth.getUserId(),
      requestObject.education_level,
      requestObject.year,
    );

    return NextResponse.json(
      { status: 200, message: `Success getCategories`, data: categories },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err?.status ?? 500,
        message: `Failed getCategories: ${err?.message}`,
        data: null,
      },
      { status: err?.status ?? 500 },
    );
  }
}
