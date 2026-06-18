import { PageParams, PageRequest } from "@/src/app/api/lib/types/pagination";
import { AnswerObject } from "@/src/app/api/lib/types/questionTypes";

export type QuizRemoveQuestions = {
  quiz_id: number;
  question_ids: number[];
};

export type CreateQuiz = QuizBase & {
  school_id: number;
};

export type QuizBase = {
  quiz_name: string;
  school_id: number;
  start_date: string;
  end_date: string;
};

export type QuizJunction = {
  quiz_id: number;
  question_id: number;
};

export type AddQuestionRequest = {
  quiz_questions: AddQuestion[];
};

export type AddQuestion = {
  quiz_id: number;
  question_id: number;
};

export type GetQuizRequest = PageRequest & {
  quiz_id: number;
  quiz_name: string;
  date_created_start: string;
  date_created_end: string;
  start_date_start: string;
  start_date_end: string;
  end_date_start: string;
  end_date_end: string;
};

export type GetQuizParams = PageParams & {
  quiz_id: boolean;
  quiz_name: boolean;
  date_created_start: boolean;
  date_created_end: boolean;
  start_date_start: boolean;
  start_date_end: boolean;
  end_date_start: boolean;
  end_date_end: boolean;
};
export type QuizSubmitAnswers = {
  classroom_id: number;
  quiz_id: number;
  all_answers: AnswerObject[];
};
