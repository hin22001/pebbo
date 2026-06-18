/**
 * Server-only: fetch full user profile for layout (approach 3 auth).
 * Shapes API response to the dataUser format expected by Auth/Redux.
 */
import { cache } from "react";

export type ServerUser = {
  name?: string;
  year?: number;
  role?: { id?: string; name?: string };
  paying?: boolean;
  onboarding_completed?: boolean;
  profile_image?: string | number;
  stars?: string;
  education_level?: string;
  email?: string;
  [key: string]: unknown;
} | null;

/** Shared shape for API and server layout; export for /api/me */
export function shapeProfileToDataUser(
  data: Record<string, unknown> | null,
): ServerUser {
  if (!data || typeof data !== "object") return null;
  const firstName = (data.first_name as string) ?? "";
  const lastName = (data.last_name as string) ?? "";
  const email = (data.email as string) ?? "";
  const profileName = [firstName, lastName].filter(Boolean).join(" ");
  const name =
    profileName.length > 1 ? profileName : (email.split("@")[0] || "Student");
  return {
    name,
    year: typeof data.year !== "undefined" ? Number(data.year) || 2 : 2,
    role: { id: "student", name: "Student" },
    paying: Boolean(data.paying),
    onboarding_completed: Boolean(data.onboarding_completed),
    profile_image: data.profile_image as string | number | undefined,
    stars: (data.stars as string) || "0",
    education_level: (data.education_level as string) || undefined,
    email: email || undefined,
    ...data,
  };
}

const getServerUserCached = cache(async (
  cookieHeader: string,
  baseUrl: string,
): Promise<ServerUser> => {
  if (!baseUrl) return null;
  try {
    const res = await fetch(`${baseUrl}/api/protected/student/user/getProfile`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      status?: number;
      data?: Record<string, unknown>;
    };
    const data = json?.data;
    return shapeProfileToDataUser(data ?? null);
  } catch {
    return null;
  }
});

export async function getServerUser(
  cookieHeader: string,
  baseUrl: string,
): Promise<ServerUser> {
  return getServerUserCached(cookieHeader, baseUrl);
}
