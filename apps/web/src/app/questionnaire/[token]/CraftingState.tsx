"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Booking, Job } from "@lohono/shared-types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

const POLL_MS = 2500;

// What the guest sees between submitting and their itinerary existing. With
// human review switched off, this screen's whole job is to actually notice
// the moment generation finishes and take the guest there — previously
// nothing here ever checked the job at all.
export function CraftingState({
  token,
  booking,
  destinationName,
  jobId,
}: {
  token: string;
  booking: Booking;
  destinationName: string;
  jobId: string;
}) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const j = await api<Job>(`/jobs/${jobId}`);
        if (cancelled) return;
        setJob(j);
        if (j.status === "completed") {
          setReady(true);
          // Give the "your plan and map arrive" step a beat to actually be
          // seen before the redirect, rather than jumping instantly.
          setTimeout(() => {
            if (!cancelled) router.push(`/trip/${token}`);
          }, 900);
          return;
        }
        if (j.status === "dead") {
          setFailed(j.lastError ?? "Something went wrong building your plan.");
          return;
        }
        timer = setTimeout(poll, POLL_MS);
      } catch {
        if (!cancelled) timer = setTimeout(poll, POLL_MS);
      }
    }
    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [jobId, token, router]);

  const stages = [
    { title: "Your answers, in", sub: "We have what we need to start", done: true },
    { title: `Matched against our ${destinationName} list`, sub: "Only places our team has been to", done: true },
    {
      title: ready ? "Your plan is ready" : "Building your day-by-day plan",
      sub: ready ? "Taking you there now…" : "Usually well under a minute",
      done: ready,
      live: !ready && !failed,
    },
    { title: "Your plan and map arrive", sub: "Right here, no waiting on a link", done: ready },
  ];

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  async function sendNote() {
    if (!message.trim()) return;
    setSending(true);
    setNoteError(null);
    try {
      await api(`/questionnaire/${token}/note`, {
        method: "POST",
        body: JSON.stringify({ message: message.trim() }),
      });
      setSent(true);
      setOpen(false);
    } catch (e) {
      setNoteError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-ivory px-6 pb-8 pt-7">
      <p className="text-center font-display text-[17px] uppercase tracking-[0.22em]">Lohono</p>

      <div className="mt-7">
        <p className="eyebrow">{booking.guestName}</p>
        <h1 className="mt-3 font-display text-[32px] leading-[1.14] tracking-tight">
          {failed ? "We hit a snag" : "Putting your days together"}
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-graphite">
          {failed ? (
            "The draft couldn't be finished. Send us a note below and we'll sort it out."
          ) : (
            <>
              This usually takes under a minute — <strong className="font-medium">no waiting on a reviewer</strong>,
              you&apos;ll land straight on your plan.
            </>
          )}
        </p>
        {failed && <p className="mt-2 rounded-sm bg-brass-wash px-3 py-2 text-[12.5px] text-terracotta">{failed}</p>}
      </div>

      <ol className="mt-8">
        {stages.map((s, i) => (
          <li key={s.title} className="flex items-start gap-3.5">
            <div className="flex shrink-0 flex-col items-center">
              <span
                className={
                  "flex h-[22px] w-[22px] items-center justify-center rounded-full " +
                  (s.done
                    ? "bg-sage"
                    : s.live
                      ? "border-2 border-brass bg-brass-wash"
                      : "border-[1.5px] border-linen")
                }
              >
                {s.done && (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ivory">
                    <path d="M3.5 8.5 L6.5 11.5 L12.5 5" />
                  </svg>
                )}
                {s.live && (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brass" />
                )}
              </span>
              {i < stages.length - 1 && <span className="min-h-[30px] w-[1.5px] grow bg-linen" />}
            </div>
            <div className="pb-5">
              <p className={"text-[14.5px] font-medium " + (s.done || s.live ? "" : "text-muted")}>
                {s.title}
              </p>
              <p className="mt-0.5 text-[13px] text-muted">{s.sub}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-auto border-t border-linen pt-5">
        {sent ? (
          <p className="rounded-md bg-sand px-4 py-3.5 text-center text-[13.5px] text-graphite">
            Noted — thank you.
          </p>
        ) : open ? (
          <div className="flex flex-col gap-2.5">
            <textarea
              autoFocus
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. we'd love a cooking class one evening"
              className="w-full rounded-sm border border-linen bg-ivory px-3.5 py-3 text-[14px] outline-none focus:border-brass focus:ring-2 focus:ring-brass/30"
            />
            {noteError && <p className="text-[13px] text-terracotta">{noteError}</p>}
            <div className="flex gap-2.5">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button className="grow" disabled={!message.trim() || sending} onClick={sendNote}>
                {sending ? "Sending…" : "Send"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Button variant="secondary" size="lg" className="w-full" onClick={() => setOpen(true)}>
              {failed ? "Tell us what happened" : "Add something we missed"}
            </Button>
            {!failed && <p className="mt-3 text-center text-xs text-muted">Nothing else to do — this page updates itself.</p>}
          </>
        )}
        <p className="mt-2 text-center font-mono text-[11px] text-muted/70">
          job {jobId.slice(0, 8)} · {job?.status ?? "queued"}
        </p>
      </div>
    </main>
  );
}
