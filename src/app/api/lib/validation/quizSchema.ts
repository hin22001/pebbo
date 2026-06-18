import { z } from "zod";

export const getQuizSchema = z.object({
  classroom_id: z.union([z.string(), z.literal("")]).optional(),
  quiz_id: z.union([z.string(), z.literal("")]).optional(),
  quiz_name: z.union([z.string(), z.literal("")]).optional(),
  date_created_start: z.union([z.string(), z.literal("")]).optional(),
  date_created_end: z.union([z.string(), z.literal("")]).optional(),
  start_date_start: z.union([z.string(), z.literal("")]).optional(),
  start_date_end: z.union([z.string(), z.literal("")]).optional(),
  end_date_start: z.union([z.string(), z.literal("")]).optional(),
  end_date_end: z.union([z.string(), z.literal("")]).optional(),
  order: z.enum(["asc", "desc"]),
});
