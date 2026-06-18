import { z } from "zod";

export const paginationSchema = z.object({
  page_number: z.string(),
  rows_per_page: z.string(),
});
