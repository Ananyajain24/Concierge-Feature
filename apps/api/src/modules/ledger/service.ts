import { eq } from "drizzle-orm";
import type { LegKind, PublishedSnapshot } from "@lohono/shared-types";
import { db } from "../../db/client";
import { bookings, itineraries, villas } from "../../db/schema/index";
import { verifyBookingToken } from "../../lib/token";
import { ledgerRepo } from "./repository";

// CLAUDE.md's own "fixed rate card" language for airport transfer / cabs —
// this is the one place a flat number is legitimate rather than a stub: it's
// Lohono's own fleet, not a third-party price we'd otherwise have to fetch.
const TRANSFER_FLAT_INR = 3200;
const SCOOTER_PER_DAY_INR = 400;

async function loadItinerary(token: string, itineraryId: string) {
  const bookingId = verifyBookingToken(token);
  if (!bookingId) throw new Error("invalid token");
  const it = await db.select().from(itineraries).where(eq(itineraries.id, itineraryId)).limit(1).then((r) => r[0]);
  if (!it || it.bookingId !== bookingId) throw new Error("itinerary not found for this token");
  const booking = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1).then((r) => r[0]);
  if (!booking) throw new Error("booking not found");
  const villa = await db.select().from(villas).where(eq(villas.id, booking.villaId)).limit(1).then((r) => r[0]);
  if (!villa) throw new Error("villa not found");
  return { itinerary: it, booking, villa };
}

export const ledgerService = {
  summary: async (token: string, itineraryId: string) => {
    await loadItinerary(token, itineraryId); // validates token owns this itinerary
    const [bookingsRows, totalInr] = await Promise.all([
      ledgerRepo.forItinerary(itineraryId),
      ledgerRepo.totalInr(itineraryId),
    ]);
    return { bookings: bookingsRows, totalInr };
  },

  bookStop: async (token: string, itineraryId: string, stopId: string) => {
    const { itinerary } = await loadItinerary(token, itineraryId);
    const snap = itinerary.publishedSnapshot as PublishedSnapshot | null;
    if (!snap) throw new Error("itinerary is not published yet");
    const stop = snap.days.flatMap((d) => d.stops).find((s) => s.id === stopId);
    if (!stop) throw new Error("stop not found in the published itinerary");
    if (!stop.bookable) throw new Error("this stop can't be booked directly");

    const details: Record<string, string> = {};
    if (stop.address) details.address = stop.address;
    if (stop.phone) details.phone = stop.phone;

    return ledgerRepo.insert({
      itineraryId,
      stopId: stop.id,
      poiId: stop.poiId,
      category: stop.poiCategory,
      title: stop.poiName,
      priceInr: stop.priceInr,
      status: "confirmed",
      details,
    });
  },

  bookLeg: async (token: string, itineraryId: string, leg: LegKind) => {
    const { villa, booking } = await loadItinerary(token, itineraryId);

    if (leg === "transfer") {
      const provider = await ledgerRepo.leastBookedProvider(villa.destinationId, "driver");
      const details: Record<string, string> = provider
        ? {
            providerId: provider.id,
            driverName: provider.name,
            driverPhone: provider.phone,
            vehicle: provider.vehicle ?? "",
          }
        : { note: "A driver will be assigned and confirmed shortly." };
      return ledgerRepo.insert({
        itineraryId,
        stopId: null,
        poiId: null,
        category: "transfer",
        title: "Airport transfer",
        priceInr: TRANSFER_FLAT_INR,
        status: "confirmed",
        details,
      });
    }

    // Scooter: priced by actual trip length, not a guess.
    const days = Math.max(
      1,
      Math.round((new Date(String(booking.checkOut)).getTime() - new Date(String(booking.checkIn)).getTime()) / 86_400_000),
    );
    const provider = await ledgerRepo.leastBookedProvider(villa.destinationId, "scooter_rental");
    const details: Record<string, string> = provider
      ? { providerId: provider.id, contactName: provider.name, contactPhone: provider.phone, pickupNote: provider.notes ?? "" }
      : { note: "A rental contact will be confirmed shortly." };
    return ledgerRepo.insert({
      itineraryId,
      stopId: null,
      poiId: null,
      category: "scooter",
      title: `Scooter rental (${days} ${days === 1 ? "day" : "days"})`,
      priceInr: SCOOTER_PER_DAY_INR * days,
      status: "confirmed",
      details,
    });
  },
};
