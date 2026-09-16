import type { QuestionnaireAnswers } from "@lohono/shared-types";

// Every step is multiple-choice — chips, single or multi-select. No free
// text anywhere, so there is nothing for a guest to write that a concierge
// then has to interpret, and nothing the LLM prompt has to parse loosely.
export type StepId = "vibes" | "pace" | "party" | "kids" | "budget" | "interests" | "dietary" | "mobility";

export interface ChipOption {
  value: string;
  label: string;
}

export interface StepDef {
  id: StepId;
  title: string;
  sub: string;
  kind: "chips-multi" | "chips-single";
  options: ChipOption[];
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
  {
    id: "party",
    title: "Who's coming?",
    sub: "Pick the one that fits best.",
    kind: "chips-single",
    options: [
      { value: "Just the two of us", label: "Just the two of us" },
      { value: "A family with kids", label: "A family with kids" },
      { value: "A multi-generational family", label: "A multi-generational family" },
      { value: "A group of friends", label: "A group of friends" },
      { value: "Solo trip", label: "Solo trip" },
    ],
  },
  {
    id: "kids",
    title: "Ages of any children?",
    sub: "Pick all that apply — it changes how the days are paced.",
    kind: "chips-multi",
    options: [
      { value: "none", label: "No children" },
      { value: "under5", label: "Under 5" },
      { value: "5to10", label: "5 – 10" },
      { value: "11to17", label: "11 – 17" },
    ],
  },
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
    sub: "Pick as many as you like. Optional.",
    kind: "chips-multi",
    options: [
      { value: "foodie", label: "Great meals" },
      { value: "cultural", label: "Heritage & culture" },
      { value: "adventure", label: "Adventure & watersports" },
      { value: "wellness", label: "Spa & wellness" },
      { value: "shopping", label: "Markets & shopping" },
      { value: "nature", label: "Nature & wildlife" },
      { value: "party", label: "Nightlife" },
      { value: "photogenic", label: "Photo-worthy spots" },
    ],
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
  {
    id: "mobility",
    title: "Anything we should know?",
    sub: "Pick any that apply. Optional.",
    kind: "chips-multi",
    options: [
      { value: "none", label: "No concerns" },
      { value: "elderly", label: "Traveling with elderly guests" },
      { value: "wheelchair", label: "Wheelchair access needed" },
      { value: "infant", label: "Traveling with an infant" },
      { value: "minimal_walking", label: "Prefer minimal walking" },
    ],
  },
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

// Chip value -> representative age fed to QuestionnaireAnswers.kidAges,
// which downstream only ever checks against a "10 and under" threshold.
export const KID_RANGE_AGE: Record<string, number> = {
  under5: 3,
  "5to10": 8,
  "11to17": 14,
};
