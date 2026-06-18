import { DefaultStudentData } from "@/src/app/api/lib/defaults/studentData";
import { Enums } from "@/src/app/api/lib/types/supabaseTypes";
import { PebboDatabase } from "@/src/app/api/lib/types/supabaseTypesOverride";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { SupabaseClient } from "@supabase/supabase-js";

export class StudentDAO {
  server: SupabaseClient<PebboDatabase, "public">;

  constructor(server: SupabaseClient<PebboDatabase, "public">) {
    this.server = server;
  }

  async getCategories(user_id: string, education_level: string, year: string) {
    const { data, error } = await (this.server as any).rpc(
      "get_user_categories",
      {
        _user_id: user_id,
        _education_level: education_level,
        _year: year,
      },
    );

    if (error) throw error;
    if (!data || (Array.isArray(data) && data.length === 0))
      throw new FlexibleError("Categories not found", 400);

    const result = (data as any)[0];
    if (!result.is_paying) {
      throw new FlexibleError("Student not paying", 403);
    }

    return { enabled_categories: result.enabled_categories };
  }

  async setCategories(
    user_id: string,
    education_level: string,
    year: string,
    enabled_categories: number[],
  ): Promise<void> {
    const score = DefaultStudentData.getInitialScores(education_level, year);

    if (score.length != enabled_categories.length) {
      throw new FlexibleError("Category mistmatch", 400);
    }

    const { error } = await this.server
      .from("student_data")
      .update({
        initial_scores: score,
        current_scores: score,
        enabled_categories: enabled_categories,
      })
      .eq("user_id", user_id)
      .eq("education_level", education_level as Enums<"education_level">)
      .eq("year", year as Enums<"primary_years">);

    if (error) throw error;
  }

  async getProfile(user_id: string) {
    // Get student profile
    const { data: studentData, error: studentError } = await this.server
      .from("students")
      .select(
        "stars, education_level, year, streak_count, total_streak, last_celebrated_level, last_celebrated_streak, todo_list, last_todo_date, last_celebrated_todo_date, onboarding_completed",
      )
      .eq("user_id", user_id)
      .single();

    if (studentError) throw studentError;

    // Get coin balance from user_coins view using raw SQL
    const { data: coinsData, error: coinsError } = await (
      this.server as any
    ).rpc("get_user_total_coins", { _user_id: user_id });

    // Merge the data (coins default to 0 if not found)
    return {
      ...(studentData as object),
      total_coins: coinsData || 0,
    };
  }

  async getContext(user_id: string) {
    const { data, error } = await this.server
      .from("students")
      .select("education_level, year")
      .eq("user_id", user_id)
      .single();

    if (error) throw error;
    if (!data) throw new FlexibleError("Context not found", 400);

    return data;
  }

  async getScoresUsingContext(user_id: string) {
    const { data, error } = await this.server
      .from("student_scores_categories")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (error) throw error;

    return data;
  }

  async setContext(
    user_id: string,
    education_level: string,
    year: string,
  ): Promise<void> {
    const initialScores = DefaultStudentData.getInitialScores(
      education_level,
      year,
    );

    const { error } = await this.server.rpc("set_student_context", {
      _user_id: user_id,
      _education_level: education_level as Enums<"education_level">,
      _year: year as Enums<"primary_years">,
      _initial_scores: initialScores,
      _current_scores: initialScores,
      _enabled_categories: DefaultStudentData.getInitialEnabledCategories(
        education_level,
        year,
      ),
    });

    if (error) throw error;
  }

  async setAttemptingQuestion(user_id: string, attempting_questions: number[]) {
    const { error } = await this.server
      .from("students")
      .update({
        attempting_questions: attempting_questions,
      })
      .eq("user_id", user_id);

    if (error) throw error;
  }

  async handleStreak(user_id: string) {
    const { data, error } = await (this.server as any).rpc(
      "handle_daily_streak",
      {
        _user_id: user_id,
      },
    );

    if (error) throw error;
    return data[0];
  }

  async updateLastCelebratedLevel(user_id: string, level: number) {
    const { error } = await this.server
      .from("students")
      .update({
        last_celebrated_level: level,
      })
      .eq("user_id", user_id);

    if (error) throw error;
  }

  async updateLastCelebratedStreak(user_id: string, streak: number) {
    const { error } = await this.server
      .from("students")
      .update({
        last_celebrated_streak: streak,
      })
      .eq("user_id", user_id);

    if (error) throw error;
  }

  async syncTodos(user_id: string, todo_list: string[], date: string) {
    const { error } = await this.server.rpc("handle_student_todos", {
      p_user_id: user_id,
      p_new_todos: todo_list,
      p_todo_date: date,
    });

    if (error) throw error;
  }

  async celebrateTodos(user_id: string, date: string) {
    const { error } = await this.server
      .from("students")
      .update({
        last_celebrated_todo_date: date,
      })
      .eq("user_id", user_id);

    if (error) throw error;
  }

  async completeOnboarding(user_id: string) {
    const { error } = await this.server
      .from("students")
      .update({
        onboarding_completed: true,
      })
      .eq("user_id", user_id);

    if (error) throw error;
  }
}
