"use client";

import { useState } from "react";
import type { Booking, Destination, Villa } from "@lohono/shared-types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export interface Readiness {
  ready: boolean;
  poiCount: number;
  villaCount: number;
  hasMapAsset: boolean;
}

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long" });

// The very first screen a guest sees after booking. Every piece of copy here
// is read from the real booking/villa/destination — including whether an
// itinerary can be offered at all, which is a live catalog check
// (readiness), never a hardcoded "only Goa" branch in the component.
export function ItineraryOffer({
  booking,
  villa,
  destination,
  readiness,
  onAccept,
}: {
  booking: Booking;
  villa: Villa;
  destination: Destination;
  readiness: Readiness;
  onAccept: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [notifySent, setNotifySent] = useState(false);
  const [notifying, setNotifying] = useState(false);

  async function requestNotify() {
    setNotifying(true);
    try {
      await api(`/questionnaire/${booking.token}/note`, {
        method: "POST",
        body: JSON.stringify({
          message: `Guest would like itinerary planning for ${destination.name} once it's available.`,
        }),
      });
      setNotifySent(true);
    } finally {
      setNotifying(false);
    }
  }

  if (dismissed) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-ivory px-6 text-center">
        <span className="font-display text-[17px] uppercase tracking-[0.22em]">Lohono</span>
        <p className="mt-6 font-display text-[26px] leading-tight">No problem at all.</p>
        <p className="mt-3 max-w-[38ch] text-[14.5px] leading-relaxed text-graphite">
          This link stays live — come back any time before your stay at {villa.name} and we&apos;ll be ready.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-ivory px-6 pb-8 pt-9">
      <p className="text-center font-display text-[17px] uppercase tracking-[0.22em]">Lohono</p>

      <div className="mt-10 flex-1">
        <p className="eyebrow">
          {villa.name} · {destination.name}
        </p>
        <p className="mt-1 text-[13px] text-muted">
          {fmt(booking.checkIn)} – {fmt(booking.checkOut)} · {booking.partySize}{" "}
          {booking.partySize === 1 ? "guest" : "guests"}
        </p>

        {readiness.ready ? (
          <>
            <h1 className="mt-5 max-w-[16ch] font-display text-[34px] leading-[1.1] tracking-tight">
              Would you like us to plan your days here?
            </h1>
            <p className="mt-4 text-[14.5px] leading-relaxed text-graphite">
              Answer a few quick questions about your trip and a concierge will put together a day-by-day
              plan around {villa.name} — with a map, real drive times, and every stop swappable.
            </p>

            <ul className="mt-7 flex flex-col gap-3.5">
              {[
                "About 90 seconds of questions",
                "A concierge reads and fixes it before you see it",
                "Change anything yourself, any time",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-[14px] text-graphite">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-sage">
                    <path d="M3 8.5 L6.5 12 L13 4.5" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <h1 className="mt-5 max-w-[18ch] font-display text-[30px] leading-[1.14] tracking-tight">
              Itinerary planning is coming soon for {destination.name}
            </h1>
            <p className="mt-4 text-[14.5px] leading-relaxed text-graphite">
              Our concierge team is still building the curated list of places and the map for this
              destination. It&apos;s live for Goa today — {destination.name} is next.
            </p>
          </>
        )}
      </div>

      <div className="mt-8">
        {readiness.ready ? (
          <div className="flex gap-3">
            <Button variant="secondary" size="lg" onClick={() => setDismissed(true)}>
              Not now
            </Button>
            <Button size="lg" className="grow" onClick={onAccept}>
              Yes, plan my trip
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8 H13 M9 4 L13 8 L9 12" />
              </svg>
            </Button>
          </div>
        ) : notifySent ? (
          <p className="rounded-md bg-sand px-4 py-3.5 text-center text-[13.5px] text-graphite">
            Noted — we&apos;ll let you know the moment it&apos;s ready.
          </p>
        ) : (
          <Button size="lg" className="w-full" disabled={notifying} onClick={requestNotify}>
            {notifying ? "Sending…" : "Notify me when it's ready"}
          </Button>
        )}
      </div>
    </main>
  );
}
