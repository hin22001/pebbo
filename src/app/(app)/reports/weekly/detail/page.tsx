import WeeklyReportDetailClient, {
  type Props as WeeklyReportDetailClientProps,
} from "./WeeklyReportDetailClient";
import { cookies } from "next/headers";

function toStr(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? (v[0] ?? undefined) : (v as string);
}

export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const week_start = toStr(searchParams?.week_start) ?? undefined;
  const subject = toStr(searchParams?.subject) ?? undefined;

  const subjectLabel = subject ? subject : "Weekly Report";
  const weekLabel = week_start ? ` — starting ${week_start}` : "";

  return {
    title: `Weekly Report: ${subjectLabel}${weekLabel} — Pebbo`,
    description:
      "View a detailed weekly learning report including knowledge points, learning time, and performance trends for your child in Pebbo.",
    openGraph: {
      title: `Weekly Report: ${subjectLabel}${weekLabel} — Pebbo`,
      description:
        "Detailed weekly learning analytics for Pebbo students, including trend graphs and comparative performance.",
      siteName: "Pebbo",
    },
  };
}

export default async function WeeklyReportDetailPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const week_start = toStr(searchParams?.week_start) ?? undefined;
  const subject = toStr(searchParams?.subject) ?? undefined;
  const year = toStr(searchParams?.year) ?? undefined;

  let initialReport: WeeklyReportDetailClientProps["initialReport"] = null;

  if (week_start && subject && year) {
    try {
      const cookieHeader = cookies().toString();
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        "";

      const url = new URL(
        `${baseUrl}/api/protected/student/reports/getWeeklyReport`,
      );
      url.searchParams.set("start_date", week_start.trim());
      url.searchParams.set("subject", subject.trim());
      url.searchParams.set("year", String(year).trim());

      const res = await fetch(url.toString(), {
        headers: {
          cookie: cookieHeader,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        initialReport = json?.data ?? null;
      }
    } catch {
      initialReport = null;
    }
  }

  return (
    <WeeklyReportDetailClient
      searchParams={searchParams}
      initialReport={initialReport}
    />
  );
}
