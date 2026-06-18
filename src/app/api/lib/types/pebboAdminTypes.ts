export type CreateAdmin = {
  admin_key: string;
  first_name: string;
  last_name: string;
  school_id: number;
  email: string;
  password: string;
  referred_by: string | null;
};

export type CreateSchool = {
  admin_key: string;
  school_name: string;
  teacher_licenses: number;
  admin_licenses: number;
  payment_notes?: string;
};
