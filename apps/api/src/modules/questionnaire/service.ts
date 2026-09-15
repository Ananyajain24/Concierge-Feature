import type { QuestionnaireAnswers } from "@lohono/shared-types";
import { preferencesRepo } from "./repository";
import { jobsService } from "../jobs/service";

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
  submit: async (bookingId: string, answers: QuestionnaireAnswers) => {
    const derived = deriveTags(answers);
    await preferencesRepo.upsert({ bookingId, answers, derivedTags: derived });
    // Enqueue itinerary generation.
    const job = await jobsService.enqueue("generate_itinerary", { bookingId });
    return { derivedTags: derived, jobId: job.id };
  },
  get: preferencesRepo.get,
};
