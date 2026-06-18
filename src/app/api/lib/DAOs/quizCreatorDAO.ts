import { PebboDatabase } from "@/src/app/api/lib/types/supabaseTypesOverride";
import { SupabaseClient } from "@supabase/supabase-js";

export class QuizCreatorDAO {
  server: SupabaseClient<PebboDatabase, "public">;

  /**
   *
   * @param server - expects Supabase service client
   */
  constructor(server: SupabaseClient<PebboDatabase, "public">) {
    this.server = server;
  }

  async insert(user_id: string, quiz_id: number) {
    const { error } = await this.server.from("quiz_creators").insert({
      user_id: user_id,
      quiz_id: quiz_id,
    });

    if (error) throw error;
  }
}
