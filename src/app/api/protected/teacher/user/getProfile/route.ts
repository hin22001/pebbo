import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/protected/teacher/user/getProfile
 *
 * Role-agnostic identity for a teacher. The student getProfile/me routes funnel
 * through studentDAO.getProfile(), which throws (500) for non-students, so a
 * teacher has no working profile source. This reads the `users` row directly
 * (UserDAO), the email from auth, and resolves school_name — no studentDAO.
 */
export async function GET() {
  try {
    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();
    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["teacher"]);

    const userData = user.getData() as Record<string, unknown>;
    const schoolId = user.getSchoolId() ?? (userData?.school_id as number) ?? null;

    // Resolve the human-readable school name (schools.school_name).
    let school_name: string | null = null;
    if (schoolId !== null && schoolId !== undefined) {
      const { data: school } = await supabaseService
        .from("schools")
        .select("school_name")
        .eq("school_id", schoolId)
        .single();
      school_name = (school as { school_name?: string } | null)?.school_name ?? null;
    }

    const data = {
      first_name: (userData?.first_name as string) ?? "",
      last_name: (userData?.last_name as string) ?? "",
      email: auth.getEmail(),
      role: (userData?.role as string) ?? "teacher",
      school_id: schoolId,
      school_name,
    };

    return NextResponse.json(
      { status: 200, message: "Success teacher getProfile", data },
      { status: 200 },
    );
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status ?? 500;
    const message =
      (err as { message?: string })?.message ?? "Failed teacher getProfile";
    return NextResponse.json({ status, message, data: null }, { status });
  }
}
