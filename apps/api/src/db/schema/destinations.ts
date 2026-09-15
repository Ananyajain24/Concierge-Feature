import { jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { idCol, timestamps } from "./_shared";

export const destinations = pgTable("destinations", {
  id: idCol,
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  timezone: text("timezone").notNull(),
  bbox: jsonb("bbox").notNull().$type<{
    minLat: number;
    minLng: number;
    maxLat: number;
    maxLng: number;
  }>(),
  ...timestamps,
});
