/**
 * (app) Route Group Layout — single auth boundary for app routes.
 *
 * All routes under app/(app)/... are protected: ClientProviders wraps with
 * Authentication, which enforces login, onboarding gate, and payment gate.
 * Path rules live in @/app/config/authRoutes.js (PUBLIC_PATHS, UNPAID_STUDENT_ALLOWED_PATHS).
 *
 * Approach 3 auth: server fetches user once (getProfile) and passes initialUser
 * to UserProvider so client has user on first paint without a client fetch.
 */
import React from "react";
import { cookies } from "next/headers";
import { getSessionFromCookies } from "@/app/lib/auth-server";
import { getServerUser } from "@/app/lib/server-user";
import ClientProviders from "../ClientProviders";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialUser: Awaited<ReturnType<typeof getServerUser>> = null;
  const cookieStore = cookies();
  const session = getSessionFromCookies(cookieStore);
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "";

  if (session && baseUrl) {
    initialUser = await getServerUser(cookieStore.toString(), baseUrl);
  }

  return (
    <ClientProviders initialUser={initialUser}>{children}</ClientProviders>
  );
}
