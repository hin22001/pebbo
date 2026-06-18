import { StudentDAO } from "@/src/app/api/lib/DAOs/studentDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { shapeProfileToDataUser } from "@/app/lib/server-user";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/protected/student/user/me
 * Returns current user in dataUser shape for client refresh (e.g. after profile update).
 * Same shape as layout initialUser; client can sync to localStorage + Redux.
 */
export async function GET() {
  try {
    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(_supabase.getServiceClient());
    const user = await userDAO.getUser(auth.getUserId());
    const userData = user.getData();

    const studentDAO = new StudentDAO(_supabase.getServiceClient());
    const profile = await studentDAO.getProfile(auth.getUserId());

    const givenDate = new Date(auth.getCreatedAt());
    const now = new Date();
    let days_since_joined = Math.floor(
      (now.getTime() - givenDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (days_since_joined === 0) days_since_joined = 1;

    const merged = {
      ...userData,
      email: auth.getEmail(),
      ...profile,
      days_since_joined,
    };

    const dataUser = shapeProfileToDataUser(merged as Record<string, unknown>);

    return NextResponse.json(
      { status: 200, message: "Success get current user", data: dataUser },
      { status: 200 },
    );
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status ?? 500;
    const message =
      (err as { message?: string })?.message ?? "Failed get current user";
    return NextResponse.json(
      { status, message, data: null },
      { status },
    );
  }
}
