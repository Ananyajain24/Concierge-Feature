import type { Poi } from "@lohono/shared-types";

export const V1_NARRATE_VERSION = "v1-narrate-2026-09-15";

export interface NarratePromptInput {
  villaName: string;
  destinationName: string;
  days: {
    dayIndex: number;
    date: string;
    theme: string;
    stops: { poiId: string; slot: string; order: number }[];
  }[];
  poiById: Record<string, Poi>;
}

// Pass 2: writes short, warm, specific copy for each stop and the trip summary.
// Prose only — structure is now fixed, no ID rewiring allowed.
export function buildNarratePrompt(input: NarratePromptInput) {
  const daysWithNames = input.days.map((d) => ({
    dayIndex: d.dayIndex,
    date: d.date,
    theme: d.theme,
    stops: d.stops.map((s) => {
      const poi = input.poiById[s.poiId];
      return {
        poiId: s.poiId,
        name: poi?.name ?? "?",
        category: poi?.category ?? "?",
        concierge_note: poi?.conciergeNote ?? "",
        slot: s.slot,
        order: s.order,
      };
    }),
  }));

  const system = [
    "You write short, warm, specific concierge copy for luxury villa itineraries.",
    "Voice: quietly confident, one lovely detail per line, no superlatives stacking, no exclamation marks.",
    "Never say 'must-see' or 'hidden gem'. Never say 'nestled'. Never mention the concierge.",
    "Return ONLY JSON matching the schema below. No prose outside the JSON.",
  ].join(" ");

  const user = [
    `Villa: ${input.villaName}, ${input.destinationName}`,
    "",
    "Itinerary structure (do not change ids or ordering):",
    JSON.stringify(daysWithNames, null, 2),
    "",
    "For each stop, write 1–2 sentences (max ~40 words) that:",
    "- reference the given concierge_note without copying it verbatim",
    "- add one useful, specific detail (a dish, a time of day, a small tip)",
    "- fit the day's theme",
    "",
    "Return JSON exactly like:",
    JSON.stringify({
      summary: "One sentence trip summary (~25 words).",
      days: [
        {
          dayIndex: 0,
          theme: "revised or same theme",
          stops: [{ poiId: "uuid", copy: "the concierge copy" }],
        },
      ],
    }),
  ].join("\n");

  return { system, user, promptVersion: V1_NARRATE_VERSION };
}
