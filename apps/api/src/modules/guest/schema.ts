import { z } from "zod";

export const leadClickBody = z.object({
  itineraryId: z.string().uuid(),
  stopId: z.string(),
  poiId: z.string().uuid().optional(),
  url: z.string().url(),
});
export type LeadClickBody = z.infer<typeof leadClickBody>;
