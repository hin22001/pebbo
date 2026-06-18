import {
  AllDailyReport,
  AllWeeklyReport,
} from "@/src/app/api/lib/types/reportTypes";
import { PebboDatabase } from "@/src/app/api/lib/types/supabaseTypesOverride";
import { Pagination } from "@/src/app/api/lib/utils/pagination";
import { SupabaseClient } from "@supabase/supabase-js";

export class ReportDAO {
  server: SupabaseClient<PebboDatabase, "public">;

  /**
   *
   * @param server - expects Supabase server client
   */
  constructor(server: SupabaseClient<PebboDatabase, "public">) {
    this.server = server;
  }

  async getAllDailyReports(
    user_id: string,
    pagination: Pagination,
    dateAscending: string,
    year?: string,
    subject?: string,
    date?: string,
    start_date?: string,
    end_date?: string,
  ) {
    const query = this.server
      .from("user_daily_reports")
      .select("date, year, subject", { count: "exact" })
      .eq("user_id", user_id);

    if (year) {
      query.eq("year", year);
    }
    if (subject) {
      query.eq("subject", subject);
    }
    if (date) {
      query.eq("date", date);
    }

    if (start_date) {
      query.gte("date", start_date);
    }
    if (end_date) {
      query.lte("date", end_date);
    }

    query.order("date", { ascending: dateAscending === "asc" });
    query.limit(pagination.getRowsPerPage());
    query.range(pagination.getOffsetStart(), pagination.getOffsetEnd());
    query.returns<AllDailyReport>();
    const { data, count, error } = await query;

    if (error) throw error;

    return { data, count };
  }

  async getAllWeeklyReports(
    user_id: string,
    pagination: Pagination,
    dateAscending: string,
    year?: string,
    subject?: string,
    start_date?: string,
  ) {
    const query = this.server
      .from("user_weekly_reports")
      .select("week_start, year, subject", { count: "exact" })
      .eq("user_id", user_id);

    if (year) {
      query.eq("year", year);
    }
    if (subject) {
      query.eq("subject", subject);
    }
    if (start_date) {
      query.eq("start_date", start_date);
    }
    query.order("week_start", { ascending: dateAscending === "asc" });
    query.limit(pagination.getRowsPerPage());
    query.range(pagination.getOffsetStart(), pagination.getOffsetEnd());
    query.returns<AllWeeklyReport>();
    const { data, count, error } = await query;

    if (error) throw error;

    return { data, count };
  }
}
