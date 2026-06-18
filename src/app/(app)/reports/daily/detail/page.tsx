import DailyReportDetailClient, {
  type Props as DailyReportDetailClientProps,
} from "./DailyReportDetailClient";
import { cookies } from "next/headers";

export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const date = toStr(searchParams?.date);
  const subject = toStr(searchParams?.subject);

  const subjectLabel = subject ? subject : "Daily Report";
  const dateLabel = date ? ` — ${date}` : "";

  return {
    title: `Daily Report: ${subjectLabel}${dateLabel} — Pebbo`,
    description:
      "View a detailed daily learning report including performance, time spent, and progress trends for your child in Pebbo.",
    openGraph: {
      title: `Daily Report: ${subjectLabel}${dateLabel} — Pebbo`,
      description:
        "Detailed daily learning analytics for Pebbo students, including questions completed, accuracy, and study time.",
      siteName: "Pebbo",
    },
  };
}

function toStr(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? (v[0] ?? undefined) : (v as string);
}

export default async function DailyReportDetailPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const date = toStr(searchParams?.date);
  const subject = toStr(searchParams?.subject);
  const year = toStr(searchParams?.year);

  let initialReport: DailyReportDetailClientProps["initialReport"] = null;

  if (date && subject && year) {
    try {
      const cookieHeader = cookies().toString();
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        "";

      const url = new URL(
        `${baseUrl}/api/protected/student/reports/getDailyReport`,
      );
      url.searchParams.set("date", date.trim());
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
    <DailyReportDetailClient
      searchParams={searchParams}
      initialReport={initialReport}
    />
  );
}
