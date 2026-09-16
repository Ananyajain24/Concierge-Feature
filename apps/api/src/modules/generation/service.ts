import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { validateItinerary } from "@lohono/itinerary-engine";
import {
  llmNarrationSchema,
  llmSelectionSchema,
  type Day,
  type LlmSelection,
  type Poi,
  type Stop,
} from "@lohono/shared-types";
import { db } from "../../db/client";
import { bookings, villas, destinations, itineraries } from "../../db/schema/index";
import { preferencesRepo } from "../questionnaire/repository";
import { loadDriveMatrix, retrieveCandidates, secondsOnly, type DrivePair } from "./retriever";
import { buildSelectPrompt, V1_SELECT_VERSION } from "./prompts/v1-select";
import { buildNarratePrompt, V1_NARRATE_VERSION } from "./prompts/v1-narrate";
import { jsonCall } from "./llm";
import { repairSelection } from "./repair";

export async function generateItineraryForBooking(bookingId: string) {
  const booking = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1).then((r) => r[0]);
  if (!booking) throw new Error(`booking ${bookingId} not found`);
  const villa = await db.select().from(villas).where(eq(villas.id, booking.villaId)).limit(1).then((r) => r[0]);
  if (!villa) throw new Error("villa not found");
  const destination = await db
    .select()
    .from(destinations)
    .where(eq(destinations.id, villa.destinationId))
    .limit(1)
    .then((r) => r[0]);
  if (!destination) throw new Error("destination not found");
  const prefs = await preferencesRepo.get(bookingId);
  if (!prefs) throw new Error("guest preferences not found — questionnaire required first");

  const travelMonth = new Date(booking.checkIn).getUTCMonth() + 1;

  const candidates = await retrieveCandidates({
    destinationId: villa.destinationId,
    villaLat: villa.lat,
    villaLng: villa.lng,
    answers: prefs.answers,
    travelMonth,
  });
  if (candidates.length < 5) {
    throw new Error(`too few candidates (${candidates.length}) — expand catalog or relax filters`);
  }
  const poiById: Record<string, Poi> = Object.fromEntries(candidates.map((p) => [p.id, p as Poi]));
  const candidateIds = candidates.map((p) => p.id);

  // Pass 1 — selection
  const select = buildSelectPrompt({
    villaName: villa.name,
    destinationName: destination.name,
    checkIn: String(booking.checkIn),
    checkOut: String(booking.checkOut),
    answers: prefs.answers,
    candidates,
  });
  const s1 = await jsonCall<unknown>({ system: select.system, user: select.user, maxTokens: 3072 });
  const parsedSelect = llmSelectionSchema.safeParse(s1.data);
  if (!parsedSelect.success) throw new Error("selection JSON failed schema: " + parsedSelect.error.message);
  let selection: LlmSelection = parsedSelect.data;
  let totalLatencyMs = s1.latencyMs;
  let totalCost = s1.costUsd;

  // Validate
  const driveMatrix = await loadDriveMatrix(candidateIds, villa.id);
  const days1 = selectionToDays(selection, driveMatrix, villa.id);
  const violations = validateItinerary({
    destinationId: villa.destinationId,
    days: days1,
    poisById: poiById,
    driveSecondsByPair: secondsOnly(driveMatrix),
  });

  let repairAttempted = false;
  let flaggedForReview = false;
  if (violations.length > 0) {
    repairAttempted = true;
    const r = await repairSelection({ previous: selection, violations, candidateIds });
    if (!r) {
      flaggedForReview = true;
    } else {
      selection = r.data;
      totalLatencyMs += r.latencyMs;
      totalCost += r.costUsd;
      const days2 = selectionToDays(selection, driveMatrix, villa.id);
      const v2 = validateItinerary({
        destinationId: villa.destinationId,
        days: days2,
        poisById: poiById,
        driveSecondsByPair: secondsOnly(driveMatrix),
      });
      if (v2.length > 0) flaggedForReview = true;
    }
  }

  const days = selectionToDays(selection, driveMatrix, villa.id);

  // Pass 2 — narration
  const nar = buildNarratePrompt({
    villaName: villa.name,
    destinationName: destination.name,
    days: selection.days,
    poiById,
  });
  const s2 = await jsonCall<unknown>({ system: nar.system, user: nar.user, maxTokens: 3072 });
  const parsedNar = llmNarrationSchema.safeParse(s2.data);
  if (!parsedNar.success) throw new Error("narration JSON failed schema: " + parsedNar.error.message);
  totalLatencyMs += s2.latencyMs;
  totalCost += s2.costUsd;

  const narratedDays = mergeNarration(days, parsedNar.data);
  const summary = parsedNar.data.summary;

  const status = flaggedForReview ? "review" : "review"; // always go to review — reviewer publishes
  const slaDueAt = new Date(Date.now() + 24 * 3600 * 1000);

  const [row] = await db
    .insert(itineraries)
    .values({
      id: crypto.randomUUID(),
      bookingId,
      status,
      slaDueAt,
      promptVersion: `${V1_SELECT_VERSION}+${V1_NARRATE_VERSION}`,
      model: s1.model,
      costUsd: totalCost,
      latencyMs: totalLatencyMs,
      version: 1,
      days: narratedDays,
      summary,
    })
    .returning();

  return { itinerary: row, repairAttempted, flaggedForReview };
}

// Convert LLM selection to internal Day objects with drive times populated.
function selectionToDays(
  sel: LlmSelection,
  drive: Record<string, DrivePair>,
  villaId: string,
): Day[] {
  return sel.days.map((d) => {
    const sorted = [...d.stops].sort((a, b) => a.order - b.order);
    let prevId = villaId;
    const stops: Stop[] = sorted.map((s, i) => {
      const pair = drive[`${prevId}|${s.poiId}`];
      const stop: Stop = {
        id: crypto.randomUUID(),
        poiId: s.poiId,
        slot: s.slot,
        order: i,
        isPinned: false,
        copy: "",
        driveFromPreviousSec: pair?.sec ?? 0,
        driveFromPreviousMeters: pair?.meters ?? 0,
        warnings: [],
      };
      prevId = s.poiId;
      return stop;
    });
    return { dayIndex: d.dayIndex, date: d.date, theme: d.theme, stops };
  });
}

function mergeNarration(
  days: Day[],
  narration: { summary: string; days: { dayIndex: number; theme: string; stops: { poiId: string; copy: string }[] }[] },
): Day[] {
  const byDay = new Map(narration.days.map((d) => [d.dayIndex, d]));
  return days.map((d) => {
    const n = byDay.get(d.dayIndex);
    if (!n) return d;
    const copyByPoi = new Map(n.stops.map((s) => [s.poiId, s.copy]));
    return {
      ...d,
      theme: n.theme || d.theme,
      stops: d.stops.map((s) => ({ ...s, copy: copyByPoi.get(s.poiId) ?? s.copy })),
    };
  });
}
