import { Json } from "@/src/app/api/lib/types/supabaseTypes";

export type Questions = Question[];

export type Question = {
  id: number;
  outer_category: number;
  difficulty: number;
  question_object: Json;
  accuracy?: number;
  image_approved?: boolean;
};

export type CompletedUserQuizQuestion = {
  accuracy: number;
  id?: number | undefined;
  question_id: number;
  quiz_id: number;
  student_id: string;
  time_taken: number;
  user_answers: UserAnswers[];
};

export type UserQuizQuestion = {
  quiz_id: number;
  question_id: number;
  category: string;
  subject: string;
  question_object: TipTapNode;
  user_answers: UserAnswers[] | null;
  time_taken: number | null;
  accuracy: number | null;
};

export type NodeAttrs = {
  answer?: string;
  answers?: string;
  explanation?: string;
  multiple?: boolean;
  isCorrect?: boolean;
  accuracy?: number;
  value?: string | string[] | null;
  image_approved?: boolean;
};

export type TipTapNode = {
  content?: TipTapNode[];
  type?: string;
  attrs?: NodeAttrs;
};

export type UserAnswers = {
  answers: string[];
};

export type AnswerObject = {
  question_id: number;
  user_answers: UserAnswers[];
  time_taken: number;
};

export type UserCompleteQuestions = {
  all_answers: AnswerObject[];
};

export type UserSubmittedQuiz = {
  classroom_id: number;
  quiz_id: number;
  all_answers: AnswerObject[];
};

export type DBCompletedQuestion = {
  user_id: string;
  question_id: number;
  outer_category: number;
  difficulty: number;
  accuracy: number;
  time_taken: number;
};

export type ReportCompletedQuestion = {
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
