import { z } from "zod";

export const bboxSchema = z.object({
  minLat: z.number(),
  minLng: z.number(),
  maxLat: z.number(),
  maxLng: z.number(),
});
export type Bbox = z.infer<typeof bboxSchema>;

export const destinationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  timezone: z.string(),
  bbox: bboxSchema,
});
export type Destination = z.infer<typeof destinationSchema>;

export const destinationCreateSchema = destinationSchema.omit({ id: true });
export type DestinationCreate = z.infer<typeof destinationCreateSchema>;
