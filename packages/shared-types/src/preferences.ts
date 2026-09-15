import { z } from "zod";

export const tripVibe = z.enum([
  "relax",
  "adventure",
  "romantic",
  "party",
  "cultural",
  "foodie",
  "family",
  "wellness",
]);
export type TripVibe = z.infer<typeof tripVibe>;

export const paceLevel = z.enum(["slow", "balanced", "packed"]);
export type PaceLevel = z.infer<typeof paceLevel>;

export const budgetBand = z.enum(["value", "moderate", "premium", "no_limit"]);
export type BudgetBand = z.infer<typeof budgetBand>;

export const questionnaireAnswersSchema = z.object({
  vibes: z.array(tripVibe).min(1),
  pace: paceLevel,
  partyComposition: z.string(),
  kidAges: z.array(z.number().int().min(0).max(17)).default([]),
  budget: budgetBand,
  interests: z.array(z.string()).default([]),
  dietary: z.array(z.string()).default([]),
  mobilityNotes: z.string().optional().default(""),
});
export type QuestionnaireAnswers = z.infer<typeof questionnaireAnswersSchema>;

export const guestPreferencesSchema = z.object({
  bookingId: z.string().uuid(),
  answers: questionnaireAnswersSchema,
  derivedTags: z.array(z.string()),
});
export type GuestPreferences = z.infer<typeof guestPreferencesSchema>;
