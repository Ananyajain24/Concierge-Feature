import type { Poi } from "@lohono/shared-types";

export interface ScoringPrefs {
  vibes: string[];
  budget: string;
  kidFriendlyRequired: boolean;
  travelMonth: number;
}

const BUDGET_TO_BAND: Record<string, string[]> = {
  value: ["$", "$$"],
  moderate: ["$$", "$$$"],
  premium: ["$$$", "$$$$"],
  no_limit: ["$", "$$", "$$$", "$$$$"],
};

export function scorePoi(poi: Poi, prefs: ScoringPrefs): number {
  let score = poi.qualityScore;

  const vibeMatch = poi.vibeTags.filter((t) => prefs.vibes.includes(t)).length;
  score += vibeMatch * 0.15;

  const allowed = BUDGET_TO_BAND[prefs.budget] ?? [];
  if (allowed.length && !allowed.includes(poi.priceBand)) score -= 0.25;

  if (prefs.kidFriendlyRequired && !poi.kidFriendly) score -= 0.3;

  if (poi.seasonality?.avoid_months?.includes(prefs.travelMonth)) score -= 0.4;
  if (poi.seasonality?.best_months?.includes(prefs.travelMonth)) score += 0.1;

  return score;
}
