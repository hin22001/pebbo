import { PebboDatabase } from "@/src/app/api/lib/types/supabaseTypesOverride";
import { SupabaseClient } from "@supabase/supabase-js";

export class CompletedQuestionsDAO {
  server: SupabaseClient<PebboDatabase, "public">;

  /**
   *
   * @param server - expects Supabase service client
   */
  constructor(server: SupabaseClient<PebboDatabase, "public">) {
    this.server = server;
  }

  async getDayCompletedQuestions(
    user_id: string,
    date: string,
    year: string,
    subject: string,
  ) {
    const { data, error } = await this.server
      .from("completed_questions_view")
      .select(`*`)
      .eq("user_id", user_id)
      .eq("date", date)
      .eq("year", year)
      .eq("subject", subject)
      .order("date", { ascending: false })
      .limit(1000);

    if (error) throw error;

    // if(!data?.length) throw new FlexibleError("No completed questions", 400)

    return data;
  }

  async getPreviousCompletedQuestions(
    user_id: string,
    date: string,
    year: string,
    subject: string,
  ) {
    const { data, error } = await this.server
      .from("completed_questions_view")
      .select(`*`)
      .eq("user_id", user_id)
      .eq("year", year)
      .eq("subject", subject)
      .lt("date", date)
      .order("date", { ascending: false })
      .limit(1000);

    if (error) throw error;

    // if(!data?.length) throw new FlexibleError("No completed questions", 400)

    return data;
  }

  async getWeekCompletedQuestions(
    user_id: string,
    start_date: string,
    end_date: string,
    year: string,
    subject: string,
  ) {
    const { data, error } = await this.server
      .from("completed_questions_view")
      .select(`*`)
      .eq("user_id", user_id)
      .gte("date", start_date)
      .lte("date", end_date)
      .eq("year", year)
      .eq("subject", subject)
      .order("date", { ascending: false })
      .limit(1000);

    if (error) throw error;

    // if(!data?.length) throw new FlexibleError("No completed questions", 400)

    return data;
  }

  async getSingle(user_id: string, question_id: number) {
    const { data, error } = await this.server
      .from("completed_questions")
      .select(
        `
                question_id,
                question: exercise_questions_effective(*)
                `,
      )
      .eq("user_id", user_id)
      .eq("question_id", question_id)
      .limit(1)
      .single();

    if (error) throw error;

    return data;
  }

  async getSummary(user_id: string) {
    const { data, error } = await (this.server as any).rpc(
      "get_user_completed_questions_summary",
      {
        _user_id: user_id,
      },
    );

    if (error) throw error;
    if (!data || data.length === 0) return null;

    return data[0];
  }

  async getRecentlyCompletedQuestionIds(user_id: string, days: number = 14) {
    // Calculate date threshold (14 days ago by default)
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - days);
    const thresholdDateString = thresholdDate.toISOString().split("T")[0]; // YYYY-MM-DD format

    const { data, error } = await this.server
      .from("completed_questions")
      .select("question_id")
      .eq("user_id", user_id)
      .gte("completed_at", thresholdDateString)
      .order("completed_at", { ascending: false });

    if (error) throw error;

    // Return array of question IDs that were completed in the last `days` days
    return data ? data.map((item) => item.question_id) : [];
  }
}
