import { and, asc, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { itineraries, itineraryEdits, bookings, villas, pois } from "../../db/schema/index.js";

export const reviewRepo = {
  queue: () =>
    db
      .select({
        id: itineraries.id,
        status: itineraries.status,
        slaDueAt: itineraries.slaDueAt,
        promptVersion: itineraries.promptVersion,
        version: itineraries.version,
        costUsd: itineraries.costUsd,
        latencyMs: itineraries.latencyMs,
        createdAt: itineraries.createdAt,
        bookingId: itineraries.bookingId,
        guestName: bookings.guestName,
        checkIn: bookings.checkIn,
        checkOut: bookings.checkOut,
        villaId: bookings.villaId,
        villaName: villas.name,
      })
      .from(itineraries)
      .innerJoin(bookings, eq(itineraries.bookingId, bookings.id))
      .innerJoin(villas, eq(bookings.villaId, villas.id))
      .where(eq(itineraries.status, "review"))
      .orderBy(asc(itineraries.slaDueAt)),

  get: (id: string) =>
    db.select().from(itineraries).where(eq(itineraries.id, id)).limit(1).then((r) => r[0] ?? null),

  updateDays: (id: string, days: unknown, status: "review" | "draft" = "review") =>
    db
      .update(itineraries)
      .set({ days: days as never, status })
      .where(eq(itineraries.id, id))
      .returning()
      .then((r) => r[0] ?? null),

  publish: (id: string, publishedSnapshot: unknown, version: number) =>
    db
      .update(itineraries)
      .set({ status: "published", publishedSnapshot: publishedSnapshot as never, version })
      .where(eq(itineraries.id, id))
      .returning()
      .then((r) => r[0] ?? null),

  writeEdit: (row: typeof itineraryEdits.$inferInsert) =>
    db.insert(itineraryEdits).values(row).returning().then((r) => r[0]!),

  listEdits: (id: string) =>
    db.select().from(itineraryEdits).where(eq(itineraryEdits.itineraryId, id)),

  poisForItinerary: async (itineraryId: string) => {
    const it = await db.select().from(itineraries).where(eq(itineraries.id, itineraryId)).limit(1);
    if (!it[0]) return [];
    const booking = await db.select().from(bookings).where(eq(bookings.id, it[0].bookingId)).limit(1);
    if (!booking[0]) return [];
    const villa = await db.select().from(villas).where(eq(villas.id, booking[0].villaId)).limit(1);
    if (!villa[0]) return [];
    return db.select().from(pois).where(eq(pois.destinationId, villa[0].destinationId));
  },
};
