import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import type { Day, Poi, ReasonCode, Stop } from "@lohono/shared-types";
import { WARNING_COPY, computeWarnings, validateItinerary } from "@lohono/itinerary-engine";
import { db } from "../../db/client.js";
import { bookings, itineraries, villas } from "../../db/schema/index.js";
import { reviewRepo } from "../review/repository.js";
import { buildPublishedSnapshot } from "../review/snapshot.js";
import { loadDriveMatrix } from "../generation/retriever.js";
import { verifyBookingToken } from "../../lib/token.js";

async function loadContext(itineraryId: string) {
  const it = await reviewRepo.get(itineraryId);
  if (!it) return null;
  const booking = await db.select().from(bookings).where(eq(bookings.id, it.bookingId)).limit(1).then((r) => r[0]);
  if (!booking) return null;
  const villa = await db.select().from(villas).where(eq(villas.id, booking.villaId)).limit(1).then((r) => r[0]);
  if (!villa) return null;
  const pois = await reviewRepo.poisForItinerary(itineraryId);
  return { it, booking, villa, pois: pois as Poi[] };
}

function recomputeDrive(days: Day[], drive: Record<string, number>, villaId: string): Day[] {
  return days.map((d) => {
    let prevId = villaId;
    return {
      ...d,
      stops: d.stops.map((s, i) => {
        const key = `${prevId}|${s.poiId}`;
        prevId = s.poiId;
        return { ...s, order: i, driveFromPreviousSec: drive[key] ?? 0 };
      }),
    };
  });
}

async function applyAndPublish(
  itineraryId: string,
  nextDays: Day[],
  reasonCode: ReasonCode,
  note?: string,
): Promise<{ warnings: string[]; version: number }> {
  const ctx = await loadContext(itineraryId);
  if (!ctx) throw new Error("itinerary not found");
  const drive = await loadDriveMatrix(ctx.pois.map((p) => p.id), ctx.villa.id);
  const withDrive = recomputeDrive(nextDays, drive, ctx.villa.id);

  const poisById = Object.fromEntries(ctx.pois.map((p) => [p.id, p]));
  const violations = validateItinerary({
    destinationId: ctx.villa.destinationId,
    days: withDrive,
    poisById,
    driveSecondsByPair: drive,
  });
  // Guest edits are never blocked — but structural violations shouldn't publish.
  if (violations.some((v) => v.kind === "unknown_poi" || v.kind === "wrong_destination")) {
    throw new Error("edit refers to invalid POI");
  }

  const travelMonth = new Date(String(ctx.booking.checkIn)).getUTCMonth() + 1;
  const kidAges = ((ctx.it.days as unknown) as unknown[]).length ? [] : []; // preferences not fetched here
  const { stopWarnings, dayWarnings } = computeWarnings({
    days: withDrive,
    poisById,
    driveSecondsByPair: drive,
    travelMonth,
    hasYoungKids: kidAges.some((n) => (n as number) <= 10),
  });
  const attachedWarnings = withDrive.map((d) => ({
    ...d,
    stops: d.stops.map((s) => ({
      ...s,
      warnings: stopWarnings
        .filter((w) => w.dayIndex === d.dayIndex && w.poiId === s.poiId)
        .map((w) => WARNING_COPY[w.code]),
    })),
  }));

  const before = ctx.it.days;
  const version = (ctx.it.version ?? 1) + 1;
  await db
    .update(itineraries)
    .set({ days: attachedWarnings as never, version, status: "published" })
    .where(eq(itineraries.id, itineraryId));
  const snap = await buildPublishedSnapshot(itineraryId, version, ctx.it.summary);
  const withDayWarnings = {
    ...snap,
    warnings: dayWarnings.map((w) => WARNING_COPY[w.code]),
  };
  await db
    .update(itineraries)
    .set({ publishedSnapshot: withDayWarnings as never })
    .where(eq(itineraries.id, itineraryId));

  await reviewRepo.writeEdit({
    itineraryId,
    actor: "guest",
    before: before as never,
    after: attachedWarnings as never,
    reasonCode,
    note: note ?? null,
  });

  const flat = [
    ...dayWarnings.map((w) => WARNING_COPY[w.code]),
    ...stopWarnings.map((w) => WARNING_COPY[w.code]),
  ];
  return { warnings: [...new Set(flat)], version };
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
    await db
      .update(itineraries)
      .set({ status: "review" })
      .where(eq(itineraries.id, itineraryId));
    await reviewRepo.writeEdit({
      itineraryId,
      actor: "guest",
      before: null,
      after: null,
      reasonCode: "COPY_TONE",
      note: `Guest free-text request: ${message}`,
    });
    return { queuedForReview: true };
  },
};
