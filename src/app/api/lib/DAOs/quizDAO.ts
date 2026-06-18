import { AddQuestion, QuizBase } from "@/src/app/api/lib/types/quizTypes";
import {
  PebboDatabase,
  QuizQuestionsResponse,
} from "@/src/app/api/lib/types/supabaseTypesOverride";
import { Pagination } from "@/src/app/api/lib/utils/pagination";
import { SupabaseClient } from "@supabase/supabase-js";

export class QuizDAO {
  server: SupabaseClient<PebboDatabase, "public">;

  /**
   *
   * @param server - expects Supabase service client
   */
  constructor(server: SupabaseClient<PebboDatabase, "public">) {
    this.server = server;
  }

  async create(quizData: QuizBase[]) {
    const { data, error } = await this.server
      .from("quizzes")
      .insert(quizData)
      .select("*");

    if (error) throw error;

    return data;
  }

  async insertQuestions(user_id: string, quizQuestions: AddQuestion[]) {
    const { data, error } = await this.server.rpc("insert_quiz_questions", {
      _user_id: user_id,
      quiz_questions: quizQuestions,
    });

    if (error) throw error;

    return data;
  }

  async getByIds(school_id: number, quiz_ids: number[]) {
    const { data, error } = await this.server
      .from("quizzes")
      .select("*")
      .eq("school_id", school_id)
      .in("id", quiz_ids);

    if (error) throw error;

    return data;
  }

  async get(
    school_id: number,
    pagination: Pagination,
    quiz_id?: number,
    quiz_name?: string,
    date_created_start?: string,
    date_created_end?: string,
    start_date_start?: string,
    start_date_end?: string,
    end_date_start?: string,
    end_date_end?: string,
  ) {
    const query = this.server
      .from("quizzes")
      .select(
        `
                *,
                quiz_questions:quiz_junction(*)
            `,
        { count: "exact" },
      )
      .eq("school_id", school_id)
      .limit(pagination.getRowsPerPage())
      .range(pagination.getOffsetStart(), pagination.getOffsetEnd());

    if (quiz_id) query.eq("id", quiz_id);
    if (quiz_name) query.eq("quiz_name", quiz_name);
    if (date_created_start)
      query.filter("date_created", "gte", date_created_start);
    if (date_created_end) query.filter("date_created", "lte", date_created_end);
    if (start_date_start) query.filter("start_date", "gte", start_date_start);
    if (start_date_end) query.filter("start_date", "lte", start_date_end);
    if (end_date_start) query.filter("end_date", "gte", end_date_start);
    if (end_date_end) query.filter("end_date", "lte", end_date_end);

    const { data, count, error } = await query;

    if (error) throw error;

    return { data, count };
  }

  async removeQuestions(quiz_id: number, question_ids: number[]) {
    const { data, error } = await this.server.rpc("delete_quiz_questions", {
      _quiz_id: quiz_id,
      _question_ids: question_ids,
    });

    if (error) throw error;

    return data;
  }

  async getQuestions(school_id: number, quiz_id: number) {
    const { data, error } = await this.server
      .from("quiz_junction")
      .select(
        `
                *,
                user_question:user_questions(*)    
            `,
      )
      .eq("user_questions.school_id", school_id)
      .eq("quiz_id", quiz_id);

    if (error) throw error;

    return data;
  }

  async getQuestionsWithResponse(
    school_id?: number,
    quiz_id?: number,
    quiz_name?: string,
    date_created_start?: string,
    date_created_end?: string,
    start_date_start?: string,
    start_date_end?: string,
    end_date_start?: string,
    end_date_end?: string,
    question_id?: number,
    category?: string,
    subject?: string,
    student_id?: string,
    getEmptyResponse?: true,
    pagination?: Pagination,
  ) {
    const query = this.server.from("quiz_questions_responses").select(
      `
                quiz_id:q_quiz_id,
                school_id:q_school_id,
                quiz_name: q_quiz_name,
                date_created: q_date_created,
                start_date: q_start_date,
                end_date: q_end_date,
                question_id: uq_question_id,
                category: uq_category,
                subject: uq_subject,
                question_object: uq_question,
                student_id: qr_student_id,
                user_answers: qr_user_answers,
                accuracy: qr_accuracy,
                time_taken: qr_time_taken
            `,
      { count: "exact" },
    );

    if (quiz_id) query.eq("q_quiz_id", quiz_id);
    if (school_id) query.eq("q_school_id", school_id);
    if (quiz_name) query.eq("q_quiz_name", quiz_name);
    if (date_created_start)
      query.filter("q_date_created", "gte", date_created_start);
    if (date_created_end)
      query.filter("q_date_created", "lte", date_created_end);
    if (start_date_start) query.filter("q_start_date", "gte", start_date_start);
    if (start_date_end) query.filter("q_start_date", "lte", start_date_end);
    if (end_date_start) query.filter("q_end_date", "gte", end_date_start);
    if (end_date_end) query.filter("q_end_date", "lte", end_date_end);

    if (question_id) query.eq("uq_question_id", question_id);
    if (category) query.eq("uq_category", category);
    if (subject) query.eq("uq_subject", subject);

    if (getEmptyResponse) {
      if (student_id)
        query.or(`qr_student_id.eq.${student_id},qr_student_id.is.null`);
    } else {
      if (student_id) query.eq("qr_student_id", student_id);
    }

    if (pagination) {
      query.limit(pagination.getRowsPerPage());
      query.range(pagination.getOffsetStart(), pagination.getOffsetEnd());
    }

    const { data, count, error } =
      await query.returns<QuizQuestionsResponse[]>();

    if (error) throw error;

    return { data, count };
  }
}
