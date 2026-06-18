import { z } from "zod";

export const textFieldReactComponentSchema = z.object({
  type: z.literal("TextFieldReactComponent"),
  attrs: z.object({
    id: z.union([z.string(), z.number()]),
    unit: z.union([z.string(), z.number(), z.null()]),
    label: z.union([z.string(), z.number(), z.null()]),
    answer: z.string(),
    explanation: z.union([z.string(), z.number(), z.null()]),
    placeholder: z.union([z.string(), z.number(), z.null()]),
  }),
});

export const dropDownReactComponentSchema = z.object({
  type: z.literal("DropdownReactComponent"),
  attrs: z.object({
    id: z.union([z.string(), z.number()]),
    unit: z.union([z.string(), z.number(), z.null()]),
    label: z.union([z.string(), z.number(), z.null()]),
    answer: z.string(),
    options: z.string(),
    explanation: z.union([z.string(), z.number(), z.null()]),
    placeholder: z.union([z.string(), z.number(), z.null()]),
  }),
});

export const fractionReactComponentSchema = z.object({
  type: z.literal("FractionReactComponent"),
  attrs: z.object({
    id: z.union([z.string(), z.number()]),
    unit: z.union([z.string(), z.number(), z.null()]),
    label: z.union([z.string(), z.number(), z.null()]),
    answer: z.string(),
    explanation: z.union([z.string(), z.number(), z.null()]),
    placeholder: z.union([z.string(), z.number(), z.null()]),
  }),
});

export const svgReactComponentSchema = z.object({
  type: z.literal("SvgReactComponent"),
  attrs: z.object({
    id: z.union([z.string(), z.number()]),
    data: z.string(),
    size: z.union([z.string(), z.number(), z.null()]),
    customSize: z.union([z.string(), z.number(), z.null()]),
  }),
});

export const katexReactComponentSchema = z.object({
  type: z.literal("SvgReactComponent"),
  attrs: z.object({
    originalString: z.string(),
  }),
});
