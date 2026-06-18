import { PageParams, PageRequest } from "@/src/app/api/lib/types/pagination";

export type GetAllDailyReportsRequestData = PageRequest & {
  year: string;
  subject: string;
  date: string;
  dateAscending: string;
};

export type GetDailyReportRequestData = {
  year: string;
  date: string;
  subject: string;
  region: string;
};

export type GetWeeklyReportRequestData = {
  year: string;
  start_date: string;
  subject: string;
  region: string;
};

export type GetAllDailyReportsRequestParams = PageParams & {
  year: boolean;
  subject: boolean;
  date: boolean;
  dateAscending: boolean;
};

export type GetDailyReportRequestParams = {
  year: boolean;
  date: boolean;
  subject: boolean;
};

export type GetWeeklyReportRequestParams = {
  year: boolean;
  start_date: boolean;
  subject: boolean;
};

export type AllDailyReport = {
  date: string;
  year: number;
  subject: string;
}[];

export type GetAllWeeklyReportsRequestData = PageRequest & {
  year: string;
  subject: string;
  start_date: string;
  dateAscending: string;
};

export type GetAllWeeklyReportsRequestParams = PageParams & {
  year: boolean;
  subject: boolean;
  start_date: boolean;
  dateAscending: boolean;
};

export type AllWeeklyReport = {
  week_start: string;
  year: number;
  subject: string;
}[];

export type ReportNumericData = {
  value: number;
  change: number;
};

export type Graph = {
  points: number[];
};

export type QuestionsCompleted = ReportNumericData;
export type TotalTime = ReportNumericData;
export type AverageAccuracy = ReportNumericData;
export type AverageTimePerQuestion = ReportNumericData;

export type LearningProgressOverview = {
  questions_completed: QuestionsCompleted;
  average_accuracy: AverageAccuracy;
  total_time: TotalTime;
  average_time_per_question: AverageTimePerQuestion;
};

export type Strengths = {
  significantly_improved_in: string[];
  steady_growth_in: string[];
};

export type Weaknesses = {
  most_mistakes_in: string[];
};

export type DailyReport = {
  learning_progress_overview: LearningProgressOverview;
  strengths: Strengths;
  weaknesses: Weaknesses;
};

export type GraphData = {
  knowledge_points: Graph;
  learning_time: Graph;
  performance: Graph;
};

export type WeeklyReport = {
  learning_progress_overview: LearningProgressOverview;
  strengths: Strengths;
  weaknesses: Weaknesses;
  graph_data: GraphData;
};
