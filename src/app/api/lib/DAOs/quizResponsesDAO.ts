import { CompletedUserQuizQuestion } from "@/src/app/api/lib/types/questionTypes";
import { PebboDatabase } from "@/src/app/api/lib/types/supabaseTypesOverride";
import { SupabaseClient } from "@supabase/supabase-js";

export class QuizResponsesDAO {
  server: SupabaseClient<PebboDatabase, "public">;

  /**
   *
   * @param server - expects Supabase service client
   */
  constructor(server: SupabaseClient<PebboDatabase, "public">) {
    this.server = server;
  }

  async delete(question_ids: number[]) {
    const { data, error } = await this.server
      .from("quiz_responses")
      .delete()
      .in("question_id", question_ids)
      .select();

    if (error) throw error;

    return data;
  }

  async insert(completed_quiz_questions: CompletedUserQuizQuestion[]) {
    const { data, error } = await this.server
      .from("quiz_responses")
      .insert(completed_quiz_questions)
      .select("*");

    if (error) throw error;

    return data;
  }
}
