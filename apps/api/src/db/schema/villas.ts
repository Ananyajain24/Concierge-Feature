import { doublePrecision, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { destinations } from "./destinations.js";
import { idCol, timestamps } from "./_shared.js";

export const villas = pgTable("villas", {
  id: idCol,
  destinationId: uuid("destination_id").notNull().references(() => destinations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  description: text("description").notNull().default(""),
  heroImageUrl: text("hero_image_url"),
  ...timestamps,
});
