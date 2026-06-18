import { CompletedQuestionsDAO } from "@/src/app/api/lib/DAOs/completedQuestionsDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ReportGenerator } from "@/src/app/api/lib/reportHelpers/reportGenerator";
import { GetWeeklyReportRequestParams } from "@/src/app/api/lib/types/reportTypes";
import { DateTime } from "@/src/app/api/lib/utils/dateTime";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const request = new URLAdapter(
      req,
      z.object({
        year: z.string(),
        start_date: z.string(),
        subject: z.string(),
      }),
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

    const year = request.getURLProperty("year");
    const week_start = request.getURLProperty("start_date");
    const week_end = DateTime.getFutureDate(week_start, 7);
    const previous_week_start = DateTime.getPastDate(week_start, 7);
    const subject = request.getURLProperty("subject");

    const cqDAO = new CompletedQuestionsDAO(supabaseService);

    const currentWeekCQ = await cqDAO.getWeekCompletedQuestions(
      auth.getUserId(),
      week_start,
      week_end,
      year,
      subject,
    );

    if (!currentWeekCQ.length)
      throw new FlexibleError("No weekly report found", 404);

    const previousWeekCQ = await cqDAO.getWeekCompletedQuestions(
      auth.getUserId(),
      previous_week_start,
      week_start,
      year,
      subject,
    );

    const pastCQ = await cqDAO.getPreviousCompletedQuestions(
      auth.getUserId(),
      previous_week_start,
      year,
      subject,
    );

    const reportGenerator = new ReportGenerator(
      currentWeekCQ,
      previousWeekCQ,
      pastCQ,
    );

    const report = reportGenerator.generate_weekly_report();

    return NextResponse.json(
      { status: 200, message: `Success getWeeklyReport`, data: report },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err.status ?? 500,
        message: `Failed getWeeklyReport: ${err.message}`,
        data: null,
      },
      { status: err.status ?? 500 },
    );
  }
}
