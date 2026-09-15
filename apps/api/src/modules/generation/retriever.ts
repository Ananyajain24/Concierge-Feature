import { and, eq } from "drizzle-orm";
import type { Poi, QuestionnaireAnswers } from "@lohono/shared-types";
import { haversineMeters, scorePoi } from "@lohono/itinerary-engine";
import { db } from "../../db/client.js";
import { pois, poiDistances } from "../../db/schema/index.js";

export interface RetrieveInput {
  destinationId: string;
  villaLat: number;
  villaLng: number;
  answers: QuestionnaireAnswers;
  travelMonth: number;
  radiusMeters?: number;
  maxCandidates?: number;
  qualityFloor?: number;
}

// Candidate POI set: within radius of the villa, above a quality floor,
// scored against preferences. Returns a ranked list capped for the model.
export async function retrieveCandidates(input: RetrieveInput): Promise<Poi[]> {
  const radius = input.radiusMeters ?? 50_000;
  const cap = input.maxCandidates ?? 60;
  const floor = input.qualityFloor ?? 0.6;

  const rows = await db.select().from(pois).where(eq(pois.destinationId, input.destinationId));

  const kidsPresent = input.answers.kidAges.some((n) => n <= 10);
  const withScores = rows
    .map((p) => {
      const distance = haversineMeters({ lat: p.lat, lng: p.lng }, { lat: input.villaLat, lng: input.villaLng });
      const score = scorePoi(p as Poi, {
        vibes: input.answers.vibes,
        budget: input.answers.budget,
        kidFriendlyRequired: kidsPresent,
        travelMonth: input.travelMonth,
      });
      return { poi: p as Poi, distance, score };
    })
    .filter((r) => r.distance <= radius && r.poi.qualityScore >= floor)
    .sort((a, b) => b.score - a.score)
    .slice(0, cap);

  return withScores.map((r) => r.poi);
}

// Load precomputed drive pairs for the candidate set.
// Returns a `${from}|${to}` -> seconds map for validator + itinerary use.
export async function loadDriveMatrix(
  ids: string[],
  villaId: string,
): Promise<Record<string, number>> {
  const wanted = new Set([...ids, villaId]);
  const rows = await db.select().from(poiDistances);
  const out: Record<string, number> = {};
  for (const r of rows) {
    if (wanted.has(r.fromId) && wanted.has(r.toId)) {
      out[`${r.fromId}|${r.toId}`] = r.seconds;
    }
  }
  return out;
}
