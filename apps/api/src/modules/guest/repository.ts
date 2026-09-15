import { desc, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { bookings, itineraries, bookingLeads } from "../../db/schema/index.js";

export const guestRepo = {
  publishedByToken: async (token: string) => {
    const booking = await db.select().from(bookings).where(eq(bookings.token, token)).limit(1).then((r) => r[0]);
    if (!booking) return null;
    const it = await db
      .select()
      .from(itineraries)
      .where(eq(itineraries.bookingId, booking.id))
      .orderBy(desc(itineraries.version))
      .limit(1)
      .then((r) => r[0]);
    if (!it || it.status !== "published" || !it.publishedSnapshot) return null;
    return { snapshot: it.publishedSnapshot, itineraryId: it.id, version: it.version };
  },
  logLead: (row: typeof bookingLeads.$inferInsert) =>
    db.insert(bookingLeads).values(row).returning().then((r) => r[0]!),
};
