import { NextResponse } from "next/server";
import { Supabase } from "../../lib/models/supabase";
import { BodyAdapterTS } from "@/src/app/api/lib/middleware/bodyAdapter";
import { CreateSchool } from "@/src/app/api/lib/types/pebboAdminTypes";
import { SystemAdmin } from "@/src/app/api/lib/utils/systemAdmin";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapterTS<CreateSchool>(req);
    await request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getServiceClient();

    SystemAdmin.assertAdminKey(request.getBodyProperty("admin_key"));

    const { error } = await supabase.from("schools").insert({
      school_name: request.getBodyProperty("school_name"),
      teacher_licenses: request.getBodyProperty("teacher_licenses"),
      admin_licenses: request.getBodyProperty("admin_licenses"),
      payment_notes: request.getBodyProperty("payment_notes"),
    });

    if (error) throw error;

    return NextResponse.json(
      { status: 200, message: `Success School Creation`, data: null },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err.status ?? 500,
        message: `Failed School Creation: ${err.message}`,
        data: null,
      },
      { status: err.status ?? 500 },
    );
  }
}
