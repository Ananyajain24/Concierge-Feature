import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { itineraries } from "./itineraries";
import { idCol, timestamps } from "./_shared";

export const bookingLeads = pgTable("booking_leads", {
  id: idCol,
  itineraryId: uuid("itinerary_id").notNull().references(() => itineraries.id, { onDelete: "cascade" }),
  stopId: text("stop_id").notNull(),
  poiId: uuid("poi_id"),
  url: text("url").notNull(),
  clickedAt: timestamp("clicked_at", { withTimezone: true }).notNull().defaultNow(),
  ...timestamps,
});
