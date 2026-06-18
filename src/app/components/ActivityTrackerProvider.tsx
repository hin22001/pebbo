"use client";

import { ReactNode } from "react";
import { useActivityTracker } from "@/app/hooks/useActivityTracker";

export default function ActivityTrackerProvider({
  children,
}: {
  children: ReactNode;
}) {
  useActivityTracker();
  return <>{children}</>;
}
