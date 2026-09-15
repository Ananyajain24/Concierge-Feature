import { and, eq, ilike, or } from "drizzle-orm";
import { db } from "../../db/client.js";
import { destinations, pois, villas } from "../../db/schema/index.js";
import type { ListPoisQuery } from "./schema.js";

// ---- destinations ----

export const destinationRepo = {
  list: () => db.select().from(destinations),
  get: (id: string) => db.select().from(destinations).where(eq(destinations.id, id)).limit(1).then((r) => r[0] ?? null),
  bySlug: (slug: string) => db.select().from(destinations).where(eq(destinations.slug, slug)).limit(1).then((r) => r[0] ?? null),
  create: (data: typeof destinations.$inferInsert) => db.insert(destinations).values(data).returning().then((r) => r[0]!),
  update: (id: string, data: Partial<typeof destinations.$inferInsert>) =>
    db.update(destinations).set(data).where(eq(destinations.id, id)).returning().then((r) => r[0] ?? null),
  remove: (id: string) => db.delete(destinations).where(eq(destinations.id, id)).returning({ id: destinations.id }),
};

// ---- villas ----

export const villaRepo = {
  list: (destinationId?: string) =>
    destinationId
      ? db.select().from(villas).where(eq(villas.destinationId, destinationId))
      : db.select().from(villas),
  get: (id: string) => db.select().from(villas).where(eq(villas.id, id)).limit(1).then((r) => r[0] ?? null),
  create: (data: typeof villas.$inferInsert) => db.insert(villas).values(data).returning().then((r) => r[0]!),
  update: (id: string, data: Partial<typeof villas.$inferInsert>) =>
    db.update(villas).set(data).where(eq(villas.id, id)).returning().then((r) => r[0] ?? null),
  remove: (id: string) => db.delete(villas).where(eq(villas.id, id)).returning({ id: villas.id }),
};

// ---- pois ----

export const poiRepo = {
  list: async (q: ListPoisQuery) => {
    const conds = [];
    if (q.destinationId) conds.push(eq(pois.destinationId, q.destinationId));
    if (q.category) conds.push(eq(pois.category, q.category));
    if (q.bookable) conds.push(eq(pois.bookable, q.bookable === "true"));
    if (q.q) conds.push(or(ilike(pois.name, `%${q.q}%`), ilike(pois.conciergeNote, `%${q.q}%`))!);
    return conds.length ? db.select().from(pois).where(and(...conds)) : db.select().from(pois);
  },
  get: (id: string) => db.select().from(pois).where(eq(pois.id, id)).limit(1).then((r) => r[0] ?? null),
  byDestination: (destinationId: string) => db.select().from(pois).where(eq(pois.destinationId, destinationId)),
  create: (data: typeof pois.$inferInsert) => db.insert(pois).values(data).returning().then((r) => r[0]!),
  update: (id: string, data: Partial<typeof pois.$inferInsert>) =>
    db.update(pois).set(data).where(eq(pois.id, id)).returning().then((r) => r[0] ?? null),
  remove: (id: string) => db.delete(pois).where(eq(pois.id, id)).returning({ id: pois.id }),
};
