"use client";

import { useMemo, useState } from "react";
import type { Booking, QuestionnaireAnswers, PaceLevel, BudgetBand } from "@lohono/shared-types";
import { api } from "@/lib/api";
import { EMPTY_ANSWERS, STEPS, type StepDef } from "./questions";

export function QuestionnaireFlow({
  token,
  booking,
}: {
  token: string;
  booking: Booking;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(EMPTY_ANSWERS);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const current = STEPS[step]!;
  const progress = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);

  const canGoNext = validStep(current, answers);

  async function submit() {
    setSubmitting(true);
    try {
      const res = await api<{ jobId: string; derivedTags: string[] }>(`/questionnaire/${token}`, {
        method: "POST",
        body: JSON.stringify(answers),
      });
      setDone(res.jobId);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display text-3xl">We&apos;re on it.</h1>
        <p className="mt-4 text-ink/70">
          Your itinerary is being drafted and will be reviewed by our concierge before it reaches you. Expect it within 24 hours.
        </p>
        <p className="mt-6 text-xs text-ink/40">Job ID: {done}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col p-6">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-ink/50">
          {booking.guestName} · {booking.checkIn} → {booking.checkOut}
        </p>
        <div className="mt-3 h-1 w-full overflow-hidden rounded bg-ink/10">
          <div
            className="h-full bg-ink transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-ink/50">
          Question {step + 1} of {STEPS.length}
        </p>
      </header>

      <section className="flex-1">
        <h2 className="font-display text-2xl">{current.title}</h2>
        <p className="mt-2 text-sm text-ink/60">{current.sub}</p>
        <div className="mt-6">
          <Step step={current} answers={answers} setAnswers={setAnswers} />
        </div>
      </section>

      <footer className="mt-8 flex items-center gap-3">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-full border px-4 py-2 text-sm disabled:opacity-30"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canGoNext}
            className="ml-auto rounded-full bg-ink px-6 py-2 text-sm text-sand disabled:opacity-40"
          >
            Next
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!canGoNext || submitting}
            className="ml-auto rounded-full bg-ink px-6 py-2 text-sm text-sand disabled:opacity-40"
          >
            {submitting ? "Sending…" : "Send"}
          </button>
        )}
      </footer>
    </main>
  );
}

function validStep(step: StepDef, a: QuestionnaireAnswers): boolean {
  switch (step.id) {
    case "vibes": return a.vibes.length >= 1;
    case "pace": return Boolean(a.pace);
    case "party": return a.partyComposition.length > 0;
    case "budget": return Boolean(a.budget);
    default: return true;
  }
}

function Step({
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
      <div className="flex flex-wrap gap-2">
        {step.options.map((o) => {
          const active = current.includes(o.value);
          return (
            <button
              key={o.value}
              onClick={() =>
                setAnswers((a) => ({
                  ...a,
                  [key]: active ? current.filter((v) => v !== o.value) : [...current, o.value],
                } as QuestionnaireAnswers))
              }
              className={
                "rounded-full border px-4 py-2 text-sm transition " +
                (active ? "border-ink bg-ink text-sand" : "border-ink/20 text-ink hover:bg-ink/5")
              }
            >
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (step.kind === "chips-single" && step.options) {
    const key = step.id as "pace" | "budget";
    const current = answers[key] as string;
    return (
      <div className="flex flex-wrap gap-2">
        {step.options.map((o) => {
          const active = current === o.value;
          return (
            <button
              key={o.value}
              onClick={() =>
                setAnswers((a) => ({
                  ...a,
                  [key]: o.value as PaceLevel | BudgetBand,
                }))
              }
              className={
                "rounded-full border px-4 py-2 text-sm transition " +
                (active ? "border-ink bg-ink text-sand" : "border-ink/20 text-ink hover:bg-ink/5")
              }
            >
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (step.kind === "kids") {
    return (
      <div>
        <input
          type="text"
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
          className="w-full rounded border border-ink/20 bg-white px-4 py-3 text-base"
        />
        <p className="mt-2 text-xs text-ink/50">Leave blank if none.</p>
      </div>
    );
  }

  if (step.kind === "text") {
    return (
      <input
        value={
          step.id === "party"
            ? answers.partyComposition
            : answers.interests.join(", ")
        }
        onChange={(e) =>
          setAnswers((a) => ({
            ...a,
            partyComposition: step.id === "party" ? e.target.value : a.partyComposition,
            interests:
              step.id === "interests"
                ? e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                : a.interests,
          }))
        }
        className="w-full rounded border border-ink/20 bg-white px-4 py-3 text-base"
      />
    );
  }

  if (step.kind === "textarea") {
    return (
      <textarea
        rows={4}
        value={answers.mobilityNotes ?? ""}
        onChange={(e) => setAnswers((a) => ({ ...a, mobilityNotes: e.target.value }))}
        className="w-full rounded border border-ink/20 bg-white px-4 py-3 text-base"
      />
    );
  }

  return null;
}
