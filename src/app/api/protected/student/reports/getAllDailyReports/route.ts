import { ReportDAO } from "@/src/app/api/lib/DAOs/reportDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { PageContext } from "@/src/app/api/lib/types/pagination";
import { AllDailyReport } from "@/src/app/api/lib/types/reportTypes";
import { Pagination } from "@/src/app/api/lib/utils/pagination";
import { getReportSchema } from "@/src/app/api/lib/validation/reportSchema";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: Request) {
  type AllDailyReportResponse = {
    reports: AllDailyReport;
    page_context: PageContext;
  };

  try {
    const request = new URLAdapter(
      req,
      getReportSchema.merge(
        z.object({
          start_date: z.union([z.string(), z.literal("")]).optional(),
          end_date: z.union([z.string(), z.literal("")]).optional(),
        }),
      ),
    );
    request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["student"]);
    user.assertPaying(true);

    const pagination = new Pagination(
      request.getURLProperty("page_number"),
      request.getURLProperty("rows_per_page"),
    );

    const reportDAO = new ReportDAO(supabaseService);

    const reportData = await reportDAO.getAllDailyReports(
      auth.getUserId(),
      pagination,
      request.getURLProperty("dateAscending"),
      request.getURLProperty("year"),
      request.getURLProperty("subject"),
      request.getURLProperty("date"),
      request.getURLProperty("start_date"),
      request.getURLProperty("end_date"),
    );

    const pageContext = pagination.getPageContext(
      reportData.data.length,
      reportData.count as number,
    );

    const data: AllDailyReportResponse = {
      reports: reportData.data,
      page_context: pageContext,
    };

    return NextResponse.json(
      { status: 200, message: `Success getAllDailyReports`, data: data },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err.status ?? 500,
        message: `Failed getAllDailyReports: ${err.message}`,
        data: null,
      },
      { status: err.status ?? 500 },
    );
  }
}
