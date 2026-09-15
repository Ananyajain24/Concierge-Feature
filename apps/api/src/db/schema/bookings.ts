import { date, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { villas } from "./villas.js";
import { idCol, timestamps } from "./_shared.js";

export const bookings = pgTable("bookings", {
  id: idCol,
  villaId: uuid("villa_id").notNull().references(() => villas.id, { onDelete: "cascade" }),
  guestName: text("guest_name").notNull(),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  partySize: integer("party_size").notNull(),
  token: text("token").notNull().unique(),
  ...timestamps,
});
