import type { Poi } from "@lohono/shared-types";
import { scorePoi, type ScoringPrefs } from "./scoring.js";

export interface AlternatesInput {
  targetPoi: Poi;
  candidates: Poi[];
  currentItineraryPoiIds: string[];
  driveSecondsFromContext: Record<string, number>;
  prefs: ScoringPrefs;
  maxResults?: number;
}

export interface AlternateResult {
  poi: Poi;
  score: number;
  driveDeltaSec: number;
}

export function rankAlternates(input: AlternatesInput): AlternateResult[] {
  const {
    targetPoi,
    candidates,
    currentItineraryPoiIds,
    driveSecondsFromContext,
    prefs,
    maxResults = 6,
  } = input;

  const inItinerary = new Set(currentItineraryPoiIds);
  const targetDrive = driveSecondsFromContext[targetPoi.id] ?? 0;

  const scored = candidates
    .filter(
      (p) =>
        p.id !== targetPoi.id &&
        p.category === targetPoi.category &&
        !inItinerary.has(p.id),
    )
    .map<AlternateResult>((p) => {
      const drive = driveSecondsFromContext[p.id] ?? 0;
      const baseScore = scorePoi(p, prefs);
      const drivePenalty = Math.abs(drive - targetDrive) / 3600;
      return {
        poi: p,
        score: baseScore - drivePenalty * 0.1,
        driveDeltaSec: drive - targetDrive,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return scored;
}
