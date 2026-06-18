import { PebboDatabase } from "@/src/app/api/lib/types/supabaseTypesOverride";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { Pagination } from "@/src/app/api/lib/utils/pagination";
import { SupabaseClient } from "@supabase/supabase-js";

export class UserQuestionsDAO {
  server: SupabaseClient<PebboDatabase, "public">;

  constructor(server: SupabaseClient<PebboDatabase, "public">) {
    this.server = server;
  }

  async insert(
    school_id: number,
    created_by: string,
    question: any,
    subject?: string,
    category?: string,
  ) {
    const { error } = await this.server.from("user_questions").insert({
      school_id: school_id,
      question: question,
      created_by: created_by,
      subject: subject,
      category: category,
    });

    if (error) throw error;
  }

  async get(
    school_id: number,
    order: string,
    pagination: Pagination,
    question_id?: number,
    category?: string,
    subject?: string,
    created_by?: string,
    created_at_start?: string,
    created_at_end?: string,
    mutable?: boolean,
  ) {
    const query = this.server
      .from("user_questions")
      .select(
        `
                *, 
                user: users(*)
            `,
        { count: "exact" },
      )
      .eq("school_id", school_id)
      .order("question_id", { ascending: order == "asc" ? true : false })
      .limit(pagination.getRowsPerPage())
      .range(pagination.getOffsetStart(), pagination.getOffsetEnd());

    if (question_id) query.eq("question_id", question_id);
    if (category) query.eq("category", category);
    if (subject) query.eq("subject", subject);
    if (created_by) query.eq("created_by", created_by);
    if (created_at_start) query.filter("created_at", "gte", created_at_start);
    if (created_at_end) query.filter("created_at", "lte", created_at_end);
    if (mutable) query.eq("mutable", mutable);

    const { data, count, error } = await query;

    if (error) throw error;

    return { data, count };
  }

  async update(
    school_id: number,
    question_id: number,
    question: any,
    subject: string,
    category: string,
  ) {
    const { data, error } = await this.server
      .from("user_questions")
      .update({
        question: question,
        subject: subject,
        category: category,
      })
      .eq("school_id", school_id)
      .eq("question_id", question_id)
      .eq("mutable", true)
      .select("*")
      .single();

    if (error) throw error;

    if (!data)
      throw new FlexibleError(
        "No questions updated, it is possible that this question is part of a quiz",
        500,
      );

    return data;
  }

  async delete(school_id: number, question_ids: number[]) {
    const { data, error } = await this.server
      .from("user_questions")
      .delete()
      .eq("school_id", school_id)
      .eq("mutable", true)
      .in("question_id", question_ids)
      .select();

    if (error) throw error;

    if (!data || !data?.length)
      throw new FlexibleError(
        "No questions deleted, it is possible that this question is part of a quiz",
        500,
      );

    return data;
  }
}
