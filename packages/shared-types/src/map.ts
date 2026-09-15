import { z } from "zod";

export const anchorSchema = z.object({
  id: z.string(),
  lat: z.number(),
  lng: z.number(),
  x: z.number(),
  y: z.number(),
  label: z.string().optional(),
});
export type MapAnchor = z.infer<typeof anchorSchema>;

export const mapTransformSchema = z.object({
  kind: z.literal("affine"),
  matrix: z.array(z.number()).length(6),
  anchors: z.array(anchorSchema),
  width: z.number().positive(),
  height: z.number().positive(),
});
export type MapTransform = z.infer<typeof mapTransformSchema>;

export const mapAssetSchema = z.object({
  id: z.string().uuid(),
  destinationId: z.string().uuid(),
  version: z.number().int().positive(),
  imageUrl: z.string(),
  transform: mapTransformSchema,
});
export type MapAsset = z.infer<typeof mapAssetSchema>;
