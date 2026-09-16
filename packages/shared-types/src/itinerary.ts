import { z } from "zod";

export const itineraryStatus = z.enum(["draft", "review", "published"]);
export type ItineraryStatus = z.infer<typeof itineraryStatus>;

export const slotKind = z.enum(["breakfast", "morning", "lunch", "afternoon", "sunset", "dinner", "night"]);
export type SlotKind = z.infer<typeof slotKind>;

export const stopSchema = z.object({
  id: z.string().uuid(),
  poiId: z.string().uuid(),
  slot: slotKind,
  order: z.number().int().nonnegative(),
  isPinned: z.boolean().default(false),
  copy: z.string().default(""),
  driveFromPreviousSec: z.number().int().nonnegative().default(0),
  driveFromPreviousMeters: z.number().int().nonnegative().default(0),
  warnings: z.array(z.string()).default([]),
});
export type Stop = z.infer<typeof stopSchema>;

export const daySchema = z.object({
  dayIndex: z.number().int().nonnegative(),
  date: z.string(),
  theme: z.string().default(""),
  stops: z.array(stopSchema),
});
export type Day = z.infer<typeof daySchema>;

export const itinerarySchema = z.object({
  id: z.string().uuid(),
  bookingId: z.string().uuid(),
  status: itineraryStatus,
  slaDueAt: z.string().nullable(),
  promptVersion: z.string().nullable(),
  model: z.string().nullable(),
  costUsd: z.number().nonnegative().default(0),
  version: z.number().int().positive().default(1),
  summary: z.string().default(""),
  days: z.array(daySchema),
});
export type Itinerary = z.infer<typeof itinerarySchema>;

// Published snapshot — a self-contained render payload for the guest view.
export const publishedStopSchema = stopSchema.extend({
  // Drive from the VILLA, not from the previous stop. The illustrated map is
  // radial — every line on it is measured from where the guest is staying —
  // so this is denormalised at publish time alongside everything else.
  driveFromVillaSec: z.number().int().nonnegative().default(0),
  driveFromVillaMeters: z.number().int().nonnegative().default(0),
  poiName: z.string(),
  poiCategory: z.string(),
  poiLat: z.number(),
  poiLng: z.number(),
  bookable: z.boolean(),
  bookingUrl: z.string().url().nullable(),
  photoUrl: z.string().url().nullable(),
  conciergeNote: z.string(),
  durationMin: z.number().int().nonnegative(),
  // Denormalised so the guest page can book and show a confirmation without
  // another round trip — same rule as everything else in the snapshot.
  address: z.string().nullable().default(null),
  phone: z.string().nullable().default(null),
  priceInr: z.number().int().nonnegative().nullable().default(null),
});
export type PublishedStop = z.infer<typeof publishedStopSchema>;

export const publishedDaySchema = z.object({
  dayIndex: z.number().int().nonnegative(),
  date: z.string(),
  theme: z.string(),
  stops: z.array(publishedStopSchema),
});
export type PublishedDay = z.infer<typeof publishedDaySchema>;

export const publishedSnapshotSchema = z.object({
  version: z.number().int().positive(),
  villa: z.object({
    id: z.string().uuid(),
    name: z.string(),
    lat: z.number(),
    lng: z.number(),
    heroImageUrl: z.string().url().nullable(),
  }),
  destinationId: z.string().uuid(),
  destinationName: z.string(),
  mapAsset: z.object({
    imageUrl: z.string(),
    transformJson: z.unknown(),
    width: z.number(),
    height: z.number(),
    version: z.number().int().positive(),
  }),
  dates: z.object({ checkIn: z.string(), checkOut: z.string() }),
  guestName: z.string(),
  summary: z.string(),
  days: z.array(publishedDaySchema),
  warnings: z.array(z.string()).default([]),
});
export type PublishedSnapshot = z.infer<typeof publishedSnapshotSchema>;

// LLM structured output — pass 1 (selection)
export const llmSelectionSchema = z.object({
  days: z.array(
    z.object({
      dayIndex: z.number().int().nonnegative(),
      date: z.string(),
      theme: z.string().default(""),
      stops: z.array(
        z.object({
          poiId: z.string().uuid(),
          slot: slotKind,
          order: z.number().int().nonnegative(),
        }),
      ),
    }),
  ),
});
export type LlmSelection = z.infer<typeof llmSelectionSchema>;

// LLM structured output — pass 2 (narration)
export const llmNarrationSchema = z.object({
  summary: z.string(),
  days: z.array(
    z.object({
      dayIndex: z.number().int().nonnegative(),
      theme: z.string(),
      stops: z.array(
        z.object({
          poiId: z.string().uuid(),
          copy: z.string(),
        }),
      ),
    }),
  ),
});
export type LlmNarration = z.infer<typeof llmNarrationSchema>;
