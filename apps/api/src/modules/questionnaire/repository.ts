import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { guestPreferences } from "../../db/schema/index.js";

export const preferencesRepo = {
  get: (bookingId: string) =>
    db.select().from(guestPreferences).where(eq(guestPreferences.bookingId, bookingId)).limit(1).then((r) => r[0] ?? null),
  upsert: async (row: typeof guestPreferences.$inferInsert) => {
    const existing = await db
      .select()
      .from(guestPreferences)
      .where(eq(guestPreferences.bookingId, row.bookingId));
    if (existing[0]) {
      await db.update(guestPreferences).set(row).where(eq(guestPreferences.bookingId, row.bookingId));
    } else {
      await db.insert(guestPreferences).values(row);
    }
    return row;
  },
};
