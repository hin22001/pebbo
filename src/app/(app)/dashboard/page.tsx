/**
 * Dashboard Page (/dashboard) — App Router
 * Thin server shell: optional server session + SSR data prefetch.
 * Auth redirect is client-side only (Authentication in ClientProviders) to avoid
 * login→dashboard redirect loop when the session cookie is not yet sent on
 * the first request after client-side login.
 */
import { cookies } from "next/headers";
import { getSessionFromCookies } from "@/app/lib/auth-server";
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "Dashboard — Pebbo",
  description:
    "Your Pebbo learning dashboard. Track progress, streaks, and daily maths practice. AI-powered personalised learning for ages 6–12.",
  openGraph: {
    title: "Dashboard — Pebbo",
    description: "Track progress, streaks, and daily maths practice.",
    siteName: "Pebbo",
  },
};

export const revalidate = 600;

export default async function DashboardPage() {
  const cookieStore = cookies();
  const session = getSessionFromCookies(cookieStore);
  let initialDashboardData: any | undefined;

  try {
    const cookieHeader = cookieStore.toString();
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "";

    const url = new URL(`${baseUrl}/api/protected/student/dashboard/getData`);

    const res = await fetch(url.toString(), {
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      initialDashboardData = json?.data ?? undefined;
    }
  } catch {
    initialDashboardData = undefined;
  }

  return (
    <DashboardClient
      session={session ?? undefined}
      initialDashboardData={initialDashboardData}
    />
  );
}
