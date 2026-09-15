import type { QuestionnaireAnswers } from "@lohono/shared-types";

export type StepId =
  | "vibes" | "pace" | "party" | "kids" | "budget" | "interests" | "dietary" | "mobility";

export interface StepDef {
  id: StepId;
  title: string;
  sub: string;
  kind: "chips-multi" | "chips-single" | "text" | "kids" | "textarea";
  options?: { value: string; label: string; hint?: string }[];
}

export const STEPS: StepDef[] = [
  {
    id: "vibes",
    title: "What kind of trip is this?",
    sub: "Pick two or three that ring true.",
    kind: "chips-multi",
    options: [
      { value: "relax", label: "Slow and quiet" },
      { value: "adventure", label: "Adventure" },
      { value: "romantic", label: "Romantic" },
      { value: "party", label: "Party" },
      { value: "cultural", label: "Culture-first" },
      { value: "foodie", label: "Foodie" },
      { value: "family", label: "Family time" },
      { value: "wellness", label: "Wellness" },
    ],
  },
  {
    id: "pace",
    title: "Pace",
    sub: "How full do you want the days?",
    kind: "chips-single",
    options: [
      { value: "slow", label: "Slow — one or two things a day" },
      { value: "balanced", label: "Balanced" },
      { value: "packed", label: "Pack it in" },
    ],
  },
  { id: "party", title: "Who's coming?", sub: "One sentence is enough.", kind: "text" },
  { id: "kids", title: "Kids", sub: "Ages of any children in the party.", kind: "kids" },
  {
    id: "budget",
    title: "Budget",
    sub: "For meals and experiences.",
    kind: "chips-single",
    options: [
      { value: "value", label: "Value" },
      { value: "moderate", label: "Moderate" },
      { value: "premium", label: "Premium" },
      { value: "no_limit", label: "No limit" },
    ],
  },
  {
    id: "interests",
    title: "Anything you especially want to do?",
    sub: "Comma-separated. Optional.",
    kind: "text",
  },
  {
    id: "dietary",
    title: "Dietary needs",
    sub: "Select any that apply.",
    kind: "chips-multi",
    options: [
      { value: "vegetarian", label: "Vegetarian" },
      { value: "vegan", label: "Vegan" },
      { value: "gluten_free", label: "Gluten-free" },
      { value: "halal", label: "Halal" },
      { value: "no_seafood", label: "No seafood" },
    ],
  },
  { id: "mobility", title: "Anything we should know?", sub: "Mobility, health, or preferences.", kind: "textarea" },
];

export const EMPTY_ANSWERS: QuestionnaireAnswers = {
  vibes: [],
  pace: "balanced",
  partyComposition: "",
  kidAges: [],
  budget: "moderate",
  interests: [],
  dietary: [],
  mobilityNotes: "",
};
