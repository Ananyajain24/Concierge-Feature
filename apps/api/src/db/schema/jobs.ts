import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { idCol, timestamps } from "./_shared.js";

export const jobs = pgTable("jobs", {
  id: idCol,
  kind: text("kind").notNull(),
  payload: jsonb("payload").notNull().$type<Record<string, unknown>>(),
  status: text("status").notNull().default("queued"), // queued | running | completed | failed | dead
  attempts: integer("attempts").notNull().default(0),
  nextRunAt: timestamp("next_run_at", { withTimezone: true }).notNull().defaultNow(),
  lastError: text("last_error"),
  ...timestamps,
});
