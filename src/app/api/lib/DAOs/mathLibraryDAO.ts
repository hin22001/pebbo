import { PebboDatabase } from "@/src/app/api/lib/types/supabaseTypesOverride";
import { SupabaseClient } from "@supabase/supabase-js";

export class MathLibraryDAO {
  server: SupabaseClient<PebboDatabase, "public">;

  /**
   * @param server - expects Supabase service client
   */
  constructor(server: SupabaseClient<PebboDatabase, "public">) {
    this.server = server;
  }

  /**
   * Fetch active math assets, optionally filtered by year and category.
   */
  async getAssets(year?: number, categoryId?: number) {
    let query = this.server
      .from("math_assets")
      .select("*")
      .eq("status", "Active")
      .order("category_id", { ascending: true })
      .order("name", { ascending: true });

    if (year) {
      query = query.eq("year", year);
    }

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("MathLibraryDAO.getAssets error:", error);
      throw error;
    }

    return data || [];
  }
}
