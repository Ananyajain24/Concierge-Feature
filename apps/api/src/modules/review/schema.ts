import { z } from "zod";
import { daySchema, reasonCode } from "@lohono/shared-types";

export const editBody = z.object({
  reasonCode,
  note: z.string().optional(),
  days: z.array(daySchema),
});
export type EditBody = z.infer<typeof editBody>;

export const regenerateBody = z.object({
  note: z.string().min(1),
});
