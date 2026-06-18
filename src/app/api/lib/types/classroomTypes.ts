import { PageParams, PageRequest } from "@/src/app/api/lib/types/pagination";

export type NewClassroom = {
  classroom_name: string;
};

export type ClassroomData = {
  classroom_id: number;
  school_id: number;
  classroom_name: string;
  archived: boolean;
};

export type RemoveUsersToClassroomRequest = {
  users: UserClassroomID;
};

export type InviteUsersToClassroomRequest = {
  users: UserClassroomID;
};

export type UserClassroomID = {
  email: string;
  classroom_id: number;
}[];

export type GetInvitationsRequest = PageRequest & {
  order: string;
};

export type GetInvitationsParams = PageParams & {
  order: boolean;
};

export type AcceptInvitation = {
  id: number;
  classroom_id: number;
};

export type ClassroomQuiz = {
  classroom_id: number;
  quiz_id: number;
  // Optional per-assignment metadata. Assignment-scoped (a quiz can be assigned
  // to several classrooms with different due dates), distinct from the
  // quiz-level quizzes.end_date.
  due_date?: string | null;
  target_score?: number | null;
};

export type CSVUploadResponse = {
  totalEmails: number;
  successfulInserts: number;
  failedInserts: string[];
  failedCount: number;
};

export type CSVUploadTemplate = {
  template: string;
  instructions: {
    format: string;
    requiredColumn: string;
    maxRows: number;
    maxFileSize: string;
    supportedFormats: string[];
    example: string[];
  };
};

export type ClassroomStudent = {
  classroom_id: number | null;
  classroom_name: string | null;
  archived: boolean | null;
  school_id: number | null;
  user_id: string | null;
  confirmed: boolean | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  stars: number | null;
};

export type BulkStudentOperation = {
  action: "add_all" | "remove_all";
  totalEmails: number;
  successfulInserts?: number;
  successfulRemovals?: number;
  failedInserts?: string[];
  failedRemovals?: string[];
  failedCount: number;
};
