import { z } from "zod";

export const jobKind = z.enum(["generate_itinerary", "regenerate_day", "sla_monitor"]);
export type JobKind = z.infer<typeof jobKind>;

export const jobStatus = z.enum(["queued", "running", "completed", "failed", "dead"]);
export type JobStatus = z.infer<typeof jobStatus>;

export const jobSchema = z.object({
  id: z.string().uuid(),
  kind: jobKind,
  payload: z.record(z.unknown()),
  status: jobStatus,
  attempts: z.number().int().nonnegative(),
  nextRunAt: z.string(),
  lastError: z.string().nullable(),
});
export type Job = z.infer<typeof jobSchema>;
