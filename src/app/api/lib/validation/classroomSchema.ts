import { z } from "zod";

export const userClassIDSchema = z.object({
  users: z.array(
    z.object({
      email: z.string(),
      classroom_id: z.number(),
    }),
  ),
});
