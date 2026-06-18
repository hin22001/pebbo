import WeeklyReportsClient from "./WeeklyReportsClient";
import { cookies } from "next/headers";

export const metadata = {
  title: "Weekly Reports — Pebbo",
  description:
    "Browse your weekly Pebbo learning reports, including knowledge points, learning time, and performance trends.",
  openGraph: {
    title: "Weekly Reports — Pebbo",
    description:
      "Weekly learning analytics for Pebbo students, with trend graphs and comparative insights.",
    siteName: "Pebbo",
  },
};

export default async function WeeklyReportsPage() {
  let initialRows: any[] | null = null;
  let initialPageContext: any | null = null;

  try {
    const cookieHeader = cookies().toString();
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "";

    const url = new URL(
      `${baseUrl}/api/protected/student/reports/getAllWeeklyReports`,
    );
    // Let the API use its own defaults for pagination/filtering on first load

    const res = await fetch(url.toString(), {
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      initialRows = json?.data?.reports ?? null;
      initialPageContext = json?.data?.page_context ?? null;
    }
  } catch {
    initialRows = null;
    initialPageContext = null;
  }

  return (
    <WeeklyReportsClient
      initialRows={initialRows}
      initialPageContext={initialPageContext}
    />
  );
}
