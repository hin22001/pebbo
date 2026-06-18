import { StudentDAO } from "@/src/app/api/lib/DAOs/studentDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    // user.assertPaying(true)
    const userData = user.getData();

    const studentDAO = new StudentDAO(supabaseService);
    const profile = await studentDAO.getProfile(auth.getUserId());
    // profile.addProperty("email", auth.getEmail())

    const givenDate = new Date(auth.getCreatedAt());
    const now = new Date();
    const timeDifference = now.getTime() - givenDate.getTime();
    let days_since_joined = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    if (days_since_joined === 0) {
      days_since_joined = 1;
    }

    const data = {
      ...userData,
      email: auth.getEmail(),
      ...profile,
      days_since_joined: days_since_joined,
    };

    return NextResponse.json(
      { status: 200, message: `Success student getProfile`, data: data },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err.status ?? 500,
        message: `Failed student getProfile: ${err.message}`,
        data: null,
      },
      { status: err.status ?? 500 },
    );
  }
}
