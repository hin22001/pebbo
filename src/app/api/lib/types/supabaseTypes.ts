export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  management: {
    Tables: {
      inputters: {
        Row: {
          id: number;
          name: string | null;
          password: string;
          role: string;
          username: string;
          year: string | null;
        };
        Insert: {
          id?: number;
          name?: string | null;
          password: string;
          role: string;
          username: string;
          year?: string | null;
        };
        Update: {
          id?: number;
          name?: string | null;
          password?: string;
          role?: string;
          username?: string;
          year?: string | null;
        };
        Relationships: [];
      };
      labels: {
        Row: {
          comment: string;
          hex_code: string;
          id: number;
        };
        Insert: {
          comment: string;
          hex_code: string;
          id?: number;
        };
        Update: {
          comment?: string;
          hex_code?: string;
          id?: number;
        };
        Relationships: [];
      };
      question_labels: {
        Row: {
          id: number;
          label_id: number;
          question_id: number;
        };
        Insert: {
          id?: number;
          label_id: number;
          question_id: number;
        };
        Update: {
          id?: number;
          label_id?: number;
          question_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "question_labels_label_id_fkey";
            columns: ["label_id"];
            isOneToOne: false;
            referencedRelation: "labels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_labels_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "primary_questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_labels_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "question_with_version";
            referencedColumns: ["question_id"];
          },
          {
            foreignKeyName: "question_labels_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions_with_labels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_labels_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions_with_management";
            referencedColumns: ["id"];
          },
        ];
      };
      question_management: {
        Row: {
          assigned_to: number | null;
          done_by: number | null;
          id: number;
          question_id: number;
        };
        Insert: {
          assigned_to?: number | null;
          done_by?: number | null;
          id?: number;
          question_id: number;
        };
        Update: {
          assigned_to?: number | null;
          done_by?: number | null;
          id?: number;
          question_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "question_management_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "inputters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_management_done_by_fkey";
            columns: ["done_by"];
            isOneToOne: false;
            referencedRelation: "inputters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_management_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "primary_questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_management_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "question_with_version";
            referencedColumns: ["question_id"];
          },
          {
            foreignKeyName: "question_management_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions_with_labels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_management_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions_with_management";
            referencedColumns: ["id"];
          },
        ];
      };
      question_patches: {
        Row: {
          created_by: number | null;
          id: number;
          patch: Json | null;
          previous_patch_id: number | null;
          question_id: number;
        };
        Insert: {
          created_by?: number | null;
          id?: number;
          patch?: Json | null;
          previous_patch_id?: number | null;
          question_id: number;
        };
        Update: {
          created_by?: number | null;
          id?: number;
          patch?: Json | null;
          previous_patch_id?: number | null;
          question_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "question_patches_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "inputters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_patches_previous_patch_id_fkey";
            columns: ["previous_patch_id"];
            isOneToOne: false;
            referencedRelation: "question_patches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_patches_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "primary_questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_patches_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "question_with_version";
            referencedColumns: ["question_id"];
          },
          {
            foreignKeyName: "question_patches_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions_with_labels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_patches_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions_with_management";
            referencedColumns: ["id"];
          },
        ];
      };
      question_snapshots: {
        Row: {
          created_by: number | null;
          id: number;
          question_buffer: string;
          question_id: number;
          sha_hash: string;
        };
        Insert: {
          created_by?: number | null;
          id?: number;
          question_buffer: string;
          question_id: number;
          sha_hash: string;
        };
        Update: {
          created_by?: number | null;
          id?: number;
          question_buffer?: string;
          question_id?: number;
          sha_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: "question_snapshots_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "inputters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_snapshots_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "primary_questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_snapshots_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "question_with_version";
            referencedColumns: ["question_id"];
          },
          {
            foreignKeyName: "question_snapshots_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions_with_labels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_snapshots_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions_with_management";
            referencedColumns: ["id"];
          },
        ];
      };
      question_versions: {
        Row: {
          current_patch_id: number | null;
          id: number;
          question_id: number;
        };
        Insert: {
          current_patch_id?: number | null;
          id?: number;
          question_id: number;
        };
        Update: {
          current_patch_id?: number | null;
          id?: number;
          question_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "question_versions_current_patch_id_fkey1";
            columns: ["current_patch_id"];
            isOneToOne: false;
            referencedRelation: "question_patches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_versions_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: true;
            referencedRelation: "primary_questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_versions_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: true;
            referencedRelation: "question_with_version";
            referencedColumns: ["question_id"];
          },
          {
            foreignKeyName: "question_versions_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: true;
            referencedRelation: "questions_with_labels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_versions_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: true;
            referencedRelation: "questions_with_management";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      question_with_version: {
        Row: {
          audited: boolean | null;
          book_ref: string | null;
          concept: string | null;
          created_by: number | null;
          current_patch_id: number | null;
          difficulty: number | null;
          inner_category: number | null;
          need_image: boolean | null;
          outer_category: number | null;
          patch: Json | null;
          question_id: number | null;
          question_object_en: Json | null;
          question_object_zh: Json | null;
          question_type: string | null;
          subject: string | null;
          version_id: number | null;
          year: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "question_patches_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "inputters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_versions_current_patch_id_fkey1";
            columns: ["current_patch_id"];
            isOneToOne: false;
            referencedRelation: "question_patches";
            referencedColumns: ["id"];
          },
        ];
      };
      questions_with_labels: {
        Row: {
          audited: boolean | null;
          book_ref: string | null;
          concept: string | null;
          difficulty: number | null;
          id: number | null;
          inner_category: number | null;
          label_details: Json[] | null;
          label_ids: number[] | null;
          need_image: boolean | null;
          outer_category: number | null;
          question_object_en: Json | null;
          question_object_zh: Json | null;
          question_type: string | null;
          subject: string | null;
          year: number | null;
        };
        Relationships: [];
      };
      questions_with_management: {
        Row: {
          audited: boolean | null;
          book_ref: string | null;
          concept: string | null;
          difficulty: number | null;
          en_empty: boolean | null;
          id: number | null;
          inner_category: number | null;
          need_image: boolean | null;
          outer_category: number | null;
          question_object_en: Json | null;
          question_object_zh: Json | null;
          question_type: string | null;
          subject: string | null;
          year: number | null;
          zh_empty: boolean | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      admins: {
        Row: {
          admin_id: string;
        };
        Insert: {
          admin_id?: string;
        };
        Update: {
          admin_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_admins_admin_id_fkey";
            columns: ["admin_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_history: {
        Row: {
          created_at: string;
          id: number;
          message: string;
          metadata: Json;
          role: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          message: string;
          metadata: Json;
          role: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          message?: string;
          metadata?: Json;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      classroom_participants: {
        Row: {
          classroom_id: number;
          confirmed: boolean;
          id: number;
          user_id: string;
        };
        Insert: {
          classroom_id: number;
          confirmed?: boolean;
          id?: number;
          user_id: string;
        };
        Update: {
          classroom_id?: number;
          confirmed?: boolean;
          id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_classroom_students_classroom_id_fkey";
            columns: ["classroom_id"];
            isOneToOne: false;
            referencedRelation: "classroom_details";
            referencedColumns: ["c_classroom_id"];
          },
          {
            foreignKeyName: "public_classroom_students_classroom_id_fkey";
            columns: ["classroom_id"];
            isOneToOne: false;
            referencedRelation: "classroom_summary";
            referencedColumns: ["c_classroom_id"];
          },
          {
            foreignKeyName: "public_classroom_students_classroom_id_fkey";
            columns: ["classroom_id"];
            isOneToOne: false;
            referencedRelation: "classrooms";
            referencedColumns: ["classroom_id"];
          },
          {
            foreignKeyName: "public_classroom_students_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      classroom_quizzes: {
        Row: {
          classroom_id: number;
          id: number;
          quiz_id: number;
        };
        Insert: {
          classroom_id: number;
          id?: number;
          quiz_id: number;
        };
        Update: {
          classroom_id?: number;
          id?: number;
          quiz_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "classroom_quizzes_classroom_id_fkey";
            columns: ["classroom_id"];
            isOneToOne: false;
            referencedRelation: "classroom_details";
            referencedColumns: ["c_classroom_id"];
          },
          {
            foreignKeyName: "classroom_quizzes_classroom_id_fkey";
            columns: ["classroom_id"];
            isOneToOne: false;
            referencedRelation: "classroom_summary";
            referencedColumns: ["c_classroom_id"];
          },
          {
            foreignKeyName: "classroom_quizzes_classroom_id_fkey";
            columns: ["classroom_id"];
            isOneToOne: false;
            referencedRelation: "classrooms";
            referencedColumns: ["classroom_id"];
          },
          {
            foreignKeyName: "classroom_quizzes_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quiz_questions_responses";
            referencedColumns: ["q_quiz_id"];
          },
          {
            foreignKeyName: "classroom_quizzes_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id"];
          },
        ];
      };
      classrooms: {
        Row: {
          archived: boolean;
          classroom_id: number;
          classroom_name: string;
          school_id: number;
        };
        Insert: {
          archived?: boolean;
          classroom_id?: number;
          classroom_name: string;
          school_id: number;
        };
        Update: {
          archived?: boolean;
          classroom_id?: number;
          classroom_name?: string;
          school_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "public_classrooms_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "school_user_licenses";
            referencedColumns: ["school_id"];
          },
          {
            foreignKeyName: "public_classrooms_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["school_id"];
          },
        ];
      };
      completed_questions: {
        Row: {
          accuracy: number;
          completed_at: string;
          id: number;
          question_id: number;
          time_taken: number;
          user_id: string;
        };
        Insert: {
          accuracy: number;
          completed_at?: string;
          id?: number;
          question_id: number;
          time_taken: number;
          user_id: string;
        };
        Update: {
          accuracy?: number;
          completed_at?: string;
          id?: number;
          question_id?: number;
          time_taken?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "completed_questions_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "primary_questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "completed_questions_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "question_with_version";
            referencedColumns: ["question_id"];
          },
          {
            foreignKeyName: "completed_questions_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions_with_labels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "completed_questions_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions_with_management";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "completed_questions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "student_scores_categories";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "completed_questions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["user_id"];
          },
        ];
      };
      inputters: {
        Row: {
          password: string | null;
          role: string;
          username: string;
          year: string | null;
        };
        Insert: {
          password?: string | null;
          role?: string;
          username: string;
          year?: string | null;
        };
        Update: {
          password?: string | null;
          role?: string;
          username?: string;
          year?: string | null;
        };
        Relationships: [];
      };
      primary_questions: {
        Row: {
          audited: boolean;
          book_ref: string;
          concept: string;
          difficulty: number;
          id: number;
          inner_category: number;
          need_image: boolean;
          outer_category: number;
          question_object_en: Json | null;
          question_object_zh: Json | null;
          question_type: string;
          subject: string;
          year: number;
        };
        Insert: {
          audited?: boolean;
          book_ref: string;
          concept: string;
          difficulty: number;
          id?: number;
          inner_category: number;
          need_image: boolean;
          outer_category: number;
          question_object_en?: Json | null;
          question_object_zh?: Json | null;
          question_type: string;
          subject: string;
          year: number;
        };
        Update: {
          audited?: boolean;
          book_ref?: string;
          concept?: string;
          difficulty?: number;
          id?: number;
          inner_category?: number;
          need_image?: boolean;
          outer_category?: number;
          question_object_en?: Json | null;
          question_object_zh?: Json | null;
          question_type?: string;
          subject?: string;
          year?: number;
        };
        Relationships: [];
      };
      product_keys: {
        Row: {
          created_at: string;
          id: number;
          key: string;
          spender: string | null;
          valid_until: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          key?: string;
          spender?: string | null;
          valid_until?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          key?: string;
          spender?: string | null;
          valid_until?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_keys_spender_fkey";
            columns: ["spender"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_creators: {
        Row: {
          id: number;
          quiz_id: number;
          user_id: string;
        };
        Insert: {
          id?: number;
          quiz_id: number;
          user_id: string;
        };
        Update: {
          id?: number;
          quiz_id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_quiz_creator_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_creators_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quiz_questions_responses";
            referencedColumns: ["q_quiz_id"];
          },
          {
            foreignKeyName: "quiz_creators_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_junction: {
        Row: {
          id: number;
          question_id: number;
          quiz_id: number;
        };
        Insert: {
          id?: number;
          question_id: number;
          quiz_id: number;
        };
        Update: {
          id?: number;
          question_id?: number;
          quiz_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_junction_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "quiz_questions_responses";
            referencedColumns: ["uq_question_id"];
          },
          {
            foreignKeyName: "quiz_junction_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "user_questions";
            referencedColumns: ["question_id"];
          },
          {
            foreignKeyName: "quiz_junction_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quiz_questions_responses";
            referencedColumns: ["q_quiz_id"];
          },
          {
            foreignKeyName: "quiz_junction_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_responses: {
        Row: {
          accuracy: number;
          id: number;
          question_id: number;
          quiz_id: number;
          student_id: string;
          time_taken: number;
          user_answers: Json;
        };
        Insert: {
          accuracy: number;
          id?: number;
          question_id: number;
          quiz_id: number;
          student_id: string;
          time_taken: number;
          user_answers: Json;
        };
        Update: {
          accuracy?: number;
          id?: number;
          question_id?: number;
          quiz_id?: number;
          student_id?: string;
          time_taken?: number;
          user_answers?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "completed_quizzes_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "quiz_questions_responses";
            referencedColumns: ["uq_question_id"];
          },
          {
            foreignKeyName: "completed_quizzes_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "user_questions";
            referencedColumns: ["question_id"];
          },
          {
            foreignKeyName: "public_completed_quizzes_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quiz_questions_responses";
            referencedColumns: ["q_quiz_id"];
          },
          {
            foreignKeyName: "public_completed_quizzes_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_completed_quizzes_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_scores_categories";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "public_completed_quizzes_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["user_id"];
          },
        ];
      };
      quizzes: {
        Row: {
          date_created: string;
          end_date: string;
          id: number;
          quiz_name: string;
          school_id: number;
          start_date: string;
        };
        Insert: {
          date_created?: string;
          end_date: string;
          id?: number;
          quiz_name: string;
          school_id: number;
          start_date: string;
        };
        Update: {
          date_created?: string;
          end_date?: string;
          id?: number;
          quiz_name?: string;
          school_id?: number;
          start_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quizzes_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "school_user_licenses";
            referencedColumns: ["school_id"];
          },
          {
            foreignKeyName: "quizzes_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["school_id"];
          },
        ];
      };
      schools: {
        Row: {
          admin_licenses: number;
          payment_notes: string | null;
          school_id: number;
          school_name: string;
          teacher_licenses: number;
        };
        Insert: {
          admin_licenses: number;
          payment_notes?: string | null;
          school_id?: number;
          school_name: string;
          teacher_licenses: number;
        };
        Update: {
          admin_licenses?: number;
          payment_notes?: string | null;
          school_id?: number;
          school_name?: string;
          teacher_licenses?: number;
        };
        Relationships: [];
      };
      student_data: {
        Row: {
          current_scores: number[];
          education_level: Database["public"]["Enums"]["education_level"];
          enabled_categories: number[];
          id: number;
          initial_scores: number[];
          user_id: string;
          year: Database["public"]["Enums"]["primary_years"];
        };
        Insert: {
          current_scores?: number[];
          education_level?: Database["public"]["Enums"]["education_level"];
          enabled_categories?: number[];
          id?: number;
          initial_scores?: number[];
          user_id: string;
          year?: Database["public"]["Enums"]["primary_years"];
        };
        Update: {
          current_scores?: number[];
          education_level?: Database["public"]["Enums"]["education_level"];
          enabled_categories?: number[];
          id?: number;
          initial_scores?: number[];
          user_id?: string;
          year?: Database["public"]["Enums"]["primary_years"];
        };
        Relationships: [
          {
            foreignKeyName: "public_student_data_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      students: {
        Row: {
          attempting_questions: number[] | null;
          education_level: Database["public"]["Enums"]["education_level"];
          stars: number;
          user_id: string;
          year: Database["public"]["Enums"]["primary_years"];
        };
        Insert: {
          attempting_questions?: number[] | null;
          education_level?: Database["public"]["Enums"]["education_level"];
          stars?: number;
          user_id: string;
          year?: Database["public"]["Enums"]["primary_years"];
        };
        Update: {
          attempting_questions?: number[] | null;
          education_level?: Database["public"]["Enums"]["education_level"];
          stars?: number;
          user_id?: string;
          year?: Database["public"]["Enums"]["primary_years"];
        };
        Relationships: [
          {
            foreignKeyName: "temp_users_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      teachers: {
        Row: {
          is_subject_head: boolean;
          teacher_id: string;
          teaching_subject: Database["public"]["Enums"]["subjects"][];
        };
        Insert: {
          is_subject_head?: boolean;
          teacher_id?: string;
          teaching_subject: Database["public"]["Enums"]["subjects"][];
        };
        Update: {
          is_subject_head?: boolean;
          teacher_id?: string;
          teaching_subject?: Database["public"]["Enums"]["subjects"][];
        };
        Relationships: [
          {
            foreignKeyName: "public_teachers_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_questions: {
        Row: {
          access: string;
          category: string | null;
          created_at: string;
          created_by: string;
          mutable: boolean;
          question: Json;
          question_id: number;
          school_id: number;
          subject: string | null;
        };
        Insert: {
          access?: string;
          category?: string | null;
          created_at?: string;
          created_by: string;
          mutable?: boolean;
          question: Json;
          question_id?: number;
          school_id: number;
          subject?: string | null;
        };
        Update: {
          access?: string;
          category?: string | null;
          created_at?: string;
          created_by?: string;
          mutable?: boolean;
          question?: Json;
          question_id?: number;
          school_id?: number;
          subject?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_user_created_questions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_user_created_questions_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "school_user_licenses";
            referencedColumns: ["school_id"];
          },
          {
            foreignKeyName: "public_user_created_questions_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["school_id"];
          },
          {
            foreignKeyName: "user_questions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      users: {
        Row: {
          first_name: string | null;
          last_name: string | null;
          paying: boolean;
          profile_image: number;
          referral_code: string | null;
          referred_by: string | null;
          role: string;
          school_id: number | null;
          stripe_customer_id: string | null;
          user_id: string;
        };
        Insert: {
          first_name?: string | null;
          last_name?: string | null;
          paying?: boolean;
          profile_image?: number;
          referral_code?: string | null;
          referred_by?: string | null;
          role?: string;
          school_id?: number | null;
          stripe_customer_id?: string | null;
          user_id: string;
        };
        Update: {
          first_name?: string | null;
          last_name?: string | null;
          paying?: boolean;
          profile_image?: number;
          referral_code?: string | null;
          referred_by?: string | null;
          role?: string;
          school_id?: number | null;
          stripe_customer_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_users_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "school_user_licenses";
            referencedColumns: ["school_id"];
          },
          {
            foreignKeyName: "public_users_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["school_id"];
          },
          {
            foreignKeyName: "public_users_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "users_referred_by_fkey";
            columns: ["referred_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["referral_code"];
          },
        ];
      };
    };
    Views: {
      classroom_details: {
        Row: {
          c_archived: boolean | null;
          c_classroom_id: number | null;
          c_classroom_name: string | null;
          c_school_id: number | null;
          cp_confirmed: boolean | null;
          cp_user_id: string | null;
          s_education_level:
            | Database["public"]["Enums"]["education_level"]
            | null;
          s_stars: number | null;
          s_year: Database["public"]["Enums"]["primary_years"] | null;
          t_is_subject_head: boolean | null;
          t_teaching_subject: Database["public"]["Enums"]["subjects"][] | null;
          u_email: string | null;
          u_first_name: string | null;
          u_last_name: string | null;
          u_role: string | null;
          u_school_id: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_classroom_students_user_id_fkey";
            columns: ["cp_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_classrooms_school_id_fkey";
            columns: ["c_school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["school_id"];
          },
          {
            foreignKeyName: "public_classrooms_school_id_fkey";
            columns: ["c_school_id"];
            isOneToOne: false;
            referencedRelation: "school_user_licenses";
            referencedColumns: ["school_id"];
          },
          {
            foreignKeyName: "public_users_school_id_fkey";
            columns: ["u_school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["school_id"];
          },
          {
            foreignKeyName: "public_users_school_id_fkey";
            columns: ["u_school_id"];
            isOneToOne: false;
            referencedRelation: "school_user_licenses";
            referencedColumns: ["school_id"];
          },
        ];
      };
      classroom_quizzes_aggregate: {
        Row: {
          cp_classroom_id: number | null;
          cp_confirmed: boolean | null;
          cp_id: number | null;
          cp_user_id: string | null;
          cq_id: number | null;
          cq_quiz_id: number | null;
          q_date_created: string | null;
          q_end_date: string | null;
          q_quiz_name: string | null;
          q_school_id: number | null;
          q_start_date: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "classroom_quizzes_quiz_id_fkey";
            columns: ["cq_quiz_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "classroom_quizzes_quiz_id_fkey";
            columns: ["cq_quiz_id"];
            isOneToOne: false;
            referencedRelation: "quiz_questions_responses";
            referencedColumns: ["q_quiz_id"];
          },
          {
            foreignKeyName: "public_classroom_students_classroom_id_fkey";
            columns: ["cp_classroom_id"];
            isOneToOne: false;
            referencedRelation: "classrooms";
            referencedColumns: ["classroom_id"];
          },
          {
            foreignKeyName: "public_classroom_students_classroom_id_fkey";
            columns: ["cp_classroom_id"];
            isOneToOne: false;
            referencedRelation: "classroom_details";
            referencedColumns: ["c_classroom_id"];
          },
          {
            foreignKeyName: "public_classroom_students_classroom_id_fkey";
            columns: ["cp_classroom_id"];
            isOneToOne: false;
            referencedRelation: "classroom_summary";
            referencedColumns: ["c_classroom_id"];
          },
          {
            foreignKeyName: "public_classroom_students_user_id_fkey";
            columns: ["cp_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quizzes_school_id_fkey";
            columns: ["q_school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["school_id"];
          },
          {
            foreignKeyName: "quizzes_school_id_fkey";
            columns: ["q_school_id"];
            isOneToOne: false;
            referencedRelation: "school_user_licenses";
            referencedColumns: ["school_id"];
          },
        ];
      };
      classroom_summary: {
        Row: {
          all_teaching_subjects:
            | Database["public"]["Enums"]["subjects"][]
            | null;
          c_classroom_id: number | null;
          c_classroom_name: string | null;
          c_school_id: number | null;
          first_names: string[] | null;
          last_names: string[] | null;
          total_students: number | null;
          total_teachers: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_classrooms_school_id_fkey";
            columns: ["c_school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["school_id"];
          },
          {
            foreignKeyName: "public_classrooms_school_id_fkey";
            columns: ["c_school_id"];
            isOneToOne: false;
            referencedRelation: "school_user_licenses";
            referencedColumns: ["school_id"];
          },
        ];
      };
      completed_questions_summary: {
        Row: {
          average_accuracy: number | null;
          total_completed: number | null;
          total_fully_accurate: number | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "completed_questions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "completed_questions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "student_scores_categories";
            referencedColumns: ["user_id"];
          },
        ];
      };
      completed_questions_view: {
        Row: {
          accuracy: number | null;
          concept: string | null;
          date: string | null;
          difficulty: number | null;
          id: number | null;
          inner_category: number | null;
          need_image: boolean | null;
          outer_category: number | null;
          question_id: number | null;
          question_type: string | null;
          subject: string | null;
          time_taken: number | null;
          user_id: string | null;
          year: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "completed_questions_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "primary_questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "completed_questions_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "question_with_version";
            referencedColumns: ["question_id"];
          },
          {
            foreignKeyName: "completed_questions_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions_with_labels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "completed_questions_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions_with_management";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "completed_questions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "completed_questions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "student_scores_categories";
            referencedColumns: ["user_id"];
          },
        ];
      };
      quiz_questions_responses: {
        Row: {
          q_date_created: string | null;
          q_end_date: string | null;
          q_quiz_id: number | null;
          q_quiz_name: string | null;
          q_school_id: number | null;
          q_start_date: string | null;
          qr_accuracy: number | null;
          qr_student_id: string | null;
          qr_time_taken: number | null;
          qr_user_answers: Json | null;
          uq_category: string | null;
          uq_question: Json | null;
          uq_question_id: number | null;
          uq_subject: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_completed_quizzes_student_id_fkey";
            columns: ["qr_student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "public_completed_quizzes_student_id_fkey";
            columns: ["qr_student_id"];
            isOneToOne: false;
            referencedRelation: "student_scores_categories";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "quizzes_school_id_fkey";
            columns: ["q_school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["school_id"];
          },
          {
            foreignKeyName: "quizzes_school_id_fkey";
            columns: ["q_school_id"];
            isOneToOne: false;
            referencedRelation: "school_user_licenses";
            referencedColumns: ["school_id"];
          },
        ];
      };
      role_counts_by_school: {
        Row: {
          role: string | null;
          role_count: number | null;
          school_id: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_users_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["school_id"];
          },
          {
            foreignKeyName: "public_users_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "school_user_licenses";
            referencedColumns: ["school_id"];
          },
        ];
      };
      school_user_licenses: {
        Row: {
          admin_count: number | null;
          admin_licenses: number | null;
          school_id: number | null;
          teacher_count: number | null;
          teacher_licenses: number | null;
        };
        Relationships: [];
      };
      student_scores_categories: {
        Row: {
          current_scores: number[] | null;
          education_level:
            | Database["public"]["Enums"]["education_level"]
            | null;
          enabled_categories: number[] | null;
          user_id: string | null;
          year: Database["public"]["Enums"]["primary_years"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "temp_users_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_daily_reports: {
        Row: {
          date: string | null;
          subject: string | null;
          user_id: string | null;
          year: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "completed_questions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "completed_questions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "student_scores_categories";
            referencedColumns: ["user_id"];
          },
        ];
      };
      user_weekly_reports: {
        Row: {
          subject: string | null;
          user_id: string | null;
          week_start: string | null;
          year: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "completed_questions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "completed_questions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "student_scores_categories";
            referencedColumns: ["user_id"];
          },
        ];
      };
    };
    Functions: {
      create_classroom: {
        Args: {
          user_id_param: string;
          classroom_name: string;
        };
        Returns: number;
      };
      delete_classroom_users: {
        Args: {
          _datas: Json;
        };
        Returns: string[];
      };
      delete_quiz_questions: {
        Args: {
          _quiz_id: number;
          _question_ids: number[];
        };
        Returns: {
          id: number;
          quiz_id: number;
          question_id: number;
        }[];
      };
      generate_referral_code: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_attempting_questions: {
        Args: {
          user_id: string;
          region: string;
        };
        Returns: {
          question_id: number;
          question_object: Json;
        }[];
      };
      get_email_by_user: {
        Args: {
          _user_id: string;
        };
        Returns: {
          user_id: string;
          user_email: string;
        }[];
      };
      get_paginated_user_daily_reports: {
        Args: {
          _user_id: string;
          requested_rows: number;
          page_number: number;
          specific_date: string;
        };
        Returns: {
          date: string;
          subject: string;
        }[];
      };
      get_paginated_user_weekly_reports: {
        Args: {
          _user_id: string;
          requested_rows: number;
          page_number: number;
          start_date: string;
        };
        Returns: {
          week_start: string;
          subject: string;
        }[];
      };
      get_questionobj_bycategoryregion: {
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
          question_object: Json;
        }[];
      };
      get_questionobj_bypredictionregion: {
        Args: {
          categories: number[];
          difficulties: number[];
          region: string;
          _user_id: string;
        };
        Returns: {
          id: number;
          outer_category: number;
          difficulty: number;
          question_object: Json;
        }[];
      };
      get_student_attempting_questions: {
        Args: {
          user_id: string;
          region: string;
        };
        Returns: {
          id: number;
          outer_category: number;
          difficulty: number;
          question_object: Json;
        }[];
      };
      get_student_current_score: {
        Args: {
          user_id_param: string;
        };
        Returns: number[];
      };
      get_student_score_categories: {
        Args: {
          user_id_param: string;
        };
        Returns: Json;
      };
      get_totalcount_all_user_daily_reports: {
        Args: {
          _user_id: string;
          specific_date: string;
        };
        Returns: number;
      };
      get_totalcount_all_user_weekly_reports: {
        Args: {
          _user_id: string;
          start_date: string;
        };
        Returns: number;
      };
      get_user_by_email: {
        Args: {
          _user_email: string;
        };
        Returns: {
          user_id: string;
          user_email: string;
        }[];
      };
      get_user_daily_completed_questions: {
        Args: {
          _user_id: string;
          _date: string;
          _subject: string;
        };
        Returns: {
          id: number;
          user_id: string;
          question_id: number;
          subject: string;
          time_taken: number;
          accuracy: number;
          completed_at_hkt: string;
          outer_category: number;
          inner_category: number;
          difficulty: number;
        }[];
      };
      get_user_enabled_categories: {
        Args: {
          user_id_param: string;
        };
        Returns: Json;
      };
      get_user_score_data: {
        Args: {
          user_id_param: string;
        };
        Returns: Json;
      };
      get_user_weekly_completed_questions: {
        Args: {
          _user_id: string;
          _start_date: string;
          _subject: string;
        };
        Returns: {
          id: number;
          user_id: string;
          question_id: number;
          subject: string;
          time_taken: number;
          accuracy: number;
          completed_at_hkt: string;
          outer_category: number;
          inner_category: number;
          difficulty: number;
        }[];
      };
      insert_classroom_students: {
        Args: {
          _student_datas: Json;
        };
        Returns: string[];
      };
      insert_classroom_users: {
        Args: {
          _datas: Json;
        };
        Returns: string[];
      };
      insert_quiz_questions: {
        Args: {
          _user_id: string;
          quiz_questions: Json;
        };
        Returns: {
          id: number;
          quiz_id: number;
          question_id: number;
        }[];
      };
      process_complete_questions: {
        Args: {
          completed_qs: Json;
          new_score: number[];
          _user_id: string;
        };
        Returns: undefined;
      };
      process_completed_questions: {
        Args: {
          completed_qs: Json;
          new_score: number[];
          _user_id: string;
          education_level: Database["public"]["Enums"]["education_level"];
          year: Database["public"]["Enums"]["primary_years"];
        };
        Returns: undefined;
      };
      set_student_context: {
        Args: {
          _user_id: string;
          _education_level: Database["public"]["Enums"]["education_level"];
          _year: Database["public"]["Enums"]["primary_years"];
          _initial_scores: number[];
          _current_scores: number[];
          _enabled_categories: number[];
        };
        Returns: undefined;
      };
      set_user_enabled_categories: {
        Args: {
          user_id_param: string;
          new_enabled_categories: number[];
        };
        Returns: undefined;
      };
    };
    Enums: {
      education_level: "primary";
      primary_years: "1" | "2" | "3" | "4" | "5" | "6";
      subjects: "English" | "Maths";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;
