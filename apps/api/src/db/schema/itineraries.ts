import { integer, jsonb, pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { Day, PublishedSnapshot } from "@lohono/shared-types";
import { bookings } from "./bookings";
import { idCol, timestamps } from "./_shared";

export const itineraries = pgTable("itineraries", {
  id: idCol,
  bookingId: uuid("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("draft"), // draft | review | published
  slaDueAt: timestamp("sla_due_at", { withTimezone: true }),
  promptVersion: text("prompt_version"),
  model: text("model"),
  costUsd: real("cost_usd").notNull().default(0),
  latencyMs: integer("latency_ms").notNull().default(0),
  version: integer("version").notNull().default(1),
  days: jsonb("days").notNull().$type<Day[]>().default([]),
  summary: text("summary").notNull().default(""),
  publishedSnapshot: jsonb("published_snapshot").$type<PublishedSnapshot>(),
  ...timestamps,
});
