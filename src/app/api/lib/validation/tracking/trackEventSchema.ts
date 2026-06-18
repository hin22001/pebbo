import { z } from "zod";

const trackEventItemSchema = z.object({
  event_id: z.string().uuid().optional(),
  event_type: z.string().min(1).max(100),
  path: z.string().max(500).optional(),
  question_id: z.number().int().positive().optional(),
  event_ts: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const trackBatchSchema = z.object({
  session_id: z.string().min(1).max(200),
  events: z.array(trackEventItemSchema).min(1).max(50),
});

export type TrackBatchInput = z.infer<typeof trackBatchSchema>;
export type TrackEventItem = z.infer<typeof trackEventItemSchema>;
