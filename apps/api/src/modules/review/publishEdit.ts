import { eq } from "drizzle-orm";
import type { Day, Poi, ReasonCode } from "@lohono/shared-types";
import { WARNING_COPY } from "@lohono/shared-types";
import { computeWarnings, validateItinerary } from "@lohono/itinerary-engine";
import { db } from "../../db/client";
import { bookings, itineraries, villas } from "../../db/schema/index";
import { reviewRepo } from "./repository";
import { buildPublishedSnapshot } from "./snapshot";
import { loadDriveMatrix, secondsOnly, type DrivePair } from "../generation/retriever";
import { preferencesRepo } from "../questionnaire/repository";

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

function recomputeDrive(days: Day[], drive: Record<string, DrivePair>, villaId: string): Day[] {
  return days.map((d) => {
    let prevId = villaId;
    return {
      ...d,
      stops: d.stops.map((s, i) => {
        const key = `${prevId}|${s.poiId}`;
        const pair = drive[key];
        prevId = s.poiId;
        return {
          ...s,
          order: i,
          driveFromPreviousSec: pair?.sec ?? 0,
          driveFromPreviousMeters: pair?.meters ?? 0,
        };
      }),
    };
  });
}

// Shared by every edit path — a guest swapping a stop from their trip page,
// or an agent editing from the dashboard. Both recompute drive times and
// warnings from scratch and publish immediately: nobody editing an itinerary
// should ever leave it in a half-applied, unpublished state, since the guest
// page only ever renders the published snapshot.
export async function publishEditedDays(
  itineraryId: string,
  nextDays: Day[],
  actor: "guest" | "reviewer" | "system",
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
    driveSecondsByPair: secondsOnly(drive),
  });
  // Edits are never blocked — but structural violations shouldn't publish.
  if (violations.some((v) => v.kind === "unknown_poi" || v.kind === "wrong_destination")) {
    throw new Error("edit refers to invalid POI");
  }

  const travelMonth = new Date(String(ctx.booking.checkIn)).getUTCMonth() + 1;
  const prefs = await preferencesRepo.get(ctx.booking.id);
  const kidAges = prefs?.answers.kidAges ?? [];
  const { stopWarnings, dayWarnings } = computeWarnings({
    days: withDrive,
    poisById,
    driveSecondsByPair: secondsOnly(drive),
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
    actor,
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
