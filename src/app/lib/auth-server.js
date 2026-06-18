/**
 * Server-only auth helpers for App Router (Phase 4).
 * Enables SSR/layout to read minimal session without calling localStorage.
 *
 * Session cookie is dual-written by Auth.setDataUser() on the client.
 *
 * Usage in a Server Component or layout:
 *   import { cookies } from "next/headers";
 *   import { getSessionFromCookies } from "@/app/lib/auth-server";
 *   const session = getSessionFromCookies(cookies());
 *   if (!session) redirect("/login");
 *   // or pass session to client: <DashboardClient session={session} />
 */
import Config from "@/app/constant/Config";

/**
 * @param {import('next/headers').ReadonlyRequestCookies} cookies - from cookies() in Server Component
 * @returns {{ role?: string, onboarding_completed?: boolean, paying?: boolean, name?: string, year?: number } | null}
 */
export function getSessionFromCookies(cookies) {
  try {
    const name = Config?.sessionCookieName ?? "_pebbo_session";
    const cookie = cookies.get(name);
    if (!cookie?.value) return null;
    const decoded = JSON.parse(
      Buffer.from(cookie.value, "base64").toString("utf8"),
    );
    if (!decoded || typeof decoded !== "object") return null;
    const year = decoded.year != null ? parseInt(decoded.year, 10) : undefined;
    return {
      role: decoded.role,
      onboarding_completed: decoded.onboarding_completed,
      paying: decoded.paying,
      name: decoded.name,
      year: Number.isNaN(year) ? undefined : year,
    };
  } catch {
    return null;
  }
}
