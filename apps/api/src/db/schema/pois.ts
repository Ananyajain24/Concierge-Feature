import { boolean, doublePrecision, integer, jsonb, pgTable, real, text, uuid } from "drizzle-orm/pg-core";
import type { OpeningHours, Seasonality } from "@lohono/shared-types";
import { destinations } from "./destinations.js";
import { idCol, timestamps } from "./_shared.js";

export const pois = pgTable("pois", {
  id: idCol,
  destinationId: uuid("destination_id").notNull().references(() => destinations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  vibeTags: text("vibe_tags").array().notNull().default([]),
  priceBand: text("price_band").notNull(),
  avgDurationMin: integer("avg_duration_min").notNull(),
  openingHours: jsonb("opening_hours").notNull().$type<OpeningHours>(),
  seasonality: jsonb("seasonality").notNull().$type<Seasonality>(),
  kidFriendly: boolean("kid_friendly").notNull().default(true),
  bookable: boolean("bookable").notNull().default(false),
  conciergeNote: text("concierge_note").notNull().default(""),
  qualityScore: real("quality_score").notNull().default(0.7),
  bookingUrl: text("booking_url"),
  photoUrl: text("photo_url"),
  ...timestamps,
});
