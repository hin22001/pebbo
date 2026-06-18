import { MergeDeep } from "type-fest";
import { Database } from "@/src/app/api/lib/types/supabaseTypes";
import { TipTapNode, UserAnswers } from "@/src/app/api/lib/types/questionTypes";

export type PebboDatabase = MergeDeep<
  Database,
  {
    public: {
      Views: {
        completed_questions_view: {
          Row: {
            concept: string;
            date: string;
            difficulty: number;
            id: number;
            inner_category: number;
            need_image: boolean;
            outer_category: number;
            question_id: number;
            question_type: string;
            subject: string;
            time_taken: number;
            user_id: string;
            year: number;
          };
        };
        student_scores_categories: {
          Row: {
            current_scores: number[];
            education_level: Database["public"]["Enums"]["education_level"];
            enabled_categories: number[];
            user_id: string;
            year: Database["public"]["Enums"]["primary_years"];
          };
        };
        user_daily_reports: {
          Row: {
            date: string;
            subject: string;
            user_id: string;
            year: number;
          };
        };
        user_weekly_reports: {
          Row: {
            subject: string;
            user_id: string;
            week_start: string;
            year: number;
          };
        };
        role_counts_by_school: {
          Row: {
            role: string;
            role_count: number;
            school_id: number;
          };
        };
        school_user_licenses: {
          Row: {
            admin_count: number;
            admin_licenses: number;
            school_id: number;
            teacher_count: number;
            teacher_licenses: number;
          };
        };
        // quiz_questions_responses: {
        //     Row: {
        //         q_quiz_id: number,
        //         q_school_id: number,
        //         q_quiz_name: string,
        //         q_date_created: string,
        //         q_start_date: string,
        //         q_end_date: string,
        //         uq_question_id: number,
        //         uq_category: string,
        //         uq_subject: string,
        //         uq_question: TipTapNode
        //         qr_user_answers: UserAnswers[] | null
        //         qr_student_id: string | null
        //     }
        // }
        exercise_questions_effective: {
          Row: {
            id: number;
            year: number;
            outer_category: number;
            inner_category: number;
            subject: string;
            concept: string;
            question_type: string;
            difficulty: number;
            need_image: boolean;
            question_object_en: TipTapNode;
            question_object_zh: TipTapNode;
            image_description: string | null;
            image_approved: boolean | null;
            audited: boolean;
          };
        };
      }; // Added missing closing brace for Views
      Tables: {
        students: {
          Row: {
            user_id: string;
            stars: number;
            attempting_questions: number[];
            education_level: Database["public"]["Enums"]["education_level"];
            year: Database["public"]["Enums"]["primary_years"];
            last_checkin_date: string | null;
            daily_study_seconds: number;
            streak_count: number;
            total_streak: number;
            last_celebrated_level: number;
            todo_list: string[];
            last_todo_date: string | null;
            last_celebrated_todo_date: string | null;
          };
          Update: {
            user_id?: string;
            stars?: number;
            attempting_questions?: number[] | null;
            education_level?: Database["public"]["Enums"]["education_level"];
            year?: Database["public"]["Enums"]["primary_years"];
            last_checkin_date?: string | null;
            daily_study_seconds?: number;
            streak_count?: number;
            total_streak?: number;
            last_celebrated_level?: number;
            todo_list?: string[];
            last_todo_date?: string | null;
            last_celebrated_todo_date?: string | null;
          };
        };
      };
      Functions: {
        get_questionobj_bycategoryregion_optimized: {
          Args: {
            categories: number[];
            difficulties: number[];
            region: string;
            _user_id: string;
            year: number;
          };
          Returns: {
            id: number;
            outer_category: number;
            difficulty: number;
            question_object: TipTapNode;
          }[];
        };
        get_questionobj_for_investor_demo: {
          Args: {
            categories: number[];
            difficulties: number[];
            region: string;
            _user_id: string;
            year: number;
          };
          Returns: {
            id: number;
            outer_category: number;
            difficulty: number;
            question_object: TipTapNode;
          }[];
        };
        handle_daily_streak: {
          Args: { p_user_id: string };
          Returns: any;
        };
        handle_student_todos: {
          Args: {
            p_user_id: string;
            p_new_todos: string[];
            p_todo_date: string;
          };
          Returns: any;
        };
        get_user_categories: {
          id: number;
          outer_category: number;
          difficulty: number;
          question_object: TipTapNode;
        }[];
        process_completed_questions_optimized: {
          Args: {
            _user_id: string;
            new_score: number[];
            completed_qs: any;
            education_level: string;
            year: string;
          };
          Returns: {
            coins_awarded: number;
            total_coins: number;
          }[];
        };
      };
    };
  }
>;

export type QuizQuestionsResponse = {
  quiz_id: number;
  school_id: number;
  quiz_name: string;
  date_created: string;
  start_date: string;
  end_date: string;
  question_id: number;
  category: string;
  subject: string;
  question_object: TipTapNode;
  student_id: string | null;
  user_answers: UserAnswers[] | null;
  accuracy: number | null;
  time_taken: number | null;
};
