import type { Poi, QuestionnaireAnswers } from "@lohono/shared-types";

export const V1_SELECT_VERSION = "v1-select-2026-09-15";

export interface SelectPromptInput {
  villaName: string;
  destinationName: string;
  checkIn: string;
  checkOut: string;
  answers: QuestionnaireAnswers;
  candidates: Poi[];
}

// The model must return ONLY JSON matching llmSelectionSchema.
// IDs must be chosen from the candidate set — never invented.
export function buildSelectPrompt(input: SelectPromptInput) {
  const days = daysBetween(input.checkIn, input.checkOut);
  const catalog = input.candidates.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    vibe_tags: p.vibeTags,
    price_band: p.priceBand,
    kid_friendly: p.kidFriendly,
    duration_min: p.avgDurationMin,
    bookable: p.bookable,
  }));

  const system = [
    "You are a luxury villa concierge for the Lohono brand.",
    "You select and sequence points of interest into a day-by-day itinerary.",
    "You NEVER invent places. Every `poiId` MUST come from the provided catalog.",
    "You return ONLY strict JSON — no prose, no markdown fences.",
  ].join(" ");

  const user = [
    `Villa: ${input.villaName}, ${input.destinationName}`,
    `Dates: ${input.checkIn} → ${input.checkOut} (${days} days)`,
    `Guest party: ${input.answers.partyComposition}`,
    `Kids ages: ${input.answers.kidAges.join(", ") || "none"}`,
    `Vibes: ${input.answers.vibes.join(", ")}`,
    `Pace: ${input.answers.pace}`,
    `Budget: ${input.answers.budget}`,
    `Interests: ${input.answers.interests.join(", ") || "—"}`,
    `Dietary: ${input.answers.dietary.join(", ") || "—"}`,
    `Mobility: ${input.answers.mobilityNotes || "—"}`,
    "",
    "Catalog (choose only from these IDs):",
    JSON.stringify(catalog, null, 2),
    "",
    "Return JSON with this exact shape:",
    JSON.stringify({
      days: [
        {
          dayIndex: 0,
          date: "YYYY-MM-DD",
          theme: "short evocative phrase",
          stops: [{ poiId: "uuid-from-catalog", slot: "morning", order: 0 }],
        },
      ],
    }),
    "Slots must be from: breakfast, morning, lunch, afternoon, sunset, dinner, night.",
    `Produce exactly ${days} days. 3–5 stops per day. Vary pace.`,
  ].join("\n");

  return { system, user, promptVersion: V1_SELECT_VERSION };
}

function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(1, Math.round(ms / (24 * 3600 * 1000)));
}
