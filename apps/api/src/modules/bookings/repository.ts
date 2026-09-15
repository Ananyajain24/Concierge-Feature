import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { bookings } from "../../db/schema/index.js";

export const bookingRepo = {
  list: () => db.select().from(bookings),
  get: (id: string) => db.select().from(bookings).where(eq(bookings.id, id)).limit(1).then((r) => r[0] ?? null),
  byToken: (token: string) => db.select().from(bookings).where(eq(bookings.token, token)).limit(1).then((r) => r[0] ?? null),
  create: (data: typeof bookings.$inferInsert) => db.insert(bookings).values(data).returning().then((r) => r[0]!),
};
