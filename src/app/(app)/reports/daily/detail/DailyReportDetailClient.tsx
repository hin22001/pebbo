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

export interface Props {
  searchParams?: Record<string, string | string[] | undefined>;
  initialReport?: any | null;
}

export default function DailyReportDetailClient({
  searchParams: serverParams,
  initialReport,
}: Props) {
  const dispatch = useDispatch();
  const clientParams = useSearchParams();
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

      const date = (clientParams?.get("date") ?? toStr(serverParams?.date)) ?? undefined;
      const subject = (clientParams?.get("subject") ?? toStr(serverParams?.subject)) ?? undefined;
      const year = (clientParams?.get("year") ?? toStr(serverParams?.year)) ?? undefined;

      try {
        const idParam = (clientParams?.get("id") ?? toStr(serverParams?.id) ?? toStr(serverParams?.reportId)) ?? undefined;

        const newHead = getDataHead({
          name: "headDailyReportsPage",
        });

        if (!date || !subject || year === undefined || year === "") {
          setHead(newHead);
          setDataOverall({ subjectTitle: subject, date });
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
          const response = await ReportAPI.getDailyReportByID({
            date: date.trim(),
            subject: subject.trim(),
            year: String(year).trim(),
          });

          reportsData = response?.payload?.data;
        }

        const overall = {
          subjectTitle: subject,
          date,
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
  }, [dispatch, clientParams, initialReport]);

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
            type="daily"
          />
        </Stack>
      </Stack>
    </StudentCard>
  );
}

