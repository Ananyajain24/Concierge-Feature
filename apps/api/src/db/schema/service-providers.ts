import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { destinations } from "./destinations";
import { idCol, timestamps } from "./_shared";

// Lohono's own fleet / local operators — who actually gets assigned to a
// guest's airport transfer or scooter rental once they book it in-app.
// "role" keeps this one table instead of a driver table and a rental-contact
// table; add roles here as new leg types need them.
export const serviceProviders = pgTable("service_providers", {
  id: idCol,
  destinationId: uuid("destination_id").notNull().references(() => destinations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "driver" | "scooter_rental"
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  vehicle: text("vehicle"),
  notes: text("notes"),
  ...timestamps,
});
