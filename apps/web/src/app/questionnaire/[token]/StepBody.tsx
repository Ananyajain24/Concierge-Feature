"use client";

import type { BudgetBand, PaceLevel, QuestionnaireAnswers } from "@lohono/shared-types";
import { Chip } from "@/components/ui/Chip";
import { KID_RANGE_AGE, type StepDef } from "./questions";

// Every step below is a chip grid — no text input anywhere. The three steps
// whose underlying field isn't itself a plain string array (party, kids,
// mobility) each get a small translation on top of the same chip UI.
export function StepBody({
  step,
  answers,
  setAnswers,
}: {
  step: StepDef;
  answers: QuestionnaireAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<QuestionnaireAnswers>>;
}) {
  if (step.id === "party") {
    return (
      <div className="flex flex-wrap gap-2.5">
        {step.options.map((o) => (
          <Chip
            key={o.value}
            selected={answers.partyComposition === o.value}
            onClick={() => setAnswers((a) => ({ ...a, partyComposition: o.value }))}
          >
            {o.label}
          </Chip>
        ))}
      </div>
    );
  }

  if (step.id === "kids") {
    const selected = kidsSelection(answers.kidAges);
    return (
      <div className="flex flex-wrap gap-2.5">
        {step.options.map((o) => (
          <Chip
            key={o.value}
            selected={selected.has(o.value)}
            onClick={() =>
              setAnswers((a) => ({ ...a, kidAges: toggleKidRange(a.kidAges, o.value) }))
            }
          >
            {o.label}
          </Chip>
        ))}
      </div>
    );
  }

  if (step.id === "mobility") {
    const selected = mobilitySelection(answers.mobilityNotes, step);
    return (
      <div className="flex flex-wrap gap-2.5">
        {step.options.map((o) => (
          <Chip
            key={o.value}
            selected={selected.has(o.value)}
            onClick={() =>
              setAnswers((a) => ({
                ...a,
                mobilityNotes: toggleMobility(mobilitySelection(a.mobilityNotes, step), o.value, step),
              }))
            }
          >
            {o.label}
          </Chip>
        ))}
      </div>
    );
  }

  if (step.kind === "chips-multi") {
    const key = step.id as "vibes" | "interests" | "dietary";
    const current = answers[key] as string[];
    return (
      <div className="flex flex-wrap gap-2.5">
        {step.options.map((o) => (
          <Chip
            key={o.value}
            selected={current.includes(o.value)}
            onClick={() =>
              setAnswers((a) => ({
                ...a,
                [key]: current.includes(o.value)
                  ? current.filter((v) => v !== o.value)
                  : [...current, o.value],
              }) as QuestionnaireAnswers)
            }
          >
            {o.label}
          </Chip>
        ))}
      </div>
    );
  }

  // chips-single: pace, budget
  const key = step.id as "pace" | "budget";
  const current = answers[key] as string;
  return (
    <div className="flex flex-wrap gap-2.5">
      {step.options.map((o) => (
        <Chip
          key={o.value}
          selected={current === o.value}
          onClick={() => setAnswers((a) => ({ ...a, [key]: o.value as PaceLevel | BudgetBand }))}
        >
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

// ---- kids: chip <-> kidAges[] -------------------------------------------

function kidsSelection(kidAges: number[]): Set<string> {
  if (kidAges.length === 0) return new Set(["none"]);
  const set = new Set<string>();
  for (const [range, age] of Object.entries(KID_RANGE_AGE)) {
    if (kidAges.includes(age)) set.add(range);
  }
  return set;
}

function toggleKidRange(kidAges: number[], value: string): number[] {
  if (value === "none") return [];
  const age = KID_RANGE_AGE[value]!;
  return kidAges.includes(age) ? kidAges.filter((a) => a !== age) : [...kidAges, age];
}

// ---- mobility: chip <-> comma-joined label string ------------------------

function mobilitySelection(notes: string | undefined, step: StepDef): Set<string> {
  const labels = new Set((notes ?? "").split(", ").filter(Boolean));
  const selected = new Set<string>();
  for (const o of step.options) if (labels.has(o.label)) selected.add(o.value);
  if (selected.size === 0) selected.add("none");
  return selected;
}

function toggleMobility(current: Set<string>, value: string, step: StepDef): string {
  const next = new Set(current);
  if (value === "none") {
    next.clear();
    next.add("none");
  } else {
    next.delete("none");
    if (next.has(value)) next.delete(value);
    else next.add(value);
    if (next.size === 0) next.add("none");
  }
  if (next.has("none")) return "";
  const labelByValue = new Map(step.options.map((o) => [o.value, o.label]));
  return step.options
    .filter((o) => next.has(o.value))
    .map((o) => labelByValue.get(o.value)!)
    .join(", ");
}
