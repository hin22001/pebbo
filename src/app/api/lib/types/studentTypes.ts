export type StudentContext = {
  education_level: string;
  year: string;
};

export type SetStudentContext = StudentContext & {
  enabled_categories: number[];
};
