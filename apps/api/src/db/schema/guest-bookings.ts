import { integer, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { itineraries } from "./itineraries";
import { pois } from "./pois";
import { idCol, timestamps } from "./_shared";

// The guest-facing booking ledger. Rule: no real partner APIs, no payment
// collection — "booking" here means Lohono has confirmed the arrangement
// (a table held, a driver assigned) the way a concierge actually would,
// recorded as a real row so the guest can see everything they've committed
// to and what it adds up to. Flights are never a row here — they redirect
// out to a real flight search, no price is ever confirmed by us for one.
export const guestBookings = pgTable("guest_bookings", {
  id: idCol,
  itineraryId: uuid("itinerary_id").notNull().references(() => itineraries.id, { onDelete: "cascade" }),
  // Null for a stop the guest later swapped or removed — the booking record
  // itself is never deleted, since it's a financial history, not itinerary state.
  stopId: text("stop_id"),
  poiId: uuid("poi_id").references(() => pois.id, { onDelete: "set null" }),
  category: text("category").notNull(), // poi category, or "transfer" | "scooter"
  title: text("title").notNull(),
  priceInr: integer("price_inr"),
  status: text("status").notNull().default("confirmed"),
  // Category-specific confirmation details, frozen at booking time:
  // { address, phone } for a venue, { driverName, driverPhone, vehicle } for
  // a transfer, { contactName, contactPhone, pickupNote } for a scooter.
  details: jsonb("details").$type<Record<string, string>>(),
  ...timestamps,
});
