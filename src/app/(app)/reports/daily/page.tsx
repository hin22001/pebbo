import DailyReportsClient from "./DailyReportsClient";
import { cookies } from "next/headers";

export const metadata = {
  title: "Daily Reports — Pebbo",
  description:
    "Browse your daily Pebbo learning reports, including questions completed, accuracy, and time spent.",
  openGraph: {
    title: "Daily Reports — Pebbo",
    description:
      "Daily learning analytics for Pebbo students, showing performance and study time trends.",
    siteName: "Pebbo",
  },
};

export default async function DailyReportsPage() {
  let initialRows: any[] | null = null;
  let initialPageContext: any | null = null;

  try {
    const cookieHeader = cookies().toString();
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "";

    const url = new URL(
      `${baseUrl}/api/protected/student/reports/getAllDailyReports`,
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
    <DailyReportsClient
      initialRows={initialRows}
      initialPageContext={initialPageContext}
    />
  );
}
