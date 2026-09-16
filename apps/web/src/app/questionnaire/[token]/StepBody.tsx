"use client";

import type { BudgetBand, PaceLevel, QuestionnaireAnswers } from "@lohono/shared-types";
import { Chip } from "@/components/ui/Chip";
import type { StepDef } from "./questions";

const FIELD =
  "w-full rounded-sm border border-linen bg-ivory px-3.5 py-3 text-[15px] outline-none focus:border-brass focus:ring-2 focus:ring-brass/30";

export function StepBody({
  step,
  answers,
  setAnswers,
}: {
  step: StepDef;
  answers: QuestionnaireAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<QuestionnaireAnswers>>;
}) {
  if (step.kind === "chips-multi" && step.options) {
    const key = step.id as "vibes" | "dietary";
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

  if (step.kind === "chips-single" && step.options) {
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

  if (step.kind === "kids") {
    return (
      <div>
        <input
          type="text"
          inputMode="numeric"
          value={answers.kidAges.join(", ")}
          onChange={(e) =>
            setAnswers((a) => ({
              ...a,
              kidAges: e.target.value
                .split(",")
                .map((s) => Number(s.trim()))
                .filter((n) => Number.isFinite(n)),
            }))
          }
          placeholder="e.g. 4, 8"
          className={FIELD}
        />
        <p className="mt-2 text-xs text-muted">Leave blank if none. It changes the pacing.</p>
      </div>
    );
  }

  if (step.kind === "text") {
    const isParty = step.id === "party";
    return (
      <input
        value={isParty ? answers.partyComposition : answers.interests.join(", ")}
        onChange={(e) =>
          setAnswers((a) => ({
            ...a,
            partyComposition: isParty ? e.target.value : a.partyComposition,
            interests: isParty
              ? a.interests
              : e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
          }))
        }
        className={FIELD}
      />
    );
  }

  if (step.kind === "textarea") {
    return (
      <textarea
        rows={4}
        value={answers.mobilityNotes ?? ""}
        onChange={(e) => setAnswers((a) => ({ ...a, mobilityNotes: e.target.value }))}
        className={FIELD}
      />
    );
  }

  return null;
}
