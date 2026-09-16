"use client";

import { useState } from "react";
import type { Booking, QuestionnaireAnswers } from "@lohono/shared-types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { EMPTY_ANSWERS, STEPS, type StepDef } from "./questions";
import { StepBody } from "./StepBody";
import { CraftingState } from "./CraftingState";

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export function QuestionnaireFlow({ token, booking }: { token: string; booking: Booking }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(EMPTY_ANSWERS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const current = STEPS[step]!;
  const last = step === STEPS.length - 1;
  const canGoNext = validStep(current, answers);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api<{ jobId: string }>(`/questionnaire/${token}`, {
        method: "POST",
        body: JSON.stringify(answers),
      });
      setJobId(res.jobId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (jobId) return <CraftingState booking={booking} jobId={jobId} />;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-ivory">
      <div className="px-6 pt-7">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-linen disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3 L5 8 L10 13" />
            </svg>
          </button>
          <span className="font-display text-[17px] uppercase tracking-[0.22em]">Lohono</span>
          <span className="text-[13px] text-muted">
            {step + 1} / {STEPS.length}
          </span>
        </div>

        <div className="mt-6 flex gap-1.5" role="progressbar" aria-valuenow={step + 1} aria-valuemax={STEPS.length}>
          {STEPS.map((s, i) => (
            <span
              key={s.id}
              className={"h-[3px] grow rounded-full " + (i <= step ? "bg-brass-deep" : "bg-linen")}
            />
          ))}
        </div>
      </div>

      <section className="flex flex-1 flex-col px-6 pt-9">
        <p className="eyebrow">
          {booking.guestName} · {fmt(booking.checkIn)} – {fmt(booking.checkOut)}
        </p>
        <h1 className="mt-3 font-display text-[34px] leading-[1.12] tracking-tight">{current.title}</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-graphite">{current.sub}</p>

        <div className="mt-7">
          <StepBody step={current} answers={answers} setAnswers={setAnswers} />
        </div>

        <div className="mt-auto pb-5 pt-8">
          <div className="flex items-start gap-3 rounded-md bg-sand px-4 py-3.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="mt-0.5 shrink-0 text-brass-deep">
              <circle cx="8" cy="8" r="6.5" />
              <path d="M8 7.2 V11 M8 4.8 V4.9" />
            </svg>
            <span className="text-[13px] leading-snug text-graphite">
              A concierge reads and fixes your plan before you see it — usually within a day.
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t border-linen px-6 pb-7 pt-4">
        {error && <p className="mb-3 text-[13px] text-terracotta">{error}</p>}
        <div className="flex gap-3">
          {!last && (
            <Button variant="secondary" size="lg" onClick={() => setStep((s) => s + 1)}>
              Skip
            </Button>
          )}
          <Button
            size="lg"
            className="grow"
            disabled={!canGoNext || submitting}
            onClick={last ? submit : () => setStep((s) => s + 1)}
          >
            {submitting ? "Sending…" : last ? "Send to my concierge" : "Continue"}
            {!submitting && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8 H13 M9 4 L13 8 L9 12" />
              </svg>
            )}
          </Button>
        </div>
        <p className="mt-3 text-center text-xs text-muted">Takes about 90 seconds · saved as you go</p>
      </footer>
    </main>
  );
}

function validStep(step: StepDef, a: QuestionnaireAnswers): boolean {
  switch (step.id) {
    case "vibes":
      return a.vibes.length >= 1;
    case "pace":
      return Boolean(a.pace);
    case "party":
      return a.partyComposition.length > 0;
    case "budget":
      return Boolean(a.budget);
    default:
      return true;
  }
}
