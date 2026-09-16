import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { guestBookings, serviceProviders } from "../../db/schema/index";

export const ledgerRepo = {
  insert: (row: typeof guestBookings.$inferInsert) =>
    db.insert(guestBookings).values(row).returning().then((r) => r[0]!),

  forItinerary: (itineraryId: string) =>
    db
      .select()
      .from(guestBookings)
      .where(eq(guestBookings.itineraryId, itineraryId))
      .orderBy(desc(guestBookings.createdAt)),

  totalInr: async (itineraryId: string) => {
    const [row] = await db
      .select({ total: sql<string>`coalesce(sum(${guestBookings.priceInr}), 0)` })
      .from(guestBookings)
      .where(eq(guestBookings.itineraryId, itineraryId));
    return Number(row?.total ?? 0);
  },

  // One provider per role per destination, rotated by how many bookings
  // already reference them — a small real fleet, not a random pick, so load
  // spreads instead of the first driver in the table taking every trip.
  leastBookedProvider: async (destinationId: string, role: "driver" | "scooter_rental") => {
    const rows = await db
      .select({
        id: serviceProviders.id,
        name: serviceProviders.name,
        phone: serviceProviders.phone,
        vehicle: serviceProviders.vehicle,
        notes: serviceProviders.notes,
        assignments: sql<string>`count(${guestBookings.id})`,
      })
      .from(serviceProviders)
      .leftJoin(
        guestBookings,
        sql`${guestBookings.details}->>'providerId' = ${serviceProviders.id}::text`,
      )
      .where(and(eq(serviceProviders.destinationId, destinationId), eq(serviceProviders.role, role)))
      .groupBy(serviceProviders.id)
      .orderBy(sql`count(${guestBookings.id}) asc`);
    return rows[0] ?? null;
  },
};
