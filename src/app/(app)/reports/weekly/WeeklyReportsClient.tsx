"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Auth } from "@/app/data/local";
import { TableEditor } from "@/components/templates";
import { assignMainLayout } from "@/app/contexts/redux/actions";
import { getDataHead } from "@/app/data/head";
import { APIHelpers } from "@/app/utils";
import { ConfigComponents } from "@/app/constant";
import { ReportAPI } from "@/app/data/api";
import nProgress from "nprogress";
import dayjs from "dayjs";
import { StudentCard } from "@/src/app/components";
import { Stack } from "@mui/material";

type WeeklyReportsClientProps = {
  initialRows?: any[] | null;
  initialPageContext?: any | null;
};

export default function WeeklyReportsClient({
  initialRows,
  initialPageContext,
}: WeeklyReportsClientProps) {
  const dispatch = useDispatch();
  const [head, setHead] = useState<any | null>(null);
  const [access, setAccess] = useState<boolean>(false);
  const usedInitialRef = useRef(false);
  const initialRowsRef = useRef(initialRows);
  const initialPageContextRef = useRef(initialPageContext);

  const assignHead = useCallback(async () => {
    try {
      const newHead = getDataHead({
        name: "headTableEditorWeeklyReports",
      });

      setHead(newHead);
      setAccess(true);
    } catch {
      await dispatch(
        assignMainLayout({
          type: "ASSIGN_CLOSE_LOADER",
        }) as any,
      );
    }
  }, [dispatch]);

  useEffect(() => {
    const run = async () => {
      await dispatch(
        assignMainLayout({
          type: "ASSIGN_OPEN_LOADER",
        }) as any,
      );
      await assignHead();
      nProgress.done();
      await dispatch(
        assignMainLayout({
          type: "ASSIGN_CLOSE_LOADER",
        }) as any,
      );
    };
    run();
  }, [assignHead, dispatch]);

  const getWeeklyReport = useCallback(
    async (params: any) => {
      try {
        const headColumns = head?.table?.columns || {};
        const paramsPageContext: any = APIHelpers.refactorParamsPageContext(
          headColumns,
          params,
        );

        const startDate = params?.start_date;
        let dateAscending = "desc";
        let search = "";
        const dataUser = Auth.getDataUser();

        if (paramsPageContext?.$sort === "-week_start") {
          dateAscending = "desc";
        }

        if (params?.search?.length > 0) {
          search = params?.search;
        }

        const refactorParams = {
          ...(paramsPageContext || {}),
          start_date: startDate
            ? dayjs(params?.start_date)?.format("YYYY-MM-DD")
            : null,
          dateAscending,
          subject: search,
          year: dataUser?.year,
        };

        // Use server-prefetched data on the first call if available
        if (
          !usedInitialRef.current &&
          initialRowsRef.current &&
          initialPageContextRef.current
        ) {
          usedInitialRef.current = true;

          const pageContext = initialPageContextRef.current;
          const refactorPageContext = {
            rowCount: pageContext?.total_rows,
            page: pageContext?.page_number - 1,
            pageSize: pageContext?.rows_per_page,
            pageTotal: Math.round(
              pageContext?.total_rows / pageContext?.rows_per_page,
            ),
          };

          const refactorData =
            initialRowsRef.current?.map((item: any) => {
              const value = APIHelpers.refactorDatabaseToHeadTable(
                headColumns,
                item,
              );

              return {
                ...(value || {}),
                id: "weekly-report-row-id-" + item?.id,
                originalData: item,
              };
            }) || [];

          return {
            pageContext: refactorPageContext,
            data: refactorData,
          };
        }

        const response: any = await ReportAPI.getWeeklyReport(refactorParams);

        if (response?.success) {
          const pageContext = response.payload?.data?.page_context;
          const refactorPageContext = {
            rowCount: pageContext?.total_rows,
            page: pageContext?.page_number - 1,
            pageSize: pageContext?.rows_per_page,
            pageTotal: Math.round(
              pageContext?.total_rows / pageContext?.rows_per_page,
            ),
          };

          const refactorData =
            response?.payload?.data?.reports?.map((item: any) => {
              const value = APIHelpers.refactorDatabaseToHeadTable(
                headColumns,
                item,
              );

              return {
                ...(value || {}),
                id: "weekly-report-row-id-" + item?.id,
                originalData: item,
              };
            }) || [];

          return {
            pageContext: refactorPageContext,
            data: refactorData,
          };
        }

        await dispatch(
          assignMainLayout({
            type: "ASSIGN_CLOSE_LOADER",
          }) as any,
        );
        return {
          pageContext: ConfigComponents.Table.pageContext,
          data: [],
        };
      } catch {
        await dispatch(
          assignMainLayout({
            type: "ASSIGN_CLOSE_LOADER",
          }) as any,
        );
        return {
          pageContext: ConfigComponents.Table.pageContext,
          data: [],
        };
      }
    },
    [dispatch, head],
  );

  return (
    <StudentCard>
      <Stack width="100%" alignItems="center">
        <Stack className="quiz-report-page-wrapper">
          <TableEditor
            head={head}
            access={access}
            getData={getWeeklyReport}
            tableType="report"
            reportType="weekly"
          />
        </Stack>
      </Stack>
    </StudentCard>
  );
}

