"use client";

import React from "react";
import SchoolOverview from "@/templates/SchoolOverview/SchoolOverview";

export type SchoolOverviewClientProps = {
  initialOverview?: { role: string; role_count: number }[] | null;
  initialLicenses?: Record<string, unknown> | null;
};

export default function SchoolOverviewClient({
  initialOverview = null,
  initialLicenses = null,
}: SchoolOverviewClientProps) {
  return (
    <SchoolOverview
      initialOverview={initialOverview as unknown as null | undefined}
      initialLicenses={initialLicenses as unknown as null | undefined}
    />
  );
}
