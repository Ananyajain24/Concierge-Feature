import { z } from "zod";

export const reasonCode = z.enum([
  "WRONG_VIBE",
  "TOO_FAR",
  "CLOSED",
  "TOO_TOURISTY",
  "OVERPRICED",
  "NOT_KID_FRIENDLY",
  "BETTER_ALTERNATIVE",
  "COPY_TONE",
  "FACTUAL_ERROR",
  "DUPLICATE",
  "SEQUENCING",
  "GUEST_SWAP",
  "GUEST_ADD",
  "GUEST_REMOVE",
  "GUEST_REGEN_DAY",
]);
export type ReasonCode = z.infer<typeof reasonCode>;

export const editActor = z.enum(["reviewer", "guest", "system"]);
export type EditActor = z.infer<typeof editActor>;

export const itineraryEditSchema = z.object({
  id: z.string().uuid(),
  itineraryId: z.string().uuid(),
  actor: editActor,
  before: z.unknown(),
  after: z.unknown(),
  reasonCode,
  note: z.string().nullable(),
  createdAt: z.string(),
});
export type ItineraryEdit = z.infer<typeof itineraryEditSchema>;

export const warningCode = z.enum([
  "DRIVE_HEAVY",
  "CLOSED_TODAY",
  "SEASON_OFF",
  "KID_UNFRIENDLY",
  "CATEGORY_HEAVY",
  "TIMING_TIGHT",
  "REPEAT_VIBE",
]);
export type WarningCode = z.infer<typeof warningCode>;

export const WARNING_COPY: Record<z.infer<typeof warningCode>, string> = {
  DRIVE_HEAVY: "This day involves over 3 hours of driving.",
  CLOSED_TODAY: "This stop is closed on your visit day.",
  SEASON_OFF: "This spot is best avoided during monsoon.",
  KID_UNFRIENDLY: "This stop may not suit young children.",
  CATEGORY_HEAVY: "Three restaurants in one day — heavy dining.",
  TIMING_TIGHT: "Back-to-back stops leave little breathing room.",
  REPEAT_VIBE: "This day feels similar to another day.",
};
