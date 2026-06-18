export type CreateTeacher = {
  first_name: string;
  last_name: string;
  teaching_subject: string[];
  is_subject_head: boolean;
  email: string;
  password: string;
  referred_by: string | null;
};
