import { jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { itineraries } from "./itineraries.js";
import { idCol, timestamps } from "./_shared.js";

export const itineraryEdits = pgTable("itinerary_edits", {
  id: idCol,
  itineraryId: uuid("itinerary_id").notNull().references(() => itineraries.id, { onDelete: "cascade" }),
  actor: text("actor").notNull(), // reviewer | guest | system
  before: jsonb("before"),
  after: jsonb("after"),
  reasonCode: text("reason_code").notNull(),
  note: text("note"),
  ...timestamps,
});
