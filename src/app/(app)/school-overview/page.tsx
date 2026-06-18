import { cookies } from "next/headers";
import SchoolOverviewClient from "./SchoolOverviewClient";

export const metadata = {
  title: "School Overview — Pebbo",
  description:
    "School overview and management. View licenses, usage, and school-wide settings for Pebbo.",
  openGraph: {
    title: "School Overview — Pebbo",
    description: "School overview and management for Pebbo admins.",
    siteName: "Pebbo",
  },
};

export default async function SchoolOverviewPage() {
  const cookieHeader = cookies().toString();
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "";

  let initialOverview: { role: string; role_count: number }[] | null = null;
  let initialLicenses: Record<string, unknown> | null = null;

  try {
    const [overviewRes, licensesRes] = await Promise.all([
      fetch(`${baseUrl}/api/protected/admin/school_profile/get_school_overview`, {
        headers: { cookie: cookieHeader },
        cache: "no-store",
      }),
      fetch(`${baseUrl}/api/protected/admin/school_profile/get_licenses`, {
        headers: { cookie: cookieHeader },
        cache: "no-store",
      }),
    ]);

    if (overviewRes.ok) {
      const json = await overviewRes.json();
      initialOverview = json?.data ?? null;
    }
    if (licensesRes.ok) {
      const json = await licensesRes.json();
      initialLicenses = json?.data ?? null;
    }
  } catch {
    // leave null, client will fetch
  }

  return (
    <SchoolOverviewClient
      initialOverview={initialOverview}
      initialLicenses={initialLicenses}
    />
  );
}
