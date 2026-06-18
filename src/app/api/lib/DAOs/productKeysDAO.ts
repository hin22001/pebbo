import { PebboDatabase } from "@/src/app/api/lib/types/supabaseTypesOverride";
import { SupabaseClient } from "@supabase/supabase-js";

export class ProductKeysDAO {
  server: SupabaseClient<PebboDatabase, "public">;

  /**
   *
   * @param server - expects Supabase service client
   */
  constructor(server: SupabaseClient<PebboDatabase, "public">) {
    this.server = server;
  }

  async activateKey(user_id: string, key: string) {
    const { data, error } = await this.server
      .from("product_keys")
      .update({
        spender: user_id,
      })
      .eq("key", key)
      .is("spender", null)
      .select()
      .single();

    if (error) throw error;

    return data;
  }
}
