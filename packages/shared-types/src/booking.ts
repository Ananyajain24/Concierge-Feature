import { z } from "zod";

export const bookingSchema = z.object({
  id: z.string().uuid(),
  villaId: z.string().uuid(),
  guestName: z.string().min(1),
  checkIn: z.string(),
  checkOut: z.string(),
  partySize: z.number().int().positive(),
  token: z.string().min(10),
});
export type Booking = z.infer<typeof bookingSchema>;

export const bookingCreateSchema = bookingSchema.omit({ id: true, token: true });
export type BookingCreate = z.infer<typeof bookingCreateSchema>;
