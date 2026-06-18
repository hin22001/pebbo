import { CompletedQuestionsDAO } from "@/src/app/api/lib/DAOs/completedQuestionsDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ReportGenerator } from "@/src/app/api/lib/reportHelpers/reportGenerator";
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
        date: z.string(),
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
    const date = request.getURLProperty("date");
    const previousDate = DateTime.getPastDate(date, 1);
    const subject = request.getURLProperty("subject");

    const cqDAO = new CompletedQuestionsDAO(supabaseService);

    const currentDayCQ = await cqDAO.getDayCompletedQuestions(
      auth.getUserId(),
      date,
      year,
      subject,
    );

    if (!currentDayCQ.length)
      throw new FlexibleError("No reports for this day", 404);

    const previousDayCQ = await cqDAO.getDayCompletedQuestions(
      auth.getUserId(),
      previousDate,
      year,
      subject,
    );

    const pastCQ = await cqDAO.getPreviousCompletedQuestions(
      auth.getUserId(),
      previousDate,
      year,
      subject,
    );

    const reportGenerator = new ReportGenerator(
      currentDayCQ,
      previousDayCQ,
      pastCQ,
    );

    const report = reportGenerator.generate_daily_report();

    return NextResponse.json(
      { status: 200, message: `Success getDailyReport`, data: report },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err.status ?? 500,
        message: `Failed getDailyReport: ${err.message}`,
        data: null,
      },
      { status: err.status ?? 500 },
    );
  }
}
