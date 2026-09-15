import { jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import type { QuestionnaireAnswers } from "@lohono/shared-types";
import { bookings } from "./bookings";
import { timestamps } from "./_shared";

export const guestPreferences = pgTable("guest_preferences", {
  bookingId: uuid("booking_id").primaryKey().references(() => bookings.id, { onDelete: "cascade" }),
  answers: jsonb("answers").notNull().$type<QuestionnaireAnswers>(),
  derivedTags: text("derived_tags").array().notNull().default([]),
  ...timestamps,
});
