"use client";

/**
 * DashboardClient — client boundary for Dashboard.
 * Receives server-resolved session for optional hydration/display; legacy Dashboard still uses Auth.getDataUser().
 */
import type { ReactNode } from "react";
import { Dashboard } from "@/app/components/templates/Dashboard";

export default function DashboardClient({
  session,
  initialDashboardData,
}: {
  session?: {
    role?: string;
    onboarding_completed?: boolean;
    paying?: boolean;
    name?: string;
  };
  initialDashboardData?: any;
}) {
  return <Dashboard initialDashboardData={initialDashboardData} />;
}
