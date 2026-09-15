import { z } from "zod";

export const villaSchema = z.object({
  id: z.string().uuid(),
  destinationId: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  bedrooms: z.number().int().positive(),
  description: z.string(),
  heroImageUrl: z.string().url().nullable().optional(),
});
export type Villa = z.infer<typeof villaSchema>;

export const villaCreateSchema = villaSchema.omit({ id: true });
export type VillaCreate = z.infer<typeof villaCreateSchema>;
