import { SupabaseClient } from "@supabase/supabase-js";
import { PebboDatabase } from "@/src/app/api/lib/types/supabaseTypesOverride";
import { ClassroomQuiz } from "@/src/app/api/lib/types/classroomTypes";
import { Pagination } from "@/src/app/api/lib/utils/pagination";

export class ClassroomQuizzesDAO {
  server: SupabaseClient<PebboDatabase, "public">;

  /**
   *
   * @param server - expects Supabase server client
   */
  constructor(server: SupabaseClient<PebboDatabase, "public">) {
    this.server = server;
  }

  async insert(classroomQuizData: ClassroomQuiz[]) {
    const { data, error } = await this.server
      .from("classroom_quizzes")
      .insert(classroomQuizData)
      .select();

    if (error) throw error;

    return data;
  }

  async get(
    user_id: string,
    classroom_id?: number,
    quiz_id?: number,
    quiz_name?: string,
    date_created_start?: string,
    date_created_end?: string,
    start_date_start?: string,
    start_date_end?: string,
    end_date_start?: string,
    end_date_end?: string,
    pagination?: Pagination,
    order?: "asc" | "desc",
  ) {
    // Porting filters to RPC arguments
    const { data, error } = await (this.server as any).rpc(
      "get_user_classroom_quizzes",
      {
        _user_id: user_id,
        _classroom_id: classroom_id || null,
        _quiz_id: quiz_id || null,
        _quiz_name: quiz_name || null,
        _order_asc: order === "asc" ? true : false,
        _limit: pagination ? pagination.getRowsPerPage() : 10,
        _offset: pagination ? pagination.getOffsetStart() : 0,
      },
    );

    if (error) throw error;

    // The RPC returns total_count in each row
    const count = data && data.length > 0 ? data[0].total_count : 0;

    return { data, count };
  }

  async delete(classroom_id: number, quiz_ids: number[]) {
    const { data, error } = await this.server
      .from("classroom_quizzes")
      .delete()
      .eq("classroom_id", classroom_id)
      .in("quiz_id", quiz_ids)
      .select("*");

    if (error) throw error;

    return data;
  }
}
