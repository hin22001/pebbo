type Role = "student" | "teacher" | "admin" | "system_admin" | string | null | undefined;

interface PostLoginContext {
  role: Role;
  paying?: boolean | null;
  onboardingDone?: boolean | null;
}

export function getPostLoginPath(ctx: PostLoginContext): string {
  const { role, paying, onboardingDone } = ctx;

  if (role === "teacher") {
    return "/teacher/dashboard";
  }

  if (role === "admin" || role === "system_admin") {
    return "/dashboard";
  }

  if (role === "student") {
    if (!onboardingDone) return "/onboarding/placement";
    if (paying) return "/dashboard";
    return "/activate-account";
  }

  return "/dashboard";
}
