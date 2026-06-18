"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import { ReportsPage } from "@/components/templates";
import { useDispatch } from "react-redux";
import { assignMainLayout } from "@/app/contexts/redux/actions";
import { getDataHead } from "@/app/data/head";
import { ReportAPI } from "@/app/data/api";
import { StudentCard } from "@/src/app/components";
import { Stack } from "@mui/material";

function toStr(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? (v[0] ?? undefined) : (v as string);
}

function getParamsFromUrl(): {
  week_start?: string;
  subject?: string;
  year?: string;
  id?: string;
} {
  if (typeof window === "undefined") return {};
  const q = new URLSearchParams(window.location.search);
  return {
    week_start: q.get("week_start") ?? undefined,
    subject: q.get("subject") ?? undefined,
    year: q.get("year") ?? undefined,
    id: q.get("id") ?? undefined,
  };
}

export interface Props {
  searchParams?: Record<string, string | string[] | undefined>;
  initialReport?: any | null;
}

export default function WeeklyReportDetailClient({
  searchParams: serverParams,
  initialReport,
}: Props) {
  const dispatch = useDispatch();
  const searchParamsString = useSearchParams()?.toString() ?? "";
  const user = useUser();
  const [head, setHead] = useState<any | null>(null);
  const [dataOverall, setDataOverall] = useState<any | null>(null);
  const [dataReports, setDataReports] = useState<any | null>(null);
  const [id, setId] = useState<string | undefined>();

  useEffect(() => {
    const run = async () => {
      await dispatch(
        assignMainLayout({
          type: "ASSIGN_OPEN_LOADER",
        }) as any,
      );

      const fromUrl = getParamsFromUrl();
      const week_start =
        fromUrl.week_start ?? toStr(serverParams?.week_start) ?? undefined;
      const subject =
        fromUrl.subject ?? toStr(serverParams?.subject) ?? undefined;
      const year =
        fromUrl.year ?? toStr(serverParams?.year) ?? undefined;

      try {
        const idParam =
          fromUrl.id ??
          toStr(serverParams?.id) ??
          toStr(serverParams?.reportId) ??
          undefined;

        const newHead = getDataHead({
          name: "headWeeklyReportsPage",
        });

        if (!week_start || !subject || year === undefined || year === "") {
          setHead(newHead);
          setDataOverall({ subjectTitle: subject, date: week_start });
          setDataReports(null);
          setId(idParam ?? undefined);
          await dispatch(
            assignMainLayout({
              type: "ASSIGN_CLOSE_LOADER",
            }) as any,
          );
          return;
        }

        let reportsData = initialReport ?? null;

        if (!reportsData) {
          const response = await ReportAPI.getWeeklyReportByID({
            start_date: week_start,
            subject: subject.trim(),
            year: String(year).trim(),
          });

          reportsData = response?.payload?.data;
        }

        const overall = {
          subjectTitle: subject,
          date: week_start,
        };

        setHead(newHead);
        setDataOverall(overall);
        setDataReports(reportsData);
        setId(idParam ?? undefined);
      } catch {
        await dispatch(
          assignMainLayout({
            type: "ASSIGN_CLOSE_LOADER",
          }) as any,
        );
      }

      await dispatch(
        assignMainLayout({
          type: "ASSIGN_CLOSE_LOADER",
        }) as any,
      );
    };

    run();
  }, [dispatch, searchParamsString, initialReport]);

  return (
    <StudentCard>
      <Stack width="100%" alignItems="center">
        <Stack className="quiz-report-page-wrapper">
          <ReportsPage
            head={head}
            dataOverall={dataOverall}
            dataReports={dataReports}
            userName={user?.name}
            date={"20 Jan 2023"}
            type="weekly"
          />
        </Stack>
      </Stack>
    </StudentCard>
  );
}

