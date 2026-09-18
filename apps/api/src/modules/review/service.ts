import type { Day, Poi, ReasonCode } from "@lohono/shared-types";
import { rankAlternates } from "@lohono/itinerary-engine";
import { eq } from "drizzle-orm";
import { reviewRepo } from "./repository";
import { buildPublishedSnapshot } from "./snapshot";
import { publishEditedDays } from "./publishEdit";
import { loadDriveMatrix, secondsOnly } from "../generation/retriever";
import { db } from "../../db/client";
import { bookings, villas } from "../../db/schema/index";
import { loadEnv } from "../../config/env";

export const reviewService = {
  queue: reviewRepo.queue,
  get: reviewRepo.get,

  detail: async (id: string) => {
    const it = await reviewRepo.get(id);
    if (!it) return null;
    const booking = await db.select().from(bookings).where(eq(bookings.id, it.bookingId)).limit(1).then((r) => r[0]!);
    const villa = await db.select().from(villas).where(eq(villas.id, booking.villaId)).limit(1).then((r) => r[0]!);
    const pois = await reviewRepo.poisForItinerary(id);
    return { itinerary: it, booking, villa, pois };
  },

  edit: async (params: {
    itineraryId: string;
    actor: "reviewer" | "guest" | "system";
    reasonCode: string;
    note?: string;
    days: Day[];
  }) => {
    // Same recompute-and-publish path a guest's own swap/remove uses — an
    // agent's edit from the dashboard must never leave the itinerary sitting
    // unpublished, since the guest page only ever renders the published
    // snapshot and would otherwise go blank mid-edit.
    await publishEditedDays(
      params.itineraryId,
      params.days,
      params.actor,
      params.reasonCode as ReasonCode,
      params.note,
    );
    return reviewRepo.get(params.itineraryId);
  },

  publish: async (id: string) => {
    const it = await reviewRepo.get(id);
    if (!it) throw new Error("itinerary not found");
    const version = (it.version ?? 1);
    const snap = await buildPublishedSnapshot(id, version, it.summary);
    const published = await reviewRepo.publish(id, snap, version);

    // "We'll message you the link" (the crafting screen's own promise) — no
    // real WhatsApp/email sending in MVP, so this is the send, logged.
    const booking = await db.select().from(bookings).where(eq(bookings.id, it.bookingId)).limit(1).then((r) => r[0]);
    if (booking) {
      const { WEB_ORIGIN } = loadEnv();
      console.log(`[GUEST NOTIFY] ${booking.guestName} <- ${WEB_ORIGIN}/trip/${booking.token}`);
    }
    return published;
  },

  regenerate: async (id: string, note: string) => {
    // For MVP we simply flag and reset — the worker/generator picks it back up
    // when re-enqueued (out of scope for a purely manual reviewer action here).
    await reviewRepo.writeEdit({
      itineraryId: id,
      actor: "reviewer",
      before: null,
      after: null,
      reasonCode: "COPY_TONE",
      note: `Regeneration requested: ${note}`,
    });
    return { queued: true };
  },

  alternatesForStop: async (itineraryId: string, dayIndex: number, stopIndex: number) => {
    const detail = await reviewService.detail(itineraryId);
    if (!detail) return [];
    const days = (detail.itinerary.days ?? []) as Day[];
    const day = days[dayIndex];
    const stop = day?.stops[stopIndex];
    if (!day || !stop) return [];
    const target = detail.pois.find((p) => p.id === stop.poiId);
    if (!target) return [];
    const currentIds = days.flatMap((d) => d.stops.map((s) => s.poiId));
    const drive = secondsOnly(await loadDriveMatrix(detail.pois.map((p) => p.id), detail.villa.id));

    const driveFromPrev: Record<string, number> = {};
    const prevId = stopIndex === 0 ? detail.villa.id : day.stops[stopIndex - 1]!.poiId;
    for (const p of detail.pois) driveFromPrev[p.id] = drive[`${prevId}|${p.id}`] ?? 0;

    return rankAlternates({
      targetPoi: target as Poi,
      candidates: detail.pois as Poi[],
      currentItineraryPoiIds: currentIds,
      driveSecondsFromContext: driveFromPrev,
      prefs: {
        vibes: [],
        budget: "moderate",
        kidFriendlyRequired: false,
        travelMonth: new Date(String(detail.booking.checkIn)).getUTCMonth() + 1,
      },
    });
  },
};
