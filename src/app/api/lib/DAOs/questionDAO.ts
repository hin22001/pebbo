import { DBCompletedQuestion } from "@/src/app/api/lib/types/questionTypes";
import { Enums } from "@/src/app/api/lib/types/supabaseTypes";
import { PebboDatabase } from "@/src/app/api/lib/types/supabaseTypesOverride";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { SupabaseClient } from "@supabase/supabase-js";

export class QuestionDAO {
  server: SupabaseClient<PebboDatabase, "public">;

  /**
   *
   * @param server - expects Supabase server client
   */
  constructor(server: SupabaseClient<PebboDatabase, "public">) {
    this.server = server;
  }

  async getQuestions(
    user_id: string,
    region: string,
    categories: number[],
    difficulties: number[],
    year: string,
  ) {
    const { data, error } = await this.server.rpc(
      "get_questionobj_for_investor_demo",
      {
        categories: categories,
        difficulties: difficulties,
        region: region,
        _user_id: user_id,
        year: parseInt(year),
      },
    );

    if (error) throw error;

    if (!data || !(data as any[]).length) {
      throw new FlexibleError("Failed to create Questions", 500);
    }

    // Add randomization at the DAO level: shuffle the returned questions
    // This provides additional randomness beyond the database query
    const shuffledData = [...((data as any[]) || [])];
    for (let i = shuffledData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledData[i], shuffledData[j]] = [shuffledData[j], shuffledData[i]];
    }

    return shuffledData;
  }

  async getAttemptingQuestions(user_id: string, region: string) {
    const { data, error } = await this.server.rpc(
      "get_student_attempting_questions",
      {
        user_id: user_id,
        region: region,
      },
    );

    if (error) throw error;

    if (!data?.length) {
      throw new FlexibleError("Failed to get attempting Questions", 500);
    }

    return data;
  }

  async processCompletedQuestions(
    user_id: string,
    new_score: number[],
    DBCompletedQuestions: DBCompletedQuestion[],
    education_level: string,
    year: string,
  ) {
    const { data, error } = await this.server.rpc(
      "process_completed_questions_optimized",
      {
        _user_id: user_id,
        new_score: new_score,
        completed_qs: DBCompletedQuestions,
        education_level: education_level as Enums<"education_level">,
        year: year as Enums<"primary_years">,
      },
    );

    if (error) throw error;

    return data?.[0] as { coins_awarded: number; total_coins: number };
  }

  async get(question_id: number, audited?: boolean) {
    const query = this.server
      .from("exercise_questions_effective")
      .select("*")
      .eq("id", question_id);

    if (audited == undefined) {
      // query.eq('audited', true)
    } else {
      query.eq("audited", audited);
    }

    const { data, error } = await query.single();

    if (error) throw error;

    return data;
  }

  async reportIssue(
    user_id: string,
    question_id: number,
    reason: string,
    description?: string,
  ) {
    const { data, error } = await this.server
      .from("question_issues")
      .insert({
        user_id,
        question_id,
        reason,
        description: description || null,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }
}
