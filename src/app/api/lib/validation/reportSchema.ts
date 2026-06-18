import { paginationSchema } from "@/src/app/api/lib/validation/paginationSchema";
import { z } from "zod";

export const getReportSchema = z
  .object({
    year: z.union([z.string(), z.literal("")]).optional(),
    subject: z.union([z.string(), z.literal("")]).optional(),
    date: z.union([z.string(), z.literal("")]).optional(),
    dateAscending: z.string(),
  })
  .merge(paginationSchema);
