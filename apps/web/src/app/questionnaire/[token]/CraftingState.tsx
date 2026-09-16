import type { Booking } from "@lohono/shared-types";

const STAGES = [
  { title: "Your answers, in", sub: "We have what we need to start", done: true },
  { title: "Draft built from our Goa list", sub: "Only places our team has been to", done: true },
  { title: "A concierge is reviewing it", sub: "This is the part that takes the time", done: false, live: true },
  { title: "Your plan and map arrive", sub: "We'll message you the link", done: false },
];

// What the guest sees between submitting and publication. The 24h SLA is a
// promise, so it is the loudest thing on the screen.
export function CraftingState({ booking, jobId }: { booking: Booking; jobId: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-ivory px-6 pb-8 pt-7">
      <p className="text-center font-display text-[17px] uppercase tracking-[0.22em]">Lohono</p>

      <div className="mt-7">
        <p className="eyebrow">{booking.guestName}</p>
        <h1 className="mt-3 font-display text-[32px] leading-[1.14] tracking-tight">
          We&apos;re putting your days together
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-graphite">
          A draft is built. A concierge is reading it now, and you&apos;ll have it{" "}
          <strong className="font-medium">within 24 hours</strong>.
        </p>
      </div>

      <ol className="mt-8">
        {STAGES.map((s, i) => (
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
              </span>
              {i < STAGES.length - 1 && <span className="min-h-[30px] w-[1.5px] grow bg-linen" />}
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

      <div className="mt-auto border-t border-linen pt-4 text-center">
        <p className="text-xs text-muted">Nothing to do now — we&apos;ll come to you.</p>
        <p className="mt-1 font-mono text-[11px] text-muted/70">job {jobId.slice(0, 8)}</p>
      </div>
    </main>
  );
}
