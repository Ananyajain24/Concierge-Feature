import { integer, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./_shared.js";

// A distance row applies to any pair — either poi<->poi or villa<->poi.
// We store IDs as raw UUIDs (no FK) so pairs can point at either table;
// `from_kind` and `to_kind` tell you which.
export const poiDistances = pgTable(
  "poi_distances",
  {
    fromId: uuid("from_id").notNull(),
    fromKind: text("from_kind").notNull(), // "poi" | "villa"
    toId: uuid("to_id").notNull(),
    toKind: text("to_kind").notNull(),
    meters: integer("meters").notNull(),
    seconds: integer("seconds").notNull(),
    ...timestamps,
  },
  (t) => ({
    pk: primaryKey({ columns: [t.fromId, t.toId] }),
  }),
);
