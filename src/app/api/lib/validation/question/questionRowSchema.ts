import { tiptapSchema } from "@/src/app/api/lib/validation/question/tiptapSchema";
import { z } from "zod";

export const questionRowSchema = z
  .object({
    id: z.number(),
    year: z.number(),
    outer_category: z.number(),
    inner_category: z.number(),
    subject: z.union([z.literal("Maths"), z.literal("TEST")]),
    concept: z.union([
      z.literal("number"),
      z.literal("measurement"),
      z.literal("shapes-and-space"),
      z.literal("TEST"),
    ]),
    question_type: z.union([
      z.literal("fill-in-the-blank"),
      z.literal("multiple-choice"),
      z.literal("reading-comprehension"),
      z.literal("matching-question"),
      z.literal("arithmetic-problem"),
      z.literal("TEST"),
    ]),
    difficulty: z.number(),
    need_image: z.boolean(),
    book_ref: z.string(),
    question_object_en: tiptapSchema.optional(),
    question_object_zh: tiptapSchema.optional(),
  })
  .strict();
