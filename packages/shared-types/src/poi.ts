import { z } from "zod";

export const poiCategory = z.enum([
  "beach",
  "restaurant",
  "bar",
  "heritage",
  "market",
  "spa",
  "watersport",
  "cafe",
  "sunset_point",
  "day_trip",
]);
export type PoiCategory = z.infer<typeof poiCategory>;

export const priceBand = z.enum(["$", "$$", "$$$", "$$$$"]);
export type PriceBand = z.infer<typeof priceBand>;

export const openingHoursSchema = z.record(
  z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
  z.object({
    open: z.string().nullable(),
    close: z.string().nullable(),
    closed: z.boolean().default(false),
  }),
);
export type OpeningHours = z.infer<typeof openingHoursSchema>;

export const seasonalitySchema = z.object({
  best_months: z.array(z.number().int().min(1).max(12)),
  avoid_months: z.array(z.number().int().min(1).max(12)),
  note: z.string().optional(),
});
export type Seasonality = z.infer<typeof seasonalitySchema>;

export const poiSchema = z.object({
  id: z.string().uuid(),
  destinationId: z.string().uuid(),
  name: z.string().min(1),
  category: poiCategory,
  lat: z.number(),
  lng: z.number(),
  vibeTags: z.array(z.string()),
  priceBand,
  avgDurationMin: z.number().int().positive(),
  openingHours: openingHoursSchema,
  seasonality: seasonalitySchema,
  kidFriendly: z.boolean(),
  bookable: z.boolean(),
  conciergeNote: z.string(),
  qualityScore: z.number().min(0).max(1),
  bookingUrl: z.string().url().nullable().optional(),
  photoUrl: z.string().url().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  priceInr: z.number().int().nonnegative().nullable().optional(),
});
export type Poi = z.infer<typeof poiSchema>;

export const poiCreateSchema = poiSchema.omit({ id: true });
export type PoiCreate = z.infer<typeof poiCreateSchema>;
