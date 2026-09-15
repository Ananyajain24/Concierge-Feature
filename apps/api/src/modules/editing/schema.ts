import { z } from "zod";
import { slotKind } from "@lohono/shared-types";

export const swapBody = z.object({
  dayIndex: z.number().int().nonnegative(),
  stopId: z.string(),
  newPoiId: z.string().uuid(),
});

export const moveBody = z.object({
  stopId: z.string(),
  fromDayIndex: z.number().int().nonnegative(),
  toDayIndex: z.number().int().nonnegative(),
  toOrder: z.number().int().nonnegative(),
  slot: slotKind.optional(),
});

export const removeBody = z.object({
  dayIndex: z.number().int().nonnegative(),
  stopId: z.string(),
});

export const addBody = z.object({
  dayIndex: z.number().int().nonnegative(),
  poiId: z.string().uuid(),
  slot: slotKind,
});

export const regenerateDayBody = z.object({
  dayIndex: z.number().int().nonnegative(),
});

export const freeTextBody = z.object({
  message: z.string().min(1),
});
