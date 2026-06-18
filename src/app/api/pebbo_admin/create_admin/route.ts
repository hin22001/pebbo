import { NextResponse } from "next/server";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { SchoolDAO } from "../../lib/DAOs/schoolDAO";
import { UserDAO } from "../../lib/DAOs/userDAO";
import { BodyAdapterTS } from "@/src/app/api/lib/middleware/bodyAdapter";
import { AdminMetadata } from "@/src/app/api/lib/types/userData";
import { CreateAdmin } from "@/src/app/api/lib/types/pebboAdminTypes";
import { SystemAdmin } from "@/src/app/api/lib/utils/systemAdmin";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapterTS<CreateAdmin>(req);
    await request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getServiceClient();

    const requestBody = request.getBody();

    SystemAdmin.assertAdminKey(requestBody.admin_key);

    const schoolDAO = new SchoolDAO(supabase);
    const userDAO = new UserDAO(supabase);

    const licenseCount = await schoolDAO.getLicenseCount(
      "admin_licenses",
      requestBody.school_id,
    );
    const adminCount = await userDAO.getRoleCount(
      "admin",
      requestBody.school_id,
    );

    if (adminCount >= licenseCount.admin_licenses)
      throw new FlexibleError("Not enough licenses", 400);

    //create admin
    const metadata: AdminMetadata = {
      role: "admin",
      first_name: requestBody.first_name,
      last_name: requestBody.last_name,
      school_id: requestBody.school_id,
      referred_by: requestBody.referred_by,
      stripe_customer_id: null,
    };

    await userDAO.createUser(requestBody.email, requestBody.password, metadata);

    return NextResponse.json(
      { status: 200, message: `Success: Create Admin`, data: null },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err.status ?? 500,
        message: `Failed: Create Admin: ${err.message}`,
        data: null,
      },
      { status: err.status ?? 500 },
    );
  }
}
