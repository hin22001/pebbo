import { NextResponse } from "next/server";
import {
  AllWeeklyReport,
  GetAllWeeklyReportsRequestParams,
} from "@/src/app/api/lib/types/reportTypes";
import { PageContext } from "@/src/app/api/lib/types/pagination";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { Pagination } from "@/src/app/api/lib/utils/pagination";
import { ReportDAO } from "@/src/app/api/lib/DAOs/reportDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { getReportSchema } from "@/src/app/api/lib/validation/reportSchema";

export async function GET(req: Request) {
  type AllWeeklyReportResponse = {
    reports: AllWeeklyReport;
    page_context: PageContext;
  };

  try {
    const request = new URLAdapter(
      req,
      getReportSchema
        .extend({
          start_date: getReportSchema.shape.date,
        })
        .omit({ date: true }),
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

    const reportData = await reportDAO.getAllWeeklyReports(
      auth.getUserId(),
      pagination,
      request.getURLProperty("dateAscending"),
      request.getURLProperty("year"),
      request.getURLProperty("subject"),
      request.getURLProperty("start_date"),
    );

    const pageContext = pagination.getPageContext(
      reportData.data.length,
      reportData.count as number,
    );

    const data: AllWeeklyReportResponse = {
      reports: reportData.data,
      page_context: pageContext,
    };

    return NextResponse.json(
      { status: 200, message: `Success getAllWeeklyReports`, data: data },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err.status ?? 500,
        message: `Failed getAllWeeklyReports: ${err.message}`,
        data: null,
      },
      { status: err.status ?? 500 },
    );
  }
}
