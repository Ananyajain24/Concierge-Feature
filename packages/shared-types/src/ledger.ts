import { z } from "zod";

// One confirmed in-app booking. See apps/api/src/db/schema/guest-bookings.ts
// for the "no real payment, no real partner API" rule this represents.
export const guestBookingSchema = z.object({
  id: z.string().uuid(),
  itineraryId: z.string().uuid(),
  stopId: z.string().nullable(),
  poiId: z.string().uuid().nullable(),
  category: z.string(),
  title: z.string(),
  priceInr: z.number().int().nonnegative().nullable(),
  status: z.string(),
  details: z.record(z.string(), z.string()).nullable(),
  createdAt: z.string(),
});
export type GuestBooking = z.infer<typeof guestBookingSchema>;

export const bookingsSummarySchema = z.object({
  bookings: z.array(guestBookingSchema),
  totalInr: z.number().int().nonnegative(),
});
export type BookingsSummary = z.infer<typeof bookingsSummarySchema>;

export const bookStopBody = z.object({ stopId: z.string().min(1) });
export type BookStopBody = z.infer<typeof bookStopBody>;

export const legKind = z.enum(["transfer", "scooter"]);
export type LegKind = z.infer<typeof legKind>;

export const bookLegBody = z.object({ leg: legKind });
export type BookLegBody = z.infer<typeof bookLegBody>;
