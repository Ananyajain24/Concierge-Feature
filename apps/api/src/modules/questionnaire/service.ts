import { eq } from "drizzle-orm";
import type { QuestionnaireAnswers } from "@lohono/shared-types";
import { preferencesRepo } from "./repository";
import { jobsService } from "../jobs/service";
import { db } from "../../db/client";
import { villas, destinations } from "../../db/schema/index";
import { catalogService } from "../catalog/service";

// Derive high-signal tags from raw answers so downstream retrieval has one
// consistent vocabulary to match against POIs.
export function deriveTags(a: QuestionnaireAnswers): string[] {
  const tags = new Set<string>(a.vibes);
  if (a.kidAges.some((n) => n <= 10)) tags.add("kids");
  if (a.pace === "slow") tags.add("slow");
  if (a.pace === "packed") tags.add("packed");
  if (a.budget === "premium" || a.budget === "no_limit") tags.add("luxury");
  if (a.dietary.includes("vegetarian")) tags.add("vegetarian");
  return [...tags];
}

export const questionnaireService = {
  // Villa, destination and whether that destination actually has a curated
  // catalog + map to generate from — read live, never a hardcoded location.
  context: async (villaId: string) => {
    const villa = await db.select().from(villas).where(eq(villas.id, villaId)).limit(1).then((r) => r[0] ?? null);
    if (!villa) return null;
    const destination = await db
      .select()
      .from(destinations)
      .where(eq(destinations.id, villa.destinationId))
      .limit(1)
      .then((r) => r[0] ?? null);
    if (!destination) return null;
    const readiness = await catalogService.destinations.readiness(destination.id);
    return { villa, destination, readiness };
  },

  // A note left before generation has even started (e.g. from the "add
  // something we missed" prompt while the guest is still waiting). Nothing to
  // attach it to yet — no itinerary_edits row exists until there is an
  // itinerary — so per CLAUDE.md's messaging rule this logs rather than sends.
  note: (bookingId: string, guestName: string, message: string) => {
    console.log(`[NOTE] booking=${bookingId} guest="${guestName}": ${message}`);
    return { ok: true as const };
  },

  submit: async (bookingId: string, answers: QuestionnaireAnswers) => {
    const derived = deriveTags(answers);
    await preferencesRepo.upsert({ bookingId, answers, derivedTags: derived });
    // Enqueue itinerary generation.
    const job = await jobsService.enqueue("generate_itinerary", { bookingId });
    return { derivedTags: derived, jobId: job.id };
  },
  get: preferencesRepo.get,
};
