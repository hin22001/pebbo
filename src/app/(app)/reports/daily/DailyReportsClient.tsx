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
import _ from "lodash";
import { StudentCard } from "@/src/app/components";
import { Stack } from "@mui/material";

type DailyReportsClientProps = {
  initialRows?: any[] | null;
  initialPageContext?: any | null;
};

export default function DailyReportsClient({
  initialRows,
  initialPageContext,
}: DailyReportsClientProps) {
  const dispatch = useDispatch();
  const [head, setHead] = useState<any | null>(null);
  const [access, setAccess] = useState<boolean>(false);
  const usedInitialRef = useRef(false);
  const initialRowsRef = useRef(initialRows);
  const initialPageContextRef = useRef(initialPageContext);

  const assignHead = useCallback(async () => {
    try {
      const newHead = getDataHead({
        name: "headTableEditorDailyReports",
      });
      setHead(newHead);
      setAccess(true);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await dispatch(
        assignMainLayout({
          type: "ASSIGN_OPEN_LOADER",
        }) as any,
      );
      await assignHead();
      await dispatch(
        assignMainLayout({
          type: "ASSIGN_CLOSE_LOADER",
        }) as any,
      );
    };
    run();
  }, [assignHead, dispatch]);

  const getDailyReport = useCallback(
    async (params: any) => {
      try {
        const headColumns = head?.table?.columns || {};
        const paramsPageContext: any = APIHelpers.refactorParamsPageContext(
          headColumns,
          params,
        );

        let dateAscending = "desc";
        let search = "";
        const dataUser = Auth.getDataUser();

        if (paramsPageContext?.$sort === "-date") {
          dateAscending = "desc";
        }

        if (params?.search?.length > 0) {
          search = params?.search;
        }

        const refactorParams = {
          ...(paramsPageContext || {}),
          date: params?.date
            ? dayjs(params?.date)?.format("YYYY-MM-DD")
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
                id: "daily-report-row-id-" + _.uniqueId(),
                originalData: item,
              };
            }) || [];

          return {
            pageContext: refactorPageContext,
            data: refactorData,
          };
        }

        const response: any = await ReportAPI.getDailyReport(refactorParams);

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
                id: "daily-report-row-id-" + _.uniqueId(),
                originalData: item,
              };
            }) || [];

          return {
            pageContext: refactorPageContext,
            data: refactorData,
          };
        }

        return {
          pageContext: ConfigComponents.Table.pageContext,
          data: [],
        };
      } catch {
        return {
          pageContext: ConfigComponents.Table.pageContext,
          data: [],
        };
      }
    },
    [head],
  );

  return (
    <StudentCard>
      <Stack width="100%" alignItems="center">
        <Stack className="quiz-report-page-wrapper">
          <TableEditor
            head={head}
            access={access}
            getData={getDailyReport}
            tableType="report"
            reportType="daily"
          />
        </Stack>
      </Stack>
    </StudentCard>
  );
}

