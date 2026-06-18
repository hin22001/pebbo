export type UserMetadata = StudentMetadata | TeacherMetadata | AdminMetadata;

type MetadataBase = {
  first_name: string;
  last_name: string;
  school_id: number | null;
  referred_by: string | null;
  stripe_customer_id: string | null;
};

export type StudentMetadata = MetadataBase & {
  role: "student";
  year?: string;
};

export type TeacherMetadata = MetadataBase & {
  role: "teacher";
  teaching_subject: string;
  is_subject_head: boolean;
};

export type AdminMetadata = MetadataBase & {
  role: "admin";
};

export type UserBasic = {
  user_id: string;
  email: string;
};
