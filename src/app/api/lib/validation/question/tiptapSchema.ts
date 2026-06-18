import { z } from "zod";
import {
  textFieldReactComponentSchema,
  dropDownReactComponentSchema,
  fractionReactComponentSchema,
  svgReactComponentSchema,
  katexReactComponentSchema,
} from "@/src/app/api/lib/validation/question/customComponents";

const recursiveContentSchema = z.lazy(() =>
  z.union([
    paragraphSchema,
    textSchema,
    hardBreakSchema,
    textFieldReactComponentSchema,
    dropDownReactComponentSchema,
    fractionReactComponentSchema,
    svgReactComponentSchema,
    katexReactComponentSchema,
    segmentReactComponentSchema,
    headingSchema,
  ]),
);

const hardBreakSchema = z.object({
  type: z.literal("hardBreak"),
});

const marksSchema = z.array(
  z.object({
    type: z.enum(["italic", "bold"]), // Enumerate all possible mark types
  }),
);

const textSchema = z.object({
  text: z.string(),
  type: z.literal("text"),
  marks: marksSchema.optional(), // Make marks optional
});

const headingSchema = z.object({
  type: z.literal("heading"),
  attrs: z.object({
    level: z.union([z.string(), z.number(), z.null()]),
  }),
  content: z.array(recursiveContentSchema),
});

const paragraphSchema = z.lazy(() =>
  z.object({
    type: z.literal("paragraph"),
    content: z.array(recursiveContentSchema).optional(),
  }),
);

const segmentReactComponentSchema = z.object({
  type: z.literal("SegmentReactComponent"),
  content: z.array(recursiveContentSchema),
});

export const tiptapSchema = z
  .object({
    type: z.literal("doc"),
    content: z.array(recursiveContentSchema),
  })
  .strict();
