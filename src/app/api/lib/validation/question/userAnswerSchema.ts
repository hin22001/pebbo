import { z } from "zod";

export const userAnswersSchema = z.object({
  question_id: z.number(),
  user_answers: z.array(
    z.object({
      answers: z.array(z.string()),
    }),
  ),
  time_taken: z.number(),
});
