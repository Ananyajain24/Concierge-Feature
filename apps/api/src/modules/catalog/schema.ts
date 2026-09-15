import { z } from "zod";
import {
  destinationSchema,
  destinationCreateSchema,
  poiSchema,
  poiCreateSchema,
  villaSchema,
  villaCreateSchema,
} from "@lohono/shared-types";

export const destinationCreateBody = destinationCreateSchema;
export const villaCreateBody = villaCreateSchema;
export const poiCreateBody = poiCreateSchema;

export const destinationUpdateBody = destinationSchema.partial();
export const villaUpdateBody = villaSchema.partial();
export const poiUpdateBody = poiSchema.partial();

export const listPoisQuery = z.object({
  destinationId: z.string().uuid().optional(),
  category: z.string().optional(),
  bookable: z.enum(["true", "false"]).optional(),
  q: z.string().optional(),
});
export type ListPoisQuery = z.infer<typeof listPoisQuery>;
