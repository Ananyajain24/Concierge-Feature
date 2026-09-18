import crypto from "node:crypto";
import type { ReasonCode, Stop, Day } from "@lohono/shared-types";
import { reviewRepo } from "../review/repository";
import { publishEditedDays } from "../review/publishEdit";
import { verifyBookingToken } from "../../lib/token";

async function applyAndPublish(itineraryId: string, nextDays: Day[], reasonCode: ReasonCode, note?: string) {
  return publishEditedDays(itineraryId, nextDays, "guest", reasonCode, note);
}

function requireTokenAccess(token: string, itineraryId: string) {
  const bookingId = verifyBookingToken(token);
  if (!bookingId) throw new Error("invalid token");
  return bookingId;
}

async function daysForItinerary(itineraryId: string): Promise<Day[]> {
  const it = await reviewRepo.get(itineraryId);
  return (it?.days as Day[]) ?? [];
}

export const editingService = {
  swap: async (token: string, itineraryId: string, dayIndex: number, stopId: string, newPoiId: string) => {
    requireTokenAccess(token, itineraryId);
    const days = await daysForItinerary(itineraryId);
    const next = days.map((d) =>
      d.dayIndex !== dayIndex
        ? d
        : { ...d, stops: d.stops.map((s) => (s.id === stopId ? { ...s, poiId: newPoiId } : s)) },
    );
    return applyAndPublish(itineraryId, next, "GUEST_SWAP");
  },

  remove: async (token: string, itineraryId: string, dayIndex: number, stopId: string) => {
    requireTokenAccess(token, itineraryId);
    const days = await daysForItinerary(itineraryId);
    const next = days.map((d) =>
      d.dayIndex !== dayIndex ? d : { ...d, stops: d.stops.filter((s) => s.id !== stopId) },
    );
    return applyAndPublish(itineraryId, next, "GUEST_REMOVE");
  },

  add: async (token: string, itineraryId: string, dayIndex: number, poiId: string, slot: Stop["slot"]) => {
    requireTokenAccess(token, itineraryId);
    const days = await daysForItinerary(itineraryId);
    const newStop: Stop = {
      id: crypto.randomUUID(),
      poiId,
      slot,
      order: 0,
      isPinned: false,
      copy: "",
      driveFromPreviousSec: 0,
      driveFromPreviousMeters: 0,
      warnings: [],
    };
    const next = days.map((d) =>
      d.dayIndex !== dayIndex ? d : { ...d, stops: [...d.stops, newStop] },
    );
    return applyAndPublish(itineraryId, next, "GUEST_ADD");
  },

  move: async (
    token: string,
    itineraryId: string,
    stopId: string,
    fromDay: number,
    toDay: number,
    toOrder: number,
    slot?: Stop["slot"],
  ) => {
    requireTokenAccess(token, itineraryId);
    const days = await daysForItinerary(itineraryId);
    const stop = days.flatMap((d) => d.stops).find((s) => s.id === stopId);
    if (!stop) throw new Error("stop not found");
    const removed = days.map((d) =>
      d.dayIndex !== fromDay ? d : { ...d, stops: d.stops.filter((s) => s.id !== stopId) },
    );
    const moved = { ...stop, slot: slot ?? stop.slot };
    const next = removed.map((d) => {
      if (d.dayIndex !== toDay) return d;
      const stops = [...d.stops];
      stops.splice(Math.min(toOrder, stops.length), 0, moved);
      return { ...d, stops };
    });
    return applyAndPublish(itineraryId, next, "GUEST_SWAP");
  },

  freeText: async (token: string, itineraryId: string, message: string) => {
    requireTokenAccess(token, itineraryId);
    // No human reviewer in front of the guest right now — flipping status to
    // "review" here used to hand this to a concierge, but with nothing left
    // to re-publish it, that would just hide the guest's own itinerary from
    // them indefinitely. Log the request and leave the published trip up.
    console.log(`[REQUEST] itinerary=${itineraryId}: ${message}`);
    await reviewRepo.writeEdit({
      itineraryId,
      actor: "guest",
      before: null,
      after: null,
      reasonCode: "COPY_TONE",
      note: `Guest free-text request: ${message}`,
    });
    return { logged: true };
  },
};
