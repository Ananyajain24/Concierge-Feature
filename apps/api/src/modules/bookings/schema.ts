import { z } from "zod";

export const bookingCreateBody = z.object({
  villaId: z.string().uuid(),
  guestName: z.string().min(1),
  checkIn: z.string(),
  checkOut: z.string(),
  partySize: z.number().int().positive(),
});
export type BookingCreateBody = z.infer<typeof bookingCreateBody>;
