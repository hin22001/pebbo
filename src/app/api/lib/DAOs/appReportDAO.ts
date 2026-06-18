import { SupabaseClient } from "@supabase/supabase-js";
import { PebboDatabase } from "@/src/app/api/lib/types/supabaseTypesOverride";

export class AppReportDAO {
  server: SupabaseClient<PebboDatabase, "public">;

  constructor(server: SupabaseClient<PebboDatabase, "public">) {
    this.server = server;
  }

  async reportAppIssue(
    user_id: string,
    category: string,
    description?: string,
  ) {
    const { data, error } = await this.server
      .from("app_reports")
      .insert({
        user_id,
        category,
        description: description || null,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }
}
