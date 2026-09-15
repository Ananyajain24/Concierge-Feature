import { integer, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import type { MapTransform } from "@lohono/shared-types";
import { destinations } from "./destinations";
import { idCol, timestamps } from "./_shared";

export const mapAssets = pgTable("map_assets", {
  id: idCol,
  destinationId: uuid("destination_id").notNull().references(() => destinations.id, { onDelete: "cascade" }),
  version: integer("version").notNull().default(1),
  imageUrl: text("image_url").notNull(),
  transform: jsonb("transform").notNull().$type<MapTransform>(),
  ...timestamps,
});
