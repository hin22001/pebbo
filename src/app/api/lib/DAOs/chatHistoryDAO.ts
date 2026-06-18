import {
  QuestionChatHistory,
  QuestionChatMetaData,
} from "@/src/app/api/lib/types/potterChat";
import { PebboDatabase } from "@/src/app/api/lib/types/supabaseTypesOverride";
import { SupabaseClient } from "@supabase/supabase-js";

export class ChatHistoryDAO {
  server: SupabaseClient<PebboDatabase, "public">;

  /**
   *
   * @param server - expects Supabase service client
   */
  constructor(server: SupabaseClient<PebboDatabase, "public">) {
    this.server = server;
  }

  /**
   *
   * @param user_id
   * @param metadata
   * @returns chat history in ascending order
   */
  async get(user_id: string, metadata?: QuestionChatMetaData) {
    const query = this.server
      .from("chat_history")
      .select("*")
      .eq("user_id", user_id)
      .order("id", { ascending: true });

    if (metadata) query.eq("metadata", JSON.stringify(metadata));

    const { data, error } = await query;

    if (error) throw error;

    return data;
  }

  async insert(newChatHistory: QuestionChatHistory[]) {
    const { error } = await this.server
      .from("chat_history")
      .insert(newChatHistory);
  }
}
